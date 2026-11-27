/**
 * Lesson content for the fractions chain, following the six-stage structure:
 * Introduction → Teaching → Guided practice → Independent practice → Check → Review.
 *
 * Practice and check questions come from generators.ts; this file holds the
 * words: why it matters, the teaching, and worked examples.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher before Verified.
 */

import { frac } from "@/engine/fraction";
import type { SkillId } from "@/engine/types";

import type { Lesson } from "@/content/lesson-types";
export type { ContentStatus, WorkedExample, Lesson } from "@/content/lesson-types";
export { STAGES, STAGE_LABELS, type Stage } from "@/content/lesson-types";

export const FRACTION_LESSONS: Record<SkillId, Lesson> = {
  "frac-equivalent": {
    skillId: "frac-equivalent",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Almost everything else with fractions, like adding them, comparing them and simplifying them, depends on knowing when two fractions are worth the same.",
      byTheEnd: [
        "Explain why 1/2 and 2/4 are the same amount.",
        "Fill in a missing number to make two fractions equivalent.",
      ],
    },
    teaching: {
      paragraphs: [
        "Two fractions are equivalent when they are worth exactly the same amount, even though the numbers look different.",
        "If you cut every piece of a fraction bar into the same number of smaller pieces, the shaded amount doesn't change. Only the numbers do.",
        "That means you can multiply the top and the bottom by the same number, and the fraction stays the same size. You can also divide both by the same number.",
        "Adding the same number to the top and bottom does NOT work. 1/2 is not the same as 2/3.",
      ],
      demo: "equivalent-bars",
      examples: [
        {
          question: "Fill the gap: 2/3 = ?/12",
          bars: [frac(2, 3), frac(8, 12)],
          steps: [
            "The bottom went from 3 to 12. 3 × 4 = 12, so it was multiplied by 4.",
            "Do the same to the top: 2 × 4 = 8.",
            "So 2/3 = 8/12.",
          ],
        },
        {
          question: "Fill the gap: 3/5 = 9/?",
          steps: [
            "The top went from 3 to 9. 3 × 3 = 9, so it was multiplied by 3.",
            "Do the same to the bottom: 5 × 3 = 15.",
            "So 3/5 = 9/15.",
          ],
        },
      ],
    },
    counts: { guided: 4, independent: 4, check: 5 },
  },

  "frac-simplify": {
    skillId: "frac-simplify",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "Answers in exams are usually expected in their simplest form, and simple fractions are much easier to compare and work with.",
      byTheEnd: [
        "Find a number that divides into the top and bottom of a fraction.",
        "Write any fraction in its simplest form.",
      ],
    },
    teaching: {
      paragraphs: [
        "Simplifying is equivalent fractions in reverse. You divide the top and the bottom by the same number.",
        "A fraction is in its simplest form when the only number that divides into both the top and the bottom is 1.",
        "The quickest way is to divide by the highest common factor (the biggest number that divides both). If you don't spot it, divide by any common factor and keep going until you can't.",
      ],
      demo: "simplify-bars",
      examples: [
        {
          question: "Write 12/18 in its simplest form.",
          bars: [frac(12, 18), frac(2, 3)],
          steps: [
            "Both 12 and 18 are in the 6 times table. 12 ÷ 6 = 2 and 18 ÷ 6 = 3.",
            "2 and 3 have no common factor except 1.",
            "So 12/18 = 2/3.",
          ],
        },
        {
          question: "Write 20/32 in its simplest form, in two steps.",
          steps: [
            "Both are even: 20 ÷ 2 = 10 and 32 ÷ 2 = 16, giving 10/16.",
            "Still both even: 10 ÷ 2 = 5 and 16 ÷ 2 = 8, giving 5/8.",
            "5 and 8 have no common factor except 1, so 20/32 = 5/8.",
          ],
        },
      ],
    },
    counts: { guided: 4, independent: 4, check: 5 },
  },

  "frac-common-denominator": {
    skillId: "frac-common-denominator",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "You can only add, subtract or compare fractions easily when they are cut into the same size pieces. A common denominator does exactly that.",
      byTheEnd: [
        "Find the lowest common denominator of two fractions.",
        "Rewrite a fraction over a new denominator.",
      ],
    },
    teaching: {
      paragraphs: [
        "A common denominator is a number that both denominators divide into exactly.",
        "To find the lowest one, list the times tables of each denominator and find the first number that appears in both lists.",
        "Multiplying the two denominators always gives a common denominator, but not always the lowest. For 1/4 and 1/6, 4 × 6 = 24 works, but 12 is lower.",
        "Then rewrite each fraction: work out what you multiplied the bottom by, and multiply the top by the same.",
      ],
      demo: "common-denominator-bars",
      examples: [
        {
          question: "Find the lowest common denominator of 1/4 and 1/6.",
          steps: ["Multiples of 4: 4, 8, 12, 16…", "Multiples of 6: 6, 12, 18…", "The first number in both lists is 12."],
        },
        {
          question: "Rewrite 3/4 with a denominator of 12.",
          bars: [frac(3, 4), frac(9, 12)],
          steps: ["12 ÷ 4 = 3, so the bottom is multiplied by 3.", "Multiply the top by 3: 3 × 3 = 9.", "So 3/4 = 9/12."],
        },
      ],
    },
    counts: { guided: 4, independent: 4, check: 5 },
  },

  "frac-add-sub": {
    skillId: "frac-add-sub",
    status: "draft",
    minutes: 30,
    intro: {
      whyItMatters:
        "Adding and subtracting fractions comes up in recipes, measurements, money and probability, and it appears on every GCSE maths paper.",
      byTheEnd: [
        "Add and subtract fractions with different denominators.",
        "Give the answer in its simplest form.",
      ],
    },
    teaching: {
      paragraphs: [
        "You can only add the tops when the pieces are the same size, which means the denominators must match.",
        "Step 1: find the lowest common denominator. Step 2: rewrite both fractions over it. Step 3: add or subtract the numerators and keep the denominator. Step 4: simplify.",
        "Never add the denominators. 1/2 + 1/2 is one whole (2/2), not 2/4.",
      ],
      demo: "add-bars",
      examples: [
        {
          question: "Work out 1/3 + 1/4.",
          bars: [frac(4, 12), frac(3, 12), frac(7, 12)],
          steps: [
            "Lowest common denominator of 3 and 4 is 12.",
            "1/3 = 4/12 and 1/4 = 3/12.",
            "4/12 + 3/12 = 7/12, which is already in its simplest form.",
          ],
        },
        {
          question: "Work out 5/6 − 1/4.",
          steps: [
            "Lowest common denominator of 6 and 4 is 12.",
            "5/6 = 10/12 and 1/4 = 3/12.",
            "10/12 − 3/12 = 7/12, which is already in its simplest form.",
          ],
        },
      ],
    },
    counts: { guided: 4, independent: 5, check: 5 },
  },

  "frac-of-amount": {
    skillId: "frac-of-amount",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "Discounts, shares of a bill, parts of a journey: finding a fraction of an amount is one of the most useful everyday maths skills, and it leads straight into percentages and ratio.",
      byTheEnd: [
        "Find a unit fraction of an amount, like 1/5 of 40.",
        "Find any fraction of an amount, like 3/5 of 40.",
        "Work backwards: if 3/5 of a number is 24, find the number.",
      ],
    },
    teaching: {
      paragraphs: [
        "The denominator tells you how many equal parts to split the amount into. The numerator tells you how many of those parts you want.",
        "So: divide by the bottom, then multiply by the top.",
        "Check your answer makes sense. A fraction less than 1 of an amount should be smaller than the amount.",
        "Sometimes you know the part and need the whole. If 3/5 of a number is 24, then 3 parts are 24, so 1 part is 8, and all 5 parts are 40. Divide by the top, then multiply by the bottom.",
      ],
      demo: "amount-bar",
      examples: [
        {
          question: "Find 3/5 of 40.",
          bars: [frac(3, 5)],
          steps: ["Split 40 into 5 equal parts: 40 ÷ 5 = 8.", "You want 3 parts: 8 × 3 = 24.", "So 3/5 of 40 is 24."],
        },
        {
          question: "A £60 game is reduced by 1/4. How much is taken off?",
          steps: ["Split £60 into 4 equal parts: 60 ÷ 4 = 15.", "You want 1 part: £15.", "So £15 is taken off."],
        },
        {
          question: "3/5 of a number is 24. What is the number?",
          bars: [frac(3, 5)],
          steps: ["3 parts are worth 24, so 1 part is 24 ÷ 3 = 8.", "The whole is 5 parts: 8 × 5 = 40.", "Check: 3/5 of 40 is 24. The number is 40."],
        },
      ],
    },
    counts: { guided: 4, independent: 4, check: 5 },
  },

  "frac-mul-div": {
    skillId: "frac-mul-div",
    status: "draft",
    minutes: 30,
    intro: {
      whyItMatters:
        "Multiplying and dividing fractions is needed for ratio, probability and algebra, and it is tested at both GCSE tiers.",
      byTheEnd: ["Multiply two fractions.", "Multiply a fraction by a whole number.", "Divide one fraction by another."],
    },
    teaching: {
      paragraphs: [
        "Multiplying: multiply the tops together and the bottoms together, then simplify. You don't need a common denominator.",
        "Multiplying by a fraction less than 1 makes things smaller. Half of a half is a quarter: 1/2 × 1/2 = 1/4.",
        "To multiply by a whole number, write it over 1. So 4 × 2/3 = 4/1 × 2/3 = 8/3. Only the top gets bigger: 4 lots of 2 thirds is 8 thirds.",
        "Dividing: keep the first fraction, change ÷ to ×, and flip the second fraction upside down. Then multiply.",
        "Dividing by a fraction less than 1 makes things bigger. How many halves fit in 3? Six: 3 ÷ 1/2 = 6.",
      ],
      demo: "multiply-grid",
      examples: [
        {
          question: "Work out 2/3 × 3/4.",
          steps: ["Tops: 2 × 3 = 6. Bottoms: 3 × 4 = 12.", "6/12 simplifies to 1/2.", "So 2/3 × 3/4 = 1/2."],
        },
        {
          question: "Work out 3/4 ÷ 2/5.",
          steps: [
            "Keep 3/4, change to ×, flip 2/5 to 5/2.",
            "3/4 × 5/2: tops 3 × 5 = 15, bottoms 4 × 2 = 8.",
            "So 3/4 ÷ 2/5 = 15/8, which is 1 7/8.",
          ],
        },
        {
          question: "Work out 4 × 2/3.",
          steps: ["Write 4 as 4/1.", "4/1 × 2/3: tops 4 × 2 = 8, bottoms 1 × 3 = 3.", "So 4 × 2/3 = 8/3, which is 2 2/3."],
        },
      ],
    },
    counts: { guided: 4, independent: 5, check: 5 },
  },

  "frac-mixed-numbers": {
    skillId: "frac-mixed-numbers",
    status: "draft",
    minutes: 35,
    intro: {
      whyItMatters:
        "Real amounts are often more than one whole: 2 1/2 hours, 1 3/4 cups of flour. GCSE questions use mixed numbers a lot, and the trick for calculating with them is to turn them into improper fractions first.",
      byTheEnd: [
        "Turn an improper fraction like 11/4 into a mixed number like 2 3/4, and back again.",
        "Add and subtract mixed numbers.",
        "Multiply and divide mixed numbers.",
      ],
    },
    teaching: {
      paragraphs: [
        "A mixed number has a whole number part and a fraction part, like 2 3/4. An improper fraction (also called top-heavy) has a numerator bigger than its denominator, like 11/4. They can be worth exactly the same.",
        "Mixed number to improper fraction: multiply the whole number by the denominator, then add the numerator. 2 3/4: each whole is 4 quarters, so 2 wholes = 8 quarters. Add the 3 quarters: 11/4.",
        "Improper fraction to mixed number: divide the top by the bottom. 11 ÷ 4 = 2 remainder 3. The 2 is the whole number and the remainder 3 stays over 4: 2 3/4.",
        "To calculate with mixed numbers, turn them into improper fractions first. Then add, subtract, multiply or divide in the usual way, and simplify. You can turn the answer back into a mixed number at the end.",
        "Careful: you can't multiply the wholes and the fractions separately. 1 1/2 × 1 1/2 is not 1 1/4. It's 3/2 × 3/2 = 9/4 = 2 1/4.",
      ],
      demo: "mixed-number-bars",
      examples: [
        {
          question: "Write 2 3/4 as an improper fraction.",
          bars: [frac(11, 4)],
          steps: ["2 wholes = 2 × 4 = 8 quarters.", "Add the 3 quarters: 8 + 3 = 11.", "So 2 3/4 = 11/4."],
        },
        {
          question: "Write 17/5 as a mixed number.",
          bars: [frac(17, 5)],
          steps: ["17 ÷ 5 = 3 remainder 2.", "3 is the whole number. The remainder 2 stays over 5.", "So 17/5 = 3 2/5."],
        },
        {
          question: "Work out 3 1/4 − 1 2/3.",
          steps: [
            "Improper fractions: 3 1/4 = 13/4 and 1 2/3 = 5/3.",
            "Common denominator 12: 13/4 = 39/12 and 5/3 = 20/12.",
            "39/12 − 20/12 = 19/12.",
            "As a mixed number: 19/12 = 1 7/12.",
          ],
        },
        {
          question: "Work out 1 1/2 × 2 1/3.",
          steps: [
            "Improper fractions: 1 1/2 = 3/2 and 2 1/3 = 7/3.",
            "Multiply tops and bottoms: 3 × 7 = 21 and 2 × 3 = 6, giving 21/6.",
            "Simplify: 21/6 = 7/2.",
            "As a mixed number: 7/2 = 3 1/2.",
          ],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },
};
