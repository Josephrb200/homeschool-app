/**
 * Question generators for comparing amounts with percentages: one amount as
 * a percentage of another, and percentage change (increase, decrease, profit
 * and loss).
 *
 * Non-calculator questions use totals that go into 100 (or nearly), so the
 * answer is exact. Calculator questions ask for 1 decimal place and accept
 * any answer that rounds correctly. A typed "%" is always accepted.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher.
 */

import { div, frac, mul, sub, type Fraction } from "@/engine/fraction";
import { roundTo } from "@/engine/marking";
import type { Rng } from "@/engine/random";
import type { Question } from "@/engine/types";
import { cleanWrong, showDec, showMoney, terminates } from "../decimals/dec";

export type Tier = 1 | 2;
type Q = Omit<Question, "id" | "skillId">;
type Gen = (r: Rng, tier: Tier) => Q;

const HELP_PCT = "Type the percentage, like 35 or 12.5. The % sign is fine but not needed.";
const HELP_PCT_1DP = "Type the percentage to 1 decimal place, like 38.5. The % sign is fine.";

const exactPct = (value: Fraction): Question["answer"] => ({ kind: "fraction", value, requireSimplest: false, form: "decimal" });

/** Is x a "bad" value for rounding to 1 dp (it sits right on a half)? */
const onHalf = (x: number) => Math.abs(x * 10 - Math.floor(x * 10) - 0.5) < 1e-6;

/** Percent value p as text: exact if it ends, else to 1 dp. */
const pctText = (p: Fraction) => (terminates(p) ? `${showDec(p)}%` : `${roundTo(p.n / p.d, 1)}%`);

/** Keep wrong values (as plain numbers) that are positive and not within rounding of the answer or each other. */
function cleanRounded(exact: number, wrongs: { value: number; misconception: string }[]) {
  const kept: { value: number; misconception: string }[] = [];
  for (const w of wrongs) {
    if (!(w.value > 0) || !Number.isFinite(w.value)) continue;
    if (Math.abs(w.value - exact) < 0.2 || kept.some((k) => Math.abs(k.value - w.value) < 0.2)) continue;
    kept.push(w);
  }
  return kept;
}

// ------------------------------------------------------------ one amount as a percentage of another

/** Totals for non-calculator questions, with how to scale to 100. */
const EASY_TOTALS = [4, 5, 10, 20, 20, 25, 25, 50];
const HARDER_TOTALS = [8, 40, 80, 200, 250, 500, 16];

function outOfContext(r: Rng, part: number, whole: number): string {
  if (whole < 10 || part < 2) return `Write ${part} out of ${whole} as a percentage.`;
  return r.pick([
    `Write ${part} out of ${whole} as a percentage.`,
    `Jo scored ${part} out of ${whole} in a test. What percentage did Jo score?`,
    `A class has ${whole} students. ${part} of them walk to school. What percentage of the class walk to school?`,
    `A bag has ${whole} sweets. ${part} of them are red. What percentage of the sweets are red?`,
    `A team played ${whole} games and won ${part}. What percentage of the games did they win?`,
  ]);
}

function oneOfAnother(r: Rng, whole: number, part: number): Q {
  const p = mul(frac(part, whole), frac(100));
  const scale = 100 % whole === 0 ? 100 / whole : null;
  const fraction = frac(part, whole);
  const wrongs = [
    { value: frac(part), misconception: "pct-just-part" },
    { value: fraction, misconception: "fdp-kept-decimal" },
    { value: mul(frac(whole, part), frac(100)), misconception: "pct-upside-down" },
  ];
  return {
    prompt: outOfContext(r, part, whole),
    answer: exactPct(p),
    wrongAnswers: cleanWrong(p, wrongs.filter((w) => terminates(w.value))),
    hints: [
      `Write it as a fraction: ${part}/${whole}. The part goes on top, the total on the bottom.`,
      scale ? `${whole} × ${scale} = 100, so make an equivalent fraction out of 100.` : `Divide ${part} by ${whole}, then multiply by 100.`,
    ],
    solution: scale
      ? [`As a fraction: ${part}/${whole}`, `Multiply top and bottom by ${scale}: ${part * scale}/100`, `${part * scale} out of 100 = ${pctText(p)}`]
      : [`As a fraction: ${part}/${whole}`, `${part} ÷ ${whole} = ${showDec(fraction)}`, `${showDec(fraction)} × 100 = ${pctText(p)}`],
    answerHelp: HELP_PCT,
  };
}

function easyOneOfAnother(r: Rng): Q {
  const whole = r.pick(EASY_TOTALS);
  const part = r.int(1, whole - 1);
  return oneOfAnother(r, whole, part);
}

function harderOneOfAnother(r: Rng): Q {
  const whole = r.pick(HARDER_TOTALS);
  let part = r.int(1, whole - 1);
  // Keep answers to at most 1 decimal place (12.5% is fine, 6.25% is a bit much).
  while (!terminates(frac(part * 10, whole))) part = (part % (whole - 1)) + 1;
  return oneOfAnother(r, whole, part);
}

function unitsQuestion(r: Rng): Q {
  const kind = r.pick(["money", "length", "time"] as const);
  if (kind === "money") {
    const pounds = r.pick([2, 4, 5]);
    const pence = r.pick([10, 20, 30, 40, 50, 60, 80, 120, 150, 25, 75]);
    const part = pence < pounds * 100 ? pence : 50;
    const p = frac(part, pounds);
    return {
      prompt: `What is ${part}p as a percentage of £${pounds}?`,
      answer: exactPct(p),
      wrongAnswers: cleanWrong(p, [{ value: frac(part * 100, pounds), misconception: "pct-units" }, { value: frac(part), misconception: "pct-just-part" }].filter((w) => terminates(w.value))),
      hints: [`Make the units the same first: £${pounds} = ${pounds * 100}p.`, `Now write ${part}/${pounds * 100} as a percentage.`],
      solution: [`£${pounds} = ${pounds * 100}p`, `As a fraction: ${part}/${pounds * 100}`, `${part} ÷ ${pounds * 100} × 100 = ${pctText(p)}`],
      answerHelp: HELP_PCT,
    };
  }
  if (kind === "length") {
    const metres = r.pick([2, 4, 5]);
    const cm = r.pick([20, 40, 50, 60, 80, 120, 150, 30]);
    const part = cm < metres * 100 ? cm : 50;
    const p = frac(part, metres);
    return {
      prompt: `A ribbon is ${metres} m long. Kai cuts off ${part} cm. What percentage of the ribbon did Kai cut off?`,
      answer: exactPct(p),
      wrongAnswers: cleanWrong(p, [{ value: frac(part * 100, metres), misconception: "pct-units" }, { value: frac(part), misconception: "pct-just-part" }].filter((w) => terminates(w.value))),
      hints: [`Make the units the same first: ${metres} m = ${metres * 100} cm.`, `Now write ${part}/${metres * 100} as a percentage.`],
      solution: [`${metres} m = ${metres * 100} cm`, `As a fraction: ${part}/${metres * 100}`, `${part} ÷ ${metres * 100} × 100 = ${pctText(p)}`],
      answerHelp: HELP_PCT,
    };
  }
  const hours = r.pick([1, 2, 5]);
  const mins = r.pick([6, 12, 15, 30, 45, 3, 24]);
  const part = mins < hours * 60 ? mins : 15;
  const p = mul(frac(part, hours * 60), frac(100));
  const wrongs = [{ value: frac(part * 100, hours), misconception: "pct-units" }, { value: frac(part), misconception: "pct-just-part" }];
  if (!terminates(p)) return unitsQuestion(r);
  return {
    prompt: `Lena spent ${part} minutes of a ${hours}-hour lesson on a quiz. What percentage of the lesson was the quiz?`,
    answer: exactPct(p),
    wrongAnswers: cleanWrong(p, wrongs.filter((w) => terminates(w.value))),
    hints: [`Make the units the same first: ${hours} hour${hours > 1 ? "s" : ""} = ${hours * 60} minutes.`, `Now write ${part}/${hours * 60} as a percentage.`],
    solution: [`${hours} hour${hours > 1 ? "s" : ""} = ${hours * 60} minutes`, `As a fraction: ${part}/${hours * 60}`, `${part} ÷ ${hours * 60} × 100 = ${pctText(p)}`],
    answerHelp: HELP_PCT,
  };
}

function calculatorOneOfAnother(r: Rng): Q {
  for (;;) {
    const whole = r.pick([7, 12, 13, 17, 23, 26, 33, 36, 42, 48, 52, 56, 64, 72, 96, 120, 150, 180, 240]);
    const part = r.int(1, whole - 1);
    const exact = (100 * part) / whole;
    if (terminates(frac(part * 10, whole)) || onHalf(exact)) continue;
    const item = r.pick(["Of the", "In a survey of"]);
    return {
      prompt:
        item === "Of the"
          ? `Of the ${whole} people at a club, ${part} are under 16. What percentage are under 16? Give your answer to 1 decimal place.`
          : `In a survey of ${whole} people, ${part} said they like rain. What percentage is that? Give your answer to 1 decimal place.`,
      answer: { kind: "decimal", exact, dp: 1 },
      wrongAnswers: cleanRounded(exact, [
        { value: part, misconception: "pct-just-part" },
        { value: (100 * whole) / part, misconception: "pct-upside-down" },
      ]),
      hints: [`Write it as a fraction: ${part}/${whole}.`, `On a calculator: ${part} ÷ ${whole} × 100, then round to 1 decimal place.`],
      solution: [`As a fraction: ${part}/${whole}`, `${part} ÷ ${whole} × 100 = ${exact.toFixed(4)}...`, `To 1 decimal place: ${roundTo(exact, 1)}%`],
      answerHelp: HELP_PCT_1DP,
    };
  }
}

const pctOneOfAnother: Gen = (r, tier) => {
  if (tier === 1) return easyOneOfAnother(r);
  const k = r.pick(["harder", "units", "calc", "harder"] as const);
  if (k === "harder") return harderOneOfAnother(r);
  if (k === "units") return unitsQuestion(r);
  return calculatorOneOfAnother(r);
};

// ------------------------------------------------------------ percentage change

type Context = { up: string; down: string; money: boolean };
const CONTEXTS: Context[] = [
  { up: "The price of a concert ticket goes up from {a} to {b}. What is the percentage increase?", down: "In a sale, the price of a jacket goes down from {a} to {b}. What is the percentage decrease?", money: true },
  { up: "A sunflower grows from {a} cm to {b} cm tall. What is the percentage increase in its height?", down: "A candle burns down from {a} cm to {b} cm. What is the percentage decrease in its height?", money: false },
  { up: "A video channel grows from {a} to {b} subscribers. What is the percentage increase?", down: "A school's car park goes from {a} to {b} spaces. What is the percentage decrease?", money: false },
  { up: "Ella's test score goes up from {a} to {b}. What is the percentage increase?", down: "A phone battery goes down from {a} to {b} minutes of charge left. What is the percentage decrease?", money: false },
];

function changeWrongs(original: Fraction, next: Fraction, p: Fraction) {
  const change = original.n * next.d > next.n * original.d ? sub(original, next) : sub(next, original);
  return cleanWrong(
    p,
    [
      { value: change, misconception: "pct-change-amount" },
      { value: mul(div(change, next), frac(100)), misconception: "pct-change-divided-new" },
      { value: mul(div(next, original), frac(100)), misconception: "pct-change-new-percent" },
    ].filter((w) => w.value.n > 0 && terminates(w.value)),
  );
}

function exactChange(r: Rng, tier: Tier): Q {
  const original = tier === 1 ? r.pick([20, 40, 50, 80, 25, 60]) : r.pick([120, 150, 250, 160, 75, 320, 240, 500, 35, 45]);
  const options = [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 12, 35, 45, 8].filter((q) => Number.isInteger((original * q) / 100) && (original * q) / 100 > 0);
  const pct = r.pick(options);
  const up = r.next() < 0.5;
  const change = (original * pct) / 100;
  const next = up ? original + change : original - change;
  const ctx = tier === 1 ? r.pick(CONTEXTS) : r.pick(CONTEXTS.slice(0, 2));
  const fmt = (n: number) => (ctx.money ? showMoney(frac(n)) : String(n));
  const profit = tier === 2 && ctx.money && r.next() < 0.5;
  const prompt = profit
    ? up
      ? `Sami buys a bike for ${fmt(original)} and sells it for ${fmt(next)}. What is the percentage profit?`
      : `Sami buys a bike for ${fmt(original)} and sells it for ${fmt(next)}. What is the percentage loss?`
    : (up ? ctx.up : ctx.down).replace("{a}", fmt(original)).replace("{b}", fmt(next));
  const p = frac(pct);
  const word = up ? (profit ? "profit" : "increase") : profit ? "loss" : "decrease";
  return {
    prompt,
    answer: exactPct(p),
    wrongAnswers: changeWrongs(frac(original), frac(next), p),
    hints: [`First find the ${word}: ${up ? `${fmt(next)} − ${fmt(original)}` : `${fmt(original)} − ${fmt(next)}`}.`, `Then divide by the original amount, ${fmt(original)}, and multiply by 100.`],
    solution: [
      `${word[0].toUpperCase()}${word.slice(1)} = ${up ? `${fmt(next)} − ${fmt(original)}` : `${fmt(original)} − ${fmt(next)}`} = ${fmt(change)}`,
      `As a fraction of the original: ${change}/${original}`,
      `${change} ÷ ${original} × 100 = ${pct}`,
      `The percentage ${word} is ${pct}%`,
    ],
    answerHelp: HELP_PCT,
  };
}

function calculatorChange(r: Rng): Q {
  for (;;) {
    const original = r.int(30, 400);
    const up = r.next() < 0.5;
    const delta = r.int(3, Math.floor(original * 0.6));
    const next = up ? original + delta : original - delta;
    const exact = (100 * delta) / original;
    if (terminates(frac(delta * 10, original)) || onHalf(exact)) continue;
    const ctx = r.pick([
      {
        t: up ? `A town's population grows from ${original} thousand to ${next} thousand. Find the percentage increase.` : `The number of birds in a park falls from ${original} to ${next}. Find the percentage decrease.`,
      },
      {
        t: up ? `A car park's daily visitors go up from ${original} to ${next}. Find the percentage increase.` : `A car was worth £${original * 100}. A year later it is worth £${next * 100}. Find the percentage decrease in its value.`,
      },
    ]);
    const wrongs = cleanRounded(exact, [
      { value: delta, misconception: "pct-change-amount" },
      { value: (100 * delta) / next, misconception: "pct-change-divided-new" },
      { value: (100 * next) / original, misconception: "pct-change-new-percent" },
    ]);
    const isCar = ctx.t.includes("car was");
    const k = isCar ? 100 : 1;
    return {
      prompt: `${ctx.t} Give your answer to 1 decimal place.`,
      answer: { kind: "decimal", exact, dp: 1 },
      // the car question uses £ values 100 times bigger, so its "change only" slip is 100 times bigger too
      wrongAnswers: wrongs.map((w) => (w.misconception === "pct-change-amount" ? { ...w, value: w.value * k } : w)),
      hints: [`Find the change: ${up ? `${next * k} − ${original * k}` : `${original * k} − ${next * k}`} = ${delta * k}.`, `Divide the change by the original amount (${original * k}), then multiply by 100.`],
      solution: [`Change = ${delta * k}`, `${delta * k} ÷ ${original * k} × 100 = ${exact.toFixed(4)}...`, `To 1 decimal place: ${roundTo(exact, 1)}%`],
      answerHelp: HELP_PCT_1DP,
    };
  }
}

const pctChange: Gen = (r, tier) => {
  if (tier === 1) return exactChange(r, 1);
  return r.next() < 0.6 ? exactChange(r, 2) : calculatorChange(r);
};

export const PERCENT_COMPARE_GENERATORS: Record<string, Gen> = {
  "pct-one-of-another": pctOneOfAnother,
  "pct-change": pctChange,
};
