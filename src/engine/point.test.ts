import { describe, expect, it } from "vitest";
import { answerText, markAnswer } from "./marking";
import { parsePoint, showPoint } from "./point";
import type { Misconception, Question } from "./types";

const MC: Record<string, Misconception> = {
  swapped: { id: "swapped", label: "Swapped x and y", explanation: "x comes first." },
};

const pointQ: Question = {
  id: "t",
  skillId: "alg-coordinates",
  prompt: "Write the coordinates of A.",
  answer: { kind: "point", value: [3, -2] },
  wrongAnswers: [{ value: [-2, 3], misconception: "swapped" }],
  hints: ["h"],
  solution: ["s"],
};

describe("coordinates", () => {
  it.each(["(3, -2)", "(3,−2)", "3, -2", "3 -2", "( 3 , -2 )", "x = 3, y = -2", "[3, -2]", "(6/2, -2.0)"])("accepts %s", (t) => {
    expect(markAnswer(pointQ, t, MC).outcome).toBe("correct");
  });
  it("catches swapped coordinates and says which coordinate is right", () => {
    expect(markAnswer(pointQ, "(-2, 3)", MC).misconception).toBe("swapped");
    expect(markAnswer(pointQ, "(3, 2)", MC).feedback).toMatch(/x-coordinate .* is right/);
    expect(markAnswer(pointQ, "(-3, -2)", MC).feedback).toMatch(/y-coordinate .* is right/);
  });
  it("rejects what it can't read", () => {
    for (const bad of ["", "3", "(3, -2, 1)", "three, two", "(a, b)"]) expect(parsePoint(bad), bad).toBeNull();
    expect(markAnswer(pointQ, "3", MC).outcome).toBe("unreadable");
  });
  it("shows points with the true minus sign", () => {
    expect(showPoint([-4, 0])).toBe("(−4, 0)");
    expect(answerText(pointQ)).toBe("(3, −2)");
  });
});

describe("vectors", () => {
  it("talks about top and bottom numbers", () => {
    const v: Question = { ...pointQ, answer: { kind: "point", value: [3, -2], vector: true }, wrongAnswers: [] };
    expect(markAnswer(v, "(3, 2)", MC).feedback).toMatch(/top number .* is right/);
    expect(markAnswer(v, "x", MC).feedback).toMatch(/top number first/);
  });
});

describe("equation answers", () => {
  const q: Question = {
    id: "t",
    skillId: "alg-y-mx-c",
    prompt: "Find the equation of the line.",
    answer: { kind: "expression", value: "3x − 2", form: "simplified", lhs: "y" },
    wrongAnswers: [],
    hints: ["h"],
    solution: ["s"],
  };
  it("accepts y = mx + c in any tidy order", () => {
    for (const t of ["y = 3x - 2", "y=3x−2", "Y = -2 + 3x"]) expect(markAnswer(q, t, MC).outcome, t).toBe("correct");
  });
  it("nudges an answer without y =", () => {
    const r = markAnswer(q, "3x - 2", MC);
    expect(r.outcome).toBe("not-simplified");
    expect(r.feedback).toContain("y = 3x − 2");
  });
  it("marks a different line wrong", () => {
    expect(markAnswer(q, "y = 2x - 3", MC).outcome).toBe("incorrect");
  });
});
