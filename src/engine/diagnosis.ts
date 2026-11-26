/**
 * Knowledge-gap diagnosis: when a student keeps getting a skill wrong, find
 * out whether the real problem is an earlier skill.
 *
 * Trigger: 2 or more unaided errors in the last 5 independent answers on a skill.
 * Suspect order:
 *   1. the prerequisite that the student's most common misconception points to
 *   2. any prerequisite that is not yet Secure (in the order listed)
 * If a prerequisite check has since been passed, the gap is in the skill itself.
 */

import { computeMastery } from "./mastery";
import type { AttemptEvent, LearningEvent, Misconception, Skill, SkillId } from "./types";
import { levelRank } from "./types";

export const GAP_RULES = { window: 5, minErrors: 2 } as const;

export interface GapFinding {
  skillId: SkillId;
  /** The skill to check or revisit. Equal to skillId when the gap is in the skill itself. */
  suspect: SkillId;
  kind: "prerequisite" | "within-skill";
  reason: string;
  topMisconception?: { id: string; label: string; count: number; of: number };
}

export function misconceptionCounts(skillId: SkillId, events: LearningEvent[], lastN = 10) {
  const wrong = events
    .filter((e): e is AttemptEvent => e.type === "attempt" && e.skillId === skillId && !e.correct)
    .sort((a, b) => a.at.getTime() - b.at.getTime())
    .slice(-lastN);
  const counts = new Map<string, number>();
  for (const w of wrong) if (w.misconception) counts.set(w.misconception, (counts.get(w.misconception) ?? 0) + 1);
  return { counts, totalWrong: wrong.length };
}

export function diagnose(
  skill: Skill,
  events: LearningEvent[],
  skills: Record<SkillId, Skill>,
  misconceptions: Record<string, Misconception>,
): GapFinding | null {
  const recent = events
    .filter(
      (e): e is AttemptEvent =>
        e.type === "attempt" && e.skillId === skill.id && e.mode !== "guided",
    )
    .sort((a, b) => a.at.getTime() - b.at.getTime())
    .slice(-GAP_RULES.window);

  const errors = recent.filter((a) => !a.correct && !a.assisted);
  if (errors.length < GAP_RULES.minErrors) return null;

  const { counts, totalWrong } = misconceptionCounts(skill.id, events);
  let top: GapFinding["topMisconception"];
  for (const [id, count] of counts) {
    if (!top || count > top.count) top = { id, label: misconceptions[id]?.label ?? id, count, of: totalWrong };
  }

  const lastError = errors[errors.length - 1];

  const passedSince = (prereq: SkillId) =>
    events.some(
      (e) =>
        e.type === "attempt" &&
        e.skillId === prereq &&
        e.mode === "check" &&
        e.correct &&
        e.at > lastError.at,
    ) && levelRank(computeMastery(prereq, events).level) >= levelRank("demonstrated");

  // 1. misconception points to a prerequisite
  const pointed = top ? misconceptions[top.id]?.pointsTo : undefined;
  if (pointed && skill.prerequisites.includes(pointed) && !passedSince(pointed)) {
    return {
      skillId: skill.id,
      suspect: pointed,
      kind: "prerequisite",
      topMisconception: top,
      reason: `${top!.count} of the last ${top!.of} mistakes on ${skill.name.toLowerCase()} were "${top!.label.toLowerCase()}", which usually comes from ${skills[pointed].name.toLowerCase()}.`,
    };
  }

  // 2. a prerequisite that is not yet secure
  for (const p of skill.prerequisites) {
    const lvl = computeMastery(p, events).level;
    if (levelRank(lvl) < levelRank("secure") && !passedSince(p)) {
      return {
        skillId: skill.id,
        suspect: p,
        kind: "prerequisite",
        topMisconception: top,
        reason: `${errors.length} of the last ${recent.length} answers on ${skill.name.toLowerCase()} were wrong, and ${skills[p].name.toLowerCase()} isn't secure yet.`,
      };
    }
  }

  return {
    skillId: skill.id,
    suspect: skill.id,
    kind: "within-skill",
    topMisconception: top,
    reason: `${errors.length} of the last ${recent.length} answers were wrong, but the earlier skills are secure, so the gap is in ${skill.name.toLowerCase()} itself.`,
  };
}
