/**
 * Recommendations: what to do next, always with a reason.
 *
 * Order: reviews that are due, then knowledge gaps, then work in progress,
 * then the next skill whose prerequisites have all been demonstrated. The student can
 * always choose something else; this is a suggestion, not a lock.
 */

import { diagnose } from "./diagnosis";
import { computeMastery } from "./mastery";
import { dueReviews } from "./scheduler";
import type { LearningEvent, Misconception, Skill, SkillId } from "./types";
import { levelRank } from "./types";

export type RecKind = "review" | "gap-check" | "continue" | "start";

export interface Recommendation {
  kind: RecKind;
  skillId: SkillId;
  title: string;
  reason: string;
}

export function recommend(
  skills: Skill[],
  events: LearningEvent[],
  misconceptions: Record<string, Misconception>,
  now: Date,
  limit = 4,
): Recommendation[] {
  const byId = Object.fromEntries(skills.map((s) => [s.id, s]));
  const recs: Recommendation[] = [];
  const add = (r: Recommendation) => {
    if (!recs.some((x) => x.skillId === r.skillId)) recs.push(r);
  };

  for (const r of dueReviews(skills.map((s) => s.id), events, now)) {
    const s = byId[r.skillId];
    add({
      kind: "review",
      skillId: s.id,
      title: `Review: ${s.name}`,
      reason: r.lastReviewed
        ? `Due for review. It's been a while since ${r.reviewsDone === 1 ? "the last review" : "you last reviewed it"}, and checking now helps it stick.`
        : `Due for its first review since you passed the check. A quick recap helps it stick.`,
    });
  }

  for (const s of skills) {
    const lvl = computeMastery(s.id, events).level;
    if (levelRank(lvl) >= levelRank("secure")) continue;
    const gap = diagnose(s, events, byId, misconceptions);
    if (gap && gap.kind === "prerequisite") {
      add({
        kind: "gap-check",
        skillId: gap.suspect,
        title: `Quick check: ${byId[gap.suspect].name}`,
        reason: gap.reason,
      });
    }
  }

  for (const s of skills) {
    const lvl = computeMastery(s.id, events).level;
    if (levelRank(lvl) >= levelRank("introduced") && levelRank(lvl) < levelRank("demonstrated")) {
      add({ kind: "continue", skillId: s.id, title: `Carry on: ${s.name}`, reason: `You've started this. Next step: pass the skill check.` });
    }
  }

  for (const s of skills) {
    const lvl = computeMastery(s.id, events).level;
    if (lvl !== "not-started") continue;
    // Unlock once every prerequisite has been demonstrated (passed its check).
    // Waiting for Secure would mean waiting a day; reviews keep checking the earlier skills.
    const ready = s.prerequisites.every((p) => levelRank(computeMastery(p, events).level) >= levelRank("demonstrated"));
    if (ready) {
      add({
        kind: "start",
        skillId: s.id,
        title: `Start: ${s.name}`,
        reason:
          s.prerequisites.length === 0
            ? `This is the first skill in the chain.`
            : `You've shown you understand ${s.prerequisites.map((p) => byId[p].name.toLowerCase()).join(" and ")}, which this builds on.`,
      });
    }
  }

  return recs.slice(0, limit);
}
