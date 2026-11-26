import { describe, expect, it } from "vitest";
import { frac, show } from "@/engine/fraction";
import { markAnswer } from "@/engine/marking";
import { AREA_GENERATORS } from "./generators";
import { AREA_MISCONCEPTIONS as MC, AREA_SKILLS } from "./skills";
import { AREA_LESSONS } from "./lessons";
import { makeQuestion, questionFromId } from "@/content/questions";
import { LESSONS, MISCONCEPTIONS, SKILL_BY_ID } from "@/content";

const seeds = Array.from({ length: 300 }, (_, i) => i * 7919 + 13);

/** Shoelace area of the drawn polygon. */
function polygonArea(pts: [number, number][]) {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    s += x1 * y2 - x2 * y1;
  }
  return Math.abs(s) / 2;
}
const sideLen = (pts: [number, number][], i: number) => {
  const [x1, y1] = pts[i];
  const [x2, y2] = pts[(i + 1) % pts.length];
  return Math.hypot(x2 - x1, y2 - y1);
};
const answerValue = (q: ReturnType<typeof makeQuestion>) =>
  q.answer.kind === "integer" ? q.answer.value : q.answer.kind === "fraction" ? q.answer.value.n / q.answer.value.d : NaN;

describe("area generators", () => {
  for (const skillId of Object.keys(AREA_GENERATORS)) {
    for (const tier of [1, 2] as const) {
      it(`${skillId} tier ${tier}: answers, diagrams and wrong answers are consistent`, () => {
        for (const seed of seeds) {
          const q = makeQuestion(skillId, tier, seed);
          expect(q.visual?.kind).toBe("shape");
          if (q.visual?.kind !== "shape") continue;
          const shape = q.visual.shape;
          const isMissingSide = q.prompt.includes("How tall");
          // The drawing really has the area we mark as correct.
          if (!isMissingSide) expect(polygonArea(shape.points)).toBeCloseTo(answerValue(q), 9);
          // Every labelled side matches the drawing (to scale).
          for (const s of shape.sides) {
            const m = /^(\d+) /.exec(s.text);
            if (m) expect(sideLen(shape.points, s.i)).toBeCloseTo(Number(m[1]), 9);
          }
          for (const h of shape.heights ?? []) {
            expect(Math.abs(h.y1 - h.y2)).toBe(Number(/^(\d+)/.exec(h.text)![1]));
            // The foot of the height lands on the base.
            expect(Math.min(h.y1, h.y2)).toBe(0);
          }
          // Typed right answer (with units) is marked correct.
          const v = answerValue(q);
          const typed = Number.isInteger(v) ? `${v} cm²` : `${v.toFixed(1)}cm2`;
          expect(markAnswer(q, typed, MC).correct).toBe(true);
          // Every predicted wrong answer is wrong and maps to a known misconception.
          for (const w of q.wrongAnswers) {
            expect(MC[w.misconception]).toBeDefined();
            const val = typeof w.value === "number" ? frac(w.value) : w.value;
            const res = markAnswer(q, show(val), MC);
            expect(res.correct).toBe(false);
            expect(res.misconception).toBe(w.misconception);
          }
          expect(q.hints.length).toBeGreaterThan(0);
          expect(q.solution.length).toBeGreaterThan(0);
          expect(questionFromId(q.id)).toEqual(q);
        }
      });
    }
  }

  it("halves can be typed as decimals, fractions or mixed numbers", () => {
    // Find a triangle with a half answer.
    const q = seeds.map((s) => makeQuestion("area-triangle", 2, s)).find((x) => x.answer.kind === "fraction" && x.answer.value.d === 2 && x.answer.value.n % 2 === 1)!;
    const v = q.answer.kind === "fraction" ? q.answer.value : frac(0);
    const whole = Math.floor(v.n / v.d);
    for (const t of [`${whole}.5`, `${v.n}/2`, `${whole} 1/2`, `${whole}.5 m²`]) expect([t, markAnswer(q, t, MC).outcome]).toEqual([t, "correct"]);
  });

  it("spots the perimeter mistake on a rectangle", () => {
    const q = makeQuestion("area-rectangle", 1, 42);
    const w = q.wrongAnswers.find((x) => x.misconception === "area-used-perimeter")!;
    expect(markAnswer(q, show(w.value as ReturnType<typeof frac>), MC).feedback).toMatch(/perimeter/);
  });
});

describe("area content", () => {
  it("every skill has a lesson, a generator and valid prerequisites", () => {
    for (const s of AREA_SKILLS) {
      expect(AREA_LESSONS[s.id]).toBeDefined();
      expect(AREA_GENERATORS[s.id]).toBeDefined();
      for (const p of s.prerequisites) expect(SKILL_BY_ID[p]).toBeDefined();
      expect(LESSONS[s.id].status).toBe("draft");
    }
    for (const m of Object.values(MC)) if (m.pointsTo) expect(SKILL_BY_ID[m.pointsTo]).toBeDefined();
    expect(MISCONCEPTIONS["area-forgot-half"]).toBeDefined();
  });

  it("worked example diagrams match their labels", () => {
    for (const l of Object.values(AREA_LESSONS)) {
      for (const ex of l.teaching.examples) {
        if (!ex.shape) continue;
        for (const s of ex.shape.sides) expect(sideLen(ex.shape.points, s.i)).toBeCloseTo(Number(/^(\d+)/.exec(s.text)![1]), 9);
      }
    }
  });
});
