/** One place to build any question, from any chain, by skill or by id. */
import { rng } from "@/engine/random";
import type { Question, SkillId } from "@/engine/types";
import { GENERATORS as FRACTION_GENERATORS } from "./maths/fractions/generators";
import { AREA_GENERATORS } from "./maths/area/generators";
import { MEASURES_GENERATORS } from "./maths/measures/generators";
import { RATIO_GENERATORS } from "./maths/ratio/generators";
import { ALGEBRA_GENERATORS } from "./maths/algebra/generators";
import { EXPRESSION_GENERATORS } from "./maths/expressions/generators";
import { EQUATION_GENERATORS } from "./maths/equations/generators";
import { DECIMAL_GENERATORS } from "./maths/decimals/generators";
import { PERCENT_GENERATORS } from "./maths/percentages/generators";
import { ANGLE_GENERATORS } from "./maths/angles/generators";
import { PROBABILITY_GENERATORS } from "./maths/probability/generators";
import { PERCENT_COMPARE_GENERATORS } from "./maths/percentages/compare-generators";
import { FACTOR_GENERATORS } from "./maths/factors/generators";
import { STATS_GENERATORS } from "./maths/statistics/generators";
import { POWERS_GENERATORS } from "./maths/powers/generators";
import { TRANSFORMATION_GENERATORS } from "./maths/transformations/generators";
import { BEARING_GENERATORS } from "./maths/bearings/generators";
import { SOLID_GENERATORS } from "./maths/solids/generators";
import { TRIANGLE_GENERATORS } from "./maths/triangles/generators";
import { VECTOR_GENERATORS } from "./maths/vectors/generators";
import { CALCULATION_GENERATORS } from "./maths/calculation/generators";
import { GRAPH_GENERATORS } from "./maths/graphs/generators";
import { SEQUENCE_GENERATORS } from "./maths/sequences/generators";

/** Difficulty within a skill: 1 = guided practice, 2 = independent/check. */
export type Tier = 1 | 2;

const GENERATORS = { ...FRACTION_GENERATORS, ...AREA_GENERATORS, ...MEASURES_GENERATORS, ...ALGEBRA_GENERATORS, ...EXPRESSION_GENERATORS, ...EQUATION_GENERATORS, ...RATIO_GENERATORS, ...DECIMAL_GENERATORS, ...PERCENT_GENERATORS, ...PERCENT_COMPARE_GENERATORS, ...FACTOR_GENERATORS, ...STATS_GENERATORS, ...PROBABILITY_GENERATORS, ...POWERS_GENERATORS, ...ANGLE_GENERATORS, ...TRIANGLE_GENERATORS, ...TRANSFORMATION_GENERATORS, ...CALCULATION_GENERATORS, ...VECTOR_GENERATORS, ...GRAPH_GENERATORS, ...SEQUENCE_GENERATORS, ...BEARING_GENERATORS, ...SOLID_GENERATORS };

export function hasGenerator(skillId: SkillId): boolean {
  return skillId in GENERATORS;
}

/** Build a question. The id encodes skill, tier and seed so it can be rebuilt exactly. */
export function makeQuestion(skillId: SkillId, tier: Tier, seed: number): Question {
  const gen = GENERATORS[skillId];
  if (!gen) throw new Error(`No generator for skill ${skillId}`);
  return { id: `${skillId}:${tier}:${seed}`, skillId, ...gen(rng(seed), tier) };
}

export function questionFromId(id: string): Question {
  const [skillId, tier, seed] = id.split(":");
  return makeQuestion(skillId, Number(tier) as Tier, Number(seed));
}
