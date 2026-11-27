/**
 * Marking: compares a student's typed answer with the question's answer
 * mathematically, and matches predictable wrong answers to misconceptions.
 */

import { equals, gcd, isSimplest, parseAnswer, show, showDecimal, showMixed, simplify, frac, type Fraction } from "./fraction";
import { parseExpression, polyEquals, untidyReason, UNTIDY_FEEDBACK } from "./algebra";
import { markStandardForm, showStandardForm } from "./standard-form";
import { factorsOf, fullForm, indexForm, isPrime, parseList, parseProduct } from "./primes";
import type { MarkResult, Misconception, Question } from "./types";

/** The correct answer as text, for showing after an attempt. */
export function answerText(q: Question): string {
  if (q.answerText) return q.answerText;
  const a = q.answer;
  if (a.kind === "fraction") return a.form === "mixed" ? showMixed(a.value) : a.form === "decimal" ? showDecimal(a.value) : show(a.value);
  if (a.kind === "integer") return String(a.value);
  if (a.kind === "expression") return a.value;
  if (a.kind === "decimal") return roundTo(a.exact, a.dp);
  if (a.kind === "ratio") return a.value.join(":");
  if (a.kind === "standard-form") return showStandardForm(a.mantissa, a.power);
  if (a.kind === "list") return [...a.value].sort((x, y) => x - y).join(", ");
  if (a.kind === "product") return a.index ? indexForm(a.value) : fullForm(a.value);
  return a.options[a.correctIndex] ?? "";
}

export function markAnswer(
  q: Question,
  raw: string,
  misconceptions: Record<string, Misconception>,
): MarkResult {
  const a = q.answer;

  if (a.kind === "choice") {
    // The app sends the option's text (so the record is readable); an index also works.
    const byText = a.options.findIndex((o) => o.toLowerCase() === raw.trim().toLowerCase());
    const idx = byText >= 0 ? byText : Number(raw);
    if (!Number.isInteger(idx) || idx < 0 || idx >= a.options.length) {
      return { outcome: "unreadable", correct: false, feedback: "Choose one of the options." };
    }
    if (idx === a.correctIndex) return { outcome: "correct", correct: true, feedback: "Correct." };
    const mc = q.wrongAnswers.find((w) => w.value === idx)?.misconception;
    return wrong(mc, misconceptions);
  }

  if (a.kind === "expression") {
    const got = parseExpression(raw);
    if (!got.ok) {
      return {
        outcome: "unreadable",
        correct: false,
        feedback: "I couldn't read that. Type an expression like 3x + 2. For squared, type x^2 or x².",
      };
    }
    const want = parseExpression(a.value);
    if (!want.ok) throw new Error(`Bad expression answer: ${a.value}`);
    if (polyEquals(got.poly, want.poly)) {
      const why = untidyReason(got.ast, a.form);
      if (why) return { outcome: "not-simplified", correct: false, feedback: `${UNTIDY_FEEDBACK[why]} The answer is ${a.value}.` };
      return { outcome: "correct", correct: true, feedback: "Correct." };
    }
    const mc = q.wrongExpressions?.find((w) => {
      const p = parseExpression(w.value);
      return p.ok && polyEquals(p.poly, got.poly);
    })?.misconception;
    return wrong(mc, misconceptions);
  }

  if (a.kind === "standard-form") return markStandardForm(q, a.mantissa, a.power, raw, misconceptions);
  if (a.kind === "ratio") return markRatio(q, a.value, a.requireSimplest, raw, misconceptions);
  if (a.kind === "list") return markList(q, a, raw, misconceptions);
  if (a.kind === "product") return markProduct(q, a, raw, misconceptions);

  // "x = 4" is a fine way to give a number answer to an equation.
  const parsed = parseAnswer(a.kind === "integer" ? raw.replace(/^\s*[a-zA-Z]\s*=\s*/, "") : raw);
  if (!parsed.ok) {
    return {
      outcome: "unreadable",
      correct: false,
      feedback:
        parsed.reason === "zero-denominator"
          ? "A fraction can't have 0 on the bottom. Check your answer."
          : "I couldn't read that. Type a whole number like 12, a fraction like 3/4, or a mixed number like 1 1/2.",
    };
  }
  const v = parsed.value;

  if (a.kind === "decimal") {
    const x = v.n / v.d;
    const tol = decimalTolerance(a.exact, a.dp);
    if (Math.abs(x - a.exact) <= tol) {
      const typedDp = /\.(\d+)/.exec(raw)?.[1].length ?? 0;
      const rounded = roundTo(a.exact, a.dp);
      return {
        outcome: "correct",
        correct: true,
        feedback:
          typedDp > a.dp
            ? `Correct. The question asks for ${a.dp} decimal place${a.dp === 1 ? "" : "s"}, so write it as ${rounded}.`
            : "Correct.",
      };
    }
    for (const w of q.wrongAnswers) {
      if (Array.isArray(w.value)) continue;
      const t = typeof w.value === "number" ? w.value : w.value.n / w.value.d;
      if (Math.abs(x - t) <= decimalTolerance(t, a.dp)) return wrong(w.misconception, misconceptions);
    }
    return wrong(undefined, misconceptions);
  }

  if (a.kind === "integer") {
    if (equals(v, frac(a.value))) return { outcome: "correct", correct: true, feedback: "Correct." };
    return wrong(matchWrong(q, v), misconceptions);
  }

  // fraction answer
  if (equals(v, a.value)) {
    if (a.form === "mixed" && a.value.d !== 1 && Math.abs(a.value.n) > a.value.d && parsed.form !== "mixed") {
      return {
        outcome: "not-simplified",
        correct: false,
        feedback: `That's the right amount. Now write it as a mixed number: a whole number and a fraction, like ${showMixed(a.value)}.`,
      };
    }
    if (a.form === "improper" && parsed.form !== "fraction") {
      return {
        outcome: "not-simplified",
        correct: false,
        feedback: `That's the right amount. Now write it as an improper (top-heavy) fraction, like ${show(a.value)}.`,
      };
    }
    // Decimals and integers are already exact; only typed fractions can be unsimplified.
    if (a.requireSimplest && (parsed.form === "fraction" || parsed.form === "mixed") && !isSimplest(v)) {
      return {
        outcome: "not-simplified",
        correct: false,
        feedback: parsed.form === "mixed"
          ? `That's the right amount, but the fraction part can be simplified. ${raw.trim()} = ${showMixed(v)}.`
          : `That's the right amount, but it can be simplified. ${show(v)} = ${show(simplify(v))}.`,
      };
    }
    return { outcome: "correct", correct: true, feedback: "Correct." };
  }
  return wrong(matchWrong(q, v), misconceptions);
}

function matchWrong(q: Question, v: ReturnType<typeof frac>) {
  for (const w of q.wrongAnswers) {
    if (Array.isArray(w.value)) continue;
    const target = typeof w.value === "number" ? frac(w.value) : w.value;
    if (equals(v, target)) return w.misconception;
  }
  return undefined;
}

function wrong(mcId: string | undefined, misconceptions: Record<string, Misconception>): MarkResult {
  const mc = mcId ? misconceptions[mcId] : undefined;
  return {
    outcome: "incorrect",
    correct: false,
    misconception: mc?.id,
    feedback: mc ? mc.explanation : "Not quite. Look at the hint, or check each step.",
  };
}

/** Round to dp decimal places and show it, e.g. roundTo(31.4159, 1) = "31.4". */
export function roundTo(x: number, dp: number): string {
  return (Math.round(x * 10 ** dp) / 10 ** dp).toFixed(dp);
}

/**
 * How far from the exact value a rounded answer may be: half a unit in the last
 * place (rounding), plus 0.06% for using 3.14 instead of π.
 */
export function decimalTolerance(exact: number, dp: number): number {
  return 0.5 * 10 ** -dp + Math.abs(exact) * 0.0006 + 1e-9;
}

/**
 * Read a typed ratio: "3:2", "3 : 2", "3 to 2", "2:3:5". Each part may be a
 * whole number, decimal or fraction, and units are ignored ("50 cm : 2 m" is
 * not unit-converted here; questions ask for numbers only).
 */
export function parseRatio(raw: string): Fraction[] | null {
  const parts = raw
    .trim()
    .replace(/\s+to\s+/gi, ":")
    .replace(/[;∶]/g, ":")
    .split(":");
  if (parts.length < 2) return null;
  const out: Fraction[] = [];
  for (const p of parts) {
    const r = parseAnswer(p);
    if (!r.ok || r.value.n <= 0) return null;
    out.push(r.value);
  }
  return out;
}

/** True when two ratios have the same number of parts and are equivalent (a:b = ka:kb). */
export function sameRatio(x: Fraction[], y: Fraction[]): boolean {
  if (x.length !== y.length) return false;
  // x_i / y_i must be the same for every part.
  const k = (i: number) => frac(x[i].n * y[i].d, x[i].d * y[i].n);
  const k0 = k(0);
  return x.every((_, i) => equals(k(i), k0));
}

function markRatio(
  q: Question,
  value: number[],
  requireSimplest: boolean,
  raw: string,
  misconceptions: Record<string, Misconception>,
): MarkResult {
  const typed = parseRatio(raw);
  if (!typed) {
    return {
      outcome: "unreadable",
      correct: false,
      feedback: `Type your answer as a ratio with a colon between the numbers, like ${value.length === 3 ? "2:3:5" : "3:2"}.`,
    };
  }
  const target = value.map((n) => frac(n));
  if (sameRatio(typed, target)) {
    const whole = typed.every((f) => f.d === 1);
    const simplest = whole && typed.reduce((g, f) => gcd(g, f.n), 0) === 1;
    if (requireSimplest && !simplest) {
      const k = typed.reduce((g, f) => gcd(g, f.n), 0);
      return {
        outcome: "not-simplified",
        correct: false,
        feedback: whole
          ? `That's an equivalent ratio, but it can be simplified. Every part divides by ${k}: ${value.join(":")}.`
          : `That's an equivalent ratio, but the simplest form uses whole numbers: ${value.join(":")}.`,
      };
    }
    return { outcome: "correct", correct: true, feedback: "Correct." };
  }
  const mc = q.wrongAnswers.find((w) => Array.isArray(w.value) && sameRatio(typed, w.value.map((n) => frac(n))))?.misconception;
  return wrong(mc, misconceptions);
}

const sameSet = (x: number[], y: number[]) => {
  const a = new Set(x);
  const b = new Set(y);
  return a.size === b.size && [...a].every((v) => b.has(v));
};

const andList = (xs: number[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

function markList(
  q: Question,
  a: Extract<Question["answer"], { kind: "list" }>,
  raw: string,
  misconceptions: Record<string, Misconception>,
): MarkResult {
  const typed = parseList(raw);
  if (!typed) {
    return { outcome: "unreadable", correct: false, feedback: "Type whole numbers with commas between them, like 1, 2, 3, 6." };
  }
  if (sameSet(typed, a.value)) return { outcome: "correct", correct: true, feedback: "Correct." };
  // A predicted wrong list (e.g. multiples given instead of factors).
  const predicted = q.wrongAnswers.find((w) => Array.isArray(w.value) && sameSet(typed, w.value))?.misconception;
  if (predicted) return wrong(predicted, misconceptions);

  const want = new Set(a.value);
  const got = new Set(typed);
  const extra = [...got].filter((v) => !want.has(v)).sort((x, y) => x - y);
  const missing = [...want].filter((v) => !got.has(v));
  if (extra.length > 0) {
    const mc = a.extraMisconception ? misconceptions[a.extraMisconception] : undefined;
    const which = `${andList(extra)} ${extra.length === 1 ? "doesn't" : "don't"} belong in this list.`;
    return { outcome: "incorrect", correct: false, misconception: mc?.id, feedback: mc ? `${which} ${mc.explanation}` : `${which} Check each number again.` };
  }
  const mc = a.missingMisconception ? misconceptions[a.missingMisconception] : undefined;
  const found = `Everything you wrote is right, but there ${missing.length === 1 ? "is 1 more" : `are ${missing.length} more`} ${missing.length === 1 ? a.noun.replace(/s$/, "") : a.noun} to find.`;
  return { outcome: "incorrect", correct: false, misconception: mc?.id, feedback: mc ? `${found} ${mc.explanation}` : found };
}

function markProduct(
  q: Question,
  a: Extract<Question["answer"], { kind: "product" }>,
  raw: string,
  misconceptions: Record<string, Misconception>,
): MarkResult {
  const typed = parseProduct(raw);
  if (!typed) {
    return { outcome: "unreadable", correct: false, feedback: "Type the primes with × or x between them, like 2 × 2 × 3. For powers, type 2^2 or 2²." };
  }
  if (typed.value === a.value) {
    if (typed.factors.some((f) => f.base === 1)) {
      return { outcome: "not-simplified", correct: false, feedback: `1 isn't a prime number, so leave it out. The answer is ${answerText(q)}.` };
    }
    const notPrime = typed.factors.map((f) => f.base).filter((b) => !isPrime(b));
    if (notPrime.length > 0) {
      const b = notPrime[0];
      const split = factorsOf(b).find((k) => k > 1 && k < b)!;
      return {
        outcome: "not-simplified",
        correct: false,
        feedback: `That does multiply to ${a.value}, but ${b} isn't prime: ${b} = ${split} × ${b / split}. Keep splitting until every number is prime. The answer is ${answerText(q)}.`,
      };
    }
    if (a.index && !typed.usedIndex && typed.factors.length > new Set(typed.factors.map((f) => f.base)).size) {
      return { outcome: "not-simplified", correct: false, feedback: `Those are the right primes. The question asks for index form, so group repeated primes with a power: ${indexForm(a.value)}.` };
    }
    return { outcome: "correct", correct: true, feedback: "Correct." };
  }
  const mc = matchWrong(q, frac(typed.value));
  const check = `Your numbers multiply to ${typed.value}, not ${a.value}.`;
  const m = mc ? misconceptions[mc] : undefined;
  return { outcome: "incorrect", correct: false, misconception: m?.id, feedback: m ? `${check} ${m.explanation}` : `${check} Multiply your answer back out to check it.` };
}
