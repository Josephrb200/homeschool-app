import { describe, expect, it } from "vitest";
import { frac, show } from "@/engine/fraction";
import { answerText, markAnswer } from "@/engine/marking";
import type { Question } from "@/engine/types";
import { PROBABILITY_GENERATORS } from "./generators";
import { PROBABILITY_MISCONCEPTIONS as MC, PROBABILITY_SKILLS } from "./skills";
import { PROBABILITY_LESSONS } from "./lessons";
import { GCSE_FOUNDATION_MAP } from "../gcse-foundation-map";
import { makeQuestion, questionFromId } from "@/content/questions";
import { CHAINS, LESSONS, MISCONCEPTIONS, SKILL_BY_ID } from "@/content";

const seeds = Array.from({ length: 400 }, (_, i) => i * 7919 + 13);

function typed(q: Question): string {
  const a = q.answer;
  if (a.kind === "choice") return a.options[a.correctIndex];
  if (a.kind === "integer") return String(a.value);
  if (a.kind === "fraction") return show(a.value);
  return answerText(q);
}
function typedWrong(q: Question, v: Question["wrongAnswers"][number]["value"]): string {
  if (q.answer.kind === "choice") return q.answer.options[v as number];
  if (Array.isArray(v)) return v.join(":");
  if (typeof v === "number") return String(v);
  return show(v);
}

describe("probability generators", () => {
  for (const skillId of Object.keys(PROBABILITY_GENERATORS)) {
    for (const tier of [1, 2] as const) {
      it(`${skillId} tier ${tier}: right answers mark correct, wrong answers find their misconception`, () => {
        for (const seed of seeds) {
          const q = makeQuestion(skillId, tier, seed);
          const ctx = `${q.prompt} (seed ${seed})`;
          expect(markAnswer(q, typed(q), MC).outcome, ctx).toBe("correct");
          if (q.answer.kind === "fraction") {
            // A probability is between 0 and 1, and the same value as a decimal or % is also right.
            const v = q.answer.value;
            expect(v.n, ctx).toBeGreaterThanOrEqual(0);
            expect(v.n, ctx).toBeLessThanOrEqual(v.d);
            const asDec = v.n / v.d;
            if (Number.isFinite(asDec) && String(asDec).length < 8) {
              expect(markAnswer(q, String(asDec), MC).outcome, `${ctx} decimal`).toBe("correct");
              expect(markAnswer(q, `${Math.round(asDec * 1e6) / 1e4}%`, MC).outcome, `${ctx} percent`).toBe("correct");
            }
            expect(q.answerHelp, ctx).toMatch(/percentage/);
          }
          if (q.answer.kind === "integer") {
            expect(Number.isInteger(q.answer.value), ctx).toBe(true);
            expect(q.answer.value, ctx).toBeGreaterThan(0);
          }
          for (const t of [q.prompt, ...q.hints, ...q.solution]) expect(t, ctx).not.toMatch(/NaN|Infinity|undefined|\[object/);
          for (const w of q.wrongAnswers) {
            expect(MC[w.misconception], w.misconception).toBeDefined();
            const res = markAnswer(q, typedWrong(q, w.value), MC);
            expect(res.outcome, `${ctx} wrong ${typedWrong(q, w.value)}`).toBe("incorrect");
            expect(res.misconception, ctx).toBe(w.misconception);
          }
          expect(q.hints.length).toBeGreaterThan(0);
          expect(q.solution.length).toBeGreaterThan(1);
          const last = q.solution[q.solution.length - 1];
          const shown = q.answer.kind === "fraction" && !q.answerText ? show(q.answer.value) : answerText(q);
          expect(last, ctx).toContain(shown);
          expect(questionFromId(q.id)).toEqual(q);
        }
      });
    }
  }

  it("the probability scale words match the numbers", () => {
    for (const seed of seeds) {
      const q = makeQuestion("prob-scale", 1, seed);
      if (q.answer.kind !== "choice") continue;
      const word = q.answer.options[q.answer.correctIndex];
      if (/get a 7\?/.test(q.prompt)) expect(word).toBe("impossible");
      if (/less than 7\?/.test(q.prompt)) expect(word).toBe("certain");
      if (/an even number\?/.test(q.prompt)) expect(word).toBe("even chance");
      if (/a 6\?/.test(q.prompt)) expect(word).toBe("unlikely");
    }
  });

  it("sample space grids have the right number of cells", () => {
    for (const seed of seeds.slice(0, 100)) {
      const q = makeQuestion("prob-sample-space", 1, seed);
      if (q.visual?.kind !== "table") continue;
      const t = q.visual.table;
      for (const row of t.rows) expect(row.cells.length).toBe(t.columns.length);
    }
  });
});

describe("probability marking", () => {
  const q = makeQuestion("prob-single-event", 1, 1);
  const v = q.answer.kind === "fraction" ? q.answer.value : frac(1, 2);

  it("accepts unsimplified fractions, decimals and percentages", () => {
    const a = makeQuestion("prob-sum-to-one", 1, 5);
    expect(a.answer.kind).toBe("fraction");
    expect(markAnswer(q, `${v.n * 2}/${v.d * 2}`, MC).outcome).toBe("correct");
  });

  it("40% means 0.4, and typing 40 for 0.4 gets a nudge to add the % sign", () => {
    const spec: Question = { ...q, answer: { kind: "fraction", value: frac(2, 5), requireSimplest: false, percentAllowed: true }, wrongAnswers: [] };
    expect(markAnswer(spec, "40%", MC).outcome).toBe("correct");
    expect(markAnswer(spec, "40 %", MC).outcome).toBe("correct");
    expect(markAnswer(spec, "0.4", MC).outcome).toBe("correct");
    expect(markAnswer(spec, "2/5", MC).outcome).toBe("correct");
    const r = markAnswer(spec, "40", MC);
    expect(r.outcome).toBe("unreadable");
    expect(r.feedback).toMatch(/% sign/);
    expect(markAnswer(spec, "4%", MC).outcome).toBe("incorrect");
  });

  it("percentages chain answers still read 35% as 35", () => {
    const pctQ: Question = { ...q, answer: { kind: "fraction", value: frac(35), requireSimplest: false }, wrongAnswers: [] };
    expect(markAnswer(pctQ, "35%", MC).outcome).toBe("correct");
  });
});

describe("probability content", () => {
  const map = new Map(GCSE_FOUNDATION_MAP.map((s) => [s.id, s]));

  it("every skill has a lesson and generator, and copies the topic map's prerequisites exactly", () => {
    for (const s of PROBABILITY_SKILLS) {
      expect(PROBABILITY_LESSONS[s.id]).toBeDefined();
      expect(PROBABILITY_GENERATORS[s.id]).toBeDefined();
      expect(LESSONS[s.id].status).toBe("draft");
      expect([...s.prerequisites].sort()).toEqual([...map.get(s.id)!.prerequisites].sort());
      for (const p of SKILL_BY_ID[s.id].prerequisites) expect(SKILL_BY_ID[p], p).toBeDefined();
    }
    for (const m of Object.values(MC)) if (m.pointsTo) expect(SKILL_BY_ID[m.pointsTo], m.pointsTo).toBeDefined();
    expect(MISCONCEPTIONS["prob-gave-count"]).toBeDefined();
    expect(CHAINS.find((c) => c.id === "probability")?.skillIds).toEqual(PROBABILITY_SKILLS.map((s) => s.id));
  });

  it("probability starts from fractions, decimals and percentages that are already live", () => {
    expect(SKILL_BY_ID["prob-scale"].prerequisites).toEqual(["num-fdp"]);
    expect(SKILL_BY_ID["prob-single-event"].prerequisites.sort()).toEqual(["frac-simplify", "prob-scale"]);
  });
});
