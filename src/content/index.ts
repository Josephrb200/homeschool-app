/**
 * Content registry. Phase 1 has one chain (fractions). New chains register here;
 * the app reads curriculum only through this module.
 */
import { FRACTION_MISCONCEPTIONS, FRACTION_SKILLS } from "./maths/fractions/skills";
import { FRACTION_LESSONS } from "./maths/fractions/lessons";
import type { Skill } from "@/engine/types";

export const SKILLS: Skill[] = [...FRACTION_SKILLS];
export const SKILL_BY_ID: Record<string, Skill> = Object.fromEntries(SKILLS.map((s) => [s.id, s]));
export const MISCONCEPTIONS = { ...FRACTION_MISCONCEPTIONS };
export const LESSONS = { ...FRACTION_LESSONS };

export const CHAINS = [
  { id: "fractions", subject: "Maths", strand: "Number", name: "Fractions", skillIds: FRACTION_SKILLS.map((s) => s.id) },
];
