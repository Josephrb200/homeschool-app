import { describe, expect, it } from "vitest";
import { markAnswer } from "./marking";
import type { Question } from "./types";

const q = (coeff: number, wrong: { value: number; misconception: string }[] = []): Question => ({
  id: "t",
  skillId: "t",
  prompt: "Find the area in terms of π.",
  answer: { kind: "pi", coeff },
  wrongAnswers: wrong,
  hints: ["h"],
  solution: ["s"],
});
const MC = { m1: { id: "m1", label: "L", explanation: "Explained." } };

describe("answers in terms of π", () => {
  it("accepts the usual ways of writing it", () => {
    for (const raw of ["25π", "25 π", "25pi", "25 PI", "25 × π", "π × 25", "π25", "25π cm²", "25 pi cm^2"]) expect(markAnswer(q(25), raw, MC).outcome, raw).toBe("correct");
    for (const raw of ["12.5π", "25/2 π", "25π/2"]) expect(markAnswer(q(12.5), raw, MC).outcome, raw).toBe("correct");
    expect(markAnswer(q(1), "π", MC).outcome).toBe("correct");
  });
  it("nudges when π is worked out or left off", () => {
    expect(markAnswer(q(25), "78.5", MC).outcome).toBe("not-simplified");
    expect(markAnswer(q(25), "78.54", MC).outcome).toBe("not-simplified");
    expect(markAnswer(q(25), "25", MC).outcome).toBe("not-simplified");
  });
  it("marks wrong coefficients, with misconceptions", () => {
    const res = markAnswer(q(25, [{ value: 10, misconception: "m1" }]), "10π", MC);
    expect(res.correct).toBe(false);
    expect(res.misconception).toBe("m1");
    expect(markAnswer(q(25), "24π", MC).correct).toBe(false);
    expect(markAnswer(q(25), "50", MC).outcome).toBe("incorrect");
    expect(markAnswer(q(25), "ππ", MC).outcome).toBe("unreadable");
  });
});
