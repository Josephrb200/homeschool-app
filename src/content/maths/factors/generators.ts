/**
 * Question generators for the factors and primes chain.
 *
 * Lists (factors, multiples, primes) are typed with commas, in any order.
 * Products of primes can be typed as 2 × 2 × 3, 2 x 2 x 3, 2^2 × 3 or 2² × 3.
 * Numbers stay positive and whole, and non-calculator friendly.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher.
 */

import type { Rng } from "@/engine/random";
import type { Question } from "@/engine/types";
import { factorPairs, factorsOf, fullForm, hcf, indexForm, isPrime, lcmOf, primeFactors, primePowers, sup } from "@/engine/primes";

export type Tier = 1 | 2;
type Q = Omit<Question, "id" | "skillId">;
type Gen = (r: Rng, tier: Tier) => Q;

const HELP_LIST = "Type the numbers with commas between them, like 1, 2, 3. Any order is fine.";
const HELP_PRODUCT = "Type primes with × or x between them, like 2 × 2 × 3. For powers, type 2^2 or 2².";
const HELP_NUMBER = "Type a whole number, like 12.";

const listAnswer = (value: number[], noun: string, missing?: string, extra?: string): Question["answer"] => ({
  kind: "list",
  value,
  noun,
  missingMisconception: missing,
  extraMisconception: extra,
});

/** Shuffle a copy of xs with the seeded generator. */
function shuffle<T>(r: Rng, xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = r.int(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const sameSet = (x: number[], y: number[]) => x.length === y.length && x.every((v) => y.includes(v));

/** Keep predicted wrong lists that differ from the answer and from each other. */
function cleanLists(answer: number[], wrongs: { value: number[]; misconception: string }[]) {
  const kept: { value: number[]; misconception: string }[] = [];
  for (const w of wrongs) {
    const v = [...new Set(w.value)];
    if (v.length === 0 || sameSet(v, answer) || kept.some((k) => sameSet(k.value, v))) continue;
    kept.push({ value: v, misconception: w.misconception });
  }
  return kept;
}

/** Keep predicted wrong numbers that are positive whole numbers, not the answer, and not repeated. */
function cleanNums(answer: number, wrongs: { value: number; misconception: string }[]) {
  const seen = new Set<number>([answer]);
  return wrongs.filter((w) => {
    if (!Number.isInteger(w.value) || w.value <= 0 || seen.has(w.value)) return false;
    seen.add(w.value);
    return true;
  });
}

// ------------------------------------------------------------ factors, multiples, primes

const FACTOR_NUMS_1 = [12, 16, 18, 20, 24, 28, 30, 32, 36, 40, 42, 44, 45, 48, 50, 54];
const FACTOR_NUMS_2 = [56, 60, 63, 64, 66, 70, 72, 75, 78, 80, 84, 88, 90, 96, 98, 100];

function listFactors(r: Rng, tier: Tier): Q {
  const n = r.pick(tier === 1 ? FACTOR_NUMS_1 : FACTOR_NUMS_2);
  const fs = factorsOf(n);
  const pairs = factorPairs(n);
  const multiples = [1, 2, 3, 4, 5].map((k) => n * k);
  const half = fs.filter((f) => f * f <= n);
  return {
    prompt: `Write down all the factors of ${n}.`,
    answer: listAnswer(fs, "factors", "fm-missed-pair", "fm-not-factor"),
    wrongAnswers: cleanLists(fs, [
      { value: multiples, misconception: "fm-factor-multiple-mixup" },
      // only the left side of each pair
      { value: half, misconception: "fm-missed-pair" },
    ]),
    hints: [`Work in pairs that multiply to make ${n}. Start with 1 × ${n}.`, `Now try 2, 3, 4 and so on. Stop when the pairs meet in the middle.`],
    solution: [...pairs.map(([a, b]) => `${a} × ${b} = ${n}`), `The factors of ${n} are ${fs.join(", ")}`],
    answerHelp: HELP_LIST,
  };
}

function firstMultiples(r: Rng, tier: Tier): Q {
  const k = tier === 1 ? r.int(3, 12) : r.pick([13, 14, 15, 16, 17, 18, 19, 21, 25]);
  const count = tier === 1 ? 5 : r.pick([4, 5]);
  const ms = Array.from({ length: count }, (_, i) => k * (i + 1));
  const fromZero = Array.from({ length: count }, (_, i) => k * i);
  const factors = factorsOf(k);
  return {
    prompt: `Write down the first ${count} multiples of ${k}.`,
    answer: listAnswer(ms, "multiples", undefined, "fm-not-multiple"),
    wrongAnswers: cleanLists(ms, [
      { value: fromZero, misconception: "fm-not-multiple" },
      ...(factors.length > 2 ? [{ value: factors, misconception: "fm-factor-multiple-mixup" }] : []),
    ]),
    hints: [`Multiples of ${k} are in the ${k} times table.`, `Start with ${k} × 1 = ${k}.`],
    solution: [...ms.map((m, i) => `${k} × ${i + 1} = ${m}`), `The first ${count} multiples of ${k} are ${ms.join(", ")}`],
    answerHelp: HELP_LIST,
  };
}

/** Odd numbers that aren't prime but look it. */
const SNEAKY = [9, 15, 21, 25, 27, 33, 35, 39, 45, 49, 51, 57, 63, 69, 77, 81, 87, 91];
const PRIMES_TO_100 = Array.from({ length: 100 }, (_, i) => i).filter(isPrime);

function primesFromList(r: Rng, tier: Tier): Q {
  // 6 or 7 numbers: some primes, some sneaky odds, maybe 1 and 2, an even.
  const max = tier === 1 ? 30 : 100;
  const primes = shuffle(r, PRIMES_TO_100.filter((p) => p > 2 && p <= max)).slice(0, tier === 1 ? 2 : 3);
  const sneaky = shuffle(r, SNEAKY.filter((s) => s <= max)).slice(0, 2);
  const extras: number[] = [];
  const withOne = r.next() < 0.5;
  const withTwo = r.next() < 0.5;
  if (withOne) extras.push(1);
  if (withTwo) extras.push(2);
  let even = 2 * r.int(2, Math.floor(max / 2));
  while (primes.includes(even)) even += 2;
  extras.push(even);
  const list = [...new Set([...primes, ...sneaky, ...extras])].sort((a, b) => a - b);
  const answer = list.filter(isPrime);
  const wrongs = [
    { value: [...answer, ...sneaky], misconception: "fm-odd-prime" },
    { value: list.filter((x) => x % 2 === 1 && x !== 1), misconception: "fm-odd-prime" },
  ];
  if (withOne) wrongs.unshift({ value: [...answer, 1], misconception: "fm-one-prime" });
  if (withTwo) wrongs.unshift({ value: answer.filter((x) => x !== 2), misconception: "fm-two-not-prime" });
  return {
    prompt: `Here is a list of numbers: ${list.join(", ")}. Write down all the prime numbers in the list.`,
    answer: listAnswer(answer, "prime numbers", undefined, "fm-not-prime"),
    wrongAnswers: cleanLists(answer, wrongs),
    hints: [`A prime number has exactly two factors: 1 and itself.`, `Check the odd numbers carefully: try dividing by 3 and 7. And remember 1 isn't prime, but 2 is.`],
    solution: [
      ...list.map((x) =>
        x === 1 ? "1 has only one factor, so it isn't prime." : isPrime(x) ? `${x} is prime: only 1 and ${x} go into it.` : `${x} isn't prime: ${x} = ${smallestSplit(x)}.`,
      ),
      `The prime numbers are ${answer.join(", ")}`,
    ],
    answerHelp: HELP_LIST,
  };
}

function smallestSplit(n: number): string {
  const p = primeFactors(n)[0];
  return `${p} × ${n / p}`;
}

function isPrimeChoice(r: Rng): Q {
  const n = r.pick([...SNEAKY.filter((s) => s > 20), 1, 2, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 31, 37, 41, 43, 47]);
  const prime = isPrime(n);
  const options = ["Yes, it's prime", "No, it isn't prime"];
  const correctIndex = prime ? 0 : 1;
  const mc = n === 1 ? "fm-one-prime" : n === 2 ? "fm-two-not-prime" : !prime ? "fm-odd-prime" : undefined;
  return {
    prompt: `Is ${n} a prime number?`,
    answer: { kind: "choice", options, correctIndex },
    wrongAnswers: mc ? [{ value: 1 - correctIndex, misconception: mc }] : [],
    hints: [`A prime has exactly two factors: 1 and itself.`, n === 1 ? "How many factors does 1 have?" : `Try dividing ${n} by 2, 3, 5 and 7.`],
    solution:
      n === 1
        ? ["1 has only one factor: 1.", "A prime needs exactly two factors.", "No, it isn't prime"]
        : prime
          ? [`Nothing divides ${n} exactly except 1 and ${n}.`, n === 2 ? "2 is the only even prime." : `(${n} doesn't divide by 2, 3, 5 or 7.)`, "Yes, it's prime"]
          : [`${n} = ${smallestSplit(n)}`, `So ${n} has more than two factors.`, "No, it isn't prime"],
  };
}

function factorOrMultiple(r: Rng): Q {
  const base = r.pick([24, 30, 36, 40, 48, 60]);
  const kind = r.pick(["factor", "multiple", "neither"] as const);
  const fs = factorsOf(base).filter((f) => f > 1 && f < base);
  let x: number;
  if (kind === "factor") x = r.pick(fs);
  else if (kind === "multiple") x = base * r.int(2, 4);
  else {
    x = r.int(7, base - 1);
    while (base % x === 0) x += 1;
  }
  const options = [`a factor of ${base}`, `a multiple of ${base}`, `neither`];
  const correctIndex = kind === "factor" ? 0 : kind === "multiple" ? 1 : 2;
  return {
    prompt: `Is ${x} a factor of ${base}, a multiple of ${base}, or neither?`,
    answer: { kind: "choice", options, correctIndex },
    wrongAnswers: kind === "neither" ? [] : [{ value: 1 - correctIndex, misconception: "fm-factor-multiple-mixup" }],
    hints: [`A factor goes into ${base} exactly. A multiple is in the ${base} times table.`, x < base ? `Does ${base} ÷ ${x} come out exactly?` : `Does ${x} ÷ ${base} come out exactly?`],
    solution:
      kind === "factor"
        ? [`${base} ÷ ${x} = ${base / x}, exactly.`, `So ${x} is a factor of ${base}`]
        : kind === "multiple"
          ? [`${base} × ${x / base} = ${x}`, `So ${x} is a multiple of ${base}`]
          : [`${base} ÷ ${x} leaves a remainder, so ${x} isn't a factor.`, `${x} is smaller than ${base}, so it can't be a multiple.`, `So the answer is neither`],
  };
}

const factorsMultiples: Gen = (r, tier) => {
  if (tier === 1) {
    const k = r.pick(["factors", "factors", "multiples", "primes", "fm"] as const);
    if (k === "factors") return listFactors(r, 1);
    if (k === "multiples") return firstMultiples(r, 1);
    if (k === "primes") return primesFromList(r, 1);
    return factorOrMultiple(r);
  }
  const k = r.pick(["factors", "factors", "primes", "is-prime", "multiples"] as const);
  if (k === "factors") return listFactors(r, 2);
  if (k === "primes") return primesFromList(r, 2);
  if (k === "is-prime") return isPrimeChoice(r);
  return firstMultiples(r, 2);
};

// ------------------------------------------------------------ products of primes

/** Factor-tree steps, splitting off the smallest prime each time. */
export function treeSteps(n: number): string[] {
  const steps: string[] = [];
  let m = n;
  for (const p of primeFactors(n).slice(0, -1)) {
    const rest = m / p;
    steps.push(`${m} = ${p} × ${rest}${isPrime(rest) ? ` (${p} and ${rest} are both prime)` : ` (${p} is prime; keep splitting ${rest})`}`);
    m = rest;
  }
  return steps;
}

/** Composite numbers up to max built from small primes, with at least 3 prime factors (or 2 for tier 1). */
function pickComposite(r: Rng, min: number, max: number, minFactors: number): number {
  const pool: number[] = [];
  for (let n = min; n <= max; n++) {
    const pf = primeFactors(n);
    if (pf.length >= minFactors && pf.every((p) => p <= 13)) pool.push(n);
  }
  return r.pick(pool);
}

function productQuestion(r: Rng, tier: Tier): Q {
  const n = tier === 1 ? pickComposite(r, 12, 100, 3) : pickComposite(r, 100, 500, 4);
  const index = tier === 2 && r.next() < 0.6;
  const pf = primeFactors(n);
  const distinct = [...new Set(pf)];
  // Losing one prime (e.g. only writing each repeated prime once) gives a different product.
  const once = distinct.reduce((a, b) => a * b, 1);
  const wrongs = cleanNums(n, [
    ...distinct.map((p) => ({ value: n / p, misconception: "pf-missing-prime" })),
    { value: once, misconception: "pf-missing-prime" },
  ]);
  const usesRepeat = pf.length > distinct.length;
  return {
    prompt: index ? `Write ${n} as a product of its prime factors. Give your answer in index form.` : `Write ${n} as a product of its prime factors.`,
    answer: { kind: "product", value: n, index },
    wrongAnswers: wrongs,
    hints: [
      `Start a factor tree. Split ${n} into any two factors, like ${factorPairs(n)[1][0]} × ${factorPairs(n)[1][1]}.`,
      `Circle each prime. Keep splitting the numbers that aren't prime. Then multiply all the circled primes${index && usesRepeat ? ", and use powers for repeats" : ""}.`,
    ],
    solution: [...treeSteps(n), `The primes at the ends of the branches are ${pf.join(", ")}.`, index ? `${n} = ${fullForm(n)} = ${indexForm(n)}` : `${n} = ${fullForm(n)}${usesRepeat ? ` (or ${indexForm(n)})` : ""}`],
    answerHelp: HELP_PRODUCT,
  };
}

function fromIndexForm(r: Rng): Q {
  const n = pickComposite(r, 24, 400, 3);
  if (![...primePowers(n).values()].some((k) => k > 1)) return fromIndexForm(r);
  const timesPower = [...primePowers(n)].reduce((v, [p, k]) => v * (k === 1 ? p : p * k), 1);
  return {
    prompt: `A number is written as a product of primes: ${indexForm(n)}. What is the number?`,
    answer: { kind: "integer", value: n },
    wrongAnswers: cleanNums(n, [{ value: timesPower, misconception: "pf-power-times" }]),
    hints: [`Work out each power first: ${[...primePowers(n)].filter(([, k]) => k > 1).map(([p, k]) => `${p}${sup(k)} = ${Array(k).fill(p).join(" × ")}`).join(", ")}.`, `Then multiply everything together.`],
    solution: [`${indexForm(n)} = ${fullForm(n)}`, ...[...primePowers(n)].filter(([, k]) => k > 1).map(([p, k]) => `${p}${sup(k)} = ${p ** k}`), `${[...primePowers(n)].map(([p, k]) => p ** k).join(" × ")} = ${n}`],
    answerHelp: HELP_NUMBER,
  };
}

function whichIsProduct(r: Rng): Q {
  const n = r.pick([30, 42, 66, 70, 78, 105]);
  const pf = primeFactors(n); // three different primes
  const [a, b, c] = pf;
  const correct = `${a} × ${b} × ${c}`;
  const stopped = `${a} × ${b * c}`;
  const withOne = `1 × ${a} × ${b} × ${c}`;
  const otherPair = `${a * b} × ${c}`;
  const options = [correct, stopped, withOne, otherPair];
  const shown = shuffle(r, options);
  const idx = (s: string) => shown.indexOf(s);
  return {
    prompt: `Which of these is ${n} written as a product of prime factors?`,
    answer: { kind: "choice", options: shown, correctIndex: idx(correct) },
    wrongAnswers: [
      { value: idx(stopped), misconception: "pf-stopped-early" },
      { value: idx(otherPair), misconception: "pf-stopped-early" },
      { value: idx(withOne), misconception: "fm-one-prime" },
    ],
    hints: ["Every number in the answer must be prime.", "Is 1 prime? Check each number in each option."],
    solution: [`${b * c} and ${a * b} aren't prime, so those options aren't finished.`, `1 isn't prime, so it doesn't belong.`, `${a}, ${b} and ${c} are all prime, so the answer is ${correct}`],
  };
}

const primeFactorisation: Gen = (r, tier) => {
  if (tier === 1) return r.next() < 0.75 ? productQuestion(r, 1) : whichIsProduct(r);
  return r.next() < 0.7 ? productQuestion(r, 2) : fromIndexForm(r);
};

// ------------------------------------------------------------ HCF and LCM

/** Two numbers with a common factor bigger than 1, where neither divides the other. */
function hcfPair(r: Rng, max: number): [number, number] {
  for (;;) {
    const h = r.pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 15]);
    const p = r.int(2, Math.floor(max / h));
    const q = r.int(2, Math.floor(max / h));
    if (p === q || hcf(p, q) !== 1) continue;
    return p < q ? [h * p, h * q] : [h * q, h * p];
  }
}

/** Two numbers whose LCM is less than their product, neither dividing the other. */
function lcmPair(r: Rng, max: number): [number, number] {
  for (;;) {
    const a = r.int(4, max);
    const b = r.int(4, max);
    if (a === b || a % b === 0 || b % a === 0 || hcf(a, b) === 1) continue;
    return a < b ? [a, b] : [b, a];
  }
}

function hcfListing(a: number, b: number): string[] {
  const fa = factorsOf(a);
  const fb = factorsOf(b);
  const common = fa.filter((x) => fb.includes(x));
  return [`Factors of ${a}: ${fa.join(", ")}`, `Factors of ${b}: ${fb.join(", ")}`, `Common factors: ${common.join(", ")}`, `The highest common factor is ${hcf(a, b)}`];
}

function lcmListing(a: number, b: number): string[] {
  const l = lcmOf(a, b);
  const big = Math.max(a, b);
  const small = Math.min(a, b);
  const ms: number[] = [];
  for (let m = big; m <= l; m += big) ms.push(m);
  return [`Multiples of ${big}: ${ms.join(", ")}`, `Check each one: does ${small} go into it?`, `${l} ÷ ${small} = ${l / small}, so the lowest common multiple is ${l}`];
}

function hcfWrongs(a: number, b: number) {
  const h = hcf(a, b);
  const lowerCommon = factorsOf(h).filter((x) => x > 1 && x < h);
  return cleanNums(h, [
    { value: lcmOf(a, b), misconception: "hcf-lcm-swapped" },
    ...lowerCommon.map((x) => ({ value: x, misconception: "hcf-not-highest" })),
  ]);
}

function lcmWrongs(a: number, b: number) {
  const l = lcmOf(a, b);
  return cleanNums(l, [
    { value: hcf(a, b), misconception: "hcf-lcm-swapped" },
    { value: a * b, misconception: "lcm-multiplied" },
    { value: 2 * l, misconception: "lcm-not-lowest" },
  ]);
}

function primeSteps(a: number, b: number, want: "hcf" | "lcm"): string[] {
  const pa = primePowers(a);
  const pb = primePowers(b);
  const all = [...new Set([...pa.keys(), ...pb.keys()])].sort((x, y) => x - y);
  const shared: number[] = [];
  const total: number[] = [];
  for (const p of all) {
    const ka = pa.get(p) ?? 0;
    const kb = pb.get(p) ?? 0;
    for (let i = 0; i < Math.min(ka, kb); i++) shared.push(p);
    for (let i = 0; i < Math.max(ka, kb); i++) total.push(p);
  }
  const lines = [`${a} = ${fullForm(a)}`, `${b} = ${fullForm(b)}`];
  if (want === "hcf") {
    lines.push(`Primes in both lists (the middle of a Venn diagram): ${shared.join(", ")}`, `HCF = ${shared.join(" × ")} = ${hcf(a, b)}`);
  } else {
    lines.push(`Use every prime, but count shared ones only once: ${total.join(", ")}`, `LCM = ${total.join(" × ")} = ${lcmOf(a, b)}`);
  }
  return lines;
}

function plainHcf(r: Rng, tier: Tier): Q {
  const [a, b] = hcfPair(r, tier === 1 ? 48 : 150);
  const h = hcf(a, b);
  return {
    prompt: `Find the highest common factor (HCF) of ${a} and ${b}.`,
    answer: { kind: "integer", value: h },
    wrongAnswers: hcfWrongs(a, b),
    hints: [tier === 1 ? `List the factors of ${a}, then the factors of ${b}.` : `Write ${a} and ${b} as products of primes.`, tier === 1 ? `Find the biggest number that is in both lists.` : `Multiply the primes that appear in both.`],
    solution: tier === 1 ? hcfListing(a, b) : primeSteps(a, b, "hcf"),
    answerHelp: HELP_NUMBER,
  };
}

function plainLcm(r: Rng, tier: Tier): Q {
  const [a, b] = lcmPair(r, tier === 1 ? 15 : 40);
  const l = lcmOf(a, b);
  return {
    prompt: `Find the lowest common multiple (LCM) of ${a} and ${b}.`,
    answer: { kind: "integer", value: l },
    wrongAnswers: lcmWrongs(a, b),
    hints: [tier === 1 ? `Write out the times table of ${Math.max(a, b)}.` : `Write ${a} and ${b} as products of primes.`, tier === 1 ? `Stop at the first one that ${Math.min(a, b)} also goes into.` : `Use every prime from both, but shared primes only once.`],
    solution: tier === 1 ? lcmListing(a, b) : primeSteps(a, b, "lcm"),
    answerHelp: HELP_NUMBER,
  };
}

function givenPrimes(r: Rng): Q {
  const want = r.pick(["hcf", "lcm"] as const);
  let a: number;
  let b: number;
  do {
    a = pickComposite(r, 24, 200, 3);
    b = pickComposite(r, 24, 200, 3);
  } while (a === b || hcf(a, b) === 1 || a % b === 0 || b % a === 0 || lcmOf(a, b) > 5000);
  const ans = want === "hcf" ? hcf(a, b) : lcmOf(a, b);
  return {
    prompt: `A = ${indexForm(a)} and B = ${indexForm(b)}. Find the ${want === "hcf" ? "highest common factor (HCF)" : "lowest common multiple (LCM)"} of A and B. Give your answer as a number.`,
    answer: { kind: "integer", value: ans },
    wrongAnswers: want === "hcf" ? hcfWrongs(a, b) : lcmWrongs(a, b),
    hints: [
      `Write each one out in full: A = ${fullForm(a)}, B = ${fullForm(b)}.`,
      want === "hcf" ? `The HCF uses only the primes that are in both.` : `The LCM uses every prime, with shared primes counted once.`,
    ],
    solution: primeSteps(a, b, want),
    answerHelp: HELP_NUMBER,
  };
}

function wordProblem(r: Rng): Q {
  const kind = r.pick(["bus", "lights", "bags", "packs"] as const);
  if (kind === "bus" || kind === "lights") {
    const [a, b] = lcmPair(r, 30);
    const l = lcmOf(a, b);
    const prompt =
      kind === "bus"
        ? `A bus to the park leaves every ${a} minutes. A bus to the town leaves every ${b} minutes. Both leave together at 9 am. How many minutes until they next leave together?`
        : `A red light flashes every ${a} seconds. A blue light flashes every ${b} seconds. They flash together now. How many seconds until they next flash together?`;
    return {
      prompt,
      answer: { kind: "integer", value: l },
      wrongAnswers: lcmWrongs(a, b),
      hints: [`They meet again at a time that's in both times tables: a common multiple.`, `You want the first time, so find the lowest common multiple of ${a} and ${b}.`],
      solution: [...lcmListing(a, b).slice(0, -1), `The LCM of ${a} and ${b} is ${l}`, `They are together again after ${l} ${kind === "bus" ? "minutes" : "seconds"}: ${l}`],
      answerHelp: HELP_NUMBER,
    };
  }
  if (kind === "bags") {
    const [a, b] = hcfPair(r, 60);
    const h = hcf(a, b);
    return {
      prompt: `Mia has ${a} pencils and ${b} rubbers. She puts them into identical party bags, with no pencils or rubbers left over. What is the greatest number of bags she can make?`,
      answer: { kind: "integer", value: h },
      wrongAnswers: hcfWrongs(a, b),
      hints: [`The number of bags must divide ${a} and ${b} exactly: a common factor.`, `You want the greatest number, so find the highest common factor.`],
      solution: [...hcfListing(a, b).slice(0, -1), `The HCF is ${h}, so she can make ${h} bags (each with ${a / h} pencils and ${b / h} rubbers): ${h}`],
      answerHelp: HELP_NUMBER,
    };
  }
  const [a, b] = r.pick([[6, 8], [6, 10], [8, 12], [10, 12], [6, 9], [4, 6], [12, 18], [8, 10]] as const);
  const l = lcmOf(a, b);
  return {
    prompt: `Bread rolls come in packs of ${a}. Burgers come in packs of ${b}. Sam wants exactly the same number of rolls and burgers. What is the smallest number of each he can buy?`,
    answer: { kind: "integer", value: l },
    wrongAnswers: lcmWrongs(a, b),
    hints: [`The number must be in the ${a} times table and the ${b} times table.`, `Find the lowest common multiple of ${a} and ${b}.`],
    solution: [...lcmListing(a, b).slice(0, -1), `${l} rolls is ${l / a} packs, and ${l} burgers is ${l / b} packs: ${l}`],
    answerHelp: HELP_NUMBER,
  };
}

const hcfLcm: Gen = (r, tier) => {
  if (tier === 1) return r.next() < 0.5 ? plainHcf(r, 1) : plainLcm(r, 1);
  const k = r.pick(["hcf", "lcm", "primes", "word", "word"] as const);
  if (k === "hcf") return plainHcf(r, 2);
  if (k === "lcm") return plainLcm(r, 2);
  if (k === "primes") return givenPrimes(r);
  return wordProblem(r);
};

export const FACTOR_GENERATORS: Record<string, Gen> = {
  "num-factors-multiples": factorsMultiples,
  "num-prime-factorisation": primeFactorisation,
  "num-hcf-lcm": hcfLcm,
};
