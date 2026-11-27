/**
 * Lesson content for the early algebra chain (six stages, like every chain).
 * Practice and check questions come from generators.ts.
 *
 * Writing style: short sentences, one idea per paragraph, every rule shown
 * with a number example first, because a letter is just a number we don't
 * know yet.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher before Verified.
 */

import type { Lesson } from "@/content/lesson-types";
import type { SkillId } from "@/engine/types";

export const ALGEBRA_LESSONS: Record<SkillId, Lesson> = {
  "alg-notation": {
    skillId: "alg-notation",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "Algebra uses letters to stand for numbers. It's a short way of writing a rule that works for any number, like 'the cost is £3 for each ticket' becoming 3t. Every other algebra topic uses this way of writing.",
      byTheEnd: ["Read 5n as '5 times n' and n + 5 as 'n add 5'.", "Write multiplying without a × sign, number first.", "Write n × n as n²."],
    },
    teaching: {
      paragraphs: [
        "A letter in algebra stands for a number. We might not know the number yet, or it might change. If n is the number of tickets, n could be 2, or 10, or 100.",
        "In algebra we leave out the × sign, because it looks too much like the letter x. So 5 × n is written 5n. The number always goes in front: we write 5n, never n5.",
        "Adding and subtracting keep their signs. n + 5 means 'n add 5'. n − 5 means 'n take away 5'.",
        "5n and n + 5 are very different. If n = 10, then 5n = 5 × 10 = 50, but n + 5 = 10 + 5 = 15.",
        "Two letters multiplied are written side by side: a × b = ab. A letter times itself uses a small 2, called 'squared': n × n = n². This is not the same as 2n, which means n + n.",
        "Dividing is usually written as a fraction: n ÷ 4 is written n/4.",
      ],
      demo: "notation-meaning",
      examples: [
        {
          question: "Write in algebra: y multiplied by 7.",
          steps: ["Leave out the × sign.", "Put the number first.", "Answer: 7y"],
        },
        {
          question: "Write in algebra: add 3 to m, then multiply by 2.",
          steps: ["Add 3 to m: m + 3.", "The whole of m + 3 is multiplied by 2, so it needs brackets.", "Answer: 2(m + 3)"],
        },
        {
          question: "Simplify t × t × 4.",
          steps: ["t × t = t²", "Put the number in front: 4 × t²", "Answer: 4t²"],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "alg-collect-terms": {
    skillId: "alg-collect-terms",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "Simplifying makes an expression shorter and easier to work with, like tidying a messy list. You'll simplify in almost every algebra question from now on.",
      byTheEnd: ["Spot like terms: terms with exactly the same letters.", "Add and subtract like terms.", "Leave unlike terms separate."],
    },
    teaching: {
      paragraphs: [
        "A term is one part of an expression, like 3x or 5 or 2y. The sign in front belongs to the term after it.",
        "Like terms have exactly the same letters, with the same powers. 3x and 5x are like terms. 3x and 5y are not. x² and x are not like terms either.",
        "To collect like terms, add or subtract the numbers in front. The letter stays the same: 3x + 5x = 8x. It does not become x².",
        "Think of x as 'apples' and y as 'bananas'. 3 apples + 2 bananas + 1 apple = 4 apples + 2 bananas. You can't turn that into 6 'apple-bananas'. So 3x + 2y + x = 4x + 2y.",
        "Watch the signs. In 7x + 2 − 3x, the 3x is being taken away, so the x terms are 7x − 3x = 4x. The answer is 4x + 2.",
      ],
      demo: "like-terms-sort",
      examples: [
        {
          question: "Simplify 4a + 3b + 2a + b.",
          steps: ["a terms: 4a + 2a = 6a", "b terms: 3b + b = 4b (b means 1b)", "Answer: 6a + 4b"],
        },
        {
          question: "Simplify 6x + 5 − 2x + 1.",
          steps: ["x terms: 6x − 2x = 4x", "Numbers: 5 + 1 = 6", "Answer: 4x + 6"],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "alg-substitution": {
    skillId: "alg-substitution",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "Formulas are everywhere: working out a phone bill, a taxi fare, or how far a car travels. Substituting means putting real numbers into a formula to get an answer.",
      byTheEnd: ["Replace each letter with its number.", "Multiply before adding or subtracting.", "Use formulas like v = u + at."],
    },
    teaching: {
      paragraphs: [
        "Substitute means 'swap in'. You replace each letter with the number it stands for, then work it out.",
        "Write the × signs back in when you substitute. 3a with a = 5 becomes 3 × 5 = 15. It is not 35: the 3 and the 5 aren't digits of one number.",
        "Do the calculation in the right order: brackets first, then powers (like ²), then × and ÷, then + and −.",
        "So 3a + 2 with a = 5 is 3 × 5 + 2. Multiply first: 15. Then add: 17.",
        "With a power, only the letter right before the ² is squared. 2x² with x = 3 is 2 × 3² = 2 × 9 = 18, not 6² = 36.",
      ],
      demo: "substitute-swap",
      examples: [
        {
          question: "Work out 4p − 3 when p = 6.",
          steps: ["Swap p for 6: 4 × 6 − 3", "Multiply first: 4 × 6 = 24", "Then subtract: 24 − 3 = 21"],
        },
        {
          question: "The formula v = u + at. Find v when u = 5, a = 2 and t = 10.",
          steps: ["at means a × t.", "v = 5 + 2 × 10", "Multiply first: 2 × 10 = 20", "v = 5 + 20 = 25"],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "alg-expand-single": {
    skillId: "alg-expand-single",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Expanding means multiplying out brackets. It's the first step in solving many equations, and it shows two expressions are really the same thing written differently.",
      byTheEnd: ["Multiply every term inside the bracket by the term outside.", "Expand brackets with a letter outside, like x(x + 3).", "Expand, then collect like terms."],
    },
    teaching: {
      paragraphs: [
        "A number next to a bracket means multiply. 3(x + 4) means 3 × (x + 4): three lots of x + 4.",
        "Three lots of (x + 4) is x + 4 + x + 4 + x + 4. That's 3x + 12. So 3(x + 4) = 3x + 12.",
        "The quick way: multiply each term inside the bracket by the number outside. 3 × x = 3x and 3 × 4 = 12. Don't forget the second term.",
        "Keep the sign. 5(y − 2) = 5y − 10, because 5 × 2 = 10 and it was being taken away.",
        "A letter outside works the same way. x(x + 3) = x × x + x × 3 = x² + 3x.",
        "If there's more after the bracket, expand first, then collect like terms.",
      ],
      demo: "expand-area",
      examples: [
        {
          question: "Expand 4(2a + 5).",
          steps: ["4 × 2a = 8a", "4 × 5 = 20", "Answer: 8a + 20"],
        },
        {
          question: "Expand and simplify 3(x + 2) + 4x.",
          steps: ["Expand: 3(x + 2) = 3x + 6", "Now 3x + 6 + 4x", "Collect the x terms: 7x + 6"],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "alg-function-machines": {
    skillId: "alg-function-machines",
    status: "draft",
    minutes: 15,
    intro: {
      whyItMatters:
        "A function machine shows a rule as a set of steps. Running it backwards is exactly how you'll solve equations, so this is the warm-up for that.",
      byTheEnd: ["Put a number through a machine to find the output.", "Know the opposite of each operation.", "Work backwards from the output to find the input."],
    },
    teaching: {
      paragraphs: [
        "A function machine takes an input, does each step in order from left to right, and gives an output.",
        "Input 4 → × 3 → + 2. First 4 × 3 = 12. Then 12 + 2 = 14. The output is 14.",
        "Every operation has an opposite that undoes it. + undoes −, and − undoes +. × undoes ÷, and ÷ undoes ×.",
        "To find the input from the output, go backwards. Start at the output, undo the last step first, then the step before it.",
        "Output 14 from × 3 → + 2: undo + 2 first (14 − 2 = 12), then undo × 3 (12 ÷ 3 = 4). The input was 4.",
        "Always check by putting your answer back through the machine forwards.",
      ],
      demo: "function-machine",
      examples: [
        {
          question: "Input 6 → × 4 → − 5. What's the output?",
          steps: ["6 × 4 = 24", "24 − 5 = 19", "The output is 19."],
        },
        {
          question: "A machine does × 2 then + 7. The output is 25. What was the input?",
          steps: ["Go backwards, last step first.", "Undo + 7: 25 − 7 = 18", "Undo × 2: 18 ÷ 2 = 9", "Check: 9 × 2 + 7 = 25 ✓. The input was 9."],
        },
      ],
    },
    counts: { guided: 4, independent: 4, check: 5 },
  },

  "alg-solve-simple": {
    skillId: "alg-solve-simple",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "An equation is a puzzle: find the number that makes both sides equal. Solving equations is one of the most-tested skills in GCSE maths, and it's used in science, money and everyday problems.",
      byTheEnd: ["Keep an equation balanced by doing the same to both sides.", "Solve one-step equations like 4x = 28.", "Solve two-step equations like 3x + 5 = 20, and check the answer."],
    },
    teaching: {
      paragraphs: [
        "An equation says two things are equal, like x + 7 = 12. Solving it means finding what x is.",
        "Think of a balance. Both sides weigh the same. If you take something off one side, take the same off the other side, and it stays balanced.",
        "Undo what's being done to x, using the opposite operation. x + 7 = 12: subtract 7 from both sides, so x = 5.",
        "4x = 28 means 4 × x = 28. Undo × 4 by dividing both sides by 4: x = 7.",
        "Two steps, like 3x + 5 = 20: undo the + or − first, then the × or ÷. Subtract 5: 3x = 15. Divide by 3: x = 5. It's the function machine run backwards.",
        "Check by putting your answer back in: 3 × 5 + 5 = 20 ✓.",
      ],
      demo: "balance-solve",
      examples: [
        {
          question: "Solve x − 4 = 9.",
          steps: ["4 is taken away from x, so add 4 to both sides.", "x = 9 + 4", "x = 13. Check: 13 − 4 = 9 ✓"],
        },
        {
          question: "Solve 2x + 3 = 17.",
          steps: ["Subtract 3 from both sides: 2x = 14", "Divide both sides by 2: x = 7", "Check: 2 × 7 + 3 = 17 ✓"],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },
};
