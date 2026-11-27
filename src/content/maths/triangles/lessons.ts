/**
 * Lesson content for Pythagoras, trigonometry, congruence and similar shapes
 * (six stages, like every chain). Practice and check questions come from
 * generators.ts. Worked example diagrams use the same builders, so they are
 * drawn to scale too.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher before Verified.
 */

import type { Lesson } from "@/content/lesson-types";
import type { AngleSpec, SkillId } from "@/engine/types";
import { len, pose, rectPts, rightTriangle, triASA, triSAS, twoShapes } from "./geometry";
import { dirPt } from "../angles/geometry";

const angles = (spec: AngleSpec) => ({ kind: "angles" as const, angles: spec });

/** A right triangle with the angle θ (or a size) at the base corner, built from its adjacent and opposite sides. */
const trig = (adj: number, opp: number, texts: { adj?: string; opp?: string; hyp?: string }, angleText: string, description: string) =>
  rightTriangle(adj, opp, { sides: { base: texts.adj, height: texts.opp, hyp: texts.hyp }, angle: { at: "base", text: angleText, highlight: true }, description });

const rad = (d: number) => (d * Math.PI) / 180;

/** Triangle ADE inside ABC with DE parallel to BC (AD = 4, DB = 2, DE = 6, so BC = 9). */
function nestedExample(): AngleSpec {
  const B: [number, number] = [0, 0];
  const C: [number, number] = [9, 0];
  const A = dirPt(65, 6, B);
  const at = (p: [number, number], q: [number, number], t: number): [number, number] => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  return {
    points: { A, B, C, D: at(A, B, 4 / 6), E: at(A, C, 4 / 6) },
    segments: [
      ["A", "B"],
      ["B", "C"],
      ["C", "A"],
      ["D", "E"],
    ],
    polygon: ["A", "B", "C"],
    polygons: [["A", "D", "E"]],
    angles: [],
    arrows: [
      { a: "D", b: "E", n: 1 },
      { a: "B", b: "C", n: 1 },
    ],
    lengths: [
      { a: "A", b: "D", text: "4 cm" },
      { a: "D", b: "B", text: "2 cm" },
      { a: "D", b: "E", text: "6 cm" },
      { a: "B", b: "C", text: "x" },
    ],
    labels: ["A", "B", "C", "D", "E"],
    description: "Triangle ABC with DE parallel to BC. AD is 4 cm, DB is 2 cm, DE is 6 cm and BC is marked x.",
  };
}

export const TRIANGLE_LESSONS: Record<SkillId, Lesson> = {
  "geo-pythagoras": {
    skillId: "geo-pythagoras",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Pythagoras' theorem finds a missing side of any right-angled triangle. Builders, game designers and sat-navs use it to work out distances, and it turns up on almost every GCSE paper.",
      byTheEnd: ["Spot the hypotenuse of a right-angled triangle.", "Find the hypotenuse from the two shorter sides.", "Find a shorter side from the hypotenuse and the other side."],
    },
    teaching: {
      paragraphs: [
        "Pythagoras' theorem only works in right-angled triangles. The longest side is called the hypotenuse. It is always opposite the right angle: it's the side that doesn't touch the little square.",
        "Draw a square on each side of the triangle. The two smaller squares always add up to exactly the big square. That's the theorem: a² + b² = c², where c is the hypotenuse.",
        "To find the hypotenuse: square the two shorter sides, add them, then square root. The answer must be longer than both of the other sides.",
        "To find a shorter side: square the hypotenuse, take away the square of the other side, then square root. The answer must be shorter than the hypotenuse.",
        "Before you start, always ask: is the side I want the hypotenuse? If yes, add. If no, subtract.",
      ],
      demo: "pythagoras-squares",
      examples: [
        {
          question: "Find the length of the side marked x.",
          visual: angles(rightTriangle(6, 8, { sides: { base: "6 cm", height: "8 cm", hyp: "x" }, description: "A right-angled triangle with shorter sides 6 cm and 8 cm. The hypotenuse is marked x." })),
          steps: ["x is opposite the right angle, so it's the hypotenuse. Add.", "x² = 6² + 8² = 36 + 64 = 100", "x = √100 = 10 cm", "Check: 10 cm is longer than 6 cm and 8 cm ✓"],
        },
        {
          question: "Find the length of the side marked x. Give your answer to 1 decimal place.",
          visual: angles(rightTriangle(Math.sqrt(96), 5, { sides: { base: "x", height: "5 cm", hyp: "11 cm" }, description: "A right-angled triangle with hypotenuse 11 cm, one shorter side 5 cm and the other shorter side marked x." })),
          steps: ["x is a shorter side (the hypotenuse is 11 cm). Subtract.", "x² = 11² − 5² = 121 − 25 = 96", "x = √96 = 9.7979…", "x = 9.8 cm (to 1 decimal place)"],
        },
      ],
    },
    counts: { guided: 6, independent: 6, check: 5 },
  },

  "geo-trig-sides": {
    skillId: "geo-trig-sides",
    status: "draft",
    minutes: 30,
    intro: {
      whyItMatters:
        "Pythagoras needs two sides. Trigonometry needs just one side and one angle. It's how surveyors measure the height of a building or a mountain without climbing it.",
      byTheEnd: ["Label the opposite, adjacent and hypotenuse from an angle.", "Choose sin, cos or tan using SOH CAH TOA.", "Find a missing side, rounding to 1 decimal place."],
    },
    teaching: {
      paragraphs: [
        "Step 1: label the sides from the angle you're given. The hypotenuse (H) is opposite the right angle. The opposite (O) is across from the angle. The adjacent (A) is next to the angle, and isn't the hypotenuse.",
        "Step 2: choose the ratio with SOH CAH TOA. Look at the side you know and the side you want. O and H: sin (SOH, sin = O ÷ H). A and H: cos (CAH, cos = A ÷ H). O and A: tan (TOA, tan = O ÷ A).",
        "Step 3: put the numbers in and solve. If x is on top, like sin 35° = x ÷ 12, multiply: x = 12 × sin 35°. If x is on the bottom, like sin 35° = 7 ÷ x, divide: x = 7 ÷ sin 35°.",
        "For a triangle with a fixed angle, these ratios never change, however big the triangle is. That's why they work. Try it in the demo below.",
        "Check your calculator is in degrees: you should see D or DEG at the top. If it shows R or RAD, your answers will be wrong.",
      ],
      demo: "trig-ratio-explore",
      examples: [
        {
          question: "Find the length of the side marked x. Give your answer to 1 decimal place.",
          visual: angles(trig(12 * Math.cos(rad(35)), 12 * Math.sin(rad(35)), { hyp: "12 cm", opp: "x" }, "35°", "A right-angled triangle with an angle of 35°. The hypotenuse is 12 cm and the side opposite the 35° angle is marked x.")),
          steps: ["From 35°: 12 cm is the hypotenuse (H), x is the opposite (O).", "O and H: use sin. sin 35° = x ÷ 12", "x is on top, so multiply: x = 12 × sin 35° = 6.8829…", "x = 6.9 cm (to 1 decimal place)"],
        },
        {
          question: "Find the length of the side marked x. Give your answer to 1 decimal place.",
          visual: angles(trig(8, 8 * Math.tan(rad(50)), { adj: "8 cm", hyp: "x" }, "50°", "A right-angled triangle with an angle of 50°. The side next to the angle is 8 cm and the hypotenuse is marked x.")),
          steps: ["From 50°: 8 cm is the adjacent (A), x is the hypotenuse (H).", "A and H: use cos. cos 50° = 8 ÷ x", "x is on the bottom, so divide: x = 8 ÷ cos 50° = 12.4458…", "x = 12.4 cm (to 1 decimal place)"],
        },
      ],
    },
    counts: { guided: 6, independent: 6, check: 5 },
  },

  "geo-trig-angles": {
    skillId: "geo-trig-angles",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters: "If you know two sides of a right-angled triangle, you can find its angles. It's how the slope of a ramp or a roof is worked out, and it checks that a ladder is safe.",
      byTheEnd: ["Choose sin, cos or tan from the two sides you know.", "Use sin⁻¹, cos⁻¹ or tan⁻¹ on a calculator.", "Give an angle to 1 decimal place."],
    },
    teaching: {
      paragraphs: [
        "Label the sides from the angle you want (call it θ, the Greek letter theta). Then choose the ratio with SOH CAH TOA, just like before.",
        "Write the ratio as a division: for example, tan θ = 5 ÷ 8. That gives you the tan of the angle, not the angle itself.",
        "To turn it into the angle, use the inverse: tan⁻¹ (said 'inverse tan'). On most calculators press SHIFT, then tan, then type (5 ÷ 8). So θ = tan⁻¹(5 ÷ 8) = 32.0°.",
        "Sense-check: the angle must be between 0° and 90°. The biggest angle (not counting the right angle) is opposite the longest of the two shorter sides.",
      ],
      demo: "trig-angle-finder",
      examples: [
        {
          question: "Find the angle θ. Give your answer to 1 decimal place.",
          visual: angles(trig(8, 5, { adj: "8 cm", opp: "5 cm" }, "θ", "A right-angled triangle with the angle θ marked. The side opposite θ is 5 cm and the side next to θ is 8 cm.")),
          steps: ["From θ: 5 cm is the opposite (O), 8 cm is the adjacent (A).", "O and A: use tan. tan θ = 5 ÷ 8", "θ = tan⁻¹(5 ÷ 8) = 32.0053…°", "θ = 32.0° (to 1 decimal place)"],
        },
        {
          question: "Find the angle θ. Give your answer to 1 decimal place.",
          visual: angles(trig(7, Math.sqrt(15 * 15 - 49), { adj: "7 cm", hyp: "15 cm" }, "θ", "A right-angled triangle with the angle θ marked. The side next to θ is 7 cm and the hypotenuse is 15 cm.")),
          steps: ["From θ: 7 cm is the adjacent (A), 15 cm is the hypotenuse (H).", "A and H: use cos. cos θ = 7 ÷ 15", "θ = cos⁻¹(7 ÷ 15) = 62.1818…°", "θ = 62.2° (to 1 decimal place)"],
        },
      ],
    },
    counts: { guided: 6, independent: 6, check: 5 },
  },

  "geo-exact-trig": {
    skillId: "geo-exact-trig",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters: "On the non-calculator paper you still need sin, cos and tan of 0°, 30°, 45°, 60° and 90°. You don't have to memorise a table: two simple triangles give you every value.",
      byTheEnd: ["Draw the two special triangles from memory.", "Read off exact values of sin, cos and tan.", "Use exact values to find sides without a calculator."],
    },
    teaching: {
      paragraphs: [
        "Triangle 1: cut a square with sides 1 along its diagonal. You get a right-angled triangle with two 45° angles. The short sides are 1 and 1, and the hypotenuse is √2 (by Pythagoras). So sin 45° = cos 45° = 1/√2, written √2/2, and tan 45° = 1 ÷ 1 = 1.",
        "Triangle 2: cut an equilateral triangle with sides 2 in half. You get angles 30°, 60° and 90°. The hypotenuse is 2, the short side is 1 (opposite 30°), and the other side is √3 (opposite 60°).",
        "From triangle 2: sin 30° = 1/2, cos 30° = √3/2, tan 30° = 1/√3 (written √3/3). sin 60° = √3/2, cos 60° = 1/2, tan 60° = √3. Notice sin and cos swap over between 30° and 60°.",
        "At the ends: sin 0° = 0, cos 0° = 1, tan 0° = 0. sin 90° = 1 and cos 90° = 0. Imagine the angle closing up to nothing (0°) or opening right up (90°).",
        "A useful pattern: sin 0°, 30°, 45°, 60°, 90° is √0/2, √1/2, √2/2, √3/2, √4/2. cos is the same list backwards.",
      ],
      demo: "exact-trig-triangles",
      examples: [
        {
          question: "Without a calculator, find the length of the side marked x.",
          visual: angles(trig(14 * Math.cos(rad(30)), 7, { hyp: "14 cm", opp: "x" }, "30°", "A right-angled triangle with an angle of 30°. The hypotenuse is 14 cm and the side opposite 30° is marked x.")),
          steps: ["From 30°: 14 cm is the hypotenuse, x is the opposite. Use sin.", "x = 14 × sin 30°", "sin 30° = 1/2, so x = 14 × 1/2 = 7 cm"],
        },
        {
          question: "Work out the exact value of 4 sin 30° + tan 45°.",
          steps: ["sin 30° = 1/2 and tan 45° = 1.", "4 × 1/2 + 1 = 2 + 1", "= 3"],
        },
      ],
    },
    counts: { guided: 6, independent: 6, check: 5 },
  },

  "geo-congruence": {
    skillId: "geo-congruence",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Congruent shapes are exact copies: the same shape and the same size, even if one is turned or flipped. Knowing when two triangles must be congruent lets you find sides and angles without measuring.",
      byTheEnd: ["Know the four tests: SSS, SAS, ASA and RHS.", "Say which test shows two triangles are congruent.", "Use congruent triangles to find a missing side or angle."],
    },
    teaching: {
      paragraphs: [
        "Two triangles are congruent if one fits exactly on top of the other. It can be turned (rotated) or flipped (reflected) first, but not stretched.",
        "You don't need to check all six measurements. Any one of these four tests is enough. SSS: all three pairs of sides are equal.",
        "SAS: two pairs of sides are equal, and the angle between them. It must be the angle between the two sides (the 'A' is in the middle of 'SAS').",
        "ASA: two pairs of angles are equal, and the side between them. RHS: both have a right angle, the hypotenuses are equal, and one other pair of sides is equal.",
        "Careful: three matching angles (AAA) is not a test. One triangle could be a bigger copy of the other, so they are similar, not congruent.",
        "In congruent triangles, matching sides are opposite matching angles. Use this to match them up when one triangle is turned or flipped.",
      ],
      demo: "congruence-tests",
      examples: [
        {
          question: "Are these two triangles congruent? Give the reason.",
          visual: angles(
            twoShapes(
              { pts: triSAS(8, 50, 6), names: ["A", "B", "C"], marks: { sides: [{ i: 0, text: "8 cm" }, { i: 2, text: "6 cm" }], angles: [{ i: 0, text: "50°" }] } },
              { pts: pose(triSAS(8, 50, 6), { rot: 150, flip: true }), names: ["D", "E", "F"], marks: { sides: [{ i: 0, text: "8 cm" }, { i: 2, text: "6 cm" }], angles: [{ i: 0, text: "50°" }] } },
              { description: "Two triangles, each with sides 8 cm and 6 cm and an angle of 50° between them. The second is turned and flipped." },
            ),
          ),
          steps: ["Both have sides 8 cm and 6 cm.", "The 50° angle is between those two sides in both.", "So they are congruent: SAS."],
        },
        {
          question: "These two triangles are congruent. Find the angle marked x.",
          visual: angles(
            twoShapes(
              { pts: triASA(70, 7, 45), names: ["A", "B", "C"], marks: { sides: [{ i: 0, text: "7 cm" }], angles: [{ i: 0, text: "70°" }, { i: 1, text: "45°" }] } },
              { pts: pose(triASA(70, 7, 45), { rot: 200 }), names: ["D", "E", "F"], marks: { sides: [{ i: 0, text: "7 cm" }], angles: [{ i: 0, text: "70°" }, { i: 2, text: "x" }] } },
              { description: "Two congruent triangles. The first has a 7 cm side with 70° and 45° at its ends. The second is turned; its 7 cm side has 70° at one end, and x is the angle opposite the 7 cm side." },
            ),
          ),
          steps: ["x is opposite the 7 cm side, so it matches the third angle of the first triangle.", "Angles in a triangle add up to 180°: 180° − 70° − 45° = 65°", "x = 65°"],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "geo-similar-shapes": {
    skillId: "geo-similar-shapes",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters: "Similar shapes are enlargements of each other: the same shape, different size. Maps, scale models and photos all use this, and it lets you find lengths you can't measure directly.",
      byTheEnd: ["Find the scale factor between two similar shapes.", "Use it to find a missing length.", "Spot a pair of similar triangles inside a bigger triangle."],
    },
    teaching: {
      paragraphs: [
        "Two shapes are similar if every length of one is multiplied by the same number to get the other. That number is the scale factor. The angles stay the same.",
        "To find the scale factor, find a pair of matching sides where you know both lengths. Divide the bigger shape's side by the smaller shape's side.",
        "To find a missing length on the bigger shape, multiply the matching side of the smaller shape by the scale factor. To go from big to small, divide.",
        "Watch out: adding the same amount to every side does not make a similar shape. A 2 × 4 rectangle and a 5 × 7 rectangle aren't similar (4 ÷ 2 = 2 but 7 ÷ 5 = 1.4).",
        "A line parallel to one side of a triangle cuts off a smaller similar triangle. The big triangle's side is the whole length, so add the parts together first.",
      ],
      demo: "similar-scale",
      examples: [
        {
          question: "These rectangles are similar. Find the length of the side marked x.",
          visual: angles(
            twoShapes(
              { pts: rectPts(4, 3), names: ["A", "B", "C", "D"], marks: { sides: [{ i: 0, text: len(4) }, { i: 1, text: len(3) }], angles: [0, 1, 2, 3].map((i) => ({ i, right: true })) } },
              { pts: rectPts(10, 7.5), names: ["P", "Q", "R", "S"], marks: { sides: [{ i: 0, text: len(10) }, { i: 1, text: "x" }], angles: [0, 1, 2, 3].map((i) => ({ i, right: true })) } },
              { description: "A rectangle 4 cm by 3 cm, and a similar rectangle 10 cm long with its height marked x." },
            ),
          ),
          steps: ["Matching sides: 4 cm and 10 cm.", "Scale factor = 10 ÷ 4 = 2.5", "x = 3 × 2.5 = 7.5 cm"],
        },
        {
          question: "DE is parallel to BC. Find the length of BC, marked x.",
          visual: angles(nestedExample()),
          steps: ["Triangles ADE and ABC are similar.", "AB = 4 + 2 = 6 cm (the whole side).", "Scale factor = AB ÷ AD = 6 ÷ 4 = 1.5", "x = 6 × 1.5 = 9 cm"],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },
};
