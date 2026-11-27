import { describe, expect, it } from "vitest";
import { frac, show } from "@/engine/fraction";
import { answerText, markAnswer } from "@/engine/marking";
import type { PlaneSpec, Question, Visual } from "@/engine/types";
import { makeQuestion, questionFromId } from "@/content/questions";
import { CHAINS, LESSONS, MISCONCEPTIONS as MC, SKILL_BY_ID } from "@/content";
import { TRANSFORMATION_GENERATORS } from "./generators";
import { TRANSFORMATION_SKILLS } from "./skills";
import { TRANSFORMATION_LESSONS } from "./lessons";
import { enlarge, reflect, rotate, sameShape, vec } from "./geometry";

const seeds = Array.from({ length: 300 }, (_, i) => i * 7919 + 13);

function planes(v: Visual | undefined): PlaneSpec[] {
  if (!v) return [];
  if (v.kind === "plane") return [v.plane];
  if (v.kind === "panels") return v.panels.flatMap((p) => planes(p.visual));
  return [];
}

/** Everything drawn sits inside the picture's window. */
function checkPlane(p: PlaneSpec, label: string) {
  const inWin = ([x, y]: [number, number]) => x >= p.x[0] - 1e-9 && x <= p.x[1] + 1e-9 && y >= p.y[0] - 1e-9 && y <= p.y[1] + 1e-9;
  for (const s of p.shapes ?? []) for (const pt of s.points) expect(inWin(pt), `${label}: shape corner ${pt}`).toBe(true);
  for (const pt of p.points ?? []) expect(inWin(pt.at), `${label}: point ${pt.at}`).toBe(true);
  for (const l of p.lines ?? []) expect(inWin(l.a) && inWin(l.b), `${label}: line`).toBe(true);
  expect(p.description, label).not.toMatch(/undefined|NaN/);
}

const typed = (q: Question, v: Question["wrongAnswers"][number]["value"]) =>
  q.answer.kind === "choice" ? q.answer.options[v as number] : Array.isArray(v) ? `(${v[0]}, ${v[1]})` : show(typeof v === "number" ? frac(v) : v);

describe("transformation generators", () => {
  for (const skillId of Object.keys(TRANSFORMATION_GENERATORS)) {
    for (const tier of [1, 2] as const) {
      it(`${skillId} tier ${tier}: answers, pictures and wrong answers are consistent`, () => {
        for (const seed of seeds) {
          const q = makeQuestion(skillId, tier, seed);
          const label = `${q.id} ${q.prompt}`;
          for (const p of planes(q.visual)) checkPlane(p, label);
          if (q.answer.kind === "choice") {
            const { options, correctIndex } = q.answer;
            expect(new Set(options).size, label).toBe(options.length);
            expect(options.length, label).toBeGreaterThanOrEqual(3);
            expect(markAnswer(q, options[correctIndex], MC).correct, label).toBe(true);
          } else if (q.answer.kind === "point") {
            const [x, y] = q.answer.value;
            expect(Number.isFinite(x) && Number.isFinite(y), label).toBe(true);
            expect(markAnswer(q, `(${x}, ${y})`, MC).correct, label).toBe(true);
            expect(markAnswer(q, `${x},${y}`, MC).correct, label).toBe(true);
          } else {
            expect(markAnswer(q, answerText(q).replace(/ (cm|mm|m)$/, "").replace("½", "1/2"), MC).correct, `${label} -> ${answerText(q)}`).toBe(true);
          }
          for (const w of q.wrongAnswers) {
            expect(MC[w.misconception], `${label}: ${w.misconception}`).toBeDefined();
            const res = markAnswer(q, typed(q, w.value), MC);
            expect(res.correct, `${label} wrong ${typed(q, w.value)}`).toBe(false);
            expect(res.misconception, `${label} wrong ${typed(q, w.value)}`).toBe(w.misconception);
          }
          expect(q.hints.length).toBeGreaterThan(0);
          expect(q.solution.length).toBeGreaterThan(0);
          expect(q.prompt + q.solution.join(" ") + q.hints.join(" ") + (q.answerText ?? ""), label).not.toMatch(/undefined|NaN|\[object/);
          expect(questionFromId(q.id)).toEqual(q);
        }
      });
    }
  }

  it("mixes question types", () => {
    for (const skillId of Object.keys(TRANSFORMATION_GENERATORS))
      for (const tier of [1, 2] as const) {
        const prompts = new Set(seeds.slice(0, 80).map((s) => makeQuestion(skillId, tier, s).prompt.replace(/[−\d]+/g, "#").slice(0, 40)));
        expect(prompts.size, `${skillId} tier ${tier}`).toBeGreaterThanOrEqual(3);
      }
  });
});

describe("transformation geometry", () => {
  it("reflects, rotates and enlarges points correctly", () => {
    expect(reflect([1, 2], { kind: "x", c: 3 })).toEqual([5, 2]);
    expect(reflect([1, 2], { kind: "y", c: -1 })).toEqual([1, -4]);
    expect(reflect([1, 2], { kind: "y=x" })).toEqual([2, 1]);
    expect(reflect([1, 2], { kind: "y=-x" })).toEqual([-2, -1]);
    expect(rotate([2, 1], { deg: 90, dir: "clockwise", c: [0, 0] })).toEqual([1, -2]);
    expect(rotate([2, 1], { deg: 90, dir: "anticlockwise", c: [0, 0] })).toEqual([-1, 2]);
    expect(rotate([3, 1], { deg: 90, dir: "clockwise", c: [1, 1] })).toEqual([1, -1]);
    expect(rotate([3, 1], { deg: 180, dir: "clockwise", c: [1, 1] })).toEqual([-1, 1]);
    expect(enlarge([3, 2], 2, [1, 1])).toEqual([5, 3]);
    expect(enlarge([5, 3], 0.5, [1, 1])).toEqual([3, 2]);
    expect(sameShape([[0, 0], [1, 0], [0, 1]], [[1, 0], [0, 1], [0, 0]])).toBe(true);
    expect(vec([3, -2])).toBe("vec(3,−2)");
  });
});

describe("transformation lessons and skills", () => {
  it("every skill has a lesson, a generator and a place in a chain", () => {
    const chain = CHAINS.find((c) => c.id === "transformations")!;
    for (const s of TRANSFORMATION_SKILLS) {
      expect(TRANSFORMATION_LESSONS[s.id], s.id).toBeDefined();
      expect(LESSONS[s.id]).toBe(TRANSFORMATION_LESSONS[s.id]);
      expect(TRANSFORMATION_GENERATORS[s.id], s.id).toBeDefined();
      expect(SKILL_BY_ID[s.id]).toBeDefined();
      expect(chain.skillIds).toContain(s.id);
      expect(TRANSFORMATION_LESSONS[s.id].status).toBe("draft");
    }
  });

  it("worked examples' pictures fit their windows", () => {
    for (const l of Object.values(TRANSFORMATION_LESSONS)) for (const ex of l.teaching.examples) for (const p of planes(ex.visual)) checkPlane(p, ex.question);
  });
});
