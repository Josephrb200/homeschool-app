/**
 * Lesson content for the decimals chain (six stages, like every chain).
 * Practice and check questions come from generators.ts.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher before Verified.
 */

import type { Lesson } from "@/content/lesson-types";
import type { SkillId } from "@/engine/types";

export const DECIMAL_LESSONS: Record<SkillId, Lesson> = {
  "num-place-value": {
    skillId: "num-place-value",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "Decimals are everywhere: prices, measurements, times in a race. Knowing what each digit is worth stops the most common decimal mistakes, and it makes × 10 and ÷ 10 quick.",
      byTheEnd: [
        "Say what any digit in a decimal is worth.",
        "Tell which of two decimals is bigger.",
        "Multiply and divide by 10, 100 and 1000.",
      ],
    },
    teaching: {
      paragraphs: [
        "Each column is worth 10 times the column to its right. After the decimal point the columns keep going down: tenths (0.1), hundredths (0.01), thousandths (0.001).",
        "In 3.47, the 4 is in the tenths column, so it is worth 4 tenths, or 0.4. The 7 is in the hundredths column, so it is worth 0.07.",
        "To compare decimals, compare column by column from the left. 0.6 is bigger than 0.45, because 6 tenths beats 4 tenths. A longer decimal is not always bigger. Writing 0.6 as 0.60 can help.",
        "Multiplying by 10 moves every digit one place to the left, so the number gets 10 times bigger. Dividing by 10 moves the digits one place to the right. For 100, move two places; for 1000, three places. The decimal point stays still: the digits move.",
      ],
      demo: "place-value-chart",
      examples: [
        {
          question: "What is the value of the 8 in 12.385?",
          steps: ["Count the columns after the decimal point: 3 is tenths, 8 is hundredths, 5 is thousandths.", "The 8 is in the hundredths column.", "So it is worth 8 hundredths = 0.08."],
        },
        {
          question: "Work out 4.5 ÷ 100.",
          steps: ["Dividing makes the number smaller, so the digits move right.", "100 has two zeros, so they move 2 places.", "4.5 → 0.45 → 0.045", "4.5 ÷ 100 = 0.045"],
        },
      ],
    },
    counts: { guided: 4, independent: 4, check: 5 },
  },

  "num-add-sub": {
    skillId: "num-add-sub",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "Adding and subtracting decimals is how you work out change, total a bill or find the difference between two measurements. It uses the same column method as whole numbers, with one extra rule.",
      byTheEnd: ["Line up the decimal points before adding or subtracting.", "Fill gaps with zeros, like 6 = 6.00.", "Check an answer by adding back."],
    },
    teaching: {
      paragraphs: [
        "The one rule: line up the decimal points. Then units sit under units, tenths under tenths and hundredths under hundredths.",
        "If one number has fewer decimal places, fill the gap with zeros. 4.7 is the same as 4.70. A whole number like 6 is 6.00. The zeros don't change the value; they just keep the columns tidy.",
        "Then add or subtract column by column from the right, carrying or exchanging just like with whole numbers. Put the decimal point in the answer straight below the others.",
        "To check a subtraction, add your answer back on. You should get the number you started with.",
      ],
      demo: "decimal-columns",
      examples: [
        {
          question: "Work out 4.7 + 2.35.",
          steps: ["Write 4.7 as 4.70 so both have 2 decimal places.", "Line up the points: 4.70 + 2.35.", "Hundredths: 0 + 5 = 5. Tenths: 7 + 3 = 10, write 0 carry 1. Units: 4 + 2 + 1 = 7.", "Answer: 7.05"],
        },
        {
          question: "You pay for a £7.35 book with a £20 note. How much change do you get?",
          steps: ["Change = 20 − 7.35. Write 20 as 20.00.", "20.00 − 7.35: exchange across the zeros, then subtract each column.", "= £12.65", "Check: 12.65 + 7.35 = 20.00."],
        },
      ],
    },
    counts: { guided: 4, independent: 4, check: 5 },
  },

  "num-rounding": {
    skillId: "num-rounding",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Rounding makes numbers easier to use and to estimate with. Exam questions often say 'give your answer to 1 decimal place' or 'to 2 significant figures', and a correct answer rounded wrongly can lose the mark.",
      byTheEnd: [
        "Round to the nearest whole number and to decimal places.",
        "Find the first significant figure, even in a number like 0.0456.",
        "Round to significant figures, keeping the number the same size.",
      ],
    },
    teaching: {
      paragraphs: [
        "Rounding means finding the nearest 'tidy' number. 3.47 to 1 decimal place is either 3.4 or 3.5. Which is it closer to?",
        "The rule: find the last digit you keep, then look at the digit after it (the deciding digit). If the deciding digit is 5 or more, round up. If it is 4 or less, leave the kept digit alone. Then drop everything after it.",
        "So 3.47 to 1 decimal place: keep the 4, the deciding digit is 7, so round up to 3.5.",
        "Significant figures count from the first digit that isn't zero. In 3456 the first significant figure is the 3. In 0.0456 it is the 4: zeros at the start don't count.",
        "When you round a big number, fill the places you dropped with zeros so it stays the same size. 3456 to 2 significant figures is 3500, not 35.",
      ],
      demo: "rounding-line",
      examples: [
        {
          question: "Round 12.836 to 2 decimal places.",
          steps: ["Keep 2 digits after the point: 12.83|6.", "The deciding digit is 6. That's 5 or more, so round up.", "12.836 ≈ 12.84"],
        },
        {
          question: "Round 0.04567 to 2 significant figures.",
          steps: ["The first significant figure is the 4 (the zeros before it don't count).", "Keep 2 significant figures: 4 and 5. The deciding digit is 6, so round up.", "0.04567 ≈ 0.046"],
        },
        {
          question: "Round 72,840 to 1 significant figure.",
          steps: ["The first significant figure is the 7 (it's worth 70,000).", "The deciding digit is 2, so the 7 stays.", "Fill the rest with zeros: 72,840 ≈ 70,000"],
        },
      ],
    },
    counts: { guided: 5, independent: 4, check: 5 },
  },
};
