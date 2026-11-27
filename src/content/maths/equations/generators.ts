/**
 * Question generators for "Equations and inequalities".
 *
 * Tier 1 keeps answers positive and whole; tier 2 brings in negative answers
 * (written with a true minus sign, and in brackets after an operator).
 * Inequalities, quadratic solutions, simultaneous answers and rearranged
 * formulae use the answer kinds in engine/equations.ts, which accept any
 * equivalent way of writing them.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher.
 */

import type { Rng } from "@/engine/random";
import type { Interval, NumberLineSpec, Question } from "@/engine/types";
import { frac } from "@/engine/fraction";
import { expr, term } from "../algebra/generators";

type Tier = 1 | 2;
type Gen = (r: Rng, tier: Tier) => Omit<Question, "id" | "skillId">;

const NUM_HELP = "Type a number like 7. For a negative number, type a minus sign first, like -3.";
const EXPR_HELP = "Type an expression like 3n + 2. Leave out the × sign. Use brackets if you need them.";
const INEQ_HELP = "Type an inequality like x < 4 or x >= -2. Type <= for ≤ and >= for ≥.";
const FORMULA_HELP = "Type it like x = (y − 3)/2. Use / to divide and brackets around a whole top. For a square root, type sqrt(A).";
const ROOTS_HELP = "Type both solutions, like x = 2 or x = -5.";
const SIM_HELP = "Type both values, like x = 3, y = -2.";
const NAMES = ["Amir", "Bea", "Sam", "Priya", "Leo", "Maya", "Kai", "Noor"] as const;

const signed = (n: number) => (n < 0 ? `−${-n}` : String(n));
/** A number after an operator: negatives in brackets. */
const par = (n: number) => (n < 0 ? `(−${-n})` : String(n));
/** "x + 3", "x − 4" */
const lin = (x: string, c: number, k = 1) => expr([[k, x], [c, ""]]);

function wrongNums(correct: number, wrong: { value: number; misconception: string }[]) {
  const seen = new Set<number>([correct]);
  return wrong.filter((w) => (!Number.isInteger(w.value) || seen.has(w.value) ? false : (seen.add(w.value), true)));
}
function distinct<T extends { value: string }>(xs: T[]): T[] {
  const seen = new Set<string>();
  return xs.filter((x) => (seen.has(x.value) ? false : (seen.add(x.value), true)));
}
function twoNames(r: Rng): [string, string] {
  const a = r.pick(NAMES);
  let b = r.pick(NAMES);
  while (b === a) b = r.pick(NAMES);
  return [a, b];
}
const nonZero = (r: Rng, lo: number, hi: number) => {
  let n = r.int(lo, hi);
  while (n === 0) n = r.int(lo, hi);
  return n;
};

// ------------------------------------------------------------ equations with brackets

const solveBrackets: Gen = (r, tier) => {
  const x = r.next() < 0.7 ? "x" : r.pick(["n", "a", "y"]);
  if (tier === 1) {
    const k = r.int(2, 6);
    const minus = r.next() < 0.4;
    const a = r.int(1, 8);
    const s = minus ? a + r.int(1, 8) : r.int(1, 9);
    const inner = minus ? s - a : s + a;
    const c = k * inner;
    const shown = `${k}(${lin(x, minus ? -a : a)}) = ${c}`;
    return {
      prompt: `Solve ${shown}`,
      answer: { kind: "integer", value: s },
      wrongAnswers: wrongNums(s, [
        { value: minus ? (c + a) / k : (c - a) / k, misconception: "eqn-expand-first-only" },
        { value: minus ? c + a : c - a, misconception: "eqn-divide-one-side" },
        { value: minus ? c / k - a : c / k + a, misconception: "eqn-number-sign" },
      ]),
      answerHelp: NUM_HELP,
      hints: [`Either expand the bracket first, or divide both sides by ${k}.`, `Dividing both sides by ${k}: ${lin(x, minus ? -a : a)} = ${inner}.`],
      solution: [
        `Divide both sides by ${k}: ${lin(x, minus ? -a : a)} = ${inner}`,
        `${minus ? `Add ${a} to` : `Subtract ${a} from`} both sides: ${x} = ${s}`,
        `Check: ${k} × (${s} ${minus ? "−" : "+"} ${a}) = ${k} × ${inner} = ${c} ✓`,
      ],
    };
  }

  const kind = r.pick(["coefficient", "two-brackets", "negative"] as const);
  if (kind === "coefficient") {
    const k = r.int(2, 5);
    const m = r.int(2, 5);
    const b = nonZero(r, -9, 9);
    const s = r.int(1, 8);
    const c = k * (m * s + b);
    const shown = `${k}(${lin(x, b, m)}) = ${c}`;
    return {
      prompt: `Solve ${shown}`,
      answer: { kind: "integer", value: s },
      wrongAnswers: wrongNums(s, [{ value: (c - b) / (k * m), misconception: "eqn-expand-first-only" }, { value: (c / k + b) / m, misconception: "eqn-number-sign" }]),
      answerHelp: NUM_HELP,
      hints: [`Expand the bracket: ${k} × ${term(m, x)} and ${k} × ${par(b)}.`, `${expr([[k * m, x], [k * b, ""]])} = ${c}. Now solve the two-step equation.`],
      solution: [`Expand: ${expr([[k * m, x], [k * b, ""]])} = ${c}`, `${b > 0 ? `Subtract ${k * b} from` : `Add ${-k * b} to`} both sides: ${term(k * m, x)} = ${c - k * b}`, `Divide by ${k * m}: ${x} = ${s}`],
    };
  }
  if (kind === "two-brackets") {
    const [k, m] = [r.int(2, 5), r.int(2, 4)];
    const [a, b] = [r.int(1, 6), nonZero(r, -5, 6)];
    const s = r.int(1, 9);
    const c = k * (s + a) + m * (s + b);
    const shown = `${k}(${lin(x, a)}) + ${m}(${lin(x, b)}) = ${c}`;
    return {
      prompt: `Solve ${shown}`,
      answer: { kind: "integer", value: s },
      wrongAnswers: wrongNums(s, [{ value: (c - a - b) / (k + m), misconception: "eqn-expand-first-only" }]),
      answerHelp: NUM_HELP,
      hints: ["Expand both brackets, then collect like terms.", `${term(k, x)} ${k * a < 0 ? "−" : "+"} ${Math.abs(k * a)} + ${term(m, x)} ${m * b < 0 ? "−" : "+"} ${Math.abs(m * b)} = ${c}`],
      solution: [
        `Expand: ${expr([[k, x], [k * a, ""]])} + ${expr([[m, x], [m * b, ""]])} = ${c}`,
        `Collect: ${expr([[k + m, x], [k * a + m * b, ""]])} = ${c}`,
        `${k * a + m * b >= 0 ? `Subtract ${k * a + m * b} from` : `Add ${-(k * a + m * b)} to`} both sides: ${term(k + m, x)} = ${c - k * a - m * b}`,
        `Divide by ${k + m}: ${x} = ${s}`,
      ],
    };
  }
  const k = r.int(2, 6);
  const a = r.int(1, 9);
  const s = -r.int(1, 8);
  const c = k * (s + a);
  const shown = `${k}(${lin(x, a)}) = ${signed(c)}`;
  return {
    prompt: `Solve ${shown}`,
    answer: { kind: "integer", value: s },
    wrongAnswers: wrongNums(s, [
      { value: (c - a) / k, misconception: "eqn-expand-first-only" },
      { value: -s, misconception: "eqn-negative-slip" },
      { value: c / k + a, misconception: "eqn-number-sign" },
    ]),
    answerHelp: NUM_HELP,
    hints: [`Divide both sides by ${k} first.`, `${lin(x, a)} = ${signed(c / k)}. Now subtract ${a} from both sides. The answer can be negative.`],
    solution: [`Divide both sides by ${k}: ${lin(x, a)} = ${signed(c / k)}`, `Subtract ${a}: ${x} = ${signed(c / k)} − ${a} = ${signed(s)}`, `Check: ${k} × (${signed(s)} + ${a}) = ${k} × ${par(s + a)} = ${signed(c)} ✓`],
  };
};

// ------------------------------------------------------------ unknown on both sides

const solveBothSides: Gen = (r, tier) => {
  const x = r.next() < 0.7 ? "x" : r.pick(["n", "a", "y"]);
  if (tier === 1) {
    const c = r.int(1, 5);
    const a = c + r.int(1, 5);
    const b = r.int(1, 12);
    const s = r.int(1, 9);
    const d = (a - c) * s + b;
    const shown = `${expr([[a, x], [b, ""]])} = ${expr([[c, x], [d, ""]])}`;
    return {
      prompt: `Solve ${shown}`,
      answer: { kind: "integer", value: s },
      wrongAnswers: wrongNums(s, [
        { value: (d - b) / (a + c), misconception: "eqn-added-x-terms" },
        { value: (d + b) / (a - c), misconception: "eqn-number-sign" },
      ]),
      answerHelp: NUM_HELP,
      hints: [`Get the ${x} terms on one side. Subtract ${term(c, x)} from both sides.`, `${expr([[a - c, x], [b, ""]])} = ${d}. Now solve as usual.`],
      solution: [`Subtract ${term(c, x)} from both sides: ${expr([[a - c, x], [b, ""]])} = ${d}`, `Subtract ${b} from both sides: ${term(a - c, x)} = ${d - b}`, `Divide by ${a - c}: ${x} = ${s}`, `Check: both sides give ${a * s + b} ✓`],
    };
  }

  const kind = r.pick(["general", "general", "bracket"] as const);
  if (kind === "bracket") {
    const c = r.int(1, 4);
    const k = c + r.int(1, 4);
    const p = nonZero(r, -6, 6);
    const s = nonZero(r, -5, 9);
    const d = k * (s + p) - c * s;
    if (d === 0) return solveBothSides(r, tier);
    const shown = `${k}(${lin(x, p)}) = ${expr([[c, x], [d, ""]])}`;
    return {
      prompt: `Solve ${shown}`,
      answer: { kind: "integer", value: s },
      wrongAnswers: wrongNums(s, [
        { value: (d - p) / (k - c), misconception: "eqn-expand-first-only" },
        { value: (d - k * p) / (k + c), misconception: "eqn-added-x-terms" },
      ]),
      answerHelp: NUM_HELP,
      hints: [`Expand the bracket first: ${expr([[k, x], [k * p, ""]])}.`, `Then subtract ${term(c, x)} from both sides.`],
      solution: [
        `Expand: ${expr([[k, x], [k * p, ""]])} = ${expr([[c, x], [d, ""]])}`,
        `Subtract ${term(c, x)}: ${expr([[k - c, x], [k * p, ""]])} = ${signed(d)}`,
        `${k * p > 0 ? `Subtract ${k * p}` : `Add ${-k * p}`}: ${term(k - c, x)} = ${signed(d - k * p)}`,
        `Divide by ${k - c}: ${x} = ${signed(s)}`,
      ],
    };
  }
  // ax + b = cx + d, with the bigger x term on either side and negatives allowed.
  let a = r.int(1, 8);
  let c = r.int(1, 8);
  while (c === a) c = r.int(1, 8);
  const b = nonZero(r, -9, 12);
  const s = nonZero(r, -6, 9);
  const d = (a - c) * s + b;
  if (d === 0) return solveBothSides(r, tier);
  const shown = `${expr([[a, x], [b, ""]])} = ${expr([[c, x], [d, ""]])}`;
  const [big, small] = a > c ? [a, c] : [c, a];
  // Collect x on the side with the bigger x term: (big − small)x = rhs.
  const rhs = a > c ? d - b : b - d;
  const leftConst = a > c ? b : d;
  return {
    prompt: `Solve ${shown}`,
    answer: { kind: "integer", value: s },
    wrongAnswers: wrongNums(s, [
      { value: rhs / (big + small), misconception: "eqn-added-x-terms" },
      { value: (rhs + 2 * leftConst) / (big - small), misconception: "eqn-number-sign" },
      { value: -s, misconception: "eqn-negative-slip" },
    ]),
    answerHelp: NUM_HELP,
    hints: [
      `Subtract the smaller ${x} term, ${term(small, x)}, from both sides.${a < c ? ` That leaves the ${x}'s on the right, which is fine.` : ""}`,
      `${term(big - small, x)} = ${signed(rhs)} after moving the numbers too. Now divide.`,
    ],
    solution: [
      `Subtract ${term(small, x)} from both sides: ${a > c ? `${expr([[a - c, x], [b, ""]])} = ${signed(d)}` : `${signed(b)} = ${expr([[c - a, x], [d, ""]])}`}`,
      `${leftConst > 0 ? `Subtract ${leftConst} from` : `Add ${-leftConst} to`} both sides: ${a > c ? `${term(big - small, x)} = ${signed(rhs)}` : `${signed(rhs)} = ${term(big - small, x)}`}`,
      `Divide by ${big - small}: ${x} = ${signed(s)}`,
      `Check: both sides give ${signed(a * s + b)} ✓`,
    ],
  };
};

// ------------------------------------------------------------ forming expressions

const exprAnswer = (value: string, form: "notation" | "simplified" = "simplified", lhs?: string) => ({ kind: "expression" as const, value, form, ...(lhs ? { lhs } : {}) });

const formExpressions: Gen = (r, tier) => {
  const [p1, p2] = twoNames(r);
  const n = r.pick(["n", "x", "m"]);
  const k = r.int(2, 6);
  const c = r.int(2, 9);
  if (tier === 1) {
    const kind = r.pick(["more", "times", "fewer", "cost"] as const);
    if (kind === "more") {
      return {
        prompt: `${p1} has ${n} sweets. ${p2} has ${c} more sweets than ${p1}. Write an expression for the number of sweets ${p2} has.`,
        answer: exprAnswer(`${n} + ${c}`),
        wrongAnswers: [],
        wrongExpressions: [{ value: `${c}${n}`, misconception: "alg-times-as-add" }],
        answerHelp: EXPR_HELP,
        hints: [`"More than" means add.`, `Try a number: if ${p1} had 10, ${p2} would have 10 + ${c}.`],
        solution: [`${p2} has ${c} more than ${n}.`, `Answer: ${n} + ${c}`],
      };
    }
    if (kind === "times") {
      return {
        prompt: `${p1} has ${n} stickers. ${p2} has ${k} times as many stickers as ${p1}. Write an expression for the number of stickers ${p2} has.`,
        answer: exprAnswer(term(k, n)),
        wrongAnswers: [],
        wrongExpressions: [{ value: `${n} + ${k}`, misconception: "alg-times-as-add" }],
        answerHelp: EXPR_HELP,
        hints: [`"${k} times as many" means multiply by ${k}.`, `In algebra, ${k} × ${n} is written ${term(k, n)}.`],
        solution: [`${k} times ${n} is ${k} × ${n}.`, `Answer: ${term(k, n)}`],
      };
    }
    if (kind === "fewer") {
      return {
        prompt: `${p1} is ${n} years old. ${p2} is ${c} years younger than ${p1}. Write an expression for ${p2}'s age.`,
        answer: exprAnswer(`${n} − ${c}`),
        wrongAnswers: [],
        wrongExpressions: [{ value: `${c} − ${n}`, misconception: "form-subtract-order" }],
        answerHelp: EXPR_HELP,
        hints: [`Younger means take away from ${p1}'s age.`, `Start with ${n}, then take away ${c}.`],
        solution: [`${p2} is ${c} years younger, so take ${c} away from ${n}.`, `Answer: ${n} − ${c}`],
      };
    }
    const item = r.pick(["pens", "apples", "stamps"]);
    return {
      prompt: `${item[0].toUpperCase() + item.slice(1)} cost p pence each. Write an expression for the cost, in pence, of ${k} ${item}.`,
      answer: exprAnswer(term(k, "p")),
      wrongAnswers: [],
      wrongExpressions: [{ value: `p + ${k}`, misconception: "alg-times-as-add" }],
      answerHelp: EXPR_HELP,
      hints: [`One costs p. ${k} of them cost ${k} lots of p.`, `${k} × p is written ${term(k, "p")}.`],
      solution: [`${k} ${item} at p pence each cost ${k} × p.`, `Answer: ${term(k, "p")}`],
    };
  }

  const kind = r.pick(["formula", "perimeter", "steps", "consecutive"] as const);
  if (kind === "formula") {
    return {
      prompt: `Cinema tickets cost £t each, and there is a £${c} booking fee for the whole order. Write a formula for the total cost, £C, of buying ${k} tickets.`,
      answer: exprAnswer(`${term(k, "t")} + ${c}`, "simplified", "C"),
      wrongAnswers: [],
      wrongExpressions: [
        { value: `${k}(t + ${c})`, misconception: "alg-missing-brackets" },
        { value: `t + ${k + c}`, misconception: "alg-times-as-add" },
      ],
      answerHelp: "Type a formula like C = 4t + 2. Start with C =",
      hints: [`${k} tickets cost ${term(k, "t")}. The fee is paid once, not for every ticket.`, `So C = ${term(k, "t")} + the fee.`],
      solution: [`${k} tickets: ${k} × t = ${term(k, "t")}`, `Add the £${c} fee once.`, `C = ${term(k, "t")} + ${c}`],
    };
  }
  if (kind === "perimeter") {
    const a = r.int(2, 9);
    return {
      prompt: `A rectangle is ${n} cm wide and ${n} + ${a} cm long. Write an expression for its perimeter. Simplify your answer.`,
      answer: exprAnswer(expr([[4, n], [2 * a, ""]])),
      wrongAnswers: [],
      wrongExpressions: distinct([
        { value: expr([[2, n], [a, ""]]), misconception: "form-perimeter-two-sides" },
      ]),
      answerHelp: EXPR_HELP,
      hints: ["The perimeter is all four sides added together.", `${n} + (${n} + ${a}) + ${n} + (${n} + ${a}). Now collect like terms.`],
      solution: [`Perimeter = ${n} + ${n} + ${a} + ${n} + ${n} + ${a}`, `${n} terms: 4${n}. Numbers: ${a} + ${a} = ${2 * a}.`, `Answer: ${expr([[4, n], [2 * a, ""]])}`],
    };
  }
  if (kind === "steps") {
    const addFirst = r.next() < 0.5;
    const ans = addFirst ? `${k}(${n} + ${c})` : `${term(k, n)} + ${c}`;
    return {
      prompt: `${p1} thinks of a number, ${n}. ${addFirst ? `They add ${c}, then multiply the result by ${k}.` : `They multiply it by ${k}, then add ${c}.`} Write an expression for the result.`,
      answer: exprAnswer(ans, "notation"),
      wrongAnswers: [],
      wrongExpressions: [addFirst ? { value: `${term(k, n)} + ${c}`, misconception: "alg-missing-brackets" } : { value: `${k}(${n} + ${c})`, misconception: "alg-machine-order" }],
      answerHelp: EXPR_HELP,
      hints: addFirst ? [`First: ${n} + ${c}.`, `The whole of ${n} + ${c} is multiplied by ${k}, so it needs brackets.`] : [`First: ${n} × ${k} = ${term(k, n)}.`, `Then add ${c}.`],
      solution: addFirst ? [`Add ${c}: ${n} + ${c}`, `Multiply all of it by ${k}: ${ans}`] : [`Multiply by ${k}: ${term(k, n)}`, `Add ${c}: ${ans}`],
    };
  }
  return {
    prompt: `${n} is a whole number. Write an expression for the sum of ${n} and the next two whole numbers. Simplify your answer.`,
    answer: exprAnswer(`3${n} + 3`),
    wrongAnswers: [],
    wrongExpressions: [
      { value: `3${n}`, misconception: "alg-joined-unlike" },
      { value: `${n} + 3`, misconception: "alg-times-as-add" },
    ],
    answerHelp: EXPR_HELP,
    hints: [`The next two whole numbers after ${n} are ${n} + 1 and ${n} + 2.`, `Add ${n} + (${n} + 1) + (${n} + 2) and collect like terms.`],
    solution: [`The numbers are ${n}, ${n} + 1 and ${n} + 2.`, `${n} + ${n} + 1 + ${n} + 2 = 3${n} + 3`],
  };
};

// ------------------------------------------------------------ forming and solving equations

/** Triangle angle multipliers (x, kx, mx) where 180 ÷ (1 + k + m) is whole. */
const TRIANGLES: [number, number][] = [
  [2, 3],
  [2, 6],
  [3, 5],
  [1, 2],
  [2, 2],
  [3, 6],
  [4, 5],
  [2, 9],
  [5, 6],
  [3, 8],
];

const formEquations: Gen = (r, tier) => {
  const [p1, p2] = twoNames(r);
  if (tier === 1) {
    const kind = r.pick(["think", "triangle", "share"] as const);
    if (kind === "think") {
      const k = r.int(2, 6);
      const c = r.int(1, 15);
      const s = r.int(2, 12);
      const total = k * s + c;
      return {
        prompt: `${p1} thinks of a number. They multiply it by ${k}, then add ${c}. The answer is ${total}. What number did ${p1} think of?`,
        answer: { kind: "integer", value: s },
        wrongAnswers: wrongNums(s, [
          { value: (total + c) / k, misconception: "eqn-number-sign" },
          { value: total / k - c, misconception: "alg-two-step-order" },
        ]),
        answerHelp: NUM_HELP,
        hints: [`Call the number x. Then ${term(k, "x")} + ${c} = ${total}.`, `Solve it: subtract ${c} from both sides, then divide by ${k}.`],
        solution: [`Let the number be x: ${term(k, "x")} + ${c} = ${total}`, `Subtract ${c}: ${term(k, "x")} = ${total - c}`, `Divide by ${k}: x = ${s}`, `${p1} thought of ${s}.`],
      };
    }
    if (kind === "triangle") {
      const [k, m] = r.pick(TRIANGLES);
      const s = 180 / (1 + k + m);
      return {
        prompt: `The angles in a triangle are x, ${term(k, "x")} and ${term(m, "x")}. Find x.`,
        answer: { kind: "integer", value: s },
        wrongAnswers: wrongNums(s, [
          { value: 360 / (1 + k + m), misconception: "form-wrong-total" },
          { value: 180 / (k + m), misconception: "form-x-is-one" },
        ]),
        answerHelp: "Type the number of degrees, like 30.",
        hints: ["The angles in a triangle add up to 180°.", `x + ${term(k, "x")} + ${term(m, "x")} = 180. Collect the x terms.`],
        solution: [`Angles in a triangle add to 180°: x + ${term(k, "x")} + ${term(m, "x")} = 180`, `${1 + k + m}x = 180`, `x = 180 ÷ ${1 + k + m} = ${s}°`],
      };
    }
    const k = r.int(2, 5);
    const s = r.int(3, 15);
    const total = (k + 1) * s;
    return {
      prompt: `${p1} has some marbles. ${p2} has ${k} times as many as ${p1}. Together they have ${total} marbles. How many marbles does ${p1} have?`,
      answer: { kind: "integer", value: s },
      wrongAnswers: wrongNums(s, [
        { value: total / k, misconception: "alg-joined-unlike" },
        { value: k * s, misconception: "form-gave-x" },
      ]),
      answerHelp: NUM_HELP,
      hints: [`Let ${p1} have x marbles. Then ${p2} has ${term(k, "x")}.`, `x + ${term(k, "x")} = ${total}, so ${k + 1}x = ${total}.`],
      solution: [`${p1}: x. ${p2}: ${term(k, "x")}.`, `x + ${term(k, "x")} = ${total}`, `${k + 1}x = ${total}, so x = ${s}.`, `${p1} has ${s} marbles.`],
    };
  }

  const kind = r.pick(["largest-angle", "rectangle", "both-sides", "share-other"] as const);
  if (kind === "largest-angle") {
    const quad = r.next() < 0.4;
    const mults = quad ? r.pick([[1, 2, 3, 4], [1, 2, 3, 6], [2, 3, 3, 4], [1, 3, 4, 4]] as const) : [1, ...r.pick(TRIANGLES)];
    const sum = mults.reduce((t, v) => t + v, 0);
    const total = quad ? 360 : 180;
    const s = total / sum;
    const biggest = Math.max(...mults);
    const value = biggest * s;
    const shape = quad ? "quadrilateral" : "triangle";
    return {
      prompt: `The angles in a ${shape} are ${mults.map((v) => term(v, "x")).join(", ")}. Find the size of the largest angle.`,
      answer: { kind: "integer", value },
      wrongAnswers: wrongNums(value, [
        { value: s, misconception: "form-gave-x" },
        { value: (biggest * (quad ? 180 : 360)) / sum, misconception: "form-wrong-total" },
      ]),
      answerHelp: "Type the number of degrees, like 120.",
      hints: [`The angles in a ${shape} add to ${total}°. Collect the x terms and solve for x.`, `${sum}x = ${total}, so x = ${s}. Now work out the largest angle, ${term(biggest, "x")}.`],
      solution: [`${mults.map((v) => term(v, "x")).join(" + ")} = ${total}`, `${sum}x = ${total}, so x = ${s}`, `Largest angle: ${term(biggest, "x")} = ${biggest} × ${s} = ${value}°`],
    };
  }
  if (kind === "rectangle") {
    const a = r.int(2, 9);
    const s = r.int(2, 12);
    const P = 4 * s + 2 * a;
    const askLength = r.next() < 0.5;
    const value = askLength ? s + a : s;
    return {
      prompt: `A rectangle is x cm wide and (x + ${a}) cm long. Its perimeter is ${P} cm. ${askLength ? "Find the length of the rectangle." : "Find x."}`,
      answer: { kind: "integer", value },
      wrongAnswers: wrongNums(value, [
        ...(askLength ? [{ value: s, misconception: "form-gave-x" }] : []),
        { value: askLength ? (P - a) / 2 + a : (P - a) / 2, misconception: "form-perimeter-two-sides" },
      ]),
      answerHelp: "Type a number like 9. Units are fine but not needed.",
      hints: [`Perimeter = all four sides: x + (x + ${a}) + x + (x + ${a}).`, `That's 4x + ${2 * a} = ${P}. Solve for x${askLength ? ", then find the length x + " + a : ""}.`],
      solution: [`x + (x + ${a}) + x + (x + ${a}) = ${P}`, `4x + ${2 * a} = ${P}`, `4x = ${P - 2 * a}, so x = ${s}`, ...(askLength ? [`Length = x + ${a} = ${s + a} cm`] : [])],
    };
  }
  if (kind === "both-sides") {
    const c = r.int(2, 4);
    const a = c + r.int(1, 4);
    const b = r.int(1, 9);
    const s = r.int(2, 12);
    const d = (a - c) * s - b;
    if (d <= 0) return formEquations(r, tier);
    return {
      prompt: `${p1} thinks of a number. ${a} times the number, take away ${b}, gives the same answer as ${c} times the number, add ${d}. What is the number?`,
      answer: { kind: "integer", value: s },
      wrongAnswers: wrongNums(s, [
        { value: (d + b) / (a + c), misconception: "eqn-added-x-terms" },
        { value: (d - b) / (a - c), misconception: "eqn-number-sign" },
      ]),
      answerHelp: NUM_HELP,
      hints: [`Let the number be x: ${term(a, "x")} − ${b} = ${term(c, "x")} + ${d}.`, `Subtract ${term(c, "x")} from both sides, then add ${b}.`],
      solution: [`${term(a, "x")} − ${b} = ${term(c, "x")} + ${d}`, `Subtract ${term(c, "x")}: ${term(a - c, "x")} − ${b} = ${d}`, `Add ${b}: ${term(a - c, "x")} = ${d + b}`, `Divide by ${a - c}: x = ${s}`],
    };
  }
  const k = r.int(2, 4);
  const c = r.int(2, 9);
  const s = r.int(3, 12);
  const total = s + (k * s + c);
  const value = k * s + c;
  return {
    prompt: `${p1} has x books. ${p2} has ${c} more than ${k} times as many as ${p1}. Together they have ${total} books. How many books does ${p2} have?`,
    answer: { kind: "integer", value },
    wrongAnswers: wrongNums(value, [{ value: s, misconception: "form-gave-x" }]),
    answerHelp: NUM_HELP,
    hints: [`${p2} has ${term(k, "x")} + ${c}. Together: x + ${term(k, "x")} + ${c} = ${total}.`, `Solve for x, then work out ${p2}'s books: ${term(k, "x")} + ${c}.`],
    solution: [`x + ${term(k, "x")} + ${c} = ${total}`, `${k + 1}x + ${c} = ${total}, so ${k + 1}x = ${total - c} and x = ${s}`, `${p2} has ${k} × ${s} + ${c} = ${value} books.`],
  };
};

// ------------------------------------------------------------ rearranging formulae

const formula = (subject: string, value: string) => ({ kind: "formula" as const, subject, value });

const rearrange: Gen = (r, tier) => {
  if (tier === 1) {
    const kind = r.pick(["add", "subtract", "times", "two-step", "two-step"] as const);
    const k = r.int(2, 9);
    const c = r.int(1, 12);
    if (kind === "add" || kind === "subtract") {
      const plus = kind === "add";
      return {
        prompt: `Make x the subject of y = x ${plus ? "+" : "−"} ${c}`,
        answer: formula("x", `y ${plus ? "−" : "+"} ${c}`),
        wrongAnswers: [],
        wrongExpressions: [{ value: `y ${plus ? "+" : "−"} ${c}`, misconception: "rearr-wrong-inverse" }],
        answerHelp: FORMULA_HELP,
        hints: [`Get x on its own. ${c} is ${plus ? "added to" : "taken away from"} x.`, `${plus ? "Subtract" : "Add"} ${c} on both sides.`],
        solution: [`y = x ${plus ? "+" : "−"} ${c}`, `${plus ? "Subtract" : "Add"} ${c} on both sides: y ${plus ? "−" : "+"} ${c} = x`, `So x = y ${plus ? "−" : "+"} ${c}`],
      };
    }
    if (kind === "times") {
      const v = r.pick([
        { f: "P", s: "s", text: "P = 4s (the perimeter of a square)", k: 4 },
        { f: "y", s: "x", text: `y = ${k}x`, k },
        { f: "c", s: "n", text: `c = ${k}n`, k },
      ]);
      return {
        prompt: `Make ${v.s} the subject of ${v.text}`,
        answer: formula(v.s, `${v.f}/${v.k}`),
        wrongAnswers: [],
        wrongExpressions: [
          { value: `${v.f} − ${v.k}`, misconception: "rearr-wrong-inverse" },
          { value: `${v.k}${v.f}`, misconception: "rearr-wrong-inverse" },
        ],
        answerHelp: FORMULA_HELP,
        hints: [`${v.s} is multiplied by ${v.k}.`, `Divide both sides by ${v.k}.`],
        solution: [`Divide both sides by ${v.k}: ${v.f} ÷ ${v.k} = ${v.s}`, `So ${v.s} = ${v.f}/${v.k}`],
      };
    }
    return {
      prompt: `Make x the subject of y = ${k}x + ${c}`,
      answer: formula("x", `(y − ${c})/${k}`),
      wrongAnswers: [],
      wrongExpressions: [
        { value: `(y + ${c})/${k}`, misconception: "rearr-wrong-inverse" },
        { value: `y/${k} − ${c}`, misconception: "rearr-wrong-order" },
        { value: `y − ${c}/${k}`, misconception: "rearr-divided-one-term" },
      ],
      answerHelp: FORMULA_HELP,
      hints: [`x is multiplied by ${k}, then ${c} is added. Undo the last step first.`, `Subtract ${c} from both sides: y − ${c} = ${k}x. Then divide both sides by ${k}.`],
      solution: [`Subtract ${c} from both sides: y − ${c} = ${k}x`, `Divide both sides by ${k}: (y − ${c})/${k} = x`, `So x = (y − ${c})/${k}`],
    };
  }

  const kind = r.pick(["lw", "suvat-a", "suvat-u", "bracket", "circle", "square", "fraction", "hire"] as const);
  const k = r.int(2, 6);
  const c = r.int(1, 9);
  if (kind === "lw") {
    return {
      prompt: "The area of a rectangle is A = lw. Make w the subject.",
      answer: formula("w", "A/l"),
      wrongAnswers: [],
      wrongExpressions: [
        { value: "A − l", misconception: "rearr-wrong-inverse" },
        { value: "Al", misconception: "rearr-wrong-inverse" },
      ],
      answerHelp: FORMULA_HELP,
      hints: ["lw means l × w.", "Divide both sides by l."],
      solution: ["A = l × w", "Divide both sides by l: A/l = w", "So w = A/l"],
    };
  }
  if (kind === "suvat-a") {
    return {
      prompt: "Make a the subject of v = u + at",
      answer: formula("a", "(v − u)/t"),
      wrongAnswers: [],
      wrongExpressions: [
        { value: "(v + u)/t", misconception: "rearr-wrong-inverse" },
        { value: "v/t − u", misconception: "rearr-wrong-order" },
        { value: "v − u/t", misconception: "rearr-divided-one-term" },
      ],
      answerHelp: FORMULA_HELP,
      hints: ["First get the at term on its own: subtract u from both sides.", "v − u = at. Now divide both sides by t."],
      solution: ["Subtract u from both sides: v − u = at", "Divide both sides by t: (v − u)/t = a", "So a = (v − u)/t"],
    };
  }
  if (kind === "suvat-u") {
    return {
      prompt: "Make u the subject of v = u + at",
      answer: formula("u", "v − at"),
      wrongAnswers: [],
      wrongExpressions: [{ value: "v + at", misconception: "rearr-wrong-inverse" }],
      answerHelp: FORMULA_HELP,
      hints: ["at is added to u.", "Subtract at from both sides."],
      solution: ["Subtract at from both sides: v − at = u", "So u = v − at"],
    };
  }
  if (kind === "bracket") {
    return {
      prompt: `Make x the subject of y = ${k}(x + ${c})`,
      answer: formula("x", `y/${k} − ${c}`),
      wrongAnswers: [],
      wrongExpressions: [
        { value: `y/${k} + ${c}`, misconception: "rearr-wrong-inverse" },
        { value: `(y − ${c})/${k}`, misconception: "rearr-wrong-order" },
      ],
      answerHelp: FORMULA_HELP,
      hints: [`The bracket is multiplied by ${k}. Divide both sides by ${k} first.`, `y/${k} = x + ${c}. Now subtract ${c}.`],
      solution: [`Divide both sides by ${k}: y/${k} = x + ${c}`, `Subtract ${c}: y/${k} − ${c} = x`, `So x = y/${k} − ${c}. (x = (y − ${k * c})/${k} is also right.)`],
    };
  }
  if (kind === "circle") {
    return {
      prompt: "The circumference of a circle is C = 2πr. Make r the subject.",
      answer: formula("r", "C/(2π)"),
      wrongAnswers: [],
      wrongExpressions: [
        { value: "C − 2π", misconception: "rearr-wrong-inverse" },
        { value: "C/2π", misconception: "rearr-divided-one-term" },
      ],
      answerHelp: FORMULA_HELP + " Type pi or π for π.",
      hints: ["2πr means 2 × π × r.", "Divide both sides by 2π. Put 2π in brackets underneath: C/(2π)."],
      solution: ["C = 2 × π × r", "Divide both sides by 2π: r = C/(2π)", "(C/2/π, or C ÷ 2π written as a fraction, is the same.)"],
    };
  }
  if (kind === "square") {
    return {
      prompt: "The area of a square is A = s². Make s the subject.",
      answer: formula("s", "√A"),
      wrongAnswers: [],
      wrongExpressions: [{ value: "A/2", misconception: "rearr-square-root" }],
      answerHelp: FORMULA_HELP,
      hints: ["s is squared. What undoes squaring?", "Take the square root of both sides."],
      solution: ["The opposite of squaring is square-rooting.", "Square-root both sides: s = √A (type sqrt(A))."],
    };
  }
  if (kind === "fraction") {
    return {
      prompt: `Make x the subject of y = x/${k} + ${c}`,
      answer: formula("x", `${k}(y − ${c})`),
      wrongAnswers: [],
      wrongExpressions: [
        { value: `${k}y − ${c}`, misconception: "rearr-wrong-order" },
        { value: `${k}(y + ${c})`, misconception: "rearr-wrong-inverse" },
      ],
      answerHelp: FORMULA_HELP,
      hints: [`x is divided by ${k}, then ${c} is added. Undo the + ${c} first.`, `y − ${c} = x/${k}. Now multiply both sides by ${k}.`],
      solution: [`Subtract ${c}: y − ${c} = x/${k}`, `Multiply both sides by ${k}: ${k}(y − ${c}) = x`, `So x = ${k}(y − ${c})`],
    };
  }
  const fee = r.pick([15, 20, 25, 30]);
  return {
    prompt: `The cost, £C, of hiring a bike for h hours is C = ${k}h + ${fee}. Make h the subject.`,
    answer: formula("h", `(C − ${fee})/${k}`),
    wrongAnswers: [],
    wrongExpressions: [
      { value: `(C + ${fee})/${k}`, misconception: "rearr-wrong-inverse" },
      { value: `C/${k} − ${fee}`, misconception: "rearr-wrong-order" },
    ],
    answerHelp: FORMULA_HELP,
    hints: [`h is multiplied by ${k}, then ${fee} is added. Undo the + ${fee} first.`, `C − ${fee} = ${k}h. Now divide by ${k}.`],
    solution: [`Subtract ${fee}: C − ${fee} = ${k}h`, `Divide by ${k}: h = (C − ${fee})/${k}`],
  };
};

// ------------------------------------------------------------ inequalities on a number line

const say = (n: number) => (n < 0 ? `negative ${-n}` : String(n));
function lineDescription(min: number, max: number, lower?: { value: number; inclusive: boolean }, upper?: { value: number; inclusive: boolean }): string {
  const circ = (b: { value: number; inclusive: boolean }) => `${b.inclusive ? "a filled" : "an open"} circle at ${say(b.value)}`;
  const base = `A number line from ${say(min)} to ${say(max)}`;
  if (lower && upper) return `${base}, with ${circ(lower)} and ${circ(upper)}, joined by a thick line.`;
  if (lower) return `${base}, with ${circ(lower)} and a thick line going right forever.`;
  if (upper) return `${base}, with ${circ(upper)} and a thick line going left forever.`;
  return `${base}.`;
}
function line(lower?: { value: number; inclusive: boolean }, upper?: { value: number; inclusive: boolean }): NumberLineSpec {
  const lo = Math.min(lower?.value ?? upper!.value, upper?.value ?? lower!.value);
  const hi = Math.max(lower?.value ?? upper!.value, upper?.value ?? lower!.value);
  const min = Math.min(lo - 3, -1);
  const max = Math.max(hi + 3, 1);
  return { min, max, lower, upper, description: lineDescription(min, max, lower, upper) };
}
const toInterval = (lower?: { value: number; inclusive: boolean }, upper?: { value: number; inclusive: boolean }): Interval => ({
  ...(lower ? { lower: { value: frac(lower.value), inclusive: lower.inclusive } } : {}),
  ...(upper ? { upper: { value: frac(upper.value), inclusive: upper.inclusive } } : {}),
});
const ineqText = (v: string, lower?: { value: number; inclusive: boolean }, upper?: { value: number; inclusive: boolean }) => {
  if (lower && upper) return `${signed(lower.value)} ${lower.inclusive ? "≤" : "<"} ${v} ${upper.inclusive ? "≤" : "<"} ${signed(upper.value)}`;
  if (lower) return `${v} ${lower.inclusive ? "≥" : ">"} ${signed(lower.value)}`;
  return `${v} ${upper!.inclusive ? "≤" : "<"} ${signed(upper!.value)}`;
};
const ineqAnswer = (variable: string, value: Interval) => ({
  kind: "inequality" as const,
  variable,
  value,
  inclusiveMisconception: "ineq-circle",
  directionMisconception: "ineq-direction",
  equalsMisconception: "ineq-used-equals",
});
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

const inequalitiesLine: Gen = (r, tier) => {
  if (tier === 1) {
    const kind = r.pick(["read", "read", "list", "words"] as const);
    if (kind === "read") {
      const b = { value: r.int(-4, 5), inclusive: r.next() < 0.5 };
      const up = r.next() < 0.5;
      const [lower, upper] = up ? [undefined, b] : [b, undefined];
      const text = ineqText("x", lower, upper);
      return {
        prompt: "Write down the inequality shown on the number line. Use x.",
        visual: { kind: "numberline", line: line(lower, upper) },
        answer: ineqAnswer("x", toInterval(lower, upper)),
        wrongAnswers: [],
        answerHelp: INEQ_HELP,
        hints: [`The circle is at ${signed(b.value)}. It is ${b.inclusive ? "filled in, so " + signed(b.value) + " is included" : "open, so " + signed(b.value) + " is not included"}.`, `The line goes to the ${up ? "left, towards smaller numbers" : "right, towards bigger numbers"}.`],
        solution: [`${b.inclusive ? "Filled" : "Open"} circle at ${signed(b.value)}: use ${up ? (b.inclusive ? "≤" : "<") : b.inclusive ? "≥" : ">"}.`, `The line points to ${up ? "smaller" : "bigger"} numbers.`, `Answer: ${text}`],
      };
    }
    if (kind === "list") {
      const a = r.int(-4, 2);
      const b = a + r.int(2, 4);
      const strictLow = r.next() < 0.6;
      const strictHigh = !strictLow || r.next() < 0.3;
      const from = strictLow ? a + 1 : a;
      const to = strictHigh ? b - 1 : b;
      const value = range(from, to);
      const text = `${signed(a)} ${strictLow ? "<" : "≤"} n ${strictHigh ? "<" : "≤"} ${signed(b)}`;
      return {
        prompt: `n is an integer. List all the values of n such that ${text}`,
        answer: { kind: "list", value, noun: "integers", missingMisconception: "ineq-list-missed", extraMisconception: "ineq-list-endpoint" },
        wrongAnswers: [],
        answerHelp: "Type whole numbers with commas between them, like -1, 0, 1, 2.",
        hints: [`Integers are whole numbers, including 0 and negatives. ${strictLow ? `${signed(a)} < n means ${signed(a)} itself is not included.` : `${signed(a)} ≤ n means ${signed(a)} is included.`}`, `${strictHigh ? `n < ${signed(b)} means ${signed(b)} is not included.` : `n ≤ ${signed(b)} means ${signed(b)} is included.`} List everything in between.`],
        solution: [`From ${signed(from)} up to ${signed(to)}.`, `Answer: ${value.map(signed).join(", ")}`],
      };
    }
    const v = r.int(-5, 9);
    const w = r.pick([
      { words: `x is greater than ${signed(v)}`, lower: { value: v, inclusive: false } },
      { words: `x is less than ${signed(v)}`, upper: { value: v, inclusive: false } },
      { words: `x is at least ${signed(v)}`, lower: { value: v, inclusive: true } },
      { words: `x is at most ${signed(v)}`, upper: { value: v, inclusive: true } },
    ] as { words: string; lower?: { value: number; inclusive: boolean }; upper?: { value: number; inclusive: boolean } }[]);
    const text = ineqText("x", w.lower, w.upper);
    return {
      prompt: `Write this as an inequality: ${w.words}.`,
      answer: ineqAnswer("x", toInterval(w.lower, w.upper)),
      wrongAnswers: [],
      answerHelp: INEQ_HELP,
      hints: ["< means less than, > means greater than. ≤ and ≥ include 'or equal to'.", "'At least' means that number or more. 'At most' means that number or less."],
      solution: [`${w.words[0].toUpperCase() + w.words.slice(1)}.`, `Answer: ${text}`],
    };
  }

  const kind = r.pick(["read-double", "list-double", "is-solution", "smallest"] as const);
  if (kind === "read-double") {
    const a = r.int(-5, 2);
    const b = a + r.int(2, 5);
    const lower = { value: a, inclusive: r.next() < 0.5 };
    const upper = { value: b, inclusive: r.next() < 0.5 };
    return {
      prompt: "Write down the inequality shown on the number line. Use x.",
      visual: { kind: "numberline", line: line(lower, upper) },
      answer: ineqAnswer("x", toInterval(lower, upper)),
      wrongAnswers: [],
      answerHelp: "Type an inequality like -2 < x <= 3. Type <= for ≤ and >= for ≥.",
      hints: ["x is between two numbers, so write it as number, sign, x, sign, number.", `Left circle at ${signed(a)} is ${lower.inclusive ? "filled (≤)" : "open (<)"}. Right circle at ${signed(b)} is ${upper.inclusive ? "filled (≤)" : "open (<)"}.`],
      solution: [`x is between ${signed(a)} and ${signed(b)}.`, `Answer: ${ineqText("x", lower, upper)}`],
    };
  }
  if (kind === "list-double") {
    const a = r.int(-6, -1);
    const b = Math.max(r.int(0, 4), a + 2);
    const strictLow = r.next() < 0.5;
    const strictHigh = r.next() < 0.5;
    const value = range(strictLow ? a + 1 : a, strictHigh ? b - 1 : b);
    const text = `${signed(a)} ${strictLow ? "<" : "≤"} n ${strictHigh ? "<" : "≤"} ${b}`;
    return {
      prompt: `n is an integer. List all the values of n such that ${text}`,
      answer: { kind: "list", value, noun: "integers", missingMisconception: "ineq-list-missed", extraMisconception: "ineq-list-endpoint" },
      wrongAnswers: [],
      answerHelp: "Type whole numbers with commas between them, like -1, 0, 1, 2.",
      hints: ["Remember 0 is an integer.", `${strictLow ? `${signed(a)} is not included` : `${signed(a)} is included`}, and ${strictHigh ? `${b} is not included` : `${b} is included`}.`],
      solution: [`Answer: ${value.map(signed).join(", ")}`],
    };
  }
  if (kind === "is-solution") {
    const b = r.int(-4, 8);
    const inclusive = r.next() < 0.5;
    const up = r.next() < 0.5;
    const text = up ? `x ${inclusive ? "≤" : "<"} ${signed(b)}` : `x ${inclusive ? "≥" : ">"} ${signed(b)}`;
    return {
      prompt: `Is x = ${signed(b)} a solution of ${text}?`,
      answer: { kind: "choice", options: ["Yes", "No"], correctIndex: inclusive ? 0 : 1 },
      wrongAnswers: [{ value: inclusive ? 1 : 0, misconception: inclusive ? "ineq-list-missed" : "ineq-list-endpoint" }],
      hints: ["Is the boundary number included? Look at the sign.", "≤ and ≥ include the number. < and > don't."],
      solution: [inclusive ? `${text} includes ${signed(b)} itself ("or equal to"). So yes.` : `${text} means strictly ${up ? "less" : "greater"} than ${signed(b)}, so ${signed(b)} itself doesn't count. So no.`],
    };
  }
  const b = r.int(-6, 6);
  const up = r.next() < 0.5;
  const value = up ? b - 1 : b + 1;
  const text = up ? `x < ${signed(b)}` : `x > ${signed(b)}`;
  return {
    prompt: `What is the ${up ? "largest" : "smallest"} integer that satisfies ${text}?`,
    answer: { kind: "integer", value },
    wrongAnswers: wrongNums(value, [
      { value: b, misconception: "ineq-largest-integer" },
      { value: up ? b + 1 : b - 1, misconception: "ineq-direction" },
    ]),
    answerHelp: NUM_HELP,
    hints: [`${signed(b)} itself doesn't count, because the sign is ${up ? "<" : ">"}.`, `Which whole number is just ${up ? "below" : "above"} ${signed(b)}?`],
    solution: [`x must be ${up ? "less" : "greater"} than ${signed(b)}, not equal to it.`, `The ${up ? "largest" : "smallest"} whole number that works is ${signed(value)}.`],
  };
};

// ------------------------------------------------------------ solving inequalities

const OPS = ["<", ">", "≤", "≥"] as const;
type Op = (typeof OPS)[number];
const boundOf = (op: Op, s: number): Interval =>
  op === "<" || op === "≤" ? { upper: { value: frac(s), inclusive: op === "≤" } } : { lower: { value: frac(s), inclusive: op === "≥" } };

const solveInequalities: Gen = (r, tier) => {
  const x = "x";
  const op = r.pick(OPS);
  if (tier === 1) {
    const kind = r.pick(["two-step", "two-step", "bracket"] as const);
    const a = r.int(2, 6);
    const s = r.int(1, 9);
    if (kind === "two-step") {
      const b = r.int(1, 12);
      const minus = r.next() < 0.3;
      const c = a * s + (minus ? -b : b);
      const lhs = expr([[a, x], [minus ? -b : b, ""]]);
      return {
        prompt: `Solve ${lhs} ${op} ${signed(c)}`,
        answer: ineqAnswer(x, boundOf(op, s)),
        wrongAnswers: wrongNums(s, [
          { value: minus ? c + b : c - b, misconception: "ineq-solve-step" },
          { value: minus ? (c - b) / a : (c + b) / a, misconception: "ineq-solve-step" },
        ]),
        answerHelp: INEQ_HELP,
        hints: [`Solve it like an equation, but keep the ${op} sign. First ${minus ? `add ${b} to` : `subtract ${b} from`} both sides.`, `${term(a, x)} ${op} ${signed(minus ? c + b : c - b)}. Now divide both sides by ${a}.`],
        solution: [`${minus ? `Add ${b} to` : `Subtract ${b} from`} both sides: ${term(a, x)} ${op} ${signed(minus ? c + b : c - b)}`, `Divide both sides by ${a}: ${x} ${op} ${s}`],
      };
    }
    const p = r.int(1, 6);
    const c = a * (s + p);
    return {
      prompt: `Solve ${a}(${lin(x, p)}) ${op} ${c}`,
      answer: ineqAnswer(x, boundOf(op, s)),
      wrongAnswers: wrongNums(s, [
        { value: (c - p) / a, misconception: "eqn-expand-first-only" },
        { value: c / a + p, misconception: "ineq-solve-step" },
      ]),
      answerHelp: INEQ_HELP,
      hints: [`Divide both sides by ${a} first, keeping the ${op} sign.`, `${lin(x, p)} ${op} ${c / a}. Now subtract ${p}.`],
      solution: [`Divide both sides by ${a}: ${lin(x, p)} ${op} ${c / a}`, `Subtract ${p}: ${x} ${op} ${s}`],
    };
  }

  const kind = r.pick(["both-sides", "both-sides", "largest", "negative"] as const);
  if (kind === "largest") {
    const a = r.int(2, 6);
    const b = r.int(1, 9);
    const s = r.int(2, 12);
    const c = a * s + b;
    return {
      prompt: `What is the largest integer x that satisfies ${term(a, x)} + ${b} < ${c}?`,
      answer: { kind: "integer", value: s - 1 },
      wrongAnswers: wrongNums(s - 1, [{ value: s, misconception: "ineq-largest-integer" }]),
      answerHelp: NUM_HELP,
      hints: [`First solve the inequality: subtract ${b}, then divide by ${a}.`, `x < ${s}. Which integer is the largest one below ${s}?`],
      solution: [`${term(a, x)} < ${c - b}, so x < ${s}.`, `${s} itself isn't allowed (it's <, not ≤).`, `The largest integer is ${s - 1}.`],
    };
  }
  if (kind === "negative") {
    const a = r.int(2, 6);
    const s = -r.int(1, 7);
    const b = r.int(1, 9);
    const c = a * s + b;
    return {
      prompt: `Solve ${term(a, x)} + ${b} ${op} ${signed(c)}`,
      answer: ineqAnswer(x, boundOf(op, s)),
      wrongAnswers: wrongNums(s, [
        { value: -s, misconception: "eqn-negative-slip" },
        { value: (c + b) / a, misconception: "ineq-solve-step" },
      ]),
      answerHelp: INEQ_HELP,
      hints: [`Subtract ${b} from both sides. The right side becomes negative.`, `${term(a, x)} ${op} ${signed(c - b)}. Divide both sides by ${a}. Dividing by a positive number doesn't change the sign.`],
      solution: [`Subtract ${b}: ${term(a, x)} ${op} ${signed(c - b)}`, `Divide by ${a}: ${x} ${op} ${signed(s)}`],
    };
  }
  const c = r.int(1, 4);
  const a = c + r.int(1, 4);
  const b = nonZero(r, -9, 9);
  const s = nonZero(r, -5, 8);
  const d = (a - c) * s + b;
  if (d === 0) return solveInequalities(r, tier);
  return {
    prompt: `Solve ${expr([[a, x], [b, ""]])} ${op} ${expr([[c, x], [d, ""]])}`,
    answer: ineqAnswer(x, boundOf(op, s)),
    wrongAnswers: wrongNums(s, [
      { value: (d - b) / (a + c), misconception: "eqn-added-x-terms" },
      { value: (d + b) / (a - c), misconception: "ineq-solve-step" },
    ]),
    answerHelp: INEQ_HELP,
    hints: [`Subtract ${term(c, x)} from both sides first, keeping the ${op} sign.`, `${expr([[a - c, x], [b, ""]])} ${op} ${signed(d)}. Now ${b > 0 ? `subtract ${b}` : `add ${-b}`}, then divide by ${a - c}.`],
    solution: [
      `Subtract ${term(c, x)}: ${expr([[a - c, x], [b, ""]])} ${op} ${signed(d)}`,
      `${b > 0 ? `Subtract ${b}` : `Add ${-b}`}: ${term(a - c, x)} ${op} ${signed(d - b)}`,
      `Divide by ${a - c}: ${x} ${op} ${signed(s)}`,
    ],
  };
};

// ------------------------------------------------------------ simultaneous equations

const simultaneous: Gen = (r, tier) => {
  if (tier === 1) {
    const kind = r.pick(["add", "subtract", "subtract", "which"] as const);
    if (kind === "which") {
      const plus = r.next() < 0.5;
      const a = r.int(2, 5);
      const [x, y] = [r.int(1, 6), r.int(1, 6)];
      const e1 = `${term(a, "x")} + y = ${a * x + y}`;
      const e2 = plus ? `x − y = ${signed(x - y)}` : `x + y = ${x + y}`;
      return {
        prompt: `To eliminate y from these equations, should you add them or subtract one from the other?  ${e1}  and  ${e2}`,
        answer: { kind: "choice", options: ["Add them", "Subtract them"], correctIndex: plus ? 0 : 1 },
        wrongAnswers: [{ value: plus ? 1 : 0, misconception: "sim-added-wrong" }],
        hints: ["Look at the y terms in each equation.", "Same signs (+y and +y): subtract. Different signs (+y and −y): add."],
        solution: [plus ? "One has +y and the other −y. Adding makes them cancel: +y + (−y) = 0." : "Both have +y. Subtracting makes them cancel: y − y = 0.", plus ? "So add them." : "So subtract them."],
      };
    }
    const x = r.int(2, 9);
    const y = r.int(1, x - 1);
    if (kind === "add") {
      return {
        prompt: `Solve the simultaneous equations:  x + y = ${x + y}  and  x − y = ${x - y}`,
        answer: { kind: "assignment", values: { x, y } },
        wrongAnswers: [{ value: [y, x], misconception: "sim-swapped" }],
        answerHelp: SIM_HELP,
        hints: ["The y terms are +y and −y. Add the equations to make them cancel.", `2x = ${2 * x}, so x = ${x}. Put that back into x + y = ${x + y}.`],
        solution: [`Add the equations: 2x = ${2 * x}`, `x = ${x}`, `Substitute: ${x} + y = ${x + y}, so y = ${y}`, `Check: ${x} − ${y} = ${x - y} ✓`],
      };
    }
    const a = r.int(2, 5);
    const b = r.int(1, a - 1);
    const yy = r.int(1, 9);
    return {
      prompt: `Solve the simultaneous equations:  ${term(a, "x")} + y = ${a * x + yy}  and  ${term(b, "x")} + y = ${b * x + yy}`,
      answer: { kind: "assignment", values: { x, y: yy } },
      wrongAnswers: x === yy ? [] : [{ value: [yy, x], misconception: "sim-swapped" }],
      answerHelp: SIM_HELP,
      hints: ["Both have +y. Subtract the second equation from the first so the y's cancel.", `${term(a - b, "x")} = ${(a - b) * x}. Find x, then put it back into one equation.`],
      solution: [`Subtract: ${term(a - b, "x")} = ${(a - b) * x}`, ...(a - b === 1 ? [] : [`x = ${x}`]), `Substitute into ${term(b, "x")} + y = ${b * x + yy}: ${b * x} + y = ${b * x + yy}, so y = ${yy}`, `Check in the first: ${a} × ${x} + ${yy} = ${a * x + yy} ✓`],
    };
  }

  // Multiply one equation so a letter matches, then eliminate.
  const x = nonZero(r, -4, 8);
  const y = nonZero(r, -4, 8);
  const p = r.int(1, 3);
  const q = r.int(1, 3);
  const k = r.int(2, 3);
  let a = k * p + r.pick([-2, -1, 1, 2]);
  if (a <= 0) a = k * p + 1;
  const b = k * q;
  // eq1: a x + b y = c1;  eq2: p x + q y = c2.  Multiply eq2 by k: kp x + kq y. Subtract: (a − kp) x = c1 − k c2.
  const c1 = a * x + b * y;
  const c2 = p * x + q * y;
  const e1 = `${expr([[a, "x"], [b, "y"]])} = ${signed(c1)}`;
  const e2 = `${expr([[p, "x"], [q, "y"]])} = ${signed(c2)}`;
  const diff = a - k * p;
  return {
    prompt: `Solve the simultaneous equations:  ${e1}  and  ${e2}`,
    answer: { kind: "assignment", values: { x, y } },
    wrongAnswers: x === y ? [] : [{ value: [y, x], misconception: "sim-swapped" }],
    answerHelp: SIM_HELP,
    hints: [`Multiply the second equation by ${k}, so both have ${term(b, "y")}.`, `${expr([[k * p, "x"], [b, "y"]])} = ${signed(k * c2)}. Now subtract it from the first equation to eliminate y.`],
    solution: [
      `Second equation × ${k}: ${expr([[k * p, "x"], [b, "y"]])} = ${signed(k * c2)}`,
      `First minus this: ${diff === 1 ? "x" : diff === -1 ? "−x" : `${signed(diff)}x`} = ${signed(c1 - k * c2)}`,
      ...(diff === 1 ? [] : [`x = ${signed(x)}`]),
      `Substitute into ${e2}: ${p === 1 ? signed(x) : `${p} × ${par(x)}`} + ${q === 1 ? "y" : `${term(q, "y")}`} = ${signed(c2)}, so y = ${signed(y)}`,
      `Check in the first equation: ${a} × ${par(x)} + ${b} × ${par(y)} = ${signed(c1)} ✓`,
    ],
  };
};

// ------------------------------------------------------------ solving quadratics

const rootsAnswer = (values: number[], missing = "quad-one-root") => ({ kind: "roots" as const, variable: "x", values, missingMisconception: missing });
const bracketPair = (p: number, q: number) => `(${lin("x", p)})(${lin("x", q)})`;

const solveQuadratic: Gen = (r, tier) => {
  if (tier === 1) {
    const kind = r.pick(["factorised", "factorised", "square"] as const);
    if (kind === "square") {
      const k = r.int(2, 12);
      return {
        prompt: `Solve x² = ${k * k}`,
        answer: rootsAnswer([k, -k]),
        wrongAnswers: [{ value: [k * k / 2], misconception: "rearr-square-root" }].filter((w) => Number.isInteger(w.value[0]) && w.value[0] !== k),
        answerHelp: ROOTS_HELP,
        hints: [`Which number squared makes ${k * k}?`, `${k}² = ${k * k}, but also (−${k})² = ${k * k}. There are two answers.`],
        solution: [`${k} × ${k} = ${k * k}, and −${k} × (−${k}) = ${k * k} too.`, `x = ${k} or x = −${k}`],
      };
    }
    const p = nonZero(r, -9, 9);
    let q = nonZero(r, -9, 9);
    while (q === p || q === -p) q = nonZero(r, -9, 9);
    return {
      prompt: `Solve ${bracketPair(p, q)} = 0`,
      answer: rootsAnswer([-p, -q]),
      wrongAnswers: [{ value: [p, q], misconception: "quad-root-sign" }],
      answerHelp: ROOTS_HELP,
      hints: ["If two things multiply to make 0, one of them must be 0.", `So ${lin("x", p)} = 0 or ${lin("x", q)} = 0. Solve each one.`],
      solution: [`Either ${lin("x", p)} = 0, so x = ${signed(-p)}`, `or ${lin("x", q)} = 0, so x = ${signed(-q)}`, `x = ${signed(-p)} or x = ${signed(-q)}`],
    };
  }

  const kind = r.pick(["trinomial", "trinomial", "common-x", "dots"] as const);
  if (kind === "common-x") {
    const b = nonZero(r, -9, 9);
    const shown = `${expr([[1, "x²"], [b, "x"]])} = 0`;
    return {
      prompt: `Solve ${shown}`,
      answer: rootsAnswer([0, -b], "quad-lost-zero"),
      wrongAnswers: [{ value: [0, b], misconception: "quad-root-sign" }],
      answerHelp: ROOTS_HELP,
      hints: ["Both terms have x. Factorise by taking x out.", `x(${lin("x", b)}) = 0. So x = 0 or ${lin("x", b)} = 0.`],
      solution: [`Factorise: x(${lin("x", b)}) = 0`, `Either x = 0, or ${lin("x", b)} = 0 so x = ${signed(-b)}`, `x = 0 or x = ${signed(-b)}`],
    };
  }
  if (kind === "dots") {
    const k = r.int(2, 11);
    return {
      prompt: `Solve x² − ${k * k} = 0`,
      answer: rootsAnswer([k, -k]),
      wrongAnswers: [],
      answerHelp: ROOTS_HELP,
      hints: [`Factorise: x² − ${k * k} = (x + ${k})(x − ${k}).`, "Each bracket can be 0. Or: x² = " + k * k + ", and a square root can be positive or negative."],
      solution: [`(x + ${k})(x − ${k}) = 0`, `x = −${k} or x = ${k}`],
    };
  }
  const p = nonZero(r, -9, 9);
  let q = nonZero(r, -9, 9);
  while (q === p || p + q === 0) q = nonZero(r, -9, 9);
  const shown = `${expr([[1, "x²"], [p + q, "x"], [p * q, ""]])} = 0`;
  return {
    prompt: `Solve ${shown}`,
    answer: rootsAnswer([-p, -q]),
    wrongAnswers: [{ value: [p, q], misconception: "quad-root-sign" }],
    answerHelp: ROOTS_HELP,
    hints: [`Factorise first: two numbers that multiply to ${signed(p * q)} and add to ${signed(p + q)}.`, `It factorises to ${bracketPair(Math.min(p, q), Math.max(p, q))} = 0. Now set each bracket to 0.`],
    solution: [`Factorise: ${bracketPair(Math.min(p, q), Math.max(p, q))} = 0`, `${lin("x", p)} = 0 gives x = ${signed(-p)}`, `${lin("x", q)} = 0 gives x = ${signed(-q)}`, `x = ${signed(-p)} or x = ${signed(-q)}`],
  };
};

/** Tidy the wording: drop "Divide by 1" steps, and say "twice" rather than "2 times". */
function tidy(gen: Gen): Gen {
  const fix = (t: string) => t.replace(/\b2 times as many\b/g, "twice as many").replace(/\b2 times the number\b/g, "twice the number");
  return (r, tier) => {
    const q = gen(r, tier);
    return { ...q, prompt: fix(q.prompt), hints: q.hints.map(fix), solution: q.solution.filter((l) => !/^Divide (both sides )?by 1:/.test(l)).map(fix) };
  };
}

export const EQUATION_GENERATORS: Record<string, Gen> = {
  "alg-solve-brackets": tidy(solveBrackets),
  "alg-solve-both-sides": tidy(solveBothSides),
  "alg-form-expressions": tidy(formExpressions),
  "alg-form-equations": tidy(formEquations),
  "alg-rearrange": tidy(rearrange),
  "alg-inequalities-number-line": tidy(inequalitiesLine),
  "alg-solve-inequalities": tidy(solveInequalities),
  "alg-simultaneous": tidy(simultaneous),
  "alg-solve-quadratic": tidy(solveQuadratic),
};
