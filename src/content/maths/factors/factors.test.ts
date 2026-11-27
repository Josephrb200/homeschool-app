import { describe, expect, it } from "vitest";
import { frac } from "@/engine/fraction";
import { answerText, markAnswer, roundTo } from "@/engine/marking";
import { factorsOf, hcf, indexForm, isPrime, lcmOf, parseList, parseProduct, primeFactors } from "@/engine/primes";
import type { Question } from "@/engine/types";
import { makeQuestion, questionFromId } from "@/content/questions";
import { CHAINS, LESSONS, MISCONCEPTIONS, SKILL_BY_ID } from "@/content";
import { GCSE_FOUNDATION_MAP } from "../gcse-foundation-map";
import { showDec } from "../decimals/dec";
import { FACTOR_GENERATORS } from "./generators";
import { FACTOR_SKILLS } from "./skills";
import { PERCENT_COMPARE_GENERATORS } from "../percentages/compare-generators";

const seeds = Array.from({ length: 400 }, (_, i) => i * 7919 + 13);
const GENERATORS = { ...FACTOR_GENERATORS, ...PERCENT_COMPARE_GENERATORS };
const NEW_SKILLS = [...Object.keys(GENERATORS)];

/** What a student would type for the right answer. */
function typed(q: Question): string {
  const a = q.answer;
  if (a.kind === "fraction") return showDec(a.value);
  if (a.kind === "decimal") return roundTo(a.exact, a.dp);
  if (a.kind === "choice") return a.options[a.correctIndex];
  return answerText(q);
}
function typedWrong(q: Question, v: Question["wrongAnswers"][number]["value"]): string {
  if (q.answer.kind === "choice") return q.answer.options[v as number];
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "number") return q.answer.kind === "decimal" ? v.toFixed(2) : String(v);
  return showDec(v);
}

describe("number helpers", () => {
  it("finds factors, primes, HCF and LCM", () => {
    expect(factorsOf(36)).toEqual([1, 2, 3, 4, 6, 9, 12, 18, 36]);
    expect(factorsOf(1)).toEqual([1]);
    expect([1, 2, 9, 51, 53, 91, 97].map(isPrime)).toEqual([false, true, false, false, true, false, true]);
    expect(primeFactors(360)).toEqual([2, 2, 2, 3, 3, 5]);
    expect(indexForm(360)).toBe("2³ × 3² × 5");
    expect(indexForm(7)).toBe("7");
    expect(hcf(24, 36)).toBe(12);
    expect(lcmOf(6, 8)).toBe(24);
  });

  it("reads typed lists and products", () => {
    expect(parseList("1, 2, 3, 6")).toEqual([1, 2, 3, 6]);
    expect(parseList("1 2 3 and 6.")).toEqual([1, 2, 3, 6]);
    expect(parseList("1,2,3,x")).toBeNull();
    for (const t of ["2 × 2 × 3 × 5", "2x2x3x5", "2*2*3*5", "2^2 × 3 × 5", "2² × 3 × 5", "2²×3×5", "60 = 2² x 3 x 5", "5 × 3 × 2 × 2"]) {
      expect(parseProduct(t)?.value, t).toBe(60);
    }
    expect(parseProduct("2 + 3")).toBeNull();
  });
});

describe("marking lists and products", () => {
  const listQ: Question = {
    id: "t",
    skillId: "num-factors-multiples",
    prompt: "Write down all the factors of 12.",
    answer: { kind: "list", value: [1, 2, 3, 4, 6, 12], noun: "factors", missingMisconception: "fm-missed-pair", extraMisconception: "fm-not-factor" },
    wrongAnswers: [{ value: [12, 24, 36, 48, 60], misconception: "fm-factor-multiple-mixup" }],
    hints: ["h"],
    solution: ["s"],
  };
  it("accepts any order and repeats", () => {
    expect(markAnswer(listQ, "12, 6, 4, 3, 2, 1, 1", MISCONCEPTIONS).outcome).toBe("correct");
  });
  it("says how many are missing, without giving them away", () => {
    const r = markAnswer(listQ, "1, 2, 3, 12", MISCONCEPTIONS);
    expect(r.outcome).toBe("incorrect");
    expect(r.misconception).toBe("fm-missed-pair");
    expect(r.feedback).toMatch(/2 more factors/);
    expect(r.feedback).not.toMatch(/4 and 6|4, 6/);
  });
  it("names the numbers that don't belong", () => {
    const r = markAnswer(listQ, "1, 2, 3, 4, 5, 6, 12", MISCONCEPTIONS);
    expect(r.misconception).toBe("fm-not-factor");
    expect(r.feedback).toMatch(/^5 doesn't belong/);
  });
  it("spots multiples given instead of factors", () => {
    expect(markAnswer(listQ, "12, 24, 36, 48, 60", MISCONCEPTIONS).misconception).toBe("fm-factor-multiple-mixup");
  });

  const productQ = (index: boolean): Question => ({
    id: "t",
    skillId: "num-prime-factorisation",
    prompt: "Write 60 as a product of its prime factors.",
    answer: { kind: "product", value: 60, index },
    wrongAnswers: [{ value: 30, misconception: "pf-missing-prime" }],
    hints: ["h"],
    solution: ["s"],
  });
  it("accepts the primes in any order and in either form", () => {
    for (const t of ["2 × 2 × 3 × 5", "5 x 3 x 2 x 2", "2^2 × 3 × 5", "2²×3×5"]) expect(markAnswer(productQ(false), t, MISCONCEPTIONS).outcome, t).toBe("correct");
  });
  it("nudges when a factor isn't prime, or 1 is included", () => {
    const r = markAnswer(productQ(false), "4 × 15", MISCONCEPTIONS);
    expect(r.outcome).toBe("not-simplified");
    expect(r.feedback).toMatch(/4 isn't prime/);
    expect(markAnswer(productQ(false), "1 × 2 × 2 × 3 × 5", MISCONCEPTIONS).outcome).toBe("not-simplified");
  });
  it("asks for index form when the question does", () => {
    expect(markAnswer(productQ(true), "2 × 2 × 3 × 5", MISCONCEPTIONS).outcome).toBe("not-simplified");
    expect(markAnswer(productQ(true), "2² × 3 × 5", MISCONCEPTIONS).outcome).toBe("correct");
  });
  it("says what a wrong product multiplies to", () => {
    const r = markAnswer(productQ(false), "2 × 3 × 5", MISCONCEPTIONS);
    expect(r.misconception).toBe("pf-missing-prime");
    expect(r.feedback).toMatch(/multiply to 30, not 60/);
  });
  it("shows answers in the form asked for", () => {
    expect(answerText(productQ(false))).toBe("2 × 2 × 3 × 5");
    expect(answerText(productQ(true))).toBe("2² × 3 × 5");
    expect(answerText(listQ)).toBe("1, 2, 3, 4, 6, 12");
  });
});

describe("factors and percentage-change generators", () => {
  for (const skillId of NEW_SKILLS) {
    for (const tier of [1, 2] as const) {
      it(`${skillId} tier ${tier}: right answers mark correct, predicted wrong answers find their misconception`, () => {
        const prompts = new Set<string>();
        for (const seed of seeds) {
          const q = makeQuestion(skillId, tier, seed);
          const ctx = `${q.prompt} (seed ${seed})`;
          prompts.add(q.prompt);
          expect(markAnswer(q, typed(q), MISCONCEPTIONS).outcome, `${ctx} typed ${typed(q)}`).toBe("correct");
          if (skillId.startsWith("pct-")) expect(markAnswer(q, `${typed(q)}%`, MISCONCEPTIONS).correct, ctx).toBe(true);
          if (q.answer.kind === "integer") expect(Number.isInteger(q.answer.value) && q.answer.value > 0, ctx).toBe(true);
          if (q.answer.kind === "list") {
            expect(q.answer.value.length, ctx).toBeGreaterThan(0);
            expect(new Set(q.answer.value).size, ctx).toBe(q.answer.value.length);
          }
          if (q.answer.kind === "product") expect(primeFactors(q.answer.value).length, ctx).toBeGreaterThan(1);
          for (const w of q.wrongAnswers) {
            expect(MISCONCEPTIONS[w.misconception], w.misconception).toBeDefined();
            const t = typedWrong(q, w.value);
            const res = markAnswer(q, t, MISCONCEPTIONS);
            expect(res.outcome, `${ctx}: wrong ${t}`).toBe("incorrect");
            expect(res.misconception, `${ctx}: wrong ${t}`).toBe(w.misconception);
          }
          for (const text of [q.prompt, ...q.hints, ...q.solution]) expect(text, ctx).not.toMatch(/undefined|NaN|Infinity|\[object|0000000|9999999/);
          expect(q.hints.length).toBeGreaterThan(0);
          expect(q.solution.length).toBeGreaterThan(1);
          if (q.answer.kind !== "choice") expect(q.answerHelp, ctx).toBeTruthy();
          // The worked solution ends with the answer.
          const last = q.solution[q.solution.length - 1];
          const shown = q.answer.kind === "decimal" ? roundTo(q.answer.exact, q.answer.dp) : answerText(q);
          expect(last, ctx).toContain(shown);
          expect(questionFromId(q.id)).toEqual(q);
        }
        expect(prompts.size).toBeGreaterThan(tier === 1 && skillId === "num-prime-factorisation" ? 20 : 40);
      });
    }
  }

  it("HCF answers divide both numbers, and LCM answers are divisible by both", () => {
    for (const seed of seeds) {
      const q = makeQuestion("num-hcf-lcm", 1, seed);
      const nums = [...q.prompt.matchAll(/\d+/g)].map((m) => Number(m[0]));
      if (q.answer.kind !== "integer" || nums.length !== 2) continue;
      const [a, b] = nums;
      if (/highest/.test(q.prompt)) expect(q.answer.value).toBe(hcf(a, b));
      else expect(q.answer.value).toBe(lcmOf(a, b));
    }
  });

  it("percentages of another are worked out the right way round", () => {
    for (const seed of seeds) {
      const q = makeQuestion("pct-one-of-another", 1, seed);
      if (q.answer.kind !== "fraction") continue;
      const v = q.answer.value.n / q.answer.value.d;
      expect(v).toBeGreaterThan(0);
      expect(v).toBeLessThan(100);
    }
  });

  it("percentage change always divides by the original", () => {
    const q = seeds.map((s) => makeQuestion("pct-change", 1, s)).find((x) => /from £40 to £50/.test(x.prompt));
    if (q) expect(markAnswer(q, "25", MISCONCEPTIONS).correct).toBe(true);
    const q2 = makeQuestion("pct-change", 1, 13);
    const w = q2.wrongAnswers.find((x) => x.misconception === "pct-change-divided-new");
    if (w) expect(markAnswer(q2, showDec(w.value as ReturnType<typeof frac>), MISCONCEPTIONS).feedback).toMatch(/original/);
  });
});

describe("factors and primes content", () => {
  it("every new skill has a draft lesson, is in a chain, and matches the topic map", () => {
    const inChains = CHAINS.flatMap((c) => c.skillIds);
    for (const id of NEW_SKILLS) {
      expect(LESSONS[id]?.status, id).toBe("draft");
      expect(LESSONS[id].teaching.examples.length).toBeGreaterThanOrEqual(2);
      expect(inChains, id).toContain(id);
      expect(GCSE_FOUNDATION_MAP.find((m) => m.id === id), id).toBeDefined();
      expect(SKILL_BY_ID[id]).toBeDefined();
    }
    for (const s of FACTOR_SKILLS) expect(GCSE_FOUNDATION_MAP.find((m) => m.id === s.id)!.prerequisites).toEqual(s.prerequisites);
  });
});
