/**
 * The sequences chain: term-to-term and position-to-term rules, special
 * sequences, the nth term of a linear sequence, and Fibonacci-type, quadratic
 * and geometric sequences. KS3/KS4, GCSE Foundation (DfE A23, A24, A25).
 *
 * Prerequisites copy the topic map exactly (content/index.ts drops any that
 * aren't built yet).
 *
 * STATUS: Draft. Written by the build team; needs review by a qualified maths
 * teacher before it is marked Verified.
 */

import type { Misconception, Skill } from "@/engine/types";

export const SEQUENCE_SKILLS: Skill[] = [
  {
    id: "alg-sequences",
    topic: "Sequences",
    name: "Term-to-term and position-to-term rules",
    objective: "I can continue a sequence, describe its term-to-term rule, and use a position-to-term rule to find any term.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: ["alg-substitution"],
  },
  {
    id: "alg-special-sequences",
    topic: "Sequences",
    name: "Square, cube, triangular numbers and arithmetic sequences",
    objective: "I can recognise square, cube and triangular numbers and arithmetic sequences, and continue them.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: ["alg-sequences", "num-powers-roots"],
  },
  {
    id: "alg-nth-term",
    topic: "Sequences",
    name: "The nth term of a linear sequence",
    objective: "I can find the nth term of a linear sequence, use it to find any term, and check whether a number is in the sequence.",
    typicalYear: 8,
    gcseTier: "foundation",
    prerequisites: ["alg-special-sequences", "alg-solve-simple"],
  },
  {
    id: "alg-other-sequences",
    topic: "Sequences",
    name: "Fibonacci-type, quadratic and geometric sequences",
    objective: "I can continue Fibonacci-type, geometric and simple quadratic sequences, and tell the different types apart.",
    typicalYear: 10,
    gcseTier: "foundation",
    prerequisites: ["alg-special-sequences"],
  },
];

export const SEQUENCE_MISCONCEPTIONS: Record<string, Misconception> = {
  "seq-wrong-direction": {
    id: "seq-wrong-direction",
    label: "Added when the sequence goes down",
    explanation: "Check whether the terms get bigger or smaller. If they get smaller, the rule subtracts, so the next term is smaller too.",
  },
  "seq-skipped-term": {
    id: "seq-skipped-term",
    label: "Found the wrong term (counted one too many or too few)",
    explanation: "Count the terms carefully. Write the term number under each term, 1st, 2nd, 3rd, and keep going until you reach the one asked for.",
  },
  "seq-added-not-multiplied": {
    id: "seq-added-not-multiplied",
    label: "Added the difference when the rule multiplies",
    explanation:
      "Check the gaps. If they aren't the same each time, the rule might multiply. In 3, 6, 12, 24 each term is double the one before.",
  },
  "seq-concatenated": {
    id: "seq-concatenated",
    label: "Wrote the numbers side by side instead of multiplying",
    explanation: "3n means 3 × n. When n = 5, 3n = 3 × 5 = 15, not 35.",
    pointsTo: "alg-substitution",
  },
  "seq-rule-order": {
    id: "seq-rule-order",
    label: "Did the steps of the rule in the wrong order",
    explanation: "Follow the rule in the order it's written, or use BIDMAS: in 4n − 1, multiply first, then subtract.",
  },
  "seq-used-term-not-position": {
    id: "seq-used-term-not-position",
    label: "Mixed up a term's value with its position",
    explanation:
      "The position is which place a term is in (1st, 2nd, 3rd…). The term is the number in that place. n stands for the position.",
  },
  // ------------------------------------------------------------ special sequences
  "seq-square-doubled": {
    id: "seq-square-doubled",
    label: "Doubled instead of squaring",
    explanation: "The nth square number is n × n, not n × 2. The 6th square number is 6 × 6 = 36.",
    pointsTo: "num-powers-roots",
  },
  "seq-cube-tripled": {
    id: "seq-cube-tripled",
    label: "Multiplied by 3 instead of cubing",
    explanation: "The nth cube number is n × n × n. The 4th cube number is 4 × 4 × 4 = 64, not 12.",
    pointsTo: "num-powers-roots",
  },
  "seq-triangular-square": {
    id: "seq-triangular-square",
    label: "Gave a square number instead of a triangular number",
    explanation:
      "Triangular numbers grow by adding 1, then 2, then 3, then 4…: 1, 3, 6, 10, 15. They make triangles of dots. Square numbers (1, 4, 9, 16) make squares.",
  },
  "seq-type-mixup": {
    id: "seq-type-mixup",
    label: "Mixed up the types of sequence",
    explanation:
      "Arithmetic: add or subtract the same amount each time. Geometric: multiply by the same amount. Square: 1, 4, 9, 16. Triangular: 1, 3, 6, 10. Fibonacci-type: add the two terms before.",
  },
  // ------------------------------------------------------------ nth term
  "seq-nth-difference-added": {
    id: "seq-nth-difference-added",
    label: "Wrote n + the difference",
    explanation:
      "The difference goes in front of n, multiplying it. A sequence going up in 4s has nth term 4n + something, not n + 4.",
  },
  "seq-nth-first-term": {
    id: "seq-nth-first-term",
    label: "Used the first term as the number added",
    explanation:
      "Compare the sequence with the times table of the difference. For 7, 11, 15… compare with 4n: 4, 8, 12. Each term is 3 more, so the nth term is 4n + 3, not 4n + 7.",
  },
  "seq-nth-no-adjust": {
    id: "seq-nth-no-adjust",
    label: "Left out the adjustment",
    explanation: "After writing the difference times n, check the first term. If 4n gives 4 but the first term is 7, add 3: 4n + 3.",
  },
  "seq-nth-sign": {
    id: "seq-nth-sign",
    label: "Missed that the sequence goes down",
    explanation: "If the terms go down, the difference is negative, so the nth term has −n in it. Going down in 3s means −3n + something.",
  },
  "seq-solved-backwards": {
    id: "seq-solved-backwards",
    label: "Put the term into the rule instead of solving for n",
    explanation:
      "To find which term is a number, set the nth term equal to that number and solve for n. For 4n + 1 = 61: 4n = 60, so n = 15.",
    pointsTo: "alg-solve-simple",
  },
  // ------------------------------------------------------------ other sequences
  "seq-fib-as-arithmetic": {
    id: "seq-fib-as-arithmetic",
    label: "Added a fixed amount instead of the two terms before",
    explanation: "In a Fibonacci-type sequence, each term is the two terms before it added together. 2, 3, 5, 8: 5 + 8 = 13.",
  },
  "seq-quad-as-linear": {
    id: "seq-quad-as-linear",
    label: "Used the last gap again instead of the pattern in the gaps",
    explanation:
      "The gaps in this sequence aren't the same, so it isn't arithmetic. Look at how the gaps change (the second difference) and continue that pattern.",
  },
  "seq-geometric-as-arithmetic": {
    id: "seq-geometric-as-arithmetic",
    label: "Added the gap instead of multiplying",
    explanation: "Each term here is the one before multiplied by the same number. Divide a term by the one before to find what it's multiplied by.",
  },
};
