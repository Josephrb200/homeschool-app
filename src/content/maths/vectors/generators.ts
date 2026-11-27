/**
 * Question generators for column vectors. Grid pictures are exact: the arrow
 * drawn really does go the distance the answer says (a test checks this).
 *
 * STATUS: Draft. Needs review by a qualified maths teacher.
 */

import type { Rng } from "@/engine/random";
import type { PlaneSpec, Question } from "@/engine/types";
import { coord, n, vec, vectorWords, type P } from "../transformations/geometry";

export type Tier = 1 | 2;
type Gen = (r: Rng, tier: Tier) => Omit<Question, "id" | "skillId">;
type Wrong = { value: P; misconception: string };

export const VECTOR_HELP = "Type the top number, a comma, then the bottom number, like 3, −2. Brackets are fine.";

/** A whole number from lo to hi that isn't 0. */
const nz = (r: Rng, lo: number, hi: number) => {
  for (;;) {
    const v = r.int(lo, hi);
    if (v !== 0) return v;
  }
};

/** A vector question: the answer is a column vector. Predicted wrong answers that match it, or each other, are dropped. */
function vectorQ(prompt: string, plane: PlaneSpec | undefined, answer: P, wrong: Wrong[], hints: string[], solution: string[]): Omit<Question, "id" | "skillId"> {
  const key = (p: P) => `${p[0]},${p[1]}`;
  const seen = new Set([key(answer)]);
  const kept = wrong.filter((w) => {
    if (seen.has(key(w.value))) return false;
    seen.add(key(w.value));
    return true;
  });
  return {
    prompt,
    visual: plane ? { kind: "plane", plane } : undefined,
    answer: { kind: "point", value: answer, vector: true },
    wrongAnswers: kept.map((w) => ({ value: [...w.value], misconception: w.misconception })),
    answerHelp: VECTOR_HELP,
    hints,
    solution,
    answerText: vec(answer),
  };
}

/** Bracket a negative number in working: 3 − (−2). */
const b = (x: number) => (x < 0 ? `(${n(x)})` : n(x));
const add = (u: P, v: P): P => [u[0] + v[0], u[1] + v[1]];
const sub = (u: P, v: P): P => [u[0] - v[0], u[1] - v[1]];
const times = (k: number, u: P): P => [k * u[0], k * u[1]];

const W = 10;
const H = 8;

/** An arrow for vector v on a 10 × 8 grid, starting somewhere it fits. */
export function arrowPlane(r: Rng, v: P, label: string): PlaneSpec {
  const x0 = r.int(Math.max(1, 1 - v[0]), Math.min(W - 1, W - 1 - v[0]));
  const y0 = r.int(Math.max(1, 1 - v[1]), Math.min(H - 1, H - 1 - v[1]));
  const to: P = [x0 + v[0], y0 + v[1]];
  return {
    x: [0, W],
    y: [0, H],
    grid: true,
    arrows: [{ from: [x0, y0], to }],
    points: [{ at: [x0, y0] }],
    lengths: [{ a: [x0, y0], b: to, text: label }],
    description: `A squared grid with an arrow labelled ${label}. It starts at a dot and goes ${vectorWords(v)}.`,
  };
}

// ---------------------------------------------------------------- reading a vector from a grid

const readVector: Gen = (r, tier) => {
  const v: P = tier === 1 ? [nz(r, -5, 5), nz(r, -4, 4)] : r.next() < 0.2 ? (r.next() < 0.5 ? [0, nz(r, -5, 5)] : [nz(r, -6, 6), 0]) : [nz(r, -6, 6), nz(r, -5, 5)];
  const name = r.pick(["a", "b", "p", "q"]);
  return vectorQ(
    `Write vector ${name} as a column vector.`,
    arrowPlane(r, v, name),
    v,
    [
      { value: [v[1], v[0]], misconception: "vec-swapped" },
      { value: [-v[0], v[1]], misconception: "vec-sign" },
      { value: [v[0], -v[1]], misconception: "vec-sign" },
      { value: [-v[0], -v[1]], misconception: "vec-reversed" },
    ],
    [`Start at the dot and follow the arrow. Count the squares across first, then up or down.`, `Right and up are positive. Left and down are negative.`],
    [`From the dot, the arrow goes ${vectorWords(v)}.`, `Across: ${n(v[0])}. Up/down: ${n(v[1])}.`, `So ${name} = ${vec(v)}.`],
  );
};

// ---------------------------------------------------------------- vector between two points

const betweenPoints: Gen = (r) => {
  const A: P = [r.int(-5, 5), r.int(-5, 5)];
  const v: P = [nz(r, -7, 7), nz(r, -7, 7)];
  const B = add(A, v);
  return vectorQ(
    `A is the point ${coord(A)} and B is the point ${coord(B)}. Write the vector AB as a column vector.`,
    undefined,
    v,
    [
      { value: [-v[0], -v[1]], misconception: "vec-reversed" },
      { value: add(A, B), misconception: "vec-add-subtract" },
      { value: [v[1], v[0]], misconception: "vec-swapped" },
    ],
    [`AB is the journey from A to B.`, `End minus start: B − A. Do the x-coordinates, then the y-coordinates.`],
    [`AB = B − A.`, `Top: ${n(B[0])} − ${b(A[0])} = ${n(v[0])}`, `Bottom: ${n(B[1])} − ${b(A[1])} = ${n(v[1])}`, `AB = ${vec(v)}`],
  );
};

// ---------------------------------------------------------------- adding and subtracting

function pair(r: Rng, tier: Tier): [P, P] {
  const lo = tier === 1 ? 1 : -6;
  const hi = tier === 1 ? 7 : 7;
  // Tier 1: one vector has a negative number, so the signs matter but stay simple.
  const u: P = [r.int(lo, hi), nz(r, tier === 1 ? -5 : -6, hi)];
  const v: P = [nz(r, tier === 1 ? -4 : -6, hi), r.int(lo, hi)];
  return [u, v];
}

const addVectors: Gen = (r, tier) => {
  const [a, bv] = pair(r, tier);
  const ans = add(a, bv);
  return vectorQ(
    `a = ${vec(a)} and b = ${vec(bv)}. Work out a + b.`,
    undefined,
    ans,
    [
      { value: sub(a, bv), misconception: "vec-add-subtract" },
      { value: [a[0] + bv[1], a[1] + bv[0]], misconception: "vec-swapped" },
      { value: [a[0] + Math.abs(bv[0]), a[1] + Math.abs(bv[1])], misconception: "vec-negative" },
    ],
    [`Add the top numbers. Then add the bottom numbers.`, `Watch the negatives: adding a negative number takes away.`],
    [`Top: ${n(a[0])} + ${b(bv[0])} = ${n(ans[0])}`, `Bottom: ${n(a[1])} + ${b(bv[1])} = ${n(ans[1])}`, `a + b = ${vec(ans)}`],
  );
};

const subtractVectors: Gen = (r, tier) => {
  const [a, bv] = pair(r, tier);
  const ans = sub(a, bv);
  return vectorQ(
    `a = ${vec(a)} and b = ${vec(bv)}. Work out a − b.`,
    undefined,
    ans,
    [
      { value: add(a, bv), misconception: "vec-add-subtract" },
      { value: sub(bv, a), misconception: "vec-order" },
      { value: [a[0] - Math.abs(bv[0]), a[1] - Math.abs(bv[1])], misconception: "vec-negative" },
    ],
    [`Take away the top numbers. Then take away the bottom numbers.`, `Taking away a negative is the same as adding: 3 − (−2) = 5.`],
    [`Top: ${n(a[0])} − ${b(bv[0])} = ${n(ans[0])}`, `Bottom: ${n(a[1])} − ${b(bv[1])} = ${n(ans[1])}`, `a − b = ${vec(ans)}`],
  );
};

// ---------------------------------------------------------------- multiplying by a number

const scaleVector: Gen = (r, tier) => {
  const a: P = [nz(r, -5, 6), nz(r, -5, 6)];
  const k = tier === 1 ? r.int(2, 4) : r.pick([2, 3, 4, 5, -1, -2, -3]);
  const ans = times(k, a);
  const name = r.pick(["a", "p"]);
  const kText = k === -1 ? "−" : n(k);
  return vectorQ(
    `${name} = ${vec(a)}. Work out ${kText}${name}.`,
    undefined,
    ans,
    [
      { value: [k * a[0], a[1]], misconception: "vec-multiply-one" },
      { value: [a[0] + k, a[1] + k], misconception: "vec-added-scalar" },
      ...(k < 0 ? [{ value: [-k * a[0], -k * a[1]] as P, misconception: "vec-negative" }] : []),
    ],
    [`${kText}${name} means ${n(k)} × ${name}.`, `Multiply the top number and the bottom number by ${n(k)}.`],
    [`Top: ${n(k)} × ${b(a[0])} = ${n(ans[0])}`, `Bottom: ${n(k)} × ${b(a[1])} = ${n(ans[1])}`, `${kText}${name} = ${vec(ans)}`],
  );
};

const combine: Gen = (r) => {
  const a: P = [nz(r, -4, 5), nz(r, -4, 5)];
  const bv: P = [nz(r, -4, 5), nz(r, -4, 5)];
  const m = r.int(2, 4);
  const k = r.int(1, 3);
  const plus = r.next() < 0.5;
  const ma = times(m, a);
  const kb = times(k, bv);
  const ans = plus ? add(ma, kb) : sub(ma, kb);
  const kName = k === 1 ? "b" : `${k}b`;
  return vectorQ(
    `a = ${vec(a)} and b = ${vec(bv)}. Work out ${m}a ${plus ? "+" : "−"} ${kName}.`,
    undefined,
    ans,
    [
      { value: plus ? sub(ma, kb) : add(ma, kb), misconception: "vec-add-subtract" },
      { value: plus ? add([m * a[0], a[1]], [k * bv[0], bv[1]]) : sub([m * a[0], a[1]], [k * bv[0], bv[1]]), misconception: "vec-multiply-one" },
    ],
    [`Do the multiplying first: work out ${m}a${k === 1 ? "" : ` and ${kName}`}.`, `Then ${plus ? "add" : "subtract"} the top numbers, and the bottom numbers.`],
    [`${m}a = ${vec(ma)}${k === 1 ? "" : ` and ${kName} = ${vec(kb)}`}`, `Top: ${n(ma[0])} ${plus ? "+" : "−"} ${b(kb[0])} = ${n(ans[0])}`, `Bottom: ${n(ma[1])} ${plus ? "+" : "−"} ${b(kb[1])} = ${n(ans[1])}`, `${m}a ${plus ? "+" : "−"} ${kName} = ${vec(ans)}`],
  );
};

const vectors: Gen = (r, tier) => {
  const roll = r.next();
  if (tier === 1) {
    if (roll < 0.35) return readVector(r, tier);
    if (roll < 0.6) return addVectors(r, tier);
    if (roll < 0.8) return subtractVectors(r, tier);
    return scaleVector(r, tier);
  }
  if (roll < 0.15) return readVector(r, tier);
  if (roll < 0.3) return betweenPoints(r, tier);
  if (roll < 0.45) return addVectors(r, tier);
  if (roll < 0.6) return subtractVectors(r, tier);
  if (roll < 0.75) return scaleVector(r, tier);
  return combine(r, tier);
};

export const VECTOR_GENERATORS: Record<string, Gen> = { "geo-vectors": vectors };
