/**
 * The graphs chain: coordinates, straight-line graphs, real-life graphs,
 * gradient and intercept, y = mx + c, quadratic graphs, cubic and reciprocal
 * graphs, and solving equations with graphs. KS3/KS4, GCSE Foundation
 * (DfE A8–A12, A14, A17–A19, G11).
 *
 * Prerequisites copy the topic map exactly (content/index.ts drops any that
 * aren't built yet).
 *
 * STATUS: Draft. Written by the build team; needs review by a qualified maths
 * teacher before it is marked Verified.
 */

import type { Misconception, Skill } from "@/engine/types";

export const GRAPH_SKILLS: Skill[] = [
  {
    id: "alg-coordinates",
    topic: "Graphs",
    name: "Coordinates in all four quadrants",
    objective: "I can read and plot points like (−3, 2) anywhere on a grid, and find the midpoint of two points.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: ["num-negatives"],
  },
  {
    id: "alg-plot-linear",
    topic: "Graphs",
    name: "Plotting straight-line graphs from a table",
    objective: "I can fill in a table of values for an equation like y = 2x + 1, plot the points and read values from the line.",
    typicalYear: 8,
    gcseTier: "foundation",
    prerequisites: ["alg-coordinates", "alg-substitution"],
  },
  {
    id: "alg-real-life-graphs",
    topic: "Graphs",
    name: "Reading and drawing real-life graphs",
    objective: "I can read values from conversion and cost graphs, using the scale on each axis, and say what the graph shows.",
    typicalYear: 8,
    gcseTier: "foundation",
    prerequisites: ["alg-coordinates"],
  },
  {
    id: "alg-gradient-intercept",
    topic: "Graphs",
    name: "Gradient and y-intercept",
    objective: "I can find the gradient and y-intercept of a straight line from its graph or its equation.",
    typicalYear: 9,
    gcseTier: "foundation",
    prerequisites: ["alg-plot-linear"],
  },
  {
    id: "alg-y-mx-c",
    topic: "Graphs",
    name: "Finding y = mx + c, including parallel lines",
    objective: "I can write the equation of a straight line from its graph or two points, and find a line parallel to another.",
    typicalYear: 10,
    gcseTier: "foundation",
    prerequisites: ["alg-gradient-intercept", "alg-rearrange"],
  },
  {
    id: "alg-quadratic-graphs",
    topic: "Graphs",
    name: "Quadratic graphs: plotting, roots and turning points",
    objective: "I can plot a quadratic graph from a table, and read its roots, turning point and line of symmetry.",
    typicalYear: 10,
    gcseTier: "foundation",
    prerequisites: ["alg-plot-linear", "num-powers-roots"],
  },
  {
    id: "alg-cubic-reciprocal-graphs",
    topic: "Graphs",
    name: "Recognising cubic and reciprocal graphs",
    objective: "I can tell straight-line, quadratic, cubic and reciprocal graphs apart, and work out values for them.",
    typicalYear: 10,
    gcseTier: "foundation",
    prerequisites: ["alg-quadratic-graphs"],
  },
  {
    id: "alg-solve-graphically",
    topic: "Graphs",
    name: "Solving equations approximately using graphs",
    objective: "I can use a graph to solve an equation, and use where two lines cross to solve simultaneous equations.",
    typicalYear: 10,
    gcseTier: "foundation",
    prerequisites: ["alg-quadratic-graphs", "alg-simultaneous"],
  },
];

export const GRAPH_MISCONCEPTIONS: Record<string, Misconception> = {
  // ------------------------------------------------------------ coordinates
  "coord-swapped": {
    id: "coord-swapped",
    label: "Wrote the coordinates the wrong way round",
    explanation:
      "Coordinates always go x first, then y. Go along the corridor (x, left or right), then up or down the stairs (y). (2, 5) and (5, 2) are different points.",
    pointsTo: "alg-coordinates",
  },
  "coord-sign": {
    id: "coord-sign",
    label: "Gave a coordinate the wrong sign",
    explanation:
      "Check the signs. Left of the y-axis, x is negative. Below the x-axis, y is negative. Count from the origin (0, 0) each time.",
    pointsTo: "alg-coordinates",
  },
  "coord-midpoint-difference": {
    id: "coord-midpoint-difference",
    label: "Halved the difference instead of finding the middle",
    explanation:
      "The midpoint is halfway between, so find the mean of the coordinates: add the two x-values and halve, then add the two y-values and halve.",
  },
  "coord-rectangle-wrong-corner": {
    id: "coord-rectangle-wrong-corner",
    label: "Picked a point that doesn't make a rectangle",
    explanation:
      "Opposite sides of a rectangle are parallel. The missing corner shares its x-coordinate with one corner and its y-coordinate with another.",
  },

  // ------------------------------------------------------------ straight lines
  "line-negative-times": {
    id: "line-negative-times",
    label: "Multiplied by a negative x without the sign",
    explanation:
      "When x is negative, take care with the signs. A positive number times a negative number is negative: 2 × (−3) = −6. Then add or subtract the number at the end.",
    pointsTo: "num-negatives",
  },
  "line-forgot-c": {
    id: "line-forgot-c",
    label: "Forgot to add or subtract the number at the end",
    explanation: "Do every part of the equation. For y = 2x + 1, multiply x by 2 and then add 1.",
    pointsTo: "alg-substitution",
  },
  "line-wrong-axis": {
    id: "line-wrong-axis",
    label: "Read from the wrong axis",
    explanation:
      "Start on the axis of the value you know. Go across (or up) to the line, then turn and read the other axis.",
  },
  "line-x-y-equals": {
    id: "line-x-y-equals",
    label: "Mixed up x = a and y = a",
    explanation:
      "x = 3 means every point has x-coordinate 3, so it's a vertical line through 3 on the x-axis. y = 3 is a horizontal line through 3 on the y-axis.",
  },
  "line-point-not-checked": {
    id: "line-point-not-checked",
    label: "Didn't check the point in the equation",
    explanation:
      "To test a point, put its x-value into the equation and see if you get its y-value. If you do, the point is on the line.",
  },

  // ------------------------------------------------------------ real-life graphs
  "real-scale": {
    id: "real-scale",
    label: "Counted squares instead of using the scale",
    explanation:
      "Each square on this axis isn't worth 1. Look at the numbers on the axis to see what one small square is worth, then read the value.",
  },
  "real-intercept-meaning": {
    id: "real-intercept-meaning",
    label: "Misread what the start of the graph means",
    explanation:
      "Where the line meets the vertical axis is the value when the horizontal amount is 0, for example the charge before you've travelled at all.",
  },

  // ------------------------------------------------------------ gradient and intercept
  "grad-gave-intercept": {
    id: "grad-gave-intercept",
    label: "Gave the y-intercept instead of the gradient",
    explanation: "In y = mx + c, the gradient is m, the number multiplying x. The number on its own (c) is the y-intercept.",
  },
  "grad-gave-gradient": {
    id: "grad-gave-gradient",
    label: "Gave the gradient instead of the y-intercept",
    explanation: "The y-intercept is where the line crosses the y-axis. In y = mx + c it is c, the number on its own, not the number multiplying x.",
  },
  "grad-c-sign": {
    id: "grad-c-sign",
    label: "Lost the sign of the y-intercept",
    explanation: "Keep the sign. In y = 3x − 4 the number on its own is −4, so the line crosses the y-axis at −4.",
  },
  "grad-sign": {
    id: "grad-sign",
    label: "Missed that the gradient is negative",
    explanation: "Read the line from left to right. If it goes downhill, the gradient is negative.",
  },
  "grad-run-over-rise": {
    id: "grad-run-over-rise",
    label: "Divided across by up",
    explanation: "Gradient = change in y ÷ change in x: how far up for each 1 across. Put the up (or down) on top.",
  },
  "grad-first-number": {
    id: "grad-first-number",
    label: "Took the first number as the gradient",
    explanation:
      "The gradient is the number multiplying x, wherever it is. In y = 5 − 2x, the x-term is −2x, so the gradient is −2.",
  },
  "grad-not-subtracted": {
    id: "grad-not-subtracted",
    label: "Didn't subtract the coordinates",
    explanation:
      "Gradient = (difference in y) ÷ (difference in x). Subtract the y-coordinates, subtract the x-coordinates in the same order, then divide.",
  },
  "grad-steepest": {
    id: "grad-steepest",
    label: "Judged steepness by the wrong number",
    explanation:
      "Steepness depends only on the gradient (the number multiplying x), and its size, not its sign. The number on its own just moves the line up or down.",
  },

  // ------------------------------------------------------------ y = mx + c
  "ymxc-swapped": {
    id: "ymxc-swapped",
    label: "Swapped the gradient and the intercept",
    explanation: "In y = mx + c, the gradient m goes with x and the y-intercept c stands on its own.",
  },
  "ymxc-parallel-same-c": {
    id: "ymxc-parallel-same-c",
    label: "Kept the old y-intercept for the parallel line",
    explanation:
      "A parallel line has the same gradient but usually a different y-intercept. Put the point's coordinates into y = mx + c to find the new c.",
  },
  "ymxc-not-divided": {
    id: "ymxc-not-divided",
    label: "Didn't get y on its own first",
    explanation: "The equation must start y = … before you read the gradient. For 2y = 6x + 4, divide everything by 2: y = 3x + 2.",
  },
  "ymxc-parallel-gradient": {
    id: "ymxc-parallel-gradient",
    label: "Thought parallel lines share the intercept",
    explanation: "Parallel lines go in the same direction, so they have the same gradient (the number multiplying x). Their y-intercepts are different.",
  },

  // ------------------------------------------------------------ quadratics
  "quad-negative-square": {
    id: "quad-negative-square",
    label: "Squared a negative number and got a negative",
    explanation: "A negative number squared is positive: (−3)² = (−3) × (−3) = 9. On a calculator, put brackets round the negative number.",
    pointsTo: "num-powers-roots",
  },
  "quad-roots-intercept": {
    id: "quad-roots-intercept",
    label: "Gave where the curve crosses the y-axis",
    explanation: "The roots are where the curve crosses the x-axis (where y = 0). Read the x-values there.",
  },
  "quad-symmetry": {
    id: "quad-symmetry",
    label: "Put the line of symmetry in the wrong place",
    explanation: "The line of symmetry goes straight down through the turning point, halfway between the two roots.",
  },

  // ------------------------------------------------------------ cubic and reciprocal
  "cubic-negative-cube": {
    id: "cubic-negative-cube",
    label: "Cubed a negative number and got a positive",
    explanation: "Three negatives multiplied give a negative: (−2)³ = (−2) × (−2) × (−2) = −8.",
    pointsTo: "num-powers-roots",
  },
  "recip-multiplied": {
    id: "recip-multiplied",
    label: "Multiplied instead of dividing",
    explanation: "y = 12/x means 12 divided by x. So when x = 3, y = 12 ÷ 3 = 4.",
  },
  "graph-shape-mixup": {
    id: "graph-shape-mixup",
    label: "Mixed up the graph shapes",
    explanation:
      "Look at the highest power of x. x only: a straight line. x²: a U or ∩ shaped curve. x³: an S-shaped curve. x underneath a fraction (like 1/x): two separate curves that never touch the axes.",
  },

  // ------------------------------------------------------------ solving with graphs
  "solve-read-y": {
    id: "solve-read-y",
    label: "Gave the y-value instead of x",
    explanation: "The solution of the equation is the x-value. Go across from the y-value to the graph, then down to the x-axis and read x.",
  },
  "solve-used-zero": {
    id: "solve-used-zero",
    label: "Read where the curve crosses the x-axis instead of the line",
    explanation:
      "The x-axis gives the solutions when the equation equals 0. Here it equals another number, so draw that horizontal line and read where it crosses the curve.",
  },
};
