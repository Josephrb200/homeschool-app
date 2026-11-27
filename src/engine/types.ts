/**
 * Shared types for the learning engine.
 *
 * The engine is pure TypeScript with no database or UI code, so it can be
 * tested on its own and reused by the student app, the parent app and reports.
 */

import type { Fraction } from "./fraction";

export type SkillId = string;
export type MisconceptionId = string;

export interface Skill {
  id: SkillId;
  topic: string;
  name: string;
  /** What the student will be able to do, written for the student. */
  objective: string;
  /** Typical year group. A label, never a gate. */
  typicalYear: number;
  gcseTier?: "foundation" | "higher" | "both";
  prerequisites: SkillId[];
}

export interface Misconception {
  id: MisconceptionId;
  /** Short name shown to parents, e.g. "Added the denominators". */
  label: string;
  /** Explanation shown to the student after a matching wrong answer. */
  explanation: string;
  /** The prerequisite skill this misconception most often points to, if any. */
  pointsTo?: SkillId;
}

export type AnswerSpec =
  | {
      kind: "fraction";
      value: Fraction;
      /** If true, an equivalent but unsimplified answer is marked "not simplified". */
      requireSimplest: boolean;
      /**
       * If set, the right amount typed in another form is marked "not-simplified"
       * with a nudge: "mixed" wants a mixed number like 2 3/4 (or a whole number),
       * "improper" wants a top-heavy fraction like 11/4.
       */
      form?: "mixed" | "improper";
    }
  | { kind: "integer"; value: number }
  /**
   * A rounded answer, e.g. a circle's area to 1 decimal place. `exact` is the
   * true value. Marking accepts the correctly rounded value, and also answers
   * that come from using 3.14 for π (as GCSE mark schemes do).
   */
  | { kind: "decimal"; exact: number; dp: number }
  /**
   * An algebraic expression, compared mathematically (see engine/algebra.ts).
   * `form` says how it must be written to count as fully correct:
   * "notation" = algebra conventions (5n, x²), "simplified" = also expanded and collected.
   */
  | { kind: "expression"; value: string; form: "notation" | "simplified" }
  | { kind: "choice"; options: string[]; correctIndex: number };

export interface Question {
  /** Stable id: skill + generator + seed. Lets us rebuild the exact question later. */
  id: string;
  skillId: SkillId;
  /** Plain text prompt. Fractions written as a/b; the UI renders them stacked. */
  prompt: string;
  /** Optional visual: fraction bars, a labelled shape, a circle or a 3D solid. */
  visual?: Visual;
  answer: AnswerSpec;
  /** Predicted wrong answers mapped to misconceptions (string form, compared exactly after parsing). */
  wrongAnswers: { value: Fraction | number; misconception: MisconceptionId }[];
  /** Predicted wrong expressions (for "expression" answers), compared mathematically. */
  wrongExpressions?: { value: string; misconception: MisconceptionId }[];
  /** How to type the answer, shown under the answer box. Defaults to number help. */
  answerHelp?: string;
  hints: string[];
  solution: string[];
}

/**
 * A labelled 2D shape, in real units with y pointing up. Drawn to scale.
 * Only what is labelled is given to the student; everything else they work out.
 */
export interface ShapeSpec {
  /** Corners in order around the shape. */
  points: [number, number][];
  /** Side labels: the side from points[i] to points[i+1] (wrapping), with its text. */
  sides: { i: number; text: string }[];
  /** Dashed perpendicular heights (always vertical), with a right-angle mark at the foot. */
  heights?: { x: number; y1: number; y2: number; text: string }[];
  /** Corners to mark as right angles (the mark sits inside, toward +x and +y). */
  right?: [number, number][];
  /** Draw 1-unit squares behind the shape, for counting. */
  grid?: boolean;
  /** Words for screen readers, e.g. "A triangle with base 8 cm and perpendicular height 5 cm." */
  description: string;
}

export type Visual =
  | { kind: "bars"; bars: Fraction[] }
  | { kind: "shape"; shape: ShapeSpec }
  | { kind: "circle"; circle: CircleSpec }
  | { kind: "solid"; solid: SolidSpec }
  | { kind: "machine"; machine: MachineSpec };

export type CirclePart = "centre" | "radius" | "diameter" | "chord" | "tangent" | "arc" | "sector" | "segment" | "circumference";

/** A circle with some of its parts drawn. Each part has a fixed place, so parts never overlap. */
export interface CircleSpec {
  /** Parts to draw. `text` labels a length (radius, diameter or chord). */
  parts: { part: CirclePart; text?: string }[];
  /** One part drawn bold in the highlight colour, for "what is this part called?". */
  highlight?: CirclePart;
  description: string;
}

/**
 * A 3D solid drawn in oblique projection, with hidden edges dashed.
 * A prism is its front cross-section (a convex ShapeSpec, real units) pushed back
 * by `length`; a cuboid is a prism with a rectangle face.
 */
export type SolidSpec =
  | {
      kind: "prism";
      face: ShapeSpec;
      length: number;
      lengthText?: string;
      /** Draw unit cubes on the visible faces (cuboids only). */
      cubes?: boolean;
      description: string;
    }
  | {
      kind: "cylinder";
      r: number;
      h: number;
      /** Label the radius or the diameter on the top face. */
      label: { on: "radius" | "diameter"; text: string };
      hText: string;
      description: string;
    };

/** A function machine: input → operations in order → output. "?" marks the unknown. */
export interface MachineSpec {
  input: string;
  /** Operations as shown, e.g. ["× 3", "+ 4"]. */
  steps: string[];
  output: string;
}

export type AttemptMode = "guided" | "independent" | "check" | "review";

export type Outcome = "correct" | "not-simplified" | "incorrect" | "unreadable";

export interface MarkResult {
  outcome: Outcome;
  /** True for "correct"; "not-simplified" counts as correct only if the question allows it. */
  correct: boolean;
  misconception?: MisconceptionId;
  feedback: string;
}

/** One answer, as stored in the learning record. Append-only. */
export interface AttemptEvent {
  type: "attempt";
  at: Date;
  skillId: SkillId;
  questionId: string;
  mode: AttemptMode;
  correct: boolean;
  /** True if a hint or worked solution was shown before this answer. */
  assisted: boolean;
  hintsUsed: number;
  misconception?: MisconceptionId;
  /** Groups the five questions of one skill check. */
  checkId?: string;
}

export interface LessonEvent {
  type: "lesson";
  at: Date;
  skillId: SkillId;
  stage: "introduction" | "teaching" | "guided" | "independent" | "check" | "review";
  action: "viewed" | "completed";
}

export type LearningEvent = AttemptEvent | LessonEvent;

export const MASTERY_LEVELS = [
  "not-started",
  "introduced",
  "practising",
  "developing",
  "demonstrated",
  "secure",
  "retained",
] as const;

export type MasteryLevel = (typeof MASTERY_LEVELS)[number];

export const MASTERY_LABELS: Record<MasteryLevel, string> = {
  "not-started": "Not started",
  introduced: "Introduced",
  practising: "Practising",
  developing: "Developing understanding",
  demonstrated: "Demonstrated understanding",
  secure: "Secure understanding",
  retained: "Retained understanding",
};

export function levelRank(l: MasteryLevel): number {
  return MASTERY_LEVELS.indexOf(l);
}
