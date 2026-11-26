import type { Metadata, Viewport } from "next";
import { Lexend, Atkinson_Hyperlegible } from "next/font/google";
import "@fontsource/opendyslexic/400.css";
import "@fontsource/opendyslexic/700.css";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { PrefsProvider } from "@/components/PrefsProvider";
import { BRAND } from "@/lib/brand";
import { DEFAULT_PREFS, parsePrefs, prefsToHtmlAttrs, type Prefs } from "@/lib/prefs";
import { env } from "@/lib/env";
import { getViewer } from "@/lib/learner";
import { supabaseServer } from "@/lib/supabase/server";

const lexend = Lexend({ subsets: ["latin"], variable: "--font-lexend", display: "swap" });
const atkinson = Atkinson_Hyperlegible({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-atkinson", display: "swap" });

export const metadata: Metadata = { title: { default: BRAND.name, template: `%s · ${BRAND.name}` }, description: BRAND.tagline };
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

async function loadPrefs(viewerId?: string): Promise<Prefs> {
  if (!viewerId) return DEFAULT_PREFS;
  const supabase = await supabaseServer();
  const { data } = await supabase.from("accessibility_prefs").select("prefs").eq("user_id", viewerId).maybeSingle();
  return parsePrefs(data?.prefs);
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const viewer = env.configured() ? await getViewer() : null;
  const prefs = await loadPrefs(viewer?.id);
  return (
    <html
      lang="en-GB"
      className={`${lexend.variable} ${atkinson.variable}`}
      style={{ fontSize: `${prefs.textSize}%` }}
      {...prefsToHtmlAttrs(prefs)}
    >
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <PrefsProvider initial={prefs}>
          <SiteHeader viewer={viewer} />
          <main id="main">{children}</main>
        </PrefsProvider>
      </body>
    </html>
  );
}
