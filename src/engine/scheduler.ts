/**
 * Spaced retrieval: decides when each skill should come back for review.
 *
 * Expanding intervals (1, 3, 7, 21, 60 days). A correct, unaided review moves
 * the skill one step further out; a wrong or assisted one sends it back to the
 * first step. Reviews start once a skill is Demonstrated.
 *
 * This is a deliberately simple, explainable starting point. Once there is
 * pilot data it can be replaced by a model fitted to each learner (e.g. FSRS)
 * behind the same function signature.
 */

import { computeMastery } from "./mastery";
import type { LearningEvent, SkillId } from "./types";

export const INTERVALS_DAYS = [1, 3, 7, 21, 60] as const;
const DAY = 24 * 60 * 60 * 1000;

export interface ReviewState {
  skillId: SkillId;
  /** Index into INTERVALS_DAYS. */
  step: number;
  due: Date;
  lastReviewed?: Date;
  reviewsDone: number;
}

export function reviewState(skillId: SkillId, events: LearningEvent[]): ReviewState | null {
  const m = computeMastery(skillId, events);
  // Find when reviews began: the most recent time the skill was demonstrated.
  const start = m.demonstratedAt;
  if (!start) {
    // If it dropped back, keep reviewing from the drop so it isn't forgotten.
    if (!m.droppedAt) return null;
    return { skillId, step: 0, due: new Date(m.droppedAt.getTime() + DAY), reviewsDone: 0, lastReviewed: m.droppedAt };
  }

  let step = 0;
  let due = new Date(start.getTime() + INTERVALS_DAYS[0] * DAY);
  let lastReviewed: Date | undefined;
  let reviewsDone = 0;

  const reviews = events
    .filter((e) => e.type === "attempt" && e.skillId === skillId && e.mode === "review" && e.at > start)
    .sort((a, b) => a.at.getTime() - b.at.getTime());

  for (const r of reviews) {
    if (r.type !== "attempt") continue;
    reviewsDone++;
    lastReviewed = r.at;
    if (r.correct && !r.assisted) step = Math.min(step + 1, INTERVALS_DAYS.length - 1);
    else step = 0;
    due = new Date(r.at.getTime() + INTERVALS_DAYS[step] * DAY);
  }

  return { skillId, step, due, lastReviewed, reviewsDone };
}

export function dueReviews(skillIds: SkillId[], events: LearningEvent[], now: Date): ReviewState[] {
  return skillIds
    .map((id) => reviewState(id, events))
    .filter((s): s is ReviewState => !!s && s.due <= now)
    .sort((a, b) => a.due.getTime() - b.due.getTime());
}
