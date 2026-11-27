/**
 * Lessons for "Equations and inequalities" (six stages, like every chain).
 * Practice and check questions come from generators.ts.
 *
 * Writing style: short sentences, one idea per paragraph, the balance idea
 * ("do the same to both sides") carried through every skill, and a check at
 * the end of every worked example.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher before Verified.
 */

import type { Lesson } from "@/content/lesson-types";
import type { SkillId } from "@/engine/types";

export const EQUATION_LESSONS: Record<SkillId, Lesson> = {
  "alg-solve-brackets": {
    skillId: "alg-solve-brackets",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters: "Lots of real equations come with brackets, like working out a length when the perimeter is 2(x + 5). There are two ways to start, and both work.",
      byTheEnd: ["Solve by expanding the bracket first.", "Solve by dividing both sides first, when it divides neatly.", "Solve equations whose answer is negative."],
    },
    teaching: {
      paragraphs: [
        "3(x + 4) = 27 means 3 lots of (x + 4) make 27.",
        "Way 1, divide first: if 3 lots make 27, one lot makes 27 ÷ 3 = 9. So x + 4 = 9, and x = 5.",
        "Way 2, expand first: 3(x + 4) = 3x + 12. So 3x + 12 = 27. Subtract 12: 3x = 15. Divide by 3: x = 5.",
        "Both ways give the same answer. Dividing first is quicker when the number on the right divides exactly. Expanding first always works.",
        "When you expand, multiply everything inside the bracket. 3(x + 4) is 3x + 12, not 3x + 4.",
        "Answers can be negative. 2(x + 7) = 6 gives x + 7 = 3, so x = −4. Check: 2 × (−4 + 7) = 2 × 3 = 6 ✓",
      ],
      demo: "brackets-two-ways",
      examples: [
        { question: "Solve 4(x − 2) = 20.", steps: ["Divide both sides by 4: x − 2 = 5", "Add 2 to both sides: x = 7", "Check: 4 × (7 − 2) = 4 × 5 = 20 ✓"] },
        { question: "Solve 3(2x + 1) = 27.", steps: ["Expand: 6x + 3 = 27", "Subtract 3: 6x = 24", "Divide by 6: x = 4", "Check: 3 × (8 + 1) = 27 ✓"] },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "alg-solve-both-sides": {
    skillId: "alg-solve-both-sides",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters: "When the letter is on both sides, you need one extra step: gather the letters together first. This comes up whenever you compare two prices, two journeys or two plans.",
      byTheEnd: ["Get the letter on one side by subtracting the smaller letter term.", "Then solve the two-step equation that's left.", "Handle brackets and negative answers."],
    },
    teaching: {
      paragraphs: [
        "In 5x + 3 = 2x + 18 there are x's on both sides. The balance idea still works: do the same to both sides.",
        "Step 1: take away the smaller x term from both sides. Subtract 2x: 3x + 3 = 18. Now there's only one x term.",
        "Step 2: solve as usual. Subtract 3: 3x = 15. Divide by 3: x = 5.",
        "Check by putting 5 into both sides: 5 × 5 + 3 = 28 and 2 × 5 + 18 = 28 ✓",
        "Subtracting the smaller x term keeps the number of x's positive, which avoids sign mistakes. It's fine if the x's end up on the right: 9 = 3x − 3 still gives x = 4.",
        "If there's a bracket, expand it first.",
      ],
      demo: "balance-both-sides",
      examples: [
        { question: "Solve 7x − 4 = 3x + 16.", steps: ["Subtract 3x from both sides: 4x − 4 = 16", "Add 4: 4x = 20", "Divide by 4: x = 5", "Check: 35 − 4 = 31 and 15 + 16 = 31 ✓"] },
        { question: "Solve x + 9 = 4x − 3.", steps: ["The smaller x term is x. Subtract x: 9 = 3x − 3", "Add 3: 12 = 3x", "Divide by 3: x = 4", "Check: 13 = 13 ✓"] },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "alg-form-expressions": {
    skillId: "alg-form-expressions",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters: "Real problems come in words, not algebra. Turning words into an expression or formula is the first step in solving almost any word problem.",
      byTheEnd: ["Translate 'more than', 'less than', 'times as many' into algebra.", "Use brackets when a whole amount is multiplied.", "Write a formula with a subject, like C = 4t + 2."],
    },
    teaching: {
      paragraphs: [
        "Choose a letter for the unknown amount. Then build the expression one step at a time.",
        "'5 more than n' is n + 5. '5 less than n' is n − 5: start with n and take 5 away. Be careful, it's not 5 − n.",
        "'3 times as many as n' is 3n. 'Half of n' is n/2.",
        "If the words say do one thing then another, follow the order. 'Add 2, then multiply by 5' is 5(n + 2). The brackets show the whole of n + 2 is multiplied.",
        "Try a number to check. If n = 10, '5 less than n' should be 5. n − 5 = 5 ✓, but 5 − n = −5 ✗.",
        "A formula has a subject. 'The total cost C of t tickets at £4 each, plus a £2 fee' is C = 4t + 2.",
      ],
      demo: "words-to-algebra",
      examples: [
        { question: "Maya has b books. Kai has 4 fewer books than Maya. Write an expression for Kai's books.", steps: ["Fewer means take away.", "Start with Maya's b, take away 4.", "Answer: b − 4"] },
        { question: "A taxi charges £3 plus £2 per mile. Write a formula for the cost £C of a journey of m miles.", steps: ["m miles at £2 each: 2m.", "Add the £3 charge once.", "C = 2m + 3"] },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "alg-form-equations": {
    skillId: "alg-form-equations",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters: "This is where algebra solves real problems: angles, perimeters, ages and shares. GCSE papers often give several marks for these, and the last mark is for answering the actual question.",
      byTheEnd: ["Write an equation from the facts in a problem.", "Solve it.", "Use x to answer the question that was asked."],
    },
    teaching: {
      paragraphs: [
        "Step 1: call the unknown x and write the other amounts using x.",
        "Step 2: find the fact that makes an equation. Angles in a triangle add to 180°. Angles on a straight line add to 180°. Angles in a quadrilateral add to 360°. Perimeter is all the sides added. Or the problem gives a total.",
        "Step 3: solve the equation.",
        "Step 4: read the question again. If it asks for the largest angle, or how many books someone has, use your x to work that out. x is often not the final answer.",
        "Remember that x on its own is 1x. x + 2x + 3x = 6x.",
      ],
      demo: "angle-equation",
      examples: [
        { question: "The angles in a triangle are x, 2x and 3x. Find the largest angle.", steps: ["Angles add to 180°: x + 2x + 3x = 180", "6x = 180, so x = 30", "The largest angle is 3x = 90°."] },
        { question: "A rectangle is x cm wide and (x + 3) cm long. Its perimeter is 26 cm. Find the length.", steps: ["x + (x + 3) + x + (x + 3) = 26", "4x + 6 = 26, so 4x = 20 and x = 5", "Length = x + 3 = 8 cm"] },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "alg-rearrange": {
    skillId: "alg-rearrange",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters: "A formula usually tells you how to find one thing. Rearranging lets you find any of the others, like working out time from a speed formula. It's used in science as much as in maths.",
      byTheEnd: ["Make a different letter the subject using inverse operations.", "Undo the steps in the right order: last step first.", "Rearrange formulae with brackets, fractions, π and squares."],
    },
    teaching: {
      paragraphs: [
        "The subject is the letter on its own, usually on the left. In y = 3x + 2, y is the subject.",
        "Rearranging is like solving an equation, but with letters instead of numbers. Do the same to both sides until your new letter is on its own.",
        "Think of a function machine. In y = 3x + 2, x is multiplied by 3, then 2 is added. To get x back, undo the last step first: subtract 2, then divide by 3.",
        "y − 2 = 3x, so x = (y − 2)/3. The brackets matter: the whole of y − 2 is divided by 3.",
        "The opposite of squaring is the square root. If A = s², then s = √A.",
        "Check by putting numbers in. If x = 4, y = 3 × 4 + 2 = 14. Then (14 − 2)/3 = 4 ✓",
      ],
      demo: "rearrange-machine",
      examples: [
        { question: "Make t the subject of v = u + at.", steps: ["Subtract u from both sides: v − u = at", "Divide both sides by a: (v − u)/a = t", "So t = (v − u)/a"] },
        { question: "Make x the subject of y = x/4 − 3.", steps: ["Add 3 to both sides: y + 3 = x/4", "Multiply both sides by 4: 4(y + 3) = x", "So x = 4(y + 3)"] },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "alg-inequalities-number-line": {
    skillId: "alg-inequalities-number-line",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters: "Inequalities describe ranges: 'at least 18 to vote', 'under 1.2 m for the small slide'. Number lines show the range at a glance.",
      byTheEnd: ["Read and write <, >, ≤ and ≥.", "Show an inequality on a number line, and read one off.", "List the integers that fit, including negatives and zero."],
    },
    teaching: {
      paragraphs: [
        "< means 'less than' and > means 'greater than'. The wide end faces the bigger number. x > 3 is read 'x is greater than 3'.",
        "≤ means 'less than or equal to' and ≥ means 'greater than or equal to'. 'At least 5' is x ≥ 5. 'At most 5' is x ≤ 5.",
        "On a number line, an open circle means the number is not included (< or >). A filled circle means it is included (≤ or ≥).",
        "The line shows all the values that work. An arrow means it carries on forever.",
        "x can be between two numbers: −2 < x ≤ 3 means x is bigger than −2 and at most 3.",
        "Integers are whole numbers, including 0 and negatives. The integers that fit −2 < n ≤ 3 are −1, 0, 1, 2, 3. −2 isn't included, 3 is.",
      ],
      demo: "inequality-line",
      examples: [
        { question: "A number line has an open circle at 2 and an arrow going right. Write the inequality.", steps: ["Open circle: 2 is not included, so use > or <.", "The arrow goes to bigger numbers.", "Answer: x > 2"] },
        { question: "List the integers n such that −3 ≤ n < 1.", steps: ["−3 is included (≤). 1 is not (<).", "Answer: −3, −2, −1, 0"] },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "alg-solve-inequalities": {
    skillId: "alg-solve-inequalities",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters: "Solving an inequality tells you every value that works, not just one. You solve it almost exactly like an equation, so you already know most of this.",
      byTheEnd: ["Solve inequalities using the same steps as equations.", "Keep the inequality sign the same throughout.", "Find the largest or smallest integer that fits."],
    },
    teaching: {
      paragraphs: [
        "Solve 3x + 4 < 19 like an equation, but keep the < sign instead of =.",
        "Subtract 4 from both sides: 3x < 15. Divide both sides by 3: x < 5.",
        "The answer is a range: every number less than 5 works. Check with one: x = 2 gives 3 × 2 + 4 = 10, and 10 < 19 ✓",
        "Adding, subtracting, and multiplying or dividing by a positive number never change the sign.",
        "(One warning for later: multiplying or dividing by a negative number flips the sign. In these questions you won't need to, if you keep the letter on the side with more of it.)",
        "Largest integer: if x < 5, the largest integer is 4, because 5 itself isn't allowed. If x ≤ 5, it's 5.",
      ],
      demo: "inequality-solve",
      examples: [
        { question: "Solve 2x − 3 ≥ 9.", steps: ["Add 3: 2x ≥ 12", "Divide by 2: x ≥ 6"] },
        { question: "Solve 5x + 2 > 2x + 14.", steps: ["Subtract 2x: 3x + 2 > 14", "Subtract 2: 3x > 12", "Divide by 3: x > 4"] },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "alg-simultaneous": {
    skillId: "alg-simultaneous",
    status: "draft",
    minutes: 30,
    intro: {
      whyItMatters: "Two unknowns need two facts. Simultaneous equations find both at once, like the price of a coffee and a cake from two different orders.",
      byTheEnd: ["Eliminate a letter by adding or subtracting the equations.", "Multiply an equation first when the numbers don't match.", "Substitute back to find the other letter, and check."],
    },
    teaching: {
      paragraphs: [
        "Simultaneous equations are two equations that are both true at the same time. The answer is a pair of values, one for each letter.",
        "Elimination: add or subtract the equations so that one letter disappears.",
        "If the y terms have different signs (+y and −y), add the equations. x + y = 10 and x − y = 4 add to 2x = 14, so x = 7.",
        "If the y terms have the same sign (+y and +y), subtract. 3x + y = 11 minus x + y = 5 gives 2x = 6, so x = 3.",
        "Then put that value back into either equation to find the other letter. 3 + y = 5, so y = 2.",
        "If no letter matches, multiply one equation first. For 3x + 2y = 16 and x + y = 6, multiply the second by 2: 2x + 2y = 12. Now subtract.",
        "Always check your pair in the equation you didn't use.",
      ],
      demo: "elimination",
      examples: [
        { question: "Solve x + y = 9 and x − y = 3.", steps: ["The y's have different signs, so add: 2x = 12", "x = 6", "Substitute: 6 + y = 9, so y = 3", "Check: 6 − 3 = 3 ✓"] },
        { question: "Solve 3x + 2y = 16 and x + y = 6.", steps: ["Multiply the second by 2: 2x + 2y = 12", "Subtract from the first: x = 4", "Substitute: 4 + y = 6, so y = 2", "Check: 12 + 4 = 16 ✓"] },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "alg-solve-quadratic": {
    skillId: "alg-solve-quadratic",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters: "Quadratic equations come up in area problems, in physics, and in graphs. Factorising turns a hard equation into two easy ones.",
      byTheEnd: ["Use the rule: if two things multiply to 0, one of them is 0.", "Solve a quadratic by factorising, giving both solutions.", "Solve x² = 25 and x² + 5x = 0 without losing a solution."],
    },
    teaching: {
      paragraphs: [
        "If a × b = 0, then a = 0 or b = 0. Nothing else multiplies to zero.",
        "So if (x + 3)(x − 2) = 0, either x + 3 = 0 or x − 2 = 0. That gives x = −3 or x = 2.",
        "Notice the signs swap: the bracket (x + 3) gives x = −3.",
        "For x² + 5x + 6 = 0, factorise first: (x + 2)(x + 3) = 0. Then x = −2 or x = −3.",
        "x² + 5x = 0 factorises to x(x + 5) = 0. So x = 0 or x = −5. Don't divide by x: you'd lose x = 0.",
        "x² = 25 has two answers: 5 and −5, because (−5)² = 25 too.",
        "Check each answer by putting it back in.",
      ],
      demo: "zero-product",
      examples: [
        { question: "Solve x² − x − 12 = 0.", steps: ["Factorise: (x + 3)(x − 4) = 0", "x + 3 = 0 gives x = −3", "x − 4 = 0 gives x = 4", "Check x = 4: 16 − 4 − 12 = 0 ✓"] },
        { question: "Solve x² − 6x = 0.", steps: ["Take out x: x(x − 6) = 0", "x = 0 or x = 6"] },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },
};
