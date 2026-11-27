/**
 * Question generators for constructions and loci. Every construction picture
 * is computed exactly (arcs really meet where they're drawn to meet), so the
 * pictures can be trusted the way a careful drawing can.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher.
 */

import type { Rng } from "@/engine/random";
import type { PlaneSpec, Question, Visual } from "@/engine/types";

export type Tier = 1 | 2;
type Gen = (r: Rng, tier: Tier) => Omit<Question, "id" | "skillId">;
type Q = Omit<Question, "id" | "skillId">;
type P = [number, number];

const LETTERS = ["A", "B", "C", "D"];
const NUM_HELP = "Type a number, like 6. Units are fine but not needed.";
const deg = (n: number) => `${n}°`;
const rad = (d: number) => (d * Math.PI) / 180;
const dir = (d: number, len = 1, from: P = [0, 0]): P => [from[0] + len * Math.cos(rad(d)), from[1] + len * Math.sin(rad(d))];
const angleOf = (from: P, to: P) => (Math.atan2(to[1] - from[1], to[0] - from[0]) * 180) / Math.PI;
const dist = (a: P, b: P) => Math.hypot(a[0] - b[0], a[1] - b[1]);

function shuffle<T>(r: Rng, items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = r.int(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** A short construction arc of radius rr centred at c, around the direction of point `toward`. */
const arcToward = (c: P, rr: number, toward: P, spread = 16) => {
  const a = angleOf(c, toward);
  return { c, r: rr, from: a - spread, to: a + spread };
};

/** The window that holds all these points, with a margin. */
function windowFor(pts: P[], m = 1): { x: [number, number]; y: [number, number] } {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return { x: [Math.min(...xs) - m, Math.max(...xs) + m], y: [Math.min(...ys) - m, Math.max(...ys) + m] };
}

// ================================================================ construction pictures

/** Perpendicular bisector of AB (AB horizontal, length L), arcs of radius 0.7L. */
export function perpBisector(L: number, labels = true): PlaneSpec {
  const A: P = [0, 0];
  const B: P = [L, 0];
  const rr = 0.72 * L;
  const h = Math.sqrt(rr * rr - (L / 2) ** 2);
  const top: P = [L / 2, h];
  const bot: P = [L / 2, -h];
  return {
    ...windowFor([A, B, [L / 2, h + 0.6], [L / 2, -h - 0.6]], 0.8),
    lines: [
      { a: A, b: B },
      { a: [L / 2, -h - 0.5], b: [L / 2, h + 0.5], tone: "mirror" },
    ],
    arcs: [arcToward(A, rr, top), arcToward(A, rr, bot), arcToward(B, rr, top), arcToward(B, rr, bot)],
    points: labels ? [{ at: A, label: "A" }, { at: B, label: "B" }] : [{ at: A }, { at: B }],
    description: "A line AB with two arcs from A and two from B, crossing above and below the line. A line is drawn through the two crossing points.",
  };
}

/** Bisector of an angle of `size` degrees at B, first arm along the x-axis. */
export function angleBisector(size: number, labels = true): PlaneSpec {
  const B: P = [0, 0];
  const armLen = 6;
  const A = dir(0, armLen);
  const C = dir(size, armLen);
  const r1 = 2.6;
  const E1 = dir(0, r1);
  const E2 = dir(size, r1);
  const r2 = 2.2;
  // The second pair of arcs meets on the bisector.
  const half = dist(E1, E2) / 2;
  const mid: P = [(E1[0] + E2[0]) / 2, (E1[1] + E2[1]) / 2];
  const F = dir(size / 2, Math.hypot(...mid) + Math.sqrt(r2 * r2 - half * half));
  const end = dir(size / 2, armLen + 0.4);
  return {
    ...windowFor([B, A, C, end], 0.9),
    lines: [
      { a: B, b: A },
      { a: B, b: C },
      { a: B, b: end, tone: "mirror" },
    ],
    arcs: [{ c: B, r: r1, from: -8, to: size + 8 }, arcToward(E1, r2, F), arcToward(E2, r2, F)],
    points: labels ? [{ at: A, label: "A" }, { at: B, label: "B" }, { at: C, label: "C" }] : [],
    description: `An angle ABC of ${size}°. An arc from B crosses both arms; arcs from those two crossing points meet inside the angle, and a line from B goes through where they meet.`,
  };
}

/** Perpendicular from point P (above the line) to a horizontal line. */
export function perpFromPoint(d: number): PlaneSpec {
  const Pt: P = [0, d];
  const rr = d * 1.45;
  const w = Math.sqrt(rr * rr - d * d);
  const E1: P = [-w, 0];
  const E2: P = [w, 0];
  const r2 = rr;
  const k = Math.sqrt(r2 * r2 - w * w);
  const Q: P = [0, -k];
  return {
    ...windowFor([Pt, [-w - 1.5, 0], [w + 1.5, 0], Q], 0.8),
    lines: [
      { a: [-w - 1.6, 0], b: [w + 1.6, 0] },
      { a: [0, d + 0.4], b: [0, -k - 0.4], tone: "mirror" },
    ],
    arcs: [{ c: Pt, r: rr, from: angleOf(Pt, E1) - 12, to: angleOf(Pt, E2) + 12 }, arcToward(E1, r2, Q), arcToward(E2, r2, Q)],
    points: [{ at: Pt, label: "P" }],
    description: "A line with a point P above it. An arc from P cuts the line twice; arcs from those two points meet below the line, and a line from P goes through where they meet.",
  };
}

/** A 60° angle: arcs of radius AB from A and from B meet at C. */
export function sixty(L: number): PlaneSpec {
  const A: P = [0, 0];
  const B: P = [L, 0];
  const C = dir(60, L);
  return {
    ...windowFor([A, B, C], 0.9),
    lines: [
      { a: A, b: B },
      { a: A, b: dir(60, L + 0.8), tone: "mirror" },
    ],
    arcs: [
      { c: A, r: L, from: -6, to: 72 },
      { c: B, r: L, from: 108, to: 132 },
    ],
    points: [{ at: A, label: "A" }, { at: B, label: "B" }, { at: C, label: "C" }],
    description: "A line AB. An arc from A with radius AB, and an arc from B with the same radius, meet at C. A line goes from A through C.",
  };
}

/** Triangle ABC from three sides: AB = c along the bottom, AC = b, BC = a. */
export function sssTriangle(a: number, b: number, c: number, showC = true): { plane: PlaneSpec; C: P } {
  const A: P = [0, 0];
  const B: P = [c, 0];
  const x = (b * b - a * a + c * c) / (2 * c);
  const C: P = [x, Math.sqrt(b * b - x * x)];
  return {
    C,
    plane: {
      ...windowFor([A, B, C], 1.2),
      lines: showC
        ? [
            { a: A, b: B },
            { a: A, b: C },
            { a: B, b: C },
          ]
        : [{ a: A, b: B }],
      arcs: [arcToward(A, b, C, 14), arcToward(B, a, C, 14)],
      points: [{ at: A, label: "A" }, { at: B, label: "B" }, ...(showC ? [{ at: C, label: "C" }] : [])],
      lengths: [{ a: A, b: B, text: `${c} cm` }],
      description: `A line AB of ${c} cm, with an arc from A and an arc from B crossing above it${showC ? " at C, joined to make a triangle" : ""}.`,
    },
  };
}

const plane = (p: PlaneSpec): Visual => ({ kind: "plane", plane: p });

// ================================================================ constructions

const NAMES = ["Perpendicular bisector of a line", "Bisector of an angle", "Perpendicular from a point to a line", "A 60° angle"] as const;

function whichConstruction(r: Rng): Q {
  const k = r.int(0, 3);
  const pic = [perpBisector(r.int(5, 8), false), angleBisector(r.pick([50, 60, 70, 80, 100, 110])), perpFromPoint(r.int(2, 3)), sixty(r.int(5, 7))][k];
  pic.points = pic.points?.map((p) => ({ ...p, label: k === 2 ? p.label : undefined }));
  const options = shuffle(r, [...NAMES]);
  const correctIndex = options.indexOf(NAMES[k]);
  return {
    prompt: "Which construction is shown? (The construction arcs have been left in.)",
    visual: plane(pic),
    answer: { kind: "choice", options, correctIndex },
    wrongAnswers: options.map((_, i) => ({ value: i, misconception: "cons-which" })).filter((w) => w.value !== correctIndex),
    hints: ["Look at where the first arcs are drawn from: both ends of a line, one corner, or a point off the line?", ["Arcs from both ends of a line, crossing on both sides, give the perpendicular bisector.", "One arc from the corner, then two more arcs inside the angle, give the angle bisector.", "An arc from a point that cuts the line in two places gives the perpendicular from the point.", "Two arcs with the same radius as the line, meeting above it, make an equilateral triangle: a 60° angle."][k]],
    solution: [
      ["The arcs come from both ends of the line and cross above and below it.", "The first arc is drawn from the corner of the angle and crosses both arms.", "The first arc is drawn from the point and cuts the line twice.", "Arcs as long as AB from A and from B meet at C, making an equilateral triangle."][k],
      `So it's: ${NAMES[k].charAt(0).toLowerCase() + NAMES[k].slice(1)}.`,
    ],
  };
}

function bisectAngle(r: Rng, tier: Tier): Q {
  const size = tier === 1 ? 2 * r.int(15, 60) : 2 * r.int(16, 75);
  const half = size / 2;
  const wrong = [
    { value: size, misconception: "cons-not-halved" },
    { value: size * 2, misconception: "cons-doubled" },
  ];
  if (180 - size !== half && 180 - size > 0) wrong.push({ value: 180 - size, misconception: "cons-not-halved" });
  return {
    prompt: `Angle ABC is ${size}°. It is bisected with ruler and compasses. What size is each of the two smaller angles?`,
    visual: plane(angleBisector(size)),
    answer: { kind: "integer", value: half },
    answerHelp: NUM_HELP,
    wrongAnswers: wrong.filter((w, i, all) => w.value !== half && all.findIndex((o) => o.value === w.value) === i),
    hints: ["Bisect means cut into two equal parts.", `Work out ${size}° ÷ 2.`],
    solution: [`The bisector cuts the ${size}° angle into two equal angles.`, `${size}° ÷ 2 = ${half}°.`],
  };
}

function perpBisectorFacts(r: Rng, tier: Tier): Q {
  const L = 2 * r.int(3, tier === 1 ? 7 : 12);
  const pic = perpBisector(Math.min(L, 9));
  pic.texts = [{ at: [Math.min(L, 9) * 0.25, -0.45], text: `${L} cm` }];
  pic.points!.push({ at: [Math.min(L, 9) / 2, 0], label: "M" });
  const kind = tier === 1 ? r.pick(["mid", "mid", "angle"] as const) : r.pick(["mid", "angle", "equal"] as const);
  if (kind === "angle") {
    return {
      prompt: "The perpendicular bisector of AB crosses AB at M. What is the angle between the bisector and AB, in degrees?",
      visual: plane(pic),
      answer: { kind: "integer", value: 90 },
      answerHelp: NUM_HELP,
      wrongAnswers: [
        { value: 180, misconception: "cons-not-90" },
        { value: 45, misconception: "cons-not-90" },
        { value: 60, misconception: "cons-not-90" },
      ],
      hints: ["Perpendicular means at right angles."],
      solution: ["A perpendicular bisector is at right angles to the line.", "So the angle is 90°."],
    };
  }
  if (kind === "equal") {
    const pa = r.int(5, 15);
    const P: P = [Math.min(L, 9) / 2, 3.2];
    pic.points!.push({ at: P, label: "P" });
    pic.lines!.push({ a: [0, 0], b: P, dashed: true }, { a: [Math.min(L, 9), 0], b: P, dashed: true });
    pic.texts!.push({ at: [P[0] * 0.5 - 0.55, P[1] * 0.5 + 0.2], text: `${pa} cm` });
    pic.y[1] = Math.max(pic.y[1], 4.4);
    return {
      prompt: `P is a point on the perpendicular bisector of AB. PA = ${pa} cm. How long is PB, in cm?`,
      visual: plane(pic),
      answer: { kind: "integer", value: pa },
      answerHelp: NUM_HELP,
      wrongAnswers: [
        ...(pa % 2 === 0 ? [{ value: pa / 2, misconception: "cons-equidistant" }] : []),
        { value: 2 * pa, misconception: "cons-equidistant" },
        ...(L !== pa ? [{ value: L, misconception: "cons-equidistant" }] : []),
      ].filter((w) => w.value !== pa),
      hints: ["Every point on the perpendicular bisector is the same distance from A as from B."],
      solution: ["P is on the perpendicular bisector of AB, so P is the same distance from A and B.", `PB = PA = ${pa} cm.`],
    };
  }
  return {
    prompt: `AB is ${L} cm long. Its perpendicular bisector crosses AB at M. How long is AM, in cm?`,
    visual: plane(pic),
    answer: { kind: "integer", value: L / 2 },
    answerHelp: NUM_HELP,
    wrongAnswers: [
      { value: L, misconception: "cons-midpoint" },
      { value: 2 * L, misconception: "cons-midpoint" },
    ],
    hints: ["A bisector cuts the line into two equal halves, at its midpoint M."],
    solution: ["M is the midpoint of AB.", `AM = ${L} ÷ 2 = ${L / 2} cm.`],
  };
}

function sssCompass(r: Rng): Q {
  let a = 0;
  let b = 0;
  let c = 0;
  do {
    c = r.int(6, 10);
    a = r.int(4, 9);
    b = r.int(4, 9);
  } while (a === b || a === c || b === c || a + b <= c + 2 || Math.abs(a - b) >= c - 1);
  const { plane: pic } = sssTriangle(a, b, c, false);
  return {
    prompt: `You are constructing triangle ABC with AB = ${c} cm, AC = ${b} cm and BC = ${a} cm. AB is drawn. You draw an arc from A with radius ${b} cm. What radius, in cm, should the arc from B have?`,
    visual: plane(pic),
    answer: { kind: "integer", value: a },
    answerHelp: NUM_HELP,
    wrongAnswers: [
      { value: c, misconception: "cons-sss-radius" },
      { value: b, misconception: "cons-sss-radius" },
    ],
    hints: ["The arc from B is for the side that starts at B and goes to C.", `That side is BC.`],
    solution: [`The arc from B marks every point ${a} cm from B, because BC = ${a} cm.`, `Where it crosses the arc from A is C. So the radius is ${a} cm.`],
  };
}

function sixtyAngle(r: Rng): Q {
  const L = r.int(5, 8);
  return {
    prompt: `AB is ${L} cm. An arc from A and an arc from B, both with radius ${L} cm, meet at C. What is the size of angle CAB, in degrees?`,
    visual: plane(sixty(L)),
    answer: { kind: "integer", value: 60 },
    answerHelp: NUM_HELP,
    wrongAnswers: [
      { value: 90, misconception: "cons-equilateral" },
      { value: 45, misconception: "cons-equilateral" },
      { value: 30, misconception: "cons-equilateral" },
    ],
    hints: [`AC, BC and AB are all ${L} cm. What kind of triangle is ABC?`, "Every angle in an equilateral triangle is the same, and they add up to 180°."],
    solution: [`AC = BC = AB = ${L} cm, so ABC is equilateral.`, "Each angle is 180° ÷ 3 = 60°."],
  };
}

function nextStep(r: Rng): Q {
  const which = r.pick(["angle", "line"] as const);
  const right =
    which === "angle"
      ? "Draw two arcs, the same width, from where the first arc crosses each arm"
      : "Without changing the compass, draw arcs from B that cross the arcs from A";
  const wrongs = [
    { text: which === "angle" ? "Draw a line from B to the middle of the arc, by eye" : "Mark the middle of AB by eye", misconception: "cons-by-eye" },
    { text: which === "angle" ? "Change the compass width for the second arc" : "Make the compass smaller, then draw arcs from B", misconception: "cons-compass-change" },
    { text: which === "angle" ? "Measure the angle with a protractor and halve it" : "Measure AB with a ruler and halve it", misconception: "cons-protractor" },
  ];
  const options = shuffle(r, [right, ...wrongs.map((w) => w.text)]);
  const correctIndex = options.indexOf(right);
  const pic = which === "angle" ? angleBisector(r.pick([60, 70, 80, 100])) : perpBisector(r.int(6, 8));
  if (which === "angle") {
    pic.arcs = pic.arcs!.slice(0, 1);
    pic.lines = pic.lines!.slice(0, 2);
  } else {
    pic.arcs = pic.arcs!.slice(0, 2);
    pic.lines = pic.lines!.slice(0, 1);
  }
  return {
    prompt:
      which === "angle"
        ? "You are bisecting angle ABC. You have drawn an arc from B that crosses both arms. What do you do next?"
        : "You are drawing the perpendicular bisector of AB. You opened the compass to more than half of AB and drew arcs from A above and below the line. What do you do next?",
    visual: plane(pic),
    answer: { kind: "choice", options, correctIndex },
    wrongAnswers: wrongs.map((w) => ({ value: options.indexOf(w.text), misconception: w.misconception })),
    hints: ["A construction uses only a ruler and compasses, and every point comes from arcs crossing.", "Matching arcs need the same compass width."],
    solution: [`Next: ${right.charAt(0).toLowerCase() + right.slice(1)}.`, which === "angle" ? "Where those arcs cross, draw a line from B through it: that's the bisector." : "Join the two crossing points with a ruler: that's the perpendicular bisector."],
  };
}

const constructions: Gen = (r, tier) => {
  const roll = r.next();
  if (tier === 1) {
    if (roll < 0.3) return whichConstruction(r);
    if (roll < 0.55) return bisectAngle(r, tier);
    if (roll < 0.8) return perpBisectorFacts(r, tier);
    return sssCompass(r);
  }
  if (roll < 0.18) return whichConstruction(r);
  if (roll < 0.34) return bisectAngle(r, tier);
  if (roll < 0.52) return perpBisectorFacts(r, tier);
  if (roll < 0.66) return sssCompass(r);
  if (roll < 0.8) return sixtyAngle(r);
  return nextStep(r);
};

// ================================================================ loci pictures

/** Points within (or exactly) d of P: a circle. */
export function locusCircle(d: number, filled: boolean): PlaneSpec {
  const pts = Array.from({ length: 72 }, (_, i) => dir(i * 5, d));
  return {
    x: [-d - 1, d + 1],
    y: [-d - 1, d + 1],
    shapes: filled ? [{ points: pts, tone: "region" }] : [],
    arcs: [{ c: [0, 0], r: d, dashed: !filled }],
    points: [{ at: [0, 0], label: "P" }],
    description: `A circle with centre P and radius ${d}${filled ? ", shaded inside" : ""}.`,
  };
}

/** Points within d of a segment of length L: a stadium. */
export function locusStadium(L: number, d: number): PlaneSpec {
  const pts: P[] = [];
  for (let a = -90; a <= 90; a += 6) pts.push(dir(a, d, [L, 0]));
  for (let a = 90; a <= 270; a += 6) pts.push(dir(a, d, [0, 0]));
  return {
    x: [-d - 1, L + d + 1],
    y: [-d - 1, d + 1],
    shapes: [{ points: pts, tone: "region" }],
    lines: [
      { a: [0, 0], b: [L, 0], tone: "mirror" },
      { a: [0, d], b: [L, d] },
      { a: [0, -d], b: [L, -d] },
    ],
    arcs: [
      { c: [L, 0], r: d, from: -90, to: 90 },
      { c: [0, 0], r: d, from: 90, to: 270 },
    ],
    description: `A straight line, with the region within ${d} of it shaded: straight sides parallel to the line, and a semicircle round each end.`,
  };
}

function lociPanels(): { label: string; visual: Visual }[] {
  const L = 4;
  const twoPts: PlaneSpec = {
    x: [-1, L + 1],
    y: [-3, 3],
    lines: [{ a: [L / 2, -2.6], b: [L / 2, 2.6], tone: "mirror" }],
    points: [{ at: [0, 0], label: "A" }, { at: [L, 0], label: "B" }],
    description: "Two points A and B, with a line crossing halfway between them at right angles.",
  };
  const bis = angleBisector(60, false);
  bis.arcs = [];
  const stad = locusStadium(4, 1.5);
  const circ = locusCircle(2.5, false);
  return [circ, twoPts, bis, stad].map((p, i) => ({ label: LETTERS[i], visual: plane(p) }));
}

const LOCUS_RULES = [
  { rule: "the points exactly 3 m from a post P", misconception: "loci-circle", reason: "Points a fixed distance from one point make a circle round it." },
  { rule: "the points the same distance from A as from B", misconception: "loci-two-points", reason: "Points the same distance from two points lie on the perpendicular bisector of the line joining them." },
  { rule: "the points the same distance from two straight fences that meet at a corner", misconception: "loci-two-lines", reason: "Points the same distance from two lines that meet lie on the angle bisector." },
  { rule: "the points less than 2 m from a straight wall", misconception: "loci-line-ends", reason: "Within a distance of a wall: parallel sides, and a semicircle round each end." },
];

function whichLocus(r: Rng): Q {
  const k = r.int(0, 3);
  const base = lociPanels();
  const order = shuffle(r, [0, 1, 2, 3]);
  const panels = order.map((i, j) => ({ label: LETTERS[j], visual: base[i].visual }));
  const correctIndex = order.indexOf(k);
  return {
    prompt: `Which drawing shows ${LOCUS_RULES[k].rule}?`,
    visual: { kind: "panels", panels, description: "Four drawings, A to D: a circle round a point; a line halfway between two points; a line splitting an angle; a shaded strip round a line with rounded ends." },
    answer: { kind: "choice", options: LETTERS, correctIndex },
    wrongAnswers: LETTERS.map((_, i) => ({ value: i, misconception: LOCUS_RULES[k].misconception })).filter((w) => w.value !== correctIndex),
    hints: ["Imagine marking lots of points that follow the rule, then join them up.", LOCUS_RULES[k].reason],
    solution: [LOCUS_RULES[k].reason, `That's drawing ${LETTERS[correctIndex]}.`],
  };
}

function goatReach(r: Rng): Q {
  const rope = r.int(3, 5);
  let Q: P = [0, 0];
  let d = 0;
  // Half the time, a point that counts as close if you count squares across and up separately.
  const trap = r.next() < 0.5;
  for (let k = 0; k < 500; k++) {
    Q = [r.int(-rope, rope), r.int(-rope, rope)];
    d = Math.hypot(...Q);
    const ok = Math.abs(d - rope) >= 0.35 && d > 0.9;
    if (!ok) continue;
    if (trap && d > rope && Math.max(Math.abs(Q[0]), Math.abs(Q[1])) <= rope) break;
    if (!trap) break;
  }
  const can = d < rope;
  const options = ["Yes", "No"];
  const correctIndex = can ? 0 : 1;
  const pic: PlaneSpec = {
    x: [-rope - 1, rope + 1],
    y: [-rope - 1, rope + 1],
    grid: true,
    points: [{ at: [0, 0], label: "P" }, { at: Q, label: "Q" }],
    description: `A grid of 1 m squares. The post P is at the centre. Point Q is ${Math.abs(Q[0])} squares ${Q[0] >= 0 ? "right" : "left"} and ${Math.abs(Q[1])} squares ${Q[1] >= 0 ? "up" : "down"} from P.`,
  };
  const sq = Q[0] * Q[0] + Q[1] * Q[1];
  return {
    prompt: `A goat is tied to post P with a rope ${rope} m long. Each square is 1 m. Can the goat reach point Q?`,
    visual: plane(pic),
    answer: { kind: "choice", options, correctIndex },
    wrongAnswers: [{ value: 1 - correctIndex, misconception: !can && Math.max(Math.abs(Q[0]), Math.abs(Q[1])) <= rope ? "loci-square" : "loci-circle" }],
    hints: [`The goat can reach every point less than ${rope} m from P: a circle, not a square.`, `Find the straight-line distance PQ with Pythagoras: √(${Math.abs(Q[0])}² + ${Math.abs(Q[1])}²).`],
    solution: [`PQ = √(${Math.abs(Q[0])}² + ${Math.abs(Q[1])}²) = √${sq} = ${d.toFixed(2)} m.`, can ? `That's less than ${rope} m, so yes, the goat can reach Q.` : `That's more than ${rope} m, so no, the goat can't reach Q.`],
  };
}

function closerTo(r: Rng): Q {
  let Q: P = [0, 0];
  const A: P = [r.int(1, 3), r.int(1, 6)];
  let B: P = A;
  while (dist(A, B) < 3) B = [r.int(4, 8), r.int(1, 6)];
  let dA = 0;
  let dB = 0;
  do {
    Q = [r.int(0, 9), r.int(0, 7)];
    dA = dist(A, Q);
    dB = dist(B, Q);
  } while (Math.abs(dA - dB) < 0.6 || dist(Q, A) < 1 || dist(Q, B) < 1);
  const options = ["A", "B"];
  const correctIndex = dA < dB ? 0 : 1;
  const mid: P = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
  const dx = B[0] - A[0];
  const dy = B[1] - A[1];
  const n = Math.hypot(dx, dy);
  const ux = -dy / n;
  const uy = dx / n;
  const pic: PlaneSpec = {
    x: [-0.5, 9.5],
    y: [-0.5, 7.5],
    grid: true,
    lines: [{ a: [mid[0] - ux * 12, mid[1] - uy * 12], b: [mid[0] + ux * 12, mid[1] + uy * 12], dashed: true, tone: "mirror" }],
    points: [{ at: A, label: "A" }, { at: B, label: "B" }, { at: Q, label: "Q", hollow: true }],
    description: `A grid with points A, B and Q. The dashed line is the perpendicular bisector of AB.`,
  };
  // Keep the bisector inside the picture.
  const clip = (t: number): P => [mid[0] + ux * t, mid[1] + uy * t];
  const ts = [-12, 12].map((s) => {
    let t = s;
    while (t !== 0) {
      const p = clip(t);
      if (p[0] >= -0.5 && p[0] <= 9.5 && p[1] >= -0.5 && p[1] <= 7.5) break;
      t -= Math.sign(t) * 0.05;
    }
    return clip(t);
  });
  pic.lines = [{ a: ts[0], b: ts[1], dashed: true, tone: "mirror" }];
  return {
    prompt: "The dashed line is the perpendicular bisector of AB. Is point Q closer to A or to B?",
    visual: plane(pic),
    answer: { kind: "choice", options, correctIndex },
    wrongAnswers: [{ value: 1 - correctIndex, misconception: "loci-closer-side" }],
    hints: ["Points on the bisector are the same distance from A and B.", "Which side of the dashed line is Q on?"],
    solution: [`Q is on ${options[correctIndex]}'s side of the bisector.`, `So Q is closer to ${options[correctIndex]}.`],
  };
}

function lociScale(r: Rng): Q {
  const per = r.pick([2, 5, 10, 20, 50]);
  const cm = r.int(2, 9);
  const real = per * cm;
  const unit = per >= 10 ? "km" : "m";
  return {
    prompt: `A radio mast's signal reaches ${real} ${unit} in every direction. On a map, 1 cm stands for ${per} ${unit}. What radius, in cm, should the circle on the map have?`,
    visual: plane(locusCircle(3, true)),
    answer: { kind: "integer", value: cm },
    answerHelp: NUM_HELP,
    wrongAnswers: [
      { value: real * per, misconception: "loci-scale" },
      { value: real, misconception: "loci-scale" },
    ].filter((w) => w.value !== cm),
    hints: [`Every 1 cm on the map is ${per} ${unit} in real life.`, `How many lots of ${per} are in ${real}?`],
    solution: [`${real} ÷ ${per} = ${cm}.`, `So the circle has radius ${cm} cm on the map.`],
  };
}

function wallShape(r: Rng): Q {
  const d = r.int(1, 3);
  const L = r.int(4, 8);
  const right = "A rectangle with a semicircle on each end";
  const opts = [
    { text: "A rectangle", misconception: "loci-line-ends" },
    { text: "A circle", misconception: "loci-circle" },
    { text: "Two straight lines only", misconception: "loci-line-ends" },
  ];
  const options = shuffle(r, [right, ...opts.map((o) => o.text)]);
  const pic: PlaneSpec = { x: [-d - 1, L + d + 1], y: [-d - 1, d + 1], grid: true, lines: [{ a: [0, 0], b: [L, 0], tone: "mirror" }], description: `A straight wall ${L} m long on a grid of 1 m squares.` };
  return {
    prompt: `A dog must stay less than ${d} m from a straight wall ${L} m long. Which describes the shape of the region where the dog can be?`,
    visual: plane(pic),
    answer: { kind: "choice", options, correctIndex: options.indexOf(right) },
    wrongAnswers: opts.map((o) => ({ value: options.indexOf(o.text), misconception: o.misconception })),
    hints: ["Along the wall, the edge of the region is parallel to it.", "Beyond each end, the nearest part of the wall is the end point, so the edge curves round it."],
    solution: [`Beside the wall: straight edges ${d} m away. Round each end: a semicircle of radius ${d} m.`, "So it's a rectangle with a semicircle on each end."],
  };
}

const loci: Gen = (r, tier) => {
  const roll = r.next();
  if (tier === 1) {
    if (roll < 0.35) return whichLocus(r);
    if (roll < 0.65) return closerTo(r);
    if (roll < 0.85) return goatReach(r);
    return lociScale(r);
  }
  if (roll < 0.22) return whichLocus(r);
  if (roll < 0.42) return closerTo(r);
  if (roll < 0.66) return goatReach(r);
  if (roll < 0.84) return lociScale(r);
  return wallShape(r);
};

export const CONSTRUCTION_GENERATORS: Record<string, Gen> = {
  "geo-constructions": constructions,
  "geo-loci": loci,
};
