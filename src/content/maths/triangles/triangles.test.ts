import { describe, expect, it } from "vitest";
import { frac, show, type Fraction } from "@/engine/fraction";
import { markAnswer, roundTo } from "@/engine/marking";
import type { AngleSpec, Question } from "@/engine/types";
import { makeQuestion, questionFromId } from "@/content/questions";
import { CHAINS, LESSONS, MISCONCEPTIONS as MC, SKILL_BY_ID } from "@/content";
import { speakable } from "@/components/MathText";
import { TRIANGLE_GENERATORS } from "./generators";
import { TRIANGLE_SKILLS, TRIG_SKILLS, SHAPE_PROOF_SKILLS } from "./skills";
import { TRIANGLE_LESSONS } from "./lessons";
import { measure } from "../angles/geometry";
import { dist, pose, triASA, triSAS, triSSS } from "./geometry";

const seeds = Array.from({ length: 400 }, (_, i) => i * 7919 + 13);

/** The number in a length label like "12 cm" or "1.5 m". */
const lengthValue = (text: string) => {
  const m = /^(\d+(?:\.\d+)?) (cm|m|mm)$/.exec(text);
  return m ? Number(m[1]) : undefined;
};

/**
 * Everything labelled is drawn to scale: every angle label matches the drawn
 * angle, and every length label uses the same scale (units per label unit).
 * The side or angle marked x matches the answer.
 */
function checkDrawing(spec: AngleSpec, answer: number | undefined, answerIs: "length" | "angle" | undefined, label: string) {
  for (const name of [...spec.segments.flat(), ...spec.angles.flatMap((m) => [m.at, m.from, m.to]), ...(spec.lengths ?? []).flatMap((l) => [l.a, l.b])])
    expect(spec.points[name], `${label}: point ${name}`).toBeDefined();
  for (const m of spec.angles) {
    const size = measure(spec, m);
    const n = /^(\d+)°$/.exec(m.text ?? "");
    if (n) expect(size, `${label}: ${m.text}`).toBeCloseTo(Number(n[1]), 6);
    if (m.right) expect(size, `${label}: right angle`).toBeCloseTo(90, 6);
    if ((m.text === "x" || m.text === "θ") && answerIs === "angle" && answer !== undefined) expect(Math.abs(size - answer), `${label}: ${m.text}`).toBeLessThan(0.051);
  }
  const scales: number[] = [];
  for (const l of spec.lengths ?? []) {
    const v = lengthValue(l.text);
    if (v !== undefined) scales.push(dist(spec, l.a, l.b) / v);
    else expect(l.text, label).toBe("x");
  }
  for (const s of scales) expect(s / scales[0], `${label}: all lengths to the same scale`).toBeCloseTo(1, 6);
  const x = spec.lengths?.find((l) => l.text === "x");
  if (x && answerIs === "length" && answer !== undefined && scales.length) expect(dist(spec, x.a, x.b) / scales[0], `${label}: x drawn to scale`).toBeCloseTo(answer, 4);
}

const asNumber = (q: Question): number | undefined => {
  const a = q.answer;
  if (a.kind === "integer") return a.value;
  if (a.kind === "decimal") return a.exact;
  if (a.kind === "fraction") return a.value.n / a.value.d;
  return undefined;
};

describe("triangle generators", () => {
  for (const skillId of Object.keys(TRIANGLE_GENERATORS)) {
    for (const tier of [1, 2] as const) {
      it(`${skillId} tier ${tier}: answers, drawings and wrong answers are consistent`, () => {
        for (const seed of seeds) {
          const q: Question = makeQuestion(skillId, tier, seed);
          const label = `${q.id} ${q.prompt}`;
          const answer = asNumber(q);
          const answerIs = q.answerText?.endsWith("°") ? "angle" : q.answerText?.match(/ (cm|m|mm)$/) ? "length" : undefined;
          if (q.visual) {
            expect(q.visual.kind).toBe("angles");
            if (q.visual.kind === "angles") checkDrawing(q.visual.angles, answer, answerIs, label);
          }

          if (q.answer.kind === "choice") {
            const { options, correctIndex } = q.answer;
            expect(new Set(options).size, label).toBe(options.length);
            expect(options.length).toBeGreaterThanOrEqual(2);
            expect(markAnswer(q, options[correctIndex], MC).correct).toBe(true);
          } else {
            expect(["integer", "decimal", "fraction"]).toContain(q.answer.kind);
            expect(answer! > 0, label).toBe(true);
            expect(q.answerHelp, label).toBeDefined();
            expect(q.answerText, label).toBeDefined();
            // The shown answer marks as correct, with or without its unit.
            const shown = q.answerText!;
            expect(markAnswer(q, shown, MC).correct, `${label}: ${shown}`).toBe(true);
            expect(markAnswer(q, shown.replace(/ ?(cm|m|mm|°)$/, ""), MC).correct, `${label}: ${shown}`).toBe(true);
            if (q.answer.kind === "decimal") {
              // Strict 1 dp: one tenth out is wrong, and an unrounded answer is accepted.
              const rounded = Number(roundTo(q.answer.exact, 1));
              expect(markAnswer(q, String(Math.round((rounded + 0.1) * 10) / 10), MC).correct, label).toBe(false);
              expect(markAnswer(q, String(Math.round((rounded - 0.1) * 10) / 10), MC).correct, label).toBe(false);
              expect(markAnswer(q, q.answer.exact.toFixed(3), MC).correct, label).toBe(true);
              expect(q.prompt, label).toMatch(/1 decimal place/);
            }
          }

          // Every predicted wrong answer is wrong and names a known misconception.
          for (const w of q.wrongAnswers) {
            expect(MC[w.misconception], w.misconception).toBeDefined();
            const typed =
              q.answer.kind === "choice"
                ? q.answer.options[w.value as number]
                : q.answer.kind === "decimal"
                  ? roundTo(w.value as number, 1)
                  : show(typeof w.value === "number" ? frac(w.value) : (w.value as Fraction));
            const res = markAnswer(q, typed, MC);
            expect(res.correct, `${label} wrong ${typed}`).toBe(false);
            expect(res.misconception, `${label} wrong ${typed}`).toBe(w.misconception);
          }
          expect(q.hints.length).toBeGreaterThan(0);
          expect(q.solution.length).toBeGreaterThan(0);
          expect(q.prompt + q.solution.join(" ") + q.hints.join(" ") + (q.answerText ?? ""), label).not.toMatch(/undefined|NaN|Infinity/);
          expect(questionFromId(q.id)).toEqual(q);
        }
      });
    }
  }

  it("mixes question types (no skill is one kind of question)", () => {
    for (const skillId of Object.keys(TRIANGLE_GENERATORS)) {
      for (const tier of [1, 2] as const) {
        const prompts = new Set(seeds.slice(0, 80).map((s) => makeQuestion(skillId, tier, s).prompt.replace(/[\d.]+/g, "#").replace(/(sin|cos|tan)/g, "f")));
        expect(prompts.size, `${skillId} tier ${tier}`).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("trig answers: the calculator-in-radians answer is caught", () => {
    let found = 0;
    for (const seed of seeds) {
      const q = makeQuestion("geo-trig-sides", 2, seed);
      if (q.wrongAnswers.some((w) => w.misconception === "trig-radians")) found++;
    }
    expect(found).toBeGreaterThan(100);
  });
});

describe("triangle geometry", () => {
  it("builds triangles with the asked-for sides and angles", () => {
    const sss = triSSS(7, 8, 9); // a = BC, b = CA, c = AB
    const spec = (pts: [number, number][]): AngleSpec => ({ points: { A: pts[0], B: pts[1], C: pts[2] }, segments: [], angles: [], description: "" });
    const s1 = spec(sss);
    expect(dist(s1, "B", "C")).toBeCloseTo(7, 9);
    expect(dist(s1, "C", "A")).toBeCloseTo(8, 9);
    expect(dist(s1, "A", "B")).toBeCloseTo(9, 9);
    const s2 = spec(triSAS(6, 50, 5));
    expect(measure(s2, { at: "A", from: "B", to: "C" })).toBeCloseTo(50, 9);
    expect(dist(s2, "A", "C")).toBeCloseTo(5, 9);
    const s3 = spec(triASA(40, 7, 65));
    expect(measure(s3, { at: "A", from: "B", to: "C" })).toBeCloseTo(40, 9);
    expect(measure(s3, { at: "B", from: "C", to: "A" })).toBeCloseTo(65, 9);
    // Turning and flipping keeps every length.
    const s4 = spec(pose(sss, { rot: 123, flip: true }));
    expect(dist(s4, "B", "C")).toBeCloseTo(7, 9);
  });

  it("reads trigonometry aloud properly", () => {
    expect(speakable("sin 30° = 1/2")).toBe("sine 30 degrees = 1 over 2");
    expect(speakable("θ = tan⁻¹(5 ÷ 8)")).toBe("theta = inverse tan(5  divided by  8)");
    expect(speakable("cos 30° = √3/2")).toBe("cos 30 degrees = root 3 over 2");
  });
});

describe("triangle lessons and skills", () => {
  it("every skill has a lesson, a generator and a place in a chain", () => {
    const chains = [
      [CHAINS.find((c) => c.id === "trigonometry")!, TRIG_SKILLS],
      [CHAINS.find((c) => c.id === "congruence-similarity")!, SHAPE_PROOF_SKILLS],
    ] as const;
    for (const [chain, skills] of chains) for (const s of skills) expect(chain.skillIds).toContain(s.id);
    for (const s of TRIANGLE_SKILLS) {
      expect(TRIANGLE_LESSONS[s.id], s.id).toBeDefined();
      expect(LESSONS[s.id]).toBe(TRIANGLE_LESSONS[s.id]);
      expect(TRIANGLE_GENERATORS[s.id], s.id).toBeDefined();
      expect(SKILL_BY_ID[s.id]).toBeDefined();
      expect(TRIANGLE_LESSONS[s.id].status).toBe("draft");
    }
  });

  it("worked examples' diagrams are drawn to their labels", () => {
    for (const l of Object.values(TRIANGLE_LESSONS))
      for (const ex of l.teaching.examples) if (ex.visual?.kind === "angles") checkDrawing(ex.visual.angles, undefined, undefined, ex.question);
  });
});
