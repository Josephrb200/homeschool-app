/**
 * Content registry. Each chain registers its skills, misconceptions and lessons
 * here; the app reads curriculum only through this module.
 */
import { FRACTION_MISCONCEPTIONS, FRACTION_SKILLS } from "./maths/fractions/skills";
import { FRACTION_LESSONS } from "./maths/fractions/lessons";
import { AREA_MISCONCEPTIONS, AREA_SKILLS } from "./maths/area/skills";
import { AREA_LESSONS } from "./maths/area/lessons";
import type { Skill } from "@/engine/types";

export const SKILLS: Skill[] = [...AREA_SKILLS, ...FRACTION_SKILLS];
export const SKILL_BY_ID: Record<string, Skill> = Object.fromEntries(SKILLS.map((s) => [s.id, s]));
export const MISCONCEPTIONS = { ...FRACTION_MISCONCEPTIONS, ...AREA_MISCONCEPTIONS };
export const LESSONS = { ...FRACTION_LESSONS, ...AREA_LESSONS };

export const CHAINS = [
  { id: "area", subject: "Maths", strand: "Geometry", name: "Area of shapes", skillIds: AREA_SKILLS.map((s) => s.id) },
  { id: "fractions", subject: "Maths", strand: "Number", name: "Fractions", skillIds: FRACTION_SKILLS.map((s) => s.id) },
];
