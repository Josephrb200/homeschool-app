/**
 * Builders for right-angled, congruent and similar triangle diagrams. Every
 * diagram is drawn to scale: a side labelled 12 cm really is 12 units long,
 * and an angle labelled 35° really is 35°. A test measures every label.
 */

import type { AngleMark, AngleSpec } from "@/engine/types";
import { dirPt, type P } from "../angles/geometry";

export type { P };
const rad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

/** Distance between two named points of a diagram. */
export const dist = (spec: AngleSpec, a: string, b: string) => {
  const [x1, y1] = spec.points[a];
  const [x2, y2] = spec.points[b];
  return Math.hypot(x2 - x1, y2 - y1);
};

/** Show a length without trailing zeros: 7, 7.5, 12.25. */
export const num = (x: number) => String(Math.round(x * 1000) / 1000);
export const len = (x: number, unit = "cm") => `${num(x)} ${unit}`;

// ------------------------------------------------------------ moving shapes

export interface Pose {
  /** Turn anticlockwise by this many degrees. */
  rot?: number;
  /** Mirror left-to-right first. */
  flip?: boolean;
  /** Enlarge by this scale factor first. */
  k?: number;
}

/** Move a list of points: enlarge, mirror, then turn (about the origin). */
export function pose(pts: P[], p: Pose): P[] {
  const c = Math.cos(rad(p.rot ?? 0));
  const s = Math.sin(rad(p.rot ?? 0));
  const k = p.k ?? 1;
  return pts.map(([x0, y0]) => {
    const x = (p.flip ? -x0 : x0) * k;
    const y = y0 * k;
    return [x * c - y * s, x * s + y * c] as P;
  });
}

/** Shift points so the lowest point sits on y = 0 and the leftmost on x = x0. */
function settle(pts: P[], x0 = 0): P[] {
  const minX = Math.min(...pts.map((p) => p[0]));
  const minY = Math.min(...pts.map((p) => p[1]));
  return pts.map(([x, y]) => [x - minX + x0, y - minY] as P);
}

const width = (pts: P[]) => Math.max(...pts.map((p) => p[0])) - Math.min(...pts.map((p) => p[0]));
const height = (pts: P[]) => Math.max(...pts.map((p) => p[1])) - Math.min(...pts.map((p) => p[1]));

// ------------------------------------------------------------ triangles from measurements

/** Triangle ABC from its three sides (a = BC, b = CA, c = AB). A at the origin, B along the x-axis. */
export function triSSS(a: number, b: number, c: number): P[] {
  const x = (b * b + c * c - a * a) / (2 * c);
  return [
    [0, 0],
    [c, 0],
    [x, Math.sqrt(Math.max(0, b * b - x * x))],
  ];
}

/** Triangle ABC from sides AB = c, AC = b and the angle A between them (degrees). */
export function triSAS(c: number, angleA: number, b: number): P[] {
  return [[0, 0], [c, 0], dirPt(angleA, b)];
}

/** Triangle ABC from angles A and B (degrees) and the side AB = c between them. */
export function triASA(angleA: number, c: number, angleB: number): P[] {
  const b = (c * Math.sin(rad(angleB))) / Math.sin(rad(angleA + angleB));
  return [[0, 0], [c, 0], dirPt(angleA, b)];
}

/** Interior angle (degrees) at corner i of a triangle or polygon. */
export function cornerAngle(pts: P[], i: number): number {
  const n = pts.length;
  const [ox, oy] = pts[i];
  const [ax, ay] = pts[(i + 1) % n];
  const [bx, by] = pts[(i + n - 1) % n];
  const d = Math.abs(Math.atan2(ay - oy, ax - ox) - Math.atan2(by - oy, bx - ox));
  return toDeg(d > Math.PI ? 2 * Math.PI - d : d);
}

/** True if every angle is between lo and hi degrees (so it draws clearly). */
export const wellShaped = (pts: P[], lo = 25, hi = 125) => pts.every((_, i) => cornerAngle(pts, i) >= lo - 1e-9 && cornerAngle(pts, i) <= hi + 1e-9);

// ------------------------------------------------------------ one right-angled triangle

export interface RightTriangleOpts {
  /** Names for [right-angle corner, corner at the end of the base, top corner]. */
  names?: [string, string, string];
  /** Text on each side. base = right angle to base corner, height = right angle to top, hyp = the long side. */
  sides?: { base?: string; height?: string; hyp?: string };
  /** An angle mark at the base corner or the top corner. */
  angle?: { at: "base" | "top"; text: string; highlight?: boolean };
  /** Show the corner names as letters. */
  letters?: boolean;
  pose?: Pose;
  description: string;
}

/**
 * A right-angled triangle with legs `base` and `height` (real units), right
 * angle marked. Turned and mirrored by `pose` for variety.
 */
export function rightTriangle(base: number, height: number, o: RightTriangleOpts): AngleSpec {
  const [R, B, T] = o.names ?? ["R", "B", "T"];
  const pts = pose(
    [
      [0, 0],
      [base, 0],
      [0, height],
    ],
    o.pose ?? {},
  );
  const lengths: { a: string; b: string; text: string }[] = [];
  if (o.sides?.base) lengths.push({ a: R, b: B, text: o.sides.base });
  if (o.sides?.height) lengths.push({ a: R, b: T, text: o.sides.height });
  if (o.sides?.hyp) lengths.push({ a: B, b: T, text: o.sides.hyp });
  const angles: AngleMark[] = [{ at: R, from: B, to: T, right: true }];
  if (o.angle) angles.push(o.angle.at === "base" ? { at: B, from: T, to: R, text: o.angle.text, highlight: o.angle.highlight } : { at: T, from: R, to: B, text: o.angle.text, highlight: o.angle.highlight });
  return {
    points: { [R]: pts[0], [B]: pts[1], [T]: pts[2] },
    segments: [
      [R, B],
      [B, T],
      [T, R],
    ],
    polygon: [R, B, T],
    angles,
    lengths,
    labels: o.letters ? [R, B, T] : undefined,
    description: o.description,
  };
}

// ------------------------------------------------------------ two shapes side by side

export interface ShapeMarks {
  /** Side labels by corner index: the side from corner i to corner i+1. */
  sides?: { i: number; text: string }[];
  /** Angle marks by corner index. */
  angles?: { i: number; text?: string; right?: boolean; highlight?: boolean }[];
  /** Equal-side ticks by side index. */
  ticks?: { i: number; n: number }[];
}

/**
 * Two shapes next to each other in one drawing, both at the same scale, with
 * marks on each. Shapes are given as points (they are moved, not resized).
 */
export function twoShapes(
  first: { pts: P[]; names: string[]; marks: ShapeMarks },
  second: { pts: P[]; names: string[]; marks: ShapeMarks },
  o: { letters?: boolean; description: string },
): AngleSpec {
  const gap = Math.max(2.5, 0.35 * Math.max(width(first.pts), width(second.pts), height(first.pts), height(second.pts)));
  const p1 = settle(first.pts);
  const p2 = settle(second.pts, width(first.pts) + gap);
  const points: Record<string, P> = {};
  const segments: [string, string][] = [];
  const angles: AngleMark[] = [];
  const lengths: { a: string; b: string; text: string }[] = [];
  const ticks: { a: string; b: string; n: number }[] = [];
  for (const [pts, shape] of [
    [p1, first],
    [p2, second],
  ] as const) {
    const n = pts.length;
    const nm = (i: number) => shape.names[(i + n) % n];
    pts.forEach((p, i) => {
      points[nm(i)] = p;
      segments.push([nm(i), nm(i + 1)]);
    });
    for (const s of shape.marks.sides ?? []) lengths.push({ a: nm(s.i), b: nm(s.i + 1), text: s.text });
    for (const t of shape.marks.ticks ?? []) ticks.push({ a: nm(t.i), b: nm(t.i + 1), n: t.n });
    for (const m of shape.marks.angles ?? []) angles.push({ at: nm(m.i), from: nm(m.i + 1), to: nm(m.i - 1), text: m.text, right: m.right, highlight: m.highlight });
  }
  return {
    points,
    segments,
    polygons: [first.names, second.names],
    angles,
    lengths,
    ticks: ticks.length ? ticks : undefined,
    labels: o.letters ? [...first.names, ...second.names] : undefined,
    wide: true,
    description: o.description,
  };
}

/** A w × h rectangle as corner points, anticlockwise from bottom left. */
export const rectPts = (w: number, h: number): P[] => [
  [0, 0],
  [w, 0],
  [w, h],
  [0, h],
];
