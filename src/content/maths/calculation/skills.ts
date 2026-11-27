/**
 * Calculation skills (KS3, GCSE Foundation, DfE N1-N5, N9, N13-N16):
 * ordering numbers, written multiplication and division, inverse operations,
 * time and money, metric units, estimation, error intervals, systematic
 * listing and calculating in standard form.
 *
 * They make three new chains ("Ordering, multiplying and dividing",
 * "Units, time and money", "Estimation and accuracy"). Systematic listing
 * joins the factors chain and standard form calculations join the powers
 * chain, following the topic map.
 *
 * Prerequisites copy the GCSE Foundation topic map exactly. Ones not built
 * yet are dropped by the content registry until they go live.
 *
 * STATUS: Draft. Written by the build team; needs review by a qualified maths
 * teacher before it is marked Verified.
 */

import type { Misconception, Skill } from "@/engine/types";

const skill = (id: string, topic: string, name: string, objective: string, typicalYear: number, prerequisites: string[]): Skill => ({
  id,
  topic,
  name,
  objective,
  typicalYear,
  gcseTier: "foundation",
  prerequisites,
});

export const CALCULATION_SKILLS: Skill[] = [
  skill("num-ordering", "Place value and ordering", "Ordering numbers using < > ≤ ≥", "I can put decimals and negative numbers in order, and use the signs <, >, ≤ and ≥.", 7, ["num-place-value"]),
  skill("num-multiply", "Written calculation", "Written multiplication, including decimals", "I can multiply whole numbers and decimals using a written method.", 7, ["num-place-value"]),
  skill("num-divide", "Written calculation", "Short and long division, including decimals", "I can divide using short or long division, including decimals and remainders in real problems.", 7, ["num-multiply"]),
  skill("num-inverse-operations", "Written calculation", "Inverse operations", "I can use the opposite operation to find a missing number and to check my answers.", 7, ["num-divide"]),
];

export const MEASURES_MONEY_SKILLS: Skill[] = [
  skill("num-time-money", "Measures", "Time, timetables and money calculations", "I can work out how long things take, read timetables and work out change.", 7, ["num-add-sub"]),
  skill("num-units", "Measures", "Metric units and converting between them", "I can change between metric units of length, mass and capacity.", 7, ["num-multiply", "num-divide"]),
];

export const ESTIMATION_SKILLS: Skill[] = [
  skill("num-estimation", "Rounding and estimation", "Estimating answers by rounding", "I can estimate an answer by rounding every number to 1 significant figure.", 8, ["num-rounding", "num-order-of-operations"]),
  skill("num-error-intervals", "Rounding and estimation", "Error intervals and limits of accuracy", "I can find the smallest and largest values a rounded number could have been, and write an error interval.", 10, ["num-rounding", "alg-inequalities-number-line"]),
];

/** Joins the "Factors and primes" chain (topic map topic). */
export const LISTING_SKILLS: Skill[] = [
  skill("num-listing", "Factors and primes", "Systematic listing of combinations", "I can list combinations in a system so I don't miss any, and use multiplying to count them.", 8, []),
];

/** Joins the "Negatives, powers and BIDMAS" chain, after writing numbers in standard form. */
export const SF_CALC_SKILLS: Skill[] = [
  skill("num-standard-form-calc", "Standard form", "Calculating with standard form", "I can multiply, divide, add and subtract numbers in standard form.", 10, ["num-standard-form", "num-index-laws"]),
];

export const ALL_CALCULATION_SKILLS = [...CALCULATION_SKILLS, ...MEASURES_MONEY_SKILLS, ...ESTIMATION_SKILLS, ...LISTING_SKILLS, ...SF_CALC_SKILLS];

const mc = (id: string, label: string, explanation: string, pointsTo?: string): [string, Misconception] => [id, { id, label, explanation, ...(pointsTo ? { pointsTo } : {}) }];

export const CALCULATION_MISCONCEPTIONS: Record<string, Misconception> = Object.fromEntries([
  // ordering
  mc("ord-longer-bigger", "Thought a decimal with more digits is bigger", "More digits doesn't mean bigger. Give both decimals the same number of decimal places by adding zeros (0.4 = 0.40), then compare from the left: 0.40 is more than 0.35.", "num-place-value"),
  mc("ord-negative-size", "Ordered negative numbers by size, ignoring the minus sign", "With negative numbers, the further from zero, the smaller the number. −7 is less than −3, because −7 is further left on the number line.", "num-negatives"),
  mc("ord-reversed-direction", "Put the numbers in the wrong direction", "That list goes from largest to smallest. The question asks for smallest first."),
  mc("ord-strict-included", "Included an end where the sign is < or >", "< and > don't include the number itself. Only ≤ and ≥ (with the line underneath) include it."),
  mc("ord-inclusive-missed", "Left out an end where the sign is ≤ or ≥", "≤ means 'less than or equal to', so that number is allowed. Include it in your list."),
  // multiplying
  mc("mul-forgot-carry", "Forgot to carry when multiplying", "When a product is 10 or more, write the units digit and carry the tens to the next column. Splitting the number up (like 40 + 7) and multiplying each part avoids this."),
  mc("mul-added", "Added instead of multiplying", "That's the sum of the numbers. The question asks you to multiply them."),
  mc("mul-forgot-zero", "Forgot the place-holder zero in long multiplication", "When you multiply by the tens digit, you are really multiplying by a number of tens. 23 × 40 is 23 × 4 × 10, so put a 0 at the end first."),
  mc("mul-partial-only", "Multiplied tens by tens and units by units only", "Every part must multiply every other part. 23 × 45 is 20 × 40 + 20 × 5 + 3 × 40 + 3 × 5. A grid with four boxes helps."),
  mc("mul-decimal-places", "Put the decimal point in the wrong place", "Count the decimal places in the question. The answer has the same total number. For 0.3 × 0.2: 3 × 2 = 6, and there are 2 decimal places, so 0.06.", "num-place-value"),
  // dividing
  mc("div-dropped-zero", "Left out a zero in the answer", "When the number you're dividing by doesn't go into a digit, write 0 in the answer above it, then carry. 624 ÷ 6 = 104, not 14.", "num-place-value"),
  mc("div-multiplied", "Multiplied instead of dividing", "That answer is far too big. Dividing should make the number smaller (unless you divide by a number less than 1)."),
  mc("div-remainder-context", "Didn't think about what the remainder means", "In a real problem, decide what to do with the remainder. If everyone needs a seat, round up. If only full boxes count, round down."),
  mc("div-decimal-point", "Put the decimal point in the wrong place when dividing", "Keep the decimal point in the answer straight above the decimal point in the number you're dividing."),
  mc("div-decimal-divisor", "Divided by a decimal as if it were a whole number", "Dividing by a number less than 1 makes the answer bigger. Multiply both numbers by 10 so you divide by a whole number: 4.8 ÷ 0.4 = 48 ÷ 4 = 12."),
  mc("div-remainder-as-decimal", "Wrote the remainder after the decimal point", "A remainder of 3 is not 0.3. Keep dividing: add .0 to the number and carry the remainder into the tenths."),
  // inverse operations
  mc("inv-same-operation", "Used the same operation instead of the opposite", "To undo an operation, use its opposite: + and − undo each other, × and ÷ undo each other."),
  mc("inv-wrong-order", "Undid the steps in the wrong order", "Work backwards: undo the last step first. It's like taking off shoes before socks."),
  mc("inv-wrong-number", "Gave the number you were dividing by", "If a × b = c, then c ÷ a = b. You gave the number you divided by. The answer is the other number in the multiplication."),
  // time and money
  mc("time-hundred-minutes", "Treated an hour as 100 minutes", "There are 60 minutes in an hour, not 100. You can't subtract times like ordinary numbers. Count on to the next hour, then on to the end time."),
  mc("time-decimal-hours", "Read the digits after the point as minutes", "2.5 hours is two and a half hours, which is 2 hours 30 minutes, not 2 hours 50 minutes. Multiply the decimal part by 60 to get minutes."),
  mc("time-carry-hour", "Didn't carry into the next hour", "When the minutes go past 60, that's another hour. 50 minutes + 35 minutes = 85 minutes = 1 hour 25 minutes."),
  mc("money-gave-total", "Gave the total instead of the change", "That's how much the things cost altogether. Change is what's left of the money paid: take the total away from it."),
  mc("money-missed-item", "Left out one of the items", "Add up the prices of everything bought first, then work out the change."),
  mc("money-pence-pounds", "Mixed up pence and pounds", "£1 = 100p. To change pence into pounds, divide by 100. To change pounds into pence, multiply by 100."),
  // units
  mc("units-wrong-direction", "Multiplied when it should divide (units)", "Going to a smaller unit, you need more of them, so multiply. Going to a bigger unit, you need fewer, so divide."),
  mc("units-wrong-factor", "Used the wrong conversion number", "Check the conversion: 1 cm = 10 mm, 1 m = 100 cm, 1 km = 1000 m, 1 kg = 1000 g, 1 litre = 1000 ml."),
  mc("units-not-matched", "Added amounts in different units", "Change both amounts into the same unit before you add or compare them."),
  // estimation
  mc("est-not-1sf", "Rounded to the nearest whole number instead of 1 significant figure", "For an estimate, round each number to 1 significant figure: keep only the first non-zero digit. 48.7 becomes 50, not 49.", "num-rounding"),
  mc("est-divide-decimal", "Multiplied by a decimal instead of dividing", "Dividing by 0.5 is not the same as halving. It asks how many halves fit in, so the answer doubles. 600 ÷ 0.5 = 1200."),
  mc("est-forgot-step", "Left out a step of the calculation", "Check you did every part: multiply the top, then divide by the bottom."),
  mc("est-over-under", "Mixed up overestimate and underestimate", "If you round the numbers up before multiplying, the estimate is bigger than the real answer: an overestimate."),
  mc("est-root-halved", "Halved the number instead of finding the square root", "The square root is the number that multiplies by itself to give the number. √49 = 7, because 7 × 7 = 49. It isn't half."),
  // error intervals
  mc("ei-wrong-half", "Used half of the wrong place value", "Use half of the unit it was rounded to. To 1 decimal place the unit is 0.1, so go 0.05 either way.", "num-rounding"),
  mc("ei-whole-unit", "Went a whole unit either side instead of half", "The bounds are only half a unit away. For 7.4 to 1 decimal place, the bounds are 7.35 and 7.45, not 7.3 and 7.5."),
  mc("ei-upper-nines", "Wrote the upper bound as ...9 or ...4", "The upper bound is exactly half a unit above, like 7.45. Numbers just under it still round down, so we use 7.45 with the < sign."),
  mc("ei-wrong-symbols", "Used the inequality signs the wrong way round", "The lower bound is included (≤) because it rounds up to the value. The upper bound is not included (<) because it would round up to the next value."),
  mc("ei-truncation-rounded", "Treated truncating like rounding", "Truncating chops off digits, it never rounds up. So the number can't be below the truncated value. 4.6 truncated means 4.6 ≤ x < 4.7."),
  // listing
  mc("list-added", "Added the choices instead of multiplying", "Each choice from the first list goes with every choice from the second. Multiply the numbers of choices."),
  mc("list-missed-choice", "Left out one of the lists", "Every list of choices multiplies the total. Include all of them."),
  mc("list-incomplete", "Didn't find every arrangement", "Work systematically: fix the first item, list every order of the rest, then move on to the next first item."),
  mc("list-repeats", "Counted arrangements that use an item twice", "Each item can only be used once. After choosing the first, there is one fewer choice for the next."),
  mc("list-order-counted", "Counted the same pair twice", "A game between A and B is the same as between B and A. Count each pair once."),
  mc("list-order-counted-wrong", "Treated 25 and 52 as the same number", "Order matters for numbers: 25 and 52 are different. Count both."),
  // standard form calculations
  mc("sfc-multiplied-powers", "Multiplied the powers instead of adding them", "When you multiply powers of 10, add the powers: 10⁴ × 10³ = 10⁷.", "num-index-laws"),
  mc("sfc-divided-powers", "Divided the powers instead of subtracting them", "When you divide powers of 10, subtract the powers: 10⁸ ÷ 10² = 10⁶.", "num-index-laws"),
  mc("sfc-added-powers-divide", "Added the powers when dividing", "When you divide powers of 10, subtract the powers, don't add them."),
  mc("sfc-adjust-wrong-way", "Changed the power the wrong way when tidying up", "12 × 10⁷ = 1.2 × 10⁸: the first number got 10 times smaller, so the power goes up by 1 to keep the value the same."),
  mc("sfc-added-numbers", "Added the first numbers without matching the powers", "You can only add the first numbers when the powers are the same. Write both as ordinary numbers, add, then change back."),
]);
