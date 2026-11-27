/**
 * Answers to equations, inequalities and formulae:
 *
 * - "inequality": x < 4, x ≥ −2, −2 < x ≤ 3 (any equivalent way round, like 4 > x).
 * - "roots": the solutions of a quadratic, like "x = 2 or x = −5" (any order).
 * - "assignment": simultaneous equations, like "x = 3, y = −2".
 * - "formula": a rearranged formula, like x = (y − c)/m. Compared by working
 *   out both sides at several values, so every correct form is accepted.
 *
 * Each marker explains a near miss in words (the wrong way round, the circle
 * filled when it should be open, one solution missing) rather than just "wrong".
 */

import { equals, frac, parseAnswer, show, type Fraction } from "./fraction";
import type { Bound, Interval, MarkResult, Misconception, Question } from "./types";

type Mcs = Record<string, Misconception>;

function wrong(mcId: string | undefined, mcs: Mcs, lead = ""): MarkResult {
  const mc = mcId ? mcs[mcId] : undefined;
  const body = mc ? mc.explanation : "Not quite. Look at the hint, or check each step.";
  return { outcome: "incorrect", correct: false, misconception: mc?.id, feedback: lead ? `${lead} ${body}` : body };
}

/** Show a number for feedback: true minus, fractions as a/b. */
export function showNum(f: Fraction): string {
  return show(f).replace(/^-/, "−");
}

function readNumber(raw: string): Fraction | null {
  const r = parseAnswer(raw.replace(/[−–]/g, "-").replace(/-\s+/, "-"));
  return r.ok ? r.value : null;
}

// ------------------------------------------------------------ inequalities


type Op = "<" | ">" | "≤" | "≥";

function normaliseOps(s: string): string {
  return s
    .replace(/<=|=</g, "≤")
    .replace(/>=|=>/g, "≥")
    .replace(/[−–]/g, "-");
}

/** Read "x < 4", "4 > x", "x>=-2", "-2 < x ≤ 3". The letter must be `variable`. */
export function parseInequality(raw: string, variable: string): Interval | "no-letter" | "equals" | null {
  const s = normaliseOps(raw.trim().toLowerCase());
  const parts = s.split(/\s*(≤|≥|<|>)\s*/).map((p) => p.trim());
  if (parts.length === 1) {
    if (/^[a-z]\s*=/.test(s) || /=\s*[a-z]$/.test(s)) return "equals";
    return readNumber(s) ? "no-letter" : null;
  }
  if (parts.length !== 3 && parts.length !== 5) return null;
  const v = variable.toLowerCase();
  const out: Interval = {};
  const apply = (side: "var-left" | "var-right", op: Op, num: Fraction) => {
    // Normalise to "variable op number".
    const flip: Record<Op, Op> = { "<": ">", ">": "<", "≤": "≥", "≥": "≤" };
    const o = side === "var-left" ? op : flip[op];
    const b = { value: num, inclusive: o === "≤" || o === "≥" };
    if (o === "<" || o === "≤") {
      if (out.upper) return false;
      out.upper = b;
    } else {
      if (out.lower) return false;
      out.lower = b;
    }
    return true;
  };
  if (parts.length === 3) {
    const [a, op, b] = parts as [string, Op, string];
    if (a === v) {
      const n = readNumber(b);
      return n && apply("var-left", op, n) ? out : null;
    }
    if (b === v) {
      const n = readNumber(a);
      return n && apply("var-right", op, n) ? out : null;
    }
    return null;
  }
  const [a, op1, mid, op2, b] = parts as [string, Op, string, Op, string];
  if (mid !== v) return null;
  const na = readNumber(a);
  const nb = readNumber(b);
  if (!na || !nb) return null;
  if (!apply("var-right", op1, na) || !apply("var-left", op2, nb)) return null;
  return out;
}

const sameBound = (x?: Bound, y?: Bound) => (!x && !y) || (!!x && !!y && equals(x.value, y.value) && x.inclusive === y.inclusive);

/** Write an interval the usual way: "x < 4", "x ≥ −2", "−2 < x ≤ 3". */
export function showInterval(i: Interval, v: string): string {
  if (i.lower && i.upper) return `${showNum(i.lower.value)} ${i.lower.inclusive ? "≤" : "<"} ${v} ${i.upper.inclusive ? "≤" : "<"} ${showNum(i.upper.value)}`;
  if (i.lower) return `${v} ${i.lower.inclusive ? "≥" : ">"} ${showNum(i.lower.value)}`;
  if (i.upper) return `${v} ${i.upper.inclusive ? "≤" : "<"} ${showNum(i.upper.value)}`;
  return "";
}

export function markInequality(
  q: Question,
  a: Extract<Question["answer"], { kind: "inequality" }>,
  raw: string,
  mcs: Mcs,
): MarkResult {
  const want = a.value;
  const got = parseInequality(raw, a.variable);
  const example = showInterval(want, a.variable).replace(/[\d/]+/g, "4").replace(/−4/g, "−2");
  if (got === "no-letter" || got === "equals") {
    const n = readNumber(raw.replace(/^[a-z]\s*=\s*|\s*=\s*[a-z]$/i, ""));
    const boundary = [want.lower, want.upper].some((b) => b && n && equals(b.value, n));
    if (got === "equals" && boundary && a.equalsMisconception) {
      return wrong(a.equalsMisconception, mcs, `${showNum(n!)} is the boundary, but the answer is an inequality, not one value.`);
    }
    return {
      outcome: "unreadable",
      correct: false,
      feedback: `Write an inequality using the letter ${a.variable} and a sign like <, >, ≤ or ≥, for example ${example}. Type <= for ≤ and >= for ≥.`,
    };
  }
  if (!got) {
    return {
      outcome: "unreadable",
      correct: false,
      feedback: `I couldn't read that. Write it like ${example}, using the letter ${a.variable}. Type <= for ≤ and >= for ≥.`,
    };
  }
  if (sameBound(got.lower, want.lower) && sameBound(got.upper, want.upper)) return { outcome: "correct", correct: true, feedback: "Correct." };

  const vals = (i: Interval) => [i.lower?.value, i.upper?.value];
  const sameNumbers = (x: Interval, y: Interval) => {
    const [xl, xu] = vals(x);
    const [yl, yu] = vals(y);
    return !!xl === !!yl && !!xu === !!yu && (!xl || equals(xl, yl!)) && (!xu || equals(xu, yu!));
  };
  // Same number(s), wrong ≤/<: the circle question.
  if (sameNumbers(got, want)) return wrong(a.inclusiveMisconception, mcs, "Right number, but check whether it should be < or ≤.");
  // Pointing the wrong way: x > 4 for x < 4.
  const flipped: Interval = { lower: want.upper, upper: want.lower };
  if (sameNumbers(got, flipped) && !(want.lower && want.upper)) return wrong(a.directionMisconception, mcs, "Right number, but the sign points the wrong way.");
  // A predicted wrong boundary value.
  const b = got.lower ?? got.upper;
  if (b && !(got.lower && got.upper)) {
    const mc = q.wrongAnswers.find((w) => !Array.isArray(w.value) && equals(typeof w.value === "number" ? frac(w.value) : w.value, b.value))?.misconception;
    if (mc) return wrong(mc, mcs);
  }
  return wrong(undefined, mcs);
}

// ------------------------------------------------------------ several values

/** Split "x = 2 or x = −5", "2, -5", "x=2 and -5" into numbers. Null if any part can't be read. */
export function parseValues(raw: string): Fraction[] | null {
  const s = raw
    .trim()
    .toLowerCase()
    .replace(/[−–]/g, "-")
    .replace(/[a-z]\s*=\s*/g, " ")
    .replace(/\b(or|and)\b/g, ",")
    .replace(/[;&]/g, ",");
  const parts = s
    .split(/\s*,\s*|\s{2,}|\s+(?=-?\d)/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return null;
  const out: Fraction[] = [];
  for (const p of parts) {
    const n = readNumber(p);
    if (!n) return null;
    out.push(n);
  }
  return out;
}

const uniq = (xs: Fraction[]) => xs.filter((x, i) => xs.findIndex((y) => equals(x, y)) === i);
const sameSet = (x: Fraction[], y: Fraction[]) => {
  const a = uniq(x);
  const b = uniq(y);
  return a.length === b.length && a.every((v) => b.some((w) => equals(v, w)));
};

export function markRoots(q: Question, a: Extract<Question["answer"], { kind: "roots" }>, raw: string, mcs: Mcs): MarkResult {
  const got = parseValues(raw);
  if (!got) {
    return {
      outcome: "unreadable",
      correct: false,
      feedback: `I couldn't read that. Write each solution, like ${a.variable} = 3 or ${a.variable} = −2. Type a minus sign with the - key.`,
    };
  }
  const want = a.values.map((n) => frac(n));
  if (sameSet(got, want)) return { outcome: "correct", correct: true, feedback: "Correct." };
  const predicted = q.wrongAnswers.find((w) => Array.isArray(w.value) && sameSet(got, w.value.map((n) => frac(n))))?.misconception;
  if (predicted) return wrong(predicted, mcs);
  const g = uniq(got);
  if (g.every((v) => want.some((w) => equals(v, w)))) {
    return wrong(a.missingMisconception, mcs, `${g.map(showNum).join(" and ")} ${g.length === 1 ? "is" : "are"} right, but there ${want.length - g.length === 1 ? "is another solution" : "are more solutions"}.`);
  }
  return wrong(undefined, mcs);
}

/** Read "x = 3, y = −2" (any order, any separator). Null if a letter is missing or repeated. */
export function parseAssignment(raw: string, vars: string[]): Record<string, Fraction> | "no-letters" | null {
  const s = raw.trim().toLowerCase().replace(/[−–]/g, "-");
  const out: Record<string, Fraction> = {};
  const re = /([a-z])\s*=\s*(-?\s*\d+(?:\.\d+)?(?:\s*\/\s*\d+)?)/g;
  let found = 0;
  for (const m of s.matchAll(re)) {
    const n = readNumber(m[2].replace(/\s+/g, ""));
    if (!n || out[m[1]] || !vars.includes(m[1])) return null;
    out[m[1]] = n;
    found++;
  }
  if (found === 0) return parseValues(s) ? "no-letters" : null;
  // Anything left over that isn't a separator means we misread it.
  const rest = s.replace(re, "").replace(/\band\b/g, "").replace(/[\s,;&]/g, "");
  if (rest !== "") return null;
  return out;
}

export function markAssignment(q: Question, a: Extract<Question["answer"], { kind: "assignment" }>, raw: string, mcs: Mcs): MarkResult {
  const vars = Object.keys(a.values).sort();
  const example = vars.map((v, i) => `${v} = ${i === 0 ? 3 : "−2"}`).join(", ");
  const got = parseAssignment(raw, vars);
  if (got === "no-letters") {
    return { outcome: "unreadable", correct: false, feedback: `Say which number is which, like ${example}.` };
  }
  if (!got) return { outcome: "unreadable", correct: false, feedback: `I couldn't read that. Write both values, like ${example}.` };
  const missing = vars.filter((v) => !got[v]);
  if (missing.length > 0) {
    return { outcome: "unreadable", correct: false, feedback: `You also need ${missing.join(" and ")}. Write both values, like ${example}.` };
  }
  const right = vars.filter((v) => equals(got[v], frac(a.values[v])));
  if (right.length === vars.length) return { outcome: "correct", correct: true, feedback: "Correct." };
  const asList = vars.map((v) => got[v]);
  const predicted = q.wrongAnswers.find((w) => Array.isArray(w.value) && w.value.every((n, i) => equals(frac(n), asList[i])))?.misconception;
  if (predicted) return wrong(predicted, mcs);
  if (right.length > 0) {
    const ok = right[0];
    const bad = vars.find((v) => v !== ok)!;
    return wrong(undefined, mcs, `${ok} = ${showNum(got[ok])} is right. Substitute it back into one of the equations to find ${bad} again.`);
  }
  return wrong(undefined, mcs);
}

// ------------------------------------------------------------ formulae

type Node =
  | { t: "num"; v: number }
  | { t: "var"; name: string }
  | { t: "neg"; a: Node }
  | { t: "bin"; op: "+" | "-" | "*" | "/" | "^"; a: Node; b: Node }
  | { t: "sqrt"; a: Node };

function normaliseFormula(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[−–—]/g, "-")
    .replace(/[×*·⋅]/g, "*")
    .replace(/÷/g, "/")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/π|\bpi\b/g, "π")
    .replace(/sqrt|√/g, "√")
    .replace(/\s+/g, "");
}

/** Parse a formula's right-hand side. Letters are single characters; π is a number. */
export function parseFormula(raw: string): Node | null {
  const s = normaliseFormula(raw);
  if (s === "" || s.length > 120) return null;
  let i = 0;
  const peek = () => s[i];

  function atom(): Node {
    const c = peek();
    if (c === undefined) throw new Error("end");
    if (/[\d.]/.test(c)) {
      const m = /^\d*\.?\d+/.exec(s.slice(i));
      if (!m) throw new Error("num");
      i += m[0].length;
      return { t: "num", v: Number(m[0]) };
    }
    if (c === "π") {
      i++;
      return { t: "num", v: Math.PI };
    }
    if (/[a-z]/.test(c)) {
      i++;
      return { t: "var", name: c };
    }
    if (c === "(") {
      i++;
      const e = sum();
      if (peek() !== ")") throw new Error(")");
      i++;
      return e;
    }
    if (c === "√") {
      i++;
      return { t: "sqrt", a: power() };
    }
    throw new Error("bad");
  }
  function power(): Node {
    const base = atom();
    if (peek() === "^") {
      i++;
      const neg = peek() === "-";
      if (neg) i++;
      const e = atom();
      return { t: "bin", op: "^", a: base, b: neg ? { t: "neg", a: e } : e };
    }
    return base;
  }
  function product(): Node {
    let left: Node = unary();
    for (;;) {
      const c = peek();
      if (c === "*" || c === "/") {
        i++;
        left = { t: "bin", op: c, a: left, b: unary() };
      } else if (c !== undefined && /[\d.a-zπ(√]/.test(c)) {
        left = { t: "bin", op: "*", a: left, b: power() };
      } else return left;
    }
  }
  function unary(): Node {
    if (peek() === "-") {
      i++;
      return { t: "neg", a: unary() };
    }
    if (peek() === "+") {
      i++;
      return unary();
    }
    return power();
  }
  function sum(): Node {
    let left = product();
    while (peek() === "+" || peek() === "-") {
      const op = peek() as "+" | "-";
      i++;
      left = { t: "bin", op, a: left, b: product() };
    }
    return left;
  }
  try {
    const n = sum();
    return i === s.length ? n : null;
  } catch {
    return null;
  }
}

export function formulaLetters(n: Node, out = new Set<string>()): Set<string> {
  if (n.t === "var") out.add(n.name);
  else if (n.t === "neg" || n.t === "sqrt") formulaLetters(n.a, out);
  else if (n.t === "bin") {
    formulaLetters(n.a, out);
    formulaLetters(n.b, out);
  }
  return out;
}

export function evalFormula(n: Node, env: Record<string, number>): number {
  switch (n.t) {
    case "num":
      return n.v;
    case "var":
      return env[n.name] ?? NaN;
    case "neg":
      return -evalFormula(n.a, env);
    case "sqrt":
      return Math.sqrt(evalFormula(n.a, env));
    case "bin": {
      const a = evalFormula(n.a, env);
      const b = evalFormula(n.b, env);
      return n.op === "+" ? a + b : n.op === "-" ? a - b : n.op === "*" ? a * b : n.op === "/" ? a / b : a ** b;
    }
  }
}

/** Values to test with: positive, not whole, different for each letter. */
function testEnvs(letters: string[]): Record<string, number>[] {
  return Array.from({ length: 6 }, (_, k) => Object.fromEntries(letters.map((v, j) => [v, 1.37 + ((k * 7 + j * 5 + v.charCodeAt(0)) % 13) * 0.61 + k * 0.29])));
}

/** True if two formula right-hand sides are equal for every value of their letters (checked at 6 points). */
export function sameFormula(a: Node, b: Node): boolean {
  const letters = [...new Set([...formulaLetters(a), ...formulaLetters(b)])].sort();
  for (const env of testEnvs(letters)) {
    const x = evalFormula(a, env);
    const y = evalFormula(b, env);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
    if (Math.abs(x - y) > 1e-9 * Math.max(1, Math.abs(x), Math.abs(y))) return false;
  }
  return true;
}

/** Strip "x =" from the front (or "= x" from the end). Returns the other side, or why it can't. */
function formulaSide(raw: string, subject: string): { rhs: string } | { problem: "other-subject"; letter: string } {
  const s = raw.trim();
  const front = /^\s*([a-zA-Z])\s*=(.*)$/.exec(s);
  if (front) return front[1].toLowerCase() === subject ? { rhs: front[2] } : { problem: "other-subject", letter: front[1] };
  const back = /^(.*)=\s*([a-zA-Z])\s*$/.exec(s);
  if (back) return back[2].toLowerCase() === subject ? { rhs: back[1] } : { problem: "other-subject", letter: back[2] };
  return { rhs: s };
}

export function markFormula(q: Question, a: Extract<Question["answer"], { kind: "formula" }>, raw: string, mcs: Mcs): MarkResult {
  const side = formulaSide(raw, a.subject);
  if ("problem" in side) {
    return { outcome: "unreadable", correct: false, feedback: `The question asks for ${a.subject} on its own. Start your answer with ${a.subject} =` };
  }
  const got = parseFormula(side.rhs);
  if (!got) {
    return {
      outcome: "unreadable",
      correct: false,
      feedback: "I couldn't read that. Use / for dividing and brackets where you need them, like (y − 3)/2. For a square root, type sqrt(A).",
    };
  }
  if (formulaLetters(got).has(a.subject)) {
    return { outcome: "incorrect", correct: false, feedback: `${a.subject} is still on both sides. The subject must be on its own, with no ${a.subject} on the other side.` };
  }
  const want = parseFormula(a.value);
  if (!want) throw new Error(`Bad formula answer: ${a.value}`);
  if (sameFormula(got, want)) return { outcome: "correct", correct: true, feedback: "Correct." };
  const mc = q.wrongExpressions?.find((w) => {
    const p = parseFormula(w.value);
    return p && sameFormula(p, got);
  })?.misconception;
  return wrong(mc, mcs);
}
