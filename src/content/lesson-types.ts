/** Shared lesson shape for every chain. Six stages: Introduction → Teaching → Guided → Independent → Check → Review. */
import type { Fraction } from "@/engine/fraction";
import type { ShapeSpec, SkillId, Visual } from "@/engine/types";

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
  | "compound-split"
  | "perimeter-walk"
  | "circle-parts"
  | "circumference-unroll"
  | "circle-area-rearrange"
  | "cuboid-layers"
  | "prism-slices"
  | "cuboid-net"
  | "fraction-of-whole"
  | "ratio-groups"
  | "ratio-bar-model"
  | "ratio-fraction-link"
  | "recipe-scale"
  | "proportion-graph"
  | "notation-meaning"
  | "like-terms-sort"
  | "substitute-swap"
  | "expand-area"
  | "function-machine"
  | "balance-solve"
  | "vocab-sorter"
  | "factorise-area"
  | "index-laws-expand"
  | "double-grid"
  | "factor-pair-finder"
  | "identity-tester"
  | "place-value-chart"
  | "decimal-columns"
  | "rounding-line"
  | "hundred-grid"
  | "percent-bar"
  | "percent-change"
  | "factor-rectangles"
  | "factor-tree"
  | "prime-venn"
  | "percent-of-whole"
  | "percent-change-find"
  | "tally-counter"
  | "bar-pictogram"
  | "pie-builder"
  | "averages-explorer"
  | "freq-table-expand"
  | "scatter-correlation"
  | "probability-scale"
  | "counter-bag"
  | "probability-bar"
  | "experiment-trials"
  | "sample-space-grid"
  | "venn-sort"
  | "number-line-negatives"
  | "square-cube-builder"
  | "bidmas-steps"
  | "index-expand"
  | "standard-form-slider"
  | "angle-turn"
  | "angle-facts-explore"
  | "shape-sorter"
  | "triangle-sum"
  | "parallel-lines"
  | "polygon-split"
  | "reflect-explore"
  | "rotate-explore"
  | "translate-explore"
  | "enlarge-explore"
  | "describe-sort"
  | "pythagoras-squares"
  | "trig-ratio-explore"
  | "trig-angle-finder"
  | "exact-trig-triangles"
  | "congruence-tests"
  | "similar-scale"
  | "decimal-compare"
  | "grid-multiply"
  | "bus-stop-division"
  | "time-number-line"
  | "unit-staircase"
  | "estimate-compare"
  | "error-interval-line"
  | "listing-grid"
  | "sf-multiply"
  | "map-scale"
  | "pay-rate"
  | "inverse-workers"
  | "interest-simple"
  | "reverse-percent-bar"
  | "interest-compound"
  | "speed-journey"
  | "dt-graph-builder"
  | "density-blocks"
  | "unit-rate-convert";

export type ContentStatus = "draft" | "in-review" | "verified";

export interface WorkedExample {
  question: string;
  steps: string[];
  /** Optional diagram shown with the question. */
  shape?: ShapeSpec;
  /** Or any other picture: a circle or a 3D solid. */
  visual?: Visual;
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
