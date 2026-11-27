import { describe, expect, it } from "vitest";
import { equals, frac, parseAnswer, show } from "@/engine/fraction";
import { answerText, markAnswer } from "@/engine/marking";
import { hasGenerator, makeQuestion, questionFromId } from "@/content/questions";
import { LESSONS, MISCONCEPTIONS, SKILL_BY_ID } from "@/content";
import { DECIMAL_GENERATORS } from "./generators";
import { DECIMAL_SKILLS } from "./skills";
import { PERCENT_GENERATORS } from "../percentages/generators";
import { PERCENT_SKILLS } from "../percentages/skills";
import { dec, roundDp, roundSf, showDec, showMoney } from "./dec";

const seeds = Array.from({ length: 300 }, (_, i) => i * 7919 + 13);
const GENERATORS = { ...DECIMAL_GENERATORS, ...PERCENT_GENERATORS };

describe("exact decimal helpers", () => {
  it("shows decimals exactly", () => {
    expect(showDec(dec(345, 2))).toBe("3.45");
    expect(showDec(dec(7, 3))).toBe("0.007");
    expect(showDec(dec(5, 1), 2)).toBe("0.50");
    expect(showDec(frac(3, 4))).toBe("0.75");
    expect(showMoney(frac(9, 2))).toBe("£4.50");
    expect(showMoney(frac(12))).toBe("£12");
  });
  it("rounds half up, to decimal places and significant figures", () => {
    expect(showDec(roundDp(dec(347, 2), 1))).toBe("3.5");
    expect(showDec(roundDp(dec(345, 2), 1))).toBe("3.5");
    expect(showDec(roundDp(dec(344, 2), 1))).toBe("3.4");
    expect(showDec(roundDp(dec(75, 1), 0))).toBe("8");
    expect(showDec(roundSf(frac(3456), 2))).toBe("3500");
    expect(showDec(roundSf(frac(72840), 1))).toBe("70000");
    expect(showDec(roundSf(dec(4567, 5), 2))).toBe("0.046");
    expect(showDec(roundSf(dec(996, 2), 2))).toBe("10");
  });
  it("accepts % and £ when typed", () => {
    for (const [t, v] of [["35%", frac(35)], ["35 %", frac(35)], ["£4.50", frac(9, 2)], ["70,000", frac(70000)]] as const) {
      const p = parseAnswer(t);
      expect(p.ok && equals(p.value, v), t).toBe(true);
    }
  });
});

describe("decimals and percentages generators", () => {
  for (const skillId of Object.keys(GENERATORS)) {
    for (const tier of [1, 2] as const) {
      it(`${skillId} tier ${tier}: right answers mark correct, predicted wrong answers mark wrong with their misconception`, () => {
        const prompts = new Set<string>();
        for (const seed of seeds) {
          const q = makeQuestion(skillId, tier, seed);
          prompts.add(q.prompt);
          expect(q.answer.kind).toBe("fraction");
          if (q.answer.kind !== "fraction") continue;
          const v = q.answer.value;
          // The answer as a student would type it: a fraction when simplest form is asked for, else a decimal.
          const typed = q.answer.requireSimplest ? show(v) : showDec(v);
          expect(markAnswer(q, typed, MISCONCEPTIONS).outcome, `${q.prompt} typed ${typed}`).toBe("correct");
          // The answer shown to the student is written the way they were asked to type it.
          expect(answerText(q)).toBe(typed);
          // Percentages can be typed with %, money with £.
          if (/percentage\.$/.test(q.prompt)) expect(markAnswer(q, `${typed}%`, MISCONCEPTIONS).correct).toBe(true);
          if (/pounds\?$/.test(q.prompt)) expect(markAnswer(q, `£${typed}`, MISCONCEPTIONS).correct).toBe(true);
          for (const w of q.wrongAnswers) {
            expect(MISCONCEPTIONS[w.misconception], w.misconception).toBeDefined();
            expect(Array.isArray(w.value)).toBe(false);
            if (Array.isArray(w.value)) continue;
            const val = typeof w.value === "number" ? frac(w.value) : w.value;
            const res = markAnswer(q, showDec(val), MISCONCEPTIONS);
            expect(res.correct, `${q.prompt}: wrong answer ${showDec(val)}`).toBe(false);
            expect(res.misconception).toBe(w.misconception);
          }
          // Prompts never contain floating-point noise or undefined values.
          for (const text of [q.prompt, ...q.hints, ...q.solution]) {
            expect(text, text).not.toMatch(/undefined|NaN|0000000|9999999/);
          }
          expect(q.hints.length).toBeGreaterThan(0);
          expect(q.solution.length).toBeGreaterThan(0);
          expect(q.answerHelp).toBeTruthy();
          expect(questionFromId(q.id)).toEqual(q);
        }
        // Enough variety that practice doesn't repeat.
        expect(prompts.size).toBeGreaterThan(40);
      });
    }
  }

  it("a rounding answer never needs a trailing zero (so 3.5 and 3.50 can't be confused)", () => {
    for (const seed of seeds) {
      const q = makeQuestion("num-rounding", 1, seed);
      const m = /to (\d) decimal place/.exec(q.prompt);
      if (!m || q.answer.kind !== "fraction") continue;
      expect(showDec(q.answer.value).split(".")[1]?.length ?? 0).toBe(Number(m[1]));
    }
  });

  it("spots 7% written as 0.7", () => {
    const q = seeds.map((s) => makeQuestion("num-fdp", 1, s)).find((x) => /^Write \d% as a decimal/.test(x.prompt))!;
    const p = Number(/Write (\d)%/.exec(q.prompt)![1]);
    expect(markAnswer(q, `0.${p}`, MISCONCEPTIONS).misconception).toBe("fdp-percent-digits");
  });

  it("asks for simplest form and says so when a fraction isn't simplified", () => {
    const q = seeds.map((s) => makeQuestion("num-fdp", 2, s)).find((x) => /^Write \d+% as a fraction/.test(x.prompt) && x.answer.kind === "fraction" && x.answer.value.d < 100)!;
    const p = Number(/Write (\d+)%/.exec(q.prompt)![1]);
    expect(markAnswer(q, `${p}/100`, MISCONCEPTIONS).outcome).toBe("not-simplified");
  });

  it("finds the change-only slip in percentage increase", () => {
    const q = makeQuestion("pct-increase-decrease", 1, 7);
    const w = q.wrongAnswers.find((x) => x.misconception === "pct-change-only");
    if (w) expect(markAnswer(q, showDec(w.value as ReturnType<typeof frac>), MISCONCEPTIONS).feedback).toMatch(/first step/);
  });
});

describe("decimals and percentages content", () => {
  it("every skill has a draft lesson, a generator and live prerequisites", () => {
    for (const s of [...DECIMAL_SKILLS, ...PERCENT_SKILLS]) {
      expect(LESSONS[s.id]?.status).toBe("draft");
      expect(hasGenerator(s.id), s.id).toBe(true);
      for (const p of s.prerequisites) expect(SKILL_BY_ID[p], `${s.id} -> ${p}`).toBeDefined();
    }
    for (const m of Object.values(MISCONCEPTIONS)) if (m.pointsTo) expect(SKILL_BY_ID[m.pointsTo], m.id).toBeDefined();
  });
});
