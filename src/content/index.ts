/**
 * Content registry. Each chain registers its skills, misconceptions and lessons
 * here; the app reads curriculum only through this module.
 */
import { FRACTION_MISCONCEPTIONS, FRACTION_SKILLS } from "./maths/fractions/skills";
import { FRACTION_LESSONS } from "./maths/fractions/lessons";
import { AREA_MISCONCEPTIONS, AREA_SKILLS } from "./maths/area/skills";
import { AREA_LESSONS } from "./maths/area/lessons";
import { CIRCLE_SKILLS, MEASURES_MISCONCEPTIONS, MEASURES_SKILLS, PERIMETER_SKILLS, VOLUME_SKILLS } from "./maths/measures/skills";
import { MEASURES_LESSONS } from "./maths/measures/lessons";
import type { Skill } from "@/engine/types";

export const SKILLS: Skill[] = [...AREA_SKILLS, ...FRACTION_SKILLS, ...MEASURES_SKILLS];
export const SKILL_BY_ID: Record<string, Skill> = Object.fromEntries(SKILLS.map((s) => [s.id, s]));
export const MISCONCEPTIONS = { ...FRACTION_MISCONCEPTIONS, ...AREA_MISCONCEPTIONS, ...MEASURES_MISCONCEPTIONS };
export const LESSONS = { ...FRACTION_LESSONS, ...AREA_LESSONS, ...MEASURES_LESSONS };

export const CHAINS = [
  {
    id: "area",
    subject: "Maths",
    strand: "Geometry",
    name: "Perimeter and area",
    skillIds: [...PERIMETER_SKILLS, ...AREA_SKILLS].map((s) => s.id),
  },
  { id: "circles", subject: "Maths", strand: "Geometry", name: "Circles", skillIds: CIRCLE_SKILLS.map((s) => s.id) },
  { id: "volume", subject: "Maths", strand: "Geometry", name: "Volume and surface area", skillIds: VOLUME_SKILLS.map((s) => s.id) },
  { id: "fractions", subject: "Maths", strand: "Number", name: "Fractions", skillIds: FRACTION_SKILLS.map((s) => s.id) },
];
