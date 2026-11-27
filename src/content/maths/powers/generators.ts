/**
 * Question generators for the negatives, powers and BIDMAS chain.
 *
 * Writing conventions (they matter for reading and for read-aloud):
 *  - a negative number uses the true minus sign with no space: −7.
 *  - subtraction has spaces either side: 5 − 3.
 *  - a negative number after an operation sits in brackets: 4 − (−6).
 *  - powers use superscript digits: 3², 10⁻⁴. Students type them with ^.
 *
 * Tier 1 is guided practice; tier 2 is independent practice and the skill check.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher.
 */

import { frac, type Fraction } from "@/engine/fraction";
import { sfValue, showStandardForm, sup } from "@/engine/standard-form";
import type { Rng } from "@/engine/random";
import type { Question } from "@/engine/types";
import { dec, showDec } from "../decimals/dec";

export type Tier = 1 | 2;
type Q = Omit<Question, "id" | "skillId">;
type Gen = (r: Rng, tier: Tier) => Q;
type Wrong = { value: number | Fraction; misconception: string };

/** A number as written in the lesson: −7, not -7. */
export const num = (n: number) => (n < 0 ? `−${-n}` : String(n));
/** A number after an operation sign: negatives go in brackets, like (−3). */
export const br = (n: number) => (n < 0 ? `(${num(n)})` : String(n));
/** Big whole numbers with commas, like 34,000. */
export const commas = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const HELP_INTEGER = "Type a whole number, like 12 or −5. Use the minus key for a negative number.";
const HELP_POWER = "Type just the power, like 6 or −2.";

/** Keep wrong answers that differ from the right one and from each other (the first one listed wins). */
function wrongs(right: number, list: Wrong[]): Wrong[] {
  const seen: number[] = [right];
  const out: Wrong[] = [];
  for (const w of list) {
    const v = typeof w.value === "number" ? w.value : w.value.n / w.value.d;
    if (!Number.isFinite(v) || seen.some((s) => Math.abs(s - v) < 1e-9)) continue;
    seen.push(v);
    out.push(w);
  }
  return out;
}

/** An integer question. Negative answers are shown with the true minus sign. */
function intQ(value: number, q: Omit<Q, "answer" | "wrongAnswers" | "answerHelp"> & { wrong: Wrong[]; answerHelp?: string }): Q {
  const { wrong, answerHelp, ...rest } = q;
  return {
    ...rest,
    answer: { kind: "integer", value },
    wrongAnswers: wrongs(value, wrong),
    answerHelp: answerHelp ?? HELP_INTEGER,
    ...(value < 0 || value >= 1000 ? { answerText: value < 0 ? num(value) : commas(value) } : {}),
  };
}

const nonZero = (r: Rng, lo: number, hi: number) => {
  let n = 0;
  while (n === 0) n = r.int(lo, hi);
  return n;
};

// ================================================================ negatives

function addToNegative(r: Rng): Q {
  const a = -r.int(2, 12);
  let b = r.int(2, 15);
  if (b === -a) b += 1;
  const ans = a + b;
  return intQ(ans, {
    prompt: `Work out ${num(a)} + ${b}.`,
    wrong: [
      { value: a - b, misconception: "neg-added-sizes" },
      { value: -ans, misconception: "neg-wrong-sign" },
    ],
    hints: [`Start at ${num(a)} on the number line.`, `Adding ${b} means moving ${b} places up (to the right).`],
    solution: [`Start at ${num(a)}.`, `Move ${b} places up${ans > 0 ? `: ${-a} places gets you to 0, then ${ans} more` : ""}.`, `${num(a)} + ${b} = ${num(ans)}`],
  });
}

function subtractPastZero(r: Rng): Q {
  const a = r.int(1, 9);
  const b = r.int(a + 1, a + 12);
  const ans = a - b;
  return intQ(ans, {
    prompt: `Work out ${a} − ${b}.`,
    wrong: [{ value: b - a, misconception: "neg-reversed-subtraction" }],
    hints: [`Start at ${a} and count down ${b} places.`, `It takes ${a} places to reach 0. You still have ${b - a} places to go, below zero.`],
    solution: [`Start at ${a} and move ${b} places down.`, `${a} places down gets you to 0, then ${b - a} more takes you to ${num(ans)}.`, `${a} − ${b} = ${num(ans)}`],
  });
}

function negativeMinus(r: Rng): Q {
  const a = -r.int(1, 10);
  const b = r.int(2, 10);
  const ans = a - b;
  return intQ(ans, {
    prompt: `Work out ${num(a)} − ${b}.`,
    wrong: [
      { value: a + b, misconception: "neg-moved-wrong-way" },
      { value: -ans, misconception: "neg-wrong-sign" },
    ],
    hints: [`Start at ${num(a)}. Subtracting means moving down the number line.`, `You're already below zero, so you go further below it.`],
    solution: [`Start at ${num(a)}.`, `Move ${b} places down, further below zero.`, `${num(a)} − ${b} = ${num(ans)}`],
  });
}

const PLACES = ["Glasgow", "Leeds", "Cardiff", "Belfast", "Norwich", "Oslo", "Moscow", "Ottawa", "Reykjavik"];

function temperatureChange(r: Rng): Q {
  const start = nonZero(r, -9, 6);
  const rise = start < 0 ? r.next() < 0.6 : false;
  // A fall from above zero always goes below it, so every question crosses or stays below zero.
  const d = start > 0 && !rise ? r.int(start + 1, start + 10) : r.int(3, 12);
  const end = rise ? start + d : start - d;
  if (end === 0) return temperatureChange(r);
  const place = r.pick(PLACES);
  const word = rise ? "risen" : "fallen";
  return intQ(end, {
    prompt: `At 6 am the temperature in ${place} was ${num(start)} °C. By ${rise ? "midday" : "midnight"} it had ${word} by ${d} degrees. What was the temperature then?`,
    wrong: [
      { value: rise ? start - d : start + d, misconception: "neg-moved-wrong-way" },
      { value: -end, misconception: "neg-wrong-sign" },
    ],
    hints: [`Picture a thermometer. ${rise ? "Rising" : "Falling"} means moving ${rise ? "up" : "down"}.`, `Start at ${num(start)} and count ${d} degrees ${rise ? "up" : "down"}.`],
    solution: [`${rise ? "Rising" : "Falling"} by ${d} means ${rise ? "add" : "subtract"} ${d}.`, `${num(start)} ${rise ? "+" : "−"} ${d} = ${num(end)}`, `The temperature was ${num(end)} °C.`],
    answerHelp: "Type a number like 5 or −3. You don't need to type °C.",
  });
}

function compareNegatives(r: Rng): Q {
  const big = -r.int(1, 6);
  const small = -r.int(-big + 2, 12);
  const [x, y] = r.next() < 0.5 ? [big, small] : [small, big];
  const cold = r.next() < 0.5;
  if (cold) {
    return intQ(small, {
      prompt: `Which is colder, ${num(x)} °C or ${num(y)} °C? Type the colder temperature.`,
      wrong: [{ value: big, misconception: "neg-bigger-digit-bigger" }],
      hints: ["Picture a thermometer. Colder is further down.", `${num(small)} is further below zero than ${num(big)}.`],
      solution: [`${num(small)} °C is ${-small} degrees below zero; ${num(big)} °C is only ${-big} below.`, `Further below zero is colder.`, `${num(small)} °C is colder.`],
      answerHelp: "Type one of the two temperatures, like −5.",
    });
  }
  return intQ(big, {
    prompt: `Which is bigger, ${num(x)} or ${num(y)}? Type the bigger number.`,
    wrong: [{ value: small, misconception: "neg-bigger-digit-bigger" }],
    hints: ["On a number line, numbers get bigger as you go right.", `Which one is closer to zero?`],
    solution: [`${num(big)} is closer to zero than ${num(small)}, so it is further right on the number line.`, `${num(big)} is bigger.`],
    answerHelp: "Type one of the two numbers, like −5.",
  });
}

function subtractNegative(r: Rng): Q {
  const a = nonZero(r, -9, 9);
  const b = r.int(2, 9);
  const ans = a + b;
  if (ans === 0) return subtractNegative(r);
  return intQ(ans, {
    prompt: `Work out ${num(a)} − (${num(-b)}).`,
    wrong: [
      { value: a - b, misconception: "neg-minus-minus" },
      { value: -ans, misconception: "neg-wrong-sign" },
    ],
    hints: ["Subtracting a negative is the same as adding.", `${num(a)} − (${num(-b)}) is the same as ${num(a)} + ${b}.`],
    solution: [`The two minus signs make a plus: ${num(a)} − (${num(-b)}) = ${num(a)} + ${b}.`, `Start at ${num(a)} and move ${b} places up.`, `= ${num(ans)}`],
  });
}

function addNegative(r: Rng): Q {
  const a = r.int(1, 12);
  let b = r.int(2, 15);
  if (b === a) b += 1;
  const ans = a - b;
  return intQ(ans, {
    prompt: `Work out ${a} + (${num(-b)}).`,
    wrong: [
      { value: a + b, misconception: "neg-plus-negative" },
      { value: -ans, misconception: "neg-wrong-sign" },
    ],
    hints: ["Adding a negative is the same as subtracting.", `${a} + (${num(-b)}) is the same as ${a} − ${b}.`],
    solution: [`Adding a negative means subtracting: ${a} + (${num(-b)}) = ${a} − ${b}.`, `Start at ${a} and move ${b} places down.`, `= ${num(ans)}`],
  });
}

function multiplyDivideNegatives(r: Rng): Q {
  const x = r.int(2, 12);
  const y = r.int(2, 9);
  const signs = r.pick([[-1, 1], [1, -1], [-1, -1], [-1, -1]] as const);
  const divide = r.next() < 0.4;
  const same = signs[0] === signs[1];
  const rule = same ? "The signs are the same, so the answer is positive." : "The signs are different, so the answer is negative.";
  const mc = same ? "neg-two-negatives" : "neg-sign-different";
  if (divide) {
    const a = signs[0] * x * y;
    const b = signs[1] * y;
    const ans = a / b;
    return intQ(ans, {
      prompt: `Work out ${num(a)} ÷ ${br(b)}.`,
      wrong: [{ value: -ans, misconception: mc }],
      hints: ["Divide the numbers without their signs first.", "Then the sign: same signs give +, different signs give −."],
      solution: [`Without the signs: ${x * y} ÷ ${y} = ${x}.`, rule, `${num(a)} ÷ ${br(b)} = ${num(ans)}`],
    });
  }
  const a = signs[0] * x;
  const b = signs[1] * y;
  const ans = a * b;
  return intQ(ans, {
    prompt: `Work out ${num(a)} × ${br(b)}.`,
    wrong: [{ value: -ans, misconception: mc }],
    hints: ["Multiply the numbers without their signs first.", "Then the sign: same signs give +, different signs give −."],
    solution: [`Without the signs: ${x} × ${y} = ${x * y}.`, rule, `${num(a)} × ${br(b)} = ${num(ans)}`],
  });
}

function temperatureDifference(r: Rng): Q {
  const low = -r.int(2, 14);
  const high = r.int(1, 15);
  const ans = high - low;
  const [cold, warm] = r.pick([["Oslo", "London"], ["Moscow", "Madrid"], ["Ottawa", "Miami"], ["Reykjavik", "Lisbon"], ["Helsinki", "Rome"]] as const);
  return intQ(ans, {
    prompt: `One day the temperature in ${cold} was ${num(low)} °C and in ${warm} it was ${high} °C. What is the difference between the two temperatures?`,
    wrong: [
      { value: Math.abs(high + low), misconception: "neg-difference" },
      { value: high + low, misconception: "neg-difference" },
    ],
    hints: ["Count the degrees from one temperature to the other on a thermometer.", `From ${num(low)} up to 0 is ${-low} degrees. Then from 0 up to ${high}.`],
    solution: [`From ${num(low)} °C up to 0 °C is ${-low} degrees.`, `From 0 °C up to ${high} °C is ${high} degrees.`, `Difference = ${-low} + ${high} = ${ans} degrees.`],
    answerHelp: "Type a whole number of degrees, like 12.",
  });
}

const negatives: Gen = (r, tier) => {
  const x = r.next();
  if (tier === 1) {
    if (x < 0.22) return addToNegative(r);
    if (x < 0.44) return subtractPastZero(r);
    if (x < 0.62) return negativeMinus(r);
    if (x < 0.82) return temperatureChange(r);
    return compareNegatives(r);
  }
  if (x < 0.25) return subtractNegative(r);
  if (x < 0.42) return addNegative(r);
  if (x < 0.75) return multiplyDivideNegatives(r);
  if (x < 0.88) return temperatureDifference(r);
  return r.next() < 0.5 ? temperatureChange(r) : negativeMinus(r);
};

// ========================================================= powers and roots

function square(r: Rng): Q {
  const n = r.int(2, 12);
  const words = r.next() < 0.5;
  return intQ(n * n, {
    prompt: words ? `What is ${n} squared?` : `Work out ${n}².`,
    wrong: [{ value: 2 * n, misconception: "pow-multiplied" }],
    hints: [`Squared means the number times itself.`, `${n}² = ${n} × ${n}`],
    solution: [`${n}² means ${n} × ${n}.`, `${n} × ${n} = ${n * n}`],
    answerHelp: "Type a whole number, like 36.",
  });
}

function cube(r: Rng): Q {
  const n = r.pick([2, 3, 4, 5, 10]);
  const words = r.next() < 0.5;
  return intQ(n ** 3, {
    prompt: words ? `What is ${n} cubed?` : `Work out ${n}³.`,
    wrong: [
      { value: 3 * n, misconception: "pow-multiplied" },
      { value: n * n, misconception: "pow-squared-not-cubed" },
    ],
    hints: [`Cubed means three ${n}s multiplied together.`, `${n} × ${n} = ${n * n}. Now multiply by ${n} again.`],
    solution: [`${n}³ means ${n} × ${n} × ${n}.`, `${n} × ${n} = ${n * n}, and ${n * n} × ${n} = ${commas(n ** 3)}.`, `${n}³ = ${commas(n ** 3)}`],
    answerHelp: "Type a whole number, like 27.",
  });
}

function squareRoot(r: Rng): Q {
  const n = r.int(2, 12);
  const words = r.next() < 0.5;
  return intQ(n, {
    prompt: words ? `What is the square root of ${n * n}?` : `Work out √${n * n}.`,
    wrong: [{ value: frac(n * n, 2), misconception: "root-halved" }],
    hints: [`Which number times itself makes ${n * n}?`, `Try the square numbers: ${n - 1} × ${n - 1} = ${(n - 1) ** 2}. What about ${n} × ${n}?`],
    solution: [`${n} × ${n} = ${n * n}.`, `So √${n * n} = ${n}`],
    answerHelp: "Type a whole number, like 6.",
  });
}

function cubeRoot(r: Rng): Q {
  const n = r.pick([2, 3, 4, 5, 10]);
  const words = r.next() < 0.5;
  return intQ(n, {
    prompt: words ? `What is the cube root of ${n ** 3}?` : `Work out ∛${n ** 3}.`,
    wrong: [
      { value: frac(n ** 3, 3), misconception: "root-divided-three" },
      { value: Number.isInteger(Math.sqrt(n ** 3)) ? Math.sqrt(n ** 3) : NaN, misconception: "root-square-for-cube" },
    ],
    hints: [`Which number, multiplied by itself three times, makes ${n ** 3}?`, `Try small numbers: 2 × 2 × 2 = 8, 3 × 3 × 3 = 27, 4 × 4 × 4 = 64.`],
    solution: [`${n} × ${n} × ${n} = ${n ** 3}.`, `So ∛${n ** 3} = ${n}`],
    answerHelp: "Type a whole number, like 3.",
  });
}

function sumOfSquares(r: Rng): Q {
  const a = r.int(2, 9);
  let b = r.int(2, 9);
  if (b === a) b = a === 9 ? 2 : a + 1;
  const ans = a * a + b * b;
  return intQ(ans, {
    prompt: `Work out ${a}² + ${b}².`,
    wrong: [{ value: 2 * a + 2 * b, misconception: "pow-multiplied" }],
    hints: ["Work out each square first, then add.", `${a}² = ${a} × ${a}`],
    solution: [`${a}² = ${a * a}`, `${b}² = ${b * b}`, `${a * a} + ${b * b} = ${ans}`],
    answerHelp: "Type a whole number.",
  });
}

function higherPower(r: Rng): Q {
  const [b, p] = r.pick([[2, 4], [2, 5], [2, 6], [3, 4], [5, 3], [10, 4], [10, 5], [10, 6], [1, 7], [6, 3]] as const);
  const ans = b ** p;
  const factors = Array(p).fill(b).join(" × ");
  return intQ(ans, {
    prompt: `Work out ${b}${sup(p)}.`,
    wrong: [{ value: b * p, misconception: "pow-multiplied" }],
    hints: [`${b}${sup(p)} means ${p} lots of ${b} multiplied together.`, `${factors}`],
    solution: [`${b}${sup(p)} = ${factors}`, b === 1 ? `1 times itself is always 1.` : `Multiply step by step: ${Array.from({ length: p }, (_, i) => commas(b ** (i + 1))).join(", ")}.`, `${b}${sup(p)} = ${commas(ans)}`],
    answerHelp: "Type a whole number.",
  });
}

function squareFromArea(r: Rng): Q {
  const n = r.int(3, 12);
  const unit = r.pick(["cm", "m", "mm"]);
  return intQ(n, {
    prompt: `A square has an area of ${n * n} ${unit}². How long is one side?`,
    wrong: [
      { value: frac(n * n, 4), misconception: "root-area-quartered" },
      { value: frac(n * n, 2), misconception: "root-halved" },
    ],
    hints: ["Area of a square = side × side.", `Which number times itself makes ${n * n}?`],
    solution: [`side × side = ${n * n}`, `${n} × ${n} = ${n * n}, so the side is √${n * n}.`, `Each side is ${n} ${unit}.`],
    answerHelp: "Type a number. Units are fine but not needed.",
  });
}

function cubeFromVolume(r: Rng): Q {
  const n = r.pick([2, 3, 4, 5, 10]);
  const unit = r.pick(["cm", "m"]);
  const v = n ** 3;
  return intQ(n, {
    prompt: `A cube has a volume of ${commas(v)} ${unit}³. How long is each edge?`,
    wrong: [
      { value: Number.isInteger(Math.sqrt(v)) ? Math.sqrt(v) : NaN, misconception: "root-square-for-cube" },
      { value: frac(v, 3), misconception: "root-divided-three" },
    ],
    hints: ["Volume of a cube = edge × edge × edge.", `Which number, used three times, multiplies to ${commas(v)}?`],
    solution: [`edge × edge × edge = ${commas(v)}`, `${n} × ${n} × ${n} = ${commas(v)}, so the edge is ∛${commas(v)}.`, `Each edge is ${n} ${unit}.`],
    answerHelp: "Type a number. Units are fine but not needed.",
  });
}

function rootsAndPowers(r: Rng): Q {
  const a = r.int(2, 10);
  const c = r.pick([2, 3, 4, 5]);
  const ans = a + c ** 3;
  return intQ(ans, {
    prompt: `Work out √${a * a} + ${c}³.`,
    wrong: [
      { value: a + 3 * c, misconception: "pow-multiplied" },
      { value: frac(a * a + 2 * c ** 3, 2), misconception: "root-halved" },
    ],
    hints: ["Work out each part on its own, then add.", `√${a * a}: which number times itself makes ${a * a}? ${c}³ = ${c} × ${c} × ${c}.`],
    solution: [`√${a * a} = ${a}`, `${c}³ = ${c ** 3}`, `${a} + ${c ** 3} = ${ans}`],
    answerHelp: "Type a whole number.",
  });
}

function estimateRoot(r: Rng): Q {
  const n = r.int(3, 11);
  const k = nonZero(r, -(n - 1), n - 1);
  const x = n * n + k;
  return intQ(n, {
    prompt: `Estimate √${x} to the nearest whole number.`,
    wrong: [{ value: frac(x, 2), misconception: "root-halved" }],
    hints: [`Find the square numbers either side of ${x}.`, `${n - 1}² = ${(n - 1) ** 2}, ${n}² = ${n * n}, ${n + 1}² = ${(n + 1) ** 2}. Which is closest to ${x}?`],
    solution: [
      `${x} is between ${k > 0 ? n * n : (n - 1) ** 2} and ${k > 0 ? (n + 1) ** 2 : n * n}.`,
      `It is closest to ${n * n}, and √${n * n} = ${n}.`,
      `√${x} ≈ ${n}`,
    ],
    answerHelp: "Type a whole number.",
  });
}

const powersRoots: Gen = (r, tier) => {
  const x = r.next();
  if (tier === 1) {
    if (x < 0.35) return square(r);
    if (x < 0.6) return squareRoot(r);
    if (x < 0.82) return cube(r);
    return cubeRoot(r);
  }
  if (x < 0.15) return sumOfSquares(r);
  if (x < 0.3) return higherPower(r);
  if (x < 0.45) return squareFromArea(r);
  if (x < 0.57) return cubeFromVolume(r);
  if (x < 0.72) return rootsAndPowers(r);
  if (x < 0.85) return estimateRoot(r);
  return r.next() < 0.5 ? cubeRoot(r) : cube(r);
};

// ===================================================== order of operations

function addTimes(r: Rng): Q {
  const a = r.int(2, 20);
  const b = r.int(2, 9);
  const c = r.int(2, 9);
  const flip = r.next() < 0.4;
  const ans = a + b * c;
  const expr = flip ? `${b} × ${c} + ${a}` : `${a} + ${b} × ${c}`;
  return intQ(ans, {
    prompt: `Work out ${expr}.`,
    wrong: flip ? [{ value: b * (c + a), misconception: "bidmas-ignored-brackets" }] : [{ value: (a + b) * c, misconception: "bidmas-left-to-right" }],
    hints: ["Multiply before you add.", `Work out ${b} × ${c} first.`],
    solution: [`Multiplication comes first: ${b} × ${c} = ${b * c}.`, flip ? `Then ${b * c} + ${a} = ${ans}` : `Then ${a} + ${b * c} = ${ans}`],
  });
}

function subtractTimes(r: Rng): Q {
  const b = r.int(2, 9);
  const c = r.int(2, 9);
  const a = b * c + r.int(1, 20);
  const ans = a - b * c;
  return intQ(ans, {
    prompt: `Work out ${a} − ${b} × ${c}.`,
    wrong: [{ value: (a - b) * c, misconception: "bidmas-left-to-right" }],
    hints: ["Multiply before you subtract.", `Work out ${b} × ${c} first.`],
    solution: [`Multiplication comes first: ${b} × ${c} = ${b * c}.`, `Then ${a} − ${b * c} = ${ans}`],
  });
}

function bracketsFirst(r: Rng): Q {
  const a = r.int(2, 12);
  const b = r.int(2, 9);
  const c = r.int(2, 9);
  const minus = r.next() < 0.35 && a > b;
  const inside = minus ? a - b : a + b;
  const ans = inside * c;
  const sign = minus ? "−" : "+";
  return intQ(ans, {
    prompt: `Work out (${a} ${sign} ${b}) × ${c}.`,
    wrong: [{ value: minus ? a - b * c : a + b * c, misconception: "bidmas-ignored-brackets" }],
    hints: ["Brackets come first.", `Work out ${a} ${sign} ${b} first.`],
    solution: [`Brackets first: ${a} ${sign} ${b} = ${inside}.`, `Then ${inside} × ${c} = ${ans}`],
  });
}

function addDivide(r: Rng): Q {
  const c = r.int(2, 9);
  const k = r.int(2, 9);
  const a = r.int(2, 15);
  const ans = a + k;
  const leftToRight = (a + c * k) / c;
  return intQ(ans, {
    prompt: `Work out ${a} + ${c * k} ÷ ${c}.`,
    wrong: [{ value: Number.isInteger(leftToRight) ? leftToRight : frac(a + c * k, c), misconception: "bidmas-left-to-right" }],
    hints: ["Divide before you add.", `Work out ${c * k} ÷ ${c} first.`],
    solution: [`Division comes first: ${c * k} ÷ ${c} = ${k}.`, `Then ${a} + ${k} = ${ans}`],
  });
}

function minusPlus(r: Rng): Q {
  const b = r.int(2, 9);
  const c = r.int(2, 9);
  const a = b + c + r.int(1, 15);
  const ans = a - b + c;
  return intQ(ans, {
    prompt: `Work out ${a} − ${b} + ${c}.`,
    wrong: [{ value: a - (b + c), misconception: "bidmas-add-before-subtract" }],
    hints: ["Adding and subtracting are equal partners. Work from left to right.", `Start with ${a} − ${b}.`],
    solution: [`Left to right: ${a} − ${b} = ${a - b}.`, `Then ${a - b} + ${c} = ${ans}`],
  });
}

function divideTimes(r: Rng): Q {
  const b = r.pick([2, 3, 4, 5, 6]);
  const c = r.pick([2, 3, 4]);
  const k = r.int(2, 6);
  const a = b * c * k; // so a ÷ (b × c) is also whole, and the slip is a real temptation
  const ans = (a / b) * c;
  return intQ(ans, {
    prompt: `Work out ${a} ÷ ${b} × ${c}.`,
    wrong: [{ value: a / (b * c), misconception: "bidmas-multiply-before-divide" }],
    hints: ["Multiplying and dividing are equal partners. Work from left to right.", `Start with ${a} ÷ ${b}.`],
    solution: [`Left to right: ${a} ÷ ${b} = ${a / b}.`, `Then ${a / b} × ${c} = ${ans}`],
  });
}

function addPower(r: Rng): Q {
  const a = r.int(2, 15);
  const b = r.int(2, 9);
  const ans = a + b * b;
  return intQ(ans, {
    prompt: `Work out ${a} + ${b}².`,
    wrong: [
      { value: (a + b) ** 2, misconception: "bidmas-power-late" },
      { value: a + 2 * b, misconception: "pow-multiplied" },
    ],
    hints: ["Powers come before adding.", `The ² belongs only to the ${b}. Work out ${b}² first.`],
    solution: [`Power first: ${b}² = ${b * b}.`, `Then ${a} + ${b * b} = ${ans}`],
  });
}

function timesPower(r: Rng): Q {
  const a = r.int(2, 6);
  const b = r.int(2, 6);
  const ans = a * b * b;
  return intQ(ans, {
    prompt: `Work out ${a} × ${b}².`,
    wrong: [
      { value: (a * b) ** 2, misconception: "bidmas-power-late" },
      { value: a * 2 * b, misconception: "pow-multiplied" },
    ],
    hints: ["Powers come before multiplying.", `The ² belongs only to the ${b}.`],
    solution: [`Power first: ${b}² = ${b * b}.`, `Then ${a} × ${b * b} = ${ans}`],
  });
}

function bracketSquared(r: Rng): Q {
  const b = r.int(1, 6);
  const a = b + r.int(2, 7);
  const c = r.int(1, 12);
  const inside = a - b;
  const ans = inside * inside + c;
  return intQ(ans, {
    prompt: `Work out (${a} − ${b})² + ${c}.`,
    wrong: [
      { value: inside * 2 + c, misconception: "pow-multiplied" },
      { value: a - b * b + c, misconception: "bidmas-ignored-brackets" },
    ],
    hints: ["Brackets first, then the power, then add.", `${a} − ${b} = ${inside}. Now square it.`],
    solution: [`Brackets: ${a} − ${b} = ${inside}.`, `Power: ${inside}² = ${inside * inside}.`, `Add: ${inside * inside} + ${c} = ${ans}`],
  });
}

function subtractBracketTimes(r: Rng): Q {
  const b = r.int(2, 5);
  const c = r.int(1, 5);
  const d = r.int(1, 5);
  const a = r.int(b * (c + d) + 1, b * (c + d) + 20);
  const ans = a - b * (c + d);
  return intQ(ans, {
    prompt: `Work out ${a} − ${b} × (${c} + ${d}).`,
    wrong: [
      { value: (a - b) * (c + d), misconception: "bidmas-left-to-right" },
      { value: a - b * c + d, misconception: "bidmas-ignored-brackets" },
    ],
    hints: ["Brackets first, then multiply, then subtract.", `${c} + ${d} = ${c + d}.`],
    solution: [`Brackets: ${c} + ${d} = ${c + d}.`, `Multiply: ${b} × ${c + d} = ${b * (c + d)}.`, `Subtract: ${a} − ${b * (c + d)} = ${ans}`],
  });
}

function negativeResult(r: Rng): Q {
  const b = r.int(2, 6);
  const c = r.int(3, 9);
  const a = r.int(1, b * c - 1);
  const ans = a - b * c;
  return intQ(ans, {
    prompt: `Work out ${a} − ${b} × ${c}.`,
    wrong: [
      { value: (a - b) * c, misconception: "bidmas-left-to-right" },
      { value: -ans, misconception: "bidmas-sign-slip" },
    ],
    hints: ["Multiply before you subtract.", `${b} × ${c} = ${b * c}. Is ${b * c} bigger than ${a}?`],
    solution: [`Multiplication first: ${b} × ${c} = ${b * c}.`, `Then ${a} − ${b * c}. Taking a bigger number away gives a negative answer.`, `${a} − ${b * c} = ${num(ans)}`],
  });
}

function timesNegativeInBidmas(r: Rng): Q {
  const a = r.int(2, 20);
  const b = r.int(2, 6);
  const c = -r.int(2, 6);
  const ans = a - b * c;
  return intQ(ans, {
    prompt: `Work out ${a} − ${b} × (${num(c)}).`,
    wrong: [
      { value: a + b * c, misconception: "neg-minus-minus" },
      { value: (a - b) * c, misconception: "bidmas-left-to-right" },
    ],
    hints: ["Multiply first.", `${b} × (${num(c)}) = ${num(b * c)}. Then subtracting a negative means adding.`],
    solution: [`Multiply first: ${b} × (${num(c)}) = ${num(b * c)}.`, `${a} − (${num(b * c)}) = ${a} + ${-b * c}.`, `= ${ans}`],
  });
}

function whereBrackets(r: Rng): Q {
  const a = r.int(2, 9);
  const b = r.int(2, 9);
  const c = r.int(2, 9);
  const firstShape = r.next() < 0.5; // a + b × c, or a × b + c
  const options = firstShape ? [`(${a} + ${b}) × ${c}`, `${a} + (${b} × ${c})`] : [`(${a} × ${b}) + ${c}`, `${a} × (${b} + ${c})`];
  const values = firstShape ? [(a + b) * c, a + b * c] : [a * b + c, a * (b + c)];
  const correctIndex = firstShape ? 0 : 1; // the one that changes the answer
  const target = values[correctIndex];
  const expr = firstShape ? `${a} + ${b} × ${c}` : `${a} × ${b} + ${c}`;
  return {
    prompt: `Where do the brackets go to make ${expr} = ${target}?`,
    answer: { kind: "choice", options, correctIndex },
    wrongAnswers: [{ value: 1 - correctIndex, misconception: "bidmas-wrong-brackets" }],
    hints: ["Work out each option, doing the brackets first.", `${options[0]} = ${values[0]}. Now try the other one.`],
    solution: [`${options[0]} = ${values[0]}`, `${options[1]} = ${values[1]}`, `So the brackets go here: ${options[correctIndex]} = ${target}`],
    answerHelp: "Choose one.",
  };
}

const orderOfOperations: Gen = (r, tier) => {
  const x = r.next();
  if (tier === 1) {
    if (x < 0.22) return addTimes(r);
    if (x < 0.4) return subtractTimes(r);
    if (x < 0.58) return bracketsFirst(r);
    if (x < 0.72) return addDivide(r);
    if (x < 0.86) return minusPlus(r);
    return whereBrackets(r);
  }
  if (x < 0.13) return addPower(r);
  if (x < 0.24) return timesPower(r);
  if (x < 0.35) return bracketSquared(r);
  if (x < 0.47) return subtractBracketTimes(r);
  if (x < 0.58) return divideTimes(r);
  if (x < 0.7) return negativeResult(r);
  if (x < 0.8) return timesNegativeInBidmas(r);
  if (x < 0.9) return minusPlus(r);
  return whereBrackets(r);
};

// ============================================================== index laws

const BASES = [2, 3, 4, 5, 6, 7, 8, 9, 10];

function powerQ(answer: number, q: Omit<Q, "answer" | "wrongAnswers" | "answerHelp"> & { wrong: Wrong[] }): Q {
  return intQ(answer, { ...q, answerHelp: HELP_POWER });
}

function multiplyPowers(r: Rng): Q {
  const b = r.pick(BASES);
  const m = r.int(2, 8);
  const n = r.int(2, 8);
  return powerQ(m + n, {
    prompt: `${b}${sup(m)} × ${b}${sup(n)} = ${b}ⁿ. What is n?`,
    wrong: [{ value: m * n, misconception: "idx-multiplied-powers" }],
    hints: ["Multiplying powers of the same number: add the powers.", `${m} ${b}s times ${n} ${b}s makes how many ${b}s?`],
    solution: [`Add the powers: ${m} + ${n} = ${m + n}.`, `${b}${sup(m)} × ${b}${sup(n)} = ${b}${sup(m + n)}`, `n = ${m + n}`],
  });
}

function dividePowers(r: Rng): Q {
  const b = r.pick(BASES);
  const n = r.int(2, 5);
  const m = n * r.pick([2, 3, 4]) > 12 ? n + r.int(1, 6) : r.next() < 0.5 ? n * r.pick([2, 3]) : n + r.int(1, 6);
  const ans = m - n;
  return powerQ(ans, {
    prompt: `${b}${sup(m)} ÷ ${b}${sup(n)} = ${b}ⁿ. What is n?`,
    wrong: [
      { value: m % n === 0 ? m / n : NaN, misconception: "idx-divided-powers" },
      { value: m + n, misconception: "idx-added-for-divide" },
    ],
    hints: ["Dividing powers of the same number: subtract the powers.", `${m} ${b}s on top, ${n} on the bottom. How many are left after cancelling?`],
    solution: [`Subtract the powers: ${m} − ${n} = ${ans}.`, `${b}${sup(m)} ÷ ${b}${sup(n)} = ${b}${sup(ans)}`, `n = ${ans}`],
  });
}

function powerOfPower(r: Rng): Q {
  const b = r.pick(BASES);
  const m = r.int(2, 5);
  let n = r.int(2, 4);
  if (m === 2 && n === 2) n = 3; // 2 + 2 = 2 × 2 can't tell the laws apart
  return powerQ(m * n, {
    prompt: `(${b}${sup(m)})${sup(n)} = ${b}ⁿ. What is n?`,
    wrong: [{ value: m + n, misconception: "idx-added-for-power" }],
    hints: [`(${b}${sup(m)})${sup(n)} means ${n} lots of ${b}${sup(m)} multiplied together.`, "For a power of a power, multiply the powers."],
    solution: [`(${b}${sup(m)})${sup(n)} = ${Array(n).fill(`${b}${sup(m)}`).join(" × ")}.`, `Multiply the powers: ${m} × ${n} = ${m * n}.`, `n = ${m * n}`],
  });
}

function zeroPower(r: Rng): Q {
  const b = r.int(2, 25);
  return intQ(1, {
    prompt: `Work out ${b}⁰.`,
    wrong: [
      { value: 0, misconception: "idx-zero-is-zero" },
      { value: b, misconception: "idx-zero-is-base" },
    ],
    hints: [`Think about ${b}² ÷ ${b}². What is anything divided by itself?`, `By the index law, ${b}² ÷ ${b}² = ${b}⁰.`],
    solution: [`${b}² ÷ ${b}² = 1, because anything divided by itself is 1.`, `By the index law, ${b}² ÷ ${b}² = ${b}²⁻² = ${b}⁰.`, `So ${b}⁰ = 1`],
    answerHelp: "Type a whole number.",
  });
}

function divideToNegative(r: Rng): Q {
  const b = r.pick(BASES);
  const m = r.int(1, 5);
  const n = m + r.int(1, 5);
  const ans = m - n;
  return powerQ(ans, {
    prompt: `${b}${sup(m)} ÷ ${b}${sup(n)} = ${b}ⁿ. What is n?`,
    wrong: [
      { value: n - m, misconception: "idx-subtracted-wrong-way" },
      { value: m + n, misconception: "idx-added-for-divide" },
    ],
    hints: ["Subtract the powers: first power take away the second.", `${m} − ${n} is less than zero.`],
    solution: [`Subtract the powers: ${m} − ${n} = ${num(ans)}.`, `${b}${sup(m)} ÷ ${b}${sup(n)} = ${b}${sup(ans)}`, `n = ${num(ans)}`],
  });
}

function sameDivide(r: Rng): Q {
  const b = r.pick(BASES);
  const m = r.int(2, 9);
  return powerQ(0, {
    prompt: `${b}${sup(m)} ÷ ${b}${sup(m)} = ${b}ⁿ. What is n?`,
    wrong: [{ value: 1, misconception: "idx-value-not-power" }],
    hints: ["Subtract the powers.", `${m} − ${m} = ?`],
    solution: [`Subtract the powers: ${m} − ${m} = 0.`, `${b}${sup(m)} ÷ ${b}${sup(m)} = ${b}⁰ (and its value is 1).`, `n = 0`],
  });
}

function combined(r: Rng): Q {
  const b = r.pick(BASES);
  const m = r.int(2, 7);
  const n = r.int(2, 7);
  const p = r.int(2, m + n - 1);
  const ans = m + n - p;
  return powerQ(ans, {
    prompt: `${b}${sup(m)} × ${b}${sup(n)} ÷ ${b}${sup(p)} = ${b}ⁿ. What is n?`,
    wrong: [
      { value: m * n - p, misconception: "idx-multiplied-powers" },
      { value: m + n + p, misconception: "idx-added-for-divide" },
    ],
    hints: ["Multiply first: add those powers. Then divide: subtract.", `${m} + ${n} = ${m + n}.`],
    solution: [`Multiply: ${m} + ${n} = ${m + n}, so ${b}${sup(m + n)}.`, `Divide: ${m + n} − ${p} = ${ans}.`, `n = ${ans}`],
  });
}

function missingPower(r: Rng): Q {
  const b = r.pick(BASES);
  const m = r.int(2, 7);
  const ans = r.int(2, 8);
  const k = m + ans;
  return powerQ(ans, {
    prompt: `${b}${sup(m)} × ${b}ⁿ = ${b}${sup(k)}. What is n?`,
    wrong: [
      { value: m + k, misconception: "idx-missing-power" },
      { value: k % m === 0 ? k / m : NaN, misconception: "idx-multiplied-powers" },
    ],
    hints: ["When you multiply, the powers add.", `${m} + n = ${k}`],
    solution: [`The powers add: ${m} + n = ${k}.`, `So n = ${k} − ${m}.`, `n = ${ans}`],
  });
}

function evaluateProduct(r: Rng): Q {
  const [b, m, n] = r.pick([[2, 3, 2], [2, 2, 2], [2, 4, 1], [2, 3, 3], [3, 2, 1], [3, 1, 2], [2, 1, 4], [10, 2, 1], [10, 3, 2], [2, 2, 3], [5, 1, 2], [3, 2, 2]] as const);
  const ans = b ** (m + n);
  const show = (p: number) => (p === 1 ? String(b) : `${b}${sup(p)}`);
  return intQ(ans, {
    prompt: `Work out ${show(m)} × ${show(n)}. Give your answer as an ordinary number.`,
    wrong: [
      { value: b ** (m * n), misconception: "idx-multiplied-powers" },
      { value: (b * b) ** (m + n), misconception: "idx-multiplied-bases" },
    ],
    hints: [`Add the powers first: ${b} to the power ${m} + ${n}.`, `Then work out ${b}${sup(m + n)} as an ordinary number.`],
    solution: [`${show(m)} × ${show(n)} = ${b}${sup(m + n)}`, `${b}${sup(m + n)} = ${Array(m + n).fill(b).join(" × ")}`, `= ${commas(ans)}`],
    answerHelp: "Type a whole number.",
  });
}

const indexLaws: Gen = (r, tier) => {
  const x = r.next();
  if (tier === 1) {
    if (x < 0.32) return multiplyPowers(r);
    if (x < 0.6) return dividePowers(r);
    if (x < 0.82) return powerOfPower(r);
    return zeroPower(r);
  }
  if (x < 0.14) return combined(r);
  if (x < 0.28) return divideToNegative(r);
  if (x < 0.4) return missingPower(r);
  if (x < 0.54) return evaluateProduct(r);
  if (x < 0.64) return sameDivide(r);
  if (x < 0.76) return powerOfPower(r);
  if (x < 0.88) return dividePowers(r);
  return zeroPower(r);
};

// ============================================================ standard form

const HELP_SF = "Type it like 3.4 x 10^4. Use x for ×, and ^ before the power (10^-4 for a negative power).";

/** A mantissa with 1 to 3 significant figures and no trailing zero, like 3.4, 7 or 2.05. */
function mantissa(r: Rng, sigFigs: number): { m: Fraction; digits: number } {
  if (sigFigs === 1) return { m: frac(r.int(1, 9)), digits: 1 };
  const last = r.int(1, 9);
  const middle = sigFigs === 3 ? r.int(0, 9) : null;
  const first = r.int(1, 9);
  const units = Number(`${first}${middle ?? ""}${last}`);
  return { m: dec(units, sigFigs - 1), digits: sigFigs };
}

function sfAnswer(m: Fraction, power: number): Question["answer"] {
  return { kind: "standard-form", mantissa: m, power };
}

function largeToSF(r: Rng, tier: Tier): Q {
  const { m, digits } = mantissa(r, tier === 1 ? r.pick([1, 2, 2]) : r.pick([2, 3]));
  const power = r.int(Math.max(3, digits), tier === 1 ? 6 : 8);
  const value = sfValue(m, power);
  const n = value.n; // whole number
  const zeros = String(n).length - String(n).replace(/0+$/, "").length;
  const ms = showDec(m);
  return {
    prompt: `Write ${commas(n)} in standard form.`,
    answer: sfAnswer(m, power),
    wrongAnswers: sfWrongs(value, [
      { value: sfValue(m, zeros), misconception: "sf-counted-zeros" },
      { value: sfValue(m, power - 1), misconception: "sf-wrong-power" },
      { value: sfValue(m, power + 1), misconception: "sf-wrong-power" },
    ]),
    hints: [`The first number must be between 1 and 10. Here it is ${ms}.`, `Count how many places the digits move to turn ${ms} into ${commas(n)}.`],
    solution: [m.d === 1 ? `Only one digit isn't zero, so the first number is ${ms}.` : `Put the point after the first digit: ${ms}.`, `${ms} → ${commas(n)} moves the digits ${power} places, so the power is ${power}.`, `${commas(n)} = ${showStandardForm(m, power)}`],
    answerHelp: HELP_SF,
  };
}

function smallToSF(r: Rng): Q {
  const { m } = mantissa(r, r.pick([1, 2, 2]));
  const power = -r.int(2, 6);
  const value = sfValue(m, power);
  const text = showDec(value);
  const zerosAfterPoint = -power - 1;
  const ms = showDec(m);
  return {
    prompt: `Write ${text} in standard form.`,
    answer: sfAnswer(m, power),
    wrongAnswers: sfWrongs(value, [
      { value: sfValue(m, -power), misconception: "sf-small-positive" },
      { value: zerosAfterPoint > 0 ? sfValue(m, -zerosAfterPoint) : frac(0), misconception: "sf-counted-zeros" },
      { value: sfValue(m, power - 1), misconception: "sf-wrong-power" },
    ]),
    hints: [`The first number is ${ms}. The number is smaller than 1, so the power is negative.`, `Count how many places the digits move to turn ${ms} into ${text}.`],
    solution: [`The first number is ${ms}.`, `${ms} → ${text} moves the digits ${-power} places smaller, so the power is ${num(power)}.`, `${text} = ${showStandardForm(m, power)}`],
    answerHelp: HELP_SF,
  };
}

function sfToOrdinary(r: Rng, tier: Tier): Q {
  const small = tier === 2 && r.next() < 0.5;
  const { m, digits } = mantissa(r, r.pick([2, 2, 3]));
  const power = small ? -r.int(1, 5) : r.int(Math.max(2, digits), 6);
  const value = sfValue(m, power);
  const units = Number(showDec(m).replace(".", "")); // the digits as a whole number: 52 for 5.2
  const ms = showDec(m);
  const answerText = small ? showDec(value) : commas(value.n);
  const wrong: Wrong[] = small
    ? [
        { value: sfValue(m, power - 1), misconception: "sf-small-extra-zero" },
        { value: sfValue(m, -power), misconception: "sf-small-positive" },
      ]
    : [
        { value: frac(units * 10 ** power), misconception: "sf-appended-zeros" },
        { value: sfValue(m, power - 1), misconception: "sf-wrong-power" },
      ];
  return {
    prompt: `Write ${showStandardForm(m, power)} as an ordinary number.`,
    answer: { kind: "fraction", value, requireSimplest: false, form: "decimal" },
    wrongAnswers: sfWrongs(value, wrong),
    hints: [
      small ? `A negative power makes the number smaller: move the digits ${-power} place${power === -1 ? "" : "s"} to the right.` : `× 10${sup(power)} makes the number bigger: move the digits ${power} places to the left.`,
      small ? `Fill the gaps before the digits with zeros.` : `Fill the gaps after the digits with zeros.`,
    ],
    solution: [
      `Move the digits ${Math.abs(power)} place${Math.abs(power) === 1 ? "" : "s"} ${small ? "smaller" : "bigger"}, one at a time: ${chain(m, power)}.`,
      `${showStandardForm(m, power)} = ${answerText}`,
    ],
    answerHelp: small ? "Type a decimal, like 0.0061." : "Type a whole number, like 5200.",
    answerText,
  };
}

/** 5.2 → 52 → 520 → 5200, one power of 10 at a time. */
function chain(m: Fraction, power: number): string {
  const steps = [showDec(m)];
  for (let i = 1; i <= Math.abs(power); i++) {
    const v = sfValue(m, power > 0 ? i : -i);
    steps.push(power > 0 ? commas(v.n / v.d) : showDec(v));
  }
  return steps.join(" → ");
}

function adjustSF(r: Rng): Q {
  const tens = r.int(11, 99);
  if (tens % 10 === 0) return adjustSF(r);
  const p = r.int(2, 6);
  const m = dec(tens, 1);
  const value = frac(tens * 10 ** p);
  return {
    prompt: `${tens} × 10${sup(p)} is not in standard form. Write it in standard form.`,
    answer: sfAnswer(m, p + 1),
    wrongAnswers: sfWrongs(value, [
      { value: sfValue(m, p - 1), misconception: "sf-adjusted-wrong-way" },
      { value: sfValue(m, p), misconception: "sf-adjusted-wrong-way" },
    ]),
    hints: [`${tens} is not between 1 and 10. Write ${tens} as ${showDec(m)} × 10.`, `Then ${showDec(m)} × 10 × 10${sup(p)}. Add the powers of 10.`],
    solution: [`${tens} = ${showDec(m)} × 10¹`, `${showDec(m)} × 10¹ × 10${sup(p)} = ${showDec(m)} × 10${sup(p + 1)}`, `${tens} × 10${sup(p)} = ${showStandardForm(m, p + 1)}`],
    answerHelp: HELP_SF,
  };
}

function whichIsSF(r: Rng): Q {
  const { m } = mantissa(r, 2);
  const p = r.int(3, 6);
  const ms = showDec(m);
  const big = showDec(sfValue(m, 1));
  const small = showDec(sfValue(m, -1));
  const pool = [
    { text: `${ms} × 10${sup(p)}`, mc: null },
    { text: `${big} × 10${sup(p - 1)}`, mc: "sf-not-between-1-10" },
    { text: `${small} × 10${sup(p + 1)}`, mc: "sf-not-between-1-10" },
    { text: `${ms} × ${commas(10 ** p)}`, mc: "sf-not-power-of-ten" },
  ];
  // Shuffle with the seeded generator so the right answer moves around.
  const order = [0, 1, 2, 3].map((i) => ({ i, k: r.next() })).sort((a, b) => a.k - b.k).map((x) => x.i);
  const options = order.map((i) => pool[i].text);
  const correctIndex = order.indexOf(0);
  return {
    prompt: "Which one of these is written in standard form?",
    answer: { kind: "choice", options, correctIndex },
    wrongAnswers: order.flatMap((i, idx) => (pool[i].mc ? [{ value: idx, misconception: pool[i].mc! }] : [])),
    hints: ["Standard form is a number from 1 up to (not including) 10, times a power of 10.", "Check the first number in each one. Then check it uses a power like 10³."],
    solution: [`${big} is bigger than 10 and ${small} is less than 1, so those aren't standard form.`, `${ms} × ${commas(10 ** p)} doesn't use a power of 10.`, `${pool[0].text} is in standard form.`],
    answerHelp: "Choose one.",
  };
}

function sfWrongs(value: Fraction, list: Wrong[]): Wrong[] {
  return wrongs(value.n / value.d, list.filter((w) => typeof w.value === "number" || w.value.n !== 0));
}

const standardForm: Gen = (r, tier) => {
  const x = r.next();
  if (tier === 1) {
    if (x < 0.45) return largeToSF(r, 1);
    if (x < 0.8) return sfToOrdinary(r, 1);
    return whichIsSF(r);
  }
  if (x < 0.25) return largeToSF(r, 2);
  if (x < 0.5) return smallToSF(r);
  if (x < 0.78) return sfToOrdinary(r, 2);
  if (x < 0.92) return adjustSF(r);
  return whichIsSF(r);
};

export const POWERS_GENERATORS: Record<string, Gen> = {
  "num-negatives": negatives,
  "num-powers-roots": powersRoots,
  "num-order-of-operations": orderOfOperations,
  "num-index-laws": indexLaws,
  "num-standard-form": standardForm,
};
