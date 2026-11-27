import { describe, expect, it } from "vitest";
import { showDecimal } from "@/engine/fraction";
import { answerText, markAnswer } from "@/engine/marking";
import type { Question } from "@/engine/types";
import { makeQuestion, questionFromId } from "@/content/questions";
import { CHAINS, LESSONS, MISCONCEPTIONS, SKILL_BY_ID } from "@/content";
import { SEQUENCE_GENERATORS as GRAPH_GENERATORS } from "./generators";
import { SEQUENCE_SKILLS as GRAPH_SKILLS } from "./skills";

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


describe("sequence generators", () => {
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
            const res = markAnswer(q, w.value, MISCONCEPTIONS);
            expect(res.misconception, `${ctx} wrong ${w.value}`).toBe(w.misconception);
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
          expect(questionFromId(q.id)).toEqual(q);
        }
        expect(prompts.size, `${skillId} tier ${tier} variety`).toBeGreaterThan(30);
      });
    }
  }

  it("nth-term answers really generate the sequence shown", () => {
    for (const seed of seeds) {
      for (const tier of [1, 2] as const) {
        const q = makeQuestion("alg-nth-term", tier, seed);
        if (q.answer.kind !== "expression") continue;
        const shown = /of (.*), …/.exec(q.prompt)![1].split(", ").map((t) => Number(t.replace("−", "-")));
        const m = /^(−?\d*)n(?: ([+−]) (\d+))?$/.exec(q.answer.value)!;
        const d = m[1] === "" ? 1 : m[1] === "−" ? -1 : Number(m[1].replace("−", "-"));
        const c = m[2] ? (m[2] === "+" ? 1 : -1) * Number(m[3]) : 0;
        shown.forEach((t, i) => expect(d * (i + 1) + c, q.prompt).toBe(t));
      }
    }
  });
});

describe("sequences content", () => {
  it("every skill has a draft lesson, a generator and is in a chain", () => {
    const chain = CHAINS.find((c) => c.id === "sequences")!;
    expect(chain.skillIds).toEqual(GRAPH_SKILLS.map((s) => s.id));
    for (const s of GRAPH_SKILLS) {
      expect(LESSONS[s.id]?.status, s.id).toBe("draft");
      expect(GRAPH_GENERATORS[s.id], s.id).toBeDefined();
      expect(SKILL_BY_ID[s.id], s.id).toBeDefined();
    }
  });
});
