/**
 * Expressions and brackets: algebra words, factorising, index laws in
 * algebra, expanding two brackets, factorising quadratics, and showing two
 * expressions are identical (GCSE Foundation A3, A4, A6).
 *
 * Prerequisites copy the GCSE Foundation topic map exactly; the registry
 * leaves out any that aren't built yet.
 *
 * STATUS: Draft. Written by the build team; needs review by a qualified maths
 * teacher before it is marked Verified.
 */

import type { Misconception, Skill } from "@/engine/types";

export const EXPRESSION_SKILLS: Skill[] = [
  {
    id: "alg-vocabulary",
    topic: "Algebra",
    name: "Expression, equation, formula, identity",
    objective: "I can tell an expression, an equation, a formula and an identity apart, and say what a term is.",
    typicalYear: 8,
    gcseTier: "foundation",
    prerequisites: ["alg-notation"],
  },
  {
    id: "alg-factorise-single",
    topic: "Algebra",
    name: "Factorising into a single bracket",
    objective: "I can factorise fully by taking out the highest common factor, like 6x + 15 = 3(2x + 5).",
    typicalYear: 8,
    gcseTier: "foundation",
    prerequisites: ["alg-expand-single", "num-hcf-lcm"],
  },
  {
    id: "alg-index-laws",
    topic: "Algebra",
    name: "Index laws in algebra",
    objective: "I can simplify x³ × x⁴, x⁸ ÷ x², (x²)³ and 3x² × 4x⁵ using the index laws.",
    typicalYear: 9,
    gcseTier: "foundation",
    prerequisites: ["alg-collect-terms", "num-index-laws"],
  },
  {
    id: "alg-expand-double",
    topic: "Algebra",
    name: "Expanding two brackets",
    objective: "I can expand and simplify two brackets, like (x + 3)(x + 5) = x² + 8x + 15.",
    typicalYear: 9,
    gcseTier: "foundation",
    prerequisites: ["alg-expand-single"],
  },
  {
    id: "alg-factorise-quadratic",
    topic: "Algebra",
    name: "Factorising x² + bx + c and difference of two squares",
    objective: "I can factorise x² + 7x + 12 = (x + 3)(x + 4), and x² − 25 = (x + 5)(x − 5).",
    typicalYear: 10,
    gcseTier: "foundation",
    prerequisites: ["alg-expand-double"],
  },
  {
    id: "alg-show-that",
    topic: "Algebra",
    name: "Showing two expressions are equivalent",
    objective: "I can show that two expressions are identical by expanding and simplifying, and find missing numbers in an identity.",
    typicalYear: 10,
    gcseTier: "foundation",
    prerequisites: ["alg-expand-double", "alg-vocabulary"],
  },
];

export const EXPRESSION_MISCONCEPTIONS: Record<string, Misconception> = {
  // ---------------------------------------------------------------- vocabulary
  "voc-equation-for-expression": {
    id: "voc-equation-for-expression",
    label: "Called an expression an equation",
    explanation: "An equation always has an = sign, with something on each side. With no = sign, it's an expression: just a collection of terms, like 3x + 2.",
  },
  "voc-expression-for-equation": {
    id: "voc-expression-for-equation",
    label: "Missed the = sign",
    explanation: "It has an = sign and you can solve it to find the letter, so it's an equation. An expression has no = sign.",
  },
  "voc-formula-equation": {
    id: "voc-formula-equation",
    label: "Mixed up formula and equation",
    explanation:
      "A formula is a rule linking different quantities, like A = lw: change l or w and A changes too. An equation has one unknown value to find, like 2x + 1 = 9.",
  },
  "voc-identity-equation": {
    id: "voc-identity-equation",
    label: "Mixed up identity and equation",
    explanation:
      "An identity is true for every value of the letter, like 2(x + 3) ≡ 2x + 6: both sides are the same thing written differently. An equation is only true for particular values.",
  },
  "voc-term-count": {
    id: "voc-term-count",
    label: "Miscounted the terms",
    explanation: "Terms are separated by + and − signs. Each number or letter-group between the signs is one term, and the sign belongs to the term after it. 4x − 3y + 2 has 3 terms.",
  },

  "voc-subject": {
    id: "voc-subject",
    label: "Picked the wrong letter as the subject",
    explanation: "The subject of a formula is the letter on its own on one side of the = sign, usually the left. In v = u + at, the subject is v.",
  },

  // ---------------------------------------------------------------- factorising
  "fac-divided-first-only": {
    id: "fac-divided-first-only",
    label: "Only divided the first term",
    explanation: "Every term must be divided by the factor you take out. Check by expanding your answer: it should give back exactly what you started with.",
  },
  "fac-left-nothing": {
    id: "fac-left-nothing",
    label: "Left nothing behind for a whole term",
    explanation: "When you take a whole term out, a 1 is left behind, not nothing. 4x + 4 = 4(x + 1), because 4 × 1 = 4. Expand to check.",
  },
  "fac-power-kept": {
    id: "fac-power-kept",
    label: "Kept the power after taking x out",
    explanation: "x² ÷ x = x, not x². Taking x out of x² leaves one x behind: x² + 5x = x(x + 5).",
    pointsTo: "alg-notation",
  },
  "fac-subtracted": {
    id: "fac-subtracted",
    label: "Took the factor away instead of dividing",
    explanation: "Taking out a factor means dividing each term by it. 6x + 15 = 3(2x + 5), because 6x ÷ 3 = 2x and 15 ÷ 3 = 5. Subtracting 3 doesn't work.",
  },

  // ---------------------------------------------------------------- index laws
  "aidx-multiplied-powers": {
    id: "aidx-multiplied-powers",
    label: "Multiplied the powers when multiplying",
    explanation: "When you multiply, add the powers. x³ × x⁴ is (x × x × x) × (x × x × x × x): that's 7 x's, so x⁷, not x¹².",
    pointsTo: "num-index-laws",
  },
  "aidx-divided-powers": {
    id: "aidx-divided-powers",
    label: "Divided the powers when dividing",
    explanation: "When you divide, subtract the powers. x⁸ ÷ x² = x⁶, because 2 of the 8 x's cancel. Dividing 8 by 2 would give x⁴, which is wrong.",
    pointsTo: "num-index-laws",
  },
  "aidx-added-for-power": {
    id: "aidx-added-for-power",
    label: "Added the powers for a power of a power",
    explanation: "(x²)³ means x² × x² × x². That's 2 + 2 + 2 = 6, so x⁶. For a power of a power, multiply the powers.",
    pointsTo: "num-index-laws",
  },
  "aidx-added-coefficients": {
    id: "aidx-added-coefficients",
    label: "Added the numbers in front",
    explanation: "When terms are multiplied, the numbers in front are multiplied too. 3x² × 4x⁵: multiply 3 × 4 = 12, add the powers 2 + 5 = 7, so 12x⁷.",
  },
  "aidx-subtracted-coefficients": {
    id: "aidx-subtracted-coefficients",
    label: "Subtracted the numbers in front",
    explanation: "When dividing, divide the numbers in front: 12x⁷ ÷ 3x² = 4x⁵, because 12 ÷ 3 = 4. Only the powers are subtracted.",
  },
  "aidx-number-not-powered": {
    id: "aidx-number-not-powered",
    label: "Didn't raise the number to the power",
    explanation: "Everything inside the bracket is raised to the power. (2x³)² = 2x³ × 2x³ = 4x⁶. The 2 is squared too.",
  },
  "aidx-zero-is-zero": {
    id: "aidx-zero-is-zero",
    label: "Thought x⁰ is 0",
    explanation: "Anything (except 0) to the power 0 is 1. x³ ÷ x³ = x⁰, and anything divided by itself is 1.",
    pointsTo: "num-index-laws",
  },

  // ---------------------------------------------------------------- double brackets
  "dbl-missed-middle": {
    id: "dbl-missed-middle",
    label: "Only multiplied firsts and lasts",
    explanation:
      "Each term in the first bracket multiplies each term in the second: four multiplications. (x + 3)(x + 5) = x² + 5x + 3x + 15. Don't forget the two middle terms.",
  },
  "dbl-squared-each": {
    id: "dbl-squared-each",
    label: "Squared each term in the bracket",
    explanation: "(x + 3)² means (x + 3)(x + 3). Write it out twice and expand: x² + 3x + 3x + 9 = x² + 6x + 9. It is not x² + 9.",
  },
  "dbl-sign-error": {
    id: "dbl-sign-error",
    label: "Lost a minus sign",
    explanation: "Keep each term's sign with it. A positive times a negative is negative, and a negative times a negative is positive. A grid helps you keep track.",
    pointsTo: "num-negatives",
  },
  "dbl-coefficient": {
    id: "dbl-coefficient",
    label: "Forgot the number in front of x multiplies too",
    explanation: "Every term in the first bracket multiplies every term in the second, including the number in front of x. In (2x + 1)(x + 5), 2x × 5 = 10x, not 5x.",
  },
  "dbl-swapped-sum-product": {
    id: "dbl-swapped-sum-product",
    label: "Mixed up adding and multiplying the numbers",
    explanation: "In (x + a)(x + b), the number term is a × b, and the x term is (a + b)x. Check with the grid: the bottom-right box is the two numbers multiplied.",
  },

  // ---------------------------------------------------------------- factorising quadratics
  "fq-signs-flipped": {
    id: "fq-signs-flipped",
    label: "Put the wrong signs in the brackets",
    explanation: "Expand your answer to check. The two numbers in the brackets must multiply to the number term and add to the number in front of x, signs included.",
  },
  "fq-sum-wrong": {
    id: "fq-sum-wrong",
    label: "Numbers multiply right but don't add right",
    explanation: "You need a pair of numbers that multiply to the number term AND add to the number in front of x. List the factor pairs and check each one's sum.",
  },
  "fq-dots-square": {
    id: "fq-dots-square",
    label: "Used the same sign in both brackets",
    explanation: "x² − 25 has no x term, so the two x terms must cancel: one bracket has + and the other has −. x² − 25 = (x + 5)(x − 5).",
  },

  // ---------------------------------------------------------------- identities
  "show-second-bracket-sign": {
    id: "show-second-bracket-sign",
    label: "Didn't multiply the minus through the bracket",
    explanation: "A minus in front of a bracket multiplies every term inside. −2(x − 3) = −2x + 6, because −2 × −3 = +6.",
    pointsTo: "num-negatives",
  },
  "show-not-identity": {
    id: "show-not-identity",
    label: "Thought it was an identity when it isn't",
    explanation: "Expand and simplify both sides. It's an identity only if both sides end up exactly the same. Testing one value like x = 1 can help: if the sides differ, it's not an identity.",
  },
  "show-is-identity": {
    id: "show-is-identity",
    label: "Missed that it's an identity",
    explanation: "Expand and simplify the left side. If it ends up exactly the same as the right side, the statement is true for every x, so it is an identity.",
  },
};
