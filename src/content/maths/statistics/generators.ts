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

import { equals, frac, show, showDecimal, type Fraction } from "@/engine/fraction";
import { roundTo } from "@/engine/marking";
import type { Rng } from "@/engine/random";
import type { ChartSpec, Question, TableSpec } from "@/engine/types";

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

// ------------------------------------------------------------ shared helpers for the newer lessons

const FRACTION_HELP = "Type a fraction like 3/8. It doesn't need simplifying.";
const PROB_HELP = "Type a fraction like 3/8, a decimal like 0.4 or a percentage like 40%. Fractions don't need simplifying.";

/** Fraction answers: keep wrong answers that are positive, different from the right one, and not repeated. */
function cleanWrongFrac(correct: Fraction, wrong: { value: Fraction; misconception: string }[]): Wrong[] {
  const kept: Wrong[] = [];
  for (const w of wrong) {
    if (w.value.n <= 0 || w.value.d <= 0 || equals(w.value, correct)) continue;
    if (kept.some((k) => equals(k.value as Fraction, w.value))) continue;
    kept.push(w);
  }
  return kept;
}

/** A multiple-choice answer: options shuffled, each wrong option mapped to its misconception (if any). */
function choiceAnswer(r: Rng, correct: string, wrong: { text: string; misconception?: string }[]) {
  const seen = new Set([correct]);
  const ws = wrong.filter((w) => !seen.has(w.text) && (seen.add(w.text), true));
  const options = shuffle(r, [correct, ...ws.map((w) => w.text)]);
  return {
    answer: { kind: "choice" as const, options, correctIndex: options.indexOf(correct) },
    wrongAnswers: ws.filter((w) => w.misconception).map((w) => ({ value: options.indexOf(w.text), misconception: w.misconception! })),
  };
}

// ------------------------------------------------------------ two-way tables

const TWO_WAY = [
  {
    rows: ["Boys", "Girls"],
    cols: ["Walk", "Bus", "Car"],
    who: ["boys", "girls"],
    one: ["a boy", "a girl"],
    what: ["walk to school", "come by bus", "come by car"],
    does: ["walks to school", "comes by bus", "comes by car"],
    people: "students",
    title: "how some students travel to school",
  },
  {
    rows: ["Year 7", "Year 8"],
    cols: ["Maths", "English", "Science"],
    who: ["Year 7 students", "Year 8 students"],
    one: ["a Year 7 student", "a Year 8 student"],
    what: ["chose Maths", "chose English", "chose Science"],
    does: ["chose Maths", "chose English", "chose Science"],
    people: "students",
    title: "the favourite subject of some students",
  },
  {
    rows: ["Adults", "Children"],
    cols: ["Swim", "Gym", "Tennis"],
    who: ["adults", "children"],
    one: ["an adult", "a child"],
    what: ["chose swimming", "chose the gym", "chose tennis"],
    does: ["chose swimming", "chose the gym", "chose tennis"],
    people: "people",
    title: "the activity people chose at a leisure centre",
  },
] as const;

const TWO_WAY_WORDS = [
  { people: "students in a club", rows: ["boys", "girls"], has: "have a pet", hasNot: "do not have a pet", cols: ["Pet", "No pet"], heads: ["Boys", "Girls"] },
  { people: "people at a cinema", rows: ["adults", "children"], has: "bought popcorn", hasNot: "did not buy popcorn", cols: ["Popcorn", "No popcorn"], heads: ["Adults", "Children"] },
  { people: "students in Year 9", rows: ["boys", "girls"], has: "wear glasses", hasNot: "do not wear glasses", cols: ["Glasses", "No glasses"], heads: ["Boys", "Girls"] },
] as const;

function twoWayTable(rows: readonly string[], cols: readonly string[], cells: (number | string)[][], rowT: (number | string)[], colT: (number | string)[], grand: number | string, description: string, highlight?: [number, number][]): TableSpec {
  return {
    corner: "",
    columns: [...cols, "Total"],
    rows: [...rows.map((h, i) => ({ head: h, cells: [...cells[i].map(String), String(rowT[i])] })), { head: "Total", cells: [...colT.map(String), String(grand)] }],
    highlight,
    description,
  };
}
const describeTable = (t: TableSpec) =>
  `${t.rows.map((r) => `${r.head}: ${r.cells.map((c, j) => `${t.columns[j]} ${c === "?" ? "missing" : c === "x" ? "x (the number to find)" : c}`).join(", ")}`).join(". ")}.`;

const twoWayTables: Gen = (r, tier) => {
  const ctx = r.pick(TWO_WAY);
  const cells = [0, 1].map(() => [0, 1, 2].map(() => (tier === 1 ? r.int(3, 19) : r.int(4, 28))));
  const rowT = cells.map((row) => sum(row));
  const colT = [0, 1, 2].map((j) => cells[0][j] + cells[1][j]);
  const grand = sum(rowT);
  const i = r.int(0, 1);
  const j = r.int(0, 2);
  const v = cells[i][j];
  const table = (cs: (number | string)[][], rt: (number | string)[], ct: (number | string)[], g: number | string, hl?: [number, number][]) => {
    const t = twoWayTable(ctx.rows, ctx.cols, cs, rt, ct, g, "", hl);
    t.description = `Two-way table of ${ctx.title}. ${describeTable(t)}`;
    return { kind: "table" as const, table: t };
  };
  const othersInRow = cells[i].filter((_, k) => k !== j);

  if (tier === 1) {
    if (r.next() < 0.5) {
      return {
        prompt: `The two-way table shows ${ctx.title}. How many ${ctx.who[i]} ${ctx.what[j]}?`,
        visual: table(cells, rowT, colT, grand),
        ...intAnswer(v, [
          { value: rowT[i], misconception: "twoway-gave-total" },
          { value: colT[j], misconception: "twoway-gave-total" },
          { value: cells[1 - i][j], misconception: "twoway-wrong-cell" },
        ]),
        hints: [`Find the row for ${ctx.rows[i]} and the column for ${ctx.cols[j]}.`, "The answer is in the cell where they cross, not in a Total."],
        solution: [`Row: ${ctx.rows[i]}. Column: ${ctx.cols[j]}.`, `The cell where they meet says ${v}.`, `Answer: ${v}`],
      };
    }
    const shown = cells.map((row, a) => row.map((c, b) => (a === i && b === j ? "?" : c)));
    return {
      prompt: `The two-way table shows ${ctx.title}. One number is missing. How many ${ctx.who[i]} ${ctx.what[j]}?`,
      visual: table(shown, rowT, colT, grand, [[i, j]]),
      ...intAnswer(v, [
        { value: sum(othersInRow), misconception: "twoway-added-known" },
        { value: grand - sum(othersInRow), misconception: "twoway-used-grand-total" },
      ]),
      hints: [`The ${ctx.rows[i]} row adds up to ${rowT[i]}.`, `Take the other numbers in that row away from ${rowT[i]}.`],
      solution: [`The ${ctx.rows[i]} row adds up to ${rowT[i]}.`, `${rowT[i]} − ${othersInRow.join(" − ")} = ${v}`, `Answer: ${v}`],
    };
  }

  const kind = r.pick(["two-step", "fraction", "random", "words"] as const);
  if (kind === "two-step") {
    // The cell to find is x. Its row total is missing too, so find that first from the grand total.
    const shown = cells.map((row, a) => row.map((c, b) => (a === i && b === j ? "x" : c)));
    const ct = colT.map((c, b) => (b === j ? "?" : c));
    const rt = rowT.map((t, a) => (a === i ? "?" : t));
    return {
      prompt: `Some numbers are missing from this two-way table of ${ctx.title}. Work out the value of x.`,
      visual: table(shown, rt, ct, grand, [[i, j]]),
      ...intAnswer(v, [
        { value: grand - sum(othersInRow), misconception: "twoway-used-grand-total" },
        { value: rowT[i], misconception: "twoway-gave-total" },
        { value: sum(othersInRow), misconception: "twoway-added-known" },
      ]),
      hints: [`You can't find x straight away. First find the total for ${ctx.rows[i]}: the grand total is ${grand}.`, `${ctx.rows[i]} total = ${grand} − ${rowT[1 - i]}. Then take the other numbers in the ${ctx.rows[i]} row away from it.`],
      solution: [
        `${ctx.rows[i]} total: ${grand} − ${rowT[1 - i]} = ${rowT[i]}.`,
        `x = ${rowT[i]} − ${othersInRow.join(" − ")} = ${v}`,
        `Answer: ${v}`,
      ],
    };
  }
  if (kind === "fraction") {
    const ans = frac(v, rowT[i]);
    return {
      prompt: `The two-way table shows ${ctx.title}. What fraction of the ${ctx.who[i]} ${ctx.what[j]}?`,
      visual: table(cells, rowT, colT, grand),
      answer: { kind: "fraction", value: ans, requireSimplest: false },
      wrongAnswers: cleanWrongFrac(ans, [
        { value: frac(v, grand), misconception: "twoway-wrong-total" },
        { value: frac(v, colT[j]), misconception: "twoway-wrong-total" },
      ]),
      answerHelp: FRACTION_HELP,
      hints: [`"Of the ${ctx.who[i]}" means out of all the ${ctx.who[i]}: that's the ${ctx.rows[i]} total, ${rowT[i]}.`, `How many ${ctx.who[i]} ${ctx.what[j]}? That goes on top.`],
      solution: [`${ctx.rows[i]} total: ${rowT[i]}.`, `${ctx.rows[i]} who ${ctx.what[j]}: ${v}.`, `Answer: ${show(ans)}`],
    };
  }
  if (kind === "random") {
    const ans = frac(v, grand);
    const person = ctx.people === "students" ? "student" : "person";
    return {
      prompt: `The two-way table shows ${ctx.title}. One ${person} is picked at random. What is the probability that they are ${ctx.one[i]} who ${ctx.does[j]}?`,
      visual: table(cells, rowT, colT, grand),
      answer: { kind: "fraction", value: ans, requireSimplest: false, percentAllowed: true },
      wrongAnswers: cleanWrongFrac(ans, [
        { value: frac(v, rowT[i]), misconception: "twoway-wrong-total" },
        { value: frac(v, colT[j]), misconception: "twoway-wrong-total" },
      ]),
      answerHelp: PROB_HELP,
      hints: [`The ${person} is picked from everyone, so the bottom of the fraction is the grand total, ${grand}.`, `Find the cell for ${ctx.rows[i]} and ${ctx.cols[j]}: that goes on top.`],
      solution: [`Everyone: ${grand}.`, `${ctx.rows[i]} and ${ctx.cols[j]}: ${v}.`, `Answer: ${show(ans)}`],
    };
  }
  // Built from words: no table given.
  const w = r.pick(TWO_WAY_WORDS);
  for (;;) {
    const a = r.int(6, 24); // first group, has
    const b = r.int(4, 20); // first group, has not
    const c = r.int(6, 24); // second group, has
    const d = r.int(4, 20); // second group, has not
    const T = a + b + c + d;
    const first = a + b;
    const has = a + c;
    if (new Set([d, b, T - has, first, T - first]).size < 5) continue;
    return {
      prompt: `There are ${T} ${w.people}. ${first} of them are ${w.rows[0]}. ${a} of the ${w.rows[0]} ${w.has}. ${has} of the ${w.people.split(" ")[0]} ${w.has} altogether. How many ${w.rows[1]} ${w.hasNot}?`,
      ...intAnswer(d, [
        { value: T - has, misconception: "twoway-gave-total" },
        { value: b, misconception: "twoway-wrong-cell" },
        { value: T - first, misconception: "twoway-gave-total" },
      ]),
      hints: [
        `Draw a two-way table: ${w.heads[0]} and ${w.heads[1]} down the side, ${w.cols[0]} and ${w.cols[1]} across the top, with totals. Put in the numbers you know.`,
        `Find the ${w.rows[1]} total first (${T} − ${first}), and how many ${w.rows[1]} ${w.has} (${has} − ${a}).`,
      ],
      solution: [
        `${w.heads[1]}: ${T} − ${first} = ${T - first}.`,
        `${w.heads[1]} who ${w.has}: ${has} − ${a} = ${c}.`,
        `${w.heads[1]} who ${w.hasNot}: ${T - first} − ${c} = ${d}.`,
        `Answer: ${d}`,
      ],
    };
  }
};

// ------------------------------------------------------------ line graphs and time series

interface LineCtx {
  labels: string[];
  full: string[];
  xLabel: string;
  yLabel: string;
  measure: string;
  /** "How many ice creams were sold on Monday?" */
  ask: (when: string) => string;
  /** "on Monday", "in March", "at 11am" */
  when: (i: number) => string;
  yStep: number;
  unit: number;
  lo: number;
  hi: number;
  trends: ("up" | "down" | "none" | "seasonal")[];
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const LINE_CONTEXTS: LineCtx[] = [
  {
    labels: DAYS.map((d) => d.slice(0, 3)),
    full: DAYS,
    xLabel: "Day",
    yLabel: "Ice creams sold",
    measure: "the number of ice creams sold",
    ask: (w) => `How many ice creams were sold ${w}?`,
    when: (i) => `on ${DAYS[i]}`,
    yStep: 10,
    unit: 5,
    lo: 10,
    hi: 90,
    trends: ["up", "down", "none"],
  },
  {
    labels: MONTHS.slice(1, 8).map((m) => m.slice(0, 3)),
    full: MONTHS.slice(1, 8),
    xLabel: "Month",
    yLabel: "Temperature (°C)",
    measure: "the temperature",
    ask: (w) => `What was the midday temperature, in °C, ${w}?`,
    when: (i) => `in ${MONTHS[i + 1]}`,
    yStep: 2,
    unit: 1,
    lo: 2,
    hi: 22,
    trends: ["up"],
  },
  {
    labels: ["9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm"],
    full: ["9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm"],
    xLabel: "Time",
    yLabel: "People in the café",
    measure: "the number of people in the café",
    ask: (w) => `How many people were in the café ${w}?`,
    when: (i) => `at ${["9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm"][i]}`,
    yStep: 5,
    unit: 5,
    lo: 5,
    hi: 45,
    trends: ["up", "down", "none"],
  },
  {
    labels: ["Q1", "Q2", "Q3", "Q4", "Q1", "Q2", "Q3", "Q4"],
    full: ["Q1 of 2024", "Q2 of 2024", "Q3 of 2024", "Q4 of 2024", "Q1 of 2025", "Q2 of 2025", "Q3 of 2025", "Q4 of 2025"],
    xLabel: "Quarter (2024, then 2025)",
    yLabel: "Visitors (thousands)",
    measure: "the number of visitors (in thousands)",
    ask: (w) => `How many thousand visitors were there ${w}?`,
    when: (i) => `in ${["Q1 of 2024", "Q2 of 2024", "Q3 of 2024", "Q4 of 2024", "Q1 of 2025", "Q2 of 2025", "Q3 of 2025", "Q4 of 2025"][i]}`,
    yStep: 2,
    unit: 1,
    lo: 2,
    hi: 20,
    trends: ["seasonal"],
  },
];

const TREND_OPTIONS = ["Overall, it goes up over time", "Overall, it goes down over time", "There is no clear trend: it goes up and down"] as const;

/** Least-squares slope of values against their position. */
function slope(vs: number[]): number {
  const n = vs.length;
  const mx = (n - 1) / 2;
  const my = sum(vs) / n;
  let a = 0;
  let b = 0;
  vs.forEach((v, i) => {
    a += (i - mx) * (v - my);
    b += (i - mx) ** 2;
  });
  return a / b;
}

function lineValues(r: Rng, ctx: LineCtx, trend: LineCtx["trends"][number]): number[] {
  const n = ctx.labels.length;
  const steps = Math.round((ctx.hi - ctx.lo) / ctx.unit); // how many units the scale covers
  for (;;) {
    let vs: number[];
    if (trend === "seasonal") {
      // Low in winter (Q1, Q4), highest in summer (Q3), a little higher in the second year.
      const base = [r.int(2, 4), r.int(5, 8), r.int(11, 14), r.int(4, 6)];
      vs = Array.from({ length: n }, (_, i) => base[i % 4] + (i >= 4 ? r.int(1, 3) : 0));
    } else {
      const start = trend === "up" ? r.int(0, Math.floor(steps / 3)) : trend === "down" ? r.int(Math.ceil((2 * steps) / 3), steps) : r.int(Math.floor(steps / 3), Math.ceil((2 * steps) / 3));
      const drift = trend === "up" ? (steps * 0.6) / (n - 1) : trend === "down" ? -(steps * 0.6) / (n - 1) : 0;
      vs = Array.from({ length: n }, (_, i) => Math.round(start + drift * i + r.int(-2, 2)));
    }
    vs = vs.map((k) => ctx.lo + Math.max(0, Math.min(steps, k)) * ctx.unit);
    const s = slope(vs) / ctx.unit;
    if (trend === "up" && s < 0.6) continue;
    if (trend === "down" && s > -0.6) continue;
    if (trend === "none" && (Math.abs(s) > 0.25 || Math.max(...vs) - Math.min(...vs) < 4 * ctx.unit)) continue;
    // Neighbouring points always differ, so every change can be asked about.
    if (vs.some((v, i) => i > 0 && v === vs[i - 1])) continue;
    return vs;
  }
}

const timeSeries: Gen = (r, tier) => {
  const ctx = r.pick(LINE_CONTEXTS);
  const trend = r.pick(ctx.trends);
  const vs = lineValues(r, ctx, trend);
  const n = vs.length;
  const visual = {
    kind: "chart" as const,
    chart: {
      type: "line" as const,
      labels: ctx.labels,
      values: vs,
      xLabel: ctx.xLabel,
      yLabel: ctx.yLabel,
      yStep: ctx.yStep,
      description: `Line graph of ${ctx.yLabel.toLowerCase()} by ${ctx.xLabel.toLowerCase()}. ${ctx.full.map((f, i) => `${f}: ${vs[i]}`).join(", ")}.`,
    },
  };
  const minorUnit = ctx.yStep % 2 === 0 ? ctx.yStep / 2 : ctx.yStep;
  const scaleHint = `The scale goes up in ${ctx.yStep}s${ctx.yStep % 2 === 0 && ctx.yStep > 2 ? `, and each dashed line is half-way (${ctx.yStep / 2})` : ""}.`;
  const kinds = tier === 1 ? (["read", "change", "highest"] as const) : ctx.trends[0] === "seasonal" ? (["seasonal", "rise", "diff"] as const) : (["trend", "rise", "diff"] as const);
  const kind = r.pick(kinds);

  if (kind === "read") {
    const i = r.int(0, n - 1);
    return {
      prompt: `The line graph shows ${ctx.measure}. ${ctx.ask(ctx.when(i))}`,
      visual,
      ...intAnswer(vs[i], [
        ...(minorUnit > 1 ? [{ value: vs[i] / minorUnit, misconception: "bar-counted-gridlines" }] : []),
        ...(i > 0 ? [{ value: vs[i - 1], misconception: "line-misread-point" }] : []),
        ...(i < n - 1 ? [{ value: vs[i + 1], misconception: "line-misread-point" }] : []),
      ]),
      hints: [`Find ${ctx.labels[i]} along the bottom and go straight up to the cross.`, `Then go straight across to the scale. ${scaleHint}`],
      solution: [`Up from ${ctx.labels[i]} to the cross, then across to the scale.`, `It is at ${vs[i]}.`, `Answer: ${vs[i]}`],
    };
  }
  if (kind === "change") {
    const i = r.int(0, n - 2);
    const d = vs[i + 1] - vs[i];
    const dir = d > 0 ? "go up" : "go down";
    return {
      prompt: `The line graph shows ${ctx.measure}. By how much did ${ctx.measure} ${dir} from ${ctx.full[i]} to ${ctx.full[i + 1]}?`,
      visual,
      ...intAnswer(Math.abs(d), [
        { value: vs[i + 1], misconception: "line-gave-value" },
        { value: vs[i], misconception: "line-gave-value" },
        { value: vs[i] + vs[i + 1], misconception: "freq-diff-added" },
      ]),
      hints: [`Read both values: ${ctx.labels[i]} and ${ctx.labels[i + 1]}. ${scaleHint}`, "The change is the difference: bigger value − smaller value."],
      solution: [`${ctx.labels[i]}: ${vs[i]}. ${ctx.labels[i + 1]}: ${vs[i + 1]}.`, `${Math.max(vs[i], vs[i + 1])} − ${Math.min(vs[i], vs[i + 1])} = ${Math.abs(d)}`, `Answer: ${Math.abs(d)}`],
    };
  }
  if (kind === "highest") {
    const max = Math.max(...vs);
    if (vs.filter((v) => v === max).length > 1) return timeSeries(r, tier);
    const top = vs.indexOf(max);
    const others = shuffle(r, [...vs.keys()].filter((k) => k !== top)).slice(0, 3);
    const { answer, wrongAnswers } = choiceAnswer(
      r,
      ctx.full[top],
      others.map((k) => ({ text: ctx.full[k], misconception: "line-misread-point" })),
    );
    return {
      prompt: `The line graph shows ${ctx.measure}. When was it highest?`,
      visual,
      answer,
      wrongAnswers,
      hints: ["Look for the highest cross on the graph.", "Go straight down from it to read the label."],
      solution: [`The highest cross is at ${max}.`, `Straight down from it is ${ctx.labels[top]}.`, `Answer: ${ctx.full[top]}`],
    };
  }
  if (kind === "trend") {
    const correct = trend === "up" ? 0 : trend === "down" ? 1 : 2;
    const { answer, wrongAnswers } = choiceAnswer(
      r,
      TREND_OPTIONS[correct],
      [0, 1, 2].filter((k) => k !== correct).map((k) => ({ text: TREND_OPTIONS[k], misconception: "line-trend-confused" })),
    );
    return {
      prompt: `The line graph shows ${ctx.measure}. Which sentence best describes the trend?`,
      visual,
      answer,
      wrongAnswers,
      hints: ["Ignore the small ups and downs. Compare the first few points with the last few.", "Is the line mostly going up, mostly going down, or neither?"],
      solution: [
        `It starts at ${vs[0]} and ends at ${vs[n - 1]}${trend === "none" ? ", going up and down in between with no clear direction" : ""}.`,
        `Answer: ${TREND_OPTIONS[correct]}`,
      ],
    };
  }
  if (kind === "seasonal") {
    const { answer, wrongAnswers } = choiceAnswer(
      r,
      "Q3",
      ["Q1", "Q2", "Q4"].map((q) => ({ text: q, misconception: "line-misread-point" })),
    );
    return {
      prompt: `The line graph shows the number of visitors to a theme park each quarter (three months) for two years. In which quarter is the number of visitors highest each year?`,
      visual,
      answer,
      wrongAnswers,
      hints: ["Look at 2024 (the first four points), then 2025 (the last four).", "Which quarter has the highest point both times? This repeating pattern is called seasonal."],
      solution: [`2024: highest in Q3 (${vs[2]}). 2025: highest in Q3 (${vs[6]}).`, "The pattern repeats each year: busiest in summer.", "Answer: Q3"],
    };
  }
  if (kind === "rise") {
    const rises = vs.slice(1).map((v, i) => v - vs[i]);
    const best = Math.max(...rises);
    if (best <= 0 || rises.filter((x) => x === best).length > 1) return timeSeries(r, tier);
    const bi = rises.indexOf(best);
    const name = (i: number) => `${ctx.full[i]} to ${ctx.full[i + 1]}`;
    const topPoint = vs.indexOf(Math.max(...vs));
    const others = shuffle(r, [...rises.keys()].filter((k) => k !== bi)).slice(0, 3);
    // If the interval that ends at the highest point isn't the biggest rise, offer it: it's the classic slip.
    if (topPoint > 0 && topPoint - 1 !== bi && !others.includes(topPoint - 1)) others[0] = topPoint - 1;
    const { answer, wrongAnswers } = choiceAnswer(
      r,
      name(bi),
      others.map((k) => ({ text: name(k), misconception: k === topPoint - 1 ? "line-biggest-value-not-change" : "line-misread-point" })),
    );
    return {
      prompt: `The line graph shows ${ctx.measure}. Between which two neighbouring points did it go up the most?`,
      visual,
      answer,
      wrongAnswers,
      hints: ["The biggest rise is the steepest part of the line going up, not the highest point.", "Work out each rise: later value − earlier value."],
      solution: [`The rises are: ${rises.map((x, i) => (x > 0 ? `${ctx.labels[i]}→${ctx.labels[i + 1]} +${x}` : null)).filter(Boolean).join(", ")}.`, `The biggest is ${best}.`, `Answer: ${name(bi)}`],
    };
  }
  // diff: highest minus lowest
  const max = Math.max(...vs);
  const min = Math.min(...vs);
  const hi = vs.indexOf(max);
  const lo = vs.indexOf(min);
  return {
    prompt: `The line graph shows ${ctx.measure}. What is the difference between the highest and the lowest value on the graph?`,
    visual,
    ...intAnswer(max - min, [
      { value: max, misconception: "range-gave-largest" },
      { value: max + min, misconception: "freq-diff-added" },
      { value: Math.abs(vs[n - 1] - vs[0]), misconception: "range-not-ordered" },
    ]),
    hints: ["Find the highest cross and the lowest cross, and read their values.", "Difference = highest − lowest."],
    solution: [`Highest: ${max} (${ctx.labels[hi]}). Lowest: ${min} (${ctx.labels[lo]}).`, `${max} − ${min} = ${max - min}`, `Answer: ${max - min}`],
  };
};

// ------------------------------------------------------------ estimating the mean from grouped data

const GROUPED_CONTEXTS = [
  { v: "t", head: "Time (t minutes)", what: "how long some students took to finish a puzzle", widths: [4, 10], start: [0] },
  { v: "h", head: "Height (h cm)", what: "the heights of some plants", widths: [10, 20], start: [0, 10, 20] },
  { v: "m", head: "Mass (m kg)", what: "the masses of some parcels", widths: [4, 10], start: [0, 20] },
  { v: "d", head: "Distance (d km)", what: "how far some people travel to work", widths: [4, 10, 20], start: [0] },
] as const;

const WHY_ESTIMATE = "Because we don't know the exact values, only which class each one is in";
const WHY_WRONG = ["Because some of the frequencies might be wrong", "Because the answer has been rounded", "Because the classes are different sizes"];

const groupedMean: Gen = (r, tier) => {
  const ctx = r.pick(GROUPED_CONTEXTS);
  const w = r.pick(ctx.widths);
  const s = r.pick(ctx.start);
  const k = r.pick([4, 5]);
  const ends = Array.from({ length: k + 1 }, (_, i) => s + i * w);
  const label = (i: number) => `${ends[i]} < ${ctx.v} ≤ ${ends[i + 1]}`;
  const mids = ends.slice(0, k).map((a) => a + w / 2);
  for (;;) {
    const fs = Array.from({ length: k }, () => r.int(1, 15));
    const n = sum(fs);
    const maxF = Math.max(...fs);
    if (fs.filter((f) => f === maxF).length > 1) continue;
    const modal = fs.indexOf(maxF);
    const visual = {
      kind: "chart" as const,
      chart: tableChart(
        [ctx.head, "Frequency"],
        fs.map((f, i) => [label(i), f]),
        `Grouped frequency table of ${ctx.what}. ${fs.map((f, i) => `${ends[i]} to ${ends[i + 1]}: frequency ${f}`).join(". ")}.`,
      ),
    };
    const intro = `The table shows ${ctx.what}.`;
    const kind = tier === 1 ? r.pick(["midpoint", "modal", "fx"] as const) : r.pick(["mean", "mean", "median", "why"] as const);

    if (kind === "midpoint") {
      const i = r.int(0, k - 1);
      return {
        prompt: `${intro} What is the midpoint of the class ${label(i)}?`,
        visual,
        ...intAnswer(mids[i], [
          { value: ends[i + 1], misconception: "grouped-midpoint-end" },
          { value: ends[i], misconception: "grouped-midpoint-end" },
          { value: w, misconception: "grouped-midpoint-width" },
        ]),
        hints: ["The midpoint is half-way between the two ends of the class.", `Add the ends and divide by 2: (${ends[i]} + ${ends[i + 1]}) ÷ 2.`],
        solution: [`The class goes from ${ends[i]} to ${ends[i + 1]}.`, `(${ends[i]} + ${ends[i + 1]}) ÷ 2 = ${mids[i]}`, `Answer: ${mids[i]}`],
      };
    }
    if (kind === "modal") {
      const { answer, wrongAnswers } = choiceAnswer(
        r,
        label(modal),
        [...fs.keys()].filter((i) => i !== modal).map((i) => ({ text: label(i), misconception: "grouped-modal-wrong" })),
      );
      return {
        prompt: `${intro} Which is the modal class?`,
        visual,
        answer,
        wrongAnswers,
        hints: ["The modal class is the class with the most results in it.", "Look down the frequency column for the biggest number."],
        solution: [`The biggest frequency is ${maxF}.`, `It belongs to the class ${label(modal)}.`, `Answer: ${label(modal)}`],
      };
    }
    if (kind === "fx") {
      const i = r.int(0, k - 1);
      const fx = fs[i] * mids[i];
      return {
        prompt: `${intro} To estimate the mean, you need frequency × midpoint for each class. Work it out for the class ${label(i)}.`,
        visual,
        ...intAnswer(fx, [
          { value: fs[i] * ends[i + 1], misconception: "grouped-mean-used-ends" },
          { value: fs[i] * ends[i], misconception: "grouped-mean-used-ends" },
          { value: mids[i], misconception: "grouped-midpoint-width" },
        ]),
        hints: [`First find the midpoint: (${ends[i]} + ${ends[i + 1]}) ÷ 2.`, `Then multiply it by the frequency, ${fs[i]}.`],
        solution: [`Midpoint: (${ends[i]} + ${ends[i + 1]}) ÷ 2 = ${mids[i]}.`, `${fs[i]} × ${mids[i]} = ${fx}`, `Answer: ${fx}`],
      };
    }
    if (kind === "median") {
      // The middle result(s) must sit in one class, and that class must not be the middle row.
      const lowPos = Math.floor((n + 1) / 2);
      const highPos = Math.ceil((n + 1) / 2);
      const classOf = (pos: number) => {
        let c = 0;
        for (let i = 0; i < k; i++) {
          c += fs[i];
          if (pos <= c) return i;
        }
        return k - 1;
      };
      const mc = classOf(lowPos);
      if (classOf(highPos) !== mc) continue;
      const middleRow = Math.floor(k / 2);
      const run: number[] = [];
      fs.reduce((a, f) => (run.push(a + f), a + f), 0);
      const { answer, wrongAnswers } = choiceAnswer(
        r,
        label(mc),
        [...fs.keys()].filter((i) => i !== mc).map((i) => ({ text: label(i), misconception: i === middleRow ? "grouped-median-middle-row" : i === modal ? "grouped-modal-wrong" : undefined })),
      );
      const pos = n % 2 === 1 ? `the ${lowPos}${ordSuffix(lowPos)} result` : `between the ${lowPos}${ordSuffix(lowPos)} and ${highPos}${ordSuffix(highPos)} results`;
      return {
        prompt: `${intro} Which class contains the median?`,
        visual,
        answer,
        wrongAnswers,
        hints: [`There are ${n} results. The median is the middle one: (${n} + 1) ÷ 2 = ${(n + 1) / 2}.`, "Add up the frequencies from the top until you reach that position."],
        solution: [`Total: ${n}. The median is ${pos}.`, `Running totals: ${run.join(", ")}.`, `That position is in the class ${label(mc)}.`, `Answer: ${label(mc)}`],
      };
    }
    if (kind === "why") {
      const { answer, wrongAnswers } = choiceAnswer(
        r,
        WHY_ESTIMATE,
        WHY_WRONG.map((t) => ({ text: t, misconception: "grouped-why-estimate" })),
      );
      return {
        prompt: `${intro} Sam uses the midpoints to work out the mean. Why is Sam's answer only an estimate?`,
        visual,
        answer,
        wrongAnswers,
        hints: ["Can you see the real value of each result in the table?", "Using the midpoint is a best guess for every value in the class."],
        solution: ["The table only tells us which class each result is in, not its exact value.", "So the midpoints are a best guess, and the mean is an estimate.", `Answer: ${WHY_ESTIMATE}`],
      };
    }
    // Estimate the mean, to 1 decimal place.
    const fx = fs.map((f, i) => f * mids[i]);
    const totalFx = sum(fx);
    const mean = totalFx / n;
    const rounded = Number(roundTo(mean, 1));
    return {
      prompt: `${intro} Work out an estimate for the mean. Give your answer to 1 decimal place.`,
      visual,
      answer: { kind: "decimal", exact: mean, dp: 1 },
      wrongAnswers: cleanWrongDecimal(rounded, [
        { value: sum(fs.map((f, i) => f * ends[i + 1])) / n, misconception: "grouped-mean-used-ends" },
        { value: sum(fs.map((f, i) => f * ends[i])) / n, misconception: "grouped-mean-used-ends" },
        { value: totalFx / k, misconception: "freq-mean-divided-by-rows" },
        { value: sum(mids) / k, misconception: "freq-mean-of-values" },
        { value: totalFx, misconception: "mean-forgot-divide" },
      ]),
      answerHelp: "Type a number rounded to 1 decimal place, like 23.4. A calculator is fine.",
      hints: ["Add two columns: the midpoint of each class, then frequency × midpoint.", `Add up the frequency × midpoint column, then divide by the total frequency, ${n}.`],
      solution: [
        `Midpoints: ${mids.join(", ")}.`,
        `Frequency × midpoint: ${fs.map((f, i) => `${f} × ${mids[i]} = ${fx[i]}`).join(", ")}.`,
        `Total: ${totalFx}. Total frequency: ${n}.`,
        `${totalFx} ÷ ${n} = ${Math.round(mean * 1000) / 1000}${Number.isInteger(mean * 1000) ? "" : "…"}`,
        `Estimated mean = ${roundTo(mean, 1)}`,
      ],
    };
  }
};

function ordSuffix(n: number): string {
  if (n % 100 >= 11 && n % 100 <= 13) return "th";
  return ["th", "st", "nd", "rd"][n % 10] ?? "th";
}

// ------------------------------------------------------------ comparing data sets

const COMPARE_CONTEXTS = [
  { a: "Class A", b: "Class B", what: "test scores (out of 50)", single: "score", plural: "scores", win: "did better", lowGood: false, lo: 18, hi: 48 },
  { a: "Team Red", b: "Team Blue", what: "goals scored in each match", single: "number of goals", plural: "goals", win: "scored more goals", lowGood: false, lo: 0, hi: 7 },
  { a: "Amir", b: "Beth", what: "times to run 100 m, in seconds", single: "time", plural: "times", win: "was faster", lowGood: true, lo: 12, hi: 22 },
  { a: "Shop X", b: "Shop Y", what: "numbers of sandwiches sold each day", single: "number sold", plural: "sales", win: "sold more", lowGood: false, lo: 20, hi: 60 },
] as const;

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length / 2;
  return s.length % 2 ? s[Math.floor(m)] : (s[m - 1] + s[m]) / 2;
}
const fmt = (x: number) => (Number.isInteger(x) ? String(x) : String(Math.round(x * 100) / 100));

const compare: Gen = (r, tier) => {
  const ctx = r.pick(COMPARE_CONTEXTS);
  const lowNote = ctx.lowGood ? " (In a race, a lower time is better.)" : "";
  const avgWinner = (ma: number, mb: number) => ((ma < mb) === ctx.lowGood ? ctx.a : ctx.b);
  const other = (x: string) => (x === ctx.a ? ctx.b : ctx.a);
  const avgSentence = (who: string, avg: string, dir: "higher" | "lower") => `On average, ${who} ${ctx.win}, because their ${avg} ${ctx.single} is ${dir}.`;
  const spreadSentence = (who: string, dir: "smaller" | "bigger") => `${who}'s ${ctx.plural} were more consistent, because their range is ${dir}.`;

  if (tier === 1) {
    const avgName = r.pick(["mean", "median"] as const);
    let ma: number, mb: number, ra: number, rb: number;
    do {
      ma = r.int(ctx.lo + 2, ctx.hi - 2);
      mb = r.int(ctx.lo + 2, ctx.hi - 2);
      ra = r.int(2, Math.max(4, Math.round((ctx.hi - ctx.lo) / 2)));
      rb = r.int(2, Math.max(4, Math.round((ctx.hi - ctx.lo) / 2)));
    } while (ma === mb || ra === rb);
    const visual = {
      kind: "chart" as const,
      chart: tableChart(["", cap(avgName), "Range"], [[ctx.a, ma, ra], [ctx.b, mb, rb]], `Table. ${ctx.a}: ${avgName} ${ma}, range ${ra}. ${ctx.b}: ${avgName} ${mb}, range ${rb}.`),
    };
    const winner = avgWinner(ma, mb);
    const loser = other(winner);
    const consistent = ra < rb ? ctx.a : ctx.b;
    const intro = `The table shows the ${avgName} and range of the ${ctx.what} for ${ctx.a} and ${ctx.b}.${lowNote}`;
    if (r.next() < 0.5) {
      const correct = avgSentence(winner, avgName, ctx.lowGood ? "lower" : "higher");
      const { answer, wrongAnswers } = choiceAnswer(r, correct, [
        { text: avgSentence(loser, avgName, ctx.lowGood ? "higher" : "lower"), misconception: ctx.lowGood ? "compare-lower-better" : "compare-reversed" },
        { text: `On average, ${other(consistent)} ${ctx.win}, because their range is bigger.`, misconception: "compare-range-as-average" },
        { text: avgSentence(loser, avgName, ctx.lowGood ? "lower" : "higher"), misconception: "compare-reversed" },
      ]);
      return {
        prompt: `${intro} Which sentence compares the averages correctly?`,
        visual,
        answer,
        wrongAnswers,
        hints: [`Compare the ${avgName}s: ${ma} and ${mb}.`, ctx.lowGood ? "For times, the lower average is better." : "The bigger average did better on average."],
        solution: [`${ctx.a}'s ${avgName} is ${ma}. ${ctx.b}'s ${avgName} is ${mb}.`, `${winner}'s is ${ctx.lowGood ? "lower" : "higher"}, so ${winner} ${ctx.win} on average.`, `Answer: ${correct}`],
      };
    }
    const correct = spreadSentence(consistent, "smaller");
    const { answer, wrongAnswers } = choiceAnswer(r, correct, [
      { text: spreadSentence(other(consistent), "bigger"), misconception: "compare-big-range-consistent" },
      { text: `${winner}'s ${ctx.plural} were more consistent, because their ${avgName} is ${ctx.lowGood ? "lower" : "higher"}.`, misconception: "compare-average-as-spread" },
      { text: spreadSentence(other(consistent), "smaller"), misconception: "compare-reversed" },
    ]);
    return {
      prompt: `${intro} Which sentence compares how consistent they were correctly?`,
      visual,
      answer,
      wrongAnswers,
      hints: ["Consistent means the results are close together.", `Compare the ranges: ${ra} and ${rb}. The smaller range is more consistent.`],
      solution: [`${ctx.a}'s range is ${ra}. ${ctx.b}'s range is ${rb}.`, `${consistent}'s range is smaller, so their ${ctx.plural} were closer together.`, `Answer: ${correct}`],
    };
  }

  if (r.next() < 0.3 && !ctx.lowGood) {
    // An outlier makes the median the fairer average.
    for (;;) {
      const xs = Array.from({ length: 6 }, () => r.int(ctx.lo + 2, Math.round((ctx.lo + ctx.hi) / 2)));
      const big = ctx.hi + r.int(Math.max(4, Math.round((ctx.hi - ctx.lo) / 2)), ctx.hi - ctx.lo + 6);
      const data = shuffle(r, [...xs, big]);
      const mean = sum(data) / data.length;
      if (Math.abs(mean - median(data)) < 2) continue;
      const correct = `The median, because the extreme value ${big} pulls the mean up`;
      const { answer, wrongAnswers } = choiceAnswer(r, correct, [
        { text: "The mean, because it always uses every value", misconception: "compare-outlier-mean" },
        { text: "The range, because it is the biggest number", misconception: "compare-range-as-average" },
        { text: `The mean, because ${big} is the most important value`, misconception: "compare-outlier-mean" },
      ]);
      return {
        prompt: `${ctx.a}'s ${ctx.what}: ${listText(data)}. ${ctx.a} wants one average to compare with ${ctx.b}. Which average is best to use, and why?`,
        answer,
        wrongAnswers,
        hints: [`Is there a value that is very different from the rest?`, "One extreme value pulls the mean towards it, but hardly moves the median."],
        solution: [`${big} is much bigger than the other values: it is an outlier.`, `The mean is ${fmt(Math.round(mean * 10) / 10)} but the median is ${fmt(median(data))}, which is more typical.`, `Answer: ${correct}`],
      };
    }
  }

  // Raw data for both: work out an average and the range, then pick the full comparison.
  for (;;) {
    const len = r.pick([5, 7]);
    const A = Array.from({ length: len }, () => r.int(ctx.lo, ctx.hi));
    const B = Array.from({ length: len }, () => r.int(ctx.lo, ctx.hi));
    const ma = median(A);
    const mb = median(B);
    const ra = Math.max(...A) - Math.min(...A);
    const rb = Math.max(...B) - Math.min(...B);
    if (ma === mb || ra === rb) continue;
    const winner = avgWinner(ma, mb);
    const consistent = ra < rb ? ctx.a : ctx.b;
    const full = (w: string, c: string) => `On average ${w} ${ctx.win}, and ${c} ${c === "Amir" || c === "Beth" ? "was" : "were"} more consistent.`;
    const correct = full(winner, consistent);
    const { answer, wrongAnswers } = choiceAnswer(r, correct, [
      { text: full(other(winner), consistent), misconception: ctx.lowGood ? "compare-lower-better" : "compare-reversed" },
      { text: full(winner, other(consistent)), misconception: "compare-big-range-consistent" },
      { text: full(other(winner), other(consistent)), misconception: ctx.lowGood ? "compare-lower-better" : "compare-reversed" },
    ]);
    const sa = [...A].sort((x, y) => x - y);
    const sb = [...B].sort((x, y) => x - y);
    return {
      prompt: `Here are the ${ctx.what} for ${ctx.a} and ${ctx.b}.${lowNote} Use the median and the range to compare them. Which sentence is correct?`,
      visual: {
        kind: "chart",
        chart: tableChart(["", cap(ctx.plural)], [[ctx.a, listText(A)], [ctx.b, listText(B)]], `${ctx.a}: ${listText(A)}. ${ctx.b}: ${listText(B)}.`),
      },
      answer,
      wrongAnswers,
      hints: ["Put each list in order. The median is the middle value; the range is biggest − smallest.", ctx.lowGood ? "Lower times are better. A smaller range is more consistent." : "A higher median is better on average. A smaller range is more consistent."],
      solution: [
        `${ctx.a} in order: ${listText(sa)}. Median ${fmt(ma)}, range ${sa[len - 1]} − ${sa[0]} = ${ra}.`,
        `${ctx.b} in order: ${listText(sb)}. Median ${fmt(mb)}, range ${sb[len - 1]} − ${sb[0]} = ${rb}.`,
        `Answer: ${correct}`,
      ],
    };
  }
};

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

// ------------------------------------------------------------ populations, samples and bias

const SURVEYS = [
  {
    org: "A head teacher",
    topic: "what students think of school lunches",
    popWord: "students at the school",
    popN: 900,
    n: 50,
    random: "Pick 50 names at random from a list of every student in the school",
    biased: [
      { text: "Ask the first 50 students in the lunch queue", why: "Students in the lunch queue are more likely to like school lunches" },
      { text: "Ask 50 students from Year 7 only", why: "Year 7 students might think differently from older students" },
      { text: "Ask 50 students on the school council", why: "School council students might not be typical of the whole school" },
    ],
    answer: "say they like school lunches",
  },
  {
    org: "A council",
    topic: "how often people in a town use the park",
    popWord: "people in the town",
    popN: 12000,
    n: 200,
    random: "Pick 200 people at random from a list of everyone who lives in the town",
    biased: [
      { text: "Ask 200 people walking their dogs in the park", why: "People already in the park probably use it more than most people" },
      { text: "Ask 200 members of a running club", why: "Runners are more likely to use the park than most people" },
      { text: "Ask 200 people at a care home", why: "People in a care home might not be able to get to the park easily" },
    ],
    answer: "use the park every week",
  },
  {
    org: "A sports shop",
    topic: "how much exercise people in a city do each week",
    popWord: "people in the city",
    popN: 50000,
    n: 100,
    random: "Pick 100 people at random from a list of everyone in the city",
    biased: [
      { text: "Ask 100 people leaving a gym", why: "People at a gym probably exercise more than most people" },
      { text: "Ask 100 people at a football match", why: "Football fans may do more sport than most people" },
      { text: "Ask 100 people in a library", why: "People in a library may not be typical of the whole city" },
    ],
    answer: "exercise every day",
  },
  {
    org: "A cinema owner",
    topic: "how often people in a town go to the cinema",
    popWord: "people in the town",
    popN: 8000,
    n: 80,
    random: "Pick 80 people at random from a list of everyone in the town",
    biased: [
      { text: "Ask 80 people queuing to watch a film", why: "People in the queue are more likely to go to the cinema often" },
      { text: "Ask 80 people who work at the cinema", why: "Cinema workers see far more films than most people" },
      { text: "Ask 80 children at a primary school", why: "Children might go to the cinema more or less often than adults" },
    ],
    answer: "go to the cinema every month",
  },
] as const;

const WHY_SAMPLE = "It is quicker and cheaper than asking everyone";
const WHY_SAMPLE_WRONG = [
  { text: "It always gives exactly the right answer", misconception: "sampling-sample-exact" },
  { text: "Everyone in a sample agrees with each other", misconception: "sampling-sample-exact" },
  { text: "A sample is more accurate than asking everyone", misconception: "sampling-sample-exact" },
];

const sampling: Gen = (r, tier) => {
  const s = r.pick(SURVEYS);
  const kind = tier === 1 ? r.pick(["which-sample", "pop-or-sample", "why-sample"] as const) : r.pick(["why-biased", "scale", "scale", "reliable"] as const);
  const intro = `${s.org} wants to find out ${s.topic}.`;

  if (kind === "which-sample") {
    const correct = s.random;
    const { answer, wrongAnswers } = choiceAnswer(r, correct, s.biased.map((b) => ({ text: b.text, misconception: "sampling-biased-choice" })));
    return {
      prompt: `${intro} Which way of choosing a sample is fairest (least likely to be biased)?`,
      answer,
      wrongAnswers,
      hints: ["A fair sample gives everyone in the population the same chance of being picked.", "Watch out for samples where some kinds of people are much more likely to be asked."],
      solution: ["A random sample from a list of everyone gives everyone the same chance.", "The other ways leave some kinds of people out, or pick people who are not typical.", `Answer: ${correct}`],
    };
  }
  if (kind === "pop-or-sample") {
    const askPop = r.next() < 0.5;
    const sampleText = `The ${s.n} ${s.popWord} who were asked`;
    const popText = `All ${s.popN} ${s.popWord}`;
    const correct = askPop ? popText : sampleText;
    const { answer, wrongAnswers } = choiceAnswer(r, correct, [
      { text: askPop ? sampleText : popText, misconception: "sampling-pop-sample-confused" },
      { text: `The ${s.popN - s.n} ${s.popWord} who were not asked`, misconception: "sampling-pop-sample-confused" },
      { text: `${cap(s.topic)}`, misconception: "sampling-pop-sample-confused" },
    ]);
    return {
      prompt: `${intro} There are ${s.popN} ${s.popWord}. ${s.org} asks ${s.n} of them. What is the ${askPop ? "population" : "sample"}?`,
      answer,
      wrongAnswers,
      hints: ["The population is everyone you want to know about.", "The sample is the smaller group you actually ask."],
      solution: [`Population: everyone we want to know about, all ${s.popN} ${s.popWord}.`, `Sample: the ${s.n} who were actually asked.`, `Answer: ${correct}`],
    };
  }
  if (kind === "why-sample") {
    const { answer, wrongAnswers } = choiceAnswer(r, WHY_SAMPLE, WHY_SAMPLE_WRONG);
    return {
      prompt: `${intro} Why might they ask a sample of ${s.n} instead of all ${s.popN} ${s.popWord}?`,
      answer,
      wrongAnswers,
      hints: [`Think about how long it would take to ask all ${s.popN} people.`, "A sample gives an estimate, not an exact answer."],
      solution: [`Asking all ${s.popN} would take a long time and cost a lot.`, "A sample gives a good estimate for much less effort.", `Answer: ${WHY_SAMPLE}`],
    };
  }
  if (kind === "why-biased") {
    const b = r.pick(s.biased as readonly { text: string; why: string }[]);
    const otherSurvey = r.pick(SURVEYS.filter((x) => x !== s));
    const { answer, wrongAnswers } = choiceAnswer(r, b.why, [
      { text: `The sample of ${s.n} is too big to be useful`, misconception: "sampling-small-sample" },
      { text: "It isn't biased, because everyone asked lives nearby", misconception: "sampling-biased-choice" },
      { text: otherSurvey.biased[0].why, misconception: "sampling-biased-choice" },
    ]);
    return {
      prompt: `${intro} They decide to: ${b.text.charAt(0).toLowerCase()}${b.text.slice(1)}. Why might this sample be biased?`,
      answer,
      wrongAnswers,
      hints: ["Would the people asked give the same kind of answers as everyone else?", "Biased means some kinds of people are more likely to be picked than others."],
      solution: ["These people are not typical of the whole population.", "So the results would lean one way.", `Answer: ${b.why}`],
    };
  }
  if (kind === "reliable") {
    const names = shuffle(r, ["Ali", "Bea", "Cal", "Dee"]);
    const sizes = shuffle(r, [10, 25, 50, s.n * 2]);
    const best = sizes.indexOf(Math.max(...sizes));
    const opt = (i: number) => `${names[i]}, who asked ${sizes[i]} people chosen at random`;
    const { answer, wrongAnswers } = choiceAnswer(
      r,
      opt(best),
      [0, 1, 2, 3].filter((i) => i !== best).map((i) => ({ text: opt(i), misconception: "sampling-small-sample" })),
    );
    return {
      prompt: `${intro} Four people each take a random sample to estimate it. Whose estimate is likely to be most reliable?`,
      answer,
      wrongAnswers,
      hints: ["All four samples are random, so none of them is biased.", "A bigger random sample is less likely to be unusual by chance."],
      solution: ["All the samples are random.", `The biggest sample is ${sizes[best]} people, so it is the most reliable.`, `Answer: ${opt(best)}`],
    };
  }
  // Scale a sample result up to the population.
  const mult = r.pick([10, 20, 25, 30, 40, 50]);
  const n = r.pick([20, 30, 40, 50, 60]);
  const N = n * mult;
  const k = r.int(3, n - 3);
  const ans = k * mult;
  return {
    prompt: `${intro} They ask a random sample of ${n} of the ${N} ${s.popWord}. ${k} of the sample ${s.answer}. Estimate how many of all ${N} ${s.popWord} ${s.answer}.`,
    ...intAnswer(ans, [
      { value: k, misconception: "sampling-scale-wrong" },
      { value: N - k, misconception: "sampling-scale-wrong" },
      { value: mult, misconception: "sampling-scale-wrong" },
      { value: N - ans, misconception: "sampling-scale-wrong" },
    ]),
    hints: [`${k} out of ${n} is the fraction ${k}/${n} of the sample.`, `Find the same fraction of ${N}. Or: ${N} is ${mult} times ${n}, so multiply ${k} by ${mult}.`],
    solution: [`The population is ${N} ÷ ${n} = ${mult} times bigger than the sample.`, `${k} × ${mult} = ${ans}`, `Answer: ${ans}`],
  };
};

// ------------------------------------------------------------ lines of best fit

const FIT_CONTEXTS = [
  {
    x: "Hours of revision",
    y: "Test score",
    ux: 1,
    uy: 5,
    sign: 1,
    est: (v: number) => `the test score of a student who revised for ${v} hours`,
    rev: (v: number) => `how many hours a student revised for if they scored ${v}`,
    far: (v: number) => `the score of a student who revised for ${v} hours`,
  },
  {
    x: "Temperature (°C)",
    y: "Ice creams sold",
    ux: 2,
    uy: 10,
    sign: 1,
    est: (v: number) => `the number of ice creams sold on a day when it is ${v}°C`,
    rev: (v: number) => `the temperature, in °C, on a day when ${v} ice creams are sold`,
    far: (v: number) => `the ice creams sold on a day when it is ${v}°C`,
  },
  {
    x: "Age of car (years)",
    y: "Value (£1000s)",
    ux: 1,
    uy: 2,
    sign: -1,
    est: (v: number) => `the value, in £1000s, of a car that is ${v} years old`,
    rev: (v: number) => `the age, in years, of a car worth ${v} thousand pounds`,
    far: (v: number) => `the value of a car that is ${v} years old`,
  },
  {
    x: "Temperature (°C)",
    y: "Hot chocolates sold",
    ux: 2,
    uy: 5,
    sign: -1,
    est: (v: number) => `the number of hot chocolates sold on a day when it is ${v}°C`,
    rev: (v: number) => `the temperature, in °C, on a day when ${v} hot chocolates are sold`,
    far: (v: number) => `the hot chocolates sold on a day when it is ${v}°C`,
  },
] as const;

/** Lines y = c + m·x on the 10 × 10 grid. Each passes through whole grid points often. */
const FIT_LINES = { up: [{ c: 1, m: 0.75 }, { c: 2, m: 0.5 }, { c: 0.5, m: 0.75 }, { c: 0, m: 1 }], down: [{ c: 9, m: -0.75 }, { c: 8, m: -0.5 }, { c: 10, m: -1 }, { c: 9.5, m: -0.75 }] };

/** The part of y = c + m·x inside the 0..10 square, as two end points. */
function clipLine(c: number, m: number): [[number, number], [number, number]] {
  let xa = 0;
  let xb = 10;
  if (m !== 0) {
    const x0 = (0 - c) / m;
    const x10 = (10 - c) / m;
    xa = Math.max(0, Math.min(x0, x10));
    xb = Math.min(10, Math.max(x0, x10));
  }
  return [
    [xa, c + m * xa],
    [xb, c + m * xb],
  ];
}

const REL_OUT = "No, because it is outside the range of the data, so the pattern might not carry on";
const REL_IN = "Yes, fairly reliable, because it is inside the range of the data and the points are close to the line";

const bestFit: Gen = (r, tier) => {
  const ctx = r.pick(FIT_CONTEXTS);
  const line = r.pick(ctx.sign > 0 ? FIT_LINES.up : FIT_LINES.down);
  const { c, m } = line;
  const yAt = (x: number) => c + m * x;
  for (;;) {
    const xs = shuffle(r, [1, 2, 3, 4, 5, 6, 7, 8]).slice(0, 7).sort((a, b) => a - b);
    const pts: [number, number][] = xs.map((x) => [x, Math.max(0, Math.min(10, Math.round(yAt(x) + r.pick([-1, -0.5, 0, 0.5, 1]))))]);
    // Points either side of the line, so it really is the best fit.
    const above = pts.filter(([x, y]) => y > yAt(x)).length;
    const below = pts.filter(([x, y]) => y < yAt(x)).length;
    if (above < 2 || below < 2) continue;
    const real = (p: [number, number]): [number, number] => [p[0] * ctx.ux, p[1] * ctx.uy];
    const fitReal = (cc: number, mm: number, label?: string) => {
      const [a, b] = clipLine(cc, mm);
      return { from: real(a), to: real(b), label };
    };
    const chart = (fits: { from: [number, number]; to: [number, number]; label?: string }[], words: string): ChartSpec => ({
      type: "scatter",
      points: pts.map(real),
      xLabel: ctx.x,
      yLabel: ctx.y,
      xMax: 10 * ctx.ux,
      yMax: 10 * ctx.uy,
      xStep: ctx.ux,
      yStep: ctx.uy,
      fits,
      description: `Scatter graph of ${ctx.y.toLowerCase()} against ${ctx.x.toLowerCase()}. The points go ${ctx.sign > 0 ? "up" : "down"} from left to right. ${words}`,
    });
    const lineWords = `A line of best fit is drawn from (${real(clipLine(c, m)[0]).map(fmt).join(", ")}) to (${real(clipLine(c, m)[1]).map(fmt).join(", ")}).`;
    const kind = tier === 1 ? r.pick(["estimate", "estimate", "which-line"] as const) : r.pick(["reverse", "reliable", "estimate"] as const);

    if (kind === "estimate") {
      // An x inside the data where the line crosses a grid point exactly.
      const cands = [2, 3, 4, 5, 6, 7].filter((x) => Number.isInteger(yAt(x)) && x > xs[0] && x < xs[xs.length - 1]);
      if (!cands.length) continue;
      const xq = r.pick(cands);
      const ans = yAt(xq) * ctx.uy;
      const atPoint = pts.find(([x]) => x === xq);
      return {
        prompt: `The scatter graph has a line of best fit. Use it to estimate ${ctx.est(xq * ctx.ux)}.`,
        visual: { kind: "chart", chart: chart([fitReal(c, m)], lineWords) },
        ...intAnswer(ans, [
          ...(atPoint && atPoint[1] * ctx.uy !== ans ? [{ value: atPoint[1] * ctx.uy, misconception: "bestfit-read-point" }] : []),
          { value: xq * ctx.ux, misconception: "scatter-wrong-axis" },
        ]),
        hints: [`Find ${xq * ctx.ux} on the bottom axis and go straight up to the line (not to a cross).`, `Then go straight across to the side axis. It goes up in ${ctx.uy}s.`],
        solution: [`Up from ${xq * ctx.ux} to the line of best fit.`, `Across to the side axis: ${ans}.`, `Answer: ${ans}`],
      };
    }
    if (kind === "reverse") {
      const cands = [2, 3, 4, 5, 6, 7].filter((x) => Number.isInteger(yAt(x)) && yAt(x) > 0 && x > xs[0] && x < xs[xs.length - 1]);
      if (!cands.length) continue;
      const xq = r.pick(cands);
      const yq = yAt(xq) * ctx.uy;
      const ans = xq * ctx.ux;
      const sameY = pts.find(([x, y]) => y * ctx.uy === yq && x * ctx.ux !== ans);
      return {
        prompt: `The scatter graph has a line of best fit. Use it to estimate ${ctx.rev(yq)}.`,
        visual: { kind: "chart", chart: chart([fitReal(c, m)], lineWords) },
        ...intAnswer(ans, [...(sameY ? [{ value: sameY[0] * ctx.ux, misconception: "bestfit-read-point" }] : []), { value: yq, misconception: "scatter-wrong-axis" }]),
        hints: [`This time start on the side axis: find ${yq} and go straight across to the line.`, `Then go straight down to the bottom axis. It goes up in ${ctx.ux}s.`],
        solution: [`Across from ${yq} to the line of best fit.`, `Down to the bottom axis: ${ans}.`, `Answer: ${ans}`],
      };
    }
    if (kind === "which-line") {
      const shift = Math.max(c, c + 10 * m) + 3.5 <= 10 ? 3.5 : -3.5;
      const lines = shuffle(r, ["good", "shifted", "reversed"] as const);
      const letter = (k: (typeof lines)[number]) => "ABC"[lines.indexOf(k)];
      const fits = lines.map((k, i) => {
        const L = "ABC"[i];
        if (k === "good") return fitReal(c, m, L);
        if (k === "shifted") return fitReal(c + shift, m, L);
        return fitReal(c + 10 * m, -m, L);
      });
      const correct = letter("good");
      const opts = ["A", "B", "C"];
      return {
        prompt: "Three lines are drawn on the scatter graph. Which one is the best line of best fit?",
        visual: { kind: "chart", chart: chart(fits, `Three lines are drawn, labelled A, B and C. Line ${letter("good")} goes through the middle of the points. Line ${letter("shifted")} has the same slope but all the points are on one side of it. Line ${letter("reversed")} goes the opposite way to the points.`) },
        answer: { kind: "choice", options: opts, correctIndex: opts.indexOf(correct) },
        wrongAnswers: [
          { value: opts.indexOf(letter("shifted")), misconception: "bestfit-not-balanced" },
          { value: opts.indexOf(letter("reversed")), misconception: "bestfit-wrong-direction" },
        ],
        hints: ["A line of best fit follows the direction of the points.", "It goes through the middle of them, with about as many points above it as below."],
        solution: [
          `Line ${letter("reversed")} goes the wrong way. Line ${letter("shifted")} has every point on one side of it.`,
          `Line ${correct} follows the points, with some above and some below.`,
          `Answer: ${correct}`,
        ],
      };
    }
    // Is an estimate reliable?
    const outside = r.next() < 0.6;
    const xq = outside ? (ctx.ux === 1 ? r.pick([15, 20, 25]) : r.pick([30, 35, 40])) : r.pick([3, 4, 5, 6].filter((x) => x > xs[0] && x < xs[xs.length - 1])) * ctx.ux;
    const correct = outside ? REL_OUT : REL_IN;
    const { answer, wrongAnswers } = choiceAnswer(
      r,
      correct,
      outside
        ? [
            { text: "Yes, because you can make a line of best fit as long as you like", misconception: "bestfit-extrapolate" },
            { text: "Yes, because the graph shows correlation", misconception: "bestfit-extrapolate" },
          ]
        : [
            { text: REL_OUT, misconception: "bestfit-inside-reliable" },
            { text: "No, because an estimate from a line of best fit is never reliable", misconception: "bestfit-inside-reliable" },
          ],
    );
    return {
      prompt: `Jo uses the line of best fit to estimate ${ctx.far(xq)}. Is this a reliable estimate?`,
      visual: { kind: "chart", chart: chart([fitReal(c, m)], lineWords) },
      answer,
      wrongAnswers,
      hints: [`Where is ${xq} on the bottom axis? Is it among the data, or beyond it?`, "We only know the pattern where there is data."],
      solution: [
        outside ? `The data only goes up to ${xs[xs.length - 1] * ctx.ux}, and ${xq} is far beyond it.` : `${xq} is inside the data (from ${xs[0] * ctx.ux} to ${xs[xs.length - 1] * ctx.ux}).`,
        outside ? "Nobody knows if the pattern carries on that far." : "The points near there are close to the line, so the estimate is reasonable.",
        `Answer: ${correct}`,
      ],
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
  "stats-two-way-tables": twoWayTables,
  "stats-time-series": timeSeries,
  "stats-grouped-mean": groupedMean,
  "stats-compare": compare,
  "stats-sampling": sampling,
  "stats-best-fit": bestFit,
};
