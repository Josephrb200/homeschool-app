import { describe, expect, it } from "vitest";
import { frac, show } from "@/engine/fraction";
import { answerText, markAnswer, parseRatio } from "@/engine/marking";
import type { Question } from "@/engine/types";
import { RATIO_GENERATORS } from "./generators";
import { RATIO_MISCONCEPTIONS as MC, RATIO_SKILLS } from "./skills";
import { RATIO_LESSONS } from "./lessons";
import { GCSE_FOUNDATION_MAP } from "../gcse-foundation-map";
import { makeQuestion, questionFromId } from "@/content/questions";
import { CHAINS, LESSONS, MISCONCEPTIONS, SKILL_BY_ID } from "@/content";

const seeds = Array.from({ length: 400 }, (_, i) => i * 7919 + 13);

/** What a student would type for the right answer. */
function typed(q: Question): string {
  const a = q.answer;
  if (a.kind === "ratio") return a.value.join(":");
  if (a.kind === "integer") return String(a.value);
  if (a.kind === "fraction") return show(a.value);
  return answerText(q);
}
function typedWrong(v: Question["wrongAnswers"][number]["value"]): string {
  if (Array.isArray(v)) return v.join(":");
  if (typeof v === "number") return String(v);
  return show(v);
}

describe("ratio generators", () => {
  for (const skillId of Object.keys(RATIO_GENERATORS)) {
    for (const tier of [1, 2] as const) {
      it(`${skillId} tier ${tier}: right answers mark correct, wrong answers find their misconception`, () => {
        for (const seed of seeds) {
          const q = makeQuestion(skillId, tier, seed);
          const ctx = `${q.prompt} (seed ${seed})`;
          expect(markAnswer(q, typed(q), MC).outcome, ctx).toBe("correct");
          // Answers are positive and whole where they should be.
          if (q.answer.kind === "integer") {
            expect(Number.isInteger(q.answer.value), ctx).toBe(true);
            expect(q.answer.value, ctx).toBeGreaterThan(0);
          }
          if (q.answer.kind === "fraction") expect(q.answer.value.n, ctx).toBeGreaterThan(0);
          if (q.answer.kind === "ratio") for (const p of q.answer.value) expect(Number.isInteger(p) && p > 0, ctx).toBe(true);
          // No NaN, Infinity or undefined leaks into the words.
          for (const t of [q.prompt, ...q.hints, ...q.solution]) expect(t, ctx).not.toMatch(/NaN|Infinity|undefined|\[object/);
          for (const w of q.wrongAnswers) {
            expect(MC[w.misconception], w.misconception).toBeDefined();
            const res = markAnswer(q, typedWrong(w.value), MC);
            expect(res.outcome, `${ctx} wrong ${typedWrong(w.value)}`).toBe("incorrect");
            expect(res.misconception, ctx).toBe(w.misconception);
          }
          expect(q.hints.length).toBeGreaterThan(0);
          expect(q.solution.length).toBeGreaterThan(1);
          // The worked solution ends with the answer.
          const last = q.solution[q.solution.length - 1];
          const shown = q.answer.kind === "fraction" && !q.answerText ? `${q.answer.value.n}/${q.answer.value.d}` : answerText(q);
          expect(last, ctx).toContain(shown);
          expect(questionFromId(q.id)).toEqual(q);
        }
      });
    }
  }

  it("money answers accept £, trailing zeros and pence-free forms, and show as money", () => {
    const q = seeds.map((s) => makeQuestion("ratio-unitary-method", 1, s)).find((x) => x.answerText?.includes("."))!;
    expect(q).toBeDefined();
    const amount = q.answerText!.replace("£", "");
    for (const t of [amount, `£${amount}`, String(Number(amount))]) expect([t, markAnswer(q, t, MC).outcome]).toEqual([t, "correct"]);
    expect(answerText(q)).toMatch(/^£\d+\.\d\d$/);
  });

  it("every question can be typed: ratio questions say how to type a ratio", () => {
    for (const skillId of Object.keys(RATIO_GENERATORS))
      for (const seed of seeds.slice(0, 80)) {
        const q = makeQuestion(skillId, 2, seed);
        if (q.answer.kind === "ratio") expect(q.answerHelp, q.prompt).toMatch(/colon/);
      }
  });
});

describe("ratio marking", () => {
  const q = makeQuestion("ratio-simplify", 1, 1);
  const a = q.answer.kind === "ratio" ? q.answer.value : [];

  it("reads ratios typed in different ways", () => {
    expect(parseRatio("3:2")).toEqual([frac(3), frac(2)]);
    expect(parseRatio(" 3 : 2 ")).toEqual([frac(3), frac(2)]);
    expect(parseRatio("3 to 2")).toEqual([frac(3), frac(2)]);
    expect(parseRatio("2:3:5")?.length).toBe(3);
    expect(parseRatio("1.5:2")).toEqual([frac(3, 2), frac(2)]);
    expect(parseRatio("3")).toBeNull();
    expect(parseRatio("3:")).toBeNull();
    expect(parseRatio("0:4")).toBeNull();
  });

  it("an equivalent but unsimplified ratio is 'not simplified', not wrong", () => {
    const r = markAnswer(q, a.map((n) => n * 3).join(":"), MC);
    expect(r.outcome).toBe("not-simplified");
    expect(r.feedback).toContain(a.join(":"));
  });

  it("a ratio with decimals is not the simplest form", () => {
    const r = markAnswer(q, a.map((n) => n / 2).join(":"), MC);
    expect(r.outcome).toBe("not-simplified");
  });

  it("a single number gets help with the format, and isn't recorded as wrong", () => {
    const r = markAnswer(q, "5", MC);
    expect(r.outcome).toBe("unreadable");
    expect(r.feedback).toMatch(/colon/);
  });

  it("a reversed ratio is spotted", () => {
    const flipped = makeQuestion("ratio-simplify", 1, 1);
    if (flipped.answer.kind !== "ratio") return;
    const r = markAnswer(flipped, [...flipped.answer.value].reverse().join(":"), MC);
    expect(r.misconception).toBe("ratio-reversed");
  });
});

describe("ratio content", () => {
  const map = new Map(GCSE_FOUNDATION_MAP.map((s) => [s.id, s]));

  it("every skill has a lesson and generator, and copies the topic map's prerequisites exactly", () => {
    for (const s of RATIO_SKILLS) {
      expect(RATIO_LESSONS[s.id]).toBeDefined();
      expect(RATIO_GENERATORS[s.id]).toBeDefined();
      expect(LESSONS[s.id].status).toBe("draft");
      expect([...s.prerequisites].sort()).toEqual([...map.get(s.id)!.prerequisites].sort());
      // The live version only points at skills that exist.
      for (const p of SKILL_BY_ID[s.id].prerequisites) expect(SKILL_BY_ID[p], p).toBeDefined();
    }
    for (const m of Object.values(MC)) if (m.pointsTo) expect(SKILL_BY_ID[m.pointsTo]).toBeDefined();
    expect(MISCONCEPTIONS["ratio-reversed"]).toBeDefined();
    expect(CHAINS.find((c) => c.id === "ratio")?.skillIds).toEqual(RATIO_SKILLS.map((s) => s.id));
  });

  it("ratio skills unlock from the fractions chain while number skills aren't built", () => {
    expect(SKILL_BY_ID["ratio-simplify"].prerequisites).toContain("frac-simplify");
    expect(SKILL_BY_ID["ratio-fractions"].prerequisites.sort()).toEqual(["frac-of-amount", "ratio-share"]);
  });
});
