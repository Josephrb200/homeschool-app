import { describe, expect, it } from "vitest";
import { frac, show } from "@/engine/fraction";
import { markAnswer } from "@/engine/marking";
import type { AngleSpec, Question } from "@/engine/types";
import { makeQuestion, questionFromId } from "@/content/questions";
import { CHAINS, LESSONS, MISCONCEPTIONS as MC, SKILL_BY_ID } from "@/content";
import { measure } from "../angles/geometry";
import { protractorArms } from "@/components/ProtractorDiagram";
import { BEARING_GENERATORS } from "./generators";
import { ANGLE_MORE_SKILLS } from "./skills";
import { ANGLE_MORE_LESSONS } from "./lessons";

const seeds = Array.from({ length: 300 }, (_, i) => i * 7919 + 13);

function checkAngles(spec: AngleSpec, label: string) {
  for (const name of [...spec.segments.flat(), ...spec.angles.flatMap((m) => [m.at, m.from, m.to])]) expect(spec.points[name], `${label}: point ${name}`).toBeDefined();
  for (const m of spec.angles) {
    const num = /^(\d+)°$/.exec(m.text ?? "");
    if (num) expect(measure(spec, m), `${label}: ${m.text}`).toBeCloseTo(Number(num[1]), 6);
  }
}

describe("measuring, bearings and reasoning generators", () => {
  for (const skillId of Object.keys(BEARING_GENERATORS))
    for (const tier of [1, 2] as const)
      it(`${skillId} tier ${tier}`, () => {
        for (const seed of seeds) {
          const q: Question = makeQuestion(skillId, tier, seed);
          const label = `${q.id} ${q.prompt}`;
          if (q.visual?.kind === "angles") checkAngles(q.visual.angles, label);
          if (q.visual?.kind === "protractor") {
            const p = q.visual.protractor;
            const [a1, a2] = protractorArms(p);
            const between = Math.abs((((a2 - a1) % 360) + 540) % 360 - 180);
            expect(between, label).toBeCloseTo(Math.min(p.size, 360 - p.size), 6);
            if (!p.hideProtractor && q.answer.kind === "integer" && q.prompt.startsWith("Use the protractor")) expect(q.answer.value).toBe(p.size);
          }
          // Bearings: the drawn angle at A from north to B is the bearing (clockwise).
          if (q.visual?.kind === "angles" && skillId === "geo-bearings") {
            const s = q.visual.angles;
            const [bx, by] = s.points.B;
            const bearing = ((Math.atan2(bx, by) * 180) / Math.PI + 360) % 360;
            const m = /bearing of B from A is (\d{3})°/.exec(q.prompt);
            if (m) expect(bearing, label).toBeCloseTo(Number(m[1]), 6);
            else if (q.answer.kind === "integer") expect(bearing, label).toBeCloseTo(q.answer.value, 6);
          }
          if (q.answer.kind === "choice") {
            expect(new Set(q.answer.options).size).toBe(q.answer.options.length);
            expect(markAnswer(q, q.answer.options[q.answer.correctIndex], MC).correct, label).toBe(true);
          } else {
            expect(q.answer.kind).toBe("integer");
            if (q.answer.kind !== "integer") continue;
            expect(q.answer.value > 0 && q.answer.value < 360, label).toBe(true);
            expect(markAnswer(q, String(q.answer.value), MC).correct, label).toBe(true);
            if (skillId === "geo-bearings") expect(markAnswer(q, String(q.answer.value).padStart(3, "0"), MC).correct, label).toBe(true);
          }
          for (const w of q.wrongAnswers) {
            expect(MC[w.misconception], `${label}: ${w.misconception}`).toBeDefined();
            const typed = q.answer.kind === "choice" ? q.answer.options[w.value as number] : show(typeof w.value === "number" ? frac(w.value) : (w.value as ReturnType<typeof frac>));
            const res = markAnswer(q, typed, MC);
            expect(res.correct, `${label} wrong ${typed}`).toBe(false);
            expect(res.misconception).toBe(w.misconception);
          }
          expect(q.prompt + q.solution.join(" ") + q.hints.join(" "), label).not.toMatch(/undefined|NaN/);
          expect(questionFromId(q.id)).toEqual(q);
        }
      });

  it("mixes question types", () => {
    for (const skillId of Object.keys(BEARING_GENERATORS)) {
      const prompts = new Set(seeds.slice(0, 80).map((s) => makeQuestion(skillId, 2, s).prompt.replace(/\d+/g, "#")));
      expect(prompts.size, skillId).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("measuring, bearings and reasoning lessons", () => {
  it("every skill has a lesson, a generator and a place in the angles chain", () => {
    const chain = CHAINS.find((c) => c.id === "angles")!;
    for (const s of ANGLE_MORE_SKILLS) {
      expect(LESSONS[s.id]).toBe(ANGLE_MORE_LESSONS[s.id]);
      expect(BEARING_GENERATORS[s.id], s.id).toBeDefined();
      expect(SKILL_BY_ID[s.id]).toBeDefined();
      expect(chain.skillIds).toContain(s.id);
      expect(ANGLE_MORE_LESSONS[s.id].status).toBe("draft");
    }
  });
  it("worked examples are drawn to their labels", () => {
    for (const l of Object.values(ANGLE_MORE_LESSONS)) for (const ex of l.teaching.examples) if (ex.visual?.kind === "angles") checkAngles(ex.visual.angles, ex.question);
  });
});
