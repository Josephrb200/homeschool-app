import "server-only";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import type { LearningEvent } from "@/engine/types";

export type Role = "parent" | "student" | "editor";
export interface Viewer {
  id: string;
  role: Role;
  displayName: string;
}

/** The signed-in person, or null. */
export async function getViewer(): Promise<Viewer | null> {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("role, display_name").eq("id", user.id).single();
  if (!data) return null;
  return { id: user.id, role: data.role as Role, displayName: data.display_name };
}

export async function requireRole(role: Role): Promise<Viewer> {
  const v = await getViewer();
  if (!v) redirect("/login");
  if (v.role !== role) redirect(v.role === "parent" ? "/parent" : "/learn");
  return v;
}

interface EventRow {
  at: string;
  skill_id: string;
  kind: "attempt" | "lesson";
  mode: "guided" | "independent" | "check" | "review" | null;
  question_id: string | null;
  correct: boolean | null;
  assisted: boolean | null;
  hints_used: number | null;
  misconception: string | null;
  check_id: string | null;
  stage: string | null;
  action: string | null;
  answer?: string | null;
  outcome?: string | null;
}

export function toEvent(r: EventRow): LearningEvent {
  if (r.kind === "lesson") {
    return {
      type: "lesson",
      at: new Date(r.at),
      skillId: r.skill_id,
      stage: r.stage as never,
      action: r.action as "viewed" | "completed",
    };
  }
  return {
    type: "attempt",
    at: new Date(r.at),
    skillId: r.skill_id,
    questionId: r.question_id ?? "",
    mode: r.mode ?? "independent",
    correct: !!r.correct,
    assisted: !!r.assisted,
    hintsUsed: r.hints_used ?? 0,
    misconception: r.misconception ?? undefined,
    checkId: r.check_id ?? undefined,
  };
}

const COLUMNS =
  "at, skill_id, kind, mode, question_id, correct, assisted, hints_used, misconception, check_id, stage, action, answer, outcome";

/** The whole learning record for one student. RLS limits this to the student or their guardians. */
export async function loadEvents(studentId: string) {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("learning_events")
    .select(COLUMNS)
    .eq("student_id", studentId)
    .order("at", { ascending: true })
    .limit(20000);
  if (error) throw new Error(`Couldn't load the learning record: ${error.message}`);
  const rows = (data ?? []) as EventRow[];
  return { events: rows.map(toEvent), rows };
}
