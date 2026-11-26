import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";

/** Refreshes the session cookie on every request and guards signed-in areas. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!env.configured()) return response; // setup page explains what's missing
  const url = env.supabaseUrl();
  const key = env.supabaseAnonKey();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const guarded = ["/learn", "/parent", "/settings"].some((p) => path === p || path.startsWith(p + "/"));
  if (guarded && !user) {
    const to = request.nextUrl.clone();
    to.pathname = "/login";
    to.searchParams.set("next", path);
    return NextResponse.redirect(to);
  }
  return response;
}
