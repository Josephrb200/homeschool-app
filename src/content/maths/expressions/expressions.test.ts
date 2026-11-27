import { describe, expect, it } from "vitest";
import { LESSONS, SKILL_BY_ID } from "@/content";
import { checkGenerators } from "../generator-checks";
import { EXPRESSION_GENERATORS } from "./generators";
import { EXPRESSION_LESSONS } from "./lessons";
import { EXPRESSION_MISCONCEPTIONS, EXPRESSION_SKILLS } from "./skills";

describe("expressions and brackets", () => {
  it("every skill has a draft lesson, a generator and valid prerequisites", () => {
    for (const s of EXPRESSION_SKILLS) {
      expect(EXPRESSION_LESSONS[s.id], s.id).toBeDefined();
      expect(EXPRESSION_GENERATORS[s.id], s.id).toBeDefined();
      expect(LESSONS[s.id].status).toBe("draft");
      for (const p of SKILL_BY_ID[s.id].prerequisites) expect(SKILL_BY_ID[p], p).toBeDefined();
    }
    for (const m of Object.values(EXPRESSION_MISCONCEPTIONS)) if (m.pointsTo) expect(SKILL_BY_ID[m.pointsTo], m.pointsTo).toBeDefined();
  });

  it("every question marks its own answer right and catches each predicted mistake", () => {
    checkGenerators(Object.keys(EXPRESSION_GENERATORS), Object.keys(EXPRESSION_MISCONCEPTIONS));
  });
});
