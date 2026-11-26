"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { PrefsSchema, type Prefs } from "@/lib/prefs";

export async function savePrefs(prefs: Prefs): Promise<{ ok: boolean; error?: string }> {
  const parsed = PrefsSchema.safeParse(prefs);
  if (!parsed.success) return { ok: false, error: "Some settings weren't valid." };
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please log in again." };
  const { error } = await supabase
    .from("accessibility_prefs")
    .upsert({ user_id: user.id, prefs: parsed.data, updated_at: new Date().toISOString() });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}
