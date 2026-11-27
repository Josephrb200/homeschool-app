/**
 * Question generators for angles and properties of shapes.
 *
 * Every diagram is drawn to scale, so a student can sense-check an answer by
 * eye (a test measures each drawn angle against its label and the answer).
 * Tier 1 uses multiples of 5; tier 2 uses any whole number of degrees.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher.
 */

import { frac } from "@/engine/fraction";
import type { Rng } from "@/engine/random";
import type { AngleSpec, Question } from "@/engine/types";
import {
  crossingDiagram,
  crossingSize,
  deg,
  dirPt,
  lineDiagram,
  pairKind,
  parallelDiagram,
  parallelSize,
  pointDiagram,
  polygonDiagram,
  polygonFromAngles,
  POLYGON_NAMES,
  regularPoints,
  rotate,
  singleAngle,
  type P,
  type PairKind,
  type ParallelPos,
} from "./geometry";

export type Tier = 1 | 2;
type Gen = (r: Rng, tier: Tier) => Omit<Question, "id" | "skillId">;

export const ANGLE_HELP = "Type the angle in degrees, like 65. The ° sign is fine but not needed.";
const COUNT_HELP = "Type a whole number, like 7.";

function shuffle<T>(r: Rng, items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = r.int(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Drop predicted wrong answers that equal the right one, repeat, or make no sense. */
function cleanWrong(correct: number, wrong: { value: number; misconception: string }[]) {
  const seen = new Set<number>([correct]);
  return wrong
    .filter((w) => {
      if (!Number.isInteger(w.value) || w.value <= 0 || seen.has(w.value)) return false;
      seen.add(w.value);
      return true;
    })
    .map((w) => ({ value: frac(w.value), misconception: w.misconception }));
}

/** A whole-number angle answer. */
function angleQ(
  prompt: string,
  visual: AngleSpec | undefined,
  answer: number,
  wrong: { value: number; misconception: string }[],
  hints: string[],
  solution: string[],
): Omit<Question, "id" | "skillId"> {
  return {
    prompt,
    visual: visual ? { kind: "angles", angles: visual } : undefined,
    answer: { kind: "integer", value: answer },
    wrongAnswers: cleanWrong(answer, wrong),
    answerHelp: ANGLE_HELP,
    hints,
    solution,
    answerText: deg(answer),
  };
}

/** A multiple-choice question. `mcFor(option)` names the misconception for a wrong option. */
function choiceQ(
  prompt: string,
  visual: AngleSpec | undefined,
  options: string[],
  correct: string,
  mcFor: (option: string) => string,
  hints: string[],
  solution: string[],
): Omit<Question, "id" | "skillId"> {
  const correctIndex = options.indexOf(correct);
  if (correctIndex < 0) throw new Error(`choice: ${correct} not in options`);
  return {
    prompt,
    visual: visual ? { kind: "angles", angles: visual } : undefined,
    answer: { kind: "choice", options, correctIndex },
    wrongAnswers: options.map((o, i) => ({ value: i, misconception: mcFor(o) })).filter((w) => w.value !== correctIndex),
    hints,
    solution,
  };
}

/** "an octagon", "a hexagon". */
const an = (word: string) => `${/^[aeiou]/i.test(word) ? "an" : "a"} ${word.toLowerCase()}`;
const cap = (t: string) => t[0].toUpperCase() + t.slice(1);

/** A whole number from lo to hi; a multiple of 5 in tier 1. */
const size = (r: Rng, tier: Tier, lo: number, hi: number) => (tier === 1 ? 5 * r.int(Math.ceil(lo / 5), Math.floor(hi / 5)) : r.int(lo, hi));

/** Try until `make` returns a value (deterministic, because the rng is seeded). */
function until<T>(make: () => T | null): T {
  for (let k = 0; k < 500; k++) {
    const v = make();
    if (v !== null) return v;
  }
  throw new Error("angles: couldn't build a question");
}

const LETTER_SETS = [
  ["A", "B", "C", "D"],
  ["P", "Q", "R", "S"],
  ["W", "X", "Y", "Z"],
  ["J", "K", "L", "M"],
];

/** Interior angles that make a convex polygon, with the polygon's corner points. */
function polygonWith(r: Rng, n: number, lo: number, hi: number, step: number): { angles: number[]; pts: P[] } {
  const total = (n - 2) * 180;
  const lensTries = [
    [6, 5, 5, 5],
    [5, 6, 5, 4],
    [6, 6, 4, 5],
    [7, 5, 6, 5],
    [5, 4, 6, 6],
  ];
  return until(() => {
    const angles = Array.from({ length: n - 1 }, () => step * r.int(Math.ceil(lo / step), Math.floor(hi / step)));
    const last = total - angles.reduce((a, b) => a + b, 0);
    if (last < lo || last > hi) return null;
    angles.push(last);
    for (const lens of lensTries) {
      // Bigger shapes need longer sides, so neighbouring angle labels don't collide.
      const pts = polygonFromAngles(angles, lens.slice(0, n - 2), n >= 5 ? 4 : 2);
      if (pts) return { angles, pts };
    }
    return null;
  });
}

// ================================================================ angle types and notation

const TYPES = ["Acute", "Right angle", "Obtuse", "Straight", "Reflex"] as const;
type AngleType = (typeof TYPES)[number];
const typeOf = (s: number): AngleType => (s < 90 ? "Acute" : s === 90 ? "Right angle" : s < 180 ? "Obtuse" : s === 180 ? "Straight" : "Reflex");
const TYPE_RULE: Record<AngleType, string> = {
  Acute: "less than 90°",
  "Right angle": "exactly 90°",
  Obtuse: "between 90° and 180°",
  Straight: "exactly 180°",
  Reflex: "more than 180°",
};
function typeMc(correct: AngleType, chosen: string) {
  if (correct === "Reflex" || chosen === "Reflex") return "angle-type-reflex";
  if (correct === "Right angle" || chosen === "Right angle") return "angle-type-right";
  if (correct === "Straight" || chosen === "Straight") return "angle-type-straight";
  return "angle-type-acute-obtuse";
}

const angleBasics: Gen = (r, tier) => {
  const roll = r.next();

  if (roll < (tier === 1 ? 0.55 : 0.5)) {
    // What type of angle is this?
    const kind = r.pick<AngleType>(tier === 1 ? ["Acute", "Acute", "Right angle", "Obtuse", "Obtuse", "Reflex", "Reflex"] : ["Acute", "Right angle", "Obtuse", "Straight", "Reflex", "Reflex"]);
    const s =
      kind === "Acute"
        ? size(r, tier, tier === 1 ? 20 : 10, tier === 1 ? 70 : 85)
        : kind === "Right angle"
          ? 90
          : kind === "Obtuse"
            ? size(r, tier, tier === 1 ? 110 : 95, tier === 1 ? 160 : 170)
            : kind === "Straight"
              ? 180
              : size(r, tier, tier === 1 ? 200 : 190, tier === 1 ? 330 : 350);
    const showSize = tier === 2 && r.next() < 0.6;
    const drop = kind === "Straight" ? "Right angle" : tier === 1 || r.next() < 0.5 ? "Straight" : r.pick(TYPES.filter((t) => t !== kind && t !== "Straight"));
    const options = TYPES.filter((t) => t !== drop) as string[];
    return choiceQ(
      showSize ? `This angle is ${s}°. What type of angle is it?` : `What type of angle is marked?`,
      singleAngle(s, { text: showSize ? deg(s) : undefined, rot: tier === 1 ? 5 * r.int(0, 6) : r.int(0, 359) }),
      options,
      kind,
      (o) => typeMc(kind, o),
      [
        `Compare it with a right angle (a square corner, 90°) and a straight line (180°).`,
        kind === "Reflex" ? `Look at which side is marked. Is the marked part more than a straight line?` : `Is it smaller than a square corner, exactly one, or bigger?`,
      ],
      [`The marked angle is ${TYPE_RULE[kind]}${showSize ? ` (${s}°)` : ""}.`, `So it is ${kind === "Right angle" ? "a right angle" : `${kind === "Acute" || kind === "Obtuse" ? "an" : "a"} ${kind.toLowerCase()} angle`}.`],
    );
  }

  if (roll < (tier === 1 ? 0.75 : 0.62)) {
    // Turn facts.
    const which = r.pick(tier === 1 ? (["full", "half", "quarter"] as const) : (["full", "half", "quarter", "three-quarter"] as const));
    const facts = {
      full: { q: "a full turn", a: 360, wrong: 180, vis: undefined },
      half: { q: "a straight line (half a turn)", a: 180, wrong: 360, vis: singleAngle(180) },
      quarter: { q: "a right angle (a quarter turn)", a: 90, wrong: 180, vis: singleAngle(90) },
      "three-quarter": { q: "three quarters of a turn", a: 270, wrong: 135, vis: singleAngle(270) },
    }[which];
    return angleQ(
      `How many degrees are there in ${facts.q}?`,
      facts.vis,
      facts.a,
      [{ value: facts.wrong, misconception: "angle-turns-mixed" }],
      [`A full turn is 360°.`, which === "full" ? `Think of turning all the way round to face the same way again.` : `What fraction of a full turn is it?`],
      which === "full" ? [`A full turn is 360°.`] : [`A full turn is 360°.`, `${facts.q[0].toUpperCase()}${facts.q.slice(1)} is ${facts.a}°.`],
    );
  }

  // Name the highlighted angle with three letters.
  const L = r.pick(LETTER_SETS);
  if (tier === 1) {
    const { pts } = polygonWith(r, 3, 45, 80, 5);
    const v = r.int(0, 2);
    const letters = L.slice(0, 3);
    const name = (i: number) => `∠${letters[(i + 1) % 3]}${letters[i]}${letters[(i + 2) % 3]}`;
    const options = [0, 1, 2].map(name);
    const spec = polygonDiagram(pts, [{ i: v, highlight: true }], { labels: letters, description: `Triangle ${letters.join("")} with the angle at corner ${letters[v]} highlighted.` }, letters);
    return choiceQ(
      `Which is the name of the highlighted angle?`,
      rotate(spec, 5 * r.int(0, 71)),
      options,
      name(v),
      () => "angle-notation-middle",
      [`The middle letter of the name is the corner where the angle is.`, `The highlighted angle is at corner ${letters[v]}. Which name has ${letters[v]} in the middle?`],
      [`The angle is at corner ${letters[v]}, so ${letters[v]} goes in the middle.`, `It's ${name(v)}.`],
    );
  }
  const { pts } = polygonWith(r, 4, 70, 115, 1);
  const v = r.int(0, 3);
  const at = (i: number) => L[(i + 4) % 4];
  // Either order of the outer letters is fine; show the correct one either way round.
  const correct = r.next() < 0.5 ? `∠${at(v - 1)}${at(v)}${at(v + 1)}` : `∠${at(v + 1)}${at(v)}${at(v - 1)}`;
  const wrongs = [`∠${at(v)}${at(v - 1)}${at(v + 1)}`, `∠${at(v - 1)}${at(v + 1)}${at(v)}`, `∠${at(v)}${at(v + 1)}${at(v + 2)}`];
  const options = shuffle(r, [correct, ...wrongs]);
  const spec = polygonDiagram(pts, [{ i: v, highlight: true }], { labels: L, description: `Quadrilateral ${L.join("")} with the angle at corner ${at(v)} highlighted.` }, L);
  return choiceQ(
    `Which is the name of the highlighted angle?`,
    rotate(spec, r.int(0, 359)),
    options,
    correct,
    () => "angle-notation-middle",
    [`The middle letter is the corner. The other two letters are on the arms either side of it.`, `The corner is ${at(v)}. Its arms go to ${at(v - 1)} and ${at(v + 1)}.`],
    [`The angle is at corner ${at(v)}, between the arms to ${at(v - 1)} and ${at(v + 1)}.`, `So it's ${correct}. Writing the outer letters the other way round names the same angle.`],
  );
};

// ================================================================ angle facts

const angleFacts: Gen = (r, tier) => {
  const kinds = tier === 1 ? (["line", "line", "point", "cross", "cross"] as const) : (["line2", "lineEqual", "point4", "pointEqual", "cross"] as const);
  const kind = r.pick<string>(kinds);
  const rot = tier === 1 ? 0 : r.int(0, 359);

  if (kind === "line") {
    const a = until(() => {
      const v = size(r, tier, 25, 155);
      return v === 90 ? null : v;
    });
    const xFirst = r.next() < 0.5;
    const spec = lineDiagram(xFirst ? [180 - a, a] : [a, 180 - a], xFirst ? ["x", deg(a)] : [deg(a), "x"], rot);
    return angleQ(
      `The two angles are on a straight line. Find the angle marked x.`,
      spec,
      180 - a,
      [
        { value: 360 - a, misconception: "angle-line-used-360" },
        { value: a, misconception: "angle-adjacent-equal" },
      ],
      [`Angles on a straight line add up to 180°.`, `x = 180° − ${a}°`],
      [`Angles on a straight line add up to 180°.`, `x = 180° − ${a}° = ${180 - a}°`],
    );
  }

  if (kind === "line2") {
    const sizes = until(() => {
      const a = size(r, tier, 25, 120);
      const b = size(r, tier, 25, 120);
      const c = 180 - a - b;
      return c >= 25 ? [a, b, c] : null;
    });
    const xi = r.int(0, 2);
    const known = sizes.filter((_, i) => i !== xi);
    const spec = lineDiagram(sizes, sizes.map((s, i) => (i === xi ? "x" : deg(s))), rot);
    return angleQ(
      `These angles are on a straight line. Find the angle marked x.`,
      spec,
      sizes[xi],
      [{ value: 360 - known[0] - known[1], misconception: "angle-line-used-360" }],
      [`All three angles are on one straight line, so together they make 180°.`, `Add the two you know, then take that from 180°.`],
      [`Angles on a straight line add up to 180°.`, `${known[0]}° + ${known[1]}° = ${known[0] + known[1]}°`, `x = 180° − ${known[0] + known[1]}° = ${sizes[xi]}°`],
    );
  }

  if (kind === "lineEqual") {
    const x = r.int(25, 75);
    const a = 180 - 2 * x;
    const order = r.pick([
      [0, 1, 0],
      [0, 0, 1],
      [1, 0, 0],
    ]);
    const sizes = order.map((o) => (o ? a : x));
    const spec = lineDiagram(sizes, order.map((o) => (o ? deg(a) : "x")), rot);
    return angleQ(
      `These angles are on a straight line. The two angles marked x are equal. Find x.`,
      spec,
      x,
      [
        { value: 180 - a, misconception: "angle-forgot-halve" },
        { value: (360 - a) / 2, misconception: "angle-line-used-360" },
      ],
      [`Angles on a straight line add up to 180°. Take away the ${a}° first.`, `What's left (${180 - a}°) is shared between two equal angles.`],
      [`Angles on a straight line add up to 180°.`, `180° − ${a}° = ${180 - a}°`, `Two equal angles share that: x = ${180 - a}° ÷ 2 = ${x}°`],
    );
  }

  if (kind === "point") {
    const sizes = until(() => {
      const a = size(r, tier, 50, 170);
      const b = size(r, tier, 50, 170);
      const c = 360 - a - b;
      return c >= 50 && c <= 170 ? [a, b, c] : null;
    });
    const xi = r.int(0, 2);
    const known = sizes.filter((_, i) => i !== xi);
    const spec = pointDiagram(sizes, sizes.map((s, i) => (i === xi ? "x" : deg(s))), 5 * r.int(0, 71));
    return angleQ(
      `Three angles meet at a point. Find the angle marked x.`,
      spec,
      sizes[xi],
      [{ value: 180 - known[0] - known[1], misconception: "angle-point-used-180" }],
      [`Angles all the way round a point add up to 360°.`, `Add the two you know, then take that from 360°.`],
      [`Angles around a point add up to 360°.`, `${known[0]}° + ${known[1]}° = ${known[0] + known[1]}°`, `x = 360° − ${known[0] + known[1]}° = ${sizes[xi]}°`],
    );
  }

  if (kind === "point4") {
    const sizes = until(() => {
      const k = [r.int(35, 140), r.int(35, 140), r.int(35, 140)];
      const x = 360 - k[0] - k[1] - k[2];
      return x >= 35 && x <= 290 && Math.abs(x - 180) > 8 ? [...k, x] : null;
    });
    const shift = r.int(0, 3);
    const ordered = sizes.map((_, i) => sizes[(i + shift) % 4]);
    const xi = (7 - shift) % 4;
    const known = sizes.slice(0, 3);
    const sum = known[0] + known[1] + known[2];
    const spec = pointDiagram(ordered, ordered.map((s, i) => (i === xi ? "x" : deg(s))), r.int(0, 359));
    return angleQ(
      `Four angles meet at a point. Find the angle marked x.`,
      spec,
      sizes[3],
      [{ value: 180 - sum, misconception: "angle-point-used-180" }],
      [`Angles around a point add up to 360°.`, `Add the three you know: ${known.join("° + ")}°.`],
      [`Angles around a point add up to 360°.`, `${known.join("° + ")}° = ${sum}°`, `x = 360° − ${sum}° = ${sizes[3]}°`],
    );
  }

  if (kind === "pointEqual") {
    const x = r.int(40, 150);
    const a = 360 - 2 * x;
    if (a < 40) {
      // Three equal angles and one other instead.
      const y = r.int(70, 100);
      const b = 360 - 3 * y;
      const spec = pointDiagram([y, y, y, b], ["x", "x", "x", deg(b)], r.int(0, 359));
      return angleQ(
        `Four angles meet at a point. The three angles marked x are equal. Find x.`,
        spec,
        y,
        [
          { value: 360 - b, misconception: "angle-forgot-halve" },
          { value: (180 - b) / 3, misconception: "angle-point-used-180" },
        ],
        [`Angles around a point add up to 360°. Take away the ${b}° first.`, `What's left is shared between three equal angles.`],
        [`Angles around a point add up to 360°.`, `360° − ${b}° = ${360 - b}°`, `x = ${360 - b}° ÷ 3 = ${y}°`],
      );
    }
    const spec = pointDiagram([x, a, x], ["x", deg(a), "x"], r.int(0, 359));
    return angleQ(
      `Three angles meet at a point. The two angles marked x are equal. Find x.`,
      spec,
      x,
      [
        { value: 360 - a, misconception: "angle-forgot-halve" },
        { value: (180 - a) / 2, misconception: "angle-point-used-180" },
      ],
      [`Angles around a point add up to 360°. Take away the ${a}° first.`, `What's left (${360 - a}°) is shared between two equal angles.`],
      [`Angles around a point add up to 360°.`, `360° − ${a}° = ${360 - a}°`, `x = ${360 - a}° ÷ 2 = ${x}°`],
    );
  }

  // Two crossing lines: vertically opposite, or next to each other on a line.
  const theta = until(() => {
    const t = size(r, tier, 30, 150);
    return Math.abs(t - 90) < 12 ? null : t;
  });
  const k = r.int(0, 3) as 0 | 1 | 2 | 3;
  const opposite = r.next() < 0.5;
  const t = ((k + (opposite ? 2 : r.pick([1, 3]))) % 4) as 0 | 1 | 2 | 3;
  const a = crossingSize(theta, k);
  const x = crossingSize(theta, t);
  const spec = crossingDiagram(
    theta,
    [
      { pos: k, text: deg(a) },
      { pos: t, text: "x" },
    ],
    tier === 1 ? 5 * r.int(0, 8) : rot,
  );
  return angleQ(
    `Two straight lines cross. Find the angle marked x.`,
    spec,
    x,
    opposite ? [{ value: 180 - a, misconception: "angle-vertopp-supplementary" }] : [{ value: a, misconception: "angle-adjacent-equal" }, { value: 360 - a, misconception: "angle-line-used-360" }],
    opposite
      ? [`x is across from the ${a}° angle, where the lines cross.`, `Vertically opposite angles are equal.`]
      : [`x and ${a}° sit next to each other on one of the straight lines.`, `Angles on a straight line add up to 180°.`],
    opposite
      ? [`x and ${a}° are vertically opposite, so they are equal.`, `x = ${x}°`]
      : [`x and ${a}° are on a straight line, so they add up to 180°.`, `x = 180° − ${a}° = ${x}°`],
  );
};

// ================================================================ shape properties

type Quad = "Square" | "Rectangle" | "Rhombus" | "Parallelogram" | "Trapezium" | "Kite";
const QUAD_OTHERS: Record<Quad, Quad[]> = {
  Square: ["Rhombus", "Rectangle", "Kite"],
  Rectangle: ["Parallelogram", "Square", "Trapezium"],
  Rhombus: ["Square", "Parallelogram", "Kite"],
  Parallelogram: ["Rectangle", "Rhombus", "Trapezium"],
  Trapezium: ["Parallelogram", "Kite", "Rectangle"],
  Kite: ["Rhombus", "Trapezium", "Parallelogram"],
};
function quadMc(a: string, b: string) {
  const pair = new Set([a, b]);
  if (pair.has("Square") && pair.has("Rhombus")) return "shape-square-rhombus";
  if (pair.has("Rectangle") && pair.has("Parallelogram")) return "shape-rect-parallelogram";
  if (pair.has("Parallelogram") && pair.has("Rhombus")) return "shape-parallelogram-rhombus";
  if (pair.has("Trapezium")) return "shape-trapezium";
  if (pair.has("Kite")) return "shape-kite";
  return "shape-quad-names";
}
const QUAD_FACTS: Record<Quad, string> = {
  Square: "4 equal sides and 4 right angles",
  Rectangle: "4 right angles, with opposite sides equal",
  Rhombus: "4 equal sides, with opposite sides parallel, and no right angles",
  Parallelogram: "2 pairs of parallel sides, with opposite sides equal, and no right angles",
  Trapezium: "exactly 1 pair of parallel sides",
  Kite: "2 pairs of equal sides next to each other, and no parallel sides",
};
const QUAD_RIDDLES: Record<Quad, string> = {
  Square: "I have 4 equal sides and 4 right angles.",
  Rectangle: "I have 4 right angles. My opposite sides are equal, but my 4 sides are not all equal.",
  Rhombus: "I have 4 equal sides, but no right angles.",
  Parallelogram: "I have 2 pairs of parallel sides. My opposite sides are equal, but not all 4 sides are. I have no right angles.",
  Trapezium: "I have exactly 1 pair of parallel sides.",
  Kite: "I have 2 pairs of equal sides next to each other, and no parallel sides.",
};

/** A quadrilateral drawn with its ticks, arrows and right-angle marks. */
export function quadSpec(q: Quad, rot = 0): AngleSpec {
  const pts: Record<Quad, P[]> = {
    Square: [[0, 0], [4, 0], [4, 4], [0, 4]],
    Rectangle: [[0, 0], [6.5, 0], [6.5, 3.5], [0, 3.5]],
    Rhombus: [[0, 0], [5, 0], [8, 4], [3, 4]],
    Parallelogram: [[0, 0], [6, 0], [8, 3.5], [2, 3.5]],
    Trapezium: [[0, 0], [7.5, 0], [5.5, 3.5], [1.5, 3.5]],
    Kite: [[0, 0], [2.6, 3.2], [0, 5], [-2.6, 3.2]],
  };
  const all = [0, 1, 2, 3];
  const right = q === "Square" || q === "Rectangle" ? all.map((i) => ({ i, right: true })) : [];
  const v = (i: number) => `V${i % 4}`;
  const ticks =
    q === "Square" || q === "Rhombus"
      ? all.map((i) => ({ a: v(i), b: v(i + 1), n: 1 }))
      : q === "Rectangle" || q === "Parallelogram"
        ? all.map((i) => ({ a: v(i), b: v(i + 1), n: i % 2 ? 2 : 1 }))
        : q === "Kite"
          ? [
              { a: "V0", b: "V1", n: 2 },
              { a: "V3", b: "V0", n: 2 },
              { a: "V1", b: "V2", n: 1 },
              { a: "V2", b: "V3", n: 1 },
            ]
          : [];
  const arrows =
    q === "Rhombus" || q === "Parallelogram"
      ? [
          { a: "V0", b: "V1", n: 1 },
          { a: "V3", b: "V2", n: 1 },
          { a: "V0", b: "V3", n: 2 },
          { a: "V1", b: "V2", n: 2 },
        ]
      : q === "Trapezium"
        ? [
            { a: "V0", b: "V1", n: 1 },
            { a: "V3", b: "V2", n: 1 },
          ]
        : [];
  return rotate(
    polygonDiagram(pts[q], right, {
      ticks,
      arrows,
      description: `A quadrilateral with ${QUAD_FACTS[q]}. Equal sides are marked with matching ticks, parallel sides with matching arrows${right.length ? ", right angles with small squares" : ""}.`,
    }),
    rot,
  );
}

type Tri = "Equilateral" | "Isosceles" | "Scalene";
const TRIS: Tri[] = ["Equilateral", "Isosceles", "Scalene"];

/** A triangle from three side lengths, base along the bottom. */
function triFromSides(a: number, b: number, c: number): P[] {
  // Base c from V0 to V1; V2 is b from V0 and a from V1.
  const x = (b * b + c * c - a * a) / (2 * c);
  return [[0, 0], [c, 0], [x, Math.sqrt(b * b - x * x)]];
}

const shapeProperties: Gen = (r, tier) => {
  const roll = r.next();

  if (roll < 0.3) {
    // Triangle types, from lengths (tier 1) or tick marks (tier 2).
    const t = r.pick(TRIS);
    const L = r.int(5, 9);
    const sides: [number, number, number] =
      t === "Equilateral"
        ? [L, L, L]
        : t === "Isosceles"
          ? r.next() < 0.5
            ? [L, L, until(() => { const b = r.int(3, 2 * L - 3); return b === L ? null : b; })]
            : [L, until(() => { const b = r.int(3, 2 * L - 3); return b === L ? null : b; }), L]
          : until(() => {
              const s = [r.int(4, 10), r.int(4, 10), r.int(4, 10)].sort((p, q) => p - q);
              if (s[0] === s[1] || s[1] === s[2] || s[0] + s[1] <= s[2] + 1) return null;
              // No right angles, so "scalene" is the only right answer.
              if (s[0] * s[0] + s[1] * s[1] === s[2] * s[2]) return null;
              return r.next() < 0.5 ? [s[0], s[2], s[1]] : [s[2], s[1], s[0]];
            }) as [number, number, number];
    const [a, b, c] = sides;
    const pts = triFromSides(a, b, c);
    const useTicks = tier === 2;
    // Matching ticks for equal sides: side V1V2 = a, V2V0 = b, V0V1 = c.
    const segs: [string, string, number][] = [["V1", "V2", a], ["V2", "V0", b], ["V0", "V1", c]];
    const counts = new Map<number, number>();
    for (const [, , l] of segs) counts.set(l, (counts.get(l) ?? 0) + 1);
    const spec = polygonDiagram(pts, [], {
      ticks: useTicks ? segs.filter(([, , l]) => counts.get(l)! > 1).map(([p, q]) => ({ a: p, b: q, n: 1 })) : [],
      lengths: useTicks ? [] : segs.map(([p, q, l]) => ({ a: p, b: q, text: `${l} cm` })),
      description: useTicks
        ? `A triangle. ${t === "Equilateral" ? "All three sides have matching tick marks." : t === "Isosceles" ? "Two sides have matching tick marks." : "No sides have tick marks."}`
        : `A triangle with sides ${a} cm, ${b} cm and ${c} cm.`,
    });
    const eq = t === "Equilateral" ? "all three sides are equal" : t === "Isosceles" ? "exactly two sides are equal" : "no sides are equal";
    return choiceQ(
      `What type of triangle is this?`,
      rotate(spec, tier === 1 ? 0 : r.int(0, 359)),
      [...TRIS],
      t,
      () => "shape-tri-ticks",
      [useTicks ? `Sides with matching tick marks are the same length. No tick marks means the sides are different.` : `Look at the three lengths. How many are the same?`, `3 equal sides: equilateral. 2 equal: isosceles. None equal: scalene.`],
      [useTicks ? `Looking at the tick marks, ${eq}.` : `The sides are ${a} cm, ${b} cm and ${c} cm, so ${eq}.`, `So it's ${t === "Equilateral" ? "an" : t === "Isosceles" ? "an" : "a"} ${t.toLowerCase()} triangle.`],
    );
  }

  if (roll < (tier === 1 ? 0.7 : 0.6)) {
    // Name the quadrilateral from its markings.
    const q = r.pick<Quad>(["Square", "Rectangle", "Rhombus", "Parallelogram", "Trapezium", "Kite"]);
    const options = shuffle(r, [q, ...QUAD_OTHERS[q]]);
    return choiceQ(
      `What is the name of this quadrilateral?`,
      quadSpec(q, tier === 1 ? 0 : r.int(0, 359)),
      options,
      q,
      (o) => quadMc(q, o),
      [`Arrows show parallel sides. Ticks show equal sides. Small squares show right angles.`, `How many pairs of parallel sides? Are all 4 sides equal? Any right angles?`],
      [`It has ${QUAD_FACTS[q]}.`, `So it's a ${q.toLowerCase()}.`],
    );
  }

  if (tier === 2 && roll < 0.8) {
    // Riddle: which quadrilateral am I?
    const q = r.pick<Quad>(["Square", "Rectangle", "Rhombus", "Parallelogram", "Trapezium", "Kite"]);
    const options = shuffle(r, [q, ...QUAD_OTHERS[q]]);
    return choiceQ(
      `Which quadrilateral am I? "${QUAD_RIDDLES[q]}"`,
      undefined,
      options,
      q,
      (o) => quadMc(q, o),
      [`Sketch each option, or picture it, and check each clue in turn.`, `Start with the clue that rules out the most shapes.`],
      [`A ${q.toLowerCase()} has ${QUAD_FACTS[q]}.`, `So the answer is ${q.toLowerCase()}.`],
    );
  }

  // Polygon names.
  const pool = tier === 1 ? [5, 6, 8] : [5, 6, 7, 8, 9, 10];
  const n = r.pick(pool);
  if (r.next() < 0.4) {
    return {
      prompt: `How many sides does ${an(POLYGON_NAMES[n])} have?`,
      answer: { kind: "integer", value: n },
      wrongAnswers: [n - 1, n + 1].filter((m) => POLYGON_NAMES[m] && m !== 4 && m !== 3).map((m) => ({ value: frac(m), misconception: "shape-polygon-names" })),
      answerHelp: COUNT_HELP,
      hints: [`Pent = 5, hex = 6, hept = 7, oct = 8, non = 9, dec = 10.`, `An octopus has 8 legs; an octagon has 8 sides.`],
      solution: [`${cap(an(POLYGON_NAMES[n]))} has ${n} sides.`],
    };
  }
  const near = shuffle(
    r,
    [5, 6, 7, 8, 9, 10].filter((m) => m !== n),
  ).sort((p, q) => Math.abs(p - n) - Math.abs(q - n));
  const options = [n, ...near.slice(0, 3)].sort((p, q) => p - q).map((m) => POLYGON_NAMES[m]);
  const pts = regularPoints(n, 4, tier === 1 ? undefined : r.int(0, 359));
  return choiceQ(
    `What is the name of this polygon?`,
    polygonDiagram(pts, [], { dots: pts.map((_, i) => `V${i}`), description: `A polygon with ${n} straight sides, all the same length.` }),
    options,
    POLYGON_NAMES[n],
    () => "shape-polygon-names",
    [`Count the sides. Put your finger on one corner and go round.`, `Pent = 5, hex = 6, hept = 7, oct = 8, non = 9, dec = 10.`],
    [`It has ${n} sides.`, `A polygon with ${n} sides is ${an(POLYGON_NAMES[n])}.`],
  );
};

// ================================================================ triangles and quadrilaterals

const triangleQuad: Gen = (r, tier) => {
  const kinds = tier === 1 ? (["tri", "tri", "right", "isoApex", "isoBase", "quad", "quadRight"] as const) : (["tri", "isoApex", "isoBase", "exterior", "quad", "parallelogram"] as const);
  const kind = r.pick<string>(kinds);
  const rot = tier === 1 ? 0 : r.int(0, 359);

  if (kind === "tri") {
    const { angles, pts } = polygonWith(r, 3, tier === 1 ? 30 : 20, 120, tier === 1 ? 5 : 1);
    const xi = r.int(0, 2);
    const known = angles.filter((_, i) => i !== xi);
    const spec = polygonDiagram(pts, angles.map((a, i) => ({ i, text: i === xi ? "x" : deg(a) })), { description: `A triangle with angles ${angles.map((a, i) => (i === xi ? "x" : `${a}°`)).join(", ")}.` });
    return angleQ(
      `Find the angle marked x.`,
      rotate(spec, rot),
      angles[xi],
      [{ value: 360 - known[0] - known[1], misconception: "tri-used-360" }],
      [`The angles in a triangle add up to 180°.`, `${known[0]}° + ${known[1]}° = ${known[0] + known[1]}°. Take that from 180°.`],
      [`Angles in a triangle add up to 180°.`, `${known[0]}° + ${known[1]}° = ${known[0] + known[1]}°`, `x = 180° − ${known[0] + known[1]}° = ${angles[xi]}°`],
    );
  }

  if (kind === "right") {
    const a = size(r, tier, 25, 65);
    const pts: P[] = [[0, 0], [5, 0], [0, 5 * Math.tan((a * Math.PI) / 180)]];
    const spec = polygonDiagram(
      pts,
      [
        { i: 0, right: true },
        { i: 1, text: deg(a) },
        { i: 2, text: "x" },
      ],
      { description: `A right-angled triangle. One angle is a right angle, one is ${a}°, and the third is x.` },
    );
    return angleQ(
      `Find the angle marked x.`,
      rotate(spec, rot),
      90 - a,
      [
        { value: 180 - a, misconception: "angle-forgot-right" },
        { value: 270 - a, misconception: "tri-used-360" },
      ],
      [`The small square means 90°.`, `The three angles add up to 180°: 90° + ${a}° + x = 180°.`],
      [`The square marks a right angle: 90°.`, `Angles in a triangle add up to 180°.`, `x = 180° − 90° − ${a}° = ${90 - a}°`],
    );
  }

  if (kind === "isoApex" || kind === "isoBase") {
    // V0, V1 are the base corners; V2 is the top. Sides V1V2 and V2V0 are equal.
    // An even top angle keeps the base angles whole numbers.
    const p = kind === "isoApex" ? (tier === 1 ? 10 * r.int(3, 14) : 2 * r.int(10, 65)) : 0;
    const base = kind === "isoApex" ? (180 - p) / 2 : size(r, tier, 35, 80);
    const top = 180 - 2 * base;
    const pts = polygonFromAngles([base, base, top], [6])!;
    const ticks = [
      { a: "V1", b: "V2", n: 1 },
      { a: "V2", b: "V0", n: 1 },
    ];
    if (kind === "isoApex") {
      const spec = polygonDiagram(
        pts,
        [
          { i: 2, text: deg(top) },
          { i: r.int(0, 1), text: "x" },
        ],
        { ticks, description: `An isosceles triangle: the two sloping sides are equal (marked with ticks). The angle at the top is ${top}°. x is one of the angles at the bottom.` },
      );
      return angleQ(
        `This is an isosceles triangle. Find the angle marked x.`,
        rotate(spec, rot),
        base,
        [
          { value: 180 - top, misconception: "iso-forgot-halve" },
          { value: top, misconception: "iso-wrong-pair" },
        ],
        [`The two angles at the bottom (between the equal sides and the base) are equal.`, `Take ${top}° from 180°, then halve what's left.`],
        [`Angles in a triangle add up to 180°.`, `180° − ${top}° = ${180 - top}°`, `The two bottom angles are equal, so x = ${180 - top}° ÷ 2 = ${base}°`],
      );
    }
    const knownAt = r.int(0, 1);
    const askTop = tier === 2 || r.next() < 0.6;
    const spec = polygonDiagram(
      pts,
      [
        { i: knownAt, text: deg(base) },
        { i: askTop ? 2 : 1 - knownAt, text: "x" },
      ],
      { ticks, description: `An isosceles triangle: the two sloping sides are equal (marked with ticks). One bottom angle is ${base}°. x is the angle ${askTop ? "at the top" : "at the other bottom corner"}.` },
    );
    if (!askTop) {
      return angleQ(
        `This is an isosceles triangle. Find the angle marked x.`,
        rotate(spec, rot),
        base,
        [
          { value: top, misconception: "iso-wrong-pair" },
          { value: 180 - base, misconception: "iso-wrong-pair" },
        ],
        [`In an isosceles triangle, the two angles at the bottom of the equal sides are equal.`, `x is the other bottom angle.`],
        [`The two angles at the base of the equal sides are equal.`, `x = ${base}°`],
      );
    }
    return angleQ(
      `This is an isosceles triangle. Find the angle marked x.`,
      rotate(spec, rot),
      top,
      [
        { value: 180 - base, misconception: "iso-forgot-second-base" },
        { value: base, misconception: "iso-wrong-pair" },
      ],
      [`The other bottom angle is also ${base}°, because the triangle is isosceles.`, `x = 180° − ${base}° − ${base}°`],
      [`The two bottom angles are equal, so both are ${base}°.`, `Angles in a triangle add up to 180°.`, `x = 180° − ${base}° − ${base}° = ${top}°`],
    );
  }

  if (kind === "exterior") {
    const { angles, pts } = polygonWith(r, 3, 30, 110, 1);
    const [a, b, c] = angles;
    // Extend the base past V1 to E; x is the angle outside the triangle at V1.
    const [x0, y0] = pts[0];
    const [x1, y1] = pts[1];
    const len = Math.hypot(x1 - x0, y1 - y0);
    const E: P = [x1 + ((x1 - x0) / len) * 3.5, y1 + ((y1 - y0) / len) * 3.5];
    const base = polygonDiagram(pts, [{ i: 0, text: deg(a) }, { i: 2, text: deg(c) }], { description: "" });
    const spec: AngleSpec = {
      ...base,
      points: { ...base.points, E },
      segments: [...base.segments, ["V1", "E"]],
      angles: [...base.angles, { at: "V1", from: "E", to: "V2", text: "x" }],
      description: `A triangle with angles ${a}° and ${c}°. The bottom side carries on past the third corner, making an angle x outside the triangle on the straight line.`,
    };
    return angleQ(
      `The bottom side of the triangle has been made longer. Find the angle marked x.`,
      rotate(spec, rot),
      180 - b,
      [
        { value: b, misconception: "tri-ext-gave-interior" },
        { value: 360 - a - c, misconception: "tri-used-360" },
      ],
      [`First find the angle inside the triangle at the same corner as x.`, `Then use angles on a straight line: they add up to 180°.`],
      [`Inside angle = 180° − ${a}° − ${c}° = ${b}° (angles in a triangle).`, `x = 180° − ${b}° = ${180 - b}° (angles on a straight line).`],
    );
  }

  if (kind === "quad" || kind === "quadRight") {
    let angles: number[];
    let pts: P[];
    let marks: { i: number; text?: string; right?: boolean }[];
    let xi: number;
    if (kind === "quadRight") {
      const a = size(r, tier, 60, 120);
      angles = [90, 90, a, 180 - a];
      // Right angles at V0 and V1; the top slopes so that V2 is a.
      pts = [[0, 0], [5, 0], [5, 5], [0, 5 + 5 * Math.tan(((a - 90) * Math.PI) / 180)]];
      xi = r.int(2, 3);
      marks = [{ i: 0, right: true }, { i: 1, right: true }, { i: xi, text: "x" }, { i: 5 - xi, text: deg(angles[5 - xi]) }];
    } else {
      ({ angles, pts } = polygonWith(r, 4, 55, 150, tier === 1 ? 5 : 1));
      xi = r.int(0, 3);
      marks = angles.map((a, i) => ({ i, text: i === xi ? "x" : deg(a) }));
    }
    const known = angles.filter((_, i) => i !== xi);
    const sum = known.reduce((s, a) => s + a, 0);
    const spec = polygonDiagram(pts, marks, { description: `A quadrilateral with angles ${angles.map((a, i) => (i === xi ? "x" : a === 90 && kind === "quadRight" ? "a right angle" : `${a}°`)).join(", ")}.` });
    return angleQ(
      `Find the angle marked x.`,
      rotate(spec, rot),
      angles[xi],
      kind === "quadRight"
        ? [
            { value: 270 - known[2], misconception: "angle-forgot-right" },
            { value: 180 - known[2], misconception: "quad-used-180" },
          ]
        : [{ value: 180 - sum, misconception: "quad-used-180" }],
      [`The angles in a quadrilateral add up to 360°.${kind === "quadRight" ? " Each small square is 90°." : ""}`, `Add the three you know: ${known.join("° + ")}°.`],
      [`Angles in a quadrilateral add up to 360°.`, `${known.join("° + ")}° = ${sum}°`, `x = 360° − ${sum}° = ${angles[xi]}°`],
    );
  }

  // Parallelogram: opposite angles equal, neighbours add to 180°.
  const a = until(() => {
    const v = r.int(50, 130);
    return Math.abs(v - 90) < 15 ? null : v;
  });
  const pts: P[] = [[0, 0], [6, 0], dirPt(a, 4, [6, 0]), dirPt(a, 4)];
  const sizes = [a, 180 - a, a, 180 - a];
  const k = r.int(0, 3);
  const t = (k + r.pick([1, 2, 3])) % 4;
  const spec = polygonDiagram(
    pts,
    [
      { i: k, text: deg(sizes[k]) },
      { i: t, text: "x" },
    ],
    {
      arrows: [
        { a: "V0", b: "V1", n: 1 },
        { a: "V3", b: "V2", n: 1 },
        { a: "V0", b: "V3", n: 2 },
        { a: "V1", b: "V2", n: 2 },
      ],
      description: `A parallelogram (both pairs of opposite sides are parallel). One angle is ${sizes[k]}°. x is the angle ${(t - k + 4) % 4 === 2 ? "opposite it" : "next to it"}.`,
    },
  );
  const opposite = (t - k + 4) % 4 === 2;
  return angleQ(
    `This is a parallelogram. Find the angle marked x.`,
    rotate(spec, rot),
    sizes[t],
    opposite ? [{ value: 180 - sizes[k], misconception: "para-angles" }] : [{ value: sizes[k], misconception: "para-angles" }, { value: 360 - sizes[k], misconception: "quad-used-180" }],
    opposite ? [`x is opposite the ${sizes[k]}° angle.`, `In a parallelogram, opposite angles are equal.`] : [`x is next to the ${sizes[k]}° angle, along one side.`, `In a parallelogram, angles next to each other add up to 180°.`],
    opposite ? [`Opposite angles in a parallelogram are equal.`, `x = ${sizes[t]}°`] : [`Angles next to each other in a parallelogram add up to 180° (they're co-interior angles between parallel sides).`, `x = 180° − ${sizes[k]}° = ${sizes[t]}°`],
  );
};

// ================================================================ parallel lines

const PAIR_NAMES: Record<Exclude<PairKind, "other" | "on a straight line">, string> = {
  corresponding: "Corresponding",
  alternate: "Alternate",
  "co-interior": "Co-interior",
  "vertically opposite": "Vertically opposite",
};
const PAIR_RULE: Record<Exclude<PairKind, "other">, string> = {
  corresponding: "are corresponding angles (an F shape), so they are equal",
  alternate: "are alternate angles (a Z shape), so they are equal",
  "co-interior": "are co-interior angles (a C shape), so they add up to 180°",
  "vertically opposite": "are vertically opposite, so they are equal",
  "on a straight line": "are on a straight line, so they add up to 180°",
};

function pairMc(correct: string, chosen: string) {
  if (correct === "Vertically opposite" || chosen === "Vertically opposite") return "par-vert-opp";
  if (correct === "Co-interior" || chosen === "Co-interior") return "par-cointerior-name";
  return "par-alt-corr";
}

const ALL_POS: ParallelPos[] = (["P", "Q"] as const).flatMap((at) => ([0, 1, 2, 3] as const).map((pos) => ({ at, pos })));
const where = (m: ParallelPos) => (m.at === "Q" ? "top" : "bottom");

const parallelAngles: Gen = (r, tier) => {
  const theta = until(() => {
    const t = size(r, tier, 40, 140);
    return Math.abs(t - 90) < 15 ? null : t;
  });
  const rot = tier === 1 ? 0 : r.int(-25, 25);

  if (tier === 2 && r.next() < 0.35) {
    // Name the pair.
    const want = r.pick(["corresponding", "alternate", "co-interior", "vertically opposite"] as const);
    const [a, b] = until(() => {
      const p = r.pick(ALL_POS);
      const q = r.pick(ALL_POS);
      return pairKind(p, q) === want ? [p, q] : null;
    });
    const options = Object.values(PAIR_NAMES);
    const spec = parallelDiagram(
      theta,
      [
        { ...a, text: "a", highlight: true },
        { ...b, text: "b", highlight: true },
      ],
      rot,
    );
    return choiceQ(
      `Angles a and b are a pair. What type of pair are they?`,
      spec,
      options,
      PAIR_NAMES[want],
      (o) => pairMc(PAIR_NAMES[want], o),
      [`Are they at the same crossing or different crossings?`, `Same position at each crossing: F (corresponding). Opposite sides, inside: Z (alternate). Same side, inside: C (co-interior).`],
      [`a and b ${PAIR_RULE[want].split(",")[0]}.`, `So they are ${PAIR_NAMES[want].toLowerCase()} angles.`],
    );
  }

  let known: ParallelPos;
  let target: ParallelPos;
  if (tier === 1) {
    const want = r.pick(["corresponding", "alternate", "co-interior"] as const);
    [known, target] = until(() => {
      const p = r.pick(ALL_POS);
      const q = r.pick(ALL_POS);
      return pairKind(p, q) === want ? [p, q] : null;
    });
  } else {
    [known, target] = until(() => {
      const p = r.pick(ALL_POS);
      const q = r.pick(ALL_POS);
      return p.at !== q.at ? [p, q] : null;
    });
  }
  const a = parallelSize(theta, known);
  const x = parallelSize(theta, target);
  const kind = pairKind(known, target);
  const spec = parallelDiagram(
    theta,
    [
      { ...known, text: deg(a) },
      { ...target, text: "x" },
    ],
    rot,
  );

  let solution: string[];
  let hints: string[];
  if (kind !== "other") {
    hints = [`Look for an F, Z or C shape joining x and ${a}°.`, `x and ${a}° ${PAIR_RULE[kind].split(",")[0]}.`];
    solution = [`x and ${a}° ${PAIR_RULE[kind]}.`, x === a ? `x = ${x}°` : `x = 180° − ${a}° = ${x}°`];
  } else {
    // Two steps: move x to the known angle's crossing (corresponding), then use that crossing.
    const step = pairKind(known, { at: known.at, pos: target.pos });
    hints = [`Two steps. The angle in the same position as x at the ${where(known)} crossing is equal to x (corresponding).`, `How is that angle related to ${a}°?`];
    solution = [
      `The angle in the same position as x at the ${where(known)} crossing is corresponding to x, so it is also x.`,
      `That angle and ${a}° ${PAIR_RULE[step as Exclude<PairKind, "other">]}.`,
      x === a ? `x = ${x}°` : `x = 180° − ${a}° = ${x}°`,
    ];
  }
  const wrong = x === a ? [{ value: 180 - a, misconception: "par-equal-thought-supplementary" }] : [{ value: a, misconception: kind === "co-interior" ? "par-cointerior-equal" : "par-thought-equal" }];
  return angleQ(`The two lines with arrows are parallel. Find the angle marked x.`, spec, x, wrong, hints, solution);
};

// ================================================================ polygons

const polygonAngles: Gen = (r, tier) => {
  const kinds = tier === 1 ? (["sum", "regInterior", "regExterior"] as const) : (["sum", "regInterior", "regExterior", "sidesFromExt", "sidesFromInt", "missing"] as const);
  const kind = r.pick<string>(kinds);
  const name = (n: number) => POLYGON_NAMES[n].toLowerCase();

  if (kind === "sum") {
    const n = r.pick(tier === 1 ? [5, 6, 8] : [5, 6, 7, 8, 9, 10, 12]);
    const { pts } = n <= 6 ? polygonWith(r, n, 80, 160, 1) : { pts: regularPoints(n, 4, r.int(0, 359)) };
    const total = (n - 2) * 180;
    return angleQ(
      `What do the interior angles of ${an(name(n))} (${n} sides) add up to?`,
      polygonDiagram(pts, [], { description: `${cap(an(name(n)))}: a shape with ${n} straight sides.` }),
      total,
      [
        { value: n * 180, misconception: "poly-sum-n-180" },
        { value: 360, misconception: "poly-sum-n-180" },
      ],
      [`From one corner, draw lines to the other corners. This splits the shape into triangles.`, `A ${n}-sided shape splits into ${n} − 2 = ${n - 2} triangles. Each has 180°.`],
      [`A polygon with ${n} sides splits into ${n} − 2 = ${n - 2} triangles.`, `Sum = ${n - 2} × 180° = ${total}°`],
    );
  }

  if (kind === "regInterior" || kind === "regExterior") {
    const n = r.pick(kind === "regInterior" ? (tier === 1 ? [5, 6, 8, 10] : [5, 6, 8, 9, 10, 12]) : tier === 1 ? [4, 5, 6, 8, 10] : [5, 6, 8, 9, 10, 12]);
    const ext = 360 / n;
    const int = 180 - ext;
    const pts = regularPoints(n, 4, tier === 1 ? undefined : r.int(0, 359));
    // Tick marks show the equal sides; on shapes with many short sides they'd just clutter.
    const ticks = n <= 6 ? pts.map((_, i) => ({ a: `V${i}`, b: `V${(i + 1) % n}`, n: 1 })) : [];
    if (kind === "regInterior") {
      const spec = polygonDiagram(pts, [{ i: 1, text: "x" }], { ticks, description: `A regular ${name(n)}: ${n} equal sides and ${n} equal angles. x is one of the angles inside.` });
      return angleQ(
        `This is a regular ${name(n)}. Find the interior angle x.`,
        spec,
        int,
        [
          { value: (n - 2) * 180, misconception: "poly-forgot-divide" },
          { value: ext, misconception: "poly-gave-exterior" },
        ],
        [`Either: the interior angles add up to (${n} − 2) × 180°, and they're all equal.`, `Or: each exterior angle is 360° ÷ ${n} = ${ext}°, and interior = 180° − exterior.`],
        [`Sum of interior angles = (${n} − 2) × 180° = ${(n - 2) * 180}°.`, `It's regular, so all ${n} angles are equal: ${(n - 2) * 180}° ÷ ${n} = ${int}°.`, `(Check: exterior = 360° ÷ ${n} = ${ext}°, and 180° − ${ext}° = ${int}°.)`],
      );
    }
    const [x0, y0] = pts[0];
    const [x1, y1] = pts[1];
    const side = Math.hypot(x1 - x0, y1 - y0);
    const E: P = [x1 + ((x1 - x0) / side) * 3, y1 + ((y1 - y0) / side) * 3];
    const base = polygonDiagram(pts, [], { ticks, description: "" });
    const spec: AngleSpec = {
      ...base,
      points: { ...base.points, E },
      segments: [...base.segments, ["V1", "E"]],
      angles: [{ at: "V1", from: "E", to: "V2", text: "x" }],
      description: `A regular ${name(n)} with one side made longer. x is the exterior angle: the angle outside the shape between the longer side and the next side.`,
    };
    return angleQ(
      `This is a regular ${name(n)}. Find the exterior angle x.`,
      spec,
      ext,
      [
        { value: int, misconception: "poly-gave-interior" },
        { value: 180 / n, misconception: "poly-sides-used-180" },
      ],
      [`Walk all the way round the shape: you turn through the exterior angles, one full turn.`, `The exterior angles add up to 360°, and there are ${n} equal ones.`],
      [`Exterior angles of any polygon add up to 360°.`, `It's regular, so x = 360° ÷ ${n} = ${ext}°.`],
    );
  }

  if (kind === "sidesFromExt" || kind === "sidesFromInt") {
    const n = r.pick([5, 6, 8, 9, 10, 12, 15, 18, 20]);
    const ext = 360 / n;
    const int = 180 - ext;
    const fromInt = kind === "sidesFromInt";
    const wrong = fromInt ? [{ value: 360 / int, misconception: "poly-sides-used-interior" }] : [{ value: 180 / ext, misconception: "poly-sides-used-180" }];
    return {
      prompt: `Each ${fromInt ? "interior" : "exterior"} angle of a regular polygon is ${fromInt ? int : ext}°. How many sides does it have?`,
      answer: { kind: "integer", value: n },
      wrongAnswers: cleanWrong(n, wrong),
      answerHelp: COUNT_HELP,
      hints: fromInt ? [`Find the exterior angle first: 180° − ${int}°.`, `The exterior angles add up to 360°. How many fit into 360°?`] : [`The exterior angles add up to 360°, and they're all equal.`, `How many lots of ${ext}° make 360°?`],
      solution: [...(fromInt ? [`Exterior angle = 180° − ${int}° = ${ext}°.`] : []), `Exterior angles add up to 360°.`, `Number of sides = 360° ÷ ${ext}° = ${n}.`],
    };
  }

  // A missing angle in an irregular pentagon or hexagon.
  const n = r.pick([5, 6]);
  const { angles, pts } = polygonWith(r, n, n === 5 ? 80 : 95, n === 5 ? 150 : 160, 1);
  const xi = r.int(0, n - 1);
  const known = angles.filter((_, i) => i !== xi);
  const sum = known.reduce((s, a) => s + a, 0);
  const total = (n - 2) * 180;
  const spec = polygonDiagram(pts, angles.map((a, i) => ({ i, text: i === xi ? "x" : deg(a) })), { description: `${cap(an(name(n)))} with angles ${angles.map((a, i) => (i === xi ? "x" : `${a}°`)).join(", ")}.` });
  return angleQ(
    `Find the angle marked x in this ${name(n)}.`,
    rotate(spec, r.int(-15, 15)),
    angles[xi],
    [
      { value: n * 180 - sum, misconception: "poly-sum-n-180" },
      { value: 360 - sum, misconception: "poly-sum-n-180" },
    ],
    [`First find what all ${n} angles add up to: (${n} − 2) × 180°.`, `Then take away the ${n - 1} angles you know.`],
    [`Angles in ${an(name(n))} add up to (${n} − 2) × 180° = ${total}°.`, `Known angles: ${known.join("° + ")}° = ${sum}°`, `x = ${total}° − ${sum}° = ${angles[xi]}°`],
  );
};

export const ANGLE_GENERATORS: Record<string, Gen> = {
  "geo-angle-basics": angleBasics,
  "geo-angle-facts": angleFacts,
  "geo-shape-properties": shapeProperties,
  "geo-triangle-quad-angles": triangleQuad,
  "geo-parallel-angles": parallelAngles,
  "geo-polygon-angles": polygonAngles,
};
