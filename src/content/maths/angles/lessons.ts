/**
 * Lesson content for angles and properties of shapes (six stages, like every
 * chain). Practice and check questions come from generators.ts. Worked example
 * diagrams use the same builders, so they are drawn to scale too.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher before Verified.
 */

import type { Lesson } from "@/content/lesson-types";
import type { SkillId } from "@/engine/types";
import { quadSpec } from "./generators";
import { crossingDiagram, lineDiagram, parallelDiagram, pointDiagram, polygonDiagram, polygonFromAngles, regularPoints, singleAngle } from "./geometry";

export const ANGLE_LESSONS: Record<SkillId, Lesson> = {
  "geo-angle-basics": {
    skillId: "geo-angle-basics",
    status: "draft",
    minutes: 15,
    intro: {
      whyItMatters:
        "An angle measures an amount of turn. Every angle question, from triangles to bearings, starts with knowing the four types of angle and how to name one with three letters.",
      byTheEnd: ["Say whether an angle is acute, right, obtuse, straight or reflex.", "Know that a full turn is 360°.", "Name an angle using three letters, like ∠ABC."],
    },
    teaching: {
      paragraphs: [
        "An angle is an amount of turn between two lines (called arms) that meet at a point (called the vertex). We measure angles in degrees, written °. A full turn is 360°.",
        "Half a turn is 180°: the two arms make a straight line. A quarter turn is 90°: a right angle, like the corner of a page. A right angle is marked with a small square instead of a curve.",
        "Acute angles are less than 90°. Obtuse angles are between 90° and 180°. Reflex angles are more than 180°: the curve is marked on the outside, round the back.",
        "To name an angle, use three letters. The middle letter is always the vertex (the corner). ∠ABC means the angle at B, between the arms going to A and to C. ∠CBA is the same angle.",
      ],
      demo: "angle-turn",
      examples: [
        {
          question: "What type of angle is marked?",
          visual: { kind: "angles", angles: singleAngle(130, { rot: 10 }) },
          steps: ["It's bigger than a right angle (a square corner).", "It's smaller than a straight line.", "So it's obtuse (between 90° and 180°)."],
        },
        {
          question: "Name the highlighted angle.",
          visual: {
            kind: "angles",
            angles: polygonDiagram(polygonFromAngles([70, 50, 60], [6])!, [{ i: 1, highlight: true }], { labels: ["P", "Q", "R"], description: "Triangle PQR with the angle at Q highlighted." }, ["P", "Q", "R"]),
          },
          steps: ["The highlighted angle is at corner Q, so Q goes in the middle.", "Its arms go to P and to R.", "So it's ∠PQR (or ∠RQP, which means the same)."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "geo-angle-facts": {
    skillId: "geo-angle-facts",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters: "Three facts unlock most angle problems: angles on a straight line, angles around a point, and vertically opposite angles. Exam questions often ask you to give these as reasons.",
      byTheEnd: ["Find a missing angle on a straight line.", "Find a missing angle around a point.", "Use vertically opposite angles where two lines cross."],
    },
    teaching: {
      paragraphs: [
        "Angles on a straight line add up to 180°, because a straight line is half a turn. So if one angle on a line is 130°, the one next to it is 180° − 130° = 50°.",
        "Angles around a point add up to 360°, because going all the way round is a full turn. Add the angles you know and take the total from 360°.",
        "When two straight lines cross, they make four angles. The angles opposite each other are equal: these are vertically opposite angles. Angles next to each other are on a straight line, so they add to 180°.",
        "When some angles are equal (marked with the same letter), take away what you know first, then share what's left between the equal angles.",
      ],
      demo: "angle-facts-explore",
      examples: [
        {
          question: "Find the angle marked x.",
          visual: { kind: "angles", angles: lineDiagram([35, 85, 60], ["35°", "x", "60°"]) },
          steps: ["Angles on a straight line add up to 180°.", "35° + 60° = 95°", "x = 180° − 95° = 85°"],
        },
        {
          question: "Find the angles marked x and y.",
          visual: { kind: "angles", angles: crossingDiagram(55, [{ pos: 0, text: "55°" }, { pos: 2, text: "x" }, { pos: 1, text: "y" }], 15) },
          steps: ["x is vertically opposite 55°, so x = 55°.", "y and 55° are on a straight line, so they add up to 180°.", "y = 180° − 55° = 125°"],
        },
        {
          question: "Find the angle marked x.",
          visual: { kind: "angles", angles: pointDiagram([110, 140, 110], ["x", "140°", "x"], 20) },
          steps: ["Angles around a point add up to 360°.", "360° − 140° = 220°", "The two angles marked x are equal: x = 220° ÷ 2 = 110°"],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "geo-shape-properties": {
    skillId: "geo-shape-properties",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "Knowing a shape's properties tells you which angles and sides are equal without measuring. You'll use this in angle problems, area, symmetry and proofs.",
      byTheEnd: ["Name equilateral, isosceles and scalene triangles.", "Name the six special quadrilaterals from their markings.", "Name polygons from 5 to 10 sides."],
    },
    teaching: {
      paragraphs: [
        "Diagrams use three kinds of marks. Matching ticks on sides mean those sides are equal. Matching arrows mean those sides are parallel (they never meet, like train tracks). A small square in a corner means a right angle.",
        "Triangles: equilateral has 3 equal sides (and 3 equal angles of 60°). Isosceles has 2 equal sides (and 2 equal angles). Scalene has no equal sides.",
        "Quadrilaterals have 4 sides. A square has 4 equal sides and 4 right angles. A rectangle has 4 right angles with opposite sides equal. A rhombus is a 'pushed over' square: 4 equal sides, no right angles. A parallelogram is a 'pushed over' rectangle: 2 pairs of parallel sides.",
        "A trapezium has exactly 1 pair of parallel sides. A kite has 2 pairs of equal sides that are next to each other, not opposite.",
        "Polygons are named by their number of sides: pentagon 5, hexagon 6, heptagon 7, octagon 8, nonagon 9, decagon 10. A regular polygon has all sides and all angles equal.",
      ],
      demo: "shape-sorter",
      examples: [
        {
          question: "What is the name of this quadrilateral?",
          visual: { kind: "angles", angles: quadSpec("Parallelogram") },
          steps: ["Arrows: two pairs of parallel sides.", "Ticks: opposite sides are equal, but next-door sides are different.", "No right angles.", "So it's a parallelogram."],
        },
        {
          question: "What type of triangle is this?",
          visual: {
            kind: "angles",
            angles: polygonDiagram(polygonFromAngles([70, 70, 40], [6])!, [], {
              ticks: [
                { a: "V1", b: "V2", n: 1 },
                { a: "V2", b: "V0", n: 1 },
              ],
              description: "A triangle with two sides marked with matching ticks.",
            }),
          },
          steps: ["Two sides have matching ticks, so two sides are equal.", "So it's an isosceles triangle."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "geo-triangle-quad-angles": {
    skillId: "geo-triangle-quad-angles",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters: "The angles in a triangle always add up to 180°. It's one of the most used facts in GCSE geometry, and with isosceles triangles it turns up in almost every angle question.",
      byTheEnd: ["Find a missing angle in any triangle.", "Use the equal angles in an isosceles triangle.", "Find a missing angle in a quadrilateral."],
    },
    teaching: {
      paragraphs: [
        "The angles inside any triangle add up to 180°. If you tore off the three corners and put them together, they'd make a straight line. So: add the two angles you know, then take the total from 180°.",
        "A right-angled triangle has a small square in one corner. That's 90°, so the other two angles add up to 90°.",
        "In an isosceles triangle, two sides are equal (matching ticks). The two angles at the bottom of those equal sides are also equal. If you know the top angle, take it from 180° and halve what's left. If you know a bottom angle, the other bottom angle is the same.",
        "The angles inside any quadrilateral add up to 360°. A diagonal splits it into two triangles: 2 × 180° = 360°.",
        "In a parallelogram, opposite angles are equal and angles next to each other add up to 180°.",
      ],
      demo: "triangle-sum",
      examples: [
        {
          question: "This is an isosceles triangle. Find the angle marked x.",
          visual: {
            kind: "angles",
            angles: polygonDiagram(
              polygonFromAngles([65, 65, 50], [6])!,
              [
                { i: 2, text: "50°" },
                { i: 0, text: "x" },
              ],
              {
                ticks: [
                  { a: "V1", b: "V2", n: 1 },
                  { a: "V2", b: "V0", n: 1 },
                ],
                description: "An isosceles triangle with top angle 50°. x is a bottom angle.",
              },
            ),
          },
          steps: ["Angles in a triangle add up to 180°.", "180° − 50° = 130°", "The two bottom angles are equal: x = 130° ÷ 2 = 65°"],
        },
        {
          question: "Find the angle marked x.",
          visual: {
            kind: "angles",
            angles: polygonDiagram(
              polygonFromAngles([95, 70, 120, 75], [6, 5])!,
              [
                { i: 0, text: "95°" },
                { i: 1, text: "70°" },
                { i: 2, text: "x" },
                { i: 3, text: "75°" },
              ],
              { description: "A quadrilateral with angles 95°, 70°, x and 75°." },
            ),
          },
          steps: ["Angles in a quadrilateral add up to 360°.", "95° + 70° + 75° = 240°", "x = 360° − 240° = 120°"],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "geo-parallel-angles": {
    skillId: "geo-parallel-angles",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "When a line crosses two parallel lines, the angles it makes repeat in a pattern. Spotting the pattern (F, Z and C shapes) lets you find angles you can't see directly, and GCSE questions ask you to name the reason.",
      byTheEnd: ["Spot corresponding, alternate and co-interior angles.", "Use them to find missing angles.", "Give the reason for each step."],
    },
    teaching: {
      paragraphs: [
        "Parallel lines are marked with matching arrows. When another line crosses them, it makes two crossings that look exactly the same: the same four angles at each.",
        "Corresponding angles are in the same position at each crossing. They're equal. Look for an F shape (it can be backwards or upside down).",
        "Alternate angles are inside the parallel lines, on opposite sides of the crossing line. They're equal. Look for a Z shape.",
        "Co-interior angles are inside the parallel lines, on the same side of the crossing line. They add up to 180°. Look for a C shape (or a U).",
        "Two-step questions are common. Move the angle you know to the other crossing (corresponding), then use vertically opposite angles or angles on a straight line.",
      ],
      demo: "parallel-lines",
      examples: [
        {
          question: "Find the angle marked x. Give a reason.",
          visual: {
            kind: "angles",
            angles: parallelDiagram(60, [
              { at: "Q", pos: 2, text: "60°" },
              { at: "P", pos: 0, text: "x" },
            ]),
          },
          steps: ["x and 60° are inside the parallel lines, on opposite sides of the crossing line: a Z shape.", "They're alternate angles, so they're equal.", "x = 60°"],
        },
        {
          question: "Find the angle marked x. Give a reason.",
          visual: {
            kind: "angles",
            angles: parallelDiagram(115, [
              { at: "Q", pos: 3, text: "65°" },
              { at: "P", pos: 0, text: "x" },
            ]),
          },
          steps: ["x and 65° are inside the parallel lines, on the same side: a C shape.", "They're co-interior angles, so they add up to 180°.", "x = 180° − 65° = 115°"],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "geo-polygon-angles": {
    skillId: "geo-polygon-angles",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters: "Tiles, honeycombs and road signs are polygons. Two facts let you find any angle in them: the interior angles sum, and the exterior angles adding up to 360°.",
      byTheEnd: ["Find the sum of the interior angles of any polygon.", "Find the interior and exterior angles of a regular polygon.", "Work out how many sides a regular polygon has."],
    },
    teaching: {
      paragraphs: [
        "Interior angles are the angles inside a shape, at each corner. From one corner, you can draw lines to the other corners and split any polygon into triangles. A shape with n sides makes n − 2 triangles.",
        "So the interior angles of a polygon with n sides add up to (n − 2) × 180°. A pentagon (5 sides) makes 3 triangles: 3 × 180° = 540°.",
        "An exterior angle is the turn you make at each corner if you walk round the edge. Make one side longer: the exterior angle is between that line and the next side. Walking all the way round is one full turn, so the exterior angles of any polygon add up to 360°.",
        "At each corner, the interior and exterior angles sit on a straight line: interior + exterior = 180°.",
        "A regular polygon has all its angles equal. Exterior angle = 360° ÷ number of sides. Interior angle = 180° − exterior angle. And number of sides = 360° ÷ exterior angle.",
      ],
      demo: "polygon-split",
      examples: [
        {
          question: "Find the interior angle of a regular hexagon.",
          visual: {
            kind: "angles",
            angles: polygonDiagram(regularPoints(6), [{ i: 1, text: "x" }], {
              ticks: [0, 1, 2, 3, 4, 5].map((i) => ({ a: `V${i}`, b: `V${(i + 1) % 6}`, n: 1 })),
              description: "A regular hexagon with one interior angle marked x.",
            }),
          },
          steps: ["Sum of interior angles = (6 − 2) × 180° = 720°.", "All 6 angles are equal: 720° ÷ 6 = 120°.", "Check: exterior = 360° ÷ 6 = 60°, and 180° − 60° = 120°."],
        },
        {
          question: "Each exterior angle of a regular polygon is 30°. How many sides does it have?",
          steps: ["The exterior angles add up to 360°.", "Number of sides = 360° ÷ 30° = 12."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },
};
