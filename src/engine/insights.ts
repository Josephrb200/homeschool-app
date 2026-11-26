/**
 * Parent insights: plain-English sentences built only from the learning record.
 *
 * Every sentence names its evidence (counts, dates). If there is no evidence,
 * there is no sentence. Nothing here is invented or estimated.
 */

import { diagnose, misconceptionCounts } from "./diagnosis";
import { computeMastery, fmtDate } from "./mastery";
import { recommend } from "./recommend";
import type { AttemptEvent, LearningEvent, Misconception, Skill } from "./types";
import { MASTERY_LABELS, levelRank } from "./types";

export interface Insight {
  tone: "strength" | "support" | "next" | "activity";
  text: string;
}

export interface ContentBreakdown {
  introduced: string[];
  practised: string[];
  assessed: string[];
  demonstrated: string[];
  retained: string[];
}

const DAY = 24 * 60 * 60 * 1000;

export function parentInsights(
  childName: string,
  skills: Skill[],
  events: LearningEvent[],
  misconceptions: Record<string, Misconception>,
  now: Date,
): Insight[] {
  const out: Insight[] = [];
  const byId = Object.fromEntries(skills.map((s) => [s.id, s]));
  const states = skills.map((s) => ({ s, m: computeMastery(s.id, events) }));

  // Activity this week
  const weekAgo = new Date(now.getTime() - 7 * DAY);
  const week = events.filter((e): e is AttemptEvent => e.type === "attempt" && e.at >= weekAgo);
  if (week.length) {
    const days = new Set(week.map((e) => e.at.toDateString())).size;
    const unaided = week.filter((e) => e.mode !== "guided" && !e.assisted);
    const right = unaided.filter((e) => e.correct).length;
    out.push({
      tone: "activity",
      text: `This week ${childName} answered ${week.length} questions on ${days} ${days === 1 ? "day" : "days"}. ${right} of ${unaided.length} answered without help were correct.`,
    });
  } else {
    out.push({ tone: "activity", text: `${childName} hasn't answered any questions in the last 7 days.` });
  }

  // Strengths: highest levels, with the reason
  for (const { s, m } of states) {
    if (levelRank(m.level) >= levelRank("demonstrated")) {
      out.push({ tone: "strength", text: `${s.name}: ${MASTERY_LABELS[m.level].toLowerCase()}. ${m.reason}` });
    }
  }

  // Support: gaps with misconception evidence
  for (const { s, m } of states) {
    if (levelRank(m.level) >= levelRank("secure")) continue;
    const gap = diagnose(s, events, byId, misconceptions);
    if (gap) {
      const next =
        gap.kind === "prerequisite"
          ? ` We recommend a quick check on ${byId[gap.suspect].name.toLowerCase()} before going further.`
          : ` We recommend going back over the teaching for this skill and the worked examples.`;
      out.push({ tone: "support", text: `Finding ${s.name.toLowerCase()} hard. ${gap.reason}${next}` });
    } else if (m.droppedAt) {
      out.push({ tone: "support", text: `${s.name} moved back to Developing on ${fmtDate(m.droppedAt)} after a review answer was wrong. It will be checked again.` });
    } else {
      const { counts, totalWrong } = misconceptionCounts(s.id, events);
      const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
      if (top && top[1] >= 2) {
        out.push({
          tone: "support",
          text: `In ${s.name.toLowerCase()}, ${top[1]} of the last ${totalWrong} mistakes were "${misconceptions[top[0]]?.label.toLowerCase()}".`,
        });
      }
    }
  }

  // Next: the top recommendation
  const [rec] = recommend(skills, events, misconceptions, now, 1);
  if (rec) out.push({ tone: "next", text: `Suggested next: ${rec.title}. ${rec.reason}` });

  return out;
}

/**
 * The breakdown the brief asks reports to show. Each list is skill names.
 * A skill appears in every category it has reached.
 */
export function contentBreakdown(skills: Skill[], events: LearningEvent[]): ContentBreakdown {
  const b: ContentBreakdown = { introduced: [], practised: [], assessed: [], demonstrated: [], retained: [] };
  for (const s of skills) {
    const m = computeMastery(s.id, events);
    const mine = events.filter((e) => e.skillId === s.id);
    if (levelRank(m.level) >= levelRank("introduced")) b.introduced.push(s.name);
    if (mine.some((e) => e.type === "attempt")) b.practised.push(s.name);
    if (mine.some((e) => e.type === "attempt" && e.mode === "check")) b.assessed.push(s.name);
    if (levelRank(m.level) >= levelRank("demonstrated")) b.demonstrated.push(s.name);
    if (m.level === "retained") b.retained.push(s.name);
  }
  return b;
}
