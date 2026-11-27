/**
 * Lessons for "Expressions and brackets" (six stages, like every chain).
 * Practice and check questions come from generators.ts.
 *
 * Writing style: short sentences, one idea per paragraph, every rule shown
 * with numbers before letters, and a "check by expanding" habit throughout.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher before Verified.
 */

import type { Lesson } from "@/content/lesson-types";
import type { SkillId } from "@/engine/types";

export const EXPRESSION_LESSONS: Record<SkillId, Lesson> = {
  "alg-vocabulary": {
    skillId: "alg-vocabulary",
    status: "draft",
    minutes: 15,
    intro: {
      whyItMatters:
        "Exam questions use these words to tell you what to do. 'Simplify the expression', 'solve the equation' and 'show that this is an identity' each mean something different, so knowing the words tells you which job to do.",
      byTheEnd: ["Say what a term is, and count the terms in an expression.", "Tell an expression, an equation, a formula and an identity apart.", "Find the subject of a formula."],
    },
    teaching: {
      paragraphs: [
        "A term is one part of an expression: a number, a letter, or numbers and letters multiplied together. Terms are separated by + and − signs. 4x − 3y + 2 has three terms: 4x, −3y and 2.",
        "An expression is a collection of terms with no = sign, like 3x + 2. You can simplify an expression, but you can't solve it.",
        "An equation has an = sign and is true for particular values of the letter, like 2x + 1 = 9. You solve it to find the letter: here x = 4.",
        "A formula is a rule linking different quantities, like A = lw for the area of a rectangle. The letter on its own (A) is the subject. Change l or w and A changes too.",
        "An identity is true for every value of the letter, like 2(x + 3) ≡ 2x + 6. Both sides are the same thing written differently. The sign ≡ means 'is identical to'.",
        "Quick test: no = sign? Expression. ≡ sign, or true for every value? Identity. A rule for working something out? Formula. One value to find? Equation.",
      ],
      demo: "vocab-sorter",
      examples: [
        {
          question: "Is 5n − 3 = 17 an expression, an equation, a formula or an identity?",
          steps: ["It has an = sign, so it isn't an expression.", "It's only true when n = 4, so it isn't an identity.", "It has one unknown to find, so it's an equation."],
        },
        {
          question: "How many terms are in 3a² + 2a − 7?",
          steps: ["Split at the + and − signs: 3a², +2a, −7.", "That's 3 terms."],
        },
        {
          question: "Is 3(x + 1) ≡ 3x + 3 an identity?",
          steps: ["Expand the left: 3(x + 1) = 3x + 3.", "That's exactly the right side, for every x.", "So yes, it's an identity."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "alg-factorise-single": {
    skillId: "alg-factorise-single",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Factorising is expanding backwards: it puts brackets back in. It makes expressions shorter, helps you cancel fractions, and is the key step in solving quadratic equations later on.",
      byTheEnd: ["Find the highest common factor of the terms.", "Take it outside a bracket, and work out what goes inside.", "Factorise fully, including letters like x(x + 5) and 3x(2x + 3)."],
    },
    teaching: {
      paragraphs: [
        "Expanding: 3(2x + 5) = 6x + 15. Factorising goes the other way: 6x + 15 = 3(2x + 5).",
        "Step 1: find the highest common factor (HCF) of the terms. For 6x and 15, the HCF is 3.",
        "Step 2: write the HCF outside a bracket. Step 3: divide each term by it to find what goes inside. 6x ÷ 3 = 2x and 15 ÷ 3 = 5. So 6x + 15 = 3(2x + 5).",
        "Factorise fully means use the highest common factor. 12x + 18 = 2(6x + 9) is a start, but 6x and 9 still share a 3. The full answer is 6(2x + 3).",
        "Letters can be common factors too. x² + 5x: both terms have an x, so x² + 5x = x(x + 5). Remember x² ÷ x = x.",
        "If a whole term is taken out, a 1 is left behind: 4x + 4 = 4(x + 1).",
        "Always check by expanding your answer. It should give back exactly what you started with.",
      ],
      demo: "factorise-area",
      examples: [
        {
          question: "Factorise fully 8x + 20.",
          steps: ["HCF of 8 and 20 is 4.", "8x ÷ 4 = 2x and 20 ÷ 4 = 5.", "8x + 20 = 4(2x + 5)", "Check: 4 × 2x = 8x and 4 × 5 = 20 ✓"],
        },
        {
          question: "Factorise fully 6x² + 9x.",
          steps: ["Numbers: the HCF of 6 and 9 is 3.", "Letters: both terms have an x.", "So take out 3x: 6x² ÷ 3x = 2x and 9x ÷ 3x = 3.", "6x² + 9x = 3x(2x + 3)"],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "alg-index-laws": {
    skillId: "alg-index-laws",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "The index laws you used with numbers work exactly the same with letters. They let you simplify long products in one step, and they're used all through GCSE algebra and science.",
      byTheEnd: ["Multiply powers of the same letter by adding the powers.", "Divide by subtracting the powers, and raise a power to a power by multiplying.", "Deal with numbers in front, like 3x² × 4x⁵."],
    },
    teaching: {
      paragraphs: [
        "x⁴ means x × x × x × x. The small number (the power or index) counts how many x's are multiplied.",
        "Multiplying: x³ × x⁴ = (x × x × x) × (x × x × x × x). That's 7 x's, so x⁷. Add the powers: 3 + 4 = 7.",
        "Dividing: x⁶ ÷ x² means 6 x's on top and 2 underneath. Two pairs cancel, leaving x⁴. Subtract the powers: 6 − 2 = 4.",
        "Power of a power: (x²)³ = x² × x² × x². That's 2 + 2 + 2 = 6, so x⁶. Multiply the powers: 2 × 3 = 6.",
        "Numbers in front are dealt with separately. 3x² × 4x⁵: multiply the numbers (3 × 4 = 12) and add the powers (2 + 5 = 7). Answer: 12x⁷.",
        "In a bracket, everything is raised to the power: (2x³)² = 4x⁶, because 2² = 4.",
        "Anything divided by itself is 1, so x⁰ = 1.",
      ],
      demo: "index-laws-expand",
      examples: [
        {
          question: "Simplify y⁵ × y³.",
          steps: ["Multiplying the same letter: add the powers.", "5 + 3 = 8", "Answer: y⁸"],
        },
        {
          question: "Simplify 20a⁷ ÷ 4a³.",
          steps: ["Numbers: 20 ÷ 4 = 5.", "Letters: subtract the powers, 7 − 3 = 4.", "Answer: 5a⁴"],
        },
        {
          question: "Simplify (3x⁴)².",
          steps: ["Everything in the bracket is squared.", "3² = 9, and (x⁴)² = x⁸ (multiply the powers).", "Answer: 9x⁸"],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "alg-expand-double": {
    skillId: "alg-expand-double",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Expanding two brackets turns a product like (x + 3)(x + 5) into a quadratic expression. It's the link between brackets and quadratics, and the reverse of the factorising that comes next.",
      byTheEnd: ["Multiply every term in one bracket by every term in the other.", "Use a grid to keep track, including negative numbers.", "Expand squares like (x + 4)² without missing the middle term."],
    },
    teaching: {
      paragraphs: [
        "In (x + 3)(x + 5), each term in the first bracket multiplies each term in the second. That's four multiplications.",
        "A grid helps. Put x and 3 down the side, x and 5 along the top. Fill in each box: x × x = x², x × 5 = 5x, 3 × x = 3x, 3 × 5 = 15.",
        "Add up the boxes and collect like terms: x² + 5x + 3x + 15 = x² + 8x + 15.",
        "Keep each sign with its number. In (x + 4)(x − 2), the terms are x, +4 and x, −2. So 4 × −2 = −8 and x × −2 = −2x. The answer is x² + 2x − 8.",
        "A square means the bracket times itself: (x + 4)² = (x + 4)(x + 4) = x² + 8x + 16. It is not x² + 16. Don't skip the middle.",
        "When the x terms cancel, like (x + 5)(x − 5) = x² − 25, that's called the difference of two squares.",
      ],
      demo: "double-grid",
      examples: [
        {
          question: "Expand and simplify (x + 2)(x + 6).",
          steps: ["Grid: x × x = x², x × 6 = 6x, 2 × x = 2x, 2 × 6 = 12.", "x² + 6x + 2x + 12", "Collect: x² + 8x + 12"],
        },
        {
          question: "Expand and simplify (x − 3)(x + 7).",
          steps: ["x × x = x², x × 7 = 7x, −3 × x = −3x, −3 × 7 = −21.", "x² + 7x − 3x − 21", "Collect: x² + 4x − 21"],
        },
        {
          question: "Expand and simplify (x − 5)².",
          steps: ["Write it twice: (x − 5)(x − 5).", "x² − 5x − 5x + 25 (−5 × −5 = +25)", "Collect: x² − 10x + 25"],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "alg-factorise-quadratic": {
    skillId: "alg-factorise-quadratic",
    status: "draft",
    minutes: 30,
    intro: {
      whyItMatters:
        "Factorising a quadratic turns x² + 7x + 12 back into (x + 3)(x + 4). It's how you'll solve quadratic equations, and it's a regular GCSE question worth several marks.",
      byTheEnd: ["Find two numbers that multiply to the number term and add to the x number.", "Factorise when some numbers are negative.", "Spot and factorise the difference of two squares, like x² − 49."],
    },
    teaching: {
      paragraphs: [
        "Expanding showed that (x + 3)(x + 4) = x² + 7x + 12. Look where the numbers went: 3 × 4 = 12 and 3 + 4 = 7.",
        "So to factorise x² + bx + c, find two numbers that multiply to c and add to b. Then write (x + one)(x + other).",
        "x² + 7x + 12: pairs that multiply to 12 are 1 and 12, 2 and 6, 3 and 4. Which pair adds to 7? 3 and 4. So x² + 7x + 12 = (x + 3)(x + 4).",
        "With negatives, think about signs. If c is negative, one number is negative and one positive. x² + 2x − 15: −3 × 5 = −15 and −3 + 5 = 2. So (x − 3)(x + 5).",
        "If c is positive but b is negative, both numbers are negative. x² − 8x + 15 = (x − 3)(x − 5).",
        "Difference of two squares: x² − 49 has no x term. Use 7 and −7: they multiply to −49 and add to 0. So x² − 49 = (x + 7)(x − 7).",
        "Always expand your answer to check it.",
      ],
      demo: "factor-pair-finder",
      examples: [
        {
          question: "Factorise x² + 9x + 20.",
          steps: ["Multiply to 20, add to 9.", "Pairs for 20: 1 and 20, 2 and 10, 4 and 5. 4 + 5 = 9 ✓", "x² + 9x + 20 = (x + 4)(x + 5)"],
        },
        {
          question: "Factorise x² − x − 12.",
          steps: ["Multiply to −12, add to −1. One number is negative.", "3 × −4 = −12 and 3 + −4 = −1 ✓", "x² − x − 12 = (x + 3)(x − 4)"],
        },
        {
          question: "Factorise x² − 36.",
          steps: ["36 = 6², and there's no x term: difference of two squares.", "6 × −6 = −36 and 6 + −6 = 0.", "x² − 36 = (x + 6)(x − 6)"],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "alg-show-that": {
    skillId: "alg-show-that",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "'Show that' questions ask you to prove two expressions are the same by working one side out. They also appear as 'find the values of a and b'. The skills are expanding and simplifying, done carefully and set out clearly.",
      byTheEnd: ["Expand and simplify one side to show it matches the other.", "Find missing numbers in an identity like (x + 3)(x + 4) ≡ x² + ax + b.", "Decide whether a statement is an identity."],
    },
    teaching: {
      paragraphs: [
        "An identity is true for every value of x. To show one, start with the more complicated side, expand and simplify, and show it becomes the other side.",
        "Show that 3(x + 4) + 2(x − 1) ≡ 5x + 10. Left side: 3x + 12 + 2x − 2 = 5x + 10. That's the right side, so it's shown.",
        "Write every step. In a 'show that' question, the marks are for the working, not for the answer (you were already told it).",
        "Missing numbers: (x + 2)(x + 5) ≡ x² + ax + b. Expand the left: x² + 7x + 10. Match term by term: a = 7 and b = 10.",
        "Careful with a minus in front of a bracket. −2(x − 3) = −2x + 6, because −2 × −3 = +6.",
        "Is it an identity? Expand both sides. If they match exactly, yes. If one value of x gives different answers on each side, it's not.",
      ],
      demo: "identity-tester",
      examples: [
        {
          question: "Show that (x + 3)² − 9 ≡ x(x + 6).",
          steps: ["Left side: (x + 3)² = x² + 6x + 9.", "Subtract 9: x² + 6x.", "Right side: x(x + 6) = x² + 6x.", "Both sides are x² + 6x, so the identity is shown."],
        },
        {
          question: "(x − 4)(x + 1) ≡ x² + ax + b. Find a and b.",
          steps: ["Expand: x² + x − 4x − 4 = x² − 3x − 4.", "Match term by term: a = −3 and b = −4."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },
};
