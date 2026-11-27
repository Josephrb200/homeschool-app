/**
 * Small helpers shared by the calculation and proportion generators.
 * All arithmetic on decimals is exact (fractions), see ../decimals/dec.ts.
 */

import { equals, frac, type Fraction } from "@/engine/fraction";
import type { Rng } from "@/engine/random";
import type { Question } from "@/engine/types";
import { showDec, terminates } from "../decimals/dec";

export type Tier = 1 | 2;
export type Q = Omit<Question, "id" | "skillId">;
export type Gen = (r: Rng, tier: Tier) => Q;
export type Wrong = Question["wrongAnswers"][number];

/** A number as written in lessons: −7 (true minus), and 12,500 with commas from 10,000 up. */
export function num(x: number | Fraction): string {
  const f = typeof x === "number" ? frac(x) : x;
  const neg = f.n < 0;
  const pos = neg ? frac(-f.n, f.d) : f;
  // Thirds and the like don't end as decimals: show them as fractions (drawn stacked).
  if (!terminates(pos)) return `${neg ? "−" : ""}${pos.n}/${pos.d}`;
  const s = showDec(pos);
  const [w, p] = s.split(".");
  const whole = w.length > 4 ? w.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : w;
  return `${neg ? "−" : ""}${whole}${p ? `.${p}` : ""}`;
}

const toF = (v: number | Fraction): Fraction => (typeof v === "number" ? frac(v) : v);

/**
 * Keep predicted wrong answers that are positive (unless `allowNegative`),
 * differ from the right answer, and differ from each other. The first listed wins.
 */
export function clean(correct: number | Fraction, list: Wrong[], allowNegative = false): Wrong[] {
  const right = toF(correct);
  const kept: Wrong[] = [];
  for (const w of list) {
    if (Array.isArray(w.value)) continue;
    const f = toF(w.value);
    if (!Number.isFinite(f.n / f.d)) continue;
    if (!allowNegative && f.n <= 0) continue;
    if (equals(f, right)) continue;
    if (kept.some((k) => equals(toF(k.value as number | Fraction), f))) continue;
    kept.push(w);
  }
  return kept;
}

/** Shuffle a copy of a list with the seeded generator. */
export function shuffle<T>(r: Rng, items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r.next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * A multiple-choice question. `options` lists the right answer first, then
 * distractors (with the misconception each one shows, if any). Duplicates are
 * dropped and the order is shuffled.
 */
export function choiceQ(
  r: Rng,
  right: string,
  distractors: { text: string; mc?: string }[],
  rest: Omit<Q, "answer" | "wrongAnswers">,
  keepOrder = false,
): Q {
  const seen = new Set([right]);
  const ds = distractors.filter((d) => (seen.has(d.text) ? false : (seen.add(d.text), true)));
  const all = [{ text: right, mc: undefined as string | undefined }, ...ds];
  const order = keepOrder ? all : shuffle(r, all);
  const options = order.map((o) => o.text);
  return {
    ...rest,
    answer: { kind: "choice", options, correctIndex: options.indexOf(right) },
    wrongAnswers: order.flatMap((o, i) => (o.text !== right && o.mc ? [{ value: i, misconception: o.mc }] : [])),
    answerText: right,
  };
}

/** Decimal answer typed as a decimal (shown 0.35, not 7/20). */
export const decAnswer = (value: Fraction): Question["answer"] => ({ kind: "fraction", value, requireSimplest: false, form: "decimal" });

export const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

export const NAMES = ["Amy", "Ben", "Chloe", "Dev", "Ella", "Femi", "Grace", "Hassan", "Isla", "Jay", "Kai", "Leah", "Maya", "Noah", "Priya", "Sam"] as const;
