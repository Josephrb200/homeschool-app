import { describe, expect, it } from "vitest";
import { frac, show } from "@/engine/fraction";
import { answerText, markAnswer, roundTo } from "@/engine/marking";
import type { Question } from "@/engine/types";
import { makeQuestion, questionFromId } from "@/content/questions";
import { CHAINS, LESSONS, MISCONCEPTIONS as MC, SKILL_BY_ID } from "@/content";
import { CONSTRUCTION_GENERATORS } from "./generators";
import { CONSTRUCTION_MISCONCEPTIONS, CONSTRUCTION_SKILLS } from "./skills";
import { CONSTRUCTION_LESSONS } from "./lessons";
import { MENSURATION_GENERATORS } from "../mensuration/generators";
import { CIRCLE_MORE_SKILLS, MENSURATION_MISCONCEPTIONS, VOLUME_MORE_SKILLS } from "../mensuration/skills";
import { MENSURATION_LESSONS } from "../mensuration/lessons";

const seeds = Array.from({ length: 300 }, (_, i) => i * 7919 + 13);
const GENS = { ...CONSTRUCTION_GENERATORS, ...MENSURATION_GENERATORS };

function typed(q: Question, value: unknown): string {
  const a = q.answer;
  if (a.kind === "choice") return a.options[value as number];
  if (a.kind === "pi") return `${value}π`;
  if (a.kind === "decimal") return roundTo(value as number, a.dp);
  return show(typeof value === "number" ? frac(value) : (value as ReturnType<typeof frac>));
}

describe("constructions, loci, circles and volume generators", () => {
  const used = new Set<string>();
  for (const skillId of Object.keys(GENS))
    for (const tier of [1, 2] as const)
      it(`${skillId} tier ${tier}`, () => {
        for (const seed of seeds) {
          const q: Question = makeQuestion(skillId, tier, seed);
          const label = `${q.id} ${q.prompt}`;
          expect(["choice", "integer", "decimal", "pi"], label).toContain(q.answer.kind);
          if (q.answer.kind !== "choice") expect(q.answerHelp, label).toBeTruthy();
          else expect(new Set(q.answer.options).size, label).toBe(q.answer.options.length);
          const right = markAnswer(q, answerText(q), MC);
          expect(right.correct, `${label} → ${answerText(q)}: ${right.feedback}`).toBe(true);
          for (const w of q.wrongAnswers) {
            expect(MC[w.misconception], `${label}: ${w.misconception}`).toBeDefined();
            const t = typed(q, w.value);
            const res = markAnswer(q, t, MC);
            expect(res.correct, `${label} wrong ${t}`).toBe(false);
            expect(res.misconception, `${label} wrong ${t}: ${res.feedback}`).toBe(w.misconception);
            used.add(w.misconception);
          }
          const text = [q.prompt, ...q.hints, ...q.solution].join(" ");
          expect(text, label).not.toMatch(/undefined|NaN|Infinity|\[object/);
          expect(questionFromId(q.id)).toEqual(q);
        }
      });
  it("uses every misconception", () => {
    for (const id of [...Object.keys(CONSTRUCTION_MISCONCEPTIONS), ...Object.keys(MENSURATION_MISCONCEPTIONS)]) expect(used.has(id), id).toBe(true);
  });
});

describe("rounded and exact answers", () => {
  it("accepts π = 3.14 answers and nudges decimals for π answers", () => {
    for (const seed of seeds.slice(0, 60)) {
      const q = makeQuestion("geo-exact-pi", 1, seed);
      if (q.answer.kind !== "pi") continue;
      expect(markAnswer(q, (q.answer.coeff * Math.PI).toFixed(2), MC).outcome).toBe("not-simplified");
    }
  });
});

describe("lessons and chains", () => {
  it("every skill has a lesson, a generator and a chain", () => {
    const chainOf = (id: string) => CHAINS.find((c) => c.skillIds.includes(id));
    for (const s of [...CONSTRUCTION_SKILLS, ...CIRCLE_MORE_SKILLS, ...VOLUME_MORE_SKILLS]) {
      const lesson = LESSONS[s.id];
      expect(lesson, s.id).toBe(CONSTRUCTION_LESSONS[s.id] ?? MENSURATION_LESSONS[s.id]);
      expect(lesson.status).toBe("draft");
      expect(GENS[s.id as keyof typeof GENS]).toBeDefined();
      expect(SKILL_BY_ID[s.id]).toBeDefined();
      expect(chainOf(s.id), s.id).toBeDefined();
    }
  });
});
