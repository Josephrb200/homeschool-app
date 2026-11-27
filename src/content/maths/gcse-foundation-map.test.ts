import { describe, expect, it } from "vitest";
import { FOUNDATION_SPEC_CODES, GCSE_FOUNDATION_MAP } from "./gcse-foundation-map";
import { SKILLS } from "@/content";

const byId = new Map(GCSE_FOUNDATION_MAP.map((s) => [s.id, s]));

describe("GCSE Foundation topic map", () => {
  it("has unique ids", () => {
    expect(byId.size).toBe(GCSE_FOUNDATION_MAP.length);
  });

  it("only points to prerequisites that exist", () => {
    for (const s of GCSE_FOUNDATION_MAP) for (const p of s.prerequisites) expect(byId.has(p), `${s.id} -> ${p}`).toBe(true);
  });

  it("has no prerequisite cycles", () => {
    const state = new Map<string, "visiting" | "done">();
    const visit = (id: string, path: string[]) => {
      if (state.get(id) === "done") return;
      if (state.get(id) === "visiting") throw new Error(`cycle: ${[...path, id].join(" -> ")}`);
      state.set(id, "visiting");
      for (const p of byId.get(id)!.prerequisites) visit(p, [...path, id]);
      state.set(id, "done");
    };
    for (const s of GCSE_FOUNDATION_MAP) visit(s.id, []);
  });

  it("never builds a skill before its prerequisites' phase allows (prereqs in same or earlier phase)", () => {
    for (const s of GCSE_FOUNDATION_MAP)
      for (const p of s.prerequisites) expect(byId.get(p)!.phase <= s.phase, `${s.id} (phase ${s.phase}) needs ${p} (phase ${byId.get(p)!.phase})`).toBe(true);
  });

  it("includes every skill already in the app, with matching prerequisites", () => {
    for (const live of SKILLS) {
      const planned = byId.get(live.id);
      expect(planned, live.id).toBeDefined();
      expect([...planned!.prerequisites].sort()).toEqual([...live.prerequisites].sort());
    }
  });

  it("covers every Foundation content code at least once, and nothing else", () => {
    const used = new Set(GCSE_FOUNDATION_MAP.flatMap((s) => s.specRefs));
    for (const code of FOUNDATION_SPEC_CODES) expect(used.has(code), code).toBe(true);
    for (const code of used) expect(FOUNDATION_SPEC_CODES, code).toContain(code);
  });
});
