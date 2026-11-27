import { describe, expect, it } from "vitest";
import { show, showDecimal } from "@/engine/fraction";
import { answerText, markAnswer } from "@/engine/marking";
import type { ChartSpec, Question } from "@/engine/types";
import { STATS_GENERATORS } from "./generators";
import { STATS_MISCONCEPTIONS as MC, STATS_SKILLS } from "./skills";
import { STATS_LESSONS } from "./lessons";
import { GCSE_FOUNDATION_MAP } from "../gcse-foundation-map";
import { makeQuestion, questionFromId } from "@/content/questions";
import { CHAINS, LESSONS, MISCONCEPTIONS, SKILL_BY_ID } from "@/content";

const seeds = Array.from({ length: 400 }, (_, i) => i * 7919 + 13);

/** What a student would type for the right answer. */
function typed(q: Question): string {
  const a = q.answer;
  if (a.kind === "integer") return String(a.value);
  if (a.kind === "fraction") return a.form === "decimal" ? showDecimal(a.value) : show(a.value);
  return answerText(q);
}
function typedWrong(q: Question, v: Question["wrongAnswers"][number]["value"]): string {
  if (q.answer.kind === "choice") return q.answer.options[v as number];
  if (Array.isArray(v)) return v.join(":");
  if (typeof v === "number") return String(v);
  return showDecimal(v);
}

describe("statistics generators", () => {
  for (const skillId of Object.keys(STATS_GENERATORS)) {
    for (const tier of [1, 2] as const) {
      it(`${skillId} tier ${tier}: right answers mark correct, wrong answers find their misconception`, () => {
        for (const seed of seeds) {
          const q = makeQuestion(skillId, tier, seed);
          const ctx = `${q.prompt} (seed ${seed})`;
          expect(markAnswer(q, typed(q), MC).outcome, ctx).toBe("correct");
          if (q.answer.kind === "integer") {
            expect(Number.isInteger(q.answer.value), ctx).toBe(true);
            expect(q.answer.value, ctx).toBeGreaterThanOrEqual(0);
          }
          for (const t of [q.prompt, ...q.hints, ...q.solution, JSON.stringify(q.visual ?? {})]) expect(t, ctx).not.toMatch(/NaN|Infinity|undefined|\[object/);
          for (const w of q.wrongAnswers) {
            expect(MC[w.misconception], w.misconception).toBeDefined();
            const res = markAnswer(q, typedWrong(q, w.value), MC);
            expect(res.outcome, `${ctx} wrong ${typedWrong(q, w.value)}`).toBe("incorrect");
            expect(res.misconception, ctx).toBe(w.misconception);
          }
          expect(q.hints.length).toBeGreaterThan(0);
          expect(q.solution.length).toBeGreaterThan(1);
          expect(q.answerHelp || q.answer.kind === "choice", ctx).toBeTruthy();
          // The worked solution ends with the answer.
          expect(q.solution[q.solution.length - 1], ctx).toContain(answerText(q));
          expect(questionFromId(q.id)).toEqual(q);
        }
      });
    }
  }

  it("every chart is drawable and agrees with itself", () => {
    for (const skillId of Object.keys(STATS_GENERATORS))
      for (const tier of [1, 2] as const)
        for (const seed of seeds.slice(0, 150)) {
          const q = makeQuestion(skillId, tier, seed);
          if (q.visual?.kind !== "chart") continue;
          const c: ChartSpec = q.visual.chart;
          const ctx = `${q.prompt} (seed ${seed})`;
          expect(c.description.length, ctx).toBeGreaterThan(10);
          if (c.type === "pie") {
            expect(c.sectors.reduce((a, s) => a + s.angle, 0), ctx).toBe(360);
            for (const s of c.sectors) expect(s.angle, ctx).toBeGreaterThanOrEqual(30);
          }
          if (c.type === "pictogram") {
            expect(c.perSymbol % 2, ctx).toBe(0);
            for (const v of c.values) expect(v % (c.perSymbol / 2), ctx).toBe(0);
          }
          if (c.type === "bar") {
            // Every bar ends on a gridline or a dashed half-way line.
            const unit = c.yStep % 2 === 0 ? c.yStep / 2 : c.yStep;
            for (const v of c.values) expect(v % unit, ctx).toBe(0);
          }
          if (c.type === "scatter") {
            for (const [x, y] of c.points) {
              expect(x % c.xStep, ctx).toBe(0);
              expect(y % c.yStep, ctx).toBe(0);
              expect(x <= c.xMax && y <= c.yMax && x >= 0 && y >= 0, ctx).toBe(true);
            }
          }
        }
  });

  it("asks a spread of questions: each correlation type and each average comes up", () => {
    const prompts = seeds.slice(0, 200).map((s) => makeQuestion("stats-averages", 1, s).prompt);
    for (const w of ["mean", "median", "mode", "range"]) expect(prompts.some((p) => p.includes(w)), w).toBe(true);
    const answers = new Set(
      seeds.slice(0, 200).map((s) => {
        const q = makeQuestion("stats-scatter", 1, s);
        return q.answer.kind === "choice" && q.answer.options.length === 3 ? q.answer.correctIndex : -1;
      }),
    );
    for (const i of [0, 1, 2]) expect(answers.has(i)).toBe(true);
  });

  it("a mean to 1 decimal place accepts the rounded answer and spots dividing by the rows", () => {
    const q = seeds.map((s) => makeQuestion("stats-frequency-table-averages", 2, s)).find((x) => x.answer.kind === "decimal")!;
    expect(q).toBeDefined();
    expect(markAnswer(q, answerText(q), MC).outcome).toBe("correct");
    const rows = q.wrongAnswers.find((w) => w.misconception === "freq-mean-divided-by-rows");
    if (rows) expect(markAnswer(q, String(rows.value), MC).misconception).toBe("freq-mean-divided-by-rows");
  });
});

describe("statistics content", () => {
  const map = new Map(GCSE_FOUNDATION_MAP.map((s) => [s.id, s]));

  it("every skill has a lesson and generator, and copies the topic map's prerequisites exactly", () => {
    for (const s of STATS_SKILLS) {
      expect(STATS_LESSONS[s.id]).toBeDefined();
      expect(STATS_GENERATORS[s.id]).toBeDefined();
      expect(LESSONS[s.id].status).toBe("draft");
      expect([...s.prerequisites].sort()).toEqual([...map.get(s.id)!.prerequisites].sort());
      for (const p of SKILL_BY_ID[s.id].prerequisites) expect(SKILL_BY_ID[p], p).toBeDefined();
    }
    for (const m of Object.values(MC)) if (m.pointsTo) expect(SKILL_BY_ID[m.pointsTo]).toBeDefined();
    expect(MISCONCEPTIONS["median-not-ordered"]).toBeDefined();
    expect(CHAINS.find((c) => c.id === "statistics")?.skillIds).toEqual(STATS_SKILLS.map((s) => s.id));
  });

  it("lesson examples with pie charts add to 360 and worked frequency tables add up", () => {
    for (const l of Object.values(STATS_LESSONS))
      for (const ex of l.teaching.examples) {
        const c = ex.visual?.kind === "chart" ? ex.visual.chart : null;
        if (c?.type === "pie") expect(c.sectors.reduce((a, s) => a + s.angle, 0)).toBe(360);
        if (c?.type === "table" && c.rows.at(-1)?.[0] === "Total") {
          const body = c.rows.slice(0, -1);
          for (let col = 1; col < c.headers.length; col++) expect(body.reduce((a, r) => a + Number(r[col]), 0)).toBe(c.rows.at(-1)![col]);
        }
      }
  });
});
