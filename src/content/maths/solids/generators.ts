/**
 * Question generators for 3D shapes (faces, edges, vertices, names, nets) and
 * plans and elevations of solids made from cubes.
 *
 * Nets of a cube are checked by "rolling" a cube across the net: a net works
 * only if the six squares land on six different faces. Views of cube solids
 * are computed from the stack heights, so every picture matches the solid.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher.
 */

import { frac } from "@/engine/fraction";
import type { Rng } from "@/engine/random";
import type { CubeStackSpec, PlaneSpec, Question, SolidSpec, Visual } from "@/engine/types";

export type Tier = 1 | 2;
type Gen = (r: Rng, tier: Tier) => Omit<Question, "id" | "skillId">;
type Q = Omit<Question, "id" | "skillId">;
type P = [number, number];

const COUNT_HELP = "Type a whole number, like 6.";
const LETTERS = ["A", "B", "C", "D"];

function shuffle<T>(r: Rng, items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = r.int(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function until<T>(make: () => T | null): T {
  for (let k = 0; k < 3000; k++) {
    const v = make();
    if (v !== null) return v;
  }
  throw new Error("solids: couldn't build a question");
}

function countQ(prompt: string, visual: Visual | undefined, answer: number, wrong: { value: number; misconception: string }[], hints: string[], solution: string[]): Q {
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

// ================================================================ solids

type SolidInfo = { name: string; faces: number; edges: number; vertices: number; solid: SolidSpec; tier: 1 | 2; visible?: [number, number, number] };

const face = (points: P[], description: string) => ({ points, sides: [], description });
const regular = (n: number, rr: number): P[] => Array.from({ length: n }, (_, i) => [rr * Math.cos(((-90 - 180 / n + (360 * i) / n) * Math.PI) / 180), rr * Math.sin(((-90 - 180 / n + (360 * i) / n) * Math.PI) / 180)] as P);

export const SOLIDS: SolidInfo[] = [
  { name: "cube", faces: 6, edges: 12, vertices: 8, tier: 1, visible: [3, 9, 7], solid: { kind: "prism", face: face([[0, 0], [3, 0], [3, 3], [0, 3]], "a square"), length: 3, description: "A cube. Hidden edges are dashed." } },
  { name: "cuboid", faces: 6, edges: 12, vertices: 8, tier: 1, visible: [3, 9, 7], solid: { kind: "prism", face: face([[0, 0], [5, 0], [5, 2.5], [0, 2.5]], "a rectangle"), length: 3, description: "A cuboid. Hidden edges are dashed." } },
  { name: "triangular prism", faces: 5, edges: 9, vertices: 6, tier: 1, solid: { kind: "prism", face: face([[0, 0], [4, 0], [2, 3]], "a triangle"), length: 4.5, description: "A triangular prism: a triangle at each end, joined by rectangles. Hidden edges are dashed." } },
  { name: "square-based pyramid", faces: 5, edges: 8, vertices: 5, tier: 1, solid: { kind: "pyramid", base: "square", size: 4, h: 4, description: "A square-based pyramid: a square base with four triangles meeting at a point. Hidden edges are dashed." } },
  { name: "triangular-based pyramid", faces: 4, edges: 6, vertices: 4, tier: 2, solid: { kind: "pyramid", base: "triangle", size: 4.5, h: 4, description: "A triangular-based pyramid (tetrahedron): four triangular faces. Hidden edges are dashed." } },
  { name: "pentagonal prism", faces: 7, edges: 15, vertices: 10, tier: 2, solid: { kind: "prism", face: face(regular(5, 2.2), "a pentagon"), length: 3.5, description: "A pentagonal prism: a pentagon at each end, joined by rectangles. Hidden edges are dashed." } },
  { name: "hexagonal prism", faces: 8, edges: 18, vertices: 12, tier: 2, solid: { kind: "prism", face: face(regular(6, 2.2), "a hexagon"), length: 3.5, description: "A hexagonal prism: a hexagon at each end, joined by rectangles. Hidden edges are dashed." } },
];

const CURVED: { name: string; solid: SolidSpec }[] = [
  { name: "cylinder", solid: { kind: "cylinder", r: 2, h: 4, label: { on: "radius", text: "" }, hText: "", description: "A cylinder: two circles joined by a curved surface." } },
  { name: "cone", solid: { kind: "cone", r: 2.2, h: 4, description: "A cone: a circular base and a curved surface that comes to a point." } },
  { name: "sphere", solid: { kind: "sphere", r: 2, description: "A sphere: a perfectly round ball." } },
];

const ALL_NAMES = ["cube", "cuboid", "triangular prism", "square-based pyramid", "triangular-based pyramid", "pentagonal prism", "hexagonal prism", "cylinder", "cone", "sphere"];
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

function countFeatures(r: Rng, tier: Tier): Q {
  const s = r.pick(SOLIDS.filter((x) => x.tier <= tier));
  const what = r.pick(["faces", "edges", "vertices"] as const);
  const value = s[what];
  const idx = { faces: 0, edges: 1, vertices: 2 }[what];
  const wrong: { value: number; misconception: string }[] = [];
  if (s.visible) wrong.push({ value: s.visible[idx], misconception: "fev-visible-only" });
  for (const other of ["faces", "edges", "vertices"] as const) if (other !== what) wrong.push({ value: s[other], misconception: "fev-mixed" });
  const meaning = { faces: "flat surfaces", edges: "lines where two faces meet", vertices: "corners" }[what];
  return countQ(
    `How many ${what} does this ${s.name} have?`,
    { kind: "solid", solid: s.solid },
    value,
    wrong,
    [`${cap(what)} are the ${meaning}. Don't forget the hidden ones at the back (dashed lines).`, s.name.includes("prism") || s.name === "cube" || s.name === "cuboid" ? `Count the front end, the back end, and what joins them.` : `Count the base, then what goes up to the point.`],
    [
      `A ${s.name} has ${s.faces} faces, ${s.edges} edges and ${s.vertices} vertices.`,
      `So it has ${value} ${what}.`,
      `Check with Euler's rule: faces + vertices − edges = ${s.faces} + ${s.vertices} − ${s.edges} = 2.`,
    ],
  );
}

function nameSolid(r: Rng, tier: Tier): Q {
  const pool = [...SOLIDS.filter((x) => x.tier <= tier).map((x) => ({ name: x.name, solid: x.solid })), ...CURVED];
  const s = r.pick(pool);
  const others = shuffle(
    r,
    ALL_NAMES.filter((n) => n !== s.name && (tier === 2 || !n.includes("gonal"))),
  ).slice(0, 3);
  const options = shuffle(r, [s.name, ...others]).map(cap);
  return choiceQ(
    `What is the name of this 3D shape?`,
    { kind: "solid", solid: s.solid },
    options,
    cap(s.name),
    () => "solid-names",
    [`Does it have the same shape all the way through (a prism), or does it come to a point (a pyramid or cone)?`, `Look at the end or the base: what 2D shape is it?`],
    [s.name.includes("prism") ? `It has the same shape all the way through, with matching ends: a prism.` : s.name.includes("pyramid") ? `It comes to a point from a flat base: a pyramid.` : `Look at its faces and curved surfaces.`, `It's a ${s.name}.`],
  );
}

// ---------------------------------------------------------------- cube nets

type Cell = [number, number];

/** True if the six squares fold into a cube (rolling a die across the net). */
export function isCubeNet(cells: Cell[]): boolean {
  if (cells.length !== 6) return false;
  const key = (c: Cell) => `${c[0]},${c[1]}`;
  const set = new Set(cells.map(key));
  // Faces: 0 bottom, 1 top, 2 north, 3 south, 4 east, 5 west. State: which face is at each of those positions.
  type Die = [number, number, number, number, number, number];
  const roll = (d: Die, dx: number, dy: number): Die => {
    const [b, t, n, s, e, w] = d;
    if (dx === 1) return [e, w, n, s, t, b];
    if (dx === -1) return [w, e, n, s, b, t];
    if (dy === 1) return [n, s, t, b, e, w];
    return [s, n, b, t, e, w];
  };
  const seen = new Map<string, Die>([[key(cells[0]), [0, 1, 2, 3, 4, 5]]]);
  const queue: Cell[] = [cells[0]];
  while (queue.length) {
    const c = queue.shift()!;
    const d = seen.get(key(c))!;
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nb: Cell = [c[0] + dx, c[1] + dy];
      if (!set.has(key(nb)) || seen.has(key(nb))) continue;
      seen.set(key(nb), roll(d, dx, dy));
      queue.push(nb);
    }
  }
  if (seen.size !== 6) return false;
  return new Set([...seen.values()].map((d) => d[0])).size === 6;
}

const normalise = (cells: Cell[]): Cell[] => {
  const mx = Math.min(...cells.map((c) => c[0]));
  const my = Math.min(...cells.map((c) => c[1]));
  return cells.map(([x, y]) => [x - mx, y - my] as Cell).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
};
const cellsKey = (cells: Cell[]) => normalise(cells).map((c) => c.join(",")).join(" ");

function randomHexomino(r: Rng): Cell[] {
  return until(() => {
    const cells: Cell[] = [[0, 0]];
    const has = (c: Cell) => cells.some((d) => d[0] === c[0] && d[1] === c[1]);
    while (cells.length < 6) {
      const base = r.pick(cells);
      const [dx, dy] = r.pick([
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ] as const);
      const nb: Cell = [base[0] + dx, base[1] + dy];
      if (!has(nb)) cells.push(nb);
    }
    const n = normalise(cells);
    const w = Math.max(...n.map((c) => c[0])) + 1;
    const h = Math.max(...n.map((c) => c[1])) + 1;
    return w <= 4 && h <= 4 ? n : null;
  });
}

function netPicture(cells: Cell[], label: string): { label: string; visual: Visual } {
  const plane: PlaneSpec = {
    x: [-0.4, 4.4],
    y: [-0.4, 4.4],
    shapes: cells.map(([x, y]) => ({
      points: [
        [x, y],
        [x + 1, y],
        [x + 1, y + 1],
        [x, y + 1],
      ] as P[],
      tone: "object" as const,
    })),
    description: `Net ${label}: six squares joined edge to edge.`,
  };
  return { label, visual: { kind: "plane", plane } };
}

function cubeNet(r: Rng, tier: Tier): Q {
  const notVersion = tier === 2 && r.next() < 0.5;
  const nets = until(() => {
    const good: Cell[][] = [];
    const bad: Cell[][] = [];
    const keys = new Set<string>();
    for (let k = 0; k < 200 && (good.length < 3 || bad.length < 3); k++) {
      const h = randomHexomino(r);
      const key = cellsKey(h);
      if (keys.has(key)) continue;
      keys.add(key);
      (isCubeNet(h) ? good : bad).push(h);
    }
    return good.length >= 3 && bad.length >= 3 ? { good, bad } : null;
  });
  const pick = notVersion ? [nets.bad[0], nets.good[0], nets.good[1], nets.good[2]] : [nets.good[0], nets.bad[0], nets.bad[1], nets.bad[2]];
  const order = shuffle(r, [0, 1, 2, 3]);
  const panels = order.map((i, k) => netPicture(pick[i], LETTERS[k]));
  const correct = LETTERS[order.indexOf(0)];
  return choiceQ(
    notVersion ? `Three of these nets fold up to make a cube. Which one does NOT?` : `Which of these nets folds up to make a cube?`,
    { kind: "panels", panels, description: "Four nets made of six squares, labelled A to D." },
    LETTERS,
    correct,
    () => "net-not-cube",
    [`Pick one square as the bottom. Fold the others up in your head: each must cover a different side.`, `Warning signs: four squares around one corner, or five or more in a row.`],
    [notVersion ? `In net ${correct}, two squares fold onto the same side of the cube, leaving one side open.` : `Net ${correct} folds up with each square on a different side of the cube.`, notVersion ? `The other three nets each cover all six sides once.` : `In each of the other nets, two squares end up on the same side.`],
  );
}

// ---------------------------------------------------------------- nets of other solids

const SQ3 = Math.sqrt(3);
const NETS: { name: string; shapes: P[][]; text: string }[] = [
  {
    name: "triangular prism",
    text: "three rectangles in a row, with a triangle on each side of the middle one",
    shapes: [
      [[0, 0], [2, 0], [2, 3], [0, 3]],
      [[2, 0], [4, 0], [4, 3], [2, 3]],
      [[4, 0], [6, 0], [6, 3], [4, 3]],
      [[2, 3], [4, 3], [3, 3 + SQ3]],
      [[2, 0], [3, -SQ3], [4, 0]],
    ],
  },
  {
    name: "square-based pyramid",
    text: "a square with a triangle on each of its four sides",
    shapes: [
      [[0, 0], [2, 0], [2, 2], [0, 2]],
      [[0, 0], [1, -1.9], [2, 0]],
      [[2, 0], [3.9, 1], [2, 2]],
      [[2, 2], [1, 3.9], [0, 2]],
      [[0, 2], [-1.9, 1], [0, 0]],
    ],
  },
  {
    name: "triangular-based pyramid",
    text: "four triangles: one in the middle, with one on each of its sides",
    shapes: [
      [[0, 0], [2, 0], [1, SQ3]],
      [[2, 0], [4, 0], [3, SQ3]],
      [[1, SQ3], [3, SQ3], [2, 2 * SQ3]],
      [[2, 0], [3, SQ3], [1, SQ3]],
    ],
  },
  {
    name: "cuboid",
    text: "six rectangles in a cross shape, in three matching pairs",
    shapes: [
      [[0, 0], [1, 0], [1, 3], [0, 3]],
      [[1, 0], [3, 0], [3, 3], [1, 3]],
      [[3, 0], [4, 0], [4, 3], [3, 3]],
      [[4, 0], [6, 0], [6, 3], [4, 3]],
      [[1, 3], [3, 3], [3, 4], [1, 4]],
      [[1, -1], [3, -1], [3, 0], [1, 0]],
    ],
  },
  {
    name: "cube",
    text: "six equal squares in a cross shape",
    shapes: [
      [0, 1],
      [1, 1],
      [2, 1],
      [3, 1],
      [1, 2],
      [1, 0],
    ].map(([x, y]) => [
      [x * 1.5, y * 1.5],
      [x * 1.5 + 1.5, y * 1.5],
      [x * 1.5 + 1.5, y * 1.5 + 1.5],
      [x * 1.5, y * 1.5 + 1.5],
    ] as P[]),
  },
];

function netOfSolid(r: Rng, tier: Tier): Q {
  const net = r.pick(tier === 1 ? NETS.filter((n) => n.name !== "triangular-based pyramid") : NETS);
  const pts = net.shapes.flat();
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const plane: PlaneSpec = {
    x: [Math.min(...xs) - 0.4, Math.max(...xs) + 0.4],
    y: [Math.min(...ys) - 0.4, Math.max(...ys) + 0.4],
    shapes: net.shapes.map((s) => ({ points: s, tone: "object" as const })),
    description: `A net made of ${net.text}.`,
  };
  const options = shuffle(r, [net.name, ...shuffle(r, ["cube", "cuboid", "triangular prism", "square-based pyramid", "triangular-based pyramid"].filter((n) => n !== net.name)).slice(0, 3)]).map(cap);
  return choiceQ(
    `This net is folded up. Which 3D shape does it make?`,
    { kind: "plane", plane },
    options,
    cap(net.name),
    () => "net-solid-match",
    [`Count the faces in the net, and look at their shapes.`, `Triangles that meet at a point make a pyramid. Two matching ends joined by rectangles make a prism.`],
    [`The net has ${net.shapes.length} faces: ${net.text}.`, `Folded up, that makes a ${net.name}.`],
  );
}

const shapes3d: Gen = (r, tier) => {
  const roll = r.next();
  if (roll < 0.4) return countFeatures(r, tier);
  if (roll < 0.6) return nameSolid(r, tier);
  if (roll < 0.82) return cubeNet(r, tier);
  return netOfSolid(r, tier);
};

// ================================================================ plans and elevations

type Grid = number[][]; // heights[row][col], row 0 = front

/** Squares of each view, as [x, y] cells. Front: x = column, y = level. Side (from the right): x = row (front on the left). Plan: x = column, y = row (front at the bottom). */
export function views(h: Grid) {
  const rows = h.length;
  const cols = h[0].length;
  const front: Cell[] = [];
  for (let c = 0; c < cols; c++) {
    const top = Math.max(...h.map((row) => row[c]));
    for (let z = 0; z < top; z++) front.push([c, z]);
  }
  const side: Cell[] = [];
  for (let r = 0; r < rows; r++) {
    const top = Math.max(...h[r]);
    for (let z = 0; z < top; z++) side.push([r, z]);
  }
  const plan: Cell[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (h[r][c] > 0) plan.push([c, r]);
  return { front, side, plan };
}

const mirror = (cells: Cell[]): Cell[] => {
  const mx = Math.max(...cells.map((c) => c[0]));
  return cells.map(([x, y]) => [mx - x, y] as Cell);
};

function randomStack(r: Rng, tier: Tier): Grid {
  return until(() => {
    const rows = tier === 1 ? 2 : r.int(2, 3);
    const cols = tier === 1 ? r.int(2, 3) : r.int(3, 4);
    const h = Array.from({ length: rows }, () => Array.from({ length: cols }, () => r.int(0, 3)));
    // Every row and column has a cube; no stack hides another completely in a way that confuses counting.
    if (h.some((row) => row.every((v) => v === 0))) return null;
    for (let c = 0; c < cols; c++) if (h.every((row) => row[c] === 0)) return null;
    // The stack must stand up: the solid is one connected piece.
    const cells: Cell[] = [];
    h.forEach((row, ri) => row.forEach((v, ci) => v > 0 && cells.push([ci, ri])));
    const set = new Set(cells.map((c) => c.join(",")));
    const seen = new Set([cells[0].join(",")]);
    const q = [cells[0]];
    while (q.length) {
      const [x, y] = q.shift()!;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const k = `${x + dx},${y + dy}`;
        if (set.has(k) && !seen.has(k)) {
          seen.add(k);
          q.push([x + dx, y + dy]);
        }
      }
    }
    if (seen.size !== cells.length) return null;
    // Nothing hidden: a stack is never taller than every stack in front of it... we only need each front-row stack visible.
    const total = h.flat().reduce((a, b) => a + b, 0);
    return total >= 4 && total <= (tier === 1 ? 9 : 14) ? h : null;
  });
}

function viewPanel(cells: Cell[], label: string, w: number, ht: number): { label: string; visual: Visual } {
  return {
    label,
    visual: {
      kind: "plane",
      plane: {
        x: [-0.5, w + 0.5],
        y: [-0.5, ht + 0.5],
        shapes: cells.map(([x, y]) => ({
          points: [
            [x, y],
            [x + 1, y],
            [x + 1, y + 1],
            [x, y + 1],
          ] as P[],
          tone: "object" as const,
        })),
        description: `Drawing ${label}: ${cells.length} squares.`,
      },
    },
  };
}

const stackWords = (h: Grid) =>
  h
    .map((row, ri) => `${ri === 0 ? "Front row" : ri === 1 ? "second row" : "back row"}, left to right: ${row.join(", ")}`)
    .join("; ");

function whichView(r: Rng, tier: Tier): Q {
  return until(() => {
    const h = randomStack(r, tier);
    const v = views(h);
    const ask = tier === 1 ? r.pick(["front", "plan"] as const) : r.pick(["front", "side", "plan"] as const);
    const correct = v[ask];
    const cands: { cells: Cell[]; mc: string }[] = [{ cells: correct, mc: "" }];
    if (ask !== "front") cands.push({ cells: v.front, mc: ask === "side" ? "elev-front-side" : "elev-not-plan" });
    if (ask !== "side") cands.push({ cells: v.side, mc: ask === "front" ? "elev-front-side" : "elev-not-plan" });
    if (ask !== "plan") cands.push({ cells: v.plan, mc: "elev-plan" });
    cands.push({ cells: mirror(correct), mc: "elev-mirrored" });
    const keys = cands.map((c) => cellsKey(c.cells));
    // Distractors must differ from the answer and from each other (as drawn, not just as shapes).
    const exact = (c: Cell[]) => [...c].map((p) => p.join(",")).sort().join(" ");
    const ex = cands.map((c) => exact(c.cells));
    const uniq = cands.filter((_, i) => ex.indexOf(ex[i]) === i && keys.indexOf(keys[i]) === i);
    if (uniq.length < 4 || uniq[0] !== cands[0]) return null;
    const four = uniq.slice(0, 4);
    const w = Math.max(...four.flatMap((c) => c.cells.map((p) => p[0]))) + 1;
    const ht = Math.max(...four.flatMap((c) => c.cells.map((p) => p[1]))) + 1;
    const order = shuffle(r, [0, 1, 2, 3]);
    const panels = order.map((i, k) => viewPanel(four[i].cells, LETTERS[k], w, ht));
    const solid: CubeStackSpec = { heights: h, showFront: true, showSide: ask === "side", description: `A solid made of cubes. Stack heights: ${stackWords(h)}.` };
    const name = ask === "front" ? "front elevation" : ask === "side" ? "side elevation (from the side arrow)" : "plan (the view from above)";
    const ans = LETTERS[order.indexOf(0)];
    return choiceQ(
      `Here is a solid made of cubes. Which drawing is its ${name}?`,
      { kind: "panels", panels: [{ label: "The solid", visual: { kind: "cubes", cubes: solid } }, ...panels], description: `The solid, then four drawings A to D.` },
      LETTERS,
      ans,
      (o) => four[order[LETTERS.indexOf(o)]].mc,
      [
        ask === "plan" ? `Imagine looking straight down from above. Each stack shows as one square.` : `Imagine standing at the arrow and looking straight at the solid. Each column shows the tallest stack in that line.`,
        `Check left and right: what's on your left must be on the left of the drawing.`,
      ],
      [
        ask === "front" ? `From the front, the columns are ${v.front.length ? h[0].map((_, c) => Math.max(...h.map((row) => row[c]))).join(", ") : ""} cubes tall (the tallest stack in each column).` : ask === "side" ? `From the side, with the front row on the left, the heights are ${h.map((row) => Math.max(...row)).join(", ")}.` : `From above you see one square for every stack: ${v.plan.length} squares.`,
        `That's drawing ${ans}.`,
      ],
    );
  });
}

function countCubes(r: Rng, tier: Tier): Q {
  const h = randomStack(r, tier);
  const total = h.flat().reduce((a, b) => a + b, 0);
  const tops = views(h).plan.length;
  return countQ(
    `How many cubes make this solid? Every stack goes all the way down to the ground.`,
    { kind: "cubes", cubes: { heights: h, showFront: true, description: `A solid made of cubes. Stack heights: ${stackWords(h)}.` } },
    total,
    [
      { value: tops, misconception: "cubes-top-only" },
      { value: h[0].reduce((a, b) => a + b, 0), misconception: "cubes-front-only" },
    ],
    [`Find the height of each stack.`, `Add up the stacks, row by row: ${h.map((row) => row.filter((v) => v > 0).join(" + ")).join(", then ")}.`],
    [...h.map((row, i) => `${i === 0 ? "Front row" : i === h.length - 1 ? "Back row" : "Middle row"}: ${row.filter((v) => v > 0).join(" + ")} = ${row.reduce((a, b) => a + b, 0)}`), `Total: ${total} cubes.`],
  );
}

function planSquares(r: Rng, tier: Tier): Q {
  const h = randomStack(r, tier);
  const v = views(h);
  const total = h.flat().reduce((a, b) => a + b, 0);
  const which = r.pick(tier === 1 ? (["plan", "front"] as const) : (["plan", "front", "side"] as const));
  const ans = v[which].length;
  return countQ(
    `How many squares are in the ${which === "plan" ? "plan (the view from above)" : which === "front" ? "front elevation" : "side elevation (from the side arrow)"} of this solid?`,
    { kind: "cubes", cubes: { heights: h, showFront: true, showSide: which === "side", description: `A solid made of cubes. Stack heights: ${stackWords(h)}.` } },
    ans,
    [
      { value: total, misconception: "plan-counted-cubes" },
      ...(which === "plan" ? [{ value: v.front.length, misconception: "elev-plan" }] : [{ value: v.plan.length, misconception: "elev-plan" }]),
      ...(which === "front" ? [{ value: v.side.length, misconception: "elev-front-side" }] : which === "side" ? [{ value: v.front.length, misconception: "elev-front-side" }] : []),
    ],
    [which === "plan" ? `From above, each stack is one square, however tall it is.` : `From the arrow, each column shows the tallest stack in that line.`, `Hidden cubes behind don't add extra squares.`],
    [which === "plan" ? `There are ${ans} stacks, so the plan has ${ans} squares.` : which === "front" ? `Column heights from the front: ${h[0].map((_, c) => Math.max(...h.map((row) => row[c]))).join(" + ")} = ${ans}.` : `Row heights from the side: ${h.map((row) => Math.max(...row)).join(" + ")} = ${ans}.`, `So the ${which === "plan" ? "plan" : `${which} elevation`} has ${ans} squares.`],
  );
}

const VIEW_FACTS: { solid: string; picture: SolidSpec; plan: string; front: string }[] = [
  { solid: "cylinder standing on its end", picture: CURVED[0].solid, plan: "Circle", front: "Rectangle" },
  { solid: "cone standing on its base", picture: CURVED[1].solid, plan: "Circle", front: "Triangle" },
  { solid: "square-based pyramid", picture: SOLIDS[3].solid, plan: "Square", front: "Triangle" },
  { solid: "cube", picture: SOLIDS[0].solid, plan: "Square", front: "Square" },
  { solid: "sphere", picture: CURVED[2].solid, plan: "Circle", front: "Circle" },
];

function solidViews(r: Rng): Q {
  const f = r.pick(VIEW_FACTS);
  const which = r.pick(["plan", "front"] as const);
  const options = ["Circle", "Square", "Rectangle", "Triangle"];
  return choiceQ(
    `What shape is the ${which === "plan" ? "plan (the view from directly above)" : "front elevation"} of a ${f.solid}?`,
    { kind: "solid", solid: f.picture },
    options,
    f[which],
    () => "views-mixed",
    [which === "plan" ? `Imagine floating above it and looking straight down.` : `Imagine crouching down and looking straight at the front.`, `Only the outline counts: you can't see depth in a plan or elevation.`],
    [`Looking ${which === "plan" ? "straight down on" : "straight at the front of"} a ${f.solid}, the outline is a ${f[which].toLowerCase()}.`],
  );
}

const plansElevations: Gen = (r, tier) => {
  const roll = r.next();
  if (roll < 0.45) return whichView(r, tier);
  if (roll < 0.65) return planSquares(r, tier);
  if (roll < 0.82) return countCubes(r, tier);
  return solidViews(r);
};

export const SOLID_GENERATORS: Record<string, Gen> = {
  "geo-3d-shapes": shapes3d,
  "geo-plans-elevations": plansElevations,
};
