/**
 * Equations and inequalities: harder linear equations, forming expressions
 * and equations from words, rearranging formulae, inequalities, simultaneous
 * equations and solving quadratics by factorising (GCSE Foundation A5, A17,
 * A18, A19, A21, A22, N1).
 *
 * Prerequisites copy the GCSE Foundation topic map exactly; the registry
 * leaves out any that aren't built yet.
 *
 * STATUS: Draft. Written by the build team; needs review by a qualified maths
 * teacher before it is marked Verified.
 */

import type { Misconception, Skill } from "@/engine/types";

export const EQUATION_SKILLS: Skill[] = [
  {
    id: "alg-solve-brackets",
    topic: "Algebra",
    name: "Solving equations with brackets",
    objective: "I can solve equations with brackets, like 3(x + 4) = 27.",
    typicalYear: 8,
    gcseTier: "foundation",
    prerequisites: ["alg-solve-simple", "alg-expand-single"],
  },
  {
    id: "alg-solve-both-sides",
    topic: "Algebra",
    name: "Solving equations with the unknown on both sides",
    objective: "I can solve equations like 5x + 3 = 2x + 18 by getting the letter on one side first.",
    typicalYear: 8,
    gcseTier: "foundation",
    prerequisites: ["alg-solve-brackets"],
  },
  {
    id: "alg-form-expressions",
    topic: "Algebra",
    name: "Writing expressions and formulae from words",
    objective: "I can turn words into algebra, like 'three more than n' = n + 3, and write a formula for a situation.",
    typicalYear: 8,
    gcseTier: "foundation",
    prerequisites: ["alg-substitution"],
  },
  {
    id: "alg-form-equations",
    topic: "Algebra",
    name: "Forming and solving equations from problems",
    objective: "I can write an equation for a problem in words or a shape, solve it, and answer the question asked.",
    typicalYear: 9,
    gcseTier: "foundation",
    prerequisites: ["alg-form-expressions", "alg-solve-both-sides"],
  },
  {
    id: "alg-rearrange",
    topic: "Algebra",
    name: "Changing the subject of a formula",
    objective: "I can rearrange a formula to make a different letter the subject, like y = 3x + 2 to x = (y − 2)/3.",
    typicalYear: 9,
    gcseTier: "foundation",
    prerequisites: ["alg-solve-brackets"],
  },
  {
    id: "alg-inequalities-number-line",
    topic: "Algebra",
    name: "Inequalities on a number line and listing integers",
    objective: "I can read and write inequalities like x ≥ 2 and −1 < x ≤ 3, show them on a number line, and list the integers that fit.",
    typicalYear: 9,
    gcseTier: "foundation",
    prerequisites: ["num-ordering"],
  },
  {
    id: "alg-solve-inequalities",
    topic: "Algebra",
    name: "Solving linear inequalities",
    objective: "I can solve inequalities like 3x + 4 < 19 the same way as equations, keeping the inequality sign.",
    typicalYear: 10,
    gcseTier: "foundation",
    prerequisites: ["alg-inequalities-number-line", "alg-solve-both-sides"],
  },
  {
    id: "alg-simultaneous",
    topic: "Algebra",
    name: "Solving linear simultaneous equations",
    objective: "I can solve two equations together to find both letters, like x + y = 10 and x − y = 4.",
    typicalYear: 10,
    gcseTier: "foundation",
    prerequisites: ["alg-solve-both-sides"],
  },
  {
    id: "alg-solve-quadratic",
    topic: "Algebra",
    name: "Solving quadratics by factorising",
    objective: "I can solve quadratic equations like x² + 5x + 6 = 0 by factorising, and give both solutions.",
    typicalYear: 10,
    gcseTier: "foundation",
    prerequisites: ["alg-factorise-quadratic"],
  },
];

export const EQUATION_MISCONCEPTIONS: Record<string, Misconception> = {
  // ---------------------------------------------------------------- brackets and both sides
  "eqn-expand-first-only": {
    id: "eqn-expand-first-only",
    label: "Only multiplied the first term in the bracket",
    explanation: "The number outside multiplies everything inside the bracket. 3(x + 4) = 3x + 12, not 3x + 4. Then solve.",
    pointsTo: "alg-expand-single",
  },
  "eqn-divide-one-side": {
    id: "eqn-divide-one-side",
    label: "Didn't do the same to both sides",
    explanation: "Whatever you do to one side, do to the other. If you divide the left by 3, divide the right by 3 too.",
    pointsTo: "alg-solve-simple",
  },
  "eqn-added-x-terms": {
    id: "eqn-added-x-terms",
    label: "Added the x terms instead of subtracting",
    explanation: "To get the letter on one side, take the smaller x term away from both sides. In 5x + 3 = 2x + 18, subtract 2x from both sides: 3x + 3 = 18.",
  },
  "eqn-number-sign": {
    id: "eqn-number-sign",
    label: "Moved a number without changing the operation",
    explanation: "To move a number across the = sign, do the opposite to both sides. If 3 is added on the left, subtract 3 from both sides.",
    pointsTo: "alg-solve-simple",
  },
  "eqn-negative-slip": {
    id: "eqn-negative-slip",
    label: "Lost a minus sign",
    explanation: "Check the signs at each step. Taking away a bigger number gives a negative: 4 − 10 = −6. Put your answer back into the equation to check.",
    pointsTo: "num-negatives",
  },

  // ---------------------------------------------------------------- forming
  "form-subtract-order": {
    id: "form-subtract-order",
    label: "Took away the wrong way round",
    explanation: "'4 less than n' means start with n and take 4 away: n − 4. '4 − n' would be n less than 4. Try a number: if n = 10, 4 less than 10 is 6.",
  },
  "form-gave-x": {
    id: "form-gave-x",
    label: "Gave the value of x, not what was asked",
    explanation: "Solving the equation finds x. Read the question again: it asks for something else. Use your x to work that out.",
  },
  "form-wrong-total": {
    id: "form-wrong-total",
    label: "Used the wrong total",
    explanation: "Check which fact gives the equation: the angles in a triangle add to 180°, on a straight line to 180°, and the perimeter is all the sides added up.",
  },
  "form-x-is-one": {
    id: "form-x-is-one",
    label: "Didn't count x as 1x",
    explanation: "x on its own means 1x. So x + 2x + 3x = 6x, not 5x.",
    pointsTo: "alg-collect-terms",
  },
  "form-perimeter-two-sides": {
    id: "form-perimeter-two-sides",
    label: "Added only two sides for the perimeter",
    explanation: "The perimeter is the distance all the way round. A rectangle has four sides: two lengths and two widths.",
  },

  // ---------------------------------------------------------------- rearranging
  "rearr-wrong-inverse": {
    id: "rearr-wrong-inverse",
    label: "Did the same operation instead of the opposite",
    explanation: "To move a term, undo it. If 2 is added, subtract 2 from both sides. If x is multiplied by 3, divide both sides by 3.",
    pointsTo: "alg-solve-simple",
  },
  "rearr-wrong-order": {
    id: "rearr-wrong-order",
    label: "Undid the steps in the wrong order",
    explanation: "Undo the last thing done to the letter first. In y = 3x + 2, x is multiplied by 3, then 2 is added. So subtract 2 first, then divide by 3: x = (y − 2)/3.",
    pointsTo: "alg-function-machines",
  },
  "rearr-divided-one-term": {
    id: "rearr-divided-one-term",
    label: "Divided only part of a side",
    explanation: "When you divide a side, divide all of it. (y − 2) ÷ 3 needs brackets: (y − 2)/3. Writing y − 2/3 only divides the 2.",
  },
  "rearr-square-root": {
    id: "rearr-square-root",
    label: "Halved instead of square-rooting",
    explanation: "The opposite of squaring is the square root, not dividing by 2. If A = s², then s = √A.",
    pointsTo: "num-powers-roots",
  },

  // ---------------------------------------------------------------- inequalities
  "ineq-circle": {
    id: "ineq-circle",
    label: "Mixed up < and ≤",
    explanation: "An open circle means the number is not included: < or >. A filled circle means it is included: ≤ or ≥. 'At least' and 'or equal to' mean ≤ or ≥.",
  },
  "ineq-direction": {
    id: "ineq-direction",
    label: "Pointed the sign the wrong way",
    explanation: "The sign opens towards the bigger side, like a mouth eating the bigger number. x > 3 means x is bigger than 3. Read it from the letter: 'x is greater than 3'.",
  },
  "ineq-list-endpoint": {
    id: "ineq-list-endpoint",
    label: "Included an end that isn't allowed",
    explanation: "With < or >, the end number is not included. −2 < n means n is bigger than −2, so −2 itself isn't in the list.",
  },
  "ineq-list-missed": {
    id: "ineq-list-missed",
    label: "Missed a whole number",
    explanation: "List every integer between the ends, including 0 and negative numbers. With ≤ or ≥ the end number is included too.",
  },
  "ineq-used-equals": {
    id: "ineq-used-equals",
    label: "Gave one value instead of an inequality",
    explanation: "Solve an inequality just like an equation, but keep the inequality sign all the way through. The answer is a range of values, like x < 5.",
  },
  "ineq-solve-step": {
    id: "ineq-solve-step",
    label: "Slipped on a solving step",
    explanation: "Undo the + or − first, then the × or ÷, doing the same to both sides. Check with a value: it should make the inequality true.",
    pointsTo: "alg-solve-simple",
  },
  "ineq-largest-integer": {
    id: "ineq-largest-integer",
    label: "Gave the boundary when it isn't allowed",
    explanation: "With < or >, the boundary itself doesn't count. If x < 7, the largest integer is 6. If x > −3, the smallest integer is −2.",
  },

  // ---------------------------------------------------------------- simultaneous
  "sim-swapped": {
    id: "sim-swapped",
    label: "Swapped the two values",
    explanation: "You found the right numbers, but they're the wrong way round. Put them back into one of the equations to check which is x and which is y.",
  },
  "sim-added-wrong": {
    id: "sim-added-wrong",
    label: "Added when the letters needed subtracting",
    explanation: "To eliminate a letter, its terms must cancel. If both equations have +y, subtract one equation from the other. If one has +y and one has −y, add them.",
  },

  // ---------------------------------------------------------------- quadratics
  "quad-root-sign": {
    id: "quad-root-sign",
    label: "Gave the numbers in the brackets",
    explanation: "Each bracket equals 0 for one solution. If (x + 3) = 0, then x = −3. The solutions have the opposite signs to the numbers in the brackets.",
  },
  "quad-one-root": {
    id: "quad-one-root",
    label: "Gave only one solution",
    explanation: "A quadratic usually has two solutions: one for each bracket. For x² = 25, both 5 and −5 work, because (−5)² = 25 too.",
  },
  "quad-lost-zero": {
    id: "quad-lost-zero",
    label: "Missed the solution x = 0",
    explanation: "x² + 5x = 0 factorises to x(x + 5) = 0. Either x = 0 or x + 5 = 0. Don't divide by x: that loses the x = 0 solution.",
  },
};
