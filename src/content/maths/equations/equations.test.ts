import { describe, expect, it } from "vitest";
import { LESSONS, SKILL_BY_ID } from "@/content";
import { checkGenerators } from "../generator-checks";
import { EQUATION_GENERATORS } from "./generators";
import { EQUATION_LESSONS } from "./lessons";
import { EQUATION_MISCONCEPTIONS, EQUATION_SKILLS } from "./skills";

describe("equations and inequalities", () => {
  it("every skill has a draft lesson, a generator and valid prerequisites", () => {
    for (const s of EQUATION_SKILLS) {
      expect(EQUATION_LESSONS[s.id], s.id).toBeDefined();
      expect(EQUATION_GENERATORS[s.id], s.id).toBeDefined();
      expect(LESSONS[s.id].status).toBe("draft");
      for (const p of SKILL_BY_ID[s.id].prerequisites) expect(SKILL_BY_ID[p], p).toBeDefined();
    }
    for (const m of Object.values(EQUATION_MISCONCEPTIONS)) if (m.pointsTo) expect(SKILL_BY_ID[m.pointsTo], m.pointsTo).toBeDefined();
  });

  it("every question marks its own answer right and catches each predicted mistake", () => {
    checkGenerators(Object.keys(EQUATION_GENERATORS), Object.keys(EQUATION_MISCONCEPTIONS));
  });
});
