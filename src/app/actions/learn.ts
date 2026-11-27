"use server";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { getViewer } from "@/lib/learner";
import { LESSONS, MISCONCEPTIONS, SKILL_BY_ID } from "@/content";
import { makeQuestion, questionFromId, type Tier } from "@/content/questions";
import { answerText, markAnswer } from "@/engine/marking";
import { newSeed } from "@/engine/random";
import type { Question } from "@/engine/types";

/** What the browser is allowed to see before answering: no answer, no solution. */
export interface PublicQuestion {
  id: string;
  skillId: string;
  prompt: string;
  visual?: Question["visual"];
  hints: string[];
  /** Tells the app which answer box to show. Never includes the answer. */
  format: { kind: "typed" } | { kind: "decimal"; dp: number } | { kind: "choice"; options: string[] };
}

async function requireStudent() {
  const v = await getViewer();
  if (!v || v.role !== "student") throw new Error("Only a signed-in student can do this.");
  return v;
}

function publicPart(q: Question): PublicQuestion {
  const format: PublicQuestion["format"] =
    q.answer.kind === "choice"
      ? { kind: "choice", options: q.answer.options }
      : q.answer.kind === "decimal"
        ? { kind: "decimal", dp: q.answer.dp }
        : { kind: "typed" };
  return { id: q.id, skillId: q.skillId, prompt: q.prompt, visual: q.visual, hints: q.hints, format };
}

export async function nextQuestion(skillId: string, tier: Tier): Promise<PublicQuestion> {
  await requireStudent();
  if (!SKILL_BY_ID[skillId]) throw new Error("Unknown skill");
  return publicPart(makeQuestion(skillId, tier === 1 ? 1 : 2, newSeed()));
}

export async function newCheckId(): Promise<string> {
  await requireStudent();
  return randomUUID();
}

const AnswerInput = z.object({
  questionId: z.string().max(80),
  answer: z.string().max(200),
  mode: z.enum(["guided", "independent", "check", "review"]),
  hintsUsed: z.number().int().min(0).max(10),
  sawSolution: z.boolean(),
  checkId: z.string().uuid().optional(),
  durationMs: z.number().int().min(0).max(3600000).optional(),
});

export interface AnswerResult {
  outcome: "correct" | "not-simplified" | "incorrect" | "unreadable";
  correct: boolean;
  feedback: string;
  misconceptionLabel?: string;
  /** Revealed after the answer is recorded (not during a check, until it ends). */
  correctAnswer?: string;
  solution?: string[];
  saved: boolean;
}

/**
 * Marks an answer on the server (so the record can be trusted) and appends it
 * to the learning record. Unreadable input is not recorded: the student just
 * gets help with the format.
 */
export async function submitAnswer(input: z.infer<typeof AnswerInput>): Promise<AnswerResult> {
  const v = await requireStudent();
  const a = AnswerInput.parse(input);
  const q = questionFromId(a.questionId);
  if (!SKILL_BY_ID[q.skillId]) throw new Error("Unknown skill");
  const mark = markAnswer(q, a.answer, MISCONCEPTIONS);
  if (mark.outcome === "unreadable") {
    return { outcome: mark.outcome, correct: false, feedback: mark.feedback, saved: false };
  }
  const assisted = a.sawSolution || a.hintsUsed > 0;
  const supabase = await supabaseServer();
  const { error } = await supabase.from("learning_events").insert({
    student_id: v.id,
    skill_id: q.skillId,
    kind: "attempt",
    mode: a.mode,
    question_id: q.id,
    answer: a.answer.trim().slice(0, 200),
    outcome: mark.outcome,
    correct: mark.correct,
    assisted,
    hints_used: a.hintsUsed,
    misconception: mark.misconception ?? null,
    check_id: a.mode === "check" ? a.checkId ?? null : null,
    duration_ms: a.durationMs ?? null,
  });
  return {
    outcome: mark.outcome,
    correct: mark.correct,
    feedback: mark.feedback,
    misconceptionLabel: mark.misconception ? MISCONCEPTIONS[mark.misconception]?.label : undefined,
    correctAnswer: a.mode === "check" ? undefined : answerText(q),
    solution: a.mode === "check" ? undefined : q.solution,
    saved: !error,
  };
}

/** Worked solution on request. The client marks the attempt as assisted. */
export async function revealSolution(questionId: string): Promise<{ solution: string[]; answer: string }> {
  await requireStudent();
  const q = questionFromId(questionId);
  const answer = answerText(q);
  return { solution: q.solution, answer };
}

/** After a check, show each question with its answer and solution. */
export async function checkReview(questionIds: string[]) {
  await requireStudent();
  return questionIds.slice(0, 10).map((id) => {
    const q = questionFromId(id);
    const answer = answerText(q);
    return { id, prompt: q.prompt, answer, solution: q.solution };
  });
}

const Stage = z.enum(["introduction", "teaching", "guided", "independent", "check", "review"]);

export async function recordLesson(skillId: string, stage: z.infer<typeof Stage>, action: "viewed" | "completed") {
  const v = await requireStudent();
  if (!LESSONS[skillId]) throw new Error("Unknown lesson");
  const supabase = await supabaseServer();
  await supabase.from("learning_events").insert({
    student_id: v.id,
    skill_id: skillId,
    kind: "lesson",
    stage: Stage.parse(stage),
    action,
  });
  await supabase
    .from("lesson_progress")
    .upsert({ student_id: v.id, skill_id: skillId, stage, updated_at: new Date().toISOString() });
}

/** Current level and next suggestion for one skill, recalculated from the record. */
export async function skillStatus(skillId: string) {
  const v = await requireStudent();
  const { loadEvents } = await import("@/lib/learner");
  const { computeMastery } = await import("@/engine/mastery");
  const { recommend } = await import("@/engine/recommend");
  const { SKILLS } = await import("@/content");
  const { events } = await loadEvents(v.id);
  const m = computeMastery(skillId, events);
  const [next] = recommend(SKILLS, events, MISCONCEPTIONS, new Date(), 1);
  return { level: m.level, reason: m.reason, next: next ?? null };
}
