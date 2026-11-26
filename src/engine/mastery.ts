/**
 * Mastery: works out a skill's level from the learning record.
 *
 * Levels are never stored as the truth. They are recalculated from the
 * attempts, so every level can explain itself and can be re-derived if the
 * rules change. The rules (see the plan doc, section 7):
 *
 *  Not started   no activity
 *  Introduced    has viewed the teaching stage
 *  Practising    has attempted guided questions
 *  Developing    ≥ 3 independent attempts, ≥ half correct without help
 *  Demonstrated  passed a skill check: ≥ 4 of 5 correct, no help
 *  Secure        demonstrated, then ≥ 3 of the last 4 unaided answers correct on later days
 *  Retained      secure, then a correct unaided review ≥ 21 days after becoming secure
 *
 *  A wrong review answer on a Secure or Retained skill drops it to Developing.
 */

import type { AttemptEvent, LearningEvent, MasteryLevel, SkillId } from "./types";
import { levelRank } from "./types";

export const RULES = {
  developingMinAttempts: 3,
  developingMinRatio: 0.5,
  checkSize: 5,
  checkPassMark: 4,
  secureWindow: 4,
  secureMinCorrect: 3,
  retainedAfterDays: 21,
} as const;

const DAY = 24 * 60 * 60 * 1000;

export interface MasteryState {
  skillId: SkillId;
  level: MasteryLevel;
  /** One sentence a parent or student can read. */
  reason: string;
  demonstratedAt?: Date;
  secureAt?: Date;
  retainedAt?: Date;
  /** When the most recent drop happened, if any. */
  droppedAt?: Date;
  stats: {
    independentAttempts: number;
    independentCorrect: number;
    assistedAttempts: number;
    lastActivity?: Date;
  };
}

/** Calendar day in UK time, so "a later day" matches what a family would expect. */
export function ukDay(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: "Europe/London" });
}

export function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Europe/London" });
}

const isUnaided = (a: AttemptEvent) => a.mode !== "guided" && !a.assisted;

export function computeMastery(skillId: SkillId, events: LearningEvent[]): MasteryState {
  const evs = events
    .filter((e) => e.skillId === skillId)
    .sort((a, b) => a.at.getTime() - b.at.getTime());

  let level: MasteryLevel = "not-started";
  let reason = "Not started yet.";
  let demonstratedAt: Date | undefined;
  let secureAt: Date | undefined;
  let retainedAt: Date | undefined;
  let droppedAt: Date | undefined;

  // windows reset when a level drops
  let indepSinceReset: AttemptEvent[] = [];
  let laterDayUnaided: AttemptEvent[] = [];
  const checks = new Map<string, AttemptEvent[]>();

  let independentAttempts = 0;
  let independentCorrect = 0;
  let assistedAttempts = 0;
  let lastActivity: Date | undefined;

  const raise = (to: MasteryLevel, why: string) => {
    if (levelRank(to) > levelRank(level)) {
      level = to;
      reason = why;
    }
  };

  for (const e of evs) {
    lastActivity = e.at;

    if (e.type === "lesson") {
      if (e.stage === "teaching" || e.stage === "introduction") raise("introduced", `Started the lesson on ${fmtDate(e.at)}.`);
      continue;
    }

    // attempt
    if (e.assisted) assistedAttempts++;
    if (e.mode === "guided") {
      raise("practising", `Practising with guidance since ${fmtDate(e.at)}.`);
      continue;
    }

    independentAttempts++;
    if (isUnaided(e) && e.correct) independentCorrect++;
    indepSinceReset.push(e);

    // A wrong review answer on a secure/retained skill drops it back.
    if (e.mode === "review" && !e.correct && levelRank(level) >= levelRank("secure")) {
      level = "developing";
      droppedAt = e.at;
      reason = `Moved back to Developing on ${fmtDate(e.at)}: a review answer was wrong, so it needs checking again.`;
      demonstratedAt = undefined;
      secureAt = undefined;
      retainedAt = undefined;
      indepSinceReset = [];
      laterDayUnaided = [];
      checks.clear();
      continue;
    }

    // Developing: enough independent work, at least half right without help.
    if (levelRank(level) < levelRank("developing")) {
      const n = indepSinceReset.length;
      const c = indepSinceReset.filter((a) => isUnaided(a) && a.correct).length;
      if (n >= RULES.developingMinAttempts && c / n >= RULES.developingMinRatio) {
        raise("developing", `${c} of ${n} independent answers correct without help.`);
      } else if (n >= 1) {
        raise("practising", `Practising: ${c} of ${n} independent answers correct so far.`);
      }
    }

    // Demonstrated: a completed skill check.
    if (e.mode === "check" && e.checkId) {
      const set = checks.get(e.checkId) ?? [];
      set.push(e);
      checks.set(e.checkId, set);
      if (set.length === RULES.checkSize && levelRank(level) < levelRank("demonstrated")) {
        const right = set.filter((a) => a.correct && !a.assisted).length;
        if (right >= RULES.checkPassMark) {
          // Demonstrated outranks Developing: the check is direct evidence.
          level = "demonstrated";
          demonstratedAt = e.at;
          reason = `Passed the skill check on ${fmtDate(e.at)}: ${right} of ${RULES.checkSize} correct without help.`;
          laterDayUnaided = [];
        }
      }
      continue;
    }

    // Secure: consistent unaided success on a later day than the check.
    if (level === "demonstrated" && demonstratedAt && isUnaided(e) && ukDay(e.at) > ukDay(demonstratedAt)) {
      laterDayUnaided.push(e);
      const recent = laterDayUnaided.slice(-RULES.secureWindow);
      const right = recent.filter((a) => a.correct).length;
      if (recent.length >= RULES.secureMinCorrect && right >= RULES.secureMinCorrect) {
        level = "secure";
        secureAt = e.at;
        reason = `Secure: ${right} of ${recent.length} correct without help on ${fmtDate(e.at)}, after passing the check on ${fmtDate(demonstratedAt)}.`;
      }
      continue;
    }

    // Retained: a correct unaided review long enough after becoming secure.
    if (
      level === "secure" &&
      secureAt &&
      e.mode === "review" &&
      e.correct &&
      !e.assisted &&
      e.at.getTime() - secureAt.getTime() >= RULES.retainedAfterDays * DAY
    ) {
      level = "retained";
      retainedAt = e.at;
      const days = Math.round((e.at.getTime() - secureAt.getTime()) / DAY);
      reason = `Retained: answered a review correctly on ${fmtDate(e.at)}, ${days} days after becoming secure.`;
    }
  }

  return {
    skillId,
    level,
    reason,
    demonstratedAt,
    secureAt,
    retainedAt,
    droppedAt,
    stats: { independentAttempts, independentCorrect, assistedAttempts, lastActivity },
  };
}
