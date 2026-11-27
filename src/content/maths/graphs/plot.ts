/**
 * Shared helpers for graph questions and demos: writing equations the way the
 * lessons do, building to-scale grids, and question-building shortcuts.
 *
 * Writing conventions match the rest of the app: negatives use the true minus
 * sign with no space (−3), subtraction has spaces (2x − 3), and a negative
 * after an operator sits in brackets: 2 × (−3).
 */

import type { Rng } from "@/engine/random";
import type { GraphSpec, Question } from "@/engine/types";
import { signed } from "@/engine/point";

export type Tier = 1 | 2;
export type Q = Omit<Question, "id" | "skillId">;
export type Gen = (r: Rng, tier: Tier) => Q;
export type Wrong = { value: number | number[]; misconception: string };

export { signed as num };
export { showPoint } from "@/engine/point";

/** A number after an operation: negatives in brackets, like (−3). */
export const br = (n: number) => (n < 0 ? `(${signed(n)})` : String(n));

/** "2x", "x", "−x", "−3x" for the x-term with coefficient m. */
export function xTerm(m: number, v = "x"): string {
  if (m === 1) return v;
  if (m === -1) return `−${v}`;
  return `${signed(m)}${v}`;
}

/** Right-hand side of y = mx + c: "2x + 1", "−x − 4", "3x", "5". */
export function lineRhs(m: number, c: number, v = "x"): string {
  if (m === 0) return signed(c);
  const t = xTerm(m, v);
  if (c === 0) return t;
  return c > 0 ? `${t} + ${c}` : `${t} − ${-c}`;
}

/** "y = 2x + 1". */
export const lineEq = (m: number, c: number) => `y = ${lineRhs(m, c)}`;

/** "c + mx" order, like y = 5 − 2x. */
export function lineRhsConstFirst(m: number, c: number): string {
  const t = m === 1 ? "x" : m === -1 ? "x" : `${Math.abs(m)}x`;
  return `${c} ${m > 0 ? "+" : "−"} ${t}`;
}

/** A straight line across the grid's x-range. */
export const linePoints = (m: number, c: number, xmin: number, xmax: number): [number, number][] => [
  [xmin, m * xmin + c],
  [xmax, m * xmax + c],
];

/** Points along a curve, for drawing. Skips points where f isn't finite. */
export function sample(f: (x: number) => number, a: number, b: number, step = 0.05): [number, number][] {
  const out: [number, number][] = [];
  const n = Math.round((b - a) / step);
  for (let i = 0; i <= n; i++) {
    const x = a + i * step;
    const y = f(x);
    if (Number.isFinite(y)) out.push([Math.round(x * 1000) / 1000, Math.round(y * 1000) / 1000]);
  }
  return out;
}

/** A plain maths grid with unit squares. Numbers every 2 when the range is big. */
export function grid(xmin: number, xmax: number, ymin: number, ymax: number): Pick<GraphSpec, "x" | "y"> {
  return {
    x: { min: xmin, max: xmax, step: 1, ...(xmax - xmin > 14 ? { labelStep: 2 } : {}) },
    y: { min: ymin, max: ymax, step: 1, ...(ymax - ymin > 14 ? { labelStep: 2 } : {}) },
  };
}

/** Keep wrong answers that differ from the right one and from each other (first listed wins). */
export function wrongs(right: number | number[], list: Wrong[]): Wrong[] {
  const key = (v: number | number[]) => (Array.isArray(v) ? v.map((n) => Math.round(n * 1e6)).join(",") : String(Math.round(v * 1e6)));
  const seen = new Set([key(right)]);
  const out: Wrong[] = [];
  for (const w of list) {
    if (Array.isArray(w.value) ? w.value.some((n) => !Number.isFinite(n)) : !Number.isFinite(w.value)) continue;
    const k = key(w.value);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(w);
  }
  return out;
}

export const HELP_INT = "Type a whole number, like 7 or −3.";
export const HELP_POINT = "Type the coordinates with a comma between, x first, like (3, −2).";
export const HELP_PICK = "Click the point on the grid (or use the arrow keys and press Enter), or type it like (3, −2).";
export const HELP_EQ = "Type the equation, like y = 3x − 2.";

type Base = Omit<Q, "answer" | "wrongAnswers" | "answerHelp"> & { wrong?: Wrong[]; answerHelp?: string };

export function intQ(value: number, q: Base): Q {
  const { wrong = [], answerHelp, ...rest } = q;
  return {
    ...rest,
    answer: { kind: "integer", value },
    wrongAnswers: wrongs(value, wrong),
    answerHelp: answerHelp ?? HELP_INT,
    ...(value < 0 ? { answerText: signed(value) } : {}),
  };
}

export function pointQ(value: [number, number], q: Base): Q {
  const { wrong = [], answerHelp, ...rest } = q;
  return { ...rest, answer: { kind: "point", value }, wrongAnswers: wrongs(value, wrong), answerHelp: answerHelp ?? HELP_POINT };
}

/**
 * A multiple-choice question. `options[0]` is the right answer; the order shown
 * is shuffled. `mc` maps a wrong option's text to its misconception.
 */
export function choiceQ(r: Rng, options: string[], q: Omit<Q, "answer" | "wrongAnswers" | "answerHelp"> & { mc?: Record<string, string>; keepOrder?: boolean }): Q {
  const { mc = {}, keepOrder, ...rest } = q;
  const unique = [...new Set(options)];
  const shown = keepOrder ? unique : shuffle(r, unique);
  return {
    ...rest,
    answer: { kind: "choice", options: shown, correctIndex: shown.indexOf(unique[0]) },
    wrongAnswers: shown.flatMap((o, i) => (mc[o] && o !== unique[0] ? [{ value: i, misconception: mc[o] }] : [])),
    answerHelp: "Choose one answer.",
  };
}

export function shuffle<T>(r: Rng, xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = r.int(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const nonZero = (r: Rng, lo: number, hi: number) => {
  let n = 0;
  while (n === 0) n = r.int(lo, hi);
  return n;
};
