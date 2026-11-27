/**
 * Exact decimal helpers for the decimals and percentages chains.
 *
 * Every decimal is held as an exact fraction (n / 10^k), so 0.1 + 0.2 is 0.3,
 * never 0.30000000000000004. Shown back to students with `showDec`.
 */

import { equals, frac, simplify, type Fraction } from "@/engine/fraction";

/** A decimal from a whole number of 10^-dp units: dec(345, 2) is 3.45. */
export const dec = (units: number, dp = 0): Fraction => simplify(frac(units, 10 ** dp));

/** How many decimal places a terminating fraction needs (throws if it doesn't terminate within 12). */
export function places(f: Fraction): number {
  const s = simplify(f);
  for (let k = 0; k <= 12; k++) if ((10 ** k) % s.d === 0) return k;
  throw new Error(`${s.n}/${s.d} is not a terminating decimal`);
}

/** True if f can be written as a decimal that ends (like 0.375, not 0.333...). */
export function terminates(f: Fraction): boolean {
  const s = simplify(f);
  for (let k = 0; k <= 12; k++) if ((10 ** k) % s.d === 0) return true;
  return false;
}

/** Exact decimal text, no trailing zeros unless `minDp` asks for them: showDec(dec(5,1)) = "0.5"; showDec(dec(5,1), 2) = "0.50". */
export function showDec(f: Fraction, minDp = 0): string {
  const s = simplify(f);
  const k = Math.max(places(s), minDp);
  const units = Math.round((Math.abs(s.n) * 10 ** k) / s.d);
  const sign = s.n < 0 ? "-" : "";
  if (k === 0) return sign + String(units);
  const str = String(units).padStart(k + 1, "0");
  return `${sign}${str.slice(0, -k)}.${str.slice(-k)}`;
}

/** Money: always 2 decimal places when there are pence. £12, £12.50. */
export function showMoney(f: Fraction): string {
  return `£${places(f) === 0 ? showDec(f) : showDec(f, 2)}`;
}

/** Whole number of 10^-dp units in f (f must have at most dp places). */
export function unitsOf(f: Fraction, dp: number): number {
  return Math.round((f.n * 10 ** dp) / f.d);
}

/** Drop wrong answers equal to the right one, and duplicates. */
export function cleanWrong(correct: Fraction, wrong: { value: Fraction; misconception: string }[]) {
  const seen: Fraction[] = [];
  return wrong.filter((w) => {
    if (equals(w.value, correct) || seen.some((s) => equals(s, w.value))) return false;
    seen.push(w.value);
    return true;
  });
}

/** Round half up (away from zero for positives) to `dp` decimal places. Exact. */
export function roundDp(f: Fraction, dp: number): Fraction {
  // units = floor(f * 10^dp + 1/2), done in integers
  const num = f.n * 10 ** dp * 2 + f.d;
  const den = f.d * 2;
  return dec(Math.floor(num / den), dp);
}

/** Cut off (truncate) to `dp` decimal places: the classic rounding mistake. */
export function truncDp(f: Fraction, dp: number): Fraction {
  return dec(Math.floor((f.n * 10 ** dp) / f.d), dp);
}

/** Position of the first significant figure as a power of ten: 3456 → 3, 0.0456 → -2. */
export function leadingPower(f: Fraction): number {
  const x = f.n / f.d;
  let p = Math.floor(Math.log10(x));
  // guard against floating error at exact powers of ten
  if (10 ** (p + 1) <= x) p += 1;
  if (10 ** p > x) p -= 1;
  return p;
}

/** Round to `sf` significant figures. dp may be negative (round to tens, hundreds...). */
export function roundSf(f: Fraction, sf: number): Fraction {
  const dp = sf - 1 - leadingPower(f);
  return dp >= 0 ? roundDp(f, dp) : roundToPower(f, -dp);
}

function roundToPower(f: Fraction, p: number): Fraction {
  const step = 10 ** p;
  // floor(f / step + 1/2) * step
  return frac(Math.floor((f.n * 2 + f.d * step) / (2 * f.d * step)) * step);
}
