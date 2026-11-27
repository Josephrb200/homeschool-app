/**
 * Lesson content for the negatives, powers and BIDMAS chain (six stages, like
 * every chain). Practice and check questions come from generators.ts.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher before Verified.
 */

import type { Lesson } from "@/content/lesson-types";
import type { SkillId } from "@/engine/types";

export const POWERS_LESSONS: Record<SkillId, Lesson> = {
  "num-negatives": {
    skillId: "num-negatives",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Negative numbers turn up in temperatures, bank balances and heights below sea level. They also appear all through algebra and graphs, so getting the signs right now saves a lot of lost marks later.",
      byTheEnd: [
        "Put negative numbers in order.",
        "Add and subtract with negative numbers using a number line.",
        "Know that subtracting a negative is the same as adding.",
        "Multiply and divide with negative numbers using the sign rules.",
      ],
    },
    teaching: {
      paragraphs: [
        "Picture a number line, or a thermometer. Zero is in the middle. Numbers below zero are negative, written with a minus sign: −3 means 3 below zero.",
        "The further below zero, the smaller the number. So −8 is smaller than −3, just as −8 °C is colder than −3 °C.",
        "Adding a positive number moves you up the line. Subtracting a positive number moves you down. So −7 + 3 = −4, and 3 − 8 = −5.",
        "Two signs next to each other can be swapped for one. Subtracting a negative is the same as adding: 4 − (−6) = 4 + 6 = 10. Adding a negative is the same as subtracting: 5 + (−8) = 5 − 8 = −3.",
        "For multiplying and dividing, work out the numbers first, then decide the sign. Signs the same give a positive answer. Signs different give a negative answer. So −4 × 6 = −24, but −4 × (−6) = 24.",
      ],
      demo: "number-line-negatives",
      examples: [
        {
          question: "The temperature is −4 °C. It rises by 9 degrees. What is the new temperature?",
          steps: ["Rising means moving up: −4 + 9.", "From −4 up to 0 is 4 degrees. There are 5 more to go.", "The new temperature is 5 °C."],
        },
        {
          question: "Work out −2 − (−5).",
          steps: ["Subtracting a negative is the same as adding: −2 − (−5) = −2 + 5.", "Start at −2 and move 5 places up.", "= 3"],
        },
        {
          question: "Work out −36 ÷ (−4).",
          steps: ["Without the signs: 36 ÷ 4 = 9.", "Both numbers are negative. Signs the same give a positive answer.", "−36 ÷ (−4) = 9"],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "num-powers-roots": {
    skillId: "num-powers-roots",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "Squares and square roots are how you find areas and the sides of squares, and later Pythagoras' theorem. Cubes and cube roots do the same job for volume. Knowing the square numbers by heart makes all of these quicker.",
      byTheEnd: [
        "Work out squares and cubes, like 7² and 4³.",
        "Find square roots and cube roots, like √64 and ∛27.",
        "Use roots to find the side of a square or the edge of a cube.",
      ],
    },
    teaching: {
      paragraphs: [
        "Squaring a number means multiplying it by itself. 7² (say '7 squared') = 7 × 7 = 49. It is called squared because a square with sides of 7 has an area of 49.",
        "Cubing means three of the number multiplied together. 4³ (say '4 cubed') = 4 × 4 × 4 = 64. A cube with edges of 4 has a volume of 64.",
        "The small raised number is called the power or index. It tells you how many of the number to multiply. 7² is not 7 × 2.",
        "A square root goes backwards. √64 asks: which number times itself makes 64? The answer is 8. A cube root asks which number, used three times, makes it: ∛27 = 3.",
        "The square numbers are 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121 and 144. The cube numbers to learn are 1, 8, 27, 64, 125 and 1000.",
      ],
      demo: "square-cube-builder",
      examples: [
        {
          question: "Work out 6².",
          steps: ["6² means 6 × 6.", "6 × 6 = 36", "6² = 36"],
        },
        {
          question: "A square has an area of 81 cm². How long is one side?",
          steps: ["Area of a square = side × side.", "Which number times itself makes 81? 9 × 9 = 81.", "Each side is √81 = 9 cm."],
        },
        {
          question: "Estimate √40 to the nearest whole number.",
          steps: ["Find the square numbers either side: 6² = 36 and 7² = 49.", "40 is closer to 36 than to 49.", "√40 ≈ 6"],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "num-order-of-operations": {
    skillId: "num-order-of-operations",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "A calculation like 3 + 4 × 2 has only one right answer, but you get a different one if you work left to right. Everyone, and every calculator, agrees on the same order so that maths means the same thing to everybody.",
      byTheEnd: [
        "Remember the order with BIDMAS.",
        "Do × and ÷ before + and −, even when they come later.",
        "Work from left to right when operations are equal partners.",
        "Use brackets and powers in a calculation.",
      ],
    },
    teaching: {
      paragraphs: [
        "BIDMAS gives the order: Brackets, Indices (powers and roots), Division and Multiplication, Addition and Subtraction.",
        "So in 3 + 4 × 2, the multiplication goes first: 4 × 2 = 8, then 3 + 8 = 11. Working left to right would give 14, which is wrong.",
        "Brackets always go first. In (3 + 4) × 2, work out 3 + 4 = 7, then 7 × 2 = 14.",
        "Division and multiplication are equal partners, and so are addition and subtraction. When you have a pair like that, go from left to right. 10 − 3 + 2 = 9, not 5.",
        "A power belongs only to the number it touches. In 2 × 3², square the 3 first: 2 × 9 = 18.",
        "It helps to write out one step at a time, rewriting the calculation after each step.",
      ],
      demo: "bidmas-steps",
      examples: [
        {
          question: "Work out 20 − 6 ÷ 2 + 1.",
          steps: ["Division first: 6 ÷ 2 = 3. Now it is 20 − 3 + 1.", "Subtraction and addition are equal partners: left to right. 20 − 3 = 17.", "17 + 1 = 18"],
        },
        {
          question: "Work out 5 + 2 × (7 − 3)².",
          steps: ["Brackets: 7 − 3 = 4. Now it is 5 + 2 × 4².", "Indices: 4² = 16. Now it is 5 + 2 × 16.", "Multiply: 2 × 16 = 32. Then add: 5 + 32 = 37."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "num-index-laws": {
    skillId: "num-index-laws",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Index laws are shortcuts for working with powers. They make huge calculations quick, they are the key to standard form, and they come up again in algebra.",
      byTheEnd: [
        "Multiply powers of the same number by adding the powers.",
        "Divide powers of the same number by subtracting the powers.",
        "Raise a power to a power by multiplying the powers.",
        "Know that any number to the power 0 is 1.",
      ],
    },
    teaching: {
      paragraphs: [
        "Write powers out in full and the laws explain themselves. 3⁴ × 3² is (3 × 3 × 3 × 3) × (3 × 3). That is six 3s, so 3⁶. When you multiply powers of the same number, add the powers.",
        "2⁶ ÷ 2² is six 2s on top and two 2s on the bottom. Two pairs cancel, leaving four 2s: 2⁴. When you divide, subtract the powers.",
        "(5²)³ means 5² × 5² × 5². That is 2 + 2 + 2 = 6, so 5⁶. For a power of a power, multiply the powers.",
        "What about 7³ ÷ 7³? Anything divided by itself is 1. The law says 7³⁻³ = 7⁰. So 7⁰ = 1. Any number (except 0) to the power 0 is 1.",
        "The laws only work when the numbers underneath (the bases) are the same. The base never changes: 2³ × 2² is 2⁵, not 4⁵.",
      ],
      demo: "index-expand",
      examples: [
        {
          question: "Write 5⁷ ÷ 5³ as a single power of 5.",
          steps: ["Dividing: subtract the powers.", "7 − 3 = 4", "5⁷ ÷ 5³ = 5⁴"],
        },
        {
          question: "Write 2⁵ × 2³ ÷ 2⁴ as a single power of 2.",
          steps: ["Multiply first: 5 + 3 = 8, so 2⁸.", "Then divide: 8 − 4 = 4.", "= 2⁴"],
        },
        {
          question: "Work out 3² × 3. Give your answer as an ordinary number.",
          steps: ["3 is the same as 3¹, so add the powers: 2 + 1 = 3.", "3² × 3 = 3³", "3³ = 3 × 3 × 3 = 27"],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "num-standard-form": {
    skillId: "num-standard-form",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Scientists write the distance to the Sun as 1.5 × 10⁸ km and the width of a hair as 8 × 10⁻⁵ m. Standard form makes very big and very small numbers short, easy to read and easy to compare. Calculators use it too.",
      byTheEnd: [
        "Write big numbers in standard form, like 34,000 = 3.4 × 10⁴.",
        "Write small numbers in standard form, like 0.00047 = 4.7 × 10⁻⁴.",
        "Change standard form back into an ordinary number.",
      ],
    },
    teaching: {
      paragraphs: [
        "A number in standard form has two parts: a number from 1 up to (but not including) 10, times a power of 10. 3.4 × 10⁴ is in standard form. 34 × 10³ is not, because 34 is bigger than 10.",
        "To write 34,000 in standard form: the first part is 3.4 (put the point after the first digit). Then count how many places the digits move to get from 3.4 to 34,000. They move 4 places, so 34,000 = 3.4 × 10⁴.",
        "Count places, not zeros. 34,000 has three zeros but the power is 4.",
        "Numbers smaller than 1 have a negative power. 0.00047: the first part is 4.7, and the digits move 4 places to get from 4.7 down to 0.00047. So 0.00047 = 4.7 × 10⁻⁴.",
        "To go back, move the digits. A positive power makes the number bigger: 5.2 × 10³ = 5200. A negative power makes it smaller: 6.1 × 10⁻³ = 0.0061.",
      ],
      demo: "standard-form-slider",
      examples: [
        {
          question: "Write 560,000 in standard form.",
          steps: ["The first part is 5.6.", "5.6 → 56 → 560 → 5600 → 56,000 → 560,000: the digits move 5 places.", "560,000 = 5.6 × 10⁵"],
        },
        {
          question: "Write 0.0083 in standard form.",
          steps: ["The first part is 8.3.", "8.3 → 0.83 → 0.083 → 0.0083: the digits move 3 places smaller.", "0.0083 = 8.3 × 10⁻³"],
        },
        {
          question: "Write 7.05 × 10⁴ as an ordinary number.",
          steps: ["A power of 4 means move the digits 4 places bigger.", "7.05 → 70.5 → 705 → 7050 → 70,500", "7.05 × 10⁴ = 70,500"],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },
};
