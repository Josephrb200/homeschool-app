"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { env, studentEmail } from "@/lib/env";

export type FormState = { error?: string; message?: string } | undefined;

const SignUp = z.object({
  displayName: z.string().trim().min(1, "Please enter your name.").max(60),
  email: z.string().trim().email("Please enter a valid email address."),
  password: z.string().min(10, "Use at least 10 characters for your password."),
  consent: z.literal("on", { errorMap: () => ({ message: "Please confirm you've read the privacy notice." }) }),
});

export async function signUpParent(_: FormState, form: FormData): Promise<FormState> {
  const parsed = SignUp.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.displayName },
      emailRedirectTo: `${env.siteUrl()}/auth/callback?next=/parent`,
    },
  });
  if (error) return { error: error.message };
  if (!data.session) return { message: "Check your email for a link to confirm your account, then log in." };
  redirect("/parent");
}

export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  const id = String(form.get("identifier") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "");
  if (!id || !password) return { error: "Enter your email or username, and your password." };
  const email = id.includes("@") ? id : studentEmail(id);
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "That username or password didn't match. Check them and try again." };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  const home = profile?.role === "student" ? "/learn" : "/parent";
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : home);
}

export async function signOut() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordReset(_: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim();
  if (!email.includes("@")) {
    return { error: "Enter the email address of a parent account. Children's passwords are reset by their parent." };
  }
  const supabase = await supabaseServer();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${env.siteUrl()}/auth/callback?next=/update-password`,
  });
  // Same message either way, so the form can't be used to find out who has an account.
  return { message: "If that email has an account, a reset link is on its way." };
}

export async function updatePassword(_: FormState, form: FormData): Promise<FormState> {
  const password = String(form.get("password") ?? "");
  if (password.length < 10) return { error: "Use at least 10 characters." };
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  return { message: "Password changed. You can carry on." };
}
