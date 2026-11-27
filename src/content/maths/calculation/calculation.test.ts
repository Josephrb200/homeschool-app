import { describe, expect, it } from "vitest";
import { equals, frac, mul, parseAnswer, show, showDecimal } from "@/engine/fraction";
import { answerText, markAnswer, roundTo } from "@/engine/marking";
import { showStandardForm } from "@/engine/standard-form";
import type { Question } from "@/engine/types";
import { makeQuestion, questionFromId } from "@/content/questions";
import { CHAINS, LESSONS, MISCONCEPTIONS, SKILL_BY_ID } from "@/content";
import { GCSE_FOUNDATION_MAP } from "../gcse-foundation-map";
import { CALCULATION_GENERATORS } from "./generators";
import { ALL_CALCULATION_SKILLS, CALCULATION_MISCONCEPTIONS } from "./skills";
import { CALCULATION_LESSONS } from "./lessons";

const seeds = Array.from({ length: 300 }, (_, i) => i * 7919 + 13);

/** What a student would type for the right answer. */
export function typed(q: Question): string {
  const a = q.answer;
  if (a.kind === "integer") return String(a.value);
  if (a.kind === "fraction") return a.requireSimplest ? show(a.value) : a.form === "decimal" ? showDecimal(a.value) : show(a.value);
  if (a.kind === "decimal") return roundTo(a.exact, a.dp);
  if (a.kind === "ratio") return a.value.join(":");
  if (a.kind === "choice") return a.options[a.correctIndex];
  if (a.kind === "standard-form") return showStandardForm(a.mantissa, a.power);
  if (a.kind === "list") return a.value.join(", ");
  return answerText(q);
}

export function typedWrong(q: Question, v: Question["wrongAnswers"][number]["value"]): string {
  if (q.answer.kind === "choice") return q.answer.options[v as number];
  if (Array.isArray(v)) return q.answer.kind === "ratio" ? v.join(":") : v.join(", ");
  const f = typeof v === "number" ? frac(v) : v;
  if (q.answer.kind === "standard-form") {
    // Typed in standard form, as a student would.
    let power = Math.floor(Math.log10(f.n / f.d));
    let m = mul(f, power >= 0 ? frac(1, 10 ** power) : frac(10 ** -power));
    if (m.n / m.d >= 10) [m, power] = [mul(m, frac(1, 10)), power + 1];
    if (m.n / m.d < 1) [m, power] = [mul(m, frac(10)), power - 1];
    return showStandardForm(m, power);
  }
  // A decimal when it ends, otherwise a fraction.
  return showDecimal(f).replace("-", "−");
}

/** Every question from a set of generators: right answers mark correct, predicted wrong ones find their misconception. */
export function checkGenerators(generators: Record<string, unknown>) {
  for (const skillId of Object.keys(generators)) {
    for (const tier of [1, 2] as const) {
      it(`${skillId} tier ${tier}: right answers mark correct, wrong answers find their misconception`, () => {
        const prompts = new Set<string>();
        for (const seed of seeds) {
          const q = makeQuestion(skillId, tier, seed);
          const ctx = `${q.prompt} (seed ${seed})`;
          prompts.add(q.prompt);
          expect(markAnswer(q, typed(q), MISCONCEPTIONS).outcome, `${ctx} typed ${typed(q)}`).toBe("correct");
          if (q.answer.kind === "integer") expect(Number.isInteger(q.answer.value), ctx).toBe(true);
          if (q.answer.kind === "choice") {
            expect(q.answer.correctIndex, ctx).toBeGreaterThanOrEqual(0);
            expect(new Set(q.answer.options).size, ctx).toBe(q.answer.options.length);
            expect(q.answer.options.length, ctx).toBeGreaterThanOrEqual(2);
          }
          for (const t of [q.prompt, ...q.hints, ...q.solution, q.answerText ?? ""]) expect(t, ctx).not.toMatch(/NaN|Infinity|undefined|\[object|-\d/);
          for (const w of q.wrongAnswers) {
            expect(MISCONCEPTIONS[w.misconception], w.misconception).toBeDefined();
            const res = markAnswer(q, typedWrong(q, w.value), MISCONCEPTIONS);
            expect(res.outcome, `${ctx} wrong ${typedWrong(q, w.value)}`).toBe("incorrect");
            expect(res.misconception, `${ctx} wrong ${typedWrong(q, w.value)}`).toBe(w.misconception);
          }
          expect(q.hints.length, ctx).toBeGreaterThan(0);
          expect(q.solution.length, ctx).toBeGreaterThan(1);
          // The worked solution ends with the answer.
          const last = q.solution[q.solution.length - 1].replace(/,(?=\d{3})/g, "");
          expect(last, ctx).toContain(answerText(q).replace(/,(?=\d{3})/g, ""));
          expect(questionFromId(q.id)).toEqual(q);
        }
        expect(prompts.size, `${skillId} tier ${tier} variety`).toBeGreaterThanOrEqual(15);
      });
    }
  }
}

describe("calculation generators", () => {
  checkGenerators(CALCULATION_GENERATORS);
});

describe("calculation content", () => {
  const map = new Map(GCSE_FOUNDATION_MAP.map((s) => [s.id, s]));

  it("every skill has a Draft lesson and a generator, and copies the topic map's prerequisites exactly", () => {
    for (const s of ALL_CALCULATION_SKILLS) {
      expect(CALCULATION_LESSONS[s.id], s.id).toBeDefined();
      expect(CALCULATION_GENERATORS[s.id], s.id).toBeDefined();
      expect(LESSONS[s.id].status).toBe("draft");
      expect([...s.prerequisites].sort(), s.id).toEqual([...map.get(s.id)!.prerequisites].sort());
      expect(s.typicalYear).toBe(map.get(s.id)!.typicalYear);
      for (const p of SKILL_BY_ID[s.id].prerequisites) expect(SKILL_BY_ID[p], p).toBeDefined();
    }
    for (const m of Object.values(CALCULATION_MISCONCEPTIONS)) if (m.pointsTo) expect(SKILL_BY_ID[m.pointsTo], m.id).toBeDefined();
  });

  it("every skill sits in exactly one chain", () => {
    for (const s of ALL_CALCULATION_SKILLS) expect(CHAINS.filter((c) => c.skillIds.includes(s.id)).length, s.id).toBe(1);
    expect(CHAINS.find((c) => c.id === "factors")?.skillIds).toContain("num-listing");
    expect(CHAINS.find((c) => c.id === "powers")?.skillIds).toContain("num-standard-form-calc");
  });

  it("answers can be typed with units", () => {
    for (const [t, v] of [["50 km/h", frac(50)], ["2.7 g/cm³", frac(27, 10)], ["350 ml", frac(350)], ["45 minutes", frac(45)], ["3 hours", frac(3)], ["0.45 kg", frac(9, 20)], ["12 m/s", frac(12)], ["£1,250", frac(1250)]] as const) {
      const p = parseAnswer(t);
      expect(p.ok && equals(p.value, v), t).toBe(true);
    }
  });
});
