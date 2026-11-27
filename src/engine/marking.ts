/**
 * Marking: compares a student's typed answer with the question's answer
 * mathematically, and matches predictable wrong answers to misconceptions.
 */

import { equals, isSimplest, parseAnswer, show, showDecimal, showMixed, simplify, frac } from "./fraction";
import { parseExpression, polyEquals, untidyReason, UNTIDY_FEEDBACK } from "./algebra";
import type { MarkResult, Misconception, Question } from "./types";

/** The correct answer as text, for showing after an attempt. */
export function answerText(q: Question): string {
  const a = q.answer;
  if (a.kind === "fraction") return a.form === "mixed" ? showMixed(a.value) : a.form === "decimal" ? showDecimal(a.value) : show(a.value);
  if (a.kind === "integer") return String(a.value);
  if (a.kind === "expression") return a.value;
  return a.options[a.correctIndex] ?? "";
}

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
