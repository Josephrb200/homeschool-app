/**
 * Pythagoras, trigonometry, congruence and similarity (GCSE Foundation G5, G6,
 * G19, G20, G21, R12). Skill ids and prerequisites copy the GCSE Foundation topic map.
 *
 * STATUS: Draft. Written by the build team; needs review by a qualified maths
 * teacher before it is marked Verified.
 */

import type { Misconception, Skill } from "@/engine/types";

export const TRIG_SKILLS: Skill[] = [
  {
    id: "geo-pythagoras",
    topic: "Similarity and trigonometry",
    name: "Pythagoras' theorem",
    objective: "I can use Pythagoras' theorem to find a missing side of a right-angled triangle.",
    typicalYear: 9,
    gcseTier: "foundation",
    prerequisites: ["num-powers-roots", "geo-triangle-quad-angles"],
  },
  {
    id: "geo-trig-sides",
    topic: "Similarity and trigonometry",
    name: "SOHCAHTOA: finding a missing side",
    objective: "I can label a right-angled triangle and use sin, cos or tan to find a missing side.",
    typicalYear: 10,
    gcseTier: "foundation",
    prerequisites: ["geo-pythagoras", "alg-rearrange"],
  },
  {
    id: "geo-trig-angles",
    topic: "Similarity and trigonometry",
    name: "SOHCAHTOA: finding a missing angle",
    objective: "I can use sin⁻¹, cos⁻¹ or tan⁻¹ to find a missing angle in a right-angled triangle.",
    typicalYear: 10,
    gcseTier: "foundation",
    prerequisites: ["geo-trig-sides"],
  },
  {
    id: "geo-exact-trig",
    topic: "Similarity and trigonometry",
    name: "Exact trig values (0°, 30°, 45°, 60°, 90°)",
    objective: "I know the exact values of sin, cos and tan for 0°, 30°, 45°, 60° and 90°, and can use them without a calculator.",
    typicalYear: 11,
    gcseTier: "foundation",
    prerequisites: ["geo-trig-angles"],
  },
];

export const SHAPE_PROOF_SKILLS: Skill[] = [
  {
    id: "geo-congruence",
    topic: "Shapes",
    name: "Congruent triangles (SSS, SAS, ASA, RHS)",
    objective: "I can say why two triangles are congruent (SSS, SAS, ASA or RHS) and use it to find missing sides and angles.",
    typicalYear: 10,
    gcseTier: "foundation",
    prerequisites: ["geo-shape-properties"],
  },
  {
    id: "geo-similar-shapes",
    topic: "Similarity and trigonometry",
    name: "Similar shapes: finding missing lengths",
    objective: "I can find the scale factor between similar shapes and use it to find missing lengths.",
    typicalYear: 10,
    gcseTier: "foundation",
    prerequisites: ["geo-enlargement", "ratio-direct-proportion"],
  },
];

export const TRIANGLE_SKILLS: Skill[] = [...TRIG_SKILLS, ...SHAPE_PROOF_SKILLS];

const mc = (id: string, label: string, explanation: string, pointsTo?: string): [string, Misconception] => [id, { id, label, explanation, pointsTo }];

export const TRIANGLE_MISCONCEPTIONS: Record<string, Misconception> = Object.fromEntries([
  // Pythagoras
  mc("pyth-added-sides", "Added the sides instead of their squares", "Pythagoras adds the squares of the sides, not the sides: square each short side, add, then square root. a² + b² = c²."),
  mc("pyth-no-root", "Forgot the square root", "That's c², the square of the side. The last step is to square root it to get the length itself."),
  mc("pyth-subtracted-for-hyp", "Subtracted when finding the hypotenuse", "The side you want is the hypotenuse (the longest side, opposite the right angle). To find it, add the squares of the two shorter sides."),
  mc("pyth-added-for-short", "Added when finding a shorter side", "The side you want is one of the shorter sides, so subtract: (hypotenuse)² − (other side)². Then square root. Adding gives a side longer than the hypotenuse, which can't happen."),
  mc("pyth-subtracted-sides", "Subtracted the sides instead of their squares", "Square both sides first, then subtract, then square root. Taking one side from the other doesn't work."),
  mc("pyth-squared-as-double", "Doubled instead of squaring", "Squaring means multiplying a number by itself: 7² = 7 × 7 = 49, not 7 × 2."),
  mc("pyth-hyp-longest", "Picked the wrong side as the hypotenuse", "The hypotenuse is the longest side. It is always opposite the right angle (it doesn't touch the little square)."),
  mc("pyth-converse", "Checked the wrong way round", "Square the two shorter sides and add them. If that equals the longest side squared, the triangle is right-angled. If not, it isn't."),

  // Trigonometry: sides
  mc("trig-side-names", "Mixed up the side names", "Label from the angle you're using. Hypotenuse: the longest side, opposite the right angle. Opposite: across from the angle. Adjacent: next to the angle, but not the hypotenuse."),
  mc("trig-choose-ratio", "Picked the wrong ratio", "Use SOH CAH TOA. Look at the two sides involved (the one you know and the one you want): Opposite and Hypotenuse → sin, Adjacent and Hypotenuse → cos, Opposite and Adjacent → tan."),
  mc("trig-wrong-ratio", "Used the wrong ratio", "Label the sides first, then pick the ratio from the two sides involved: O and H → sin, A and H → cos, O and A → tan."),
  mc("trig-multiply-divide", "Multiplied instead of dividing (or the other way)", "Write the ratio with the numbers in, like sin 35° = x ÷ 12. If x is on top, multiply. If x is on the bottom (like 7 ÷ x), divide: x = 7 ÷ sin 35°."),
  mc("trig-radians", "Calculator not in degrees", "That's the answer a calculator gives in radians mode. Check there's a D or DEG at the top of the screen. If you see R or RAD, change the mode to degrees."),

  // Trigonometry: angles
  mc("trig-no-inverse", "Gave the ratio, not the angle", "That number is sin, cos or tan of the angle, not the angle itself. Use the inverse button (SHIFT then sin, cos or tan) to turn it into an angle."),
  mc("trig-divided-wrong-way", "Divided the sides the wrong way round", "Check the ratio: tan θ = opposite ÷ adjacent. Swapping them gives the other angle in the triangle."),

  // Exact values
  mc("exact-sin-cos-swap", "Mixed up sin and cos", "sin and cos swap over between 30° and 60°: sin 30° = cos 60° = 1/2, and sin 60° = cos 30° = √3/2. Picture the half-equilateral triangle: the side opposite 30° is the short one."),
  mc("exact-30-60-swap", "Mixed up 30° and 60°", "In the half-equilateral triangle (sides 1, 2 and √3), the shortest side (1) is opposite the smallest angle (30°). So sin 30° = 1/2 and sin 60° = √3/2."),
  mc("exact-0-90", "Mixed up the values at 0° and 90°", "At 0° the opposite side has shrunk to nothing, so sin 0° = 0 and cos 0° = 1. At 90° it's the other way: sin 90° = 1 and cos 90° = 0."),
  mc("exact-tan", "Mixed up the tan values", "tan θ = sin θ ÷ cos θ. tan 45° = 1 (the two short sides are equal), tan 30° = 1/√3 = √3/3, and tan 60° = √3."),
  mc("exact-whole-side", "Used the whole side instead of the ratio", "Multiply the side by the exact value of sin, cos or tan. For example, sin 30° = 1/2, so the side opposite 30° is half the hypotenuse."),

  // Congruence
  mc("cong-sas-asa", "Mixed up SAS and ASA", "In SAS the angle is between the two marked sides. In ASA the marked side is between the two marked angles. Count what's marked on each triangle: sides or angles?"),
  mc("cong-sss", "Missed SSS", "All three pairs of sides match and no angles are needed. That's SSS: side, side, side."),
  mc("cong-rhs", "Mixed up RHS with another test", "RHS is only for right-angled triangles: a Right angle, the Hypotenuse (opposite the right angle) and one other Side match."),
  mc("cong-aaa", "Thought matching angles prove congruence", "If only the angles match, the triangles are the same shape but can be different sizes (one can be an enlargement of the other). So that doesn't prove they are congruent."),
  mc("cong-count", "Miscounted what's marked", "Count what matches on each triangle: how many pairs of sides, and how many pairs of angles? Three sides = SSS. Two sides and the angle between = SAS. Two angles and the side between = ASA."),
  mc("cong-said-not", "Said not congruent when they are", "There is enough here. Check the marked sides and angles against the four tests: SSS, SAS (angle between the sides), ASA (side between the angles) and RHS."),
  mc("cong-corresponding", "Matched the wrong sides or angles", "Congruent triangles can be turned or flipped. Match them up by what you know: equal angles sit opposite equal sides, and between the same pair of sides."),

  // Similar shapes
  mc("sim-added", "Added instead of multiplying", "In similar shapes every length is multiplied by the same scale factor. Adding the same amount to each side changes the shape."),
  mc("sim-inverse-sf", "Used the scale factor the wrong way round", "Check which shape is bigger. Going from the small shape to the big one, multiply by the scale factor; going from big to small, divide by it."),
  mc("sim-wrong-pair", "Used sides that don't match", "Match each side with the side in the same position on the other shape (between the same angles). The scale factor comes from a pair of matching sides you know both of."),
  mc("sim-part-not-whole", "Used part of a side", "The big triangle's side is the whole length, so add the two parts together first. The scale factor is (whole side) ÷ (small triangle's side)."),
  mc("sim-not-similar", "Thought shapes were similar when they aren't", "For shapes to be similar, every side must be multiplied by the same number. Work out the scale factor for each pair of sides and check they match."),
  mc("sim-said-not-similar", "Thought similar shapes weren't similar", "Divide each side of the bigger shape by the matching side of the smaller one. If you get the same number every time, the shapes are similar."),
]);
