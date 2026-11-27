/**
 * Measuring angles, multi-step angle reasoning and bearings (KS3/KS4, GCSE
 * Foundation G15, G3, G6). Part of the "Angles and shapes" chain. Skill ids and
 * prerequisites copy the GCSE Foundation topic map.
 *
 * STATUS: Draft. Written by the build team; needs review by a qualified maths
 * teacher before it is marked Verified.
 */

import type { Misconception, Skill } from "@/engine/types";

export const ANGLE_MORE_SKILLS: Skill[] = [
  {
    id: "geo-measure-angles",
    topic: "Angles",
    name: "Measuring and drawing angles with a protractor",
    objective: "I can read an angle from a protractor using the right scale, estimate angles, and measure reflex angles.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: ["geo-angle-basics"],
  },
  {
    id: "geo-bearings",
    topic: "Angles",
    name: "Bearings",
    objective: "I can find and use three-figure bearings, including the bearing back the other way.",
    typicalYear: 9,
    gcseTier: "foundation",
    prerequisites: ["geo-measure-angles", "geo-parallel-angles"],
  },
  {
    id: "geo-angle-reasoning",
    topic: "Angles",
    name: "Multi-step angle problems with reasons",
    objective: "I can solve angle problems that take more than one step, and give a reason for each step.",
    typicalYear: 9,
    gcseTier: "foundation",
    prerequisites: ["geo-parallel-angles", "geo-polygon-angles"],
  },
];

const mc = (id: string, label: string, explanation: string, pointsTo?: string): [string, Misconception] => [id, { id, label, explanation, pointsTo }];

export const ANGLE_MORE_MISCONCEPTIONS: Record<string, Misconception> = Object.fromEntries([
  // Protractor
  mc("prot-wrong-scale", "Read the wrong scale on the protractor", "A protractor has two scales. Use the one that starts at 0 on one of the arms, and count up from there. Then check: is the angle acute (less than 90°) or obtuse (more than 90°)?"),
  mc("prot-estimate", "Estimated the angle a long way out", "Compare the angle with ones you know: a right angle is 90° (a square corner), a straight line is 180°. Half a right angle is 45°."),
  mc("prot-reflex-180", "Took the angle from 180° instead of 360°", "A reflex angle goes more than half way round. Measure the smaller angle, then take it from 360° (a full turn), not from 180°.", "geo-angle-basics"),
  mc("prot-reflex-gave-small", "Gave the smaller angle, not the reflex one", "The marked angle is the reflex one: the big angle round the outside. Take the smaller angle away from 360°."),

  // Bearings
  mc("bearing-anticlockwise", "Measured anticlockwise", "Bearings are always measured clockwise from north. If you measure the other way, take your angle from 360°."),
  mc("bearing-not-from-north", "Didn't start from north", "A bearing is the angle turned clockwise starting from the north line. Start at north every time."),
  mc("bearing-back-same", "Gave the same bearing for the way back", "The way back points in the opposite direction, so it differs by 180°. Add 180° if the bearing is less than 180°; take away 180° if it's more."),
  mc("bearing-back-360", "Took the bearing from 360° for the way back", "The way back is the opposite direction: it differs by exactly 180°, not 360° minus the bearing."),
  mc("bearing-compass", "Mixed up the compass directions", "Clockwise from north: N is 000°, E is 090°, S is 180°, W is 270°. The in-between directions (NE, SE, SW, NW) are halfway: 045°, 135°, 225°, 315°."),

  // Reasoning
  mc("reason-wrong-fact", "Gave the wrong reason", "Match the picture to the fact. Z shape: alternate angles are equal. F shape: corresponding angles are equal. C shape: co-interior angles add to 180°. Straight line: 180°. Around a point: 360°. Triangle: 180°."),
  mc("reason-stopped-early", "Stopped after the first step", "That's an angle you need on the way, but not the one marked x. Use it to take the next step."),
  mc("reason-line-triangle", "Mixed up the straight-line and triangle facts", "Angles on a straight line add to 180°, and so do the angles inside a triangle. Check which one your angles make."),
  mc("reason-exterior", "Used the wrong angles for the exterior angle", "The exterior angle of a triangle equals the two inside angles that are not next to it, added together."),
  mc("reason-algebra-sum", "Set the angles equal instead of adding to 180°", "These angles are on a straight line, so they add up to 180°. Write the equation: first + second = 180, then solve it."),
  mc("reason-algebra-equal", "Added the angles instead of setting them equal", "These angles are equal (not adding to 180°), so set one expression equal to the other, then solve."),
]);
