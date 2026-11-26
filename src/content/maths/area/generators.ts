/**
 * Question generators for the area chain.
 *
 * Every question comes with a to-scale labelled diagram. Lengths with a slope
 * come from Pythagorean triples (3-4-5, 5-12-13, ...) so every labelled length
 * is a whole number and the drawing is accurate. Answers that are halves accept
 * 7.5, 15/2 or 7 1/2, with or without units.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher.
 */

import { equals, frac, type Fraction } from "@/engine/fraction";
import type { Rng } from "@/engine/random";
import type { Question, ShapeSpec } from "@/engine/types";

export type Tier = 1 | 2;
type Gen = (r: Rng, tier: Tier) => Omit<Question, "id" | "skillId">;

/** [horizontal offset, perpendicular height, sloping side] */
const TRIPLES: readonly (readonly [number, number, number])[] = [
  [3, 4, 5],
  [4, 3, 5],
  [6, 8, 10],
  [8, 6, 10],
  [5, 12, 13],
  [12, 5, 13],
  [9, 12, 15],
  [12, 9, 15],
  [8, 15, 17],
];
const SMALL_TRIPLES = TRIPLES.slice(0, 4);

/** Show a whole number or a half as a decimal: 7, 7.5. */
export function num(x: number): string {
  return Number.isInteger(x) ? String(x) : x.toFixed(1);
}
const half = (twice: number): Fraction => frac(twice, 2);

function unitFor(r: Rng, tier: Tier): "cm" | "m" {
  return tier === 1 ? "cm" : r.next() < 0.5 ? "cm" : "m";
}

/** Drop wrong answers equal to the right one, and duplicates. */
function cleanWrong(correct: Fraction, wrong: { value: Fraction; misconception: string }[]) {
  const seen: Fraction[] = [];
  return wrong.filter((w) => {
    if (equals(w.value, correct) || seen.some((s) => equals(s, w.value))) return false;
    seen.push(w.value);
    return true;
  });
}

const ask = (u: string) => `Find the area of this shape. Give your answer in ${u}².`;

// ------------------------------------------------------------ rectangles

const rectangle: Gen = (r, tier) => {
  const u = unitFor(r, tier);
  const w = tier === 1 ? r.int(2, 8) : r.int(4, 15);
  const h = tier === 1 ? r.int(2, 6) : r.int(3, 12);
  const points: [number, number][] = [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ];

  if (tier === 2 && r.next() < 0.3) {
    const A = w * h;
    const shape: ShapeSpec = {
      points,
      sides: [
        { i: 0, text: `${w} ${u}` },
        { i: 3, text: `? ${u}` },
      ],
      right: [[0, 0]],
      description: `A rectangle with width ${w} ${u} and an unknown height. Its area is ${A} ${u}².`,
    };
    return {
      prompt: `This rectangle has an area of ${A} ${u}². Its width is ${w} ${u}. How tall is it, in ${u}?`,
      visual: { kind: "shape", shape },
      answer: { kind: "integer", value: h },
      wrongAnswers: cleanWrong(frac(h), [{ value: frac(A - w), misconception: "area-missing-side-subtracted" }]),
      hints: [`Area = width × height. So ${w} × ? = ${A}.`, `To undo × ${w}, divide: ${A} ÷ ${w}.`],
      solution: [`Area = width × height, so ${w} × height = ${A}.`, `Height = ${A} ÷ ${w} = ${h} ${u}.`],
    };
  }

  const A = w * h;
  const shape: ShapeSpec = {
    points,
    sides: [
      { i: 0, text: `${w} ${u}` },
      { i: 3, text: `${h} ${u}` },
    ],
    right: [[0, 0]],
    grid: tier === 1,
    description: `A rectangle ${w} ${u} wide and ${h} ${u} tall${tier === 1 ? `, drawn on a grid of 1 ${u} squares` : ""}.`,
  };
  return {
    prompt: ask(u),
    visual: { kind: "shape", shape },
    answer: { kind: "integer", value: A },
    wrongAnswers: cleanWrong(frac(A), [
      { value: frac(2 * (w + h)), misconception: "area-used-perimeter" },
      { value: frac(w + h), misconception: "area-added-sides" },
    ]),
    hints:
      tier === 1
        ? [`Area is how many 1 ${u} squares fit inside. You could count them.`, `Quicker: there are ${h} rows of ${w}. Work out ${w} × ${h}.`]
        : [`Area of a rectangle = length × width.`, `Work out ${w} × ${h}.`],
    solution: [`Area = length × width`, `= ${w} × ${h}`, `= ${A} ${u}²`],
  };
};

// ------------------------------------------------------------ triangles

const triangle: Gen = (r, tier) => {
  const u = unitFor(r, tier);
  if (tier === 1) {
    let b = r.int(2, 10);
    const h = r.int(2, 8);
    if ((b * h) % 2 === 1) b += 1;
    const shape: ShapeSpec = {
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
      description: `A right-angled triangle with base ${b} ${u} and height ${h} ${u}. The right angle is between them.`,
    };
    const A = half(b * h);
    return {
      prompt: ask(u),
      visual: { kind: "shape", shape },
      answer: { kind: "fraction", value: A, requireSimplest: false },
      wrongAnswers: cleanWrong(A, [
        { value: frac(b * h), misconception: "area-forgot-half" },
        { value: frac(b + h), misconception: "area-added-sides" },
      ]),
      hints: [
        `Imagine the rectangle around this triangle. It's ${b} by ${h}. The triangle is half of it.`,
        `Work out ${b} × ${h}, then halve it.`,
      ],
      solution: [`Area = ½ × base × height`, `= ½ × ${b} × ${h}`, `= ½ × ${b * h}`, `= ${num((b * h) / 2)} ${u}²`],
    };
  }
  const [o, h, s] = r.pick(TRIPLES);
  const b = o + r.int(2, 8);
  const shape: ShapeSpec = {
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
    description: `A triangle with base ${b} ${u}. The dashed perpendicular height is ${h} ${u}. One sloping side is ${s} ${u}.`,
  };
  const A = half(b * h);
  return {
    prompt: ask(u),
    visual: { kind: "shape", shape },
    answer: { kind: "fraction", value: A, requireSimplest: false },
    wrongAnswers: cleanWrong(A, [
      { value: frac(b * h), misconception: "area-forgot-half" },
      { value: half(b * s), misconception: "area-used-slant" },
      { value: frac(b * s), misconception: "area-used-slant" },
    ]),
    hints: [
      `Which length meets the base at a right angle? That's the height. The sloping ${s} ${u} side isn't needed.`,
      `Work out ½ × ${b} × ${h}.`,
    ],
    solution: [
      `The perpendicular height is the dashed line: ${h} ${u}. Ignore the sloping side.`,
      `Area = ½ × base × height = ½ × ${b} × ${h}`,
      `= ½ × ${b * h} = ${num((b * h) / 2)} ${u}²`,
    ],
  };
};

// ------------------------------------------------------------ parallelograms

const parallelogram: Gen = (r, tier) => {
  const u = unitFor(r, tier);
  const [o, h, s] = r.pick(tier === 1 ? SMALL_TRIPLES : TRIPLES);
  const b = o + r.int(2, tier === 1 ? 6 : 10);
  const shape: ShapeSpec = {
    points: [
      [0, 0],
      [b, 0],
      [b + o, h],
      [o, h],
    ],
    sides: [
      { i: 0, text: `${b} ${u}` },
      { i: 3, text: `${s} ${u}` },
    ],
    heights: [{ x: o, y1: h, y2: 0, text: `${h} ${u}` }],
    description: `A parallelogram with base ${b} ${u}. The dashed perpendicular height is ${h} ${u}. The sloping side is ${s} ${u}.`,
  };
  const A = frac(b * h);
  return {
    prompt: ask(u),
    visual: { kind: "shape", shape },
    answer: { kind: "integer", value: b * h },
    wrongAnswers: cleanWrong(A, [
      { value: frac(b * s), misconception: "area-used-slant" },
      { value: half(b * h), misconception: "area-halved-parallelogram" },
    ]),
    hints: [
      `Use the height that meets the base at a right angle (the dashed line), not the sloping side.`,
      `Area = base × height = ${b} × ${h}.`,
    ],
    solution: [
      `Cut the triangle off one end and move it to the other: you get a rectangle ${b} by ${h}.`,
      `Area = base × perpendicular height = ${b} × ${h}`,
      `= ${b * h} ${u}²`,
    ],
  };
};

// ------------------------------------------------------------ trapeziums

const trapezium: Gen = (r, tier) => {
  const u = unitFor(r, tier);
  if (tier === 1) {
    const a = r.int(2, 7);
    let b = a + r.int(1, 5);
    const h = r.int(2, 8);
    if (((a + b) * h) % 2 === 1) b += 1;
    const shape: ShapeSpec = {
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
      description: `A trapezium with parallel sides ${a} ${u} (top) and ${b} ${u} (bottom). The left side is ${h} ${u} and meets the bottom at a right angle.`,
    };
    const A = half((a + b) * h);
    return {
      prompt: ask(u),
      visual: { kind: "shape", shape },
      answer: { kind: "fraction", value: A, requireSimplest: false },
      wrongAnswers: cleanWrong(A, [
        { value: frac((a + b) * h), misconception: "area-trap-forgot-half" },
        { value: frac(b * h), misconception: "area-trap-one-side" },
        { value: frac(a * h), misconception: "area-trap-one-side" },
      ]),
      hints: [`Add the two parallel sides first: ${a} + ${b}.`, `Then × the height ${h}, then halve.`],
      solution: [
        `Area = ½ × (a + b) × h`,
        `= ½ × (${a} + ${b}) × ${h}`,
        `= ½ × ${a + b} × ${h} = ½ × ${(a + b) * h}`,
        `= ${num(((a + b) * h) / 2)} ${u}²`,
      ],
    };
  }
  const [o, h, s] = r.pick(TRIPLES);
  const a = r.int(2, 8);
  const b = o + a + r.int(1, 6);
  const shape: ShapeSpec = {
    points: [
      [0, 0],
      [b, 0],
      [o + a, h],
      [o, h],
    ],
    sides: [
      { i: 0, text: `${b} ${u}` },
      { i: 2, text: `${a} ${u}` },
      { i: 3, text: `${s} ${u}` },
    ],
    heights: [{ x: o, y1: h, y2: 0, text: `${h} ${u}` }],
    description: `A trapezium with parallel sides ${a} ${u} (top) and ${b} ${u} (bottom). The dashed perpendicular height is ${h} ${u}. A sloping side is ${s} ${u}.`,
  };
  const A = half((a + b) * h);
  return {
    prompt: ask(u),
    visual: { kind: "shape", shape },
    answer: { kind: "fraction", value: A, requireSimplest: false },
    wrongAnswers: cleanWrong(A, [
      { value: frac((a + b) * h), misconception: "area-trap-forgot-half" },
      { value: half((a + b) * s), misconception: "area-used-slant" },
      { value: frac(b * h), misconception: "area-trap-one-side" },
    ]),
    hints: [
      `The height is the dashed line (${h} ${u}), not the sloping side.`,
      `½ × (${a} + ${b}) × ${h}`,
    ],
    solution: [
      `a and b are the parallel sides: ${a} and ${b}. The perpendicular height is ${h}.`,
      `Area = ½ × (${a} + ${b}) × ${h} = ½ × ${a + b} × ${h}`,
      `= ½ × ${(a + b) * h} = ${num(((a + b) * h) / 2)} ${u}²`,
    ],
  };
};

// ------------------------------------------------------------ compound (L-shapes)

const compound: Gen = (r, tier) => {
  const u = unitFor(r, tier);
  const W = tier === 1 ? r.int(5, 10) : r.int(8, 16);
  const H = tier === 1 ? r.int(5, 9) : r.int(7, 14);
  const cw = r.int(2, W - 2);
  const ch = r.int(2, H - 2);
  const points: [number, number][] = [
    [0, 0],
    [W, 0],
    [W, H - ch],
    [W - cw, H - ch],
    [W - cw, H],
    [0, H],
  ];
  const sides =
    tier === 1
      ? [
          { i: 0, text: `${W} ${u}` },
          { i: 1, text: `${H - ch} ${u}` },
          { i: 4, text: `${W - cw} ${u}` },
          { i: 5, text: `${H} ${u}` },
        ]
      : [
          { i: 0, text: `${W} ${u}` },
          { i: 2, text: `${cw} ${u}` },
          { i: 3, text: `${ch} ${u}` },
          { i: 5, text: `${H} ${u}` },
        ];
  const shape: ShapeSpec = {
    points,
    sides,
    grid: tier === 1,
    description:
      tier === 1
        ? `An L-shape. The bottom is ${W} ${u}, the left side ${H} ${u}, the top ${W - cw} ${u} and the lower right side ${H - ch} ${u}. All corners are right angles.`
        : `An L-shape. The bottom is ${W} ${u} and the left side ${H} ${u}. The cut-out corner's edges are ${cw} ${u} across and ${ch} ${u} down. All corners are right angles.`,
  };
  const A = W * H - cw * ch;
  const left = (W - cw) * H;
  const right = cw * (H - ch);
  return {
    prompt: ask(u),
    visual: { kind: "shape", shape },
    answer: { kind: "integer", value: A },
    wrongAnswers: cleanWrong(frac(A), [
      { value: frac(W * H), misconception: "area-bounding-rectangle" },
      { value: frac((W - cw) * H + W * (H - ch)), misconception: "area-compound-overlap" },
      { value: frac(2 * (W + H)), misconception: "area-used-perimeter" },
    ]),
    hints:
      tier === 1
        ? [
            `Draw a line straight up from the inside corner to split it into two rectangles.`,
            `The left rectangle is ${W - cw} by ${H}. The right one is ${W} − ${W - cw} = ${cw} wide and ${H - ch} tall.`,
          ]
        : [
            `Start with the whole ${W} by ${H} rectangle, then take away the missing corner.`,
            `The missing corner is ${cw} by ${ch}.`,
          ],
    solution:
      tier === 1
        ? [
            `Split with a vertical line into two rectangles.`,
            `Left: ${W - cw} × ${H} = ${left}. Right: ${cw} × ${H - ch} = ${right} (width ${W} − ${W - cw} = ${cw}).`,
            `Total = ${left} + ${right} = ${A} ${u}²`,
          ]
        : [
            `Whole rectangle: ${W} × ${H} = ${W * H}.`,
            `Missing corner: ${cw} × ${ch} = ${cw * ch}.`,
            `Area = ${W * H} − ${cw * ch} = ${A} ${u}²`,
          ],
  };
};

export const AREA_GENERATORS: Record<string, Gen> = {
  "area-rectangle": rectangle,
  "area-triangle": triangle,
  "area-parallelogram": parallelogram,
  "area-trapezium": trapezium,
  "area-compound": compound,
};
