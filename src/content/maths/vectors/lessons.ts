/**
 * Lesson content for column vectors (six stages, like every chain).
 * Practice and check questions come from generators.ts.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher before Verified.
 */

import type { Lesson } from "@/content/lesson-types";
import type { PlaneSpec, SkillId } from "@/engine/types";

const example: PlaneSpec = {
  x: [0, 10],
  y: [0, 8],
  grid: true,
  arrows: [{ from: [2, 6], to: [6, 3] }],
  points: [{ at: [2, 6] }],
  lengths: [{ a: [2, 6], b: [6, 3], text: "a" }],
  description: "A squared grid with an arrow labelled a. It starts at a dot and goes 4 right and 3 down.",
};

export const VECTOR_LESSONS: Record<SkillId, Lesson> = {
  "geo-vectors": {
    skillId: "geo-vectors",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "A vector is a move: how far across and how far up or down. Vectors describe translations, forces in physics and movement in computer games. At GCSE you write them as column vectors and add, subtract and multiply them.",
      byTheEnd: ["Write a column vector from an arrow on a grid.", "Add and subtract column vectors.", "Multiply a column vector by a number."],
    },
    teaching: {
      paragraphs: [
        "A column vector has two numbers stacked in brackets. The top number is the move across: positive is right, negative is left. The bottom number is the move up or down: positive is up, negative is down. So vec(3,−2) means 3 right and 2 down.",
        "Vectors are named with a bold or underlined small letter, like a, or by their start and end points, like AB (the move from A to B). To find AB from coordinates, work out B − A: end minus start.",
        "To add vectors, add the top numbers, then add the bottom numbers. On a grid, a + b means do move a, then move b straight after it (tip to tail).",
        "To subtract, take away the top numbers, then the bottom numbers. Take care with negatives: 3 − (−2) = 5.",
        "To multiply by a number, multiply both numbers: 3 × vec(2,−1) = vec(6,−3). The arrow points the same way and is 3 times as long. A negative number turns it round to point the opposite way.",
      ],
      demo: "vector-builder",
      examples: [
        {
          question: "Write vector a as a column vector.",
          visual: { kind: "plane", plane: example },
          steps: ["Start at the dot and follow the arrow.", "Across: 4 right, so the top number is 4.", "Up/down: 3 down, so the bottom number is −3.", "a = vec(4,−3)"],
        },
        {
          question: "a = vec(3,−1) and b = vec(−5,4). Work out a − b.",
          steps: ["Top: 3 − (−5) = 3 + 5 = 8", "Bottom: −1 − 4 = −5", "a − b = vec(8,−5)"],
        },
        {
          question: "a = vec(2,1) and b = vec(−1,3). Work out 3a + 2b.",
          steps: ["Multiply first: 3a = vec(6,3) and 2b = vec(−2,6).", "Top: 6 + (−2) = 4", "Bottom: 3 + 6 = 9", "3a + 2b = vec(4,9)"],
        },
      ],
    },
    counts: { guided: 6, independent: 6, check: 5 },
  },
};
