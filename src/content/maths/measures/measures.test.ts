import { describe, expect, it } from "vitest";
import { frac, parseAnswer, show } from "@/engine/fraction";
import { markAnswer, roundTo } from "@/engine/marking";
import type { Question, ShapeSpec } from "@/engine/types";
import { makeQuestion, questionFromId } from "@/content/questions";
import { CHAINS, LESSONS, MISCONCEPTIONS as MC, SKILL_BY_ID } from "@/content";
import { MEASURES_GENERATORS } from "./generators";
import { MEASURES_SKILLS } from "./skills";
import { MEASURES_LESSONS } from "./lessons";

const seeds = Array.from({ length: 300 }, (_, i) => i * 7919 + 13);

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
const polygonPerimeter = (pts: [number, number][]) => pts.reduce((s, _, i) => s + sideLen(pts, i), 0);
function isConvex(pts: [number, number][]) {
  let sign = 0;
  for (let i = 0; i < pts.length; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[(i + 1) % pts.length];
    const [cx, cy] = pts[(i + 2) % pts.length];
    const cross = (bx - ax) * (cy - by) - (by - ay) * (cx - bx);
    if (cross !== 0) {
      if (sign && Math.sign(cross) !== sign) return false;
      sign = Math.sign(cross);
    }
  }
  return true;
}
function labelsMatch(shape: ShapeSpec) {
  for (const s of shape.sides) {
    const m = /^(\d+)( |$)/.exec(s.text);
    if (m) expect(sideLen(shape.points, s.i)).toBeCloseTo(Number(m[1]), 9);
  }
}
const value = (q: Question) =>
  q.answer.kind === "integer" ? q.answer.value : q.answer.kind === "fraction" ? q.answer.value.n / q.answer.value.d : q.answer.kind === "decimal" ? q.answer.exact : NaN;

describe("measures generators", () => {
  for (const skillId of Object.keys(MEASURES_GENERATORS)) {
    for (const tier of [1, 2] as const) {
      it(`${skillId} tier ${tier}: answers, diagrams and wrong answers are consistent`, () => {
        for (const seed of seeds) {
          const q = makeQuestion(skillId, tier, seed);
          expect(q.visual, q.prompt).toBeDefined();
          const v = q.visual!;

          // Diagrams match their labels and the marked answer.
          if (v.kind === "shape") {
            labelsMatch(v.shape);
            if (skillId === "geo-perimeter" && !q.prompt.includes("How long")) expect(polygonPerimeter(v.shape.points)).toBeCloseTo(value(q), 9);
          }
          if (v.kind === "solid" && v.solid.kind === "prism") {
            expect(isConvex(v.solid.face.points)).toBe(true);
            labelsMatch(v.solid.face);
            for (const h of v.solid.face.heights ?? []) expect(Math.min(h.y1, h.y2)).toBe(0);
            const vol = polygonArea(v.solid.face.points) * v.solid.length;
            const faceArea = polygonArea(v.solid.face.points);
            const L = v.solid.length;
            if (q.prompt.startsWith("Find the volume") && v.solid.face.sides.length > 0) expect(vol).toBeCloseTo(value(q), 9);
            if (q.prompt.startsWith("Find the surface area")) {
              const pts = v.solid.face.points;
              expect(2 * faceArea + polygonPerimeter(pts) * L).toBeCloseTo(value(q), 9);
            }
          }
          if (v.kind === "solid" && v.solid.kind === "cylinder") {
            const { r, h } = v.solid;
            if (q.prompt.startsWith("Find the volume")) expect(Math.PI * r * r * h).toBeCloseTo(value(q), 9);
            if (q.prompt.includes("surface area")) expect(2 * Math.PI * r * r + 2 * Math.PI * r * h).toBeCloseTo(value(q), 9);
            expect(Number(/^\d+/.exec(v.solid.label.text)![0])).toBe(v.solid.label.on === "radius" ? r : 2 * r);
          }

          // The right answer, typed as a student would, is marked correct.
          if (q.answer.kind === "choice") {
            expect(markAnswer(q, q.answer.options[q.answer.correctIndex], MC).correct).toBe(true);
            expect(markAnswer(q, q.answer.options[q.answer.correctIndex].toLowerCase(), MC).correct).toBe(true);
            expect(new Set(q.answer.options).size).toBe(4);
          } else if (q.answer.kind === "decimal") {
            const ex = q.answer.exact;
            expect(markAnswer(q, `${roundTo(ex, 1)} cm²`, MC).correct, `${q.prompt} ${roundTo(ex, 1)}`).toBe(true);
            // With π = 3.14, worked through and rounded at the end.
            const with314 = (ex * 3.14) / Math.PI;
            if (!q.prompt.includes("diameter.")) expect(markAnswer(q, roundTo(with314, 1), MC).correct, `${q.prompt} 3.14 → ${roundTo(with314, 1)}`).toBe(true);
          } else {
            const val = value(q);
            const typed = Number.isInteger(val) ? `${val} cm` : `${val.toFixed(1)}cm3`;
            expect(markAnswer(q, typed, MC).correct, `${q.prompt} ${typed}`).toBe(true);
          }

          // Every predicted wrong answer is wrong and names a known misconception.
          for (const w of q.wrongAnswers) {
            expect(MC[w.misconception], w.misconception).toBeDefined();
            const typed =
              q.answer.kind === "choice"
                ? q.answer.options[w.value as number]
                : q.answer.kind === "decimal"
                  ? roundTo(w.value as number, 1)
                  : show(typeof w.value === "number" ? frac(w.value) : (w.value as ReturnType<typeof frac>));
            const res = markAnswer(q, typed, MC);
            expect(res.correct, `${q.prompt} wrong ${typed}`).toBe(false);
            expect(res.misconception).toBe(w.misconception);
          }
          expect(q.hints.length).toBeGreaterThan(0);
          expect(q.solution.length).toBeGreaterThan(0);
          expect(questionFromId(q.id)).toEqual(q);
        }
      });
    }
  }
});

describe("rounded answers", () => {
  const q: Question = {
    id: "t",
    skillId: "geo-circumference",
    prompt: "Find the circumference of a circle with diameter 10 cm.",
    answer: { kind: "decimal", exact: Math.PI * 10, dp: 1 },
    wrongAnswers: [{ value: Math.PI * 5, misconception: "circle-radius-in-pi-d" }],
    hints: [],
    solution: [],
  };
  it("accepts the rounded value and nudges over-precise answers", () => {
    const ex = q.answer.kind === "decimal" ? q.answer.exact : 0;
    expect(markAnswer(q, roundTo(ex, 1), MC).feedback).toBe("Correct.");
    const precise = markAnswer(q, roundTo(ex, 3), MC);
    expect(precise.correct).toBe(true);
    expect(precise.feedback).toMatch(/1 decimal place/);
    expect(markAnswer(q, roundTo(ex + 0.2, 1), MC).correct).toBe(false);
    expect(markAnswer(q, String(Math.round(ex) + 1), MC).correct).toBe(false);
  });
  it("reads volume units", () => {
    for (const t of ["60 cm³", "60cm3", "60 cubic cm", "60 m^3", "60 cubic metres"]) {
      const r = parseAnswer(t);
      expect([t, r.ok && r.value.n]).toEqual([t, 60]);
    }
  });
});

describe("measures content", () => {
  it("every skill has a lesson, a generator, valid prerequisites and a chain", () => {
    const inChains = CHAINS.flatMap((c) => c.skillIds);
    for (const s of MEASURES_SKILLS) {
      expect(MEASURES_LESSONS[s.id]).toBeDefined();
      expect(MEASURES_GENERATORS[s.id]).toBeDefined();
      for (const p of s.prerequisites) expect(SKILL_BY_ID[p], p).toBeDefined();
      expect(LESSONS[s.id].status).toBe("draft");
      expect(inChains).toContain(s.id);
    }
    for (const m of Object.values(MC)) if (m.pointsTo) expect(SKILL_BY_ID[m.pointsTo], m.pointsTo).toBeDefined();
  });

  it("worked example diagrams match their labels", () => {
    for (const l of Object.values(MEASURES_LESSONS)) {
      for (const ex of l.teaching.examples) {
        if (ex.shape) labelsMatch(ex.shape);
        if (ex.visual?.kind === "solid" && ex.visual.solid.kind === "prism") labelsMatch(ex.visual.solid.face);
      }
    }
  });
});
