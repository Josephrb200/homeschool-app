/**
 * Standard form (A × 10ⁿ with 1 ≤ A < 10): reading what a student types,
 * and marking it against the right answer.
 *
 * Students can type "3.4 × 10^4", "3.4 x 10^4", "3.4*10^-4", "3.4 × 10⁴" or
 * "3.4 × 10^(−4)". The value is compared exactly, so the right value written
 * another way (34000, or 34 × 10³) is "nearly there" with a nudge, not wrong.
 */

import { equals, frac, parseAnswer, showDecimal, simplify, type Fraction } from "./fraction";
import type { MarkResult, Misconception, Question } from "./types";

const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";

/** An integer as superscript characters: 4 → "⁴", -3 → "⁻³". */
export function sup(n: number): string {
  return (n < 0 ? "⁻" : "") + String(Math.abs(n)).split("").map((d) => SUP[Number(d)]).join("");
}

/** mantissa × 10^power as an exact fraction. */
export function sfValue(mantissa: Fraction, power: number): Fraction {
  return power >= 0 ? simplify(frac(mantissa.n * 10 ** power, mantissa.d)) : simplify(frac(mantissa.n, mantissa.d * 10 ** -power));
}

/** "3.4 × 10⁴" */
export function showStandardForm(mantissa: Fraction, power: number): string {
  return `${showDecimal(mantissa)} × 10${sup(power)}`;
}

export type ParsedSF =
  | { ok: true; value: Fraction; form: "standard" | "not-standard" | "ordinary" }
  | { ok: false };

function inRange(m: Fraction) {
  const x = Math.abs(m.n / m.d);
  return x >= 1 && x < 10;
}

export function parseStandardForm(raw: string): ParsedSF {
  const s = raw
    .trim()
    .replace(/[−–]/g, "-")
    // Superscript powers, like 10⁴ or 10⁻⁴, become 10^4 and 10^-4.
    .replace(/(⁻?)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (_, minus: string, digits: string) => `^${minus ? "-" : ""}${digits.split("").map((c) => SUP.indexOf(c)).join("")}`)
    .replace(/\^+/g, "^")
    .replace(/,/g, "")
    .replace(/\s+/g, "")
    .replace(/[×xX*]/g, "x");

  const m = /^(-?\d+(?:\.\d+)?|-?\.\d+)?x?10\^\(?(-?\d+)\)?$/.exec(s);
  if (m) {
    // A bare "10^4" means 1 × 10^4; "x10^4" with nothing in front is not readable.
    if (m[1] === undefined && s.startsWith("x")) return { ok: false };
    const p = m[1] === undefined ? { ok: true as const, value: frac(1) } : parseAnswer(m[1]);
    if (!p.ok) return { ok: false };
    const value = sfValue(p.value, Number(m[2]));
    return { ok: true, value, form: inRange(p.value) ? "standard" : "not-standard" };
  }
  const plain = parseAnswer(raw);
  if (plain.ok) return { ok: true, value: plain.value, form: "ordinary" };
  return { ok: false };
}

export function markStandardForm(q: Question, mantissa: Fraction, power: number, raw: string, misconceptions: Record<string, Misconception>): MarkResult {
  const want = sfValue(mantissa, power);
  const shown = showStandardForm(mantissa, power);
  const got = parseStandardForm(raw);
  if (!got.ok) {
    return { outcome: "unreadable", correct: false, feedback: "I couldn't read that. Type standard form like 3.4 x 10^4 (x for times, ^ before the power)." };
  }
  if (equals(got.value, want)) {
    if (got.form === "standard") return { outcome: "correct", correct: true, feedback: "Correct." };
    return {
      outcome: "not-simplified",
      correct: false,
      feedback:
        got.form === "ordinary"
          ? `That's the right value. Now write it in standard form: a number from 1 up to (not including) 10, times a power of 10. It is ${shown}.`
          : `That's the right value, but in standard form the first number must be at least 1 and less than 10. It is ${shown}.`,
    };
  }
  for (const w of q.wrongAnswers) {
    if (Array.isArray(w.value)) continue;
    const t = typeof w.value === "number" ? frac(w.value) : w.value;
    if (equals(got.value, t)) {
      const mc = misconceptions[w.misconception];
      return { outcome: "incorrect", correct: false, misconception: mc?.id, feedback: mc ? mc.explanation : "Not quite." };
    }
  }
  return { outcome: "incorrect", correct: false, feedback: "Not quite. Look at the hint, or check each step." };
}
