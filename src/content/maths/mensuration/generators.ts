/**
 * Question generators for answers in terms of π, semicircles and composite
 * shapes, arcs and sectors, spheres, cones and pyramids, and area and volume
 * units. Rounded answers are to 1 decimal place; marking also accepts answers
 * from π = 3.14. Every picture is drawn to scale.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher.
 */

import { decimalTolerance, roundTo } from "@/engine/marking";
import type { Rng } from "@/engine/random";
import type { PlaneSpec, Question, SolidSpec, Visual } from "@/engine/types";

export type Tier = 1 | 2;
type Gen = (r: Rng, tier: Tier) => Omit<Question, "id" | "skillId">;
type Q = Omit<Question, "id" | "skillId">;
type P = [number, number];
type Wrong = { value: number; misconception: string };

const PI = Math.PI;
const DP = 1;
const r1 = (x: number) => roundTo(x, DP);
const fix3 = (x: number) => `${x.toFixed(3)}…`;
const rad = (d: number) => (d * PI) / 180;
const at = (c: P, rr: number, d: number): P => [c[0] + rr * Math.cos(rad(d)), c[1] + rr * Math.sin(rad(d))];
const big = (n: number) => n.toLocaleString("en-GB");

const DEC_HELP = "Use the π button on your calculator, then round to 1 decimal place, like 28.3. Units are fine but not needed.";
const PI_HELP = "Leave π in your answer: type the number then π, like 25π. You can type pi for π.";
const NUM_HELP = "Type a number, like 12 or 7.5. You can use commas in big numbers, like 10,000. Units are fine but not needed.";

function unitFor(r: Rng, tier: Tier): "cm" | "m" {
  return tier === 1 ? "cm" : r.next() < 0.5 ? "cm" : "m";
}

/** Drop rounded wrong answers that would be accepted as right, or that are too close to each other. */
function cleanDec(exact: number, wrong: Wrong[]): Wrong[] {
  const kept: Wrong[] = [];
  const near = (a: number, b: number) => Math.abs(a - b) <= decimalTolerance(a, DP) + decimalTolerance(b, DP) + 0.05;
  for (const w of wrong) {
    if (near(w.value, exact) || kept.some((k) => near(k.value, w.value))) continue;
    kept.push(w);
  }
  return kept;
}

/** Drop exact wrong answers equal to the right one, and duplicates. */
function cleanExact(right: number, wrong: Wrong[]): Wrong[] {
  const seen = new Set<number>([right]);
  return wrong.filter((w) => {
    if (seen.has(w.value) || !Number.isFinite(w.value)) return false;
    seen.add(w.value);
    return true;
  });
}

function decimalQ(exact: number, wrong: Wrong[]): Pick<Q, "answer" | "wrongAnswers" | "answerHelp"> {
  return { answer: { kind: "decimal", exact, dp: DP }, wrongAnswers: cleanDec(exact, wrong), answerHelp: DEC_HELP };
}

// ================================================================ pictures

const arcPts = (c: P, rr: number, from: number, to: number, step = 4): P[] => {
  const pts: P[] = [];
  const n = Math.max(2, Math.ceil(Math.abs(to - from) / step));
  for (let i = 0; i <= n; i++) pts.push(at(c, rr, from + ((to - from) * i) / n));
  return pts;
};

function win(pts: P[], m: number): { x: [number, number]; y: [number, number] } {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return { x: [Math.min(...xs) - m, Math.max(...xs) + m], y: [Math.min(...ys) - m, Math.max(...ys) + m] };
}

/** A whole circle, a semicircle (flat side down) or a quarter circle (corner bottom left), radius rr. */
export function circlePart(part: "whole" | "half" | "quarter", rr: number, text: string, label: "radius" | "diameter" = "radius"): PlaneSpec {
  // Drawn at a fixed size: every circle has the same shape, so only the labels change.
  void rr;
  const R = 2.5;
  const c: P = [0, 0];
  const pts = part === "whole" ? arcPts(c, R, 0, 360) : part === "half" ? arcPts(c, R, 0, 180) : [c, ...arcPts(c, R, 0, 90)];
  // A semicircle's radius is drawn sloping up, so it can't be mistaken for the diameter along the bottom.
  const radiusEnd: P = part === "half" ? at(c, R, 50) : [R, 0];
  const length = label === "diameter" ? { a: [-R, 0] as P, b: [R, 0] as P, text } : { a: c, b: radiusEnd, text };
  return {
    ...win(part === "whole" ? pts : [...pts, [-0.01, -0.01]], 0.7),
    shapes: [{ points: pts, tone: "object" }],
    lines: part === "whole" || (part === "half" && label === "radius") ? [{ a: length.a, b: length.b, dashed: true }] : [],
    points: [{ at: c }],
    lengths: [length],
    description: `A ${part === "whole" ? "circle" : part === "half" ? "semicircle" : "quarter circle"} with ${label} ${text}.`,
  };
}

/** A sector of angle `angle` (starting at east), radius rr. */
export function sectorPic(angle: number, _rr: number, rText: string, angleText: string): PlaneSpec {
  const rr = 2.5;
  const c: P = [0, 0];
  const pts = [c, ...arcPts(c, rr, 0, angle)];
  const rest = arcPts(c, rr, angle, 360);
  return {
    ...win([...arcPts(c, rr, 0, 360)], 0.6),
    shapes: [
      { points: [c, ...rest], tone: "outline", dashed: true },
      { points: pts, tone: "object" },
    ],
    points: [{ at: c }],
    lengths: [{ a: c, b: [rr, 0], text: rText }],
    texts: [{ at: at(c, angle > 300 ? rr * 0.22 : rr * 0.32, angle / 2), text: angleText }],
    description: `A sector of a circle with radius ${rText} and angle ${angleText}. The rest of the circle is dashed.`,
  };
}

/** A rectangle w by h with a semicircle on its right-hand end (diameter h). */
export function rectSemi(w0: number, h0: number, wText: string, hText: string): PlaneSpec {
  const k = 5.5 / (w0 + h0 / 2);
  const [w, h] = [w0 * k, h0 * k];
  const pts: P[] = [[0, 0], [w, 0], ...arcPts([w, h / 2], h / 2, -90, 90).slice(1, -1), [w, h], [0, h]];
  return {
    ...win([[0, 0], [w + h / 2, h]], 0.8),
    shapes: [{ points: pts, tone: "object" }],
    lines: [{ a: [w, 0], b: [w, h], dashed: true }],
    lengths: [
      { a: [0, h], b: [w, h], text: wText },
      { a: [0, 0], b: [0, h], text: hText },
    ],
    description: `A rectangle ${wText} by ${hText} with a semicircle on one end. The semicircle's diameter is the ${hText} side.`,
  };
}

/** A square of side s with a quarter circle (centre bottom-left, radius s) cut out; the corner left over is shaded. */
export function squareMinusQuarter(_s: number, sText: string): PlaneSpec {
  const s = 3.6;
  const pts: P[] = [[s, 0], [s, s], [0, s], ...arcPts([0, 0], s, 90, 0).slice(1, -1)];
  return {
    ...win([[0, 0], [s, s]], 0.6),
    shapes: [
      { points: [[0, 0], [s, 0], [s, s], [0, s]], tone: "outline" },
      { points: pts, tone: "object" },
    ],
    arcs: [{ c: [0, 0], r: s, from: 0, to: 90 }],
    lengths: [{ a: [0, 0], b: [s, 0], text: sText }],
    description: `A square with side ${sText}. A quarter circle with radius ${sText}, centred on the bottom left corner, is cut out. The corner that is left is shaded.`,
  };
}

const plane = (p: PlaneSpec): Visual => ({ kind: "plane", plane: p });

// ================================================================ in terms of π

const exactPi: Gen = (r, tier) => {
  const u = unitFor(r, tier);
  const roll = r.next();
  if (tier === 2 && roll < 0.22) {
    // Reverse from an area.
    const rr = r.int(2, 12);
    const k = rr * rr;
    return {
      prompt: `A circle has an area of ${k}π ${u}². Find its radius, in ${u}.`,
      visual: plane(circlePart("whole", rr, `? ${u}`)),
      answer: { kind: "integer", value: rr },
      answerHelp: NUM_HELP,
      wrongAnswers: cleanExact(rr, [
        { value: k, misconception: "pi-reverse-root" },
        { value: k / 2, misconception: "pi-reverse-root" },
        { value: 2 * rr, misconception: "pi-reverse-diameter" },
      ]),
      hints: [`Area = π × r². So π × r² = ${k}π, which means r² = ${k}.`, `Which number squares to make ${k}?`],
      solution: [`π × r² = ${k}π, so r² = ${k}.`, `r = √${k} = ${rr} ${u}.`],
    };
  }
  if (tier === 2 && roll < 0.4) {
    const rr = r.int(2, 15);
    return {
      prompt: `A circle has a circumference of ${2 * rr}π ${u}. Find its radius, in ${u}.`,
      visual: plane(circlePart("whole", rr, `? ${u}`)),
      answer: { kind: "integer", value: rr },
      answerHelp: NUM_HELP,
      wrongAnswers: cleanExact(rr, [
        { value: 2 * rr, misconception: "pi-reverse-diameter" },
        { value: 4 * rr, misconception: "pi-reverse-diameter" },
      ]),
      hints: [`Circumference = π × d. So π × d = ${2 * rr}π, which means d = ${2 * rr}.`, "The radius is half the diameter."],
      solution: [`π × d = ${2 * rr}π, so d = ${2 * rr} ${u}.`, `r = ${2 * rr} ÷ 2 = ${rr} ${u}.`],
    };
  }
  if (tier === 2 && roll < 0.58) {
    const rr = 2 * r.int(1, 7);
    const k = (rr * rr) / 2;
    return {
      prompt: `Find the area of this semicircle. Give your answer in terms of π.`,
      visual: plane(circlePart("half", rr, `${rr} ${u}`)),
      answer: { kind: "pi", coeff: k },
      answerHelp: PI_HELP,
      wrongAnswers: cleanExact(k, [
        { value: rr * rr, misconception: "pi-semicircle-full" },
        { value: rr / 2, misconception: "pi-not-squared" },
        { value: rr, misconception: "pi-not-squared" },
      ]),
      hints: ["Find the area of the whole circle first, in terms of π, then halve it.", `Whole circle: π × ${rr}² = ${rr * rr}π.`],
      solution: [`Whole circle: π × ${rr}² = ${rr * rr}π ${u}².`, `Semicircle: ${rr * rr}π ÷ 2 = ${k}π ${u}².`],
    };
  }
  const area = roll < (tier === 1 ? 0.55 : 0.8);
  if (area) {
    const useD = tier === 2 && r.next() < 0.5;
    const rr = r.int(2, 12);
    const k = rr * rr;
    return {
      prompt: `Find the area of this circle. Give your answer in terms of π.`,
      visual: plane(useD ? circlePart("whole", rr, `${2 * rr} ${u}`, "diameter") : circlePart("whole", rr, `${rr} ${u}`)),
      answer: { kind: "pi", coeff: k },
      answerHelp: PI_HELP,
      wrongAnswers: cleanExact(k, [
        { value: 2 * rr, misconception: "circle-used-circumference" },
        { value: rr, misconception: "pi-not-squared" },
        ...(useD ? [{ value: 4 * k, misconception: "circle-diameter-as-radius" }] : []),
      ]),
      hints: [
        useD ? `Area = π × r². The diameter is ${2 * rr}, so the radius is ${rr}.` : `Area = π × r². Square the radius: ${rr} × ${rr}.`,
        `Don't work out π: write ${rr} × ${rr} = ${k}, then put π after it.`,
      ],
      solution: [...(useD ? [`r = ${2 * rr} ÷ 2 = ${rr} ${u}.`] : []), `Area = π × ${rr}² = π × ${k}.`, `= ${k}π ${u}².`],
    };
  }
  const useR = r.next() < 0.5;
  const d = useR ? 2 * r.int(2, 12) : r.int(3, 20);
  return {
    prompt: `Find the circumference of this circle. Give your answer in terms of π.`,
    visual: plane(useR ? circlePart("whole", d / 2, `${d / 2} ${u}`) : circlePart("whole", d / 2, `${d} ${u}`, "diameter")),
    answer: { kind: "pi", coeff: d },
    answerHelp: PI_HELP,
    wrongAnswers: cleanExact(d, [
      ...(useR ? [{ value: d / 2, misconception: "circle-radius-in-pi-d" }] : [{ value: 2 * d, misconception: "circle-diameter-as-radius" }]),
      { value: useR ? (d / 2) ** 2 : (d / 2) ** 2, misconception: "circle-used-area-formula" },
    ]),
    hints: [useR ? `Circumference = π × d. The radius is ${d / 2}, so the diameter is ${d}.` : `Circumference = π × d, and d = ${d}.`, "Don't work out π: write the number, then π."],
    solution: [...(useR ? [`d = 2 × ${d / 2} = ${d} ${u}.`] : []), `C = π × ${d} = ${d}π ${u}.`],
  };
};

// ================================================================ semicircles and composite shapes

const composite: Gen = (r, tier) => {
  const u = unitFor(r, tier);
  const roll = r.next();
  if (tier === 2 && roll < 0.25) {
    const h = 2 * r.int(2, 6);
    const w = r.int(h / 2 + 2, 14);
    const exact = w * h + (PI * (h / 2) ** 2) / 2;
    return {
      prompt: `This shape is a rectangle with a semicircle on one end. Find its area. Give your answer to 1 decimal place.`,
      visual: plane(rectSemi(w, h, `${w} ${u}`, `${h} ${u}`)),
      ...decimalQ(exact, [
        { value: w * h + PI * (h / 2) ** 2, misconception: "comp-forgot-halve" },
        { value: w * h + (PI * h * h) / 2, misconception: "circle-diameter-as-radius" },
        { value: w * h - (PI * (h / 2) ** 2) / 2, misconception: "comp-added" },
      ]),
      hints: ["Split it into the rectangle and the semicircle. Find each area, then add.", `The semicircle's diameter is ${h}, so its radius is ${h / 2}.`],
      solution: [`Rectangle: ${w} × ${h} = ${w * h} ${u}².`, `Semicircle: π × ${h / 2}² ÷ 2 = ${fix3((PI * (h / 2) ** 2) / 2)}`, `Total = ${fix3(exact)} = ${r1(exact)} ${u}² (1 d.p.)`],
    };
  }
  if (tier === 2 && roll < 0.45) {
    const s = r.int(3, 12);
    const exact = s * s - (PI * s * s) / 4;
    return {
      prompt: `A quarter circle is cut out of a square, as shown. Find the area of the shaded part. Give your answer to 1 decimal place.`,
      visual: plane(squareMinusQuarter(s, `${s} ${u}`)),
      ...decimalQ(exact, [
        { value: (PI * s * s) / 4, misconception: "comp-shaded-wrong" },
        { value: s * s + (PI * s * s) / 4, misconception: "comp-added" },
        { value: s * s - (PI * s * s) / 2, misconception: "comp-quarter-as-half" },
      ]),
      hints: ["Shaded = square − quarter circle.", `The quarter circle has radius ${s}: its area is π × ${s}² ÷ 4.`],
      solution: [`Square: ${s} × ${s} = ${s * s} ${u}².`, `Quarter circle: π × ${s}² ÷ 4 = ${fix3((PI * s * s) / 4)}`, `Shaded = ${s * s} − ${fix3((PI * s * s) / 4)} = ${r1(exact)} ${u}² (1 d.p.)`],
    };
  }
  const part = r.next() < 0.55 ? ("half" as const) : ("quarter" as const);
  const perim = r.next() < 0.45;
  if (part === "half") {
    const d = 2 * r.int(2, tier === 1 ? 10 : 15);
    const rr = d / 2;
    const pic = plane(circlePart("half", rr, `${d} ${u}`, "diameter"));
    if (perim) {
      const exact = (PI * d) / 2 + d;
      return {
        prompt: `Find the perimeter of this semicircle. Give your answer to 1 decimal place.`,
        visual: pic,
        ...decimalQ(exact, [
          { value: (PI * d) / 2, misconception: "comp-perim-no-straight" },
          { value: PI * d + d, misconception: "comp-perim-whole-circle" },
          { value: PI * d, misconception: "comp-perim-whole-circle" },
        ]),
        hints: ["The perimeter is the curved part plus the straight diameter.", `Curved part: half of π × ${d}.`],
        solution: [`Curved part: π × ${d} ÷ 2 = ${fix3((PI * d) / 2)}`, `Add the diameter: + ${d}.`, `Perimeter = ${fix3(exact)} = ${r1(exact)} ${u} (1 d.p.)`],
      };
    }
    const exact = (PI * rr * rr) / 2;
    return {
      prompt: `Find the area of this semicircle. Give your answer to 1 decimal place.`,
      visual: pic,
      ...decimalQ(exact, [
        { value: PI * rr * rr, misconception: "comp-forgot-halve" },
        { value: (PI * d * d) / 2, misconception: "circle-diameter-as-radius" },
        { value: (PI * d) / 2, misconception: "circle-used-circumference" },
      ]),
      hints: [`The diameter is ${d}, so the radius is ${rr}.`, `Whole circle: π × ${rr}². Then halve it.`],
      solution: [`r = ${d} ÷ 2 = ${rr} ${u}.`, `Whole circle: π × ${rr}² = ${fix3(PI * rr * rr)}`, `Semicircle: ÷ 2 = ${r1(exact)} ${u}² (1 d.p.)`],
    };
  }
  const rr = r.int(2, tier === 1 ? 10 : 15);
  const pic = plane(circlePart("quarter", rr, `${rr} ${u}`));
  if (perim) {
    const exact = (PI * rr) / 2 + 2 * rr;
    return {
      prompt: `Find the perimeter of this quarter circle. Give your answer to 1 decimal place.`,
      visual: pic,
      ...decimalQ(exact, [
        { value: (PI * rr) / 2, misconception: "comp-perim-no-straight" },
        { value: (PI * rr) / 2 + rr, misconception: "comp-perim-no-straight" },
        { value: 2 * PI * rr + 2 * rr, misconception: "comp-perim-whole-circle" },
      ]),
      hints: ["The perimeter is the curved part plus two straight radii.", `Curved part: a quarter of 2 × π × ${rr}.`],
      solution: [`Curved part: 2 × π × ${rr} ÷ 4 = ${fix3((PI * rr) / 2)}`, `Add two radii: + ${rr} + ${rr}.`, `Perimeter = ${r1(exact)} ${u} (1 d.p.)`],
    };
  }
  const exact = (PI * rr * rr) / 4;
  return {
    prompt: `Find the area of this quarter circle. Give your answer to 1 decimal place.`,
    visual: pic,
    ...decimalQ(exact, [
      { value: (PI * rr * rr) / 2, misconception: "comp-quarter-as-half" },
      { value: PI * rr * rr, misconception: "comp-forgot-halve" },
      { value: (PI * rr) / 2, misconception: "circle-used-circumference" },
    ]),
    hints: [`Find the whole circle's area: π × ${rr}².`, "Then divide by 4."],
    solution: [`Whole circle: π × ${rr}² = ${fix3(PI * rr * rr)}`, `Quarter: ÷ 4 = ${r1(exact)} ${u}² (1 d.p.)`],
  };
};

// ================================================================ arcs and sectors

const NICE_ANGLES = [30, 45, 60, 72, 90, 120, 135, 150, 240, 270];

function simplestFraction(a: number, b: number): string {
  const g = (x: number, y: number): number => (y === 0 ? x : g(y, x % y));
  const k = g(a, b);
  return `${a / k}/${b / k}`;
}

const sectors: Gen = (r, tier) => {
  const u = unitFor(r, tier);
  const angle = tier === 1 ? r.pick(NICE_ANGLES) : 5 * r.int(5, 66);
  const rr = r.int(3, tier === 1 ? 12 : 20);
  const pic = plane(sectorPic(angle, rr, `${rr} ${u}`, `${angle}°`));
  const f = angle / 360;
  const fr = `${angle}/360`;
  const simple = simplestFraction(angle, 360);
  const roll = r.next();
  if (tier === 2 && roll < 0.3) {
    const arc = f * 2 * PI * rr;
    const exact = arc + 2 * rr;
    return {
      prompt: `Find the perimeter of this sector. Give your answer to 1 decimal place.`,
      visual: pic,
      ...decimalQ(exact, [
        { value: arc, misconception: "sector-perim-arc-only" },
        { value: arc + rr, misconception: "sector-perim-arc-only" },
        { value: 2 * PI * rr + 2 * rr, misconception: "sector-forgot-fraction" },
      ]),
      hints: ["Perimeter = arc length + the two radii.", `Arc length = ${fr} × 2 × π × ${rr}.`],
      solution: [`Arc = ${fr} × 2 × π × ${rr} = ${fix3(arc)}`, `Add the radii: + ${rr} + ${rr}.`, `Perimeter = ${r1(exact)} ${u} (1 d.p.)`],
    };
  }
  if (roll < 0.55) {
    const exact = f * PI * rr * rr;
    return {
      prompt: `Find the area of this sector. Give your answer to 1 decimal place.`,
      visual: pic,
      ...decimalQ(exact, [
        { value: PI * rr * rr, misconception: "sector-forgot-fraction" },
        ...(angle !== 100 ? [{ value: (angle / 100) * PI * rr * rr, misconception: "sector-percent" }] : []),
        { value: f * 2 * PI * rr, misconception: "sector-used-arc" },
      ]),
      hints: [`The sector is ${fr}${simple !== fr ? ` (that's ${simple})` : ""} of the whole circle.`, `Area = ${fr} × π × ${rr}².`],
      solution: [`Whole circle: π × ${rr}² = ${fix3(PI * rr * rr)}`, `Sector: × ${fr} = ${fix3(exact)}`, `= ${r1(exact)} ${u}² (1 d.p.)`],
    };
  }
  const exact = f * 2 * PI * rr;
  return {
    prompt: `Find the arc length of this sector (the curved edge). Give your answer to 1 decimal place.`,
    visual: pic,
    ...decimalQ(exact, [
      { value: 2 * PI * rr, misconception: "sector-forgot-fraction" },
      { value: f * PI * rr * rr, misconception: "sector-used-area" },
      { value: f * PI * rr, misconception: "circle-radius-in-pi-d" },
      ...(angle !== 100 ? [{ value: (angle / 100) * 2 * PI * rr, misconception: "sector-percent" }] : []),
    ]),
    hints: [`The arc is ${fr}${simple !== fr ? ` (that's ${simple})` : ""} of the whole circumference.`, `Arc length = ${fr} × 2 × π × ${rr}.`],
    solution: [`Whole circumference: 2 × π × ${rr} = ${fix3(2 * PI * rr)}`, `Arc: × ${fr} = ${fix3(exact)}`, `= ${r1(exact)} ${u} (1 d.p.)`],
  };
};

// ================================================================ spheres, cones and pyramids

const TRIPLES: [number, number, number][] = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [9, 12, 15],
  [8, 15, 17],
  [7, 24, 25],
];

const spheresCones: Gen = (r, tier) => {
  const u = unitFor(r, tier);
  const roll = r.next();
  const kind = tier === 1 ? (roll < 0.25 ? "pyramid" : roll < 0.5 ? "cone" : roll < 0.75 ? "sphereV" : "sphereA") : roll < 0.15 ? "pyramid" : roll < 0.35 ? "cone" : roll < 0.5 ? "sphereV" : roll < 0.62 ? "sphereA" : roll < 0.84 ? "coneSA" : "hemi";

  if (kind === "pyramid") {
    const s = r.int(3, 10);
    const h = 3 * r.int(1, 5);
    const V = (s * s * h) / 3;
    const solid: SolidSpec = { kind: "pyramid", base: "square", size: s, h, baseText: `${s} ${u}`, hText: `${h} ${u}`, description: `A square-based pyramid. The base is ${s} ${u} by ${s} ${u}; the perpendicular height is ${h} ${u}.` };
    return {
      prompt: `Find the volume of this square-based pyramid. Volume of a pyramid = ⅓ × base area × height. Give your answer in ${u}³.`,
      visual: { kind: "solid", solid },
      answer: { kind: "integer", value: V },
      answerHelp: NUM_HELP,
      wrongAnswers: cleanExact(V, [
        { value: s * s * h, misconception: "scp-forgot-third" },
        { value: (s * s * h) / 2, misconception: "scp-forgot-third" },
        { value: (s * h) / 3, misconception: "scp-r-not-squared" },
      ]),
      hints: [`Base area = ${s} × ${s} = ${s * s}.`, `Volume = ⅓ × ${s * s} × ${h}: multiply, then divide by 3.`],
      solution: [`Base area = ${s} × ${s} = ${s * s} ${u}².`, `${s * s} × ${h} = ${s * s * h}.`, `⅓ of that: ${s * s * h} ÷ 3 = ${V} ${u}³.`],
    };
  }
  if (kind === "cone") {
    const rr = r.int(2, 9);
    const triple = tier === 2 ? r.pick(TRIPLES.filter((t) => t[0] <= 9)) : undefined;
    const h = triple ? triple[1] : r.int(3, 15);
    const rad0 = triple ? triple[0] : rr;
    const l = triple?.[2];
    const exact = (PI * rad0 * rad0 * h) / 3;
    const solid: SolidSpec = { kind: "cone", r: rad0, h, rText: `${rad0} ${u}`, hText: `${h} ${u}`, slantText: l ? `${l} ${u}` : undefined, description: `A cone with radius ${rad0} ${u} and perpendicular height ${h} ${u}${l ? `; the slant height is ${l} ${u}` : ""}.` };
    return {
      prompt: `Find the volume of this cone. Volume of a cone = ⅓ × π × r² × h. Give your answer to 1 decimal place.`,
      visual: { kind: "solid", solid },
      ...decimalQ(exact, [
        { value: PI * rad0 * rad0 * h, misconception: "scp-forgot-third" },
        { value: (PI * rad0 * h) / 3, misconception: "scp-r-not-squared" },
        ...(l ? [{ value: (PI * rad0 * rad0 * l) / 3, misconception: "scp-slant-height" }] : []),
      ]),
      hints: [l ? `Use the perpendicular height h = ${h}, not the slant height.` : `r = ${rad0} and h = ${h}.`, `⅓ × π × ${rad0}² × ${h}: square the radius first.`],
      solution: [`r² = ${rad0 * rad0}.`, `π × ${rad0 * rad0} × ${h} = ${fix3(PI * rad0 * rad0 * h)}`, `⅓ of that = ${fix3(exact)} = ${r1(exact)} ${u}³ (1 d.p.)`],
    };
  }
  if (kind === "coneSA") {
    const [rad0, h, l] = r.pick(TRIPLES.filter((t) => t[0] <= 9));
    const total = r.next() < 0.5;
    const curved = PI * rad0 * l;
    const exact = total ? curved + PI * rad0 * rad0 : curved;
    const solid: SolidSpec = { kind: "cone", r: rad0, h, rText: `${rad0} ${u}`, hText: `${h} ${u}`, slantText: `${l} ${u}`, description: `A cone with radius ${rad0} ${u}, perpendicular height ${h} ${u} and slant height ${l} ${u}.` };
    return {
      prompt: total
        ? `Find the total surface area of this cone. Curved surface area of a cone = π × r × l, where l is the slant height. Give your answer to 1 decimal place.`
        : `Find the curved surface area of this cone. Curved surface area = π × r × l, where l is the slant height. Give your answer to 1 decimal place.`,
      visual: { kind: "solid", solid },
      ...decimalQ(exact, [
        { value: PI * rad0 * h + (total ? PI * rad0 * rad0 : 0), misconception: "scp-slant-height" },
        ...(total ? [{ value: curved, misconception: "scp-forgot-base" }] : [{ value: curved + PI * rad0 * rad0, misconception: "scp-area-vol" }]),
      ]),
      hints: [`l is the slant height, down the sloping side: ${l}.`, total ? "Add the circle on the base: π × r²." : `π × ${rad0} × ${l}.`],
      solution: [`Curved surface = π × ${rad0} × ${l} = ${fix3(curved)}`, ...(total ? [`Base = π × ${rad0}² = ${fix3(PI * rad0 * rad0)}`, `Total = ${fix3(exact)}`] : []), `= ${r1(exact)} ${u}² (1 d.p.)`],
    };
  }
  const rr = r.int(2, 10);
  if (kind === "sphereA") {
    const exact = 4 * PI * rr * rr;
    return {
      prompt: `Find the surface area of this sphere. Surface area of a sphere = 4 × π × r². Give your answer to 1 decimal place.`,
      visual: { kind: "solid", solid: { kind: "sphere", r: rr, rText: `${rr} ${u}`, description: `A sphere with radius ${rr} ${u}.` } },
      ...decimalQ(exact, [
        { value: PI * rr * rr, misconception: "scp-forgot-4" },
        { value: (4 / 3) * PI * rr ** 3, misconception: "scp-area-vol" },
        { value: 4 * PI * rr, misconception: "scp-r-power" },
      ]),
      hints: [`Square the radius: ${rr}² = ${rr * rr}.`, `Then 4 × π × ${rr * rr}.`],
      solution: [`r² = ${rr * rr}.`, `4 × π × ${rr * rr} = ${fix3(exact)}`, `= ${r1(exact)} ${u}² (1 d.p.)`],
    };
  }
  const half = kind === "hemi";
  const exact = ((half ? 2 : 4) / 3) * PI * rr ** 3;
  return {
    prompt: half
      ? `Find the volume of this hemisphere (half a sphere). Volume of a sphere = 4/3 × π × r³. Give your answer to 1 decimal place.`
      : `Find the volume of this sphere. Volume of a sphere = 4/3 × π × r³. Give your answer to 1 decimal place.`,
    visual: { kind: "solid", solid: { kind: "sphere", r: rr, half, rText: `${rr} ${u}`, description: `A ${half ? "hemisphere" : "sphere"} with radius ${rr} ${u}.` } },
    ...decimalQ(exact, [
      ...(half ? [{ value: (4 / 3) * PI * rr ** 3, misconception: "scp-hemisphere-full" }] : []),
      { value: ((half ? 2 : 4) / 3) * PI * rr * rr, misconception: "scp-r-power" },
      { value: (half ? 2 : 4) * PI * rr * rr, misconception: "scp-area-vol" },
    ]),
    hints: [`Cube the radius: ${rr} × ${rr} × ${rr} = ${rr ** 3}.`, half ? `4/3 × π × ${rr ** 3}, then halve it.` : `Then 4/3 × π × ${rr ** 3}: multiply by 4, divide by 3, times π.`],
    solution: [`r³ = ${rr ** 3}.`, `4/3 × π × ${rr ** 3} = ${fix3((4 / 3) * PI * rr ** 3)}`, ...(half ? [`Half of that = ${fix3(exact)}`] : []), `= ${r1(exact)} ${u}³ (1 d.p.)`],
  };
};

// ================================================================ area and volume units

/** A 1 cm square split into 1 mm squares. */
export function cmSquarePic(): PlaneSpec {
  return {
    x: [0, 10],
    y: [0, 10],
    grid: true,
    shapes: [{ points: [[0, 0], [10, 0], [10, 10], [0, 10]], tone: "outline" }],
    lengths: [{ a: [0, 0], b: [10, 0], text: "1 cm = 10 mm" }],
    description: "A square 1 cm by 1 cm, split into 10 rows of 10 small squares, each 1 mm by 1 mm.",
  };
}

export const cubeSolid = (text: string, n: number): SolidSpec => ({
  kind: "prism",
  face: { points: [[0, 0], [n, 0], [n, n], [0, n]], sides: [{ i: 0, text }, { i: 3, text }], description: "" },
  length: n,
  lengthText: text,
  description: `A cube with edges ${text}.`,
});

function unitsQ(r: Rng, tier: Tier): Q {
  const roll = r.next();
  if (tier === 2 && roll < 0.22) {
    const [a, b, c] = [10 * r.int(1, 6), 10 * r.int(1, 5), 10 * r.int(1, 4)];
    const V = a * b * c;
    const L = V / 1000;
    return {
      prompt: `A fish tank is a cuboid ${a} cm by ${b} cm by ${c} cm. How many litres of water does it hold when full? (1 litre = 1000 cm³)`,
      visual: { kind: "solid", solid: { kind: "prism", face: { points: [[0, 0], [a, 0], [a, c], [0, c]], sides: [{ i: 0, text: `${a} cm` }, { i: 3, text: `${c} cm` }], description: "" }, length: b, lengthText: `${b} cm`, description: `A cuboid ${a} cm wide, ${c} cm tall and ${b} cm deep.` } },
      answer: { kind: "integer", value: L },
      answerHelp: NUM_HELP,
      wrongAnswers: cleanExact(L, [
        { value: V, misconception: "units-not-converted" },
        { value: V / 100, misconception: "units-litre" },
        { value: V * 1000, misconception: "units-direction" },
      ]),
      hints: [`Volume = ${a} × ${b} × ${c} cm³.`, "Then divide by 1000 to change cm³ to litres."],
      solution: [`Volume = ${a} × ${b} × ${c} = ${big(V)} cm³.`, `${big(V)} ÷ 1000 = ${big(L)} litres.`],
    };
  }
  const pick = tier === 1 ? r.pick(["cm2mm2", "m2cm2", "cm3mm3", "litres"] as const) : r.pick(["mm2cm2", "m2cm2", "cm3mm3", "m3cm3", "litres", "m3litres"] as const);
  const build = (prompt: string, value: number, wrong: Wrong[], hints: string[], solution: string[], visual?: Visual): Q => ({
    prompt,
    visual,
    answer: Number.isInteger(value) ? { kind: "integer", value } : { kind: "decimal", exact: value, dp: 1, strict: true },
    answerHelp: NUM_HELP,
    wrongAnswers: cleanExact(value, wrong),
    hints,
    solution,
  });
  if (pick === "cm2mm2") {
    const n = r.int(2, 60);
    return build(`Change ${n} cm² to mm².`, n * 100, [{ value: n * 10, misconception: "units-area-linear" }, ...(n % 100 === 0 ? [{ value: n / 100, misconception: "units-direction" }] : [])], ["1 cm = 10 mm, so 1 cm² is 10 mm × 10 mm.", "1 cm² = 100 mm². Multiply by 100."], [`1 cm² = 10 × 10 = 100 mm².`, `${n} × 100 = ${big(n * 100)} mm².`], plane(cmSquarePic()));
  }
  if (pick === "mm2cm2") {
    const n = 100 * r.int(2, 90);
    return build(`Change ${big(n)} mm² to cm².`, n / 100, [{ value: n / 10, misconception: "units-area-linear" }, { value: n * 100, misconception: "units-direction" }], ["1 cm² = 100 mm².", "Going to bigger units, divide by 100."], [`1 cm² = 10 × 10 = 100 mm².`, `${big(n)} ÷ 100 = ${n / 100} cm².`], plane(cmSquarePic()));
  }
  if (pick === "m2cm2") {
    const n = r.int(2, 9);
    return build(`Change ${n} m² to cm².`, n * 10000, [{ value: n * 100, misconception: "units-area-linear" }, { value: n * 1000, misconception: "units-area-linear" }], ["1 m = 100 cm, so 1 m² is 100 cm × 100 cm.", "1 m² = 10,000 cm²."], [`1 m² = 100 × 100 = 10,000 cm².`, `${n} × 10,000 = ${big(n * 10000)} cm².`]);
  }
  if (pick === "cm3mm3") {
    const n = r.int(2, 20);
    return build(`Change ${n} cm³ to mm³.`, n * 1000, [{ value: n * 10, misconception: "units-vol-linear" }, { value: n * 100, misconception: "units-vol-linear" }], ["1 cm = 10 mm, so 1 cm³ is 10 mm × 10 mm × 10 mm.", "1 cm³ = 1000 mm³."], [`1 cm³ = 10 × 10 × 10 = 1000 mm³.`, `${n} × 1000 = ${big(n * 1000)} mm³.`], { kind: "solid", solid: cubeSolid("10 mm", 2) });
  }
  if (pick === "m3cm3") {
    const n = r.int(2, 5);
    return build(`Change ${n} m³ to cm³.`, n * 1e6, [{ value: n * 100, misconception: "units-vol-linear" }, { value: n * 10000, misconception: "units-vol-linear" }, { value: n * 1000, misconception: "units-vol-linear" }], ["1 m = 100 cm, so 1 m³ is 100 cm × 100 cm × 100 cm.", "1 m³ = 1,000,000 cm³."], [`1 m³ = 100 × 100 × 100 = 1,000,000 cm³.`, `${n} × 1,000,000 = ${big(n * 1e6)} cm³.`]);
  }
  if (pick === "m3litres") {
    const n = r.int(2, 12);
    return build(`A skip holds ${n} m³. How many litres is that? (1 litre = 1000 cm³)`, n * 1000, [{ value: n * 100, misconception: "units-litre" }, { value: n * 1e6, misconception: "units-litre" }], ["1 m³ = 1,000,000 cm³, and 1000 cm³ make 1 litre.", "So 1 m³ = 1000 litres."], ["1 m³ = 1,000,000 cm³ = 1,000,000 ÷ 1000 = 1000 litres.", `${n} × 1000 = ${big(n * 1000)} litres.`]);
  }
  const n = tier === 1 ? r.int(2, 30) : r.int(2, 95);
  const cm3 = n * (tier === 1 ? 1000 : 100);
  const L = cm3 / 1000;
  return build(`A jug holds ${big(cm3)} cm³ of water. How many litres is that?`, L, [{ value: cm3 / 100, misconception: "units-litre" }, { value: cm3 * 1000, misconception: "units-direction" }], ["1 litre = 1000 cm³.", "Going to bigger units, divide by 1000."], [`1 litre = 1000 cm³.`, `${big(cm3)} ÷ 1000 = ${L} litres.`]);
}

const units: Gen = (r, tier) => unitsQ(r, tier);

export const MENSURATION_GENERATORS: Record<string, Gen> = {
  "geo-exact-pi": exactPi,
  "geo-circle-composite": composite,
  "geo-arcs-sectors": sectors,
  "geo-spheres-cones-pyramids": spheresCones,
  "geo-area-volume-units": units,
};
