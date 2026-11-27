/**
 * Question generators for the early algebra chain.
 *
 * Numbers stay positive and whole, because negative numbers aren't built yet.
 * Expression answers are marked mathematically (engine/algebra.ts), so any
 * correct order is accepted ("2 + 3x" or "3x + 2"); answers that are equal but
 * untidy ("n × 5", "3x + 5x") are marked "not simplified" with the reason.
 * Letters avoid i, l and o, which are easy to confuse with 1 and 0.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher.
 */

import type { Rng } from "@/engine/random";
import type { Question } from "@/engine/types";

export type Tier = 1 | 2;
type Gen = (r: Rng, tier: Tier) => Omit<Question, "id" | "skillId">;

const LETTERS = ["a", "c", "k", "m", "n", "p", "t", "w", "y"] as const;
const EXPR_HELP = "Type an expression like 3x + 2. Leave out the × sign. For squared, type x^2 or x².";

/** "3x", "x", "12". The term's coefficient must be positive. */
export function term(c: number, v = ""): string {
  if (v === "") return String(c);
  return c === 1 ? v : `${c}${v}`;
}

/** Join signed terms: [[3,"x"],[-2,""]] → "3x − 2". Zero terms are dropped. */
export function expr(terms: [number, string][]): string {
  const kept = terms.filter(([c]) => c !== 0);
  if (kept.length === 0) return "0";
  return kept
    .map(([c, v], i) => {
      const t = term(Math.abs(c), v);
      if (i === 0) return c < 0 ? `−${t}` : t;
      return c < 0 ? ` − ${t}` : ` + ${t}`;
    })
    .join("");
}

/** Two different letters. */
function twoLetters(r: Rng): [string, string] {
  const a = r.pick(LETTERS);
  let b = r.pick(LETTERS);
  while (b === a) b = r.pick(LETTERS);
  return [a, b].sort() as [string, string];
}

/** Drop wrong numbers that equal the answer, aren't whole and positive, or repeat. */
function wrongNums(correct: number, wrong: { value: number; misconception: string }[]) {
  const seen = new Set<number>([correct]);
  return wrong.filter((w) => {
    if (!Number.isInteger(w.value) || w.value < 0 || seen.has(w.value)) return false;
    seen.add(w.value);
    return true;
  });
}

const exprAnswer = (value: string, form: "notation" | "simplified" = "simplified") => ({ kind: "expression" as const, value, form });

// ------------------------------------------------------------ notation

const notation: Gen = (r, tier) => {
  const n = r.pick(LETTERS);
  const k = r.int(2, 9);
  if (tier === 1) {
    const kind = r.pick(["times", "add", "square", "pair", "number-after"] as const);
    if (kind === "times") {
      return {
        prompt: `Write this in algebra: ${n} multiplied by ${k}.`,
        answer: exprAnswer(term(k, n), "notation"),
        wrongAnswers: [],
        wrongExpressions: [{ value: `${n} + ${k}`, misconception: "alg-times-as-add" }],
        answerHelp: EXPR_HELP,
        hints: [`In algebra we leave out the × sign.`, `The number goes in front of the letter.`],
        solution: [`${n} × ${k} is written with the number first and no × sign.`, `Answer: ${term(k, n)}`],
      };
    }
    if (kind === "add") {
      return {
        prompt: `Write this in algebra: add ${k} to ${n}.`,
        answer: exprAnswer(`${n} + ${k}`, "notation"),
        wrongAnswers: [],
        wrongExpressions: [{ value: term(k, n), misconception: "alg-times-as-add" }],
        answerHelp: EXPR_HELP,
        hints: [`Adding stays as a + sign in algebra.`, `Careful: ${term(k, n)} would mean ${k} × ${n}.`],
        solution: [`Adding ${k} to ${n} is written with a + sign.`, `Answer: ${n} + ${k}`],
      };
    }
    if (kind === "square") {
      return {
        prompt: `Write this in algebra: ${n} multiplied by itself.`,
        answer: exprAnswer(`${n}²`, "notation"),
        wrongAnswers: [],
        wrongExpressions: [{ value: `2${n}`, misconception: "alg-square-as-double" }],
        answerHelp: EXPR_HELP,
        hints: [`${n} × ${n} uses a small 2, called "squared".`, `Type it as ${n}^2.`],
        solution: [`${n} × ${n} is "${n} squared".`, `Answer: ${n}²`],
      };
    }
    if (kind === "pair") {
      const [a, b] = twoLetters(r);
      return {
        prompt: `Simplify ${a} × ${b}.`,
        answer: exprAnswer(`${a}${b}`, "notation"),
        wrongAnswers: [],
        wrongExpressions: [{ value: `${a} + ${b}`, misconception: "alg-times-as-add" }],
        answerHelp: EXPR_HELP,
        hints: [`Leave out the × sign and write the letters next to each other.`, `We usually put letters in alphabetical order.`],
        solution: [`${a} × ${b} is written without the × sign.`, `Answer: ${a}${b}`],
      };
    }
    return {
      prompt: `Simplify ${n} × ${k}.`,
      answer: exprAnswer(term(k, n), "notation"),
      wrongAnswers: [],
      wrongExpressions: [{ value: `${n} + ${k}`, misconception: "alg-times-as-add" }],
      answerHelp: EXPR_HELP,
      hints: [`Leave out the × sign.`, `The number goes first: ${n} × ${k} = ${k} × ${n}.`],
      solution: [`Multiplying can be done in any order, so ${n} × ${k} = ${k} × ${n}.`, `Write it with the number first: ${term(k, n)}`],
    };
  }

  const kind = r.pick(["times-then-add", "add-then-times", "three", "square-k"] as const);
  const c = r.int(2, 9);
  if (kind === "times-then-add") {
    return {
      prompt: `Write this in algebra: multiply ${n} by ${k}, then add ${c}.`,
      answer: exprAnswer(`${term(k, n)} + ${c}`, "notation"),
      wrongAnswers: [],
      wrongExpressions: [
        { value: `${n} + ${k + c}`, misconception: "alg-times-as-add" },
        { value: `${k}(${n} + ${c})`, misconception: "alg-machine-order" },
      ],
      answerHelp: EXPR_HELP,
      hints: [`First: ${n} multiplied by ${k} is ${term(k, n)}.`, `Then add ${c} on the end.`],
      solution: [`${n} multiplied by ${k} is ${term(k, n)}.`, `Add ${c}: ${term(k, n)} + ${c}`],
    };
  }
  if (kind === "add-then-times") {
    return {
      prompt: `Write this in algebra: add ${c} to ${n}, then multiply the result by ${k}.`,
      answer: exprAnswer(`${k}(${n} + ${c})`, "notation"),
      wrongAnswers: [],
      wrongExpressions: [{ value: `${term(k, n)} + ${c}`, misconception: "alg-missing-brackets" }],
      answerHelp: EXPR_HELP + " Use brackets if you need them.",
      hints: [`First: add ${c} to ${n} gives ${n} + ${c}.`, `The whole of ${n} + ${c} is multiplied by ${k}, so it needs brackets.`],
      solution: [`Add first: ${n} + ${c}.`, `Multiply all of it by ${k}, using brackets: ${k}(${n} + ${c})`],
    };
  }
  if (kind === "three") {
    const [a, b] = twoLetters(r);
    return {
      prompt: `Simplify ${b} × ${k} × ${a}.`,
      answer: exprAnswer(`${k}${a}${b}`, "notation"),
      wrongAnswers: [],
      wrongExpressions: [{ value: `${k} + ${a} + ${b}`, misconception: "alg-times-as-add" }],
      answerHelp: EXPR_HELP,
      hints: [`Number first, then the letters.`, `Letters are usually written in alphabetical order.`],
      solution: [`Multiplying can be done in any order: ${k} × ${a} × ${b}.`, `Leave out the × signs: ${k}${a}${b}`],
    };
  }
  return {
    prompt: `Simplify ${n} × ${n} × ${k}.`,
    answer: exprAnswer(`${k}${n}²`, "notation"),
    wrongAnswers: [],
    wrongExpressions: [
      { value: `${2 * k}${n}`, misconception: "alg-x-times-x" },
      { value: `${k + 2}${n}`, misconception: "alg-x-times-x" },
    ],
    answerHelp: EXPR_HELP,
    hints: [`${n} × ${n} = ${n}².`, `Put the number in front: ${k} × ${n}².`],
    solution: [`${n} × ${n} = ${n}².`, `So ${n} × ${n} × ${k} = ${k} × ${n}² = ${k}${n}²`],
  };
};

// ------------------------------------------------------------ collecting like terms

const collect: Gen = (r, tier) => {
  const [x, y] = r.next() < 0.5 ? (["x", "y"] as const) : twoLetters(r);
  if (tier === 1) {
    const kind = r.pick(["one-letter", "two-letters", "with-number"] as const);
    if (kind === "one-letter") {
      const a = r.int(2, 9);
      const b = r.int(2, 9);
      return {
        prompt: `Simplify ${term(a, x)} + ${term(b, x)}.`,
        answer: exprAnswer(term(a + b, x)),
        wrongAnswers: [],
        wrongExpressions: [{ value: `${a + b}${x}²`, misconception: "alg-added-powers" }],
        answerHelp: EXPR_HELP,
        hints: [`Both terms are ${x} terms, so they are like terms.`, `${a} lots of ${x} plus ${b} lots of ${x} is how many lots of ${x}?`],
        solution: [`${term(a, x)} and ${term(b, x)} are like terms (both ${x}).`, `${a} + ${b} = ${a + b}, so the answer is ${term(a + b, x)}.`],
      };
    }
    if (kind === "two-letters") {
      const [a, b, c, d] = [r.int(2, 7), r.int(2, 7), r.int(1, 5), r.int(1, 5)];
      const ans = expr([
        [a + c, x],
        [b + d, y],
      ]);
      return {
        prompt: `Simplify ${term(a, x)} + ${term(b, y)} + ${term(c, x)} + ${term(d, y)}.`,
        answer: exprAnswer(ans),
        wrongAnswers: [],
        wrongExpressions: [{ value: `${a + b + c + d}${x}${y}`, misconception: "alg-joined-unlike" }],
        answerHelp: EXPR_HELP,
        hints: [`Group the ${x} terms together and the ${y} terms together.`, `${term(a, x)} + ${term(c, x)} = ?, and ${term(b, y)} + ${term(d, y)} = ?`],
        solution: [
          `${x} terms: ${term(a, x)} + ${term(c, x)} = ${term(a + c, x)}`,
          `${y} terms: ${term(b, y)} + ${term(d, y)} = ${term(b + d, y)}`,
          `These are unlike terms, so they stay separate: ${ans}`,
        ],
      };
    }
    const [a, b, c] = [r.int(2, 7), r.int(2, 9), r.int(1, 6)];
    const ans = expr([
      [a + c, x],
      [b, ""],
    ]);
    return {
      prompt: `Simplify ${term(a, x)} + ${b} + ${term(c, x)}.`,
      answer: exprAnswer(ans),
      wrongAnswers: [],
      wrongExpressions: [{ value: term(a + b + c, x), misconception: "alg-joined-unlike" }],
      answerHelp: EXPR_HELP,
      hints: [`${b} is a number term. It isn't a like term with the ${x} terms.`, `Add the ${x} terms, and leave the ${b} as it is.`],
      solution: [`${x} terms: ${term(a, x)} + ${term(c, x)} = ${term(a + c, x)}`, `The number ${b} stays separate: ${ans}`],
    };
  }

  const kind = r.pick(["minus-x", "minus-y", "squared", "xy"] as const);
  if (kind === "minus-x") {
    const c = r.int(1, 5);
    const a = c + r.int(1, 6);
    const [b, d] = [r.int(2, 9), r.int(1, 9)];
    const ans = expr([
      [a - c, x],
      [b + d, ""],
    ]);
    return {
      prompt: `Simplify ${term(a, x)} + ${b} − ${term(c, x)} + ${d}.`,
      answer: exprAnswer(ans),
      wrongAnswers: [],
      wrongExpressions: [
        {
          value: expr([
            [a + c, x],
            [b + d, ""],
          ]),
          misconception: "alg-sign-error",
        },
        { value: term(a - c + b + d, x), misconception: "alg-joined-unlike" },
      ],
      answerHelp: EXPR_HELP,
      hints: [`Each sign belongs to the term after it. The ${term(c, x)} has a − in front.`, `${x} terms: ${term(a, x)} − ${term(c, x)}. Numbers: ${b} + ${d}.`],
      solution: [`${x} terms: ${term(a, x)} − ${term(c, x)} = ${term(a - c, x)}`, `Numbers: ${b} + ${d} = ${b + d}`, `Answer: ${ans}`],
    };
  }
  if (kind === "minus-y") {
    const b = r.int(1, 5);
    const d = b + r.int(1, 6);
    const [a, c] = [r.int(2, 8), r.int(1, 6)];
    const ans = expr([
      [a + c, x],
      [d - b, y],
    ]);
    return {
      prompt: `Simplify ${term(a, x)} − ${term(b, y)} + ${term(c, x)} + ${term(d, y)}.`,
      answer: exprAnswer(ans),
      wrongAnswers: [],
      wrongExpressions: [
        {
          value: expr([
            [a + c, x],
            [b + d, y],
          ]),
          misconception: "alg-sign-error",
        },
      ],
      answerHelp: EXPR_HELP,
      hints: [`The ${term(b, y)} has a − in front, so it is being taken away.`, `${y} terms: ${term(d, y)} − ${term(b, y)}.`],
      solution: [`${x} terms: ${term(a, x)} + ${term(c, x)} = ${term(a + c, x)}`, `${y} terms: ${term(d, y)} − ${term(b, y)} = ${term(d - b, y)}`, `Answer: ${ans}`],
    };
  }
  if (kind === "squared") {
    const [a, b, c] = [r.int(2, 6), r.int(2, 9), r.int(1, 5)];
    const ans = expr([
      [a + c, `${x}²`],
      [b, x],
    ]);
    return {
      prompt: `Simplify ${term(a, `${x}²`)} + ${term(b, x)} + ${term(c, `${x}²`)}.`,
      answer: exprAnswer(ans),
      wrongAnswers: [],
      wrongExpressions: [
        { value: term(a + b + c, `${x}²`), misconception: "alg-joined-unlike" },
        { value: term(a + b + c, x), misconception: "alg-joined-unlike" },
      ],
      answerHelp: EXPR_HELP,
      hints: [`${x}² and ${x} are different, so they are unlike terms.`, `Add the ${x}² terms together. Leave the ${x} term on its own.`],
      solution: [`${x}² terms: ${term(a, `${x}²`)} + ${term(c, `${x}²`)} = ${term(a + c, `${x}²`)}`, `${term(b, x)} is not a like term with ${x}², so it stays separate.`, `Answer: ${ans}`],
    };
  }
  const [a, b, c] = [r.int(2, 6), r.int(2, 9), r.int(1, 5)];
  const ans = expr([
    [a + c, `${x}${y}`],
    [b, x],
  ]);
  return {
    prompt: `Simplify ${term(a, `${x}${y}`)} + ${term(b, x)} + ${term(c, `${y}${x}`)}.`,
    answer: exprAnswer(ans),
    wrongAnswers: [],
    wrongExpressions: [{ value: term(a + b + c, `${x}${y}`), misconception: "alg-joined-unlike" }],
    answerHelp: EXPR_HELP,
    hints: [`${y}${x} means ${y} × ${x}, which is the same as ${x}${y}.`, `So ${term(a, `${x}${y}`)} and ${term(c, `${y}${x}`)} are like terms. ${term(b, x)} is not.`],
    solution: [
      `${y}${x} = ${x}${y}, because you can multiply in any order.`,
      `${x}${y} terms: ${term(a, `${x}${y}`)} + ${term(c, `${x}${y}`)} = ${term(a + c, `${x}${y}`)}`,
      `Answer: ${ans}`,
    ],
  };
};

// ------------------------------------------------------------ substitution

const NUM_HELP = "Type a whole number like 17.";

const substitution: Gen = (r, tier) => {
  const a = r.pick(LETTERS);
  if (tier === 1) {
    const kind = r.pick(["ka", "ka-plus", "ka-minus"] as const);
    const k = r.int(2, 9);
    const v = r.int(2, 9);
    if (kind === "ka") {
      return {
        prompt: `Work out the value of ${term(k, a)} when ${a} = ${v}.`,
        answer: { kind: "integer", value: k * v },
        wrongAnswers: wrongNums(k * v, [
          { value: Number(`${k}${v}`), misconception: "alg-digits-joined" },
          { value: k + v, misconception: "alg-times-as-add" },
        ]),
        answerHelp: NUM_HELP,
        hints: [`${term(k, a)} means ${k} × ${a}.`, `Swap ${a} for ${v}: ${k} × ${v}.`],
        solution: [`${term(k, a)} means ${k} × ${a}.`, `Replace ${a} with ${v}: ${k} × ${v} = ${k * v}`],
      };
    }
    const c = r.int(1, 9);
    if (kind === "ka-plus") {
      const ans = k * v + c;
      return {
        prompt: `Work out the value of ${term(k, a)} + ${c} when ${a} = ${v}.`,
        answer: { kind: "integer", value: ans },
        wrongAnswers: wrongNums(ans, [
          { value: Number(`${k}${v}`) + c, misconception: "alg-digits-joined" },
          { value: k * (v + c), misconception: "alg-order-of-operations" },
        ]),
        answerHelp: NUM_HELP,
        hints: [`Replace ${a} with ${v}: ${k} × ${v} + ${c}.`, `Multiply first, then add.`],
        solution: [`Replace ${a} with ${v}: ${k} × ${v} + ${c}`, `Multiply first: ${k} × ${v} = ${k * v}`, `Then add: ${k * v} + ${c} = ${ans}`],
      };
    }
    const cc = Math.min(c, k * v - 1);
    const ans = k * v - cc;
    return {
      prompt: `Work out the value of ${term(k, a)} − ${cc} when ${a} = ${v}.`,
      answer: { kind: "integer", value: ans },
      wrongAnswers: wrongNums(ans, [
        { value: Number(`${k}${v}`) - cc, misconception: "alg-digits-joined" },
        { value: k * (v - cc), misconception: "alg-order-of-operations" },
      ]),
      answerHelp: NUM_HELP,
      hints: [`Replace ${a} with ${v}: ${k} × ${v} − ${cc}.`, `Multiply first, then subtract.`],
      solution: [`Replace ${a} with ${v}: ${k} × ${v} − ${cc}`, `Multiply first: ${k} × ${v} = ${k * v}`, `Then subtract: ${k * v} − ${cc} = ${ans}`],
    };
  }

  const kind = r.pick(["kx2", "ab-plus-c", "formula", "bracket"] as const);
  if (kind === "kx2") {
    const x = r.pick(["x", "y", "n", "t"]);
    const k = r.int(2, 5);
    const v = r.int(2, 6);
    const ans = k * v * v;
    return {
      prompt: `Work out the value of ${k}${x}² when ${x} = ${v}.`,
      answer: { kind: "integer", value: ans },
      wrongAnswers: wrongNums(ans, [
        { value: (k * v) ** 2, misconception: "alg-squared-coefficient" },
        { value: k * 2 * v, misconception: "alg-square-as-double" },
      ]),
      answerHelp: NUM_HELP,
      hints: [`${k}${x}² means ${k} × ${x}². Only the ${x} is squared.`, `Square first: ${v}² = ${v} × ${v}. Then multiply by ${k}.`],
      solution: [`${k}${x}² = ${k} × ${x}²`, `${x}² = ${v} × ${v} = ${v * v}`, `${k} × ${v * v} = ${ans}`],
    };
  }
  if (kind === "ab-plus-c") {
    const [p, q] = twoLetters(r);
    let c = r.pick(LETTERS);
    while (c === p || c === q) c = r.pick(LETTERS);
    const [vp, vq, vc] = [r.int(2, 9), r.int(2, 9), r.int(1, 12)];
    const ans = vp * vq + vc;
    return {
      prompt: `Work out the value of ${p}${q} + ${c} when ${p} = ${vp}, ${q} = ${vq} and ${c} = ${vc}.`,
      answer: { kind: "integer", value: ans },
      wrongAnswers: wrongNums(ans, [
        { value: vp + vq + vc, misconception: "alg-times-as-add" },
        { value: vp * (vq + vc), misconception: "alg-order-of-operations" },
      ]),
      answerHelp: NUM_HELP,
      hints: [`${p}${q} means ${p} × ${q}.`, `${vp} × ${vq} first, then add ${vc}.`],
      solution: [`Replace the letters: ${vp} × ${vq} + ${vc}`, `Multiply first: ${vp} × ${vq} = ${vp * vq}`, `Then add: ${vp * vq} + ${vc} = ${ans}`],
    };
  }
  if (kind === "formula") {
    const [u, acc, t] = [r.int(1, 20), r.int(2, 9), r.int(2, 9)];
    const ans = u + acc * t;
    return {
      prompt: `The formula v = u + at gives a speed. Work out v when u = ${u}, a = ${acc} and t = ${t}.`,
      answer: { kind: "integer", value: ans },
      wrongAnswers: wrongNums(ans, [
        { value: (u + acc) * t, misconception: "alg-order-of-operations" },
        { value: u + acc + t, misconception: "alg-times-as-add" },
      ]),
      answerHelp: "Type a whole number like 17, or v = 17.",
      hints: [`at means a × t.`, `Work out ${acc} × ${t} first, then add ${u}.`],
      solution: [`v = u + at, and at means a × t.`, `v = ${u} + ${acc} × ${t}`, `Multiply first: ${acc} × ${t} = ${acc * t}`, `v = ${u} + ${acc * t} = ${ans}`],
    };
  }
  const [p, q] = twoLetters(r);
  const k = r.int(2, 6);
  const [vp, vq] = [r.int(1, 9), r.int(1, 9)];
  const ans = k * (vp + vq);
  return {
    prompt: `Work out the value of ${k}(${p} + ${q}) when ${p} = ${vp} and ${q} = ${vq}.`,
    answer: { kind: "integer", value: ans },
    wrongAnswers: wrongNums(ans, [
      { value: k * vp + vq, misconception: "alg-expand-first-only" },
      { value: k + vp + vq, misconception: "alg-expand-added" },
    ]),
    answerHelp: NUM_HELP,
    hints: [`Work out the bracket first: ${vp} + ${vq}.`, `Then multiply by ${k}.`],
    solution: [`Replace the letters: ${k}(${vp} + ${vq})`, `Bracket first: ${vp} + ${vq} = ${vp + vq}`, `${k} × ${vp + vq} = ${ans}`],
  };
};

// ------------------------------------------------------------ expanding single brackets

const expand: Gen = (r, tier) => {
  const x = r.pick(["x", "y", "a", "n", "p", "t"]);
  if (tier === 1) {
    const kind = r.pick(["plus", "minus", "coef"] as const);
    const k = r.int(2, 9);
    const c = r.int(1, 9);
    if (kind === "coef") {
      const a = r.int(2, 5);
      const ans = expr([
        [k * a, x],
        [k * c, ""],
      ]);
      return {
        prompt: `Expand ${k}(${term(a, x)} + ${c}).`,
        answer: exprAnswer(ans),
        wrongAnswers: [],
        wrongExpressions: [
          { value: `${term(k * a, x)} + ${c}`, misconception: "alg-expand-first-only" },
          { value: `${term(a, x)} + ${c + k}`, misconception: "alg-expand-added" },
        ],
        answerHelp: EXPR_HELP,
        hints: [`Multiply each term inside the bracket by ${k}.`, `${k} × ${term(a, x)} = ?, and ${k} × ${c} = ?`],
        solution: [`${k} × ${term(a, x)} = ${term(k * a, x)}`, `${k} × ${c} = ${k * c}`, `Answer: ${ans}`],
      };
    }
    const sign = kind === "plus" ? 1 : -1;
    const s = sign > 0 ? "+" : "−";
    const ans = expr([
      [k, x],
      [sign * k * c, ""],
    ]);
    return {
      prompt: `Expand ${k}(${x} ${s} ${c}).`,
      answer: exprAnswer(ans),
      wrongAnswers: [],
      wrongExpressions: [
        {
          value: expr([
            [k, x],
            [sign * c, ""],
          ]),
          misconception: "alg-expand-first-only",
        },
        ...(sign > 0 ? [{ value: `${x} + ${c + k}`, misconception: "alg-expand-added" }] : []),
      ],
      answerHelp: EXPR_HELP,
      hints: [`The ${k} multiplies everything inside the bracket.`, `${k} × ${x} = ${term(k, x)}, and ${k} × ${c} = ${k * c}. Keep the ${s} sign.`],
      solution: [`${k} × ${x} = ${term(k, x)}`, `${k} × ${c} = ${k * c}`, `Keep the ${s} sign between them: ${ans}`],
    };
  }

  const kind = r.pick(["x-outside", "plus-term", "two-brackets", "two-letters"] as const);
  if (kind === "x-outside") {
    const c = r.int(2, 9);
    const ans = expr([
      [1, `${x}²`],
      [c, x],
    ]);
    return {
      prompt: `Expand ${x}(${x} + ${c}).`,
      answer: exprAnswer(ans),
      wrongAnswers: [],
      wrongExpressions: [
        { value: `${x}² + ${c}`, misconception: "alg-expand-first-only" },
        { value: term(2 + c, x), misconception: "alg-x-times-x" },
      ],
      answerHelp: EXPR_HELP,
      hints: [`Multiply each term in the bracket by ${x}.`, `${x} × ${x} = ${x}², and ${x} × ${c} = ${term(c, x)}.`],
      solution: [`${x} × ${x} = ${x}²`, `${x} × ${c} = ${term(c, x)}`, `Answer: ${ans}`],
    };
  }
  if (kind === "plus-term") {
    const [k, c, d] = [r.int(2, 6), r.int(1, 9), r.int(1, 7)];
    const ans = expr([
      [k + d, x],
      [k * c, ""],
    ]);
    return {
      prompt: `Expand and simplify ${k}(${x} + ${c}) + ${term(d, x)}.`,
      answer: exprAnswer(ans),
      wrongAnswers: [],
      wrongExpressions: [
        {
          value: expr([
            [k + d, x],
            [c, ""],
          ]),
          misconception: "alg-expand-first-only",
        },
      ],
      answerHelp: EXPR_HELP,
      hints: [`Expand the bracket first: ${k}(${x} + ${c}) = ${term(k, x)} + ${k * c}.`, `Then collect the ${x} terms.`],
      solution: [`Expand: ${k}(${x} + ${c}) = ${term(k, x)} + ${k * c}`, `Now ${term(k, x)} + ${k * c} + ${term(d, x)}`, `Collect the ${x} terms: ${ans}`],
    };
  }
  if (kind === "two-brackets") {
    const [k, c, j, e] = [r.int(2, 5), r.int(1, 6), r.int(2, 5), r.int(1, 6)];
    const ans = expr([
      [k + j, x],
      [k * c + j * e, ""],
    ]);
    return {
      prompt: `Expand and simplify ${k}(${x} + ${c}) + ${j}(${x} + ${e}).`,
      answer: exprAnswer(ans),
      wrongAnswers: [],
      wrongExpressions: [
        {
          value: expr([
            [k + j, x],
            [c + e, ""],
          ]),
          misconception: "alg-expand-first-only",
        },
      ],
      answerHelp: EXPR_HELP,
      hints: [`Expand each bracket on its own first.`, `${k}(${x} + ${c}) = ${term(k, x)} + ${k * c} and ${j}(${x} + ${e}) = ${term(j, x)} + ${j * e}. Now collect like terms.`],
      solution: [
        `${k}(${x} + ${c}) = ${term(k, x)} + ${k * c}`,
        `${j}(${x} + ${e}) = ${term(j, x)} + ${j * e}`,
        `${x} terms: ${term(k, x)} + ${term(j, x)} = ${term(k + j, x)}. Numbers: ${k * c} + ${j * e} = ${k * c + j * e}`,
        `Answer: ${ans}`,
      ],
    };
  }
  const [p, q] = twoLetters(r);
  const [k, a, b] = [r.int(2, 6), r.int(2, 5), r.int(1, 5)];
  const ans = expr([
    [k * a, p],
    [k * b, q],
  ]);
  return {
    prompt: `Expand ${k}(${term(a, p)} + ${term(b, q)}).`,
    answer: exprAnswer(ans),
    wrongAnswers: [],
    wrongExpressions: [{ value: `${term(k * a, p)} + ${term(b, q)}`, misconception: "alg-expand-first-only" }],
    answerHelp: EXPR_HELP,
    hints: [`Multiply both terms inside the bracket by ${k}.`, `${k} × ${term(a, p)} = ${term(k * a, p)}.`],
    solution: [`${k} × ${term(a, p)} = ${term(k * a, p)}`, `${k} × ${term(b, q)} = ${term(k * b, q)}`, `Answer: ${ans}`],
  };
};

// ------------------------------------------------------------ function machines

type Op = { show: string; run: (n: number) => number; undo: (n: number) => number; undoShow: string };
const plus = (c: number): Op => ({ show: `+ ${c}`, run: (n) => n + c, undo: (n) => n - c, undoShow: `− ${c}` });
const minus = (c: number): Op => ({ show: `− ${c}`, run: (n) => n - c, undo: (n) => n + c, undoShow: `+ ${c}` });
const times = (k: number): Op => ({ show: `× ${k}`, run: (n) => n * k, undo: (n) => n / k, undoShow: `÷ ${k}` });
const divide = (k: number): Op => ({ show: `÷ ${k}`, run: (n) => n / k, undo: (n) => n * k, undoShow: `× ${k}` });

const machines: Gen = (r, tier) => {
  if (tier === 1) {
    if (r.next() < 0.6) {
      // forwards, two steps
      const input = r.int(2, 10);
      const k = r.int(2, 6);
      const c = r.int(1, 12);
      const ops = r.next() < 0.5 ? [times(k), plus(c)] : [plus(c), times(k)];
      const mid = ops[0].run(input);
      const out = ops[1].run(mid);
      const wrongOrder = ops[0].run(ops[1].run(input));
      return {
        prompt: `What comes out of this function machine?`,
        visual: { kind: "machine", machine: { input: String(input), steps: ops.map((o) => o.show), output: "?" } },
        answer: { kind: "integer", value: out },
        wrongAnswers: wrongNums(out, [{ value: wrongOrder, misconception: "alg-machine-order" }]),
        answerHelp: NUM_HELP,
        hints: [`Start with ${input} and do the first box: ${input} ${ops[0].show}.`, `Now put ${mid} into the second box: ${mid} ${ops[1].show}.`],
        solution: [`${input} ${ops[0].show} = ${mid}`, `${mid} ${ops[1].show} = ${out}`, `The output is ${out}.`],
      };
    }
    // backwards, one step
    const input = r.int(2, 12);
    const op = r.pick([times(r.int(2, 9)), plus(r.int(2, 15))]);
    const out = op.run(input);
    return {
      prompt: `This machine gave an output of ${out}. What was the input?`,
      visual: { kind: "machine", machine: { input: "?", steps: [op.show], output: String(out) } },
      answer: { kind: "integer", value: input },
      wrongAnswers: wrongNums(input, [{ value: op.run(out), misconception: "alg-machine-forwards" }]),
      answerHelp: NUM_HELP,
      hints: [`Work backwards from ${out}.`, `The opposite of ${op.show} is ${op.undoShow}.`],
      solution: [`Go backwards and do the opposite: ${op.show} becomes ${op.undoShow}.`, `${out} ${op.undoShow} = ${input}`, `The input was ${input}.`],
    };
  }

  const kind = r.pick(["back-times-plus", "back-minus-times", "forward-divide"] as const);
  if (kind === "forward-divide") {
    const k = r.int(2, 6);
    const c = r.int(1, 9);
    if (r.next() < 0.5) {
      const input = k * r.int(2, 10);
      const ops = [divide(k), plus(c)];
      const mid = input / k;
      const out = mid + c;
      return {
        prompt: `What comes out of this function machine?`,
        visual: { kind: "machine", machine: { input: String(input), steps: ops.map((o) => o.show), output: "?" } },
        answer: { kind: "integer", value: out },
        wrongAnswers: wrongNums(out, [{ value: (input + c) / k, misconception: "alg-machine-order" }]),
        answerHelp: NUM_HELP,
        hints: [`First box: ${input} ÷ ${k}.`, `Then add ${c}.`],
        solution: [`${input} ÷ ${k} = ${mid}`, `${mid} + ${c} = ${out}`, `The output is ${out}.`],
      };
    }
    const mid = k * r.int(2, 8);
    const input = mid - c;
    const ops = [plus(c), divide(k)];
    const out = mid / k;
    return {
      prompt: `What comes out of this function machine?`,
      visual: { kind: "machine", machine: { input: String(input), steps: ops.map((o) => o.show), output: "?" } },
      answer: { kind: "integer", value: out },
      wrongAnswers: wrongNums(out, [{ value: input / k + c, misconception: "alg-machine-order" }]),
      answerHelp: NUM_HELP,
      hints: [`First box: ${input} + ${c}.`, `Then divide ${mid} by ${k}.`],
      solution: [`${input} + ${c} = ${mid}`, `${mid} ÷ ${k} = ${out}`, `The output is ${out}.`],
    };
  }
  const k = r.int(2, 6);
  const c = r.int(1, 9);
  const input = r.int(2, 10) + (kind === "back-minus-times" ? c : 0);
  const ops = kind === "back-times-plus" ? [times(k), plus(c)] : [minus(c), times(k)];
  const mid = ops[0].run(input);
  const out = ops[1].run(mid);
  const back1 = ops[1].undo(out);
  const forwards = ops[1].run(ops[0].run(out));
  const swapped = ops[0].undo(out);
  const swappedThen = ops[1].undo(swapped);
  return {
    prompt: `This machine gave an output of ${out}. What was the input?`,
    visual: { kind: "machine", machine: { input: "?", steps: ops.map((o) => o.show), output: String(out) } },
    answer: { kind: "integer", value: input },
    wrongAnswers: wrongNums(input, [
      { value: forwards, misconception: "alg-machine-forwards" },
      { value: swappedThen, misconception: "alg-machine-wrong-order" },
    ]),
    answerHelp: NUM_HELP,
    hints: [`Start at the output, ${out}, and go backwards. Undo the last box first.`, `Undo ${ops[1].show} with ${ops[1].undoShow}, then undo ${ops[0].show} with ${ops[0].undoShow}.`],
    solution: [
      `Work backwards, doing the opposite of each box, last box first.`,
      `${out} ${ops[1].undoShow} = ${back1}`,
      `${back1} ${ops[0].undoShow} = ${input}`,
      `Check: ${input} ${ops[0].show} = ${mid}, ${mid} ${ops[1].show} = ${out}. The input was ${input}.`,
    ],
  };
};

// ------------------------------------------------------------ solving equations

const solve: Gen = (r, tier) => {
  const x = tier === 1 ? "x" : r.pick(["x", "x", "y", "n", "a"]);
  const help = `Type the number, like 4, or write ${x} = 4.`;
  const ans = r.int(1, 12);
  if (tier === 1) {
    const kind = r.pick(["plus", "minus", "times", "divide"] as const);
    if (kind === "plus") {
      const c = r.int(2, 15);
      const rhs = ans + c;
      return {
        prompt: `Solve ${x} + ${c} = ${rhs}.`,
        answer: { kind: "integer", value: ans },
        wrongAnswers: wrongNums(ans, [{ value: rhs + c, misconception: "alg-inverse-wrong" }]),
        answerHelp: help,
        hints: [`${c} is being added to ${x}. What undoes adding ${c}?`, `Subtract ${c} from both sides.`],
        solution: [`${x} + ${c} = ${rhs}`, `Subtract ${c} from both sides: ${x} = ${rhs} − ${c}`, `${x} = ${ans}`],
      };
    }
    if (kind === "minus") {
      const c = r.int(2, 15);
      const sol = ans + c;
      return {
        prompt: `Solve ${x} − ${c} = ${ans}.`,
        answer: { kind: "integer", value: sol },
        wrongAnswers: wrongNums(sol, [{ value: ans - c, misconception: "alg-inverse-wrong" }]),
        answerHelp: help,
        hints: [`${c} is being taken away from ${x}. What undoes subtracting ${c}?`, `Add ${c} to both sides.`],
        solution: [`${x} − ${c} = ${ans}`, `Add ${c} to both sides: ${x} = ${ans} + ${c}`, `${x} = ${sol}`],
      };
    }
    if (kind === "times") {
      const k = r.int(2, 9);
      const rhs = k * ans;
      return {
        prompt: `Solve ${k}${x} = ${rhs}.`,
        answer: { kind: "integer", value: ans },
        wrongAnswers: wrongNums(ans, [
          { value: rhs - k, misconception: "alg-subtracted-coefficient" },
          { value: rhs * k, misconception: "alg-inverse-wrong" },
        ]),
        answerHelp: help,
        hints: [`${k}${x} means ${k} × ${x}. What undoes multiplying by ${k}?`, `Divide both sides by ${k}.`],
        solution: [`${k}${x} = ${rhs} means ${k} × ${x} = ${rhs}.`, `Divide both sides by ${k}: ${x} = ${rhs} ÷ ${k}`, `${x} = ${ans}`],
      };
    }
    const k = r.int(2, 6);
    const rhs = ans;
    const sol = ans * k;
    return {
      prompt: `Solve ${x} ÷ ${k} = ${rhs}.`,
      answer: { kind: "integer", value: sol },
      wrongAnswers: wrongNums(sol, [{ value: rhs / k, misconception: "alg-inverse-wrong" }]),
      answerHelp: help,
      hints: [`${x} is being divided by ${k}. What undoes dividing by ${k}?`, `Multiply both sides by ${k}.`],
      solution: [`${x} ÷ ${k} = ${rhs}`, `Multiply both sides by ${k}: ${x} = ${rhs} × ${k}`, `${x} = ${sol}`],
    };
  }

  const kind = r.pick(["kx-plus", "kx-minus", "c-plus-kx", "reversed", "divide-plus"] as const);
  const k = r.int(2, 9);
  const c = r.int(1, 15);
  if (kind === "divide-plus") {
    const kk = r.int(2, 5);
    const q = r.int(1, 9);
    const sol = q * kk;
    const rhs = q + c;
    return {
      prompt: `Solve ${x} ÷ ${kk} + ${c} = ${rhs}.`,
      answer: { kind: "integer", value: sol },
      wrongAnswers: wrongNums(sol, [
        { value: q, misconception: "alg-forgot-second-step" },
        { value: rhs * kk - c, misconception: "alg-two-step-order" },
      ]),
      answerHelp: help,
      hints: [`Undo the + ${c} first: subtract ${c} from both sides.`, `${x} ÷ ${kk} = ${q}. Now multiply both sides by ${kk}.`],
      solution: [`Subtract ${c} from both sides: ${x} ÷ ${kk} = ${q}`, `Multiply both sides by ${kk}: ${x} = ${q} × ${kk}`, `${x} = ${sol}`],
    };
  }
  if (kind === "kx-minus") {
    const sol = ans + Math.ceil((c + 1) / k);
    const rhs = k * sol - c;
    return {
      prompt: `Solve ${k}${x} − ${c} = ${rhs}.`,
      answer: { kind: "integer", value: sol },
      wrongAnswers: wrongNums(sol, [
        { value: rhs + c, misconception: "alg-forgot-second-step" },
        { value: (rhs - c) / k, misconception: "alg-inverse-wrong" },
      ]),
      answerHelp: help,
      hints: [`Undo the − ${c} first: add ${c} to both sides.`, `${k}${x} = ${rhs + c}. Now divide both sides by ${k}.`],
      solution: [`Add ${c} to both sides: ${k}${x} = ${rhs + c}`, `Divide both sides by ${k}: ${x} = ${rhs + c} ÷ ${k}`, `${x} = ${sol}`, `Check: ${k} × ${sol} − ${c} = ${rhs} ✓`],
    };
  }
  const rhs = k * ans + c;
  const lhs = kind === "c-plus-kx" ? `${c} + ${k}${x}` : `${k}${x} + ${c}`;
  const prompt = kind === "reversed" ? `Solve ${rhs} = ${k}${x} + ${c}.` : `Solve ${lhs} = ${rhs}.`;
  return {
    prompt,
    answer: { kind: "integer", value: ans },
    wrongAnswers: wrongNums(ans, [
      { value: rhs - c, misconception: "alg-forgot-second-step" },
      { value: (rhs + c) / k, misconception: "alg-inverse-wrong" },
      { value: rhs / k - c, misconception: "alg-two-step-order" },
    ]),
    answerHelp: help,
    hints: [
      kind === "reversed" ? `It's fine for ${x} to be on the right. Undo the + ${c} first: subtract ${c} from both sides.` : `Undo the + ${c} first: subtract ${c} from both sides.`,
      `${k}${x} = ${rhs - c}. Now divide both sides by ${k}.`,
    ],
    solution: [`Subtract ${c} from both sides: ${k}${x} = ${rhs - c}`, `Divide both sides by ${k}: ${x} = ${rhs - c} ÷ ${k}`, `${x} = ${ans}`, `Check: ${k} × ${ans} + ${c} = ${rhs} ✓`],
  };
};

export const ALGEBRA_GENERATORS: Record<string, Gen> = {
  "alg-notation": notation,
  "alg-collect-terms": collect,
  "alg-substitution": substitution,
  "alg-expand-single": expand,
  "alg-function-machines": machines,
  "alg-solve-simple": solve,
};
