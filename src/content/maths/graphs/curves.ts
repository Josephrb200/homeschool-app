/**
 * Question generators for quadratic graphs, cubic and reciprocal graphs, and
 * solving equations with graphs.
 *
 * Quadratics are built from whole-number roots, y = (x − p)(x − q), with the
 * roots an even distance apart, so roots, turning point and line of symmetry
 * all sit on gridlines and can be read exactly.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher.
 */

import type { Rng } from "@/engine/random";
import type { GraphSpec, TableSpec } from "@/engine/types";
import { xTerm, br, choiceQ, grid, HELP_PICK, intQ, lineEq, linePoints, lineRhs, nonZero, num, pointQ, sample, showPoint, type Gen, type Q } from "./plot";

type Pick = (r: Rng, t: 1 | 2) => Q;

/** x² + bx + c written neatly: "x² − 2x − 3", "x² + 4", "x² − 4x". */
export function quadRhs(b: number, c: number): string {
  let s = "x²";
  if (b !== 0) s += b > 0 ? ` + ${b === 1 ? "" : b}x` : ` − ${b === -1 ? "" : -b}x`;
  if (c !== 0) s += c > 0 ? ` + ${c}` : ` − ${-c}`;
  return s;
}

interface Quad {
  p: number;
  q: number;
  b: number;
  c: number;
  h: number;
  k: number;
  f: (x: number) => number;
}

/** y = (x − p)(x − q) with p < q, q − p even. */
function makeQuad(r: Rng, maxGap = 6): Quad {
  const gap = r.pick([2, 4, 6].filter((g) => g <= maxGap));
  const p = r.int(-4, 4 - gap);
  const q = p + gap;
  const b = -(p + q);
  const c = p * q;
  const h = (p + q) / 2;
  const f = (x: number) => (x - p) * (x - q);
  return { p, q, b, c, h, k: f(h), f };
}

function quadGraph(Q: Quad, extra: Partial<GraphSpec> = {}): GraphSpec {
  const xmin = Math.min(Q.p - 2, -1);
  const xmax = Math.max(Q.q + 2, 1);
  const ymin = Math.min(Q.k - 1, -2);
  const ymax = Math.max(8, Math.min(12, Q.f(xmin)));
  return {
    ...grid(xmin, xmax, ymin, ymax),
    curves: [{ points: sample(Q.f, xmin, xmax) }],
    description: `The curve y = ${quadRhs(Q.b, Q.c)}, a U-shaped curve, for x from ${num(xmin)} to ${num(xmax)}.`,
    ...extra,
  };
}

const sq = (x: number) => x * x;

// ================================================================ quadratic graphs

const quadTable = (r: Rng, tier: 1 | 2): Q => {
  const b = tier === 1 ? 0 : nonZero(r, -4, 4);
  const c = r.int(-6, 6);
  const f = (x: number) => x * x + b * x + c;
  const xs = [-3, -2, -1, 0, 1, 2, 3];
  const ask = r.pick([-3, -2, -1, -3, -2]);
  const y = f(ask);
  const table: TableSpec = {
    corner: "x",
    columns: xs.map(num),
    rows: [{ head: "y", cells: xs.map((x) => (x === ask ? "?" : Math.abs(x - ask) % 2 === 1 ? "" : num(f(x)))) }],
    highlight: [[0, xs.indexOf(ask)]],
    description: `Table of values for y = ${quadRhs(b, c)}, x from −3 to 3. The value to find is when x is ${num(ask)}.`,
  };
  const bxPart = b === 0 ? "" : ` ${b * ask >= 0 ? "+" : "−"} ${Math.abs(b * ask)}`;
  return intQ(y, {
    prompt: `Complete the table for y = ${quadRhs(b, c)}. What is y when x = ${num(ask)}?`,
    visual: { kind: "table", table },
    wrong: [
      { value: -sq(ask) + b * ask + c, misconception: "quad-negative-square" },
      { value: sq(ask) - b * ask + c, misconception: "line-negative-times" },
      { value: 2 * ask + b * ask + c, misconception: "quad-negative-square" },
    ],
    hints: [`Put x = ${num(ask)} into the equation.`, `${br(ask)}² = ${br(ask)} × ${br(ask)}. A negative times a negative is positive.`],
    solution: [
      `x² = ${br(ask)}² = ${sq(ask)}${b === 0 ? "" : `, and the ${xTerm(b)} term is ${num(b)} × ${br(ask)} = ${num(b * ask)}`}.`,
      `y = ${sq(ask)}${bxPart}${c === 0 ? "" : c > 0 ? ` + ${c}` : ` − ${-c}`}`,
      `y = ${num(y)}`,
    ],
  });
};

const quadPlot = (r: Rng): Q => {
  const Q = makeQuad(r, 4);
  let x = r.int(Q.p - 1, Q.q + 1);
  if (x === Q.h) x += 1;
  const y = Q.f(x);
  const g = quadGraph(Q);
  const graph: GraphSpec = { ...g, curves: undefined, pick: true, points: [Q.p, Q.q, Q.h].filter((v) => v !== x).map((v) => ({ at: [v, Q.f(v)] as [number, number] })), description: `A grid with some points of y = ${quadRhs(Q.b, Q.c)} already plotted.` };
  if (Math.abs(y) > g.y.max || y < g.y.min) return quadPlot(r);
  return pointQ([x, y], {
    prompt: `Some points of y = ${quadRhs(Q.b, Q.c)} are plotted. Work out y when x = ${num(x)} and plot that point.`,
    visual: { kind: "graph", graph },
    wrong: [
      { value: [y, x], misconception: "coord-swapped" },
      { value: [x, -sq(x) + Q.b * x + Q.c], misconception: "quad-negative-square" },
    ],
    answerHelp: HELP_PICK,
    hints: [`Put x = ${num(x)} into ${quadRhs(Q.b, Q.c)}.`, `Remember ${br(x)}² is ${sq(x)}.`],
    solution: [`y = ${br(x)}²${Q.b === 0 ? "" : ` ${Q.b < 0 ? "−" : "+"} ${Math.abs(Q.b)} × ${br(x)}`}${Q.c === 0 ? "" : Q.c > 0 ? ` + ${Q.c}` : ` − ${-Q.c}`} = ${num(y)}`, `Plot ${showPoint([x, y])}.`],
  });
};

const quadRoots = (r: Rng): Q => {
  const Q = makeQuad(r);
  return {
    prompt: `Here is the graph of y = ${quadRhs(Q.b, Q.c)}. Write down its roots (the x-values where the curve crosses the x-axis).`,
    visual: { kind: "graph", graph: quadGraph(Q) },
    answer: { kind: "list", value: [Q.p, Q.q], noun: "roots" },
    wrongAnswers: [
      ...(Q.c !== Q.p && Q.c !== Q.q ? [{ value: [Q.c], misconception: "quad-roots-intercept" }] : []),
      { value: [-Q.p, -Q.q], misconception: "coord-sign" },
    ].filter((w) => !(w.value.length === 2 && w.value.every((v) => v === Q.p || v === Q.q))),
    answerHelp: "Type both numbers with a comma between, like −1, 3.",
    answerText: `${num(Q.p)}, ${num(Q.q)}`,
    hints: ["The roots are where y = 0: where the curve meets the x-axis.", "There are two of them. Read each x-value."],
    solution: [`The curve crosses the x-axis at x = ${num(Q.p)} and x = ${num(Q.q)}.`, `The roots are ${num(Q.p)}, ${num(Q.q)}.`],
  };
};

const quadTurning = (r: Rng): Q => {
  const Q = makeQuad(r);
  return pointQ([Q.h, Q.k], {
    prompt: `Here is the graph of y = ${quadRhs(Q.b, Q.c)}. Write down the coordinates of its turning point.`,
    visual: { kind: "graph", graph: quadGraph(Q) },
    wrong: [
      { value: [Q.k, Q.h], misconception: "coord-swapped" },
      { value: [0, Q.c], misconception: "quad-roots-intercept" },
      { value: [Q.h, -Q.k], misconception: "coord-sign" },
    ],
    hints: ["The turning point is the lowest point of the U.", "It is halfway between the roots."],
    solution: [`The lowest point of the curve is halfway between the roots ${num(Q.p)} and ${num(Q.q)}, at x = ${num(Q.h)}.`, `There, y = ${num(Q.k)}.`, `The turning point is ${showPoint([Q.h, Q.k])}.`],
  });
};

const quadSymmetry = (r: Rng): Q => {
  let Q = makeQuad(r);
  while (Q.h === 0) Q = makeQuad(r);
  return intQ(Q.h, {
    prompt: `The graph of y = ${quadRhs(Q.b, Q.c)} is symmetrical. Its line of symmetry is x = a. What is a?`,
    visual: { kind: "graph", graph: quadGraph(Q) },
    wrong: [
      { value: Q.k, misconception: "quad-symmetry" },
      { value: Q.c, misconception: "quad-roots-intercept" },
      { value: Q.q - Q.p, misconception: "quad-symmetry" },
    ],
    answerHelp: "Type a number, like 2 or −1. You can type x = 2.",
    hints: ["The line of symmetry is a vertical line through the turning point.", `It is halfway between the roots ${num(Q.p)} and ${num(Q.q)}.`],
    solution: [`Halfway between ${num(Q.p)} and ${num(Q.q)} is (${num(Q.p)} + ${br(Q.q)}) ÷ 2 = ${num(Q.h)}.`, `The line of symmetry is x = ${num(Q.h)}, so a = ${num(Q.h)}.`],
  });
};

const quadIntercept = (r: Rng): Q => {
  let Q = makeQuad(r);
  while (Q.c === 0 || Q.c > 8) Q = makeQuad(r);
  return intQ(Q.c, {
    prompt: `Here is the graph of y = ${quadRhs(Q.b, Q.c)}. Where does it cross the y-axis? Give the y-value.`,
    visual: { kind: "graph", graph: quadGraph(Q) },
    wrong: [
      { value: Q.p, misconception: "quad-roots-intercept" },
      { value: Q.q, misconception: "quad-roots-intercept" },
      { value: Q.k, misconception: "quad-symmetry" },
    ],
    hints: ["The y-axis is where x = 0.", "Put x = 0 into the equation, or read where the curve meets the y-axis."],
    solution: [`At x = 0, y = 0² ${Q.b < 0 ? "−" : "+"} ${Math.abs(Q.b)} × 0${Q.c > 0 ? ` + ${Q.c}` : ` − ${-Q.c}`} = ${num(Q.c)}.`, `It crosses the y-axis at ${num(Q.c)}.`],
  });
};

const quadratic: Gen = (r, tier) => {
  if (tier === 1) return r.pick<Pick>([(r) => quadTable(r, 1), quadPlot, quadRoots, (r) => quadTable(r, 1), quadTurning])(r, 1);
  return r.pick<Pick>([(r) => quadTable(r, 2), quadRoots, quadTurning, quadSymmetry, quadIntercept, quadPlot])(r, 2);
};

// ================================================================ cubic and reciprocal

type Family = "Straight line" | "Quadratic" | "Cubic" | "Reciprocal";
const FAMILIES: Family[] = ["Straight line", "Quadratic", "Cubic", "Reciprocal"];

interface Shape {
  family: Family;
  eq: string;
  curves: [number, number][][];
  words: string;
}

function familyShape(r: Rng, family: Family): Shape {
  const k = r.int(-3, 3);
  const ks = k === 0 ? "" : k > 0 ? ` + ${k}` : ` − ${-k}`;
  if (family === "Straight line") {
    const m = nonZero(r, -3, 3);
    return { family, eq: lineEq(m, k), curves: [linePoints(m, k, -5, 5)], words: "a straight line" };
  }
  if (family === "Quadratic") {
    const down = r.next() < 0.3;
    const c = down ? r.int(2, 6) : r.int(-5, 0);
    const f = (x: number) => (down ? -1 : 1) * x * x + c;
    return { family, eq: down ? `y = ${c} − x²` : `y = x²${c === 0 ? "" : ` − ${-c}`}`, curves: [sample(f, -5, 5)], words: down ? "a ∩-shaped curve" : "a U-shaped curve" };
  }
  if (family === "Cubic") {
    const down = r.next() < 0.3;
    const f = (x: number) => (down ? -1 : 1) * x ** 3 + k;
    return { family, eq: down ? (k === 0 ? "y = −x³" : `y = ${num(k)} − x³`) : `y = x³${ks}`, curves: [sample(f, -3, 3)], words: "an S-shaped curve" };
  }
  const a = r.pick([1, 2, 4, 6]) * (r.next() < 0.25 ? -1 : 1);
  const f = (x: number) => a / x;
  return {
    family,
    eq: a < 0 ? `y = −${-a}/x` : `y = ${a}/x`,
    curves: [sample(f, -8, -0.1, 0.02).filter(([, y]) => Math.abs(y) < 12), sample(f, 0.1, 8, 0.02).filter(([, y]) => Math.abs(y) < 12)],
    words: "two separate curves that get closer and closer to the axes",
  };
}

const nameFromGraph = (r: Rng): Q => {
  const family = r.pick(FAMILIES);
  const s = familyShape(r, family);
  const graph: GraphSpec = { ...grid(-6, 6, -8, 8), curves: s.curves.map((points) => ({ points })), description: `A graph showing ${s.words}.` };
  return choiceQ(r, [family, ...FAMILIES.filter((f) => f !== family)], {
    prompt: "What type of graph is this?",
    visual: { kind: "graph", graph },
    mc: Object.fromEntries(FAMILIES.filter((f) => f !== family).map((f) => [f, "graph-shape-mixup"])),
    keepOrder: true,
    hints: ["Straight: straight line. Quadratic: U or ∩. Cubic: S shape. Reciprocal: two separate curves.", "Does it have one curve or two? Does it turn once, or bend in an S?"],
    solution: [`The graph is ${s.words}.`, family === "Straight line" ? "That is a straight-line graph." : `That is a ${family.toLowerCase()} graph.`, `Answer: ${family}`],
  });
};

const nameFromEquation = (r: Rng): Q => {
  const family = r.pick(FAMILIES);
  const s = familyShape(r, family);
  return choiceQ(r, [family, ...FAMILIES.filter((f) => f !== family)], {
    prompt: `What type of graph does ${s.eq} make?`,
    mc: Object.fromEntries(FAMILIES.filter((f) => f !== family).map((f) => [f, "graph-shape-mixup"])),
    keepOrder: true,
    hints: ["Look at the highest power of x.", "x on its own: straight line. x²: quadratic. x³: cubic. x on the bottom of a fraction: reciprocal."],
    solution: [
      family === "Straight line" ? "The highest power of x is x itself." : family === "Quadratic" ? "The highest power of x is x²." : family === "Cubic" ? "The highest power of x is x³." : "x is on the bottom of a fraction.",
      family === "Straight line" ? "So it makes a straight line." : `So it makes ${s.words}: a ${family.toLowerCase()} graph.`,
      `Answer: ${family}`,
    ],
  });
};

const equationForGraph = (r: Rng): Q => {
  const family = r.pick(FAMILIES);
  const shapes = FAMILIES.map((f) => familyShape(r, f));
  const s = shapes[FAMILIES.indexOf(family)];
  const graph: GraphSpec = { ...grid(-6, 6, -8, 8), curves: s.curves.map((points) => ({ points })), description: `A graph showing ${s.words}.` };
  const others = shapes.filter((x) => x !== s).map((x) => x.eq);
  return choiceQ(r, [s.eq, ...others], {
    prompt: "Which equation could this be the graph of?",
    visual: { kind: "graph", graph },
    mc: Object.fromEntries(others.map((o) => [o, "graph-shape-mixup"])),
    hints: ["First decide the type: straight line, U/∩, S shape, or two separate curves.", "Then find the equation of that type."],
    solution: [`The graph is ${s.words}, so it is ${family === "Straight line" ? "a straight line" : `a ${family.toLowerCase()}`} graph.`, `The ${family.toLowerCase()} equation is ${s.eq}.`],
  });
};

const cubicTable = (r: Rng): Q => {
  const k = r.int(-5, 5);
  const ask = r.pick([-3, -2, -1, -2]);
  const y = ask ** 3 + k;
  const ks = k === 0 ? "" : k > 0 ? ` + ${k}` : ` − ${-k}`;
  return intQ(y, {
    prompt: `For y = x³${ks}, work out y when x = ${num(ask)}.`,
    wrong: [
      { value: -(ask ** 3) + k, misconception: "cubic-negative-cube" },
      { value: 3 * ask + k, misconception: "cubic-negative-cube" },
      { value: ask ** 2 + k, misconception: "cubic-negative-cube" },
    ],
    hints: [`x³ means x × x × x.`, `${br(ask)} × ${br(ask)} × ${br(ask)}: three negatives multiplied give a negative.`],
    solution: [`${br(ask)}³ = ${br(ask)} × ${br(ask)} × ${br(ask)} = ${num(ask ** 3)}`, `y = ${num(ask ** 3)}${ks}`, `y = ${num(y)}`],
  });
};

const reciprocalValue = (r: Rng): Q => {
  const a = r.pick([12, 24, 18, 6, 20]);
  const divisors = [1, 2, 3, 4, 6].filter((d) => a % d === 0 && d !== a);
  const x = r.pick(divisors) * (r.next() < 0.3 ? -1 : 1);
  const y = a / x;
  return intQ(y, {
    prompt: `For y = ${a}/x, work out y when x = ${num(x)}.`,
    wrong: [{ value: a * x, misconception: "recip-multiplied" }, { value: -y, misconception: "coord-sign" }],
    hints: [`${a}/x means ${a} ÷ x.`, `Work out ${a} ÷ ${br(x)}.`],
    solution: [`y = ${a} ÷ ${br(x)}`, `y = ${num(y)}`],
  });
};

const reciprocalZero = (r: Rng): Q => {
  const a = r.pick([1, 2, 4, 5, 10]);
  return choiceQ(r, ["x = 0", "x = 1", `x = ${a}`, "x = −1"], {
    prompt: `The graph of y = ${a}/x is drawn for many values of x. For which value of x is there no point on the graph?`,
    mc: { "x = 1": "graph-shape-mixup", [`x = ${a}`]: "graph-shape-mixup", "x = −1": "graph-shape-mixup" },
    hints: [`Try working out ${a} ÷ x for each one.`, "You can't divide by zero."],
    solution: [`${a} ÷ 0 can't be worked out: you can't divide by zero.`, "So the graph never touches the y-axis (where x = 0). It has two separate parts.", "Answer: x = 0"],
  });
};

const cubicReciprocal: Gen = (r, tier) => {
  if (tier === 1) return r.pick<Pick>([nameFromGraph, nameFromEquation, cubicTable, reciprocalValue])(r, 1);
  return r.pick<Pick>([equationForGraph, cubicTable, reciprocalValue, nameFromGraph, reciprocalZero])(r, 2);
};

// ================================================================ solving with graphs

const solveQuadEqualsK = (r: Rng): Q => {
  const Q = makeQuad(r, 4);
  const d = r.pick([1, 2, 3].filter((v) => v !== (Q.q - Q.p) / 2));
  const k = Q.f(Q.h + d);
  const g = quadGraph(Q);
  const ymax = Math.max(g.y.max, k + 2);
  const graph: GraphSpec = {
    ...g,
    y: { ...g.y, max: ymax, ...(ymax - g.y.min > 14 ? { labelStep: 2 } : {}) },
    curves: [...(g.curves ?? []), { points: [[g.x.min, k], [g.x.max, k]], dashed: true, label: { text: `y = ${num(k)}`, at: [g.x.min + 0.2, k + 0.5] } }],
    description: `${g.description} A dashed horizontal line y = ${num(k)} is also drawn.`,
  };
  const s1 = Q.h - d;
  const s2 = Q.h + d;
  const eq = `${quadRhs(Q.b, Q.c)} = ${num(k)}`;
  return {
    prompt: `The graph of y = ${quadRhs(Q.b, Q.c)} and the line y = ${num(k)} are drawn. Use them to solve ${eq}.`,
    visual: { kind: "graph", graph },
    answer: { kind: "list", value: [s1, s2], noun: "solutions" },
    wrongAnswers: [
      { value: [Q.p, Q.q], misconception: "solve-used-zero" },
      { value: [k], misconception: "solve-read-y" },
    ].filter((w) => !(w.value.length === 2 && w.value[0] === s1 && w.value[1] === s2)),
    answerHelp: "Type both solutions with a comma between, like −1, 3.",
    answerText: `x = ${num(s1)} or x = ${num(s2)}`,
    hints: [`The solutions are where the curve meets the line y = ${num(k)}.`, "Read the x-value at each crossing point."],
    solution: [`The curve and the line y = ${num(k)} cross at two points.`, `Their x-values are ${num(s1)} and ${num(s2)}.`, `x = ${num(s1)} or x = ${num(s2)}`],
  };
};

const solveQuadZero = (r: Rng): Q => {
  const Q = makeQuad(r);
  return {
    prompt: `Use the graph of y = ${quadRhs(Q.b, Q.c)} to solve ${quadRhs(Q.b, Q.c)} = 0.`,
    visual: { kind: "graph", graph: quadGraph(Q) },
    answer: { kind: "list", value: [Q.p, Q.q], noun: "solutions" },
    wrongAnswers: [...(Q.c !== Q.p && Q.c !== Q.q ? [{ value: [Q.c], misconception: "quad-roots-intercept" }] : []), { value: [-Q.p, -Q.q], misconception: "coord-sign" }].filter(
      (w) => !(w.value.length === 2 && w.value.every((v) => v === Q.p || v === Q.q)),
    ),
    answerHelp: "Type both solutions with a comma between, like −1, 3.",
    answerText: `x = ${num(Q.p)} or x = ${num(Q.q)}`,
    hints: ["= 0 means y = 0, which is the x-axis.", "Read the x-values where the curve crosses the x-axis."],
    solution: [`y = 0 on the x-axis. The curve crosses it at x = ${num(Q.p)} and x = ${num(Q.q)}.`, `So x = ${num(Q.p)} or x = ${num(Q.q)}`],
  };
};

const solveLinear = (r: Rng): Q => {
  const m = nonZero(r, -3, 3);
  const c = r.int(-4, 4);
  if (m === 1 && c === 0) return solveLinear(r);
  const xs = [-4, -3, -2, -1, 1, 2, 3, 4].filter((x) => Math.abs(m * x + c) <= 7 && m * x + c !== x);
  const x = r.pick(xs);
  const k = m * x + c;
  const graph: GraphSpec = {
    ...grid(-5, 5, -8, 8),
    curves: [{ points: linePoints(m, c, -5, 5), label: { text: lineEq(m, c), at: m > 0 ? [-4.8, 7] : [1.2, 7] } }],
    description: `The straight line ${lineEq(m, c)}.`,
  };
  return intQ(x, {
    prompt: `Use the graph of ${lineEq(m, c)} to solve ${lineRhs(m, c)} = ${num(k)}.`,
    visual: { kind: "graph", graph },
    wrong: [
      { value: k, misconception: "solve-read-y" },
      { value: m * k + c, misconception: "line-wrong-axis" },
    ],
    answerHelp: "Type the value of x, like 3 or x = 3.",
    hints: [`${lineRhs(m, c)} = ${num(k)} means y = ${num(k)}. Find ${num(k)} on the y-axis.`, "Go across to the line, then up or down to read x."],
    solution: [`Find y = ${num(k)} on the y-axis and go across to the line.`, `Read down (or up) to the x-axis: x = ${num(x)}.`, `Check: ${m === 1 ? "" : `${num(m)} × `}${br(x)}${c === 0 ? "" : c > 0 ? ` + ${c}` : ` − ${-c}`} = ${num(k)} ✓. x = ${num(x)}`],
  });
};

const solveSimultaneous = (r: Rng): Q => {
  let m1: number, m2: number, x: number, y: number;
  do {
    m1 = nonZero(r, -3, 3);
    m2 = nonZero(r, -3, 3);
    x = r.int(-3, 3);
    y = r.int(-4, 5);
  } while (m1 === m2 || x === y || Math.abs(y - m1 * x) > 7 || Math.abs(y - m2 * x) > 7);
  const c1 = y - m1 * x;
  const c2 = y - m2 * x;
  const graph: GraphSpec = {
    ...grid(-5, 5, -8, 8),
    curves: [
      { points: linePoints(m1, c1, -5, 5) },
      { points: linePoints(m2, c2, -5, 5), dashed: true },
    ],
    description: `Two straight lines, ${lineEq(m1, c1)} (solid) and ${lineEq(m2, c2)} (dashed), crossing at one point.`,
  };
  return pointQ([x, y], {
    prompt: `The lines ${lineEq(m1, c1)} (solid) and ${lineEq(m2, c2)} (dashed) are drawn. Use the graph to solve the simultaneous equations. Give x first, then y.`,
    visual: { kind: "graph", graph },
    wrong: [{ value: [y, x], misconception: "coord-swapped" }],
    answerHelp: "Type x then y with a comma between, like 2, −1 or x = 2, y = −1.",
    hints: ["Both equations are true where the two lines cross.", "Read the coordinates of the crossing point: x first."],
    solution: [`The lines cross at ${showPoint([x, y])}.`, `Check: put x = ${num(x)} into both equations. Each one gives y = ${num(y)} ✓.`, `x = ${num(x)}, y = ${num(y)}: ${showPoint([x, y])}`],
  });
};

const solveGraphically: Gen = (r, tier) => {
  if (tier === 1) return r.pick<Pick>([solveLinear, solveQuadZero, solveQuadEqualsK, solveLinear])(r, 1);
  return r.pick<Pick>([solveQuadEqualsK, solveSimultaneous, solveQuadZero, solveSimultaneous, solveLinear])(r, 2);
};

export const CURVE_GENERATORS: Record<string, Gen> = {
  "alg-quadratic-graphs": quadratic,
  "alg-cubic-reciprocal-graphs": cubicReciprocal,
  "alg-solve-graphically": solveGraphically,
};
