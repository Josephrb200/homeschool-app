/**
 * Lesson content for the sequences chain (six stages, like every chain).
 * Practice and check questions come from generators.ts.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher before Verified.
 */

import type { Lesson } from "@/content/lesson-types";
import type { SkillId } from "@/engine/types";

export const SEQUENCE_LESSONS: Record<SkillId, Lesson> = {
  "alg-sequences": {
    skillId: "alg-sequences",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "A sequence is a list of numbers that follows a rule. Spotting the rule lets you predict what comes next, or what comes 100 places later. Patterns like this are at the heart of algebra.",
      byTheEnd: ["Find and describe a term-to-term rule.", "Continue a sequence and find missing terms.", "Use a position-to-term rule, like 3n + 2, to find any term."],
    },
    teaching: {
      paragraphs: [
        "A sequence is a list of numbers in order, like 5, 8, 11, 14, … Each number is called a term. The 1st term is 5, the 2nd term is 8, and so on.",
        "The term-to-term rule tells you how to get from one term to the next. For 5, 8, 11, 14 the rule is add 3. For 40, 34, 28 the rule is subtract 6.",
        "Some rules multiply: 3, 6, 12, 24 doubles each time. If the gaps aren't the same, try multiplying.",
        "A term-to-term rule needs a starting point too: 'start at 5 and add 3'.",
        "A position-to-term rule works out any term straight from its position, n. For the rule 3n + 2, the 10th term is 3 × 10 + 2 = 32. You don't need the terms before it.",
        "Remember 3n means 3 × n. When n = 5, 3n is 15, not 35.",
      ],
      demo: "sequence-builder",
      examples: [
        {
          question: "Find the next two terms of 23, 19, 15, 11, …",
          steps: ["The terms go down by 4 each time: the rule is subtract 4.", "11 − 4 = 7", "7 − 4 = 3. The next two terms are 7 and 3."],
        },
        {
          question: "The nth term of a sequence is 5n − 1. Work out the 20th term.",
          steps: ["Put n = 20 into 5n − 1.", "5 × 20 − 1 = 100 − 1", "The 20th term is 99."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "alg-special-sequences": {
    skillId: "alg-special-sequences",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "Some sequences turn up so often that they have names. Knowing them on sight saves time in the exam and helps you spot patterns in harder problems.",
      byTheEnd: ["Know the square, cube and triangular numbers.", "Recognise arithmetic and geometric sequences.", "Continue each kind of sequence."],
    },
    teaching: {
      paragraphs: [
        "Square numbers come from multiplying a number by itself: 1, 4, 9, 16, 25, 36, … They make square patterns of dots. The nth square number is n².",
        "Cube numbers come from multiplying a number by itself three times: 1, 8, 27, 64, 125, … The nth cube number is n³.",
        "Triangular numbers make triangles of dots: 1, 3, 6, 10, 15, 21, … You add 2, then 3, then 4, then 5, one more each time.",
        "An arithmetic sequence adds or subtracts the same amount every time, like 4, 7, 10, 13 (add 3).",
        "A geometric sequence multiplies by the same amount every time, like 2, 6, 18, 54 (multiply by 3).",
        "To tell them apart, look at the gaps. Gaps all the same: arithmetic. Gaps 3, 5, 7, 9: square numbers. Gaps 2, 3, 4, 5: triangular numbers.",
      ],
      demo: "special-sequences-dots",
      examples: [
        {
          question: "What is the 7th triangular number?",
          steps: ["Triangular numbers: 1, 3, 6, 10, 15, 21, …", "Add one more each time: 21 + 7 = 28.", "The 7th triangular number is 28."],
        },
        {
          question: "What type of sequence is 1, 8, 27, 64, …?",
          steps: ["1 = 1³, 8 = 2³, 27 = 3³, 64 = 4³.", "These are the cube numbers."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "alg-nth-term": {
    skillId: "alg-nth-term",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "The nth term is a formula for a whole sequence. With it you can jump straight to the 100th term, or check whether a number is in the sequence at all. It is one of the most common algebra questions at GCSE.",
      byTheEnd: ["Find the nth term of a linear sequence.", "Use the nth term to find any term.", "Work out which term a number is, or whether it is in the sequence."],
    },
    teaching: {
      paragraphs: [
        "A linear sequence goes up or down by the same amount each time, like 7, 11, 15, 19, …",
        "Step 1: find the difference between terms. Here it's 4. The nth term starts 4n.",
        "Step 2: write out the 4 times table, 4n: 4, 8, 12, 16. Compare it with the sequence: 7, 11, 15, 19. Each term is 3 more.",
        "So the nth term is 4n + 3. Check it: when n = 1, 4 × 1 + 3 = 7 ✓.",
        "If the sequence goes down, the difference is negative. For 20, 17, 14, 11 the difference is −3. Compare with −3n: −3, −6, −9. Each term is 23 more, so the nth term is −3n + 23, which you can also write 23 − 3n.",
        "To find which term is a number, set the nth term equal to it and solve. For 4n + 3 = 83: 4n = 80, n = 20, so 83 is the 20th term. If n isn't a whole number, the number isn't in the sequence.",
      ],
      demo: "nth-term-builder",
      examples: [
        {
          question: "Find the nth term of 2, 7, 12, 17, …",
          steps: ["The difference is 5, so compare with 5n: 5, 10, 15, 20.", "Each term is 3 less than 5n.", "The nth term is 5n − 3. Check: 5 × 1 − 3 = 2 ✓"],
        },
        {
          question: "Is 100 in the sequence with nth term 3n + 2?",
          steps: ["Solve 3n + 2 = 100: 3n = 98.", "n = 98 ÷ 3 = 32 remainder 2: not a whole number.", "So 100 is not in the sequence."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "alg-other-sequences": {
    skillId: "alg-other-sequences",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "Not every sequence adds the same amount. Fibonacci-type sequences appear in nature, geometric sequences describe things like doubling and compound interest, and quadratic sequences come from square patterns. GCSE asks you to continue them and tell them apart.",
      byTheEnd: ["Continue a Fibonacci-type sequence.", "Continue a geometric sequence and find what it multiplies by.", "Continue a quadratic sequence using the second difference.", "Tell the types apart."],
    },
    teaching: {
      paragraphs: [
        "In a Fibonacci-type sequence, each term is the two before it added together. The Fibonacci sequence itself is 1, 1, 2, 3, 5, 8, 13, … because 5 + 8 = 13.",
        "In a geometric sequence, you multiply by the same number every time. 3, 6, 12, 24 multiplies by 2. To find the number, divide a term by the one before: 12 ÷ 6 = 2. It can also divide: 80, 40, 20, 10.",
        "In a quadratic sequence the gaps change by the same amount each time. For 2, 5, 10, 17, 26 the gaps are 3, 5, 7, 9. The gaps go up by 2 each time. This is called the second difference.",
        "To continue a quadratic sequence, continue the gaps first. The next gap is 11, so the next term is 26 + 11 = 37.",
        "To decide the type: same gaps means arithmetic; gaps changing steadily means quadratic; multiplying means geometric; adding the two before means Fibonacci-type.",
      ],
      demo: "other-sequences-explorer",
      examples: [
        {
          question: "Find the next term of 4, 7, 11, 18, 29, …",
          steps: ["The gaps aren't the same, so check: 4 + 7 = 11, 7 + 11 = 18 ✓. It's Fibonacci-type.", "18 + 29 = 47", "The next term is 47."],
        },
        {
          question: "Find the next term of 3, 6, 11, 18, 27, …",
          steps: ["Gaps: 3, 5, 7, 9. They go up by 2.", "The next gap is 11.", "27 + 11 = 38"],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },
};
