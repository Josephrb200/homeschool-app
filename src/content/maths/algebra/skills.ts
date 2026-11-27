/**
 * The early algebra chain: notation, collecting like terms, substitution,
 * expanding single brackets, function machines and one- and two-step
 * equations (KS3, GCSE Foundation A1, A2, A4, A7, A17).
 *
 * Prerequisites follow the GCSE Foundation topic map, keeping only the skills
 * that are built so far. Questions here were written before negative numbers
 * and the order of operations were built, so they stay with positive whole
 * numbers and say the order of operations out loud.
 *
 * STATUS: Draft. Written by the build team; needs review by a qualified maths
 * teacher before it is marked Verified.
 */

import type { Misconception, Skill } from "@/engine/types";

export const ALGEBRA_SKILLS: Skill[] = [
  {
    id: "alg-notation",
    topic: "Algebra",
    name: "Algebraic notation",
    objective: "I can write and read algebra the standard way: 5n, n + 5, n², ab.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: ["num-order-of-operations"],
  },
  {
    id: "alg-collect-terms",
    topic: "Algebra",
    name: "Simplifying by collecting like terms",
    objective: "I can simplify an expression by collecting like terms, like 3x + 2y + x = 4x + 2y.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: ["alg-notation"],
  },
  {
    id: "alg-substitution",
    topic: "Algebra",
    name: "Substituting into expressions and formulae",
    objective: "I can work out the value of an expression or formula when I know the letters' values.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: ["alg-notation", "num-negatives"],
  },
  {
    id: "alg-expand-single",
    topic: "Algebra",
    name: "Expanding single brackets",
    objective: "I can multiply out a bracket, like 3(x + 4) = 3x + 12, and simplify afterwards.",
    typicalYear: 8,
    gcseTier: "foundation",
    prerequisites: ["alg-collect-terms"],
  },
  {
    id: "alg-function-machines",
    topic: "Algebra",
    name: "Function machines: inputs and outputs",
    objective: "I can find the output of a function machine, and work backwards to find the input.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: [],
  },
  {
    id: "alg-solve-simple",
    topic: "Algebra",
    name: "Solving one- and two-step equations",
    objective: "I can solve equations like x + 7 = 12, 4x = 28 and 3x + 5 = 20 by doing the same to both sides.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: ["alg-function-machines", "alg-notation"],
  },
];

export const ALGEBRA_MISCONCEPTIONS: Record<string, Misconception> = {
  "alg-times-as-add": {
    id: "alg-times-as-add",
    label: "Read multiplying as adding",
    explanation: "5n means 5 × n, five lots of n. Adding 5 to n is written n + 5. Try both with n = 10: 5n = 50, but n + 5 = 15.",
    pointsTo: "alg-notation",
  },
  "alg-missing-brackets": {
    id: "alg-missing-brackets",
    label: "Left out the brackets",
    explanation:
      "Without brackets, only the letter gets multiplied. If you add first and then multiply, the whole sum is multiplied, so it needs brackets: 3(n + 2), not 3n + 2.",
  },
  "alg-square-as-double": {
    id: "alg-square-as-double",
    label: "Read x² as 2 × x",
    explanation: "x² means x × x, not 2 × x. If x = 3, x² = 3 × 3 = 9, but 2x = 6.",
    pointsTo: "alg-notation",
  },
  "alg-joined-unlike": {
    id: "alg-joined-unlike",
    label: "Combined unlike terms",
    explanation:
      "You can only add terms with exactly the same letters. 4a + 2b can't become 6ab, just like 4 apples and 2 bananas aren't 6 'apple-bananas'. Leave unlike terms separate.",
    pointsTo: "alg-notation",
  },
  "alg-added-powers": {
    id: "alg-added-powers",
    label: "Squared the letter when adding",
    explanation: "When you add like terms, the letter stays the same: 3x + 5x = 8x (8 lots of x). It only becomes x² when you multiply x by x.",
    pointsTo: "alg-notation",
  },
  "alg-sign-error": {
    id: "alg-sign-error",
    label: "Lost a minus sign",
    explanation: "The sign belongs to the term after it. In 5x + 3 − 2x, the 2x is being taken away, so 5x − 2x = 3x.",
  },
  "alg-digits-joined": {
    id: "alg-digits-joined",
    label: "Put the digits side by side",
    explanation:
      "3a means 3 × a. When a = 5, that's 3 × 5 = 15, not 35. When you substitute, write a × sign or a bracket: 3 × (5).",
    pointsTo: "alg-notation",
  },
  "alg-order-of-operations": {
    id: "alg-order-of-operations",
    label: "Added before multiplying",
    explanation: "Multiply before you add or subtract. In 3a + 2 with a = 5, do 3 × 5 = 15 first, then + 2 = 17.",
  },
  "alg-squared-coefficient": {
    id: "alg-squared-coefficient",
    label: "Squared the number in front too",
    explanation: "In 2x², only the x is squared. Square x first, then multiply by 2. With x = 3: 3² = 9, then 2 × 9 = 18.",
  },
  "alg-expand-first-only": {
    id: "alg-expand-first-only",
    label: "Only multiplied the first term in the bracket",
    explanation: "The number outside multiplies everything inside the bracket. 3(x + 4) is 3 lots of x and 3 lots of 4: 3x + 12.",
  },
  "alg-expand-added": {
    id: "alg-expand-added",
    label: "Added the outside number instead of multiplying",
    explanation: "A number next to a bracket means multiply. 3(x + 4) means 3 × (x + 4), so multiply each term by 3.",
    pointsTo: "alg-notation",
  },
  "alg-x-times-x": {
    id: "alg-x-times-x",
    label: "Wrote x × x as 2x",
    explanation: "x × x = x², not 2x. 2x means x + x.",
    pointsTo: "alg-notation",
  },
  "alg-machine-order": {
    id: "alg-machine-order",
    label: "Did the steps in the wrong order",
    explanation:
      "Do the steps in the order they're given. In a function machine, follow the arrows from left to right. In words, 'multiply by 3, then add 2' means multiply first: 3n + 2.",
  },
  "alg-machine-forwards": {
    id: "alg-machine-forwards",
    label: "Ran the machine forwards instead of backwards",
    explanation:
      "To find the input, start at the output and go backwards. Undo each step with its opposite: × becomes ÷, + becomes −. Undo the last step first.",
  },
  "alg-machine-wrong-order": {
    id: "alg-machine-wrong-order",
    label: "Undid the steps in the wrong order",
    explanation: "Working backwards, undo the last step first. Think of taking off shoes and socks: shoes come off first because they went on last.",
  },
  "alg-inverse-wrong": {
    id: "alg-inverse-wrong",
    label: "Did the same operation instead of the opposite",
    explanation:
      "To get x on its own, undo what's being done to it. If 7 is added, subtract 7 from both sides. If x is multiplied by 4, divide both sides by 4.",
    pointsTo: "alg-function-machines",
  },
  "alg-subtracted-coefficient": {
    id: "alg-subtracted-coefficient",
    label: "Subtracted the number in front of x",
    explanation: "4x means 4 × x. To undo multiplying by 4, divide both sides by 4. Subtracting 4 doesn't undo multiplying.",
    pointsTo: "alg-notation",
  },
  "alg-forgot-second-step": {
    id: "alg-forgot-second-step",
    label: "Stopped after one step",
    explanation: "That's what the x term equals, not x itself. If 3x = 15, there's one more step: divide by 3 to get x = 5.",
  },
  "alg-two-step-order": {
    id: "alg-two-step-order",
    label: "Divided before removing the added number",
    explanation:
      "Undo the + or − first, then the ×. In 3x + 5 = 20, take 5 from both sides (3x = 15), then divide by 3 (x = 5).",
    pointsTo: "alg-function-machines",
  },
};
