/**
 * Answers "in terms of π", like 25π. Reads "25π", "25 pi", "25 × π", "π × 25",
 * "12.5π", "25/2 π" and "π" (meaning 1π), with or without units.
 *
 * A number with no π that matches the answer once π is worked out (78.5 for
 * 25π) is the right size but the wrong form, so it gets a nudge, not a cross.
 * So does the right number with the π left off.
 */

import { equals, frac, parseAnswer, type Fraction } from "./fraction";
import type { MarkResult, Misconception, Question } from "./types";

/** "25π", "π", "12.5π". */
export function showPi(coeff: number): string {
  if (coeff === 1) return "π";
  return `${String(coeff).replace("-", "−")}π`;
}

const UNITS = /\s*(square\s+|cubic\s+)?(mm|cm|km|m|units?)\s*(²|³|\^?[23])?\.?$/i;

/** The coefficient of π, or null if there's no π. `undefined` means unreadable. */
export function parsePi(raw: string): { pi: true; coeff: Fraction } | { pi: false; value: Fraction } | undefined {
  const s = raw
    .trim()
    .replace(UNITS, "")
    .replace(/pi/gi, "π")
    .replace(/[×*·]/g, "")
    .replace(/\s+/g, "");
  if (!s.includes("π")) {
    const p = parseAnswer(s);
    return p.ok ? { pi: false, value: p.value } : undefined;
  }
  if ((s.match(/π/g) ?? []).length !== 1) return undefined;
  // "25π", "π25", "25/2π", "π/2" (one half of π).
  const [before, after] = s.split("π");
  let coeff: Fraction | undefined;
  if (after === "") coeff = before === "" ? frac(1) : num(before);
  else if (before === "" && /^\/\d+$/.test(after)) coeff = frac(1, Number(after.slice(1)));
  else if (before === "") coeff = num(after);
  else if (/^\/\d+$/.test(after)) {
    const n = num(before);
    coeff = n ? frac(n.n, n.d * Number(after.slice(1))) : undefined;
  }
  return coeff ? { pi: true, coeff } : undefined;
}

function num(t: string): Fraction | undefined {
  const p = parseAnswer(t);
  return p.ok ? p.value : undefined;
}

const toFrac = (x: number): Fraction => (Number.isInteger(x) ? frac(x) : frac(Math.round(x * 1000), 1000));

export function markPi(q: Question, coeff: number, raw: string, misconceptions: Record<string, Misconception>): MarkResult {
  const p = parsePi(raw);
  const want = toFrac(coeff);
  const text = showPi(coeff);
  if (!p) return { outcome: "unreadable", correct: false, feedback: "I couldn't read that. Type the number then π, like 25π. You can type pi for π." };
  if (p.pi) {
    if (equals(p.coeff, want)) return { outcome: "correct", correct: true, feedback: "Correct." };
    const mcId = q.wrongAnswers.find((w) => typeof w.value === "number" && equals(toFrac(w.value), p.coeff))?.misconception;
    const mc = mcId ? misconceptions[mcId] : undefined;
    return { outcome: "incorrect", correct: false, misconception: mc?.id, feedback: mc ? mc.explanation : "Not quite. Look at the hint, or check each step." };
  }
  const x = p.value.n / p.value.d;
  if (equals(p.value, want)) {
    return { outcome: "not-simplified", correct: false, feedback: `The number is right, but put π after it: the answer is ${text}.` };
  }
  if (Math.abs(x - coeff * Math.PI) <= Math.max(0.051, Math.abs(coeff) * 0.0016 + 0.05)) {
    return { outcome: "not-simplified", correct: false, feedback: `That's the right size, but the question wants it in terms of π. Don't work π out: leave it in, like ${text}.` };
  }
  return { outcome: "incorrect", correct: false, feedback: "Not quite. Leave π in your answer, like 25π. Look at the hint, or check each step." };
}
