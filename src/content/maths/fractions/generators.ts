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

import { add, equals, frac, gcd, lcm, mul, div, show, showMixed, simplify, sub, type Fraction } from "@/engine/fraction";
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
    wrongAnswers: cleanWrong(f, [
      { value: frac(f.n, big.d), misconception: "simplified-one-part" },
      { value: frac(big.n, f.d), misconception: "simplified-one-part" },
    ]),
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
  if (tier === 2 && f.n > 1 && r.next() < 0.35) return reverseAmount(f, unit);
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

/** "3/5 of a number is 24. What is the number?" Work back from a part to the whole. */
function reverseAmount(f: Fraction, unit: number): Omit<Question, "id" | "skillId"> {
  const part = f.n * unit;
  const whole = f.d * unit;
  return {
    prompt: `${show(f)} of a number is ${part}. What is the number?`,
    answer: { kind: "integer", value: whole },
    wrongAnswers: cleanWrong(whole, [
      { value: mul(f, frac(part)), misconception: "reverse-found-fraction" },
      { value: unit, misconception: "reverse-forgot-multiply" },
    ]),
    hints: [
      `${f.n} parts are worth ${part}. What is 1 part worth?`,
      `1 part is ${part} ÷ ${f.n} = ${unit}. The whole number is ${f.d} parts.`,
    ],
    solution: [
      `${show(f)} means ${f.n} of ${f.d} equal parts. Those ${f.n} parts are worth ${part}.`,
      `1 part = ${part} ÷ ${f.n} = ${unit}.`,
      `The whole is ${f.d} parts: ${unit} × ${f.d} = ${whole}.`,
      `Check: ${show(f)} of ${whole} = ${part}. The number is ${whole}.`,
    ],
  };
}

const mulDiv: Gen = (r, tier) => {
  const a = properFraction(r, tier === 1 ? [2, 3, 4, 5, 6] : [2, 3, 4, 5, 6, 7, 8, 9]);
  const c = properFraction(r, tier === 1 ? [2, 3, 4, 5, 6] : [2, 3, 4, 5, 6, 7, 8, 9]);
  const roll = r.next();
  if (tier === 2 && roll < 0.2) {
    // whole number × fraction
    const w = r.int(2, 9);
    const answer = mul(frac(w), a);
    return {
      prompt: `Work out ${w} × ${show(a)}. Give your answer in its simplest form.`,
      answer: { kind: "fraction", value: answer, requireSimplest: true },
      wrongAnswers: cleanWrong(answer, [{ value: frac(a.n * w, a.d * w), misconception: "multiplied-both-by-whole" }]),
      hints: [`${w} is the same as ${w}/1.`, `Multiply the numerator by ${w}. The denominator stays ${a.d}.`],
      solution: [
        `Write ${w} as ${w}/1. Then ${w}/1 × ${show(a)}: tops ${w} × ${a.n} = ${w * a.n}, bottoms 1 × ${a.d} = ${a.d}.`,
        gcd(w * a.n, a.d) === 1 ? `${w * a.n}/${a.d} is already in its simplest form.` : `Simplify: ${w * a.n}/${a.d} = ${show(answer)}.`,
      ],
    };
  }
  const divide = tier === 2 && roll < 0.6;
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

/** A mixed number w n/d (as an improper fraction) with n/d in lowest terms. */
function mixedNumber(r: Rng, dens: readonly number[], maxWhole: number): { w: number; f: Fraction; v: Fraction } {
  const f = properFraction(r, dens);
  const w = r.int(1, maxWhole);
  return { w, f, v: frac(w * f.d + f.n, f.d) };
}
const mixedText = (w: number, f: Fraction) => `${w} ${show(f)}`;

const mixedNumbers: Gen = (r, tier) => {
  const roll = r.next();
  if (tier === 1) {
    const { w, f, v } = mixedNumber(r, [2, 3, 4, 5, 6, 8], 4);
    if (roll < 0.5) {
      // improper → mixed
      return {
        prompt: `Write ${show(v)} as a mixed number.`,
        answer: { kind: "fraction", value: v, requireSimplest: true, form: "mixed" },
        wrongAnswers: cleanWrong(v, f.n === w ? [] : [{ value: frac(f.n * f.d + w, f.d), misconception: "mixed-swapped-parts" }]),
        hints: [
          `How many times does ${f.d} go into ${v.n}? That's how many wholes.`,
          `${f.d} × ${w} = ${w * f.d}, so ${w} wholes, with ${v.n} − ${w * f.d} = ${f.n} left over.`,
        ],
        solution: [
          `${v.n} ÷ ${f.d} = ${w} remainder ${f.n}.`,
          `${w} is the whole number. The remainder ${f.n} is the numerator, and the denominator stays ${f.d}.`,
          `So ${show(v)} = ${mixedText(w, f)}.`,
        ],
      };
    }
    // mixed → improper
    return {
      prompt: `Write ${mixedText(w, f)} as an improper fraction.`,
      answer: { kind: "fraction", value: v, requireSimplest: true, form: "improper" },
      wrongAnswers: cleanWrong(v, [
        { value: frac(w + f.n, f.d), misconception: "mixed-added-whole" },
        { value: frac(w * f.n + f.d, f.d), misconception: "mixed-wrong-multiply" },
      ]),
      hints: [
        `How many ${ordinalPlural(f.d)} are in ${w} whole${w > 1 ? "s" : ""}? Multiply ${w} × ${f.d}.`,
        `${w} × ${f.d} = ${w * f.d}. Now add the ${f.n} extra.`,
      ],
      solution: [
        `Each whole is ${f.d}/${f.d}, so ${w} whole${w > 1 ? "s" : ""} = ${w} × ${f.d} = ${w * f.d} ${ordinalPlural(f.d)}.`,
        `Add the numerator: ${w * f.d} + ${f.n} = ${v.n}.`,
        `So ${mixedText(w, f)} = ${show(v)}.`,
      ],
    };
  }

  const A = mixedNumber(r, [2, 3, 4, 5, 6], 3);
  const B = mixedNumber(r, [2, 3, 4, 5, 6], 2);
  const at = mixedText(A.w, A.f);
  const bt = mixedText(B.w, B.f);
  const finish = (answer: Fraction, rawN: number, rawD: number) =>
    [
      gcd(rawN, rawD) === 1 ? `${rawN}/${rawD} is already in its simplest form.` : `Simplify: ${rawN}/${rawD} = ${show(answer)}.`,
      answer.d !== 1 && answer.n > answer.d ? `As a mixed number: ${show(answer)} = ${showMixed(answer)}.` : null,
    ].filter((x): x is string => x !== null);
  const answerHelp = `Give your answer in its simplest form, as a mixed number or an improper fraction.`;
  const convert = `First write each as an improper fraction: ${at} = ${show(A.v)} and ${bt} = ${show(B.v)}.`;

  if (roll < 0.3) {
    // add
    const answer = add(A.v, B.v);
    const L = lcm(A.f.d, B.f.d);
    const an = A.v.n * (L / A.v.d);
    const bn = B.v.n * (L / B.v.d);
    return {
      prompt: `Work out ${at} + ${bt}. ${answerHelp}`,
      answer: { kind: "fraction", value: answer, requireSimplest: true },
      wrongAnswers: cleanWrong(answer, [{ value: add(frac(A.w + B.w), frac(A.f.n + B.f.n, A.f.d + B.f.d)), misconception: "added-across" }]),
      hints: [
        `You can add the whole numbers first: ${A.w} + ${B.w} = ${A.w + B.w}. Then add ${show(A.f)} + ${show(B.f)}.`,
        `To add ${show(A.f)} + ${show(B.f)}, use the common denominator ${L}.`,
      ],
      solution: [convert, `Common denominator ${L}: ${an}/${L} + ${bn}/${L} = ${an + bn}/${L}.`, ...finish(answer, an + bn, L)],
    };
  }
  if (roll < 0.55) {
    // subtract (bigger minus smaller), often needing to borrow a whole
    const [X, Y, xt, yt] = A.v.n * B.v.d >= B.v.n * A.v.d ? [A, B, at, bt] : [B, A, bt, at];
    if (equals(X.v, Y.v)) return mixedNumbers(r, tier);
    const answer = sub(X.v, Y.v);
    const L = lcm(X.f.d, Y.f.d);
    const xn = X.v.n * (L / X.v.d);
    const yn = Y.v.n * (L / Y.v.d);
    const needsBorrow = X.f.n * Y.f.d < Y.f.n * X.f.d;
    const wrong: Question["wrongAnswers"] = needsBorrow
      ? [{ value: add(frac(X.w - Y.w), sub(Y.f, X.f)), misconception: "mixed-subtracted-backwards" }]
      : [];
    return {
      prompt: `Work out ${xt} − ${yt}. ${answerHelp}`,
      answer: { kind: "fraction", value: answer, requireSimplest: true },
      wrongAnswers: cleanWrong(answer, wrong),
      hints: [
        `Write both as improper fractions: ${xt} = ${show(X.v)} and ${yt} = ${show(Y.v)}.`,
        `Use the common denominator ${L}: ${xn}/${L} − ${yn}/${L}.`,
      ],
      solution: [
        `First write each as an improper fraction: ${xt} = ${show(X.v)} and ${yt} = ${show(Y.v)}.`,
        `Common denominator ${L}: ${xn}/${L} − ${yn}/${L} = ${xn - yn}/${L}.`,
        ...finish(answer, xn - yn, L),
      ],
    };
  }
  const divide = roll >= 0.8;
  const answer = divide ? div(A.v, B.v) : mul(A.v, B.v);
  // Keep Foundation answers friendly: no denominators over 24.
  if (answer.d > 24) return mixedNumbers(r, tier);
  const second = divide ? frac(B.v.d, B.v.n) : B.v;
  const secondText = divide ? `${B.v.d}/${B.v.n}` : show(B.v);
  const rawN = A.v.n * second.n;
  const rawD = A.v.d * second.d;
  const split = divide
    ? add(frac(A.w, B.w), div(A.f, B.f))
    : add(frac(A.w * B.w), mul(A.f, B.f));
  return {
    prompt: `Work out ${at} ${divide ? "÷" : "×"} ${bt}. ${answerHelp}`,
    answer: { kind: "fraction", value: answer, requireSimplest: true },
    wrongAnswers: cleanWrong(answer, split ? [{ value: split, misconception: "mixed-split-parts" }] : []),
    hints: [
      `Don't ${divide ? "divide" : "multiply"} the wholes and fractions separately. Write both as improper fractions first.`,
      `${at} = ${show(A.v)} and ${bt} = ${show(B.v)}.` + (divide ? ` Then keep, change to ×, and flip the second.` : ` Then multiply tops and bottoms.`),
    ],
    solution: [
      convert,
      divide ? `Flip the second fraction and multiply: ${show(A.v)} × ${secondText}.` : `Multiply: ${show(A.v)} × ${show(B.v)}.`,
      `Tops: ${A.v.n} × ${second.n} = ${rawN}. Bottoms: ${A.v.d} × ${second.d} = ${rawD}.`,
      ...finish(answer, rawN, rawD),
    ],
  };
};

function ordinalPlural(d: number) {
  return ({ 2: "halves", 3: "thirds", 4: "quarters", 5: "fifths", 6: "sixths", 8: "eighths" } as Record<number, string>)[d] ?? `${d}ths`;
}

export const GENERATORS: Record<SkillId, Gen> = {
  "frac-equivalent": equivalent,
  "frac-simplify": simplifyGen,
  "frac-common-denominator": commonDenominator,
  "frac-add-sub": addSub,
  "frac-of-amount": ofAmount,
  "frac-mul-div": mulDiv,
  "frac-mixed-numbers": mixedNumbers,
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
