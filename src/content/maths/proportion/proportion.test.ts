import { describe, expect, it } from "vitest";
import { CHAINS, LESSONS, SKILL_BY_ID } from "@/content";
import { GCSE_FOUNDATION_MAP } from "../gcse-foundation-map";
import { checkGenerators } from "../calculation/calculation.test";
import { PROPORTION_GENERATORS } from "./generators";
import { ALL_PROPORTION_SKILLS, PROPORTION_MISCONCEPTIONS } from "./skills";
import { PROPORTION_LESSONS } from "./lessons";

describe("proportion generators", () => {
  checkGenerators(PROPORTION_GENERATORS);
});

describe("proportion content", () => {
  const map = new Map(GCSE_FOUNDATION_MAP.map((s) => [s.id, s]));

  it("every skill has a Draft lesson and a generator, and copies the topic map's prerequisites exactly", () => {
    for (const s of ALL_PROPORTION_SKILLS) {
      expect(PROPORTION_LESSONS[s.id], s.id).toBeDefined();
      expect(PROPORTION_GENERATORS[s.id], s.id).toBeDefined();
      expect(LESSONS[s.id].status).toBe("draft");
      expect([...s.prerequisites].sort(), s.id).toEqual([...map.get(s.id)!.prerequisites].sort());
      expect(s.typicalYear).toBe(map.get(s.id)!.typicalYear);
      for (const p of SKILL_BY_ID[s.id].prerequisites) expect(SKILL_BY_ID[p], p).toBeDefined();
    }
    for (const m of Object.values(PROPORTION_MISCONCEPTIONS)) if (m.pointsTo) expect(SKILL_BY_ID[m.pointsTo], m.id).toBeDefined();
  });

  it("every skill sits in exactly one chain", () => {
    for (const s of ALL_PROPORTION_SKILLS) expect(CHAINS.filter((c) => c.skillIds.includes(s.id)).length, s.id).toBe(1);
  });
});
