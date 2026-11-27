/**
 * Marking: compares a student's typed answer with the question's answer
 * mathematically, and matches predictable wrong answers to misconceptions.
 */

import { equals, gcd, isSimplest, parseAnswer, show, simplify, frac, type Fraction } from "./fraction";
import type { MarkResult, Misconception, Question } from "./types";

export function markAnswer(
  q: Question,
  raw: string,
  misconceptions: Record<string, Misconception>,
): MarkResult {
  const a = q.answer;

  if (a.kind === "choice") {
    const idx = Number(raw);
    if (!Number.isInteger(idx) || idx < 0 || idx >= a.options.length) {
      return { outcome: "unreadable", correct: false, feedback: "Choose one of the options." };
    }
    if (idx === a.correctIndex) return { outcome: "correct", correct: true, feedback: "Correct." };
    const mc = q.wrongAnswers.find((w) => w.value === idx)?.misconception;
    return wrong(mc, misconceptions);
  }

  if (a.kind === "ratio") return markRatio(q, a.value, a.requireSimplest, raw, misconceptions);

  const parsed = parseAnswer(raw);
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

  if (a.kind === "integer") {
    if (equals(v, frac(a.value))) return { outcome: "correct", correct: true, feedback: "Correct." };
    return wrong(matchWrong(q, v), misconceptions);
  }

  // fraction answer
  if (equals(v, a.value)) {
    // Decimals and integers are already exact; only typed fractions can be unsimplified.
    if (a.requireSimplest && (parsed.form === "fraction" || parsed.form === "mixed") && !isSimplest(v)) {
      return {
        outcome: "not-simplified",
        correct: false,
        feedback: `That's the right amount, but it can be simplified. ${show(v)} = ${show(simplify(v))}.`,
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

/** The correct answer as text, for showing after a question is answered. */
export function answerText(q: Question): string {
  if (q.answerText) return q.answerText;
  const a = q.answer;
  if (a.kind === "fraction") return show(a.value);
  if (a.kind === "integer") return String(a.value);
  if (a.kind === "ratio") return a.value.join(":");
  return a.options[a.correctIndex] ?? "";
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
