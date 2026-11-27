/**
 * Question generators for the probability chain.
 *
 * Probability answers can be typed as a fraction (3/8), a decimal (0.375) or
 * a percentage (37.5%). Fractions don't have to be simplified: GCSE mark
 * schemes accept 6/36 as well as 1/6, so we do too. Every predicted wrong
 * answer is checked so it never equals the right one.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher.
 */

import { equals, frac, lcm, simplify, show, showDecimal, type Fraction } from "@/engine/fraction";
import type { Rng } from "@/engine/random";
import type { AnswerSpec, Question, TableSpec, VennSpec } from "@/engine/types";

export type Tier = 1 | 2;
type Gen = (r: Rng, tier: Tier) => Omit<Question, "id" | "skillId">;
type Wrong = Question["wrongAnswers"][number];

export const PROB_HELP = "Type a fraction like 3/8, a decimal like 0.4 or a percentage like 40%. Fractions don't need simplifying.";
const COUNT_HELP = "Type a whole number.";

/** A probability answer: any equivalent fraction, decimal or percentage. */
const prob = (f: Fraction): AnswerSpec => ({ kind: "fraction", value: f, requireSimplest: false, percentAllowed: true });
/** A probability answer shown as a decimal, for questions given in decimals. */
const probDecimal = (f: Fraction): AnswerSpec => ({ kind: "fraction", value: f, requireSimplest: false, percentAllowed: true, form: "decimal" });

const asFrac = (v: Wrong["value"]): Fraction | null => (Array.isArray(v) ? null : typeof v === "number" ? frac(v) : v);

/** Drop wrong answers that equal the right one, that aren't positive, or that repeat. */
function cleanWrong(correct: Fraction | number, wrong: Wrong[]): Wrong[] {
  const c = typeof correct === "number" ? frac(correct) : correct;
  const kept: Wrong[] = [];
  for (const w of wrong) {
    const f = asFrac(w.value);
    if (!f || f.n <= 0 || f.d <= 0 || equals(f, c)) continue;
    if (kept.some((k) => equals(asFrac(k.value)!, f))) continue;
    kept.push(w);
  }
  return kept;
}

/** Fisher-Yates shuffle with the question's own random numbers. */
function shuffle<T>(r: Rng, xs: readonly T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = r.int(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 0.35 → "0.35", 7/20 → "0.35". */
const dec = (f: Fraction) => showDecimal(f);
const pct = (f: Fraction) => `${Math.round((f.n / f.d) * 1000) / 10}%`;
const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const list = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

const COLOURS = ["red", "blue", "green", "yellow", "purple", "orange"] as const;

// ------------------------------------------------ the probability scale

export const CHANCE_WORDS = ["impossible", "unlikely", "even chance", "likely", "certain"] as const;

/** Which word describes probability p. */
function chanceWord(p: Fraction): number {
  if (p.n === 0) return 0;
  if (p.n === p.d) return 4;
  const half = frac(1, 2);
  if (equals(p, half)) return 2;
  return p.n * 2 < p.d ? 1 : 3;
}

/** Map every wrong word to the misconception it most likely shows. */
function wordWrongs(correct: number): Wrong[] {
  const out: Wrong[] = [];
  for (let i = 0; i < CHANCE_WORDS.length; i++) {
    if (i === correct) continue;
    const edge = (correct === 0 && i === 1) || (correct === 1 && i === 0) || (correct === 3 && i === 4) || (correct === 4 && i === 3);
    out.push({ value: i, misconception: i === 2 ? "prob-even-means-possible" : edge ? "prob-possible-not-impossible" : "prob-scale-wrong-way" });
  }
  return out;
}

/** "So it is unlikely." / "So it's an even chance." */
const soItIs = (i: number) => (i === 2 ? "So it's an even chance." : `So it is ${CHANCE_WORDS[i]}.`);

const WORD_MEANING = "Impossible = 0, certain = 1, even chance = exactly 1/2. Unlikely is between 0 and 1/2, likely is between 1/2 and 1.";

const DICE_EVENTS: { say: string; ways: number[] }[] = [
  { say: "a 7", ways: [] },
  { say: "a number less than 7", ways: [1, 2, 3, 4, 5, 6] },
  { say: "an even number", ways: [2, 4, 6] },
  { say: "an odd number", ways: [1, 3, 5] },
  { say: "a 6", ways: [6] },
  { say: "a 1 or a 2", ways: [1, 2] },
  { say: "a number bigger than 1", ways: [2, 3, 4, 5, 6] },
  { say: "a number bigger than 2", ways: [3, 4, 5, 6] },
  { say: "a number less than 4", ways: [1, 2, 3] },
  { say: "a 0", ways: [] },
  { say: "a whole number from 1 to 6", ways: [1, 2, 3, 4, 5, 6] },
];

const probScale: Gen = (r, tier) => {
  const roll = r.next();

  if (tier === 2 && roll < 0.35) {
    // Which could not be a probability?
    const valid = shuffle(r, ["0", "1", "0.35", "3/4", "45%", "0.9", "1/8", "100%", "0.05", "2/3"]).slice(0, 3);
    const bad = r.pick(["1.2", "5/4", "−0.3", "120%", "7/5", "1.05", "3/2"]);
    const options = shuffle(r, [...valid, bad]);
    const correctIndex = options.indexOf(bad);
    const wrongAnswers: Wrong[] = options
      .map((o, i) => ({ o, i }))
      .filter(({ o }) => ["0", "1", "100%"].includes(o))
      .map(({ i }) => ({ value: i, misconception: "prob-zero-one-valid" }));
    return {
      prompt: "Which of these numbers could NOT be a probability?",
      answer: { kind: "choice", options, correctIndex },
      wrongAnswers,
      hints: ["Every probability is between 0 and 1, including 0 and 1 themselves.", "As a percentage, that's from 0% to 100%. Look for one that is more than 1, or less than 0."],
      solution: [
        "A probability must be from 0 (impossible) to 1 (certain). As a percentage, that's 0% to 100%.",
        `${bad} is ${bad.startsWith("−") ? "less than 0" : "more than 1 (or more than 100%)"}, so it can't be a probability.`,
        `The answer is ${bad}`,
      ],
    };
  }

  if (tier === 2 && roll < 0.7) {
    // Most or least likely, with the three given in different forms.
    let ps: Fraction[];
    for (;;) {
      ps = [r.int(2, 18), r.int(2, 18), r.int(2, 18)].map((k) => frac(k * 5, 100));
      const vals = ps.map((p) => p.n / p.d).sort();
      if (vals[1] - vals[0] >= 0.05 && vals[2] - vals[1] >= 0.05) break;
    }
    const forms = shuffle(r, ["fraction", "decimal", "percent"] as const);
    const say = (p: Fraction, f: (typeof forms)[number]) => (f === "fraction" ? show(simplify(p)) : f === "decimal" ? dec(p) : pct(p));
    const shown = ps.map((p, i) => say(p, forms[i]));
    const most = r.next() < 0.6;
    const vals = ps.map((p) => p.n / p.d);
    const target = most ? Math.max(...vals) : Math.min(...vals);
    const correctIndex = vals.indexOf(target);
    const options = ["Event A", "Event B", "Event C"];
    return {
      prompt: `Event A has probability ${shown[0]}. Event B has probability ${shown[1]}. Event C has probability ${shown[2]}. Which event is ${most ? "most" : "least"} likely?`,
      answer: { kind: "choice", options, correctIndex },
      wrongAnswers: [0, 1, 2].filter((i) => i !== correctIndex).map((i) => ({ value: i, misconception: "prob-compare-forms" })),
      hints: ["Change all three into the same form first. Percentages are often easiest.", `As percentages: ${ps.map((p, i) => `${options[i]} = ${pct(p)}`).join(", ")}.`],
      solution: [
        `Change them all to percentages: ${ps.map((p, i) => `${options[i]} = ${pct(p)}`).join(", ")}.`,
        `The ${most ? "biggest" : "smallest"} is ${pct(ps[correctIndex])}.`,
        `${options[correctIndex]} is ${most ? "most" : "least"} likely.`,
      ],
    };
  }

  if (tier === 2) {
    // Which word describes this number?
    const p = r.pick([frac(0), frac(1), frac(1, 2), frac(8, 100), frac(15, 100), frac(3, 10), frac(45, 100), frac(55, 100), frac(7, 10), frac(92, 100), frac(1, 8), frac(5, 6)]);
    const forms = [dec(p), pct(p)];
    const shownP = p.d === 1 ? String(p.n) : r.pick([...forms, show(p)]);
    const correctIndex = chanceWord(p);
    return {
      prompt: `An event has a probability of ${shownP}. Which word best describes how likely it is?`,
      answer: { kind: "choice", options: [...CHANCE_WORDS], correctIndex },
      wrongAnswers: wordWrongs(correctIndex),
      hints: [WORD_MEANING, `As a decimal, ${shownP} is ${dec(p)}. Is that 0, less than 0.5, exactly 0.5, more than 0.5 or 1?`],
      solution: [shownP === dec(p) ? `The probability is ${shownP}.` : `${shownP} = ${dec(p)} as a decimal.`, WORD_MEANING, soItIs(correctIndex)],
    };
  }

  // Tier 1: describe an event in words.
  if (roll < 0.5) {
    const colour = r.pick(COLOURS.slice(0, 4));
    const other = r.pick(COLOURS.slice(0, 4).filter((c) => c !== colour));
    let a = r.int(0, 8);
    let b = r.int(0, 8);
    if (r.next() < 0.15) b = 0;
    else if (r.next() < 0.15) a = 0;
    if (a + b === 0) a = 3;
    const p = frac(a, a + b);
    const correctIndex = chanceWord(p);
    const bag = [a > 0 ? plural(a, `${colour} counter`) : null, b > 0 ? plural(b, `${other} counter`) : null].filter(Boolean) as string[];
    return {
      prompt: `A bag has ${list(bag)}${a === 0 || b === 0 ? " and nothing else" : ""}. One counter is taken out without looking. How likely is it that the counter is ${colour}?`,
      answer: { kind: "choice", options: [...CHANCE_WORDS], correctIndex },
      wrongAnswers: wordWrongs(correctIndex),
      hints: [`How many of the ${a + b} counters are ${colour}?`, WORD_MEANING],
      solution: [
        `${a} out of ${a + b} counters are ${colour}.`,
        a === 0 ? "There are none, so it can't happen." : b === 0 ? "Every counter is that colour, so it must happen." : a * 2 === a + b ? "That's exactly half." : a * 2 < a + b ? "That's fewer than half." : "That's more than half.",
        soItIs(correctIndex),
      ],
    };
  }
  const e = r.pick(DICE_EVENTS);
  const p = frac(e.ways.length, 6);
  const correctIndex = chanceWord(p);
  return {
    prompt: `You roll an ordinary six-sided dice. How likely is it that you get ${e.say}?`,
    answer: { kind: "choice", options: [...CHANCE_WORDS], correctIndex },
    wrongAnswers: wordWrongs(correctIndex),
    hints: ["The dice can land on 1, 2, 3, 4, 5 or 6.", `How many of those six numbers give ${e.say}?`],
    solution: [
      `The dice can land on 1, 2, 3, 4, 5 or 6.`,
      e.ways.length === 0 ? `None of them give ${e.say}, so it can't happen.` : `${list(e.ways.map(String))} ${e.ways.length === 1 ? "gives" : "give"} ${e.say}: ${e.ways.length} out of 6.`,
      soItIs(correctIndex),
    ],
  };
};

// ------------------------------------------------ probability of a single event

const DICE_EVENTS_P: { say: string; short: string; ways: number[] }[] = [
  { say: "an even number", short: "even", ways: [2, 4, 6] },
  { say: "an odd number", short: "odd", ways: [1, 3, 5] },
  { say: "a 5", short: "5", ways: [5] },
  { say: "a number bigger than 4", short: "bigger than 4", ways: [5, 6] },
  { say: "a number less than 5", short: "less than 5", ways: [1, 2, 3, 4] },
  { say: "a multiple of 3", short: "multiple of 3", ways: [3, 6] },
  { say: "a factor of 6", short: "factor of 6", ways: [1, 2, 3, 6] },
  { say: "a prime number", short: "prime", ways: [2, 3, 5] },
  { say: "a square number", short: "square number", ways: [1, 4] },
];

const WORDS = ["PROBABILITY", "STATISTICS", "BANANA", "ASSESSMENT", "CALCULATOR", "DIVISION", "PARALLEL", "ADDITION"] as const;

/** Counts for a bag: 2 or 3 colours, each 1..max. */
function bag(r: Rng, colours: number, max: number) {
  const cols = shuffle(r, COLOURS).slice(0, colours);
  const counts = cols.map(() => r.int(1, max));
  // Avoid all colours having the same count (then "equally likely" is right).
  if (counts.every((c) => c === counts[0])) counts[0] = counts[0] === max ? max - 1 : counts[0] + 1;
  return { cols, counts, total: counts.reduce((s, c) => s + c, 0) };
}

const singleEvent: Gen = (r, tier) => {
  const roll = r.next();

  if (tier === 1 && roll < 0.4) {
    const b = bag(r, r.int(2, 3), 9);
    const i = r.int(0, b.cols.length - 1);
    const c = b.counts[i];
    const ans = frac(c, b.total);
    return {
      prompt: `A bag has ${list(b.cols.map((col, j) => plural(b.counts[j], `${col} counter`)))}. One counter is taken at random. What is the probability that it is ${b.cols[i]}?`,
      answerHelp: PROB_HELP,
      answer: prob(ans),
      wrongAnswers: cleanWrong(ans, [
        { value: frac(c, b.total - c), misconception: "prob-other-on-bottom" },
        { value: frac(1, b.cols.length), misconception: "prob-equal-colours" },
        { value: frac(b.total, c), misconception: "prob-upside-down" },
        { value: c, misconception: "prob-gave-count" },
      ]),
      hints: [`How many counters are there altogether? ${b.counts.join(" + ")} = ?`, `${c} of the ${b.total} counters are ${b.cols[i]}.`],
      solution: [
        `Total number of counters: ${b.counts.join(" + ")} = ${b.total}.`,
        `Number of ${b.cols[i]} counters: ${c}.`,
        `P(${b.cols[i]}) = ${show(ans)}`,
      ],
    };
  }

  if (tier === 1 && roll < 0.7) {
    const e = r.pick(DICE_EVENTS_P);
    const k = e.ways.length;
    const ans = frac(k, 6);
    return {
      prompt: `You roll a fair six-sided dice. What is the probability of getting ${e.say}?`,
      answerHelp: PROB_HELP,
      answer: prob(ans),
      wrongAnswers: cleanWrong(ans, [
        { value: k, misconception: "prob-gave-count" },
        { value: frac(k, 6 - k), misconception: "prob-other-on-bottom" },
        { value: frac(6, k), misconception: "prob-upside-down" },
      ]),
      hints: ["There are 6 equally likely outcomes: 1, 2, 3, 4, 5, 6.", `Which of them give ${e.say}?`],
      solution: [`The outcomes are 1, 2, 3, 4, 5 and 6: 6 altogether.`, `${list(e.ways.map(String))} ${k === 1 ? "gives" : "give"} ${e.say}: ${k} ${k === 1 ? "way" : "ways"}.`, `P(${e.short}) = ${show(ans)}`],
    };
  }

  if (tier === 1) {
    const n = r.int(4, 8);
    const cols = shuffle(r, COLOURS.slice(0, 4)).slice(0, r.int(2, 3));
    let sections: string[];
    do sections = Array.from({ length: n }, () => r.pick(cols));
    while (new Set(sections).size < 2);
    const colour = r.pick(sections);
    const k = sections.filter((s) => s === colour).length;
    const kinds = new Set(sections).size;
    const ans = frac(k, n);
    return {
      prompt: `This fair spinner has ${n} equal sections. What is the probability that it lands on ${colour}?`,
      visual: { kind: "spinner", spinner: { sections, description: `A spinner with ${n} equal sections: ${sections.join(", ")}.` } },
      answerHelp: PROB_HELP,
      answer: prob(ans),
      wrongAnswers: cleanWrong(ans, [
        { value: frac(1, kinds), misconception: "prob-equal-colours" },
        { value: k, misconception: "prob-gave-count" },
        { value: frac(k, n - k), misconception: "prob-other-on-bottom" },
        { value: frac(n, k), misconception: "prob-upside-down" },
      ]),
      hints: [`Count every section, even if colours repeat. There are ${n} sections.`, `How many sections say ${colour}?`],
      solution: [`There are ${n} equal sections.`, `${k} of them ${k === 1 ? "is" : "are"} ${colour}.`, `P(${colour}) = ${show(ans)}`],
    };
  }

  // Tier 2
  if (roll < 0.33) {
    const word = r.pick(WORDS);
    const letters = word.split("");
    const counts = new Map<string, number>();
    for (const l of letters) counts.set(l, (counts.get(l) ?? 0) + 1);
    // Prefer a letter that repeats, so counting matters.
    const repeats = [...counts.entries()].filter(([, c]) => c > 1).map(([l]) => l);
    const letter = repeats.length > 0 && r.next() < 0.75 ? r.pick(repeats) : r.pick([...counts.keys()]);
    const k = counts.get(letter)!;
    const ans = frac(k, letters.length);
    return {
      prompt: `Each letter of the word ${word} is written on its own card. The cards are shuffled and one is picked at random. What is the probability that it shows the letter ${letter}?`,
      answerHelp: PROB_HELP,
      answer: prob(ans),
      wrongAnswers: cleanWrong(ans, [
        { value: frac(1, counts.size), misconception: "prob-equal-colours" },
        { value: k, misconception: "prob-gave-count" },
        { value: frac(k, letters.length - k), misconception: "prob-other-on-bottom" },
      ]),
      hints: [`There is one card for every letter, so count all ${letters.length} letters, even repeated ones.`, `How many times does ${letter} appear in ${word}?`],
      solution: [`${word} has ${letters.length} letters, so there are ${letters.length} cards.`, `${letter} appears ${k === 1 ? "once" : `${k} times`}.`, `P(${letter}) = ${show(ans)}`],
    };
  }

  if (roll < 0.66) {
    const N = r.pick([10, 12, 15, 20, 24, 25, 30]);
    const events = [
      { say: "even", label: "Even numbers", test: (x: number) => x % 2 === 0 },
      { say: "a multiple of 3", label: "Multiples of 3", test: (x: number) => x % 3 === 0 },
      { say: "a multiple of 5", label: "Multiples of 5", test: (x: number) => x % 5 === 0 },
      { say: "a square number", label: "Square numbers", test: (x: number) => Number.isInteger(Math.sqrt(x)) },
      { say: `greater than ${Math.floor(N / 3)}`, label: `Numbers greater than ${Math.floor(N / 3)}`, test: (x: number) => x > Math.floor(N / 3) },
      { say: "a factor of 24", label: "Factors of 24", test: (x: number) => 24 % x === 0 },
    ];
    const e = r.pick(events);
    const ways = Array.from({ length: N }, (_, i) => i + 1).filter(e.test);
    const k = ways.length;
    const ans = frac(k, N);
    return {
      prompt: `Cards numbered 1 to ${N} are shuffled, and one card is picked at random. What is the probability that the number is ${e.say}?`,
      answerHelp: PROB_HELP,
      answer: prob(ans),
      wrongAnswers: cleanWrong(ans, [
        { value: k, misconception: "prob-gave-count" },
        { value: frac(k, N - k), misconception: "prob-other-on-bottom" },
        { value: frac(N, k), misconception: "prob-upside-down" },
      ]),
      hints: [`There are ${N} cards, so ${N} equally likely outcomes.`, `List the numbers from 1 to ${N} that are ${e.say}.`],
      solution: [`There are ${N} cards.`, `${e.label}: ${ways.join(", ")}. That's ${k}.`, `P = ${show(ans)}`],
    };
  }

  // "not" or "or" with a bag.
  const b = bag(r, 3, 8);
  const useNot = r.next() < 0.5;
  const i = r.int(0, 2);
  const j = (i + 1 + r.int(0, 1)) % 3;
  const k = useNot ? b.total - b.counts[i] : b.counts[i] + b.counts[j];
  const ask = useNot ? `not ${b.cols[i]}` : `${b.cols[i]} or ${b.cols[j]}`;
  const ans = frac(k, b.total);
  return {
    prompt: `A bag has ${list(b.cols.map((col, x) => plural(b.counts[x], `${col} counter`)))}. One counter is taken at random. What is the probability that it is ${ask}?`,
    answerHelp: PROB_HELP,
    answer: prob(ans),
    wrongAnswers: cleanWrong(ans, [
      { value: k, misconception: "prob-gave-count" },
      { value: frac(k, b.total - k), misconception: "prob-other-on-bottom" },
      ...(useNot ? [{ value: frac(b.counts[i], b.total), misconception: "prob-complement-same" }] : []),
    ]),
    hints: [`Total counters: ${b.counts.join(" + ")} = ${b.total}.`, useNot ? `"Not ${b.cols[i]}" means any of the other colours.` : `Count the ${b.cols[i]} and the ${b.cols[j]} counters together.`],
    solution: [
      `Total: ${b.counts.join(" + ")} = ${b.total}.`,
      useNot
        ? `Not ${b.cols[i]}: ${b.total} − ${b.counts[i]} = ${k} counters.`
        : `${b.cols[i]} or ${b.cols[j]}: ${b.counts[i]} + ${b.counts[j]} = ${k} counters.`,
      `P(${ask}) = ${show(ans)}`,
    ],
  };
};

// ------------------------------------------------ probabilities that add up to 1

const NOT_CONTEXTS = [
  { event: "it rains tomorrow", not: "it does not rain tomorrow" },
  { event: "a bus is late", not: "the bus is not late" },
  { event: "a team wins its next match", not: "the team does not win" },
  { event: "a seed grows into a plant", not: "the seed does not grow" },
  { event: "a biased coin lands on heads", not: "it lands on tails" },
] as const;

const OUTCOME_SETS = [
  { thing: "A spinner", verb: "lands on", outcomes: ["red", "blue", "green", "yellow"] },
  { thing: "A biased dice", verb: "lands on", outcomes: ["1", "2", "3", "4"] },
  { thing: "A bag of sweets", verb: "gives", outcomes: ["strawberry", "lemon", "orange", "lime"] },
] as const;

/** A probability table with one or two unknowns. */
function probTable(outcomes: readonly string[], cells: string[], label: string): TableSpec {
  return {
    corner: "Outcome",
    columns: [...outcomes],
    rows: [{ head: "Probability", cells }],
    description: `${label}. ${outcomes.map((o, i) => `${o}: ${cells[i] === "?" ? "unknown" : cells[i]}`).join(", ")}.`,
  };
}

const sumToOne: Gen = (r, tier) => {
  const roll = r.next();

  if (roll < 0.4) {
    // P(not A).
    const ctx = r.pick(NOT_CONTEXTS);
    const useFraction = r.next() < 0.4;
    if (useFraction) {
      const d = r.pick([5, 7, 8, 9, 10, 11, 12]);
      let a = r.int(1, d - 1);
      while (a * 2 === d) a = r.int(1, d - 1);
      const p = frac(a, d);
      const ans = frac(d - a, d);
      return {
        prompt: `The probability that ${ctx.event} is ${a}/${d}. What is the probability that ${ctx.not}?`,
        answerHelp: PROB_HELP,
        answer: prob(ans),
        wrongAnswers: cleanWrong(ans, [{ value: p, misconception: "prob-complement-same" }]),
        hints: ["It either happens or it doesn't, so the two probabilities add up to 1.", `1 = ${d}/${d}. Take away ${a}/${d}.`],
        solution: [`The two probabilities add up to 1, and 1 = ${d}/${d}.`, `${d}/${d} − ${a}/${d} = ${d - a}/${d}.`, `P = ${show(ans)}`],
      };
    }
    const hundredths = tier === 2;
    let k = hundredths ? r.int(5, 95) : r.int(1, 9);
    while ((hundredths && k % 10 === 0) || (!hundredths && k === 5)) k = hundredths ? r.int(5, 95) : r.int(1, 9);
    const base = hundredths ? 100 : 10;
    const p = simplify(frac(k, base));
    const ans = simplify(frac(base - k, base));
    const wrong: Wrong[] = [{ value: p, misconception: "prob-complement-same" }];
    if (hundredths) {
      // 1 − 0.35 written as 0.75: took the tenths from 10 and kept the hundredths.
      const t = Math.floor(k / 10);
      const h = k % 10;
      wrong.push({ value: simplify(frac((10 - t) * 10 + h, 100)), misconception: "prob-subtract-decimal" });
    }
    return {
      prompt: `The probability that ${ctx.event} is ${dec(p)}. What is the probability that ${ctx.not}?`,
      answerHelp: PROB_HELP,
      answer: probDecimal(ans),
      answerText: dec(ans),
      wrongAnswers: cleanWrong(ans, wrong),
      hints: ["It either happens or it doesn't, so the two probabilities add up to 1.", hundredths ? `Write 1 as 1.00, then work out 1.00 − ${dec(p)}.` : `Work out 1 − ${dec(p)}.`],
      solution: ["The two probabilities add up to 1.", `1 − ${dec(p)} = ${dec(ans)}`, `Check: ${dec(ans)} + ${dec(p)} = 1. The answer is ${dec(ans)}`],
    };
  }

  const set = r.pick(OUTCOME_SETS);

  if (tier === 2 && roll < 0.7) {
    // Fractions with different denominators.
    const pair = r.pick([
      [2, 3], [3, 4], [4, 6], [3, 6], [4, 8], [5, 10], [2, 5], [4, 5], [3, 8], [6, 12],
    ] as const);
    let a1: Fraction, a2: Fraction, rest: Fraction;
    for (;;) {
      a1 = simplify(frac(r.int(1, pair[0] - 1), pair[0]));
      a2 = simplify(frac(r.int(1, pair[1] - 1), pair[1]));
      rest = frac(a1.d * a2.d - a1.n * a2.d - a2.n * a1.d, a1.d * a2.d);
      if (rest.n > 0) break;
    }
    const ans = simplify(rest);
    const sum = simplify(frac(a1.n * a2.d + a2.n * a1.d, a1.d * a2.d));
    const L = lcm(a1.d, a2.d);
    const outs = set.outcomes.slice(0, 3);
    return {
      prompt: `${set.thing} ${set.verb} ${list([...outs])} only. P(${outs[0]}) = ${show(a1)} and P(${outs[1]}) = ${show(a2)}. What is P(${outs[2]})?`,
      visual: { kind: "table", table: probTable(outs, [show(a1), show(a2), "?"], `${set.thing}: probabilities`) },
      answerHelp: PROB_HELP,
      answer: prob(ans),
      wrongAnswers: cleanWrong(ans, [
        { value: sum, misconception: "prob-gave-sum-not-missing" },
        { value: frac(a1.d + a2.d - a1.n - a2.n, a1.d + a2.d), misconception: "prob-added-fractions-wrongly" },
      ]),
      hints: ["All three probabilities add up to 1.", `Use a common denominator of ${L}: change both fractions into ${L}ths.`],
      solution: [
        `With a common denominator of ${L}: ${show(a1)} = ${(a1.n * L) / a1.d}/${L} and ${show(a2)} = ${(a2.n * L) / a2.d}/${L}.`,
        `Together: ${(a1.n * L) / a1.d + (a2.n * L) / a2.d}/${L}.`,
        `1 = ${L}/${L}, so P(${outs[2]}) = ${L}/${L} − ${(a1.n * L) / a1.d + (a2.n * L) / a2.d}/${L} = ${show(ans)}`,
      ],
    };
  }

  if (tier === 2) {
    // Two equal unknowns.
    const outs = set.outcomes;
    let p1: number, p2: number, rest: number;
    for (;;) {
      p1 = r.int(1, 9) * 5;
      p2 = r.int(1, 9) * 5;
      rest = 100 - p1 - p2;
      if (rest >= 10 && rest % 10 === 0 && p1 !== p2) break;
    }
    const ans = simplify(frac(rest / 2, 100));
    const restF = simplify(frac(rest, 100));
    const P1 = frac(p1, 100), P2 = frac(p2, 100);
    return {
      prompt: `${set.thing} ${set.verb} ${list([...outs])} only. P(${outs[0]}) = ${dec(P1)} and P(${outs[1]}) = ${dec(P2)}. ${cap(outs[2])} and ${outs[3]} are equally likely. What is P(${outs[2]})?`,
      visual: { kind: "table", table: probTable(outs, [dec(P1), dec(P2), "x", "x"], `${set.thing}: probabilities`) },
      answerHelp: PROB_HELP,
      answer: probDecimal(ans),
      answerText: dec(ans),
      wrongAnswers: cleanWrong(ans, [
        { value: restF, misconception: "prob-forgot-share" },
        { value: simplify(frac(p1 + p2, 100)), misconception: "prob-gave-sum-not-missing" },
      ]),
      hints: [`All four add up to 1. First find what's left: 1 − ${dec(P1)} − ${dec(P2)}.`, `${cap(outs[2])} and ${outs[3]} share what's left equally, so divide it by 2.`],
      solution: [
        `${dec(P1)} + ${dec(P2)} = ${dec(simplify(frac(p1 + p2, 100)))}`,
        `What's left: 1 − ${dec(simplify(frac(p1 + p2, 100)))} = ${dec(restF)}`,
        `Shared equally between two: ${dec(restF)} ÷ 2 = ${dec(ans)}`,
      ],
    };
  }

  // Tier 1: one missing value in tenths.
  const outs = set.outcomes.slice(0, 3);
  let a: number, b: number;
  do {
    a = r.int(1, 7);
    b = r.int(1, 8 - a);
  } while (10 - a - b < 1 || 10 - a - b === a + b);
  const ans = frac(10 - a - b, 10);
  const A = frac(a, 10), B = frac(b, 10);
  return {
    prompt: `${set.thing} ${set.verb} ${list([...outs])} only. P(${outs[0]}) = ${dec(A)} and P(${outs[1]}) = ${dec(B)}. What is P(${outs[2]})?`,
    visual: { kind: "table", table: probTable(outs, [dec(A), dec(B), "?"], `${set.thing}: probabilities`) },
    answerHelp: PROB_HELP,
    answer: probDecimal(ans),
    answerText: dec(ans),
    wrongAnswers: cleanWrong(ans, [{ value: frac(a + b, 10), misconception: "prob-gave-sum-not-missing" }]),
    hints: ["The probabilities of all the outcomes add up to 1.", `Add the two you know, then take that away from 1.`],
    solution: [`${dec(A)} + ${dec(B)} = ${dec(frac(a + b, 10))}`, `All the probabilities add up to 1.`, `1 − ${dec(frac(a + b, 10))} = ${dec(ans)}`],
  };
};


// ------------------------------------------------ relative frequency and expected outcomes

const EXPERIMENTS = [
  { thing: "A drawing pin is dropped", event: "lands point up", noun: "drops" },
  { thing: "A piece of toast is dropped", event: "lands butter side down", noun: "drops" },
  { thing: "A paper cup is thrown", event: "lands on its side", noun: "throws" },
  { thing: "A basketball player takes shots", event: "scores", noun: "shots" },
] as const;

const relativeFrequency: Gen = (r, tier) => {
  const roll = r.next();

  if (tier === 1 && roll < 0.4) {
    const dice = r.next() < 0.35;
    const N = r.pick([20, 25, 40, 50, 60, 100]);
    let k = r.int(Math.ceil(N / 10), Math.floor((N * 9) / 10));
    if (dice) while (k * 6 === N) k++;
    const ans = frac(k, N);
    const prompt = dice
      ? `Mia rolls a dice ${N} times. It lands on 6 a total of ${k} times. What is the relative frequency of rolling a 6?`
      : (() => {
          const e = r.pick(EXPERIMENTS);
          return e.noun === "shots"
            ? `A basketball player takes ${N} shots and scores ${k} times. What is the relative frequency of scoring?`
            : `${e.thing} ${N} times. It ${e.event} ${k} times. What is the relative frequency that it ${e.event}?`;
        })();
    return {
      prompt,
      answerHelp: PROB_HELP,
      answer: prob(ans),
      wrongAnswers: cleanWrong(ans, [
        { value: frac(N, k), misconception: "prob-rf-upside-down" },
        { value: k, misconception: "prob-gave-count" },
        ...(dice ? [{ value: frac(1, 6), misconception: "prob-used-theory" }] : []),
      ]),
      hints: ["Relative frequency = number of times it happened ÷ total number of trials.", `It happened ${k} times out of ${N}.`],
      solution: ["Relative frequency = times it happened out of the number of trials.", `${k} out of ${N}.`, `Relative frequency = ${show(ans)}`],
    };
  }

  if (tier === 1 && roll < 0.75) {
    const t = r.int(1, 9);
    const p = frac(t, 10);
    const N = r.pick([20, 30, 40, 50, 60, 80, 100, 150, 200, 300, 500]);
    const E = (t * N) / 10;
    const ctx = r.pick([
      { a: `The probability that a spinner lands on red is ${dec(p)}.`, b: `The spinner is spun ${N} times.`, c: "lands on red" },
      { a: `The probability that a train is late is ${dec(p)}.`, b: `There are ${N} trains this month.`, c: "is late" },
      { a: `The probability that a biased coin lands on heads is ${dec(p)}.`, b: `It is flipped ${N} times.`, c: "lands on heads" },
    ]);
    const ask = ctx.c === "is late" ? "How many trains would you expect to be late?" : `How many times would you expect it to land ${ctx.c.replace("lands ", "")}?`;
    return {
      prompt: `${ctx.a} ${ctx.b} ${ask}`,
      answerHelp: COUNT_HELP,
      answer: { kind: "integer", value: E },
      wrongAnswers: cleanWrong(E, [
        { value: N - E, misconception: "prob-expected-complement" },
        { value: p, misconception: "prob-expected-gave-probability" },
      ]),
      hints: ["Expected number = probability × number of trials.", `Work out ${dec(p)} × ${N}.`],
      solution: ["Expected number = probability × number of trials.", `${dec(p)} × ${N} = ${E}`, `Expect about ${E}`],
    };
  }

  if (tier === 1) {
    const coin = r.next() < 0.3;
    const per = coin ? 2 : 6;
    const N = per * r.int(coin ? 5 : 3, coin ? 50 : 30);
    const E = N / per;
    const face = coin ? "heads" : `a ${r.int(1, 6)}`;
    return {
      prompt: coin
        ? `A fair coin is flipped ${N} times. How many times would you expect it to land on heads?`
        : `A fair six-sided dice is rolled ${N} times. How many times would you expect to roll ${face}?`,
      answerHelp: COUNT_HELP,
      answer: { kind: "integer", value: E },
      wrongAnswers: cleanWrong(E, [
        { value: frac(1, per), misconception: "prob-expected-gave-probability" },
        { value: N - E, misconception: "prob-expected-complement" },
      ]),
      hints: [`The probability of ${face} is 1/${per}.`, `Find 1/${per} of ${N}: ${N} ÷ ${per}.`],
      solution: [`P(${face}) = 1/${per}.`, `Expected number = 1/${per} × ${N} = ${N} ÷ ${per}.`, `Expect about ${E}`],
    };
  }

  // Tier 2
  if (roll < 0.33) {
    const b = r.pick([3, 4, 5, 6, 8, 10]);
    const a = r.int(2, b - 1);
    const p = simplify(frac(a, b));
    const N = p.d * r.int(4, 30);
    const E = (N / p.d) * p.n;
    return {
      prompt: `The probability that a biased spinner lands on blue is ${show(p)}. It is spun ${N} times. How many times would you expect it to land on blue?`,
      answerHelp: COUNT_HELP,
      answer: { kind: "integer", value: E },
      wrongAnswers: cleanWrong(E, [
        ...(p.n > 1 && N % p.n === 0 ? [{ value: N / p.n, misconception: "prob-expected-divided-top" }] : []),
        { value: N - E, misconception: "prob-expected-complement" },
        { value: p, misconception: "prob-expected-gave-probability" },
      ]),
      hints: ["Expected number = probability × number of trials.", `Find ${show(p)} of ${N}: divide by ${p.d}, then multiply by ${p.n}.`],
      solution: [`${show(p)} of ${N}:`, `${N} ÷ ${p.d} = ${N / p.d}, then ${N / p.d} × ${p.n} = ${E}.`, `Expect about ${E}`],
    };
  }

  // A results table.
  const N = r.pick([40, 50, 80, 100, 200]);
  const outs = ["red", "blue", "green", "yellow"];
  let f: number[];
  do {
    const a = r.int(Math.ceil(N / 10), Math.floor(N / 3));
    const b = r.int(Math.ceil(N / 10), Math.floor(N / 3));
    const c = r.int(Math.ceil(N / 10), Math.floor(N / 3));
    f = [a, b, c, N - a - b - c];
  } while (f[3] < 1 || new Set(f).size < 4 || f.some((x) => x * 4 === N));
  const i = r.int(0, 3);
  const table: TableSpec = {
    corner: "Colour",
    columns: outs,
    rows: [{ head: "Frequency", cells: f.map(String) }],
    description: `Results of spinning a spinner ${N} times. ${outs.map((o, j) => `${o}: ${f[j]}`).join(", ")}.`,
  };

  if (roll < 0.66) {
    const ans = frac(f[i], N);
    return {
      prompt: `Sam spins a four-colour spinner and records the results in the table. What is the relative frequency of ${outs[i]}?`,
      visual: { kind: "table", table },
      answerHelp: PROB_HELP,
      answer: prob(ans),
      wrongAnswers: cleanWrong(ans, [
        { value: frac(f[i], N - f[i]), misconception: "prob-rf-wrong-total" },
        { value: f[i], misconception: "prob-gave-count" },
        { value: frac(1, 4), misconception: "prob-used-theory" },
        { value: frac(N, f[i]), misconception: "prob-rf-upside-down" },
      ]),
      hints: ["First add up all the frequencies to find the number of spins.", `${f.join(" + ")} = ${N}. ${cap(outs[i])} came up ${f[i]} times.`],
      solution: [`Total spins: ${f.join(" + ")} = ${N}.`, `${cap(outs[i])}: ${f[i]} times.`, `Relative frequency = ${show(ans)}`],
    };
  }

  const t = r.pick([2, 3, 4, 5, 10]);
  const M = N * t;
  const E = f[i] * t;
  return {
    prompt: `Sam spins a spinner ${N} times and records the results in the table. Sam is going to spin it ${M} more times. Use the results to estimate how many of those spins will land on ${outs[i]}.`,
    visual: { kind: "table", table },
    answerHelp: COUNT_HELP,
    answer: { kind: "integer", value: E },
    wrongAnswers: cleanWrong(E, [
      { value: f[i], misconception: "prob-gave-count" },
      ...(M % 4 === 0 ? [{ value: M / 4, misconception: "prob-used-theory" }] : []),
      { value: frac(f[i], N), misconception: "prob-expected-gave-probability" },
    ]),
    hints: [`Use the relative frequency as the probability: ${outs[i]} came up ${f[i]} out of ${N} times.`, `Find ${f[i]}/${N} of ${M}. ${M} is ${t} times ${N}.`],
    solution: [`Relative frequency of ${outs[i]} = ${f[i]}/${N}.`, `Estimate = ${f[i]}/${N} × ${M}. Since ${M} = ${t} × ${N}, that's ${f[i]} × ${t}.`, `Estimate: ${E}`],
  };
};

// ------------------------------------------------ sample spaces

type Op = "+" | "×" | "−";
const OP_NAME: Record<Op, string> = { "+": "added", "×": "multiplied", "−": "the smaller is taken from the bigger" };
const opApply = (op: Op, a: number, b: number) => (op === "+" ? a + b : op === "×" ? a * b : Math.abs(a - b));

/** A grid of results for two numbered spinners or dice. */
function grid(rowsN: number, colsN: number, op: Op, rowName: string, colName: string, hl: (v: number) => boolean): { table: TableSpec; values: number[]; count: number } {
  const values: number[] = [];
  const highlight: [number, number][] = [];
  const rows = Array.from({ length: rowsN }, (_, i) => ({
    head: String(i + 1),
    cells: Array.from({ length: colsN }, (_, j) => {
      const v = opApply(op, i + 1, j + 1);
      values.push(v);
      if (hl(v)) highlight.push([i, j]);
      return String(v);
    }),
  }));
  return {
    table: {
      corner: op,
      columns: Array.from({ length: colsN }, (_, j) => String(j + 1)),
      rows,
      description: `Sample space diagram: ${rowName} down the side (1 to ${rowsN}), ${colName} across the top (1 to ${colsN}). Each cell is the two scores ${op === "−" ? "subtracted" : OP_NAME[op]}.`,
    },
    values,
    count: highlight.length,
  };
}

const SHAPES: [number, number, string, string][] = [
  [6, 6, "the first dice", "the second dice"],
  [4, 6, "the spinner", "the dice"],
  [3, 4, "spinner A", "spinner B"],
  [4, 4, "spinner A", "spinner B"],
  [3, 6, "the spinner", "the dice"],
  [5, 5, "spinner A", "spinner B"],
];

function describeTwo(rowsN: number, colsN: number, rowName: string, colName: string) {
  const thing = (n: number, name: string) => (name.includes("dice") ? "a fair six-sided dice" : `a fair spinner numbered 1 to ${n}`);
  if (rowName === "the first dice") return "Two fair six-sided dice are rolled";
  if (rowName === "spinner A") return rowsN === colsN ? `Two fair spinners, each numbered 1 to ${rowsN}, are spun` : `A fair spinner numbered 1 to ${rowsN} and a fair spinner numbered 1 to ${colsN} are spun`;
  return `${cap(thing(rowsN, rowName))} is spun and ${thing(colsN, colName)} is rolled`;
}

const sampleSpace: Gen = (r, tier) => {
  const roll = r.next();

  if (tier === 1 && roll < 0.35) {
    const things = shuffle(r, [
      { say: "a coin is flipped", n: 2, list: ["heads", "tails"] },
      { say: "a dice is rolled", n: 6, list: ["1", "2", "3", "4", "5", "6"] },
      { say: "a spinner with 3 colours (red, blue, green) is spun", n: 3, list: ["red", "blue", "green"] },
      { say: "a spinner numbered 1 to 4 is spun", n: 4, list: ["1", "2", "3", "4"] },
      { say: "a letter is picked from A, B, C, D, E", n: 5, list: ["A", "B", "C", "D", "E"] },
    ]).slice(0, 2);
    const ans = things[0].n * things[1].n;
    return {
      prompt: `${cap(things[0].say)} and ${things[1].say}. How many different outcomes are possible altogether?`,
      answerHelp: COUNT_HELP,
      answer: { kind: "integer", value: ans },
      wrongAnswers: cleanWrong(ans, [{ value: things[0].n + things[1].n, misconception: "prob-added-outcomes" }]),
      hints: [`Each of the ${things[0].n} outcomes for the first can go with each of the ${things[1].n} outcomes for the second.`, `Picture a grid with ${things[0].n} rows and ${things[1].n} columns.`],
      solution: [
        `For example: ${things[0].list[0]} with ${things[1].list[0]}, ${things[0].list[0]} with ${things[1].list[1]}, and so on.`,
        `That's ${things[0].n} × ${things[1].n} outcomes.`,
        `${things[0].n} × ${things[1].n} = ${ans}`,
      ],
    };
  }

  if (tier === 1) {
    const [rowsN, colsN, rowName, colName] = r.pick(SHAPES.slice(0, 5));
    const values = Array.from({ length: rowsN * colsN }, (_, k) => Math.floor(k / colsN) + 1 + (k % colsN) + 1);
    const t = r.pick(values);
    const g = grid(rowsN, colsN, "+", rowName, colName, (v) => v === t);
    const cells = rowsN * colsN;
    const ans = frac(g.count, cells);
    const distinct = new Set(values).size;
    return {
      prompt: `${describeTwo(rowsN, colsN, rowName, colName)}, and the two scores are added. The sample space diagram shows every total. What is the probability that the total is ${t}?`,
      visual: { kind: "table", table: g.table },
      answerHelp: PROB_HELP,
      answer: prob(ans),
      wrongAnswers: cleanWrong(ans, [
        { value: g.count, misconception: "prob-gave-count" },
        { value: frac(1, distinct), misconception: "prob-totals-equally-likely" },
        { value: frac(g.count, rowsN + colsN), misconception: "prob-grid-wrong-total" },
      ]),
      hints: [`Count every cell in the grid: ${rowsN} × ${colsN} = ${cells}.`, `Now count the cells that say ${t}.`],
      solution: [`There are ${rowsN} × ${colsN} = ${cells} equally likely outcomes.`, `${g.count} of them ${g.count === 1 ? "has" : "have"} a total of ${t}.`, `P(total ${t}) = ${show(ans)}`],
    };
  }

  // Tier 2
  if (roll < 0.25) {
    const menu = r.next() < 0.5;
    const a = r.int(2, 6), b = r.int(2, 6), c = r.int(2, 5);
    const three = r.next() < 0.6;
    const ans = three ? a * b * c : a * b;
    const prompt = menu
      ? three
        ? `A café menu has ${a} starters, ${b} main courses and ${c} desserts. How many different three-course meals (one of each) can you choose?`
        : `A café menu has ${a} sandwiches and ${b} drinks. How many different meal deals of one sandwich and one drink are there?`
      : three
        ? `Ava has ${a} tops, ${b} pairs of trousers and ${c} pairs of shoes. How many different outfits of one top, one pair of trousers and one pair of shoes can Ava make?`
        : `Ava has ${a} tops and ${b} pairs of trousers. How many different outfits of one top and one pair of trousers can Ava make?`;
    return {
      prompt,
      answerHelp: COUNT_HELP,
      answer: { kind: "integer", value: ans },
      wrongAnswers: cleanWrong(ans, [{ value: three ? a + b + c : a + b, misconception: "prob-added-outcomes" }]),
      hints: ["Every choice of the first thing can go with every choice of the second.", "Multiply the numbers of choices together."],
      solution: [
        "Each choice can go with every other choice, so multiply.",
        three ? `${a} × ${b} × ${c}` : `${a} × ${b}`,
        three ? `${a} × ${b} × ${c} = ${ans}` : `${a} × ${b} = ${ans}`,
      ],
    };
  }

  if (roll < 0.45) {
    // Coin and dice, listed in a table.
    const evs = [
      { say: "heads and an even number", h: true, test: (x: number) => x % 2 === 0 },
      { say: "tails and a number bigger than 4", h: false, test: (x: number) => x > 4 },
      { say: "heads and a 6", h: true, test: (x: number) => x === 6 },
      { say: "tails and a prime number", h: false, test: (x: number) => [2, 3, 5].includes(x) },
      { say: "heads and a number less than 3", h: true, test: (x: number) => x < 3 },
    ];
    const e = r.pick(evs);
    const hl: [number, number][] = [];
    for (let j = 0; j < 6; j++) if (e.test(j + 1)) hl.push([e.h ? 0 : 1, j]);
    const k = hl.length;
    const ans = frac(k, 12);
    return {
      prompt: `A fair coin is flipped and a fair six-sided dice is rolled. The table lists every outcome (H = heads, T = tails). What is the probability of getting ${e.say}?`,
      visual: {
        kind: "table",
        table: {
          corner: "",
          columns: ["1", "2", "3", "4", "5", "6"],
          rows: [
            { head: "H", cells: ["H1", "H2", "H3", "H4", "H5", "H6"] },
            { head: "T", cells: ["T1", "T2", "T3", "T4", "T5", "T6"] },
          ],
          description: "Every outcome of a coin and a dice: H1 to H6 and T1 to T6, 12 outcomes.",
        },
      },
      answerHelp: PROB_HELP,
      answer: prob(ans),
      wrongAnswers: cleanWrong(ans, [
        { value: k, misconception: "prob-gave-count" },
        { value: frac(k, 8), misconception: "prob-grid-wrong-total" },
        { value: frac(k, 6), misconception: "prob-grid-wrong-total" },
      ]),
      hints: ["There are 2 × 6 = 12 outcomes in the table.", `Find the cells that are ${e.say}.`],
      solution: [
        "There are 2 × 6 = 12 equally likely outcomes.",
        `${e.say.replace(/^./, (c) => c.toUpperCase())}: ${hl.map(([i, j]) => `${i === 0 ? "H" : "T"}${j + 1}`).join(", ")}. That's ${k}.`,
        `P = ${show(ans)}`,
      ],
    };
  }

  // Grid with an inequality, an "even" event, or a product.
  const [rowsN, colsN, rowName, colName] = r.pick(SHAPES);
  const op: Op = r.pick(["+", "+", "×", "−"] as const);
  const all = Array.from({ length: rowsN * colsN }, (_, k) => opApply(op, Math.floor(k / colsN) + 1, (k % colsN) + 1));
  const sorted = [...new Set(all)].sort((x, y) => x - y);
  const kind = r.pick(["more", "atleast", "even", "less"] as const);
  const t = sorted[r.int(1, Math.max(1, sorted.length - 3))];
  const test = kind === "more" ? (v: number) => v > t : kind === "atleast" ? (v: number) => v >= t : kind === "less" ? (v: number) => v < t : (v: number) => v % 2 === 0;
  const off = kind === "more" ? (v: number) => v >= t : kind === "atleast" ? (v: number) => v > t : kind === "less" ? (v: number) => v <= t : null;
  const g = grid(rowsN, colsN, op, rowName, colName, test);
  const cells = rowsN * colsN;
  const word = op === "+" ? "total" : op === "×" ? "product" : "difference";
  const ask = kind === "more" ? `more than ${t}` : kind === "atleast" ? `at least ${t}` : kind === "less" ? `less than ${t}` : "an even number";
  const offCount = off ? all.filter(off).length : null;
  const ans = frac(g.count, cells);
  // Students find the cells themselves, so nothing is highlighted.
  const table = { ...g.table, highlight: undefined };
  return {
    prompt: `${describeTwo(rowsN, colsN, rowName, colName)}, and ${op === "−" ? "the smaller score is taken away from the bigger one (the difference)" : `the two scores are ${OP_NAME[op]}`}. The sample space diagram shows every ${word}. What is the probability that the ${word} is ${ask}?`,
    visual: { kind: "table", table },
    answerHelp: PROB_HELP,
    answer: prob(ans),
    wrongAnswers: cleanWrong(ans, [
      { value: g.count, misconception: "prob-gave-count" },
      { value: frac(g.count, rowsN + colsN), misconception: "prob-grid-wrong-total" },
      ...(offCount !== null ? [{ value: frac(offCount, cells), misconception: "prob-boundary" }] : []),
    ]),
    hints: [
      `There are ${rowsN} × ${colsN} = ${cells} cells.`,
      kind === "more" ? `"More than ${t}" does not include ${t}.` : kind === "atleast" ? `"At least ${t}" includes ${t}.` : kind === "less" ? `"Less than ${t}" does not include ${t}.` : "Even numbers end in 0, 2, 4, 6 or 8.",
    ],
    solution: [`There are ${rowsN} × ${colsN} = ${cells} equally likely outcomes.`, `${g.count} of the cells ${g.count === 1 ? "is" : "are"} ${ask}.`, `P = ${show(ans)}`],
  };
};

// ------------------------------------------------ Venn diagrams

const VENN_CONTEXTS = [
  { group: "students in a class", a: "Football", b: "Tennis", aSay: "play football", bSay: "play tennis", noun: "student" },
  { group: "people in a survey", a: "Cat", b: "Dog", aSay: "have a cat", bSay: "have a dog", noun: "person" },
  { group: "students in Year 9", a: "Art", b: "Music", aSay: "take art", bSay: "take music", noun: "student" },
  { group: "members of a club", a: "Swim", b: "Run", aSay: "swim", bSay: "run", noun: "member" },
] as const;

const NUMBER_SETS = [
  { a: "Even", b: "Multiple of 3", sayA: "even numbers", sayB: "multiples of 3", ta: (x: number) => x % 2 === 0, tb: (x: number) => x % 3 === 0 },
  { a: "Odd", b: "Multiple of 3", sayA: "odd numbers", sayB: "multiples of 3", ta: (x: number) => x % 2 === 1, tb: (x: number) => x % 3 === 0 },
  { a: "Even", b: "Multiple of 5", sayA: "even numbers", sayB: "multiples of 5", ta: (x: number) => x % 2 === 0, tb: (x: number) => x % 5 === 0 },
  { a: "Factor of 12", b: "Even", sayA: "factors of 12", sayB: "even numbers", ta: (x: number) => 12 % x === 0, tb: (x: number) => x % 2 === 0 },
  { a: "Square number", b: "Odd", sayA: "square numbers", sayB: "odd numbers", ta: (x: number) => Number.isInteger(Math.sqrt(x)), tb: (x: number) => x % 2 === 1 },
];

const venn: Gen = (r, tier) => {
  const roll = r.next();

  if (tier === 2 && roll < 0.3) {
    // Fill in from totals.
    const ctx = r.pick(VENN_CONTEXTS);
    const both = r.int(2, 9), onlyA = r.int(2, 12), onlyB = r.int(2, 12), neither = r.int(1, 8);
    const A = onlyA + both, B = onlyB + both, T = onlyA + both + onlyB + neither;
    const ask = r.pick(["neither", "onlyA"] as const);
    const ans = ask === "neither" ? neither : onlyA;
    return {
      prompt:
        ask === "neither"
          ? `There are ${T} ${ctx.group}. ${A} ${ctx.aSay}, ${B} ${ctx.bSay}, and ${both} do both. How many do neither?`
          : `There are ${T} ${ctx.group}. ${A} ${ctx.aSay}, ${B} ${ctx.bSay}, and ${both} do both. How many ${ctx.aSay} but not ${ctx.bSay.replace(/^(play|have|take) /, "")}?`,
      visual: { kind: "venn", venn: { a: ctx.a, b: ctx.b, onlyA: ask === "onlyA" ? "?" : "", both: String(both), onlyB: "", neither: ask === "neither" ? "?" : "", description: `A Venn diagram with circles ${ctx.a} and ${ctx.b}. The overlap shows ${both}. The other regions are blank to fill in.` } },
      answerHelp: COUNT_HELP,
      answer: { kind: "integer", value: ans },
      wrongAnswers: cleanWrong(ans, ask === "neither" ? [{ value: T - A - B, misconception: "prob-venn-double-count" }] : [{ value: A, misconception: "prob-venn-double-count" }]),
      hints: [`Put the ${both} who do both in the overlap first.`, `Then ${ctx.a} only = ${A} − ${both}, and ${ctx.b} only = ${B} − ${both}.`],
      solution: [
        `Overlap: ${both}. ${ctx.a} only: ${A} − ${both} = ${onlyA}. ${ctx.b} only: ${B} − ${both} = ${onlyB}.`,
        ask === "neither" ? `Inside the circles: ${onlyA} + ${both} + ${onlyB} = ${onlyA + both + onlyB}.` : `"But not" means leave out the overlap: that's the ${ctx.a}-only part.`,
        ask === "neither" ? `Neither: ${T} − ${onlyA + both + onlyB} = ${neither}` : `Answer: ${onlyA}`,
      ],
    };
  }

  if (tier === 2 && roll < 0.6) {
    // Numbers listed in the regions.
    const s = r.pick(NUMBER_SETS);
    const N = r.int(10, 15);
    const nums = Array.from({ length: N }, (_, i) => i + 1);
    const reg = {
      onlyA: nums.filter((x) => s.ta(x) && !s.tb(x)),
      both: nums.filter((x) => s.ta(x) && s.tb(x)),
      onlyB: nums.filter((x) => !s.ta(x) && s.tb(x)),
      neither: nums.filter((x) => !s.ta(x) && !s.tb(x)),
    };
    const union = reg.onlyA.length + reg.both.length + reg.onlyB.length;
    const q = reg.both.length > 0 ? r.pick(["inter", "union", "A"] as const) : r.pick(["union", "A"] as const);
    const k = q === "inter" ? reg.both.length : q === "union" ? union : reg.onlyA.length + reg.both.length;
    const ans = frac(k, N);
    const say = q === "inter" ? "A ∩ B" : q === "union" ? "A ∪ B" : "A";
    const wrong: Wrong[] =
      q === "inter"
        ? [{ value: frac(union, N), misconception: "prob-venn-intersection-union" }, { value: k, misconception: "prob-gave-count" }]
        : q === "union"
          ? [{ value: frac(reg.both.length, N), misconception: "prob-venn-intersection-union" }, { value: k, misconception: "prob-gave-count" }]
          : [{ value: frac(reg.onlyA.length, N), misconception: "prob-venn-only-region" }, { value: k, misconception: "prob-gave-count" }];
    const join = (xs: number[]) => xs.join(", ");
    return {
      prompt: `ξ = the whole numbers from 1 to ${N}. A = ${s.sayA}, B = ${s.sayB}. One number is picked at random. What is P(${say})?`,
      visual: {
        kind: "venn",
        venn: {
          a: `A: ${s.a}`,
          b: `B: ${s.b}`,
          onlyA: join(reg.onlyA),
          both: join(reg.both),
          onlyB: join(reg.onlyB),
          neither: join(reg.neither),
          description: `Venn diagram of the numbers 1 to ${N}. A only: ${join(reg.onlyA) || "none"}. Both: ${join(reg.both) || "none"}. B only: ${join(reg.onlyB) || "none"}. Neither: ${join(reg.neither) || "none"}.`,
        },
      },
      answerHelp: PROB_HELP,
      answer: prob(ans),
      wrongAnswers: cleanWrong(ans, wrong),
      hints: [
        q === "inter" ? "∩ means \"and\": the numbers in both circles, the overlap." : q === "union" ? "∪ means \"or\": every number inside either circle, including the overlap." : "A means every number inside circle A, including the overlap.",
        `There are ${N} numbers altogether.`,
      ],
      solution: [
        q === "inter" ? `A ∩ B is the overlap: ${join(reg.both)}. That's ${k}.` : q === "union" ? `A ∪ B is everything inside the circles: ${k} numbers.` : `Circle A holds ${join([...reg.onlyA, ...reg.both].sort((x, y) => x - y))}. That's ${k}.`,
        `There are ${N} numbers in ξ.`,
        `P(${say}) = ${show(ans)}`,
      ],
    };
  }

  const ctx = r.pick(VENN_CONTEXTS);
  const max = tier === 1 ? 12 : 15;
  const v = { onlyA: r.int(1, max), both: r.int(1, 9), onlyB: r.int(1, max), neither: r.int(1, 9) };
  const T = v.onlyA + v.both + v.onlyB + v.neither;
  const spec: VennSpec = {
    a: ctx.a,
    b: ctx.b,
    onlyA: String(v.onlyA),
    both: String(v.both),
    onlyB: String(v.onlyB),
    neither: String(v.neither),
    description: `A Venn diagram of ${ctx.group}. ${ctx.a} only: ${v.onlyA}. Both: ${v.both}. ${ctx.b} only: ${v.onlyB}. Neither: ${v.neither}.`,
  };
  const visual = { kind: "venn" as const, venn: spec };

  if (tier === 2) {
    // Set notation with counts.
    const q = r.pick(["inter", "union", "P-union", "P-inter"] as const);
    const union = v.onlyA + v.both + v.onlyB;
    if (q === "inter" || q === "union") {
      const ans = q === "inter" ? v.both : union;
      return {
        prompt: `The Venn diagram shows ${ctx.group}. A = ${ctx.aSay}, B = ${ctx.bSay}. How many are in ${q === "inter" ? "A ∩ B" : "A ∪ B"}?`,
        visual: { kind: "venn", venn: { ...spec, a: `A: ${ctx.a}`, b: `B: ${ctx.b}` } },
        answerHelp: COUNT_HELP,
        answer: { kind: "integer", value: ans },
        wrongAnswers: cleanWrong(
          ans,
          q === "inter"
            ? [{ value: union, misconception: "prob-venn-intersection-union" }]
            : [{ value: v.both, misconception: "prob-venn-intersection-union" }, { value: union + v.both, misconception: "prob-venn-double-count" }, { value: T, misconception: "prob-venn-intersection-union" }],
        ),
        hints: [q === "inter" ? "∩ means \"and\": in both A and B." : "∪ means \"or\": in A, or B, or both.", q === "inter" ? "That's only the overlap." : "Add the three numbers inside the circles. Leave out the number outside."],
        solution: q === "inter" ? [`A ∩ B means in both: the overlap.`, `The overlap shows ${v.both}.`, `Answer: ${v.both}`] : [`A ∪ B means in A or B or both: everything inside the circles.`, `${v.onlyA} + ${v.both} + ${v.onlyB}`, `Answer: ${union}`],
      };
    }
    const k = q === "P-inter" ? v.both : union;
    const ans = frac(k, T);
    return {
      prompt: `The Venn diagram shows ${ctx.group}. A = ${ctx.aSay}, B = ${ctx.bSay}. One ${ctx.noun} is chosen at random. What is ${q === "P-inter" ? "P(A ∩ B)" : "P(A ∪ B)"}?`,
      visual: { kind: "venn", venn: { ...spec, a: `A: ${ctx.a}`, b: `B: ${ctx.b}` } },
      answerHelp: PROB_HELP,
      answer: prob(ans),
      wrongAnswers: cleanWrong(ans, [
        { value: frac(q === "P-inter" ? union : v.both, T), misconception: "prob-venn-intersection-union" },
        { value: frac(k, T - v.neither), misconception: "prob-venn-forgot-outside" },
        { value: k, misconception: "prob-gave-count" },
      ]),
      hints: [q === "P-inter" ? "A ∩ B is the overlap." : "A ∪ B is everything inside the circles.", `The total is all four numbers: ${v.onlyA} + ${v.both} + ${v.onlyB} + ${v.neither} = ${T}.`],
      solution: [
        q === "P-inter" ? `A ∩ B: ${v.both}.` : `A ∪ B: ${v.onlyA} + ${v.both} + ${v.onlyB} = ${union}.`,
        `Total: ${v.onlyA} + ${v.both} + ${v.onlyB} + ${v.neither} = ${T}.`,
        `P = ${show(ans)}`,
      ],
    };
  }

  // Tier 1
  const q = r.pick(["total", "A", "P-both", "P-A", "P-neither"] as const);
  if (q === "total" || q === "A") {
    const ans = q === "total" ? T : v.onlyA + v.both;
    return {
      prompt: q === "total" ? `The Venn diagram shows some ${ctx.group}. How many ${ctx.group.split(" ")[0]} are there altogether?` : `The Venn diagram shows some ${ctx.group}. How many ${ctx.aSay}? (Some of them also ${ctx.bSay}.)`,
      visual,
      answerHelp: COUNT_HELP,
      answer: { kind: "integer", value: ans },
      wrongAnswers: cleanWrong(ans, q === "total" ? [{ value: T - v.neither, misconception: "prob-venn-forgot-outside" }, { value: T + v.both, misconception: "prob-venn-double-count" }] : [{ value: v.onlyA, misconception: "prob-venn-only-region" }]),
      hints: q === "total" ? ["Add every number in the diagram, including the one outside the circles.", `${v.onlyA} + ${v.both} + ${v.onlyB} + ${v.neither}`] : [`Everyone inside the ${ctx.a} circle counts, including the overlap.`, `${v.onlyA} + ${v.both}`],
      solution:
        q === "total"
          ? ["Add all four regions, including outside the circles.", `${v.onlyA} + ${v.both} + ${v.onlyB} + ${v.neither}`, `Total: ${T}`]
          : [`The ${ctx.a} circle has two parts: ${ctx.a} only (${v.onlyA}) and the overlap (${v.both}).`, `${v.onlyA} + ${v.both}`, `Answer: ${ans}`],
    };
  }
  const k = q === "P-both" ? v.both : q === "P-A" ? v.onlyA + v.both : v.neither;
  const ans = frac(k, T);
  const ask = q === "P-both" ? `${ctx.aSay} and ${ctx.bSay.replace(/^(play|have|take) /, "")}` : q === "P-A" ? ctx.aSay : `${ctx.aSay.startsWith("have") ? "have" : "do"} neither`;
  return {
    prompt: `The Venn diagram shows some ${ctx.group}. One ${ctx.noun} is chosen at random. What is the probability that they ${ask}?`,
    visual,
    answerHelp: PROB_HELP,
    answer: prob(ans),
    wrongAnswers: cleanWrong(ans, [
      { value: k, misconception: "prob-gave-count" },
      { value: frac(k, T - v.neither), misconception: "prob-venn-forgot-outside" },
      ...(q === "P-A" ? [{ value: frac(v.onlyA, T), misconception: "prob-venn-only-region" }] : []),
    ]),
    hints: [`The total is all four numbers: ${v.onlyA} + ${v.both} + ${v.onlyB} + ${v.neither} = ${T}.`, q === "P-both" ? "Both means the overlap in the middle." : q === "P-A" ? `Count everyone in the ${ctx.a} circle, including the overlap.` : "Neither means outside both circles."],
    solution: [
      `Total: ${v.onlyA} + ${v.both} + ${v.onlyB} + ${v.neither} = ${T}.`,
      q === "P-both" ? `In the overlap: ${k}.` : q === "P-A" ? `In the ${ctx.a} circle: ${v.onlyA} + ${v.both} = ${k}.` : `Outside both circles: ${k}.`,
      `P = ${show(ans)}`,
    ],
  };
};

export const PROBABILITY_GENERATORS: Record<string, Gen> = {
  "prob-scale": probScale,
  "prob-single-event": singleEvent,
  "prob-sum-to-one": sumToOne,
  "prob-relative-frequency": relativeFrequency,
  "prob-sample-space": sampleSpace,
  "prob-venn": venn,
};
