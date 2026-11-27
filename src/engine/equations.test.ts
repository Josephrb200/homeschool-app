import { describe, expect, it } from "vitest";
import { parseExpression, untidyReason } from "./algebra";
import { parseAssignment, parseFormula, parseInequality, parseValues, sameFormula } from "./equations";
import { frac } from "./fraction";
import { answerText, markAnswer } from "./marking";
import { parseList } from "./primes";
import type { Misconception, Question } from "./types";

const MC: Record<string, Misconception> = {
  inc: { id: "inc", label: "inc", explanation: "Circle." },
  dir: { id: "dir", label: "dir", explanation: "Direction." },
  eq: { id: "eq", label: "eq", explanation: "Equals." },
  miss: { id: "miss", label: "miss", explanation: "Missing." },
  sign: { id: "sign", label: "sign", explanation: "Signs." },
  swap: { id: "swap", label: "swap", explanation: "Swapped." },
  inv: { id: "inv", label: "inv", explanation: "Inverse." },
};
const base = { id: "t:1:1", skillId: "t", prompt: "", hints: ["h"], solution: ["s"] };

describe("inequalities", () => {
  it("reads every common way of writing one", () => {
    expect(parseInequality("x < 4", "x")).toEqual({ upper: { value: frac(4), inclusive: false } });
    expect(parseInequality("4 > x", "x")).toEqual({ upper: { value: frac(4), inclusive: false } });
    expect(parseInequality("x>=-2", "x")).toEqual({ lower: { value: frac(-2), inclusive: true } });
    expect(parseInequality("x ≥ −2", "x")).toEqual({ lower: { value: frac(-2), inclusive: true } });
    expect(parseInequality("x =< 3", "x")).toEqual({ upper: { value: frac(3), inclusive: true } });
    expect(parseInequality("-2 < x <= 3", "x")).toEqual({ lower: { value: frac(-2), inclusive: false }, upper: { value: frac(3), inclusive: true } });
    expect(parseInequality("3 ≥ x > −2", "x")).toEqual({ lower: { value: frac(-2), inclusive: false }, upper: { value: frac(3), inclusive: true } });
    expect(parseInequality("x > 7/2", "x")).toEqual({ lower: { value: frac(7, 2), inclusive: false } });
    expect(parseInequality("4", "x")).toBe("no-letter");
    expect(parseInequality("x = 4", "x")).toBe("equals");
    expect(parseInequality("y < 4", "x")).toBe(null);
    expect(parseInequality("x < 4 < 5", "x")).toBe(null);
    expect(parseInequality("2 < x > 3", "x")).toBe(null);
  });

  const q: Question = {
    ...base,
    answer: {
      kind: "inequality",
      variable: "x",
      value: { upper: { value: frac(5), inclusive: false } },
      inclusiveMisconception: "inc",
      directionMisconception: "dir",
      equalsMisconception: "eq",
    },
    wrongAnswers: [{ value: 9, misconception: "inv" }],
  };
  it("marks right answers and names near misses", () => {
    expect(markAnswer(q, "x < 5", MC).outcome).toBe("correct");
    expect(markAnswer(q, "5 > x", MC).outcome).toBe("correct");
    expect(markAnswer(q, "x ≤ 5", MC).misconception).toBe("inc");
    expect(markAnswer(q, "x > 5", MC).misconception).toBe("dir");
    expect(markAnswer(q, "x = 5", MC).misconception).toBe("eq");
    expect(markAnswer(q, "x < 9", MC).misconception).toBe("inv");
    expect(markAnswer(q, "x < 6", MC).misconception).toBeUndefined();
    expect(markAnswer(q, "5", MC).outcome).toBe("unreadable");
    expect(answerText(q)).toBe("x < 5");
  });
});

describe("several solutions", () => {
  it("reads lists of values", () => {
    expect(parseValues("x = 2 or x = −5")).toEqual([frac(2), frac(-5)]);
    expect(parseValues("2, -5")).toEqual([frac(2), frac(-5)]);
    expect(parseValues("x=0 and x=-3")).toEqual([frac(0), frac(-3)]);
    expect(parseValues("2 -5")).toEqual([frac(2), frac(-5)]);
    expect(parseValues("x = 3/2 or 4")).toEqual([frac(3, 2), frac(4)]);
    expect(parseValues("two")).toBe(null);
  });
  const q: Question = { ...base, answer: { kind: "roots", variable: "x", values: [2, -5], missingMisconception: "miss" }, wrongAnswers: [{ value: [-2, 5], misconception: "sign" }] };
  it("marks quadratic solutions", () => {
    expect(markAnswer(q, "x = -5 or x = 2", MC).outcome).toBe("correct");
    expect(markAnswer(q, "2", MC).misconception).toBe("miss");
    expect(markAnswer(q, "2", MC).feedback).toMatch(/2 is right/);
    expect(markAnswer(q, "x = −2 or x = 5", MC).misconception).toBe("sign");
    expect(markAnswer(q, "x = 1 or x = 2", MC).correct).toBe(false);
    expect(answerText(q)).toBe("x = 2 or x = −5");
  });
  it("lists of whole numbers may now include negatives", () => {
    expect(parseList("−2, −1, 0, 1")).toEqual([-2, -1, 0, 1]);
    expect(parseList("- 1 0 1")).toEqual([-1, 0, 1]);
  });
});

describe("simultaneous answers", () => {
  it("reads one value per letter", () => {
    expect(parseAssignment("x = 3, y = −2", ["x", "y"])).toEqual({ x: frac(3), y: frac(-2) });
    expect(parseAssignment("y=-2 x=3", ["x", "y"])).toEqual({ x: frac(3), y: frac(-2) });
    expect(parseAssignment("x = 3 and y = 1/2", ["x", "y"])).toEqual({ x: frac(3), y: frac(1, 2) });
    expect(parseAssignment("3, 2", ["x", "y"])).toBe("no-letters");
    expect(parseAssignment("x = 3, x = 2", ["x", "y"])).toBe(null);
    expect(parseAssignment("x = 3 hello", ["x", "y"])).toBe(null);
  });
  const q: Question = { ...base, answer: { kind: "assignment", values: { x: 3, y: 2 } }, wrongAnswers: [{ value: [2, 3], misconception: "swap" }] };
  it("marks them", () => {
    expect(markAnswer(q, "x = 3, y = 2", MC).outcome).toBe("correct");
    expect(markAnswer(q, "x = 2, y = 3", MC).misconception).toBe("swap");
    expect(markAnswer(q, "x = 3, y = 5", MC).feedback).toMatch(/x = 3 is right/);
    expect(markAnswer(q, "x = 3", MC).outcome).toBe("unreadable");
    expect(markAnswer(q, "3, 2", MC).outcome).toBe("unreadable");
    expect(answerText(q)).toBe("x = 3, y = 2");
  });
});

describe("formulae", () => {
  const same = (a: string, b: string) => sameFormula(parseFormula(a)!, parseFormula(b)!);
  it("accepts every equivalent rearrangement", () => {
    expect(same("(y − 2)/3", "y/3 − 2/3")).toBe(true);
    expect(same("(y-2)÷3", "(y − 2)/3")).toBe(true);
    expect(same("c/(2π)", "c/2/pi")).toBe(true);
    expect(same("sqrt(a)", "√a")).toBe(true);
    expect(same("(v - u)/t", "v/t - u/t")).toBe(true);
    expect(same("k(y - c)", "ky - kc")).toBe(true);
    expect(same("(y + 2)/3", "(y − 2)/3")).toBe(false);
    expect(same("y/3 − 2", "(y − 2)/3")).toBe(false);
    expect(parseFormula("(y - 2")).toBe(null);
  });
  const q: Question = { ...base, answer: { kind: "formula", subject: "x", value: "(y − 2)/3" }, wrongAnswers: [], wrongExpressions: [{ value: "(y + 2)/3", misconception: "inv" }] };
  it("marks a rearranged formula", () => {
    expect(markAnswer(q, "x = (y-2)/3", MC).outcome).toBe("correct");
    expect(markAnswer(q, "(y - 2)/3 = x", MC).outcome).toBe("correct");
    expect(markAnswer(q, "y/3 - 2/3", MC).outcome).toBe("correct");
    expect(markAnswer(q, "x = (y+2)/3", MC).misconception).toBe("inv");
    expect(markAnswer(q, "x = y - 2 - 2x", MC).feedback).toMatch(/both sides/);
    expect(markAnswer(q, "y = 3x + 2", MC).outcome).toBe("unreadable");
    expect(answerText(q)).toBe("x = (y − 2)/3");
  });
});

describe("factorised answers", () => {
  const reason = (s: string) => {
    const p = parseExpression(s);
    if (!p.ok) throw new Error(s);
    return untidyReason(p.ast, "factorised");
  };
  it("knows fully factorised from partly factorised", () => {
    expect(reason("3(2x + 5)")).toBe(null);
    expect(reason("x(x + 5)")).toBe(null);
    expect(reason("3x(2x + 3)")).toBe(null);
    expect(reason("(x + 2)(x + 3)")).toBe(null);
    expect(reason("(x − 5)(x + 5)")).toBe(null);
    expect(reason("6x + 15")).toBe("not-factorised");
    expect(reason("3(2x) + 15")).toBe("not-factorised");
    expect(reason("2(6x + 9)")).toBe("not-fully-factorised");
    expect(reason("x(6x + 9)")).toBe("not-fully-factorised");
    expect(reason("3(2x² + 3x)")).toBe("not-fully-factorised");
  });
  it("names the factor still inside the bracket", () => {
    const q: Question = { ...base, answer: { kind: "expression", value: "3x(2x + 3)", form: "factorised" }, wrongAnswers: [] };
    const res = markAnswer(q, "3(2x^2 + 3x)", MC);
    expect(res.outcome).toBe("not-simplified");
    expect(res.feedback).toMatch(/divided by x\./);
    expect(markAnswer(q, "x(6x + 9)", MC).feedback).toMatch(/divided by 3\./);
    expect(markAnswer(q, "6x² + 9x", MC).feedback).toMatch(/isn't factorised/);
    expect(markAnswer(q, "3x(3 + 2x)", MC).outcome).toBe("correct");
  });
  it("reads powers above 9 for index laws", () => {
    expect(parseExpression("x^12").ok).toBe(true);
  });
});
