/**
 * Question generators for the statistics chain.
 *
 * Every chart is drawn from the numbers in the question, so the student reads
 * real values off it. Numbers are chosen so answers are whole numbers or end
 * in .5 (or, for a mean from a frequency table, are rounded to 1 decimal
 * place), and every predicted wrong answer is checked so it never equals the
 * right one.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher.
 */

import { equals, frac, showDecimal, type Fraction } from "@/engine/fraction";
import { roundTo } from "@/engine/marking";
import type { Rng } from "@/engine/random";
import type { ChartSpec, Question } from "@/engine/types";

export type Tier = 1 | 2;
type Gen = (r: Rng, tier: Tier) => Omit<Question, "id" | "skillId">;
type Wrong = Question["wrongAnswers"][number];

const NUMBER_HELP = "Type a number, like 12.";
const DECIMAL_HELP = "Type a number. If it isn't whole, use a decimal point, like 6.5.";

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const listText = (xs: number[]) => xs.join(", ");

function shuffle<T>(r: Rng, xs: readonly T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = r.int(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** x as an exact fraction, for whole numbers and halves (and other short decimals). */
function exact(x: number): Fraction {
  for (const d of [1, 2, 4, 5, 10, 20, 100]) if (Math.abs(x * d - Math.round(x * d)) < 1e-9) return frac(Math.round(x * d), d);
  return frac(Math.round(x * 1000), 1000);
}
/** A fraction that a student could type as a short decimal (not 7/3). */
const typeable = (f: Fraction) => [1, 2, 4, 5, 10, 20, 100].some((d) => (f.n * d) % f.d === 0);

/** Drop wrong answers that equal the right one, that are negative, untypeable, or repeat. */
function cleanWrong(correct: Fraction, wrong: { value: Fraction | number; misconception: string }[]): Wrong[] {
  const kept: Wrong[] = [];
  for (const w of wrong) {
    const f = typeof w.value === "number" ? exact(w.value) : w.value;
    if (f.n < 0 || !typeable(f) || equals(f, correct)) continue;
    if (kept.some((k) => equals(k.value as Fraction, f))) continue;
    kept.push({ value: f, misconception: w.misconception });
  }
  return kept;
}

/** For 1 d.p. answers: keep wrong answers well away from the right one and from each other. */
function cleanWrongDecimal(correct: number, wrong: { value: number; misconception: string }[]): Wrong[] {
  const kept: Wrong[] = [];
  for (const w of wrong) {
    const v = Math.round(w.value * 10) / 10;
    if (!Number.isFinite(v) || v < 0 || Math.abs(v - correct) < 0.15) continue;
    if (kept.some((k) => Math.abs((k.value as number) - v) < 0.15)) continue;
    kept.push({ value: v, misconception: w.misconception });
  }
  return kept;
}

/** An integer answer with checked wrong answers. */
function intAnswer(value: number, wrong: { value: Fraction | number; misconception: string }[]) {
  return {
    answer: { kind: "integer" as const, value },
    wrongAnswers: cleanWrong(frac(value), wrong),
    answerHelp: NUMBER_HELP,
  };
}

/** A whole-or-half answer (shown as a decimal, e.g. 6.5). */
function halfAnswer(value: Fraction, wrong: { value: Fraction | number; misconception: string }[]) {
  return {
    answer: { kind: "fraction" as const, value, requireSimplest: false, form: "decimal" as const },
    wrongAnswers: cleanWrong(value, wrong),
    answerHelp: DECIMAL_HELP,
  };
}

// ------------------------------------------------------------ contexts

const CATEGORY_SETS = [
  { title: "Favourite pet", unit: "students", verb: "chose", items: ["Cat", "Dog", "Fish", "Rabbit", "Hamster"] },
  { title: "How they travel to school", unit: "students", verb: "chose", items: ["Walk", "Bus", "Car", "Bike", "Train"] },
  { title: "Favourite fruit", unit: "people", verb: "chose", items: ["Apple", "Banana", "Grape", "Orange", "Mango"] },
  { title: "Favourite sport", unit: "students", verb: "chose", items: ["Football", "Swimming", "Tennis", "Netball", "Dance"] },
  { title: "Car colour", unit: "cars", verb: "were", items: ["Red", "Blue", "Black", "Silver", "White"] },
] as const;
type Cats = (typeof CATEGORY_SETS)[number];

function pickCats(r: Rng, k: number): { set: Cats; items: string[] } {
  const set = r.pick(CATEGORY_SETS);
  return { set, items: shuffle(r, set.items).slice(0, k) };
}
/** "How many students chose Cat?" / "How many cars were Red?" */
const howMany = (set: Cats, item: string) => `How many ${set.unit} ${set.verb} ${item}?`;
const moreThan = (set: Cats, a: string, b: string) =>
  set.verb === "were" ? `How many more cars were ${a} than ${b}?` : `How many more ${set.unit} chose ${a} than ${b}?`;
const surveyed = (set: Cats) => (set.unit === "cars" ? "the colours of cars in a car park" : `a survey of ${set.unit}: ${set.title.toLowerCase()}`);

/** Distinct whole numbers in lo..hi. */
function distinctInts(r: Rng, k: number, lo: number, hi: number): number[] {
  const out: number[] = [];
  while (out.length < k) {
    const v = r.int(lo, hi);
    if (!out.includes(v)) out.push(v);
  }
  return out;
}

const tableChart = (headers: string[], rows: (string | number)[][], description: string, tallyColumn?: number): ChartSpec => ({
  type: "table",
  headers,
  rows,
  tallyColumn,
  description,
});
const describeRows = (items: string[], values: (number | string)[]) => items.map((it, i) => `${it} ${values[i]}`).join(", ");

// ------------------------------------------------------------ tally charts and frequency tables

const frequencyTables: Gen = (r, tier) => {
  if (tier === 1) {
    const { set, items } = pickCats(r, 4);
    const values = distinctInts(r, 4, 3, 17);
    // Make sure at least one value has a gate of five.
    if (values.every((v) => v < 6)) values[0] = r.int(6, 17);
    const chart = tableChart(
      [set.title, "Tally"],
      items.map((it, i) => [it, values[i]]),
      `Tally chart of ${set.title.toLowerCase()}. ${items.map((it, i) => `${it}: ${Math.floor(values[i] / 5)} gates of five and ${values[i] % 5} single lines`).join(". ")}.`,
      1,
    );
    const gateAsFour = (v: number) => Math.floor(v / 5) * 4 + (v % 5);
    if (r.next() < 0.55) {
      const i = values.findIndex((v) => v >= 6);
      const v = values[i];
      return {
        prompt: `The tally chart shows ${surveyed(set)}. ${howMany(set, items[i])}`,
        visual: { kind: "chart", chart },
        ...intAnswer(v, [{ value: gateAsFour(v), misconception: "tally-gate-as-four" }]),
        hints: ["Each gate (four lines with one across) stands for 5.", `Count the gates in fives for ${items[i]}, then add the single lines.`],
        solution: [
          `${items[i]} has ${Math.floor(v / 5)} gate${Math.floor(v / 5) === 1 ? "" : "s"} of 5 and ${v % 5} single line${v % 5 === 1 ? "" : "s"}.`,
          `${Math.floor(v / 5)} × 5 + ${v % 5} = ${v}`,
          `Answer: ${v}`,
        ],
      };
    }
    const sorted = [...values.keys()].sort((a, b) => values[b] - values[a]);
    const [hi, lo] = [sorted[0], sorted[r.int(1, 3)]];
    const d = values[hi] - values[lo];
    return {
      prompt: `The tally chart shows ${surveyed(set)}. ${moreThan(set, items[hi], items[lo])}`,
      visual: { kind: "chart", chart },
      ...intAnswer(d, [
        { value: values[hi] + values[lo], misconception: "freq-diff-added" },
        { value: gateAsFour(values[hi]) - gateAsFour(values[lo]), misconception: "tally-gate-as-four" },
      ]),
      hints: [`Count each tally first: gates are worth 5.`, `"How many more" means subtract: ${items[hi]} take away ${items[lo]}.`],
      solution: [`${items[hi]}: ${values[hi]}. ${items[lo]}: ${values[lo]}.`, `${values[hi]} − ${values[lo]} = ${d}`, `Answer: ${d}`],
    };
  }

  const { set, items } = pickCats(r, 5);
  const values = items.map(() => r.int(2, 14));
  const total = sum(values);
  if (r.next() < 0.55) {
    const m = r.int(0, 4);
    const known = total - values[m];
    const chart = tableChart(
      [set.title, "Frequency"],
      items.map((it, i) => [it, i === m ? "?" : values[i]]),
      `Frequency table of ${set.title.toLowerCase()}: ${describeRows(items, values.map((v, i) => (i === m ? "missing" : v)))}.`,
    );
    const who = set.unit === "cars" ? `There are ${total} cars in the car park.` : `${total} ${set.unit} took part in a survey.`;
    return {
      prompt: `${who} The frequency for ${items[m]} is missing from the table. ${howMany(set, items[m])}`,
      visual: { kind: "chart", chart },
      ...intAnswer(values[m], [
        { value: known, misconception: "freq-missing-gave-known" },
        { value: total, misconception: "freq-missing-gave-known" },
      ]),
      hints: [`Add up the frequencies you know.`, `Take that away from ${total}, the total.`],
      solution: [
        `Known frequencies: ${values.filter((_, i) => i !== m).join(" + ")} = ${known}.`,
        `${total} − ${known} = ${values[m]}`,
        `Answer: ${values[m]}`,
      ],
    };
  }
  const chart = tableChart(
    [set.title, "Tally"],
    items.map((it, i) => [it, values[i]]),
    `Tally chart of ${set.title.toLowerCase()}. ${items.map((it, i) => `${it}: ${Math.floor(values[i] / 5)} gates of five and ${values[i] % 5} single lines`).join(". ")}.`,
    1,
  );
  const skip = r.int(0, 4);
  const gateAsFour = (v: number) => Math.floor(v / 5) * 4 + (v % 5);
  return {
    prompt: `The tally chart shows ${surveyed(set)}. What is the total frequency? (How many ${set.unit} are there altogether?)`,
    visual: { kind: "chart", chart },
    ...intAnswer(total, [
      { value: total - values[skip], misconception: "freq-total-missed-row" },
      { value: sum(values.map(gateAsFour)), misconception: "tally-gate-as-four" },
    ]),
    hints: ["Turn each tally into a number first. Gates are worth 5.", "Then add all five frequencies."],
    solution: [`Frequencies: ${describeRows(items, values)}.`, `${values.join(" + ")} = ${total}`, `Answer: ${total}`],
  };
};

// ------------------------------------------------------------ bar charts and pictograms

function barChart(set: Cats, items: string[], values: number[], yStep: number): ChartSpec {
  return {
    type: "bar",
    categories: items,
    values,
    xLabel: set.title,
    yLabel: set.unit === "cars" ? "Number of cars" : `Number of ${set.unit}`,
    yStep,
    description: `Bar chart of ${set.title.toLowerCase()}. The scale goes up in ${yStep}s. ${describeRows(items, values)}.`,
  };
}
function pictogram(set: Cats, items: string[], values: number[], k: number): ChartSpec {
  return {
    type: "pictogram",
    categories: items,
    values,
    perSymbol: k,
    unit: set.unit,
    description: `Pictogram of ${set.title.toLowerCase()}. Key: one circle stands for ${k} ${set.unit}. ${items
      .map((it, i) => `${it}: ${Math.floor(values[i] / k)} circles${values[i] % k ? " and a half circle" : ""}`)
      .join(". ")}.`,
  };
}

const barPictograms: Gen = (r, tier) => {
  const { set, items } = pickCats(r, 4);
  const usePictogram = r.next() < 0.45;

  if (usePictogram) {
    const k = tier === 1 ? r.pick([2, 4, 10]) : r.pick([2, 4, 6, 8, 10]);
    const symbols = items.map(() => r.int(1, 6));
    const halves = items.map(() => tier === 2 && r.next() < 0.6);
    if (tier === 2 && !halves.some(Boolean)) halves[r.int(0, 3)] = true;
    const values = symbols.map((s, i) => s * k + (halves[i] ? k / 2 : 0));
    const chart = pictogram(set, items, values, k);
    const i = tier === 2 ? halves.findIndex(Boolean) : r.int(0, 3);
    const s = symbols[i];
    if (tier === 2 && r.next() < 0.35) {
      const total = sum(values);
      return {
        prompt: `The pictogram shows ${surveyed(set)}. How many ${set.unit} are there altogether?`,
        visual: { kind: "chart", chart },
        ...intAnswer(total, [
          { value: sum(symbols.map((x, j) => x + (halves[j] ? 1 : 0))), misconception: "pictogram-counted-symbols" },
          { value: sum(symbols.map((x, j) => (x + (halves[j] ? 1 : 0)) * k)), misconception: "pictogram-half-as-whole" },
        ]),
        hints: [`One circle = ${k}, so half a circle = ${k / 2}.`, "Work out each row, then add them."],
        solution: [`Each row: ${describeRows(items, values)}.`, `${values.join(" + ")} = ${total}`, `Answer: ${total}`],
      };
    }
    const v = values[i];
    return {
      prompt: `The pictogram shows ${surveyed(set)}. ${howMany(set, items[i])}`,
      visual: { kind: "chart", chart },
      ...intAnswer(v, [
        { value: halves[i] ? frac(2 * s + 1, 2) : s, misconception: "pictogram-counted-symbols" },
        ...(halves[i] ? [{ value: (s + 1) * k, misconception: "pictogram-half-as-whole" }] : []),
      ]),
      hints: [
        `Look at the key: one circle stands for ${k}.`,
        halves[i] ? `${items[i]} has ${s} whole circles and a half. Half a circle is ${k / 2}.` : `${items[i]} has ${s} circles, so multiply ${s} by ${k}.`,
      ],
      solution: halves[i]
        ? [`${s} whole circles: ${s} × ${k} = ${s * k}.`, `Half a circle: ${k} ÷ 2 = ${k / 2}.`, `${s * k} + ${k / 2} = ${v}`]
        : [`${items[i]} has ${s} circles, and each stands for ${k}.`, `${s} × ${k} = ${v}`],
    };
  }

  const yStep = tier === 1 ? r.pick([2, 5, 10]) : r.pick([2, 10]);
  const unitsOf = tier === 1 ? yStep : yStep / 2;
  let values = distinctInts(r, 4, 1, tier === 1 ? 8 : 16).map((n) => n * unitsOf);
  if (tier === 2 && values.every((v) => v % yStep === 0)) values = values.map((v, j) => (j === 0 ? v + unitsOf : v));
  const chart = barChart(set, items, values, yStep);
  const ask = tier === 1 ? (r.next() < 0.6 ? "read" : "diff") : r.pick(["diff", "total", "read"] as const);
  const chartWords = `The bar chart shows ${surveyed(set)}.`;

  if (ask === "read") {
    const i = tier === 2 ? Math.max(0, values.findIndex((v) => v % yStep !== 0)) : r.int(0, 3);
    const v = values[i];
    return {
      prompt: `${chartWords} ${howMany(set, items[i])}`,
      visual: { kind: "chart", chart },
      ...intAnswer(v, [{ value: v / yStep, misconception: "bar-counted-gridlines" }]),
      hints: [
        `Read the scale up the side: the numbered lines go up in ${yStep}s${yStep % 2 === 0 ? `, and the dashed lines are half-way, so they're worth ${yStep / 2} more` : ""}.`,
        `Follow the top of the ${items[i]} bar across to the scale.`,
      ],
      solution: [`The scale goes up in ${yStep}s.`, `The ${items[i]} bar reaches ${v}.`, `Answer: ${v}`],
    };
  }
  if (ask === "diff") {
    const order = [...values.keys()].sort((a, b) => values[b] - values[a]);
    const hi = order[0];
    const lo = order[r.int(1, 3)];
    const d = values[hi] - values[lo];
    return {
      prompt: `${chartWords} ${moreThan(set, items[hi], items[lo])}`,
      visual: { kind: "chart", chart },
      ...intAnswer(d, [
        { value: values[hi] + values[lo], misconception: "freq-diff-added" },
        { value: d / yStep, misconception: "bar-counted-gridlines" },
      ]),
      hints: [`Read both bars using the scale (it goes up in ${yStep}s).`, `Then subtract: ${items[hi]} take away ${items[lo]}.`],
      solution: [`${items[hi]}: ${values[hi]}. ${items[lo]}: ${values[lo]}.`, `${values[hi]} − ${values[lo]} = ${d}`, `Answer: ${d}`],
    };
  }
  const total = sum(values);
  const skip = r.int(0, 3);
  return {
    prompt: `${chartWords} How many ${set.unit} are there altogether?`,
    visual: { kind: "chart", chart },
    ...intAnswer(total, [
      { value: total - values[skip], misconception: "freq-total-missed-row" },
      { value: total / yStep, misconception: "bar-counted-gridlines" },
    ]),
    hints: [`Read every bar using the scale (it goes up in ${yStep}s).`, "Add all four values."],
    solution: [`The bars are ${describeRows(items, values)}.`, `${values.join(" + ")} = ${total}`, `Answer: ${total}`],
  };
};

// ------------------------------------------------------------ pie charts

const PIE_TOTALS = [12, 18, 20, 24, 30, 36, 40, 45, 60, 72, 90, 120] as const;

/** Frequencies adding to `total`, each big enough for a sector of at least 30°. */
function pieFrequencies(r: Rng, total: number, k: number): number[] {
  const per = 360 / total;
  const min = Math.ceil(30 / per);
  const out = Array.from({ length: k }, () => min);
  let left = total - min * k;
  while (left > 0) {
    out[r.int(0, k - 1)]++;
    left--;
  }
  return out;
}

const pieCharts: Gen = (r, tier) => {
  const total: number = r.pick(PIE_TOTALS);
  const k = r.int(3, 4);
  const per = 360 / total;
  const { set, items } = pickCats(r, k);
  const freqs = pieFrequencies(r, total, k);
  const angles = freqs.map((f) => f * per);
  const who = set.unit === "cars" ? `${total} cars` : `${total} ${set.unit}`;

  if (tier === 1) {
    if (r.next() < 0.3) {
      return {
        prompt: `A pie chart is drawn to show ${surveyed(set)}. There are ${who}. How many degrees of the pie chart stand for one ${set.unit === "people" ? "person" : set.unit.replace(/s$/, "")}?`,
        ...intAnswer(per, [
          { value: 100 / total, misconception: "pie-used-100" },
          { value: total, misconception: "pie-frequency-as-angle" },
        ]),
        hints: ["A full circle is 360°.", `Share 360° equally between ${total}.`],
        solution: [`The whole circle, 360°, stands for all ${total}.`, `360 ÷ ${total} = ${per}`, `Answer: ${per}°`],
      };
    }
    const i = r.int(0, k - 1);
    const chart = tableChart(
      [set.title, "Frequency"],
      [...items.map((it, j) => [it, freqs[j]] as (string | number)[]), ["Total", total]],
      `Frequency table of ${set.title.toLowerCase()}: ${describeRows(items, freqs)}. Total ${total}.`,
    );
    return {
      prompt: `The table shows ${surveyed(set)}. Pat is drawing a pie chart. What angle should the sector for ${items[i]} be?`,
      visual: { kind: "chart", chart },
      ...intAnswer(angles[i], [
        { value: freqs[i], misconception: "pie-frequency-as-angle" },
        { value: (freqs[i] * 100) / total, misconception: "pie-used-100" },
      ]),
      hints: [`First find the angle for one: 360 ÷ ${total}.`, `Then multiply by ${freqs[i]}, the frequency for ${items[i]}.`],
      solution: [`For one: 360 ÷ ${total} = ${per}°.`, `For ${items[i]}: ${freqs[i]} × ${per} = ${angles[i]}`, `Answer: ${angles[i]}°`],
    };
  }

  if (r.next() < 0.45) {
    const m = r.int(0, k - 1);
    const known = 360 - angles[m];
    const chart: ChartSpec = {
      type: "pie",
      sectors: items.map((label, j) => ({ label, angle: angles[j] })),
      showAngles: true,
      hideAngle: m,
      description: `Pie chart of ${set.title.toLowerCase()}. ${items.map((it, j) => `${it} ${j === m ? "unknown angle" : `${angles[j]} degrees`}`).join(", ")}.`,
    };
    const others = angles.filter((_, j) => j !== m);
    return {
      prompt: `The pie chart shows ${surveyed(set)}. What is the missing angle for ${items[m]}?`,
      visual: { kind: "chart", chart },
      ...intAnswer(angles[m], [{ value: 180 - known, misconception: "pie-angles-180" }]),
      answerHelp: "Type the angle in degrees, like 75. The ° sign isn't needed.",
      hints: ["The angles in a pie chart add up to 360°.", `Add the angles you know, then take that away from 360.`],
      solution: [`Known angles: ${others.join(" + ")} = ${known}°.`, `360 − ${known} = ${angles[m]}`, `Answer: ${angles[m]}°`],
    };
  }

  // Read a frequency back off the pie chart.
  const i = r.int(0, k - 1);
  const chart: ChartSpec = {
    type: "pie",
    sectors: items.map((label, j) => ({ label, angle: angles[j] })),
    showAngles: true,
    description: `Pie chart of ${set.title.toLowerCase()}. ${items.map((it, j) => `${it} ${angles[j]} degrees`).join(", ")}.`,
  };
  return {
    prompt: `The pie chart shows ${surveyed(set)}. It shows ${who} altogether. ${howMany(set, items[i])}`,
    visual: { kind: "chart", chart },
    ...intAnswer(freqs[i], [{ value: angles[i], misconception: "pie-angle-as-frequency" }]),
    hints: [`Each ${set.unit === "people" ? "person" : set.unit.replace(/s$/, "")} gets 360 ÷ ${total} = ${per}°.`, `So divide the angle for ${items[i]} by ${per}.`],
    solution: [`One ${set.unit === "people" ? "person" : set.unit.replace(/s$/, "")} = 360 ÷ ${total} = ${per}°.`, `${angles[i]} ÷ ${per} = ${freqs[i]}`, `Answer: ${freqs[i]}`],
  };
};

// ------------------------------------------------------------ mean, median, mode and range

const LIST_CONTEXTS = [
  { say: "Here are the numbers of goals a team scored in its last {n} matches", lo: 0, hi: 9 },
  { say: "Here are the scores out of 20 that {n} students got in a quiz", lo: 4, hi: 20 },
  { say: "Here are the numbers of minutes {n} students spent reading last night", lo: 5, hi: 40 },
  { say: "Here are the shoe sizes of {n} people", lo: 3, hi: 11 },
  { say: "Here are the ages of {n} children at a party", lo: 5, hi: 15 },
  { say: "Here are the numbers of text messages {n} friends sent today", lo: 1, hi: 30 },
] as const;

/** n values in lo..hi whose total is exactly `target`, or null if it can't be done quickly. */
function listWithSum(r: Rng, n: number, lo: number, hi: number, target: number): number[] | null {
  for (let tries = 0; tries < 200; tries++) {
    const xs = Array.from({ length: n - 1 }, () => r.int(lo, hi));
    const last = target - sum(xs);
    if (last >= lo && last <= hi) return shuffle(r, [...xs, last]);
  }
  return null;
}

const sortedText = (xs: number[]) => listText([...xs].sort((a, b) => a - b));

const averages: Gen = (r, tier) => {
  const ctx = r.pick(LIST_CONTEXTS);
  const { lo, hi } = ctx;
  const kind = tier === 1 ? r.pick(["mean", "median", "mode", "range"] as const) : r.pick(["mean", "median", "missing", "range"] as const);

  if (kind === "mean") {
    const n = tier === 1 ? r.int(4, 6) : r.pick([4, 6]);
    for (;;) {
      const m = r.int(lo + 1, hi - 1);
      const target = tier === 1 ? n * m : n * m + n / 2;
      const xs = listWithSum(r, n, lo, hi, target);
      if (!xs) continue;
      const total = sum(xs);
      const mean = frac(total, n);
      return {
        prompt: `${ctx.say.replace("{n}", String(n))}: ${listText(xs)}. Work out the mean.`,
        ...halfAnswer(mean, [
          { value: total, misconception: "mean-forgot-divide" },
          { value: frac(total, n - 1), misconception: "mean-wrong-count" },
          { value: frac(total, n + 1), misconception: "mean-wrong-count" },
        ]),
        hints: ["Add up all the numbers.", `Then divide the total by how many numbers there are: ${n}.`],
        solution: [`Total: ${xs.join(" + ")} = ${total}.`, `There are ${n} numbers.`, `Mean = ${total} ÷ ${n} = ${showDecimal(mean)}`],
      };
    }
  }

  if (kind === "median") {
    const n = tier === 1 ? r.pick([5, 7]) : r.pick([6, 8]);
    for (;;) {
      const xs = Array.from({ length: n }, () => r.int(lo, hi));
      const s = [...xs].sort((a, b) => a - b);
      if (xs.every((x, i) => x === s[i])) continue;
      if (n % 2 === 1) {
        const med = s[(n - 1) / 2];
        const unsortedMid = xs[(n - 1) / 2];
        if (unsortedMid === med) continue;
        return {
          prompt: `${ctx.say.replace("{n}", String(n))}: ${listText(xs)}. Work out the median.`,
          ...intAnswer(med, [{ value: unsortedMid, misconception: "median-not-ordered" }]),
          hints: ["Write the numbers in order, smallest first.", `With ${n} numbers, the middle one is number ${(n + 1) / 2}.`],
          solution: [`In order: ${sortedText(xs)}.`, `The middle (number ${(n + 1) / 2}) is ${med}.`, `Median = ${med}`],
        };
      }
      const a = s[n / 2 - 1];
      const b = s[n / 2];
      if (a === b) continue;
      const med = frac(a + b, 2);
      const unsorted = frac(xs[n / 2 - 1] + xs[n / 2], 2);
      if (equals(unsorted, med)) continue;
      return {
        prompt: `${ctx.say.replace("{n}", String(n))}: ${listText(xs)}. Work out the median.`,
        ...halfAnswer(med, [
          { value: a, misconception: "median-even-picked-one" },
          { value: b, misconception: "median-even-picked-one" },
          { value: unsorted, misconception: "median-not-ordered" },
        ]),
        hints: ["Write the numbers in order, smallest first.", `There are ${n} numbers, so two are in the middle. The median is half-way between them.`],
        solution: [`In order: ${sortedText(xs)}.`, `The middle two are ${a} and ${b}.`, `(${a} + ${b}) ÷ 2 = ${showDecimal(med)}`, `Median = ${showDecimal(med)}`],
      };
    }
  }

  if (kind === "mode") {
    for (;;) {
      const n = r.int(6, 8);
      const reps = r.int(2, 3);
      const modeVal = r.int(lo, hi);
      if (modeVal === reps) continue;
      const others = distinctInts(r, n - reps, lo, hi).filter((x) => x !== modeVal);
      if (others.length !== n - reps) continue;
      const xs = shuffle(r, [...others, ...Array(reps).fill(modeVal)]);
      return {
        prompt: `${ctx.say.replace("{n}", String(n))}: ${listText(xs)}. What is the mode?`,
        ...intAnswer(modeVal, [{ value: reps, misconception: "mode-gave-frequency" }]),
        hints: ["The mode is the value that appears most often.", "Putting the numbers in order makes repeats easy to spot."],
        solution: [`In order: ${sortedText(xs)}.`, `${modeVal} appears ${reps} times, more than any other number.`, `Mode = ${modeVal}`],
      };
    }
  }

  if (kind === "range") {
    const n = r.int(5, 7);
    for (;;) {
      const xs = Array.from({ length: n }, () => r.int(lo, hi));
      const mx = Math.max(...xs);
      const mn = Math.min(...xs);
      if (mx === mn || (xs[0] === mn && xs[n - 1] === mx) || (xs[0] === mx && xs[n - 1] === mn)) continue;
      const rg = mx - mn;
      return {
        prompt: `${ctx.say.replace("{n}", String(n))}: ${listText(xs)}. Work out the range.`,
        ...intAnswer(rg, [
          { value: mx, misconception: "range-gave-largest" },
          { value: Math.abs(xs[n - 1] - xs[0]), misconception: "range-not-ordered" },
        ]),
        hints: ["Find the biggest and the smallest number.", "Range = biggest − smallest."],
        solution: [`Biggest: ${mx}. Smallest: ${mn}.`, `${mx} − ${mn} = ${rg}`, `Range = ${rg}`],
      };
    }
  }

  // Missing value from the mean.
  for (;;) {
    const n = r.int(4, 6);
    const m = r.int(lo + 2, hi - 2);
    const xs = listWithSum(r, n, lo, hi, n * m);
    if (!xs) continue;
    const missing = xs[n - 1];
    const known = xs.slice(0, n - 1);
    const total = n * m;
    return {
      prompt: `The mean of ${n} numbers is ${m}. ${n - 1} of the numbers are ${listText(known)}. What is the other number?`,
      ...intAnswer(missing, [
        { value: total, misconception: "mean-missing-gave-total" },
      ]),
      hints: [`If the mean of ${n} numbers is ${m}, they add up to ${n} × ${m}.`, "Take away the numbers you know."],
      solution: [`Total of all ${n}: ${n} × ${m} = ${total}.`, `The ${n - 1} you know add to ${sum(known)}.`, `${total} − ${sum(known)} = ${missing}`],
    };
  }
};

// ------------------------------------------------------------ averages from a frequency table

const FREQ_CONTEXTS = [
  { col: "Number of pets", who: "students", thing: "pets", start: [0, 1] },
  { col: "Goals scored", who: "matches", thing: "goals", start: [0, 1] },
  { col: "Number of brothers and sisters", who: "students", thing: "brothers and sisters", start: [0, 1] },
  { col: "Books read last month", who: "students", thing: "books", start: [0, 1, 2] },
  { col: "Shoe size", who: "people", thing: "", start: [3, 4, 5] },
] as const;

const freqAverages: Gen = (r, tier) => {
  const ctx = r.pick(FREQ_CONTEXTS);
  const rows = tier === 1 ? 5 : r.int(5, 6);
  const start = r.pick(ctx.start);
  const xs = Array.from({ length: rows }, (_, i) => start + i);
  const kinds = ctx.thing ? (["mode", "median", "total", "mean", "range"] as const) : (["mode", "median", "mean", "range"] as const);
  const kind = tier === 1 ? r.pick(kinds.filter((k) => k !== "mean" && k !== "range")) : r.pick(kinds.filter((k) => k !== "total"));

  for (;;) {
    const fs = xs.map(() => r.int(1, 9));
    if (kind === "range") {
      // A zero row at one end, so the range isn't simply last − first.
      const end = r.next();
      if (end < 0.4) fs[rows - 1] = 0;
      else if (end < 0.8) fs[0] = 0;
      else fs[0] = fs[rows - 1] = 0;
    }
    const n = sum(fs);
    const chart = tableChart(
      [ctx.col, "Frequency"],
      xs.map((x, i) => [x, fs[i]]),
      `Frequency table. ${ctx.col}: ${xs.map((x, i) => `${x} has frequency ${fs[i]}`).join(", ")}.`,
    );
    const intro = `The table shows ${ctx.col.toLowerCase()} for ${n} ${ctx.who}.`;
    const visual = { kind: "chart" as const, chart };

    if (kind === "mode") {
      const maxF = Math.max(...fs);
      if (fs.filter((f) => f === maxF).length > 1) continue;
      const mode = xs[fs.indexOf(maxF)];
      if (mode === maxF) continue;
      return {
        prompt: `${intro} What is the mode?`,
        visual,
        ...intAnswer(mode, [{ value: maxF, misconception: "freq-mode-gave-frequency" }]),
        hints: ["Find the biggest number in the Frequency column.", `The mode is the ${ctx.col.toLowerCase()} in that row.`],
        solution: [`The biggest frequency is ${maxF}.`, `It is in the row for ${mode}.`, `Mode = ${mode}`],
      };
    }

    if (kind === "median") {
      if (n % 2 === 0) continue;
      const pos = (n + 1) / 2;
      let run = 0;
      let med = xs[0];
      for (let i = 0; i < rows; i++) {
        run += fs[i];
        if (run >= pos) {
          med = xs[i];
          break;
        }
      }
      const middleRow = xs[Math.floor(rows / 2)];
      if (pos === med) continue;
      const cum: string[] = [];
      let c = 0;
      for (let i = 0; i < rows; i++) {
        c += fs[i];
        cum.push(`up to ${xs[i]}: ${c}`);
        if (c >= pos) break;
      }
      return {
        prompt: `${intro} What is the median?`,
        visual,
        ...intAnswer(med, [
          { value: pos, misconception: "freq-median-gave-position" },
          { value: middleRow, misconception: "freq-median-middle-row" },
        ]),
        hints: [`There are ${n} results. The middle one is number (${n} + 1) ÷ 2 = ${pos}.`, "Add down the Frequency column until you reach that position."],
        solution: [`Middle position: (${n} + 1) ÷ 2 = ${pos}.`, `Running totals: ${cum.join(", ")}.`, `Result number ${pos} is in the ${med} row, so the median = ${med}`],
      };
    }

    const fx = xs.map((x, i) => x * fs[i]);
    const totalFx = sum(fx);

    if (kind === "total") {
      return {
        prompt: `${intro} How many ${ctx.thing} is that altogether?`,
        visual,
        ...intAnswer(totalFx, [{ value: n, misconception: "freq-total-used-frequency" }]),
        hints: [`Each row: ${ctx.col.toLowerCase()} × frequency. For example, ${fs[1]} ${ctx.who} with ${xs[1]} each is ${xs[1]} × ${fs[1]} = ${fx[1]}.`, "Add up all the rows."],
        solution: [`Value × frequency: ${xs.map((x, i) => `${x} × ${fs[i]} = ${fx[i]}`).join(", ")}.`, `Total: ${fx.join(" + ")} = ${totalFx}`, `Answer: ${totalFx}`],
      };
    }

    if (kind === "range") {
      const used = xs.filter((_, i) => fs[i] > 0);
      const rg = Math.max(...used) - Math.min(...used);
      return {
        prompt: `${intro} What is the range?`,
        visual,
        ...intAnswer(rg, [
          { value: xs[rows - 1] - xs[0], misconception: "freq-range-zero-row" },
          { value: Math.max(...fs) - Math.min(...fs), misconception: "freq-range-of-frequencies" },
        ]),
        hints: ["Only count values that have a frequency of at least 1.", "Range = biggest value − smallest value."],
        solution: [`Values with a frequency: ${used[0]} up to ${used[used.length - 1]}.`, `${used[used.length - 1]} − ${used[0]} = ${rg}`, `Range = ${rg}`],
      };
    }

    // Mean, to 1 decimal place.
    const mean = totalFx / n;
    const rounded = Number(roundTo(mean, 1));
    if (Math.abs(mean - Math.round(mean)) < 1e-9) continue;
    return {
      prompt: `${intro} Work out the mean. Give your answer to 1 decimal place.`,
      visual,
      answer: { kind: "decimal", exact: mean, dp: 1 },
      wrongAnswers: cleanWrongDecimal(rounded, [
        { value: totalFx / rows, misconception: "freq-mean-divided-by-rows" },
        { value: sum(xs) / rows, misconception: "freq-mean-of-values" },
        { value: n / rows, misconception: "freq-mean-of-frequencies" },
        { value: totalFx, misconception: "mean-forgot-divide" },
      ]),
      answerHelp: "Type a number rounded to 1 decimal place, like 2.4. A calculator is fine.",
      hints: [
        `Make a third column: value × frequency. Add it up to get the total of all the results.`,
        `Then divide by the total frequency, ${n}.`,
      ],
      solution: [
        `Value × frequency: ${xs.map((x, i) => `${x} × ${fs[i]} = ${fx[i]}`).join(", ")}.`,
        `Total: ${totalFx}. Total frequency: ${n}.`,
        `${totalFx} ÷ ${n} = ${Math.round(mean * 1000) / 1000}…`,
        `Mean = ${roundTo(mean, 1)} (to 1 decimal place)`,
      ],
    };
  }
};

// ------------------------------------------------------------ scatter graphs and correlation

const SCATTER_CONTEXTS = [
  { x: "Hours of revision", y: "Test score", ux: 1, uy: 5, sign: 1, xWord: "hours of revision", yWord: "test score", more: "The more hours of revision, the higher the test score.", less: "The more hours of revision, the lower the test score." },
  { x: "Temperature (°C)", y: "Ice creams sold", ux: 2, uy: 10, sign: 1, xWord: "temperature", yWord: "ice creams sold", more: "The hotter it is, the more ice creams are sold.", less: "The hotter it is, the fewer ice creams are sold." },
  { x: "Temperature (°C)", y: "Hot chocolates sold", ux: 2, uy: 5, sign: -1, xWord: "temperature", yWord: "hot chocolates sold", more: "The hotter it is, the more hot chocolates are sold.", less: "The hotter it is, the fewer hot chocolates are sold." },
  { x: "Age of car (years)", y: "Value (£1000s)", ux: 1, uy: 2, sign: -1, xWord: "age of the car", yWord: "value", more: "The older the car, the more it is worth.", less: "The older the car, the less it is worth." },
  { x: "Shoe size", y: "Spelling test score", ux: 1, uy: 2, sign: 0, xWord: "shoe size", yWord: "spelling test score", more: "People with bigger feet get higher spelling scores.", less: "People with bigger feet get lower spelling scores." },
] as const;
type ScatterCtx = (typeof SCATTER_CONTEXTS)[number];

const CORRELATION = ["Positive correlation", "Negative correlation", "No correlation"] as const;

/** Points on the 0..10 grid following the context's trend. */
function trendPoints(r: Rng, sign: number, count: number): [number, number][] {
  const pts: [number, number][] = [];
  const xs = shuffle(r, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).slice(0, Math.min(count, 10));
  for (const x of xs) {
    let y: number;
    if (sign === 0) y = r.int(1, 10);
    else {
      const base = sign > 0 ? 0.5 + 0.85 * x : 10 - 0.85 * x;
      y = Math.max(0, Math.min(10, Math.round(base + r.int(-1, 1))));
    }
    pts.push([x, y]);
  }
  // A "no correlation" set must really have no clear trend: reject strong ones.
  return pts;
}

function correlation(pts: [number, number][]): number {
  const n = pts.length;
  const mx = sum(pts.map((p) => p[0])) / n;
  const my = sum(pts.map((p) => p[1])) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (const [x, y] of pts) {
    sxy += (x - mx) * (y - my);
    sxx += (x - mx) ** 2;
    syy += (y - my) ** 2;
  }
  return syy === 0 ? 0 : sxy / Math.sqrt(sxx * syy);
}

function scatterChart(ctx: ScatterCtx, pts: [number, number][], extra: Partial<Extract<ChartSpec, { type: "scatter" }>>): ChartSpec {
  // Points sit on a 10 × 10 grid, labelled in real units.
  return {
    type: "scatter",
    points: pts.map(([x, y]) => [x * ctx.ux, y * ctx.uy]),
    xLabel: ctx.x,
    yLabel: ctx.y,
    xMax: 10 * ctx.ux,
    yMax: 10 * ctx.uy,
    xStep: ctx.ux,
    yStep: ctx.uy,
    description: `Scatter graph of ${ctx.y.toLowerCase()} against ${ctx.x.toLowerCase()}.`,
    ...extra,
  };
}

const scatter: Gen = (r, tier) => {
  const kind = tier === 1 ? r.pick(["type", "type", "read"] as const) : r.pick(["outlier", "statement", "read"] as const);
  const ctx = r.pick(kind === "outlier" ? SCATTER_CONTEXTS.filter((c) => c.sign !== 0) : SCATTER_CONTEXTS);

  for (;;) {
    const pts = trendPoints(r, ctx.sign, tier === 1 ? 9 : 10);
    const rho = correlation(pts);
    if (ctx.sign === 0 ? Math.abs(rho) > 0.3 : ctx.sign * rho < 0.8) continue;
    const correct = ctx.sign > 0 ? 0 : ctx.sign < 0 ? 1 : 2;
    const trendWord = ["go up from left to right", "go down from left to right", "are scattered with no pattern"][correct];

    if (kind === "type") {
      return {
        prompt: `The scatter graph shows ${ctx.yWord} and ${ctx.xWord}. What type of correlation does it show?`,
        visual: { kind: "chart", chart: scatterChart(ctx, pts, { description: `Scatter graph of ${ctx.y.toLowerCase()} against ${ctx.x.toLowerCase()}. The points ${trendWord}.` }) },
        answer: { kind: "choice", options: [...CORRELATION], correctIndex: correct },
        wrongAnswers: [0, 1, 2]
          .filter((j) => j !== correct)
          .map((j) => ({ value: j, misconception: j === 2 || correct === 2 ? "scatter-none-confused" : "scatter-pos-neg-swapped" })),
        hints: ["Look at the pattern of crosses from left to right.", "Going up: positive. Going down: negative. No pattern: no correlation."],
        solution: [`The points ${trendWord}.`, `So it shows ${CORRELATION[correct].toLowerCase()}.`, `Answer: ${CORRELATION[correct]}`],
      };
    }

    if (kind === "statement") {
      const options = [ctx.more, ctx.less, `There is no relationship between ${ctx.xWord} and ${ctx.yWord}.`];
      return {
        prompt: `The scatter graph shows ${ctx.yWord} and ${ctx.xWord}. Which statement best describes the relationship?`,
        visual: { kind: "chart", chart: scatterChart(ctx, pts, { description: `Scatter graph of ${ctx.y.toLowerCase()} against ${ctx.x.toLowerCase()}. The points ${trendWord}.` }) },
        answer: { kind: "choice", options, correctIndex: correct },
        wrongAnswers: [0, 1, 2]
          .filter((j) => j !== correct)
          .map((j) => ({ value: j, misconception: j === 2 || correct === 2 ? "scatter-none-confused" : "scatter-pos-neg-swapped" })),
        hints: ["Which way do the crosses go from left to right?", "Up means both get bigger together. Down means one gets bigger as the other gets smaller."],
        solution: [`The points ${trendWord}: ${CORRELATION[correct].toLowerCase()}.`, `Answer: ${options[correct]}`],
      };
    }

    if (kind === "read") {
      const h = r.int(0, pts.length - 1);
      const chart = scatterChart(ctx, pts, { highlight: h });
      if (chart.type !== "scatter") continue;
      const [rx, ry] = chart.points[h];
      if (rx === ry) continue;
      const askX = r.next() < 0.5;
      const val = askX ? rx : ry;
      const other = askX ? ry : rx;
      const axisName = askX ? ctx.x : ctx.y;
      chart.description = `Scatter graph of ${ctx.y.toLowerCase()} against ${ctx.x.toLowerCase()}. One point is circled. It is at ${ctx.x.toLowerCase()} ${rx} and ${ctx.y.toLowerCase()} ${ry}.`;
      return {
        prompt: `Look at the circled point on the scatter graph. What is its value for "${axisName}"?`,
        visual: { kind: "chart", chart },
        ...intAnswer(val, [{ value: other, misconception: "scatter-wrong-axis" }]),
        hints: [
          askX ? "Go straight down from the circled point to the axis along the bottom." : "Go straight across from the circled point to the axis up the side.",
          askX ? `The bottom axis goes up in ${chart.xStep}s.` : `The side axis goes up in ${chart.yStep}s.`,
        ],
        solution: [askX ? `Straight down from the point to the bottom axis: ${val}.` : `Straight across from the point to the side axis: ${val}.`, `Answer: ${val}`],
      };
    }

    // Outlier: one point moved far off the trend, four points lettered.
    const out = r.int(1, pts.length - 2);
    const [ox] = pts[out];
    // Move it at least 5 squares away from where the trend says it should be, staying off the axis.
    const expected = ctx.sign > 0 ? 0.5 + 0.85 * ox : 10 - 0.85 * ox;
    const my = expected >= 5.5 ? Math.max(1, Math.round(expected - 6)) : Math.min(10, Math.round(expected + 6));
    if (Math.abs(my - expected) < 5) continue;
    const moved: [number, number] = [ox, my];
    const withOut = pts.map((p, i) => (i === out ? moved : p));
    const others = shuffle(r, [...withOut.keys()].filter((i) => i !== out)).slice(0, 3);
    const lettered = shuffle(r, [out, ...others]);
    const letters = lettered.map((i, j) => ({ i, text: "ABCD"[j] }));
    const correctIndex = lettered.indexOf(out);
    return {
      prompt: `The scatter graph shows ${ctx.yWord} and ${ctx.xWord}. Which lettered point is an outlier (doesn't fit the pattern)?`,
      visual: {
        kind: "chart",
        chart: scatterChart(ctx, withOut, {
          letters,
          description: `Scatter graph of ${ctx.y.toLowerCase()} against ${ctx.x.toLowerCase()}. Most points ${trendWord}. ${letters
            .map(({ i, text }) => `Point ${text} is at ${ctx.x.toLowerCase()} ${withOut[i][0] * ctx.ux}, ${ctx.y.toLowerCase()} ${withOut[i][1] * ctx.uy}`)
            .join(". ")}.`,
        }),
      },
      answer: { kind: "choice", options: ["A", "B", "C", "D"], correctIndex },
      wrongAnswers: [0, 1, 2, 3].filter((j) => j !== correctIndex).map((j) => ({ value: j, misconception: "scatter-outlier-on-trend" })),
      hints: [`Most points ${trendWord}.`, "Look for the lettered point that sits far away from that pattern."],
      solution: [`Most points ${trendWord}.`, `Point ${"ABCD"[correctIndex]} is far from the pattern.`, `Answer: ${"ABCD"[correctIndex]}`],
    };
  }
};

export const STATS_GENERATORS: Record<string, Gen> = {
  "stats-frequency-tables": frequencyTables,
  "stats-bar-pictograms": barPictograms,
  "stats-pie-charts": pieCharts,
  "stats-averages": averages,
  "stats-frequency-table-averages": freqAverages,
  "stats-scatter": scatter,
};
