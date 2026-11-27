/**
 * The decimals chain: place value in decimals, adding and subtracting
 * decimals, and rounding (decimal places and significant figures).
 * KS3, GCSE Foundation (DfE N1, N2, N15).
 *
 * STATUS: Draft. Written by the build team; needs review by a qualified maths
 * teacher before it is marked Verified.
 */

import type { Misconception, Skill } from "@/engine/types";

export const DECIMAL_SKILLS: Skill[] = [
  {
    id: "num-place-value",
    topic: "Decimals",
    name: "Place value in decimals",
    objective: "I can give the value of any digit in a decimal, compare decimals, and multiply or divide by 10, 100 and 1000.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: [],
  },
  {
    id: "num-add-sub",
    topic: "Decimals",
    name: "Adding and subtracting decimals",
    objective: "I can add and subtract decimals by lining up the decimal points and filling gaps with zeros.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: ["num-place-value"],
  },
  {
    id: "num-rounding",
    topic: "Decimals",
    name: "Rounding",
    objective: "I can round to the nearest whole number, to decimal places and to significant figures.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: ["num-place-value"],
  },
];

export const DECIMAL_MISCONCEPTIONS: Record<string, Misconception> = {
  "pv-face-value": {
    id: "pv-face-value",
    label: "Gave the digit, not its value",
    explanation:
      "That's the digit itself. Its value depends on its column. Find the column in the place value chart: tenths are 0.1s, hundredths are 0.01s, thousandths are 0.001s.",
  },
  "pv-wrong-column": {
    id: "pv-wrong-column",
    label: "Read the wrong column",
    explanation:
      "Count the columns from the decimal point carefully. The first column after the point is tenths, the second is hundredths, the third is thousandths.",
  },
  "pv-longer-is-bigger": {
    id: "pv-longer-is-bigger",
    label: "Thought more digits means bigger",
    explanation:
      "More digits doesn't mean bigger. Compare the tenths first, then the hundredths. Writing both with the same number of decimal places helps: 0.60 and 0.45, so 0.60 is bigger.",
  },
  "pv-wrong-direction": {
    id: "pv-wrong-direction",
    label: "Multiplied when it should divide (or the other way)",
    explanation:
      "Check the sign. Multiplying by 10 makes a number bigger (digits move left). Dividing by 10 makes it smaller (digits move right).",
  },
  "pv-wrong-places": {
    id: "pv-wrong-places",
    label: "Moved the digits the wrong number of places",
    explanation:
      "Count the zeros: × 10 moves the digits 1 place, × 100 moves them 2 places, × 1000 moves them 3 places. The same for dividing.",
  },
  "dec-right-aligned": {
    id: "dec-right-aligned",
    label: "Lined up the last digits instead of the decimal points",
    explanation:
      "Line up the decimal points, not the last digits. Then every digit sits in its own column: units under units, tenths under tenths. Fill any gaps with zeros.",
    pointsTo: "num-place-value",
  },
  "dec-ignored-whole": {
    id: "dec-ignored-whole",
    label: "Subtracted the whole numbers and kept the decimal part",
    explanation:
      "A whole number like 6 is 6.00. Write it with the same number of decimal places as the other number, then subtract column by column, exchanging where you need to.",
  },
  "dec-smaller-from-larger": {
    id: "dec-smaller-from-larger",
    label: "Took the smaller digit from the larger in each column",
    explanation:
      "In subtraction you always take the bottom digit from the top digit. If the top digit is smaller, exchange 1 from the column to the left first.",
  },
  "dec-forgot-carry": {
    id: "dec-forgot-carry",
    label: "Forgot to carry",
    explanation: "When a column adds up to 10 or more, write the units digit and carry the 1 into the next column to the left.",
  },
  "round-truncated": {
    id: "round-truncated",
    label: "Cut the number off instead of rounding",
    explanation:
      "Look at the next digit after the place you're rounding to. If it is 5 or more, round up. You chopped the number off, which only works when the next digit is 4 or less.",
  },
  "round-wrong-place": {
    id: "round-wrong-place",
    label: "Rounded to the wrong number of places",
    explanation: "Check how many places the question asks for. Count the digits after the decimal point in your answer: there should be exactly that many.",
  },
  "round-sf-dropped-zeros": {
    id: "round-sf-dropped-zeros",
    label: "Dropped the place-holder zeros",
    explanation:
      "Rounding mustn't change the size of the number. 3456 to 2 significant figures is 3500, not 35. Fill the empty places with zeros so the digits stay in their columns.",
    pointsTo: "num-place-value",
  },
  "round-sf-as-dp": {
    id: "round-sf-as-dp",
    label: "Treated significant figures like decimal places",
    explanation:
      "Significant figures start at the first digit that isn't zero. In 0.0456 the first significant figure is the 4, so 2 significant figures is 0.046.",
  },
};
