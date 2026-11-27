/**
 * Question generators for coordinates, straight-line graphs, real-life graphs,
 * gradient and intercept, and y = mx + c.
 *
 * Every graph is drawn to scale from the same numbers the answer uses, and any
 * value a student reads off a graph sits exactly on a gridline.
 * Tier 1 is guided practice; tier 2 is independent practice and the skill check.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher.
 */

import { frac, simplify } from "@/engine/fraction";
import type { Rng } from "@/engine/random";
import type { GraphSpec, TableSpec } from "@/engine/types";
import {
  br,
  choiceQ,
  grid,
  HELP_EQ,
  HELP_PICK,
  intQ,
  lineEq,
  linePoints,
  lineRhs,
  lineRhsConstFirst,
  nonZero,
  num,
  pointQ,
  showPoint,
  shuffle,
  wrongs,
  type Gen,
  type Q,
} from "./plot";

const LETTERS = ["A", "B", "C", "D"];

/** A point that isn't on an axis. */
function offAxis(r: Rng, lim = 6): [number, number] {
  return [nonZero(r, -lim, lim), nonZero(r, -lim, lim)];
}

const quadrantWords = ([x, y]: [number, number]) =>
  `${x === 0 ? "on the y-axis" : x > 0 ? `${x} right` : `${-x} left`}${y === 0 ? (x === 0 ? "" : ", on the x-axis") : y > 0 ? `, ${y} up` : `, ${-y} down`}`;

function describePoints(pts: { at: [number, number]; label?: string }[]): string {
  return pts.map((p) => `${p.label ?? "A point"} at ${showPoint(p.at)}`).join("; ");
}

// ================================================================ coordinates

const readPoint = (r: Rng, tier: 1 | 2): Q => {
  const p: [number, number] = tier === 1 || r.next() < 0.8 ? offAxis(r) : r.next() < 0.5 ? [0, nonZero(r, -6, 6)] : [nonZero(r, -6, 6), 0];
  const name = r.pick(["A", "B", "P", "Q", "R"]);
  const graph: GraphSpec = { ...grid(-6, 6, -6, 6), points: [{ at: p, label: name }], description: `A coordinate grid from −6 to 6 on both axes, with point ${name} marked.` };
  const [x, y] = p;
  return pointQ(p, {
    prompt: `Write down the coordinates of point ${name}.`,
    visual: { kind: "graph", graph },
    wrong: [
      { value: [y, x], misconception: "coord-swapped" },
      { value: [-x, y], misconception: "coord-sign" },
      { value: [x, -y], misconception: "coord-sign" },
      { value: [-x, -y], misconception: "coord-sign" },
    ],
    hints: ["Start at the origin, where the axes cross.", `First count left or right to get x, then up or down to get y. Left and down are negative.`],
    solution: [
      `From the origin, ${name} is ${quadrantWords(p)}.`,
      `x = ${num(x)} (left or right) and y = ${num(y)} (up or down).`,
      `${name} is at ${showPoint(p)}.`,
    ],
  });
};

const whichLetter = (r: Rng): Q => {
  const [x, y] = offAxis(r, 5);
  let pts: [number, number][] = [
    [x, y],
    [y, x],
    [-x, y],
    [x, -y],
    [-x, -y],
  ];
  // Keep distinct points; swapped can equal the original when x = y.
  pts = pts.filter((p, i) => pts.findIndex((q) => q[0] === p[0] && q[1] === p[1]) === i).slice(0, 4);
  const labelled = shuffle(r, pts).map((p, i) => ({ at: p, label: LETTERS[i] }));
  const right = labelled.find((l) => l.at[0] === x && l.at[1] === y)!.label!;
  const swapped = labelled.find((l) => l.at[0] === y && l.at[1] === x && !(x === y))?.label;
  const options = [right, ...LETTERS.slice(0, labelled.length).filter((l) => l !== right)];
  return choiceQ(r, options, {
    prompt: `Which point is at ${showPoint([x, y])}?`,
    visual: { kind: "graph", graph: { ...grid(-6, 6, -6, 6), points: labelled, description: `A coordinate grid with points ${describePoints(labelled)}.` } },
    mc: Object.fromEntries(options.filter((o) => o !== right).map((o) => [o, o === swapped ? "coord-swapped" : "coord-sign"])),
    keepOrder: true,
    hints: ["The first number is x: go left or right. The second is y: go up or down.", `${num(x)} means ${x > 0 ? "right" : "left"} ${Math.abs(x)}; ${num(y)} means ${y > 0 ? "up" : "down"} ${Math.abs(y)}.`],
    solution: [`Start at the origin. Go ${x > 0 ? "right" : "left"} ${Math.abs(x)}, then ${y > 0 ? "up" : "down"} ${Math.abs(y)}.`, `That is point ${right}.`],
  });
};

const plotPoint = (r: Rng): Q => {
  const p: [number, number] = r.next() < 0.85 ? offAxis(r) : [0, nonZero(r, -6, 6)];
  const [x, y] = p;
  return pointQ(p, {
    prompt: `Plot the point ${showPoint(p)} on the grid.`,
    visual: { kind: "graph", graph: { ...grid(-6, 6, -6, 6), pick: true, description: "An empty coordinate grid from −6 to 6 on both axes." } },
    wrong: [
      { value: [y, x], misconception: "coord-swapped" },
      { value: [-x, y], misconception: "coord-sign" },
      { value: [x, -y], misconception: "coord-sign" },
    ],
    answerHelp: HELP_PICK,
    hints: ["Start at the origin (0, 0).", `Go ${x === 0 ? "nowhere along (x is 0)" : `${x > 0 ? "right" : "left"} ${Math.abs(x)}`} first, then ${y > 0 ? "up" : "down"} ${Math.abs(y)}.`],
    solution: [`x = ${num(x)}: ${x === 0 ? "stay on the y-axis" : `go ${x > 0 ? "right" : "left"} ${Math.abs(x)}`}.`, `y = ${num(y)}: go ${y > 0 ? "up" : "down"} ${Math.abs(y)}.`, `The point is ${showPoint(p)}.`],
  });
};

const midpoint = (r: Rng): Q => {
  const x1 = r.int(-6, 5);
  const y1 = r.int(-6, 5);
  let x2 = x1 + 2 * r.int(1, 5) * (r.next() < 0.5 ? 1 : -1);
  let y2 = y1 + 2 * r.int(0, 5) * (r.next() < 0.5 ? 1 : -1);
  if (Math.abs(x2) > 8) x2 = x1 - (x2 - x1);
  if (Math.abs(y2) > 8) y2 = y1 - (y2 - y1);
  const m: [number, number] = [(x1 + x2) / 2, (y1 + y2) / 2];
  const A: [number, number] = [x1, y1];
  const B: [number, number] = [x2, y2];
  return pointQ(m, {
    prompt: `A is ${showPoint(A)} and B is ${showPoint(B)}. Find the midpoint of AB.`,
    wrong: [
      { value: [(x2 - x1) / 2, (y2 - y1) / 2], misconception: "coord-midpoint-difference" },
      { value: [(x1 - x2) / 2, (y1 - y2) / 2], misconception: "coord-midpoint-difference" },
      { value: [m[1], m[0]], misconception: "coord-swapped" },
    ],
    hints: ["The midpoint is halfway between A and B.", "Add the x-coordinates and halve. Then add the y-coordinates and halve."],
    solution: [`x: (${num(x1)} + ${br(x2)}) ÷ 2 = ${num(x1 + x2)} ÷ 2 = ${num(m[0])}`, `y: (${num(y1)} + ${br(y2)}) ÷ 2 = ${num(y1 + y2)} ÷ 2 = ${num(m[1])}`, `The midpoint is ${showPoint(m)}.`],
  });
};

const rectangleCorner = (r: Rng): Q => {
  const x1 = r.int(-6, 1);
  const x2 = r.int(x1 + 2, 6);
  const y1 = r.int(-6, 1);
  const y2 = r.int(y1 + 2, 6);
  const corners: [number, number][] = [
    [x1, y1],
    [x2, y1],
    [x2, y2],
    [x1, y2],
  ];
  const miss = r.int(0, 3);
  const names = ["A", "B", "C", "D"];
  const shown = corners.map((c, i) => ({ c, n: names[i] })).filter((_, i) => i !== miss);
  const ans = corners[miss];
  const opp = corners[(miss + 2) % 4];
  const sameX = shownOf(corners, names, miss, (c) => c[0] === corners[miss][0]);
  const sameY = shownOf(corners, names, miss, (c) => c[1] === corners[miss][1]);
  const graph: GraphSpec = {
    ...grid(-7, 7, -7, 7),
    points: shown.map((s) => ({ at: s.c, label: s.n })),
    curves: [{ points: [corners[(miss + 1) % 4], corners[(miss + 2) % 4], corners[(miss + 3) % 4]], dashed: true }],
    description: `A grid with three corners of a rectangle: ${shown.map((s) => `${s.n} ${showPoint(s.c)}`).join(", ")}.`,
  };
  return pointQ(ans, {
    prompt: `${shown.map((s) => s.n).join(", ")} are three corners of rectangle ABCD. Find the coordinates of ${names[miss]}.`,
    visual: { kind: "graph", graph },
    wrong: [
      { value: [ans[1], ans[0]], misconception: "coord-swapped" },
      { value: [opp[0], ans[1]], misconception: "coord-rectangle-wrong-corner" },
      { value: [ans[0], opp[1]], misconception: "coord-rectangle-wrong-corner" },
    ],
    hints: ["The sides of a rectangle are horizontal and vertical here.", `${names[miss]} is level with one corner and directly above or below another.`],
    solution: [
      `${sameX.n} is directly above or below ${names[miss]}, so ${names[miss]} has x = ${num(ans[0])}.`,
      `${sameY.n} is level with ${names[miss]}, so ${names[miss]} has y = ${num(ans[1])}.`,
      `${names[miss]} is ${showPoint(ans)}.`,
    ],
  });
};

function shownOf(corners: [number, number][], names: string[], miss: number, test: (c: [number, number]) => boolean) {
  const i = [1, 3].map((k) => (miss + k) % 4).find((j) => test(corners[j]))!;
  return { c: corners[i], n: names[i] };
}

const coordinates: Gen = (r, tier) => {
  if (tier === 1) return r.pick<(r: Rng, t: 1 | 2) => Q>([readPoint, whichLetter, plotPoint, readPoint])(r, 1);
  return r.pick<(r: Rng, t: 1 | 2) => Q>([(r: Rng) => readPoint(r, 2), midpoint, rectangleCorner, midpoint, whichLetter])(r, 2);
};

// ================================================================ plotting straight lines

/** A gradient and intercept with small whole numbers. */
function mc(r: Rng, tier: 1 | 2): [number, number] {
  const m = tier === 1 ? r.pick([2, 3, 4, 2, -2]) : r.pick([2, 3, -1, -2, -3, 4]);
  const c = nonZero(r, -5, 5);
  return [m, c];
}

const tableValue = (r: Rng, tier: 1 | 2): Q => {
  const [m, c] = mc(r, tier);
  const xs = [-2, -1, 0, 1, 2, 3];
  const ask = tier === 1 ? r.pick([-2, -1, 2, 3, -2]) : r.pick([-2, -1, -2, 3]);
  const y = m * ask + c;
  // Show two other y-values filled in as a model.
  const filled = new Set([0, 1].map((k) => xs[(xs.indexOf(ask) + 2 + k * 2) % xs.length]));
  const table: TableSpec = {
    corner: "x",
    columns: xs.map(num),
    rows: [{ head: "y", cells: xs.map((x) => (x === ask ? "?" : filled.has(x) ? num(m * x + c) : "")) }],
    highlight: [[0, xs.indexOf(ask)]],
    description: `Table of values for ${lineEq(m, c)}. x from −2 to 3. ${[...filled].map((x) => `When x is ${num(x)}, y is ${num(m * x + c)}.`).join(" ")} The value to find is when x is ${num(ask)}.`,
  };
  return intQ(y, {
    prompt: `Complete the table for ${lineEq(m, c)}. What is y when x = ${num(ask)}?`,
    visual: { kind: "table", table },
    wrong: [
      { value: Math.abs(m * ask) + c, misconception: "line-negative-times" },
      { value: -Math.abs(m * ask) + c, misconception: "line-negative-times" },
      { value: m * ask, misconception: "line-forgot-c" },
    ],
    hints: [`Put x = ${num(ask)} into ${lineEq(m, c)}.`, `Work out ${m === 1 ? "" : m === -1 ? "−1 × " : `${num(m)} × `}${br(ask)} first, then ${c >= 0 ? `add ${c}` : `subtract ${-c}`}.`],
    solution: [`y = ${m === 1 ? br(ask) : `${num(m)} × ${br(ask)}`}${c === 0 ? "" : c > 0 ? ` + ${c}` : ` − ${-c}`}`, `= ${num(m * ask)}${c === 0 ? "" : c > 0 ? ` + ${c}` : ` − ${-c}`}`, `y = ${num(y)}`],
  });
};

const plotOnLine = (r: Rng, tier: 1 | 2): Q => {
  let m: number;
  let c: number;
  let x: number;
  do {
    [m, c] = mc(r, tier);
    x = nonZero(r, -3, 3);
  } while (Math.abs(m * x + c) > 7);
  const y = m * x + c;
  return pointQ([x, y], {
    prompt: `The point on the line ${lineEq(m, c)} with x = ${num(x)} is missing from the graph. Work out its y-value and plot it.`,
    visual: { kind: "graph", graph: { ...grid(-5, 5, -8, 8), pick: true, description: `An empty grid, x from −5 to 5 and y from −8 to 8.` } },
    wrong: [
      { value: [y, x], misconception: "coord-swapped" },
      { value: [x, Math.abs(m * x) + c], misconception: "line-negative-times" },
      { value: [x, m * x], misconception: "line-forgot-c" },
    ],
    answerHelp: HELP_PICK,
    hints: [`Work out y first: put x = ${num(x)} into the equation.`, `Then plot (${num(x)}, y): along ${num(x)}, then up or down to y.`],
    solution: [`y = ${m === 1 ? br(x) : `${num(m)} × ${br(x)}`}${c === 0 ? "" : c > 0 ? ` + ${c}` : ` − ${-c}`} = ${num(y)}`, `So plot the point ${showPoint([x, y])}.`],
  });
};

const onLineCheck = (r: Rng): Q => {
  const [m, c] = mc(r, 2);
  const x = nonZero(r, -4, 5);
  const onIt = r.next() < 0.5;
  const yTrue = m * x + c;
  const y = onIt ? yTrue : yTrue + r.pick([-2, -1, 1, 2]);
  return choiceQ(r, onIt ? ["Yes", "No"] : ["No", "Yes"], {
    prompt: `Does the point ${showPoint([x, y])} lie on the line ${lineEq(m, c)}?`,
    mc: { [onIt ? "No" : "Yes"]: "line-point-not-checked" },
    keepOrder: false,
    hints: [`Put x = ${num(x)} into the equation.`, `If you get y = ${num(y)}, the point is on the line.`],
    solution: [`When x = ${num(x)}, y = ${m === 1 ? br(x) : `${num(m)} × ${br(x)}`}${c === 0 ? "" : c > 0 ? ` + ${c}` : ` − ${-c}`} = ${num(yTrue)}.`, onIt ? `That matches y = ${num(y)}, so yes, it is on the line.` : `The point has y = ${num(y)}, not ${num(yTrue)}, so no, it isn't on the line.`, `Answer: ${onIt ? "Yes" : "No"}`],
  });
};

const horizontalVertical = (r: Rng): Q => {
  const k = nonZero(r, -5, 5);
  const vertical = r.next() < 0.5;
  const graph: GraphSpec = {
    ...grid(-6, 6, -6, 6),
    curves: [{ points: vertical ? [[k, -6], [k, 6]] : [[-6, k], [6, k]], highlight: true }],
    description: vertical ? `A vertical line crossing the x-axis at ${num(k)}.` : `A horizontal line crossing the y-axis at ${num(k)}.`,
  };
  const right = vertical ? `x = ${num(k)}` : `y = ${num(k)}`;
  const swap = vertical ? `y = ${num(k)}` : `x = ${num(k)}`;
  const neg = vertical ? `x = ${num(-k)}` : `y = ${num(-k)}`;
  const diag = `y = ${xTermText(k)}`;
  return choiceQ(r, [right, swap, neg, diag], {
    prompt: "What is the equation of the highlighted line?",
    visual: { kind: "graph", graph },
    mc: { [swap]: "line-x-y-equals", [neg]: "coord-sign", [diag]: "line-x-y-equals" },
    hints: ["Pick any two points on the line and write down their coordinates.", `What stays the same for every point: x or y?`],
    solution: [
      vertical ? `Every point on the line has x-coordinate ${num(k)}, like (${num(k)}, 0) and (${num(k)}, 3).` : `Every point on the line has y-coordinate ${num(k)}, like (0, ${num(k)}) and (3, ${num(k)}).`,
      `So the equation is ${right}.`,
    ],
  });
};
const xTermText = (k: number) => (k === 1 ? "x" : k === -1 ? "−x" : `${num(k)}x`);

const readFromLine = (r: Rng): Q => {
  const [m, c] = mc(r, 2);
  // Choose an x where y stays on the grid.
  const xs = [-4, -3, -2, -1, 1, 2, 3, 4].filter((x) => Math.abs(m * x + c) <= 7 && m * x + c !== 0);
  const x = r.pick(xs);
  const y = m * x + c;
  const fromY = r.next() < 0.4;
  const graph: GraphSpec = {
    ...grid(-5, 5, -8, 8),
    curves: [{ points: linePoints(m, c, -5, 5), label: { text: lineEq(m, c), at: m > 0 ? [-4.8, 7] : [1.2, 7] } }],
    description: `The straight line ${lineEq(m, c)} drawn for x from −5 to 5.`,
  };
  if (fromY) {
    return intQ(x, {
      prompt: `Use the graph of ${lineEq(m, c)} to find x when y = ${num(y)}.`,
      visual: { kind: "graph", graph },
      wrong: [
        { value: y, misconception: "line-wrong-axis" },
        { value: m * y + c, misconception: "line-wrong-axis" },
      ],
      hints: [`Find ${num(y)} on the y-axis (the one going up).`, "Go across to the line, then straight up or down to the x-axis."],
      solution: [`Start at ${num(y)} on the y-axis and go across to the line.`, `Go ${y > 0 ? "down" : "up"} to the x-axis. You reach x = ${num(x)}.`, `Check: when x = ${num(x)}, y = ${num(m * x)}${c === 0 ? "" : c > 0 ? ` + ${c}` : ` − ${-c}`} = ${num(y)} ✓. So x = ${num(x)}`],
    });
  }
  return intQ(y, {
    prompt: `Use the graph of ${lineEq(m, c)} to find y when x = ${num(x)}.`,
    visual: { kind: "graph", graph },
    wrong: [
      { value: x, misconception: "line-wrong-axis" },
      { value: (x - c) / m, misconception: "line-wrong-axis" },
    ],
    hints: [`Find ${num(x)} on the x-axis.`, "Go up or down to the line, then across to the y-axis."],
    solution: [`From x = ${num(x)}, go ${y > 0 ? "up" : "down"} to the line, then across to the y-axis.`, `You reach y = ${num(y)}.`, `y = ${num(y)}`],
  });
};

const plotLinear: Gen = (r, tier) => {
  if (tier === 1) return r.pick<(r: Rng, t: 1 | 2) => Q>([(r: Rng) => tableValue(r, 1), (r: Rng) => plotOnLine(r, 1), horizontalVertical, (r: Rng) => tableValue(r, 1), readFromLine])(r, 1);
  return r.pick<(r: Rng, t: 1 | 2) => Q>([(r: Rng) => tableValue(r, 2), (r: Rng) => plotOnLine(r, 2), onLineCheck, readFromLine, horizontalVertical])(r, 2);
};

// ================================================================ real-life graphs

interface Context {
  /** What x and y measure, with units, for axis titles. */
  xLabel: string;
  yLabel: string;
  x: { max: number; step: number; labelStep: number };
  y: { max: number; step: number; labelStep: number };
  /** y = rate × x + start. */
  rate: number;
  start: number;
  /** Question wording. */
  askY: (x: number) => string;
  askX: (y: number) => string;
  showX: (x: number) => string;
  showY: (y: number) => string;
  title: string;
}

const money = (n: number) => `£${Number.isInteger(n) ? n : n.toFixed(2)}`;

const CONTEXTS: Context[] = [
  {
    title: "a conversion graph for miles and kilometres",
    xLabel: "Miles",
    yLabel: "Kilometres",
    x: { max: 50, step: 5, labelStep: 10 },
    y: { max: 80, step: 4, labelStep: 20 },
    rate: 1.6,
    start: 0,
    askY: (x) => `Use the graph to change ${x} miles into kilometres.`,
    askX: (y) => `Use the graph to change ${y} km into miles.`,
    showX: (x) => `${x} miles`,
    showY: (y) => `${y} km`,
  },
  {
    title: "a conversion graph for pounds (£) and euros (€)",
    xLabel: "Pounds (£)",
    yLabel: "Euros (€)",
    x: { max: 50, step: 5, labelStep: 10 },
    y: { max: 60, step: 3, labelStep: 12 },
    rate: 1.2,
    start: 0,
    askY: (x) => `Use the graph to change £${x} into euros.`,
    askX: (y) => `Use the graph to change €${y} into pounds.`,
    showX: (x) => `£${x}`,
    showY: (y) => `€${y}`,
  },
  {
    title: "a graph of a taxi's charges",
    xLabel: "Distance (miles)",
    yLabel: "Cost (£)",
    x: { max: 10, step: 1, labelStep: 2 },
    y: { max: 30, step: 1, labelStep: 5 },
    rate: 2,
    start: 4,
    askY: (x) => `How much does a ${x}-mile taxi journey cost?`,
    askX: (y) => `A taxi journey cost £${y}. How many miles was it?`,
    showX: (x) => `${x} miles`,
    showY: (y) => money(y),
  },
  {
    title: "a graph of a plumber's charges",
    xLabel: "Time (hours)",
    yLabel: "Cost (£)",
    x: { max: 6, step: 0.5, labelStep: 1 },
    y: { max: 300, step: 10, labelStep: 50 },
    rate: 40,
    start: 60,
    askY: (x) => `How much does the plumber charge for ${x} hours of work?`,
    askX: (y) => `The plumber charged £${y}. How many hours did the job take?`,
    showX: (x) => `${x} hours`,
    showY: (y) => money(y),
  },
  {
    title: "a graph of the water left in a tank as it empties",
    xLabel: "Time (minutes)",
    yLabel: "Water (litres)",
    x: { max: 12, step: 1, labelStep: 2 },
    y: { max: 60, step: 5, labelStep: 10 },
    rate: -5,
    start: 60,
    askY: (x) => `How much water is left in the tank after ${x} minutes?`,
    askX: (y) => `After how many minutes are there ${y} litres left?`,
    showX: (x) => `${x} minutes`,
    showY: (y) => `${y} litres`,
  },
];

function contextGraph(ctx: Context): GraphSpec {
  const end = ctx.rate < 0 ? -ctx.start / ctx.rate : ctx.x.max;
  return {
    x: { min: 0, max: ctx.x.max, step: ctx.x.step, labelStep: ctx.x.labelStep, label: ctx.xLabel },
    y: { min: 0, max: ctx.y.max, step: ctx.y.step, labelStep: ctx.y.labelStep, label: ctx.yLabel },
    curves: [{ points: [[0, ctx.start], [end, ctx.start + ctx.rate * end]] }],
    description: `${ctx.title[0].toUpperCase()}${ctx.title.slice(1)}. ${ctx.xLabel} across, from 0 to ${ctx.x.max}; ${ctx.yLabel} up, from 0 to ${ctx.y.max}. A straight line from (0, ${ctx.start}) to (${end}, ${ctx.start + ctx.rate * end}).`,
  };
}

const onGrid = (v: number, step: number) => Math.abs(v / step - Math.round(v / step)) < 1e-9;

/** x-values on gridlines whose y-value is also on a gridline, not on a labelled line (so reading needs the scale). */
function readable(ctx: Context): number[] {
  const out: number[] = [];
  const end = ctx.rate < 0 ? -ctx.start / ctx.rate : ctx.x.max;
  for (let x = ctx.x.step; x < end - 1e-9; x += ctx.x.step) {
    const xr = Math.round(x * 100) / 100;
    const y = Math.round((ctx.start + ctx.rate * xr) * 100) / 100;
    if (y > 0 && y <= ctx.y.max && onGrid(y, ctx.y.step) && !(onGrid(xr, ctx.x.labelStep) && onGrid(y, ctx.y.labelStep))) out.push(xr);
  }
  return out;
}

const realRead = (r: Rng, tier: 1 | 2): Q => {
  const ctx = r.pick(tier === 1 ? CONTEXTS.slice(0, 3) : CONTEXTS);
  const xs = readable(ctx);
  const x = r.pick(xs);
  const y = Math.round((ctx.start + ctx.rate * x) * 100) / 100;
  const graph = contextGraph(ctx);
  const backwards = r.next() < 0.45;
  const decimal = !Number.isInteger(x) || !Number.isInteger(y);
  const help = decimal ? "Type a number, like 2.5. Units are fine but not needed." : "Type a number. Units are fine but not needed.";
  const strip = (s: string) => s.replace(/^£/, "");
  if (backwards) {
    return {
      prompt: ctx.askX(y),
      visual: { kind: "graph", graph },
      answer: { kind: "fraction", value: simplify(frac(Math.round(x * 100), 100)), requireSimplest: false },
      wrongAnswers: wrongs(x, [
        { value: Math.round((x / ctx.x.step) * 100) / 100, misconception: "real-scale" },
        { value: Math.round((ctx.start + ctx.rate * y) * 100) / 100, misconception: "line-wrong-axis" },
      ]).map((w) => ({ value: typeof w.value === "number" ? simplify(frac(Math.round(w.value * 100), 100)) : w.value, misconception: w.misconception })),
      answerHelp: help,
      answerText: ctx.showX(x),
      hints: [`Find ${strip(ctx.showY(y))} on the ${ctx.yLabel.toLowerCase()} axis (going up). One small square there is worth ${ctx.y.step}.`, "Go across to the line, then straight down to the horizontal axis."],
      solution: [`Start at ${ctx.showY(y)} on the vertical axis and go across to the line.`, `Go down to the horizontal axis. Each small square there is worth ${ctx.x.step}.`, `The answer is ${ctx.showX(x)}.`],
    };
  }
  return {
    prompt: ctx.askY(x),
    visual: { kind: "graph", graph },
    answer: { kind: "fraction", value: simplify(frac(Math.round(y * 100), 100)), requireSimplest: false },
    wrongAnswers: wrongs(y, [
      { value: Math.round((y / ctx.y.step) * 100) / 100, misconception: "real-scale" },
      { value: Math.round(((x - ctx.start) / ctx.rate) * 100) / 100, misconception: "line-wrong-axis" },
      { value: Math.round(ctx.rate * x * 100) / 100, misconception: "real-intercept-meaning" },
    ]).map((w) => ({ value: typeof w.value === "number" ? simplify(frac(Math.round(w.value * 100), 100)) : w.value, misconception: w.misconception })),
    answerHelp: help,
    answerText: ctx.showY(y),
    hints: [`Find ${strip(ctx.showX(x))} on the horizontal axis. One small square there is worth ${ctx.x.step}.`, `Go up to the line, then across to the vertical axis. One small square there is worth ${ctx.y.step}.`],
    solution: [`Start at ${ctx.showX(x)} on the horizontal axis and go up to the line.`, `Go across to the vertical axis. Each small square there is worth ${ctx.y.step}.`, `The answer is ${ctx.showY(y)}.`],
  };
};

const realMeaning = (r: Rng): Q => {
  const ctx = r.pick(CONTEXTS.filter((c) => c.start > 0));
  const graph = contextGraph(ctx);
  if (ctx.rate > 0 && r.next() < 0.5) {
    return intQ(ctx.start, {
      prompt: `This is ${ctx.title}. How much is the fixed charge, before any ${ctx.xLabel.toLowerCase().includes("time") ? "time is worked" : "distance is travelled"}?`,
      visual: { kind: "graph", graph },
      wrong: [
        { value: ctx.rate, misconception: "real-intercept-meaning" },
        { value: ctx.start / ctx.y.step, misconception: "real-scale" },
      ],
      answerHelp: "Type a number of pounds, like 25. You don't need the £ sign.",
      hints: ["The fixed charge is what you pay at 0 on the horizontal axis.", "Read where the line meets the vertical axis."],
      solution: [`At 0 ${ctx.xLabel.toLowerCase().replace(/ \(.*/, "")}, the line is already at £${ctx.start}.`, `So the fixed charge is £${ctx.start}.`],
      answerText: `£${ctx.start}`,
    });
  }
  if (ctx.rate > 0) {
    return intQ(ctx.rate, {
      prompt: `This is ${ctx.title}. How much more does each extra ${ctx.xLabel.startsWith("Time") ? "hour" : "mile"} cost?`,
      visual: { kind: "graph", graph },
      wrong: [
        { value: ctx.start, misconception: "real-intercept-meaning" },
        { value: ctx.start + ctx.rate, misconception: "real-intercept-meaning" },
      ],
      answerHelp: "Type a number of pounds, like 25. You don't need the £ sign.",
      hints: ["Read the cost at 0, then at 1. How much did it go up?", "That rise for each 1 across is the gradient of the line."],
      solution: [`At 0 the cost is £${ctx.start}; at 1 it is £${ctx.start + ctx.rate}.`, `Each extra ${ctx.xLabel.startsWith("Time") ? "hour" : "mile"} adds £${ctx.rate}.`],
      answerText: `£${ctx.rate}`,
    });
  }
  const empty = -ctx.start / ctx.rate;
  return intQ(empty, {
    prompt: `This is ${ctx.title}. How many minutes does it take for the tank to empty?`,
    visual: { kind: "graph", graph },
    wrong: [
      { value: ctx.start, misconception: "line-wrong-axis" },
      { value: -ctx.rate, misconception: "real-intercept-meaning" },
    ],
    answerHelp: "Type a number of minutes, like 8.",
    hints: ["Empty means 0 litres left.", "Find where the line reaches the horizontal axis."],
    solution: [`The tank is empty when the water is at 0 litres.`, `The line meets the horizontal axis at ${empty} minutes.`],
    answerText: `${empty} minutes`,
  });
};

const realLife: Gen = (r, tier) => {
  if (tier === 1) return r.next() < 0.75 ? realRead(r, 1) : realMeaning(r);
  return r.next() < 0.65 ? realRead(r, 2) : realMeaning(r);
};

// ================================================================ gradient and intercept

const gradientFromEquation = (r: Rng, tier: 1 | 2): Q => {
  const m = nonZero(r, -6, 6);
  let c = nonZero(r, -9, 9);
  if (c === m) c = -c;
  const constFirst = tier === 2 && r.next() < 0.5 && c > 0;
  const eq = constFirst ? `y = ${lineRhsConstFirst(m, c)}` : lineEq(m, c);
  return intQ(m, {
    prompt: `What is the gradient of the line ${eq}?`,
    wrong: [
      { value: c, misconception: constFirst ? "grad-first-number" : "grad-gave-intercept" },
      { value: -m, misconception: "grad-sign" },
    ],
    hints: ["Compare it with y = mx + c.", "The gradient m is the number multiplying x, including its sign."],
    solution: [constFirst ? `Write it in the usual order: ${lineEq(m, c)}.` : `Compare ${eq} with y = mx + c.`, `The number multiplying x is ${num(m)}${Math.abs(m) === 1 ? ` (${m === 1 ? "x" : "−x"} is the same as ${num(m)} × x)` : ""}.`, `The gradient is ${num(m)}.`],
  });
};

const interceptFromEquation = (r: Rng): Q => {
  const m = nonZero(r, -6, 6);
  let c = nonZero(r, -9, 9);
  if (Math.abs(c) === Math.abs(m)) c = c > 0 ? c + 1 : c - 1;
  return intQ(c, {
    prompt: `The line ${lineEq(m, c)} crosses the y-axis at (0, c). What is c?`,
    wrong: [
      { value: m, misconception: "grad-gave-gradient" },
      { value: -c, misconception: "grad-c-sign" },
    ],
    hints: ["On the y-axis, x = 0.", `Put x = 0 into the equation: the x-term disappears.`],
    solution: [`When x = 0, y = ${m === 1 ? "" : `${num(m)} × `}0${c > 0 ? ` + ${c}` : ` − ${-c}`} = ${num(c)}.`, `The y-intercept is ${num(c)}.`],
  });
};

/** A line through two grid points so the gradient can be counted. */
function lineThroughGrid(r: Rng, fraction: boolean) {
  const run = fraction ? r.pick([2, 3]) : 1;
  let rise = fraction ? r.pick([1, 2, -1, -2, 1]) : nonZero(r, -3, 3);
  if (fraction && Math.abs(rise) % run === 0) rise = rise > 0 ? 1 : -1;
  const c = r.int(-3, 3);
  return { rise, run, c, m: rise / run };
}

const gradientFromGraph = (r: Rng, tier: 1 | 2): Q => {
  const frac2 = tier === 2 && r.next() < 0.4;
  const { rise, run, c, m } = lineThroughGrid(r, frac2);
  const x1 = run === 1 ? r.int(-2, 1) : -run;
  if (Math.abs(m * x1 + c) > 8 || Math.abs(m * (x1 + 2 * run) + c) > 8) return gradientFromGraph(r, tier);
  const p1: [number, number] = [x1, m * x1 + c];
  const p2: [number, number] = [x1 + 2 * run, m * (x1 + 2 * run) + c];
  const graph: GraphSpec = {
    ...grid(-6, 6, -8, 8),
    curves: [{ points: linePoints(m, c, -6, 6) }],
    points: [{ at: p1 }, { at: p2 }],
    description: `A straight line through ${showPoint(p1)} and ${showPoint(p2)}.`,
  };
  const dy = p2[1] - p1[1];
  const dx = p2[0] - p1[0];
  const steps = [
    `Between the two marked points the line goes ${dx} across and ${Math.abs(dy)} ${dy > 0 ? "up" : "down"}.`,
    `Gradient = change in y ÷ change in x = ${num(dy)} ÷ ${dx}.`,
  ];
  if (Number.isInteger(m)) {
    return intQ(m, {
      prompt: "Work out the gradient of this straight line.",
      visual: { kind: "graph", graph },
      wrong: [
        { value: -m, misconception: "grad-sign" },
        ...(Math.abs(m) === 2 ? [{ value: 1 / m, misconception: "grad-run-over-rise" }] : []),
        { value: c, misconception: "grad-gave-intercept" },
      ],
      hints: ["Use the two marked points. Count how far across, then how far up or down.", "Gradient = up ÷ across. Downhill lines have a negative gradient."],
      solution: [...steps, `The gradient is ${num(m)}.`],
    });
  }
  const f = simplify(frac(dy, dx));
  return {
    prompt: "Work out the gradient of this straight line. You can give a fraction.",
    visual: { kind: "graph", graph },
    answer: { kind: "fraction", value: f, requireSimplest: false },
    wrongAnswers: [
      { value: frac(-f.n, f.d), misconception: "grad-sign" },
      { value: simplify(frac(dx * Math.sign(dy), Math.abs(dy))), misconception: "grad-run-over-rise" },
    ],
    answerHelp: "Type a whole number, a fraction like 1/2, or a decimal like 0.5. Use a minus sign for a downhill line.",
    answerText: f.n < 0 ? `−${-f.n}/${f.d}` : `${f.n}/${f.d}`,
    hints: ["Use the two marked points. Count how far across, then how far up or down.", "Gradient = up ÷ across. It can be a fraction."],
    solution: [...steps, `The gradient is ${f.n < 0 ? `−${-f.n}/${f.d}` : `${f.n}/${f.d}`}.`],
  };
};

const interceptFromGraph = (r: Rng): Q => {
  const m = nonZero(r, -3, 3);
  const c = nonZero(r, -5, 5);
  const graph: GraphSpec = { ...grid(-6, 6, -8, 8), curves: [{ points: linePoints(m, c, -6, 6) }], description: `A straight line crossing the y-axis at ${num(c)}.` };
  const xInt = -c / m;
  return intQ(c, {
    prompt: "What is the y-intercept of this line?",
    visual: { kind: "graph", graph },
    wrong: [
      ...(Number.isInteger(xInt) ? [{ value: xInt, misconception: "quad-roots-intercept" }] : []),
      { value: m, misconception: "grad-gave-gradient" },
      { value: -c, misconception: "grad-c-sign" },
    ],
    hints: ["The y-intercept is where the line crosses the y-axis (the one going up).", "Read the number on the y-axis there."],
    solution: [`The line crosses the y-axis at (0, ${num(c)}).`, `The y-intercept is ${num(c)}.`],
  });
};

const gradientTwoPoints = (r: Rng): Q => {
  const x1 = r.int(-5, 4);
  const dx = r.int(1, 5);
  const dy = nonZero(r, -10, 10);
  const y1 = r.int(-6, 6);
  const A: [number, number] = [x1, y1];
  const B: [number, number] = [x1 + dx, y1 + dy];
  const f = simplify(frac(dy, dx));
  const text = f.d === 1 ? num(f.n) : f.n < 0 ? `−${-f.n}/${f.d}` : `${f.n}/${f.d}`;
  return {
    prompt: `A line goes through ${showPoint(A)} and ${showPoint(B)}. Work out its gradient.`,
    answer: { kind: "fraction", value: f, requireSimplest: false },
    wrongAnswers: [
      { value: frac(-f.n, f.d), misconception: "grad-sign" },
      { value: simplify(frac(dx, dy)), misconception: "grad-run-over-rise" },
      ...(B[1] !== 0 && B[0] !== 0 ? [{ value: simplify(frac(B[1], B[0])), misconception: "grad-not-subtracted" }] : []),
    ].filter((w, i, all) => !(w.value.n * f.d === f.n * w.value.d) && all.findIndex((v) => v.value.n * w.value.d === w.value.n * v.value.d) === i),
    answerHelp: "Type a whole number, a fraction like 3/2 or a decimal like 1.5.",
    answerText: text,
    hints: ["Gradient = change in y ÷ change in x.", `Change in y: ${num(B[1])} − ${br(A[1])}. Change in x: ${num(B[0])} − ${br(A[0])}.`],
    solution: [`Change in y = ${num(B[1])} − ${br(A[1])} = ${num(dy)}`, `Change in x = ${num(B[0])} − ${br(A[0])} = ${dx}`, `Gradient = ${num(dy)} ÷ ${dx} = ${text}`],
  };
};

const steepest = (r: Rng): Q => {
  const ms = shuffleDistinctAbs(r);
  const lines = ms.map((m) => ({ m, c: r.int(-9, 9) }));
  const best = lines.reduce((a, b) => (Math.abs(b.m) > Math.abs(a.m) ? b : a));
  // Give the least steep line the biggest number on its own, to tempt the wrong reading.
  const least = lines.reduce((a, b) => (Math.abs(b.m) < Math.abs(a.m) ? b : a));
  least.c = 12;
  const options = [best, ...lines.filter((l) => l !== best)].map((l) => lineEq(l.m, l.c));
  return choiceQ(r, options, {
    prompt: "Which of these lines is the steepest?",
    mc: Object.fromEntries(options.slice(1).map((o) => [o, "grad-steepest"])),
    hints: ["Steepness depends on the gradient: the number multiplying x.", "Ignore the sign: a gradient of −5 is steeper than 3, just downhill."],
    solution: [`The gradients are ${lines.map((l) => num(l.m)).join(", ")}.`, `The biggest size of gradient is ${num(best.m)}.`, `${lineEq(best.m, best.c)} is the steepest.`],
  });
};
function shuffleDistinctAbs(r: Rng): number[] {
  const sizes = [1, 2, 3, 4, 5, 6];
  const picked: number[] = [];
  while (picked.length < 4) {
    const s = r.pick(sizes);
    if (!picked.some((p) => Math.abs(p) === s)) picked.push(s * (r.next() < 0.35 ? -1 : 1));
  }
  return picked;
}

const gradientIntercept: Gen = (r, tier) => {
  if (tier === 1) return r.pick<(r: Rng, t: 1 | 2) => Q>([(r: Rng) => gradientFromEquation(r, 1), interceptFromEquation, (r: Rng) => gradientFromGraph(r, 1), interceptFromGraph])(r, 1);
  return r.pick<(r: Rng, t: 1 | 2) => Q>([(r: Rng) => gradientFromEquation(r, 2), (r: Rng) => gradientFromGraph(r, 2), gradientTwoPoints, steepest, interceptFromEquation])(r, 2);
};

// ================================================================ y = mx + c

const eqAnswer = (m: number, c: number) => ({ kind: "expression" as const, value: lineRhs(m, c), form: "simplified" as const, lhs: "y" });

const equationFromGraph = (r: Rng): Q => {
  const m = nonZero(r, -3, 3);
  let c = nonZero(r, -5, 5);
  if (c === m) c = -c;
  const x1 = r.next() < 0.5 ? 1 : 2;
  if (Math.abs(m * x1 + c) > 8) return equationFromGraph(r);
  const graph: GraphSpec = {
    ...grid(-6, 6, -8, 8),
    curves: [{ points: linePoints(m, c, -6, 6) }],
    points: [{ at: [0, c] }, { at: [x1, m * x1 + c] }],
    description: `A straight line through ${showPoint([0, c])} and ${showPoint([x1, m * x1 + c])}.`,
  };
  return {
    prompt: "Find the equation of this line. Write it in the form y = mx + c.",
    visual: { kind: "graph", graph },
    answer: eqAnswer(m, c),
    wrongAnswers: [],
    wrongExpressions: [
      { value: lineRhs(c, m), misconception: "ymxc-swapped" },
      { value: lineRhs(-m, c), misconception: "grad-sign" },
      { value: lineRhs(m, -c), misconception: "grad-c-sign" },
    ].filter((w) => w.value !== lineRhs(m, c)),
    answerHelp: HELP_EQ,
    hints: ["Find c first: where does the line cross the y-axis?", "Then find m: for each 1 across, how far up (or down) does the line go?"],
    solution: [`The line crosses the y-axis at ${num(c)}, so c = ${num(c)}.`, `From (0, ${num(c)}) to ${showPoint([x1, m * x1 + c])}: ${x1} across and ${Math.abs(m * x1)} ${m > 0 ? "up" : "down"}, so m = ${num(m * x1)} ÷ ${x1} = ${num(m)}.`, `${lineEq(m, c)}`],
  };
};

const equationFromFacts = (r: Rng): Q => {
  const m = nonZero(r, -5, 5);
  let c = nonZero(r, -9, 9);
  if (c === m) c = -c;
  return {
    prompt: `A straight line has gradient ${num(m)} and crosses the y-axis at (0, ${num(c)}). Write down its equation.`,
    answer: eqAnswer(m, c),
    wrongAnswers: [],
    wrongExpressions: [{ value: lineRhs(c, m), misconception: "ymxc-swapped" }, { value: lineRhs(m, -c), misconception: "grad-c-sign" }],
    answerHelp: HELP_EQ,
    hints: ["Use y = mx + c.", "m is the gradient and c is the y-intercept."],
    solution: [`m = ${num(m)} and c = ${num(c)}.`, `${lineEq(m, c)}`],
  };
};

const parallelChoice = (r: Rng): Q => {
  const m = nonZero(r, -5, 5);
  const c = nonZero(r, -6, 6);
  let c2 = nonZero(r, -9, 9);
  if (c2 === c) c2 = c + 3;
  let other = nonZero(r, -5, 5);
  if (other === m || other === -m) other = m + (m > 0 ? 1 : -1) * 2;
  const right = lineEq(m, c2);
  const sameC = lineEq(other, c);
  const negM = lineEq(-m, c2);
  const swapped = lineEq(c2 === 0 ? 1 : c2, m);
  return choiceQ(r, [right, sameC, negM, swapped], {
    prompt: `Which line is parallel to ${lineEq(m, c)}?`,
    mc: { [sameC]: "ymxc-parallel-gradient", [negM]: "grad-sign", [swapped]: "ymxc-swapped" },
    hints: ["Parallel lines have the same gradient.", `The gradient of ${lineEq(m, c)} is ${num(m)}. Which other line has gradient ${num(m)}?`],
    solution: [`Parallel lines have the same gradient. ${lineEq(m, c)} has gradient ${num(m)}.`, `${right} also has gradient ${num(m)}.`, `Answer: ${right}`],
  });
};

const throughTwoPoints = (r: Rng): Q => {
  const m = nonZero(r, -4, 4);
  const c = r.int(-8, 8);
  const x1 = nonZero(r, -4, 4);
  let x2 = x1 + r.int(1, 3);
  if (x2 === 0) x2 += 1;
  const A: [number, number] = [x1, m * x1 + c];
  const B: [number, number] = [x2, m * x2 + c];
  return {
    prompt: `A straight line goes through ${showPoint(A)} and ${showPoint(B)}. Find its equation.`,
    answer: eqAnswer(m, c),
    wrongAnswers: [],
    wrongExpressions: [
      { value: lineRhs(m, A[1]), misconception: "ymxc-parallel-same-c" },
      { value: lineRhs(-m, c + 2 * m * x1), misconception: "grad-sign" },
    ].filter((w) => w.value !== lineRhs(m, c)),
    answerHelp: HELP_EQ,
    hints: ["Find the gradient first: change in y ÷ change in x.", `Then put one point into y = mx + c to find c.`],
    solution: [
      `Gradient m = (${num(B[1])} − ${br(A[1])}) ÷ (${num(B[0])} − ${br(A[0])}) = ${num(B[1] - A[1])} ÷ ${B[0] - A[0]} = ${num(m)}.`,
      `Put ${showPoint(A)} into y = ${xTermText(m)} + c: ${num(A[1])} = ${num(m * x1)} + c, so c = ${num(c)}.`,
      `${lineEq(m, c)}`,
    ],
  };
};

const parallelThroughPoint = (r: Rng): Q => {
  const m = nonZero(r, -4, 4);
  const c0 = nonZero(r, -6, 6);
  const x = nonZero(r, -4, 4);
  let c = r.int(-8, 8);
  if (c === c0) c += 2;
  const P: [number, number] = [x, m * x + c];
  return {
    prompt: `Find the equation of the line parallel to ${lineEq(m, c0)} that goes through ${showPoint(P)}.`,
    answer: eqAnswer(m, c),
    wrongAnswers: [],
    wrongExpressions: [
      { value: lineRhs(m, c0), misconception: "ymxc-parallel-same-c" },
      { value: lineRhs(m, P[1]), misconception: "ymxc-parallel-same-c" },
    ].filter((w) => w.value !== lineRhs(m, c)),
    answerHelp: HELP_EQ,
    hints: [`Parallel means the same gradient, so m = ${num(m)}.`, `Put x = ${num(x)} and y = ${num(P[1])} into y = ${xTermText(m)} + c to find c.`],
    solution: [`The gradient is the same: m = ${num(m)}.`, `${num(P[1])} = ${num(m)} × ${br(x)} + c, so ${num(P[1])} = ${num(m * x)} + c and c = ${num(c)}.`, `${lineEq(m, c)}`],
  };
};

const rearrangedGradient = (r: Rng): Q => {
  const k = r.pick([2, 3, 4, 5]);
  const m = nonZero(r, -4, 4);
  const c = nonZero(r, -5, 5);
  const askC = r.next() < 0.4;
  const rhs = lineRhs(k * m, k * c);
  const ans = askC ? c : m;
  return intQ(ans, {
    prompt: `The equation of a line is ${k}y = ${rhs}. What is its ${askC ? "y-intercept" : "gradient"}?`,
    wrong: [
      { value: askC ? k * c : k * m, misconception: "ymxc-not-divided" },
      { value: askC ? m : c, misconception: askC ? "grad-gave-gradient" : "grad-gave-intercept" },
    ],
    hints: ["Get y on its own first.", `Divide every term by ${k}.`],
    solution: [`Divide every term by ${k}: y = ${lineRhs(m, c)}.`, `Compare with y = mx + c: m = ${num(m)} and c = ${num(c)}.`, `The ${askC ? "y-intercept" : "gradient"} is ${num(ans)}.`],
  });
};

const yMxC: Gen = (r, tier) => {
  if (tier === 1) return r.pick<(r: Rng, t: 1 | 2) => Q>([equationFromGraph, equationFromFacts, parallelChoice, equationFromGraph])(r, 1);
  return r.pick<(r: Rng, t: 1 | 2) => Q>([throughTwoPoints, parallelThroughPoint, rearrangedGradient, equationFromGraph, parallelChoice])(r, 2);
};

export const LINE_GENERATORS: Record<string, Gen> = {
  "alg-coordinates": coordinates,
  "alg-plot-linear": plotLinear,
  "alg-real-life-graphs": realLife,
  "alg-gradient-intercept": gradientIntercept,
  "alg-y-mx-c": yMxC,
};
