import { describe, expect, it } from "vitest";
import { frac, show } from "@/engine/fraction";
import { markAnswer } from "@/engine/marking";
import type { AngleSpec, Question } from "@/engine/types";
import { makeQuestion, questionFromId } from "@/content/questions";
import { CHAINS, LESSONS, MISCONCEPTIONS as MC, SKILL_BY_ID } from "@/content";
import { ANGLE_GENERATORS } from "./generators";
import { ANGLE_SKILLS } from "./skills";
import { ANGLE_LESSONS } from "./lessons";
import { measure, pairKind, parallelDiagram, polygonFromAngles } from "./geometry";

const seeds = Array.from({ length: 400 }, (_, i) => i * 7919 + 13);

/** Every labelled angle in a diagram is drawn at the size its label says. */
function checkDrawing(spec: AngleSpec, answer: number | undefined, label: string) {
  for (const name of [...spec.segments.flat(), ...spec.angles.flatMap((m) => [m.at, m.from, m.to])]) expect(spec.points[name], `${label}: point ${name}`).toBeDefined();
  for (const m of spec.angles) {
    const size = measure(spec, m);
    const num = /^(\d+)°$/.exec(m.text ?? "");
    if (num) expect(size, `${label}: ${m.text}`).toBeCloseTo(Number(num[1]), 6);
    if (m.right) expect(size, `${label}: right angle`).toBeCloseTo(90, 6);
    if (m.text === "x" && answer !== undefined) expect(size, `${label}: x`).toBeCloseTo(answer, 6);
  }
}

describe("angle generators", () => {
  for (const skillId of Object.keys(ANGLE_GENERATORS)) {
    for (const tier of [1, 2] as const) {
      it(`${skillId} tier ${tier}: answers, drawings and wrong answers are consistent`, () => {
        for (const seed of seeds) {
          const q: Question = makeQuestion(skillId, tier, seed);
          const label = `${q.id} ${q.prompt}`;
          const isAngle = q.answer.kind === "integer" && q.answerHelp?.includes("degrees");
          if (q.visual) {
            expect(q.visual.kind).toBe("angles");
            if (q.visual.kind === "angles") checkDrawing(q.visual.angles, isAngle && q.answer.kind === "integer" ? q.answer.value : undefined, label);
          }

          if (q.answer.kind === "choice") {
            const { options, correctIndex } = q.answer;
            expect(new Set(options).size, label).toBe(options.length);
            expect(options.length).toBeGreaterThanOrEqual(3);
            expect(markAnswer(q, options[correctIndex], MC).correct).toBe(true);
          } else {
            expect(q.answer.kind).toBe("integer");
            if (q.answer.kind !== "integer") continue;
            const v = q.answer.value;
            expect(Number.isInteger(v) && v > 0, label).toBe(true);
            expect(markAnswer(q, String(v), MC).correct, label).toBe(true);
            if (isAngle) {
              expect(markAnswer(q, `${v}°`, MC).correct, label).toBe(true);
              expect(markAnswer(q, `${v} degrees`, MC).correct, label).toBe(true);
              expect(v).toBeLessThanOrEqual(1800);
            }
          }

          // Every predicted wrong answer is wrong and names a known misconception.
          for (const w of q.wrongAnswers) {
            expect(MC[w.misconception], w.misconception).toBeDefined();
            const typed = q.answer.kind === "choice" ? q.answer.options[w.value as number] : show(typeof w.value === "number" ? frac(w.value) : (w.value as ReturnType<typeof frac>));
            const res = markAnswer(q, typed, MC);
            expect(res.correct, `${label} wrong ${typed}`).toBe(false);
            expect(res.misconception).toBe(w.misconception);
          }
          expect(q.hints.length).toBeGreaterThan(0);
          expect(q.solution.length).toBeGreaterThan(0);
          expect(q.prompt + q.solution.join(" ")).not.toMatch(/undefined|NaN/);
          expect(questionFromId(q.id)).toEqual(q);
        }
      });
    }
  }

  it("mixes question types (no skill is one kind of question)", () => {
    // Parallel lines has one wording for every "find x" question, so it needs only 2.
    for (const skillId of Object.keys(ANGLE_GENERATORS)) {
      const prompts = new Set(seeds.slice(0, 60).map((s) => makeQuestion(skillId, 2, s).prompt.replace(/\d+/g, "#")));
      expect(prompts.size, skillId).toBeGreaterThanOrEqual(skillId === "geo-parallel-angles" ? 2 : 3);
    }
  });
});

describe("angle geometry", () => {
  it("builds polygons with the asked-for angles", () => {
    const pts = polygonFromAngles([100, 80, 95, 85], [6, 5])!;
    const spec: AngleSpec = {
      points: Object.fromEntries(pts.map((p, i) => [`V${i}`, p])),
      segments: [],
      angles: [0, 1, 2, 3].map((i) => ({ at: `V${i}`, from: `V${(i + 1) % 4}`, to: `V${(i + 3) % 4}` })),
      description: "",
    };
    expect(spec.angles.map((m) => measure(spec, m))).toEqual([100, 80, 95, 85].map((a) => expect.closeTo(a, 6)));
  });

  it("names angle pairs in parallel lines", () => {
    expect(pairKind({ at: "Q", pos: 0 }, { at: "P", pos: 0 })).toBe("corresponding");
    expect(pairKind({ at: "Q", pos: 2 }, { at: "P", pos: 0 })).toBe("alternate");
    expect(pairKind({ at: "Q", pos: 3 }, { at: "P", pos: 0 })).toBe("co-interior");
    expect(pairKind({ at: "P", pos: 1 }, { at: "P", pos: 3 })).toBe("vertically opposite");
    expect(pairKind({ at: "Q", pos: 0 }, { at: "P", pos: 1 })).toBe("other");
    // Alternate angles really are equal, co-interior really add to 180°.
    const spec = parallelDiagram(65, [
      { at: "Q", pos: 2 },
      { at: "P", pos: 0 },
      { at: "P", pos: 1 },
    ]);
    const [a, b, c] = spec.angles.map((m) => measure(spec, m));
    expect(a).toBeCloseTo(b, 6);
    expect(a + c).toBeCloseTo(180, 6);
  });
});

describe("angles lessons and skills", () => {
  it("every skill has a lesson, a generator and a place in a chain", () => {
    const chain = CHAINS.find((c) => c.id === "angles")!;
    for (const s of ANGLE_SKILLS) {
      expect(ANGLE_LESSONS[s.id], s.id).toBeDefined();
      expect(LESSONS[s.id]).toBe(ANGLE_LESSONS[s.id]);
      expect(ANGLE_GENERATORS[s.id], s.id).toBeDefined();
      expect(SKILL_BY_ID[s.id]).toBeDefined();
      expect(chain.skillIds).toContain(s.id);
      expect(ANGLE_LESSONS[s.id].status).toBe("draft");
    }
  });

  it("worked examples' diagrams are drawn to their labels", () => {
    for (const l of Object.values(ANGLE_LESSONS))
      for (const ex of l.teaching.examples) if (ex.visual?.kind === "angles") checkDrawing(ex.visual.angles, undefined, ex.question);
  });
});
