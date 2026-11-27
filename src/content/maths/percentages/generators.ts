/**
 * Question generators for the percentages chain.
 *
 * Amounts are chosen so the non-calculator method (10%, 5%, 1%) gives a short,
 * exact answer. All arithmetic is exact (see ../decimals/dec.ts). A typed "%"
 * or "£" is accepted.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher.
 */

import { add, frac, mul, show, simplify, sub, type Fraction } from "@/engine/fraction";
import type { Rng } from "@/engine/random";
import type { Question } from "@/engine/types";
import { cleanWrong, dec, showDec, showMoney, terminates } from "../decimals/dec";
import { buildSteps, pctOf } from "./steps";

export type Tier = 1 | 2;
type Q = Omit<Question, "id" | "skillId">;
type Gen = (r: Rng, tier: Tier) => Q;

const fracAnswer = (value: Fraction, requireSimplest = false): Question["answer"] => (requireSimplest ? { kind: "fraction", value, requireSimplest } : { kind: "fraction", value, requireSimplest, form: "decimal" });

const HELP_PCT = "Type a number like 35. The % sign is fine but not needed.";
const HELP_DEC = "Type a decimal like 0.35.";

// ------------------------------------------------------------ fractions, decimals, percentages

/** Fractions with a denominator that goes into 100, so the percentage is whole. */
const FRIENDLY_DENOMS = [2, 4, 5, 10, 20, 25, 50];

const fdp: Gen = (r, tier) => {
  const kind = tier === 1 ? r.pick(["dec-to-pct", "pct-to-dec", "hundredths-to-dec"] as const) : r.pick(["frac-to-pct", "pct-to-frac", "dec-to-frac", "dec-to-pct", "pct-to-dec"] as const);

  if (kind === "dec-to-pct") {
    const p = tier === 1 ? r.pick([r.int(11, 99), r.int(1, 9) * 10, r.int(1, 9)]) : r.pick([r.int(101, 250), r.int(1, 9), r.int(11, 99)]);
    const d = dec(p, 2);
    return {
      prompt: `Write ${showDec(d)} as a percentage.`,
      answer: fracAnswer(frac(p)),
      wrongAnswers: cleanWrong(frac(p), [
        { value: frac(p, 10), misconception: "fdp-times-ten" },
        { value: d, misconception: "fdp-kept-decimal" },
      ]),
      hints: [`Percent means 'out of 100'. Multiply the decimal by 100.`, `× 100 moves the digits 2 places to the left.`],
      solution: [`${showDec(d)} × 100 = ${p}`, `So ${showDec(d)} = ${p}%`],
      answerHelp: HELP_PCT,
    };
  }

  if (kind === "pct-to-dec") {
    const p = tier === 1 ? r.pick([r.int(11, 99), r.int(1, 9), r.int(1, 9) * 10]) : r.pick([r.int(1, 9), r.int(101, 199), r.int(11, 99)]);
    const d = dec(p, 2);
    const wrongs = [{ value: frac(p), misconception: "fdp-forgot-divide" }];
    if (p < 10) wrongs.unshift({ value: dec(p, 1), misconception: "fdp-percent-digits" });
    return {
      prompt: `Write ${p}% as a decimal.`,
      answer: fracAnswer(d),
      wrongAnswers: cleanWrong(d, wrongs),
      hints: [`${p}% means ${p} out of 100, so divide by 100.`, `÷ 100 moves the digits 2 places to the right.${p < 10 ? ` ${p} hundredths needs a 0 in the tenths column.` : ""}`],
      solution: [`${p}% = ${p}/100`, `${p} ÷ 100 = ${showDec(d)}`],
      answerHelp: HELP_DEC,
    };
  }

  if (kind === "hundredths-to-dec") {
    const tenths = r.next() < 0.4;
    const n = tenths ? r.int(1, 9) : r.pick([r.int(1, 9), r.int(11, 99)]);
    const den = tenths ? 10 : 100;
    const d = frac(n, den);
    const wrongs = tenths ? [{ value: frac(n, 100), misconception: "fdp-wrong-denominator" }] : n < 10 ? [{ value: frac(n, 10), misconception: "fdp-wrong-denominator" }] : [];
    return {
      prompt: `Write ${n}/${den} as a decimal.`,
      answer: fracAnswer(d),
      wrongAnswers: cleanWrong(d, wrongs),
      hints: [`${n}/${den} means ${n} ${tenths ? "tenths" : "hundredths"}.`, tenths ? `Tenths go in the first column after the decimal point.` : `Hundredths go in the second column after the decimal point.`],
      solution: [`${n}/${den} = ${n} ÷ ${den}`, `= ${showDec(d)}`],
      answerHelp: HELP_DEC,
    };
  }

  if (kind === "frac-to-pct") {
    const den = r.pick(FRIENDLY_DENOMS.filter((x) => x !== 10));
    let num = r.int(1, den - 1);
    while (simplify(frac(num, den)).d !== den) num = (num % (den - 1)) + 1;
    const p = (num * 100) / den;
    const scale = 100 / den;
    const wrongs = num < 10 && den < 10 ? [{ value: frac(Number(`${num}${den}`)), misconception: "fdp-fraction-digits" }] : [];
    return {
      prompt: `Write ${num}/${den} as a percentage.`,
      answer: fracAnswer(frac(p)),
      wrongAnswers: cleanWrong(frac(p), wrongs),
      hints: [`Make an equivalent fraction with 100 on the bottom.`, `${den} × ${scale} = 100, so multiply the top by ${scale} too.`],
      solution: [`${num}/${den} = ${num * scale}/100 (multiply top and bottom by ${scale})`, `${num * scale} out of 100 = ${p}%`],
      answerHelp: HELP_PCT,
    };
  }

  if (kind === "pct-to-frac") {
    const p = r.pick([5, 15, 35, 45, 55, 65, 85, 95, 12, 24, 36, 44, 48, 64, 75, 25, 40, 60, 80, 8, 4, 2]);
    const f = simplify(frac(p, 100));
    return {
      prompt: `Write ${p}% as a fraction in its simplest form.`,
      answer: fracAnswer(f, true),
      wrongAnswers: [],
      hints: [`${p}% means ${p} out of 100, so start with ${p}/100.`, `Divide the top and bottom by the same number until you can't go any further.`],
      solution: [`${p}% = ${p}/100`, `Divide top and bottom by ${100 / f.d}: ${show(f)}`, `${show(f)} can't be simplified any further.`],
      answerHelp: "Type a fraction like 7/20.",
    };
  }

  // dec-to-frac
  const one = r.next() < 0.5;
  const n = one ? r.pick([2, 4, 5, 6, 8]) : r.pick([5, 12, 15, 24, 25, 35, 45, 48, 75, 64]);
  const den = one ? 10 : 100;
  const d = frac(n, den);
  const f = simplify(d);
  return {
    prompt: `Write ${showDec(d)} as a fraction in its simplest form.`,
    answer: fracAnswer(f, true),
    wrongAnswers: cleanWrong(f, [{ value: frac(n, one ? 100 : 10), misconception: "fdp-wrong-denominator" }]),
    hints: [`${one ? "One decimal place means tenths" : "Two decimal places means hundredths"}: ${showDec(d)} = ${n}/${den}.`, `Now simplify ${n}/${den}.`],
    solution: [`${showDec(d)} = ${n}/${den}`, `Divide top and bottom by ${den / f.d}: ${show(f)}`],
    answerHelp: "Type a fraction like 3/5.",
  };
};

// ------------------------------------------------------------ percentage of an amount

function hintFor(p: number): string {
  if (p === 50) return "50% is a half.";
  if (p === 25) return "25% is a quarter.";
  if (p === 75) return "75% is three quarters. Find a quarter first.";
  if (p === 10) return "10% means divide by 10.";
  if (p === 1) return "1% means divide by 100.";
  if (p === 5) return "Find 10% first, then halve it to get 5%.";
  const tens = Math.floor(p / 10);
  const rest = p % 10;
  const bits = [tens ? `${tens * 10}%` : "", rest >= 5 ? "5%" : "", rest % 5 ? `${rest % 5}%` : ""].filter(Boolean);
  if (tens === 0 && rest < 5) return `Find 1% first by dividing by 100, then multiply by ${p}.`;
  return bits.length > 1 ? `Split ${p}% into ${bits.join(" + ")}. Start with 10%.` : `Find 10% first, then multiply.`;
}

/** Pick p and an amount A so p% of A is exact and friendly. */
function pickPercentAmount(r: Rng, tier: Tier): { p: number; A: Fraction; money: boolean } {
  const money = r.next() < 0.5;
  if (tier === 1) {
    const p = r.pick([10, 50, 25, 20, 5, 1, 10, 50]);
    const unit = { 10: 10, 50: 2, 25: 4, 20: 5, 5: 20, 1: 100 }[p]!;
    let A = frac(unit * r.int(2, p === 1 ? 9 : 30));
    if (p === 10 && r.next() < 0.4) A = frac(r.int(11, 99)); // 10% of 45 = 4.5: place value practice
    return { p, A, money };
  }
  const p = r.pick([15, 30, 35, 40, 45, 60, 65, 70, 75, 90, 12, 21, 32, 2, 3]);
  const A = p % 5 === 0 ? frac(20 * r.int(2, 25)) : frac(100 * r.int(1, 9));
  return { p, A, money };
}

const ofAmount: Gen = (r, tier) => {
  const { p, A, money } = pickPercentAmount(r, tier);
  const ans = pctOf(p, A);
  const fmt = (f: Fraction) => (money ? showMoney(f) : showDec(f));
  const context = money && tier === 2 && r.next() < 0.6;
  const item = r.pick(["coat", "bike", "phone", "games console", "tent", "guitar"]);
  const prompt = context
    ? `A ${item} costs ${fmt(A)}. In a sale there is ${p}% off. How much money do you save, in pounds?`
    : `Find ${p}% of ${fmt(A)}.`;
  const wrongs = [
    { value: mul(A, frac(1, p)), misconception: "pct-divided-by-percent" },
    { value: mul(ans, frac(10)), misconception: "pct-place-value" },
    { value: mul(ans, frac(1, 10)), misconception: "pct-place-value" },
    { value: sub(A, frac(p)), misconception: "pct-subtracted" },
  ];
  return {
    prompt,
    answer: fracAnswer(ans),
    wrongAnswers: cleanWrong(ans, wrongs.filter((w) => w.value.n > 0 && terminates(w.value))),
    hints: [hintFor(p), p === 50 || p === 25 || p === 75 || p === 10 || p === 1 ? `Work out ${fmt(A)} ÷ ${({ 50: 2, 25: 4, 75: 4, 10: 10, 1: 100 } as Record<number, number>)[p]}.` : p < 5 ? `1% of ${fmt(A)} is ${fmt(mul(A, frac(1, 100)))}.` : `10% of ${fmt(A)} is ${fmt(mul(A, frac(1, 10)))}.`],
    solution: [...buildSteps(p, A, money), context ? `You save ${fmt(ans)}.` : `${p}% of ${fmt(A)} = ${fmt(ans)}`],
    answerHelp: money ? "Type an amount like 4.50. The £ sign is fine." : "Type a number like 24 or 4.5.",
  };
};

// ------------------------------------------------------------ increase and decrease

function changeQuestion(r: Rng, tier: Tier): Q {
  const up = r.next() < 0.5;
  const { p, A, money } = pickPercentAmount(r, tier);
  const fmt = (f: Fraction) => (money ? showMoney(f) : showDec(f));
  const change = pctOf(p, A);
  const ans = up ? add(A, change) : sub(A, change);
  const multiplier = dec(up ? 100 + p : 100 - p, 2);
  let prompt = `${up ? "Increase" : "Decrease"} ${fmt(A)} by ${p}%.`;
  if (money && r.next() < 0.7) {
    prompt = up
      ? r.pick([
          `A gym membership costs ${fmt(A)} a year. The price goes up by ${p}%. What is the new price, in pounds?`,
          `A shop buys a jacket for ${fmt(A)} and sells it for ${p}% more. What is the selling price, in pounds?`,
          `A savings account has ${fmt(A)} in it. It grows by ${p}%. How much is in the account now, in pounds?`,
        ])
      : r.pick([
          `A pair of trainers costs ${fmt(A)}. In a sale they are ${p}% off. What is the sale price, in pounds?`,
          `A bike costs ${fmt(A)}. Its price is reduced by ${p}%. What is the new price, in pounds?`,
          `A ticket costs ${fmt(A)}. Students get ${p}% off. How much does a student pay, in pounds?`,
        ]);
  }
  const other = up ? sub(A, change) : add(A, change);
  const wrongs = [
    { value: change, misconception: "pct-change-only" },
    { value: other, misconception: "pct-wrong-direction" },
    { value: up ? add(A, frac(p)) : sub(A, frac(p)), misconception: "pct-added-number" },
  ];
  return {
    prompt,
    answer: fracAnswer(ans),
    wrongAnswers: cleanWrong(ans, wrongs.filter((w) => w.value.n > 0 && terminates(w.value))),
    hints: [
      `First find ${p}% of ${fmt(A)}. ${hintFor(p)}`,
      `Then ${up ? "add it on to" : "take it away from"} ${fmt(A)}. Or in one step: ${fmt(A)} × ${showDec(multiplier)}.`,
    ],
    solution: [
      ...buildSteps(p, A, money),
      `${up ? "Increase" : "Decrease"}: ${fmt(A)} ${up ? "+" : "−"} ${fmt(change)} = ${fmt(ans)}`,
      `Check with a multiplier: ${up ? "100% + " : "100% − "}${p}% = ${up ? 100 + p : 100 - p}%, and ${fmt(A)} × ${showDec(multiplier)} = ${fmt(ans)}.`,
    ],
    answerHelp: money ? "Type an amount like 92 or 31.50. The £ sign is fine." : "Type a number like 88 or 13.5.",
  };
}

function multiplierQuestion(r: Rng): Q {
  const up = r.next() < 0.5;
  const p = r.pick([15, 20, 35, 40, 5, 3, 12, 25, 8, 60]);
  const m = dec(up ? 100 + p : 100 - p, 2);
  const part = dec(p, 2);
  const wrongs = [
    { value: part, misconception: "pct-mult-part" },
    { value: dec(up ? 100 - p : 100 + p, 2), misconception: "pct-wrong-direction" },
  ];
  // a 5% increase written as 1.5 instead of 1.05
  if (up && p < 10) wrongs.push({ value: add(frac(1), dec(p, 1)), misconception: "pct-mult-place-value" });
  return {
    prompt: up ? `What single number do you multiply by to increase an amount by ${p}%?` : `What single number do you multiply by to decrease an amount by ${p}%?`,
    answer: fracAnswer(m),
    wrongAnswers: cleanWrong(m, wrongs),
    hints: [
      up ? `After an increase you have 100% + ${p}%. What percentage is that?` : `After a decrease you have 100% − ${p}% left. What percentage is that?`,
      `Change that percentage to a decimal by dividing by 100.`,
    ],
    solution: [up ? `100% + ${p}% = ${100 + p}%` : `100% − ${p}% = ${100 - p}%`, `${up ? 100 + p : 100 - p}% = ${up ? 100 + p : 100 - p} ÷ 100 = ${showDec(m)}`, `So multiply by ${showDec(m)}.`],
    answerHelp: "Type a decimal like 1.15 or 0.85.",
  };
}

const increaseDecrease: Gen = (r, tier) => {
  if (tier === 1) return changeQuestion(r, 1);
  return r.next() < 0.35 ? multiplierQuestion(r) : changeQuestion(r, 2);
};

export const PERCENT_GENERATORS: Record<string, Gen> = {
  "num-fdp": fdp,
  "pct-of-amount": ofAmount,
  "pct-increase-decrease": increaseDecrease,
};
