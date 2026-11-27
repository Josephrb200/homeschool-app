import { describe, expect, it } from "vitest";
import { frac, show } from "@/engine/fraction";
import { markAnswer } from "@/engine/marking";
import type { Question } from "@/engine/types";
import { makeQuestion, questionFromId } from "@/content/questions";
import { CHAINS, LESSONS, MISCONCEPTIONS as MC, SKILL_BY_ID } from "@/content";
import { isCubeNet, SOLIDS, SOLID_GENERATORS, views } from "./generators";
import { SOLID_SKILLS } from "./skills";
import { SOLID_LESSONS } from "./lessons";

const seeds = Array.from({ length: 300 }, (_, i) => i * 7919 + 13);

describe("3D shape and views generators", () => {
  for (const skillId of Object.keys(SOLID_GENERATORS))
    for (const tier of [1, 2] as const)
      it(`${skillId} tier ${tier}`, () => {
        for (const seed of seeds) {
          const q: Question = makeQuestion(skillId, tier, seed);
          const label = `${q.id} ${q.prompt}`;
          if (q.answer.kind === "choice") {
            expect(new Set(q.answer.options).size, label).toBe(q.answer.options.length);
            expect(markAnswer(q, q.answer.options[q.answer.correctIndex], MC).correct, label).toBe(true);
          } else {
            expect(q.answer.kind).toBe("integer");
            if (q.answer.kind !== "integer") continue;
            expect(markAnswer(q, String(q.answer.value), MC).correct, label).toBe(true);
          }
          for (const w of q.wrongAnswers) {
            expect(MC[w.misconception], `${label}: ${w.misconception}`).toBeDefined();
            const typed = q.answer.kind === "choice" ? q.answer.options[w.value as number] : show(typeof w.value === "number" ? frac(w.value) : (w.value as ReturnType<typeof frac>));
            const res = markAnswer(q, typed, MC);
            expect(res.correct, `${label} wrong ${typed}`).toBe(false);
            expect(res.misconception).toBe(w.misconception);
          }
          expect(q.prompt + q.solution.join(" ") + q.hints.join(" "), label).not.toMatch(/undefined|NaN/);
          expect(questionFromId(q.id)).toEqual(q);
        }
      });
});

describe("solid geometry", () => {
  it("knows which hexominoes fold into a cube", () => {
    expect(isCubeNet([[0, 1], [1, 1], [2, 1], [3, 1], [1, 2], [1, 0]])).toBe(true); // cross
    expect(isCubeNet([[0, 1], [1, 1], [2, 1], [3, 1], [1, 2], [2, 0]])).toBe(true);
    expect(isCubeNet([[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]])).toBe(false); // 2 × 3 block
    expect(isCubeNet([[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [0, 1]])).toBe(false); // 5 in a row
    expect(isCubeNet([[0, 1], [1, 1], [2, 1], [3, 1], [1, 2], [1, 3]])).toBe(false);
    // Exactly 11 of the 35 hexominoes fold into a cube.
    const all = new Set<string>();
    const grow = (cells: [number, number][]) => {
      if (cells.length === 6) {
        const mx = Math.min(...cells.map((c) => c[0]));
        const my = Math.min(...cells.map((c) => c[1]));
        const n = cells.map(([x, y]) => [x - mx, y - my] as [number, number]);
        // Canonical over the 8 symmetries.
        const forms = [0, 1, 2, 3, 4, 5, 6, 7].map((k) => {
          let t = n.map(([x, y]) => (k & 4 ? [-x, y] : [x, y]) as [number, number]);
          for (let i = 0; i < (k & 3); i++) t = t.map(([x, y]) => [-y, x] as [number, number]);
          const ax = Math.min(...t.map((c) => c[0]));
          const ay = Math.min(...t.map((c) => c[1]));
          return t.map(([x, y]) => `${x - ax},${y - ay}`).sort().join(" ");
        });
        all.add(forms.sort()[0]);
        return;
      }
      for (const [x, y] of cells)
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nb: [number, number] = [x + dx, y + dy];
          if (!cells.some((c) => c[0] === nb[0] && c[1] === nb[1])) grow([...cells, nb]);
        }
    };
    grow([[0, 0]]);
    expect(all.size).toBe(35);
    const nets = [...all].filter((k) => isCubeNet(k.split(" ").map((p) => p.split(",").map(Number) as [number, number])));
    expect(nets.length).toBe(11);
  });

  it("solids obey Euler's rule and views match the stack", () => {
    for (const s of SOLIDS) expect(s.faces + s.vertices - s.edges, s.name).toBe(2);
    const v = views([[2, 1, 1], [3, 0, 1]]);
    expect(v.plan.length).toBe(5);
    expect(v.front.length).toBe(5);
    expect(v.side.length).toBe(5);
  });
});

describe("3D shapes lessons", () => {
  it("every skill has a lesson, a generator and a chain", () => {
    const chain = CHAINS.find((c) => c.id === "solids")!;
    for (const s of SOLID_SKILLS) {
      expect(LESSONS[s.id]).toBe(SOLID_LESSONS[s.id]);
      expect(SOLID_GENERATORS[s.id]).toBeDefined();
      expect(SKILL_BY_ID[s.id]).toBeDefined();
      expect(chain.skillIds).toContain(s.id);
      expect(SOLID_LESSONS[s.id].status).toBe("draft");
    }
  });
});
