/**
 * The fractions chain: skills, prerequisites and misconceptions.
 *
 * STATUS: Draft. Written by the build team; needs review by a qualified maths
 * teacher before it is marked Verified.
 */

import type { Misconception, Skill } from "@/engine/types";

export const FRACTION_SKILLS: Skill[] = [
  {
    id: "frac-equivalent",
    topic: "Fractions",
    name: "Equivalent fractions",
    objective: "I can find fractions that are worth the same, like 1/2 = 3/6.",
    typicalYear: 6,
    gcseTier: "foundation",
    prerequisites: [],
  },
  {
    id: "frac-simplify",
    topic: "Fractions",
    name: "Simplifying fractions",
    objective: "I can write a fraction in its simplest form, like 6/8 = 3/4.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: ["frac-equivalent"],
  },
  {
    id: "frac-common-denominator",
    topic: "Fractions",
    name: "Common denominators",
    objective: "I can rewrite two fractions so they have the same denominator.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: ["frac-equivalent"],
  },
  {
    id: "frac-add-sub",
    topic: "Fractions",
    name: "Adding and subtracting fractions",
    objective: "I can add and subtract fractions with different denominators.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: ["frac-common-denominator", "frac-simplify"],
  },
  {
    id: "frac-of-amount",
    topic: "Fractions",
    name: "Fractions of amounts",
    objective: "I can find a fraction of an amount, like 3/4 of 20.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: ["frac-equivalent"],
  },
  {
    id: "frac-mul-div",
    topic: "Fractions",
    name: "Multiplying and dividing fractions",
    objective: "I can multiply and divide fractions and give the answer in simplest form.",
    typicalYear: 8,
    gcseTier: "foundation",
    prerequisites: ["frac-simplify", "frac-of-amount"],
  },
];

export const FRACTION_MISCONCEPTIONS: Record<string, Misconception> = {
  "changed-one-part": {
    id: "changed-one-part",
    label: "Changed only one part of the fraction",
    explanation:
      "To keep a fraction worth the same, whatever you multiply the bottom by, you must multiply the top by too.",
    pointsTo: "frac-equivalent",
  },
  "added-to-both": {
    id: "added-to-both",
    label: "Added the same number to top and bottom",
    explanation:
      "Adding the same number to the top and bottom changes the fraction's value. Equivalent fractions come from multiplying (or dividing) both by the same number.",
    pointsTo: "frac-equivalent",
  },
  "common-not-lowest": {
    id: "common-not-lowest",
    label: "Found a common denominator, but not the lowest",
    explanation:
      "That is a common denominator, but there's a smaller one. Look for the smallest number both denominators divide into.",
  },
  "added-denominators": {
    id: "added-denominators",
    label: "Added the denominators to find a common denominator",
    explanation:
      "A common denominator is a number both denominators divide into exactly. Adding them doesn't give one. Try listing the times tables of each.",
  },
  "added-across": {
    id: "added-across",
    label: "Added tops and bottoms separately",
    explanation:
      "You can't add the denominators. First make the denominators the same, then add only the numerators.",
    pointsTo: "frac-common-denominator",
  },
  "subtracted-across": {
    id: "subtracted-across",
    label: "Subtracted tops and bottoms separately",
    explanation:
      "You can't subtract the denominators. First make the denominators the same, then subtract only the numerators.",
    pointsTo: "frac-common-denominator",
  },
  "numerator-not-scaled": {
    id: "numerator-not-scaled",
    label: "Changed the denominators but not the numerators",
    explanation:
      "When you change a denominator, multiply the numerator by the same number, or the fraction's value changes.",
    pointsTo: "frac-common-denominator",
  },
  "divided-only": {
    id: "divided-only",
    label: "Divided by the denominator but didn't multiply by the numerator",
    explanation:
      "Dividing by the denominator finds one part. Then multiply by the numerator to find that many parts.",
  },
  "multiplied-only": {
    id: "multiplied-only",
    label: "Multiplied by the numerator without dividing by the denominator",
    explanation:
      "First divide by the denominator to find one part, then multiply by the numerator.",
    pointsTo: "frac-equivalent",
  },
  "flipped-when-multiplying": {
    id: "flipped-when-multiplying",
    label: "Flipped a fraction when multiplying",
    explanation: "Only flip when dividing. To multiply, multiply the tops together and the bottoms together.",
  },
  "forgot-to-flip": {
    id: "forgot-to-flip",
    label: "Multiplied instead of dividing",
    explanation: "To divide by a fraction, flip the second fraction and then multiply.",
  },
  "flipped-wrong-fraction": {
    id: "flipped-wrong-fraction",
    label: "Flipped the first fraction instead of the second",
    explanation: "Keep the first fraction as it is. Flip the second one, then multiply.",
  },
};
