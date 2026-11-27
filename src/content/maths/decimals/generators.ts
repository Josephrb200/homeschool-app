/**
 * Question generators for the decimals chain.
 *
 * All arithmetic is exact (see dec.ts). Numbers are chosen so the working is
 * short and the answer is unambiguous: rounding answers never end in a
 * trailing zero after the decimal point (3.50), because a typed 3.5 would then
 * be marked the same as 3.50.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher.
 */

import { add, frac, sub, type Fraction } from "@/engine/fraction";
import type { Rng } from "@/engine/random";
import type { Question } from "@/engine/types";
import { cleanWrong, dec, leadingPower, places, roundDp, roundSf, showDec, truncDp, unitsOf } from "./dec";

export type Tier = 1 | 2;
type Q = Omit<Question, "id" | "skillId">;
type Gen = (r: Rng, tier: Tier) => Q;

const COLUMN = ["units", "tenths", "hundredths", "thousandths"] as const;
const COLUMN_VALUE = ["1", "0.1", "0.01", "0.001"] as const;

const HELP_DECIMAL = "Type a number like 36, 0.4 or 0.05.";

/** Show big whole numbers with commas so they are easy to read: 72,840. */
export function big(f: Fraction): string {
  const s = showDec(f);
  if (s.includes(".") || Math.abs(f.n / f.d) < 10000) return s;
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const fracAnswer = (value: Fraction): Question["answer"] => ({ kind: "fraction", value, requireSimplest: false, form: "decimal" });

// ------------------------------------------------------------ place value

/** A number with distinct non-zero digits, so "the digit 7" means one column. */
function distinctDigits(r: Rng, count: number): number[] {
  const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const out: number[] = [];
  while (out.length < count) {
    const d = r.pick(pool.filter((x) => !out.includes(x)));
    out.push(d);
  }
  return out;
}

function digitValue(r: Rng, tier: Tier): Q {
  const dp = tier === 1 ? 2 : 3;
  const wholeDigits = tier === 1 ? 1 : 2;
  const digits = distinctDigits(r, wholeDigits + dp);
  const units = Number(digits.join(""));
  const n = dec(units, dp);
  const pos = r.int(1, dp); // which decimal column
  const digit = digits[wholeDigits + pos - 1];
  const value = dec(digit, pos);
  const otherPos = pos === 1 ? 2 : pos - 1;
  const text = showDec(n);
  return {
    prompt: `What is the value of the digit ${digit} in ${text}?`,
    answer: fracAnswer(value),
    wrongAnswers: cleanWrong(value, [
      { value: frac(digit), misconception: "pv-face-value" },
      { value: dec(digit, otherPos), misconception: "pv-wrong-column" },
    ]),
    hints: [
      `Start at the decimal point and count columns to the right: tenths, hundredths, thousandths.`,
      `The ${digit} is in the ${COLUMN[pos]} column. One ${COLUMN[pos].slice(0, -1)} is ${COLUMN_VALUE[pos]}.`,
    ],
    solution: [
      `In ${text}, the ${digit} is ${pos} place${pos > 1 ? "s" : ""} after the decimal point.`,
      `That is the ${COLUMN[pos]} column.`,
      `So its value is ${digit} ${COLUMN[pos]} = ${showDec(value)}.`,
    ],
    answerHelp: "Type a number like 0.3, 0.05 or 3/100.",
  };
}

function timesDivide(r: Rng, tier: Tier): Q {
  const power = tier === 1 ? 1 : r.pick([2, 3, 2]);
  const by = 10 ** power;
  const multiply = r.next() < 0.5;
  let n: Fraction;
  if (tier === 1) n = multiply ? dec(r.int(11, 99), r.pick([1, 2])) : dec(r.int(11, 99), r.pick([0, 1]));
  else n = multiply ? dec(r.int(11, 999), r.pick([2, 3])) : dec(r.int(11, 999), r.pick([0, 1]));
  const right = multiply ? frac(n.n * by, n.d) : frac(n.n, n.d * by);
  const flipped = multiply ? frac(n.n, n.d * by) : frac(n.n * by, n.d);
  const offBy = power === 1 ? 100 : 10 ** (power + 1);
  const wrongPlaces = multiply ? frac(n.n * offBy, n.d) : frac(n.n, n.d * offBy);
  const op = multiply ? "×" : "÷";
  const way = multiply ? "left" : "right";
  const bigger = multiply ? "bigger" : "smaller";
  const ans = showDec(right);
  return {
    prompt: `Work out ${showDec(n)} ${op} ${by}.`,
    answer: fracAnswer(right),
    wrongAnswers: cleanWrong(right, [
      { value: flipped, misconception: "pv-wrong-direction" },
      { value: wrongPlaces, misconception: "pv-wrong-places" },
    ]),
    hints: [
      `${multiply ? "Multiplying" : "Dividing"} by ${by} makes the number ${bigger}. The digits move ${power} place${power > 1 ? "s" : ""} to the ${way}.`,
      `Write ${showDec(n)} in a place value chart, then move every digit ${power} column${power > 1 ? "s" : ""} to the ${way}. Fill empty places before the point with zeros.`,
    ],
    solution: [
      `${by} has ${power} zero${power > 1 ? "s" : ""}, so the digits move ${power} place${power > 1 ? "s" : ""}.`,
      `${multiply ? "Multiplying" : "Dividing"} makes the number ${bigger}, so they move to the ${way}.`,
      `${showDec(n)} ${op} ${by} = ${ans}`,
    ],
    answerHelp: HELP_DECIMAL,
  };
}

function compare(r: Rng): Q {
  // Short decimal with a bigger tenths digit, against a longer decimal: 0.6 vs 0.45.
  const t = r.int(3, 9);
  const shorter = dec(t, 1);
  const longer = dec(r.int(1, t - 1) * 10 + r.int(1, 9), 2);
  const longest = r.next() < 0.5 ? longer : dec(unitsOf(longer, 2) * 10 + r.int(1, 9), 3);
  const [a, b] = r.next() < 0.5 ? [shorter, longest] : [longest, shorter];
  const dp = places(longest);
  return {
    prompt: `Which is bigger, ${showDec(a)} or ${showDec(b)}? Type the bigger number.`,
    answer: fracAnswer(shorter),
    wrongAnswers: [{ value: longest, misconception: "pv-longer-is-bigger" }],
    hints: [
      `Compare the tenths first: the first digit after the decimal point.`,
      `Write both with the same number of decimal places: ${showDec(shorter, dp)} and ${showDec(longest, dp)}.`,
    ],
    solution: [
      `${showDec(shorter)} has ${t} tenths. ${showDec(longest)} has ${Math.floor(unitsOf(longest, dp) / 10 ** (dp - 1))} tenths.`,
      `${t} tenths is more, so ${showDec(shorter)} is bigger.`,
      `Check: ${showDec(shorter, dp)} > ${showDec(longest, dp)}.`,
    ],
    answerHelp: "Type one of the two numbers.",
  };
}

const placeValue: Gen = (r, tier) => {
  const x = r.next();
  if (tier === 1) return x < 0.5 ? digitValue(r, 1) : timesDivide(r, 1);
  if (x < 0.3) return digitValue(r, 2);
  if (x < 0.65) return timesDivide(r, 2);
  return compare(r);
};

// ------------------------------------------------------------ add and subtract

/** Column-by-column result with no carrying or exchanging: the two classic slips. */
function columnwise(a: number, b: number, op: (x: number, y: number) => number): number {
  const sa = String(a);
  const sb = String(b);
  const len = Math.max(sa.length, sb.length);
  const pa = sa.padStart(len, "0");
  const pb = sb.padStart(len, "0");
  let out = "";
  for (let i = 0; i < len; i++) out += String(op(Number(pa[i]), Number(pb[i])));
  return Number(out);
}

const addSub: Gen = (r, tier) => {
  const HELP = "Type a number like 5.9 or 12.35.";
  if (tier === 1) {
    const adding = r.next() < 0.5;
    if (adding) {
      const a = r.int(11, 89);
      const b = r.int(11, 89);
      const A = dec(a, 1);
      const B = dec(b, 1);
      const ans = add(A, B);
      const carried = (a % 10) + (b % 10) >= 10;
      return {
        prompt: `Work out ${showDec(A)} + ${showDec(B)}.`,
        answer: fracAnswer(ans),
        wrongAnswers: carried ? cleanWrong(ans, [{ value: dec(columnwise(a, b, (x, y) => (x + y) % 10), 1), misconception: "dec-forgot-carry" }]) : [],
        hints: [`Write one number under the other with the decimal points lined up.`, `Add the tenths first. ${carried ? "They make 10 or more, so carry 1 into the units." : ""}`.trim()],
        solution: [
          `Line up the points: ${showDec(A)} over ${showDec(B)}.`,
          `Tenths: ${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)}${carried ? ", write " + (((a % 10) + (b % 10)) % 10) + " and carry 1" : ""}.`,
          `Units: ${Math.floor(a / 10)} + ${Math.floor(b / 10)}${carried ? " + 1" : ""} = ${Math.floor(a / 10) + Math.floor(b / 10) + (carried ? 1 : 0)}.`,
          `Answer: ${showDec(ans)}`,
        ],
        answerHelp: HELP,
      };
    }
    let a = r.int(31, 99);
    let b = r.int(11, a - 10);
    if (a === b) b -= 1;
    const A = dec(a, 1);
    const B = dec(b, 1);
    const ans = sub(A, B);
    const exchange = a % 10 < b % 10;
    return {
      prompt: `Work out ${showDec(A)} − ${showDec(B)}.`,
      answer: fracAnswer(ans),
      wrongAnswers: exchange ? cleanWrong(ans, [{ value: dec(columnwise(a, b, (x, y) => Math.abs(x - y)), 1), misconception: "dec-smaller-from-larger" }]) : [],
      hints: [
        `Write ${showDec(B)} under ${showDec(A)} with the decimal points lined up.`,
        exchange ? `${a % 10} tenths take away ${b % 10} tenths won't go, so exchange 1 unit for 10 tenths first.` : `Subtract the tenths, then the units.`,
      ],
      solution: exchange
        ? [
            `Tenths: ${a % 10} − ${b % 10} won't go. Exchange 1 unit for 10 tenths: ${(a % 10) + 10} − ${b % 10} = ${(a % 10) + 10 - (b % 10)}.`,
            `Units: ${Math.floor(a / 10) - 1} − ${Math.floor(b / 10)} = ${Math.floor(a / 10) - 1 - Math.floor(b / 10)}.`,
            `Answer: ${showDec(ans)}`,
          ]
        : [`Tenths: ${a % 10} − ${b % 10} = ${(a % 10) - (b % 10)}.`, `Units: ${Math.floor(a / 10)} − ${Math.floor(b / 10)} = ${Math.floor(a / 10) - Math.floor(b / 10)}.`, `Answer: ${showDec(ans)}`],
      answerHelp: HELP,
    };
  }

  const kind = r.pick(["add-mixed", "whole-minus", "sub-mixed", "money"] as const);
  if (kind === "add-mixed") {
    // 4.7 + 2.35: different numbers of decimal places.
    const a = r.int(11, 99);
    const b = r.int(101, 999);
    const A = dec(a, 1);
    const B = dec(b, 2);
    const ans = add(A, B);
    const [p, q] = r.next() < 0.5 ? [A, B] : [B, A];
    return {
      prompt: `Work out ${showDec(p)} + ${showDec(q)}.`,
      answer: fracAnswer(ans),
      wrongAnswers: cleanWrong(ans, [{ value: add(dec(a, 2), B), misconception: "dec-right-aligned" }]),
      hints: [`Line up the decimal points, not the last digits.`, `Write ${showDec(A)} as ${showDec(A, 2)} so both numbers have 2 decimal places.`],
      solution: [`Write ${showDec(A)} as ${showDec(A, 2)}.`, `Line up the points: ${showDec(A, 2)} + ${showDec(B, 2)}.`, `Add column by column from the right: ${showDec(ans)}.`],
      answerHelp: HELP,
    };
  }
  if (kind === "whole-minus") {
    // 6 − 2.45
    const w = r.int(3, 20);
    const b = r.int(101, (w - 1) * 100 - 1);
    const B = dec(b, 2);
    const ans = sub(frac(w), B);
    const ignored = add(frac(w - Math.floor(b / 100)), dec(b % 100, 2));
    return {
      prompt: `Work out ${w} − ${showDec(B)}.`,
      answer: fracAnswer(ans),
      wrongAnswers: cleanWrong(ans, [
        { value: ignored, misconception: "dec-ignored-whole" },
        { value: dec(columnwise(w * 100, b, (x, y) => Math.abs(x - y)), 2), misconception: "dec-smaller-from-larger" },
      ]),
      hints: [`Write ${w} as ${w}.00 so both numbers have 2 decimal places.`, `Now subtract ${showDec(B, 2)} from ${w}.00 column by column, exchanging where you need to.`],
      solution: [`${w} = ${w}.00`, `${w}.00 − ${showDec(B, 2)}: exchange across the zeros, then subtract each column.`, `Answer: ${showDec(ans)}`, `Check: ${showDec(ans)} + ${showDec(B)} = ${w}.`],
      answerHelp: HELP,
    };
  }
  if (kind === "sub-mixed") {
    // 12.3 − 4.56
    const a = r.int(60, 199);
    const b = r.int(101, a * 10 - 50);
    const A = dec(a, 1);
    const B = dec(b, 2);
    const ans = sub(A, B);
    return {
      prompt: `Work out ${showDec(A)} − ${showDec(B)}.`,
      answer: fracAnswer(ans),
      wrongAnswers: cleanWrong(ans, [{ value: dec(columnwise(a * 10, b, (x, y) => Math.abs(x - y)), 2), misconception: "dec-smaller-from-larger" }]),
      hints: [`Write ${showDec(A)} as ${showDec(A, 2)} so both numbers have 2 decimal places.`, `Line up the points and subtract from the right. Exchange when the top digit is smaller.`],
      solution: [`${showDec(A)} = ${showDec(A, 2)}`, `${showDec(A, 2)} − ${showDec(B, 2)} = ${showDec(ans)}`, `Check: ${showDec(ans)} + ${showDec(B)} = ${showDec(A)}.`],
      answerHelp: HELP,
    };
  }
  // money
  const have = r.pick([5, 10, 20, 50]);
  const spendP = r.int(105, have * 100 - 105);
  const spend = dec(spendP, 2);
  const left = sub(frac(have), spend);
  const name = r.pick(["Sam", "Priya", "Alex", "Jordan", "Mia", "Leo"]);
  const item = r.pick(["a book", "a phone case", "some paint", "a game", "lunch"]);
  return {
    prompt: `${name} pays for ${item} costing £${showDec(spend, 2)} with a £${have} note. How much change should ${name} get, in pounds?`,
    answer: fracAnswer(left),
    wrongAnswers: cleanWrong(left, [
      { value: add(frac(have - Math.floor(spendP / 100)), dec(spendP % 100, 2)), misconception: "dec-ignored-whole" },
      { value: dec(columnwise(have * 100, spendP, (x, y) => Math.abs(x - y)), 2), misconception: "dec-smaller-from-larger" },
    ]),
    hints: [`Change = ${have} − ${showDec(spend, 2)}. Write ${have} as ${have}.00.`, `You can also count up: from £${showDec(spend, 2)} to the next whole pound, then on to £${have}.`],
    solution: [`£${have}.00 − £${showDec(spend, 2)}`, `= £${showDec(left, 2)}`, `Check: £${showDec(left, 2)} + £${showDec(spend, 2)} = £${have}.00.`],
    answerHelp: "Type an amount like 3.45. The £ sign is fine.",
  };
};

// ------------------------------------------------------------ rounding

const DP_WORDS = ["the nearest whole number", "1 decimal place", "2 decimal places", "3 decimal places"];

/** A rounding answer that doesn't end in a trailing zero after the point. */
function hasTrailingZero(f: Fraction, dp: number): boolean {
  return dp > 0 && places(f) < dp;
}

function roundToDp(r: Rng, dp: number): Q {
  // number with dp + 1 or dp + 2 decimal places
  for (let tries = 0; ; tries++) {
    const extra = r.pick([1, 1, 2]);
    const total = dp + extra;
    const whole = r.int(1, dp === 0 ? 60 : 30);
    const frac10 = r.int(1, 10 ** total - 1);
    const n = dec(whole * 10 ** total + frac10, total);
    if (places(n) !== total) continue; // keep the number as long as we said
    const ans = roundDp(n, dp);
    if (hasTrailingZero(ans, dp) && tries < 50) continue;
    const cut = truncDp(n, dp);
    const next = String(unitsOf(n, total)).slice(-(total - dp))[0];
    const roundsUp = Number(next) >= 5;
    const wrongs = [{ value: cut, misconception: "round-truncated" }];
    if (dp > 0) wrongs.push({ value: roundDp(n, dp + 1), misconception: "round-wrong-place" });
    if (dp > 1) wrongs.push({ value: roundDp(n, dp - 1), misconception: "round-wrong-place" });
    return {
      prompt: `Round ${showDec(n)} to ${DP_WORDS[dp]}.`,
      answer: fracAnswer(ans),
      wrongAnswers: cleanWrong(ans, wrongs),
      hints: [
        dp === 0 ? `Look at the tenths digit, the first digit after the decimal point.` : `Count ${dp} digit${dp > 1 ? "s" : ""} after the decimal point. Then look at the digit after that.`,
        `The deciding digit is ${next}. ${roundsUp ? "5 or more, so round up." : "4 or less, so the digit before it stays the same."}`,
      ],
      solution: [
        `Rounding to ${DP_WORDS[dp]}, the answer is either ${showDec(cut, dp)} or ${showDec(add(cut, dec(1, dp)), dp)}.`,
        `The next digit is ${next}, which is ${roundsUp ? "5 or more, so round up" : "4 or less, so round down"}.`,
        `${showDec(n)} ≈ ${showDec(ans, dp)}`,
      ],
      answerHelp: "Type the rounded number, like 7 or 3.5.",
    };
  }
}

function roundToSf(r: Rng): Q {
  for (let tries = 0; ; tries++) {
    const sf = r.pick([1, 2, 2]);
    const large = r.next() < 0.5;
    let n: Fraction;
    if (large) {
      const digits = r.int(3, 5);
      n = frac(r.int(10 ** (digits - 1) + 1, 10 ** digits - 1));
    } else {
      const zeros = r.int(1, 2); // 0.0xxx or 0.00xxx
      const u = r.int(101, 999);
      if (u % 10 === 0) continue;
      n = dec(u, zeros + 3);
    }
    const ans = roundSf(n, sf);
    const p = leadingPower(n);
    const ansDp = sf - 1 - p;
    if (!large && hasTrailingZero(ans, ansDp) && tries < 50) continue;
    if (leadingPower(ans) !== p && tries < 50) continue; // avoid 9.96 → 10 edge cases
    const words = `${sf} significant figure${sf > 1 ? "s" : ""}`;
    const cut = large ? frac(Math.floor(n.n / 10 ** (p - sf + 1)) * 10 ** (p - sf + 1)) : truncDp(n, ansDp);
    const wrongs = [{ value: cut, misconception: "round-truncated" }];
    if (large) wrongs.push({ value: frac(ans.n / ans.d / 10 ** (p - sf + 1)), misconception: "round-sf-dropped-zeros" });
    else wrongs.push({ value: roundDp(n, sf), misconception: "round-sf-as-dp" });
    const sig = showDec(n).replace(".", "").replace(/^0+/, ""); // significant digits, in order
    const firstDigit = sig[0];
    const next = sig[sf];
    const up = Number(next) >= 5;
    return {
      prompt: `Round ${big(n)} to ${words}.`,
      answer: fracAnswer(ans),
      wrongAnswers: cleanWrong(ans, wrongs),
      hints: [
        large
          ? `The first significant figure is the first digit, ${firstDigit}. Keep ${sf} digit${sf > 1 ? "s" : ""}, then look at the next one.`
          : `Zeros at the start don't count. The first significant figure is the ${firstDigit}.`,
        large ? `Fill the places after the digits you keep with zeros, so the number stays about the same size.` : `Keep ${sf} digit${sf > 1 ? "s" : ""} from the ${firstDigit}, and round using the digit after.`,
      ],
      solution: large
        ? [
            `Keep the first ${sf} digit${sf > 1 ? "s" : ""}: ${sig.slice(0, sf)}. The next digit is ${next}, so ${up ? "round up" : "keep them the same"}.`,
            `Fill the rest of the places with zeros: ${big(n)} ≈ ${big(ans)}.`,
            `It is still about the same size as ${big(n)}, so the zeros are right.`,
          ]
        : [
            `The first significant figure in ${showDec(n)} is the ${firstDigit}. The zeros before it don't count.`,
            `Keep ${sf} significant figure${sf > 1 ? "s" : ""}: ${sig.slice(0, sf)}. The next digit is ${next}, so ${up ? "round up" : "keep them the same"}.`,
            `${showDec(n)} ≈ ${showDec(ans)}`,
          ],
      answerHelp: large ? "Type the rounded number, like 3500 or 70,000." : "Type the rounded number, like 0.046.",
    };
  }
}

const rounding: Gen = (r, tier) => {
  if (tier === 1) return roundToDp(r, r.pick([0, 0, 1, 1]));
  const x = r.next();
  if (x < 0.35) return roundToDp(r, r.pick([1, 2]));
  return roundToSf(r);
};

export const DECIMAL_GENERATORS: Record<string, Gen> = {
  "num-place-value": placeValue,
  "num-add-sub": addSub,
  "num-rounding": rounding,
};
