/**
 * The probability chain (KS3, GCSE Foundation, DfE codes P2-P7, N5): the
 * probability scale, single events, probabilities that add up to 1,
 * relative frequency and expected outcomes, sample spaces and Venn diagrams.
 *
 * Prerequisites copy the GCSE Foundation topic map exactly. Any that aren't
 * built yet are dropped by the content registry until they go live.
 *
 * Not built yet in this strand: frequency trees, and tree diagrams (with and
 * without replacement).
 *
 * STATUS: Draft. Written by the build team; needs review by a qualified maths
 * teacher before it is marked Verified.
 */

import type { Misconception, Skill } from "@/engine/types";

export const PROBABILITY_SKILLS: Skill[] = [
  {
    id: "prob-scale",
    topic: "Probability",
    name: "The probability scale and the language of chance",
    objective: "I can describe how likely something is in words, and place a probability between 0 and 1 on the probability scale.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: ["num-fdp"],
  },
  {
    id: "prob-single-event",
    topic: "Probability",
    name: "Probability of a single event",
    objective: "I can work out the probability of an event when all the outcomes are equally likely: the number of ways it can happen out of the total.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: ["prob-scale", "frac-simplify"],
  },
  {
    id: "prob-sum-to-one",
    topic: "Probability",
    name: "Probabilities that add up to 1",
    objective: "I can use the fact that probabilities of all the outcomes add up to 1, to find a missing probability or the probability of something not happening.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: ["prob-single-event", "num-add-sub"],
  },
  {
    id: "prob-relative-frequency",
    topic: "Probability",
    name: "Relative frequency and expected outcomes",
    objective: "I can work out a relative frequency from experiment results, and how many times I would expect something to happen.",
    typicalYear: 8,
    gcseTier: "foundation",
    prerequisites: ["prob-single-event", "frac-of-amount"],
  },
  {
    id: "prob-sample-space",
    topic: "Combined events",
    name: "Listing outcomes and sample space diagrams",
    objective: "I can list all the outcomes of two events, use a sample space diagram to find probabilities, and count combinations by multiplying.",
    typicalYear: 8,
    gcseTier: "foundation",
    prerequisites: ["prob-single-event"],
  },
  {
    id: "prob-venn",
    topic: "Combined events",
    name: "Venn diagrams and set notation",
    objective: "I can read and complete a Venn diagram, understand ∩ (both) and ∪ (either), and find probabilities from it.",
    typicalYear: 9,
    gcseTier: "foundation",
    prerequisites: ["prob-single-event"],
  },
];

export const PROBABILITY_MISCONCEPTIONS: Record<string, Misconception> = {
  "prob-even-means-possible": {
    id: "prob-even-means-possible",
    label: "Used \"even chance\" for something that isn't exactly half",
    explanation:
      "\"Even chance\" means exactly half: a 50-50 chance, like a coin landing on heads. If fewer than half of the outcomes work, it's unlikely. If more than half work, it's likely.",
  },
  "prob-possible-not-impossible": {
    id: "prob-possible-not-impossible",
    label: "Mixed up \"unlikely\" with \"impossible\" (or \"likely\" with \"certain\")",
    explanation:
      "Impossible means it can never happen (probability 0). Certain means it must happen (probability 1). If it could happen but doesn't have to, it's somewhere in between: unlikely or likely.",
  },
  "prob-scale-wrong-way": {
    id: "prob-scale-wrong-way",
    label: "Read the probability scale the wrong way round",
    explanation:
      "Check how many of the outcomes give the event. More than half means likely, fewer than half means unlikely. On the scale, 0 is impossible on the left and 1 is certain on the right.",
  },
  "prob-zero-one-valid": {
    id: "prob-zero-one-valid",
    label: "Thought 0 or 1 can't be a probability",
    explanation:
      "0 and 1 are both allowed. 0 means impossible and 1 means certain. A probability can't be less than 0 or more than 1 (or more than 100%).",
  },
  "prob-compare-forms": {
    id: "prob-compare-forms",
    label: "Compared fractions, decimals and percentages without changing them to the same form",
    explanation:
      "Change them all to the same form first, for example all to decimals or all to percentages. Then the biggest number is the most likely.",
    pointsTo: "num-fdp",
  },
  "prob-gave-count": {
    id: "prob-gave-count",
    label: "Gave the number of ways instead of the probability",
    explanation:
      "That's how many ways it can happen. A probability compares that with the total: write it as a fraction, the number of ways on top and the total number of outcomes on the bottom.",
  },
  "prob-other-on-bottom": {
    id: "prob-other-on-bottom",
    label: "Put the other outcomes on the bottom instead of the total",
    explanation:
      "The bottom of the fraction is the total number of outcomes, including the ones you want. For 3 red and 5 blue counters, P(red) is 3 out of 8, not 3 out of 5.",
  },
  "prob-equal-colours": {
    id: "prob-equal-colours",
    label: "Treated every colour (or type) as equally likely",
    explanation:
      "The colours aren't equally likely when there are different numbers of each. Count every counter (or section) separately: the probability is how many are that colour out of the total number.",
  },
  "prob-upside-down": {
    id: "prob-upside-down",
    label: "Wrote the probability upside down",
    explanation:
      "A probability can never be more than 1. The number of ways it can happen goes on top, and the total number of outcomes goes on the bottom.",
  },
  "prob-complement-same": {
    id: "prob-complement-same",
    label: "Gave the same probability for \"not\" happening",
    explanation:
      "Something either happens or it doesn't, so the two probabilities add up to 1. P(not A) = 1 − P(A).",
  },
  "prob-gave-sum-not-missing": {
    id: "prob-gave-sum-not-missing",
    label: "Added the given probabilities but didn't take them away from 1",
    explanation:
      "Adding the probabilities you know is the right start. All the probabilities add up to 1, so take that total away from 1 to find the missing one.",
  },
  "prob-forgot-share": {
    id: "prob-forgot-share",
    label: "Didn't share the leftover probability between the equal outcomes",
    explanation:
      "The leftover probability is shared between the outcomes that are equally likely. If two outcomes share it, divide by 2.",
  },
  "prob-subtract-decimal": {
    id: "prob-subtract-decimal",
    label: "Made a slip taking a decimal away from 1",
    explanation:
      "Write 1 as 1.00 and line up the decimal points before you subtract. Check: your answer and the number you took away should add back up to exactly 1.",
    pointsTo: "num-add-sub",
  },
  "prob-added-fractions-wrongly": {
    id: "prob-added-fractions-wrongly",
    label: "Added fractions by adding the tops and the bottoms",
    explanation:
      "To add fractions, first make the bottom numbers the same (a common denominator), then add the tops. Write 1 with that same bottom number before you take away.",
    pointsTo: "frac-add-sub",
  },
  "prob-used-theory": {
    id: "prob-used-theory",
    label: "Used the theoretical probability instead of the results",
    explanation:
      "Relative frequency comes from what actually happened in the experiment: the number of times it happened out of the number of trials. Use the results, not what should happen in theory.",
  },
  "prob-rf-upside-down": {
    id: "prob-rf-upside-down",
    label: "Wrote the relative frequency upside down",
    explanation: "Relative frequency is the number of times it happened on top, out of the total number of trials on the bottom. It can never be more than 1.",
  },
  "prob-expected-complement": {
    id: "prob-expected-complement",
    label: "Found how many times it would not happen",
    explanation: "That's the number of times you'd expect it not to happen. Multiply the number of trials by the probability of the event itself.",
  },
  "prob-expected-divided-top": {
    id: "prob-expected-divided-top",
    label: "Divided by the top of the fraction instead of the bottom",
    explanation:
      "To find a fraction of an amount, divide by the bottom number, then multiply by the top. For 2/5 of 150: 150 ÷ 5 = 30, then 30 × 2 = 60.",
    pointsTo: "frac-of-amount",
  },
  "prob-expected-gave-probability": {
    id: "prob-expected-gave-probability",
    label: "Gave the probability instead of the expected number",
    explanation: "The question asks how many times. Multiply the probability by the number of trials: expected number = probability × number of trials.",
  },
  "prob-rf-wrong-total": {
    id: "prob-rf-wrong-total",
    label: "Used the wrong total for relative frequency",
    explanation: "The bottom number is the total number of trials: add up all the results in the table.",
  },
  "prob-added-outcomes": {
    id: "prob-added-outcomes",
    label: "Added the choices instead of multiplying",
    explanation:
      "Each choice for the first thing can go with every choice for the second, so multiply. A coin (2 ways) and a dice (6 ways) give 2 × 6 = 12 outcomes. A sample space grid shows this: rows × columns.",
  },
  "prob-totals-equally-likely": {
    id: "prob-totals-equally-likely",
    label: "Treated every total as equally likely",
    explanation:
      "The totals aren't equally likely: some can be made in more ways than others. Count the cells in the sample space diagram that give that total, out of all the cells.",
  },
  "prob-grid-wrong-total": {
    id: "prob-grid-wrong-total",
    label: "Used the wrong total number of outcomes",
    explanation: "The bottom of the fraction is the number of cells in the whole grid: rows × columns.",
  },
  "prob-boundary": {
    id: "prob-boundary",
    label: "Got the boundary wrong (\"more than\" or \"at least\")",
    explanation:
      "\"More than 8\" doesn't include 8. \"At least 8\" does include 8. Check whether the number in the question counts.",
  },
  "prob-venn-only-region": {
    id: "prob-venn-only-region",
    label: "Used only the \"just A\" part of the Venn diagram",
    explanation:
      "Everything inside circle A counts as A, including the overlap in the middle. Add the \"only A\" number and the overlap.",
  },
  "prob-venn-double-count": {
    id: "prob-venn-double-count",
    label: "Counted the overlap twice",
    explanation:
      "The people in both groups are in each total, so adding the two totals counts them twice. Put the overlap in the middle first, then subtract it from each total.",
  },
  "prob-venn-forgot-outside": {
    id: "prob-venn-forgot-outside",
    label: "Left out the numbers outside the circles",
    explanation:
      "The total includes everyone in the rectangle, even those outside both circles. Add all four numbers to find the total.",
  },
  "prob-venn-intersection-union": {
    id: "prob-venn-intersection-union",
    label: "Mixed up ∩ (both) and ∪ (either)",
    explanation:
      "∩ means \"and\": in both circles, so only the overlap. ∪ means \"or\": in either circle, so everything inside the circles. Tip: ∪ looks like a cup that holds everything.",
  },
};
