"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getViewer, loadEvents } from "@/lib/learner";
import { studentEmail } from "@/lib/env";
import type { FormState } from "./auth";

async function requireParent() {
  const v = await getViewer();
  if (!v || v.role !== "parent") throw new Error("Only a signed-in parent can do this.");
  return v;
}

/** Confirms, under the parent's own permissions, that this child is theirs. */
async function requireMyChild(studentId: string) {
  const v = await requireParent();
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("guardian_links")
    .select("student_id")
    .eq("guardian_id", v.id)
    .eq("student_id", studentId)
    .maybeSingle();
  if (!data) throw new Error("That child isn't linked to your account.");
  return v;
}

const NewChild = z.object({
  displayName: z.string().trim().min(1, "Enter the child's first name.").max(40),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{3,24}$/, "Usernames use 3 to 24 lowercase letters, numbers or underscores."),
  password: z.string().min(8, "Use at least 8 characters for the child's password."),
});

export async function createChild(_: FormState, form: FormData): Promise<FormState> {
  const parent = await requireParent();
  const parsed = NewChild.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { displayName, username, password } = parsed.data;
  const admin = supabaseAdmin();

  const { data: taken } = await admin.from("students").select("id").eq("username", username).maybeSingle();
  if (taken) return { error: "That username is taken. Try adding a number." };

  // Only first name and a username: no email, birthday or school details are collected.
  const { data: created, error } = await admin.auth.admin.createUser({
    email: studentEmail(username),
    password,
    email_confirm: true,
    app_metadata: { role: "student" },
    user_metadata: { display_name: displayName },
  });
  if (error || !created.user) return { error: `Couldn't create the account: ${error?.message ?? "unknown error"}` };

  const id = created.user.id;
  const s = await admin.from("students").insert({ id, username, created_by: parent.id });
  const l = await admin.from("guardian_links").insert({ guardian_id: parent.id, student_id: id });
  if (s.error || l.error) {
    await admin.auth.admin.deleteUser(id); // don't leave half-made accounts
    return { error: "Couldn't finish setting up the account. Nothing was saved; please try again." };
  }
  revalidatePath("/parent");
  return { message: `${displayName} can now log in with the username "${username}".` };
}

export async function resetChildPassword(_: FormState, form: FormData): Promise<FormState> {
  const studentId = String(form.get("studentId"));
  await requireMyChild(studentId);
  const password = String(form.get("password") ?? "");
  if (password.length < 8) return { error: "Use at least 8 characters." };
  const { error } = await supabaseAdmin().auth.admin.updateUserById(studentId, { password });
  if (error) return { error: error.message };
  return { message: "Password changed. Your child can log in with the new one now." };
}

export async function deleteChild(_: FormState, form: FormData): Promise<FormState> {
  const studentId = String(form.get("studentId"));
  await requireMyChild(studentId);
  const supabase = await supabaseServer();
  const { data: s } = await supabase.from("students").select("username").eq("id", studentId).single();
  if (String(form.get("confirm") ?? "").trim().toLowerCase() !== s?.username) {
    return { error: `Type the username "${s?.username}" to confirm.` };
  }
  // Deleting the auth user cascades to the profile, the learning record, goals and settings.
  const { error } = await supabaseAdmin().auth.admin.deleteUser(studentId);
  if (error) return { error: error.message };
  revalidatePath("/parent");
  redirect("/parent?deleted=1");
}

/** Everything held about a child, as JSON (UK GDPR right of access / portability). */
export async function exportChildData(studentId: string) {
  await requireMyChild(studentId);
  const supabase = await supabaseServer();
  const [profile, student, prefs, goals, progress, events] = await Promise.all([
    supabase.from("profiles").select("display_name, created_at").eq("id", studentId).single(),
    supabase.from("students").select("username, created_at").eq("id", studentId).single(),
    supabase.from("accessibility_prefs").select("prefs, updated_at").eq("user_id", studentId).maybeSingle(),
    supabase.from("goals").select("week_start, text, done, created_at").eq("student_id", studentId),
    supabase.from("lesson_progress").select("skill_id, stage, updated_at").eq("student_id", studentId),
    loadEvents(studentId),
  ]);
  return {
    exportedAt: new Date().toISOString(),
    profile: profile.data,
    account: student.data,
    settings: prefs.data,
    goals: goals.data,
    lessonProgress: progress.data,
    learningRecord: events.rows,
  };
}

export async function addGoal(_: FormState, form: FormData): Promise<FormState> {
  const studentId = String(form.get("studentId"));
  const v = await requireMyChild(studentId);
  const text = String(form.get("text") ?? "").trim();
  if (!text || text.length > 200) return { error: "Write a goal of up to 200 characters." };
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("goals")
    .insert({ student_id: studentId, set_by: v.id, week_start: monday.toISOString().slice(0, 10), text });
  if (error) return { error: error.message };
  revalidatePath(`/parent/child/${studentId}`);
  return { message: "Goal added." };
}

export async function setGoalDone(goalId: string, studentId: string, done: boolean) {
  await requireMyChild(studentId);
  const supabase = await supabaseServer();
  await supabase.from("goals").update({ done }).eq("id", goalId);
  revalidatePath(`/parent/child/${studentId}`);
}

export async function removeGoal(goalId: string, studentId: string) {
  await requireMyChild(studentId);
  const supabase = await supabaseServer();
  await supabase.from("goals").delete().eq("id", goalId);
  revalidatePath(`/parent/child/${studentId}`);
}
