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
import { ALGEBRA_MISCONCEPTIONS, ALGEBRA_SKILLS } from "./maths/algebra/skills";
import { ALGEBRA_LESSONS } from "./maths/algebra/lessons";
import { EXPRESSION_MISCONCEPTIONS, EXPRESSION_SKILLS } from "./maths/expressions/skills";
import { EXPRESSION_LESSONS } from "./maths/expressions/lessons";
import { EQUATION_MISCONCEPTIONS, EQUATION_SKILLS } from "./maths/equations/skills";
import { EQUATION_LESSONS } from "./maths/equations/lessons";
import { DECIMAL_MISCONCEPTIONS, DECIMAL_SKILLS } from "./maths/decimals/skills";
import { DECIMAL_LESSONS } from "./maths/decimals/lessons";
import { PERCENT_MISCONCEPTIONS, PERCENT_SKILLS } from "./maths/percentages/skills";
import { PERCENT_LESSONS } from "./maths/percentages/lessons";
import { RATIO_MISCONCEPTIONS, RATIO_SKILLS } from "./maths/ratio/skills";
import { RATIO_LESSONS } from "./maths/ratio/lessons";
import { PROBABILITY_MISCONCEPTIONS, PROBABILITY_SKILLS } from "./maths/probability/skills";
import { PROBABILITY_LESSONS } from "./maths/probability/lessons";
import { FACTOR_MISCONCEPTIONS, FACTOR_SKILLS } from "./maths/factors/skills";
import { FACTOR_LESSONS } from "./maths/factors/lessons";
import { STATS_MISCONCEPTIONS, STATS_SKILLS } from "./maths/statistics/skills";
import { STATS_LESSONS } from "./maths/statistics/lessons";
import { POWERS_MISCONCEPTIONS, POWERS_SKILLS } from "./maths/powers/skills";
import { POWERS_LESSONS } from "./maths/powers/lessons";
import { ANGLE_MISCONCEPTIONS, ANGLE_SKILLS } from "./maths/angles/skills";
import { ANGLE_LESSONS } from "./maths/angles/lessons";
import { TRANSFORMATION_MISCONCEPTIONS, TRANSFORMATION_SKILLS } from "./maths/transformations/skills";
import { TRANSFORMATION_LESSONS } from "./maths/transformations/lessons";
import { SHAPE_PROOF_SKILLS, TRIANGLE_MISCONCEPTIONS, TRIANGLE_SKILLS, TRIG_SKILLS } from "./maths/triangles/skills";
import { TRIANGLE_LESSONS } from "./maths/triangles/lessons";
import { VECTOR_MISCONCEPTIONS, VECTOR_SKILLS } from "./maths/vectors/skills";
import { VECTOR_LESSONS } from "./maths/vectors/lessons";
import { CALCULATION_MISCONCEPTIONS, CALCULATION_SKILLS, ESTIMATION_SKILLS, LISTING_SKILLS, MEASURES_MONEY_SKILLS, SF_CALC_SKILLS, ALL_CALCULATION_SKILLS } from "./maths/calculation/skills";
import { CALCULATION_LESSONS } from "./maths/calculation/lessons";
import { GRAPH_MISCONCEPTIONS, GRAPH_SKILLS } from "./maths/graphs/skills";
import { GRAPH_LESSONS } from "./maths/graphs/lessons";
import { SEQUENCE_MISCONCEPTIONS, SEQUENCE_SKILLS } from "./maths/sequences/skills";
import { SEQUENCE_LESSONS } from "./maths/sequences/lessons";
import type { Skill } from "@/engine/types";

/** Every skill exactly as its chain writes it (prerequisites copy the topic map). */
const ALL_SKILLS: Skill[] = [...AREA_SKILLS, ...FRACTION_SKILLS, ...MEASURES_SKILLS, ...ALGEBRA_SKILLS, ...EXPRESSION_SKILLS, ...EQUATION_SKILLS, ...RATIO_SKILLS, ...DECIMAL_SKILLS, ...PERCENT_SKILLS, ...FACTOR_SKILLS, ...STATS_SKILLS, ...PROBABILITY_SKILLS, ...POWERS_SKILLS, ...ANGLE_SKILLS, ...TRIANGLE_SKILLS, ...TRANSFORMATION_SKILLS, ...ALL_CALCULATION_SKILLS, ...VECTOR_SKILLS, ...GRAPH_SKILLS, ...SEQUENCE_SKILLS];
const LIVE_IDS = new Set(ALL_SKILLS.map((s) => s.id));

/**
 * The live curriculum. A prerequisite that isn't built yet is left out until
 * its lesson goes live, so the app only ever points students at real lessons.
 */
export const SKILLS: Skill[] = ALL_SKILLS.map((s) => ({ ...s, prerequisites: s.prerequisites.filter((p) => LIVE_IDS.has(p)) }));
export const SKILL_BY_ID: Record<string, Skill> = Object.fromEntries(SKILLS.map((s) => [s.id, s]));
export const MISCONCEPTIONS = { ...FRACTION_MISCONCEPTIONS, ...AREA_MISCONCEPTIONS, ...MEASURES_MISCONCEPTIONS, ...ALGEBRA_MISCONCEPTIONS, ...EXPRESSION_MISCONCEPTIONS, ...EQUATION_MISCONCEPTIONS, ...RATIO_MISCONCEPTIONS, ...DECIMAL_MISCONCEPTIONS, ...PERCENT_MISCONCEPTIONS, ...FACTOR_MISCONCEPTIONS, ...STATS_MISCONCEPTIONS, ...PROBABILITY_MISCONCEPTIONS, ...POWERS_MISCONCEPTIONS, ...ANGLE_MISCONCEPTIONS, ...TRIANGLE_MISCONCEPTIONS, ...TRANSFORMATION_MISCONCEPTIONS, ...CALCULATION_MISCONCEPTIONS, ...VECTOR_MISCONCEPTIONS, ...GRAPH_MISCONCEPTIONS, ...SEQUENCE_MISCONCEPTIONS };
export const LESSONS = { ...FRACTION_LESSONS, ...AREA_LESSONS, ...MEASURES_LESSONS, ...ALGEBRA_LESSONS, ...EXPRESSION_LESSONS, ...EQUATION_LESSONS, ...RATIO_LESSONS, ...DECIMAL_LESSONS, ...PERCENT_LESSONS, ...FACTOR_LESSONS, ...STATS_LESSONS, ...PROBABILITY_LESSONS, ...POWERS_LESSONS, ...ANGLE_LESSONS, ...TRIANGLE_LESSONS, ...TRANSFORMATION_LESSONS, ...CALCULATION_LESSONS, ...VECTOR_LESSONS, ...GRAPH_LESSONS, ...SEQUENCE_LESSONS };

export const CHAINS = [
  {
    id: "area",
    subject: "Maths",
    strand: "Geometry",
    name: "Perimeter and area",
    skillIds: [...PERIMETER_SKILLS, ...AREA_SKILLS].map((s) => s.id),
  },
  { id: "angles", subject: "Maths", strand: "Geometry", name: "Angles and shapes", skillIds: ANGLE_SKILLS.map((s) => s.id) },
  { id: "transformations", subject: "Maths", strand: "Geometry", name: "Transformations", skillIds: TRANSFORMATION_SKILLS.map((s) => s.id) },
  { id: "trigonometry", subject: "Maths", strand: "Geometry", name: "Pythagoras and trigonometry", skillIds: TRIG_SKILLS.map((s) => s.id) },
  { id: "congruence-similarity", subject: "Maths", strand: "Geometry", name: "Congruence and similarity", skillIds: SHAPE_PROOF_SKILLS.map((s) => s.id) },
  { id: "vectors", subject: "Maths", strand: "Geometry", name: "Vectors", skillIds: VECTOR_SKILLS.map((s) => s.id) },
  { id: "circles", subject: "Maths", strand: "Geometry", name: "Circles", skillIds: CIRCLE_SKILLS.map((s) => s.id) },
  { id: "volume", subject: "Maths", strand: "Geometry", name: "Volume and surface area", skillIds: VOLUME_SKILLS.map((s) => s.id) },
  { id: "fractions", subject: "Maths", strand: "Number", name: "Fractions", skillIds: FRACTION_SKILLS.map((s) => s.id) },
  { id: "algebra", subject: "Maths", strand: "Algebra", name: "Starting algebra", skillIds: ALGEBRA_SKILLS.map((s) => s.id) },
  { id: "expressions", subject: "Maths", strand: "Algebra", name: "Expressions and brackets", skillIds: EXPRESSION_SKILLS.map((s) => s.id) },
  { id: "equations", subject: "Maths", strand: "Algebra", name: "Equations and inequalities", skillIds: EQUATION_SKILLS.map((s) => s.id) },
  { id: "ratio", subject: "Maths", strand: "Ratio", name: "Ratio and proportion", skillIds: RATIO_SKILLS.map((s) => s.id) },
  { id: "factors", subject: "Maths", strand: "Number", name: "Factors and primes", skillIds: [...FACTOR_SKILLS, ...LISTING_SKILLS].map((s) => s.id) },
  { id: "decimals", subject: "Maths", strand: "Number", name: "Decimals and rounding", skillIds: DECIMAL_SKILLS.map((s) => s.id) },
  { id: "calculation", subject: "Maths", strand: "Number", name: "Ordering, multiplying and dividing", skillIds: CALCULATION_SKILLS.map((s) => s.id) },
  { id: "estimation", subject: "Maths", strand: "Number", name: "Estimation and accuracy", skillIds: ESTIMATION_SKILLS.map((s) => s.id) },
  { id: "units-time-money", subject: "Maths", strand: "Number", name: "Units, time and money", skillIds: MEASURES_MONEY_SKILLS.map((s) => s.id) },
  { id: "percentages", subject: "Maths", strand: "Number", name: "Percentages", skillIds: PERCENT_SKILLS.map((s) => s.id) },
  { id: "statistics", subject: "Maths", strand: "Statistics", name: "Statistics", skillIds: STATS_SKILLS.map((s) => s.id) },
  { id: "probability", subject: "Maths", strand: "Probability", name: "Probability", skillIds: PROBABILITY_SKILLS.map((s) => s.id) },
  { id: "powers", subject: "Maths", strand: "Number", name: "Negatives, powers and BIDMAS", skillIds: [...POWERS_SKILLS, ...SF_CALC_SKILLS].map((s) => s.id) },
  { id: "sequences", subject: "Maths", strand: "Algebra", name: "Sequences", skillIds: SEQUENCE_SKILLS.map((s) => s.id) },
  { id: "graphs", subject: "Maths", strand: "Algebra", name: "Coordinates and graphs", skillIds: GRAPH_SKILLS.map((s) => s.id) },
];
