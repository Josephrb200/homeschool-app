/**
 * Question generators for transformations: reflection (and line symmetry),
 * rotation (and rotational symmetry), translation, enlargement, and
 * describing a transformation fully.
 *
 * Every grid picture is exact: images are computed by the same functions the
 * answers use, and a test checks each one. Tier 1 uses simpler moves (mirror
 * lines parallel to the axes, rotations about the origin, whole-number scale
 * factors); tier 2 adds y = ±x, other centres and scale factor ½.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher.
 */

import { frac } from "@/engine/fraction";
import type { Rng } from "@/engine/random";
import type { AngleSpec, PlaneSpec, Question, Visual } from "@/engine/types";
import { polygonDiagram, regularPoints, POLYGON_NAMES } from "../angles/geometry";
import { quadSpec } from "../angles/generators";
import {
  apart,
  BASE_SHAPES,
  box,
  coord,
  cornerList,
  enlarge,
  fits,
  grid,
  map,
  mirrorName,
  mirrorSegment,
  mirrorWords,
  n,
  opposite,
  reflect,
  rotate,
  sameShape,
  shift,
  SMALL_SHAPES,
  translate,
  turnWords,
  vec,
  vectorWords,
  WIN1,
  WIN2,
  type Mirror,
  type P,
  type Shape,
  type Turn,
  type Window,
} from "./geometry";

export type Tier = 1 | 2;
type Gen = (r: Rng, tier: Tier) => Omit<Question, "id" | "skillId">;
type Q = Omit<Question, "id" | "skillId">;

export const POINT_HELP = "Type the coordinates with a comma between them, x first, like (3, −2). Brackets are fine but not needed.";
export const VECTOR_HELP = "Type the top number, a comma, then the bottom number, like 3, −2. Use a minus sign for left or down.";
const COUNT_HELP = "Type a whole number, like 2. Type 0 if there are none.";

function shuffle<T>(r: Rng, items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = r.int(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function until<T>(make: () => T | null): T {
  for (let k = 0; k < 2000; k++) {
    const v = make();
    if (v !== null) return v;
  }
  throw new Error("transformations: couldn't build a question");
}

const samePt = (a: P, b: P) => a[0] === b[0] && a[1] === b[1];

/** A coordinate (or column vector) answer, with predicted wrong points. */
function pointQ(prompt: string, visual: Visual | undefined, answer: P, wrong: { value: P; misconception: string }[], hints: string[], solution: string[], vector = false): Q {
  const seen: P[] = [answer];
  const wrongAnswers = wrong
    .filter((w) => {
      if (seen.some((s) => samePt(s, w.value))) return false;
      seen.push(w.value);
      return true;
    })
    .map((w) => ({ value: [w.value[0], w.value[1]], misconception: w.misconception }));
  return {
    prompt,
    visual,
    answer: { kind: "point", value: answer, vector: vector || undefined },
    wrongAnswers,
    answerHelp: vector ? VECTOR_HELP : POINT_HELP,
    hints,
    solution,
    answerText: vector ? vec(answer) : coord(answer),
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

function countQ(prompt: string, visual: Visual, answer: number, wrong: { value: number; misconception: string }[], hints: string[], solution: string[]): Q {
  const seen = new Set([answer]);
  return {
    prompt,
    visual,
    answer: { kind: "integer", value: answer },
    wrongAnswers: wrong
      .filter((w) => {
        if (w.value < 0 || seen.has(w.value)) return false;
        seen.add(w.value);
        return true;
      })
      .map((w) => ({ value: frac(w.value), misconception: w.misconception })),
    answerHelp: COUNT_HELP,
    hints,
    solution,
  };
}

// ---------------------------------------------------------------- placing shapes

/** A base shape turned a random number of quarter turns (and maybe flipped), moved so its corner box starts at (0, 0). */
function orient(r: Rng, base: Shape): Shape {
  let s = base;
  const turns = r.int(0, 3);
  for (let k = 0; k < turns; k++) s = s.map(([x, y]) => [-y, x] as P);
  if (r.next() < 0.5) s = s.map(([x, y]) => [-x, y] as P);
  const b = box(s);
  return shift(s, [-b.x0, -b.y0]);
}

/** Put a shape somewhere random inside the window. */
function place(r: Rng, s: Shape, win: Window): Shape {
  const b = box(s);
  return shift(s, [r.int(win.x[0] - b.x0, win.x[1] - b.x1), r.int(win.y[0] - b.y0, win.y[1] - b.y1)]);
}

const pickShape = (r: Rng, small = false) => {
  const b = r.pick(small ? SMALL_SHAPES : BASE_SHAPES);
  return { name: b.name, points: orient(r, b.points) };
};

/** A small window around some shapes and points, at least `size` squares across, for side-by-side pictures. */
function around(shapes: Shape[], extra: P[] = [], size = 6): Window {
  const b = box(...shapes, extra.length ? extra : shapes[0]);
  const pad = (lo: number, hi: number): [number, number] => {
    let a = Math.floor(lo) - 1;
    let z = Math.ceil(hi) + 1;
    while (z - a < size) {
      z++;
      if (z - a < size) a--;
    }
    return [a, z];
  };
  return { x: pad(b.x0, b.x1), y: pad(b.y0, b.y1) };
}

/** A plain grid (no axes) for a picture where coordinates don't matter. */
function plainGrid(win: Window, shapes: { s: Shape; label?: string; tone?: "object" | "image" | "outline" }[], extra: Partial<PlaneSpec> & { description: string }): PlaneSpec {
  return {
    x: win.x,
    y: win.y,
    grid: true,
    ...extra,
    shapes: shapes.map((sh) => ({ points: sh.s, label: sh.label, tone: sh.tone ?? "object" })),
  };
}

const LETTERS = ["A", "B", "C", "D"];

// ================================================================ reflection

function randomMirror(r: Rng, tier: Tier): Mirror {
  if (tier === 1) return r.next() < 0.5 ? { kind: "x", c: r.int(3, 7) } : { kind: "y", c: r.int(3, 7) };
  const roll = r.next();
  if (roll < 0.25) return { kind: "y=x" };
  if (roll < 0.4) return { kind: "y=-x" };
  return r.next() < 0.5 ? { kind: "x", c: r.int(-3, 3) } : { kind: "y", c: r.int(-3, 3) };
}

/** Which side of the mirror a point is on (+1, −1, or 0 on it). */
function side(p: P, m: Mirror): number {
  const v = m.kind === "x" ? p[0] - m.c : m.kind === "y" ? p[1] - m.c : m.kind === "y=x" ? p[1] - p[0] : p[1] + p[0];
  return Math.sign(v);
}

/** A shape fully on one side of the mirror (touching is allowed in tier 2), with its image in the window. */
function shapeForMirror(r: Rng, tier: Tier, m: Mirror, win: Window) {
  return until(() => {
    const base = pickShape(r);
    const s = place(r, base.points, win);
    const sides = s.map((p) => side(p, m));
    const one = sides.every((v) => v >= 0) || sides.every((v) => v <= 0);
    const touching = sides.filter((v) => v === 0).length;
    if (!one || touching > (tier === 1 ? 0 : 1) || sides.every((v) => v === 0)) return null;
    const img = map(s, (p) => reflect(p, m));
    if (!fits(img, win)) return null;
    return { name: base.name, s, img };
  });
}

function distanceWords(p: P, m: Mirror): { d: number; from: string; to: string } {
  if (m.kind === "x") return { d: Math.abs(p[0] - m.c), from: p[0] < m.c ? "left of" : "right of", to: p[0] < m.c ? "right of" : "left of" };
  if (m.kind === "y") return { d: Math.abs(p[1] - m.c), from: p[1] < m.c ? "below" : "above", to: p[1] < m.c ? "above" : "below" };
  return { d: 0, from: "", to: "" };
}

function reflectPoint(r: Rng, tier: Tier): Q {
  const m = randomMirror(r, tier);
  const win = tier === 1 ? WIN1 : WIN2;
  const { s, name } = shapeForMirror(r, tier, m, win);
  const P0 = until(() => {
    const p = r.pick(s);
    return side(p, m) === 0 ? null : p;
  });
  const img = reflect(P0, m);
  const seg = mirrorSegment(m, win);
  const plane = grid(win, [{ s, label: "A" }], {
    lines: [{ ...seg, label: mirrorName(m), tone: "mirror" }],
    points: [{ at: P0, label: "P" }],
    description: `A coordinate grid with shape A, a ${name} with corners at ${cornerList(s)}. Corner P is at ${coord(P0)}. The mirror line ${mirrorName(m)} is drawn.`,
  });
  const prompt = `Shape A is reflected in ${mirrorWords(m)}. Where does corner P end up? Give its coordinates.`;
  const wrong: { value: P; misconception: string }[] = [{ value: [img[1], img[0]], misconception: "coord-swapped" }];
  let hints: string[];
  let solution: string[];
  if (m.kind === "x" || m.kind === "y") {
    const other: Mirror = m.kind === "x" ? { kind: "y", c: m.c } : { kind: "x", c: m.c };
    wrong.unshift(
      { value: reflect(P0, other), misconception: "refl-line-direction" },
      { value: m.kind === "x" ? [m.c, P0[1]] : [P0[0], m.c], misconception: "refl-not-doubled" },
    );
    if (m.c !== 0) wrong.push({ value: reflect(P0, { kind: m.kind, c: 0 }), misconception: "refl-used-axis" });
    const { d, from, to } = distanceWords(P0, m);
    hints = [
      m.kind === "x" ? `${mirrorName(m)} is a vertical line: it goes straight up and down through ${n(m.c)} on the x-axis.` : `${mirrorName(m)} is a horizontal line: it goes straight across through ${n(m.c)} on the y-axis.`,
      `P is ${d} square${d === 1 ? "" : "s"} ${from} the mirror. Its image is the same distance ${to} it.`,
    ];
    solution = [
      `${mirrorName(m)} is a ${m.kind === "x" ? "vertical" : "horizontal"} line.`,
      `P ${coord(P0)} is ${d} square${d === 1 ? "" : "s"} ${from} the line.`,
      `Go ${d} square${d === 1 ? "" : "s"} ${to} the line instead. ${m.kind === "x" ? "The y-coordinate stays the same" : "The x-coordinate stays the same"}.`,
      `P ends up at ${coord(img)}.`,
    ];
  } else {
    wrong.unshift({ value: reflect(P0, m.kind === "y=x" ? { kind: "y=-x" } : { kind: "y=x" }), misconception: "refl-yx-sign" }, { value: [-P0[0], P0[1]], misconception: "refl-used-axis" });
    hints =
      m.kind === "y=x"
        ? [`y = x is the diagonal line through (0, 0), (1, 1), (2, 2) and so on.`, `Reflecting in y = x swaps the x- and y-coordinates.`]
        : [`y = −x is the diagonal line through (0, 0), (1, −1), (−1, 1) and so on.`, `Reflecting in y = −x swaps the coordinates and changes both signs.`];
    solution =
      m.kind === "y=x"
        ? [`Reflecting in y = x swaps the coordinates: (a, b) goes to (b, a).`, `P ${coord(P0)} goes to ${coord(img)}.`, `Check: the line from P to its image crosses y = x at right angles, halfway.`]
        : [`Reflecting in y = −x swaps the coordinates and changes both signs: (a, b) goes to (−b, −a).`, `P ${coord(P0)} goes to ${coord(img)}.`, `Check: the line from P to its image crosses y = −x at right angles, halfway.`];
  }
  return pointQ(prompt, { kind: "plane", plane }, img, wrong, hints, solution);
}

/** Rotate a shape 180° about the middle of its corner box (stays on whole numbers). */
const halfTurnInPlace = (s: Shape): Shape => {
  const b = box(s);
  return s.map(([x, y]) => [b.x0 + b.x1 - x, b.y0 + b.y1 - y] as P);
};
/** Slide a shape so its corner box matches another shape's. */
const slideOnto = (s: Shape, target: Shape): Shape => {
  const a = box(s);
  const b = box(target);
  return shift(s, [b.x0 - a.x0, b.y0 - a.y0]);
};

function mirrorNudge(m: Mirror): (p: P) => P {
  // Reflection in a mirror line moved one square further away from the shape.
  if (m.kind === "x") return (p) => reflect(p, { kind: "x", c: m.c + (p[0] < m.c ? 1 : -1) });
  if (m.kind === "y") return (p) => reflect(p, { kind: "y", c: m.c + (p[1] < m.c ? 1 : -1) });
  if (m.kind === "y=x") return ([a, b]) => (b > a ? [b + 1, a - 1] : [b - 1, a + 1]);
  return ([a, b]) => (a + b > 0 ? [-b - 1, -a - 1] : [1 - b, 1 - a]);
}

function reflectWhich(r: Rng, tier: Tier): Q {
  const m: Mirror = tier === 1 ? (r.next() < 0.5 ? { kind: "x", c: 0 } : { kind: "y", c: 0 }) : r.pick<Mirror>([{ kind: "x", c: 0 }, { kind: "y", c: 0 }, { kind: "y=x" }]);
  const big: Window = { x: [-5, 5], y: [-5, 5] };
  return until(() => {
    const { s, img } = shapeForMirror(r, 2, m, big);
    // Keep it close to the mirror so the pictures stay small.
    const sb = box(s);
    if (m.kind === "x" && Math.min(Math.abs(sb.x0), Math.abs(sb.x1)) > 1) return null;
    if (m.kind === "y" && Math.min(Math.abs(sb.y0), Math.abs(sb.y1)) > 1) return null;
    if (m.kind === "y=x" && Math.min(...s.map(([x, y]) => Math.abs(x - y))) > 1) return null;
    const nudge = mirrorNudge(m);
    const cands = [
      { s: img, mc: "" },
      { s: slideOnto(s, img), mc: "refl-not-flipped" },
      { s: map(s, nudge), mc: "refl-distance" },
      { s: halfTurnInPlace(img), mc: m.kind === "y=x" ? "refl-not-flipped" : "refl-flipped-both" },
    ];
    for (let i = 1; i < cands.length; i++) for (let j = 0; j < i; j++) if (sameShape(cands[i].s, cands[j].s)) return null;
    const order = shuffle(r, [0, 1, 2, 3]);
    const win = around([s, ...cands.map((c) => c.s)], [[0, 0]], 7);
    const seg = mirrorSegment(m, win);
    const panels = order.map((ci, k) => ({
      label: LETTERS[k],
      visual: {
        kind: "plane" as const,
        plane: plainGrid(win, [{ s, label: "S" }, { s: cands[ci].s, tone: "image" }], {
          lines: [{ ...seg, tone: "mirror" }],
          description: `Option ${LETTERS[k]}: shape S and a second shape with corners at ${cornerList(cands[ci].s)}, with the mirror line.`,
        }),
      },
    }));
    const correct = LETTERS[order.indexOf(0)];
    return choiceQ(
      `Shape S is reflected in the mirror line (the bold line). Which picture shows the correct reflection?`,
      { kind: "panels", panels, description: `Four pictures, A to D. Each shows shape S, the mirror line, and a possible reflection. S has corners at ${cornerList(s)}.` },
      LETTERS,
      correct,
      (o) => cands[order[LETTERS.indexOf(o)]].mc,
      [`A reflection flips the shape over the mirror. Every corner ends up the same distance from the mirror, on the other side.`, `Pick one corner of S. Count how far it is from the mirror, then count the same distance out the other side.`],
      [`Each corner of the image must be the same distance from the mirror as the matching corner of S, but on the other side.`, `The image is flipped: it faces the opposite way to S.`, `Picture ${correct} is the only one where every corner works.`],
    );
  });
}

type SymShape = { name: string; spec: AngleSpec; lines: number; order: number; wrongLines: { value: number; misconception: string }[]; wrongOrder: { value: number; misconception: string }[] };

function symShapes(r: Rng, tier: Tier): SymShape[] {
  const rot = tier === 1 ? 0 : 5 * r.int(0, 71);
  const reg = (k: number): SymShape => {
    const name = POLYGON_NAMES[k] === "Triangle" ? "equilateral triangle" : `regular ${POLYGON_NAMES[k].toLowerCase()}`;
    const pts = regularPoints(k);
    const names = pts.map((_, i) => `V${i}`);
    return {
      name,
      spec: polygonDiagram(pts, [], { ticks: names.map((a, i) => ({ a, b: names[(i + 1) % k], n: 1 })), description: `A ${name}: ${k} equal sides (marked with ticks) and ${k} equal angles.` }),
      lines: k,
      order: k,
      wrongLines: [{ value: k % 2 === 0 ? k / 2 : k - 1, misconception: "sym-count" }],
      wrongOrder: [{ value: k % 2 === 0 ? k / 2 : 1, misconception: "sym-count" }],
    };
  };
  const quad = (q: Parameters<typeof quadSpec>[0], name: string, lines: number, order: number, wl: SymShape["wrongLines"], wo: SymShape["wrongOrder"]): SymShape => ({
    name,
    spec: quadSpec(q, rot),
    lines,
    order,
    wrongLines: wl,
    wrongOrder: wo,
  });
  const iso = polygonDiagram(
    [
      [0, 0],
      [5, 0],
      [2.5, 5.5],
    ],
    [],
    {
      ticks: [
        { a: "V1", b: "V2", n: 1 },
        { a: "V2", b: "V0", n: 1 },
      ],
      description: "An isosceles triangle: two equal sides (marked with ticks) and a different base.",
    },
  );
  const items: SymShape[] = [
    quad("Square", "square", 4, 4, [{ value: 2, misconception: "sym-count" }], [{ value: 2, misconception: "sym-count" }]),
    quad("Rectangle", "rectangle", 2, 2, [{ value: 4, misconception: "sym-diagonals" }], [{ value: 4, misconception: "rotsym-used-lines" }]),
    quad("Rhombus", "rhombus", 2, 2, [{ value: 4, misconception: "sym-count" }, { value: 0, misconception: "sym-count" }], [{ value: 4, misconception: "sym-count" }]),
    quad("Parallelogram", "parallelogram", 0, 2, [{ value: 2, misconception: "sym-parallelogram" }], [{ value: 0, misconception: "rotsym-used-lines" }, { value: 1, misconception: "rotsym-used-lines" }]),
    quad("Kite", "kite", 1, 1, [{ value: 2, misconception: "sym-diagonals" }], [{ value: 0, misconception: "rotsym-order-zero" }, { value: 2, misconception: "sym-count" }]),
    quad("Trapezium", "isosceles trapezium", 1, 1, [{ value: 2, misconception: "sym-count" }], [{ value: 0, misconception: "rotsym-order-zero" }]),
    { name: "isosceles triangle", spec: iso, lines: 1, order: 1, wrongLines: [{ value: 3, misconception: "sym-count" }], wrongOrder: [{ value: 0, misconception: "rotsym-order-zero" }] },
    reg(3),
    reg(5),
    reg(6),
  ];
  if (tier === 2) items.push(reg(8), reg(7));
  return items;
}

function symmetryLines(r: Rng, tier: Tier): Q {
  const sh = r.pick(symShapes(r, tier));
  return countQ(
    `How many lines of symmetry does this ${sh.name} have?`,
    { kind: "angles", angles: sh.spec },
    sh.lines,
    sh.wrongLines,
    [`A line of symmetry is a fold line: the two halves land exactly on top of each other.`, `Try folding up and down, across, and corner to corner. Which folds really work?`],
    [
      sh.lines === 0 ? `No fold line makes the two halves match.` : `There ${sh.lines === 1 ? "is 1 fold line" : `are ${sh.lines} fold lines`} where the halves match exactly.`,
      sh.name === "rectangle" ? `The diagonals don't work: fold along one and the corners miss each other.` : sh.name === "parallelogram" ? `Even the diagonals don't work for a parallelogram.` : sh.name.startsWith("regular") || sh.name.startsWith("equilateral") ? `A regular polygon has as many lines of symmetry as sides.` : `Check each possible fold in your head.`,
      `So it has ${sh.lines} line${sh.lines === 1 ? "" : "s"} of symmetry.`,
    ],
  );
}

const reflection: Gen = (r, tier) => {
  const roll = r.next();
  if (roll < 0.45) return reflectPoint(r, tier);
  if (roll < 0.72) return reflectWhich(r, tier);
  return symmetryLines(r, tier);
};

// ================================================================ rotation

function randomTurn(r: Rng, tier: Tier): Turn {
  const deg = r.next() < 0.65 ? 90 : 180;
  const dir = r.next() < 0.5 ? "clockwise" : "anticlockwise";
  const c: P = tier === 1 ? [0, 0] : r.next() < 0.3 ? [0, 0] : [r.int(-2, 2), r.int(-2, 2)];
  return { deg, dir, c };
}

/** "about (0, 0)" or "about the point C (1, −2)". */
const centreWords = (c: P) => (samePt(c, [0, 0]) ? "about the origin (0, 0)" : `about the point C ${coord(c)}`);

function shapeForTurn(r: Rng, t: Turn, win: Window) {
  return until(() => {
    const base = pickShape(r);
    const s = place(r, base.points, win);
    const img = map(s, (p) => rotate(p, t));
    if (!fits(img, win) || !apart(s, img, 0) || s.some((p) => samePt(p, t.c))) return null;
    return { name: base.name, s, img };
  });
}

function rotatePoint(r: Rng, tier: Tier): Q {
  const t = randomTurn(r, tier);
  const win = WIN2;
  const { s, name } = shapeForTurn(r, t, win);
  const P0 = r.pick(s);
  const img = rotate(P0, t);
  const atOrigin = samePt(t.c, [0, 0]);
  const plane = grid(win, [{ s, label: "A" }], {
    points: [{ at: P0, label: "P" }, { at: t.c, label: atOrigin ? undefined : "C", hollow: true }],
    description: `A coordinate grid with shape A, a ${name} with corners at ${cornerList(s)}. Corner P is at ${coord(P0)}.${atOrigin ? "" : ` The centre of rotation C is at ${coord(t.c)}.`}`,
  });
  const wrong: { value: P; misconception: string }[] = [];
  if (t.deg === 90) wrong.push({ value: rotate(P0, opposite(t)), misconception: "rot-direction" }, { value: rotate(P0, { ...t, deg: 180 }), misconception: "rot-90-180" });
  else wrong.push({ value: rotate(P0, { ...t, deg: 90, dir: "clockwise" }), misconception: "rot-90-180" }, { value: rotate(P0, { ...t, deg: 90, dir: "anticlockwise" }), misconception: "rot-90-180" });
  if (!atOrigin) wrong.push({ value: rotate(P0, { ...t, c: [0, 0] }), misconception: "rot-wrong-centre" });
  wrong.push({ value: reflect(P0, { kind: "x", c: t.c[0] }), misconception: "rot-reflected" }, { value: [img[1], img[0]], misconception: "coord-swapped" });
  const dx = P0[0] - t.c[0];
  const dy = P0[1] - t.c[1];
  const from = `${vectorWords([dx, dy])} from the centre`;
  const ndx = img[0] - t.c[0];
  const ndy = img[1] - t.c[1];
  return pointQ(
    `Shape A is rotated ${turnWords(t)} ${centreWords(t.c)}. Where does corner P end up? Give its coordinates.`,
    { kind: "plane", plane },
    img,
    wrong,
    [
      t.deg === 90 ? `${t.dir === "clockwise" ? "Clockwise is the way clock hands go." : "Anticlockwise is the opposite way to clock hands."} 90° is a quarter turn.` : `180° is a half turn: P ends up on the opposite side of the centre.`,
      `P is ${from}. Turn that journey ${t.deg === 180 ? "round to face the opposite way" : `a quarter turn ${t.dir}`}, then count it out from the centre.`,
    ],
    [
      `P ${coord(P0)} is ${from}${atOrigin ? "" : ` C ${coord(t.c)}`}.`,
      t.deg === 180 ? `A half turn reverses both directions: ${vectorWords([ndx, ndy])}.` : `A quarter turn ${t.dir} turns that journey into ${vectorWords([ndx, ndy])}.`,
      `Count that from the centre: P ends up at ${coord(img)}.`,
      `Tip: tracing paper makes this easy. Trace the shape, hold the centre with a pencil point, and turn.`,
    ],
  );
}

function rotateWhich(r: Rng, tier: Tier): Q {
  const t: Turn = { ...randomTurn(r, 1), deg: tier === 1 ? r.pick([90, 90, 180] as const) : r.pick([90, 180] as const) };
  if (tier === 2 && r.next() < 0.6) t.c = [r.int(-1, 1), r.int(-1, 1)];
  const big: Window = { x: [-4, 4], y: [-4, 4] };
  return until(() => {
    const { s, img } = shapeForTurn(r, t, big);
    const cands = [
      { s: img, mc: "" },
      t.deg === 90 ? { s: map(s, (p) => rotate(p, opposite(t))), mc: "rot-direction" } : { s: map(s, (p) => rotate(p, { ...t, deg: 90, dir: "clockwise" })), mc: "rot-90-180" },
      { s: map(s, (p) => reflect(p, { kind: "x", c: t.c[0] })), mc: "rot-reflected" },
      t.deg === 90 ? { s: map(s, (p) => rotate(p, { ...t, deg: 180 })), mc: "rot-90-180" } : { s: map(s, (p) => reflect(p, { kind: "y", c: t.c[1] })), mc: "rot-reflected" },
    ];
    for (let i = 1; i < cands.length; i++) for (let j = 0; j < i; j++) if (sameShape(cands[i].s, cands[j].s)) return null;
    if (cands.some((c) => !apart(c.s, s, 0))) return null;
    const order = shuffle(r, [0, 1, 2, 3]);
    const win = around([s, ...cands.map((c) => c.s)], [t.c], 7);
    const panels = order.map((ci, k) => ({
      label: LETTERS[k],
      visual: {
        kind: "plane" as const,
        plane: plainGrid(win, [{ s, label: "S" }, { s: cands[ci].s, tone: "image" }], {
          points: [{ at: t.c, hollow: true }],
          description: `Option ${LETTERS[k]}: shape S and a second shape with corners at ${cornerList(cands[ci].s)}. The centre of rotation is marked with a circle.`,
        }),
      },
    }));
    const correct = LETTERS[order.indexOf(0)];
    return choiceQ(
      `Shape S is rotated ${turnWords(t)} about the point marked with a circle. Which picture shows the correct image?`,
      { kind: "panels", panels, description: `Four pictures, A to D, each showing shape S, the centre of rotation and a possible image.` },
      LETTERS,
      correct,
      (o) => cands[order[LETTERS.indexOf(o)]].mc,
      [t.deg === 90 ? `A quarter turn ${t.dir}. ${t.dir === "clockwise" ? "Clockwise is the way clock hands go." : "Anticlockwise is the opposite way to clock hands."}` : `A half turn: the image is upside down, on the opposite side of the centre.`, `A rotation turns the shape. It is never flipped over.`],
      [`Imagine pinning the shape at the centre and turning it ${turnWords(t)}.`, `The image must be turned, not flipped, and each corner must stay the same distance from the centre.`, `Picture ${correct} is the only one where that works.`],
    );
  });
}

function rotationalOrder(r: Rng, tier: Tier): Q {
  const sh = r.pick(symShapes(r, tier));
  return countQ(
    `What is the order of rotational symmetry of this ${sh.name}?`,
    { kind: "angles", angles: sh.spec },
    sh.order,
    sh.wrongOrder,
    [`Imagine turning the shape all the way round once. Count how many times it looks exactly the same as at the start.`, `The very end of the turn (back to the start) counts as 1, so the answer is never 0.`],
    [
      sh.order === 1 ? `The ${sh.name} only looks the same when it gets all the way back to the start.` : `In one full turn the ${sh.name} fits onto itself ${sh.order} times.`,
      `So its order of rotational symmetry is ${sh.order}.`,
      sh.order !== sh.lines ? `(It has ${sh.lines} line${sh.lines === 1 ? "" : "s"} of symmetry: that's a different thing.)` : `A regular polygon's order is the same as its number of sides.`,
    ].filter((x) => !(sh.order === sh.lines && !sh.name.includes("regular") && !sh.name.includes("equilateral") && x.startsWith("A regular"))),
  );
}

function rotationWhichTurn(r: Rng): Q {
  const t: Turn = { deg: r.pick([90, 90, 180] as const), dir: r.pick(["clockwise", "anticlockwise"] as const), c: r.next() < 0.5 ? [0, 0] : [r.int(-2, 2), r.int(-2, 2)] };
  const { s, img } = shapeForTurn(r, t, WIN2);
  const atOrigin = samePt(t.c, [0, 0]);
  const plane = grid(WIN2, [{ s, label: "A" }, { s: img, label: "B", tone: "image" }], {
    points: [{ at: t.c, label: atOrigin ? undefined : "C", hollow: true }],
    description: `A coordinate grid with shape A at ${cornerList(s)} and shape B at ${cornerList(img)}.${atOrigin ? "" : ` Point C is at ${coord(t.c)}.`}`,
  });
  const options = ["90° clockwise", "90° anticlockwise", "180°"];
  const correct = turnWords(t);
  return choiceQ(
    `Shape A is rotated ${centreWords(t.c)} to give shape B. What is the rotation?`,
    { kind: "plane", plane },
    options,
    correct,
    (o) => (o === "180°" || correct === "180°" ? "rot-90-180" : "rot-direction"),
    [`Is B a quarter turn or a half turn away from A?`, `For a quarter turn, which way did it go? Clockwise is the way clock hands go.`],
    [t.deg === 180 ? `B is upside down, on the opposite side of the centre: a half turn.` : `B is on its side: a quarter turn, 90°.`, t.deg === 90 ? `It turned the ${t.dir === "clockwise" ? "same way as" : "opposite way to"} clock hands: ${t.dir}.` : `For 180° the direction doesn't matter.`, `So it's a rotation of ${correct}.`],
  );
}

const rotation: Gen = (r, tier) => {
  const roll = r.next();
  if (roll < 0.42) return rotatePoint(r, tier);
  if (roll < 0.65) return rotateWhich(r, tier);
  if (tier === 2 && roll < 0.8) return rotationWhichTurn(r);
  return rotationalOrder(r, tier);
};

// ================================================================ translation

function randomVector(r: Rng, tier: Tier): P {
  return until(() => {
    const v: P = tier === 1 ? [r.int(-5, 5), r.int(-5, 5)] : [r.int(-7, 7), r.int(-7, 7)];
    return v[0] !== 0 && v[1] !== 0 && Math.abs(v[0]) !== Math.abs(v[1]) ? v : null;
  });
}

function translatePoint(r: Rng, tier: Tier): Q {
  const v = randomVector(r, tier);
  const win = tier === 1 ? WIN1 : WIN2;
  const { s, img, name } = until(() => {
    const base = pickShape(r);
    const s0 = place(r, base.points, win);
    const im = shift(s0, v);
    return fits(im, win) ? { s: s0, img: im, name: base.name } : null;
  });
  const P0 = r.pick(s);
  const ans = translate(P0, v);
  const plane = grid(win, [{ s, label: "A" }], {
    points: [{ at: P0, label: "P" }],
    description: `A coordinate grid with shape A, a ${name} with corners at ${cornerList(s)}. Corner P is at ${coord(P0)}.`,
  });
  void img;
  return pointQ(
    `Shape A is translated by the vector ${vec(v)}. Where does corner P end up? Give its coordinates.`,
    { kind: "plane", plane },
    ans,
    [
      { value: translate(P0, [v[1], v[0]]), misconception: "vec-swapped" },
      { value: translate(P0, [v[0], -v[1]]), misconception: "vec-sign" },
      { value: translate(P0, [-v[0], v[1]]), misconception: "vec-sign" },
      { value: translate(P0, [-v[0], -v[1]]), misconception: "vec-reversed" },
      { value: [ans[1], ans[0]], misconception: "coord-swapped" },
    ],
    [`The top number moves left or right. The bottom number moves up or down.`, `${vec(v)} means ${vectorWords(v)}.`],
    [`${vec(v)} means ${vectorWords(v)}.`, `x: ${n(P0[0])} ${v[0] > 0 ? "+" : "−"} ${Math.abs(v[0])} = ${n(ans[0])}`, `y: ${n(P0[1])} ${v[1] > 0 ? "+" : "−"} ${Math.abs(v[1])} = ${n(ans[1])}`, `P ends up at ${coord(ans)}.`],
  );
}

function findVector(r: Rng, tier: Tier): Q {
  const win = tier === 1 ? WIN1 : WIN2;
  const { s, img, v } = until(() => {
    const v0 = randomVector(r, tier);
    const base = pickShape(r);
    const s0 = place(r, base.points, win);
    const im = shift(s0, v0);
    return fits(im, win) && apart(s0, im, 1) ? { s: s0, img: im, v: v0 } : null;
  });
  const b = box(s);
  const w = b.x1 - b.x0;
  const h = b.y1 - b.y0;
  const gap = (d: number, size: number) => (Math.abs(d) > size ? Math.sign(d) * (Math.abs(d) - size) : d);
  const plane = grid(win, [{ s, label: "A" }, { s: img, label: "B", tone: "image" }], {
    description: `A coordinate grid with shape A at ${cornerList(s)} and shape B at ${cornerList(img)}. B is the same shape, the same way round.`,
  });
  const c = s[0];
  const c2 = img[0];
  return pointQ(
    `Shape A is translated to shape B. Write the column vector for this translation.`,
    { kind: "plane", plane },
    v,
    [
      { value: [-v[0], -v[1]], misconception: "vec-reversed" },
      { value: [v[1], v[0]], misconception: "vec-swapped" },
      { value: [gap(v[0], w), gap(v[1], h)], misconception: "vec-gap" },
      { value: [v[0], -v[1]], misconception: "vec-sign" },
      { value: [-v[0], v[1]], misconception: "vec-sign" },
    ],
    [`Pick one corner of A and find the same corner on B.`, `Count how far right (+) or left (−) it moves, then how far up (+) or down (−).`],
    [`Corner ${coord(c)} on A moves to ${coord(c2)} on B.`, `Across: ${n(c2[0])} − ${n(c[0]).replace(/^−/, "(−") + (c[0] < 0 ? ")" : "")} = ${n(v[0])} (${vectorWords([v[0], 0])}).`, `Up/down: ${n(c2[1])} − ${n(c[1]).replace(/^−/, "(−") + (c[1] < 0 ? ")" : "")} = ${n(v[1])} (${vectorWords([0, v[1]])}).`, `The vector is ${vec(v)}.`],
    true,
  );
}

function wordsToVector(r: Rng, tier: Tier): Q {
  const v = randomVector(r, tier);
  const options = shuffle(r, [v, [v[1], v[0]] as P, [-v[0], v[1]] as P, [v[0], -v[1]] as P]);
  const texts = options.map(vec);
  const mcs = ["", "vec-swapped", "vec-sign", "vec-sign"];
  const mcByText = new Map([v, [v[1], v[0]] as P, [-v[0], v[1]] as P, [v[0], -v[1]] as P].map((p, i) => [vec(p), mcs[i]]));
  return choiceQ(
    `A shape is moved ${vectorWords(v).replace(/(\d+) (right|left|up|down)/g, (_m, d, w) => `${d} square${d === "1" ? "" : "s"} ${w}`)}. Which column vector describes this translation?`,
    undefined,
    texts,
    vec(v),
    (o) => mcByText.get(o) ?? "vec-sign",
    [`The top number is left or right; the bottom number is up or down.`, `Right and up are positive. Left and down are negative.`],
    [`Left or right: ${vectorWords([v[0], 0])}, so the top number is ${n(v[0])}.`, `Up or down: ${vectorWords([0, v[1]])}, so the bottom number is ${n(v[1])}.`, `The vector is ${vec(v)}.`],
  );
}

function translateNoGrid(r: Rng): Q {
  const v = randomVector(r, 2);
  const P0: P = [r.int(-6, 6), r.int(-6, 6)];
  const ans = translate(P0, v);
  return pointQ(
    `The point Q ${coord(P0)} is translated by the vector ${vec(v)}. What are the coordinates of its image?`,
    undefined,
    ans,
    [
      { value: translate(P0, [v[1], v[0]]), misconception: "vec-swapped" },
      { value: translate(P0, [-v[0], -v[1]]), misconception: "vec-reversed" },
      { value: translate(P0, [v[0], -v[1]]), misconception: "vec-sign" },
      { value: translate(P0, [-v[0], v[1]]), misconception: "vec-sign" },
    ],
    [`Add the top number to the x-coordinate, and the bottom number to the y-coordinate.`, `x: ${n(P0[0])} + (${n(v[0])}). y: ${n(P0[1])} + (${n(v[1])}).`],
    [`x: ${n(P0[0])} + (${n(v[0])}) = ${n(ans[0])}`, `y: ${n(P0[1])} + (${n(v[1])}) = ${n(ans[1])}`, `The image is ${coord(ans)}.`],
  );
}

const translation: Gen = (r, tier) => {
  const roll = r.next();
  if (roll < 0.35) return translatePoint(r, tier);
  if (roll < 0.7) return findVector(r, tier);
  if (tier === 2 && roll < 0.85) return translateNoGrid(r);
  return wordsToVector(r, tier);
};

// ================================================================ enlargement

const sfText = (k: number) => (k === 0.5 ? "½" : n(k));

function enlargePoint(r: Rng, tier: Tier): Q {
  const k = tier === 1 ? r.pick([2, 3]) : r.pick([2, 3, 0.5, 0.5]);
  const win = tier === 1 ? WIN1 : WIN2;
  const { s, c, name } = until(() => {
    const base = pickShape(r, k !== 0.5);
    const pts = k === 0.5 ? base.points.map(([x, y]) => [2 * x, 2 * y] as P) : base.points;
    const c0: P = tier === 1 ? [r.int(0, 3), r.int(0, 3)] : r.next() < 0.3 ? [0, 0] : [r.int(-4, 4), r.int(-4, 4)];
    const s0 = place(r, pts, win);
    if (k === 0.5 && s0.some(([x, y]) => (x - c0[0]) % 2 !== 0 || (y - c0[1]) % 2 !== 0)) return null;
    const img = map(s0, (p) => enlarge(p, k, c0));
    if (!fits(img, win) || s0.some((p) => samePt(p, c0)) || (k > 1 && !apart(s0, img, -0.5) && false)) return null;
    // Keep the centre outside the shape so the picture is clear.
    const b = box(s0);
    if (c0[0] >= b.x0 && c0[0] <= b.x1 && c0[1] >= b.y0 && c0[1] <= b.y1) return null;
    return { s: s0, c: c0, name: base.name };
  });
  const P0 = until(() => {
    const p = r.pick(s);
    return samePt(p, c) ? null : p;
  });
  const ans = enlarge(P0, k, c);
  const atOrigin = samePt(c, [0, 0]);
  const plane = grid(win, [{ s, label: "A" }], {
    points: [{ at: P0, label: "P" }, { at: c, label: "C", hollow: true }],
    description: `A coordinate grid with shape A, a ${name} with corners at ${cornerList(s)}. Corner P is at ${coord(P0)}. The centre of enlargement C is at ${coord(c)}.`,
  });
  const d: P = [P0[0] - c[0], P0[1] - c[1]];
  const nd: P = [k * d[0], k * d[1]];
  const wrong: { value: P; misconception: string }[] = [];
  if (!atOrigin) wrong.push({ value: [k * P0[0], k * P0[1]], misconception: "enl-ignored-centre" });
  wrong.push({ value: [P0[0] + nd[0], P0[1] + nd[1]], misconception: "enl-extra-step" }, { value: [ans[1], ans[0]], misconception: "coord-swapped" });
  if (k === 0.5) wrong.push({ value: enlarge(P0, 2, c), misconception: "enl-fraction-bigger" });
  return pointQ(
    `Shape A is enlarged by scale factor ${sfText(k)} with centre C ${coord(c)}. Where does corner P end up? Give its coordinates.`,
    { kind: "plane", plane },
    ans,
    wrong,
    [`Count from the centre C to P: ${vectorWords(d)}.`, k === 0.5 ? `Halve that journey, then count it out from C (not from P).` : `Multiply that journey by ${k}, then count it out from C (not from P).`],
    [
      `From C ${coord(c)} to P ${coord(P0)} is ${vectorWords(d)}.`,
      `${k === 0.5 ? "Halve it" : `Multiply by ${k}`}: ${vectorWords(nd)}.`,
      `Count that from C: P ends up at ${coord(ans)}.`,
      atOrigin ? `With the centre at (0, 0) you can also just multiply the coordinates by ${sfText(k)}.` : `Check: the centre, P and its image are in a straight line.`,
    ],
  );
}

function scaleFactor(r: Rng, tier: Tier): Q {
  const shrink = tier === 2 && r.next() < 0.4;
  const k = shrink ? 0.5 : r.pick(tier === 1 ? [2, 3] : [2, 3, 4]);
  const u = r.pick(["cm", "m", "mm"]);
  const w = shrink ? 2 * r.int(2, 6) : r.int(2, 6);
  const h = shrink ? 2 * r.int(1, 4) : r.int(1, 4);
  const W = k * w;
  const H = k * h;
  const tri = r.next() < 0.5;
  const kind = tri ? "right-angled triangle" : "rectangle";
  const shapeA: Shape = tri ? [[0, 0], [w, 0], [0, h]] : [[0, 0], [w, 0], [w, h], [0, h]];
  const shapeB: Shape = shift(
    shapeA.map(([x, y]) => [k * x, k * y] as P),
    [w + 2, 0],
  );
  const plane: PlaneSpec = {
    x: [-1, w + 3 + W],
    y: [-1, Math.max(h, H) + 1],
    shapes: [
      { points: shapeA, label: "A", tone: "object" },
      { points: shapeB, label: "B", tone: "image" },
    ],
    lengths: [
      { a: shapeA[0], b: shapeA[1], text: `${w} ${u}` },
      { a: shapeB[0], b: shapeB[1], text: `${W} ${u}` },
    ],
    description: `Two ${kind}s. A has a base of ${w} ${u}. B has a base of ${W} ${u}. B is an enlargement of A.`,
  };
  const prompt = `Shape B is an enlargement of shape A. What is the scale factor of the enlargement?`;
  const answer = shrink ? { kind: "fraction" as const, value: frac(1, 2), requireSimplest: false } : { kind: "integer" as const, value: k };
  const wrongAnswers = [
    { value: frac(W - w), misconception: "enl-sf-difference" },
    shrink ? { value: frac(2), misconception: "enl-sf-inverted" } : { value: frac(1, k), misconception: "enl-sf-inverted" },
  ].filter((x) => !(x.value.n === (shrink ? 1 : k) && x.value.d === (shrink ? 2 : 1)));
  return {
    prompt,
    visual: { kind: "plane", plane },
    answer,
    wrongAnswers: wrongAnswers.filter((x, i) => wrongAnswers.findIndex((y) => y.value.n * x.value.d === x.value.n * y.value.d) === i),
    answerHelp: shrink ? "Type a fraction like 1/3 or a decimal like 0.25." : "Type a whole number, like 4.",
    hints: [`Scale factor = new length ÷ original length.`, `Compare the bases: ${W} ÷ ${w}.`],
    solution: [`Scale factor = new length ÷ original length.`, `${W} ÷ ${w} = ${sfText(k)}`, shrink ? `B is smaller than A, so the scale factor is less than 1: ½. Every length is halved.` : `Every length on B is ${k} times as long as on A.`],
    answerText: shrink ? "½" : String(k),
  };
}

function imageLength(r: Rng, tier: Tier): Q {
  const k = tier === 1 ? r.int(2, 5) : r.pick([0.5, 1.5, 2.5, 3, 4]);
  const len = k === 0.5 || k === 1.5 || k === 2.5 ? 2 * r.int(2, 9) : r.int(2, 12);
  const u = r.pick(["cm", "m", "mm"]);
  const ans = k * len;
  const what = r.pick(["side", "base", "height"]);
  const wrong = [
    { value: len + k, misconception: "enl-added" },
    ...(k < 1 ? [{ value: len * 2, misconception: "enl-fraction-bigger" }] : []),
  ].filter((w) => w.value !== ans);
  const kText = k === 0.5 ? "½" : n(k);
  return {
    prompt: `A shape is enlarged by scale factor ${kText}. Its ${what} was ${len} ${u}. How long is the ${what} of the enlarged shape, in ${u}?`,
    answer: Number.isInteger(ans) ? { kind: "integer", value: ans } : { kind: "fraction", value: frac(ans * 2, 2), requireSimplest: false },
    wrongAnswers: wrong.map((w) => ({ value: Number.isInteger(w.value) ? frac(w.value) : frac(w.value * 2, 2), misconception: w.misconception })),
    answerHelp: "Type a number, like 12 or 7.5. Units are fine but not needed.",
    hints: [`Every length is multiplied by the scale factor.`, `${len} × ${kText}`],
    solution: [`Every length is multiplied by the scale factor.`, `${len} × ${kText} = ${n(ans)} ${u}`, k < 1 ? `The scale factor is less than 1, so the shape gets smaller.` : `The enlarged shape is ${kText} times as big in every direction.`],
    answerText: `${n(ans)} ${u}`,
  };
}

function findCentre(r: Rng): Q {
  const k = r.pick([2, 3]);
  const { s, img, c } = until(() => {
    const base = pickShape(r, true);
    const c0: P = [r.int(-5, 1), r.int(-5, 1)];
    const s0 = place(r, base.points, WIN2);
    const im = map(s0, (p) => enlarge(p, k, c0));
    const b = box(s0);
    if (c0[0] >= b.x0 - 1 && c0[0] <= b.x1 + 1 && c0[1] >= b.y0 - 1 && c0[1] <= b.y1 + 1) return null;
    return fits(im, WIN2) && apart(s0, im, 0) ? { s: s0, img: im, c: c0 } : null;
  });
  const plane = grid(WIN2, [{ s, label: "A" }, { s: img, label: "B", tone: "image" }], {
    description: `A coordinate grid with shape A at ${cornerList(s)} and shape B at ${cornerList(img)}. B is an enlargement of A.`,
  });
  return pointQ(
    `Shape B is an enlargement of shape A, scale factor ${k}. Find the coordinates of the centre of enlargement.`,
    { kind: "plane", plane },
    c,
    [
      { value: [0, 0], misconception: "enl-ignored-centre" },
      { value: [c[1], c[0]], misconception: "coord-swapped" },
    ],
    [`Join each corner of B to the matching corner of A with a straight line, and keep going.`, `All the lines meet at one point: the centre.`],
    [`Draw lines through matching corners: ${coord(img[0])} to ${coord(s[0])}, and ${coord(img[1])} to ${coord(s[1])}.`, `Extend the lines past A. They cross at ${coord(c)}.`, `Check: ${coord(c)} to ${coord(s[0])} is ${vectorWords([s[0][0] - c[0], s[0][1] - c[1]])}; ${k} times that is ${vectorWords([img[0][0] - c[0], img[0][1] - c[1]])}, which reaches ${coord(img[0])}.`],
  );
}

const enlargement: Gen = (r, tier) => {
  const roll = r.next();
  if (roll < 0.3) return scaleFactor(r, tier);
  if (roll < 0.5) return imageLength(r, tier);
  if (tier === 2 && roll < 0.65) return findCentre(r);
  return enlargePoint(r, tier);
};

// ================================================================ describing

type Kind = "Reflection" | "Rotation" | "Translation" | "Enlargement";
const KINDS: Kind[] = ["Reflection", "Rotation", "Translation", "Enlargement"];

type Made = { kind: Kind; s: Shape; img: Shape; full: string; incomplete: string[]; wrongDetail: string[]; m?: Mirror; t?: Turn; v?: P; k?: number; c?: P };

function makeTransformation(r: Rng, kind: Kind, win: Window): Made {
  return until(() => {
    const base = pickShape(r, kind === "Enlargement");
    const s = place(r, base.points, win);
    if (kind === "Reflection") {
      const m: Mirror = r.next() < 0.75 ? (r.next() < 0.5 ? { kind: "x", c: r.int(-2, 2) } : { kind: "y", c: r.int(-2, 2) }) : { kind: "y=x" };
      if (s.some((p) => side(p, m) === 0) || !(s.every((p) => side(p, m) > 0) || s.every((p) => side(p, m) < 0))) return null;
      const img = map(s, (p) => reflect(p, m));
      if (!fits(img, win)) return null;
      const other: Mirror = m.kind === "x" ? { kind: "y", c: m.c } : m.kind === "y" ? { kind: "x", c: m.c } : { kind: "y=-x" };
      const near: Mirror = m.kind === "x" ? { kind: "x", c: m.c + 1 } : m.kind === "y" ? { kind: "y", c: m.c + 1 } : { kind: "x", c: 0 };
      return { kind, s, img, m, full: `Reflection in the line ${mirrorName(m)}`, incomplete: ["Reflection"], wrongDetail: [`Reflection in the line ${mirrorName(other)}`, `Reflection in the line ${mirrorName(near)}`] };
    }
    if (kind === "Rotation") {
      const t: Turn = { deg: r.pick([90, 90, 180] as const), dir: r.pick(["clockwise", "anticlockwise"] as const), c: r.next() < 0.5 ? [0, 0] : [r.int(-2, 2), r.int(-2, 2)] };
      const img = map(s, (p) => rotate(p, t));
      if (!fits(img, win) || !apart(s, img, 0)) return null;
      const where = `about ${coord(t.c)}`;
      return {
        kind,
        s,
        img,
        t,
        full: `Rotation ${turnWords(t)} ${where}`,
        incomplete: t.deg === 90 ? [`Rotation 90° ${where}`, `Rotation ${turnWords(t)}`] : [`Rotation 180°`],
        wrongDetail: t.deg === 90 ? [`Rotation ${turnWords(opposite(t))} ${where}`] : [`Rotation 90° clockwise ${where}`, `Rotation 180° about ${coord([t.c[0] + 1, t.c[1]])}`],
      };
    }
    if (kind === "Translation") {
      const v = randomVector(r, 2);
      const img = shift(s, v);
      if (!fits(img, win) || !apart(s, img, 1)) return null;
      return { kind, s, img, v, full: `Translation by ${vec(v)}`, incomplete: ["Translation"], wrongDetail: [`Translation by ${vec([-v[0], -v[1]])}`, `Translation by ${vec([v[1], v[0]])}`] };
    }
    const k = r.pick([2, 3]);
    const c: P = [r.int(-5, 0), r.int(-5, 0)];
    const img = map(s, (p) => enlarge(p, k, c));
    const b = box(s);
    if (c[0] >= b.x0 && c[0] <= b.x1 && c[1] >= b.y0 && c[1] <= b.y1) return null;
    if (!fits(img, win) || !apart(s, img, 0)) return null;
    return {
      kind,
      s,
      img,
      k,
      c,
      full: `Enlargement, scale factor ${k}, centre ${coord(c)}`,
      incomplete: [`Enlargement, scale factor ${k}`, `Enlargement, centre ${coord(c)}`],
      wrongDetail: [`Enlargement, scale factor ${k + 1}, centre ${coord(c)}`, ...(samePt(c, [0, 0]) ? [] : [`Enlargement, scale factor ${k}, centre (0, 0)`])],
    };
  });
}

function describePlane(t: Made, win: Window): PlaneSpec {
  return grid(win, [{ s: t.s, label: "A" }, { s: t.img, label: "B", tone: "image" }], {
    description: `A coordinate grid with shape A at ${cornerList(t.s)} and shape B at ${cornerList(t.img)}.`,
  });
}

const KIND_CLUE: Record<Kind, string> = {
  Reflection: "B is the same size but flipped over: it faces the opposite way.",
  Rotation: "B is the same size and not flipped, but it has turned.",
  Translation: "B is the same size, the same way round, and hasn't turned: it has just slid.",
  Enlargement: "B is a different size from A.",
};

function describeType(r: Rng): Q {
  const kind = r.pick(KINDS);
  const t = makeTransformation(r, kind, WIN2);
  return choiceQ(
    `What type of transformation maps shape A onto shape B?`,
    { kind: "plane", plane: describePlane(t, WIN2) },
    KINDS,
    kind,
    () => "desc-type",
    [`Is B the same size as A? Is it flipped over? Has it turned?`, `Same size, same way round: translation. Flipped: reflection. Turned: rotation. New size: enlargement.`],
    [KIND_CLUE[kind], `So it's ${kind === "Enlargement" ? "an" : "a"} ${kind.toLowerCase()}.`],
  );
}

function describeFully(r: Rng): Q {
  const kind = r.pick(KINDS);
  const t = makeTransformation(r, kind, WIN2);
  const otherKind = r.pick(KINDS.filter((k) => k !== kind && !(kind === "Translation" && k === "Enlargement")));
  const decoy = otherKind === "Reflection" ? "Reflection in the line y = x" : otherKind === "Rotation" ? "Rotation 180° about (0, 0)" : otherKind === "Translation" ? `Translation by ${vec([t.img[0][0] - t.s[0][0], t.img[0][1] - t.s[0][1]])}` : "Enlargement, scale factor 2, centre (0, 0)";
  const wrongs = [
    { text: r.pick(t.incomplete), mc: "desc-incomplete" },
    { text: r.pick(t.wrongDetail), mc: "desc-wrong-detail" },
    { text: decoy, mc: "desc-type" },
  ].filter((w, i, all) => w.text !== t.full && all.findIndex((x) => x.text === w.text) === i);
  const options = shuffle(r, [t.full, ...wrongs.map((w) => w.text)]);
  const mcFor = (o: string) => wrongs.find((w) => w.text === o)?.mc ?? "desc-wrong-detail";
  const needs: Record<Kind, string> = {
    Reflection: "a reflection needs the equation of the mirror line",
    Rotation: "a rotation needs the angle, the direction (unless it's 180°) and the centre",
    Translation: "a translation needs the column vector",
    Enlargement: "an enlargement needs the scale factor and the centre",
  };
  const check =
    t.kind === "Reflection" && t.m
      ? `Corner ${coord(t.s[0])} is the same distance from ${mirrorName(t.m)} as ${coord(t.img[0])}, on the other side.`
      : t.kind === "Rotation" && t.t
        ? `Turning corner ${coord(t.s[0])} ${turnWords(t.t)} about ${coord(t.t.c)} lands on ${coord(t.img[0])}.`
        : t.kind === "Translation" && t.v
          ? `Corner ${coord(t.s[0])} moves ${vectorWords(t.v)} to ${coord(t.img[0])}.`
          : `From ${coord(t.c!)} to ${coord(t.s[0])} is ${vectorWords([t.s[0][0] - t.c![0], t.s[0][1] - t.c![1]])}; ${t.k} times that reaches ${coord(t.img[0])}.`;
  return choiceQ(
    `Describe fully the single transformation that maps shape A onto shape B.`,
    { kind: "plane", plane: describePlane(t, WIN2) },
    options,
    t.full,
    mcFor,
    [`First decide the type: ${KIND_CLUE[kind].toLowerCase()}`, `A full description: ${needs[kind]}.`],
    [KIND_CLUE[kind], `To describe it fully, ${needs[kind]}.`, check, `So it's: ${t.full}.`],
  );
}

function describeDetail(r: Rng, tier: Tier): Q {
  const kind = tier === 1 ? r.pick<Kind>(["Reflection", "Translation", "Enlargement"]) : r.pick(KINDS);
  const t = makeTransformation(r, kind, WIN2);
  const plane = describePlane(t, WIN2);
  if (kind === "Reflection" && t.m) {
    const m = t.m;
    const opts =
      m.kind === "x" || m.kind === "y"
        ? [mirrorName(m), mirrorName({ kind: m.kind === "x" ? "y" : "x", c: m.c }), mirrorName({ kind: m.kind, c: m.c + 1 }), mirrorName({ kind: m.kind, c: m.c - 1 })]
        : ["y = x", "y = −x", "x = 0", "y = 0"];
    const correct = mirrorName(m);
    return choiceQ(
      `Shape A is reflected to give shape B. What is the equation of the mirror line?`,
      { kind: "plane", plane },
      shuffle(r, opts),
      correct,
      (o) => (m.kind === "y=x" ? "refl-yx-sign" : o.startsWith(m.kind) ? "desc-wrong-detail" : "refl-line-direction"),
      [`The mirror line is exactly halfway between each corner and its image.`, m.kind === "y=x" ? `Is the line diagonal? Which way does it slope?` : `Is the mirror line vertical (x = …) or horizontal (y = …)?`],
      [m.kind === "y=x" ? `The mirror is the diagonal line through (0, 0), (1, 1), (2, 2): y = x.` : `Corner ${coord(t.s[0])} and its image ${coord(t.img[0])} are the same distance either side of the line.`, m.kind === "y=x" ? `Each corner (a, b) has image (b, a).` : `Halfway between them is ${mirrorName(m)}.`, `The mirror line is ${correct}.`],
    );
  }
  if (kind === "Translation" && t.v) {
    const v = t.v;
    return pointQ(
      `Shape A is translated to give shape B. Write the column vector for the translation.`,
      { kind: "plane", plane },
      v,
      [
        { value: [-v[0], -v[1]], misconception: "vec-reversed" },
        { value: [v[1], v[0]], misconception: "vec-swapped" },
      ],
      [`Follow one corner of A to the same corner of B.`, `Top number: right (+) or left (−). Bottom number: up (+) or down (−).`],
      [`Corner ${coord(t.s[0])} moves to ${coord(t.img[0])}: ${vectorWords(v)}.`, `The column vector is ${vec(v)}.`],
      true,
    );
  }
  if (kind === "Enlargement" && t.c && t.k) {
    const c = t.c;
    if (tier === 1) {
      const b = box(t.s);
      const B = box(t.img);
      return {
        prompt: `Shape A is enlarged to give shape B. What is the scale factor?`,
        visual: { kind: "plane", plane },
        answer: { kind: "integer", value: t.k },
        wrongAnswers: [{ value: frac(B.x1 - B.x0 - (b.x1 - b.x0)), misconception: "enl-sf-difference" }].filter((w) => w.value.n !== t.k && w.value.n > 0),
        answerHelp: "Type a whole number, like 4.",
        hints: [`Compare a length on B with the matching length on A.`, `Scale factor = length on B ÷ length on A.`],
        solution: [`A is ${b.x1 - b.x0} squares wide; B is ${B.x1 - B.x0} squares wide.`, `${B.x1 - B.x0} ÷ ${b.x1 - b.x0} = ${t.k}`, `The scale factor is ${t.k}.`],
      };
    }
    return pointQ(
      `Shape A is enlarged by scale factor ${t.k} to give shape B. What are the coordinates of the centre of enlargement?`,
      { kind: "plane", plane },
      c,
      [{ value: [c[1], c[0]], misconception: "coord-swapped" }],
      [`Draw straight lines through matching corners of B and A, and carry on past A.`, `The lines all cross at the centre.`],
      [`Lines through matching corners cross at ${coord(c)}.`, `Check: from ${coord(c)} to ${coord(t.s[0])} is ${vectorWords([t.s[0][0] - c[0], t.s[0][1] - c[1]])}; ${t.k} times that reaches ${coord(t.img[0])}.`, `The centre is ${coord(c)}.`],
    );
  }
  // Rotation: find the centre.
  const tt = t.t!;
  return pointQ(
    `Shape A is rotated ${turnWords(tt)} to give shape B. What are the coordinates of the centre of rotation?`,
    { kind: "plane", plane },
    tt.c,
    [
      ...(samePt(tt.c, [0, 0]) ? [] : [{ value: [0, 0] as P, misconception: "rot-wrong-centre" }]),
      { value: [tt.c[1], tt.c[0]], misconception: "coord-swapped" },
    ],
    [`Try a point as the centre: turn A about it in your head (or with tracing paper). Does A land on B?`, `The centre is the same distance from a corner of A as from the matching corner of B.`],
    [`Turning A ${turnWords(tt)} about ${coord(tt.c)} lands it exactly on B.`, `Check one corner: ${coord(t.s[0])} goes to ${coord(t.img[0])}.`, `The centre is ${coord(tt.c)}.`],
  );
}

function whatIsNeeded(r: Rng): Q {
  const kind = r.pick<Kind>(["Rotation", "Enlargement", "Reflection", "Translation"]);
  const sets: Record<Kind, { correct: string; wrong: string[] }> = {
    Rotation: { correct: "The angle, the direction and the centre", wrong: ["The angle only", "The angle and the direction", "The mirror line"] },
    Enlargement: { correct: "The scale factor and the centre", wrong: ["The scale factor only", "The centre only", "The column vector"] },
    Reflection: { correct: "The equation of the mirror line", wrong: ["The word 'reflection' is enough", "The centre and the angle", "The column vector"] },
    Translation: { correct: "The column vector", wrong: ["The word 'translation' is enough", "The scale factor", "The centre and the angle"] },
  };
  const set = sets[kind];
  const typeWrong = new Set(["The mirror line", "The column vector", "The centre and the angle", "The scale factor"]);
  return choiceQ(
    `To describe ${kind === "Enlargement" ? "an enlargement" : `a ${kind.toLowerCase()}`} fully, what must you give as well as the type?`,
    undefined,
    shuffle(r, [set.correct, ...set.wrong]),
    set.correct,
    (o) => (typeWrong.has(o) ? "desc-type" : "desc-incomplete"),
    [`Think about what someone would need to know to draw the image from your description.`, `Each type of transformation needs different details.`],
    [`${kind}: ${set.correct.toLowerCase()}.`, kind === "Rotation" ? `(For a 180° turn, the direction doesn't matter.)` : `Without it, someone couldn't draw exactly where the image goes.`],
  );
}

const describe: Gen = (r, tier) => {
  const roll = r.next();
  if (tier === 1) {
    if (roll < 0.35) return describeType(r);
    if (roll < 0.55) return whatIsNeeded(r);
    if (roll < 0.8) return describeDetail(r, 1);
    return describeFully(r);
  }
  if (roll < 0.15) return describeType(r);
  if (roll < 0.6) return describeFully(r);
  return describeDetail(r, 2);
};

export const TRANSFORMATION_GENERATORS: Record<string, Gen> = {
  "geo-reflection": reflection,
  "geo-rotation": rotation,
  "geo-translation": translation,
  "geo-enlargement": enlargement,
  "geo-describe-transformations": describe,
};
