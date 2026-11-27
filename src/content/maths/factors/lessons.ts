/**
 * Lesson content for the factors and primes chain (six stages, like every chain).
 * Practice and check questions come from generators.ts.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher before Verified.
 */

import type { Lesson } from "@/content/lesson-types";
import type { SkillId } from "@/engine/types";

export const FACTOR_LESSONS: Record<SkillId, Lesson> = {
  "num-factors-multiples": {
    skillId: "num-factors-multiples",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Factors, multiples and primes are the building blocks of whole numbers. You need them for simplifying fractions and ratios, for HCF and LCM, and for factorising in algebra. They also turn up as quick marks on every GCSE paper.",
      byTheEnd: [
        "List all the factors of a number, in pairs, without missing any.",
        "Write down the multiples of a number.",
        "Tell whether a number is prime, and explain why 1 isn't.",
      ],
    },
    teaching: {
      paragraphs: [
        "A factor of a number divides into it exactly, with nothing left over. 3 is a factor of 12 because 12 ÷ 3 = 4.",
        "Find factors in pairs. For 12: 1 × 12, 2 × 6, 3 × 4. Try 1, 2, 3, 4 and so on, and stop when the pairs meet. The factors of 12 are 1, 2, 3, 4, 6 and 12.",
        "A multiple of a number is in its times table. The multiples of 12 are 12, 24, 36, 48 and so on. They start at the number itself and never end.",
        "Memory hook: factors are few and fit inside the number. Multiples are many and keep going up.",
        "A prime number has exactly two factors: 1 and itself. The primes up to 20 are 2, 3, 5, 7, 11, 13, 17 and 19. 1 isn't prime because it has only one factor. 2 is the only even prime.",
      ],
      demo: "factor-rectangles",
      examples: [
        {
          question: "Write down all the factors of 36.",
          steps: ["1 × 36", "2 × 18", "3 × 12", "4 × 9", "5 doesn't go into 36. 6 × 6, so the pairs have met.", "The factors of 36 are 1, 2, 3, 4, 6, 9, 12, 18, 36 (6 only once)."],
        },
        {
          question: "Is 51 a prime number?",
          steps: ["51 is odd, so it doesn't divide by 2.", "Try 3: 5 + 1 = 6, which is in the 3 times table, so 3 goes in. 51 ÷ 3 = 17.", "51 = 3 × 17, so it has more than two factors. No, 51 isn't prime."],
        },
      ],
    },
    counts: { guided: 5, independent: 4, check: 5 },
  },

  "num-prime-factorisation": {
    skillId: "num-prime-factorisation",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Every whole number bigger than 1 can be built by multiplying primes, in exactly one way. That 'prime recipe' is the quickest route to HCF and LCM, and 'write 60 as a product of its prime factors' is a GCSE favourite.",
      byTheEnd: ["Draw a factor tree for a number.", "Write a number as a product of primes, like 60 = 2 × 2 × 3 × 5.", "Write it in index form, like 2² × 3 × 5, and work back from index form to the number."],
    },
    teaching: {
      paragraphs: [
        "A factor tree splits a number into two factors, then splits those, until every branch ends in a prime. Circle each prime as you reach it.",
        "60 splits into 6 × 10. 6 splits into 2 × 3, and 10 splits into 2 × 5. The circled primes are 2, 3, 2 and 5.",
        "So 60 = 2 × 2 × 3 × 5. Write the primes smallest first, and include every repeat.",
        "Index form uses a power for repeats: 2 × 2 = 2², so 60 = 2² × 3 × 5.",
        "It doesn't matter how you start the tree. 60 = 4 × 15 or 2 × 30 still ends with the same primes. Check by multiplying them back: 2 × 2 × 3 × 5 = 60.",
      ],
      demo: "factor-tree",
      examples: [
        {
          question: "Write 72 as a product of its prime factors in index form.",
          steps: ["72 = 8 × 9", "8 = 2 × 4, and 4 = 2 × 2", "9 = 3 × 3", "Circled primes: 2, 2, 2, 3, 3", "72 = 2 × 2 × 2 × 3 × 3 = 2³ × 3²"],
        },
        {
          question: "A number is 2³ × 5. What is the number?",
          steps: ["2³ = 2 × 2 × 2 = 8 (not 2 × 3)", "8 × 5 = 40", "The number is 40."],
        },
      ],
    },
    counts: { guided: 5, independent: 4, check: 5 },
  },

  "num-hcf-lcm": {
    skillId: "num-hcf-lcm",
    status: "draft",
    minutes: 30,
    intro: {
      whyItMatters:
        "The highest common factor helps you simplify fractions and ratios in one step and factorise in algebra. The lowest common multiple tells you when repeating things line up, like buses or flashing lights, and gives common denominators.",
      byTheEnd: ["Find the HCF and LCM of two numbers by listing.", "Find them using products of primes and a Venn diagram.", "Spot whether a word problem needs the HCF or the LCM."],
    },
    teaching: {
      paragraphs: [
        "The HCF (highest common factor) is the biggest number that goes into both. HCF of 12 and 18: factors of 12 are 1, 2, 3, 4, 6, 12; factors of 18 are 1, 2, 3, 6, 9, 18. The biggest in both is 6.",
        "The LCM (lowest common multiple) is the smallest number both go into. LCM of 6 and 8: count in 8s (8, 16, 24) and stop at the first one 6 goes into. The LCM is 24.",
        "For bigger numbers, use primes. 12 = 2 × 2 × 3 and 18 = 2 × 3 × 3. Put the shared primes (2 and 3) in the middle of a Venn diagram, and the rest on each side.",
        "HCF = multiply the middle: 2 × 3 = 6. LCM = multiply everything in the diagram: 2 × 2 × 3 × 3 = 36.",
        "Quick check: the HCF is never bigger than the smaller number, and the LCM is never smaller than the bigger number. In word problems, 'sharing into groups' usually means HCF, and 'when do they meet again' means LCM.",
      ],
      demo: "prime-venn",
      examples: [
        {
          question: "Find the HCF of 24 and 36.",
          steps: ["24 = 2 × 2 × 2 × 3", "36 = 2 × 2 × 3 × 3", "Primes in both: 2, 2 and 3", "HCF = 2 × 2 × 3 = 12"],
        },
        {
          question: "Buses leave every 12 minutes and every 15 minutes. Both leave at 9 am. When do they next leave together?",
          steps: ["They meet at a common multiple of 12 and 15: we want the lowest.", "Multiples of 15: 15, 30, 45, 60. 12 goes into 60.", "LCM = 60 minutes, so they next leave together at 10 am."],
        },
      ],
    },
    counts: { guided: 5, independent: 4, check: 5 },
  },
};
