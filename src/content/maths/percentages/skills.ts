/**
 * The percentages chain: converting between fractions, decimals and
 * percentages, percentages of amounts, percentage increase and decrease,
 * one amount as a percentage of another, and percentage change.
 * KS3, GCSE Foundation (DfE N10, N12, R9).
 *
 * STATUS: Draft. Written by the build team; needs review by a qualified maths
 * teacher before it is marked Verified.
 */

import type { Misconception, Skill } from "@/engine/types";

export const PERCENT_SKILLS: Skill[] = [
  {
    id: "num-fdp",
    topic: "Percentages",
    name: "Fractions, decimals and percentages",
    objective: "I can change between fractions, decimals and percentages, like 3/4 = 0.75 = 75%.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: ["frac-equivalent", "num-place-value"],
  },
  {
    id: "pct-of-amount",
    topic: "Percentages",
    name: "Percentages of amounts",
    objective: "I can find a percentage of an amount without a calculator, by building it from 10%, 5% and 1%.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: ["num-fdp", "frac-of-amount"],
  },
  {
    id: "pct-increase-decrease",
    topic: "Percentages",
    name: "Percentage increase and decrease",
    objective: "I can increase or decrease an amount by a percentage, and find the multiplier, like × 1.15 for a 15% increase.",
    typicalYear: 8,
    gcseTier: "foundation",
    prerequisites: ["pct-of-amount"],
  },
  {
    id: "pct-one-of-another",
    topic: "Percentages",
    name: "One amount as a percentage of another",
    objective: "I can write one amount as a percentage of another, like 18 out of 25 = 72%, making the units the same first.",
    typicalYear: 8,
    gcseTier: "foundation",
    prerequisites: ["num-fdp", "ratio-fraction-of-another"],
  },
  {
    id: "pct-change",
    topic: "Percentages",
    name: "Percentage change",
    objective: "I can find a percentage increase, decrease, profit or loss: the change divided by the original amount, times 100.",
    typicalYear: 9,
    gcseTier: "foundation",
    prerequisites: ["pct-one-of-another"],
  },
];

export const PERCENT_MISCONCEPTIONS: Record<string, Misconception> = {
  "fdp-kept-decimal": {
    id: "fdp-kept-decimal",
    label: "Didn't multiply by 100 to make a percentage",
    explanation: "Percent means 'out of 100'. To change a decimal to a percentage, multiply by 100: 0.35 × 100 = 35%.",
  },
  "fdp-times-ten": {
    id: "fdp-times-ten",
    label: "Multiplied by 10 instead of 100",
    explanation:
      "To change a decimal to a percentage, multiply by 100, which moves the digits 2 places. 0.6 is 6 tenths, which is 60 hundredths, so 0.6 = 60%.",
    pointsTo: "num-place-value",
  },
  "fdp-percent-digits": {
    id: "fdp-percent-digits",
    label: "Wrote 7% as 0.7",
    explanation:
      "Divide by 100 to change a percentage to a decimal. 7% is 7 hundredths, so it's 0.07. (0.7 would be 70%.)",
    pointsTo: "num-place-value",
  },
  "fdp-forgot-divide": {
    id: "fdp-forgot-divide",
    label: "Didn't divide by 100 to make a decimal",
    explanation: "A percentage is 'out of 100'. To write it as a decimal, divide by 100: 35% = 35 ÷ 100 = 0.35.",
  },
  "fdp-fraction-digits": {
    id: "fdp-fraction-digits",
    label: "Wrote the fraction's digits side by side",
    explanation:
      "A fraction is a division: 3/4 means 3 ÷ 4. Make the bottom 100 with an equivalent fraction (3/4 = 75/100), then it's 75%. You can't just write the digits next to each other.",
    pointsTo: "frac-equivalent",
  },
  "fdp-wrong-denominator": {
    id: "fdp-wrong-denominator",
    label: "Used the wrong denominator for a decimal",
    explanation:
      "One decimal place means tenths: 0.6 = 6/10. Two decimal places means hundredths: 0.06 = 6/100. Then simplify.",
    pointsTo: "num-place-value",
  },
  "pct-divided-by-percent": {
    id: "pct-divided-by-percent",
    label: "Divided by the percentage number",
    explanation:
      "Dividing by the percentage number doesn't find the percentage (it only works for 10%). Find 10% first by dividing by 10, then build the percentage you need from 10%, 5% and 1%.",
  },
  "pct-place-value": {
    id: "pct-place-value",
    label: "Answer 10 times too big or too small",
    explanation:
      "Check the size of your answer. 10% means divide by 10, and 1% means divide by 100. A quick estimate helps: 10% of 80 is 8, so 30% must be about 24, not 2.4 or 240.",
    pointsTo: "num-place-value",
  },
  "pct-subtracted": {
    id: "pct-subtracted",
    label: "Took the percentage number away",
    explanation: "Taking away the percentage number doesn't find the percentage. Percent means 'out of 100': find 10% or 1% first, then build up.",
  },
  "pct-change-only": {
    id: "pct-change-only",
    label: "Found the change but didn't add or subtract it",
    explanation:
      "You found the size of the change, which is the first step. Now add it on (for an increase) or take it away (for a decrease) to get the new amount.",
    pointsTo: "pct-of-amount",
  },
  "pct-added-number": {
    id: "pct-added-number",
    label: "Added or took away the percentage number",
    explanation:
      "Increasing by 15% doesn't mean adding 15. Find 15% of the amount first, then add it on or take it away.",
    pointsTo: "pct-of-amount",
  },
  "pct-wrong-direction": {
    id: "pct-wrong-direction",
    label: "Increased instead of decreased (or the other way)",
    explanation: "Check the question. Increase, rise and VAT make the amount bigger. Decrease, discount, sale and 'off' make it smaller.",
  },
  "pct-mult-part": {
    id: "pct-mult-part",
    label: "Used the percentage change as the multiplier",
    explanation:
      "Multiplying by 0.15 only finds the 15% part. For an increase you keep the whole 100% and add 15%: 115% = 1.15. For a decrease you are left with 100% − 15% = 85% = 0.85.",
  },
  "pct-mult-place-value": {
    id: "pct-mult-place-value",
    label: "Wrote the multiplier with digits in the wrong place",
    explanation:
      "5% is 0.05, so 105% is 1.05, not 1.5 (which is 150%). Write the new percentage, then divide by 100.",
    pointsTo: "num-fdp",
  },
  "pct-just-part": {
    id: "pct-just-part",
    label: "Gave the amount, not the percentage",
    explanation:
      "That's how many, not what percentage. Write it as a fraction (the part over the total), then make it out of 100, or divide and multiply by 100.",
  },
  "pct-upside-down": {
    id: "pct-upside-down",
    label: "Divided the wrong way round",
    explanation:
      "'A as a percentage of B' means A ÷ B × 100. The part goes on top and the total goes on the bottom. A part of something is less than 100%, so an answer over 100% is a warning sign.",
    pointsTo: "ratio-fraction-of-another",
  },
  "pct-units": {
    id: "pct-units",
    label: "Didn't make the units the same",
    explanation: "Change both amounts into the same units first. £3 is 300p, so 45p out of £3 is 45/300, which is 15%.",
  },
  "pct-change-amount": {
    id: "pct-change-amount",
    label: "Gave the change, not the percentage change",
    explanation:
      "You found how much it changed by, which is the first step. Now divide that change by the original amount and multiply by 100.",
  },
  "pct-change-divided-new": {
    id: "pct-change-divided-new",
    label: "Divided by the new amount instead of the original",
    explanation: "Always compare with where you started. Percentage change = change ÷ original amount × 100. Use the old price, not the new one.",
  },
  "pct-change-new-percent": {
    id: "pct-change-new-percent",
    label: "Gave the new amount as a percentage of the old",
    explanation:
      "That's the new amount as a percentage of the original. The change is the difference from 100%: 125% means a 25% increase, and 80% means a 20% decrease.",
  },
};
