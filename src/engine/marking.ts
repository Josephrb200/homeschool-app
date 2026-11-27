/**
 * Marking: compares a student's typed answer with the question's answer
 * mathematically, and matches predictable wrong answers to misconceptions.
 */

import { equals, gcd, isSimplest, parseAnswer, show, showDecimal, showMixed, simplify, frac, type Fraction } from "./fraction";
import { parseExpression, polyEquals, untidyReason, UNTIDY_FEEDBACK } from "./algebra";
import type { MarkResult, Misconception, Question } from "./types";

/** The correct answer as text, for showing after an attempt. */
export function answerText(q: Question): string {
  if (q.answerText) return q.answerText;
  const a = q.answer;
  if (a.kind === "fraction") return a.form === "mixed" ? showMixed(a.value) : a.form === "decimal" ? showDecimal(a.value) : show(a.value);
  if (a.kind === "integer") return String(a.value);
  if (a.kind === "expression") return a.value;
  if (a.kind === "decimal") return roundTo(a.exact, a.dp);
  if (a.kind === "ratio") return a.value.join(":");
  return a.options[a.correctIndex] ?? "";
}

export function markAnswer(
  q: Question,
  raw: string,
  misconceptions: Record<string, Misconception>,
): MarkResult {
  const a = q.answer;

  if (a.kind === "choice") {
    // The app sends the option's text (so the record is readable); an index also works.
    const byText = a.options.findIndex((o) => o.toLowerCase() === raw.trim().toLowerCase());
    const idx = byText >= 0 ? byText : Number(raw);
    if (!Number.isInteger(idx) || idx < 0 || idx >= a.options.length) {
      return { outcome: "unreadable", correct: false, feedback: "Choose one of the options." };
    }
    if (idx === a.correctIndex) return { outcome: "correct", correct: true, feedback: "Correct." };
    const mc = q.wrongAnswers.find((w) => w.value === idx)?.misconception;
    return wrong(mc, misconceptions);
  }

  if (a.kind === "expression") {
    const got = parseExpression(raw);
    if (!got.ok) {
      return {
        outcome: "unreadable",
        correct: false,
        feedback: "I couldn't read that. Type an expression like 3x + 2. For squared, type x^2 or x².",
      };
    }
    const want = parseExpression(a.value);
    if (!want.ok) throw new Error(`Bad expression answer: ${a.value}`);
    if (polyEquals(got.poly, want.poly)) {
      const why = untidyReason(got.ast, a.form);
      if (why) return { outcome: "not-simplified", correct: false, feedback: `${UNTIDY_FEEDBACK[why]} The answer is ${a.value}.` };
      return { outcome: "correct", correct: true, feedback: "Correct." };
    }
    const mc = q.wrongExpressions?.find((w) => {
      const p = parseExpression(w.value);
      return p.ok && polyEquals(p.poly, got.poly);
    })?.misconception;
    return wrong(mc, misconceptions);
  }

  if (a.kind === "ratio") return markRatio(q, a.value, a.requireSimplest, raw, misconceptions);

  // "x = 4" is a fine way to give a number answer to an equation.
  const parsed = parseAnswer(a.kind === "integer" ? raw.replace(/^\s*[a-zA-Z]\s*=\s*/, "") : raw);
  if (!parsed.ok) {
    return {
      outcome: "unreadable",
      correct: false,
      feedback:
        parsed.reason === "zero-denominator"
          ? "A fraction can't have 0 on the bottom. Check your answer."
          : "I couldn't read that. Type a whole number like 12, a fraction like 3/4, or a mixed number like 1 1/2.",
    };
  }
  const v = parsed.value;

  if (a.kind === "decimal") {
    const x = v.n / v.d;
    const tol = decimalTolerance(a.exact, a.dp);
    if (Math.abs(x - a.exact) <= tol) {
      const typedDp = /\.(\d+)/.exec(raw)?.[1].length ?? 0;
      const rounded = roundTo(a.exact, a.dp);
      return {
        outcome: "correct",
        correct: true,
        feedback:
          typedDp > a.dp
            ? `Correct. The question asks for ${a.dp} decimal place${a.dp === 1 ? "" : "s"}, so write it as ${rounded}.`
            : "Correct.",
      };
    }
    for (const w of q.wrongAnswers) {
      if (Array.isArray(w.value)) continue;
      const t = typeof w.value === "number" ? w.value : w.value.n / w.value.d;
      if (Math.abs(x - t) <= decimalTolerance(t, a.dp)) return wrong(w.misconception, misconceptions);
    }
    return wrong(undefined, misconceptions);
  }

  if (a.kind === "integer") {
    if (equals(v, frac(a.value))) return { outcome: "correct", correct: true, feedback: "Correct." };
    return wrong(matchWrong(q, v), misconceptions);
  }

  // fraction answer
  if (equals(v, a.value)) {
    if (a.form === "mixed" && a.value.d !== 1 && Math.abs(a.value.n) > a.value.d && parsed.form !== "mixed") {
      return {
        outcome: "not-simplified",
        correct: false,
        feedback: `That's the right amount. Now write it as a mixed number: a whole number and a fraction, like ${showMixed(a.value)}.`,
      };
    }
    if (a.form === "improper" && parsed.form !== "fraction") {
      return {
        outcome: "not-simplified",
        correct: false,
        feedback: `That's the right amount. Now write it as an improper (top-heavy) fraction, like ${show(a.value)}.`,
      };
    }
    // Decimals and integers are already exact; only typed fractions can be unsimplified.
    if (a.requireSimplest && (parsed.form === "fraction" || parsed.form === "mixed") && !isSimplest(v)) {
      return {
        outcome: "not-simplified",
        correct: false,
        feedback: parsed.form === "mixed"
          ? `That's the right amount, but the fraction part can be simplified. ${raw.trim()} = ${showMixed(v)}.`
          : `That's the right amount, but it can be simplified. ${show(v)} = ${show(simplify(v))}.`,
      };
    }
    return { outcome: "correct", correct: true, feedback: "Correct." };
  }
  return wrong(matchWrong(q, v), misconceptions);
}

function matchWrong(q: Question, v: ReturnType<typeof frac>) {
  for (const w of q.wrongAnswers) {
    if (Array.isArray(w.value)) continue;
    const target = typeof w.value === "number" ? frac(w.value) : w.value;
    if (equals(v, target)) return w.misconception;
  }
  return undefined;
}

function wrong(mcId: string | undefined, misconceptions: Record<string, Misconception>): MarkResult {
  const mc = mcId ? misconceptions[mcId] : undefined;
  return {
    outcome: "incorrect",
    correct: false,
    misconception: mc?.id,
    feedback: mc ? mc.explanation : "Not quite. Look at the hint, or check each step.",
  };
}

/** Round to dp decimal places and show it, e.g. roundTo(31.4159, 1) = "31.4". */
export function roundTo(x: number, dp: number): string {
  return (Math.round(x * 10 ** dp) / 10 ** dp).toFixed(dp);
}

/**
 * How far from the exact value a rounded answer may be: half a unit in the last
 * place (rounding), plus 0.06% for using 3.14 instead of π.
 */
export function decimalTolerance(exact: number, dp: number): number {
  return 0.5 * 10 ** -dp + Math.abs(exact) * 0.0006 + 1e-9;
}

/**
 * Read a typed ratio: "3:2", "3 : 2", "3 to 2", "2:3:5". Each part may be a
 * whole number, decimal or fraction, and units are ignored ("50 cm : 2 m" is
 * not unit-converted here; questions ask for numbers only).
 */
export function parseRatio(raw: string): Fraction[] | null {
  const parts = raw
    .trim()
    .replace(/\s+to\s+/gi, ":")
    .replace(/[;∶]/g, ":")
    .split(":");
  if (parts.length < 2) return null;
  const out: Fraction[] = [];
  for (const p of parts) {
    const r = parseAnswer(p);
    if (!r.ok || r.value.n <= 0) return null;
    out.push(r.value);
  }
  return out;
}

/** True when two ratios have the same number of parts and are equivalent (a:b = ka:kb). */
export function sameRatio(x: Fraction[], y: Fraction[]): boolean {
  if (x.length !== y.length) return false;
  // x_i / y_i must be the same for every part.
  const k = (i: number) => frac(x[i].n * y[i].d, x[i].d * y[i].n);
  const k0 = k(0);
  return x.every((_, i) => equals(k(i), k0));
}

function markRatio(
  q: Question,
  value: number[],
  requireSimplest: boolean,
  raw: string,
  misconceptions: Record<string, Misconception>,
): MarkResult {
  const typed = parseRatio(raw);
  if (!typed) {
    return {
      outcome: "unreadable",
      correct: false,
      feedback: `Type your answer as a ratio with a colon between the numbers, like ${value.length === 3 ? "2:3:5" : "3:2"}.`,
    };
  }
  const target = value.map((n) => frac(n));
  if (sameRatio(typed, target)) {
    const whole = typed.every((f) => f.d === 1);
    const simplest = whole && typed.reduce((g, f) => gcd(g, f.n), 0) === 1;
    if (requireSimplest && !simplest) {
      const k = typed.reduce((g, f) => gcd(g, f.n), 0);
      return {
        outcome: "not-simplified",
        correct: false,
        feedback: whole
          ? `That's an equivalent ratio, but it can be simplified. Every part divides by ${k}: ${value.join(":")}.`
          : `That's an equivalent ratio, but the simplest form uses whole numbers: ${value.join(":")}.`,
      };
    }
    return { outcome: "correct", correct: true, feedback: "Correct." };
  }
  const mc = q.wrongAnswers.find((w) => Array.isArray(w.value) && sameRatio(typed, w.value.map((n) => frac(n))))?.misconception;
  return wrong(mc, misconceptions);
}
