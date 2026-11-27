import { describe, expect, it } from "vitest";
import { equals, frac, parseAnswer, show, showMixed } from "./fraction";
import { markAnswer } from "./marking";
import { computeMastery } from "./mastery";
import { reviewState, INTERVALS_DAYS } from "./scheduler";
import { diagnose } from "./diagnosis";
import { recommend } from "./recommend";
import { contentBreakdown, parentInsights } from "./insights";
import type { AttemptEvent, LearningEvent, Question } from "./types";
import { FRACTION_MISCONCEPTIONS as MC, FRACTION_SKILLS } from "@/content/maths/fractions/skills";
import { GENERATORS, makeQuestion, questionFromId } from "@/content/maths/fractions/generators";

const SKILLS = Object.fromEntries(FRACTION_SKILLS.map((s) => [s.id, s]));
const day = (n: number, h = 10) => new Date(Date.UTC(2026, 0, 1 + n, h));

function att(skillId: string, at: Date, mode: AttemptEvent["mode"], correct: boolean, extra: Partial<AttemptEvent> = {}): AttemptEvent {
  return { type: "attempt", at, skillId, questionId: "q", mode, correct, assisted: false, hintsUsed: 0, ...extra };
}
function check(skillId: string, at: Date, right: number, id = "c1"): AttemptEvent[] {
  return Array.from({ length: 5 }, (_, i) =>
    att(skillId, new Date(at.getTime() + i * 60000), "check", i < right, { checkId: id }),
  );
}
const answerString = (q: Question) =>
  q.answer.kind === "fraction" ? show(q.answer.value) : q.answer.kind === "integer" ? String(q.answer.value) : q.answer.kind === "expression" ? q.answer.value : String(q.answer.correctIndex);

describe("parseAnswer", () => {
  it.each([
    ["3/4", frac(3, 4), "fraction"],
    [" 3 / 4 ", frac(3, 4), "fraction"],
    ["-2/3", frac(-2, 3), "fraction"],
    ["1 1/2", frac(3, 2), "mixed"],
    ["-2 3/4", frac(-11, 4), "mixed"],
    ["0.75", frac(3, 4), "decimal"],
    [".5", frac(1, 2), "decimal"],
    ["£12", frac(12), "integer"],
    ["1,200", frac(1200), "integer"],
    ["−5", frac(-5), "integer"],
    ["3÷4", frac(3, 4), "fraction"],
  ] as const)("reads %s", (input, value, form) => {
    const r = parseAnswer(input);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(equals(r.value, value)).toBe(true);
      expect(r.form).toBe(form);
    }
  });
  it("rejects nonsense and zero denominators", () => {
    expect(parseAnswer("abc").ok).toBe(false);
    expect(parseAnswer("").ok).toBe(false);
    const z = parseAnswer("3/0");
    expect(z.ok).toBe(false);
    if (!z.ok) expect(z.reason).toBe("zero-denominator");
  });
  it("shows mixed numbers", () => {
    expect(showMixed(frac(7, 4))).toBe("1 3/4");
    expect(showMixed(frac(8, 4))).toBe("2");
  });
});

describe("markAnswer", () => {
  const q: Question = {
    id: "t",
    skillId: "frac-add-sub",
    prompt: "1/3 + 1/4",
    answer: { kind: "fraction", value: frac(7, 12), requireSimplest: true },
    wrongAnswers: [{ value: frac(2, 7), misconception: "added-across" }],
    hints: [],
    solution: [],
  };
  it("accepts equivalent exact forms", () => {
    expect(markAnswer(q, "7/12", MC).outcome).toBe("correct");
  });
  it("flags unsimplified fractions when simplest form is required", () => {
    const q2 = { ...q, answer: { kind: "fraction" as const, value: frac(1, 2), requireSimplest: true } };
    const r = markAnswer(q2, "2/4", MC);
    expect(r.outcome).toBe("not-simplified");
    expect(r.correct).toBe(false);
    expect(markAnswer(q2, "0.5", MC).outcome).toBe("correct");
    const lenient = { ...q, answer: { kind: "fraction" as const, value: frac(1, 2), requireSimplest: false } };
    expect(markAnswer(lenient, "2/4", MC).outcome).toBe("correct");
  });
  it("matches misconceptions", () => {
    const r = markAnswer(q, "2/7", MC);
    expect(r.outcome).toBe("incorrect");
    expect(r.misconception).toBe("added-across");
    expect(r.feedback).toContain("denominators");
  });
  it("is kind about unreadable input and does not count it", () => {
    expect(markAnswer(q, "seven twelfths", MC).outcome).toBe("unreadable");
  });
});

describe("generators", () => {
  const seeds = Array.from({ length: 300 }, (_, i) => i * 7919 + 13);
  for (const skillId of Object.keys(GENERATORS)) {
    for (const tier of [1, 2] as const) {
      it(`${skillId} tier ${tier}: answers mark correct, wrong answers map to misconceptions`, () => {
        for (const seed of seeds) {
          const q = makeQuestion(skillId, tier, seed);
          expect(q.prompt.length).toBeGreaterThan(5);
          expect(q.hints.length).toBeGreaterThan(0);
          expect(q.solution.length).toBeGreaterThan(1);
          const r = markAnswer(q, answerString(q), MC);
          expect(r.outcome, `${q.prompt} expected ${answerString(q)}`).toBe("correct");
          for (const w of q.wrongAnswers) {
            expect(MC[w.misconception], w.misconception).toBeDefined();
            const s = typeof w.value === "number" ? String(w.value) : show(w.value);
            const wr = markAnswer(q, s, MC);
            // an unsimplified equivalent can never be listed as a wrong answer
            expect(wr.outcome).toBe("incorrect");
            expect(wr.misconception).toBe(w.misconception);
          }
          // positive, finite answers only in this chain
          if (q.answer.kind === "fraction") expect(q.answer.value.n).toBeGreaterThan(0);
          if (q.answer.kind === "integer") expect(q.answer.value).toBeGreaterThan(0);
          // rebuilding from the id gives the same question
          expect(questionFromId(q.id).prompt).toBe(q.prompt);
        }
      });
    }
  }
  it("worked solutions end with the answer", () => {
    for (const skillId of Object.keys(GENERATORS)) {
      for (let seed = 1; seed < 60; seed++) {
        const q = makeQuestion(skillId, 2, seed);
        const last = q.solution[q.solution.length - 1];
        const a = q.answer.kind === "fraction" ? show(q.answer.value) : String(q.answer.kind === "integer" ? q.answer.value : "");
        expect(last, `${q.prompt}`).toContain(a);
      }
    }
  });
});

describe("mastery", () => {
  const S = "frac-equivalent";
  it("starts at not started", () => {
    expect(computeMastery(S, []).level).toBe("not-started");
  });
  it("never goes beyond practising from lesson views and guided work", () => {
    const ev: LearningEvent[] = [
      { type: "lesson", at: day(0), skillId: S, stage: "teaching", action: "viewed" },
      ...Array.from({ length: 10 }, (_, i) => att(S, day(0, 11 + (i % 5)), "guided", true)),
    ];
    expect(computeMastery(S, ev).level).toBe("practising");
  });
  it("assisted answers do not count as correct", () => {
    const ev = Array.from({ length: 4 }, (_, i) => att(S, day(0, 10 + i), "independent", true, { assisted: true }));
    expect(computeMastery(S, ev).level).toBe("practising");
  });
  it("reaches developing with 3+ independent answers, half right", () => {
    const ev = [att(S, day(0), "independent", true), att(S, day(0, 11), "independent", false), att(S, day(0, 12), "independent", true)];
    expect(computeMastery(S, ev).level).toBe("developing");
  });
  it("demonstrated needs 4 of 5 unaided in a check", () => {
    expect(computeMastery(S, check(S, day(0), 3)).level).not.toBe("demonstrated");
    expect(computeMastery(S, check(S, day(0), 4)).level).toBe("demonstrated");
    const assisted = check(S, day(0), 5).map((a, i) => (i < 2 ? { ...a, assisted: true } : a));
    expect(computeMastery(S, assisted).level).not.toBe("demonstrated");
  });
  it("secure needs success on a later day, not the same day", () => {
    const same = [...check(S, day(0), 5), ...[1, 2, 3, 4].map((i) => att(S, day(0, 14 + i), "independent", true))];
    expect(computeMastery(S, same).level).toBe("demonstrated");
    const later = [...check(S, day(0), 5), ...[1, 2, 3].map((i) => att(S, day(2, 10 + i), "independent", true))];
    const m = computeMastery(S, later);
    expect(m.level).toBe("secure");
    expect(m.reason).toMatch(/Secure: 3 of 3/);
  });
  it("retained needs a correct review 21+ days after secure; a wrong review drops it", () => {
    const base = [...check(S, day(0), 5), ...[1, 2, 3].map((i) => att(S, day(1, 10 + i), "independent", true))];
    expect(computeMastery(S, [...base, att(S, day(10), "review", true)]).level).toBe("secure");
    const ret = computeMastery(S, [...base, att(S, day(25), "review", true)]);
    expect(ret.level).toBe("retained");
    const dropped = computeMastery(S, [...base, att(S, day(25), "review", true), att(S, day(80), "review", false)]);
    expect(dropped.level).toBe("developing");
    expect(dropped.droppedAt).toEqual(day(80));
    // and it can be earned back with a new check
    const back = computeMastery(S, [...base, att(S, day(80), "review", false), ...check(S, day(81), 5, "c2")]);
    expect(back.level).toBe("demonstrated");
  });
});

describe("spaced review", () => {
  const S = "frac-simplify";
  it("is first due one day after demonstrating, and expands with success", () => {
    const base = check(S, day(0), 5);
    expect(reviewState(S, [])).toBeNull();
    const r0 = reviewState(S, base)!;
    expect(Math.round((r0.due.getTime() - base[4].at.getTime()) / 864e5)).toBe(INTERVALS_DAYS[0]);
    const r1 = reviewState(S, [...base, att(S, day(1, 12), "review", true)])!;
    expect(r1.step).toBe(1);
    expect(Math.round((r1.due.getTime() - day(1, 12).getTime()) / 864e5)).toBe(3);
    const r2 = reviewState(S, [...base, att(S, day(1, 12), "review", true), att(S, day(4, 12), "review", false)])!;
    expect(r2.step).toBe(0);
  });
  it("an assisted review does not move it forward", () => {
    const r = reviewState(S, [...check(S, day(0), 5), att(S, day(1, 12), "review", true, { assisted: true })])!;
    expect(r.step).toBe(0);
  });
});

describe("gap diagnosis", () => {
  const add = SKILLS["frac-add-sub"];
  it("points to the prerequisite named by the misconception", () => {
    const ev = [
      att("frac-add-sub", day(0, 10), "independent", false, { misconception: "added-across" }),
      att("frac-add-sub", day(0, 11), "independent", false, { misconception: "added-across" }),
      att("frac-add-sub", day(0, 12), "independent", true),
    ];
    const g = diagnose(add, ev, SKILLS, MC)!;
    expect(g.kind).toBe("prerequisite");
    expect(g.suspect).toBe("frac-common-denominator");
    expect(g.reason).toContain("added tops and bottoms");
  });
  it("is quiet when errors are rare", () => {
    const ev = [att("frac-add-sub", day(0), "independent", false), att("frac-add-sub", day(0, 11), "independent", true)];
    expect(diagnose(add, ev, SKILLS, MC)).toBeNull();
  });
  it("blames the skill itself once prerequisites are secure", () => {
    const secure = (s: string) => [...check(s, day(0), 5, s), ...[1, 2, 3].map((i) => att(s, day(1, 10 + i), "independent", true))];
    const ev = [
      ...secure("frac-equivalent"),
      ...secure("frac-common-denominator"),
      ...secure("frac-simplify"),
      att("frac-add-sub", day(3, 10), "independent", false),
      att("frac-add-sub", day(3, 11), "independent", false),
    ];
    const g = diagnose(add, ev, SKILLS, MC)!;
    expect(g.kind).toBe("within-skill");
  });
});

describe("recommendations and parent insights", () => {
  it("suggests the first skill to a new student", () => {
    const recs = recommend(FRACTION_SKILLS, [], MC, day(0));
    expect(recs[0]).toMatchObject({ kind: "start", skillId: "frac-equivalent" });
  });
  it("unlocks the next skills once the prerequisite is demonstrated", () => {
    const recs = recommend(FRACTION_SKILLS, check("frac-equivalent", day(0), 5), MC, day(0, 12));
    expect(recs.map((r) => r.skillId)).toEqual(expect.arrayContaining(["frac-simplify", "frac-common-denominator", "frac-of-amount"]));
    expect(recs.find((r) => r.skillId === "frac-add-sub")).toBeUndefined();
  });
  it("puts due reviews first and explains gaps", () => {
    const ev = [
      ...check("frac-equivalent", day(0), 5),
      att("frac-add-sub", day(0, 14), "independent", false, { misconception: "added-across" }),
      att("frac-add-sub", day(0, 15), "independent", false, { misconception: "added-across" }),
    ];
    const recs = recommend(FRACTION_SKILLS, ev, MC, day(3));
    expect(recs[0]).toMatchObject({ kind: "review", skillId: "frac-equivalent" });
    expect(recs.some((r) => r.kind === "gap-check" && r.skillId === "frac-common-denominator")).toBe(true);
  });
  it("builds parent sentences only from evidence", () => {
    const empty = parentInsights("Sam", FRACTION_SKILLS, [], MC, day(0));
    expect(empty[0].text).toContain("hasn't answered");
    const ev = [
      ...check("frac-equivalent", day(0), 5),
      att("frac-add-sub", day(0, 14), "independent", false, { misconception: "added-across" }),
      att("frac-add-sub", day(0, 15), "independent", false, { misconception: "added-across" }),
    ];
    const ins = parentInsights("Sam", FRACTION_SKILLS, ev, MC, day(1));
    const text = ins.map((i) => i.text).join(" ");
    expect(text).toContain("Equivalent fractions: demonstrated understanding");
    expect(text).toContain("2 of the last 2 mistakes");
    expect(text).toContain("common denominators");
    const b = contentBreakdown(FRACTION_SKILLS, ev);
    expect(b.assessed).toEqual(["Equivalent fractions"]);
    expect(b.retained).toEqual([]);
  });
});
