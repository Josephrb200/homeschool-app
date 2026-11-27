/**
 * Question generators for perimeter, circles, and volume and surface area.
 *
 * Every question comes with a diagram drawn to scale. Circle answers are
 * rounded to 1 decimal place; marking also accepts answers from π = 3.14.
 * Sloping lengths come from Pythagorean triples so every label is a whole number.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher.
 */

import { equals, frac, type Fraction } from "@/engine/fraction";
import { decimalTolerance, roundTo } from "@/engine/marking";
import type { Rng } from "@/engine/random";
import type { CirclePart, Question, ShapeSpec, SolidSpec } from "@/engine/types";
import { num } from "../area/generators";

export type Tier = 1 | 2;
type Gen = (r: Rng, tier: Tier) => Omit<Question, "id" | "skillId">;

const PI = Math.PI;
const DP = 1;
const r1 = (x: number) => roundTo(x, DP);

function unitFor(r: Rng, tier: Tier): "cm" | "m" {
  return tier === 1 ? "cm" : r.next() < 0.5 ? "cm" : "m";
}

/** Drop exact wrong answers equal to the right one, and duplicates. */
function cleanWrong(correct: Fraction, wrong: { value: Fraction; misconception: string }[]) {
  const seen: Fraction[] = [];
  return wrong.filter((w) => {
    if (equals(w.value, correct) || seen.some((s) => equals(s, w.value))) return false;
    seen.push(w.value);
    return true;
  });
}

/** Drop rounded wrong answers that would be accepted as right, or that are too close to each other. */
function cleanWrongDecimal(exact: number, wrong: { value: number; misconception: string }[]) {
  const kept: { value: number; misconception: string }[] = [];
  for (const w of wrong) {
    const near = (a: number, b: number) => Math.abs(a - b) <= decimalTolerance(a, DP) + decimalTolerance(b, DP);
    if (near(w.value, exact) || kept.some((k) => near(k.value, w.value))) continue;
    kept.push(w);
  }
  return kept;
}

const rectPoints = (w: number, h: number): [number, number][] => [
  [0, 0],
  [w, 0],
  [w, h],
  [0, h],
];

const lPoints = (W: number, H: number, cw: number, ch: number): [number, number][] => [
  [0, 0],
  [W, 0],
  [W, H - ch],
  [W - cw, H - ch],
  [W - cw, H],
  [0, H],
];

// ================================================================ perimeter

const perimeter: Gen = (r, tier) => {
  const u = unitFor(r, tier);
  const roll = r.next();

  // Tier 2: find a missing length from the perimeter.
  if (tier === 2 && roll < 0.3) {
    const l = r.int(5, 15);
    const w = r.int(2, l - 1);
    const P = 2 * (l + w);
    const shape: ShapeSpec = {
      points: rectPoints(l, w),
      sides: [
        { i: 0, text: `? ${u}` },
        { i: 3, text: `${w} ${u}` },
      ],
      right: [[0, 0]],
      description: `A rectangle with an unknown length and a width of ${w} ${u}. Its perimeter is ${P} ${u}.`,
    };
    return {
      prompt: `This rectangle has a perimeter of ${P} ${u}. Its width is ${w} ${u}. How long is it, in ${u}?`,
      visual: { kind: "shape", shape },
      answer: { kind: "integer", value: l },
      wrongAnswers: cleanWrong(frac(l), [
        { value: frac(P - 2 * w), misconception: "perim-reverse-forgot-halve" },
        { value: frac(P - w), misconception: "perim-reverse-subtract-once" },
      ]),
      hints: [`The perimeter is length + width + length + width. Half of it is one length + one width.`, `Half of ${P} is ${P / 2}. Take away the width, ${w}.`],
      solution: [`Half the perimeter = one length + one width: ${P} ÷ 2 = ${P / 2}.`, `Length = ${P / 2} − ${w} = ${l} ${u}.`],
    };
  }

  // Tier 1: rectangles with two labels.
  if (tier === 1 && roll < 0.5) {
    const w = r.int(3, 12);
    const h = r.int(2, 9);
    const shape: ShapeSpec = {
      points: rectPoints(w, h),
      sides: [
        { i: 0, text: `${w} ${u}` },
        { i: 3, text: `${h} ${u}` },
      ],
      right: [[0, 0]],
      description: `A rectangle ${w} ${u} long and ${h} ${u} wide. Only two sides are labelled.`,
    };
    const P = 2 * (w + h);
    return {
      prompt: `Find the perimeter of this rectangle. Give your answer in ${u}.`,
      visual: { kind: "shape", shape },
      answer: { kind: "integer", value: P },
      wrongAnswers: cleanWrong(frac(P), [
        { value: frac(w + h), misconception: "perim-only-labelled" },
        { value: frac(w * h), misconception: "perim-used-area" },
      ]),
      hints: [`A rectangle has four sides. The two you can't see a number on match the ones opposite.`, `Add all four: ${w} + ${h} + ${w} + ${h}.`],
      solution: [`Opposite sides are equal, so the sides are ${w}, ${h}, ${w} and ${h}.`, `Perimeter = ${w} + ${h} + ${w} + ${h}`, `= ${P} ${u}`],
    };
  }

  // L-shapes. Tier 1: every side labelled. Tier 2: two sides missing.
  const W = tier === 1 ? r.int(6, 11) : r.int(8, 16);
  const H = tier === 1 ? r.int(5, 9) : r.int(7, 14);
  const cw = r.int(2, W - 3);
  const ch = r.int(2, H - 3);
  const len = [W, H - ch, cw, ch, W - cw, H];
  const P = 2 * (W + H);
  const A = W * H - cw * ch;
  const labelSet = tier === 1 ? [0, 1, 2, 3, 4, 5] : r.next() < 0.5 ? [0, 1, 4, 5] : [0, 2, 3, 5];
  const shape: ShapeSpec = {
    points: lPoints(W, H, cw, ch),
    sides: labelSet.map((i) => ({ i, text: `${len[i]} ${u}` })),
    description:
      `An L-shape with all corners right angles. Going round from the bottom: ` +
      len.map((l, i) => (labelSet.includes(i) ? `${l} ${u}` : "a side with no label")).join(", ") +
      ".",
  };
  const labelledSum = labelSet.reduce((s, i) => s + len[i], 0);
  if (tier === 1) {
    return {
      prompt: `Find the perimeter of this shape. Give your answer in ${u}.`,
      visual: { kind: "shape", shape },
      answer: { kind: "integer", value: P },
      wrongAnswers: cleanWrong(frac(P), [{ value: frac(A), misconception: "perim-used-area" }]),
      hints: [`Start at one corner and go all the way round, adding each side.`, `There are 6 sides: ${len.join(" + ")}.`],
      solution: [`Add all six sides:`, `${len.join(" + ")}`, `= ${P} ${u}`],
    };
  }
  const missing = [0, 1, 2, 3, 4, 5].filter((i) => !labelSet.includes(i));
  const how =
    missing[0] === 2
      ? [`The missing across side = ${W} − ${W - cw} = ${cw}.`, `The missing up side = ${H} − ${H - ch} = ${ch}.`]
      : [`The top side = ${W} − ${cw} = ${W - cw}.`, `The lower right side = ${H} − ${ch} = ${H - ch}.`];
  return {
    prompt: `Find the perimeter of this shape. Give your answer in ${u}.`,
    visual: { kind: "shape", shape },
    answer: { kind: "integer", value: P },
    wrongAnswers: cleanWrong(frac(P), [
      { value: frac(labelledSum), misconception: "perim-only-labelled" },
      { value: frac(A), misconception: "perim-used-area" },
    ]),
    hints: [
      `Two sides have no number. Use the long sides to work them out.`,
      missing[0] === 2 ? `The across sides at the top must add up to the bottom, ${W}.` : `The two top sides add up to the bottom, ${W}. The two right sides add up to the left, ${H}.`,
    ],
    solution: [...how, `Perimeter = ${len.join(" + ")} = ${P} ${u}`],
  };
};

// ================================================================ circles: parts

const PART_NAMES: Record<CirclePart, string> = {
  centre: "Centre",
  radius: "Radius",
  diameter: "Diameter",
  chord: "Chord",
  tangent: "Tangent",
  arc: "Arc",
  sector: "Sector",
  segment: "Segment",
  circumference: "Circumference",
};

const PART_DESCRIPTIONS: Record<CirclePart, string> = {
  centre: "A circle with a dot marked at the exact middle.",
  radius: "A circle with one straight line highlighted, from the centre to the edge.",
  diameter: "A circle with one straight line highlighted, going from edge to edge through the centre.",
  chord: "A circle with one straight line highlighted, going from edge to edge but not through the centre.",
  circumference: "A circle with its whole outside edge highlighted.",
  tangent: "A circle with one straight line highlighted outside it, just touching the edge at one point.",
  arc: "A circle with a curved piece of its edge highlighted.",
  sector: "A circle with a slice highlighted, like a slice of pizza, between two lines from the centre and the edge.",
  segment: "A circle with the piece cut off by a straight line across it highlighted. It doesn't reach the centre.",
};

/** Which wrong name points to which misconception. */
const CONFUSIONS: Partial<Record<CirclePart, Partial<Record<CirclePart, string>>>> = {
  radius: { diameter: "circle-radius-diameter" },
  diameter: { radius: "circle-radius-diameter", chord: "circle-chord-diameter" },
  chord: { diameter: "circle-chord-diameter", tangent: "circle-tangent-chord" },
  tangent: { chord: "circle-tangent-chord" },
  sector: { segment: "circle-sector-segment" },
  segment: { sector: "circle-sector-segment" },
  arc: { circumference: "circle-arc-circumference" },
  circumference: { arc: "circle-arc-circumference" },
};

function shuffle<T>(r: Rng, items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = r.int(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const circleParts: Gen = (r, tier) => {
  if (r.next() < (tier === 1 ? 0.3 : 0.4)) {
    // Radius ↔ diameter.
    const u = unitFor(r, tier);
    if (r.next() < 0.5) {
      const rad = r.int(2, tier === 1 ? 12 : 30);
      return {
        prompt: `The radius of this circle is ${rad} ${u}. What is its diameter, in ${u}?`,
        visual: { kind: "circle", circle: { parts: [{ part: "radius", text: `${rad} ${u}` }], description: `A circle with its radius labelled ${rad} ${u}.` } },
        answer: { kind: "integer", value: 2 * rad },
        wrongAnswers: cleanWrong(frac(2 * rad), [{ value: frac(rad, 2), misconception: "circle-radius-diameter" }]),
        hints: [`The diameter goes all the way across, through the centre. That's two radii end to end.`, `Diameter = 2 × ${rad}.`],
        solution: [`Diameter = 2 × radius`, `= 2 × ${rad} = ${2 * rad} ${u}`],
      };
    }
    const d = 2 * r.int(2, tier === 1 ? 10 : 25);
    return {
      prompt: `The diameter of this circle is ${d} ${u}. What is its radius, in ${u}?`,
      visual: { kind: "circle", circle: { parts: [{ part: "diameter", text: `${d} ${u}` }], description: `A circle with its diameter labelled ${d} ${u}.` } },
      answer: { kind: "integer", value: d / 2 },
      wrongAnswers: cleanWrong(frac(d / 2), [{ value: frac(2 * d), misconception: "circle-radius-diameter" }]),
      hints: [`The radius only goes from the centre to the edge: half way across.`, `Radius = ${d} ÷ 2.`],
      solution: [`Radius = diameter ÷ 2`, `= ${d} ÷ 2 = ${d / 2} ${u}`],
    };
  }

  const pool: CirclePart[] = tier === 1 ? ["centre", "radius", "diameter", "chord", "circumference"] : ["radius", "diameter", "chord", "tangent", "arc", "sector", "segment", "circumference"];
  const part = r.pick(pool);
  const allNames: CirclePart[] = ["centre", "radius", "diameter", "chord", "tangent", "arc", "sector", "segment", "circumference"];
  const partners = Object.keys(CONFUSIONS[part] ?? {}) as CirclePart[];
  const others = shuffle(
    r,
    allNames.filter((p) => p !== part && !partners.includes(p) && (tier === 2 || pool.includes(p) || p === "tangent")),
  );
  const distractors = [...partners, ...others].slice(0, 3);
  const options = shuffle(r, [part, ...distractors]);
  const correctIndex = options.indexOf(part);
  return {
    prompt: `What is the highlighted part of the circle called?`,
    visual: { kind: "circle", circle: { parts: [{ part }], highlight: part, description: PART_DESCRIPTIONS[part] } },
    answer: { kind: "choice", options: options.map((p) => PART_NAMES[p]), correctIndex },
    wrongAnswers: options
      .map((p, i) => ({ value: i, misconception: CONFUSIONS[part]?.[p] ?? "circle-part-names" }))
      .filter((w) => w.value !== correctIndex),
    hints: [
      `Is it a line, a curve or a region? Does it go through or start at the centre?`,
      {
        centre: "It's the point exactly in the middle.",
        radius: "It starts at the centre and stops at the edge.",
        diameter: "It's straight, goes edge to edge, and passes through the centre.",
        chord: "It's straight and goes edge to edge, but misses the centre.",
        circumference: "It's the whole distance round the outside.",
        tangent: "It's outside the circle and touches it at just one point.",
        arc: "It's curved, and only part of the edge.",
        sector: "It's a region with a point at the centre, like a slice of cake.",
        segment: "It's a region cut off by a straight line, with no point at the centre.",
      }[part],
    ],
    solution: [`${PART_DESCRIPTIONS[part].replace(/^A circle with /, "This shows ").replace(/\.$/, "")}.`, `That part is called the ${PART_NAMES[part].toLowerCase()}.`],
  };
};

// ================================================================ circles: circumference

const circumference: Gen = (r, tier) => {
  const u = unitFor(r, tier);
  const roll = r.next();

  if (tier === 2 && roll < 0.3) {
    // Reverse: circumference given, find the diameter.
    const d = r.int(3, 30);
    const C = Number(r1(PI * d));
    const exact = C / PI;
    return {
      prompt: `A circle has a circumference of ${r1(C)} ${u}. Find its diameter. Give your answer to 1 decimal place.`,
      visual: { kind: "circle", circle: { parts: [{ part: "diameter", text: `? ${u}` }], description: `A circle with an unknown diameter. Its circumference is ${r1(C)} ${u}.` } },
      answer: { kind: "decimal", exact, dp: DP },
      wrongAnswers: cleanWrongDecimal(exact, [
        { value: C / (2 * PI), misconception: "circle-reverse-radius" },
        { value: C * PI, misconception: "circle-reverse-multiplied" },
      ]),
      hints: [`C = π × d. Here you know C, so undo × π.`, `d = ${r1(C)} ÷ π. Use the π button on your calculator.`],
      solution: [`C = π × d, so d = C ÷ π.`, `d = ${r1(C)} ÷ π = ${exact.toFixed(3)}…`, `= ${r1(exact)} ${u} (1 d.p.)`],
    };
  }

  const useRadius = tier === 2 && roll < 0.7;
  if (useRadius) {
    const rad = r.int(2, 25);
    const exact = 2 * PI * rad;
    return {
      prompt: `Find the circumference of this circle. Give your answer to 1 decimal place.`,
      visual: { kind: "circle", circle: { parts: [{ part: "radius", text: `${rad} ${u}` }], description: `A circle with radius ${rad} ${u}.` } },
      answer: { kind: "decimal", exact, dp: DP },
      wrongAnswers: cleanWrongDecimal(exact, [
        { value: PI * rad, misconception: "circle-radius-in-pi-d" },
        { value: PI * rad * rad, misconception: "circle-used-area-formula" },
      ]),
      hints: [`This gives the radius. C = π × d needs the diameter, so double it first.`, `d = 2 × ${rad} = ${2 * rad}. Now work out π × ${2 * rad}.`],
      solution: [`Diameter = 2 × ${rad} = ${2 * rad} ${u}.`, `C = π × d = π × ${2 * rad} = ${exact.toFixed(3)}…`, `= ${r1(exact)} ${u} (1 d.p.)`],
    };
  }

  const d = tier === 1 ? r.int(2, 20) : r.int(5, 40);
  const exact = PI * d;
  return {
    prompt: `Find the circumference of this circle. Give your answer to 1 decimal place.`,
    visual: { kind: "circle", circle: { parts: [{ part: "diameter", text: `${d} ${u}` }], description: `A circle with diameter ${d} ${u}.` } },
    answer: { kind: "decimal", exact, dp: DP },
    wrongAnswers: cleanWrongDecimal(exact, [
      { value: 2 * PI * d, misconception: "circle-diameter-as-radius" },
      { value: PI * (d / 2) * (d / 2), misconception: "circle-used-area-formula" },
      { value: PI * d * d, misconception: "circle-used-area-formula" },
    ]),
    hints: [`Circumference = π × diameter. The diameter here is ${d}.`, `Press π × ${d} on your calculator, then round to 1 decimal place.`],
    solution: [`C = π × d`, `= π × ${d} = ${exact.toFixed(3)}…`, `= ${r1(exact)} ${u} (1 d.p.)`],
  };
};

// ================================================================ circles: area

const circleArea: Gen = (r, tier) => {
  const u = unitFor(r, tier);
  const useDiameter = tier === 2 && r.next() < 0.5;
  // Radius 2 is avoided: π × 2² = 2 × π × 2, so a circumference answer would look right.
  const rad = useDiameter ? r.int(3, 15) : tier === 1 ? r.int(3, 12) : r.int(3, 25);
  const exact = PI * rad * rad;
  const label = useDiameter ? { part: "diameter" as const, text: `${2 * rad} ${u}` } : { part: "radius" as const, text: `${rad} ${u}` };
  const wrong = [
    { value: 2 * PI * rad, misconception: "circle-used-circumference" },
    { value: (PI * rad) ** 2, misconception: "circle-squared-pi" },
    { value: PI * 2 * rad, misconception: "circle-used-circumference" },
  ];
  if (useDiameter) wrong.unshift({ value: PI * (2 * rad) ** 2, misconception: "circle-diameter-as-radius" });
  return {
    prompt: `Find the area of this circle. Give your answer to 1 decimal place.`,
    visual: {
      kind: "circle",
      circle: { parts: [label], description: useDiameter ? `A circle with diameter ${2 * rad} ${u}.` : `A circle with radius ${rad} ${u}.` },
    },
    answer: { kind: "decimal", exact, dp: DP },
    wrongAnswers: cleanWrongDecimal(exact, wrong),
    hints: useDiameter
      ? [`A = π × r². This gives the diameter, so halve it to get the radius.`, `r = ${2 * rad} ÷ 2 = ${rad}. Now work out π × ${rad} × ${rad}.`]
      : [`A = π × r². Square the radius first: ${rad} × ${rad}.`, `${rad} × ${rad} = ${rad * rad}. Now multiply by π.`],
    solution: [
      ...(useDiameter ? [`Radius = ${2 * rad} ÷ 2 = ${rad} ${u}.`] : []),
      `A = π × r² = π × ${rad}²`,
      `= π × ${rad * rad} = ${exact.toFixed(3)}…`,
      `= ${r1(exact)} ${u}² (1 d.p.)`,
    ],
  };
};

// ================================================================ volume: cuboids

function cuboidSolid(w: number, h: number, d: number, u: string, labels: { w?: string; h?: string; d?: string }, cubes = false): SolidSpec {
  const sides: ShapeSpec["sides"] = [];
  if (labels.w) sides.push({ i: 0, text: labels.w });
  if (labels.h) sides.push({ i: 3, text: labels.h });
  return {
    kind: "prism",
    face: { points: rectPoints(w, h), sides, description: "" },
    length: d,
    lengthText: labels.d,
    cubes,
    description: `A cuboid ${labels.w ?? "of unknown width"} wide, ${labels.h ?? "of unknown height"} tall and ${labels.d ?? "of unknown length"} long${cubes ? `, drawn with 1 ${u} cubes` : ""}.`,
  };
}

const volumeCuboid: Gen = (r, tier) => {
  const u = unitFor(r, tier);
  if (tier === 2 && r.next() < 0.3) {
    const w = r.int(2, 9);
    const h = r.int(2, 8);
    const d = r.int(2, 12);
    const V = w * h * d;
    return {
      prompt: `This cuboid has a volume of ${V} ${u}³. Find its length, marked ?, in ${u}.`,
      visual: { kind: "solid", solid: cuboidSolid(w, h, d, u, { w: `${w} ${u}`, h: `${h} ${u}`, d: `? ${u}` }) },
      answer: { kind: "integer", value: d },
      wrongAnswers: cleanWrong(frac(d), [
        { value: frac(V - w - h), misconception: "vol-missing-subtracted" },
        { value: frac(V, w), misconception: "vol-missing-one-divide" },
        { value: frac(V, h), misconception: "vol-missing-one-divide" },
      ]),
      hints: [`Volume = width × height × length. So ${w} × ${h} × ? = ${V}.`, `${w} × ${h} = ${w * h}. Now work out ${V} ÷ ${w * h}.`],
      solution: [`Width × height = ${w} × ${h} = ${w * h}.`, `Length = ${V} ÷ ${w * h} = ${d} ${u}.`],
    };
  }
  const w = tier === 1 ? r.int(2, 6) : r.int(3, 15);
  const h = tier === 1 ? r.int(2, 5) : r.int(2, 12);
  const d = tier === 1 ? r.int(2, 5) : r.int(3, 12);
  const V = w * h * d;
  return {
    prompt: `Find the volume of this cuboid. Give your answer in ${u}³.`,
    visual: { kind: "solid", solid: cuboidSolid(w, h, d, u, { w: `${w} ${u}`, h: `${h} ${u}`, d: `${d} ${u}` }, tier === 1) },
    answer: { kind: "integer", value: V },
    wrongAnswers: cleanWrong(frac(V), [
      { value: frac(w + h + d), misconception: "vol-added" },
      { value: frac(w * h), misconception: "vol-one-face" },
      { value: frac(2 * (w * h + w * d + h * d)), misconception: "vol-used-surface-area" },
    ]),
    hints:
      tier === 1
        ? [`Count the cubes in the front layer: ${w} × ${h}.`, `There are ${d} layers going back. Multiply: ${w * h} × ${d}.`]
        : [`Volume of a cuboid = length × width × height.`, `Work out ${w} × ${h} × ${d}.`],
    solution: [`Volume = width × height × length`, `= ${w} × ${h} × ${d}`, `= ${w * h} × ${d} = ${V} ${u}³`],
  };
};

// ================================================================ volume: prisms and cylinders

const TRIPLES: readonly (readonly [number, number, number])[] = [
  [3, 4, 5],
  [4, 3, 5],
  [6, 8, 10],
  [8, 6, 10],
  [5, 12, 13],
  [12, 5, 13],
];

function cylinderVisual(rad: number, h: number, u: string, onDiameter: boolean): SolidSpec {
  return {
    kind: "cylinder",
    r: rad,
    h,
    label: onDiameter ? { on: "diameter", text: `${2 * rad} ${u}` } : { on: "radius", text: `${rad} ${u}` },
    hText: `${h} ${u}`,
    description: `A cylinder with ${onDiameter ? `diameter ${2 * rad} ${u}` : `radius ${rad} ${u}`} and height ${h} ${u}.`,
  };
}

const volumePrism: Gen = (r, tier) => {
  const u = unitFor(r, tier);
  const roll = r.next();

  if (tier === 1 && roll < 0.4) {
    // Area of cross-section given: the core idea on its own.
    const A = r.int(6, 40);
    const L = r.int(2, 12);
    const solid: SolidSpec = {
      kind: "prism",
      face: {
        points: [
          [0, 0],
          [4, 0],
          [4, 3],
          [2, 5],
          [0, 3],
        ],
        sides: [],
        description: "",
      },
      length: L,
      lengthText: `${L} ${u}`,
      description: `A prism whose front face (the cross-section) is shaped like a house. The prism is ${L} ${u} long. The cross-section has an area of ${A} ${u}².`,
    };
    return {
      prompt: `The cross-section of this prism (the shaded front face) has an area of ${A} ${u}². The prism is ${L} ${u} long. Find its volume in ${u}³.`,
      visual: { kind: "solid", solid },
      answer: { kind: "integer", value: A * L },
      wrongAnswers: cleanWrong(frac(A * L), [{ value: frac(A + L), misconception: "vol-added" }]),
      hints: [`Volume of a prism = area of cross-section × length.`, `Work out ${A} × ${L}.`],
      solution: [`Volume = area of cross-section × length`, `= ${A} × ${L}`, `= ${A * L} ${u}³`],
    };
  }

  if (tier === 2 && roll < 0.35) {
    // Cylinder.
    const onDiameter = r.next() < 0.4;
    const rad = r.int(2, 10);
    const h = r.int(3, 20);
    const exact = PI * rad * rad * h;
    const wrong = [
      { value: 2 * PI * rad * h, misconception: "vol-cyl-used-circumference" },
      { value: PI * rad * rad, misconception: "vol-one-face" },
    ];
    if (onDiameter) wrong.unshift({ value: PI * 4 * rad * rad * h, misconception: "circle-diameter-as-radius" });
    return {
      prompt: `Find the volume of this cylinder. Give your answer to 1 decimal place.`,
      visual: { kind: "solid", solid: cylinderVisual(rad, h, u, onDiameter) },
      answer: { kind: "decimal", exact, dp: DP },
      wrongAnswers: cleanWrongDecimal(exact, wrong),
      hints: [
        `A cylinder is a prism with a circle cross-section. Find the circle's area first: π × r².${onDiameter ? ` The radius is half the diameter.` : ""}`,
        `Circle area = π × ${rad}² = π × ${rad * rad}. Then multiply by the height, ${h}.`,
      ],
      solution: [
        ...(onDiameter ? [`Radius = ${2 * rad} ÷ 2 = ${rad} ${u}.`] : []),
        `Area of circle = π × ${rad}² = ${(PI * rad * rad).toFixed(3)}…`,
        `Volume = ${(PI * rad * rad).toFixed(3)}… × ${h} = ${exact.toFixed(3)}…`,
        `= ${r1(exact)} ${u}³ (1 d.p.)`,
      ],
    };
  }

  if (tier === 2 && roll < 0.65) {
    // Right-angled trapezium prism.
    const a = r.int(2, 7);
    let b = a + r.int(1, 6);
    const h = r.int(2, 8);
    const L = r.int(3, 12);
    if (((a + b) * h * L) % 2 === 1) b += 1;
    const V = ((a + b) * h * L) / 2;
    const solid: SolidSpec = {
      kind: "prism",
      face: {
        points: [
          [0, 0],
          [b, 0],
          [a, h],
          [0, h],
        ],
        sides: [
          { i: 0, text: `${b} ${u}` },
          { i: 2, text: `${a} ${u}` },
          { i: 3, text: `${h} ${u}` },
        ],
        right: [[0, 0]],
        description: "",
      },
      length: L,
      lengthText: `${L} ${u}`,
      description: `A prism with a trapezium cross-section. The parallel sides are ${a} ${u} and ${b} ${u}, the height of the trapezium is ${h} ${u}, and the prism is ${L} ${u} long.`,
    };
    return {
      prompt: `Find the volume of this prism. Give your answer in ${u}³.`,
      visual: { kind: "solid", solid },
      answer: { kind: "integer", value: V },
      wrongAnswers: cleanWrong(frac(V), [
        { value: frac((a + b) * h * L), misconception: "vol-prism-forgot-half" },
        { value: frac((a + b) * h, 2), misconception: "vol-one-face" },
      ]),
      hints: [`First find the area of the trapezium front face: ½ × (a + b) × h.`, `½ × (${a} + ${b}) × ${h} = ${num(((a + b) * h) / 2)}. Then multiply by the length, ${L}.`],
      solution: [
        `Area of cross-section = ½ × (${a} + ${b}) × ${h} = ${num(((a + b) * h) / 2)} ${u}²`,
        `Volume = ${num(((a + b) * h) / 2)} × ${L}`,
        `= ${V} ${u}³`,
      ],
    };
  }

  // Triangular prisms. Tier 1: right-angled. Tier 2: with a sloping side to ignore.
  const L = tier === 1 ? r.int(2, 10) : r.int(4, 15);
  if (tier === 1) {
    let b = r.int(2, 8);
    const h = r.int(2, 7);
    if ((b * h * L) % 2 === 1) b += 1;
    const V = (b * h * L) / 2;
    const solid: SolidSpec = {
      kind: "prism",
      face: {
        points: [
          [0, 0],
          [b, 0],
          [0, h],
        ],
        sides: [
          { i: 0, text: `${b} ${u}` },
          { i: 2, text: `${h} ${u}` },
        ],
        right: [[0, 0]],
        description: "",
      },
      length: L,
      lengthText: `${L} ${u}`,
      description: `A triangular prism. The front triangle has a right angle, base ${b} ${u} and height ${h} ${u}. The prism is ${L} ${u} long.`,
    };
    return {
      prompt: `Find the volume of this triangular prism. Give your answer in ${u}³.`,
      visual: { kind: "solid", solid },
      answer: { kind: "integer", value: V },
      wrongAnswers: cleanWrong(frac(V), [
        { value: frac(b * h * L), misconception: "vol-prism-forgot-half" },
        { value: frac(b + h + L), misconception: "vol-added" },
      ]),
      hints: [`Find the area of the triangle at the front first: ½ × ${b} × ${h}.`, `½ × ${b} × ${h} = ${num((b * h) / 2)}. Now multiply by the length, ${L}.`],
      solution: [`Area of triangle = ½ × ${b} × ${h} = ${num((b * h) / 2)} ${u}²`, `Volume = ${num((b * h) / 2)} × ${L}`, `= ${V} ${u}³`],
    };
  }
  const [o, h, s] = r.pick(TRIPLES);
  let b = o + r.int(2, 6);
  if ((b * h * L) % 2 === 1) b += 1;
  const V = (b * h * L) / 2;
  const solid: SolidSpec = {
    kind: "prism",
    face: {
      points: [
        [0, 0],
        [b, 0],
        [o, h],
      ],
      sides: [
        { i: 0, text: `${b} ${u}` },
        { i: 2, text: `${s} ${u}` },
      ],
      heights: [{ x: o, y1: h, y2: 0, text: `${h} ${u}` }],
      description: "",
    },
    length: L,
    lengthText: `${L} ${u}`,
    description: `A triangular prism. The front triangle has base ${b} ${u}, a dashed perpendicular height of ${h} ${u} and a sloping side of ${s} ${u}. The prism is ${L} ${u} long.`,
  };
  return {
    prompt: `Find the volume of this triangular prism. Give your answer in ${u}³.`,
    visual: { kind: "solid", solid },
    answer: { kind: "integer", value: V },
    wrongAnswers: cleanWrong(frac(V), [
      { value: frac(b * h * L), misconception: "vol-prism-forgot-half" },
      { value: frac(b * s * L, 2), misconception: "area-used-slant" },
    ]),
    hints: [`The triangle's height is the dashed line, ${h} ${u}. The sloping side isn't needed.`, `Triangle area = ½ × ${b} × ${h} = ${num((b * h) / 2)}. Then × ${L}.`],
    solution: [
      `Use the perpendicular height (${h}), not the sloping side.`,
      `Area of triangle = ½ × ${b} × ${h} = ${num((b * h) / 2)} ${u}²`,
      `Volume = ${num((b * h) / 2)} × ${L} = ${V} ${u}³`,
    ],
  };
};

// ================================================================ surface area

const surfaceArea: Gen = (r, tier) => {
  const u = unitFor(r, tier);
  const roll = r.next();

  if (tier === 1 || roll < 0.35) {
    const w = tier === 1 ? r.int(2, 6) : r.int(3, 12);
    const h = tier === 1 ? r.int(2, 5) : r.int(2, 10);
    const d = tier === 1 ? r.int(2, 5) : r.int(3, 12);
    const fb = w * h;
    const tb = w * d;
    const lr = h * d;
    const SA = 2 * (fb + tb + lr);
    return {
      prompt: `Find the surface area of this cuboid. Give your answer in ${u}².`,
      visual: { kind: "solid", solid: cuboidSolid(w, h, d, u, { w: `${w} ${u}`, h: `${h} ${u}`, d: `${d} ${u}` }) },
      answer: { kind: "integer", value: SA },
      wrongAnswers: cleanWrong(frac(SA), [
        { value: frac(fb + tb + lr), misconception: "sa-only-three-faces" },
        { value: frac(w * h * d), misconception: "sa-used-volume" },
      ]),
      hints: [
        `There are three pairs of matching faces: front and back (${w} by ${h}), top and bottom (${w} by ${d}), and the two ends (${h} by ${d}).`,
        `Work out ${fb} + ${tb} + ${lr}, then double it.`,
      ],
      solution: [
        `Front and back: 2 × ${w} × ${h} = ${2 * fb}`,
        `Top and bottom: 2 × ${w} × ${d} = ${2 * tb}`,
        `Two ends: 2 × ${h} × ${d} = ${2 * lr}`,
        `Total = ${2 * fb} + ${2 * tb} + ${2 * lr} = ${SA} ${u}²`,
      ],
    };
  }

  if (roll < 0.7) {
    // Right-angled triangular prism; all three sides labelled.
    const [a, b, c] = r.pick(TRIPLES);
    const L = r.int(3, 15);
    const ends = a * b; // two triangles of ½ab
    const rects = (a + b + c) * L;
    const SA = ends + rects;
    const solid: SolidSpec = {
      kind: "prism",
      face: {
        points: [
          [0, 0],
          [a, 0],
          [0, b],
        ],
        sides: [
          { i: 0, text: `${a} ${u}` },
          { i: 1, text: `${c} ${u}` },
          { i: 2, text: `${b} ${u}` },
        ],
        right: [[0, 0]],
        description: "",
      },
      length: L,
      lengthText: `${L} ${u}`,
      description: `A triangular prism. The front triangle has a right angle with sides ${a} ${u} and ${b} ${u}, and a sloping side of ${c} ${u}. The prism is ${L} ${u} long.`,
    };
    return {
      prompt: `Find the surface area of this triangular prism. Give your answer in ${u}².`,
      visual: { kind: "solid", solid },
      answer: { kind: "integer", value: SA },
      wrongAnswers: cleanWrong(frac(SA), [
        { value: frac(2 * a * b + rects), misconception: "sa-triangle-forgot-half" },
        { value: frac(a * b + 2 * rects, 2), misconception: "sa-missing-face" },
        { value: frac(a * b * L, 2), misconception: "sa-used-volume" },
      ]),
      hints: [
        `There are 5 faces: 2 triangles and 3 rectangles. Each rectangle is ${L} long.`,
        `Each triangle: ½ × ${a} × ${b} = ${(a * b) / 2}. Rectangles: ${a} × ${L}, ${b} × ${L} and ${c} × ${L}.`,
      ],
      solution: [
        `Two triangles: 2 × ½ × ${a} × ${b} = ${ends}`,
        `Three rectangles: ${a} × ${L} + ${b} × ${L} + ${c} × ${L} = ${a * L} + ${b * L} + ${c * L} = ${rects}`,
        `Total = ${ends} + ${rects} = ${SA} ${u}²`,
      ],
    };
  }

  // Cylinder.
  const onDiameter = r.next() < 0.4;
  const rad = r.int(2, 10);
  const h = r.int(3, 20);
  const circles = 2 * PI * rad * rad;
  const curved = 2 * PI * rad * h;
  const exact = circles + curved;
  const wrong = [
    { value: PI * rad * rad + curved, misconception: "sa-cyl-one-circle" },
    { value: circles + PI * rad * h, misconception: "sa-cyl-curved-pi-r" },
    { value: PI * rad * rad * h, misconception: "sa-used-volume" },
  ];
  if (onDiameter) wrong.unshift({ value: 2 * PI * 4 * rad * rad + 2 * PI * 2 * rad * h, misconception: "circle-diameter-as-radius" });
  return {
    prompt: `Find the total surface area of this cylinder. Give your answer to 1 decimal place.`,
    visual: { kind: "solid", solid: cylinderVisual(rad, h, u, onDiameter) },
    answer: { kind: "decimal", exact, dp: DP },
    wrongAnswers: cleanWrongDecimal(exact, wrong),
    hints: [
      `There are two circles (top and bottom) and a curved surface that unrolls into a rectangle.${onDiameter ? ` The radius is half the diameter.` : ""}`,
      `Circles: 2 × π × ${rad}². Curved rectangle: circumference × height = π × ${2 * rad} × ${h}.`,
    ],
    solution: [
      ...(onDiameter ? [`Radius = ${2 * rad} ÷ 2 = ${rad} ${u}.`] : []),
      `Two circles: 2 × π × ${rad}² = ${circles.toFixed(3)}…`,
      `Curved surface: π × ${2 * rad} × ${h} = ${curved.toFixed(3)}…`,
      `Total = ${exact.toFixed(3)}… = ${r1(exact)} ${u}² (1 d.p.)`,
    ],
  };
};

export const MEASURES_GENERATORS: Record<string, Gen> = {
  "geo-perimeter": perimeter,
  "geo-circle-parts": circleParts,
  "geo-circumference": circumference,
  "geo-circle-area": circleArea,
  "geo-volume-cuboid": volumeCuboid,
  "geo-volume-prism": volumePrism,
  "geo-surface-area": surfaceArea,
};
