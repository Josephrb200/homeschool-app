/**
 * Question generators for Pythagoras, trigonometry, congruence and similar shapes.
 *
 * Every diagram is drawn to scale: a test measures each labelled side and angle
 * against its label, and the side or angle marked x against the answer.
 * Tier 1 (guided practice) keeps to the simplest cases and whole-number answers
 * where it can; tier 2 (on your own and the skill check) mixes everything.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher.
 */

import { frac, simplify, type Fraction } from "@/engine/fraction";
import { decimalTolerance, roundTo } from "@/engine/marking";
import type { Rng } from "@/engine/random";
import type { AngleSpec, Question } from "@/engine/types";
import { dirPt } from "../angles/geometry";
import { len, num, pose, rectPts, rightTriangle, triASA, triSAS, triSSS, twoShapes, wellShaped, type P, type Pose, type ShapeMarks } from "./geometry";

export type Tier = 1 | 2;
type Gen = (r: Rng, tier: Tier) => Omit<Question, "id" | "skillId">;
type Wrong = { value: number; misconception: string };

const rad = (d: number) => (d * Math.PI) / 180;
const toDeg = (x: number) => (x * 180) / Math.PI;

export const LENGTH_HELP = "Type the length, like 13. Units are fine but not needed.";
export const LENGTH_DP_HELP = "Type the length rounded to 1 decimal place, like 7.6. Units are fine but not needed.";
export const TRIG_LENGTH_HELP = "Type the length rounded to 1 decimal place, like 6.9. Check your calculator shows D or DEG (degrees mode).";
export const TRIG_ANGLE_HELP = "Type the angle in degrees, rounded to 1 decimal place, like 36.9. Check your calculator shows D or DEG (degrees mode).";
export const ANGLE_HELP = "Type the angle in degrees, like 30. The ° sign is fine but not needed.";
const EXACT_HELP = "Type a whole number or a fraction, like 3 or 5/2. No calculator needed.";
const SIM_HELP = "Type the length as a whole number or a decimal, like 12 or 7.5. Units are fine but not needed.";
const SF_HELP = "Type the scale factor as a whole number, a decimal or a fraction, like 3, 1.5 or 3/2.";

function shuffle<T>(r: Rng, items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = r.int(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Try until `make` returns a value (deterministic, because the rng is seeded). */
function until<T>(make: () => T | null): T {
  for (let k = 0; k < 2000; k++) {
    const v = make();
    if (v !== null) return v;
  }
  throw new Error("triangles: couldn't build a question");
}

const angles = (spec: AngleSpec): Question["visual"] => ({ kind: "angles", angles: spec });

/** A length or angle rounded to 1 decimal place, marked with strict rounding (no π allowance). */
function decimalQ(
  prompt: string,
  visual: AngleSpec | undefined,
  exact: number,
  wrong: Wrong[],
  help: string,
  unit: string,
  hints: string[],
  solution: string[],
): Omit<Question, "id" | "skillId"> {
  const tol = decimalTolerance(exact, 1, true);
  const kept: Wrong[] = [];
  for (const w of wrong) {
    if (!Number.isFinite(w.value) || w.value <= 0) continue;
    // A predicted wrong answer must be clearly different from the right one and from each other.
    if (Math.abs(w.value - exact) <= 2 * tol + 0.05) continue;
    if (kept.some((k) => Math.abs(k.value - w.value) <= 2 * tol + 0.05)) continue;
    kept.push(w);
  }
  return {
    prompt,
    visual: visual ? angles(visual) : undefined,
    answer: { kind: "decimal", exact, dp: 1, strict: true },
    wrongAnswers: kept.map((w) => ({ value: w.value, misconception: w.misconception })),
    answerHelp: help,
    hints,
    solution,
    answerText: unit === "°" ? `${roundTo(exact, 1)}°` : `${roundTo(exact, 1)} ${unit}`,
  };
}

/** An exact answer: a whole number or a fraction (lengths in similar shapes can be 7.5). */
function exactQ(
  prompt: string,
  visual: AngleSpec | undefined,
  value: Fraction,
  wrong: { value: Fraction; misconception: string }[],
  help: string,
  answerText: string,
  hints: string[],
  solution: string[],
): Omit<Question, "id" | "skillId"> {
  const v = simplify(value);
  const seen = new Set<string>([`${v.n}/${v.d}`]);
  const kept = wrong
    .map((w) => ({ value: simplify(w.value), misconception: w.misconception }))
    .filter((w) => {
      const key = `${w.value.n}/${w.value.d}`;
      if (w.value.n < 0 || seen.has(key) || !Number.isFinite(w.value.n / w.value.d)) return false;
      seen.add(key);
      return true;
    });
  return {
    prompt,
    visual: visual ? angles(visual) : undefined,
    answer: v.d === 1 ? { kind: "integer", value: v.n } : { kind: "fraction", value: v, requireSimplest: false, form: "decimal" },
    wrongAnswers: kept,
    answerHelp: help,
    hints,
    solution,
    answerText,
  };
}

/** A whole-number answer, with predicted wrong whole numbers. */
function intQ(prompt: string, visual: AngleSpec | undefined, value: number, wrong: Wrong[], help: string, answerText: string, hints: string[], solution: string[]) {
  return exactQ(
    prompt,
    visual,
    frac(value),
    wrong.filter((w) => Number.isInteger(w.value) && w.value > 0).map((w) => ({ value: frac(w.value), misconception: w.misconception })),
    help,
    answerText,
    hints,
    solution,
  );
}

/** A multiple-choice question. `mcFor(option)` names the misconception for a wrong option. */
function choiceQ(prompt: string, visual: AngleSpec | undefined, options: string[], correct: string, mcFor: (option: string) => string, hints: string[], solution: string[]): Omit<Question, "id" | "skillId"> {
  const correctIndex = options.indexOf(correct);
  if (correctIndex < 0) throw new Error(`choice: ${correct} not in options`);
  return {
    prompt,
    visual: visual ? angles(visual) : undefined,
    answer: { kind: "choice", options, correctIndex },
    wrongAnswers: options.map((o, i) => ({ value: i, misconception: mcFor(o) })).filter((w) => w.value !== correctIndex),
    hints,
    solution,
  };
}

/** A pose for variety: tier 1 only mirrors; tier 2 also turns the triangle. */
function randomPose(r: Rng, tier: Tier): Pose {
  return { flip: r.next() < 0.5, rot: tier === 1 ? 0 : r.pick([0, 0, 90, 180, 270]) + r.int(-12, 12) };
}

/** 1 decimal place, shown as written: 7.0 → "7", 7.25 → "7.25". */
const r1 = (x: number) => roundTo(x, 1);
/** A calculator value to 4 decimal places, for working. */
const c4 = (x: number) => String(Math.round(x * 10000) / 10000);

const LETTERS: [string, string, string][] = [
  ["A", "B", "C"],
  ["P", "Q", "R"],
  ["L", "M", "N"],
  ["X", "Y", "Z"],
  ["D", "E", "F"],
];
/** A side's name with its letters in alphabetical order: "AB", not "BA". */
const sideName = (a: string, b: string) => [a, b].sort().join("");

// ================================================================ Pythagoras

const TRIPLES: [number, number, number][] = [
  [3, 4, 5],
  [6, 8, 10],
  [9, 12, 15],
  [12, 16, 20],
  [5, 12, 13],
  [8, 15, 17],
  [10, 24, 26],
  [20, 21, 29],
  [15, 20, 25],
];

function hypWrong(a: number, b: number): Wrong[] {
  return [
    { value: a + b, misconception: "pyth-added-sides" },
    { value: a * a + b * b, misconception: "pyth-no-root" },
    { value: Math.sqrt(Math.abs(b * b - a * a)), misconception: "pyth-subtracted-for-hyp" },
    { value: Math.sqrt(2 * a + 2 * b), misconception: "pyth-squared-as-double" },
  ];
}

function shortWrong(c: number, a: number): Wrong[] {
  return [
    { value: Math.sqrt(c * c + a * a), misconception: "pyth-added-for-short" },
    { value: c - a, misconception: "pyth-subtracted-sides" },
    { value: c * c - a * a, misconception: "pyth-no-root" },
    { value: c + a, misconception: "pyth-added-sides" },
  ];
}

const HYP_HINTS = ["x is opposite the right angle, so it's the hypotenuse: the longest side.", "Square the two shorter sides and add them (a² + b² = c²). Then square root."];
const SHORT_HINTS = [
  "Find the hypotenuse first: the longest side, opposite the right angle. Is x the hypotenuse?",
  "x is a shorter side, so subtract: (hypotenuse)² − (other side)². Then square root.",
];

/** The two shorter sides of a right-angled triangle, and its hypotenuse. Tier 1 uses whole-number triples. */
function rightSides(r: Rng, tier: Tier): { a: number; b: number; c: number } {
  if (tier === 1) {
    const [a, b, c] = r.pick(TRIPLES);
    return r.next() < 0.5 ? { a, b, c } : { a: b, b: a, c };
  }
  return until(() => {
    const a = r.int(3, 15);
    const b = r.int(3, 15);
    const c = Math.hypot(a, b);
    if (Number.isInteger(c) || Math.max(a, b) / Math.min(a, b) > 2.5) return null;
    return { a, b, c };
  });
}

const findHypotenuse: Gen = (r, tier) => {
  const { a, b, c } = rightSides(r, tier);
  const unit = tier === 1 ? "cm" : r.pick(["cm", "cm", "m", "mm"]);
  const spec = rightTriangle(a, b, {
    sides: { base: len(a, unit), height: len(b, unit), hyp: "x" },
    pose: randomPose(r, tier),
    description: `A right-angled triangle. The two shorter sides are ${a} ${unit} and ${b} ${unit}. The longest side, opposite the right angle, is marked x.`,
  });
  const sq = a * a + b * b;
  const steps = [`x is the hypotenuse (opposite the right angle).`, `x² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${sq}`];
  if (Number.isInteger(c)) {
    return intQ(`Find the length of the side marked x.`, spec, c, hypWrong(a, b), LENGTH_HELP, `${c} ${unit}`, HYP_HINTS, [...steps, `x = √${sq} = ${c} ${unit}`]);
  }
  return decimalQ(
    `Find the length of the side marked x. Give your answer to 1 decimal place.`,
    spec,
    c,
    hypWrong(a, b),
    LENGTH_DP_HELP,
    unit,
    HYP_HINTS,
    [...steps, `x = √${sq} = ${c4(c)}…`, `x = ${r1(c)} ${unit} (to 1 decimal place)`],
  );
};

const findShorter: Gen = (r, tier) => {
  const { a, b, c } =
    tier === 1
      ? rightSides(r, 1)
      : until(() => {
          const c = r.int(6, 20);
          const a = r.int(2, c - 2);
          const b = Math.sqrt(c * c - a * a);
          if (Number.isInteger(b) || Math.max(a, b) / Math.min(a, b) > 2.6) return null;
          return { a, b, c };
        });
  const unit = tier === 1 ? "cm" : r.pick(["cm", "cm", "m"]);
  // a is known, b is x. Either leg can be the base.
  const xOnBase = r.next() < 0.5;
  const spec = rightTriangle(xOnBase ? b : a, xOnBase ? a : b, {
    sides: xOnBase ? { base: "x", height: len(a, unit), hyp: len(c, unit) } : { base: len(a, unit), height: "x", hyp: len(c, unit) },
    pose: randomPose(r, tier),
    description: `A right-angled triangle. The longest side, opposite the right angle, is ${c} ${unit}. One shorter side is ${a} ${unit} and the other is marked x.`,
  });
  const sq = c * c - a * a;
  const steps = [`x is a shorter side. The hypotenuse is ${c} ${unit}.`, `x² = ${c}² − ${a}² = ${c * c} − ${a * a} = ${sq}`];
  if (Number.isInteger(b)) {
    return intQ(`Find the length of the side marked x.`, spec, b, shortWrong(c, a), LENGTH_HELP, `${b} ${unit}`, SHORT_HINTS, [...steps, `x = √${sq} = ${b} ${unit}`]);
  }
  return decimalQ(
    `Find the length of the side marked x. Give your answer to 1 decimal place.`,
    spec,
    b,
    shortWrong(c, a),
    LENGTH_DP_HELP,
    unit,
    SHORT_HINTS,
    [...steps, `x = √${sq} = ${c4(b)}…`, `x = ${r1(b)} ${unit} (to 1 decimal place)`],
  );
};

const whichHypotenuse: Gen = (r) => {
  const [p, q, s] = shuffle(r, [...r.pick(LETTERS)]);
  const { a, b } = rightSides(r, 1);
  const spec = rightTriangle(a, b, {
    names: [p, q, s],
    letters: true,
    pose: { flip: r.next() < 0.5, rot: r.pick([0, 90, 180, 270]) },
    description: `Triangle ${[p, q, s].sort().join("")} with a right angle at ${p}.`,
  });
  const correct = sideName(q, s);
  const options = [sideName(p, q), sideName(q, s), sideName(p, s)].sort();
  return choiceQ(
    `Which side of the triangle is the hypotenuse?`,
    spec,
    options,
    correct,
    () => "pyth-hyp-longest",
    [`Find the right angle (the little square). It's at ${p}.`, `The hypotenuse is the side opposite the right angle: it doesn't touch ${p}.`],
    [`The right angle is at ${p}.`, `The side opposite it, not touching ${p}, is ${correct}.`, `${correct} is the hypotenuse, the longest side.`],
  );
};

const NOT_RIGHT: [number, number, number][] = [
  [5, 6, 8],
  [6, 7, 9],
  [4, 6, 7],
  [7, 9, 12],
  [8, 9, 12],
  [5, 11, 12],
  [6, 9, 11],
];

const isItRight: Gen = (r) => {
  const right = r.next() < 0.5;
  const [a, b, c] = right ? r.pick(TRIPLES.slice(0, 7)) : r.pick(NOT_RIGHT);
  const pts = triSSS(c, b, a); // BC = c is the longest side, opposite A
  const names = ["A", "B", "C"];
  const spec: AngleSpec = {
    points: Object.fromEntries(pts.map((p, i) => [names[i], p])),
    segments: [
      ["A", "B"],
      ["B", "C"],
      ["C", "A"],
    ],
    polygon: names,
    angles: [],
    lengths: [
      { a: "A", b: "B", text: len(a) },
      { a: "C", b: "A", text: len(b) },
      { a: "B", b: "C", text: len(c) },
    ],
    description: `A triangle with sides ${a} cm, ${b} cm and ${c} cm.`,
  };
  const sum = a * a + b * b;
  const yes = "Yes, it is right-angled";
  const no = "No, it isn't right-angled";
  return choiceQ(
    `A triangle has sides ${a} cm, ${b} cm and ${c} cm. Is it a right-angled triangle?`,
    spec,
    [yes, no],
    right ? yes : no,
    () => "pyth-converse",
    [`If it's right-angled, the two shorter sides squared add up to the longest side squared.`, `Work out ${a}² + ${b}² and compare it with ${c}².`],
    [`${a}² + ${b}² = ${a * a} + ${b * b} = ${sum}`, `${c}² = ${c * c}`, right ? `They are equal, so the triangle is right-angled.` : `${sum} isn't ${c * c}, so the triangle isn't right-angled.`],
  );
};

const ladder: Gen = (r) => {
  const { L, d } = until(() => {
    const L = r.int(4, 9);
    // Keep the foot at least a quarter of the ladder's length out, so the triangle isn't a sliver.
    const d = r.int(Math.ceil(L * 2.5), Math.floor(L * 4.5)) / 10;
    const h = Math.sqrt(L * L - d * d);
    return Number.isInteger(Math.round(h * 1e6) / 1e6) ? null : { L, d };
  });
  const h = Math.sqrt(L * L - d * d);
  const spec = rightTriangle(d, h, {
    sides: { base: len(d, "m"), height: "x", hyp: len(L, "m") },
    pose: { flip: r.next() < 0.5 },
    description: `A ladder leaning against a wall makes a right-angled triangle with the wall and the ground. The ladder is ${L} m long, its foot is ${num(d)} m from the wall, and the height up the wall is marked x.`,
  });
  const sq = L * L - d * d;
  return decimalQ(
    `A ladder ${L} m long leans against a vertical wall. The foot of the ladder is ${num(d)} m from the wall. How far up the wall does the ladder reach? Give your answer to 1 decimal place.`,
    spec,
    h,
    shortWrong(L, d),
    LENGTH_DP_HELP,
    "m",
    [`The wall and the ground meet at a right angle. The ladder is the hypotenuse.`, `You want a shorter side, so subtract: ${L}² − ${num(d)}². Then square root.`],
    [`The ladder (${L} m) is the hypotenuse.`, `x² = ${L}² − ${num(d)}² = ${L * L} − ${num(d * d)} = ${num(sq)}`, `x = √${num(sq)} = ${c4(h)}…`, `x = ${r1(h)} m (to 1 decimal place)`],
  );
};

const diagonal: Gen = (r) => {
  const { w, h } = until(() => {
    const w = r.int(5, 16);
    const h = r.int(3, 12);
    return w > h && w / h < 2.6 && !Number.isInteger(Math.hypot(w, h)) ? { w, h } : null;
  });
  const d = Math.hypot(w, h);
  const thing = r.pick([
    ["screen", "wide", "tall"],
    ["rectangular field", "long", "wide"],
    ["rectangular tile", "long", "wide"],
  ] as const);
  const unit = thing[0] === "rectangular field" ? "m" : "cm";
  const spec: AngleSpec = {
    points: { A: [0, 0], B: [w, 0], C: [w, h], D: [0, h] },
    segments: [
      ["A", "B"],
      ["B", "C"],
      ["C", "D"],
      ["D", "A"],
      ["A", "C"],
    ],
    polygon: ["A", "B", "C", "D"],
    angles: [
      { at: "B", from: "C", to: "A", right: true },
      { at: "D", from: "A", to: "C", right: true },
    ],
    lengths: [
      { a: "A", b: "B", text: len(w, unit) },
      { a: "B", b: "C", text: len(h, unit) },
      { a: "A", b: "C", text: "x" },
    ],
    description: `A rectangle ${w} ${unit} by ${h} ${unit} with a diagonal marked x.`,
  };
  const sq = w * w + h * h;
  return decimalQ(
    `A ${thing[0]} is ${w} ${unit} ${thing[1]} and ${h} ${unit} ${thing[2]}. How long is its diagonal? Give your answer to 1 decimal place.`,
    spec,
    d,
    hypWrong(w, h),
    LENGTH_DP_HELP,
    unit,
    [`The diagonal cuts the rectangle into two right-angled triangles. The diagonal is the hypotenuse.`, `Square the two sides and add them. Then square root.`],
    [`The diagonal is the hypotenuse of a right-angled triangle with sides ${w} ${unit} and ${h} ${unit}.`, `x² = ${w}² + ${h}² = ${w * w} + ${h * h} = ${sq}`, `x = √${sq} = ${c4(d)}…`, `x = ${r1(d)} ${unit} (to 1 decimal place)`],
  );
};

const pythagoras: Gen = (r, tier) => {
  const roll = r.next();
  if (tier === 1) {
    if (roll < 0.15) return whichHypotenuse(r, tier);
    if (roll < 0.6) return findHypotenuse(r, tier);
    return findShorter(r, tier);
  }
  if (roll < 0.25) return findHypotenuse(r, tier);
  if (roll < 0.55) return findShorter(r, tier);
  if (roll < 0.7) return isItRight(r, tier);
  if (roll < 0.85) return ladder(r, tier);
  return diagonal(r, tier);
};

// ================================================================ SOHCAHTOA: sides

type Role = "opp" | "adj" | "hyp";
const ROLE_NAME: Record<Role, string> = { opp: "opposite", adj: "adjacent", hyp: "hypotenuse" };
type Fn = "sin" | "cos" | "tan";
const FNS: Record<Fn, (d: number) => number> = { sin: (d) => Math.sin(rad(d)), cos: (d) => Math.cos(rad(d)), tan: (d) => Math.tan(rad(d)) };
const RAD_FNS: Record<Fn, (x: number) => number> = { sin: Math.sin, cos: Math.cos, tan: Math.tan };
const INV: Record<Fn, (x: number) => number> = { sin: (x) => toDeg(Math.asin(x)), cos: (x) => toDeg(Math.acos(x)), tan: (x) => toDeg(Math.atan(x)) };
const INV_RAD: Record<Fn, (x: number) => number> = { sin: Math.asin, cos: Math.acos, tan: Math.atan };

/** Which ratio links two sides, and which side is on top of it. */
function ratioFor(x: Role, y: Role): { fn: Fn; top: Role; bottom: Role } {
  const s = new Set([x, y]);
  if (s.has("opp") && s.has("hyp")) return { fn: "sin", top: "opp", bottom: "hyp" };
  if (s.has("adj") && s.has("hyp")) return { fn: "cos", top: "adj", bottom: "hyp" };
  return { fn: "tan", top: "opp", bottom: "adj" };
}
const SOH: Record<Fn, string> = { sin: "sin θ = opposite ÷ hypotenuse (SOH)", cos: "cos θ = adjacent ÷ hypotenuse (CAH)", tan: "tan θ = opposite ÷ adjacent (TOA)" };

/** Side lengths of the right triangle with angle θ at the base corner, from one known side. */
function sidesFrom(theta: number, known: Role, k: number): Record<Role, number> {
  const s = Math.sin(rad(theta));
  const c = Math.cos(rad(theta));
  if (known === "hyp") return { hyp: k, opp: k * s, adj: k * c };
  if (known === "adj") return { adj: k, hyp: k / c, opp: (k * s) / c };
  return { opp: k, hyp: k / s, adj: (k * c) / s };
}

/** A right triangle with θ at the base corner and the given side texts (by role). */
function trigTriangle(theta: number, sides: Record<Role, number>, texts: Partial<Record<Role, string>>, thetaText: string, p: Pose, description: string, letters?: [string, string, string]): AngleSpec {
  return rightTriangle(sides.adj, sides.opp, {
    names: letters,
    letters: !!letters,
    sides: { base: texts.adj, height: texts.opp, hyp: texts.hyp },
    angle: { at: "base", text: thetaText, highlight: true },
    pose: p,
    description,
  });
}

const LABEL_HINT = "Label the sides from the angle: hypotenuse (opposite the right angle), opposite (across from the angle), adjacent (next to the angle).";

const whichSide: Gen = (r, tier) => {
  const theta = 5 * r.int(6, 12);
  const sides = sidesFrom(theta, "hyp", 8);
  const [R, B, T] = shuffle(r, [...r.pick(LETTERS)]);
  const role = r.pick<Role>(["opp", "adj", "hyp", "opp", "adj"]);
  const names: Record<Role, string> = { adj: sideName(R, B), opp: sideName(R, T), hyp: sideName(B, T) };
  const spec = trigTriangle(theta, sides, {}, "θ", randomPose(r, tier), `Triangle ${[R, B, T].sort().join("")} with a right angle at ${R} and the angle θ at ${B}.`, [R, B, T]);
  return choiceQ(
    role === "hyp" ? `Which side is the hypotenuse?` : role === "opp" ? `Which side is opposite the angle θ?` : `Which side is adjacent to the angle θ (next to it, but not the hypotenuse)?`,
    spec,
    [names.adj, names.opp, names.hyp].sort(),
    names[role],
    () => "trig-side-names",
    [LABEL_HINT, role === "hyp" ? `The hypotenuse doesn't touch the right angle at ${R}.` : role === "opp" ? `The opposite side doesn't touch the angle θ at ${B}.` : `The adjacent side touches θ at ${B}, and isn't the hypotenuse.`],
    [`The hypotenuse is opposite the right angle: ${names.hyp}.`, `The opposite side is across from θ: ${names.opp}.`, `The adjacent side is next to θ: ${names.adj}.`, `So the ${ROLE_NAME[role]} side is ${names[role]}.`],
  );
};

const RATIO_SIDES: Record<Fn, [Role, Role]> = { sin: ["opp", "hyp"], cos: ["adj", "hyp"], tan: ["opp", "adj"] };

const whichRatio = (findAngle: boolean): Gen => (r, tier) => {
  const fn = r.pick<Fn>(["sin", "cos", "tan"]);
  const [known, want] = r.next() < 0.5 ? RATIO_SIDES[fn] : [RATIO_SIDES[fn][1], RATIO_SIDES[fn][0]];
  let spec: AngleSpec;
  if (findAngle) {
    // Both sides known (whole numbers), the angle θ unknown.
    const S = sidesForAngle(r, fn, 15);
    const th = toDeg(Math.atan2(S.opp, S.adj));
    spec = trigTriangle(th, S, { [known]: len(S[known]), [want]: len(S[want]) }, "θ", randomPose(r, tier), `A right-angled triangle with the angle θ marked. The ${ROLE_NAME[known]} side is ${S[known]} cm and the ${ROLE_NAME[want]} side is ${S[want]} cm.`);
  } else {
    const theta = 5 * r.int(6, 12);
    const k = r.int(5, 15);
    spec = trigTriangle(theta, sidesFrom(theta, known, k), { [known]: len(k), [want]: "x" }, `${theta}°`, randomPose(r, tier), `A right-angled triangle with an angle of ${theta}°. The ${ROLE_NAME[known]} side is ${k} cm and the ${ROLE_NAME[want]} side is marked x.`);
  }
  return choiceQ(
    findAngle ? `Which ratio would you use to find the angle θ?` : `Which ratio would you use to find x?`,
    spec,
    ["sin", "cos", "tan"],
    fn,
    () => "trig-choose-ratio",
    [LABEL_HINT, `Which two sides are involved? Then use SOH CAH TOA.`],
    [`The two sides involved are the ${ROLE_NAME[known]} and the ${ROLE_NAME[want]}.`, `${SOH[fn]}.`, `So use ${fn}.`],
  );
};

const findTrigSide: Gen = (r, tier) => {
  const theta = tier === 1 ? 5 * r.int(5, 13) : r.int(18, 72);
  const cases: [Role, Role][] =
    tier === 1
      ? [
          ["hyp", "opp"],
          ["hyp", "adj"],
          ["adj", "opp"],
        ]
      : [
          ["hyp", "opp"],
          ["hyp", "adj"],
          ["adj", "opp"],
          ["opp", "hyp"],
          ["adj", "hyp"],
          ["opp", "adj"],
        ];
  const [known, want] = r.pick(cases);
  const k = tier === 2 && r.next() < 0.3 ? r.int(35, 180) / 10 : r.int(5, 20);
  const unit = r.pick(["cm", "cm", "m"]);
  const sides = sidesFrom(theta, known, k);
  const exact = sides[want];
  const spec = trigTriangle(theta, sides, { [known]: len(k, unit), [want]: "x" }, `${theta}°`, randomPose(r, tier), `A right-angled triangle with an angle of ${theta}°. The ${ROLE_NAME[known]} side is ${num(k)} ${unit} and the ${ROLE_NAME[want]} side is marked x.`);
  const { fn, top } = ratioFor(known, want);
  const multiply = top === want; // x on top of the ratio: x = k × fn(θ)
  const f = FNS[fn](theta);
  const others = (["sin", "cos", "tan"] as Fn[]).filter((g) => g !== fn);
  const wrong: Wrong[] = multiply
    ? [...others.map((g) => ({ value: k * FNS[g](theta), misconception: "trig-wrong-ratio" })), { value: k / f, misconception: "trig-multiply-divide" }, { value: k * RAD_FNS[fn](theta), misconception: "trig-radians" }]
    : [...others.map((g) => ({ value: k / FNS[g](theta), misconception: "trig-wrong-ratio" })), { value: k * f, misconception: "trig-multiply-divide" }, { value: k / RAD_FNS[fn](theta), misconception: "trig-radians" }];
  const K = num(k);
  const eq = multiply ? `${fn} ${theta}° = x ÷ ${K}` : `${fn} ${theta}° = ${K} ÷ x`;
  const solve = multiply ? `x = ${K} × ${fn} ${theta}°` : `x = ${K} ÷ ${fn} ${theta}°`;
  return decimalQ(
    `Find the length of the side marked x. Give your answer to 1 decimal place.`,
    spec,
    exact,
    wrong,
    TRIG_LENGTH_HELP,
    unit,
    [LABEL_HINT, `You know the ${ROLE_NAME[known]} and want the ${ROLE_NAME[want]}, so use ${fn}: ${SOH[fn]}.`, multiply ? `Write ${eq}. Then multiply both sides by ${K}.` : `Write ${eq}. x is on the bottom, so x = ${K} ÷ ${fn} ${theta}°.`],
    [`From the ${theta}° angle: ${num(k)} ${unit} is the ${ROLE_NAME[known]}, x is the ${ROLE_NAME[want]}.`, `${SOH[fn]}, so ${eq}`, `${solve} = ${c4(exact)}…`, `x = ${r1(exact)} ${unit} (to 1 decimal place)`],
  );
};

const trigSides: Gen = (r, tier) => {
  const roll = r.next();
  if (tier === 1) {
    if (roll < 0.2) return whichSide(r, tier);
    if (roll < 0.4) return whichRatio(false)(r, tier);
    return findTrigSide(r, tier);
  }
  if (roll < 0.15) return whichRatio(false)(r, tier);
  return findTrigSide(r, tier);
};

// ================================================================ SOHCAHTOA: angles

/** Two whole-number sides that make a clear right triangle, for each ratio. */
function sidesForAngle(r: Rng, fn: Fn, big = 20): Record<Role, number> {
  return until(() => {
    if (fn === "tan") {
      const opp = r.int(3, 15);
      const adj = r.int(3, 15);
      const t = opp / adj;
      return t >= 0.36 && t <= 2.75 && opp !== adj ? { opp, adj, hyp: Math.hypot(opp, adj) } : null;
    }
    const hyp = r.int(6, big);
    const leg = r.int(Math.ceil(hyp * 0.3), Math.floor(hyp * 0.92));
    if (leg >= hyp) return null;
    const other = Math.sqrt(hyp * hyp - leg * leg);
    return fn === "sin" ? { hyp, opp: leg, adj: other } : { hyp, adj: leg, opp: other };
  });
}

function angleWrong(fn: Fn, ratio: number, top: number, bottom: number): Wrong[] {
  const out: Wrong[] = [];
  for (const g of ["sin", "cos", "tan"] as Fn[]) if (g !== fn && (g === "tan" || ratio <= 1)) out.push({ value: INV[g](ratio), misconception: "trig-wrong-ratio" });
  if (fn === "tan") out.unshift({ value: INV.tan(bottom / top), misconception: "trig-divided-wrong-way" });
  out.push({ value: ratio, misconception: "trig-no-inverse" });
  out.push({ value: INV_RAD[fn](ratio), misconception: "trig-radians" });
  return out;
}

const findTrigAngle: Gen = (r, tier) => {
  const fn = r.pick<Fn>(["sin", "cos", "tan"]);
  const S = sidesForAngle(r, fn);
  const { top, bottom } = ratioFor(fn === "tan" ? "opp" : fn === "sin" ? "opp" : "adj", fn === "tan" ? "adj" : "hyp");
  const ratio = S[top] / S[bottom];
  const theta = INV[fn](ratio);
  const unit = r.pick(["cm", "cm", "m"]);
  const spec = trigTriangle(theta, S, { [top]: len(S[top], unit), [bottom]: len(S[bottom], unit) }, "θ", randomPose(r, tier), `A right-angled triangle with the angle θ marked. The ${ROLE_NAME[top]} side is ${S[top]} ${unit} and the ${ROLE_NAME[bottom]} side is ${S[bottom]} ${unit}.`);
  return decimalQ(
    `Find the angle θ. Give your answer to 1 decimal place.`,
    spec,
    theta,
    angleWrong(fn, ratio, S[top], S[bottom]),
    TRIG_ANGLE_HELP,
    "°",
    [LABEL_HINT, `You know the ${ROLE_NAME[top]} and the ${ROLE_NAME[bottom]}, so use ${fn}: ${SOH[fn]}.`, `${fn} θ = ${S[top]} ÷ ${S[bottom]}. To undo ${fn}, use ${fn}⁻¹ (SHIFT then ${fn}).`],
    [`From θ: ${S[top]} ${unit} is the ${ROLE_NAME[top]}, ${S[bottom]} ${unit} is the ${ROLE_NAME[bottom]}.`, `${fn} θ = ${S[top]} ÷ ${S[bottom]}`, `θ = ${fn}⁻¹(${S[top]} ÷ ${S[bottom]}) = ${c4(theta)}…°`, `θ = ${r1(theta)}° (to 1 decimal place)`],
  );
};

const fromRatio: Gen = (r) => {
  const fn = r.pick<Fn>(["sin", "cos", "tan"]);
  const value = fn === "tan" ? r.int(3, 30) / 10 : r.int(15, 95) / 100;
  const theta = INV[fn](value);
  return decimalQ(
    `${fn} θ = ${value}. Find the angle θ. Give your answer to 1 decimal place.`,
    undefined,
    theta,
    [
      { value: FNS[fn](value), misconception: "trig-no-inverse" },
      ...(["sin", "cos", "tan"] as Fn[]).filter((g) => g !== fn && (g === "tan" || value <= 1)).map((g) => ({ value: INV[g](value), misconception: "trig-wrong-ratio" })),
      { value: INV_RAD[fn](value), misconception: "trig-radians" },
    ],
    TRIG_ANGLE_HELP,
    "°",
    [`To find the angle from its ${fn}, use the inverse: ${fn}⁻¹.`, `On most calculators: SHIFT, then ${fn}, then ${value}.`],
    [`θ = ${fn}⁻¹(${value})`, `= ${c4(theta)}…°`, `θ = ${r1(theta)}° (to 1 decimal place)`],
  );
};

const angleProblem: Gen = (r) => {
  if (r.next() < 0.5) {
    // A ramp: length along the slope and height it rises.
    const { L, h } = until(() => {
      const L = r.int(20, 60) / 10;
      const h = r.int(4, Math.floor(L * 5)) / 10;
      const t = INV.sin(h / L);
      return t >= 10 && t <= 30 ? { L, h } : null;
    });
    const theta = INV.sin(h / L);
    const base = Math.sqrt(L * L - h * h);
    const spec = trigTriangle(theta, { opp: h, adj: base, hyp: L }, { hyp: len(L, "m"), opp: len(h, "m") }, "θ", { flip: r.next() < 0.5 }, `A ramp shown as a right-angled triangle. The sloping side is ${num(L)} m and the height is ${num(h)} m. The angle θ is between the ramp and the ground.`);
    return decimalQ(
      `A ramp is ${num(L)} m long and rises ${num(h)} m. Find the angle θ between the ramp and the ground. Give your answer to 1 decimal place.`,
      spec,
      theta,
      angleWrong("sin", h / L, h, L),
      TRIG_ANGLE_HELP,
      "°",
      [`The ramp is the hypotenuse. The height is opposite θ.`, `Opposite and hypotenuse: use sin. sin θ = ${num(h)} ÷ ${num(L)}.`],
      [`The ramp (${num(L)} m) is the hypotenuse; the height (${num(h)} m) is opposite θ.`, `sin θ = ${num(h)} ÷ ${num(L)}`, `θ = sin⁻¹(${num(h)} ÷ ${num(L)}) = ${c4(theta)}…°`, `θ = ${r1(theta)}° (to 1 decimal place)`],
    );
  }
  // A ladder: its length and how far its foot is from the wall.
  const { L, d } = until(() => {
    const L = r.int(3, 8);
    const d = r.int(5, L * 6) / 10;
    const t = INV.cos(d / L);
    return t >= 55 && t <= 80 ? { L, d } : null;
  });
  const theta = INV.cos(d / L);
  const h = Math.sqrt(L * L - d * d);
  const spec = trigTriangle(theta, { adj: d, opp: h, hyp: L }, { hyp: len(L, "m"), adj: len(d, "m") }, "θ", { flip: r.next() < 0.5 }, `A ladder against a wall shown as a right-angled triangle. The ladder is ${L} m long and its foot is ${num(d)} m from the wall. The angle θ is between the ladder and the ground.`);
  return decimalQ(
    `A ladder ${L} m long leans against a wall. Its foot is ${num(d)} m from the wall. Find the angle θ between the ladder and the ground. Give your answer to 1 decimal place.`,
    spec,
    theta,
    angleWrong("cos", d / L, d, L),
    TRIG_ANGLE_HELP,
    "°",
    [`The ladder is the hypotenuse. The ground, from the foot of the ladder to the wall, is next to θ: the adjacent side.`, `Adjacent and hypotenuse: use cos. cos θ = ${num(d)} ÷ ${L}.`],
    [`The ladder (${L} m) is the hypotenuse; the ground (${num(d)} m) is adjacent to θ.`, `cos θ = ${num(d)} ÷ ${L}`, `θ = cos⁻¹(${num(d)} ÷ ${L}) = ${c4(theta)}…°`, `θ = ${r1(theta)}° (to 1 decimal place)`],
  );
};

const trigAngles: Gen = (r, tier) => {
  const roll = r.next();
  if (tier === 1) {
    if (roll < 0.15) return whichRatio(true)(r, tier);
    if (roll < 0.35) return fromRatio(r, tier);
    return findTrigAngle(r, tier);
  }
  if (roll < 0.1) return fromRatio(r, tier);
  if (roll < 0.35) return angleProblem(r, tier);
  return findTrigAngle(r, tier);
};

// ================================================================ Exact trig values

type ExactAngle = 0 | 30 | 45 | 60 | 90;
const EXACT: Record<Fn, Partial<Record<ExactAngle, string>>> = {
  sin: { 0: "0", 30: "1/2", 45: "√2/2", 60: "√3/2", 90: "1" },
  cos: { 0: "1", 30: "√3/2", 45: "√2/2", 60: "1/2", 90: "0" },
  tan: { 0: "0", 30: "√3/3", 45: "1", 60: "√3" },
};
const VALUE_POOL = ["0", "1/2", "√2/2", "√3/2", "1", "√3/3", "√3"];
const MIRROR: Record<ExactAngle, ExactAngle> = { 0: 90, 30: 60, 45: 45, 60: 30, 90: 0 };
/** Rational exact values, for questions without surds. */
const RATIONAL: { text: string; v: Fraction; fn: Fn; a: ExactAngle }[] = [
  { text: "sin 30°", v: frac(1, 2), fn: "sin", a: 30 },
  { text: "cos 60°", v: frac(1, 2), fn: "cos", a: 60 },
  { text: "tan 45°", v: frac(1), fn: "tan", a: 45 },
  { text: "sin 90°", v: frac(1), fn: "sin", a: 90 },
  { text: "cos 0°", v: frac(1), fn: "cos", a: 0 },
  { text: "sin 0°", v: frac(0), fn: "sin", a: 0 },
  { text: "cos 90°", v: frac(0), fn: "cos", a: 90 },
];

const EXACT_HINTS = [
  "Picture the two triangles. Half a square: sides 1, 1 and √2, angles 45°. Half an equilateral triangle: sides 1, √3 and 2, angles 30° and 60°.",
  "Then use SOH CAH TOA on the triangle.",
];

const exactValueChoice: Gen = (r, tier) => {
  const fn = tier === 1 ? r.pick<Fn>(["sin", "cos"]) : r.pick<Fn>(["sin", "cos", "tan"]);
  const angle = r.pick(Object.keys(EXACT[fn]).map(Number) as ExactAngle[]);
  const correct = EXACT[fn][angle]!;
  const candidates: { text: string; mc: string }[] = [];
  if (fn !== "tan") candidates.push({ text: EXACT[fn === "sin" ? "cos" : "sin"][angle]!, mc: "exact-sin-cos-swap" });
  const mirror = EXACT[fn][MIRROR[angle]];
  if (mirror) candidates.push({ text: mirror, mc: angle === 0 || angle === 90 ? "exact-0-90" : "exact-30-60-swap" });
  // sin and cos are never more than 1, so their wrong options come from the sin/cos values only.
  for (const t of shuffle(r, fn === "tan" ? VALUE_POOL : VALUE_POOL.slice(0, 5))) candidates.push({ text: t, mc: fn === "tan" ? "exact-tan" : t === "0" || t === "1" ? "exact-0-90" : "exact-30-60-swap" });
  const picked: { text: string; mc: string }[] = [];
  for (const c of candidates) if (c.text !== correct && !picked.some((p) => p.text === c.text) && picked.length < 3) picked.push(c);
  const options = shuffle(r, [correct, ...picked.map((p) => p.text)]);
  return choiceQ(
    `What is the exact value of ${fn} ${angle}°?`,
    undefined,
    options,
    correct,
    (o) => picked.find((p) => p.text === o)?.mc ?? "",
    EXACT_HINTS,
    exactSolution(fn, angle),
  );
};

function exactSolution(fn: Fn, angle: ExactAngle): string[] {
  const v = EXACT[fn][angle]!;
  if (angle === 45) return [`Use half a square: sides 1, 1 and √2 (the hypotenuse).`, fn === "tan" ? `tan 45° = opposite ÷ adjacent = 1 ÷ 1 = 1` : `${fn} 45° = 1 ÷ √2 = √2/2`];
  if (angle === 30 || angle === 60) {
    const opp = angle === 30 ? "1" : "√3";
    const adj = angle === 30 ? "√3" : "1";
    const work = fn === "sin" ? `opposite ÷ hypotenuse = ${opp} ÷ 2` : fn === "cos" ? `adjacent ÷ hypotenuse = ${adj} ÷ 2` : `opposite ÷ adjacent = ${opp} ÷ ${adj}`;
    return [`Use half an equilateral triangle: hypotenuse 2, short side 1 (opposite 30°), and √3 (opposite 60°).`, `${fn} ${angle}° = ${work} = ${v}`];
  }
  return [
    angle === 0 ? `At 0° the opposite side has shrunk to nothing, and the adjacent side is as long as the hypotenuse.` : `At 90° the adjacent side has shrunk to nothing, and the opposite side is as long as the hypotenuse.`,
    `So ${fn} ${angle}° = ${v}.`,
  ];
}

const angleFromValue: Gen = (r, tier) => {
  const fn = tier === 1 ? r.pick<Fn>(["sin", "cos"]) : r.pick<Fn>(["sin", "cos", "tan"]);
  // 0° and 90° are left out: "between 0° and 90°" would be unclear at the ends.
  const choices = (Object.keys(EXACT[fn]).map(Number) as ExactAngle[]).filter((a) => a !== 0 && a !== 90);
  const angle = r.pick(choices);
  const v = EXACT[fn][angle]!;
  const swap = fn === "tan" ? (angle === 30 ? 60 : angle === 60 ? 30 : undefined) : MIRROR[angle];
  return intQ(
    `θ is between 0° and 90°, and ${fn} θ = ${v}. What is θ?`,
    undefined,
    angle,
    swap !== undefined ? [{ value: swap, misconception: fn === "tan" ? "exact-tan" : "exact-sin-cos-swap" }] : [],
    ANGLE_HELP,
    `${angle}°`,
    [...EXACT_HINTS.slice(0, 1), `Which angle gives ${fn} = ${v}?`],
    [...exactSolution(fn, angle), `So θ = ${angle}°.`],
  );
};

const exactTriangle: Gen = (r, tier) => {
  type Case = { angle: 30 | 45 | 60; known: Role; want: Role };
  const cases: Case[] = [
    { angle: 30, known: "hyp", want: "opp" },
    { angle: 60, known: "hyp", want: "adj" },
    { angle: 45, known: "adj", want: "opp" },
  ];
  if (tier === 2)
    cases.push(
      { angle: 30, known: "opp", want: "hyp" },
      { angle: 60, known: "adj", want: "hyp" },
    );
  const c = r.pick(cases);
  const k = c.known === "hyp" ? 2 * r.int(2, 12) : r.int(3, 14);
  const sides = sidesFrom(c.angle, c.known, k);
  const ans = Math.round(sides[c.want]);
  const spec = trigTriangle(c.angle, sides, { [c.known]: len(k), [c.want]: "x" }, `${c.angle}°`, randomPose(r, tier), `A right-angled triangle with an angle of ${c.angle}°. The ${ROLE_NAME[c.known]} side is ${k} cm and the ${ROLE_NAME[c.want]} side is marked x.`);
  const { fn, top } = ratioFor(c.known, c.want);
  const v = EXACT[fn][c.angle]!;
  const multiply = top === c.want;
  return intQ(
    `Without a calculator, find the length of the side marked x.`,
    spec,
    ans,
    multiply ? [{ value: k, misconception: "exact-whole-side" }, { value: 2 * k, misconception: "trig-multiply-divide" }] : [{ value: k, misconception: "exact-whole-side" }, { value: k / 2, misconception: "trig-multiply-divide" }],
    LENGTH_HELP,
    `${ans} cm`,
    [LABEL_HINT, `Use ${fn}: ${SOH[fn]}. ${fn} ${c.angle}° = ${v}.`],
    [
      `From the ${c.angle}° angle: ${k} cm is the ${ROLE_NAME[c.known]}, x is the ${ROLE_NAME[c.want]}.`,
      multiply ? `${fn} ${c.angle}° = x ÷ ${k}, so x = ${k} × ${fn} ${c.angle}°` : `${fn} ${c.angle}° = ${k} ÷ x, so x = ${k} ÷ ${fn} ${c.angle}°`,
      `${fn} ${c.angle}° = ${v}, so x = ${k} ${multiply ? "×" : "÷"} ${v} = ${ans} cm`,
    ],
  );
};

const exactExpression: Gen = (r) => {
  const { t1, t2, m, n, plus } = until(() => {
    const [t1, t2] = [r.pick(RATIONAL), r.pick(RATIONAL)];
    if (t1.text === t2.text || (t1.v.n === 0 && t2.v.n === 0)) return null;
    const m = r.int(1, 6);
    const n = r.int(1, 6);
    const plus = r.next() < 0.6;
    const val = m * (t1.v.n / t1.v.d) + (plus ? 1 : -1) * n * (t2.v.n / t2.v.d);
    return val > 0 ? { t1, t2, m, n, plus } : null;
  });
  const term = (c: number, t: (typeof RATIONAL)[number]) => (c === 1 ? t.text : `${c} ${t.text}`);
  const value = (v1: Fraction, v2: Fraction) => simplify(frac(m * v1.n * v2.d + (plus ? 1 : -1) * n * v2.n * v1.d, v1.d * v2.d));
  const ans = value(t1.v, t2.v);
  // The 0°/90° mix-up: swap sin and cos for the 0° and 90° terms.
  const swapped = (t: (typeof RATIONAL)[number]) => (t.a === 0 || t.a === 90 ? frac(t.v.n === 0 ? 1 : 0) : t.v);
  const wrong = [{ value: value(swapped(t1), swapped(t2)), misconception: "exact-0-90" }].filter((w) => w.value.n >= 0);
  const expr = `${term(m, t1)} ${plus ? "+" : "−"} ${term(n, t2)}`;
  const showV = (f: Fraction) => (f.d === 1 ? String(f.n) : `${f.n}/${f.d}`);
  return exactQ(
    `Without a calculator, work out the exact value of ${expr}.`,
    undefined,
    ans,
    wrong,
    EXACT_HELP,
    showV(ans),
    [`Replace each trig value with its exact value first.`, `${t1.text} = ${showV(t1.v)} and ${t2.text} = ${showV(t2.v)}.`],
    [`${t1.text} = ${showV(t1.v)} and ${t2.text} = ${showV(t2.v)}`, `${expr} = ${m === 1 ? "" : `${m} × `}${showV(t1.v)} ${plus ? "+" : "−"} ${n === 1 ? "" : `${n} × `}${showV(t2.v)}`, `= ${showV(ans)}`],
  );
};

const exactTrig: Gen = (r, tier) => {
  const roll = r.next();
  if (tier === 1) {
    if (roll < 0.5) return exactValueChoice(r, tier);
    if (roll < 0.75) return angleFromValue(r, tier);
    return exactTriangle(r, tier);
  }
  if (roll < 0.3) return exactValueChoice(r, tier);
  if (roll < 0.6) return exactTriangle(r, tier);
  if (roll < 0.85) return exactExpression(r, tier);
  return angleFromValue(r, tier);
};

// ================================================================ Congruence

const COND = ["SSS", "SAS", "ASA", "RHS"] as const;
const NONE = "Not enough to say";
type Cond = (typeof COND)[number] | typeof NONE;

function congMc(correct: Cond, chosen: string): string {
  if (chosen === NONE) return "cong-said-not";
  if (correct === NONE) return "cong-aaa";
  if (correct === "RHS" || chosen === "RHS") return "cong-rhs";
  if (correct === "SSS") return "cong-sss";
  if (chosen === "SSS") return "cong-count";
  return "cong-sas-asa";
}

const COND_RULE: Record<Cond, string> = {
  SSS: "All three pairs of sides are equal: SSS (side, side, side).",
  SAS: "Two pairs of sides are equal, and so is the angle between them: SAS (side, angle, side).",
  ASA: "Two pairs of angles are equal, and so is the side between them: ASA (angle, side, angle).",
  RHS: "Both have a right angle, equal hypotenuses and another equal side: RHS (right angle, hypotenuse, side).",
  [NONE]: "Only the angles match. The triangles are the same shape, but one is bigger, so they aren't congruent. Matching angles alone never prove congruence.",
};

/** A triangle (points A, B, C) with the marks that show one congruence condition. */
function congTriangle(r: Rng, cond: Cond): { pts: P[]; marks: ShapeMarks; facts: string } {
  return until(() => {
    if (cond === "SSS") {
      const [a, b, c] = [r.int(4, 11), r.int(4, 11), r.int(4, 11)];
      if (a + b <= c + 2 || b + c <= a + 2 || a + c <= b + 2 || new Set([a, b, c]).size < 3) return null;
      const pts = triSSS(a, b, c);
      if (!wellShaped(pts)) return null;
      return { pts, marks: { sides: [{ i: 0, text: len(c) }, { i: 1, text: len(a) }, { i: 2, text: len(b) }] }, facts: `sides ${c} cm, ${a} cm and ${b} cm` };
    }
    if (cond === "SAS") {
      const [c, b, A] = [r.int(5, 11), r.int(4, 10), 5 * r.int(8, 22)];
      if (c === b) return null;
      const pts = triSAS(c, A, b);
      if (!wellShaped(pts)) return null;
      return { pts, marks: { sides: [{ i: 0, text: len(c) }, { i: 2, text: len(b) }], angles: [{ i: 0, text: `${A}°` }] }, facts: `sides ${c} cm and ${b} cm with ${A}° between them` };
    }
    if (cond === "ASA" || cond === NONE) {
      const [A, c, B] = [5 * r.int(7, 18), r.int(5, 11), 5 * r.int(7, 18)];
      if (A === B || A + B > 145) return null;
      const pts = triASA(A, c, B);
      if (!wellShaped(pts)) return null;
      if (cond === NONE) return { pts, marks: { angles: [{ i: 0, text: `${A}°` }, { i: 1, text: `${B}°` }, { i: 2, text: `${180 - A - B}°` }] }, facts: `angles ${A}°, ${B}° and ${180 - A - B}°` };
      return { pts, marks: { sides: [{ i: 0, text: len(c) }], angles: [{ i: 0, text: `${A}°` }, { i: 1, text: `${B}°` }] }, facts: `angles ${A}° and ${B}° with ${c} cm between them` };
    }
    // RHS: right angle at A, AB = leg, BC = hypotenuse.
    const [leg, hyp] = [r.int(4, 10), r.int(6, 14)];
    const other = Math.sqrt(hyp * hyp - leg * leg);
    if (!(other > 0) || hyp - leg < 2 || Number.isInteger(other)) return null;
    const pts: P[] = [
      [0, 0],
      [leg, 0],
      [0, other],
    ];
    if (!wellShaped(pts, 20, 90)) return null;
    return { pts, marks: { sides: [{ i: 0, text: len(leg) }, { i: 1, text: len(hyp) }], angles: [{ i: 0, right: true }] }, facts: `a right angle, a hypotenuse of ${hyp} cm and another side of ${leg} cm` };
  });
}

/** Turn and maybe mirror the copy. */
function copyPose(r: Rng, tier: Tier): Pose {
  return { flip: r.next() < 0.5, rot: tier === 1 ? r.pick([0, 180, 90, 270]) : r.int(0, 359) };
}

const congruenceReason: Gen = (r, tier) => {
  const cond: Cond = tier === 2 && r.next() < 0.2 ? NONE : r.pick(COND);
  const t = congTriangle(r, cond);
  const p = copyPose(r, tier);
  const second = pose(t.pts, { ...p, k: cond === NONE ? r.pick([1.4, 1.5, 1.6]) : 1 });
  const spec = twoShapes(
    { pts: t.pts, names: ["A", "B", "C"], marks: t.marks },
    { pts: second, names: ["D", "E", "F"], marks: t.marks },
    { description: `Two triangles. Each is marked with ${t.facts}. The second triangle is ${p.flip ? "flipped over and " : ""}turned${cond === NONE ? ", and bigger" : ""}.` },
  );
  const options = [...COND, NONE];
  return choiceQ(
    `Are these two triangles congruent? Choose the reason, or "${NONE}".`,
    spec,
    options,
    cond,
    (o) => congMc(cond, o),
    [`Count what matches: how many pairs of sides, and how many pairs of angles?`, `For SAS the angle must be between the two sides. For ASA the side must be between the two angles. RHS needs a right angle.`],
    [`Both triangles have ${t.facts}.`, COND_RULE[cond]],
  );
};

const congruentSide: Gen = (r, tier) => {
  const t = congTriangle(r, "SSS");
  const xi = r.int(0, 2);
  const values = t.marks.sides!.map((s) => Number(s.text.split(" ")[0]));
  const spec = twoShapes(
    { pts: t.pts, names: ["A", "B", "C"], marks: t.marks },
    { pts: pose(t.pts, copyPose(r, tier)), names: ["D", "E", "F"], marks: { sides: t.marks.sides!.map((s) => (s.i === xi ? { i: s.i, text: "x" } : s)) } },
    { description: `Two congruent triangles. The first has sides ${values.join(" cm, ")} cm. The second is turned, with two sides labelled and one marked x.` },
  );
  const ans = values[xi];
  return intQ(
    `These two triangles are congruent. Find the length of the side marked x.`,
    spec,
    ans,
    values.filter((_, i) => i !== xi).map((v) => ({ value: v, misconception: "cong-corresponding" })),
    LENGTH_HELP,
    `${ans} cm`,
    [`Congruent means exactly the same shape and size: every side in one triangle matches a side in the other.`, `Match the sides you know. Which side of the first triangle is left over?`],
    [`The sides that match are the same length.`, `The second triangle has ${values.filter((_, i) => i !== xi).join(" cm and ")} cm, which match two sides of the first.`, `The side left over in the first triangle is ${ans} cm, so x = ${ans} cm.`],
  );
};

const congruentAngle: Gen = (r, tier) => {
  const { A, B, c, pts } = until(() => {
    const [A, c, B] = [5 * r.int(7, 18), r.int(5, 11), 5 * r.int(7, 18)];
    if (A === B || A + B > 145 || 180 - A - B === A || 180 - A - B === B) return null;
    const pts = triASA(A, c, B);
    return wellShaped(pts) ? { A, B, c, pts } : null;
  });
  const C = 180 - A - B;
  const xAt = tier === 1 ? 1 : r.pick([1, 2]);
  const ans = xAt === 1 ? B : C;
  const spec = twoShapes(
    { pts, names: ["A", "B", "C"], marks: { sides: [{ i: 0, text: len(c) }], angles: [{ i: 0, text: `${A}°` }, { i: 1, text: `${B}°` }] } },
    { pts: pose(pts, copyPose(r, tier)), names: ["D", "E", "F"], marks: { sides: [{ i: 0, text: len(c) }], angles: [{ i: 0, text: `${A}°` }, { i: xAt, text: "x" }] } },
    { description: `Two congruent triangles. The first has a ${c} cm side with angles ${A}° and ${B}° at its ends. The second is turned; its ${c} cm side has ${A}° at one end, and the angle marked x is ${xAt === 1 ? "at the other end of that side" : "opposite that side"}.` },
  );
  return intQ(
    `These two triangles are congruent. Find the angle marked x.`,
    spec,
    ans,
    xAt === 1
      ? [
          { value: C, misconception: "cong-corresponding" },
          { value: A, misconception: "cong-corresponding" },
        ]
      : [
          { value: B, misconception: "cong-corresponding" },
          { value: A, misconception: "cong-corresponding" },
        ],
    ANGLE_HELP,
    `${ans}°`,
    [`Match the triangles using the ${c} cm side and the ${A}° angle. They can be turned or flipped.`, xAt === 1 ? `x is at the other end of the ${c} cm side from ${A}°.` : `x is opposite the ${c} cm side. Use the angles in a triangle.`],
    xAt === 1
      ? [`In both triangles the ${c} cm side has ${A}° at one end.`, `So the angle at the other end matches too: x = ${B}°.`]
      : [`x is opposite the ${c} cm side, so it matches the third angle of the first triangle.`, `Angles in a triangle add up to 180°: 180° − ${A}° − ${B}° = ${C}°.`, `x = ${C}°`],
  );
};

const congruence: Gen = (r, tier) => {
  const roll = r.next();
  if (tier === 1) {
    if (roll < 0.6) return congruenceReason(r, tier);
    if (roll < 0.8) return congruentSide(r, tier);
    return congruentAngle(r, tier);
  }
  if (roll < 0.6) return congruenceReason(r, tier);
  return congruentAngle(r, tier);
};

// ================================================================ Similar shapes

/** An exact fraction for a length like 7.5 or 4/3 (denominators up to 12). */
const fr = (x: number): Fraction => {
  for (let d = 1; d <= 12; d++) if (Math.abs(x * d - Math.round(x * d)) < 1e-9) return simplify(frac(Math.round(x * d), d));
  return frac(-1); // not a tidy number: dropped from predicted wrong answers
};

/** Scale factors: whole in tier 1, halves too in tier 2. */
const scaleFactor = (r: Rng, tier: Tier) => (tier === 1 ? r.pick([2, 3]) : r.pick([1.5, 2, 2.5, 3, 1.5, 2.5]));

const sfText = (k: number) => num(k);

function similarMissing(r: Rng, tier: Tier, shape: "triangle" | "rectangle") {
  const k = scaleFactor(r, tier);
  const smallFirst = tier === 1 || r.next() < 0.6;
  // Unknown side in the big shape (usual) or in the small one (tier 2).
  const xInBig = tier === 1 || r.next() < 0.7;
  const make = () => {
    if (shape === "rectangle") {
      const [w, h] = [r.int(2, k > 2 ? 5 : 7), r.int(2, k > 2 ? 4 : 6)];
      if (w === h) return null;
      return { pts: rectPts(w, h), s: [w, h], sideIdx: [0, 1], angle: undefined as number | undefined };
    }
    const [c, b, A] = [r.int(3, k > 2 ? 6 : 8), r.int(3, k > 2 ? 6 : 8), 5 * r.int(9, 20)];
    if (c === b) return null;
    const pts = triSAS(c, A, b);
    if (!wellShaped(pts)) return null;
    return { pts, s: [c, b], sideIdx: [0, 2], angle: A as number | undefined };
  };
  const base = until(make);
  const small = base.s;
  const big = small.map((v) => v * k);
  const j = r.int(0, 1); // which side is unknown
  const o = 1 - j;
  const unit = "cm";
  const smallMarks: ShapeMarks = {
    sides: [
      { i: base.sideIdx[o], text: len(small[o], unit) },
      { i: base.sideIdx[j], text: xInBig ? len(small[j], unit) : "x" },
    ],
    angles: base.angle ? [{ i: 0, text: `${base.angle}°` }] : shape === "rectangle" ? [0, 1, 2, 3].map((i) => ({ i, right: true })) : undefined,
  };
  const bigMarks: ShapeMarks = {
    sides: [
      { i: base.sideIdx[o], text: len(big[o], unit) },
      { i: base.sideIdx[j], text: xInBig ? "x" : len(big[j], unit) },
    ],
    angles: smallMarks.angles,
  };
  const bigPts = pose(base.pts, { k, ...(tier === 2 && shape === "triangle" ? { flip: r.next() < 0.5, rot: r.pick([0, 0, 90, 180]) } : {}) });
  const A = { pts: base.pts, names: shape === "triangle" ? ["A", "B", "C"] : ["A", "B", "C", "D"], marks: smallMarks };
  const B = { pts: bigPts, names: shape === "triangle" ? ["P", "Q", "R"] : ["P", "Q", "R", "S"], marks: bigMarks };
  const spec = twoShapes(smallFirst ? A : B, smallFirst ? B : A, {
    description: `Two similar ${shape}s. The smaller has sides ${xInBig ? `${num(small[o])} cm and ${num(small[j])} cm` : `${num(small[o])} cm and x`}. The larger has matching sides ${xInBig ? `${num(big[o])} cm and x` : `${num(big[o])} cm and ${num(big[j])} cm`}.`,
  });
  const ans = xInBig ? big[j] : small[j];
  const diff = big[o] - small[o];
  const wrong = xInBig
    ? [
        { value: fr(small[j] + diff), misconception: "sim-added" },
        { value: fr(small[j] / k), misconception: "sim-inverse-sf" },
        { value: fr(small[o] * k * k), misconception: "sim-wrong-pair" },
      ]
    : [
        { value: fr(big[j] - diff), misconception: "sim-added" },
        { value: fr(big[j] * k), misconception: "sim-inverse-sf" },
      ];
  const sf = `${num(big[o])} ÷ ${num(small[o])} = ${sfText(k)}`;
  return exactQ(
    `These ${shape}s are similar. Find the length of the side marked x.`,
    spec,
    fr(ans),
    wrong.filter((w) => w.value.n > 0),
    SIM_HELP,
    `${num(ans)} cm`,
    [`Find a pair of matching sides where you know both lengths. Divide to get the scale factor.`, xInBig ? `Multiply the matching side of the small ${shape} by the scale factor.` : `Divide the matching side of the big ${shape} by the scale factor.`],
    [`Matching sides: ${num(small[o])} cm and ${num(big[o])} cm. Scale factor = ${sf}.`, xInBig ? `x = ${num(small[j])} × ${sfText(k)} = ${num(ans)} cm` : `x = ${num(big[j])} ÷ ${sfText(k)} = ${num(ans)} cm`],
  );
}

const findScaleFactor: Gen = (r, tier) => {
  const k = scaleFactor(r, tier);
  const { w, h } = until(() => {
    const w = r.int(2, 6);
    const h = r.int(2, 5);
    return w !== h ? { w, h } : null;
  });
  const marks = (a: number, b: number): ShapeMarks => ({
    sides: [
      { i: 0, text: len(a) },
      { i: 1, text: len(b) },
    ],
    angles: [0, 1, 2, 3].map((i) => ({ i, right: true })),
  });
  const spec = twoShapes({ pts: rectPts(w, h), names: ["A", "B", "C", "D"], marks: marks(w, h) }, { pts: rectPts(w * k, h * k), names: ["P", "Q", "R", "S"], marks: marks(w * k, h * k) }, {
    description: `Rectangle A is ${w} cm by ${h} cm. Rectangle B is ${num(w * k)} cm by ${num(h * k)} cm.`,
  });
  return exactQ(
    `Rectangle B (on the right) is an enlargement of rectangle A. What is the scale factor?`,
    spec,
    fr(k),
    [
      { value: fr(w * k - w), misconception: "sim-added" },
      { value: simplify(frac(2, Math.round(2 * k))), misconception: "sim-inverse-sf" },
    ].filter((x) => x.value.n > 0),
    SF_HELP,
    sfText(k),
    [`The scale factor is what every length of A is multiplied by to get B.`, `Divide a length on B by the matching length on A.`],
    [`Matching sides: ${w} cm on A and ${num(w * k)} cm on B.`, `Scale factor = ${num(w * k)} ÷ ${w} = ${sfText(k)}`, `Check: ${h} × ${sfText(k)} = ${num(h * k)} ✓`],
  );
};

const areSimilar: Gen = (r, tier) => {
  const similar = r.next() < 0.5;
  const { w, h, W, H, how } = until(() => {
    const w = r.int(2, 6);
    const h = r.int(2, 5);
    if (w === h) return null;
    if (similar) {
      const k = scaleFactor(r, tier);
      return { w, h, W: w * k, H: h * k, how: "" };
    }
    const d = r.int(1, 4);
    if (r.next() < 0.6) return { w, h, W: w + d, H: h + d, how: "add" };
    const k = r.pick([2, 3]);
    return { w, h, W: w * k, H: h * k + d, how: "one" };
  });
  const marks = (a: number, b: number): ShapeMarks => ({
    sides: [
      { i: 0, text: len(a) },
      { i: 1, text: len(b) },
    ],
    angles: [0, 1, 2, 3].map((i) => ({ i, right: true })),
  });
  const spec = twoShapes({ pts: rectPts(w, h), names: ["A", "B", "C", "D"], marks: marks(w, h) }, { pts: rectPts(W, H), names: ["P", "Q", "R", "S"], marks: marks(W, H) }, {
    description: `Two rectangles: ${w} cm by ${h} cm, and ${num(W)} cm by ${num(H)} cm.`,
  });
  const yes = "Yes, they are similar";
  const no = "No, they aren't similar";
  return choiceQ(
    `Are these two rectangles similar?`,
    spec,
    [yes, no],
    similar ? yes : no,
    () => (similar ? "sim-said-not-similar" : "sim-not-similar"),
    [`Similar means every side is multiplied by the same scale factor.`, `Work out ${num(W)} ÷ ${w} and ${num(H)} ÷ ${h}. Are they the same?`],
    [
      `Lengths: ${num(W)} ÷ ${w} = ${num(W / w)}`,
      `Widths: ${num(H)} ÷ ${h} = ${num(Math.round((H / h) * 100) / 100)}`,
      similar ? `Both sides are multiplied by ${num(W / w)}, so the rectangles are similar.` : how === "add" ? `They aren't multiplied by the same number (${W - w} was added to each side instead), so the rectangles aren't similar.` : `The scale factors are different, so the rectangles aren't similar.`,
    ],
  );
};

/** A triangle with a line parallel to its base cutting off a smaller similar triangle at the top. */
const nestedTriangles: Gen = (r) => {
  const { ad, db, de } = until(() => {
    const [ad, db] = r.pick([
      [4, 2],
      [3, 6],
      [5, 5],
      [2, 3],
      [4, 4],
      [6, 3],
      [4, 6],
    ]);
    const de = r.int(3, 12);
    const k = (ad + db) / ad;
    // A clear drawing: the base BC not much thinner or wider than the side AB.
    const bc = de * k;
    return Number.isInteger(bc * 2) && bc >= 0.75 * (ad + db) && bc <= 1.5 * (ad + db) ? { ad, db, de } : null;
  });
  const k = (ad + db) / ad;
  const bc = de * k;
  const ab = ad + db;
  // Build ABC from AB, BC and the angle at B, so every labelled length is to scale.
  const angB = r.int(55, 75);
  const B: P = [0, 0];
  const C: P = [bc, 0];
  const A: P = dirPt(angB, ab, B);
  const at = (p: P, q: P, t: number): P => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  const D = at(A, B, ad / ab);
  const E = at(A, C, ad / ab);
  if (!wellShaped([A, B, C], 25, 110)) return nestedTriangles(r, 2);
  const spec: AngleSpec = {
    points: { A, B, C, D, E },
    segments: [
      ["A", "B"],
      ["B", "C"],
      ["C", "A"],
      ["D", "E"],
    ],
    polygon: ["A", "B", "C"],
    polygons: [["A", "D", "E"]],
    angles: [],
    arrows: [
      { a: "D", b: "E", n: 1 },
      { a: "B", b: "C", n: 1 },
    ],
    lengths: [
      { a: "A", b: "D", text: len(ad) },
      { a: "D", b: "B", text: len(db) },
      { a: "D", b: "E", text: len(de) },
      { a: "B", b: "C", text: "x" },
    ],
    labels: ["A", "B", "C", "D", "E"],
    description: `Triangle ABC with a line DE parallel to BC. AD is ${ad} cm, DB is ${db} cm, DE is ${de} cm and BC is marked x.`,
  };
  const ans = fr(bc);
  return exactQ(
    `DE is parallel to BC, so triangles ADE and ABC are similar. Find the length of BC, marked x.`,
    spec,
    ans,
    [
      { value: fr((de * db) / ad), misconception: "sim-part-not-whole" },
      { value: fr(de + db), misconception: "sim-added" },
      { value: fr(de / k), misconception: "sim-inverse-sf" },
    ],
    SIM_HELP,
    `${num(bc)} cm`,
    [`The small triangle ADE sits inside the big triangle ABC. AB is the whole side: AD + DB.`, `Scale factor = AB ÷ AD. Then multiply DE by it.`],
    [`AB = ${ad} + ${db} = ${ab} cm.`, `Scale factor = AB ÷ AD = ${ab} ÷ ${ad} = ${num(k)}`, `x = DE × ${num(k)} = ${de} × ${num(k)} = ${num(bc)} cm`],
  );
};

const similarShapes: Gen = (r, tier) => {
  const roll = r.next();
  if (tier === 1) {
    if (roll < 0.3) return similarMissing(r, tier, "triangle");
    if (roll < 0.6) return similarMissing(r, tier, "rectangle");
    if (roll < 0.8) return findScaleFactor(r, tier);
    return areSimilar(r, tier);
  }
  if (roll < 0.25) return similarMissing(r, tier, "triangle");
  if (roll < 0.4) return similarMissing(r, tier, "rectangle");
  if (roll < 0.55) return findScaleFactor(r, tier);
  if (roll < 0.7) return areSimilar(r, tier);
  return nestedTriangles(r, tier);
};

export const TRIANGLE_GENERATORS: Record<string, Gen> = {
  "geo-pythagoras": pythagoras,
  "geo-trig-sides": trigSides,
  "geo-trig-angles": trigAngles,
  "geo-exact-trig": exactTrig,
  "geo-congruence": congruence,
  "geo-similar-shapes": similarShapes,
};
