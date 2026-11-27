/**
 * Ruler-and-compass constructions and loci (KS3/KS4, GCSE Foundation G2).
 * Skill ids and prerequisites copy the GCSE Foundation topic map.
 *
 * STATUS: Draft. Written by the build team; needs review by a qualified maths
 * teacher before it is marked Verified.
 */

import type { Misconception, Skill } from "@/engine/types";

export const CONSTRUCTION_SKILLS: Skill[] = [
  {
    id: "geo-constructions",
    topic: "Constructions",
    name: "Ruler-and-compass constructions",
    objective: "I can follow and recognise the constructions for a perpendicular bisector, an angle bisector, a perpendicular from a point, a 60° angle and a triangle from three sides.",
    typicalYear: 8,
    gcseTier: "foundation",
    prerequisites: ["geo-measure-angles"],
  },
  {
    id: "geo-loci",
    topic: "Constructions",
    name: "Loci",
    objective: "I can describe and draw the set of points that follow a rule, like 'less than 3 m from P' or 'the same distance from A and B'.",
    typicalYear: 9,
    gcseTier: "foundation",
    prerequisites: ["geo-constructions"],
  },
];

const mc = (id: string, label: string, explanation: string, pointsTo?: string): [string, Misconception] => [id, { id, label, explanation, pointsTo }];

export const CONSTRUCTION_MISCONCEPTIONS: Record<string, Misconception> = Object.fromEntries([
  mc("cons-which", "Mixed up the constructions", "Look at where the arcs start. A perpendicular bisector has arcs from both ends of a line, crossing above and below it. An angle bisector starts with one arc from the corner. A perpendicular from a point starts with an arc from the point that cuts the line twice."),
  mc("cons-not-halved", "Didn't halve the angle", "Bisect means cut into two equal halves. Each new angle is half of the whole angle."),
  mc("cons-doubled", "Doubled instead of halving", "Bisecting makes the angles smaller, not bigger: each half is the angle ÷ 2."),
  mc("cons-midpoint", "Forgot the bisector cuts the line in half", "The perpendicular bisector crosses the line exactly at its midpoint, so each part is half the length."),
  mc("cons-not-90", "Forgot the bisector is at right angles", "Perpendicular means at right angles: the bisector always meets the line at 90°."),
  mc("cons-sss-radius", "Set the compass to the wrong side", "From each end, the compass is set to the length of the side that starts at that end. The side you drew first is already done."),
  mc("cons-equidistant", "Forgot points on the bisector are the same distance from both ends", "Every point on the perpendicular bisector of AB is exactly the same distance from A as from B. That's why the construction works."),
  mc("cons-equilateral", "Didn't spot the equilateral triangle", "Arcs with the same radius from both ends of AB meet at a point C with AC = BC = AB. That's an equilateral triangle, so every angle is 60°."),
  mc("cons-compass-change", "Changed the compass between arcs", "Keep the compass the same width for the pair of arcs. That's what makes the two halves match."),
  mc("cons-by-eye", "Judged a point by eye", "In a construction every point comes from arcs crossing. Guessing the middle by eye isn't accurate enough."),
  mc("cons-protractor", "Used a protractor", "A construction uses only a ruler and compasses. Leave the arcs showing: they are your working."),

  mc("loci-circle", "Forgot a fixed distance from a point is a circle", "All the points the same distance from P make a circle with centre P. Corners of a square are further away than the sides, so it can't be a square."),
  mc("loci-two-points", "Forgot 'same distance from two points' is a perpendicular bisector", "Points the same distance from A and from B lie on the perpendicular bisector of AB."),
  mc("loci-two-lines", "Forgot 'same distance from two lines' is an angle bisector", "Points the same distance from two lines that meet lie on the bisector of the angle between them."),
  mc("loci-line-ends", "Missed the rounded ends", "Near a straight edge the boundary runs parallel to it, but round each end it is a semicircle: the end points are like a single point."),
  mc("loci-closer-side", "Picked the wrong side of the bisector", "The perpendicular bisector splits the plane in two. Every point on A's side is closer to A. Compare the two distances."),
  mc("loci-scale", "Multiplied by the scale instead of dividing", "On a map things are smaller. Divide the real distance by what 1 cm stands for."),
  mc("loci-square", "Counted squares across and up separately", "Distance is measured in a straight line, not across then up. A point 3 across and 3 up is about 4.2 away (Pythagoras), not 3."),
]);
