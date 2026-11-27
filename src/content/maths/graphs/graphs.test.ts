import { describe, expect, it } from "vitest";
import { showDecimal } from "@/engine/fraction";
import { answerText, markAnswer } from "@/engine/marking";
import type { GraphSpec, Question } from "@/engine/types";
import { makeQuestion, questionFromId } from "@/content/questions";
import { CHAINS, LESSONS, MISCONCEPTIONS, SKILL_BY_ID } from "@/content";
import { GRAPH_GENERATORS } from "./generators";
import { GRAPH_SKILLS } from "./skills";

const seeds = Array.from({ length: 400 }, (_, i) => i * 7919 + 13);

/** What a student would type (keyboard minus, ^ not needed). */
function typed(q: Question): string {
  const a = q.answer;
  if (a.kind === "integer") return String(a.value);
  if (a.kind === "fraction") return showDecimal(a.value);
  if (a.kind === "choice") return a.options[a.correctIndex];
  if (a.kind === "point") return `(${a.value[0]}, ${a.value[1]})`;
  if (a.kind === "list") return a.value.join(", ");
  if (a.kind === "expression") return `${a.lhs ? `${a.lhs} = ` : ""}${a.value.replace(/−/g, "-")}`;
  return answerText(q);
}
function typedWrong(q: Question, v: Question["wrongAnswers"][number]["value"]): string {
  if (q.answer.kind === "choice") return String(v);
  if (Array.isArray(v)) return q.answer.kind === "point" ? `(${v[0]}, ${v[1]})` : v.join(", ");
  return typeof v === "number" ? String(v) : showDecimal(v);
}

const inRange = (g: GraphSpec, [x, y]: [number, number]) => x >= g.x.min - 1e-9 && x <= g.x.max + 1e-9 && y >= g.y.min - 1e-9 && y <= g.y.max + 1e-9;

describe("graph generators", () => {
  for (const skillId of Object.keys(GRAPH_GENERATORS)) {
    for (const tier of [1, 2] as const) {
      it(`${skillId} tier ${tier}: right answers mark correct, predicted wrong answers find their misconception`, () => {
        const prompts = new Set<string>();
        for (const seed of seeds) {
          const q = makeQuestion(skillId, tier, seed);
          const ctx = `${q.prompt} (seed ${seed})`;
          prompts.add(q.prompt);
          expect(markAnswer(q, typed(q), MISCONCEPTIONS).outcome, `${ctx} typed ${typed(q)}`).toBe("correct");
          for (const t of [q.prompt, ...q.hints, ...q.solution, answerText(q)]) expect(t, ctx).not.toMatch(/NaN|Infinity|undefined|\[object|0000000|9999999|--|\+ -|− -|\+ −|− −|1x|\+ 0x|−0\b/);
          expect(q.prompt, ctx).not.toMatch(/(^|\s|\()-\d/);
          for (const w of q.wrongAnswers) {
            expect(MISCONCEPTIONS[w.misconception], w.misconception).toBeDefined();
            const res = markAnswer(q, typedWrong(q, w.value), MISCONCEPTIONS);
            expect(res.outcome, `${ctx} wrong ${typedWrong(q, w.value)}`).toBe("incorrect");
            expect(res.misconception, `${ctx} wrong ${typedWrong(q, w.value)}`).toBe(w.misconception);
          }
          for (const w of q.wrongExpressions ?? []) {
            expect(MISCONCEPTIONS[w.misconception], w.misconception).toBeDefined();
            const res = markAnswer(q, `y = ${w.value}`, MISCONCEPTIONS);
            expect(res.misconception, `${ctx} wrong y = ${w.value}`).toBe(w.misconception);
          }
          if (q.answer.kind === "choice") {
            expect(new Set(q.answer.options).size, ctx).toBe(q.answer.options.length);
            expect(q.answer.options.length, ctx).toBeGreaterThanOrEqual(2);
          }
          expect(q.hints.length).toBeGreaterThan(0);
          expect(q.solution.length).toBeGreaterThan(1);
          expect(q.answerHelp).toBeTruthy();
          // The worked solution ends with the answer, as the student is shown it.
          const last = q.solution[q.solution.length - 1];
          expect(last, ctx).toContain(answerText(q));
          if (q.visual?.kind === "graph") {
            const g = q.visual.graph;
            for (const p of g.points ?? []) expect(inRange(g, p.at), `${ctx} point ${p.at}`).toBe(true);
            // A point to plot is on the grid, at a gridline crossing.
            if (g.pick && q.answer.kind === "point") {
              expect(inRange(g, q.answer.value), `${ctx} plot ${q.answer.value}`).toBe(true);
              expect(q.answer.value.every(Number.isInteger), ctx).toBe(true);
            }
            if (q.answer.kind === "point") expect(inRange(g, q.answer.value), `${ctx} answer on grid`).toBe(true);
            for (const c of g.curves ?? []) expect(c.points.length, ctx).toBeGreaterThan(1);
          }
          expect(questionFromId(q.id)).toEqual(q);
        }
        expect(prompts.size, `${skillId} tier ${tier} variety`).toBeGreaterThan(30);
      });
    }
  }

  it("real-life graph readings sit on gridlines", () => {
    for (const seed of seeds) {
      for (const tier of [1, 2] as const) {
        const q = makeQuestion("alg-real-life-graphs", tier, seed);
        if (q.visual?.kind !== "graph" || q.answer.kind !== "fraction") continue;
        const g = q.visual.graph;
        const v = q.answer.value.n / q.answer.value.d;
        const line = g.curves![0].points;
        const [[x0, y0], [x1, y1]] = line;
        const f = (x: number) => y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
        const onX = Math.abs(v / g.x.step - Math.round(v / g.x.step)) < 1e-9;
        const onY = Math.abs(v / g.y.step - Math.round(v / g.y.step)) < 1e-9;
        expect(onX || onY, q.prompt).toBe(true);
        // Whichever axis the answer is on, the matching reading on the line is on the other axis's grid too.
        if (onX && v <= g.x.max) {
          const y = f(v);
          if (Math.abs(y / g.y.step - Math.round(y / g.y.step)) < 1e-9) continue;
        }
        expect(onY, q.prompt).toBe(true);
      }
    }
  });

  it("quadratic answers really are on the curve", () => {
    for (const seed of seeds) {
      const q = makeQuestion("alg-quadratic-graphs", 2, seed);
      if (q.visual?.kind !== "graph" || !q.visual.graph.curves) continue;
      const pts = q.visual.graph.curves[0].points;
      const f = (x: number) => pts.reduce((best, p) => (Math.abs(p[0] - x) < Math.abs(best[0] - x) ? p : best))[1];
      if (q.answer.kind === "list") for (const x of q.answer.value) expect(Math.abs(f(x)), q.prompt).toBeLessThan(1e-6);
      if (q.answer.kind === "point") expect(Math.abs(f(q.answer.value[0]) - q.answer.value[1]), q.prompt).toBeLessThan(1e-6);
    }
  });
});

describe("graphs content", () => {
  it("every skill has a draft lesson, a generator and is in a chain", () => {
    const chain = CHAINS.find((c) => c.id === "graphs")!;
    expect(chain.skillIds).toEqual(GRAPH_SKILLS.map((s) => s.id));
    for (const s of GRAPH_SKILLS) {
      expect(LESSONS[s.id]?.status, s.id).toBe("draft");
      expect(GRAPH_GENERATORS[s.id], s.id).toBeDefined();
      expect(SKILL_BY_ID[s.id], s.id).toBeDefined();
    }
  });
});
