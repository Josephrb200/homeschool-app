import { describe, expect, it } from "vitest";
import { equals, frac, show, showMixed } from "@/engine/fraction";
import { markAnswer } from "@/engine/marking";
import { GENERATORS, makeQuestion } from "./generators";
import { FRACTION_MISCONCEPTIONS as MC, FRACTION_SKILLS } from "./skills";
import { FRACTION_LESSONS } from "./lessons";
import { SKILL_BY_ID } from "@/content";

const seeds = Array.from({ length: 400 }, (_, i) => i * 7919 + 13);
const all = (skillId: string, tier: 1 | 2) => seeds.map((s) => makeQuestion(skillId, tier, s));

describe("fractions content", () => {
  it("every skill has a draft lesson, a generator and real prerequisites", () => {
    for (const s of FRACTION_SKILLS) {
      expect(FRACTION_LESSONS[s.id], s.id).toBeDefined();
      expect(FRACTION_LESSONS[s.id].status).toBe("draft");
      expect(GENERATORS[s.id], s.id).toBeDefined();
      for (const p of s.prerequisites) expect(SKILL_BY_ID[p], p).toBeDefined();
    }
    for (const m of Object.values(MC)) if (m.pointsTo) expect(SKILL_BY_ID[m.pointsTo]).toBeDefined();
  });

  it("worked example bars are sensible fractions", () => {
    for (const l of Object.values(FRACTION_LESSONS))
      for (const ex of l.teaching.examples) for (const b of ex.bars ?? []) expect(b.n > 0 && b.d > 0 && b.d <= 20).toBe(true);
  });

  it("no question text ever shows undefined, NaN, a zero numerator or a 1/1", () => {
    for (const skillId of Object.keys(GENERATORS))
      for (const tier of [1, 2] as const)
        for (const q of all(skillId, tier)) {
          const text = [q.prompt, ...q.hints, ...q.solution].join(" | ");
          expect(text, text).not.toMatch(/undefined|NaN|Infinity|(^|[^\d])0\/\d|(^|[^\d])1\/1([^\d]|$)/);
        }
  });
});

describe("mixed numbers", () => {
  it("converting to a mixed number needs a mixed number, kindly", () => {
    const q = all("frac-mixed-numbers", 1).find((x) => x.prompt.includes("as a mixed number"))!;
    expect(q.answer.kind).toBe("fraction");
    if (q.answer.kind !== "fraction") return;
    const v = q.answer.value;
    expect(markAnswer(q, showMixed(v), MC).outcome).toBe("correct");
    const improper = markAnswer(q, show(v), MC);
    expect(improper.outcome).toBe("not-simplified");
    expect(improper.feedback).toMatch(/mixed number/);
    // an unsimplified fraction part is caught with a mixed-number explanation
    const whole = Math.floor(v.n / v.d);
    const unsimplified = markAnswer(q, `${whole} ${(v.n % v.d) * 2}/${v.d * 2}`, MC);
    expect(unsimplified.outcome).toBe("not-simplified");
    expect(unsimplified.feedback).toContain(showMixed(v));
  });

  it("converting to an improper fraction needs an improper fraction", () => {
    const q = all("frac-mixed-numbers", 1).find((x) => x.prompt.includes("improper fraction"))!;
    if (q.answer.kind !== "fraction") throw new Error("expected fraction");
    const v = q.answer.value;
    expect(markAnswer(q, show(v), MC).outcome).toBe("correct");
    expect(markAnswer(q, showMixed(v), MC).outcome).toBe("not-simplified");
    // 2 3/4 → 5/4 (added the whole to the top)
    const m = /Write (\d+) (\d+)\/(\d+)/.exec(q.prompt)!;
    const added = `${Number(m[1]) + Number(m[2])}/${m[3]}`;
    expect(markAnswer(q, added, MC).misconception).toBe("mixed-added-whole");
  });

  it("calculations accept a mixed number or an improper fraction", () => {
    for (const q of all("frac-mixed-numbers", 2)) {
      if (q.answer.kind !== "fraction") throw new Error("expected fraction");
      expect(markAnswer(q, show(q.answer.value), MC).outcome).toBe("correct");
      expect(markAnswer(q, showMixed(q.answer.value), MC).outcome).toBe("correct");
      // numbers stay friendly
      expect(q.answer.value.d).toBeLessThanOrEqual(36);
      expect(q.answer.value.n / q.answer.value.d).toBeLessThan(40);
    }
  });

  it("practises all four operations, and spots splitting wholes and fractions", () => {
    const qs = all("frac-mixed-numbers", 2);
    for (const op of ["+", "−", "×", "÷"]) expect(qs.some((q) => q.prompt.includes(` ${op} `)), op).toBe(true);
    const q = qs.find((x) => x.prompt.includes(" × ") && x.wrongAnswers.length > 0)!;
    const w = q.wrongAnswers[0];
    expect(w.misconception).toBe("mixed-split-parts");
    expect(markAnswer(q, show(w.value as ReturnType<typeof frac>), MC).feedback).toMatch(/improper fraction/);
    expect(qs.some((x) => x.wrongAnswers.some((y) => y.misconception === "mixed-subtracted-backwards"))).toBe(true);
  });
});

describe("other fraction skills", () => {
  it("fractions of amounts includes working backwards from a part", () => {
    const rev = all("frac-of-amount", 2).filter((q) => q.prompt.includes("of a number is"));
    expect(rev.length).toBeGreaterThan(20);
    for (const q of rev) {
      const m = /^(\d+)\/(\d+) of a number is (\d+)/.exec(q.prompt)!;
      if (q.answer.kind !== "integer") throw new Error("expected integer");
      expect(equals(frac(q.answer.value * Number(m[1]), Number(m[2])), frac(Number(m[3])))).toBe(true);
      expect(q.answer.value).toBeGreaterThan(Number(m[3]));
    }
    expect(all("frac-of-amount", 1).some((q) => q.prompt.includes("of a number is"))).toBe(false);
  });

  it("multiplying includes whole number × fraction, and guided practice never divides", () => {
    expect(all("frac-mul-div", 2).some((q) => /^Work out \d+ × \d+\/\d+/.test(q.prompt))).toBe(true);
    expect(all("frac-mul-div", 1).some((q) => q.prompt.includes("÷"))).toBe(false);
  });

  it("simplifying spots dividing only one part", () => {
    const q = makeQuestion("frac-simplify", 1, 5);
    const w = q.wrongAnswers.find((x) => x.misconception === "simplified-one-part")!;
    expect(markAnswer(q, show(w.value as ReturnType<typeof frac>), MC).feedback).toMatch(/top AND the bottom/);
  });
});
