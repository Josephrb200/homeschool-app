/**
 * Exact rational arithmetic and answer parsing.
 *
 * Students type answers in many forms: "3/4", "6/8", "0.75", "1 1/2", "-2/3", "5".
 * Everything is converted to an exact fraction so marking never depends on
 * floating-point rounding.
 */

export interface Fraction {
  /** numerator, carries the sign */
  n: number;
  /** denominator, always positive */
  d: number;
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

export function frac(n: number, d = 1): Fraction {
  if (d === 0) throw new Error("Denominator cannot be zero");
  if (d < 0) {
    n = -n;
    d = -d;
  }
  return { n, d };
}

export function simplify(f: Fraction): Fraction {
  const g = gcd(f.n, f.d);
  return frac(f.n / g, f.d / g);
}

export function isSimplest(f: Fraction): boolean {
  return gcd(f.n, f.d) === 1;
}

export function equals(a: Fraction, b: Fraction): boolean {
  return a.n * b.d === b.n * a.d;
}

export const add = (a: Fraction, b: Fraction) => simplify(frac(a.n * b.d + b.n * a.d, a.d * b.d));
export const sub = (a: Fraction, b: Fraction) => simplify(frac(a.n * b.d - b.n * a.d, a.d * b.d));
export const mul = (a: Fraction, b: Fraction) => simplify(frac(a.n * b.n, a.d * b.d));
export const div = (a: Fraction, b: Fraction) => {
  if (b.n === 0) throw new Error("Cannot divide by zero");
  return simplify(frac(a.n * b.d, a.d * b.n));
};

/** Display form, e.g. "3/4", "-2/3", "5". Not simplified unless you simplify first. */
export function show(f: Fraction): string {
  return f.d === 1 ? String(f.n) : `${f.n}/${f.d}`;
}

/** Mixed-number display, e.g. 7/4 → "1 3/4". */
export function showMixed(f: Fraction): string {
  const s = simplify(f);
  if (Math.abs(s.n) < s.d || s.d === 1) return show(s);
  const whole = Math.trunc(s.n / s.d);
  const rest = Math.abs(s.n % s.d);
  return rest === 0 ? String(whole) : `${whole} ${rest}/${s.d}`;
}

export type ParseResult =
  | { ok: true; value: Fraction; form: "integer" | "fraction" | "mixed" | "decimal" }
  | { ok: false; reason: string };

/**
 * Parse what a student typed. Accepts:
 *  - integers: "5", "-3"
 *  - fractions: "3/4", "-3/4", "3 / 4", "3÷4"
 *  - mixed numbers: "1 1/2", "-2 3/4"
 *  - decimals: "0.75", ".5", "-1.25"
 * Also tolerates "£", commas in thousands and surrounding spaces.
 */
export function parseAnswer(raw: string): ParseResult {
  const s = raw
    .trim()
    // Units are welcome but not needed: "24 cm²", "24cm2", "24 square metres", "24 units".
    .replace(/\s*(square\s+|sq\.?\s*)?(millimet(re|er)s?|centimet(re|er)s?|kilomet(re|er)s?|met(re|er)s?|mm|cm|km|m|units?)\s*(²|\^?2|squared)?\.?$/i, "")
    // "35%" and "35 %" mean 35 when a percentage is asked for.
    .replace(/\s*%$/, "")
    .replace(/[£,]/g, "")
    .replace(/[−–]/g, "-") // unicode minus and en dash
    .replace(/÷/g, "/")
    .replace(/\s*\/\s*/g, "/")
    .replace(/\s+/g, " ");

  if (s === "") return { ok: false, reason: "empty" };

  let m = /^(-?)(\d+)$/.exec(s);
  if (m) return { ok: true, value: frac(Number(m[1] + m[2])), form: "integer" };

  m = /^(-?)(\d+)\/(\d+)$/.exec(s);
  if (m) {
    const d = Number(m[3]);
    if (d === 0) return { ok: false, reason: "zero-denominator" };
    return { ok: true, value: frac(Number(m[1] + m[2]), d), form: "fraction" };
  }

  m = /^(-?)(\d+) (\d+)\/(\d+)$/.exec(s);
  if (m) {
    const whole = Number(m[2]);
    const n = Number(m[3]);
    const d = Number(m[4]);
    if (d === 0) return { ok: false, reason: "zero-denominator" };
    const sign = m[1] === "-" ? -1 : 1;
    return { ok: true, value: frac(sign * (whole * d + n), d), form: "mixed" };
  }

  m = /^(-?)(\d*)\.(\d+)$/.exec(s);
  if (m) {
    const digits = m[3];
    const d = 10 ** digits.length;
    const n = Number((m[2] || "0") + digits);
    return { ok: true, value: simplify(frac(m[1] === "-" ? -n : n, d)), form: "decimal" };
  }

  return { ok: false, reason: "unrecognised" };
}

/** A fraction as a decimal, like 7/20 → "0.35", when it ends within 12 places; otherwise as a fraction. */
export function showDecimal(f: Fraction): string {
  const s = simplify(f);
  for (let k = 0; k <= 12; k++) {
    if ((10 ** k) % s.d !== 0) continue;
    const units = Math.round((Math.abs(s.n) * 10 ** k) / s.d);
    const sign = s.n < 0 ? "-" : "";
    if (k === 0) return sign + String(units);
    const str = String(units).padStart(k + 1, "0");
    return `${sign}${str.slice(0, -k)}.${str.slice(-k)}`;
  }
  return show(s);
}
