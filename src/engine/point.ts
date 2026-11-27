/**
 * Coordinates: reads a typed point like "(3, −2)" and marks it.
 *
 * Accepted: "(3, -2)", "3,-2", "(3 , −2)", "3 -2", "x = 3, y = −2", "(1.5, 4)",
 * "(1/2, 3)". Brackets are welcome but not needed. Order matters: x comes first.
 */

import { equals, frac, parseAnswer, type Fraction } from "./fraction";
import type { MarkResult, Misconception, Question } from "./types";

/** A number as shown in lessons: −2 with the true minus sign. */
export const signed = (n: number) => (n < 0 ? `−${-n}` : String(n));

/** "(3, −2)". */
export function showPoint([x, y]: [number, number]): string {
  return `(${signed(x)}, ${signed(y)})`;
}

export function parsePoint(raw: string): [Fraction, Fraction] | null {
  let s = raw.trim().replace(/[−–—]/g, "-");
  // "x = 3, y = -2"
  const named = /^x\s*=\s*([^,;]+)[,;]?\s*y\s*=\s*(.+)$/i.exec(s);
  if (named) s = `${named[1]},${named[2]}`;
  s = s.replace(/^[([{]\s*/, "").replace(/\s*[)\]}]$/, "").trim();
  let parts = s.split(/\s*[,;]\s*/);
  if (parts.length !== 2) parts = s.split(/\s+/);
  if (parts.length !== 2) return null;
  const a = parseAnswer(parts[0]);
  const b = parseAnswer(parts[1]);
  if (!a.ok || !b.ok) return null;
  return [a.value, b.value];
}

const same = (p: [Fraction, Fraction], q: number[]) => q.length === 2 && equals(p[0], frac(q[0])) && equals(p[1], frac(q[1]));

export function markPoint(
  q: Question,
  value: [number, number],
  raw: string,
  misconceptions: Record<string, Misconception>,
  vector = false,
): MarkResult {
  const p = parsePoint(raw);
  if (!p) {
    return {
      outcome: "unreadable",
      correct: false,
      feedback: vector
        ? "Type the two numbers of the vector with a comma between, top number first, like (3, −2)."
        : "Type the coordinates as two numbers with a comma between, x first, like (3, −2).",
    };
  }
  if (same(p, value)) return { outcome: "correct", correct: true, feedback: "Correct." };
  const mcId = q.wrongAnswers.find((w) => Array.isArray(w.value) && same(p, w.value))?.misconception;
  const mc = mcId ? misconceptions[mcId] : undefined;
  if (mc) return { outcome: "incorrect", correct: false, misconception: mc.id, feedback: mc.explanation };
  const xRight = equals(p[0], frac(value[0]));
  const yRight = equals(p[1], frac(value[1]));
  if (vector) {
    return {
      outcome: "incorrect",
      correct: false,
      feedback: xRight
        ? "Your top number (left or right) is right. Check the bottom number: how far up or down?"
        : yRight
          ? "Your bottom number (up or down) is right. Check the top number: how far left or right?"
          : "Not quite. The top number is the move left or right, the bottom number the move up or down.",
    };
  }
  return {
    outcome: "incorrect",
    correct: false,
    feedback: xRight
      ? "Your x-coordinate (the first number) is right. Check the y-coordinate: how far up or down?"
      : yRight
        ? "Your y-coordinate (the second number) is right. Check the x-coordinate: how far left or right?"
        : "Not quite. Go along the x-axis first, then up or down the y-axis.",
  };
}
