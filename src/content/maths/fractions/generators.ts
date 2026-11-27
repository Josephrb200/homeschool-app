/**
 * Question generators for the fractions chain.
 *
 * Each generator builds a question from a seed, with its exact answer, the
 * predictable wrong answers (each mapped to a misconception), hints in order,
 * and a worked solution. Because answers are computed, not typed, marking is
 * exact. Tests in generators.test.ts check every generator over many seeds.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher.
 */

import { add, equals, frac, gcd, lcm, mul, div, show, simplify, sub, type Fraction } from "@/engine/fraction";
import { rng, type Rng } from "@/engine/random";
import type { Question, SkillId } from "@/engine/types";

/** Difficulty within a skill: 1 = guided practice, 2 = independent/check. */
export type Tier = 1 | 2;

type Gen = (r: Rng, tier: Tier) => Omit<Question, "id" | "skillId">;

/** Proper fraction a/b in lowest terms with b in the given set. */
function properFraction(r: Rng, dens: readonly number[]): Fraction {
  for (;;) {
    const d = r.pick(dens);
    const n = r.int(1, d - 1);
    if (gcd(n, d) === 1) return frac(n, d);
  }
}

/** Remove wrong answers that happen to equal the correct one, and duplicates. */
function cleanWrong(correct: Fraction | number, wrong: Question["wrongAnswers"]) {
  const c = typeof correct === "number" ? frac(correct) : correct;
  const seen: Fraction[] = [];
  return wrong.filter((w) => {
    if (Array.isArray(w.value)) return false;
    const v = typeof w.value === "number" ? frac(w.value) : w.value;
    if (v.d === 0 || equals(v, c) || seen.some((s) => equals(s, v))) return false;
    seen.push(v);
    return true;
  });
}

const equivalent: Gen = (r, tier) => {
  const f = properFraction(r, tier === 1 ? [2, 3, 4, 5] : [3, 4, 5, 6, 7, 8, 9]);
  const k = r.int(2, tier === 1 ? 4 : 7);
  const missingTop = tier === 1 || r.next() < 0.6;
  if (missingTop) {
    const answer = f.n * k;
    return {
      prompt: `Fill the gap: ${show(f)} = ?/${f.d * k}`,
      visual: { kind: "bars", bars: [f, frac(answer, f.d * k)] },
      answer: { kind: "integer", value: answer },
      wrongAnswers: cleanWrong(answer, [
        { value: f.n, misconception: "changed-one-part" },
        { value: f.n + (f.d * k - f.d), misconception: "added-to-both" },
      ]),
      hints: [
        `What was ${f.d} multiplied by to make ${f.d * k}?`,
        `${f.d} × ${k} = ${f.d * k}. Multiply the top by the same number.`,
      ],
      solution: [
        `The denominator went from ${f.d} to ${f.d * k}, so it was multiplied by ${k}.`,
        `Multiply the numerator by ${k} too: ${f.n} × ${k} = ${answer}.`,
        `So ${show(f)} = ${answer}/${f.d * k}.`,
      ],
    };
  }
  const answer = f.d * k;
  return {
    prompt: `Fill the gap: ${show(f)} = ${f.n * k}/?`,
    visual: { kind: "bars", bars: [f, frac(f.n * k, answer)] },
    answer: { kind: "integer", value: answer },
    wrongAnswers: cleanWrong(answer, [
      { value: f.d, misconception: "changed-one-part" },
      { value: f.d + (f.n * k - f.n), misconception: "added-to-both" },
    ]),
    hints: [
      `What was ${f.n} multiplied by to make ${f.n * k}?`,
      `${f.n} × ${k} = ${f.n * k}. Multiply the bottom by the same number.`,
    ],
    solution: [
      `The numerator went from ${f.n} to ${f.n * k}, so it was multiplied by ${k}.`,
      `Multiply the denominator by ${k} too: ${f.d} × ${k} = ${answer}.`,
      `So ${show(f)} = ${f.n * k}/${answer}.`,
    ],
  };
};

const simplifyGen: Gen = (r, tier) => {
  const f = properFraction(r, tier === 1 ? [2, 3, 4, 5] : [3, 4, 5, 7, 8, 9]);
  const k = tier === 1 ? r.pick([2, 3, 5]) : r.pick([4, 6, 8, 9, 12]);
  const big = frac(f.n * k, f.d * k);
  return {
    prompt: `Write ${show(big)} in its simplest form.`,
    visual: { kind: "bars", bars: [big] },
    answer: { kind: "fraction", value: f, requireSimplest: true },
    wrongAnswers: [],
    hints: [
      `Find a number that divides into both ${big.n} and ${big.d}.`,
      `The biggest number that divides both is ${k}. Divide the top and bottom by ${k}.`,
    ],
    solution: [
      `The highest common factor of ${big.n} and ${big.d} is ${k}.`,
      `${big.n} ÷ ${k} = ${f.n} and ${big.d} ÷ ${k} = ${f.d}.`,
      `So ${show(big)} = ${show(f)}, and ${f.n} and ${f.d} have no common factor except 1.`,
    ],
  };
};

/** Pairs of denominators where the lowest common denominator is less than their product. */
type Pair = readonly [number, number];
const SHARED_FACTOR_PAIRS: readonly Pair[] = [
  [4, 6],
  [6, 8],
  [6, 9],
  [8, 12],
  [4, 10],
  [10, 15],
  [6, 10],
  [9, 12],
];
const COPRIME_PAIRS: readonly Pair[] = [
  [2, 3],
  [3, 4],
  [2, 5],
  [3, 5],
  [4, 5],
  [3, 7],
];

const commonDenominator: Gen = (r, tier) => {
  const [b, d] = r.pick<Pair>(tier === 1 ? [...COPRIME_PAIRS, [2, 4], [3, 6]] : SHARED_FACTOR_PAIRS);
  const L = lcm(b, d);
  if (tier === 1 || r.next() < 0.5) {
    return {
      prompt: `What is the lowest common denominator of 1/${b} and 1/${d}?`,
      answer: { kind: "integer", value: L },
      wrongAnswers: cleanWrong(L, [
        { value: b * d, misconception: "common-not-lowest" },
        { value: b + d, misconception: "added-denominators" },
      ]),
      hints: [
        `List the ${b} times table and the ${d} times table.`,
        `Find the smallest number that is in both lists.`,
      ],
      solution: [
        `Multiples of ${b}: ${[1, 2, 3, 4, 5, 6].map((i) => b * i).join(", ")}…`,
        `Multiples of ${d}: ${[1, 2, 3, 4, 5, 6].map((i) => d * i).join(", ")}…`,
        `The smallest number in both lists is ${L}.`,
      ],
    };
  }
  // rewrite a fraction over the common denominator
  let n = r.int(1, b - 1);
  while (gcd(n, b) !== 1) n = r.int(1, b - 1);
  const k = L / b;
  const answer = n * k;
  return {
    prompt: `The common denominator of ${n}/${b} and 1/${d} is ${L}. Fill the gap: ${n}/${b} = ?/${L}`,
    visual: { kind: "bars", bars: [frac(n, b), frac(answer, L)] },
    answer: { kind: "integer", value: answer },
    wrongAnswers: cleanWrong(answer, [
      { value: n, misconception: "changed-one-part" },
      { value: n + (L - b), misconception: "added-to-both" },
    ]),
    hints: [`What do you multiply ${b} by to get ${L}?`, `${b} × ${k} = ${L}. Do the same to the top.`],
    solution: [
      `${L} ÷ ${b} = ${k}, so multiply the top and bottom by ${k}.`,
      `${n} × ${k} = ${answer}.`,
      `So ${n}/${b} = ${answer}/${L}.`,
    ],
  };
};

const addSub: Gen = (r, tier) => {
  const pairs: readonly Pair[] = tier === 1 ? COPRIME_PAIRS : [...SHARED_FACTOR_PAIRS, ...COPRIME_PAIRS];
  const [b, d] = r.pick(pairs);
  const a = properFraction(r, [b]);
  const c = properFraction(r, [d]);
  const subtract = tier === 2 && r.next() < 0.5;
  const [x, y] = subtract && a.n * c.d < c.n * a.d ? [c, a] : [a, c];
  if (subtract && equals(x, y)) return addSub(r, tier);
  const L = lcm(x.d, y.d);
  const xn = x.n * (L / x.d);
  const yn = y.n * (L / y.d);
  const op = subtract ? "−" : "+";
  const answer = subtract ? sub(x, y) : add(x, y);
  const rawN = subtract ? xn - yn : xn + yn;
  const wrong: Question["wrongAnswers"] = [
    subtract
      ? { value: frac(x.n - y.n, Math.max(1, x.d - y.d)), misconception: "subtracted-across" }
      : { value: frac(x.n + y.n, x.d + y.d), misconception: "added-across" },
    { value: frac(subtract ? x.n - y.n : x.n + y.n, L), misconception: "numerator-not-scaled" },
  ];
  // subtracted-across only makes sense when the denominators actually differ in the subtracted direction
  const wrongClean = cleanWrong(answer, subtract && x.d - y.d <= 0 ? wrong.slice(1) : wrong);
  return {
    prompt: `Work out ${show(x)} ${op} ${show(y)}. Give your answer in its simplest form.`,
    visual: { kind: "bars", bars: [x, y] },
    answer: { kind: "fraction", value: answer, requireSimplest: true },
    wrongAnswers: wrongClean,
    hints: [
      `The denominators are different. Find the lowest common denominator of ${x.d} and ${y.d}.`,
      `It's ${L}. Rewrite: ${show(x)} = ${xn}/${L} and ${show(y)} = ${yn}/${L}.`,
      `Now ${subtract ? "subtract" : "add"} the numerators and keep the denominator ${L}.`,
    ],
    solution: [
      `Lowest common denominator of ${x.d} and ${y.d} is ${L}.`,
      `${show(x)} = ${xn}/${L} and ${show(y)} = ${yn}/${L}.`,
      `${xn}/${L} ${op} ${yn}/${L} = ${rawN}/${L}.`,
      equals(simplify(frac(rawN, L)), frac(rawN, L)) && gcd(rawN, L) === 1
        ? `${rawN}/${L} is already in its simplest form.`
        : `Simplify: ${rawN}/${L} = ${show(answer)}.`,
    ],
  };
};

const ofAmount: Gen = (r, tier) => {
  const f = properFraction(r, tier === 1 ? [2, 3, 4, 5] : [3, 4, 5, 6, 8, 10]);
  const unit = r.int(2, tier === 1 ? 10 : 15);
  const N = f.d * unit;
  const answer = f.n * unit;
  const money = tier === 2 && r.next() < 0.5;
  const amount = money ? `£${N}` : `${N}`;
  return {
    prompt: money ? `A jacket costs ${amount}. You pay ${show(f)} of the price. How many pounds do you pay?` : `Find ${show(f)} of ${N}.`,
    answer: { kind: "integer", value: answer },
    wrongAnswers: cleanWrong(answer, [
      { value: unit, misconception: "divided-only" },
      { value: N * f.n, misconception: "multiplied-only" },
    ]),
    hints: [
      `First find 1/${f.d} of ${N} by dividing by ${f.d}.`,
      `${N} ÷ ${f.d} = ${unit}. Now you need ${f.n} of those parts.`,
    ],
    solution: [
      `1/${f.d} of ${N} = ${N} ÷ ${f.d} = ${unit}.`,
      `${show(f)} of ${N} = ${unit} × ${f.n} = ${answer}.`,
      money ? `You pay £${answer}.` : `So ${show(f)} of ${N} is ${answer}.`,
    ],
  };
};

const mulDiv: Gen = (r, tier) => {
  const a = properFraction(r, [2, 3, 4, 5, 6, 7, 8, 9]);
  const c = properFraction(r, [2, 3, 4, 5, 6, 7, 8, 9]);
  const divide = tier === 2 && r.next() < 0.5;
  if (!divide) {
    const answer = mul(a, c);
    return {
      prompt: `Work out ${show(a)} × ${show(c)}. Give your answer in its simplest form.`,
      answer: { kind: "fraction", value: answer, requireSimplest: true },
      wrongAnswers: cleanWrong(answer, [{ value: mul(a, frac(c.d, c.n)), misconception: "flipped-when-multiplying" }]),
      hints: [`Multiply the numerators together, then the denominators together.`, `Then simplify if you can.`],
      solution: [
        `Numerators: ${a.n} × ${c.n} = ${a.n * c.n}. Denominators: ${a.d} × ${c.d} = ${a.d * c.d}.`,
        `${a.n * c.n}/${a.d * c.d}` + (gcd(a.n * c.n, a.d * c.d) === 1 ? ` is already in its simplest form.` : ` simplifies to ${show(answer)}.`),
      ],
    };
  }
  const answer = div(a, c);
  const flipped = frac(c.d, c.n);
  const flippedText = `${c.d}/${c.n}`;
  return {
    prompt: `Work out ${show(a)} ÷ ${show(c)}. Give your answer in its simplest form.`,
    answer: { kind: "fraction", value: answer, requireSimplest: true },
    wrongAnswers: cleanWrong(answer, [
      { value: mul(a, c), misconception: "forgot-to-flip" },
      { value: mul(frac(a.d, a.n), c), misconception: "flipped-wrong-fraction" },
    ]),
    hints: [
      `Keep the first fraction, change ÷ to ×, and flip the second fraction.`,
      `${show(a)} ÷ ${show(c)} = ${show(a)} × ${flippedText}.`,
    ],
    solution: [
      `Flip the second fraction and multiply: ${show(a)} × ${flippedText}.`,
      `Numerators: ${a.n} × ${flipped.n} = ${a.n * flipped.n}. Denominators: ${a.d} × ${flipped.d} = ${a.d * flipped.d}.`,
      gcd(a.n * flipped.n, a.d * flipped.d) === 1
        ? `${a.n * flipped.n}/${a.d * flipped.d} is already in its simplest form.`
        : `Simplify: ${a.n * flipped.n}/${a.d * flipped.d} = ${show(answer)}.`,
    ],
  };
};

export const GENERATORS: Record<SkillId, Gen> = {
  "frac-equivalent": equivalent,
  "frac-simplify": simplifyGen,
  "frac-common-denominator": commonDenominator,
  "frac-add-sub": addSub,
  "frac-of-amount": ofAmount,
  "frac-mul-div": mulDiv,
};

/** Build a question. The id encodes skill, tier and seed so it can be rebuilt exactly. */
export function makeQuestion(skillId: SkillId, tier: Tier, seed: number): Question {
  const gen = GENERATORS[skillId];
  if (!gen) throw new Error(`No generator for skill ${skillId}`);
  return { id: `${skillId}:${tier}:${seed}`, skillId, ...gen(rng(seed), tier) };
}

export function questionFromId(id: string): Question {
  const [skillId, tier, seed] = id.split(":");
  return makeQuestion(skillId, Number(tier) as Tier, Number(seed));
}
