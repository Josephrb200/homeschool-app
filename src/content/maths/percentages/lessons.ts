/**
 * Lesson content for the percentages chain (six stages, like every chain).
 * Practice and check questions come from generators.ts.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher before Verified.
 */

import type { Lesson } from "@/content/lesson-types";
import type { SkillId } from "@/engine/types";

export const PERCENT_LESSONS: Record<SkillId, Lesson> = {
  "num-fdp": {
    skillId: "num-fdp",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Fractions, decimals and percentages are three ways of writing the same amount. Being able to switch between them lets you pick the easiest one for each question, and it's tested on almost every GCSE paper.",
      byTheEnd: [
        "Change decimals to percentages and back.",
        "Change fractions to percentages using an equivalent fraction out of 100.",
        "Write percentages and decimals as fractions in their simplest form.",
      ],
    },
    teaching: {
      paragraphs: [
        "Percent means 'out of 100'. 35% means 35 out of 100, which is the fraction 35/100 and the decimal 0.35.",
        "Decimal to percentage: multiply by 100. 0.35 → 35%. 0.6 → 60%. 0.07 → 7%.",
        "Percentage to decimal: divide by 100. 35% → 0.35. 7% → 0.07 (7 hundredths, so there's a 0 in the tenths column).",
        "Fraction to percentage: make an equivalent fraction with 100 on the bottom. 3/4 = 75/100 = 75%. 7/20 = 35/100 = 35%.",
        "Percentage or decimal to fraction: write it out of 100 (or out of 10), then simplify. 35% = 35/100 = 7/20. 0.6 = 6/10 = 3/5.",
      ],
      demo: "hundred-grid",
      examples: [
        {
          question: "Write 7/20 as a percentage.",
          steps: ["20 × 5 = 100, so multiply the top and bottom by 5.", "7/20 = 35/100", "35 out of 100 = 35%"],
        },
        {
          question: "Write 0.45 as a fraction in its simplest form.",
          steps: ["Two decimal places means hundredths: 0.45 = 45/100.", "Divide the top and bottom by 5: 9/20.", "9 and 20 have no common factor, so 9/20 is simplest."],
        },
      ],
    },
    counts: { guided: 5, independent: 4, check: 5 },
  },

  "pct-of-amount": {
    skillId: "pct-of-amount",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Discounts, tips, tax, test scores and phone battery all use percentages of amounts. With 10%, 5% and 1% you can find almost any percentage in your head, which is what non-calculator papers expect.",
      byTheEnd: ["Find 50%, 25%, 10%, 5% and 1% of an amount.", "Build other percentages from those, like 35% = 10% + 10% + 10% + 5%.", "Use a percentage in a real problem, like a sale."],
    },
    teaching: {
      paragraphs: [
        "Some percentages are fractions you already know: 50% is a half (÷ 2), 25% is a quarter (÷ 4), and 10% is a tenth (÷ 10).",
        "From 10% you can get the rest. 5% is half of 10%. 20% is double 10%. 1% is one hundredth (÷ 100).",
        "To find 35% of £80: 10% is £8, so 30% is 3 × £8 = £24. 5% is half of £8 = £4. Add them: 35% = £24 + £4 = £28.",
        "Estimate first so you can spot a slip. 35% is about a third, and a third of £80 is about £27, so £28 makes sense.",
        "With a calculator you can also change the percentage to a decimal and multiply: 35% of 80 = 0.35 × 80 = 28.",
      ],
      demo: "percent-bar",
      examples: [
        {
          question: "Find 15% of £60.",
          steps: ["10% of £60 = £60 ÷ 10 = £6", "5% = half of 10% = £3", "15% = 10% + 5% = £6 + £3 = £9"],
        },
        {
          question: "Find 12% of 300.",
          steps: ["10% of 300 = 30", "1% of 300 = 300 ÷ 100 = 3, so 2% = 6", "12% = 10% + 2% = 30 + 6 = 36"],
        },
      ],
    },
    counts: { guided: 5, independent: 4, check: 5 },
  },

  "pct-increase-decrease": {
    skillId: "pct-increase-decrease",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Prices go up, sales take money off, savings grow. Percentage increase and decrease is one of the most common GCSE question types, and the multiplier method is the quickest way with a calculator.",
      byTheEnd: ["Increase or decrease an amount by a percentage.", "Write the multiplier for an increase or decrease, like 1.15 or 0.85.", "Spot which questions are increases and which are decreases."],
    },
    teaching: {
      paragraphs: [
        "Method 1, two steps: find the percentage of the amount, then add it on (increase) or take it away (decrease). Increase £80 by 15%: 15% of £80 is £12, so the new amount is £80 + £12 = £92.",
        "Method 2, one step with a multiplier: the original amount is 100%. After a 15% increase you have 115%, which is 1.15 as a decimal. £80 × 1.15 = £92.",
        "For a decrease, take the percentage away from 100%. A 15% decrease leaves 85%, so multiply by 0.85. £80 × 0.85 = £68.",
        "Words that mean increase: rise, grow, VAT, interest, 'more'. Words that mean decrease: discount, sale, reduce, 'off', 'less'.",
        "Check: an increase must give a bigger answer, a decrease a smaller one. If you only found £12, you've done the first step but not finished.",
      ],
      demo: "percent-change",
      examples: [
        {
          question: "A £40 jumper is reduced by 25% in a sale. What is the sale price?",
          steps: ["25% is a quarter: £40 ÷ 4 = £10.", "It's a reduction, so take it away: £40 − £10 = £30.", "Check with the multiplier: 100% − 25% = 75% = 0.75, and £40 × 0.75 = £30."],
        },
        {
          question: "What do you multiply by to increase an amount by 5%?",
          steps: ["100% + 5% = 105%", "105% = 105 ÷ 100 = 1.05", "Multiply by 1.05 (not 1.5, which would be a 50% increase)."],
        },
      ],
    },
    counts: { guided: 5, independent: 4, check: 5 },
  },

  "pct-one-of-another": {
    skillId: "pct-one-of-another",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Test results, survey answers and 'what percentage of the class...' questions all ask you to write one amount as a percentage of another. Percentages make different totals easy to compare: 18 out of 25 and 34 out of 40 are hard to compare until you see 72% and 85%.",
      byTheEnd: [
        "Write one amount as a fraction of another, then as a percentage.",
        "Use an equivalent fraction out of 100, or divide and multiply by 100.",
        "Make the units the same first, like pence and pounds.",
      ],
    },
    teaching: {
      paragraphs: [
        "Start with a fraction: the part on top, the total on the bottom. 18 out of 25 is 18/25.",
        "If the bottom goes into 100, make an equivalent fraction out of 100. 25 × 4 = 100, so 18/25 = 72/100 = 72%.",
        "If it doesn't, divide and multiply by 100. 7 out of 8: 7 ÷ 8 = 0.875, and 0.875 × 100 = 87.5%. With a calculator, round as the question asks.",
        "Units must match. 45p as a percentage of £3: change £3 to 300p first. 45/300 = 15/100 = 15%.",
        "Sense check: a part of something is less than the whole, so the answer is less than 100%. If you get more than 100%, you've probably divided the wrong way round.",
      ],
      demo: "percent-of-whole",
      examples: [
        {
          question: "Jo scored 34 out of 40 in a test. What percentage did Jo score?",
          steps: ["As a fraction: 34/40", "34 ÷ 40 = 0.85", "0.85 × 100 = 85%"],
        },
        {
          question: "What is 30 cm as a percentage of 2 m?",
          steps: ["Make the units the same: 2 m = 200 cm.", "As a fraction: 30/200", "Divide top and bottom by 2: 15/100 = 15%"],
        },
      ],
    },
    counts: { guided: 5, independent: 4, check: 5 },
  },

  "pct-change": {
    skillId: "pct-change",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "'Prices up 20%', 'sales down 15%', 'a 25% profit': percentage change describes how much something has grown or shrunk compared with where it started. It's on almost every GCSE paper, often in money questions.",
      byTheEnd: ["Find a percentage increase or decrease.", "Find a percentage profit or loss.", "Always divide by the original amount."],
    },
    teaching: {
      paragraphs: [
        "Percentage change = change ÷ original amount × 100.",
        "Step 1: find the change by subtracting. A ticket goes from £40 to £50, so the change is £10.",
        "Step 2: write the change as a percentage of the original. £10 out of £40 is 10/40 = 25/100, so it's a 25% increase.",
        "Always divide by the original (the starting amount), never the new one. Profit and loss work the same way: the original is the price paid.",
        "Check: if the new amount is 125% of the old one, that's a 25% increase. If it's 80% of the old one, that's a 20% decrease.",
      ],
      demo: "percent-change-find",
      examples: [
        {
          question: "A jacket's price drops from £80 to £60 in a sale. What is the percentage decrease?",
          steps: ["Change = £80 − £60 = £20", "As a fraction of the original: 20/80", "20 ÷ 80 × 100 = 25", "A 25% decrease"],
        },
        {
          question: "Sami buys a bike for £150 and sells it for £180. What is the percentage profit?",
          steps: ["Profit = £180 − £150 = £30", "Divide by the price paid (the original): 30 ÷ 150 = 0.2", "0.2 × 100 = 20% profit"],
        },
      ],
    },
    counts: { guided: 5, independent: 4, check: 5 },
  },
};
