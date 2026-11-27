import { describe, expect, it } from "vitest";
import { markAnswer } from "@/engine/marking";
import type { Question } from "@/engine/types";
import { makeQuestion, questionFromId } from "@/content/questions";
import { CHAINS, LESSONS, MISCONCEPTIONS as MC, SKILL_BY_ID } from "@/content";
import { VECTOR_GENERATORS } from "./generators";
import { VECTOR_SKILLS } from "./skills";
import { VECTOR_LESSONS } from "./lessons";

const seeds = Array.from({ length: 400 }, (_, i) => i * 7919 + 13);
const typed = (p: number[]) => `(${p[0]}, ${p[1]})`;

describe("vector generators", () => {
  for (const tier of [1, 2] as const) {
    it(`geo-vectors tier ${tier}: answers, pictures and wrong answers are consistent`, () => {
      for (const seed of seeds) {
        const q: Question = makeQuestion("geo-vectors", tier, seed);
        const label = `${q.id} ${q.prompt}`;
        expect(q.answer.kind).toBe("point");
        if (q.answer.kind !== "point") continue;
        const v = q.answer.value;
        expect(markAnswer(q, typed(v), MC).correct, label).toBe(true);
        expect(markAnswer(q, `${v[0]}, ${v[1]}`.replace(/-/g, "−"), MC).correct, label).toBe(true);
        expect(q.answerText, label).toBe(`vec(${v.map((x) => String(x).replace("-", "−")).join(",")})`);
        if (q.visual) {
          expect(q.visual.kind).toBe("plane");
          if (q.visual.kind === "plane") {
            // The arrow drawn is exactly the answer, and stays inside the grid.
            const [arrow] = q.visual.plane.arrows!;
            expect([arrow.to[0] - arrow.from[0], arrow.to[1] - arrow.from[1]], label).toEqual(v);
            for (const p of [arrow.from, arrow.to]) {
              expect(p[0] >= q.visual.plane.x[0] && p[0] <= q.visual.plane.x[1], label).toBe(true);
              expect(p[1] >= q.visual.plane.y[0] && p[1] <= q.visual.plane.y[1], label).toBe(true);
            }
          }
        }
        for (const w of q.wrongAnswers) {
          expect(MC[w.misconception], w.misconception).toBeDefined();
          const res = markAnswer(q, typed(w.value as number[]), MC);
          expect(res.correct, `${label} wrong ${w.value}`).toBe(false);
          expect(res.misconception, `${label} wrong ${w.value}`).toBe(w.misconception);
        }
        expect(q.hints.length).toBeGreaterThan(0);
        expect(q.prompt + q.solution.join(" ") + q.hints.join(" ")).not.toMatch(/undefined|NaN|−0|\+ −|− −/);
        expect(questionFromId(q.id)).toEqual(q);
      }
    });
  }

  it("mixes question types", () => {
    const prompts = new Set(seeds.slice(0, 80).map((s) => makeQuestion("geo-vectors", 2, s).prompt.replace(/[−\d]+/g, "#")));
    expect(prompts.size).toBeGreaterThanOrEqual(5);
  });
});

describe("vectors lesson and skill", () => {
  it("has a lesson, a generator and a chain", () => {
    for (const s of VECTOR_SKILLS) {
      expect(LESSONS[s.id]).toBe(VECTOR_LESSONS[s.id]);
      expect(VECTOR_GENERATORS[s.id]).toBeDefined();
      expect(SKILL_BY_ID[s.id]).toBeDefined();
      expect(CHAINS.find((c) => c.id === "vectors")!.skillIds).toContain(s.id);
      expect(VECTOR_LESSONS[s.id].status).toBe("draft");
    }
  });
});
