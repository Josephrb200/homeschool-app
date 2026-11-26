/**
 * Accessibility and presentation preferences. Anyone can choose any of these;
 * none of them asks about, or implies, a diagnosis.
 */
import { z } from "zod";

export const PrefsSchema = z.object({
  font: z.enum(["lexend", "atkinson", "opendyslexic", "system"]).default("lexend"),
  textSize: z.number().int().min(90).max(175).default(100),
  lineSpacing: z.enum(["normal", "relaxed", "loose"]).default("relaxed"),
  letterSpacing: z.enum(["normal", "wide", "wider"]).default("normal"),
  theme: z.enum(["calm", "cream", "blue", "green", "peach", "dark", "contrast"]).default("calm"),
  reduceMotion: z.boolean().default(false),
  simplified: z.boolean().default(false),
  readAloudRate: z.number().min(0.6).max(1.4).default(0.95),
  autoReadQuestions: z.boolean().default(false),
  feedbackStyle: z.enum(["brief", "explained"]).default("explained"),
  showSolutionAfterMiss: z.boolean().default(false),
});

export type Prefs = z.infer<typeof PrefsSchema>;
export const DEFAULT_PREFS: Prefs = PrefsSchema.parse({});

export function parsePrefs(raw: unknown): Prefs {
  const r = PrefsSchema.safeParse(raw ?? {});
  return r.success ? r.data : DEFAULT_PREFS;
}

/** Attributes put on <html> so CSS can apply the preferences everywhere. */
export function prefsToHtmlAttrs(p: Prefs): Record<string, string> {
  return {
    "data-font": p.font,
    "data-theme-choice": p.theme,
    "data-line": p.lineSpacing,
    "data-letter": p.letterSpacing,
    "data-motion": p.reduceMotion ? "reduce" : "normal",
    "data-simplified": p.simplified ? "on" : "off",
  };
}
