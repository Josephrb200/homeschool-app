/**
 * Question generators for the calculation chains: ordering, written
 * multiplication and division, inverse operations, units, time and money,
 * estimation, error intervals, systematic listing and standard form
 * calculations.
 *
 * Every number is chosen so the method is short and the answer exact. Every
 * predicted wrong answer is checked so it never equals the right one.
 * Writing conventions match the rest of the app: true minus for negatives
 * (−7), spaces round operation signs, superscript powers (10⁴).
 *
 * Tier 1 is guided practice; tier 2 is independent practice and the skill check.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher.
 */

import { add, div, frac, mul, sub, type Fraction } from "@/engine/fraction";
import { sfValue, showStandardForm, sup } from "@/engine/standard-form";
import type { Rng } from "@/engine/random";
import { dec, roundDp, roundSf, showDec, showMoney } from "../decimals/dec";
import { cap, choiceQ, clean, decAnswer, NAMES, num, shuffle, type Gen, type Q, type Wrong } from "./helpers";

const HELP_WHOLE = "Type a whole number, like 245.";
const HELP_DEC = "Type a number. Decimals are fine, like 4.8.";
const HELP_MONEY = "Type an amount in pounds, like 3.75. The £ sign is fine but not needed.";
const HELP_LIST = "Type the numbers with commas between them, like 4, 5, 6.";
const HELP_SF = "Type it like 3.4 x 10^4. Use x for ×, and ^ before the power (10^-4 for a negative power).";

const intAnswer = (value: number) => ({ kind: "integer" as const, value });

// ================================================================ ordering

/** Hundredths shown as 0.35; tenths as 0.4. */
const d = (units: number, dp: number) => showDec(dec(units, dp));

const SIGNS = ["<", ">", "="] as const;
const signFor = (a: Fraction, b: Fraction) => {
  const x = a.n * b.d - b.n * a.d;
  return x < 0 ? "<" : x > 0 ? ">" : "=";
};
const SIGN_HELP = "< means 'is less than' and > means 'is greater than'. The wide, open end faces the bigger number.";

function compareDecimals(r: Rng, tier: number): Q {
  const t = r.int(2, 8);
  const whole = tier === 1 ? 0 : r.int(0, 9);
  const shortU = whole * 10 + t; // e.g. 0.4 → 4 tenths
  // A longer decimal: smaller (0.35) most of the time, sometimes bigger (0.45), sometimes equal (0.40).
  const roll = r.next();
  const longU = roll < 0.6 ? (whole * 10 + t - 1) * 10 + r.int(1, 9) : roll < 0.85 || tier === 1 ? (whole * 10 + t) * 10 + r.int(1, 9) : (whole * 10 + t) * 10;
  const shortV = dec(shortU, 1);
  const longV = dec(longU, 2);
  const longText = roll >= 0.85 && tier !== 1 ? `${whole}.${t}0` : d(longU, 2);
  const shortFirst = r.next() < 0.5;
  const [a, b, aText, bText] = shortFirst ? [shortV, longV, d(shortU, 1), longText] : [longV, shortV, longText, d(shortU, 1)];
  const right = signFor(a, b);
  // The misconception: "more digits means bigger".
  const longFirst = !shortFirst;
  const mcPick = right === "=" ? (longFirst ? ">" : "<") : longFirst ? ">" : "<";
  const sTenths = shortU;
  return choiceQ(
    r,
    right,
    SIGNS.filter((s) => s !== right).map((s) => ({ text: s, mc: s === mcPick ? "ord-longer-bigger" : undefined })),
    {
      prompt: `Which sign goes in the gap?  ${aText} ? ${bText}`,
      hints: [
        `Give both numbers the same number of decimal places by adding a zero: ${showDec(shortV)} = ${showDec(shortV, 2)}.`,
        `Now compare ${showDec(shortV, 2)} and ${longText} column by column, starting from the left. ${SIGN_HELP}`,
      ],
      solution: [
        `Write them with the same number of decimal places: ${showDec(shortV)} = ${showDec(shortV, 2)} (${sTenths * 10} hundredths) and ${longText} (${longU} hundredths).`,
        right === "=" ? `They are the same amount. A zero on the end doesn't change a decimal.` : `${showDec(a, 2) === aText ? aText : aText} is ${right === "<" ? "less" : "greater"} than ${bText}.`,
        `${aText} ${right} ${bText}`,
      ],
    },
    true,
  );
}

function compareNegatives(r: Rng): Q {
  const roll = r.next();
  let a: number;
  let b: number;
  if (roll < 0.6) {
    a = -r.int(1, 15);
    b = -r.int(1, 15);
    while (a === b) b = -r.int(1, 15);
  } else {
    a = -r.int(1, 12);
    b = r.int(0, 9);
    if (r.next() < 0.5) [a, b] = [b, a];
  }
  const right = a < b ? "<" : ">";
  const bothNeg = a < 0 && b < 0;
  const wrongSign = right === "<" ? ">" : "<";
  return choiceQ(
    r,
    right,
    [
      { text: wrongSign, mc: bothNeg ? "ord-negative-size" : undefined },
      { text: "=" },
    ],
    {
      prompt: `Which sign goes in the gap?  ${num(a)} ? ${num(b)}`,
      hints: [`Picture a number line. Numbers get bigger as you go right.`, bothNeg ? `${num(Math.max(a, b))} is closer to zero than ${num(Math.min(a, b))}, so it is further right.` : `Every negative number is less than zero, and less than every positive number.`],
      solution: [
        `On a number line, ${num(Math.min(a, b))} is to the left of ${num(Math.max(a, b))}.`,
        `So ${num(Math.min(a, b))} is the smaller number.`,
        `${num(a)} ${right} ${num(b)}`,
      ],
    },
    true,
  );
}

function smallestDecimal(r: Rng): Q {
  const t = r.int(2, 8);
  const p = r.int(1, 8);
  const e = r.int(1, 9);
  const A = dec(t, 1); // 0.6
  const B = dec((t - 1) * 10 + 9, 2); // 0.59
  const C = dec(((t - 1) * 10 + p) * 10 + e, 3); // 0.575-ish: the smallest
  const D = dec(t * 100 + r.int(1, 9), 3); // 0.605-ish: the largest
  const list = shuffle(r, [A, B, C, D]);
  const right = showDec(C);
  return choiceQ(
    r,
    right,
    [
      { text: showDec(A), mc: "ord-longer-bigger" },
      { text: showDec(B) },
      { text: showDec(D) },
    ],
    {
      prompt: `Which of these numbers is the smallest?  ${list.map((x) => showDec(x)).join(",  ")}`,
      hints: [`Write them all with 3 decimal places by adding zeros: ${list.map((x) => showDec(x, 3)).join(", ")}.`, `Now compare the tenths first, then the hundredths, then the thousandths.`],
      solution: [`With 3 decimal places: ${[A, B, C, D].map((x) => `${showDec(x)} = ${showDec(x, 3)}`).join(", ")}.`, `The smallest is ${showDec(C, 3)}.`, `Smallest: ${right}`],
    },
  );
}

function orderList(r: Rng): Q {
  const a = -r.int(2, 9);
  let b = -r.int(1, 9);
  while (b === a) b = -r.int(1, 9);
  const half = dec(r.int(1, 9), 1);
  const c = r.int(1, 6);
  const nums = [frac(a), frac(b), half, frac(c)];
  const sorted = [...nums].sort((x, y) => x.n / x.d - y.n / y.d);
  const show = (xs: Fraction[]) => xs.map((x) => num(x)).join(",  ");
  const byAbs = [...nums].sort((x, y) => Math.abs(x.n / x.d) - Math.abs(y.n / y.d));
  const negBySize = [...sorted];
  // Negatives ordered by their size, ignoring the sign: −2 before −7.
  const negs = negBySize.filter((x) => x.n < 0).sort((x, y) => -x.n / x.d - -y.n / y.d);
  const ignoreSign = [...negs, ...negBySize.filter((x) => x.n >= 0)];
  return choiceQ(
    r,
    show(sorted),
    [
      { text: show(ignoreSign), mc: "ord-negative-size" },
      { text: show(byAbs), mc: "ord-negative-size" },
      { text: show([...sorted].reverse()), mc: "ord-reversed-direction" },
    ],
    {
      prompt: `Which list puts ${show(shuffle(r, nums))} in order from smallest to largest?`,
      hints: [`Negative numbers are smallest. The further a negative number is from zero, the smaller it is.`, `So ${num(Math.min(a, b))} comes before ${num(Math.max(a, b))}.`],
      solution: [`The negatives come first: ${num(Math.min(a, b))} is further below zero than ${num(Math.max(a, b))}.`, `Then ${num(half)}, which is less than 1, then ${c}.`, `${show(sorted)}`],
    },
  );
}

function integersInRange(r: Rng): Q {
  const lo = r.int(1, 12);
  const hi = lo + r.int(3, 6);
  const strictLow = r.next() < 0.5;
  // Exactly one end is included, so both mistakes are possible.
  const list = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
  const answer = strictLow ? list(lo + 1, hi) : list(lo, hi - 1);
  const [s1, s2] = strictLow ? ["<", "≤"] : ["≤", "<"];
  const inc = strictLow ? hi : lo;
  const exc = strictLow ? lo : hi;
  return {
    prompt: `n is a whole number and ${lo} ${s1} n ${s2} ${hi}. Write down all the possible values of n.`,
    answer: { kind: "list", value: answer, noun: "values", missingMisconception: "ord-inclusive-missed", extraMisconception: "ord-strict-included" },
    wrongAnswers: [
      { value: list(lo, hi), misconception: "ord-strict-included" },
      { value: list(lo + 1, hi - 1), misconception: "ord-inclusive-missed" },
    ],
    answerHelp: HELP_LIST,
    hints: [`< means 'less than', so that end is not included. ≤ means 'less than or equal to', so that end is included.`, `${exc} is not allowed. ${inc} is allowed.`],
    solution: [
      `${lo} ${s1} n means n is ${s1 === "<" ? `more than ${lo}, so ${lo} is not included` : `${lo} or more, so ${lo} is included`}.`,
      `n ${s2} ${hi} means n is ${s2 === "<" ? `less than ${hi}, so ${hi} is not included` : `${hi} or less, so ${hi} is included`}.`,
      `n can be ${answer.join(", ")}`,
    ],
  };
}

function compareFractionDecimal(r: Rng): Q {
  const den = r.pick([4, 5, 8, 10, 20, 25]);
  let n = r.int(1, den - 1);
  const f = frac(n, den);
  // A decimal near it.
  const fx = (n / den) * 100;
  let dx = Math.round(fx) + r.pick([-5, -2, 2, 5, 0]);
  if (dx <= 0) dx = Math.round(fx) + 3;
  if (dx >= 100) dx = Math.round(fx) - 3;
  const dv = dec(dx, 2);
  const right = signFor(f, dv);
  while (n < 0) n++;
  return choiceQ(
    r,
    right,
    SIGNS.filter((s) => s !== right).map((s) => ({ text: s })),
    {
      prompt: `Which sign goes in the gap?  ${n}/${den} ? ${showDec(dv)}`,
      hints: [`Turn the fraction into a decimal first: ${n} ÷ ${den}.`, `${n}/${den} = ${showDec(f)}. Now compare the decimals.`],
      solution: [`${n}/${den} = ${n} ÷ ${den} = ${showDec(f)}`, `Compare ${showDec(f, 2)} with ${showDec(dv, 2)}.`, `${n}/${den} ${right} ${showDec(dv)}`],
    },
    true,
  );
}

const ordering: Gen = (r, tier) => {
  if (tier === 1) {
    const k = r.pick(["dec", "dec", "neg", "smallest"] as const);
    if (k === "dec") return compareDecimals(r, 1);
    if (k === "neg") return compareNegatives(r);
    return smallestDecimal(r);
  }
  const k = r.pick(["dec", "neg", "list", "range", "range", "frac", "smallest"] as const);
  if (k === "dec") return compareDecimals(r, 2);
  if (k === "neg") return compareNegatives(r);
  if (k === "list") return orderList(r);
  if (k === "range") return integersInRange(r);
  if (k === "frac") return compareFractionDecimal(r);
  return smallestDecimal(r);
};

// ================================================================ multiplication

/** Single-digit multiplier, written method without carrying (the classic slip). */
function noCarry(a: number, b: number): number {
  const digits = String(a).split("").map(Number);
  const last = digits.length - 1;
  let out = "";
  digits.forEach((dg, i) => {
    out += i === 0 ? String(dg * b) : String((dg * b) % 10);
    void last;
  });
  return Number(out);
}

function multiplyWhole(r: Rng, tier: number): Q {
  const kind = tier === 1 ? r.pick(["2x1", "3x1", "2x2", "2x2"] as const) : r.pick(["3x2", "2x2", "3x2"] as const);
  if (kind === "2x1" || kind === "3x1") {
    const a = kind === "2x1" ? r.int(23, 98) : r.int(124, 789);
    const b = r.int(3, 9);
    if (a % 10 === 0) return multiplyWhole(r, tier);
    const ans = a * b;
    const parts = String(a)
      .split("")
      .map((dg, i, all) => Number(dg) * 10 ** (all.length - 1 - i))
      .filter((p) => p > 0);
    return {
      prompt: `Work out ${a} × ${b}.`,
      answer: intAnswer(ans),
      wrongAnswers: clean(ans, [
        { value: noCarry(a, b), misconception: "mul-forgot-carry" },
        { value: a + b, misconception: "mul-added" },
      ]),
      answerHelp: HELP_WHOLE,
      hints: [`Split ${a} into ${parts.join(" + ")}.`, `Multiply each part by ${b}, then add.`],
      solution: [...parts.map((p) => `${p} × ${b} = ${p * b}`), `${parts.map((p) => p * b).join(" + ")} = ${num(ans)}`],
    };
  }
  const a = kind === "3x2" ? r.int(112, 489) : r.int(13, 79);
  const b = r.int(13, kind === "3x2" ? 48 : 69);
  const bt = Math.floor(b / 10) * 10;
  const bu = b % 10;
  const ans = a * b;
  const at = Math.floor(a / 10) * 10;
  const au = a % 10;
  const wrong: Wrong[] = [
    { value: a * bu + a * (bt / 10), misconception: "mul-forgot-zero" },
    ...(kind === "2x2" ? [{ value: at * bt + au * bu, misconception: "mul-partial-only" }] : []),
  ];
  if (bu === 0 || b % 10 === 0) return multiplyWhole(r, tier);
  return {
    prompt: `Work out ${a} × ${b}.`,
    answer: intAnswer(ans),
    wrongAnswers: clean(ans, wrong),
    answerHelp: HELP_WHOLE,
    ...(ans >= 10000 ? { answerText: num(ans) } : {}),
    hints: [`Split ${b} into ${bt} + ${bu}.`, `Work out ${a} × ${bu} and ${a} × ${bt}, then add them. Remember ${a} × ${bt} = ${a} × ${bt / 10} × 10.`],
    solution: [`${a} × ${bu} = ${a * bu}`, `${a} × ${bt} = ${a * bt}`, `${a * bu} + ${a * bt} = ${num(ans)}`],
  };
}

function multiplyDecimal(r: Rng): Q {
  const kind = r.pick(["dec-int", "dec-int", "dec-dec", "dec-dec-small"] as const);
  if (kind === "dec-int") {
    const u = r.int(12, 99); // 1.2 .. 9.9
    if (u % 10 === 0) return multiplyDecimal(r);
    const b = r.int(3, 9);
    const ans = dec(u * b, 1);
    return {
      prompt: `Work out ${d(u, 1)} × ${b}.`,
      answer: decAnswer(ans),
      wrongAnswers: clean(ans, [
        { value: frac(u * b), misconception: "mul-decimal-places" },
        { value: dec(u * b, 2), misconception: "mul-decimal-places" },
      ]),
      answerHelp: HELP_DEC,
      hints: [`Ignore the decimal point for now: ${u} × ${b} = ${u * b}.`, `${d(u, 1)} has 1 decimal place, so the answer has 1 decimal place too.`],
      solution: [`${u} × ${b} = ${u * b}`, `${d(u, 1)} is ${u} ÷ 10, so the answer is ${u * b} ÷ 10.`, `${d(u, 1)} × ${b} = ${showDec(ans)}`],
    };
  }
  // Both decimals: 1 dp × 1 dp gives 2 dp.
  const small = kind === "dec-dec-small";
  const a = small ? r.int(2, 9) : r.int(11, 49);
  const b = small ? r.int(2, 9) : r.int(2, 9);
  if (a % 10 === 0) return multiplyDecimal(r);
  const ans = dec(a * b, 2);
  const at = d(a, 1);
  const bt = d(b, 1);
  return {
    prompt: `Work out ${at} × ${bt}.`,
    answer: decAnswer(ans),
    wrongAnswers: clean(ans, [
      { value: dec(a * b, 1), misconception: "mul-decimal-places" },
      { value: frac(a * b), misconception: "mul-decimal-places" },
    ]),
    answerHelp: HELP_DEC,
    hints: [`Multiply without the decimal points: ${a} × ${b} = ${a * b}.`, `Count the decimal places in the question: 1 + 1 = 2. The answer has 2 decimal places.`],
    solution: [`${a} × ${b} = ${a * b}`, `${at} and ${bt} have 2 decimal places between them, so divide by 100.`, `${at} × ${bt} = ${showDec(ans)}`],
  };
}

const multiply: Gen = (r, tier) => (tier === 2 && r.next() < 0.5 ? multiplyDecimal(r) : multiplyWhole(r, tier));

// ================================================================ division

const removeZeros = (n: number) => Number(String(n).replace(/0/g, ""));

function shortDivision(r: Rng): Q {
  const dv = r.int(3, 9);
  // Sometimes force a zero inside the answer: 104, 207...
  const q = r.next() < 0.4 ? r.int(1, 9) * 100 + r.int(1, 9) : r.int(12, 99) * (r.next() < 0.5 ? 1 : 1) + (r.next() < 0.3 ? 100 : 0);
  const n = q * dv;
  const wrong: Wrong[] = [];
  if (String(q).includes("0") && removeZeros(q) !== q) wrong.push({ value: removeZeros(q), misconception: "div-dropped-zero" });
  wrong.push({ value: n * dv, misconception: "div-multiplied" });
  return {
    prompt: `Work out ${n} ÷ ${dv}.`,
    answer: intAnswer(q),
    wrongAnswers: clean(q, wrong),
    answerHelp: HELP_WHOLE,
    hints: [`Use short division (the bus stop). How many ${dv}s go into the first digit, or the first two digits?`, `Carry any remainder to the next digit. If ${dv} doesn't go into a digit, write 0 in the answer and carry the digit.`],
    solution: [...divisionSteps(n, dv), `${n} ÷ ${dv} = ${q}`],
  };
}

/** Bus-stop steps in words, digit by digit. */
function divisionSteps(n: number, dv: number): string[] {
  const steps: string[] = [];
  let carry = 0;
  let started = false;
  for (const ch of String(n)) {
    const cur = carry * 10 + Number(ch);
    const qd = Math.floor(cur / dv);
    const rem = cur % dv;
    if (!started && qd === 0) {
      carry = cur;
      continue;
    }
    started = true;
    steps.push(`${cur} ÷ ${dv} = ${qd}${rem ? ` remainder ${rem}` : ""}.`);
    carry = rem;
  }
  return steps.slice(0, 4);
}

function remainderContext(r: Rng): Q {
  const cap_ = r.int(4, 9);
  let n = r.int(3, 12) * cap_ + r.int(1, cap_ - 1);
  const full = Math.floor(n / cap_);
  const up = full + 1;
  const ctx = r.pick([
    { up: true, text: (nn: number, k: number) => `${nn} students are going on a trip. Each minibus holds ${k} students. How many minibuses are needed?` },
    { up: true, text: (nn: number, k: number) => `${nn} eggs need packing into boxes that hold ${k} eggs each. How many boxes are needed to pack all the eggs?` },
    { up: false, text: (nn: number, k: number) => `A baker has ${nn} cupcakes. A box holds ${k} cupcakes. How many boxes can be completely filled?` },
    { up: false, text: (nn: number, k: number) => `Tickets cost £${k} each. Kai has £${nn}. How many tickets can Kai buy?` },
  ]);
  void n;
  n = full * cap_ + (n % cap_);
  const ans = ctx.up ? up : full;
  const exact = frac(n, cap_);
  return {
    prompt: ctx.text(n, cap_),
    answer: intAnswer(ans),
    wrongAnswers: clean(ans, [
      { value: ctx.up ? full : up, misconception: "div-remainder-context" },
      { value: exact, misconception: "div-remainder-context" },
    ]),
    answerHelp: HELP_WHOLE,
    hints: [`Work out ${n} ÷ ${cap_}. It doesn't divide exactly.`, ctx.up ? `Everything has to fit, so the leftover ones need one more.` : `Only complete ones count, so ignore the remainder.`],
    solution: [`${n} ÷ ${cap_} = ${full} remainder ${n % cap_}.`, ctx.up ? `The ${n % cap_} left over still need${n % cap_ === 1 ? "s" : ""} a place, so round up.` : `The remainder isn't enough for another one, so round down.`, `Answer: ${ans}`],
  };
}

function divideDecimal(r: Rng): Q {
  const kind = r.pick(["dec-by-int", "by-dec", "remainder-dec"] as const);
  if (kind === "dec-by-int") {
    const dv = r.int(2, 9);
    const q = r.int(11, 199); // hundredths
    if (q % 10 === 0) return divideDecimal(r);
    const n = q * dv;
    const ans = dec(q, 2);
    return {
      prompt: `Work out ${d(n, 2)} ÷ ${dv}.`,
      answer: decAnswer(ans),
      wrongAnswers: clean(ans, [
        { value: dec(q, 1), misconception: "div-decimal-point" },
        { value: frac(q), misconception: "div-decimal-point" },
      ]),
      answerHelp: HELP_DEC,
      hints: [`Divide as normal, and put the decimal point in the answer straight above the point in ${d(n, 2)}.`, `Start with ${n} ÷ ${dv} = ${q}, then put the point back: 2 decimal places.`],
      solution: [`${n} ÷ ${dv} = ${q}`, `${d(n, 2)} has 2 decimal places, so the answer does too.`, `${d(n, 2)} ÷ ${dv} = ${showDec(ans)}`],
    };
  }
  if (kind === "by-dec") {
    const b = r.int(2, 9); // 0.b
    const A = r.int(3, 40);
    const n = dec(A * b, 1);
    return {
      prompt: `Work out ${showDec(n)} ÷ ${d(b, 1)}.`,
      answer: intAnswer(A),
      wrongAnswers: clean(A, [
        { value: dec(A, 1), misconception: "div-decimal-divisor" },
        { value: mul(n, dec(b, 1)), misconception: "div-multiplied" },
      ]),
      answerHelp: HELP_DEC,
      hints: [`Make the number you're dividing by a whole number. Multiply both numbers by 10.`, `${showDec(n)} ÷ ${d(b, 1)} is the same as ${num(mul(n, frac(10)))} ÷ ${b}.`],
      solution: [`Multiply both by 10: ${showDec(n)} ÷ ${d(b, 1)} = ${num(mul(n, frac(10)))} ÷ ${b}.`, `${num(mul(n, frac(10)))} ÷ ${b} = ${A}.`, `Answer: ${A}`],
    };
  }
  const dv = r.pick([4, 5, 8, 2]);
  let n = r.int(11, 99);
  while (n % dv === 0) n = r.int(11, 99);
  const ans = frac(n, dv);
  const q = Math.floor(n / dv);
  const rem = n % dv;
  return {
    prompt: `Work out ${n} ÷ ${dv}. Give your answer as a decimal.`,
    answer: decAnswer(ans),
    wrongAnswers: clean(ans, [{ value: add(frac(q), dec(rem, 1)), misconception: "div-remainder-as-decimal" }]),
    answerHelp: HELP_DEC,
    hints: [`${n} ÷ ${dv} = ${q} remainder ${rem}. Don't write the remainder after the point!`, `Write ${n} as ${n}.00 and keep dividing: the remainder ${rem} becomes ${rem}0 tenths.`],
    solution: [`${n} ÷ ${dv} = ${q} remainder ${rem}.`, `The remainder is ${rem}/${dv} of a whole, which is ${showDec(frac(rem, dv))}.`, `${n} ÷ ${dv} = ${showDec(ans)}`],
  };
}

function longDivision(r: Rng): Q {
  const dv = r.int(12, 29);
  const q = r.int(12, 48);
  const n = dv * q;
  return {
    prompt: `Work out ${n} ÷ ${dv}.`,
    answer: intAnswer(q),
    wrongAnswers: [],
    answerHelp: HELP_WHOLE,
    hints: [`Write out some multiples of ${dv}: ${dv}, ${dv * 2}, ${dv * 3}, ${dv * 4}, ${dv * 5}...`, `How many ${dv}s go into ${Math.floor(n / 10)}? Then bring down the last digit.`],
    solution: [`${dv} × ${Math.floor(q / 10) * 10} = ${dv * Math.floor(q / 10) * 10}, leaving ${n - dv * Math.floor(q / 10) * 10}.`, `${dv} × ${q % 10} = ${dv * (q % 10)}.`, `${Math.floor(q / 10) * 10} + ${q % 10} = ${q}, so ${n} ÷ ${dv} = ${q}`],
  };
}

const divide: Gen = (r, tier) => {
  if (tier === 1) return r.next() < 0.65 ? shortDivision(r) : remainderContext(r);
  const k = r.pick(["dec", "dec", "long", "context", "short"] as const);
  if (k === "dec") return divideDecimal(r);
  if (k === "long") return longDivision(r);
  if (k === "context") return remainderContext(r);
  return shortDivision(r);
};

// ================================================================ inverse operations

const inverse: Gen = (r, tier) => {
  const roll = r.next();
  if (roll < 0.3) {
    // Missing number.
    const op = r.pick(["×", "÷", "+", "−"] as const);
    const k = op === "×" || op === "÷" ? r.int(3, 12) : r.int(15, 85);
    const x = op === "×" || op === "÷" ? r.int(4, 25) : r.int(12, 99);
    const result = op === "×" ? x * k : op === "÷" ? x / k : op === "+" ? x + k : x - k;
    if (op === "÷") {
      const big = x * k;
      return {
        prompt: `Find the missing number:  ? ÷ ${k} = ${x}`,
        answer: intAnswer(big),
        wrongAnswers: clean(big, [{ value: frac(x, k), misconception: "inv-same-operation" }]),
        answerHelp: HELP_WHOLE,
        hints: [`The opposite of dividing is multiplying.`, `Work out ${x} × ${k}.`],
        solution: [`To undo ÷ ${k}, multiply by ${k}.`, `${x} × ${k} = ${big}`, `Check: ${big} ÷ ${k} = ${x}. The missing number is ${big}`],
      };
    }
    const undo = op === "×" ? "÷" : op === "+" ? "−" : "+";
    if (op === "−" && result <= 0) return inverse(r, tier);
    return {
      prompt: `Find the missing number:  ? ${op} ${k} = ${result}`,
      answer: intAnswer(x),
      wrongAnswers: clean(x, [{ value: op === "×" ? frac(result * k) : op === "+" ? result + k : result - k, misconception: "inv-same-operation" }]),
      answerHelp: HELP_WHOLE,
      hints: [`Undo ${op} ${k} with the opposite operation: ${undo} ${k}.`, `Work out ${result} ${undo} ${k}.`],
      solution: [`The opposite of ${op} is ${undo}.`, `${result} ${undo} ${k} = ${x}`, `Check: ${x} ${op} ${k} = ${result}. The missing number is ${x}`],
    };
  }
  if (roll < 0.55) {
    // Think of a number: two steps.
    const x = r.int(2, 15);
    const m = r.int(2, 6);
    const c = r.int(1, 15);
    const addFirst = tier === 2 && r.next() < 0.4;
    const out = addFirst ? (x + c) * m : x * m + c;
    const [w1, w2] = addFirst ? [`add ${c}`, `multiply by ${m}`] : [`multiply by ${m}`, `add ${c}`];
    const wrongOrder = addFirst ? out / m - c : (out - c) / m; // that's right; the wrong order is below
    void wrongOrder;
    const badOrder = addFirst ? frac(out - c * m, m) : sub(frac(out, m), frac(c)); // undid in the wrong order
    return {
      prompt: `I think of a number. I ${w1}, then ${w2}. My answer is ${out}. What number did I think of?`,
      answer: intAnswer(x),
      wrongAnswers: clean(x, [
        { value: badOrder, misconception: "inv-wrong-order" },
        { value: addFirst ? (out + c) * m : out * m + c, misconception: "inv-same-operation" },
      ]),
      answerHelp: HELP_WHOLE,
      hints: [`Work backwards from ${out}. Undo the last step first.`, addFirst ? `Undo "multiply by ${m}" by dividing by ${m}, then undo "add ${c}" by subtracting ${c}.` : `Undo "add ${c}" by subtracting ${c}, then undo "multiply by ${m}" by dividing by ${m}.`],
      solution: addFirst
        ? [`Undo × ${m}: ${out} ÷ ${m} = ${out / m}.`, `Undo + ${c}: ${out / m} − ${c} = ${x}.`, `Check: (${x} + ${c}) × ${m} = ${out}. I thought of ${x}`]
        : [`Undo + ${c}: ${out} − ${c} = ${out - c}.`, `Undo × ${m}: ${out - c} ÷ ${m} = ${x}.`, `Check: ${x} × ${m} + ${c} = ${out}. I thought of ${x}`],
    };
  }
  if (roll < 0.8 || tier === 1) {
    // Which calculation checks this?
    const a = r.int(12, 40);
    const b = r.int(3, 12);
    const p = a * b;
    const dvd = r.next() < 0.5;
    if (dvd) {
      return choiceQ(
        r,
        `${a} × ${b}`,
        [
          { text: `${p} × ${b}`, mc: "inv-same-operation" },
          { text: `${a} ÷ ${b}`, mc: "inv-same-operation" },
          { text: `${p} − ${b}` },
        ],
        {
          prompt: `Sam works out ${p} ÷ ${b} = ${a}. Which calculation could Sam use to check the answer?`,
          hints: [`Multiplying undoes dividing.`, `If ${p} ÷ ${b} = ${a}, then ${a} × ${b} should give ${p}.`],
          solution: [`The inverse (opposite) of dividing by ${b} is multiplying by ${b}.`, `${a} × ${b} = ${p}, so the answer is right.`, `Check with ${a} × ${b}`],
        },
      );
    }
    const s = r.int(120, 480);
    const t = r.int(35, 99);
    return choiceQ(
      r,
      `${s + t} − ${t}`,
      [
        { text: `${s + t} + ${t}`, mc: "inv-same-operation" },
        { text: `${s} − ${t}`, mc: "inv-same-operation" },
        { text: `${s + t} × ${t}` },
      ],
      {
        prompt: `Leah works out ${s} + ${t} = ${s + t}. Which calculation could Leah use to check the answer?`,
        hints: [`Subtracting undoes adding.`, `Take ${t} away from the answer. You should get back to ${s}.`],
        solution: [`The inverse of adding ${t} is subtracting ${t}.`, `${s + t} − ${t} = ${s}, so the answer is right.`, `Check with ${s + t} − ${t}`],
      },
    );
  }
  // Related facts from a given calculation.
  const a = r.int(13, 49);
  const b = r.int(12, 39);
  const p = a * b;
  const kind = r.pick(["divide", "decimal"] as const);
  if (kind === "divide") {
    return {
      prompt: `You are told that ${a} × ${b} = ${p}. Use this to write down the answer to ${p} ÷ ${a}.`,
      answer: intAnswer(b),
      wrongAnswers: clean(b, [{ value: a, misconception: "inv-wrong-number" }]),
      answerHelp: HELP_WHOLE,
      hints: [`${a} × ${b} = ${p} means ${p} is made of ${a} lots of ${b}.`, `So ${p} ÷ ${a} gives the other number in the multiplication.`],
      solution: [`${a} × ${b} = ${p} gives two division facts: ${p} ÷ ${a} = ${b} and ${p} ÷ ${b} = ${a}.`, `We want ${p} ÷ ${a}.`, `${p} ÷ ${a} = ${b}`],
    };
  }
  const ans = dec(p, 1);
  return {
    prompt: `You are told that ${a} × ${b} = ${p}. Use this to work out ${d(a, 1)} × ${b}.`,
    answer: decAnswer(ans),
    wrongAnswers: clean(ans, [
      { value: dec(p, 2), misconception: "mul-decimal-places" },
      { value: frac(p), misconception: "mul-decimal-places" },
    ]),
    answerHelp: HELP_DEC,
    hints: [`${d(a, 1)} is ${a} ÷ 10.`, `So the answer is ${p} ÷ 10.`],
    solution: [`${d(a, 1)} is ten times smaller than ${a}.`, `So ${d(a, 1)} × ${b} is ten times smaller than ${p}.`, `${d(a, 1)} × ${b} = ${showDec(ans)}`],
  };
};

// ================================================================ time and money

/** Minutes after midnight as a 12-hour time: 6:45 pm. */
export function clock(mins: number): string {
  const h24 = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${String(m).padStart(2, "0")} ${h24 < 12 ? "am" : "pm"}`;
}
/** Minutes after midnight as a 24-hour time for timetables: 14:05. */
const clock24 = (mins: number) => `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
const hm = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return [h ? `${h} hour${h === 1 ? "" : "s"}` : "", m ? `${m} minute${m === 1 ? "" : "s"}` : ""].filter(Boolean).join(" ");
};

function duration(r: Rng): Q {
  let start = r.int(8 * 12, 19 * 12) * 5; // 8:00 am to 7:00 pm, in 5s
  if (start % 60 === 0) start += r.int(1, 11) * 5;
  let len = r.int(7, 40) * 5;
  // Make sure it crosses the hour, so the "subtract like decimals" slip shows.
  while ((start % 60) + (len % 60) < 60) len = r.int(7, 40) * 5;
  const end = start + len;
  const naive = Number(`${Math.floor(end / 60) % 12 || 12}${String(end % 60).padStart(2, "0")}`) - Number(`${Math.floor(start / 60) % 12 || 12}${String(start % 60).padStart(2, "0")}`);
  const what = r.pick(["A film starts at", "A football match kicks off at", "A train leaves at", "A school trip starts at"]);
  const ends = what.includes("train") ? "arrives at" : "finishes at";
  const toHour = 60 - (start % 60);
  return {
    prompt: `${what} ${clock(start)} and ${ends} ${clock(end)}. How long is that, in minutes?`,
    answer: intAnswer(len),
    wrongAnswers: clean(len, [{ value: naive, misconception: "time-hundred-minutes" }]),
    answerHelp: "Type a number of minutes, like 95.",
    hints: [`Count up to the next hour first: from ${clock(start)} to ${clock(start + toHour)} is ${toHour} minutes.`, `Then count on from ${clock(start + toHour)} to ${clock(end)}.`],
    solution: [`${clock(start)} to ${clock(start + toHour)} is ${toHour} minutes.`, end - start - toHour >= 60 ? `${clock(start + toHour)} to ${clock(end)} is ${hm(end - start - toHour)}, which is ${end - start - toHour} minutes.` : `${clock(start + toHour)} to ${clock(end)} is ${end - start - toHour} minutes.`, `${toHour} + ${end - start - toHour} = ${len} minutes`],
  };
}

function decimalHours(r: Rng): Q {
  const h = r.int(1, 5);
  const q = r.pick([25, 5, 75] as const); // .25, .5, .75
  const hoursText = `${h}.${q}`;
  const mins = h * 60 + (q === 5 ? 30 : q === 25 ? 15 : 45);
  const naive = h * 60 + (q === 5 ? 50 : q);
  return {
    prompt: `How many minutes are there in ${hoursText} hours?`,
    answer: intAnswer(mins),
    wrongAnswers: clean(mins, [
      { value: naive, misconception: "time-decimal-hours" },
      { value: h * 100 + (q === 5 ? 50 : q), misconception: "time-hundred-minutes" },
    ]),
    answerHelp: "Type a number of minutes, like 150.",
    hints: [`${hoursText} hours is ${h} hour${h === 1 ? "" : "s"} and ${q === 5 ? "a half" : q === 25 ? "a quarter" : "three quarters"} of an hour. It is not ${h} hours ${q === 5 ? 50 : q} minutes.`, `1 hour = 60 minutes. ${q === 5 ? "Half" : q === 25 ? "A quarter" : "Three quarters"} of 60 is ${q === 5 ? 30 : q === 25 ? 15 : 45}.`],
    solution: [`${h} hour${h === 1 ? "" : "s"} = ${h * 60} minutes.`, `0.${q} of an hour = 0.${q} × 60 = ${q === 5 ? 30 : q === 25 ? 15 : 45} minutes.`, `${h * 60} + ${mins - h * 60} = ${mins} minutes`],
  };
}

function timetable(r: Rng): Q {
  const stops = shuffle(r, ["Station Road", "High Street", "Park Lane", "Library", "Hospital", "Market Square"]).slice(0, 4);
  const first = r.int(7 * 12, 16 * 12) * 5;
  const gaps = [r.int(2, 5) * 5, r.int(1, 4) * 5 + r.pick([0, 3, 7]), r.int(2, 5) * 5];
  const buses = [0, r.int(4, 8) * 5, r.int(10, 14) * 5];
  const times = buses.map((b) => {
    let t = first + b;
    return [t, ...gaps.map((g) => (t += g))];
  });
  const bus = r.int(0, 2);
  const from = r.int(0, 1);
  const to = r.int(from + 2, 3);
  const ans = times[bus][to] - times[bus][from];
  const naive = Number(clock24(times[bus][to]).replace(":", "")) - Number(clock24(times[bus][from]).replace(":", ""));
  return {
    prompt: `Here is part of a bus timetable. How many minutes does Bus ${bus + 1} take to go from ${stops[from]} to ${stops[to]}?`,
    visual: {
      kind: "table",
      table: {
        corner: "Stop",
        columns: ["Bus 1", "Bus 2", "Bus 3"],
        rows: stops.map((s, i) => ({ head: s, cells: times.map((t) => clock24(t[i])) })),
        highlight: [
          [from, bus],
          [to, bus],
        ],
        description: `Bus timetable. ${stops.map((s, i) => `${s}: ${times.map((t, b) => `Bus ${b + 1} ${clock24(t[i])}`).join(", ")}`).join(". ")}.`,
      },
    },
    answer: intAnswer(ans),
    wrongAnswers: clean(ans, [{ value: naive, misconception: "time-hundred-minutes" }]),
    answerHelp: "Type a number of minutes, like 25.",
    hints: [`Find Bus ${bus + 1}'s column. It leaves ${stops[from]} at ${clock24(times[bus][from])} and reaches ${stops[to]} at ${clock24(times[bus][to])}.`, `Count on in minutes from ${clock24(times[bus][from])} to ${clock24(times[bus][to])}. There are 60 minutes in an hour, not 100.`],
    solution: [`Bus ${bus + 1}: ${stops[from]} ${clock24(times[bus][from])}, ${stops[to]} ${clock24(times[bus][to])}.`, `Count on from ${clock24(times[bus][from])} to ${clock24(times[bus][to])}.`, `That is ${ans} minutes`],
  };
}

function arrivalTime(r: Rng): Q {
  let start = r.int(8 * 12, 11 * 12) * 5 + 30; // morning, with minutes past
  if (start % 60 === 0) start += r.int(1, 11) * 5;
  let len = r.int(1, 3) * 60 + r.int(2, 11) * 5;
  while ((start % 60) + (len % 60) < 60) len = r.int(1, 3) * 60 + r.int(2, 11) * 5;
  const end = start + len;
  const right = clock(end);
  const forgotHour = clock(end - 60);
  const minsOver = (start % 60) + (len % 60);
  const naiveText = `${Math.floor((start + Math.floor(len / 60) * 60) / 60) % 12 || 12}:${minsOver} ${Math.floor((start + Math.floor(len / 60) * 60) / 60) < 12 ? "am" : "pm"}`;
  return choiceQ(
    r,
    right,
    [
      { text: forgotHour, mc: "time-carry-hour" },
      { text: naiveText, mc: "time-hundred-minutes" },
      { text: clock(end + 40) },
    ],
    {
      prompt: `A coach journey takes ${hm(len)}. It leaves at ${clock(start)}. What time does it arrive?`,
      hints: [`Add the hours first: ${clock(start)} + ${Math.floor(len / 60)} hour${len >= 120 ? "s" : ""} = ${clock(start + Math.floor(len / 60) * 60)}.`, `Then add ${len % 60} minutes. Going past 60 minutes takes you into the next hour.`],
      solution: [`${clock(start)} + ${Math.floor(len / 60)} hour${len >= 120 ? "s" : ""} = ${clock(start + Math.floor(len / 60) * 60)}.`, `${clock(start + Math.floor(len / 60) * 60)} + ${len % 60} minutes: ${start % 60} + ${len % 60} = ${minsOver} minutes, which is 1 hour ${minsOver - 60} minutes.`, `It arrives at ${right}`],
    },
  );
}

const SHOP = [
  ["a sandwich", 225, 395],
  ["a drink", 85, 175],
  ["a magazine", 250, 450],
  ["a notebook", 120, 299],
  ["a bag of crisps", 65, 135],
  ["a pen", 45, 160],
] as const;

function change(r: Rng): Q {
  const items = shuffle(r, SHOP).slice(0, 2);
  const prices = items.map(([, lo, hi]) => r.int(lo / 5, hi / 5) * 5);
  const total = prices[0] + prices[1];
  const note = total < 500 ? 500 : total < 1000 ? 1000 : 2000;
  const ans = note - total;
  const [n] = shuffle(r, NAMES);
  return {
    prompt: `${n} buys ${items[0][0]} for ${showMoney(dec(prices[0], 2))} and ${items[1][0]} for ${showMoney(dec(prices[1], 2))}. ${n} pays with a £${note / 100} note. How much change should ${n} get?`,
    answer: decAnswer(dec(ans, 2)),
    answerText: showMoney(dec(ans, 2)),
    wrongAnswers: clean(dec(ans, 2), [
      { value: dec(total, 2), misconception: "money-gave-total" },
      { value: dec(note - prices[0], 2), misconception: "money-missed-item" },
      { value: dec(note - prices[1], 2), misconception: "money-missed-item" },
    ]),
    answerHelp: HELP_MONEY,
    hints: [`First add the two prices. It can help to work in pence: ${prices[0]}p + ${prices[1]}p.`, `Then take the total away from £${note / 100} (${note}p). Counting up from the total to £${note / 100} also works.`],
    solution: [`Total: ${prices[0]}p + ${prices[1]}p = ${total}p = ${showMoney(dec(total, 2))}.`, `Change: ${note}p − ${total}p = ${ans}p.`, `${ans}p = ${showMoney(dec(ans, 2))}`],
  };
}

function penceToPounds(r: Rng): Q {
  const p = r.int(105, 2495);
  if (p % 10 === 0) return penceToPounds(r);
  const toPounds = r.next() < 0.6;
  if (toPounds) {
    const ans = dec(p, 2);
    return {
      prompt: `Write ${p}p in pounds.`,
      answer: decAnswer(ans),
      answerText: showMoney(ans),
      wrongAnswers: clean(ans, [
        { value: dec(p, 1), misconception: "money-pence-pounds" },
        { value: dec(p, 3), misconception: "money-pence-pounds" },
      ]),
      answerHelp: HELP_MONEY,
      hints: [`£1 = 100p, so divide by 100.`, `Dividing by 100 moves the digits 2 places to the right: ${p} → ${showDec(ans)}.`],
      solution: [`£1 = 100p.`, `${p} ÷ 100 = ${showDec(ans, 2)}`, `${p}p = ${showMoney(ans)}`],
    };
  }
  const pounds = dec(p, 2);
  return {
    prompt: `Write ${showMoney(pounds)} in pence.`,
    answer: intAnswer(p),
    wrongAnswers: clean(p, [{ value: mul(pounds, frac(10)), misconception: "money-pence-pounds" }]),
    answerHelp: "Type a number of pence, like 345.",
    hints: [`£1 = 100p, so multiply by 100.`, `${showDec(pounds, 2)} × 100 moves the digits 2 places to the left.`],
    solution: [`£1 = 100p.`, `${showDec(pounds, 2)} × 100 = ${p}`, `${showMoney(pounds)} = ${p}p`],
  };
}

const timeMoney: Gen = (r, tier) => {
  if (tier === 1) {
    const k = r.pick(["duration", "hours", "change", "pence"] as const);
    if (k === "duration") return duration(r);
    if (k === "hours") return decimalHours(r);
    if (k === "change") return change(r);
    return penceToPounds(r);
  }
  const k = r.pick(["timetable", "arrival", "duration", "hours", "change"] as const);
  if (k === "timetable") return timetable(r);
  if (k === "arrival") return arrivalTime(r);
  if (k === "duration") return duration(r);
  if (k === "hours") return decimalHours(r);
  return change(r);
};

// ================================================================ metric units

const UNITS = [
  { big: "km", small: "m", f: 1000, bigWord: "kilometres", smallWord: "metres" },
  { big: "m", small: "cm", f: 100, bigWord: "metres", smallWord: "centimetres" },
  { big: "cm", small: "mm", f: 10, bigWord: "centimetres", smallWord: "millimetres" },
  { big: "m", small: "mm", f: 1000, bigWord: "metres", smallWord: "millimetres" },
  { big: "kg", small: "g", f: 1000, bigWord: "kilograms", smallWord: "grams" },
  { big: "tonnes", small: "kg", f: 1000, bigWord: "tonnes", smallWord: "kilograms" },
  { big: "litres", small: "ml", f: 1000, bigWord: "litres", smallWord: "millilitres" },
  { big: "litres", small: "cl", f: 100, bigWord: "litres", smallWord: "centilitres" },
] as const;

const otherFactor = (f: number) => (f === 1000 ? 100 : f === 100 ? 10 : 100);

function convert(r: Rng, tier: number): Q {
  const u = tier === 1 ? r.pick(UNITS.slice(0, 7)) : r.pick(UNITS);
  const down = r.next() < 0.55; // big → small
  const f = frac(u.f);
  let value: Fraction;
  if (down) {
    // 3.5 km, 0.25 kg, 12 m...
    value = tier === 1 ? r.pick([frac(r.int(2, 15)), dec(r.int(11, 99), 1)]) : r.pick([dec(r.int(11, 99), 1), dec(r.int(101, 999), 2), dec(r.int(5, 95), 2)]);
  } else {
    // 450 g, 2300 m, 35 mm...
    value = tier === 1 ? frac(r.int(2, 30) * (u.f / 10) || r.int(2, 9)) : frac(r.int(11, 999) * (u.f >= 100 ? 5 : 1));
    if (value.n % u.f === 0) value = add(value, frac(u.f / 10 || 1));
  }
  const ans = down ? mul(value, f) : div(value, f);
  const from = down ? u.big : u.small;
  const to = down ? u.small : u.big;
  const wrongF = frac(otherFactor(u.f));
  const tidy = (unit: string) => (unit === "tonnes" || unit === "litres" ? ` ${unit}` : ` ${unit}`);
  return {
    prompt: `Change ${num(value)}${tidy(from)} into ${down ? u.smallWord : u.bigWord}.`,
    answer: decAnswer(ans),
    wrongAnswers: clean(ans, [
      { value: down ? div(value, f) : mul(value, f), misconception: "units-wrong-direction" },
      { value: down ? mul(value, wrongF) : div(value, wrongF), misconception: "units-wrong-factor" },
    ]),
    answerHelp: `Type a number of ${down ? u.smallWord : u.bigWord}. Decimals are fine.`,
    hints: [`1 ${u.big === "tonnes" ? "tonne" : u.big === "litres" ? "litre" : u.big} = ${u.f} ${u.small}.`, down ? `${cap(u.smallWord)} are smaller, so you need more of them: multiply by ${u.f}.` : `${cap(u.bigWord)} are bigger, so you need fewer of them: divide by ${u.f}.`],
    solution: [`1 ${u.big === "tonnes" ? "tonne" : u.big === "litres" ? "litre" : u.big} = ${u.f} ${u.small}.`, `${num(value)} ${down ? "×" : "÷"} ${u.f} = ${num(ans)}`, `${num(value)}${tidy(from)} = ${num(ans)}${tidy(to)}`],
  };
}

function addMixedUnits(r: Rng): Q {
  const u = r.pick([UNITS[1], UNITS[0], UNITS[4], UNITS[6]]);
  const big = dec(r.int(11, 49), 1); // 1.2 m
  const small = u.f === 100 ? r.int(2, 19) * 5 : r.int(2, 19) * 50; // 45 cm, 350 g
  const total = add(mul(big, frac(u.f)), frac(small));
  return {
    prompt: `Add ${num(big)} ${u.big} and ${small} ${u.small}. Give your answer in ${u.smallWord}.`,
    answer: decAnswer(total),
    wrongAnswers: clean(total, [
      { value: add(big, frac(small)), misconception: "units-not-matched" },
      { value: add(mul(big, frac(otherFactor(u.f))), frac(small)), misconception: "units-wrong-factor" },
    ]),
    answerHelp: `Type a number of ${u.smallWord}.`,
    hints: [`Change ${num(big)} ${u.big} into ${u.small} first: × ${u.f}.`, `Then add ${small} ${u.small}.`],
    solution: [`${num(big)} ${u.big} = ${num(big)} × ${u.f} = ${num(mul(big, frac(u.f)))} ${u.small}.`, `${num(mul(big, frac(u.f)))} + ${small} = ${num(total)}`, `${num(total)} ${u.small}`],
  };
}

const units: Gen = (r, tier) => (tier === 2 && r.next() < 0.3 ? addMixedUnits(r) : convert(r, tier));

// ================================================================ estimation

/** A number that rounds to `target` (1 significant figure) but isn't equal to it, with 2 or 3 significant figures. */
function near(r: Rng, target: Fraction): Fraction {
  for (let i = 0; i < 50; i++) {
    const x = target.n / target.d;
    const p = Math.floor(Math.log10(x) + 1e-9);
    const step = 3 - 1 - p; // 3 s.f.: units of 10^(p-2)
    const units = Math.round(x * 10 ** step);
    const lead = Math.floor(units / 100);
    const off = lead === 1 ? r.int(1, 45) : r.int(-45, 45);
    if (off === 0) continue;
    const candUnits = units + off;
    const cand = step >= 0 ? dec(candUnits, step) : frac(candUnits * 10 ** -step);
    const c2 = (candUnits % 10 === 0 && r.next() < 0.5) ? cand : cand;
    const rs = roundSf(c2, 1);
    if (rs.n * target.d === target.n * rs.d && !(c2.n * target.d === target.n * c2.d)) return c2;
  }
  return add(target, frac(target.n, target.d * 10));
}

const ONE_SF = [2, 3, 4, 5, 6, 7, 8, 9] as const;

function estimate(r: Rng, tier: number): Q {
  const kind = tier === 1 ? r.pick(["mul", "mul", "div"] as const) : r.pick(["mul", "div", "frac", "frac", "decdiv", "over", "root"] as const);

  if (kind === "root") {
    const k = r.int(3, 11);
    const N = k * k + r.pick([-3, -2, -1, 1, 2, 3]) * (k > 5 ? 2 : 1);
    if (N <= 1) return estimate(r, tier);
    const nearest = Math.round(Math.sqrt(N));
    return {
      prompt: `Estimate √${N} to the nearest whole number.`,
      answer: intAnswer(nearest),
      wrongAnswers: clean(nearest, [{ value: frac(N, 2), misconception: "est-root-halved" }]),
      answerHelp: HELP_WHOLE,
      hints: [`Which square numbers is ${N} between?`, `${(nearest - 1) ** 2}, ${nearest ** 2}, ${(nearest + 1) ** 2}... Which square is ${N} closest to?`],
      solution: [`${Math.floor(Math.sqrt(N)) ** 2} < ${N} < ${(Math.floor(Math.sqrt(N)) + 1) ** 2}, so √${N} is between ${Math.floor(Math.sqrt(N))} and ${Math.floor(Math.sqrt(N)) + 1}.`, `${N} is closest to ${nearest ** 2} = ${nearest}².`, `√${N} ≈ ${nearest}`],
    };
  }

  if (kind === "over") {
    const A = frac(r.pick(ONE_SF) * 10);
    const B = frac(r.pick(ONE_SF));
    const up = r.next() < 0.5;
    // Both numbers rounded the same way, so the answer is clear.
    let a = near(r, A);
    let b = near(r, B);
    for (let i = 0; i < 40 && ((a.n / a.d < A.n / A.d) !== !up || (b.n / b.d < B.n / B.d) !== !up); i++) {
      a = near(r, A);
      b = near(r, B);
    }
    const aUp = a.n / a.d < A.n / A.d; // rounding a up
    const bUp = b.n / b.d < B.n / B.d;
    if (aUp !== bUp) return estimate(r, 1);
    const right = aUp ? "an overestimate" : "an underestimate";
    return choiceQ(
      r,
      right,
      [{ text: aUp ? "an underestimate" : "an overestimate", mc: "est-over-under" }, { text: "exactly right" }],
      {
        prompt: `Priya estimates ${num(a)} × ${num(b)} by working out ${num(A)} × ${num(B)} = ${num(mul(A, B))}. Is her estimate an overestimate or an underestimate?`,
        hints: [`Did ${num(a)} get rounded up or down? And ${num(b)}?`, `If both numbers are made bigger, the answer gets bigger too.`],
        solution: [`${num(a)} was rounded ${aUp ? "up" : "down"} to ${num(A)}, and ${num(b)} was rounded ${bUp ? "up" : "down"} to ${num(B)}.`, `Both rounded ${aUp ? "up" : "down"}, so the estimate is ${aUp ? "bigger" : "smaller"} than the real answer.`, `It is ${right}`],
      },
      true,
    );
  }

  if (kind === "mul") {
    const A = tier === 1 ? frac(r.pick(ONE_SF) * 10) : r.pick([frac(r.pick(ONE_SF) * 10), frac(r.pick(ONE_SF) * 100)]);
    const B = r.pick([frac(r.pick(ONE_SF)), frac(r.pick(ONE_SF) * 10)]);
    const a = near(r, A);
    const b = near(r, B);
    const ans = mul(A, B);
    const whole = (x: Fraction) => roundDp(x, 0);
    return {
      prompt: `Estimate ${num(a)} × ${num(b)} by rounding each number to 1 significant figure.`,
      answer: decAnswer(ans),
      wrongAnswers: clean(ans, [{ value: mul(whole(a), whole(b)), misconception: "est-not-1sf" }]),
      answerHelp: HELP_WHOLE,
      ...(ans.n >= 10000 ? { answerText: num(ans) } : {}),
      hints: [`Round each number to its first significant figure: ${num(a)} → ?, ${num(b)} → ?`, `${num(a)} ≈ ${num(A)} and ${num(b)} ≈ ${num(B)}. Now multiply.`],
      solution: [`${num(a)} ≈ ${num(A)} and ${num(b)} ≈ ${num(B)} (1 significant figure).`, `${num(A)} × ${num(B)} = ${num(ans)}`, `Estimate: ${num(ans)}`],
    };
  }

  if (kind === "div" || kind === "decdiv") {
    // Divide by a decimal like 0.48 ≈ 0.5, or by a whole number.
    const B = kind === "decdiv" ? r.pick([dec(5, 1), dec(2, 1), dec(4, 1)]) : frac(r.pick([2, 3, 4, 5]));
    const q = r.pick([2, 3, 4, 6, 8]);
    const A = kind === "decdiv" ? frac(r.pick(ONE_SF) * 100) : mul(B, frac(q * 10)); // 1 s.f. if B divides nicely
    const rsA = roundSf(A, 1);
    if (rsA.n * A.d !== A.n * rsA.d) return estimate(r, tier);
    const a = near(r, A);
    const b = kind === "decdiv" ? near(r, B) : near(r, B);
    const ans = div(A, B);
    if (ans.d !== 1) return estimate(r, tier);
    return {
      prompt: `Estimate ${num(a)} ÷ ${num(b)} by rounding each number to 1 significant figure.`,
      answer: decAnswer(ans),
      wrongAnswers: clean(ans, [
        ...(B.n < B.d ? [{ value: mul(A, B), misconception: "est-divide-decimal" }] : []),
        { value: div(roundDp(a, 0), B.n < B.d ? B : roundDp(b, 0)), misconception: "est-not-1sf" },
      ]),
      answerHelp: HELP_WHOLE,
      hints: [`${num(a)} ≈ ${num(A)} and ${num(b)} ≈ ${num(B)}.`, B.n < B.d ? `Dividing by ${num(B)} is the same as asking "how many ${num(B)}s make ${num(A)}?". The answer is bigger than ${num(A)}.` : `Now work out ${num(A)} ÷ ${num(B)}.`],
      solution: [`${num(a)} ≈ ${num(A)} and ${num(b)} ≈ ${num(B)}.`, B.n < B.d ? `${num(A)} ÷ ${num(B)} = ${num(mul(A, frac(10)))} ÷ ${num(mul(B, frac(10)))} = ${num(ans)}` : `${num(A)} ÷ ${num(B)} = ${num(ans)}`, `Estimate: ${num(ans)}`],
    };
  }

  // (a × b) ÷ c
  const C = frac(r.pick([2, 4, 5]));
  const Aw = r.pick(ONE_SF);
  const Bw = r.pick(ONE_SF);
  const A = frac(Aw * 10);
  const B = frac(Bw);
  const top = mul(A, B);
  if (div(top, C).d !== 1) return estimate(r, tier);
  const a = near(r, A);
  const b = near(r, B);
  const c = near(r, C);
  const ans = div(top, C);
  return {
    prompt: `Estimate the value of (${num(a)} × ${num(b)}) ÷ ${num(c)}. Round each number to 1 significant figure.`,
    answer: decAnswer(ans),
    wrongAnswers: clean(ans, [
      { value: top, misconception: "est-forgot-step" },
      { value: div(mul(roundDp(a, 0), roundDp(b, 0)), roundDp(c, 0)), misconception: "est-not-1sf" },
    ]),
    answerHelp: HELP_WHOLE,
    hints: [`Round each number: ${num(a)} ≈ ${num(A)}, ${num(b)} ≈ ${num(B)}, ${num(c)} ≈ ${num(C)}.`, `Work out ${num(A)} × ${num(B)}, then divide by ${num(C)}.`],
    solution: [`${num(a)} ≈ ${num(A)}, ${num(b)} ≈ ${num(B)}, ${num(c)} ≈ ${num(C)}.`, `${num(A)} × ${num(B)} = ${num(top)}`, `${num(top)} ÷ ${num(C)} = ${num(ans)}`],
  };
}

const estimation: Gen = (r, tier) => estimate(r, tier);

// ================================================================ error intervals

/** A whole number from lo to hi that isn't a multiple of 10 (so 7.4, never 7.0). */
function notTen(r: Rng, lo: number, hi: number): number {
  let n = r.int(lo, hi);
  while (n % 10 === 0) n = r.int(lo, hi);
  return n;
}

function bounds(r: Rng, tier: number): Q {
  const kind = tier === 1 ? r.pick(["1dp", "whole", "10"] as const) : r.pick(["1dp", "2dp", "10", "100", "whole"] as const);
  const spec =
    kind === "1dp"
      ? { v: dec(notTen(r, 11, 199), 1), half: dec(5, 2), unit: dec(1, 1), how: "to 1 decimal place", word: "0.1" }
      : kind === "2dp"
        ? { v: dec(notTen(r, 101, 999), 2), half: dec(5, 3), unit: dec(1, 2), how: "to 2 decimal places", word: "0.01" }
        : kind === "whole"
          ? { v: frac(r.int(3, 60)), half: dec(5, 1), unit: frac(1), how: "to the nearest whole number", word: "1" }
          : kind === "10"
            ? { v: frac(r.int(3, 99) * 10), half: frac(5), unit: frac(10), how: "to the nearest 10", word: "10" }
            : { v: frac(r.int(3, 99) * 100), half: frac(50), unit: frac(100), how: "to the nearest 100", word: "100" };
  const ctx = r.pick([
    { thing: "The length of a pencil", unit: " cm" },
    { thing: "The mass of a parcel", unit: " kg" },
    { thing: "The height of a plant", unit: " cm" },
    { thing: "A number", unit: "" },
  ]);
  const lower = r.next() < 0.5;
  const lo = sub(spec.v, spec.half);
  const hi = add(spec.v, spec.half);
  const ans = lower ? lo : hi;
  const nines = sub(hi, mul(spec.unit, dec(1, 1))); // 7.44 for 7.4
  return {
    prompt: `${ctx.thing} is ${num(spec.v)}${ctx.unit}, ${spec.how}. What is the ${lower ? "lower" : "upper"} bound${lower ? " (the smallest it could be)" : ""}?`,
    answer: decAnswer(ans),
    wrongAnswers: clean(ans, [
      { value: lower ? sub(spec.v, mul(spec.half, frac(10))) : add(spec.v, mul(spec.half, frac(10))), misconception: "ei-wrong-half" },
      { value: lower ? sub(spec.v, spec.unit) : add(spec.v, spec.unit), misconception: "ei-whole-unit" },
      ...(lower ? [] : [{ value: nines, misconception: "ei-upper-nines" }]),
    ]),
    answerHelp: "Type a number. Decimals are fine, like 7.35.",
    hints: [`It was rounded ${spec.how}, so the real value is within half of ${spec.word} of ${num(spec.v)}.`, `Half of ${spec.word} is ${num(spec.half)}. ${lower ? "Take it away from" : "Add it to"} ${num(spec.v)}.`],
    solution: [`Rounding ${spec.how} means steps of ${spec.word}. Half a step is ${num(spec.half)}.`, `${num(spec.v)} ${lower ? "−" : "+"} ${num(spec.half)} = ${num(ans)}`, `The ${lower ? "lower" : "upper"} bound is ${num(ans)}`],
  };
}

function intervalChoice(r: Rng): Q {
  const trunc = r.next() < 0.3;
  const v = dec(notTen(r, 11, 99), 1);
  const x = r.pick(["x", "L", "m", "h"]);
  if (trunc) {
    const right = `${num(v)} ≤ ${x} < ${num(add(v, dec(1, 1)))}`;
    return choiceQ(
      r,
      right,
      [
        { text: `${num(sub(v, dec(5, 2)))} ≤ ${x} < ${num(add(v, dec(5, 2)))}`, mc: "ei-truncation-rounded" },
        { text: `${num(v)} < ${x} ≤ ${num(add(v, dec(1, 1)))}`, mc: "ei-wrong-symbols" },
        { text: `${num(sub(v, dec(1, 1)))} < ${x} ≤ ${num(v)}` },
      ],
      {
        prompt: `A number ${x} is truncated to 1 decimal place. The result is ${num(v)}. Which is the error interval for ${x}?`,
        hints: [`Truncating means chopping off the extra digits, never rounding up.`, `So ${x} could be ${num(v)} exactly, or ${num(add(v, dec(1, 2)))}, ${num(add(v, dec(9, 2)))}, ${num(add(v, dec(99, 3)))}... but not ${num(add(v, dec(1, 1)))}.`],
        solution: [`Any number from ${num(v)} up to (not including) ${num(add(v, dec(1, 1)))} truncates to ${num(v)}.`, `${num(v)} itself is included (≤). ${num(add(v, dec(1, 1)))} is not (<).`, right],
      },
    );
  }
  const lo = sub(v, dec(5, 2));
  const hi = add(v, dec(5, 2));
  const right = `${num(lo)} ≤ ${x} < ${num(hi)}`;
  return choiceQ(
    r,
    right,
    [
      { text: `${num(lo)} < ${x} ≤ ${num(hi)}`, mc: "ei-wrong-symbols" },
      { text: `${num(sub(v, dec(1, 1)))} ≤ ${x} < ${num(add(v, dec(1, 1)))}`, mc: "ei-whole-unit" },
      { text: `${num(lo)} ≤ ${x} ≤ ${num(sub(hi, dec(1, 2)))}`, mc: "ei-upper-nines" },
    ],
    {
      prompt: `${x} = ${num(v)}, correct to 1 decimal place. Which is the error interval for ${x}?`,
      hints: [`Half of 0.1 is 0.05. The bounds are ${num(v)} − 0.05 and ${num(v)} + 0.05.`, `The lower bound rounds up to ${num(v)}, so it's included (≤). The upper bound rounds up to ${num(add(v, dec(1, 1)))}, so it isn't (<).`],
      solution: [`Lower bound: ${num(v)} − 0.05 = ${num(lo)}. Upper bound: ${num(v)} + 0.05 = ${num(hi)}.`, `${num(lo)} rounds to ${num(v)} so it is included. ${num(hi)} rounds to ${num(add(v, dec(1, 1)))} so it is not.`, right],
    },
  );
}

const errorIntervals: Gen = (r, tier) => (tier === 2 && r.next() < 0.4 ? intervalChoice(r) : bounds(r, tier));

// ================================================================ systematic listing

const MENUS = [
  { a: "starters", b: "main courses", c: "desserts", what: "meals", one: "A meal", has: "A café offers" },
  { a: "tops", b: "pairs of trousers", c: "pairs of shoes", what: "outfits", one: "An outfit", has: "Grace has" },
  { a: "types of bread", b: "fillings", c: "sauces", what: "sandwiches", one: "A sandwich", has: "A sandwich bar offers" },
] as const;

const listing: Gen = (r, tier) => {
  const kind = tier === 1 ? r.pick(["two", "two", "arrange3"] as const) : r.pick(["three", "arrange", "pairs", "digits", "two"] as const);
  if (kind === "two" || kind === "three") {
    const m = r.pick(MENUS);
    const x = r.int(2, 5);
    const y = r.int(2, 6);
    const z = r.int(2, 4);
    const three = kind === "three";
    const ans = three ? x * y * z : x * y;
    return {
      prompt: three
        ? `${m.has} ${x} ${m.a}, ${y} ${m.b} and ${z} ${m.c}. ${m.one} is one of each. How many different ${m.what} are possible?`
        : `${m.has} ${x} ${m.a} and ${y} ${m.b}. ${m.one} is one of each. How many different ${m.what} are possible?`,
      answer: intAnswer(ans),
      wrongAnswers: clean(ans, [
        { value: three ? x + y + z : x + y, misconception: "list-added" },
        ...(three ? [{ value: x * y, misconception: "list-missed-choice" }] : []),
      ]),
      answerHelp: HELP_WHOLE,
      hints: [`List them in order: the first of the ${m.a} with each of the ${m.b}, then the second...`, `Each of the ${x} ${m.a} goes with ${y} ${m.b}${three ? `, and each of those with ${z} ${m.c}` : ""}. Multiply.`],
      solution: [`Each of the ${x} ${m.a} can go with any of the ${y} ${m.b}: ${x} × ${y} = ${x * y}.`, three ? `Each of those can go with any of the ${z} ${m.c}: ${x * y} × ${z} = ${ans}.` : `Listing them in order would give ${ans} rows.`, `${ans} ${m.what}`],
    };
  }
  if (kind === "arrange3" || kind === "arrange") {
    const n = kind === "arrange3" ? 3 : r.pick([3, 4]);
    const letters = ["A", "B", "C", "D"].slice(0, n);
    const ans = n === 3 ? 6 : 24;
    return {
      prompt: `${n === 3 ? "Three" : "Four"} friends, ${letters.join(", ").replace(/, ([^,]*)$/, " and $1")}, stand in a line for a photo. How many different orders can they stand in?`,
      answer: intAnswer(ans),
      wrongAnswers: clean(ans, [
        { value: n, misconception: "list-incomplete" },
        { value: n * n, misconception: "list-repeats" },
        { value: n * 2, misconception: "list-incomplete" },
      ]),
      answerHelp: HELP_WHOLE,
      hints: [`List them systematically. Start with A first: ${n === 3 ? "ABC, ACB" : "ABCD, ABDC, ACBD, ..."}.`, `There are ${n} choices for the first place, ${n - 1} for the next${n === 4 ? ", then 2, then 1" : ", then 1"}.`],
      solution: [n === 3 ? `ABC, ACB, BAC, BCA, CAB, CBA.` : `With A first there are 6 orders (ABCD, ABDC, ACBD, ACDB, ADBC, ADCB). The same with B, C or D first.`, n === 3 ? `${n} × 2 × 1 = 6` : `4 × 6 = 24, or 4 × 3 × 2 × 1 = 24.`, `${ans} orders`],
    };
  }
  if (kind === "pairs") {
    const n = r.pick([4, 5, 6]);
    const ans = (n * (n - 1)) / 2;
    return {
      prompt: `${n} players are in a table tennis group. Each player plays every other player once. How many games are played?`,
      answer: intAnswer(ans),
      wrongAnswers: clean(ans, [
        { value: n * (n - 1), misconception: "list-order-counted" },
        { value: n * n, misconception: "list-repeats" },
      ]),
      answerHelp: HELP_WHOLE,
      hints: [`Call the players A, B, C${n > 3 ? ", D" : ""}${n > 4 ? ", E" : ""}${n > 5 ? ", F" : ""}. List A's games first: AB, AC...`, `B has already played A, so B's new games start with BC. A game between A and B is the same as B and A.`],
      solution: [`A plays ${n - 1} games, B has ${n - 2} new games, C has ${n - 3}${n > 4 ? ", and so on" : ""}.`, `${Array.from({ length: n - 1 }, (_, i) => n - 1 - i).join(" + ")} = ${ans}`, `${ans} games`],
    };
  }
  // Two-digit numbers from given digits, no repeats.
  const digits = shuffle(r, [1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, r.pick([3, 4])).sort();
  const n = digits.length;
  const ans = n * (n - 1);
  return {
    prompt: `How many different two-digit numbers can you make from the digits ${digits.join(", ")}, if you can't use a digit twice in the same number?`,
    answer: intAnswer(ans),
    wrongAnswers: clean(ans, [
      { value: n * n, misconception: "list-repeats" },
      { value: ans / 2, misconception: "list-order-counted-wrong" },
    ]),
    answerHelp: HELP_WHOLE,
    hints: [`List them in order, starting with ${digits[0]} as the tens digit: ${digits.slice(1).map((x) => `${digits[0]}${x}`).join(", ")}.`, `Each of the ${n} digits can be first, and then there are ${n - 1} left for the second digit.`],
    solution: [`With ${digits[0]} first: ${digits.slice(1).map((x) => `${digits[0]}${x}`).join(", ")} (${n - 1} numbers).`, `Each of the ${n} digits can go first: ${n} × ${n - 1} = ${ans}.`, `${ans} numbers`],
  };
};

// ================================================================ standard form calculations

/** A 1 or 2 significant-figure mantissa from 1 to 9.9. */
const mant = (r: Rng, sf: 1 | 2) => (sf === 1 ? frac(r.int(1, 9)) : dec(r.int(11, 99), 1));

function sfShow(m: Fraction, p: number) {
  return showStandardForm(m, p);
}

function sfMulDiv(r: Rng, tier: number): Q {
  const mulOp = r.next() < 0.55;
  const p1 = tier === 1 ? r.int(2, 6) : r.int(-4, 7);
  const p2 = tier === 1 ? r.int(2, 5) : r.int(-3, 5);
  if (p1 === 0 || p2 === 0) return sfMulDiv(r, tier);
  if (mulOp) {
    const a = frac(r.int(2, tier === 1 ? 4 : 9));
    const b = frac(r.int(2, tier === 1 ? 4 : 9));
    const prod = mul(a, b); // may be 10 or more
    const p = p1 + p2;
    const adjust = prod.n / prod.d >= 10;
    const m = adjust ? div(prod, frac(10)) : prod;
    const power = adjust ? p + 1 : p;
    const value = sfValue(m, power);
    return {
      prompt: `Work out (${sfShow(a, p1)}) × (${sfShow(b, p2)}). Give your answer in standard form.`,
      answer: { kind: "standard-form", mantissa: m, power },
      wrongAnswers: clean(value, [
        ...(Math.abs(p1 * p2) <= 12 && p1 * p2 !== p ? [{ value: sfValue(prod, p1 * p2), misconception: "sfc-multiplied-powers" }] : []),
        ...(adjust ? [{ value: sfValue(m, p), misconception: "sfc-adjust-wrong-way" }] : []),
        { value: sfValue(add(a, b), p), misconception: "sfc-added-numbers" },
      ]),
      answerHelp: HELP_SF,
      hints: [`Multiply the numbers: ${num(a)} × ${num(b)}. Add the powers: 10${sup(p1)} × 10${sup(p2)} = 10${sup(p)}.`, adjust ? `${num(prod)} is 10 or more, so it isn't standard form yet. ${num(prod)} = ${num(m)} × 10¹.` : `Check the first number is between 1 and 10.`],
      solution: [
        `${num(a)} × ${num(b)} = ${num(prod)}, and 10${sup(p1)} × 10${sup(p2)} = 10${sup(p)} (add the powers).`,
        adjust ? `${num(prod)} × 10${sup(p)} = ${num(m)} × 10¹ × 10${sup(p)}.` : `${num(prod)} is between 1 and 10, so it's already in standard form.`,
        sfShow(m, power),
      ],
    };
  }
  // Division
  const b = frac(r.int(2, 5));
  const q = frac(r.int(1, 4));
  const big = r.next() < 0.6 || tier === 1;
  const a = big ? mul(b, q) : b; // a ÷ b = q, or a smaller than b
  const quot = big ? q : div(a, mul(b, q));
  if (!big && quot.n / quot.d >= 1) return sfMulDiv(r, tier);
  const P1 = tier === 1 ? r.int(5, 9) : p1;
  const P2 = tier === 1 ? r.int(1, 4) : p2;
  const aa = big ? a : a;
  const bb = big ? b : mul(b, q);
  if (aa.n / aa.d >= 10 || bb.n / bb.d >= 10) return sfMulDiv(r, tier);
  const quotient = div(aa, bb);
  const p = P1 - P2;
  const adjust = quotient.n / quotient.d < 1;
  const m = adjust ? mul(quotient, frac(10)) : quotient;
  const power = adjust ? p - 1 : p;
  if (m.n / m.d >= 10 || m.n / m.d < 1 || (m.d !== 1 && m.d !== 2 && m.d !== 5 && m.d !== 4)) return sfMulDiv(r, tier);
  const value = sfValue(m, power);
  return {
    prompt: `Work out (${sfShow(aa, P1)}) ÷ (${sfShow(bb, P2)}). Give your answer in standard form.`,
    answer: { kind: "standard-form", mantissa: m, power },
    wrongAnswers: clean(value, [
      ...(P2 !== 0 && P1 % P2 === 0 ? [{ value: sfValue(quotient, P1 / P2), misconception: "sfc-divided-powers" }] : []),
      { value: sfValue(quotient, P1 + P2), misconception: "sfc-added-powers-divide" },
      ...(adjust ? [{ value: sfValue(m, p + 1), misconception: "sfc-adjust-wrong-way" }] : []),
    ]),
    answerHelp: HELP_SF,
    hints: [`Divide the numbers: ${num(aa)} ÷ ${num(bb)}. Subtract the powers: 10${sup(P1)} ÷ 10${sup(P2)} = 10${sup(p)}.`, adjust ? `${num(quotient)} is less than 1, so it isn't standard form yet. ${num(quotient)} = ${num(m)} × 10⁻¹.` : `Check the first number is between 1 and 10.`],
    solution: [
      `${num(aa)} ÷ ${num(bb)} = ${num(quotient)}, and 10${sup(P1)} ÷ 10${sup(P2)} = 10${sup(p)} (subtract the powers).`,
      adjust ? `${num(quotient)} × 10${sup(p)} = ${num(m)} × 10⁻¹ × 10${sup(p)}.` : `${num(quotient)} is between 1 and 10, so it's already in standard form.`,
      sfShow(m, power),
    ],
  };
}

function sfAddSub(r: Rng): Q {
  const p = r.int(3, 7);
  const a = mant(r, 2);
  const bm = frac(r.int(1, 9));
  const plus = r.next() < 0.6;
  const A = sfValue(a, p);
  const B = sfValue(bm, p - 1);
  const total = plus ? add(A, B) : sub(A, B);
  if (total.n <= 0) return sfAddSub(r);
  // Write total in standard form.
  let power = p;
  let m = div(total, sfValue(frac(1), power));
  while (m.n / m.d >= 10) {
    power += 1;
    m = div(m, frac(10));
  }
  while (m.n / m.d < 1) {
    power -= 1;
    m = mul(m, frac(10));
  }
  return {
    prompt: `Work out ${sfShow(a, p)} ${plus ? "+" : "−"} ${sfShow(bm, p - 1)}. Give your answer in standard form.`,
    answer: { kind: "standard-form", mantissa: m, power },
    wrongAnswers: clean(total, [
      { value: sfValue(plus ? add(a, bm) : sub(a, bm), p), misconception: "sfc-added-numbers" },
      { value: sfValue(plus ? add(a, bm) : sub(a, bm), plus ? 2 * p - 1 : p), misconception: "sfc-added-numbers" },
    ]),
    answerHelp: HELP_SF,
    hints: [`You can't just add the first numbers, because the powers are different. Write both as ordinary numbers first.`, `${sfShow(a, p)} = ${num(A)} and ${sfShow(bm, p - 1)} = ${num(B)}.`],
    solution: [`${sfShow(a, p)} = ${num(A)} and ${sfShow(bm, p - 1)} = ${num(B)}.`, `${num(A)} ${plus ? "+" : "−"} ${num(B)} = ${num(total)}`, `${num(total)} = ${sfShow(m, power)}`],
  };
}

const sfCalc: Gen = (r, tier) => (tier === 2 && r.next() < 0.3 ? sfAddSub(r) : sfMulDiv(r, tier));

export const CALCULATION_GENERATORS: Record<string, Gen> = {
  "num-ordering": ordering,
  "num-multiply": multiply,
  "num-divide": divide,
  "num-inverse-operations": inverse,
  "num-time-money": timeMoney,
  "num-units": units,
  "num-estimation": estimation,
  "num-error-intervals": errorIntervals,
  "num-listing": listing,
  "num-standard-form-calc": sfCalc,
};
