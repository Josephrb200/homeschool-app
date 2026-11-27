/**
 * The factors and primes chain (KS3, GCSE Foundation, DfE N4): factors,
 * multiples and primes; writing a number as a product of primes; HCF and LCM.
 *
 * Prerequisites copy the GCSE Foundation topic map exactly. Ones that aren't
 * built yet (division, powers and roots) are dropped by the content registry
 * until they go live, then link up automatically.
 *
 * STATUS: Draft. Written by the build team; needs review by a qualified maths
 * teacher before it is marked Verified.
 */

import type { Misconception, Skill } from "@/engine/types";

export const FACTOR_SKILLS: Skill[] = [
  {
    id: "num-factors-multiples",
    topic: "Factors and primes",
    name: "Factors, multiples and primes",
    objective: "I can list the factors of a number in pairs, write down its multiples, and tell whether a number is prime.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: ["num-divide"],
  },
  {
    id: "num-prime-factorisation",
    topic: "Factors and primes",
    name: "Products of primes",
    objective: "I can use a factor tree to write a number as a product of primes, like 60 = 2² × 3 × 5.",
    typicalYear: 8,
    gcseTier: "foundation",
    prerequisites: ["num-factors-multiples", "num-powers-roots"],
  },
  {
    id: "num-hcf-lcm",
    topic: "Factors and primes",
    name: "HCF and LCM",
    objective: "I can find the highest common factor and lowest common multiple of two numbers, by listing or with prime factors.",
    typicalYear: 8,
    gcseTier: "foundation",
    prerequisites: ["num-prime-factorisation"],
  },
];

export const FACTOR_MISCONCEPTIONS: Record<string, Misconception> = {
  "fm-factor-multiple-mixup": {
    id: "fm-factor-multiple-mixup",
    label: "Mixed up factors and multiples",
    explanation:
      "Factors fit into a number: the factors of 12 are 1, 2, 3, 4, 6 and 12, and none is bigger than 12. Multiples are the times table: 12, 24, 36 and so on, and none is smaller than 12.",
  },
  "fm-missed-pair": {
    id: "fm-missed-pair",
    label: "Missed some factors",
    explanation:
      "Find factors in pairs so none get lost. Start with 1 × the number, then try 2, 3, 4 and so on. Each time one divides exactly, write down both numbers in the pair. Stop when the pairs meet in the middle.",
  },
  "fm-not-factor": {
    id: "fm-not-factor",
    label: "Included a number that isn't a factor",
    explanation: "A factor divides the number exactly, with nothing left over. Check each one by dividing.",
  },
  "fm-not-multiple": {
    id: "fm-not-multiple",
    label: "Included a number that isn't a multiple",
    explanation: "Multiples come from the times table: 7 × 1, 7 × 2, 7 × 3 and so on. So the multiples of 7 start at 7 itself, then 14, 21, 28.",
  },
  "fm-not-prime": {
    id: "fm-not-prime",
    label: "Included a number that isn't prime",
    explanation:
      "A prime number has exactly two factors: 1 and itself. 1 isn't prime (it only has one factor), and odd numbers aren't always prime: 9 = 3 × 3 and 51 = 3 × 17.",
  },
  "fm-one-prime": {
    id: "fm-one-prime",
    label: "Thought 1 is prime",
    explanation: "1 is not a prime number. A prime has exactly two factors, 1 and itself. 1 only has one factor, so it doesn't count.",
  },
  "fm-odd-prime": {
    id: "fm-odd-prime",
    label: "Thought every odd number is prime",
    explanation:
      "Not every odd number is prime. 9 = 3 × 3, 21 = 3 × 7, 51 = 3 × 17 and 91 = 7 × 13. Try dividing by 3, 5, 7, 11 and 13 before you decide.",
  },
  "fm-two-not-prime": {
    id: "fm-two-not-prime",
    label: "Thought 2 isn't prime",
    explanation: "2 is prime: its only factors are 1 and 2. It's the only even prime, because every other even number also divides by 2.",
  },
  "pf-missing-prime": {
    id: "pf-missing-prime",
    label: "Lost a prime from the factor tree",
    explanation: "A prime has gone missing. Write down every circled prime at the end of each branch, including repeats, then multiply them back together to check.",
  },
  "pf-stopped-early": {
    id: "pf-stopped-early",
    label: "Stopped the factor tree too early",
    explanation: "Every number in a product of primes must be prime. If a number still splits (like 15 = 3 × 5), keep going.",
  },
  "pf-power-times": {
    id: "pf-power-times",
    label: "Multiplied the prime by the power",
    // Add pointsTo: "num-powers-roots" once that skill is live.
    explanation: "A power means repeated multiplying. 2³ = 2 × 2 × 2 = 8, not 2 × 3 = 6. 3² = 3 × 3 = 9, not 3 × 2 = 6.",
  },
  "hcf-lcm-swapped": {
    id: "hcf-lcm-swapped",
    label: "Mixed up HCF and LCM",
    explanation:
      "HCF is the Highest Common Factor: the biggest number that goes into both, so it's never bigger than the smaller number. LCM is the Lowest Common Multiple: the smallest number both go into, so it's never smaller than the bigger number.",
  },
  "hcf-not-highest": {
    id: "hcf-not-highest",
    label: "Found a common factor, but not the highest",
    explanation: "That number does go into both, but there's a bigger one that does too. List all the factors of each number and pick the biggest one in both lists.",
  },
  "lcm-multiplied": {
    id: "lcm-multiplied",
    label: "Multiplied the two numbers for the LCM",
    explanation:
      "Multiplying the numbers always gives a common multiple, but not always the lowest. Count up in the bigger number's times table until you reach one the smaller number also goes into.",
  },
  "lcm-not-lowest": {
    id: "lcm-not-lowest",
    label: "Found a common multiple, but not the lowest",
    explanation: "Both numbers go into that, but there's a smaller number they both go into. Count up in the bigger number's times table and stop at the first one the other number divides.",
  },
};
