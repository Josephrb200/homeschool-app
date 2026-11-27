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
      form?: "mixed" | "improper" | "decimal";
      /**
       * Probability answers: "40%" means 0.4 (not 40), and typing 40 when the
       * answer is 0.4 gets a nudge to add the % sign instead of being marked wrong.
       */
      percentAllowed?: boolean;
    }
  | { kind: "integer"; value: number }
  /** A ratio such as 3:2 or 2:3:5. Any equivalent ratio is accepted unless requireSimplest. */
  | { kind: "ratio"; value: number[]; requireSimplest: boolean }
  /**
   * A rounded answer, e.g. a circle's area to 1 decimal place. `exact` is the
   * true value. Marking accepts the correctly rounded value, and also answers
   * that come from using 3.14 for π (as GCSE mark schemes do).
   */
  | {
      kind: "decimal";
      exact: number;
      dp: number;
      /**
       * Strict rounding only: no extra allowance for π = 3.14. Used where π
       * isn't involved (Pythagoras, trigonometry), so 10.4 isn't accepted for 10.3.
       */
      strict?: boolean;
    }
  /**
   * An algebraic expression, compared mathematically (see engine/algebra.ts).
   * `form` says how it must be written to count as fully correct:
   * "notation" = algebra conventions (5n, x²), "simplified" = also expanded and collected.
   */
  | {
      kind: "expression";
      value: string;
      form: "notation" | "simplified" | "factorised";
      /**
       * The answer is an equation like "y = 3x − 2": `lhs` is "y", `value` the right-hand side.
       * Typing "y =" is expected; leaving it out gets a nudge ("not-simplified").
       */
      lhs?: string;
    }
  /**
   * A coordinate pair (x, y), e.g. (3, −2). Order matters. See engine/point.ts.
   * `vector` marks a column vector instead: feedback says "top number" and "bottom number".
   */
  | { kind: "point"; value: [number, number]; vector?: boolean }
  /**
   * An inequality such as x < 4 or −2 < x ≤ 3 (see engine/equations.ts). Any
   * equivalent way of writing it is accepted (4 > x). The optional
   * misconceptions name the near misses: < for ≤ (or the reverse), the sign
   * pointing the wrong way, and "x = 4" given instead of an inequality.
   */
  | {
      kind: "inequality";
      variable: string;
      value: Interval;
      inclusiveMisconception?: MisconceptionId;
      directionMisconception?: MisconceptionId;
      equalsMisconception?: MisconceptionId;
    }
  /** All the solutions of an equation (a quadratic), in any order: "x = 2 or x = −5". */
  | { kind: "roots"; variable: string; values: number[]; missingMisconception?: MisconceptionId }
  /** One value for each letter, e.g. simultaneous equations: { x: 3, y: −2 }. `wrongAnswers` lists values in letter order. */
  | { kind: "assignment"; values: Record<string, number> }
  /**
   * A formula rearranged to make `subject` the subject, e.g. subject "x",
   * value "(y − c)/m". Any equivalent form is accepted; wrongExpressions are
   * compared the same way.
   */
  | { kind: "formula"; subject: string; value: string }
  /**
   * A number in standard form, mantissa × 10^power with 1 ≤ mantissa < 10
   * (see engine/standard-form.ts). The right value written another way is "not-simplified".
   */
  | { kind: "standard-form"; mantissa: Fraction; power: number }
  | { kind: "choice"; options: string[]; correctIndex: number }
  /**
   * A list of whole numbers in any order, e.g. "the factors of 12" (1, 2, 3, 4, 6, 12).
   * Repeats are ignored. `noun` names the items in feedback ("factors").
   * A list missing some items gets `missingMisconception`; one with items that
   * don't belong gets `extraMisconception`, and feedback names those items.
   */
  | { kind: "list"; value: number[]; noun: string; missingMisconception?: MisconceptionId; extraMisconception?: MisconceptionId }
  /**
   * A number written as a product of primes, e.g. 60 = 2 × 2 × 3 × 5 or 2² × 3 × 5.
   * Any order. Right product with a non-prime (or a 1) is "not-simplified".
   * `index` asks for index form: the right primes written out in full get a nudge.
   */
  | { kind: "product"; value: number; index: boolean };

/** One end of an inequality: the number, and whether it is included (≤, ≥) or not (<, >). */
export interface Bound {
  value: Fraction;
  inclusive: boolean;
}
/** x between two bounds; a missing bound means no limit that way. */
export interface Interval {
  lower?: Bound;
  upper?: Bound;
}

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
  wrongAnswers: { value: Fraction | number | number[]; misconception: MisconceptionId }[];
  /** Predicted wrong expressions (for "expression" answers), compared mathematically. */
  wrongExpressions?: { value: string; misconception: MisconceptionId }[];
  /** How to type the answer, shown under the answer box. Defaults to number help. */
  answerHelp?: string;
  hints: string[];
  solution: string[];
  /** How to show the correct answer, when the default would read badly (e.g. "£5.60" not "28/5"). */
  answerText?: string;
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
  | { kind: "machine"; machine: MachineSpec }
  | { kind: "angles"; angles: AngleSpec }
  | { kind: "chart"; chart: ChartSpec }
  | { kind: "spinner"; spinner: SpinnerSpec }
  | { kind: "table"; table: TableSpec }
  | { kind: "venn"; venn: VennSpec }
  | { kind: "plane"; plane: PlaneSpec }
  | { kind: "panels"; panels: { label: string; visual: Visual }[]; description: string }
  | { kind: "numberline"; line: NumberLineSpec }
  | { kind: "graph"; graph: GraphSpec }
  | { kind: "tree"; tree: TreeSpec }
  | { kind: "protractor"; protractor: ProtractorSpec }
  | { kind: "cubes"; cubes: CubeStackSpec };

/**
 * An angle with a protractor laid on it, drawn to scale. The protractor's
 * inner scale reads 0 at direction `turn` (degrees anticlockwise from east)
 * and its outer scale reads 0 at the opposite end. With `from: "inner"` the
 * arms sit at `turn` and `turn + size`, so the inner scale reads the angle;
 * with "outer" they sit at `turn + 180` and `turn + 180 − size`.
 */
export interface ProtractorSpec {
  size: number;
  turn: number;
  from: "inner" | "outer";
  /** Leave the protractor off and just draw the angle (for estimating). */
  hideProtractor?: boolean;
  description: string;
}

/**
 * A solid made of unit cubes standing on a grid, drawn in oblique projection.
 * heights[row][col]: row 0 is the front row; each column is a solid stack.
 */
export interface CubeStackSpec {
  heights: number[][];
  /** Label the front with an arrow ("Front"), and optionally the right side ("Side"). */
  showFront?: boolean;
  showSide?: boolean;
  description: string;
}

/**
 * A number line from min to max (whole numbers marked), optionally showing an
 * inequality: a circle at each bound (filled = included, open = not) and a
 * thick line over the values that fit, with an arrow if it goes on forever.
 */
export interface NumberLineSpec {
  min: number;
  max: number;
  /** Bounds use whole numbers so they sit on a tick. */
  lower?: { value: number; inclusive: boolean };
  upper?: { value: number; inclusive: boolean };
  description: string;
}

/**
 * A coordinate grid with axes, drawn to scale: lines and curves (as lists of
 * points), and labelled points. Used for coordinates, straight-line, quadratic
 * and real-life graphs. Axes sit at 0 when 0 is in range, otherwise on the edge.
 */
export interface GraphSpec {
  x: GraphAxis;
  y: GraphAxis;
  /** Lines and curves, each drawn through its points in order (clipped to the grid). */
  curves?: { points: [number, number][]; label?: { text: string; at: [number, number] }; dashed?: boolean; highlight?: boolean }[];
  /** Points marked with a cross, with an optional letter. */
  points?: { at: [number, number]; label?: string }[];
  /** The student answers by clicking a grid point (its coordinates fill the answer box). */
  pick?: boolean;
  description: string;
}

export interface GraphAxis {
  min: number;
  max: number;
  /** Gap between gridlines. */
  step: number;
  /** Gap between numbered gridlines (default: every gridline). */
  labelStep?: number;
  /** Axis title, e.g. "Time (minutes)". Defaults to the letter x or y. */
  label?: string;
}

/**
 * A tree diagram, drawn left to right with two stages.
 * Frequency trees put a count in every box (the starting box holds `root`).
 * Probability trees write a probability on each branch and leave out `root`.
 * "?" marks a value to find.
 */
export interface TreeSpec {
  /** The count in the starting box (frequency trees). Left out for probability trees. */
  root?: string;
  /** First-stage branches, top to bottom. Each has its own second-stage branches. */
  branches: TreeNode[];
  /** Headings over each stage, e.g. ["First counter", "Second counter"]. */
  stages?: [string, string];
  /** Leaves (numbered top to bottom from 0) whose whole route is drawn bold. */
  highlight?: number[];
  description: string;
}

export interface TreeNode {
  /** What happened, e.g. "Red" or "Adults". */
  label: string;
  /** A count shown under the label (frequency trees). */
  count?: string;
  /** The probability written on the branch leading here, e.g. "3/10" or "0.4". */
  p?: string;
  children?: TreeNode[];
  /** Text after a leaf, e.g. "Red, Blue". */
  end?: string;
}


/**
 * A flat drawing on a coordinate plane, drawn to scale (equal units on both
 * axes): grids and axes, labelled polygons, straight lines, circles and arcs,
 * points and arrows. Used for transformations, constructions and loci.
 */
export interface PlaneSpec {
  /** The window to draw, in real units: [min, max] on each axis. */
  x: [number, number];
  y: [number, number];
  /** Unit squares behind everything. */
  grid?: boolean;
  /** x and y axes through (0, 0), numbered every `axisStep` (default 1). */
  axes?: boolean;
  axisStep?: number;
  /** Polygons. "object" is shaded, "image" is shaded in the second colour, "region" is a pale wash with no outline, "outline" is unfilled. */
  shapes?: { points: [number, number][]; label?: string; tone?: "object" | "image" | "region" | "outline"; dashed?: boolean }[];
  /** Straight lines from a to b. "mirror" lines are drawn bold in the highlight colour. */
  lines?: { a: [number, number]; b: [number, number]; label?: string; dashed?: boolean; tone?: "mirror" | "ink" | "faint" }[];
  /** Circles (no from/to) or arcs from angle `from` to `to`, degrees anticlockwise from east. */
  arcs?: { c: [number, number]; r: number; from?: number; to?: number; dashed?: boolean; faint?: boolean }[];
  /** Dots, with an optional letter or coordinate label. */
  points?: { at: [number, number]; label?: string; hollow?: boolean }[];
  /** Arrows from one point to another (e.g. a translation). */
  arrows?: { from: [number, number]; to: [number, number] }[];
  /** Length labels beside a segment. */
  lengths?: { a: [number, number]; b: [number, number]; text: string }[];
  description: string;
}

/** A fair spinner with equal sections, each labelled (a colour word or a number). */
export interface SpinnerSpec {
  sections: string[];
  description: string;
}

/**
 * A table: a header row, then rows whose first cell is a row header.
 * Used for sample space diagrams, frequency tables and probability tables.
 * A cell of "?" is drawn as a blank to find. `highlight` marks [row, col] body cells.
 */
export interface TableSpec {
  corner?: string;
  columns: string[];
  rows: { head: string; cells: string[] }[];
  highlight?: [number, number][];
  description: string;
}

/**
 * A two-set Venn diagram. Each region holds text: a count ("7"), a list of
 * members ("2, 4, 8") or "?" for the value to find.
 */
export interface VennSpec {
  a: string;
  b: string;
  onlyA: string;
  both: string;
  onlyB: string;
  neither: string;
  /** Regions to shade, to show what a question means. */
  shade?: ("onlyA" | "both" | "onlyB" | "neither")[];
  description: string;
}

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
    }
  /** A pyramid on a square or triangular base, apex above the middle of the base. */
  | { kind: "pyramid"; base: "square" | "triangle"; size: number; h: number; baseText?: string; hText?: string; slantText?: string; description: string }
  /** A cone: radius r, perpendicular height h. Labels are optional. */
  | { kind: "cone"; r: number; h: number; rText?: string; hText?: string; slantText?: string; description: string }
  /** A sphere (or hemisphere) of radius r. */
  | { kind: "sphere"; r: number; half?: boolean; rText?: string; description: string };

/**
 * An angle diagram: named points (real units, y up), lines between them, and
 * angle marks. Drawn to scale, so a marked 40° really is 40°.
 * Also draws shapes with equal-side ticks, parallel arrows and right angles.
 */
export interface AngleSpec {
  points: Record<string, [number, number]>;
  /** Straight lines between named points. */
  segments: [string, string][];
  /** Angle marks at a vertex, between the rays to `from` and `to`. */
  angles: AngleMark[];
  /** Points (in order) of a shape to shade. */
  polygon?: string[];
  /**
   * More shapes to shade, for diagrams with two shapes (congruent or similar
   * triangles). Length labels and letters are pushed out from their own shape.
   */
  polygons?: string[][];
  /** Draw it wider than usual (two shapes side by side). */
  wide?: boolean;
  /** Equal-length marks: n small ticks across the middle of a segment. */
  ticks?: { a: string; b: string; n: number }[];
  /** Parallel marks: n arrowheads on a segment, pointing from a to b. */
  arrows?: { a: string; b: string; n: number }[];
  /** Length labels on segments. */
  lengths?: { a: string; b: string; text: string }[];
  /** Point names to show as letters. */
  labels?: string[];
  /** Points to mark with a dot. */
  dots?: string[];
  description: string;
}

export interface AngleMark {
  at: string;
  from: string;
  to: string;
  /** "65°", "x" or "?". Left out for an unlabelled arc. */
  text?: string;
  /** Mark the larger (reflex) angle instead of the smaller one. */
  reflex?: boolean;
  /** Draw a right-angle square instead of an arc. */
  right?: boolean;
  /** Draw it bold in the highlight colour. */
  highlight?: boolean;
}

/**
 * A statistics chart or table. Drawn exactly from the numbers given, so the
 * student reads the values off it. `description` is for screen readers.
 */
export type ChartSpec =
  | {
      type: "table";
      headers: string[];
      rows: (string | number)[][];
      /** Draw this column's numbers as tally marks instead of digits. */
      tallyColumn?: number;
      description: string;
    }
  | {
      type: "bar";
      categories: string[];
      values: number[];
      xLabel: string;
      yLabel: string;
      /** Gap between labelled gridlines. */
      yStep: number;
      description: string;
    }
  | {
      type: "pictogram";
      categories: string[];
      values: number[];
      /** What one whole symbol stands for (an even number, so half a symbol is a whole number). */
      perSymbol: number;
      /** What is being counted, for the key: "people". */
      unit: string;
      description: string;
    }
  | {
      type: "pie";
      /** Sectors in order clockwise from 12 o'clock. Angles add to 360. */
      sectors: { label: string; angle: number }[];
      /** Write each angle in its sector. A sector in `hideAngle` shows "?" instead. */
      showAngles: boolean;
      hideAngle?: number;
      description: string;
    }
  | {
      type: "scatter";
      points: [number, number][];
      xLabel: string;
      yLabel: string;
      xMax: number;
      yMax: number;
      xStep: number;
      yStep: number;
      /** Letters to write beside some points, by index. */
      letters?: { i: number; text: string }[];
      /** One point circled, by index. */
      highlight?: number;
      /** Straight lines drawn across the graph (a line of best fit), in axis units, each with an optional letter. */
      fits?: { from: [number, number]; to: [number, number]; label?: string }[];
      description: string;
    }
  | {
      /** A line graph or time series: points joined by straight lines, equally spaced along the bottom. */
      type: "line";
      labels: string[];
      values: number[];
      xLabel: string;
      yLabel: string;
      /** Gap between labelled gridlines (dashed half-way lines appear when it is even). */
      yStep: number;
      /** One point circled, by index. */
      highlight?: number;
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
