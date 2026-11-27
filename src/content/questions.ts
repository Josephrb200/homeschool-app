/** One place to build any question, from any chain, by skill or by id. */
import { rng } from "@/engine/random";
import type { Question, SkillId } from "@/engine/types";
import { GENERATORS as FRACTION_GENERATORS } from "./maths/fractions/generators";
import { AREA_GENERATORS } from "./maths/area/generators";
import { RATIO_GENERATORS } from "./maths/ratio/generators";
import { ALGEBRA_GENERATORS } from "./maths/algebra/generators";

/** Difficulty within a skill: 1 = guided practice, 2 = independent/check. */
export type Tier = 1 | 2;

const GENERATORS = { ...FRACTION_GENERATORS, ...AREA_GENERATORS, ...ALGEBRA_GENERATORS, ...RATIO_GENERATORS };

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
