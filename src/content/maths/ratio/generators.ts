/**
 * Question generators for the ratio and proportion chain.
 *
 * Every number is chosen so the answer is a whole number, a simple fraction
 * or an exact amount of money, and every predicted wrong answer is checked
 * so it never equals the right one. Ratio answers are typed with a colon
 * (3:2), and any equivalent ratio is accepted unless the question asks for
 * the simplest form.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher.
 */

import { equals, frac, gcd, simplify, type Fraction } from "@/engine/fraction";
import { sameRatio } from "@/engine/marking";
import type { Rng } from "@/engine/random";
import type { Question } from "@/engine/types";

export type Tier = 1 | 2;
type Gen = (r: Rng, tier: Tier) => Omit<Question, "id" | "skillId">;
type Wrong = Question["wrongAnswers"][number];

const RATIO_HINT = "Type a ratio with a colon, like 3:2.";
const MONEY_HINT = "Type an amount in pounds, like 4.50. The £ sign is fine but not needed.";

const NAMES = ["Amy", "Ben", "Chloe", "Dev", "Ella", "Femi", "Grace", "Hassan", "Isla", "Jay", "Kai", "Leah"] as const;

/** Two different names. */
function twoNames(r: Rng): [string, string] {
  const a = r.pick(NAMES);
  let b = r.pick(NAMES);
  while (b === a) b = r.pick(NAMES);
  return [a, b];
}
function threeNames(r: Rng): [string, string, string] {
  const [a, b] = twoNames(r);
  let c = r.pick(NAMES);
  while (c === a || c === b) c = r.pick(NAMES);
  return [a, b, c];
}

/** Two different whole numbers with no common factor, from lo..hi. */
function coprimePair(r: Rng, lo: number, hi: number): [number, number] {
  for (;;) {
    const a = r.int(lo, hi);
    const b = r.int(lo, hi);
    if (a !== b && gcd(a, b) === 1) return [a, b];
  }
}

/** £ amount from pence: £3.50, or £12 for whole pounds. */
export function money(pence: number): string {
  return pence % 100 === 0 ? `£${pence / 100}` : `£${(pence / 100).toFixed(2)}`;
}
const poundsValue = (pence: number) => frac(pence, 100);

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
/** 2.5 not 5/2, for multipliers in working. */
const dec = (x: number) => String(Math.round(x * 1000) / 1000);

const asFrac = (v: Wrong["value"]): Fraction | null => (Array.isArray(v) ? null : typeof v === "number" ? frac(v) : v);

/** Drop wrong answers that equal the right one, that aren't positive, or that repeat. */
function cleanWrong(correct: Fraction | number[], wrong: Wrong[]): Wrong[] {
  const kept: Wrong[] = [];
  for (const w of wrong) {
    if (Array.isArray(correct) || Array.isArray(w.value)) {
      if (!Array.isArray(correct) || !Array.isArray(w.value)) continue;
      const toF = (xs: number[]) => xs.map((x) => frac(x));
      if (w.value.some((x) => x <= 0) || sameRatio(toF(w.value), toF(correct))) continue;
      if (kept.some((k) => Array.isArray(k.value) && sameRatio(toF(k.value), toF(w.value as number[])))) continue;
      kept.push(w);
      continue;
    }
    const f = asFrac(w.value)!;
    if (f.n <= 0 || equals(f, correct)) continue;
    if (kept.some((k) => { const kf = asFrac(k.value); return kf !== null && equals(kf, f); })) continue;
    kept.push(w);
  }
  return kept;
}

// ------------------------------------------------ one quantity as a fraction of another

const UNIT_PAIRS = [
  { small: "cm", big: "m", factor: 100, step: 5, say: (n: number) => `${n} m` },
  { small: "g", big: "kg", factor: 1000, step: 50, say: (n: number) => `${n} kg` },
  { small: "minutes", big: "hours", factor: 60, step: 5, say: (n: number) => (n === 1 ? "1 hour" : `${n} hours`) },
  { small: "p", big: "£", factor: 100, step: 5, say: (n: number) => `£${n}` },
] as const;

const fractionOfAnother: Gen = (r, tier) => {
  if (tier === 2) {
    const u = r.pick(UNIT_PAIRS);
    const B = r.int(1, 3);
    const whole = B * u.factor;
    let S = u.step * r.int(1, whole / u.step - 1);
    // Avoid answers whose simplest form is still huge (e.g. 7/200): keep the denominator at most 40.
    for (let i = 0; i < 20 && whole / gcd(S, whole) > 40; i++) S = u.step * r.int(1, whole / u.step - 1);
    const ans = simplify(frac(S, whole));
    const smallText = u.small === "p" ? `${S}p` : `${S} ${u.small}`;
    return {
      prompt: `Write ${smallText} as a fraction of ${u.say(B)}. Give your answer in its simplest form.`,
      answer: { kind: "fraction", value: ans, requireSimplest: true },
      wrongAnswers: cleanWrong(ans, [
        { value: frac(S, B), misconception: "ratio-units-not-matched" },
        { value: frac(whole, S), misconception: "ratio-fraction-upside-down" },
      ]),
      hints: [
        `Make the units the same first. ${u.say(B)} = ${whole} ${u.small === "p" ? "p" : u.small}.`,
        `Now it's ${S} out of ${whole}, so write ${S}/${whole} and simplify.`,
      ],
      solution: [
        `Same units: ${u.say(B)} = ${whole}${u.small === "p" ? "p" : ` ${u.small}`}.`,
        `As a fraction: ${S}/${whole}.`,
        `Divide top and bottom by ${gcd(S, whole)}: ${ans.n}/${ans.d}.`,
      ],
    };
  }

  const d = r.int(3, 10);
  let n = r.int(1, d - 1);
  while (gcd(n, d) !== 1) n = r.int(1, d - 1);
  const k = r.int(2, 6);
  const P = n * k;
  const T = d * k;
  const ans = frac(n, d);
  const ctx = r.pick([
    { whole: `There are ${T} students in a class. ${P} of them walk to school.`, ask: "What fraction of the class walk to school?" },
    { whole: `A bag holds ${T} sweets. ${P} of them are red.`, ask: "What fraction of the sweets are red?" },
    { whole: `A test has ${T} questions. Kai gets ${P} of them right.`, ask: "What fraction of the questions did Kai get right?" },
    { whole: `A garden has ${T} plants. ${P} of them are flowering.`, ask: "What fraction of the plants are flowering?" },
  ]);
  return {
    prompt: `${ctx.whole} ${ctx.ask} Give your answer in its simplest form.`,
    answer: { kind: "fraction", value: ans, requireSimplest: true },
    wrongAnswers: cleanWrong(ans, [
      { value: frac(T, P), misconception: "ratio-fraction-upside-down" },
    ]),
    hints: [`The part goes on top and the whole goes on the bottom: ${P} out of ${T}.`, `Write ${P}/${T}, then divide top and bottom by the same number.`],
    solution: [`Part out of whole: ${P}/${T}.`, `Both divide by ${k}: ${P} ÷ ${k} = ${n} and ${T} ÷ ${k} = ${d}.`, `Simplest form: ${n}/${d}.`],
  };
};

// ------------------------------------------------ writing and simplifying ratios

const simplifyRatio: Gen = (r, tier) => {
  const roll = r.next();

  if (tier === 2 && roll < 0.35) {
    // Three parts.
    let x = r.int(1, 6);
    let y = r.int(1, 6);
    let z = r.int(1, 6);
    while (gcd(gcd(x, y), z) !== 1 || (x === y && y === z)) {
      x = r.int(1, 6);
      y = r.int(1, 6);
      z = r.int(1, 6);
    }
    const k = r.int(2, 9);
    const [a, b, c] = [x * k, y * k, z * k];
    return {
      prompt: `Write the ratio ${a}:${b}:${c} in its simplest form.`,
      inputHint: "Type a ratio with colons, like 2:3:5.",
      answer: { kind: "ratio", value: [x, y, z], requireSimplest: true },
      wrongAnswers: [],
      hints: [`Find the biggest number that divides into ${a}, ${b} and ${c}.`, `All three divide by ${k}.`],
      solution: [`The highest common factor of ${a}, ${b} and ${c} is ${k}.`, `Divide every part by ${k}: ${a} ÷ ${k} = ${x}, ${b} ÷ ${k} = ${y}, ${c} ÷ ${k} = ${z}.`, `${x}:${y}:${z}`],
    };
  }

  if (tier === 2 && roll < 0.7) {
    // Different units.
    const u = r.pick(UNIT_PAIRS.filter((p) => p.small !== "p"));
    const B = r.int(1, 3);
    const whole = B * u.factor;
    let S = u.step * r.int(1, Math.min(whole / u.step - 1, 20));
    while (S === whole || gcd(S, whole) === 1) S = u.step * r.int(1, Math.min(whole / u.step - 1, 20));
    const g = gcd(S, whole);
    const ans = [S / g, whole / g];
    return {
      prompt: `Write the ratio ${S} ${u.small} : ${u.say(B)} in its simplest form.`,
      inputHint: "Type a ratio with a colon, like 3:2. No units needed.",
      answer: { kind: "ratio", value: ans, requireSimplest: true },
      wrongAnswers: cleanWrong(ans, [{ value: [S, B], misconception: "ratio-units-not-matched" }]),
      hints: [`Change both amounts to ${u.small} first. ${u.say(B)} = ${whole} ${u.small}.`, `Now simplify ${S}:${whole}.`],
      solution: [`Same units: ${u.say(B)} = ${whole} ${u.small}, so the ratio is ${S}:${whole}.`, `Both divide by ${g}.`, `${ans[0]}:${ans[1]}`],
    };
  }

  const [x, y] = coprimePair(r, 1, tier === 1 ? 5 : 9);
  const k = r.int(2, tier === 1 ? 6 : 12);
  const [a, b] = [x * k, y * k];

  if (r.next() < 0.5) {
    const ctx = r.pick([
      ["girls", "boys", "in a club"],
      ["cats", "dogs", "at an animal shelter"],
      ["red cars", "blue cars", "in a car park"],
      ["adults", "children", "on a school trip"],
    ] as const);
    // Ask for them in the opposite order to how they're given, half the time.
    const flip = r.next() < 0.5;
    const ans = flip ? [y, x] : [x, y];
    return {
      prompt: `There are ${a} ${ctx[0]} and ${b} ${ctx[1]} ${ctx[2]}. Write the ratio of ${flip ? ctx[1] : ctx[0]} to ${flip ? ctx[0] : ctx[1]} in its simplest form.`,
      inputHint: RATIO_HINT,
      answer: { kind: "ratio", value: ans, requireSimplest: true },
      wrongAnswers: cleanWrong(ans, [{ value: [ans[1], ans[0]], misconception: "ratio-reversed" }]),
      hints: [`Write the numbers in the same order as the words: ${flip ? ctx[1] : ctx[0]} first.`, `Then divide both numbers by ${k}.`],
      solution: [
        `${cap(flip ? ctx[1] : ctx[0])} : ${flip ? ctx[0] : ctx[1]} = ${flip ? b : a}:${flip ? a : b}`,
        `Both divide by ${k}.`,
        `${ans[0]}:${ans[1]}`,
      ],
    };
  }

  return {
    prompt: `Write the ratio ${a}:${b} in its simplest form.`,
    inputHint: RATIO_HINT,
    answer: { kind: "ratio", value: [x, y], requireSimplest: true },
    wrongAnswers: cleanWrong([x, y], [{ value: [y, x], misconception: "ratio-reversed" }]),
    hints: [`Find a number that divides into both ${a} and ${b}.`, `The biggest one is ${k}. Divide both by ${k}.`],
    solution: [`The highest common factor of ${a} and ${b} is ${k}.`, `${a} ÷ ${k} = ${x} and ${b} ÷ ${k} = ${y}.`, `${x}:${y}`],
  };
};

// ------------------------------------------------ sharing in a ratio

const SHARE_THINGS = [
  { noun: "money", v: (n: number) => `£${n}`, howMuch: "How much does", hint: "Type a number of pounds, like 24." },
  { noun: "sweets", v: (n: number) => `${n} sweets`, howMuch: "How many sweets does", hint: undefined },
  { noun: "stickers", v: (n: number) => `${n} stickers`, howMuch: "How many stickers does", hint: undefined },
] as const;

/** "1 part", "3 parts". */
const parts = (n: number) => (n === 1 ? "1 part" : `${n} parts`);

const share: Gen = (r, tier) => {
  const roll = r.next();
  const thing = r.pick(SHARE_THINGS);
  // Amounts in working: "£6" for money, plain numbers otherwise.
  const m = (n: number) => (thing.noun === "money" ? `£${n}` : String(n));
  const done = (q: Omit<Question, "id" | "skillId">, ans: number): Omit<Question, "id" | "skillId"> => ({
    ...q,
    ...(thing.hint ? { inputHint: thing.hint } : {}),
    ...(thing.noun === "money" ? { answerText: `£${ans}` } : {}),
  });

  if (tier === 2 && roll < 0.3) {
    // Three-way share.
    const [A, B, C] = threeNames(r);
    let ps = [r.int(1, 5), r.int(1, 5), r.int(1, 5)];
    while (ps[0] === ps[1] && ps[1] === ps[2]) ps = [r.int(1, 5), r.int(1, 5), r.int(1, 5)];
    const sum = ps[0] + ps[1] + ps[2];
    const one = r.int(2, 12);
    const T = sum * one;
    const who = r.int(0, 2);
    const names = [A, B, C];
    const ans = ps[who] * one;
    return done(
      {
        prompt: `${A}, ${B} and ${C} share ${thing.v(T)} in the ratio ${ps.join(":")}. ${thing.howMuch} ${names[who]} get?`,
        answer: { kind: "integer", value: ans },
        wrongAnswers: cleanWrong(frac(ans), [
          { value: one, misconception: "ratio-share-one-part" },
          ...(T % 3 === 0 ? [{ value: T / 3, misconception: "ratio-share-equal" }] : []),
          ...(T % ps[who] === 0 && ps[who] > 1 ? [{ value: T / ps[who], misconception: "ratio-share-divided-by-part" }] : []),
        ]),
        hints: [`Add the parts: ${ps.join(" + ")} = ${sum} parts altogether.`, `One part is ${m(T)} ÷ ${sum} = ${m(one)}. ${names[who]} gets ${parts(ps[who])}.`],
        solution: [`Total parts: ${ps.join(" + ")} = ${sum}.`, `One part: ${m(T)} ÷ ${sum} = ${m(one)}.`, `${names[who]}: ${ps[who]} × ${m(one)} = ${m(ans)}`],
      },
      ans,
    );
  }

  const [A, B] = twoNames(r);
  const [a, b] = coprimePair(r, 1, tier === 1 ? 5 : 7);
  const sum = a + b;
  const one = r.int(2, tier === 1 ? 10 : 15);
  const T = sum * one;
  const shareA = a * one;
  const shareB = b * one;

  if (tier === 2 && roll < 0.65) {
    // One share is known; find the other.
    const knownIsA = r.next() < 0.5;
    const [kName, kPart, kShare, oName, oPart, oShare] = knownIsA ? [A, a, shareA, B, b, shareB] : [B, b, shareB, A, a, shareA];
    return done(
      {
        prompt: `${A} and ${B} share some ${thing.noun} in the ratio ${a}:${b}. ${kName} gets ${thing.v(kShare)}. ${thing.howMuch} ${oName} get?`,
        answer: { kind: "integer", value: oShare },
        wrongAnswers: cleanWrong(frac(oShare), [
          { value: one, misconception: "ratio-share-one-part" },
          ...(kShare % sum === 0 ? [{ value: (kShare / sum) * oPart, misconception: "ratio-share-used-total" }] : []),
        ]),
        hints: [
          `${kName}'s ${parts(kPart)} ${kPart === 1 ? "is" : "are"} worth ${m(kShare)}. Find one part: ${m(kShare)} ÷ ${kPart}.`,
          `${oName} gets ${parts(oPart)}.`,
        ],
        solution: [`${parts(kPart)} = ${m(kShare)}, so one part = ${m(kShare)} ÷ ${kPart} = ${m(one)}.`, `${oName} gets ${parts(oPart)}.`, `${oPart} × ${m(one)} = ${m(oShare)}`],
      },
      oShare,
    );
  }

  if (tier === 2) {
    // The difference is known. Keep the gap at least 2 parts so it's a real step.
    let [x, y] = [a, b];
    while (Math.abs(x - y) < 2) [x, y] = coprimePair(r, 1, 7);
    const [small, big] = x < y ? [A, B] : [B, A];
    const [sPart, bPart] = x < y ? [x, y] : [y, x];
    const gap = bPart - sPart;
    const diff = gap * one;
    const ans = sPart * one;
    return done(
      {
        prompt: `${A} and ${B} share some ${thing.noun} in the ratio ${x}:${y}. ${big} gets ${thing.v(diff)} more than ${small}. ${thing.howMuch} ${small} get?`,
        answer: { kind: "integer", value: ans },
        wrongAnswers: cleanWrong(frac(ans), [
          { value: one, misconception: "ratio-share-one-part" },
          { value: bPart * one, misconception: "ratio-share-wrong-person" },
        ]),
        hints: [`The difference between their parts is ${bPart} − ${sPart} = ${parts(gap)}.`, `So ${parts(gap)} are worth ${m(diff)}. Find one part, then ${small}'s ${parts(sPart)}.`],
        solution: [`Difference in parts: ${bPart} − ${sPart} = ${gap}.`, `${parts(gap)} = ${m(diff)}, so one part = ${m(one)}.`, `${small} gets ${sPart} × ${m(one)} = ${m(ans)}`],
      },
      ans,
    );
  }

  const askA = r.next() < 0.5;
  const ans = askA ? shareA : shareB;
  const askPart = askA ? a : b;
  return done(
    {
      prompt: `${A} and ${B} share ${thing.v(T)} in the ratio ${a}:${b}. ${thing.howMuch} ${askA ? A : B} get?`,
      answer: { kind: "integer", value: ans },
      wrongAnswers: cleanWrong(frac(ans), [
        { value: one, misconception: "ratio-share-one-part" },
        { value: askA ? shareB : shareA, misconception: "ratio-share-wrong-person" },
        ...(T % 2 === 0 ? [{ value: T / 2, misconception: "ratio-share-equal" }] : []),
        ...(T % askPart === 0 && askPart > 1 ? [{ value: T / askPart, misconception: "ratio-share-divided-by-part" }] : []),
      ]),
      hints: [`Add the parts: ${a} + ${b} = ${sum} parts altogether.`, `One part is ${m(T)} ÷ ${sum} = ${m(one)}. ${askA ? A : B} gets ${parts(askPart)}.`],
      solution: [`Total parts: ${a} + ${b} = ${sum}.`, `One part: ${m(T)} ÷ ${sum} = ${m(one)}.`, `${askA ? A : B}: ${askPart} × ${m(one)} = ${m(ans)}`],
    },
    ans,
  );
};

// ------------------------------------------------ ratios and fractions

const GROUPS = [
  ["red counters", "blue counters", "counters", "a bag"],
  ["adults", "children", "people", "a cinema"],
  ["boys", "girls", "students", "a class"],
  ["cats", "dogs", "animals", "a rescue centre"],
] as const;

const ratioFractions: Gen = (r, tier) => {
  const g = r.pick(GROUPS);
  const [a, b] = coprimePair(r, 1, tier === 1 ? 7 : 9);
  const sum = a + b;
  const roll = r.next();

  if (tier === 2 && roll < 0.4) {
    // Know how many of one group; find the total.
    const k = r.int(2, 9);
    const known = a * k;
    const ans = sum * k;
    return {
      prompt: `In ${g[3]}, the ratio of ${g[0]} to ${g[1]} is ${a}:${b}. There are ${known} ${g[0]}. How many ${g[2]} are there altogether?`,
      answer: { kind: "integer", value: ans },
      wrongAnswers: cleanWrong(frac(ans), [
        { value: b * k, misconception: "ratio-part-over-part" },
        ...(known % sum === 0 ? [{ value: (known / sum) * b, misconception: "ratio-share-used-total" }] : []),
      ]),
      hints: [`${cap(parts(a))} ${a === 1 ? "is" : "are"} ${known} ${g[0]}, so one part is ${known} ÷ ${a}.`, `Altogether there are ${a} + ${b} = ${sum} parts.`],
      solution: [`${cap(parts(a))} = ${known}, so one part = ${k}.`, `Total parts: ${a} + ${b} = ${sum}.`, `${sum} × ${k} = ${ans}`],
    };
  }

  if (roll < (tier === 1 ? 0.55 : 0.7)) {
    // Ratio to fraction.
    const askFirst = r.next() < 0.5;
    const part = askFirst ? a : b;
    const ans = frac(part, sum);
    return {
      prompt: `In ${g[3]}, the ratio of ${g[0]} to ${g[1]} is ${a}:${b}. What fraction of the ${g[2]} are ${askFirst ? g[0] : g[1]}?`,
      answer: { kind: "fraction", value: ans, requireSimplest: true },
      wrongAnswers: cleanWrong(ans, [{ value: frac(part, askFirst ? b : a), misconception: "ratio-part-over-part" }]),
      hints: [`How many parts altogether? ${a} + ${b} = ${sum}.`, `${cap(askFirst ? g[0] : g[1])} are ${part} of those ${sum} parts.`],
      solution: [`Total parts: ${a} + ${b} = ${sum}.`, `${cap(askFirst ? g[0] : g[1])}: ${parts(part)} out of ${sum}.`, `Fraction: ${ans.n}/${ans.d}`],
    };
  }

  // Fraction to ratio.
  return {
    prompt: `In ${g[3]}, ${a}/${sum} of the ${g[2]} are ${g[0]}. The rest are ${g[1]}. Write the ratio of ${g[0]} to ${g[1]}.`,
    inputHint: RATIO_HINT,
    answer: { kind: "ratio", value: [a, b], requireSimplest: false },
    wrongAnswers: cleanWrong([a, b], [
      { value: [a, sum], misconception: "ratio-used-whole" },
      { value: [b, a], misconception: "ratio-reversed" },
    ]),
    hints: [`Think of ${sum} equal parts. ${a} are ${g[0]}.`, `The rest: ${sum} − ${a} = ${b} parts are ${g[1]}.`],
    solution: [`${cap(g[0])}: ${parts(a)} out of ${sum}.`, `${cap(g[1])}: ${sum} − ${a} = ${parts(b)}.`, `${cap(g[0])} : ${g[1]} = ${a}:${b}`],
  };
};

// ------------------------------------------------ unitary method: recipes, prices, best buys

const INGREDIENTS = [
  { name: "flour", unit: "g", lo: 5, hi: 30, step: 5 },
  { name: "milk", unit: "ml", lo: 5, hi: 30, step: 10 },
  { name: "rice", unit: "g", lo: 6, hi: 20, step: 10 },
  { name: "sugar", unit: "g", lo: 3, hi: 12, step: 5 },
] as const;
const ITEMS = ["pens", "bread rolls", "notebooks", "apples", "bus tickets"] as const;

const unitary: Gen = (r, tier) => {
  const roll = r.next();

  if (tier === 2 && roll < 0.4) {
    // Best buy, compared per 100 g.
    const sizes = r.pick([
      [200, 500],
      [300, 500],
      [200, 300],
      [400, 600],
      [300, 800],
      [500, 800],
    ] as const);
    const p1 = r.int(4, 18) * 5; // pence per 100 g
    let p2 = r.int(4, 18) * 5;
    while (p1 === p2) p2 = r.int(4, 18) * 5;
    const product = r.pick(["jar of jam", "bag of pasta", "box of cereal", "tub of yoghurt"]);
    const c1 = (p1 * sizes[0]) / 100;
    const c2 = (p2 * sizes[1]) / 100;
    const best = Math.min(p1, p2);
    const worse = Math.max(p1, p2);
    return {
      prompt: `A ${sizes[0]} g ${product} costs ${money(c1)}. A ${sizes[1]} g ${product} costs ${money(c2)}. Which is better value? Work out the price of 100 g for each, and type the price of 100 g for the better-value one, in pence.`,
      inputHint: "Type a number of pence, like 45.",
      answer: { kind: "integer", value: best },
      wrongAnswers: cleanWrong(frac(best), [{ value: worse, misconception: "prop-picked-dearer" }]),
      hints: [
        `Work in pence. ${money(c1)} = ${c1}p. ${sizes[0]} g is ${sizes[0] / 100} lots of 100 g, so divide ${c1} by ${sizes[0] / 100}.`,
        `Do the same for the ${sizes[1]} g one (${money(c2)} = ${c2}p), then pick the cheaper price per 100 g.`,
      ],
      solution: [
        `${sizes[0]} g: ${c1}p ÷ ${sizes[0] / 100} = ${p1}p per 100 g.`,
        `${sizes[1]} g: ${c2}p ÷ ${sizes[1] / 100} = ${p2}p per 100 g.`,
        `The ${p1 < p2 ? sizes[0] : sizes[1]} g ${product} is better value at ${best}p per 100 g. Answer: ${best}`,
      ],
    };
  }

  if (roll < 0.5) {
    // Recipe.
    const ing = r.pick(INGREDIENTS);
    const per = r.int(ing.lo, ing.hi) * ing.step;
    const P = r.pick([2, 4, 5, 6] as const);
    let R = r.int(1, 12);
    while (R === P) R = r.int(1, 12);
    const Q = per * P;
    const ans = per * R;
    return {
      prompt: `A recipe for ${P} people uses ${Q} ${ing.unit} of ${ing.name}. How much ${ing.name} is needed for ${R} ${R === 1 ? "person" : "people"}?`,
      inputHint: `Type a number of ${ing.unit === "g" ? "grams" : "millilitres"}, like 250.`,
      answer: { kind: "integer", value: ans },
      wrongAnswers: cleanWrong(frac(ans), [
        { value: Q + (R - P), misconception: "prop-added-difference" },
        { value: Q * R, misconception: "prop-forgot-divide" },
        ...(R !== 1 ? [{ value: per, misconception: "ratio-share-one-part" }] : []),
      ]),
      hints: [`First find the amount for 1 person: ${Q} ÷ ${P}.`, `Then multiply by ${R}.`],
      solution: [`For 1 person: ${Q} ÷ ${P} = ${per} ${ing.unit}.`, `For ${R}: ${per} × ${R} = ${ans} ${ing.unit}.`, `Answer: ${ans}`],
    };
  }

  // Price of several items.
  const item = r.pick(ITEMS);
  const each = r.int(tier === 1 ? 2 : 3, tier === 1 ? 19 : 39) * 5; // pence
  const N = r.int(2, 6);
  let M = r.int(2, 12);
  while (M === N) M = r.int(2, 12);
  const cost = each * N;
  const ans = each * M;
  return {
    prompt: `${N} ${item} cost ${money(cost)}. How much do ${M} ${item} cost?`,
    inputHint: MONEY_HINT,
    answerText: money(ans),
    answer: { kind: "fraction", value: poundsValue(ans), requireSimplest: false },
    wrongAnswers: cleanWrong(poundsValue(ans), [
      { value: poundsValue(cost * M), misconception: "prop-forgot-divide" },
      { value: poundsValue(each), misconception: "ratio-share-one-part" },
      { value: poundsValue(cost + (M - N) * 100), misconception: "prop-added-difference" },
    ]),
    hints: [`Find the cost of 1 first: ${money(cost)} ÷ ${N}.`, `Then multiply by ${M}. It can help to work in pence: ${cost}p ÷ ${N}.`],
    solution: [`1 costs ${cost}p ÷ ${N} = ${each}p.`, `${M} cost ${each}p × ${M} = ${ans}p.`, `${ans}p = ${money(ans)}`],
  };
};

// ------------------------------------------------ direct proportion

const CURRENCIES = [
  { name: "euros", sym: "€", rate: 115 },
  { name: "euros", sym: "€", rate: 120 },
  { name: "US dollars", sym: "$", rate: 125 },
  { name: "US dollars", sym: "$", rate: 130 },
] as const;

const directProportion: Gen = (r, tier) => {
  const roll = r.next();

  if (roll < 0.33) {
    // Exchange rate. £ amounts are multiples of 20, so the answer is whole.
    const c = r.pick(CURRENCIES);
    const pounds = 20 * r.int(1, tier === 1 ? 10 : 25);
    const other = (pounds * c.rate) / 100;
    const rateText = (c.rate / 100).toFixed(2);
    if (tier === 2 && r.next() < 0.5) {
      return {
        prompt: `The exchange rate is £1 = ${rateText} ${c.name}. Change ${c.sym}${other} into pounds.`,
        inputHint: "Type a number of pounds, like 60.",
        answer: { kind: "integer", value: pounds },
        wrongAnswers: cleanWrong(frac(pounds), [{ value: frac(other * c.rate, 100), misconception: "prop-wrong-way" }]),
        hints: [`Each £1 gives you ${rateText} ${c.name}, so you'll get fewer pounds than ${c.name}.`, `Divide: ${other} ÷ ${rateText}.`],
        solution: [`Going from ${c.name} to pounds, divide by ${rateText}.`, `${other} ÷ ${rateText} = ${pounds}`, `£${pounds}`],
      };
    }
    return {
      prompt: `The exchange rate is £1 = ${rateText} ${c.name}. Change £${pounds} into ${c.name}.`,
      inputHint: `Type a number of ${c.name}, like 46.`,
      answer: { kind: "integer", value: other },
      wrongAnswers: cleanWrong(frac(other), [{ value: frac(pounds * 100, c.rate), misconception: "prop-wrong-way" }]),
      hints: [`Each £1 is worth ${rateText} ${c.name}.`, `Multiply: ${pounds} × ${rateText}.`],
      solution: [`Going from pounds to ${c.name}, multiply by ${rateText}.`, `${pounds} × ${rateText} = ${other}`, `${c.sym}${other}`],
    };
  }

  // y = kx, with k = p/q (q = 1 at tier 1).
  const q = tier === 1 ? 1 : r.pick([1, 2, 2, 4] as const);
  let p = r.int(2, 9);
  while (gcd(p, q) !== 1) p = r.int(2, 9);
  // Both x values at least 2, so "for 1" is always a real step.
  const x1 = q * r.int(q === 1 ? 2 : 1, 6);
  let x2 = q * r.int(q === 1 ? 2 : 1, 8);
  while (x2 === x1) x2 = q * r.int(q === 1 ? 2 : 1, 8);
  const k = dec(p / q);
  const y1 = (p * x1) / q;
  const y2 = (p * x2) / q;

  if (roll < 0.66) {
    const ctx = r.pick([
      { x: "litres of paint", y: "m² of wall", sentence: (x: number, y: number) => `${x} litres of paint cover ${y} m² of wall.`, ask: (x: number) => `How many m² do ${x} litres cover?`, askBack: (y: number) => `How many litres are needed to cover ${y} m²?` },
      { x: "minutes", y: "pages", sentence: (x: number, y: number) => `A printer prints the same number of pages every minute. In ${x} minutes it prints ${y} pages.`, ask: (x: number) => `How many pages does it print in ${x} minutes?`, askBack: (y: number) => `How many minutes does it take to print ${y} pages?` },
      { x: "kg of potatoes", y: "pounds", sentence: (x: number, y: number) => `The cost of potatoes is directly proportional to their weight. ${x} kg cost £${y}.`, ask: (x: number) => `How much do ${x} kg cost, in pounds?`, askBack: (y: number) => `How many kg can you buy for £${y}?` },
    ]);
    if (tier === 2 && r.next() < 0.4) {
      return {
        prompt: `${ctx.sentence(x1, y1)} ${ctx.askBack(y2)}`,
        answer: { kind: "integer", value: x2 },
        wrongAnswers: cleanWrong(frac(x2), [
          { value: frac(y2 * p, q), misconception: "prop-wrong-way" },
          { value: x1 + (y2 - y1), misconception: "prop-added-difference" },
        ]),
        hints: [`Find how much 1 gives you: ${y1} ÷ ${x1}.`, `Then divide ${y2} by that.`],
        solution: [`1 gives ${y1} ÷ ${x1} = ${k}.`, `${y2} ÷ ${k} = ${x2}.`, `Answer: ${x2}`],
      };
    }
    return {
      prompt: `${ctx.sentence(x1, y1)} ${ctx.ask(x2)}`,
      answer: { kind: "integer", value: y2 },
      wrongAnswers: cleanWrong(frac(y2), [
        { value: y1 + (x2 - x1), misconception: "prop-added-difference" },
        { value: y1 * x2, misconception: "prop-forgot-divide" },
      ]),
      hints: [`Find the amount for 1 first: ${y1} ÷ ${x1}.`, `Then multiply by ${x2}.`],
      solution: [`For 1: ${y1} ÷ ${x1} = ${k}.`, `For ${x2}: ${k} × ${x2} = ${y2}.`, `Answer: ${y2}`],
    };
  }

  // Graph wording.
  return {
    prompt: `y is directly proportional to x, so its graph is a straight line through (0, 0). The line passes through (${x1}, ${y1}). What is y when x = ${x2}?`,
    answer: { kind: "integer", value: y2 },
    wrongAnswers: cleanWrong(frac(y2), [
      { value: y1 + (x2 - x1), misconception: "prop-added-difference" },
      { value: y1 * x2, misconception: "prop-forgot-divide" },
    ]),
    hints: [`Directly proportional means y = (a number) × x. Find the number: ${y1} ÷ ${x1}.`, `Then multiply ${x2} by that number.`],
    solution: [
      `y ÷ x is always the same: ${y1} ÷ ${x1} = ${k}.`,
      `So y = ${k} × x.`,
      `When x = ${x2}, y = ${k} × ${x2} = ${y2}`,
    ],
  };
};

export const RATIO_GENERATORS: Record<string, Gen> = {
  "ratio-fraction-of-another": fractionOfAnother,
  "ratio-simplify": simplifyRatio,
  "ratio-share": share,
  "ratio-fractions": ratioFractions,
  "ratio-unitary-method": unitary,
  "ratio-direct-proportion": directProportion,
};
