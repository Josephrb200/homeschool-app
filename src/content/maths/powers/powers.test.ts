import { describe, expect, it } from "vitest";
import { frac, showDecimal } from "@/engine/fraction";
import { answerText, markAnswer } from "@/engine/marking";
import { parseStandardForm, sfValue, showStandardForm } from "@/engine/standard-form";
import type { Question } from "@/engine/types";
import { makeQuestion, questionFromId } from "@/content/questions";
import { CHAINS, LESSONS, MISCONCEPTIONS, SKILL_BY_ID } from "@/content";
import { speakable } from "@/components/MathText";
import { POWERS_GENERATORS } from "./generators";
import { POWERS_SKILLS } from "./skills";
import { dec } from "../decimals/dec";

const seeds = Array.from({ length: 400 }, (_, i) => i * 7919 + 13);

/** What a student would type for the right answer (with a keyboard: ^ for powers, - for minus). */
function typed(q: Question): string {
  const a = q.answer;
  if (a.kind === "integer") return String(a.value);
  if (a.kind === "fraction") return showDecimal(a.value);
  if (a.kind === "standard-form") return `${showDecimal(a.mantissa)} x 10^${a.power}`;
  if (a.kind === "choice") return a.options[a.correctIndex];
  return answerText(q);
}
function typedWrong(q: Question, v: Question["wrongAnswers"][number]["value"]): string {
  if (q.answer.kind === "choice") return String(v);
  if (Array.isArray(v)) return v.join(":");
  return typeof v === "number" ? String(v) : showDecimal(v);
}

describe("negatives, powers and BIDMAS generators", () => {
  for (const skillId of Object.keys(POWERS_GENERATORS)) {
    for (const tier of [1, 2] as const) {
      it(`${skillId} tier ${tier}: right answers mark correct, predicted wrong answers find their misconception`, () => {
        const prompts = new Set<string>();
        for (const seed of seeds) {
          const q = makeQuestion(skillId, tier, seed);
          const ctx = `${q.prompt} (seed ${seed})`;
          prompts.add(q.prompt);
          expect(markAnswer(q, typed(q), MISCONCEPTIONS).outcome, `${ctx} typed ${typed(q)}`).toBe("correct");
          // A negative answer typed with the true minus sign works too.
          if (q.answer.kind === "integer" && q.answer.value < 0) expect(markAnswer(q, `−${-q.answer.value}`, MISCONCEPTIONS).correct, ctx).toBe(true);
          if (q.answer.kind === "integer") expect(Number.isInteger(q.answer.value), ctx).toBe(true);
          for (const t of [q.prompt, ...q.hints, ...q.solution]) expect(t, ctx).not.toMatch(/NaN|Infinity|undefined|\[object|0000000|9999999|--|\+ -|− -/);
          // Prompts write negatives with the true minus sign, never a hyphen.
          expect(q.prompt, ctx).not.toMatch(/(^|\s|\()-\d/);
          for (const w of q.wrongAnswers) {
            expect(MISCONCEPTIONS[w.misconception], w.misconception).toBeDefined();
            const res = markAnswer(q, typedWrong(q, w.value), MISCONCEPTIONS);
            expect(res.outcome, `${ctx} wrong ${typedWrong(q, w.value)}`).toBe("incorrect");
            expect(res.misconception, `${ctx} wrong ${typedWrong(q, w.value)}`).toBe(w.misconception);
          }
          expect(q.hints.length).toBeGreaterThan(0);
          expect(q.solution.length).toBeGreaterThan(1);
          expect(q.answerHelp).toBeTruthy();
          // The worked solution ends with the answer, written as the student is shown it.
          const last = q.solution[q.solution.length - 1];
          const shown = answerText(q).replace(/^-/, "−");
          expect(last, ctx).toContain(shown);
          expect(questionFromId(q.id)).toEqual(q);
        }
        expect(prompts.size, `${skillId} tier ${tier} variety`).toBeGreaterThan(40);
      });
    }
  }

  it("tier 1 negatives always involve a negative number", () => {
    for (const seed of seeds) {
      const q = makeQuestion("num-negatives", 1, seed);
      expect(`${q.prompt} ${answerText(q)}`, q.prompt).toMatch(/−|-/);
    }
  });

  it("standard form answers are really in standard form", () => {
    for (const seed of seeds) {
      for (const tier of [1, 2] as const) {
        const q = makeQuestion("num-standard-form", tier, seed);
        if (q.answer.kind !== "standard-form") continue;
        const m = q.answer.mantissa.n / q.answer.mantissa.d;
        expect(m >= 1 && m < 10, q.prompt).toBe(true);
      }
    }
  });
});

describe("standard form marking", () => {
  const q: Question = {
    id: "t",
    skillId: "num-standard-form",
    prompt: "Write 34,000 in standard form.",
    answer: { kind: "standard-form", mantissa: dec(34, 1), power: 4 },
    wrongAnswers: [{ value: sfValue(dec(34, 1), 3), misconception: "sf-counted-zeros" }],
    hints: ["h"],
    solution: ["s"],
  };
  it.each(["3.4 x 10^4", "3.4×10^4", "3.4 * 10^4", "3.4 × 10⁴", "3.4 X 10 ^ 4", "3.4x10^(4)"])("accepts %s", (t) => {
    expect(markAnswer(q, t, MISCONCEPTIONS).outcome).toBe("correct");
  });
  it("nudges the right value written another way", () => {
    expect(markAnswer(q, "34000", MISCONCEPTIONS).outcome).toBe("not-simplified");
    expect(markAnswer(q, "34,000", MISCONCEPTIONS).outcome).toBe("not-simplified");
    expect(markAnswer(q, "34 x 10^3", MISCONCEPTIONS).outcome).toBe("not-simplified");
  });
  it("spots counting zeros", () => {
    expect(markAnswer(q, "3.4 x 10^3", MISCONCEPTIONS).misconception).toBe("sf-counted-zeros");
  });
  it("reads negative powers every way", () => {
    for (const t of ["4.7 x 10^-4", "4.7 x 10^−4", "4.7×10⁻⁴", "4.7 x 10^(-4)"]) {
      const p = parseStandardForm(t);
      expect(p.ok && p.value.n === 47 && p.value.d === 100000, t).toBe(true);
    }
    expect(parseStandardForm("banana").ok).toBe(false);
    expect(markAnswer(q, "3.4 x", MISCONCEPTIONS).outcome).toBe("unreadable");
  });
  it("shows standard form with superscripts", () => {
    expect(showStandardForm(dec(47, 1), -4)).toBe("4.7 × 10⁻⁴");
    expect(answerText(q)).toBe("3.4 × 10⁴");
    expect(sfValue(frac(5), 0)).toEqual(frac(5));
  });
});

describe("read-aloud", () => {
  it("reads negatives, powers and roots in words", () => {
    expect(speakable("Work out −7 + 3.")).toBe("Work out negative 7 + 3.");
    expect(speakable("Work out 4 − (−6).")).toMatch(/4 +minus +\(negative 6\)/);
    expect(speakable("Work out 7².")).toBe("Work out 7 squared.");
    expect(speakable("4³")).toBe("4 cubed");
    expect(speakable("3⁴ × 3² = 3ⁿ")).toBe("3 to the power 4  times  3 squared = 3 to the power n");
    expect(speakable("4.7 × 10⁻⁴")).toBe("4.7  times  10 to the power negative 4");
    expect(speakable("√64 and ∛27")).toBe("the square root of 64 and the cube root of 27");
  });
});

describe("negatives, powers and BIDMAS content", () => {
  it("every skill has a draft lesson, a generator and live prerequisites, in one chain", () => {
    const chain = CHAINS.find((c) => c.id === "powers")!;
    expect(chain.skillIds).toEqual(POWERS_SKILLS.map((s) => s.id));
    for (const s of POWERS_SKILLS) {
      expect(LESSONS[s.id]?.status).toBe("draft");
      expect(POWERS_GENERATORS[s.id]).toBeDefined();
      for (const p of s.prerequisites) if (SKILL_BY_ID[s.id].prerequisites.includes(p)) expect(SKILL_BY_ID[p]).toBeDefined();
    }
    for (const m of Object.values(MISCONCEPTIONS)) if (m.pointsTo) expect(SKILL_BY_ID[m.pointsTo], m.id).toBeDefined();
  });
});
