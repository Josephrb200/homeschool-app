/** Shared lesson shape for every chain. Six stages: Introduction → Teaching → Guided → Independent → Check → Review. */
import type { Fraction } from "@/engine/fraction";
import type { ShapeSpec, SkillId } from "@/engine/types";

export type DemoKind =
  | "equivalent-bars"
  | "simplify-bars"
  | "common-denominator-bars"
  | "add-bars"
  | "amount-bar"
  | "multiply-grid"
  | "mixed-number-bars"
  | "rectangle-grid"
  | "triangle-half"
  | "parallelogram-shear"
  | "trapezium-double"
  | "compound-split";

export type ContentStatus = "draft" | "in-review" | "verified";

export interface WorkedExample {
  question: string;
  steps: string[];
  /** Optional diagram shown with the question. */
  shape?: ShapeSpec;
  /** Optional fraction bars shown with the question (improper fractions draw as several bars). */
  bars?: Fraction[];
}

export interface Lesson {
  skillId: SkillId;
  status: ContentStatus;
  /** Approximate minutes for the whole lesson, shown so students can plan. */
  minutes: number;
  intro: {
    whyItMatters: string;
    byTheEnd: string[];
  };
  teaching: {
    paragraphs: string[];
    /** Which interactive demonstration to show. */
    demo: DemoKind;
    examples: WorkedExample[];
  };
  /** Number of questions in each practice stage. */
  counts: { guided: number; independent: number; check: 5 };
}

export const STAGES = ["introduction", "teaching", "guided", "independent", "check", "review"] as const;
export type Stage = (typeof STAGES)[number];
export const STAGE_LABELS: Record<Stage, string> = {
  introduction: "Introduction",
  teaching: "Teaching",
  guided: "Guided practice",
  independent: "On your own",
  check: "Skill check",
  review: "Review",
};
