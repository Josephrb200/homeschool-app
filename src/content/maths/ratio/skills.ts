/**
 * The ratio and proportion chain (KS3, GCSE Foundation, DfE codes R3-R8,
 * R10, R14): fractions of amounts, simplifying ratios, sharing in a ratio,
 * ratios and fractions, the unitary method (recipes, best buys) and direct
 * proportion.
 *
 * Prerequisites copy the GCSE Foundation topic map exactly. Ones that aren't
 * built yet (for example HCF, division, plotting graphs) are dropped by the
 * content registry until they go live, then link up automatically.
 *
 * STATUS: Draft. Written by the build team; needs review by a qualified maths
 * teacher before it is marked Verified.
 */

import type { Misconception, Skill } from "@/engine/types";

export const RATIO_SKILLS: Skill[] = [
  {
    id: "ratio-fraction-of-another",
    topic: "Ratio",
    name: "One quantity as a fraction of another",
    objective: "I can write one amount as a fraction of another, in its simplest form, making the units match first.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: ["frac-simplify"],
  },
  {
    id: "ratio-simplify",
    topic: "Ratio",
    name: "Writing and simplifying ratios",
    objective: "I can write a ratio in the right order and simplify it, including ratios with three parts or different units.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: ["frac-simplify", "num-hcf-lcm"],
  },
  {
    id: "ratio-share",
    topic: "Ratio",
    name: "Sharing an amount in a ratio",
    objective: "I can share an amount in a given ratio by finding the value of one part.",
    typicalYear: 8,
    gcseTier: "foundation",
    prerequisites: ["ratio-simplify"],
  },
  {
    id: "ratio-fractions",
    topic: "Ratio",
    name: "Ratios and fractions (part:part and part:whole)",
    objective: "I can turn a ratio into a fraction of the whole, and a fraction into a ratio.",
    typicalYear: 8,
    gcseTier: "foundation",
    prerequisites: ["ratio-share", "frac-of-amount"],
  },
  {
    id: "ratio-unitary-method",
    topic: "Proportion",
    name: "Proportion with the unitary method (recipes, best buys)",
    objective: "I can scale a recipe or price by finding the value of one first, and decide which pack is better value.",
    typicalYear: 8,
    gcseTier: "foundation",
    prerequisites: ["ratio-share", "num-divide"],
  },
  {
    id: "ratio-direct-proportion",
    topic: "Proportion",
    name: "Direct proportion problems and graphs",
    objective: "I can solve direct proportion problems, including exchange rates, and know a direct proportion graph is a straight line through (0, 0).",
    typicalYear: 9,
    gcseTier: "foundation",
    prerequisites: ["ratio-unitary-method", "alg-plot-linear"],
  },
];

export const RATIO_MISCONCEPTIONS: Record<string, Misconception> = {
  "ratio-fraction-upside-down": {
    id: "ratio-fraction-upside-down",
    label: "Wrote the fraction upside down",
    explanation:
      "The fraction is the wrong way up. \"A as a fraction of B\" means A goes on top and B, the whole, goes on the bottom. A fraction of something is usually less than 1.",
  },
  "ratio-units-not-matched": {
    id: "ratio-units-not-matched",
    label: "Didn't make the units the same first",
    explanation:
      "The two amounts are in different units. Change them to the same unit first (for example 1 m = 100 cm, 1 kg = 1000 g, 1 hour = 60 minutes, £1 = 100p), then compare.",
  },
  "ratio-reversed": {
    id: "ratio-reversed",
    label: "Wrote the ratio in the wrong order",
    explanation:
      "Order matters in a ratio. Write the numbers in the same order as the words: \"girls to boys\" means the number of girls first.",
  },
  "ratio-share-equal": {
    id: "ratio-share-equal",
    label: "Shared equally instead of in the ratio",
    explanation:
      "That shares the amount equally. In a ratio the shares are different sizes. Add the parts to find how many parts there are altogether, then find one part.",
  },
  "ratio-share-one-part": {
    id: "ratio-share-one-part",
    label: "Found one part but didn't multiply",
    explanation:
      "That's the value of one part. You've done the hard bit! Now multiply by the number of parts that person gets.",
  },
  "ratio-share-wrong-person": {
    id: "ratio-share-wrong-person",
    label: "Gave the other person's share",
    explanation: "Your working is right, but that's the other person's share. Check which share the question asks for.",
  },
  "ratio-share-divided-by-part": {
    id: "ratio-share-divided-by-part",
    label: "Divided by one number of the ratio instead of the total parts",
    explanation:
      "Divide the amount by the total number of parts (add the numbers in the ratio), not by one of them. That gives the value of one part.",
    pointsTo: "ratio-simplify",
  },
  "ratio-share-used-total": {
    id: "ratio-share-used-total",
    label: "Treated a known share as the total",
    explanation:
      "The amount you were given is one person's share, not the total. Divide it by that person's number of parts to find one part.",
  },
  "ratio-part-over-part": {
    id: "ratio-part-over-part",
    label: "Used part over part, not part over whole",
    explanation:
      "A fraction compares a part with the whole. Add all the parts of the ratio to get the bottom number. For 3:5, there are 8 parts, so the fractions are 3/8 and 5/8.",
  },
  "ratio-used-whole": {
    id: "ratio-used-whole",
    label: "Used the whole as the second part of the ratio",
    explanation:
      "A ratio compares part with part. If 2/7 are boys, then 7 − 2 = 5 parts are girls, so boys : girls = 2:5, not 2:7.",
  },
  "prop-added-difference": {
    id: "prop-added-difference",
    label: "Added instead of multiplying (proportion)",
    explanation:
      "Proportion is about multiplying, not adding. If the number of people doubles, every amount doubles. Find the amount for 1 first, then multiply.",
  },
  "prop-forgot-divide": {
    id: "prop-forgot-divide",
    label: "Multiplied without finding the value of one first",
    explanation:
      "The amount you started with is for more than one. Divide first to find the amount for 1, then multiply up.",
  },
  "prop-wrong-way": {
    id: "prop-wrong-way",
    label: "Multiplied when it should divide (or the other way)",
    explanation:
      "Check whether your answer should be bigger or smaller. If you are going from the bigger amount to the smaller, you divide.",
  },
  "prop-picked-dearer": {
    id: "prop-picked-dearer",
    label: "Picked the more expensive option",
    explanation:
      "Better value means you pay less for each one (or for each gram). Compare the price of one item in each pack and choose the lower price.",
  },
};
