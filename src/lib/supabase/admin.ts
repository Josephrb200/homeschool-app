import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Service-role client. Bypasses row-level security, so it is used ONLY for
 * actions the server has already authorised: creating a child account for a
 * verified parent, resetting a child's password, deleting a child's account.
 * Never import this from a client component.
 */
export function supabaseAdmin() {
  return createClient(env.supabaseUrl(), env.supabaseServiceKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
