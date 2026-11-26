/**
 * Marking: compares a student's typed answer with the question's answer
 * mathematically, and matches predictable wrong answers to misconceptions.
 */

import { equals, isSimplest, parseAnswer, show, simplify, frac } from "./fraction";
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
