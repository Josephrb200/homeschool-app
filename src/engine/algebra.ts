/**
 * Algebraic expressions: reads what a student types (like "3x + 2", "x²+5x",
 * "4(a + 2)") and compares it with the expected answer mathematically, so
 * "2 + 3x" and "3x + 2" are both right.
 *
 * It also checks how the answer is written, because early algebra is partly
 * about conventions: "5n" not "n × 5", "8x" not "3x + 5x". An answer with the
 * right value but untidy writing is marked "not simplified", with the reason.
 *
 * Supported: whole numbers, single-letter variables, + and −, multiplication
 * written as juxtaposition, ×, * or ·, powers (^2, ², ³), and brackets.
 * Division and decimals are not supported in typed expressions.
 */

/** Variable name → power, e.g. { x: 2, y: 1 } for x²y. */
type Monomial = Record<string, number>;
/** Canonical monomial key ("" for a constant, "x^2y") → coefficient. */
export type Poly = Map<string, number>;

type Factor =
  | { kind: "num"; value: number; pow: number }
  | { kind: "var"; name: string; pow: number }
  | { kind: "group"; sum: Sum; pow: number };
interface Product {
  factors: Factor[];
  explicitTimes: boolean;
}
interface Sum {
  terms: { sign: 1 | -1; product: Product }[];
}

export type Untidy =
  | "brackets"
  | "times-sign"
  | "number-after-letter"
  | "multiple-numbers"
  | "repeated-letter"
  | "one-coefficient"
  | "like-terms"
  | "not-factorised"
  | "not-fully-factorised";

export type ExprParse = { ok: true; poly: Poly; ast: Sum } | { ok: false };

function normalise(raw: string): string {
  return raw
    .trim()
    .replace(/^=\s*/, "")
    .replace(/[−–—]/g, "-")
    .replace(/[×*·⋅]/g, "*")
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (m) => `^${[...m].map((c) => "⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(c)).join("")}`)
    .replace(/\s+/g, "")
    .toLowerCase();
}

/** Parse an expression. Returns { ok: false } for anything it can't read. */
export function parseExpression(raw: string): ExprParse {
  const s = normalise(raw);
  if (s === "" || s.length > 120) return { ok: false };
  let i = 0;

  const peek = () => s[i];

  function parsePow(): number {
    if (peek() !== "^") return 1;
    i++;
    const m = /^\d+/.exec(s.slice(i));
    if (!m) throw new Error("bad power");
    i += m[0].length;
    const p = Number(m[0]);
    if (p < 1 || p > 99) throw new Error("bad power");
    return p;
  }

  function parseFactor(): Factor | null {
    const c = peek();
    if (c === undefined) return null;
    if (/\d/.test(c)) {
      const m = /^\d+/.exec(s.slice(i))!;
      i += m[0].length;
      return { kind: "num", value: Number(m[0]), pow: parsePow() };
    }
    if (/[a-z]/.test(c)) {
      i++;
      return { kind: "var", name: c, pow: parsePow() };
    }
    if (c === "(") {
      i++;
      const sum = parseSum();
      if (peek() !== ")") throw new Error("unclosed bracket");
      i++;
      return { kind: "group", sum, pow: parsePow() };
    }
    return null;
  }

  function parseProduct(): Product {
    const factors: Factor[] = [];
    let explicitTimes = false;
    for (;;) {
      if (factors.length > 0 && peek() === "*") {
        i++;
        explicitTimes = true;
        const f = parseFactor();
        if (!f) throw new Error("dangling ×");
        factors.push(f);
        continue;
      }
      const f = parseFactor();
      if (!f) break;
      factors.push(f);
    }
    if (factors.length === 0) throw new Error("empty term");
    return { factors, explicitTimes };
  }

  function parseSum(): Sum {
    const terms: Sum["terms"] = [];
    let sign: 1 | -1 = 1;
    if (peek() === "+" || peek() === "-") {
      sign = peek() === "-" ? -1 : 1;
      i++;
    }
    terms.push({ sign, product: parseProduct() });
    while (peek() === "+" || peek() === "-") {
      sign = peek() === "-" ? -1 : 1;
      i++;
      terms.push({ sign, product: parseProduct() });
    }
    return { terms };
  }

  try {
    const ast = parseSum();
    if (i !== s.length) return { ok: false };
    return { ok: true, ast, poly: sumPoly(ast) };
  } catch {
    return { ok: false };
  }
}

// ------------------------------------------------------------ polynomial maths

function key(m: Monomial): string {
  return Object.keys(m)
    .filter((v) => m[v] > 0)
    .sort()
    .map((v) => (m[v] === 1 ? v : `${v}^${m[v]}`))
    .join("");
}
function unkey(k: string): Monomial {
  const m: Monomial = {};
  for (const [, v, p] of k.matchAll(/([a-z])(?:\^(\d+))?/g)) m[v] = (m[v] ?? 0) + Number(p ?? 1);
  return m;
}
function clean(p: Poly): Poly {
  for (const [k, c] of p) if (c === 0) p.delete(k);
  return p;
}
function addInto(a: Poly, b: Poly, sign = 1) {
  for (const [k, c] of b) a.set(k, (a.get(k) ?? 0) + sign * c);
  return clean(a);
}
function mulPoly(a: Poly, b: Poly): Poly {
  const out: Poly = new Map();
  for (const [ka, ca] of a)
    for (const [kb, cb] of b) {
      const m = unkey(ka);
      for (const [v, p] of Object.entries(unkey(kb))) m[v] = (m[v] ?? 0) + p;
      const k = key(m);
      out.set(k, (out.get(k) ?? 0) + ca * cb);
    }
  return clean(out);
}
function powPoly(a: Poly, n: number): Poly {
  let out: Poly = new Map([["", 1]]);
  for (let j = 0; j < n; j++) out = mulPoly(out, a);
  return out;
}
function factorPoly(f: Factor): Poly {
  if (f.kind === "num") return clean(new Map([["", f.value ** f.pow]]));
  if (f.kind === "var") return new Map([[key({ [f.name]: f.pow }), 1]]);
  return powPoly(sumPoly(f.sum), f.pow);
}
function sumPoly(s: Sum): Poly {
  const out: Poly = new Map();
  for (const t of s.terms) {
    let p: Poly = new Map([["", 1]]);
    for (const f of t.product.factors) p = mulPoly(p, factorPoly(f));
    addInto(out, p, t.sign);
  }
  return out;
}

export function polyEquals(a: Poly, b: Poly): boolean {
  if (a.size !== b.size) return false;
  for (const [k, c] of a) if (b.get(k) !== c) return false;
  return true;
}

/** True if two typed expressions are mathematically the same. */
export function sameExpression(a: string, b: string): boolean {
  const pa = parseExpression(a);
  const pb = parseExpression(b);
  return pa.ok && pb.ok && polyEquals(pa.poly, pb.poly);
}

// ------------------------------------------------------------ how it's written

function productIssue(p: Product): Untidy | null {
  if (p.explicitTimes) return "times-sign";
  const nums = p.factors.filter((f) => f.kind === "num");
  if (nums.length > 1) return "multiple-numbers";
  if (nums.length === 1 && p.factors[0].kind !== "num") return "number-after-letter";
  const letters = p.factors.filter((f) => f.kind === "var").map((f) => (f as { name: string }).name);
  if (new Set(letters).size !== letters.length) return "repeated-letter";
  if (nums.length === 1 && p.factors.length > 1 && (nums[0] as { value: number }).value === 1 && nums[0].pow === 1) return "one-coefficient";
  return null;
}

function notationIssue(s: Sum): Untidy | null {
  for (const t of s.terms) {
    const issue = productIssue(t.product);
    if (issue) return issue;
    for (const f of t.product.factors) if (f.kind === "group") {
      const inner = notationIssue(f.sum);
      if (inner) return inner;
    }
  }
  return null;
}

const gcdInt = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcdInt(b, a % b));

/** What every term of a bracket has in common, e.g. 2x in (4x² + 6x). Null if nothing. */
export function commonFactor(p: Poly): string | null {
  const keys = [...p.keys()];
  if (keys.length < 2) return null;
  const g = [...p.values()].reduce((acc, c) => gcdInt(acc, c), 0);
  const monos = keys.map(unkey);
  const shared: Monomial = {};
  for (const v of Object.keys(monos[0])) {
    const least = Math.min(...monos.map((m) => m[v] ?? 0));
    if (least > 0) shared[v] = least;
  }
  const letters = key(shared);
  if (g <= 1 && letters === "") return null;
  return `${g > 1 ? g : ""}${letters.replace(/\^(\d+)/g, (_, d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(d)] ?? `^${d}`)}`;
}

/**
 * Why an expression isn't written in the expected form, or null if it is.
 * - "notation": algebra conventions only (no ×, number first, x² not xx, x not 1x). Brackets are fine.
 * - "simplified": conventions, no brackets, and like terms collected.
 * - "factorised": conventions, written as one product with brackets, and no
 *   bracket has a common factor left inside it.
 */
export function untidyReason(ast: Sum, form: "notation" | "simplified" | "factorised"): Untidy | null {
  const issue = notationIssue(ast);
  if (issue) return issue;
  if (form === "notation") return null;
  if (form === "factorised") {
    if (ast.terms.length !== 1) return "not-factorised";
    const groups = ast.terms[0].product.factors.filter((f) => f.kind === "group");
    if (groups.length === 0) return "not-factorised";
    for (const g of groups) if (g.kind === "group" && commonFactor(sumPoly(g.sum))) return "not-fully-factorised";
    return null;
  }
  if (ast.terms.some((t) => t.product.factors.some((f) => f.kind === "group"))) return "brackets";
  const seen = new Set<string>();
  for (const t of ast.terms) {
    const k = [...sumPoly({ terms: [{ sign: 1, product: t.product }] }).keys()][0] ?? "";
    if (seen.has(k)) return "like-terms";
    seen.add(k);
  }
  return null;
}

/** The common factor still inside a bracket (for "not fully factorised" feedback), e.g. "3" or "2x". */
export function leftoverFactor(ast: Sum): string | null {
  for (const t of ast.terms)
    for (const f of t.product.factors)
      if (f.kind === "group") {
        const c = commonFactor(sumPoly(f.sum));
        if (c) return c;
      }
  return null;
}

export const UNTIDY_FEEDBACK: Record<Untidy, string> = {
  brackets: "That's equal, but the brackets still need expanding. Multiply each term inside by the term outside.",
  "times-sign": "Right value. In algebra we leave out the × sign, so 5 × n is written 5n.",
  "number-after-letter": "Right value. In algebra the number goes first, so n5 is written 5n.",
  "multiple-numbers": "Right value, but multiply the numbers together into one number at the front.",
  "repeated-letter": "Right value. A letter times itself is written with a power: x × x = x².",
  "one-coefficient": "Right value. We don't write the 1: 1x is just x.",
  "like-terms": "That's equal, but it isn't fully simplified. Collect the like terms together.",
  "not-factorised": "That's equal, but it isn't factorised. Factorised means written as a product, with brackets.",
  "not-fully-factorised": "Good start, but it isn't fully factorised: the terms inside the bracket still have a common factor. Take that outside too.",
};
