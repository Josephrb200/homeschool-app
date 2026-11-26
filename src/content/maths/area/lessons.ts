/**
 * Lesson content for the area chain (six stages, like every chain).
 * Practice and check questions come from generators.ts.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher before Verified.
 */

import type { Lesson } from "@/content/lesson-types";
import type { SkillId } from "@/engine/types";

export const AREA_LESSONS: Record<SkillId, Lesson> = {
  "area-rectangle": {
    skillId: "area-rectangle",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "Area tells you how much flat space something covers: carpet for a room, paint for a wall, turf for a garden. Every other area formula is built from the rectangle.",
      byTheEnd: ["Find the area of a rectangle and give the right units.", "Tell area and perimeter apart.", "Find a missing side when you know the area."],
    },
    teaching: {
      paragraphs: [
        "Area is the amount of space inside a flat shape. We measure it in squares: a 1 cm by 1 cm square has an area of 1 square centimetre, written 1 cm².",
        "A rectangle 5 cm long and 3 cm wide holds 3 rows of 5 squares. That's 5 × 3 = 15 squares, so the area is 15 cm². You don't need to count: multiply length × width.",
        "The little ² in cm² means 'squared'. It's there because area is counted in squares. Lengths are in cm; areas are in cm².",
        "Don't mix this up with perimeter, which is the distance all the way round the edge (5 + 3 + 5 + 3 = 16 cm). Area is inside; perimeter is round the outside.",
      ],
      demo: "rectangle-grid",
      examples: [
        {
          question: "Find the area of a rectangle 7 cm long and 4 cm wide.",
          shape: {
            points: [
              [0, 0],
              [7, 0],
              [7, 4],
              [0, 4],
            ],
            sides: [
              { i: 0, text: "7 cm" },
              { i: 3, text: "4 cm" },
            ],
            right: [[0, 0]],
            description: "A rectangle 7 cm long and 4 cm wide.",
          },
          steps: ["Area = length × width", "= 7 × 4", "= 28 cm²"],
        },
        {
          question: "A rectangle has an area of 36 m². Its width is 4 m. How long is it?",
          steps: ["Area = length × width, so 4 × length = 36.", "Divide to undo multiplying: 36 ÷ 4 = 9.", "The length is 9 m."],
        },
      ],
    },
    counts: { guided: 4, independent: 4, check: 5 },
  },

  "area-triangle": {
    skillId: "area-triangle",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Triangles are everywhere: roofs, ramps, sails. Once you can find a triangle's area, you can find the area of almost any shape with straight sides by splitting it up.",
      byTheEnd: ["Explain why a triangle's area is half of a rectangle.", "Use ½ × base × perpendicular height.", "Spot which length is the perpendicular height."],
    },
    teaching: {
      paragraphs: [
        "Draw a rectangle around a triangle, using the triangle's base and height. The triangle takes up exactly half of that rectangle.",
        "So: area of a triangle = ½ × base × height. Multiply the base by the height, then halve it.",
        "The height must be perpendicular to the base, meaning it meets the base at a right angle (a square corner). It's often drawn as a dashed line.",
        "A sloping side is NOT the height. It's longer than the height, so using it gives an answer that's too big. If a sloping length is given, it's usually there to test you.",
      ],
      demo: "triangle-half",
      examples: [
        {
          question: "Find the area of the triangle.",
          shape: {
            points: [
              [0, 0],
              [10, 0],
              [3, 4],
            ],
            sides: [
              { i: 0, text: "10 cm" },
              { i: 2, text: "5 cm" },
            ],
            heights: [{ x: 3, y1: 4, y2: 0, text: "4 cm" }],
            description: "A triangle with base 10 cm, dashed perpendicular height 4 cm, and a sloping side of 5 cm.",
          },
          steps: [
            "The perpendicular height is the dashed line, 4 cm. The 5 cm side slopes, so ignore it.",
            "Area = ½ × base × height = ½ × 10 × 4",
            "= ½ × 40 = 20 cm²",
          ],
        },
        {
          question: "A right-angled triangle has base 7 cm and height 3 cm. Find its area.",
          steps: ["Area = ½ × 7 × 3", "= ½ × 21", "= 10.5 cm² (you can also write 10½)"],
        },
      ],
    },
    counts: { guided: 4, independent: 4, check: 5 },
  },

  "area-parallelogram": {
    skillId: "area-parallelogram",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "A parallelogram is a rectangle that has been pushed over. Seeing why its area works the same way is a big idea in maths: you can move pieces around without changing the area.",
      byTheEnd: ["Use base × perpendicular height.", "Explain why there's no ½ this time.", "Ignore the sloping side."],
    },
    teaching: {
      paragraphs: [
        "A parallelogram has two pairs of parallel sides. It looks like a rectangle leaning over.",
        "Cut the triangle off one end and slide it to the other end. Now it's a rectangle with the same base and the same height, and nothing was added or lost.",
        "So: area of a parallelogram = base × perpendicular height. There's no ½, because it isn't a triangle.",
        "Just like with triangles, use the height that meets the base at a right angle, not the sloping side.",
      ],
      demo: "parallelogram-shear",
      examples: [
        {
          question: "Find the area of the parallelogram.",
          shape: {
            points: [
              [0, 0],
              [9, 0],
              [12, 4],
              [3, 4],
            ],
            sides: [
              { i: 0, text: "9 cm" },
              { i: 3, text: "5 cm" },
            ],
            heights: [{ x: 3, y1: 4, y2: 0, text: "4 cm" }],
            description: "A parallelogram with base 9 cm, dashed perpendicular height 4 cm and sloping side 5 cm.",
          },
          steps: ["The perpendicular height is 4 cm (dashed). Ignore the 5 cm sloping side.", "Area = base × height = 9 × 4", "= 36 cm²"],
        },
      ],
    },
    counts: { guided: 4, independent: 4, check: 5 },
  },

  "area-trapezium": {
    skillId: "area-trapezium",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Trapeziums turn up in GCSE questions about fields, ramps and cross-sections. The formula isn't on the GCSE formula sheet, so understanding where it comes from makes it much easier to remember.",
      byTheEnd: ["Use ½ × (a + b) × h.", "Explain where the formula comes from.", "Pick out a, b and h from a diagram."],
    },
    teaching: {
      paragraphs: [
        "A trapezium has one pair of parallel sides, usually called a and b. They're different lengths.",
        "Take two identical trapeziums and turn one upside down. They fit together into a parallelogram whose base is a + b and whose height is h.",
        "That parallelogram's area is (a + b) × h. One trapezium is half of it, so: area = ½ × (a + b) × h.",
        "Do the bracket first: add the two parallel sides, then multiply by the height, then halve. As before, h is the perpendicular height, not a sloping side.",
      ],
      demo: "trapezium-double",
      examples: [
        {
          question: "Find the area of the trapezium.",
          shape: {
            points: [
              [0, 0],
              [10, 0],
              [9, 5],
              [3, 5],
            ],
            sides: [
              { i: 0, text: "10 cm" },
              { i: 2, text: "6 cm" },
            ],
            heights: [{ x: 3, y1: 5, y2: 0, text: "5 cm" }],
            description: "A trapezium with parallel sides 6 cm and 10 cm, and perpendicular height 5 cm.",
          },
          steps: ["a = 6, b = 10, h = 5", "Area = ½ × (6 + 10) × 5 = ½ × 16 × 5", "= ½ × 80 = 40 cm²"],
        },
        {
          question: "A trapezium has parallel sides 3 m and 8 m, and height 5 m. Find its area.",
          steps: ["Area = ½ × (3 + 8) × 5", "= ½ × 11 × 5 = ½ × 55", "= 27.5 m²"],
        },
      ],
    },
    counts: { guided: 4, independent: 4, check: 5 },
  },

  "area-compound": {
    skillId: "area-compound",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Real rooms and gardens are rarely perfect rectangles. Splitting a shape into pieces you already know is how you find the area of almost anything.",
      byTheEnd: ["Split an L-shape into two rectangles.", "Work out lengths that aren't labelled.", "Check your answer a second way."],
    },
    teaching: {
      paragraphs: [
        "A compound shape is made of simpler shapes stuck together. An L-shape is two rectangles.",
        "Draw one line to split it into two rectangles that don't overlap. Find each area, then add them.",
        "Usually one length you need isn't written on the diagram. Find it from the others: if the whole bottom is 10 cm and the top is 6 cm, the step is 10 − 6 = 4 cm.",
        "Another way: find the big rectangle around the shape and subtract the missing corner. Both ways give the same answer, which makes a good check.",
      ],
      demo: "compound-split",
      examples: [
        {
          question: "Find the area of the L-shape.",
          shape: {
            points: [
              [0, 0],
              [9, 0],
              [9, 3],
              [4, 3],
              [4, 7],
              [0, 7],
            ],
            sides: [
              { i: 0, text: "9 cm" },
              { i: 1, text: "3 cm" },
              { i: 4, text: "4 cm" },
              { i: 5, text: "7 cm" },
            ],
            description: "An L-shape: bottom 9 cm, lower right side 3 cm, top 4 cm, left side 7 cm.",
          },
          steps: [
            "Split with a vertical line above the inside corner.",
            "Left rectangle: 4 × 7 = 28. Right rectangle: width 9 − 4 = 5, height 3, so 5 × 3 = 15.",
            "Total = 28 + 15 = 43 cm²",
            "Check: big rectangle 9 × 7 = 63, missing corner 5 × 4 = 20, and 63 − 20 = 43. ✓",
          ],
        },
      ],
    },
    counts: { guided: 4, independent: 4, check: 5 },
  },
};
