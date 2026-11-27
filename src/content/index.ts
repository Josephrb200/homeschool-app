/**
 * Content registry. Each chain registers its skills, misconceptions and lessons
 * here; the app reads curriculum only through this module.
 */
import { FRACTION_MISCONCEPTIONS, FRACTION_SKILLS } from "./maths/fractions/skills";
import { FRACTION_LESSONS } from "./maths/fractions/lessons";
import { AREA_MISCONCEPTIONS, AREA_SKILLS } from "./maths/area/skills";
import { AREA_LESSONS } from "./maths/area/lessons";
import { ALGEBRA_MISCONCEPTIONS, ALGEBRA_SKILLS } from "./maths/algebra/skills";
import { ALGEBRA_LESSONS } from "./maths/algebra/lessons";
import { RATIO_MISCONCEPTIONS, RATIO_SKILLS } from "./maths/ratio/skills";
import { RATIO_LESSONS } from "./maths/ratio/lessons";
import type { Skill } from "@/engine/types";

/** Every skill exactly as its chain writes it (prerequisites copy the topic map). */
const ALL_SKILLS: Skill[] = [...AREA_SKILLS, ...FRACTION_SKILLS, ...ALGEBRA_SKILLS, ...RATIO_SKILLS];
const LIVE_IDS = new Set(ALL_SKILLS.map((s) => s.id));

/**
 * The live curriculum. A prerequisite that isn't built yet is left out until
 * its lesson goes live, so the app only ever points students at real lessons.
 */
export const SKILLS: Skill[] = ALL_SKILLS.map((s) => ({ ...s, prerequisites: s.prerequisites.filter((p) => LIVE_IDS.has(p)) }));
export const SKILL_BY_ID: Record<string, Skill> = Object.fromEntries(SKILLS.map((s) => [s.id, s]));
export const MISCONCEPTIONS = { ...FRACTION_MISCONCEPTIONS, ...AREA_MISCONCEPTIONS, ...ALGEBRA_MISCONCEPTIONS, ...RATIO_MISCONCEPTIONS };
export const LESSONS = { ...FRACTION_LESSONS, ...AREA_LESSONS, ...ALGEBRA_LESSONS, ...RATIO_LESSONS };

export const CHAINS = [
  { id: "area", subject: "Maths", strand: "Geometry", name: "Area of shapes", skillIds: AREA_SKILLS.map((s) => s.id) },
  { id: "fractions", subject: "Maths", strand: "Number", name: "Fractions", skillIds: FRACTION_SKILLS.map((s) => s.id) },
  { id: "algebra", subject: "Maths", strand: "Algebra", name: "Starting algebra", skillIds: ALGEBRA_SKILLS.map((s) => s.id) },
  { id: "ratio", subject: "Maths", strand: "Ratio", name: "Ratio and proportion", skillIds: RATIO_SKILLS.map((s) => s.id) },
];
