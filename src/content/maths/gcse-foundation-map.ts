/**
 * GCSE Foundation Maths topic map: every Foundation skill we plan to teach,
 * with prerequisites, typical year, spec references and a suggested build phase.
 *
 * Spec source: the DfE GCSE maths content (DFE-00233-2013), which AQA 8300,
 * Edexcel 1MA1 and OCR J560 all teach. Codes (N1..N16, A1..A25, R1..R16,
 * G1..G25, P1..P9, S1..S6) and the Basic / Additional / Higher split were
 * checked against AQA's published 8300 subject content (Nov 2026). Codes that
 * are wholly Higher tier (A13, A15, A16, A20, R15, G8, G10, G22, G23, P9, S3)
 * are deliberately not in this map.
 *
 * Strand weightings (Ofqual GCSE Maths conditions, para 22, Foundation tier,
 * ±3%): Number 25%, Algebra 20%, Ratio 25%, Geometry 15%, Probability and
 * statistics 15%.
 *
 * `examValue` is the build team's estimate of how often and how heavily a
 * skill is examined at Foundation. It is a judgement, not a published figure.
 *
 * Skills that already exist in the app reuse their ids, so this map and the
 * live curriculum stay in step. A planned skill becomes a real `Skill` (in
 * src/content/maths/<chain>/skills.ts) when its lesson is built.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher.
 */

import type { SkillId } from "@/engine/types";

export type Strand = "Number" | "Algebra" | "Ratio" | "Geometry" | "Probability" | "Statistics";

export interface MapSkill {
  id: SkillId;
  strand: Strand;
  /** Groups skills into a chain (a lesson sequence), e.g. "Percentages". */
  topic: string;
  name: string;
  /** Typical school year (7-11). A label, never a gate. */
  typicalYear: number;
  keyStage: "KS2" | "KS3" | "KS4";
  /** DfE / AQA content codes this skill covers. */
  specRefs: string[];
  /** AQA's split of Foundation content: Basic or Additional (harder, still Foundation). */
  foundationPart: "basic" | "additional";
  /** Estimated exam value at Foundation (judgement). */
  examValue: "high" | "medium" | "low";
  /** Suggested build phase (see BUILD_PHASES). */
  phase: 1 | 2 | 3 | 4 | 5 | 6;
  prerequisites: SkillId[];
  notes?: string;
}

export const BUILD_PHASES: Record<MapSkill["phase"], { name: string; why: string }> = {
  1: { name: "Number foundations", why: "Almost every later skill uses these. Gaps here cause most Foundation errors." },
  2: { name: "Algebra core", why: "Algebra is 20% of Foundation marks and unlocks graphs, formulae and equations." },
  3: { name: "Ratio, proportion and percentages", why: "25% of Foundation marks; very common in real-life multi-step questions." },
  4: { name: "Geometry and measures core", why: "15% of marks; builds on the area chain already in the app." },
  5: { name: "Probability and statistics", why: "15% of marks; mostly self-contained and accessible." },
  6: { name: "Grade 4-5 stretch", why: "The harder Additional Foundation content that separates grade 3 from grades 4 and 5." },
};

const ks = (year: number): MapSkill["keyStage"] => (year <= 6 ? "KS2" : year <= 9 ? "KS3" : "KS4");

function s(
  id: string,
  strand: Strand,
  topic: string,
  name: string,
  typicalYear: number,
  specRefs: string[],
  foundationPart: MapSkill["foundationPart"],
  examValue: MapSkill["examValue"],
  phase: MapSkill["phase"],
  prerequisites: string[],
  notes?: string,
): MapSkill {
  return { id, strand, topic, name, typicalYear, keyStage: ks(typicalYear), specRefs, foundationPart, examValue, phase, prerequisites, ...(notes ? { notes } : {}) };
}

export const GCSE_FOUNDATION_MAP: MapSkill[] = [
  // ───────────── Number ─────────────
  s("num-place-value", "Number", "Place value and ordering", "Place value in integers and decimals", 7, ["N1", "N2"], "basic", "medium", 1, []),
  s("num-ordering", "Number", "Place value and ordering", "Ordering numbers using < > ≤ ≥", 7, ["N1"], "basic", "low", 1, ["num-place-value"]),
  s("num-negatives", "Number", "Place value and ordering", "Calculating with negative numbers", 7, ["N2"], "basic", "medium", 1, ["num-place-value"]),
  s("num-add-sub", "Number", "Written calculation", "Written addition and subtraction, including decimals", 7, ["N2"], "basic", "medium", 1, ["num-place-value"]),
  s("num-multiply", "Number", "Written calculation", "Written multiplication, including decimals", 7, ["N2"], "basic", "high", 1, ["num-place-value"]),
  s("num-divide", "Number", "Written calculation", "Short and long division, including decimals", 7, ["N2"], "basic", "high", 1, ["num-multiply"]),
  s("num-order-of-operations", "Number", "Written calculation", "Order of operations (BIDMAS)", 7, ["N3"], "basic", "medium", 1, ["num-negatives", "num-powers-roots"]),
  s("num-inverse-operations", "Number", "Written calculation", "Inverse operations", 7, ["N3"], "basic", "low", 1, ["num-divide"]),
  s("num-factors-multiples", "Number", "Factors and primes", "Factors, multiples and primes", 7, ["N4"], "basic", "medium", 1, ["num-divide"]),
  s("num-prime-factorisation", "Number", "Factors and primes", "Writing a number as a product of primes", 8, ["N4"], "basic", "high", 1, ["num-factors-multiples", "num-powers-roots"]),
  s("num-hcf-lcm", "Number", "Factors and primes", "HCF and LCM, including using prime factors", 8, ["N4"], "basic", "high", 1, ["num-prime-factorisation"]),
  s("num-listing", "Number", "Factors and primes", "Systematic listing of combinations", 8, ["N5"], "basic", "low", 6, []),
  s("num-powers-roots", "Number", "Powers and roots", "Squares, cubes, square roots and cube roots", 7, ["N6"], "basic", "medium", 1, ["num-multiply"]),
  s("num-index-laws", "Number", "Powers and roots", "Index laws with numbers (integer indices)", 9, ["N7"], "additional", "medium", 6, ["num-powers-roots"]),
  s("num-standard-form", "Number", "Standard form", "Writing numbers in standard form", 9, ["N9"], "basic", "medium", 6, ["num-powers-roots", "num-place-value"]),
  s("num-standard-form-calc", "Number", "Standard form", "Calculating with standard form", 10, ["N9"], "basic", "medium", 6, ["num-standard-form", "num-index-laws"]),
  s("frac-equivalent", "Number", "Fractions", "Equivalent fractions", 6, ["N2", "N10"], "basic", "medium", 1, []),
  s("frac-simplify", "Number", "Fractions", "Simplifying fractions", 7, ["N2"], "basic", "medium", 1, ["frac-equivalent"]),
  s("frac-common-denominator", "Number", "Fractions", "Common denominators", 7, ["N1", "N2"], "basic", "medium", 1, ["frac-equivalent"]),
  s("frac-add-sub", "Number", "Fractions", "Adding and subtracting fractions", 7, ["N2"], "basic", "high", 1, ["frac-common-denominator", "frac-simplify"]),
  s("frac-of-amount", "Number", "Fractions", "Fractions of amounts", 7, ["N12"], "basic", "high", 1, ["frac-equivalent"]),
  s("frac-mul-div", "Number", "Fractions", "Multiplying and dividing fractions", 8, ["N2"], "basic", "high", 1, ["frac-simplify", "frac-of-amount"]),
  s("frac-mixed-numbers", "Number", "Fractions", "Mixed numbers and improper fractions", 7, ["N2"], "basic", "high", 1, ["frac-add-sub", "frac-mul-div"]),
  s("num-fdp", "Number", "Fractions, decimals and percentages", "Converting between fractions, decimals and percentages", 7, ["N10", "R9"], "basic", "high", 1, ["frac-equivalent", "num-place-value"]),
  s("num-rounding", "Number", "Rounding and estimation", "Rounding to decimal places and significant figures", 7, ["N15"], "basic", "high", 1, ["num-place-value"]),
  s("num-estimation", "Number", "Rounding and estimation", "Estimating answers by rounding", 8, ["N14"], "basic", "high", 1, ["num-rounding", "num-order-of-operations"]),
  s("num-error-intervals", "Number", "Rounding and estimation", "Error intervals and limits of accuracy", 10, ["N15", "N16"], "additional", "medium", 6, ["num-rounding", "alg-inequalities-number-line"]),
  s("num-units", "Number", "Measures", "Metric units and converting between them", 7, ["N13", "G14"], "basic", "medium", 1, ["num-multiply", "num-divide"]),
  s("num-time-money", "Number", "Measures", "Time, timetables and money calculations", 7, ["N13", "G14"], "basic", "medium", 1, ["num-add-sub"]),

  // ───────────── Algebra ─────────────
  s("alg-notation", "Algebra", "Expressions", "Algebraic notation", 7, ["A1"], "basic", "medium", 2, ["num-order-of-operations"]),
  s("alg-substitution", "Algebra", "Expressions", "Substituting into expressions and formulae", 7, ["A2"], "basic", "high", 2, ["alg-notation", "num-negatives"]),
  s("alg-vocabulary", "Algebra", "Expressions", "Expression, equation, formula, identity", 8, ["A3", "A6"], "basic", "low", 2, ["alg-notation"]),
  s("alg-collect-terms", "Algebra", "Expressions", "Simplifying by collecting like terms", 7, ["A4"], "basic", "high", 2, ["alg-notation"]),
  s("alg-expand-single", "Algebra", "Expressions", "Expanding single brackets", 8, ["A4"], "basic", "high", 2, ["alg-collect-terms"]),
  s("alg-factorise-single", "Algebra", "Expressions", "Factorising into a single bracket", 8, ["A4"], "basic", "high", 2, ["alg-expand-single", "num-hcf-lcm"]),
  s("alg-index-laws", "Algebra", "Expressions", "Index laws in algebra", 9, ["A4"], "basic", "medium", 6, ["alg-collect-terms", "num-index-laws"]),
  s("alg-expand-double", "Algebra", "Expressions", "Expanding two brackets", 9, ["A4"], "additional", "medium", 6, ["alg-expand-single"]),
  s("alg-factorise-quadratic", "Algebra", "Expressions", "Factorising x² + bx + c and difference of two squares", 10, ["A4"], "additional", "medium", 6, ["alg-expand-double"]),
  s("alg-show-that", "Algebra", "Expressions", "Showing two expressions are equivalent", 10, ["A6"], "additional", "low", 6, ["alg-expand-double", "alg-vocabulary"]),
  s("alg-function-machines", "Algebra", "Equations", "Function machines: inputs and outputs", 7, ["A7"], "basic", "low", 2, ["num-inverse-operations"]),
  s("alg-solve-simple", "Algebra", "Equations", "Solving one- and two-step equations", 7, ["A17"], "basic", "high", 2, ["alg-function-machines", "alg-notation"]),
  s("alg-solve-brackets", "Algebra", "Equations", "Solving equations with brackets", 8, ["A17"], "basic", "high", 2, ["alg-solve-simple", "alg-expand-single"]),
  s("alg-solve-both-sides", "Algebra", "Equations", "Solving equations with the unknown on both sides", 8, ["A17"], "additional", "high", 2, ["alg-solve-brackets"]),
  s("alg-form-expressions", "Algebra", "Equations", "Writing expressions and formulae from words", 8, ["A21"], "basic", "high", 2, ["alg-substitution"]),
  s("alg-form-equations", "Algebra", "Equations", "Forming and solving equations from problems", 9, ["A21"], "additional", "high", 2, ["alg-form-expressions", "alg-solve-both-sides"]),
  s("alg-rearrange", "Algebra", "Equations", "Changing the subject of a formula", 9, ["A5"], "basic", "medium", 2, ["alg-solve-brackets"]),
  s("alg-inequalities-number-line", "Algebra", "Inequalities", "Inequalities on a number line and listing integers", 9, ["A22", "N1"], "additional", "medium", 6, ["num-ordering"]),
  s("alg-solve-inequalities", "Algebra", "Inequalities", "Solving linear inequalities", 10, ["A22"], "additional", "medium", 6, ["alg-inequalities-number-line", "alg-solve-both-sides"]),
  s("alg-sequences", "Algebra", "Sequences", "Term-to-term and position-to-term rules", 7, ["A23"], "basic", "medium", 2, ["alg-substitution"]),
  s("alg-special-sequences", "Algebra", "Sequences", "Square, cube, triangular numbers and arithmetic sequences", 7, ["A24"], "basic", "medium", 2, ["alg-sequences", "num-powers-roots"]),
  s("alg-nth-term", "Algebra", "Sequences", "The nth term of a linear sequence", 8, ["A25"], "basic", "high", 2, ["alg-special-sequences", "alg-solve-simple"]),
  s("alg-other-sequences", "Algebra", "Sequences", "Fibonacci-type, quadratic and geometric sequences", 10, ["A24"], "additional", "low", 6, ["alg-special-sequences"]),
  s("alg-coordinates", "Algebra", "Graphs", "Coordinates in all four quadrants", 7, ["A8", "G11"], "basic", "medium", 2, ["num-negatives"]),
  s("alg-plot-linear", "Algebra", "Graphs", "Plotting straight-line graphs from a table", 8, ["A9"], "basic", "high", 2, ["alg-coordinates", "alg-substitution"]),
  s("alg-gradient-intercept", "Algebra", "Graphs", "Gradient and y-intercept", 9, ["A10"], "basic", "medium", 2, ["alg-plot-linear"]),
  s("alg-y-mx-c", "Algebra", "Graphs", "Finding y = mx + c, including parallel lines", 10, ["A9"], "additional", "medium", 6, ["alg-gradient-intercept", "alg-rearrange"]),
  s("alg-real-life-graphs", "Algebra", "Graphs", "Reading and drawing real-life graphs", 8, ["A14"], "basic", "high", 2, ["alg-coordinates"]),
  s("alg-quadratic-graphs", "Algebra", "Graphs", "Quadratic graphs: plotting, roots and turning points", 10, ["A11", "A12"], "additional", "medium", 6, ["alg-plot-linear", "num-powers-roots"]),
  s("alg-cubic-reciprocal-graphs", "Algebra", "Graphs", "Recognising cubic and reciprocal graphs", 10, ["A12", "A14"], "additional", "low", 6, ["alg-quadratic-graphs"]),
  s("alg-solve-quadratic", "Algebra", "Equations", "Solving quadratics by factorising", 10, ["A18"], "additional", "medium", 6, ["alg-factorise-quadratic"]),
  s("alg-simultaneous", "Algebra", "Equations", "Solving linear simultaneous equations", 10, ["A19"], "additional", "medium", 6, ["alg-solve-both-sides"]),
  s("alg-solve-graphically", "Algebra", "Graphs", "Solving equations approximately using graphs", 10, ["A17", "A18", "A19"], "additional", "low", 6, ["alg-quadratic-graphs", "alg-simultaneous"]),

  // ───────────── Ratio, proportion and rates of change ─────────────
  s("ratio-fraction-of-another", "Ratio", "Ratio", "One quantity as a fraction of another", 7, ["R3"], "basic", "medium", 3, ["frac-simplify"]),
  s("ratio-simplify", "Ratio", "Ratio", "Writing and simplifying ratios", 7, ["R4"], "basic", "high", 3, ["frac-simplify", "num-hcf-lcm"]),
  s("ratio-share", "Ratio", "Ratio", "Sharing an amount in a ratio", 8, ["R5"], "basic", "high", 3, ["ratio-simplify"]),
  s("ratio-fractions", "Ratio", "Ratio", "Ratios and fractions (part:part and part:whole)", 8, ["R5", "R6", "R8", "N11"], "basic", "high", 3, ["ratio-share", "frac-of-amount"]),
  s("ratio-scale-maps", "Ratio", "Ratio", "Scale drawings and map scales", 7, ["R2", "G15"], "basic", "medium", 3, ["ratio-simplify", "num-units"]),
  s("ratio-unitary-method", "Ratio", "Proportion", "Proportion with the unitary method (recipes, best buys)", 8, ["R7", "R10", "R11"], "basic", "high", 3, ["ratio-share", "num-divide"]),
  s("ratio-direct-proportion", "Ratio", "Proportion", "Direct proportion problems and graphs", 9, ["R10", "R14", "R8"], "basic", "medium", 3, ["ratio-unitary-method", "alg-plot-linear"]),
  s("ratio-inverse-proportion", "Ratio", "Proportion", "Inverse proportion problems", 10, ["R10", "R13"], "additional", "medium", 6, ["ratio-direct-proportion"]),
  s("pct-of-amount", "Ratio", "Percentages", "Percentage of an amount (with and without a calculator)", 7, ["R9", "N12"], "basic", "high", 3, ["num-fdp", "frac-of-amount"]),
  s("pct-one-of-another", "Ratio", "Percentages", "One quantity as a percentage of another", 8, ["R9"], "basic", "high", 3, ["num-fdp", "ratio-fraction-of-another"]),
  s("pct-increase-decrease", "Ratio", "Percentages", "Percentage increase and decrease, using multipliers", 8, ["R9", "N12"], "basic", "high", 3, ["pct-of-amount"]),
  s("pct-change", "Ratio", "Percentages", "Finding a percentage change", 9, ["R9"], "basic", "high", 3, ["pct-one-of-another"]),
  s("pct-reverse", "Ratio", "Percentages", "Reverse percentages (finding the original amount)", 10, ["R9"], "basic", "medium", 3, ["pct-increase-decrease"]),
  s("pct-simple-interest", "Ratio", "Percentages", "Simple interest", 9, ["R9"], "basic", "medium", 3, ["pct-of-amount"]),
  s("pct-compound", "Ratio", "Percentages", "Compound interest, growth and depreciation", 10, ["R16"], "additional", "medium", 6, ["pct-increase-decrease", "num-powers-roots"]),
  s("ratio-speed", "Ratio", "Compound measures", "Speed, distance and time", 8, ["R11", "R1"], "basic", "high", 3, ["num-time-money", "alg-rearrange"]),
  s("ratio-distance-time-graphs", "Ratio", "Compound measures", "Distance-time graphs and gradient as a rate", 9, ["R14", "A14"], "additional", "medium", 3, ["ratio-speed", "alg-real-life-graphs"]),
  s("ratio-unit-rates", "Ratio", "Compound measures", "Unit pricing and rates of pay", 8, ["R11"], "basic", "medium", 3, ["ratio-unitary-method"]),
  s("ratio-density-pressure", "Ratio", "Compound measures", "Density and pressure", 10, ["R11", "R1"], "additional", "medium", 6, ["ratio-speed"]),
  s("ratio-convert-compound-units", "Ratio", "Compound measures", "Converting compound units (e.g. km/h to m/s)", 10, ["R1"], "additional", "low", 6, ["ratio-speed", "num-units"]),

  // ───────────── Geometry and measures ─────────────
  s("geo-angle-basics", "Geometry", "Angles", "Angle types, notation and labelling", 7, ["G1"], "basic", "low", 4, []),
  s("geo-measure-angles", "Geometry", "Angles", "Measuring and drawing angles with a protractor", 7, ["G15"], "basic", "low", 4, ["geo-angle-basics"]),
  s("geo-angle-facts", "Geometry", "Angles", "Angles at a point, on a line, vertically opposite", 7, ["G3"], "basic", "high", 4, ["geo-angle-basics"]),
  s("geo-triangle-quad-angles", "Geometry", "Angles", "Angles in triangles and quadrilaterals", 7, ["G3", "G4"], "basic", "high", 4, ["geo-angle-facts", "geo-shape-properties"]),
  s("geo-parallel-angles", "Geometry", "Angles", "Angles in parallel lines (alternate, corresponding)", 8, ["G3"], "basic", "high", 4, ["geo-angle-facts"]),
  s("geo-polygon-angles", "Geometry", "Angles", "Interior and exterior angles of polygons", 9, ["G3"], "basic", "medium", 4, ["geo-triangle-quad-angles"]),
  s("geo-angle-reasoning", "Geometry", "Angles", "Multi-step angle problems with reasons", 9, ["G6", "G3"], "additional", "medium", 6, ["geo-parallel-angles", "geo-polygon-angles"]),
  s("geo-bearings", "Geometry", "Angles", "Bearings", 9, ["G15"], "basic", "medium", 4, ["geo-measure-angles", "geo-parallel-angles"]),
  s("geo-shape-properties", "Geometry", "Shapes", "Properties of triangles, quadrilaterals and polygons", 7, ["G1", "G4"], "basic", "medium", 4, ["geo-angle-basics"]),
  s("geo-3d-shapes", "Geometry", "Shapes", "Faces, edges, vertices and nets of 3D shapes", 7, ["G12"], "basic", "low", 4, ["geo-shape-properties"]),
  s("geo-plans-elevations", "Geometry", "Shapes", "Plans and elevations", 9, ["G13"], "basic", "medium", 4, ["geo-3d-shapes"]),
  s("geo-constructions", "Geometry", "Constructions", "Ruler-and-compass constructions", 8, ["G2"], "basic", "medium", 4, ["geo-measure-angles"]),
  s("geo-loci", "Geometry", "Constructions", "Loci", 9, ["G2"], "additional", "low", 6, ["geo-constructions"]),
  s("geo-congruence", "Geometry", "Shapes", "Congruent triangles (SSS, SAS, ASA, RHS)", 10, ["G5"], "additional", "low", 6, ["geo-shape-properties"]),
  s("geo-perimeter", "Geometry", "Perimeter and area", "Perimeter of rectilinear shapes", 7, ["G17"], "basic", "medium", 4, ["num-add-sub"]),
  s("area-rectangle", "Geometry", "Perimeter and area", "Area of rectangles", 7, ["G16", "G17"], "basic", "high", 4, []),
  s("area-triangle", "Geometry", "Perimeter and area", "Area of triangles", 7, ["G16"], "basic", "high", 4, ["area-rectangle"]),
  s("area-parallelogram", "Geometry", "Perimeter and area", "Area of parallelograms", 7, ["G16"], "basic", "medium", 4, ["area-rectangle"]),
  s("area-trapezium", "Geometry", "Perimeter and area", "Area of trapeziums", 8, ["G16"], "basic", "high", 4, ["area-triangle", "area-parallelogram"]),
  s("area-compound", "Geometry", "Perimeter and area", "Area of compound shapes", 8, ["G17"], "basic", "high", 4, ["area-rectangle"]),
  s("geo-circle-parts", "Geometry", "Circles", "Parts of a circle", 8, ["G9"], "basic", "low", 4, ["geo-shape-properties"]),
  s("geo-circumference", "Geometry", "Circles", "Circumference of a circle", 8, ["G17"], "basic", "high", 4, ["geo-circle-parts", "num-rounding"]),
  s("geo-circle-area", "Geometry", "Circles", "Area of a circle", 8, ["G17"], "basic", "high", 4, ["geo-circle-parts", "area-rectangle", "num-rounding"]),
  s("geo-exact-pi", "Geometry", "Circles", "Leaving answers in terms of π", 9, ["N8"], "additional", "low", 6, ["geo-circle-area", "geo-circumference"]),
  s("geo-circle-composite", "Geometry", "Circles", "Semicircles, quarter circles and composite shapes", 9, ["G17"], "basic", "medium", 4, ["geo-circle-area", "geo-circumference", "area-compound"]),
  s("geo-arcs-sectors", "Geometry", "Circles", "Arc length and sector area", 10, ["G18"], "additional", "medium", 6, ["geo-circle-composite", "frac-of-amount"]),
  s("geo-volume-cuboid", "Geometry", "Volume and surface area", "Volume of cuboids", 7, ["G16"], "basic", "high", 4, ["area-rectangle"]),
  s("geo-volume-prism", "Geometry", "Volume and surface area", "Volume of prisms and cylinders", 8, ["G16", "G17"], "basic", "high", 4, ["geo-volume-cuboid", "area-compound", "geo-circle-area"]),
  s("geo-surface-area", "Geometry", "Volume and surface area", "Surface area of cuboids, prisms and cylinders", 8, ["G16", "G17"], "basic", "medium", 4, ["geo-3d-shapes", "area-triangle", "geo-circumference"]),
  s("geo-spheres-cones-pyramids", "Geometry", "Volume and surface area", "Volume and surface area of spheres, cones and pyramids", 11, ["G17"], "additional", "low", 6, ["geo-volume-prism", "geo-surface-area"], "Formulae are given in the question at Foundation."),
  s("geo-area-volume-units", "Geometry", "Volume and surface area", "Converting area and volume units, and litres", 9, ["G14", "N13"], "basic", "medium", 4, ["num-units", "geo-volume-cuboid"]),
  s("geo-reflection", "Geometry", "Transformations", "Reflections", 7, ["G7", "G11"], "basic", "medium", 4, ["alg-coordinates"]),
  s("geo-rotation", "Geometry", "Transformations", "Rotations", 8, ["G7", "G11"], "basic", "medium", 4, ["alg-coordinates", "geo-angle-basics"]),
  s("geo-translation", "Geometry", "Transformations", "Translations with column vectors", 8, ["G7", "G24"], "basic", "medium", 4, ["alg-coordinates"]),
  s("geo-enlargement", "Geometry", "Transformations", "Enlargements, including fractional scale factors", 9, ["G7", "R2"], "basic", "medium", 4, ["geo-translation", "ratio-scale-maps"]),
  s("geo-describe-transformations", "Geometry", "Transformations", "Describing a single transformation fully", 10, ["G7"], "basic", "medium", 4, ["geo-reflection", "geo-rotation", "geo-translation", "geo-enlargement"]),
  s("geo-similar-shapes", "Geometry", "Similarity and trigonometry", "Similar shapes: finding missing lengths", 10, ["G6", "G19", "R12"], "additional", "medium", 6, ["geo-enlargement", "ratio-direct-proportion"]),
  s("geo-pythagoras", "Geometry", "Similarity and trigonometry", "Pythagoras' theorem", 9, ["G6", "G20"], "additional", "high", 4, ["num-powers-roots", "geo-triangle-quad-angles"]),
  s("geo-trig-sides", "Geometry", "Similarity and trigonometry", "SOHCAHTOA: finding a missing side", 10, ["G20", "R12"], "additional", "medium", 6, ["geo-pythagoras", "alg-rearrange"]),
  s("geo-trig-angles", "Geometry", "Similarity and trigonometry", "SOHCAHTOA: finding a missing angle", 10, ["G20"], "additional", "medium", 6, ["geo-trig-sides"]),
  s("geo-exact-trig", "Geometry", "Similarity and trigonometry", "Exact trig values (0°, 30°, 45°, 60°, 90°)", 11, ["G21"], "additional", "low", 6, ["geo-trig-angles"]),
  s("geo-vectors", "Geometry", "Vectors", "Column vectors: add, subtract and multiply by a number", 10, ["G25", "G24"], "additional", "low", 6, ["geo-translation"]),

  // ───────────── Probability ─────────────
  s("prob-scale", "Probability", "Probability", "The probability scale and language of chance", 7, ["P3", "P2"], "basic", "low", 5, ["num-fdp"]),
  s("prob-single-event", "Probability", "Probability", "Probability of a single event", 7, ["P3", "P7"], "basic", "high", 5, ["prob-scale", "frac-simplify"]),
  s("prob-sum-to-one", "Probability", "Probability", "Probabilities that add up to 1", 7, ["P4"], "basic", "high", 5, ["prob-single-event", "num-add-sub"]),
  s("prob-relative-frequency", "Probability", "Probability", "Relative frequency and expected outcomes", 8, ["P2", "P3", "P5"], "basic", "high", 5, ["prob-single-event", "frac-of-amount"]),
  s("prob-sample-space", "Probability", "Combined events", "Listing outcomes and sample space diagrams", 8, ["P6", "P7", "N5"], "basic", "high", 5, ["prob-single-event"]),
  s("prob-frequency-trees", "Probability", "Combined events", "Frequency trees", 9, ["P1"], "basic", "medium", 5, ["prob-relative-frequency"]),
  s("prob-venn", "Probability", "Combined events", "Venn diagrams and set notation", 9, ["P6"], "basic", "medium", 5, ["prob-single-event"]),
  s("prob-tree-independent", "Probability", "Combined events", "Tree diagrams for independent events", 10, ["P6", "P8"], "additional", "medium", 6, ["prob-sample-space", "frac-mul-div"]),
  s("prob-tree-dependent", "Probability", "Combined events", "Tree diagrams without replacement", 11, ["P8"], "additional", "low", 6, ["prob-tree-independent"]),

  // ───────────── Statistics ─────────────
  s("stats-frequency-tables", "Statistics", "Representing data", "Tally charts and frequency tables", 7, ["S2"], "basic", "low", 5, []),
  s("stats-bar-pictograms", "Statistics", "Representing data", "Bar charts, pictograms and vertical line charts", 7, ["S2"], "basic", "medium", 5, ["stats-frequency-tables"]),
  s("stats-two-way-tables", "Statistics", "Representing data", "Two-way tables", 8, ["S2", "P1"], "basic", "high", 5, ["stats-frequency-tables"]),
  s("stats-pie-charts", "Statistics", "Representing data", "Drawing and reading pie charts", 8, ["S2"], "basic", "high", 5, ["stats-frequency-tables", "geo-measure-angles", "frac-of-amount"]),
  s("stats-time-series", "Statistics", "Representing data", "Line graphs and time series", 9, ["S2"], "additional", "low", 5, ["stats-bar-pictograms"]),
  s("stats-averages", "Statistics", "Analysing data", "Mean, median, mode and range", 7, ["S4"], "basic", "high", 5, ["num-divide", "num-ordering"]),
  s("stats-frequency-table-averages", "Statistics", "Analysing data", "Averages from a frequency table", 9, ["S4"], "basic", "medium", 5, ["stats-averages", "stats-frequency-tables"]),
  s("stats-grouped-mean", "Statistics", "Analysing data", "Estimating the mean from grouped data", 10, ["S4"], "basic", "medium", 5, ["stats-frequency-table-averages"]),
  s("stats-compare", "Statistics", "Analysing data", "Comparing data sets using an average and the range", 9, ["S4", "S5"], "basic", "medium", 5, ["stats-averages"]),
  s("stats-sampling", "Statistics", "Analysing data", "Populations, samples and bias", 9, ["S1"], "additional", "low", 5, ["stats-frequency-tables"]),
  s("stats-scatter", "Statistics", "Analysing data", "Scatter graphs and correlation", 9, ["S6"], "basic", "high", 5, ["alg-coordinates"]),
  s("stats-best-fit", "Statistics", "Analysing data", "Lines of best fit, predictions and outliers", 10, ["S6"], "additional", "medium", 5, ["stats-scatter"]),
];

/** Every Foundation-assessable content code (AQA 8300 Basic + Additional). */
export const FOUNDATION_SPEC_CODES: string[] = [
  ...Array.from({ length: 16 }, (_, i) => `N${i + 1}`),
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 17, 18, 19, 21, 22, 23, 24, 25].map((n) => `A${n}`),
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16].map((n) => `R${n}`),
  ...[1, 2, 3, 4, 5, 6, 7, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 24, 25].map((n) => `G${n}`),
  ...[1, 2, 3, 4, 5, 6, 7, 8].map((n) => `P${n}`),
  ...[1, 2, 4, 5, 6].map((n) => `S${n}`),
];
