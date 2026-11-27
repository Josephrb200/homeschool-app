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
import { DECIMAL_MISCONCEPTIONS, DECIMAL_SKILLS } from "./maths/decimals/skills";
import { DECIMAL_LESSONS } from "./maths/decimals/lessons";
import { PERCENT_MISCONCEPTIONS, PERCENT_SKILLS } from "./maths/percentages/skills";
import { PERCENT_LESSONS } from "./maths/percentages/lessons";
import type { Skill } from "@/engine/types";

export const SKILLS: Skill[] = [...AREA_SKILLS, ...FRACTION_SKILLS, ...ALGEBRA_SKILLS, ...DECIMAL_SKILLS, ...PERCENT_SKILLS];
export const SKILL_BY_ID: Record<string, Skill> = Object.fromEntries(SKILLS.map((s) => [s.id, s]));
export const MISCONCEPTIONS = { ...FRACTION_MISCONCEPTIONS, ...AREA_MISCONCEPTIONS, ...ALGEBRA_MISCONCEPTIONS, ...DECIMAL_MISCONCEPTIONS, ...PERCENT_MISCONCEPTIONS };
export const LESSONS = { ...FRACTION_LESSONS, ...AREA_LESSONS, ...ALGEBRA_LESSONS, ...DECIMAL_LESSONS, ...PERCENT_LESSONS };

export const CHAINS = [
  { id: "area", subject: "Maths", strand: "Geometry", name: "Area of shapes", skillIds: AREA_SKILLS.map((s) => s.id) },
  { id: "fractions", subject: "Maths", strand: "Number", name: "Fractions", skillIds: FRACTION_SKILLS.map((s) => s.id) },
  { id: "algebra", subject: "Maths", strand: "Algebra", name: "Starting algebra", skillIds: ALGEBRA_SKILLS.map((s) => s.id) },
  { id: "decimals", subject: "Maths", strand: "Number", name: "Decimals and rounding", skillIds: DECIMAL_SKILLS.map((s) => s.id) },
  { id: "percentages", subject: "Maths", strand: "Number", name: "Percentages", skillIds: PERCENT_SKILLS.map((s) => s.id) },
];
