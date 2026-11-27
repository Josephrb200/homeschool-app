import { describe, expect, it } from "vitest";
import { parseExpression, polyEquals, sameExpression, untidyReason } from "@/engine/algebra";
import { markAnswer } from "@/engine/marking";
import { makeQuestion, questionFromId } from "@/content/questions";
import { LESSONS, MISCONCEPTIONS, SKILL_BY_ID } from "@/content";
import { ALGEBRA_GENERATORS } from "./generators";
import { ALGEBRA_MISCONCEPTIONS as MC, ALGEBRA_SKILLS } from "./skills";
import { ALGEBRA_LESSONS } from "./lessons";

const seeds = Array.from({ length: 400 }, (_, i) => i * 7919 + 13);

describe("expression reader", () => {
  it("treats the same expression written differently as equal", () => {
    expect(sameExpression("3x + 2", "2 + 3x")).toBe(true);
    expect(sameExpression("3(x + 4)", "3x + 12")).toBe(true);
    expect(sameExpression("x(x + 5)", "x² + 5x")).toBe(true);
    expect(sameExpression("x^2+5x", "5x + x²")).toBe(true);
    expect(sameExpression("ba", "ab")).toBe(true);
    expect(sameExpression("5x − 2x", "3x")).toBe(true);
    expect(sameExpression("3 × n", "3n")).toBe(true);
    expect(sameExpression("X + 1", "x + 1")).toBe(true);
    expect(sameExpression("3x + 2", "3x + 3")).toBe(false);
    expect(sameExpression("2x", "x²")).toBe(false);
  });

  it("rejects things it can't read", () => {
    for (const bad of ["", "3x +", "(x + 1", "x ÷ 2", "1.5x", "x^", "hello!"]) expect(parseExpression(bad).ok, bad).toBe(false);
  });

  it("explains why an equal answer isn't tidy", () => {
    const reason = (s: string, form: "notation" | "simplified" = "simplified") => {
      const p = parseExpression(s);
      if (!p.ok) throw new Error(s);
      return untidyReason(p.ast, form);
    };
    expect(reason("n × 5")).toBe("times-sign");
    expect(reason("n5")).toBe("number-after-letter");
    expect(reason("nn")).toBe("repeated-letter");
    expect(reason("1x")).toBe("one-coefficient");
    expect(reason("3x + 5x")).toBe("like-terms");
    expect(reason("3(x + 4)")).toBe("brackets");
    expect(reason("3(x + 4)", "notation")).toBe(null);
    expect(reason("2 + 3x")).toBe(null);
    expect(reason("x² + 5x")).toBe(null);
  });
});

describe("algebra generators", () => {
  for (const skillId of Object.keys(ALGEBRA_GENERATORS)) {
    for (const tier of [1, 2] as const) {
      it(`${skillId} tier ${tier}: right answers pass, predicted wrong answers are caught`, () => {
        for (const seed of seeds) {
          const q = makeQuestion(skillId, tier, seed);
          const a = q.answer;
          // The answer as written is marked correct, and so is a reordered or "x = " form.
          if (a.kind === "expression") {
            expect(parseExpression(a.value).ok, a.value).toBe(true);
            expect(markAnswer(q, a.value, MC).outcome, `${q.prompt} → ${a.value}`).toBe("correct");
            expect(markAnswer(q, a.value.replace(/−/g, "-").replace(/²/g, "^2"), MC).correct).toBe(true);
            for (const w of q.wrongExpressions ?? []) {
              expect(MC[w.misconception], w.misconception).toBeDefined();
              const p = parseExpression(w.value);
              const want = parseExpression(a.value);
              expect(p.ok && want.ok && !polyEquals(p.poly, want.poly), `${q.prompt}: wrong "${w.value}" equals answer`).toBe(true);
              const res = markAnswer(q, w.value, MC);
              expect(res.correct).toBe(false);
              expect(res.misconception).toBe(w.misconception);
            }
          } else if (a.kind === "integer") {
            expect(a.value).toBeGreaterThanOrEqual(0);
            expect(markAnswer(q, String(a.value), MC).correct).toBe(true);
            expect(markAnswer(q, `x = ${a.value}`, MC).correct).toBe(true);
            for (const w of q.wrongAnswers) {
              expect(MC[w.misconception], w.misconception).toBeDefined();
              const res = markAnswer(q, String(w.value), MC);
              expect(res.correct).toBe(false);
              expect(res.misconception).toBe(w.misconception);
            }
          } else {
            throw new Error(`unexpected answer kind in ${q.id}`);
          }
          // No negative numbers yet: they aren't taught until the negatives skill is built.
          expect(q.prompt).not.toMatch(/(=|\(|=\s)\s*[−-]\s*\d/);
          expect(q.hints.length).toBeGreaterThan(0);
          expect(q.solution.length).toBeGreaterThan(0);
          expect(q.answerHelp).toBeTruthy();
          expect(questionFromId(q.id)).toEqual(q);
        }
      });
    }
  }

  it("solving: the stated answer really solves the equation", () => {
    for (const tier of [1, 2] as const)
      for (const seed of seeds) {
        const q = makeQuestion("alg-solve-simple", tier, seed);
        if (q.answer.kind !== "integer") throw new Error();
        const v = q.answer.value;
        const m = /^Solve (.+) = (.+)\.$/.exec(q.prompt)!;
        const evalSide = (side: string) =>
          Function(`"use strict"; const ${/[a-z]/.exec(q.prompt.slice(6))![0]} = ${v}; return (${side.replace(/−/g, "-").replace(/÷/g, "/").replace(/(\d)([a-z])/g, "$1*$2")});`)() as number;
        expect(evalSide(m[1]), q.prompt).toBe(evalSide(m[2]));
      }
  });

  it("function machines: running the input through the machine gives the output", () => {
    for (const tier of [1, 2] as const)
      for (const seed of seeds) {
        const q = makeQuestion("alg-function-machines", tier, seed);
        if (q.visual?.kind !== "machine" || q.answer.kind !== "integer") throw new Error();
        const m = q.visual.machine;
        const input = m.input === "?" ? q.answer.value : Number(m.input);
        const output = m.output === "?" ? q.answer.value : Number(m.output);
        let x = input;
        for (const s of m.steps) {
          const [op, nStr] = s.split(" ");
          const n = Number(nStr);
          x = op === "+" ? x + n : op === "−" ? x - n : op === "×" ? x * n : x / n;
          expect(Number.isInteger(x) && x >= 0, `${q.id} step ${s}`).toBe(true);
        }
        expect(x, q.id).toBe(output);
      }
  });

  it("gives helpful feedback for untidy but correct answers", () => {
    const q = seeds.map((s) => makeQuestion("alg-collect-terms", 1, s)).find((x) => /^Simplify \d*x \+ \d*x\.$/.test(x.prompt))!;
    const parts = /^Simplify (\d*x) \+ (\d*x)\.$/.exec(q.prompt)!;
    const res = markAnswer(q, `${parts[1]} + ${parts[2]}`, MC);
    expect(res.outcome).toBe("not-simplified");
    expect(res.feedback).toMatch(/like terms/);
  });

  it("spots 3a read as 35 when a = 5", () => {
    const q = seeds.map((s) => makeQuestion("alg-substitution", 1, s)).find((x) => /^Work out the value of \d[a-z] when/.test(x.prompt))!;
    const w = q.wrongAnswers.find((x) => x.misconception === "alg-digits-joined")!;
    expect(markAnswer(q, String(w.value), MC).feedback).toMatch(/not \d+|×/);
  });
});

describe("algebra content", () => {
  it("every skill has a draft lesson, a generator and valid prerequisites", () => {
    for (const s of ALGEBRA_SKILLS) {
      expect(ALGEBRA_LESSONS[s.id]).toBeDefined();
      expect(ALGEBRA_GENERATORS[s.id]).toBeDefined();
      for (const p of s.prerequisites) expect(SKILL_BY_ID[p], p).toBeDefined();
      expect(LESSONS[s.id].status).toBe("draft");
    }
    for (const m of Object.values(MC)) if (m.pointsTo) expect(SKILL_BY_ID[m.pointsTo], m.pointsTo).toBeDefined();
    for (const id of Object.keys(MC)) expect(MISCONCEPTIONS[id]).toBeDefined();
  });

  it("every misconception is used by at least one question", () => {
    const used = new Set<string>();
    for (const skillId of Object.keys(ALGEBRA_GENERATORS))
      for (const tier of [1, 2] as const)
        for (const seed of seeds) {
          const q = makeQuestion(skillId, tier, seed);
          for (const w of [...q.wrongAnswers, ...(q.wrongExpressions ?? [])]) used.add(w.misconception);
        }
    for (const id of Object.keys(MC)) expect(used.has(id), id).toBe(true);
  });
});
