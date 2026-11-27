/**
 * Lesson content for measuring angles, bearings and multi-step angle
 * reasoning. Practice and check questions come from generators.ts; the
 * diagrams here use the same builders, so they are drawn to scale.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher before Verified.
 */

import type { Lesson } from "@/content/lesson-types";
import type { SkillId } from "@/engine/types";
import { bearingDiagram } from "./generators";
import { lineDiagram, polygonDiagram, polygonFromAngles } from "../angles/geometry";

const exterior = (() => {
  const pts = polygonFromAngles([55, 75, 50], [6], 3)!;
  const spec = polygonDiagram(pts, [{ i: 0, text: "x", highlight: true }, { i: 2, text: "50°" }], { labels: ["A", "B", "C", "D"], description: "Triangle ABC with BC extended to D. Angle BAC is 50°, exterior angle ACD is 105°, angle ABC is x." }, ["B", "C", "A"]);
  const [B, C] = [pts[0], pts[1]];
  spec.points.D = [C[0] + (C[0] - B[0]) * 0.55, C[1] + (C[1] - B[1]) * 0.55];
  spec.segments.push(["C", "D"]);
  spec.angles.push({ at: "C", from: "D", to: "A", text: "105°" });
  return spec;
})();

export const ANGLE_MORE_LESSONS: Record<SkillId, Lesson> = {
  "geo-measure-angles": {
    skillId: "geo-measure-angles",
    status: "draft",
    minutes: 15,
    intro: {
      whyItMatters: "Measuring angles accurately is needed for pie charts, bearings and constructions. The most common mistake is reading the wrong scale, and one quick check stops it.",
      byTheEnd: ["Line up a protractor and read the right scale.", "Estimate an angle before measuring.", "Measure a reflex angle."],
    },
    teaching: {
      paragraphs: [
        "Put the protractor's centre point exactly on the vertex (the corner). Turn it so the 0 line lies along one arm.",
        "A protractor has two scales, one counting up from each end. Use the scale that reads 0 on the arm you lined up, and follow it round to the other arm.",
        "Always check: is the angle acute (less than 90°) or obtuse (more than 90°)? If it looks acute but you read 130°, you used the wrong scale. The two scales always add up to 180°.",
        "A protractor only goes to 180°. To measure a reflex angle, measure the smaller angle on the other side, then take it from 360°.",
        "Estimating first helps: compare with a right angle (90°), half a right angle (45°) and a straight line (180°).",
      ],
      demo: "protractor-read",
      examples: [
        {
          question: "Measure the angle.",
          visual: { kind: "protractor", protractor: { size: 50, turn: 0, from: "outer", description: "An angle of 50° measured with a protractor, one arm on the 0 of the outer scale." } },
          steps: ["One arm lies on the 0 at the left end: that's the outer scale.", "Count round on the outer scale to the other arm: 50°.", "Check: the angle is acute, and 50° is acute. (The inner scale says 130°, which can't be right.)"],
        },
        {
          question: "The smaller angle is 110°. What is the reflex angle?",
          visual: { kind: "protractor", protractor: { size: 110, turn: 0, from: "inner", description: "Two arms with an angle of 110° between them, measured with a protractor." } },
          steps: ["The smaller angle reads 110° on the inner scale.", "The two angles make a full turn, 360°.", "Reflex angle = 360° − 110° = 250°."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "geo-bearings": {
    skillId: "geo-bearings",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters: "Bearings are how ships, planes and walkers give directions. They appear in most GCSE papers, often with scale drawings.",
      byTheEnd: ["Give a direction as a three-figure bearing.", "Turn compass directions into bearings.", "Find the bearing back the other way."],
    },
    teaching: {
      paragraphs: [
        "A bearing is an angle measured clockwise from north. Three rules: start at north, turn clockwise, and write three figures (65° is written 065°).",
        "'The bearing of B from A' means stand at A, face north, and turn clockwise until you face B.",
        "Compass directions: north 000°, east 090°, south 180°, west 270°. The halfway directions are 045° (NE), 135° (SE), 225° (SW) and 315° (NW).",
        "If an angle is given anticlockwise from north, the bearing is 360° minus it.",
        "The bearing back (of A from B) is the opposite direction, so it differs by 180°. Add 180° if the bearing is less than 180°, take away 180° if it's more. The north lines are parallel, so this is co-interior angles at work.",
      ],
      demo: "bearing-turn",
      examples: [
        {
          question: "The angle anticlockwise from north to B is 70°. Find the bearing of B from A.",
          visual: { kind: "angles", angles: bearingDiagram(290, "70°", "acw") },
          steps: ["Bearings go clockwise. The 70° goes anticlockwise.", "Clockwise angle = 360° − 70° = 290°.", "The bearing of B from A is 290°."],
        },
        {
          question: "The bearing of B from A is 060°. Find the bearing of A from B.",
          visual: { kind: "angles", angles: bearingDiagram(60, "60°", "cw", true, "x") },
          steps: ["The way back is the opposite direction: it differs by 180°.", "60° is less than 180°, so add: 60° + 180° = 240°.", "The bearing of A from B is 240°."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "geo-angle-reasoning": {
    skillId: "geo-angle-reasoning",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters: "Exam angle questions often need two or three facts in a row, and marks are given for the reasons. This lesson practises chaining facts and naming them.",
      byTheEnd: ["Solve angle problems that take two steps.", "Give the correct reason for each step.", "Use algebra to find angles."],
    },
    teaching: {
      paragraphs: [
        "When you can't find x straight away, find any angle you can, write it on the diagram, and see what it unlocks next.",
        "Give a reason for each step, using the proper words: angles on a straight line add up to 180°; angles around a point add up to 360°; vertically opposite angles are equal; angles in a triangle add up to 180°; alternate angles are equal; corresponding angles are equal; co-interior angles add up to 180°.",
        "The exterior angle of a triangle equals the two inside angles opposite it added together. It's a handy shortcut, but you can always get there with a straight line and a triangle.",
        "With algebra, write an equation from the angle fact (they add to 180, or they're equal), solve it, then check your angles in the diagram.",
      ],
      demo: "angle-chain",
      examples: [
        {
          question: "BC is extended to D. Find x, giving reasons.",
          visual: { kind: "angles", angles: exterior },
          steps: ["Angle ACB = 180° − 105° = 75° (angles on a straight line add up to 180°).", "x = 180° − 50° − 75° = 55° (angles in a triangle add up to 180°).", "Check with the shortcut: 105° − 50° = 55°."],
        },
        {
          question: "The angles are on a straight line. Find x.",
          visual: { kind: "angles", angles: lineDiagram([110, 70], ["(3x + 20)°", "(2x + 10)°"]) },
          steps: ["Angles on a straight line add up to 180°: 3x + 20 + 2x + 10 = 180.", "5x + 30 = 180, so 5x = 150 and x = 30.", "Check: 3 × 30 + 20 = 110° and 2 × 30 + 10 = 70°. 110° + 70° = 180°."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },
};
