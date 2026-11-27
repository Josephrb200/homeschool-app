/**
 * Question generators for measuring angles (protractor), bearings and
 * multi-step angle reasoning.
 *
 * Every diagram is drawn to scale: protractor arms sit at the real angle, and
 * angle-diagram marks are measured by a test against their labels.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher.
 */

import { frac } from "@/engine/fraction";
import type { Rng } from "@/engine/random";
import type { AngleSpec, ProtractorSpec, Question, Visual } from "@/engine/types";
import { ANGLE_HELP } from "../angles/generators";
import { deg, dirPt, lineDiagram, crossingDiagram, crossingSize, pairKind, parallelDiagram, parallelSize, polygonDiagram, polygonFromAngles, rotate, type P, type ParallelPos } from "../angles/geometry";

export type Tier = 1 | 2;
type Gen = (r: Rng, tier: Tier) => Omit<Question, "id" | "skillId">;
type Q = Omit<Question, "id" | "skillId">;

export const BEARING_HELP = "Type the bearing in degrees, like 065. Three figures are best; 65 is also accepted.";

function shuffle<T>(r: Rng, items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = r.int(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function until<T>(make: () => T | null): T {
  for (let k = 0; k < 1000; k++) {
    const v = make();
    if (v !== null) return v;
  }
  throw new Error("bearings: couldn't build a question");
}

/** A whole-number angle answer (always a positive number of degrees). */
function angleQ(prompt: string, visual: Visual | undefined, answer: number, wrong: { value: number; misconception: string }[], hints: string[], solution: string[], help = ANGLE_HELP, text = deg(answer)): Q {
  const seen = new Set([answer]);
  return {
    prompt,
    visual,
    answer: { kind: "integer", value: answer },
    wrongAnswers: wrong
      .filter((w) => {
        if (!Number.isInteger(w.value) || w.value <= 0 || w.value >= 360 || seen.has(w.value)) return false;
        seen.add(w.value);
        return true;
      })
      .map((w) => ({ value: frac(w.value), misconception: w.misconception })),
    answerHelp: help,
    hints,
    solution,
    answerText: text,
  };
}

function choiceQ(prompt: string, visual: Visual | undefined, options: string[], correct: string, mcFor: (o: string) => string, hints: string[], solution: string[]): Q {
  const correctIndex = options.indexOf(correct);
  if (correctIndex < 0) throw new Error(`choice: ${correct} not in options`);
  return {
    prompt,
    visual,
    answer: { kind: "choice", options, correctIndex },
    wrongAnswers: options.map((o, i) => ({ value: i, misconception: mcFor(o) })).filter((w) => w.value !== correctIndex),
    hints,
    solution,
  };
}

const ang = (a: AngleSpec): Visual => ({ kind: "angles", angles: a });
const prot = (p: ProtractorSpec): Visual => ({ kind: "protractor", protractor: p });

// ================================================================ measuring angles

function readProtractor(r: Rng, tier: Tier): Q {
  const size = until(() => {
    const s = tier === 1 ? 5 * r.int(4, 32) : r.int(12, 168);
    return Math.abs(s - 90) < 8 ? null : s;
  });
  const from = r.next() < 0.5 ? "inner" : "outer";
  const turn = tier === 1 ? 0 : r.pick([0, 0, 15, 30, -15, -30, 45]);
  const spec: ProtractorSpec = { size, turn, from, description: `An angle of ${size}° with a protractor on it. One arm lies along the 0 line of the ${from} scale.` };
  const kind = size < 90 ? "acute" : "obtuse";
  return angleQ(
    `Use the protractor to measure this angle.`,
    prot(spec),
    size,
    [{ value: 180 - size, misconception: "prot-wrong-scale" }],
    [`Find the arm that lies on a 0. Use the scale that starts at 0 on that arm.`, `First decide: is the angle acute (less than 90°) or obtuse (more than 90°)? Your reading must match.`],
    [`One arm lies on 0 on the ${from} scale, so read the ${from} scale.`, `Follow it round to the other arm: it reads ${size}°.`, `Check: the angle is ${kind}, and ${size}° is ${kind}. (The other scale says ${180 - size}°, which is wrong.)`],
  );
}

function estimateAngle(r: Rng, tier: Tier): Q {
  const size = until(() => {
    const s = 10 * r.int(2, tier === 1 ? 17 : 34);
    return s === 90 || s === 180 ? null : s;
  });
  const others = until(() => {
    const picks = shuffle(
      r,
      Array.from({ length: tier === 1 ? 16 : 33 }, (_, i) => 10 * (i + 2)).filter((v) => v !== 90 && v !== 180 && Math.abs(v - size) >= 40),
    ).slice(0, 3);
    for (let i = 0; i < picks.length; i++) for (let j = 0; j < i; j++) if (Math.abs(picks[i] - picks[j]) < 30) return null;
    return picks.length === 3 ? picks : null;
  });
  const options = [size, ...others].sort((a, b) => a - b).map(deg);
  const turn = r.int(0, 11) * 30;
  return choiceQ(
    `Estimate the size of the marked angle. Which is closest?`,
    prot({ size, turn, from: "inner", hideProtractor: true, description: `An angle of about ${size}°, with no protractor.` }),
    options,
    deg(size),
    () => "prot-estimate",
    [`Is it smaller than a right angle (90°), between 90° and 180°, or more than a straight line (180°)?`, `Half a right angle is 45°. Two thirds of a right angle is 60°.`],
    [size < 90 ? `It's smaller than a right angle, so it's acute.` : size < 180 ? `It's bigger than a right angle but smaller than a straight line: obtuse.` : `It's more than a straight line: reflex.`, `It's closest to ${size}°.`],
  );
}

function reflexFromProtractor(r: Rng, tier: Tier): Q {
  const small = until(() => {
    const s = tier === 1 ? 10 * r.int(3, 15) : r.int(25, 155);
    return Math.abs(s - 90) < 8 ? null : s;
  });
  const from = r.next() < 0.5 ? "inner" : "outer";
  const reflex = 360 - small;
  return angleQ(
    `The protractor measures the smaller angle between the two arms. What is the reflex angle (the larger angle, the other way round)?`,
    prot({ size: small, turn: tier === 1 ? 0 : r.pick([0, 20, -20, 40]), from, description: `Two arms making an angle of ${small}°, measured with a protractor on the ${from} scale.` }),
    reflex,
    [
      { value: 180 - small, misconception: "prot-reflex-180" },
      { value: small, misconception: "prot-reflex-gave-small" },
      { value: 180 + small, misconception: "prot-wrong-scale" },
    ],
    [`First read the smaller angle: use the scale that starts at 0 on an arm.`, `The two angles go all the way round, so they add up to 360°.`],
    [`The smaller angle reads ${small}° (on the ${from} scale).`, `Reflex angle = 360° − ${small}° = ${reflex}°.`],
  );
}

const measureAngles: Gen = (r, tier) => {
  const roll = r.next();
  if (roll < 0.5) return readProtractor(r, tier);
  if (roll < 0.75) return estimateAngle(r, tier);
  return reflexFromProtractor(r, tier);
};

// ================================================================ bearings

export const threeFig = (b: number) => `${String(b).padStart(3, "0")}°`;

/** Compass bearing → direction in the angle diagram (anticlockwise from east). */
const toMath = (b: number) => 90 - b;

/**
 * A north line at A and a line to B on bearing `b`. `mark`: which angle to
 * label at A ("cw" = clockwise from north, the bearing itself; "acw" = the
 * angle anticlockwise from north; "east"/"south" = from those directions).
 */
export function bearingDiagram(b: number, text: string | undefined, mark: "cw" | "acw" = "cw", withB = false, backText?: string): AngleSpec {
  const len = 6;
  const B = dirPt(toMath(b), len);
  const points: Record<string, P> = { A: [0, 0], N: [0, 3.6], B };
  const segments: [string, string][] = [
    ["A", "N"],
    ["A", "B"],
  ];
  const angles: AngleSpec["angles"] = [];
  if (text !== undefined) angles.push({ at: "A", from: "N", to: "B", text, reflex: mark === "cw" ? b > 180 : b < 180, highlight: text === "x" });
  const labels = ["A", "N", "B"];
  const arrows = [{ a: "A", b: "N", n: 1 }];
  if (withB) {
    // North line at B too, for the bearing back.
    const NB = "N​";
    points[NB] = [B[0], B[1] + 3.6];
    segments.push(["B", NB]);
    labels.push(NB);
    arrows.push({ a: "B", b: NB, n: 1 });
    if (backText !== undefined) {
      const back = (b + 180) % 360;
      angles.push({ at: "B", from: NB, to: "A", text: backText, reflex: back > 180, highlight: backText === "x" });
    }
  }
  // Keep a little room round A so a wide angle mark fits.
  points.S = [0, -1.6];
  return { points, segments, angles, labels, arrows, dots: ["A", "B"], description: `A north line at A${withB ? " and at B" : ""}, and a straight line from A to B.` };
}

function readBearing(r: Rng, tier: Tier): Q {
  const b = until(() => {
    const v = tier === 1 ? 5 * r.int(4, 68) : r.int(15, 345);
    return [0, 90, 180, 270].some((k) => Math.abs(v - k) < 12) ? null : v;
  });
  const mode = tier === 1 ? r.pick(["cw", "cw", "acw"] as const) : r.pick(["cw", "acw", "acw"] as const);
  const shown = mode === "cw" ? b : 360 - b;
  const spec = bearingDiagram(b, deg(shown), mode);
  if (mode === "cw") {
    return angleQ(
      `Write the bearing of B from A as a three-figure bearing.`,
      ang(spec),
      b,
      [{ value: 360 - b, misconception: "bearing-anticlockwise" }],
      [`A bearing is measured clockwise from north.`, `Bearings always have three figures: 65° is written 065°.`],
      [`The angle measured clockwise from north to the line AB is ${b}°.`, `So the bearing of B from A is ${threeFig(b)}.`],
      BEARING_HELP,
      threeFig(b),
    );
  }
  return angleQ(
    `The marked angle is measured anticlockwise from north. What is the bearing of B from A?`,
    ang(spec),
    b,
    [{ value: shown, misconception: "bearing-anticlockwise" }, { value: 180 - shown, misconception: "bearing-not-from-north" }],
    [`Bearings go clockwise from north. The marked angle goes the other way.`, `Clockwise and anticlockwise together make a full turn: 360°.`],
    [`Clockwise from north to AB is 360° − ${shown}° = ${b}°.`, `The bearing of B from A is ${threeFig(b)}.`],
    BEARING_HELP,
    threeFig(b),
  );
}

function backBearing(r: Rng, tier: Tier): Q {
  const b = until(() => {
    const v = tier === 1 ? 5 * r.int(4, 32) : r.int(15, 345);
    return [0, 90, 180, 270].some((k) => Math.abs(v - k) < 12) ? null : v;
  });
  const back = b < 180 ? b + 180 : b - 180;
  const picture = r.next() < 0.7;
  return angleQ(
    `The bearing of B from A is ${threeFig(b)}. What is the bearing of A from B?`,
    picture ? ang(bearingDiagram(b, deg(b), "cw", true, "x")) : undefined,
    back,
    [
      { value: b, misconception: "bearing-back-same" },
      { value: 360 - b, misconception: "bearing-back-360" },
    ],
    [`Going from B back to A is the opposite direction: half a turn, 180°, different.`, b < 180 ? `${b}° is less than 180°, so add 180°.` : `${b}° is more than 180°, so take away 180°.`],
    [
      `A to B and B to A point in opposite directions, so the bearings differ by 180°.`,
      b < 180 ? `${b}° + 180° = ${back}°` : `${b}° − 180° = ${back}°`,
      `The bearing of A from B is ${threeFig(back)}.`,
      `(The north lines are parallel, so the angles at A and B are co-interior: ${b < 180 ? `${b}° + (360° − ${back}°) = 180°` : `(360° − ${b}°) + ${back}° = 180°`}.)`,
    ],
    BEARING_HELP,
    threeFig(back),
  );
}

const COMPASS: [string, number][] = [
  ["north", 0],
  ["north-east", 45],
  ["east", 90],
  ["south-east", 135],
  ["south", 180],
  ["south-west", 225],
  ["west", 270],
  ["north-west", 315],
];

function compassBearing(r: Rng, tier: Tier): Q {
  const [name, b] = r.pick(COMPASS.slice(tier === 1 ? 1 : 1).filter(([, v]) => tier === 2 || v % 90 === 0 || v === 45 || v === 135));
  return angleQ(
    `A ship sails ${name}. What bearing is it sailing on?`,
    undefined,
    b === 0 ? 360 : b,
    [
      { value: 360 - b, misconception: "bearing-compass" },
      { value: (b + 180) % 360, misconception: "bearing-compass" },
    ],
    [`Start facing north (000°) and turn clockwise.`, `East is a quarter turn: 090°. South is 180°, west is 270°. In-between directions are halfway.`],
    [`Turning clockwise from north: N 000°, NE 045°, E 090°, SE 135°, S 180°, SW 225°, W 270°, NW 315°.`, `So ${name} is ${threeFig(b)}.`],
    BEARING_HELP,
    threeFig(b),
  );
}

const bearings: Gen = (r, tier) => {
  const roll = r.next();
  if (roll < 0.45) return readBearing(r, tier);
  if (roll < 0.8) return backBearing(r, tier);
  return compassBearing(r, tier);
};

// ================================================================ angle reasoning

function triangleExterior(r: Rng, tier: Tier): Q {
  const { a, x, pts } = until(() => {
    const a0 = tier === 1 ? 5 * r.int(8, 16) : r.int(35, 85);
    const x0 = tier === 1 ? 5 * r.int(8, 15) : r.int(35, 80);
    const c = 180 - a0 - x0;
    if (c < 30 || Math.abs(c - 90) < 6) return null;
    const p = polygonFromAngles([x0, c, a0], [6], 3);
    return p ? { a: a0, x: x0, pts: p } : null;
  });
  const c = 180 - a - x;
  const e = 180 - c;
  const [B, C] = [pts[0], pts[1]];
  const D: P = [C[0] + (C[0] - B[0]) * 0.55, C[1] + (C[1] - B[1]) * 0.55];
  const base = polygonDiagram(pts, [{ i: 0, text: "x", highlight: true }, { i: 2, text: deg(a) }], { labels: ["A", "B", "C", "D"], description: `Triangle ABC with BC extended to D. Angle BAC is ${a}°, the exterior angle ACD is ${e}°, and angle ABC is marked x.` }, ["B", "C", "A"]);
  base.points.D = D;
  base.segments.push(["C", "D"]);
  base.angles.push({ at: "C", from: "D", to: "A", text: deg(e) });
  return angleQ(
    `BC is extended to D. Find the angle marked x.`,
    ang(rotate(base, tier === 1 ? 0 : 5 * r.int(-6, 6))),
    x,
    [
      { value: c, misconception: "reason-stopped-early" },
      { value: e + a > 179 ? -1 : e + a, misconception: "reason-exterior" },
      { value: 180 - e + a, misconception: "reason-line-triangle" },
    ],
    [`Start with angle ACB: it's on a straight line with ${e}°.`, `Then use the angles in triangle ABC.`],
    [`Angle ACB = 180° − ${e}° = ${c}° (angles on a straight line add up to 180°).`, `x = 180° − ${a}° − ${c}° = ${x}° (angles in a triangle add up to 180°).`, `Shortcut: the exterior angle equals the two opposite inside angles: ${e}° − ${a}° = ${x}°.`],
  );
}

function parallelTriangle(r: Rng, tier: Tier): Q {
  const { al, be } = until(() => {
    const a0 = tier === 1 ? 5 * r.int(8, 15) : r.int(38, 78);
    const b0 = tier === 1 ? 5 * r.int(8, 15) : r.int(38, 78);
    const t = 180 - a0 - b0;
    return t >= 30 && Math.abs(t - 90) > 5 ? { al: a0, be: b0 } : null;
  });
  const x = 180 - al - be;
  const H = 4.5;
  const rad = (d: number) => (d * Math.PI) / 180;
  const ux = H / Math.tan(rad(al));
  const vx = H / Math.tan(rad(be));
  const T: P = [0, H];
  const U: P = [-ux, 0];
  const V: P = [vx, 0];
  const L = Math.max(ux, vx) + 3;
  const spec: AngleSpec = {
    points: { T, U, V, W: [-L, H], E: [L, H], UL: [-L, 0], VR: [L, 0] },
    segments: [
      ["W", "E"],
      ["UL", "VR"],
      ["T", "U"],
      ["T", "V"],
    ],
    angles: [
      { at: "T", from: "W", to: "U", text: deg(al) },
      { at: "V", from: "U", to: "T", text: deg(be) },
      { at: "T", from: "U", to: "V", text: "x", highlight: true },
    ],
    arrows: [
      { a: "W", b: "T", n: 1 },
      { a: "UL", b: "U", n: 1 },
    ],
    labels: ["T", "U", "V"],
    description: `Two parallel lines. Point T is on the top line; U and V are on the bottom line, making triangle TUV. The angle between the top line and TU is ${al}°. Angle TVU is ${be}°. Angle UTV is marked x.`,
  };
  return angleQ(
    `The two lines marked with arrows are parallel. Find the angle marked x.`,
    ang(spec),
    x,
    [
      { value: al, misconception: "reason-stopped-early" },
      { value: 180 - al, misconception: "par-thought-equal" },
      { value: 180 - be, misconception: "reason-wrong-fact" },
    ],
    [`Look for a Z shape: the ${al}° angle and angle TUV are alternate angles.`, `Then use the angles in triangle TUV.`],
    [`Angle TUV = ${al}° (alternate angles are equal).`, `x = 180° − ${al}° − ${be}° = ${x}° (angles in a triangle add up to 180°).`],
  );
}

const REASONS: Record<string, string> = {
  corresponding: "Corresponding angles are equal",
  alternate: "Alternate angles are equal",
  "co-interior": "Co-interior angles add up to 180°",
  "vertically opposite": "Vertically opposite angles are equal",
  "on a straight line": "Angles on a straight line add up to 180°",
};

function whichReason(r: Rng, tier: Tier): Q {
  const theta = until(() => {
    const t = 5 * r.int(8, 28);
    return Math.abs(t - 90) < 15 ? null : t;
  });
  const { a, b, kind } = until(() => {
    const p: ParallelPos = { at: r.pick(["P", "Q"] as const), pos: r.int(0, 3) as 0 | 1 | 2 | 3 };
    const q: ParallelPos = { at: r.pick(["P", "Q"] as const), pos: r.int(0, 3) as 0 | 1 | 2 | 3 };
    const k = pairKind(p, q);
    return k === "other" ? null : { a: p, b: q, kind: k };
  });
  const pa = parallelSize(theta, a);
  const qb = parallelSize(theta, b);
  const spec = parallelDiagram(theta, [
    { ...a, text: deg(pa) },
    { ...b, text: "y", highlight: true },
  ], tier === 1 ? 0 : 5 * r.int(-8, 8));
  const options = Object.values(REASONS);
  return choiceQ(
    `One angle is ${pa}°. Angle y = ${qb}°. Which reason explains this?`,
    ang(spec),
    options,
    REASONS[kind],
    () => "reason-wrong-fact",
    [`Are the two angles at the same crossing or at different crossings?`, `Z shape: alternate. F shape: corresponding. C shape: co-interior. Same crossing, opposite: vertically opposite. Same crossing, side by side: straight line.`],
    [`The two angles make ${kind === "alternate" ? "a Z shape" : kind === "corresponding" ? "an F shape" : kind === "co-interior" ? "a C shape" : kind === "vertically opposite" ? "an X at one crossing" : "a straight line at one crossing"}.`, `${REASONS[kind]}${kind === "co-interior" || kind === "on a straight line" ? `: ${pa}° + ${qb}° = 180°` : ""}.`],
  );
}

/** "(3x + 10)°" */
const expr = (m: number, c: number) => `(${m === 1 ? "" : m}x ${c >= 0 ? "+" : "−"} ${Math.abs(c)})°`;

function algebraAngles(r: Rng, tier: Tier): Q {
  const line = r.next() < 0.55;
  if (line) {
    const { x, m1, c1, m2, c2 } = until(() => {
      const x0 = r.int(10, 40);
      const a = r.int(2, 5);
      const b = r.int(1, 4);
      const ca = r.int(-20, 30);
      const p = a * x0 + ca;
      const cb = 180 - p - b * x0;
      if (p < 35 || p > 145 || Math.abs(p - 90) < 8 || Math.abs(cb) > 60 || cb === 0 || ca === 0 || a === b) return null;
      return { x: x0, m1: a, c1: ca, m2: b, c2: cb };
    });
    const p = m1 * x + c1;
    const wrongEq = (c2 - c1) / (m1 - m2);
    return angleQ(
      `The two angles are on a straight line. Find the value of x.`,
      ang(lineDiagram([p, 180 - p], [expr(m1, c1), expr(m2, c2)], tier === 1 ? 0 : 5 * r.int(-6, 6))),
      x,
      [{ value: wrongEq, misconception: "reason-algebra-sum" }, { value: p, misconception: "reason-stopped-early" }],
      [`Angles on a straight line add up to 180°. Add the two expressions and set them equal to 180.`, `${m1 + m2}x ${c1 + c2 >= 0 ? "+" : "−"} ${Math.abs(c1 + c2)} = 180`],
      [`Angles on a straight line add up to 180°:`, `${expr(m1, c1).slice(1, -2)} + ${expr(m2, c2).slice(1, -2)} = 180`, `${m1 + m2}x ${c1 + c2 >= 0 ? "+" : "−"} ${Math.abs(c1 + c2)} = 180`, `${m1 + m2}x = ${180 - c1 - c2}`, `x = ${x}`, `Check: the angles are ${p}° and ${180 - p}°, which add to 180°.`],
      "Type the value of x, like 25.",
      String(x),
    );
  }
  const { x, m1, c1, m2, c2 } = until(() => {
    const x0 = r.int(8, 35);
    const a = r.int(2, 5);
    const b = r.int(1, a - 1);
    const ca = r.int(-25, 25);
    const p = a * x0 + ca;
    const cb = p - b * x0;
    if (p < 30 || p > 150 || Math.abs(p - 90) < 12 || ca === 0 || cb === 0) return null;
    return { x: x0, m1: a, c1: ca, m2: b, c2: cb };
  });
  const p = m1 * x + c1;
  const wrongSum = (180 - c1 - c2) / (m1 + m2);
  return angleQ(
    `Two straight lines cross. Find the value of x.`,
    ang(crossingDiagram(p, [{ pos: 0, text: expr(m1, c1) }, { pos: 2, text: expr(m2, c2) }], tier === 1 ? 0 : 5 * r.int(-6, 6))),
    x,
    [{ value: wrongSum, misconception: "reason-algebra-equal" }, { value: p, misconception: "reason-stopped-early" }],
    [`The two marked angles are vertically opposite, so they're equal.`, `Set them equal: ${expr(m1, c1).slice(1, -2)} = ${expr(m2, c2).slice(1, -2)}.`],
    [`Vertically opposite angles are equal:`, `${expr(m1, c1).slice(1, -2)} = ${expr(m2, c2).slice(1, -2)}`, `${m1 - m2}x = ${c2 - c1}`, `x = ${x}`, `Check: both angles are ${p}° (and the drawing matches: ${crossingSize(p, 0)}°).`],
    "Type the value of x, like 25.",
    String(x),
  );
}

const angleReasoning: Gen = (r, tier) => {
  const roll = r.next();
  if (roll < 0.28) return triangleExterior(r, tier);
  if (roll < 0.54) return parallelTriangle(r, tier);
  if (roll < 0.76) return whichReason(r, tier);
  return algebraAngles(r, tier);
};

export const BEARING_GENERATORS: Record<string, Gen> = {
  "geo-measure-angles": measureAngles,
  "geo-bearings": bearings,
  "geo-angle-reasoning": angleReasoning,
};
