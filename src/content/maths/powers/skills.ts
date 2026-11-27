/**
 * The negatives, powers and BIDMAS chain: calculating with negative numbers,
 * squares, cubes and roots, the order of operations, index laws and standard
 * form. KS3, GCSE Foundation (DfE N2, N3, N6, N7, N9).
 *
 * Prerequisites copy the topic map exactly (content/index.ts drops any that
 * aren't built yet).
 *
 * STATUS: Draft. Written by the build team; needs review by a qualified maths
 * teacher before it is marked Verified.
 */

import type { Misconception, Skill } from "@/engine/types";

export const POWERS_SKILLS: Skill[] = [
  {
    id: "num-negatives",
    topic: "Negative numbers",
    name: "Calculating with negative numbers",
    objective: "I can order negative numbers, and add, subtract, multiply and divide with them.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: ["num-place-value"],
  },
  {
    id: "num-powers-roots",
    topic: "Powers and roots",
    name: "Squares, cubes and roots",
    objective: "I can work out squares, cubes, square roots and cube roots, and know the square numbers up to 12².",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: ["num-multiply"],
  },
  {
    id: "num-order-of-operations",
    topic: "Order of operations",
    name: "Order of operations (BIDMAS)",
    objective: "I can work out a calculation with several operations in the right order: brackets, powers, × and ÷, then + and −.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: ["num-negatives", "num-powers-roots"],
  },
  {
    id: "num-index-laws",
    topic: "Powers and roots",
    name: "Index laws",
    objective: "I can multiply and divide powers of the same number, raise a power to a power, and know that any number to the power 0 is 1.",
    typicalYear: 9,
    gcseTier: "foundation",
    prerequisites: ["num-powers-roots"],
  },
  {
    id: "num-standard-form",
    topic: "Standard form",
    name: "Standard form",
    objective: "I can write very large and very small numbers in standard form, and change them back to ordinary numbers.",
    typicalYear: 9,
    gcseTier: "foundation",
    prerequisites: ["num-powers-roots", "num-place-value"],
  },
];

export const POWERS_MISCONCEPTIONS: Record<string, Misconception> = {
  // ---------------------------------------------------------------- negatives
  "neg-added-sizes": {
    id: "neg-added-sizes",
    label: "Added the sizes and kept the minus sign",
    explanation:
      "Adding a positive number moves you up the number line, towards zero and past it. Start at the negative number and count up. For −7 + 3: −6, −5, −4. So −7 + 3 = −4, not −10.",
  },
  "neg-wrong-sign": {
    id: "neg-wrong-sign",
    label: "Right size, wrong sign",
    explanation: "The size of your answer is right but the sign isn't. Picture the number line: do you finish above zero or below it?",
  },
  "neg-reversed-subtraction": {
    id: "neg-reversed-subtraction",
    label: "Took the smaller number from the bigger one",
    explanation:
      "3 − 8 is not the same as 8 − 3. Start at 3 and count down 8 places. You go past zero, so the answer is negative: 3 − 8 = −5.",
  },
  "neg-moved-wrong-way": {
    id: "neg-moved-wrong-way",
    label: "Moved the wrong way on the number line",
    explanation: "Check the direction. Adding, or a temperature rising, moves up the number line. Subtracting, or a temperature falling, moves down.",
  },
  "neg-bigger-digit-bigger": {
    id: "neg-bigger-digit-bigger",
    label: "Thought −8 is bigger than −3",
    explanation:
      "With negative numbers, the further from zero, the smaller (or colder) the number. −8 is further below zero than −3, so −8 is smaller. Think of temperatures: −8 °C is colder than −3 °C.",
  },
  "neg-minus-minus": {
    id: "neg-minus-minus",
    label: "Subtracted a negative as if it were positive",
    explanation:
      "Subtracting a negative is the same as adding. Two minus signs side by side, like 4 − (−6), become a plus: 4 + 6 = 10.",
  },
  "neg-plus-negative": {
    id: "neg-plus-negative",
    label: "Added a negative as if it were positive",
    explanation: "Adding a negative is the same as subtracting. 5 + (−8) means 5 − 8, which is −3.",
  },
  "neg-sign-different": {
    id: "neg-sign-different",
    label: "Gave a positive answer when the signs were different",
    explanation:
      "When you multiply or divide, check the signs. Different signs (one positive, one negative) give a negative answer. Same signs give a positive answer.",
  },
  "neg-two-negatives": {
    id: "neg-two-negatives",
    label: "Thought two negatives multiply to a negative",
    explanation:
      "When you multiply or divide two negative numbers, the answer is positive. Same signs give a positive answer: −4 × −6 = 24.",
  },
  "neg-difference": {
    id: "neg-difference",
    label: "Subtracted the sizes instead of counting across zero",
    explanation:
      "To find a difference, count the steps from one number to the other on the number line. From −7 up to 0 is 7 steps, then from 0 up to 5 is 5 more. The difference is 7 + 5 = 12.",
  },

  // ---------------------------------------------------------- powers and roots
  "pow-multiplied": {
    id: "pow-multiplied",
    label: "Multiplied by the power instead of using it",
    explanation:
      "The small raised number says how many times to multiply the number by itself. 7² means 7 × 7 = 49, not 7 × 2. And 2⁵ means 2 × 2 × 2 × 2 × 2 = 32, not 2 × 5.",
  },
  "pow-squared-not-cubed": {
    id: "pow-squared-not-cubed",
    label: "Squared instead of cubing",
    explanation: "Cubed means three of the number multiplied together. 4³ = 4 × 4 × 4 = 64. You multiplied only two of them.",
  },
  "root-halved": {
    id: "root-halved",
    label: "Halved instead of finding the square root",
    explanation:
      "A square root is not half. √64 asks: which number times itself makes 64? 8 × 8 = 64, so √64 = 8. Half of 64 is 32, and 32 × 32 is far too big.",
  },
  "root-divided-three": {
    id: "root-divided-three",
    label: "Divided by 3 instead of finding the cube root",
    explanation: "A cube root is not a third. ∛27 asks: which number times itself, then times itself again, makes 27? 3 × 3 × 3 = 27, so ∛27 = 3.",
  },
  "root-area-quartered": {
    id: "root-area-quartered",
    label: "Divided the area by 4",
    explanation:
      "Dividing by 4 works for a perimeter, not an area. The area of a square is side × side, so the side is the square root of the area: which number times itself makes it?",
    pointsTo: "area-rectangle",
  },
  "root-square-for-cube": {
    id: "root-square-for-cube",
    label: "Used a square root for a cube",
    explanation: "A cube's volume is edge × edge × edge, so you need the cube root, not the square root. Which number, used three times, multiplies to the volume?",
  },

  // ------------------------------------------------------- order of operations
  "bidmas-left-to-right": {
    id: "bidmas-left-to-right",
    label: "Worked left to right, ignoring the order of operations",
    explanation:
      "Multiplication and division come before addition and subtraction, wherever they are. In 3 + 4 × 2, do 4 × 2 = 8 first, then 3 + 8 = 11.",
  },
  "bidmas-ignored-brackets": {
    id: "bidmas-ignored-brackets",
    label: "Didn't do the brackets first",
    explanation: "Anything in brackets is worked out first. In (3 + 4) × 2, do 3 + 4 = 7 first, then 7 × 2 = 14.",
  },
  "bidmas-power-late": {
    id: "bidmas-power-late",
    label: "Did the power last instead of early",
    explanation:
      "Powers come straight after brackets, before ×, ÷, + and −. In 2 × 3², the power belongs only to the 3: 3² = 9, then 2 × 9 = 18. It is not (2 × 3)² = 36.",
  },
  "bidmas-add-before-subtract": {
    id: "bidmas-add-before-subtract",
    label: "Did addition before subtraction",
    explanation:
      "Addition and subtraction are equal partners: do them from left to right. In 10 − 3 + 2, do 10 − 3 = 7 first, then 7 + 2 = 9. Adding first (3 + 2) gives the wrong answer.",
  },
  "bidmas-multiply-before-divide": {
    id: "bidmas-multiply-before-divide",
    label: "Did multiplication before division",
    explanation:
      "Multiplication and division are equal partners: do them from left to right. In 12 ÷ 3 × 2, do 12 ÷ 3 = 4 first, then 4 × 2 = 8.",
  },
  "bidmas-sign-slip": {
    id: "bidmas-sign-slip",
    label: "Lost the negative sign",
    explanation: "The order was right, but check the sign at the end. If you take a bigger number away from a smaller one, the answer is negative.",
    pointsTo: "num-negatives",
  },
  "bidmas-wrong-brackets": {
    id: "bidmas-wrong-brackets",
    label: "Brackets in the wrong place",
    explanation: "Work out each choice, doing the brackets first. Only one of them gives the target answer.",
  },

  // ------------------------------------------------------------- index laws
  "idx-multiplied-powers": {
    id: "idx-multiplied-powers",
    label: "Multiplied the powers instead of adding them",
    explanation:
      "When you multiply powers of the same number, add the powers. 3⁴ × 3² is four 3s times two 3s: six 3s altogether, so 3⁶. Write them out to check.",
  },
  "idx-divided-powers": {
    id: "idx-divided-powers",
    label: "Divided the powers instead of subtracting them",
    explanation:
      "When you divide powers of the same number, subtract the powers. 2⁶ ÷ 2² is six 2s on top and two on the bottom. Two pairs cancel, leaving four 2s: 2⁴.",
  },
  "idx-added-for-divide": {
    id: "idx-added-for-divide",
    label: "Added the powers when dividing",
    explanation: "Adding is for multiplying. When you divide powers of the same number, subtract the powers: 5⁷ ÷ 5³ = 5⁴.",
  },
  "idx-added-for-power": {
    id: "idx-added-for-power",
    label: "Added the powers for a power of a power",
    explanation:
      "(2³)⁴ means 2³ four times: 2³ × 2³ × 2³ × 2³. That is 3 + 3 + 3 + 3 = 12, which is 3 × 4. For a power of a power, multiply the powers.",
  },
  "idx-subtracted-wrong-way": {
    id: "idx-subtracted-wrong-way",
    label: "Subtracted the powers the wrong way round",
    explanation:
      "Always take the second power from the first. 5³ ÷ 5⁷ means 3 − 7 = −4. More 5s on the bottom than the top gives a negative power.",
  },
  "idx-zero-is-zero": {
    id: "idx-zero-is-zero",
    label: "Thought a power of 0 gives 0",
    explanation: "Any number (except 0) to the power 0 is 1. One way to see it: 7³ ÷ 7³ = 1, and by the index law it is also 7³⁻³ = 7⁰. So 7⁰ = 1.",
  },
  "idx-zero-is-base": {
    id: "idx-zero-is-base",
    label: "Thought a power of 0 leaves the number unchanged",
    explanation: "That's what a power of 1 does: 7¹ = 7. A power of 0 always gives 1, because 7³ ÷ 7³ = 7⁰ and anything divided by itself is 1.",
  },
  "idx-value-not-power": {
    id: "idx-value-not-power",
    label: "Gave the value instead of the power",
    explanation: "The question asks for the power. Subtract the powers: 4 − 4 = 0, so the answer is the power 0. (Its value is 1, which is why anything to the power 0 is 1.)",
  },
  "idx-multiplied-bases": {
    id: "idx-multiplied-bases",
    label: "Multiplied the bases together too",
    explanation: "The base stays the same. 2³ × 2² = 2⁵, still with 2 at the bottom. It is not 4⁵.",
  },
  "idx-missing-power": {
    id: "idx-missing-power",
    label: "Added instead of working backwards",
    explanation: "Work backwards. The powers must add up to the answer's power, so take the power you know away from the answer's power.",
  },

  // ------------------------------------------------------------ standard form
  "sf-counted-zeros": {
    id: "sf-counted-zeros",
    label: "Counted the zeros instead of the places moved",
    explanation:
      "The power is how many places the digits move, not how many zeros there are. 34,000 = 3.4 × 10⁴, because 3.4 has to move 4 places to become 34,000 (it has only 3 zeros).",
  },
  "sf-wrong-power": {
    id: "sf-wrong-power",
    label: "Power out by one",
    explanation: "Count the places carefully. Put your finger after the first digit, then count how many places it is to where the decimal point really is.",
  },
  "sf-small-positive": {
    id: "sf-small-positive",
    label: "Used a positive power for a small number",
    explanation:
      "Numbers smaller than 1 have a negative power. 0.00047 = 4.7 × 10⁻⁴. A positive power like 10⁴ makes a number bigger, not smaller.",
  },
  "sf-appended-zeros": {
    id: "sf-appended-zeros",
    label: "Added zeros on the end instead of moving the digits",
    explanation:
      "× 10³ moves the digits 3 places, it doesn't add 3 zeros. 5.2 × 10³: move 5.2 three places left to get 5200. Writing 52 then 000 gives 52,000, which is 10 times too big.",
    pointsTo: "num-place-value",
  },
  "sf-small-extra-zero": {
    id: "sf-small-extra-zero",
    label: "Put one zero too many after the point",
    explanation:
      "Move the digits one place at a time instead of counting zeros. × 10⁻³ moves the digits 3 places to the right, making the number smaller: 6.1 → 0.61 → 0.061 → 0.0061.",
    pointsTo: "num-place-value",
  },
  "sf-adjusted-wrong-way": {
    id: "sf-adjusted-wrong-way",
    label: "Changed the power the wrong way",
    explanation:
      "45 × 10³: first write 45 as 4.5 × 10. Then 4.5 × 10 × 10³ = 4.5 × 10⁴. Making the first number smaller means the power goes up, so the value stays the same.",
  },
  "sf-not-between-1-10": {
    id: "sf-not-between-1-10",
    label: "First number not between 1 and 10",
    explanation: "In standard form, the first number must be at least 1 and less than 10, like 3.4. Numbers like 34 or 0.34 don't count.",
  },
  "sf-not-power-of-ten": {
    id: "sf-not-power-of-ten",
    label: "Not written with a power of 10",
    explanation: "Standard form always uses a power of 10, written like 10³, not as 1000.",
  },
};
