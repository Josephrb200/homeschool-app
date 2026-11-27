/**
 * Column vectors (GCSE Foundation G24, G25). Skill id and prerequisites copy
 * the GCSE Foundation topic map.
 *
 * STATUS: Draft. Written by the build team; needs review by a qualified maths
 * teacher before it is marked Verified.
 */

import type { Misconception, Skill } from "@/engine/types";

export const VECTOR_SKILLS: Skill[] = [
  {
    id: "geo-vectors",
    topic: "Vectors",
    name: "Column vectors: add, subtract and multiply by a number",
    objective: "I can write a column vector from a grid, and add, subtract and multiply column vectors.",
    typicalYear: 10,
    gcseTier: "foundation",
    prerequisites: ["geo-translation"],
  },
];

const mc = (id: string, label: string, explanation: string, pointsTo?: string): [string, Misconception] => [id, { id, label, explanation, pointsTo }];

export const VECTOR_MISCONCEPTIONS: Record<string, Misconception> = Object.fromEntries([
  mc("vec-swapped", "Swapped the top and bottom numbers", "The top number is the move across (left or right). The bottom number is the move up or down. Across first, like coordinates.", "geo-translation"),
  mc("vec-sign", "Got a direction's sign wrong", "Right and up are positive. Left and down are negative, so 3 left is −3 and 2 down is −2."),
  mc("vec-reversed", "Went the wrong way along the vector", "A vector goes from its start to its end (follow the arrow). Going backwards gives the same numbers with the signs swapped. For vector AB, work out B − A: end minus start."),
  mc("vec-add-subtract", "Added instead of subtracting (or the other way)", "Check the sign between the vectors. For a + b add the top numbers and add the bottom numbers. For a − b take away the top numbers and take away the bottom numbers."),
  mc("vec-order", "Subtracted the wrong way round", "a − b means a's numbers take away b's numbers, in that order. b − a gives the opposite signs."),
  mc("vec-negative", "Slipped with a negative number", "Taking away a negative is the same as adding: 3 − (−2) = 3 + 2 = 5. Adding a negative is taking away: 3 + (−2) = 1.", "num-negatives"),
  mc("vec-multiply-one", "Multiplied only one number", "Multiply both numbers in the vector: 3 × vec(2,−1) = vec(6,−3). The vector is 3 times as long in both directions."),
  mc("vec-added-scalar", "Added the number instead of multiplying", "3a means 3 × a: multiply both numbers by 3. Don't add 3 to them."),
]);
