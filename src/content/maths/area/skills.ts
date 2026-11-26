/**
 * The area chain: rectangles, triangles, parallelograms, trapeziums and
 * compound shapes made of rectangles (KS3, GCSE Foundation).
 *
 * STATUS: Draft. Written by the build team; needs review by a qualified maths
 * teacher before it is marked Verified.
 */

import type { Misconception, Skill } from "@/engine/types";

export const AREA_SKILLS: Skill[] = [
  {
    id: "area-rectangle",
    topic: "Area",
    name: "Area of rectangles",
    objective: "I can find the area of a rectangle by multiplying length × width, and give the units.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: [],
  },
  {
    id: "area-triangle",
    topic: "Area",
    name: "Area of triangles",
    objective: "I can find the area of a triangle using ½ × base × perpendicular height.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: ["area-rectangle"],
  },
  {
    id: "area-parallelogram",
    topic: "Area",
    name: "Area of parallelograms",
    objective: "I can find the area of a parallelogram using base × perpendicular height.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: ["area-rectangle"],
  },
  {
    id: "area-trapezium",
    topic: "Area",
    name: "Area of trapeziums",
    objective: "I can find the area of a trapezium using ½ × (a + b) × h.",
    typicalYear: 8,
    gcseTier: "foundation",
    prerequisites: ["area-triangle", "area-parallelogram"],
  },
  {
    id: "area-compound",
    topic: "Area",
    name: "Area of compound shapes",
    objective: "I can split an L-shape into rectangles, work out missing lengths, and find its area.",
    typicalYear: 8,
    gcseTier: "foundation",
    prerequisites: ["area-rectangle"],
  },
];

export const AREA_MISCONCEPTIONS: Record<string, Misconception> = {
  "area-used-perimeter": {
    id: "area-used-perimeter",
    label: "Found the perimeter instead of the area",
    explanation:
      "That's the perimeter: the distance all the way round the edge. Area is the space inside, how many squares cover it. For a rectangle, multiply length × width.",
  },
  "area-added-sides": {
    id: "area-added-sides",
    label: "Added the sides instead of multiplying",
    explanation: "It looks like you added the two lengths. For area, multiply them: length × width.",
  },
  "area-missing-side-subtracted": {
    id: "area-missing-side-subtracted",
    label: "Subtracted instead of dividing to find a side",
    explanation:
      "Area = length × width, so to find a missing side, divide the area by the side you know. Subtracting doesn't undo multiplying.",
    pointsTo: "area-rectangle",
  },
  "area-forgot-half": {
    id: "area-forgot-half",
    label: "Forgot to halve (triangle)",
    explanation:
      "That's base × height, which is the area of the whole rectangle around the triangle. A triangle is exactly half of that rectangle, so halve it.",
  },
  "area-used-slant": {
    id: "area-used-slant",
    label: "Used the sloping side instead of the perpendicular height",
    explanation:
      "The height has to be perpendicular, meaning at a right angle to the base, like the dashed line. The sloping side is longer than the height, so it gives too big an answer.",
  },
  "area-halved-parallelogram": {
    id: "area-halved-parallelogram",
    label: "Halved a parallelogram's area",
    explanation:
      "Only triangles need halving. A parallelogram can be cut and rearranged into a rectangle, so its area is base × perpendicular height, with no half.",
    pointsTo: "area-parallelogram",
  },
  "area-trap-forgot-half": {
    id: "area-trap-forgot-half",
    label: "Forgot to halve (trapezium)",
    explanation:
      "(a + b) × h is the area of two trapeziums put together. You need half of that: ½ × (a + b) × h.",
  },
  "area-trap-one-side": {
    id: "area-trap-one-side",
    label: "Used only one of the parallel sides",
    explanation:
      "A trapezium has two parallel sides of different lengths. Add them both first, then multiply by the height and halve: ½ × (a + b) × h.",
    pointsTo: "area-parallelogram",
  },
  "area-bounding-rectangle": {
    id: "area-bounding-rectangle",
    label: "Used the whole rectangle around the shape",
    explanation:
      "That's the area of the big rectangle around the L-shape, but a corner is missing. Split the shape into two rectangles and add their areas, or subtract the missing corner.",
  },
  "area-compound-overlap": {
    id: "area-compound-overlap",
    label: "Counted part of the shape twice",
    explanation:
      "Your two rectangles overlap, so part of the shape was counted twice. Draw one line to split the shape so the two pieces don't overlap.",
  },
};
