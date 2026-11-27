/**
 * Question generators for "Expressions and brackets".
 *
 * Expression answers are marked mathematically (engine/algebra.ts): any order
 * is fine, and "factorised" answers must be one product with no common factor
 * left inside a bracket (a partly factorised answer gets "Nearly there" and is
 * told which factor is left). Negative numbers appear from tier 2 only, written
 * with a true minus sign.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher.
 */

import type { Rng } from "@/engine/random";
import type { Question } from "@/engine/types";
import { sup } from "@/engine/standard-form";
import { expr, term } from "../algebra/generators";

type Tier = 1 | 2;
type Gen = (r: Rng, tier: Tier) => Omit<Question, "id" | "skillId">;

const LETTERS = ["a", "c", "k", "m", "n", "p", "t", "w", "y"] as const;
const EXPR_HELP = "Type an expression like 3x + 2. Leave out the × sign. For powers, type x^2 or x².";
const FACT_HELP = "Type it with brackets, like 3(x + 2). For squared, type x^2 or x².";
const NUM_HELP = "Type a whole number like 12. For a negative number, type a minus sign first, like -4.";

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const signed = (n: number) => (n < 0 ? `−${-n}` : String(n));
/** A number after an operator: negatives go in brackets, "4 × (−2)". */
const par = (n: number) => (n < 0 ? `(−${-n})` : String(n));
/** A signed term on its own: "3x", "−x", "−4x". */
const sterm = (c: number, v: string) => (c === 1 ? v : c === -1 ? `−${v}` : `${signed(c)}${v}`);
/** "x + 3", "x − 4" for a bracket. */
const lin = (x: string, c: number, k = 1) => expr([[k, x], [c, ""]]);
const exprAnswer = (value: string, form: "notation" | "simplified" | "factorised" = "simplified") => ({ kind: "expression" as const, value, form });

/** Keep only wrong expressions that differ from each other (the test checks they differ from the answer). */
function distinct<T extends { value: string }>(xs: T[]): T[] {
  const seen = new Set<string>();
  return xs.filter((x) => (seen.has(x.value) ? false : (seen.add(x.value), true)));
}
function wrongNums(correct: number, wrong: { value: number; misconception: string }[]) {
  const seen = new Set<number>([correct]);
  return wrong.filter((w) => (!Number.isInteger(w.value) || seen.has(w.value) ? false : (seen.add(w.value), true)));
}
function shuffle<T>(r: Rng, xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = r.int(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ------------------------------------------------------------ vocabulary

const KINDS = ["Expression", "Equation", "Formula", "Identity"] as const;
type Kind = (typeof KINDS)[number];

/** Which misconception choosing `chosen` shows, when the answer is `right`. */
function vocabMistake(right: Kind, chosen: Kind): string {
  if (right === "Expression") return "voc-equation-for-expression";
  if (right === "Equation") return chosen === "Expression" ? "voc-expression-for-equation" : chosen === "Formula" ? "voc-formula-equation" : "voc-identity-equation";
  if (right === "Formula") return chosen === "Identity" ? "voc-identity-equation" : "voc-formula-equation";
  return "voc-identity-equation";
}

const FORMULAS = ["A = lw", "P = 2l + 2w", "v = u + at", "C = πd", "A = πr²", "s = d ÷ t", "F = ma", "V = lwh"];

function vocabExample(r: Rng, kind: Kind): string {
  const x = r.pick(LETTERS);
  const k = r.int(2, 9);
  const c = r.int(1, 9);
  if (kind === "Expression") return r.next() < 0.5 ? `${term(k, x)} + ${c}` : `${term(k, x)} − ${term(c, r.pick(["y", "w"].filter((v) => v !== x)))}`;
  if (kind === "Equation") {
    const s = r.int(1, 9);
    return `${term(k, x)} + ${c} = ${k * s + c}`;
  }
  if (kind === "Formula") return r.pick(FORMULAS);
  const which = r.int(0, 2);
  if (which === 0) return `${k}(${x} + ${c}) ≡ ${term(k, x)} + ${k * c}`;
  if (which === 1) return `${x}(${x} + ${c}) ≡ ${x}² + ${term(c, x)}`;
  return `${x} + ${x} + ${x} ≡ 3${x}`;
}

const vocabWhy: Record<Kind, string> = {
  Expression: "It has no = sign. It's just terms joined by + or −.",
  Equation: "It has an = sign, and it's true for just one value of the letter, which you could solve to find.",
  Formula: "It's a rule linking different quantities. Change one and the subject changes too.",
  Identity: "It uses ≡, which means both sides are identical for every value of the letter.",
};

const vocabulary: Gen = (r, tier) => {
  if (tier === 1) {
    const kind = r.pick(["classify", "classify", "terms"] as const);
    if (kind === "terms") {
      const [x, y] = ["x", "y"];
      const withNumber = r.next() < 0.6;
      const parts: [number, string][] = [
        [r.int(2, 9), x],
        [-r.int(2, 9), y],
      ];
      if (r.next() < 0.5) parts.push([r.int(2, 9), `${x}²`]);
      if (withNumber) parts.push([r.pick([-1, 1]) * r.int(1, 9), ""]);
      const e = expr(parts);
      const n = parts.length;
      return {
        prompt: `How many terms are in the expression ${e}?`,
        answer: { kind: "integer", value: n },
        wrongAnswers: wrongNums(n, [{ value: withNumber ? n - 1 : n + 1, misconception: "voc-term-count" }]),
        answerHelp: "Type a whole number like 3.",
        hints: ["Terms are separated by + and − signs.", `Count the parts between the signs in ${e}. A number on its own is a term too.`],
        solution: [`The terms of ${e} are: ${parts.map(([c, v], i) => (i === 0 ? term(Math.abs(c), v) : `${c < 0 ? "−" : "+"}${term(Math.abs(c), v)}`)).join(", ")}.`, `That's ${n} terms.`],
      };
    }
    const right = r.pick(KINDS);
    const shown = vocabExample(r, right);
    const options = [...KINDS];
    const correctIndex = options.indexOf(right);
    return {
      prompt: `Is this an expression, an equation, a formula or an identity? ${shown}`,
      answer: { kind: "choice", options, correctIndex },
      wrongAnswers: options.map((o, i) => ({ value: i, misconception: vocabMistake(right, o) })).filter((w) => w.value !== correctIndex),
      hints: ["Is there an = sign, or a ≡ sign, or neither?", "If there's an = sign: is it one unknown to find, or a rule linking different quantities?"],
      solution: [`${shown}`, vocabWhy[right], `It's ${right === "Expression" || right === "Equation" || right === "Identity" ? "an" : "a"} ${right.toLowerCase()}.`],
    };
  }

  const kind = r.pick(["always", "which", "subject"] as const);
  const x = r.pick(["x", "n", "a"]);
  if (kind === "always") {
    const k = r.int(2, 6);
    const a = r.int(1, 7);
    const options = [`Identity: true for every value of ${x}`, `Equation: true for only one value of ${x}`];
    if (r.next() < 0.5) {
      const m = r.int(1, 5);
      const statement = `${k}(${x} + ${a}) + ${term(m, x)} = ${term(k + m, x)} + ${k * a}`;
      return {
        prompt: `Is this statement an identity or an equation? ${statement}`,
        answer: { kind: "choice", options, correctIndex: 0 },
        wrongAnswers: [{ value: 1, misconception: "voc-identity-equation" }],
        hints: ["Expand the bracket and simplify the left-hand side.", "If both sides end up exactly the same, it's true for every value."],
        solution: [`Left side: ${k}(${x} + ${a}) + ${term(m, x)} = ${term(k, x)} + ${k * a} + ${term(m, x)} = ${term(k + m, x)} + ${k * a}`, "That's exactly the right side.", `So it's true for every value of ${x}: an identity. We could write ≡.`],
      };
    }
    // An equation with one whole-number solution s.
    let m = r.int(1, 5);
    if (m === k) m = k + 1;
    const s = r.int(1, 8);
    const n = k * (s + a) - m * s;
    if (n <= 0) {
      const statement = `${k}(${x} + ${a}) = ${term(k, x)} + ${k * a}`;
      return {
        prompt: `Is this statement an identity or an equation? ${statement}`,
        answer: { kind: "choice", options, correctIndex: 0 },
        wrongAnswers: [{ value: 1, misconception: "voc-identity-equation" }],
        hints: ["Expand the bracket on the left.", "Is the left side then exactly the same as the right side?"],
        solution: [`${k}(${x} + ${a}) = ${term(k, x)} + ${k * a}, exactly the right side.`, "It's true for every value: an identity."],
      };
    }
    const statement = `${k}(${x} + ${a}) = ${term(m, x)} + ${n}`;
    return {
      prompt: `Is this statement an identity or an equation? ${statement}`,
      answer: { kind: "choice", options, correctIndex: 1 },
      wrongAnswers: [{ value: 0, misconception: "voc-identity-equation" }],
      hints: ["Expand the bracket on the left.", `Is ${term(k, x)} + ${k * a} exactly the same as ${term(m, x)} + ${n}?`],
      solution: [
        `Left side: ${k}(${x} + ${a}) = ${term(k, x)} + ${k * a}.`,
        `That isn't the same as ${term(m, x)} + ${n}, so it isn't true for every ${x}.`,
        `It's only true when ${x} = ${s} (try it: both sides give ${k * (s + a)}). So it's an equation.`,
      ],
    };
  }
  if (kind === "which") {
    const target = r.pick(KINDS);
    const shown = KINDS.map((k) => vocabExample(r, k));
    const order = shuffle(r, [0, 1, 2, 3]);
    const options = order.map((i) => shown[i]);
    const correctIndex = order.indexOf(KINDS.indexOf(target));
    return {
      prompt: `Which one of these is ${target === "Expression" || target === "Equation" || target === "Identity" ? "an" : "a"} ${target.toLowerCase()}?`,
      answer: { kind: "choice", options, correctIndex },
      wrongAnswers: order.map((kindIdx, i) => ({ value: i, misconception: vocabMistake(KINDS[kindIdx], target) })).filter((w) => w.value !== correctIndex),
      hints: ["An expression has no = sign. An identity uses ≡.", "A formula links different quantities, like area, length and width. An equation has one value to find."],
      solution: [`${shown[KINDS.indexOf(target)]} is the ${target.toLowerCase()}.`, vocabWhy[target]],
    };
  }
  const f = r.pick(["v = u + at", "A = lw", "P = 2l + 2w", "F = ma", "V = lwh", "T = 5n + 20"]);
  const subject = f[0];
  const others = [...new Set(f.slice(4).replace(/[^a-z]/gi, "").split(""))];
  const options = [subject, ...others].slice(0, 4);
  return {
    prompt: `In the formula ${f}, which letter is the subject?`,
    answer: { kind: "choice", options, correctIndex: 0 },
    wrongAnswers: options.map((_, i) => ({ value: i, misconception: "voc-subject" })).slice(1),
    hints: ["The subject is the letter on its own on one side of the = sign.", "It's usually written on the left."],
    solution: [`In ${f}, ${subject} is on its own on the left.`, `So ${subject} is the subject: the formula tells you how to work out ${subject}.`],
  };
};

// ------------------------------------------------------------ factorising into one bracket

const factoriseSingle: Gen = (r, tier) => {
  const x = r.next() < 0.6 ? "x" : r.pick(LETTERS);
  if (tier === 1) {
    const h = r.pick([2, 3, 4, 5, 6]);
    let a = r.int(1, 5);
    let b = r.int(1, 7);
    while (gcd(a, b) !== 1) b = r.int(1, 7);
    if (a === b) a = 1;
    const minus = r.next() < 0.35;
    const sign = minus ? -1 : 1;
    const shown = expr([[h * a, x], [sign * h * b, ""]]);
    const answer = `${h}(${expr([[a, x], [sign * b, ""]])})`;
    const wrongs = distinct([
      { value: `${h}(${expr([[a, x], [sign * h * b, ""]])})`, misconception: "fac-divided-first-only" },
      ...(a > 1 && b > 1 ? [{ value: `${h}(${expr([[h * a - h, x], [sign * (h * b - h), ""]])})`, misconception: "fac-subtracted" }] : []),
      ...(b === 1 ? [{ value: term(h * a, x), misconception: "fac-left-nothing" }] : []),
    ]);
    return {
      prompt: `Factorise fully: ${shown}`,
      answer: exprAnswer(answer, "factorised"),
      wrongAnswers: [],
      wrongExpressions: wrongs,
      answerHelp: FACT_HELP,
      hints: [`Find the highest common factor of ${h * a} and ${h * b}.`, `It's ${h}. Divide each term by ${h} to see what goes inside the bracket.`],
      solution: [
        `The highest common factor of ${h * a} and ${h * b} is ${h}.`,
        `${term(h * a, x)} ÷ ${h} = ${term(a, x)} and ${h * b} ÷ ${h} = ${b}.`,
        `So ${shown} = ${answer}`,
        `Check by expanding: ${answer} = ${shown} ✓`,
      ],
    };
  }

  const kind = r.pick(["x-squared", "number-and-x", "two-letters", "three-terms"] as const);
  if (kind === "x-squared") {
    const k = r.int(2, 9);
    const minus = r.next() < 0.4;
    const shown = expr([[1, `${x}²`], [minus ? -k : k, x]]);
    const answer = `${x}(${lin(x, minus ? -k : k)})`;
    return {
      prompt: `Factorise fully: ${shown}`,
      answer: exprAnswer(answer, "factorised"),
      wrongAnswers: [],
      wrongExpressions: [{ value: `${x}(${expr([[1, `${x}²`], [minus ? -k : k, ""]])})`, misconception: "fac-power-kept" }],
      answerHelp: FACT_HELP,
      hints: [`Both terms have ${x} in them. ${x}² means ${x} × ${x}.`, `Take ${x} out: ${x}² ÷ ${x} = ${x}, and ${term(k, x)} ÷ ${x} = ${k}.`],
      solution: [`Both terms have a factor of ${x}.`, `${x}² ÷ ${x} = ${x} and ${term(k, x)} ÷ ${x} = ${k}.`, `So ${shown} = ${answer}`],
    };
  }
  if (kind === "number-and-x") {
    const h = r.pick([2, 3, 4, 5]);
    let a = r.int(1, 4);
    let b = r.int(2, 7);
    while (gcd(a, b) !== 1) b = r.int(2, 7);
    if (a === b) a = 1;
    const shown = expr([[h * a, `${x}²`], [h * b, x]]);
    const answer = `${term(h, x)}(${expr([[a, x], [b, ""]])})`;
    return {
      prompt: `Factorise fully: ${shown}`,
      answer: exprAnswer(answer, "factorised"),
      wrongAnswers: [],
      wrongExpressions: distinct([
        { value: `${term(h, x)}(${expr([[a, `${x}²`], [b, ""]])})`, misconception: "fac-power-kept" },
        { value: `${term(h, x)}(${expr([[a, x], [h * b, ""]])})`, misconception: "fac-divided-first-only" },
      ]),
      answerHelp: FACT_HELP,
      hints: [`Look for a common number AND a common letter. What's the HCF of ${h * a} and ${h * b}? Do both terms have ${x}?`, `The common factor is ${term(h, x)}. Divide each term by ${term(h, x)}.`],
      solution: [
        `The HCF of ${h * a} and ${h * b} is ${h}, and both terms have ${x}. So take out ${term(h, x)}.`,
        `${term(h * a, `${x}²`)} ÷ ${term(h, x)} = ${term(a, x)}, and ${term(h * b, x)} ÷ ${term(h, x)} = ${b}.`,
        `So ${shown} = ${answer}`,
      ],
    };
  }
  if (kind === "two-letters") {
    const h = r.pick([2, 3, 5]);
    const a = r.int(1, 4);
    let b = r.int(2, 7);
    while (gcd(a, b) !== 1) b = r.int(2, 7);
    const shown = expr([[h * a, "xy"], [h * b, "x"]]);
    const answer = `${term(h, "x")}(${expr([[a, "y"], [b, ""]])})`;
    return {
      prompt: `Factorise fully: ${shown}`,
      answer: exprAnswer(answer, "factorised"),
      wrongAnswers: [],
      wrongExpressions: distinct([{ value: `${term(h, "x")}(${expr([[a, "y"], [h * b, ""]])})`, misconception: "fac-divided-first-only" }]),
      answerHelp: FACT_HELP,
      hints: [`Both terms have a factor of ${h}, and both have x.`, `Take out ${term(h, "x")}. What's left from each term?`],
      solution: [`The common factor is ${term(h, "x")}.`, `${term(h * a, "xy")} ÷ ${term(h, "x")} = ${term(a, "y")}, and ${term(h * b, "x")} ÷ ${term(h, "x")} = ${b}.`, `So ${shown} = ${answer}`],
    };
  }
  const h = r.pick([2, 3, 4, 5]);
  const [a, b] = [r.int(1, 4), r.int(1, 4)];
  let c = r.int(1, 7);
  while (gcd(gcd(a, b), c) !== 1) c = r.int(1, 7);
  const shown = expr([[h * a, "x"], [h * b, "y"], [-h * c, ""]]);
  const answer = `${h}(${expr([[a, "x"], [b, "y"], [-c, ""]])})`;
  return {
    prompt: `Factorise fully: ${shown}`,
    answer: exprAnswer(answer, "factorised"),
    wrongAnswers: [],
    wrongExpressions: distinct([{ value: `${h}(${expr([[a, "x"], [h * b, "y"], [-h * c, ""]])})`, misconception: "fac-divided-first-only" }]),
    answerHelp: FACT_HELP,
    hints: [`Find the highest common factor of ${h * a}, ${h * b} and ${h * c}.`, `Divide all three terms by ${h}. Keep the − sign.`],
    solution: [`The HCF of ${h * a}, ${h * b} and ${h * c} is ${h}.`, `Divide every term by ${h}: ${expr([[a, "x"], [b, "y"], [-c, ""]])}.`, `So ${shown} = ${answer}`],
  };
};

// ------------------------------------------------------------ index laws in algebra

const pw = (v: string, n: number) => (n === 1 ? v : `${v}${sup(n)}`);
const mono = (k: number, v: string, n: number) => (k === 1 ? pw(v, n) : `${k}${pw(v, n)}`);

const indexLaws: Gen = (r, tier) => {
  const x = r.pick(["x", "y", "a", "p", "m"]);
  if (tier === 1) {
    const kind = r.pick(["multiply", "divide", "power", "two-letters"] as const);
    if (kind === "multiply") {
      const [a, b] = [r.int(2, 7), r.int(2, 6)];
      const ans = pw(x, a + b);
      return {
        prompt: `Simplify ${pw(x, a)} × ${pw(x, b)}`,
        answer: exprAnswer(ans),
        wrongAnswers: [],
        wrongExpressions: distinct([{ value: pw(x, a * b), misconception: "aidx-multiplied-powers" }].filter((w) => a * b !== a + b)),
        answerHelp: EXPR_HELP,
        hints: [`${pw(x, a)} is ${a} ${x}'s multiplied together, and ${pw(x, b)} is ${b} more.`, "When you multiply, add the powers."],
        solution: [`Multiplying: add the powers. ${a} + ${b} = ${a + b}.`, `${pw(x, a)} × ${pw(x, b)} = ${ans}`],
      };
    }
    if (kind === "divide") {
      const b = r.int(2, 5);
      const a = b * r.int(2, 3) + (r.next() < 0.5 ? 0 : r.int(1, 2));
      const ans = pw(x, a - b);
      const wrongs = a % b === 0 && a / b !== a - b ? [{ value: pw(x, a / b), misconception: "aidx-divided-powers" }] : [];
      return {
        prompt: `Simplify ${pw(x, a)} ÷ ${pw(x, b)}`,
        answer: exprAnswer(ans),
        wrongAnswers: [],
        wrongExpressions: wrongs,
        answerHelp: EXPR_HELP,
        hints: [`${b} of the ${a} ${x}'s on top cancel with the ${x}'s underneath.`, "When you divide, subtract the powers."],
        solution: [`Dividing: subtract the powers. ${a} − ${b} = ${a - b}.`, `${pw(x, a)} ÷ ${pw(x, b)} = ${ans}`],
      };
    }
    if (kind === "power") {
      const [a, b] = [r.int(2, 5), r.int(2, 4)];
      const ans = pw(x, a * b);
      return {
        prompt: `Simplify (${pw(x, a)})${sup(b)}`,
        answer: exprAnswer(ans),
        wrongAnswers: [],
        wrongExpressions: distinct([{ value: pw(x, a + b), misconception: "aidx-added-for-power" }].filter(() => a * b !== a + b)),
        answerHelp: EXPR_HELP,
        hints: [`(${pw(x, a)})${sup(b)} means ${Array(b).fill(pw(x, a)).join(" × ")}.`, "For a power of a power, multiply the powers."],
        solution: [`(${pw(x, a)})${sup(b)} = ${Array(b).fill(pw(x, a)).join(" × ")}`, `Power of a power: multiply. ${a} × ${b} = ${a * b}.`, `So the answer is ${ans}`],
      };
    }
    const y = x === "y" ? "x" : "y";
    const [a, b, c] = [r.int(2, 5), r.int(2, 5), r.int(1, 4)];
    const [first, second] = [x, y].sort();
    const ans = `${pw(first, first === x ? a + c : b)}${pw(second, second === x ? a + c : b)}`;
    return {
      prompt: `Simplify ${pw(x, a)} × ${pw(y, b)} × ${pw(x, c)}`,
      answer: exprAnswer(ans),
      wrongAnswers: [],
      wrongExpressions: [{ value: pw(x, a + b + c), misconception: "alg-joined-unlike" }],
      answerHelp: EXPR_HELP,
      hints: [`Only powers of the same letter combine. Put the ${x}'s together.`, `${pw(x, a)} × ${pw(x, c)} = ${pw(x, a + c)}. The ${y} part stays as it is.`],
      solution: [`${x} terms: ${pw(x, a)} × ${pw(x, c)} = ${pw(x, a + c)} (add the powers).`, `${pw(y, b)} is a different letter, so it stays.`, `Answer: ${ans}`],
    };
  }

  const kind = r.pick(["coeff-multiply", "coeff-divide", "bracket-power", "zero"] as const);
  if (kind === "coeff-multiply") {
    const [k, m] = [r.int(2, 6), r.int(2, 5)];
    const [a, b] = [r.int(2, 6), r.int(2, 5)];
    const ans = mono(k * m, x, a + b);
    return {
      prompt: `Simplify ${mono(k, x, a)} × ${mono(m, x, b)}`,
      answer: exprAnswer(ans),
      wrongAnswers: [],
      wrongExpressions: distinct(
        [
          { value: mono(k + m, x, a + b), misconception: "aidx-added-coefficients" },
          { value: mono(k * m, x, a * b), misconception: "aidx-multiplied-powers" },
        ].filter((w) => w.value !== ans),
      ),
      answerHelp: EXPR_HELP,
      hints: ["Deal with the numbers and the letters separately.", `Numbers: ${k} × ${m}. Powers of ${x}: add them, ${a} + ${b}.`],
      solution: [`Numbers: ${k} × ${m} = ${k * m}.`, `Letters: ${pw(x, a)} × ${pw(x, b)} = ${pw(x, a + b)}.`, `Answer: ${ans}`],
    };
  }
  if (kind === "coeff-divide") {
    const [k, m] = [r.int(2, 5), r.int(2, 6)];
    const b = r.int(1, 4);
    const a = b + r.int(1, 6);
    const ans = mono(m, x, a - b);
    return {
      prompt: `Simplify ${mono(k * m, x, a)} ÷ ${mono(k, x, b)}`,
      answer: exprAnswer(ans),
      wrongAnswers: [],
      wrongExpressions: distinct(
        [
          { value: mono(k * m - k, x, a - b), misconception: "aidx-subtracted-coefficients" },
          ...(a % b === 0 ? [{ value: mono(m, x, a / b), misconception: "aidx-divided-powers" }] : []),
        ].filter((w) => w.value !== ans && k * m - k > 0),
      ),
      answerHelp: EXPR_HELP,
      hints: ["Divide the numbers, then deal with the letters.", `Numbers: ${k * m} ÷ ${k}. Powers of ${x}: subtract them, ${a} − ${b}.`],
      solution: [`Numbers: ${k * m} ÷ ${k} = ${m}.`, `Letters: ${pw(x, a)} ÷ ${pw(x, b)} = ${pw(x, a - b)}.`, `Answer: ${ans}`],
    };
  }
  if (kind === "bracket-power") {
    const k = r.int(2, 3);
    const a = r.int(2, 4);
    const b = r.int(2, 3);
    const ans = mono(k ** b, x, a * b);
    return {
      prompt: `Simplify (${mono(k, x, a)})${sup(b)}`,
      answer: exprAnswer(ans),
      wrongAnswers: [],
      wrongExpressions: distinct(
        [
          { value: mono(k, x, a * b), misconception: "aidx-number-not-powered" },
          { value: mono(k ** b, x, a + b), misconception: "aidx-added-for-power" },
          { value: mono(k * b, x, a * b), misconception: "aidx-number-not-powered" },
        ].filter((w) => w.value !== ans),
      ),
      answerHelp: EXPR_HELP,
      hints: [`(${mono(k, x, a)})${sup(b)} means ${Array(b).fill(mono(k, x, a)).join(" × ")}.`, `The number ${k} is raised to the power ${b} too, and the powers of ${x} multiply.`],
      solution: [`(${mono(k, x, a)})${sup(b)} = ${Array(b).fill(mono(k, x, a)).join(" × ")}`, `Numbers: ${Array(b).fill(k).join(" × ")} = ${k ** b}.`, `Letters: ${a} × ${b} = ${a * b}, so ${pw(x, a * b)}.`, `Answer: ${ans}`],
    };
  }
  const a = r.int(2, 8);
  return {
    prompt: `Simplify ${pw(x, a)} ÷ ${pw(x, a)}`,
    answer: exprAnswer("1"),
    wrongAnswers: [],
    wrongExpressions: [
      { value: "0", misconception: "aidx-zero-is-zero" },
      { value: x, misconception: "aidx-divided-powers" },
    ],
    answerHelp: "Type a number or an expression.",
    hints: ["Anything divided by itself is…?", `Using the rule: ${pw(x, a)} ÷ ${pw(x, a)} = ${x}⁰. What is ${x}⁰?`],
    solution: [`Subtract the powers: ${a} − ${a} = 0, so it's ${x}⁰.`, "But anything divided by itself is 1.", `So ${x}⁰ = 1, and the answer is 1.`],
  };
};

// ------------------------------------------------------------ expanding two brackets

/** (x + p)(x + q) expanded: x² + (p + q)x + pq, with k in front of the first x. */
function expandDouble(x: string, k: number, p: number, q: number): string {
  return expr([[k, `${x}²`], [k * q + p, x], [p * q, ""]]);
}

const expandDoubleGen: Gen = (r, tier) => {
  const x = r.next() < 0.7 ? "x" : r.pick(["a", "n", "y"]);
  if (tier === 1) {
    const p = r.int(1, 9);
    const q = r.int(1, 9);
    const shown = `(${lin(x, p)})(${lin(x, q)})`;
    const ans = expandDouble(x, 1, p, q);
    return {
      prompt: `Expand and simplify ${shown}`,
      answer: exprAnswer(ans),
      wrongAnswers: [],
      wrongExpressions: distinct(
        [
          { value: expr([[1, `${x}²`], [p * q, ""]]), misconception: "dbl-missed-middle" },
          { value: expr([[1, `${x}²`], [p * q, x], [p + q, ""]]), misconception: "dbl-swapped-sum-product" },
          { value: expr([[2, x], [p + q, x], [p * q, ""]]), misconception: "alg-x-times-x" },
        ].filter((w) => w.value !== ans),
      ),
      answerHelp: EXPR_HELP,
      hints: [`Multiply each term in the first bracket by each term in the second: ${x} × ${x}, ${x} × ${q}, ${p} × ${x}, ${p} × ${q}.`, `That gives ${x}² + ${term(q, x)} + ${term(p, x)} + ${p * q}. Now collect the ${x} terms.`],
      solution: [
        `${x} × ${x} = ${x}²`,
        `${x} × ${q} = ${term(q, x)} and ${p} × ${x} = ${term(p, x)}`,
        `${p} × ${q} = ${p * q}`,
        `${x}² + ${term(q, x)} + ${term(p, x)} + ${p * q} = ${ans}`,
      ],
    };
  }

  const kind = r.pick(["signed", "square", "coefficient", "difference"] as const);
  if (kind === "signed") {
    let p = r.pick([-1, 1]) * r.int(1, 9);
    const q = -r.int(1, 9);
    if (p + q === 0) p += 1;
    const shown = `(${lin(x, p)})(${lin(x, q)})`;
    const ans = expandDouble(x, 1, p, q);
    return {
      prompt: `Expand and simplify ${shown}`,
      answer: exprAnswer(ans),
      wrongAnswers: [],
      wrongExpressions: distinct(
        [
          { value: expr([[1, `${x}²`], [p * q, ""]]), misconception: "dbl-missed-middle" },
          { value: expr([[1, `${x}²`], [p + q, x], [-p * q, ""]]), misconception: "dbl-sign-error" },
          { value: expr([[1, `${x}²`], [Math.abs(p) + Math.abs(q), x], [p * q, ""]]), misconception: "dbl-sign-error" },
        ].filter((w) => w.value !== ans),
      ),
      answerHelp: EXPR_HELP,
      hints: [
        `Keep each sign with its number: the terms are ${x}, ${signed(p)} and ${x}, ${signed(q)}.`,
        `${x} × ${x} = ${x}², ${x} × ${par(q)} = ${sterm(q, x)}, ${signed(p)} × ${x} = ${sterm(p, x)}, ${signed(p)} × ${par(q)} = ${signed(p * q)}.`,
      ],
      solution: [
        `${x} × ${x} = ${x}²`,
        `${x} terms: ${sterm(q, x)} and ${sterm(p, x)} make ${sterm(p + q, x)}`,
        `${signed(p)} × ${par(q)} = ${signed(p * q)}`,
        `Answer: ${ans}`,
      ],
    };
  }
  if (kind === "square") {
    const p = r.pick([-1, 1]) * r.int(1, 9);
    const shown = `(${lin(x, p)})²`;
    const ans = expandDouble(x, 1, p, p);
    return {
      prompt: `Expand and simplify ${shown}`,
      answer: exprAnswer(ans),
      wrongAnswers: [],
      wrongExpressions: distinct(
        [
          { value: expr([[1, `${x}²`], [p * p, ""]]), misconception: "dbl-squared-each" },
          { value: expr([[1, `${x}²`], [-p * p, ""]]), misconception: "dbl-squared-each" },
          { value: expr([[1, `${x}²`], [p, x], [p * p, ""]]), misconception: "dbl-missed-middle" },
        ].filter((w) => w.value !== ans),
      ),
      answerHelp: EXPR_HELP,
      hints: [`Squared means times itself: ${shown} = (${lin(x, p)})(${lin(x, p)}).`, "Now multiply every term in the first bracket by every term in the second."],
      solution: [`${shown} = (${lin(x, p)})(${lin(x, p)})`, `= ${x}² ${p < 0 ? "−" : "+"} ${term(Math.abs(p), x)} ${p < 0 ? "−" : "+"} ${term(Math.abs(p), x)} + ${p * p}`, `= ${ans}`],
    };
  }
  if (kind === "coefficient") {
    const k = r.int(2, 5);
    const p = r.pick([-1, 1]) * r.int(1, 7);
    const q = r.int(1, 7);
    const shown = `(${lin(x, p, k)})(${lin(x, q)})`;
    const ans = expandDouble(x, k, p, q);
    return {
      prompt: `Expand and simplify ${shown}`,
      answer: exprAnswer(ans),
      wrongAnswers: [],
      wrongExpressions: distinct(
        [
          { value: expr([[k, `${x}²`], [p * q, ""]]), misconception: "dbl-missed-middle" },
          { value: expr([[k, `${x}²`], [p + q, x], [p * q, ""]]), misconception: "dbl-coefficient" },
        ].filter((w) => w.value !== ans),
      ),
      answerHelp: EXPR_HELP,
      hints: [`Multiply each term in the first bracket by each in the second. ${term(k, x)} × ${x} = ${term(k, `${x}²`)}.`, `Don't forget ${term(k, x)} × ${q} = ${term(k * q, x)}.`],
      solution: [
        `${term(k, x)} × ${x} = ${term(k, `${x}²`)}`,
        `${term(k, x)} × ${q} = ${term(k * q, x)}, and ${signed(p)} × ${x} = ${sterm(p, x)}`,
        `${signed(p)} × ${q} = ${signed(p * q)}`,
        `Collect the ${x} terms: ${k * q} + ${p < 0 ? `(${signed(p)})` : p} = ${k * q + p}. Answer: ${ans}`,
      ],
    };
  }
  const a = r.int(2, 9);
  const shown = `(${lin(x, a)})(${lin(x, -a)})`;
  const ans = expr([[1, `${x}²`], [-a * a, ""]]);
  return {
    prompt: `Expand and simplify ${shown}`,
    answer: exprAnswer(ans),
    wrongAnswers: [],
    wrongExpressions: [
      { value: expr([[1, `${x}²`], [a * a, ""]]), misconception: "dbl-sign-error" },
      { value: expr([[1, `${x}²`], [-2 * a, x], [-a * a, ""]]), misconception: "dbl-sign-error" },
    ],
    answerHelp: EXPR_HELP,
    hints: [`Expand as usual: ${x} × ${x}, ${x} × −${a}, ${a} × ${x}, ${a} × −${a}.`, `The two ${x} terms are −${term(a, x)} and +${term(a, x)}. What do they make?`],
    solution: [`${x}² − ${term(a, x)} + ${term(a, x)} − ${a * a}`, `The ${x} terms cancel: −${term(a, x)} + ${term(a, x)} = 0.`, `Answer: ${ans}. This is called the difference of two squares.`],
  };
};

// ------------------------------------------------------------ factorising quadratics

/** "(x + 2)(x + 3)" with the smaller number first. */
const brackets = (x: string, p: number, q: number) => {
  const [a, b] = p <= q ? [p, q] : [q, p];
  if (a === b) return `(${lin(x, a)})²`;
  return `(${lin(x, a)})(${lin(x, b)})`;
};

/** Another pair with the same product but a different sum (the "multiplies but doesn't add" mistake). */
function otherPair(p: number, q: number): [number, number] | null {
  const prod = p * q;
  for (let r = 1; r <= Math.abs(prod); r++) {
    if (prod % r !== 0) continue;
    for (const s of [1, -1]) {
      const a = s * r;
      const b = prod / a;
      if (a + b === p + q || a + b === -(p + q)) continue;
      if (Math.sign(a) !== Math.sign(p) && Math.sign(a) !== Math.sign(q)) continue;
      return [a, b];
    }
  }
  return null;
}

const factoriseQuadratic: Gen = (r, tier) => {
  const x = r.next() < 0.75 ? "x" : r.pick(["a", "n", "y"]);
  const dots = tier === 2 && r.next() < 0.3;
  if (dots) {
    const k = r.int(2, 12);
    const shown = expr([[1, `${x}²`], [-k * k, ""]]);
    const ans = `(${lin(x, k)})(${lin(x, -k)})`;
    return {
      prompt: `Factorise ${shown}`,
      answer: exprAnswer(ans, "factorised"),
      wrongAnswers: [],
      wrongExpressions: [
        { value: `(${lin(x, -k)})²`, misconception: "fq-dots-square" },
        { value: `(${lin(x, k)})²`, misconception: "fq-dots-square" },
      ],
      answerHelp: FACT_HELP,
      hints: [`${shown} is ${x}² minus a square number: ${k * k} = ${k}².`, `Two numbers that multiply to −${k * k} and add to 0: ${k} and −${k}.`],
      solution: [`${k * k} = ${k}², so this is the difference of two squares.`, `We need two numbers that multiply to −${k * k} and add to 0 (there's no ${x} term): ${k} and −${k}.`, `${shown} = ${ans}`, `Check: ${ans} = ${x}² − ${term(k, x)} + ${term(k, x)} − ${k * k} = ${shown} ✓`],
    };
  }
  let p: number;
  let q: number;
  if (tier === 1) {
    p = r.int(1, 7);
    q = r.int(1, 9);
  } else {
    p = r.pick([-1, 1]) * r.int(1, 9);
    q = -r.int(1, 9);
    if (p + q === 0) p += 1;
    if (p === 0) p = 2;
  }
  const shown = expr([[1, `${x}²`], [p + q, x], [p * q, ""]]);
  const ans = brackets(x, p, q);
  const other = otherPair(p, q);
  const wrongs = distinct(
    [
      { value: brackets(x, -p, -q), misconception: "fq-signs-flipped" },
      ...(other ? [{ value: brackets(x, other[0], other[1]), misconception: "fq-sum-wrong" }] : []),
    ].filter((w) => w.value !== ans),
  );
  const pairsHint = p * q > 0 ? `Two numbers that multiply to ${p * q} and add to ${signed(p + q)}.${p + q < 0 ? " Both must be negative." : ""}` : `Two numbers that multiply to −${-p * q} and add to ${signed(p + q)}. One must be negative.`;
  return {
    prompt: `Factorise ${shown}`,
    answer: exprAnswer(ans, "factorised"),
    wrongAnswers: [],
    wrongExpressions: wrongs,
    answerHelp: FACT_HELP,
    hints: [pairsHint, `The numbers are ${signed(Math.min(p, q))} and ${signed(Math.max(p, q))}. Put each one in a bracket with ${x}.`],
    solution: [
      `Find two numbers that multiply to ${signed(p * q)} and add to ${signed(p + q)}.`,
      `${signed(p)} × ${par(q)} = ${signed(p * q)} and ${signed(p)} + ${par(q)} = ${signed(p + q)}.`,
      `So ${shown} = ${ans}`,
      `Check by expanding: ${ans} = ${shown} ✓`,
    ],
  };
};

// ------------------------------------------------------------ identities and show that

const YES_NO = ["Yes, it's an identity", "No, it isn't an identity"];

const showThat: Gen = (r, tier) => {
  const x = "x";
  if (tier === 1) {
    const kind = r.pick(["find-a", "find-b", "two-brackets", "is-it"] as const);
    if (kind === "find-a" || kind === "find-b") {
      const p = r.int(1, 8);
      const q = r.int(1, 9);
      const wantA = kind === "find-a";
      const value = wantA ? p + q : p * q;
      return {
        prompt: `(${lin(x, p)})(${lin(x, q)}) ≡ x² + ax + b. Find the value of ${wantA ? "a" : "b"}.`,
        answer: { kind: "integer", value },
        wrongAnswers: wrongNums(value, [{ value: wantA ? p * q : p + q, misconception: "dbl-swapped-sum-product" }]),
        answerHelp: NUM_HELP,
        hints: ["Expand the left-hand side.", `Then match it with x² + ax + b: ${wantA ? "a is the number in front of x" : "b is the number on its own"}.`],
        solution: [`(${lin(x, p)})(${lin(x, q)}) = x² + ${term(q, x)} + ${term(p, x)} + ${p * q} = ${expandDouble(x, 1, p, q)}`, `Match with x² + ax + b: a = ${p + q} and b = ${p * q}.`, `So ${wantA ? "a" : "b"} = ${value}.`],
      };
    }
    if (kind === "two-brackets") {
      const [k, m] = [r.int(2, 6), r.int(2, 5)];
      const [a, b] = [r.int(1, 6), r.int(1, 6)];
      const wantA = r.next() < 0.5;
      const A = k + m;
      const B = k * a + m * b;
      const value = wantA ? A : B;
      return {
        prompt: `${k}(${lin(x, a)}) + ${m}(${lin(x, b)}) ≡ Ax + B. Find the value of ${wantA ? "A" : "B"}.`,
        answer: { kind: "integer", value },
        wrongAnswers: wrongNums(value, wantA ? [] : [{ value: a + b, misconception: "alg-expand-first-only" }, { value: k + a + m + b, misconception: "alg-expand-added" }]),
        answerHelp: NUM_HELP,
        hints: ["Expand both brackets, then collect like terms.", `${k}(${lin(x, a)}) = ${term(k, x)} + ${k * a}, and ${m}(${lin(x, b)}) = ${term(m, x)} + ${m * b}.`],
        solution: [`${k}(${lin(x, a)}) + ${m}(${lin(x, b)}) = ${term(k, x)} + ${k * a} + ${term(m, x)} + ${m * b}`, `= ${expr([[A, x], [B, ""]])}`, `So A = ${A} and B = ${B}. The answer is ${value}.`],
      };
    }
    const [k, m] = [r.int(2, 6), r.int(1, 5)];
    const a = r.int(2, 7);
    const truth = r.next() < 0.5;
    const right = expr([[k + m, x], [truth ? k * a : a, ""]]);
    const statement = `${k}(${lin(x, a)}) + ${term(m, x)} ≡ ${right}`;
    return {
      prompt: `Is this an identity? Is it true for every value of x? ${statement}`,
      answer: { kind: "choice", options: YES_NO, correctIndex: truth ? 0 : 1 },
      wrongAnswers: [{ value: truth ? 1 : 0, misconception: truth ? "show-is-identity" : "show-not-identity" }],
      hints: ["Expand and simplify the left-hand side.", "Is it exactly the same as the right-hand side?"],
      solution: [
        `Left side: ${k}(${lin(x, a)}) + ${term(m, x)} = ${term(k, x)} + ${k * a} + ${term(m, x)} = ${expr([[k + m, x], [k * a, ""]])}`,
        truth ? "That's exactly the right side, so it's true for every x. It is an identity." : `The right side is ${right}, which is different (the bracket wasn't fully multiplied out). So it is not an identity.`,
      ],
    };
  }

  const kind = r.pick(["minus-bracket", "square-b", "signed-b", "is-it"] as const);
  if (kind === "minus-bracket") {
    const m = r.int(2, 4);
    const k = m + r.int(1, 4);
    const [a, b] = [r.int(1, 6), r.int(1, 6)];
    const B = k * a + m * b;
    return {
      prompt: `${k}(${lin(x, a)}) − ${m}(${lin(x, -b)}) ≡ Ax + B. Find the value of B.`,
      answer: { kind: "integer", value: B },
      wrongAnswers: wrongNums(B, [{ value: k * a - m * b, misconception: "show-second-bracket-sign" }]),
      answerHelp: NUM_HELP,
      hints: [`Expand each bracket. The second bracket is multiplied by −${m}.`, `−${m} × −${b} = +${m * b}.`],
      solution: [`${k}(${lin(x, a)}) = ${term(k, x)} + ${k * a}`, `−${m}(${lin(x, -b)}) = −${term(m, x)} + ${m * b}`, `Together: ${expr([[k - m, x], [B, ""]])}`, `So B = ${B}.`],
    };
  }
  if (kind === "square-b") {
    const p = r.int(1, 7);
    const c = r.int(1, 9);
    const wantA = r.next() < 0.4;
    const value = wantA ? 2 * p : p * p - c;
    return {
      prompt: `(${lin(x, p)})² − ${c} ≡ x² + ax + b. Find the value of ${wantA ? "a" : "b"}.`,
      answer: { kind: "integer", value },
      wrongAnswers: wrongNums(value, wantA ? [{ value: p, misconception: "dbl-missed-middle" }, { value: 0, misconception: "dbl-squared-each" }] : [{ value: p - c, misconception: "dbl-squared-each" }, { value: 2 * p - c, misconception: "dbl-swapped-sum-product" }]),
      answerHelp: NUM_HELP,
      hints: [`(${lin(x, p)})² = (${lin(x, p)})(${lin(x, p)}). Expand it first.`, `(${lin(x, p)})² = ${expandDouble(x, 1, p, p)}. Now subtract ${c}.`],
      solution: [`(${lin(x, p)})² = ${expandDouble(x, 1, p, p)}`, `Subtract ${c}: ${expr([[1, "x²"], [2 * p, x], [p * p - c, ""]])}`, `So a = ${2 * p} and b = ${signed(p * p - c)}. The answer is ${signed(value)}.`],
    };
  }
  if (kind === "signed-b") {
    const p = r.int(1, 9);
    let q = r.int(1, 9);
    if (q === p) q = p + 1;
    const wantA = r.next() < 0.5;
    const value = wantA ? p - q : -p * q;
    return {
      prompt: `(${lin(x, p)})(${lin(x, -q)}) ≡ x² + ax + b. Find the value of ${wantA ? "a" : "b"}.`,
      answer: { kind: "integer", value },
      wrongAnswers: wrongNums(value, wantA ? [{ value: p + q, misconception: "dbl-sign-error" }, { value: -p * q, misconception: "dbl-swapped-sum-product" }] : [{ value: p * q, misconception: "dbl-sign-error" }, { value: p - q, misconception: "dbl-swapped-sum-product" }]),
      answerHelp: NUM_HELP,
      hints: ["Expand the left-hand side, keeping the minus sign with its number.", `${p} × −${q} = −${p * q}.`],
      solution: [`(${lin(x, p)})(${lin(x, -q)}) = x² − ${term(q, x)} + ${term(p, x)} − ${p * q} = ${expandDouble(x, 1, p, -q)}`, `So a = ${signed(p - q)} and b = −${p * q}. The answer is ${signed(value)}.`],
    };
  }
  const a = r.int(2, 9);
  const options = [
    { s: `(x + ${a})² ≡ x² + ${a * a}`, truth: false, why: `(x + ${a})² = x² + ${term(2 * a, "x")} + ${a * a}. The middle term is missing, so it is not an identity.` },
    { s: `(x + ${a})² ≡ x² + ${term(2 * a, "x")} + ${a * a}`, truth: true, why: `(x + ${a})(x + ${a}) = x² + ${term(a, "x")} + ${term(a, "x")} + ${a * a} = x² + ${term(2 * a, "x")} + ${a * a}. Both sides match, so it is an identity.` },
    { s: `(x + ${a})(x − ${a}) ≡ x² − ${a * a}`, truth: true, why: `(x + ${a})(x − ${a}) = x² − ${term(a, "x")} + ${term(a, "x")} − ${a * a} = x² − ${a * a}. Both sides match, so it is an identity.` },
    { s: `(x − ${a})² ≡ x² − ${a * a}`, truth: false, why: `(x − ${a})² = x² − ${term(2 * a, "x")} + ${a * a}, which is different. Try x = 0: the left side is ${a * a} but the right side is −${a * a}. Not an identity.` },
  ];
  const o = r.pick(options);
  return {
    prompt: `Is this an identity? Is it true for every value of x? ${o.s}`,
    answer: { kind: "choice", options: YES_NO, correctIndex: o.truth ? 0 : 1 },
    wrongAnswers: [{ value: o.truth ? 1 : 0, misconception: o.truth ? "show-is-identity" : "show-not-identity" }],
    hints: ["Expand the left-hand side fully. Squared means the bracket times itself.", "Compare it with the right-hand side, term by term."],
    solution: [o.why],
  };
};

export const EXPRESSION_GENERATORS: Record<string, Gen> = {
  "alg-vocabulary": vocabulary,
  "alg-factorise-single": factoriseSingle,
  "alg-index-laws": indexLaws,
  "alg-expand-double": expandDoubleGen,
  "alg-factorise-quadratic": factoriseQuadratic,
  "alg-show-that": showThat,
};
