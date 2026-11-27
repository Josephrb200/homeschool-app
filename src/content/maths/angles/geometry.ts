/**
 * Builders for angle and shape diagrams, shared by the question generators,
 * the worked examples and the interactive demos. Everything is drawn to scale:
 * an angle labelled 40° really is 40° on screen.
 */

import type { AngleMark, AngleSpec } from "@/engine/types";

export type P = [number, number];
const rad = (d: number) => (d * Math.PI) / 180;

/** The point `len` away from `o` in direction `deg` (anticlockwise from east). */
export const dirPt = (deg: number, len: number, o: P = [0, 0]): P => [o[0] + len * Math.cos(rad(deg)), o[1] + len * Math.sin(rad(deg))];

/** Rotate every point of a spec about the origin, for variety. */
export function rotate(spec: AngleSpec, deg: number): AngleSpec {
  if (!deg) return spec;
  const c = Math.cos(rad(deg));
  const s = Math.sin(rad(deg));
  const points = Object.fromEntries(Object.entries(spec.points).map(([k, [x, y]]) => [k, [x * c - y * s, x * s + y * c] as P]));
  return { ...spec, points };
}

/** The size in degrees of an angle mark, measured from the drawing (for tests and checks). */
export function measure(spec: AngleSpec, m: AngleMark): number {
  const [ox, oy] = spec.points[m.at];
  const [ax, ay] = spec.points[m.from];
  const [bx, by] = spec.points[m.to];
  const a1 = Math.atan2(ay - oy, ax - ox);
  const a2 = Math.atan2(by - oy, bx - ox);
  let d = Math.abs(((a2 - a1) * 180) / Math.PI) % 360;
  if (d > 180) d = 360 - d;
  return m.reflex ? 360 - d : d;
}

export const deg = (n: number) => `${n}°`;

// ------------------------------------------------------------ one angle

/** One angle at O, from arm A to arm B. Reflex angles are marked on the outside. */
export function singleAngle(size: number, opts: { text?: string; rot?: number; letters?: boolean } = {}): AngleSpec {
  const spec: AngleSpec = {
    points: { O: [0, 0], A: [6, 0], B: dirPt(size, 6) },
    segments: [
      ["O", "A"],
      ["O", "B"],
    ],
    angles: [{ at: "O", from: "A", to: "B", text: opts.text, reflex: size > 180, right: size === 90, highlight: true }],
    labels: opts.letters ? ["O", "A", "B"] : undefined,
    description: `An angle of ${size}°${size === 90 ? ", marked with a small square" : ""}.`,
  };
  // Keep the vertex visible inside the drawing box for wide angles.
  if (size > 90) spec.points.C = [-1.5, 0];
  if (size > 180) spec.points.D = [0, -1.5];
  return rotate(spec, opts.rot ?? 0);
}

// ------------------------------------------------------------ angles on a straight line

/**
 * A straight line W–E through O with rays between. `sizes` add up to 180 and go
 * anticlockwise from E; `texts[i]` labels sizes[i].
 */
export function lineDiagram(sizes: number[], texts: (string | undefined)[], rot = 0): AngleSpec {
  const points: Record<string, P> = { O: [0, 0], E: [6.5, 0], W: [-6.5, 0] };
  const names = ["E"];
  let c = 0;
  sizes.slice(0, -1).forEach((s, i) => {
    c += s;
    points[`R${i}`] = dirPt(c, 5.5);
    names.push(`R${i}`);
  });
  names.push("W");
  return rotate(
    {
      points,
      segments: [["W", "E"], ...names.slice(1, -1).map((n) => ["O", n] as [string, string])],
      angles: sizes.map((_, i) => ({ at: "O", from: names[i], to: names[i + 1], text: texts[i] })),
      dots: ["O"],
      description: `A straight line with ${sizes.length - 1 === 1 ? "a line" : `${sizes.length - 1} lines`} coming out of one point on it. The angles on the line are ${texts.map((t) => t ?? "unlabelled").join(", ")}.`,
    },
    rot,
  );
}

// ------------------------------------------------------------ angles around a point

/** Rays out of O. `sizes` add up to 360, going anticlockwise from direction `start`. */
export function pointDiagram(sizes: number[], texts: (string | undefined)[], start = 0): AngleSpec {
  const points: Record<string, P> = { O: [0, 0] };
  let c = start;
  sizes.forEach((s, i) => {
    points[`R${i}`] = dirPt(c, 5.5);
    c += s;
  });
  const n = sizes.length;
  return {
    points,
    segments: sizes.map((_, i) => ["O", `R${i}`] as [string, string]),
    angles: sizes.map((s, i) => ({ at: "O", from: `R${i}`, to: `R${(i + 1) % n}`, text: texts[i], reflex: s > 180 })),
    dots: ["O"],
    description: `${n} lines coming out of one point, making ${n} angles around it: ${texts.map((t) => t ?? "unlabelled").join(", ")}.`,
  };
}

// ------------------------------------------------------------ two crossing lines

/**
 * Two straight lines crossing at O. Position 0 is the angle `theta` between the
 * first line (pointing east) and the second; positions go anticlockwise:
 * 0 = theta, 1 = 180 − theta, 2 = theta (opposite 0), 3 = 180 − theta.
 */
export function crossingDiagram(theta: number, marks: { pos: 0 | 1 | 2 | 3; text?: string; highlight?: boolean }[], rot = 0): AngleSpec {
  const dirs = ["A", "B", "C", "D"];
  return rotate(
    {
      points: { O: [0, 0], A: [6, 0], B: dirPt(theta, 6), C: [-6, 0], D: dirPt(theta + 180, 6) },
      segments: [
        ["A", "C"],
        ["B", "D"],
      ],
      angles: marks.map((m) => ({ at: "O", from: dirs[m.pos], to: dirs[(m.pos + 1) % 4], text: m.text, highlight: m.highlight })),
      dots: ["O"],
      description: `Two straight lines crossing, making four angles. ${marks.map((m) => `${m.text ?? "An angle"} is ${["", "next to", "opposite", "next to"][(m.pos - marks[0].pos + 4) % 4] || "the first angle"}${m === marks[0] ? "" : " the first"}`).join(". ")}.`,
    },
    rot,
  );
}

export const crossingSize = (theta: number, pos: number) => (pos % 2 === 0 ? theta : 180 - theta);

// ------------------------------------------------------------ parallel lines

export type ParallelPos = { at: "P" | "Q"; pos: 0 | 1 | 2 | 3 };

/**
 * Two parallel lines (bottom through P, top through Q) cut by a transversal at
 * angle `theta`. At each crossing, positions go anticlockwise from east:
 * 0 = theta (right, above), 1 = 180 − theta (left, above), 2 = theta (left, below), 3 = 180 − theta (right, below).
 */
export function parallelDiagram(theta: number, marks: (ParallelPos & { text?: string; highlight?: boolean })[], rot = 0): AngleSpec {
  const H = 5;
  const run = H / Math.tan(rad(theta));
  const P: P = [-run / 2, 0];
  const Q: P = [run / 2, H];
  const ext = 3.2;
  const L = Math.max(7, Math.abs(run) / 2 + 4);
  const points: Record<string, P> = {
    P,
    Q,
    PE: [L, 0],
    PW: [-L, 0],
    QE: [L, H],
    QW: [-L, H],
    PD: dirPt(theta + 180, ext, P),
    QU: dirPt(theta, ext, Q),
  };
  const around = (c: "P" | "Q") => (c === "P" ? ["PE", "Q", "PW", "PD"] : ["QE", "QU", "QW", "P"]);
  return rotate(
    {
      points,
      segments: [
        ["PW", "PE"],
        ["QW", "QE"],
        ["PD", "QU"],
      ],
      angles: marks.map((m) => ({ at: m.at, from: around(m.at)[m.pos], to: around(m.at)[(m.pos + 1) % 4], text: m.text, highlight: m.highlight })),
      // Arrows sit to the right of the crossings, clear of the angle marks.
      arrows: [
        { a: "P", b: "PE", n: 1 },
        { a: "Q", b: "QE", n: 1 },
      ],
      description: `Two parallel lines (marked with arrows) crossed by a third line. ${marks.map((m) => `${m.text ?? "An angle"} is at the ${m.at === "Q" ? "top" : "bottom"} crossing, ${["above the line on the right", "above the line on the left", "below the line on the left", "below the line on the right"][m.pos]}`).join(". ")}.`,
    },
    rot,
  );
}

export const parallelSize = (theta: number, m: ParallelPos) => (m.pos % 2 === 0 ? theta : 180 - theta);

/** How two angles in a parallel-lines diagram are related. */
export type PairKind = "corresponding" | "alternate" | "co-interior" | "vertically opposite" | "on a straight line" | "other";
export function pairKind(a: ParallelPos, b: ParallelPos): PairKind {
  if (a.at === b.at) return a.pos === b.pos ? "other" : (a.pos + 2) % 4 === b.pos ? "vertically opposite" : "on a straight line";
  if (a.pos === b.pos) return "corresponding";
  // Inside the parallel lines: Q's 2 and 3 (below the top line), P's 0 and 1 (above the bottom line).
  const inside = (m: ParallelPos) => (m.at === "Q" ? m.pos >= 2 : m.pos <= 1);
  if (!inside(a) || !inside(b)) return "other";
  const [q, p] = a.at === "Q" ? [a, b] : [b, a];
  if ((q.pos === 2 && p.pos === 0) || (q.pos === 3 && p.pos === 1)) return "alternate";
  return "co-interior";
}

// ------------------------------------------------------------ polygons

/**
 * Corner points of a convex polygon with these interior angles (in order), going
 * anticlockwise. `lens` fixes all but the last two side lengths; those two are
 * solved so the shape closes. Returns null if they come out too short or long.
 */
export function polygonFromAngles(angles: number[], lens: number[], minLen = 2): P[] | null {
  const n = angles.length;
  if (lens.length !== n - 2) throw new Error("polygonFromAngles: need n − 2 lengths");
  const dirs: number[] = [0];
  for (let k = 1; k < n; k++) dirs.push(dirs[k - 1] + 180 - angles[k]);
  let sx = 0;
  let sy = 0;
  lens.forEach((l, k) => {
    sx += l * Math.cos(rad(dirs[k]));
    sy += l * Math.sin(rad(dirs[k]));
  });
  // Solve l1·u1 + l2·u2 = −(sx, sy) for the last two sides.
  const [a, b] = [dirs[n - 2], dirs[n - 1]].map(rad);
  const det = Math.cos(a) * Math.sin(b) - Math.sin(a) * Math.cos(b);
  if (Math.abs(det) < 1e-9) return null;
  const l1 = (-sx * Math.sin(b) + sy * Math.cos(b)) / det;
  const l2 = (-Math.cos(a) * sy + Math.sin(a) * sx) / det;
  const all = [...lens, l1, l2];
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  if (lo < minLen || hi / lo > 3.2) return null;
  const pts: P[] = [[0, 0]];
  for (let k = 0; k < n - 1; k++) pts.push(dirPt(dirs[k], all[k], pts[k]));
  return pts;
}

/** A polygon (corner names V0, V1, …) with angle marks at the given corners. */
export function polygonDiagram(
  pts: P[],
  marks: { i: number; text?: string; right?: boolean; highlight?: boolean }[],
  extra: Partial<AngleSpec> & { description: string },
  letters?: string[],
): AngleSpec {
  const n = pts.length;
  const names = letters ?? pts.map((_, i) => `V${i}`);
  const v = (i: number) => names[(i + n) % n];
  return {
    points: Object.fromEntries(pts.map((p, i) => [names[i], p])),
    segments: names.map((nm, i) => [nm, v(i + 1)] as [string, string]),
    polygon: names,
    angles: marks.map((m) => ({ at: v(m.i), from: v(m.i + 1), to: v(m.i - 1), text: m.text, right: m.right, highlight: m.highlight })),
    ...extra,
  };
}

/** A regular polygon centred on the origin. */
export function regularPoints(n: number, r = 4, start = -90 - 180 / n): P[] {
  return Array.from({ length: n }, (_, i) => dirPt(start + (360 * i) / n, r));
}

export const POLYGON_NAMES: Record<number, string> = {
  3: "Triangle",
  4: "Quadrilateral",
  5: "Pentagon",
  6: "Hexagon",
  7: "Heptagon",
  8: "Octagon",
  9: "Nonagon",
  10: "Decagon",
  12: "Dodecagon",
};
