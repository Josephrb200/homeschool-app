/**
 * Whole-number helpers for factors, multiples and primes, plus the parsers
 * that read a typed list ("1, 2, 3, 6") or a typed product of primes
 * ("2 × 2 × 3", "2^2 x 3", "2²×3").
 */

export function isPrime(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) return false;
  for (let k = 2; k * k <= n; k++) if (n % k === 0) return false;
  return true;
}

/** Every factor of n, smallest first. */
export function factorsOf(n: number): number[] {
  const small: number[] = [];
  const big: number[] = [];
  for (let k = 1; k * k <= n; k++) {
    if (n % k === 0) {
      small.push(k);
      if (k * k !== n) big.unshift(n / k);
    }
  }
  return [...small, ...big];
}

/** Factor pairs of n, like [[1, 12], [2, 6], [3, 4]]. */
export function factorPairs(n: number): [number, number][] {
  const out: [number, number][] = [];
  for (let k = 1; k * k <= n; k++) if (n % k === 0) out.push([k, n / k]);
  return out;
}

/** Prime factors with repeats, smallest first: 60 → [2, 2, 3, 5]. */
export function primeFactors(n: number): number[] {
  const out: number[] = [];
  let m = n;
  for (let p = 2; p * p <= m; p++) {
    while (m % p === 0) {
      out.push(p);
      m /= p;
    }
  }
  if (m > 1) out.push(m);
  return out;
}

/** Prime → power: 60 → Map {2 → 2, 3 → 1, 5 → 1}. */
export function primePowers(n: number): Map<number, number> {
  const m = new Map<number, number>();
  for (const p of primeFactors(n)) m.set(p, (m.get(p) ?? 0) + 1);
  return m;
}

const SUP: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
export const sup = (k: number) => String(k).split("").map((c) => SUP[c]).join("");

/** Index form: 360 → "2³ × 3² × 5". */
export function indexForm(n: number): string {
  return [...primePowers(n)].map(([p, k]) => (k === 1 ? String(p) : `${p}${sup(k)}`)).join(" × ");
}

/** Written out in full: 360 → "2 × 2 × 2 × 3 × 3 × 5". */
export function fullForm(n: number): string {
  return primeFactors(n).join(" × ");
}

export function hcf(a: number, b: number): number {
  while (b) [a, b] = [b, a % b];
  return a;
}

export function lcmOf(a: number, b: number): number {
  return (a / hcf(a, b)) * b;
}

/**
 * Read a typed list of whole numbers. Separators can be commas, spaces,
 * semicolons or "and". Returns null if anything else is typed.
 */
export function parseList(raw: string): number[] | null {
  const s = raw
    .trim()
    .replace(/[{}[\]().]+$/g, "")
    .replace(/^[{}[\]()]+/g, "")
    .replace(/\band\b/gi, ",")
    .replace(/[;&]/g, ",")
    // Negative whole numbers are allowed (inequality questions list them): "−2", "- 2".
    .replace(/[−–-]\s*(?=\d)/g, "-");
  if (!s) return null;
  const parts = s.split(/[\s,]+/).filter(Boolean);
  if (parts.length === 0) return null;
  const out: number[] = [];
  for (const p of parts) {
    if (!/^-?\d+$/.test(p)) return null;
    out.push(Number(p));
  }
  return out;
}

const SUP_DIGIT: Record<string, string> = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9" };

export interface ParsedProduct {
  /** Each factor as typed, with its power: "2^3" → { base: 2, power: 3 }. */
  factors: { base: number; power: number }[];
  value: number;
  /** True if any power above 1 was used. */
  usedIndex: boolean;
}

/**
 * Read a typed product: factors joined by ×, x, X, * or · (spaces optional),
 * each a whole number with an optional power (^3 or ³). "60 = 2 × 2 × 3 × 5"
 * is fine too: anything before an "=" is ignored.
 */
export function parseProduct(raw: string): ParsedProduct | null {
  let s = raw.trim();
  if (s.includes("=")) s = s.slice(s.lastIndexOf("=") + 1);
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (m) => "^" + m.split("").map((c) => SUP_DIGIT[c]).join(""));
  const parts = s.split(/\s*[×xX*·]\s*/);
  if (parts.length === 0) return null;
  const factors: ParsedProduct["factors"] = [];
  for (const p of parts) {
    const m = /^(\d+)(?:\s*\^\s*(\d+))?$/.exec(p.trim());
    if (!m) return null;
    const base = Number(m[1]);
    const power = m[2] ? Number(m[2]) : 1;
    if (power < 1 || power > 20) return null;
    factors.push({ base, power });
  }
  const value = factors.reduce((v, f) => v * f.base ** f.power, 1);
  if (!Number.isSafeInteger(value)) return null;
  return { factors, value, usedIndex: factors.some((f) => f.power > 1) };
}
