/**
 * Transformations on a coordinate grid: reflect, rotate, translate and enlarge
 * points and shapes, and build the grid pictures. Shared by the question
 * generators, worked examples and demos, so every picture is exact.
 */

import type { PlaneSpec } from "@/engine/types";

export type P = [number, number];
export type Shape = P[];

/** Numbers with a true minus sign: −3. */
export const n = (x: number) => (Object.is(x, -0) ? "0" : String(Math.round(x * 1000) / 1000).replace("-", "−"));
/** "(3, −2)" */
export const coord = (p: P) => `(${n(p[0])}, ${n(p[1])})`;
/** A column vector in MathText notation: vec(3,−2). */
export const vec = (v: P) => `vec(${n(v[0])},${n(v[1])})`;

// ---------------------------------------------------------------- reflection

export type Mirror = { kind: "x"; c: number } | { kind: "y"; c: number } | { kind: "y=x" } | { kind: "y=-x" };

export function reflect(p: P, m: Mirror): P {
  if (m.kind === "x") return [2 * m.c - p[0], p[1]];
  if (m.kind === "y") return [p[0], 2 * m.c - p[1]];
  if (m.kind === "y=x") return [p[1], p[0]];
  return [-p[1], -p[0]];
}

/** The equation of a mirror line: "x = 3", "y = −1", "y = x", "y = −x". */
export function mirrorName(m: Mirror): string {
  if (m.kind === "x") return `x = ${n(m.c)}`;
  if (m.kind === "y") return `y = ${n(m.c)}`;
  return m.kind === "y=x" ? "y = x" : "y = −x";
}

/** "the line x = 3" or "the y-axis". */
export function mirrorWords(m: Mirror): string {
  if (m.kind === "x" && m.c === 0) return "the y-axis (x = 0)";
  if (m.kind === "y" && m.c === 0) return "the x-axis (y = 0)";
  return `the line ${mirrorName(m)}`;
}

/** The mirror line drawn across the whole window. */
export function mirrorSegment(m: Mirror, win: Window): { a: P; b: P } {
  const [x0, x1] = win.x;
  const [y0, y1] = win.y;
  if (m.kind === "x") return { a: [m.c, y0], b: [m.c, y1] };
  if (m.kind === "y") return { a: [x0, m.c], b: [x1, m.c] };
  const lo = Math.max(x0, m.kind === "y=x" ? y0 : -y1);
  const hi = Math.min(x1, m.kind === "y=x" ? y1 : -y0);
  return m.kind === "y=x" ? { a: [lo, lo], b: [hi, hi] } : { a: [lo, -lo], b: [hi, -hi] };
}

// ---------------------------------------------------------------- rotation

export type Turn = { deg: 90 | 180; dir: "clockwise" | "anticlockwise"; c: P };

export function rotate(p: P, t: Turn): P {
  const dx = p[0] - t.c[0];
  const dy = p[1] - t.c[1];
  if (t.deg === 180) return [t.c[0] - dx, t.c[1] - dy];
  return t.dir === "clockwise" ? [t.c[0] + dy, t.c[1] - dx] : [t.c[0] - dy, t.c[1] + dx];
}

export const turnWords = (t: Turn) => (t.deg === 180 ? "180°" : `90° ${t.dir}`);
export const opposite = (t: Turn): Turn => ({ ...t, dir: t.dir === "clockwise" ? "anticlockwise" : "clockwise" });

// ---------------------------------------------------------------- translation and enlargement

export const translate = (p: P, v: P): P => [p[0] + v[0], p[1] + v[1]];

export const enlarge = (p: P, k: number, c: P): P => [c[0] + k * (p[0] - c[0]), c[1] + k * (p[1] - c[1])];

/** A vector in words: "3 right and 2 down". */
export function vectorWords(v: P): string {
  const parts: string[] = [];
  if (v[0] !== 0) parts.push(`${Math.abs(v[0])} ${v[0] > 0 ? "right" : "left"}`);
  if (v[1] !== 0) parts.push(`${Math.abs(v[1])} ${v[1] > 0 ? "up" : "down"}`);
  return parts.join(" and ") || "no move";
}

// ---------------------------------------------------------------- shapes

export const map = (s: Shape, f: (p: P) => P): Shape => s.map(f);
export const shift = (s: Shape, v: P): Shape => s.map((p) => translate(p, v));

/** Two shapes are the same if they have the same corners (in any order). */
export function sameShape(a: Shape, b: Shape): boolean {
  const key = (s: Shape) =>
    s
      .map((p) => `${Math.round(p[0] * 1000)},${Math.round(p[1] * 1000)}`)
      .sort()
      .join(" ");
  return a.length === b.length && key(a) === key(b);
}

export type Box = { x0: number; x1: number; y0: number; y1: number };
export function box(...shapes: Shape[]): Box {
  const pts = shapes.flat();
  return {
    x0: Math.min(...pts.map((p) => p[0])),
    x1: Math.max(...pts.map((p) => p[0])),
    y0: Math.min(...pts.map((p) => p[1])),
    y1: Math.max(...pts.map((p) => p[1])),
  };
}

/** True if the shapes' boxes are at least `gap` apart (so labels and outlines don't touch). */
export function apart(a: Shape, b: Shape, gap = 1): boolean {
  const p = box(a);
  const q = box(b);
  return p.x1 + gap <= q.x0 || q.x1 + gap <= p.x0 || p.y1 + gap <= q.y0 || q.y1 + gap <= p.y0;
}

export type Window = { x: [number, number]; y: [number, number] };

/** True if every corner is inside the window, at least one square in from its edges (so labels aren't cut off). */
export function fits(s: Shape, win: Window): boolean {
  return s.every(([x, y]) => x >= win.x[0] + 1 && x <= win.x[1] - 1 && y >= win.y[0] + 1 && y <= win.y[1] - 1);
}

/**
 * Small shapes with no line of symmetry and no rotational symmetry, so a
 * reflection, a rotation and a translation of one always look different.
 * Corners start at (0, 0).
 */
export const BASE_SHAPES: { name: string; points: Shape }[] = [
  { name: "right-angled triangle", points: [[0, 0], [2, 0], [0, 3]] },
  { name: "L-shape", points: [[0, 0], [2, 0], [2, 1], [1, 1], [1, 3], [0, 3]] },
  { name: "trapezium", points: [[0, 0], [3, 0], [3, 2], [1, 2]] },
  { name: "flag shape", points: [[0, 0], [1, 0], [1, 1], [3, 2], [1, 3], [0, 3]] },
];
export const SMALL_SHAPES: { name: string; points: Shape }[] = [
  { name: "right-angled triangle", points: [[0, 0], [2, 0], [0, 1]] },
  { name: "L-shape", points: [[0, 0], [2, 0], [2, 1], [1, 1], [1, 2], [0, 2]] },
  { name: "trapezium", points: [[0, 0], [2, 0], [2, 1], [1, 1]] },
];

/** Grid window from tier: tier 1 is the first quadrant, tier 2 all four. */
export const WIN1: Window = { x: [0, 10], y: [0, 10] };
export const WIN2: Window = { x: [-6, 6], y: [-6, 6] };

/** A grid picture with axes. Shapes labelled with letters, extras added on top. */
export function grid(win: Window, shapes: { s: Shape; label?: string; tone?: "object" | "image" | "outline"; dashed?: boolean }[], extra: Partial<PlaneSpec> & { description: string }): PlaneSpec {
  return {
    x: [win.x[0], win.x[1] + 0.6],
    y: [win.y[0], win.y[1] + 0.6],
    grid: true,
    axes: true,
    ...extra,
    shapes: [...shapes.map((sh) => ({ points: sh.s, label: sh.label, tone: sh.tone ?? "object", dashed: sh.dashed })), ...(extra.shapes ?? [])],
  };
}

/** Corners listed for screen readers: "(1, 2), (3, 2) and (1, 5)". */
export function cornerList(s: Shape): string {
  const c = s.map(coord);
  return `${c.slice(0, -1).join(", ")} and ${c[c.length - 1]}`;
}
