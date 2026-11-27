/**
 * Lessons for the calculation skills (six stages, like every chain).
 * Practice and check questions come from generators.ts.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher before Verified.
 */

import type { Lesson } from "@/content/lesson-types";
import type { SkillId } from "@/engine/types";

export const CALCULATION_LESSONS: Record<SkillId, Lesson> = {
  "num-ordering": {
    skillId: "num-ordering",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "Which is cheaper, £0.45 or £0.405 a litre? Is −8 °C colder than −3 °C? Putting numbers in order sounds simple, but decimals and negatives catch lots of people out, even adults. The signs < and > also turn up all through algebra.",
      byTheEnd: ["Compare decimals by lining up the place values.", "Order negative numbers using a number line.", "Read and use <, >, ≤ and ≥."],
    },
    teaching: {
      paragraphs: [
        "To compare decimals, line up the decimal points and give them the same number of decimal places by adding zeros on the end. 0.4 becomes 0.40, which you can compare with 0.35 easily: 40 hundredths is more than 35 hundredths.",
        "A decimal with more digits is not always bigger. 0.405 has more digits than 0.45, but 0.405 is smaller, because 0.405 = 0.405 and 0.45 = 0.450.",
        "For negative numbers, picture a number line. Numbers get bigger as you go right. −3 is to the right of −8, so −3 is bigger. The further a negative number is from zero, the smaller it is.",
        "The signs: < means 'is less than' and > means 'is greater than'. The wide, open end faces the bigger number: 3 < 7 and 7 > 3.",
        "≤ means 'less than or equal to' and ≥ means 'greater than or equal to'. The line underneath means the number itself is included. If n is a whole number and 2 < n ≤ 5, then n can be 3, 4 or 5, but not 2.",
      ],
      demo: "decimal-compare",
      examples: [
        {
          question: "Which is bigger, 0.7 or 0.65?",
          steps: ["Give them the same number of decimal places: 0.70 and 0.65.", "Compare: 70 hundredths is more than 65 hundredths.", "0.7 > 0.65, so 0.7 is bigger."],
        },
        {
          question: "Put −5, 2, −1 and 0.5 in order, smallest first.",
          steps: ["The negatives come first. −5 is further from zero than −1, so −5 is smaller.", "Then 0.5, which is less than 1, then 2.", "−5, −1, 0.5, 2"],
        },
        {
          question: "n is a whole number and 4 ≤ n < 8. Write down all the possible values of n.",
          steps: ["4 ≤ n: n is 4 or more, so 4 is included.", "n < 8: n is less than 8, so 8 is not included.", "n can be 4, 5, 6 or 7."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "num-multiply": {
    skillId: "num-multiply",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Multiplying is everywhere: 24 tickets at £13 each, 3.5 metres of fabric at £6 a metre. About half the questions on a non-calculator exam paper need a written multiplication somewhere. A reliable method means you don't have to rely on remembering tricks.",
      byTheEnd: ["Multiply by splitting numbers into parts (the grid method).", "Multiply two 2-digit numbers.", "Multiply decimals and put the decimal point in the right place."],
    },
    teaching: {
      paragraphs: [
        "Big multiplications are easier in parts. To work out 47 × 6, split 47 into 40 + 7. Then 40 × 6 = 240 and 7 × 6 = 42. Add them: 240 + 42 = 282.",
        "For two 2-digit numbers, split both. 23 × 45: split into 20 + 3 and 40 + 5, and draw a grid with four boxes. 20 × 40 = 800, 20 × 5 = 100, 3 × 40 = 120, 3 × 5 = 15. Add all four: 1035. Every part multiplies every other part.",
        "Column (long) multiplication is the same idea, written more compactly. Multiply by the units digit, then by the tens digit, and remember the tens digit is really tens: put a 0 down first.",
        "Decimals: multiply as if there were no decimal points, then put the point back. Count the decimal places in the question; the answer has the same number. 0.3 × 0.2: 3 × 2 = 6, and there are 2 decimal places, so the answer is 0.06.",
        "Always check your answer is sensible. 3.4 × 6 should be a bit more than 3 × 6 = 18. 20.4 is sensible; 204 isn't.",
      ],
      demo: "grid-multiply",
      examples: [
        {
          question: "Work out 36 × 7.",
          steps: ["Split 36 into 30 + 6.", "30 × 7 = 210 and 6 × 7 = 42.", "210 + 42 = 252"],
        },
        {
          question: "Work out 34 × 26.",
          steps: ["Grid: 30 × 20 = 600, 30 × 6 = 180, 4 × 20 = 80, 4 × 6 = 24.", "Add all four parts: 600 + 180 + 80 + 24.", "34 × 26 = 884"],
        },
        {
          question: "Work out 1.4 × 0.3.",
          steps: ["Without the points: 14 × 3 = 42.", "1.4 has 1 decimal place and 0.3 has 1, so the answer has 2.", "1.4 × 0.3 = 0.42"],
        },
      ],
    },
    counts: { guided: 4, independent: 5, check: 5 },
  },

  "num-divide": {
    skillId: "num-divide",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Sharing a bill, working out how many coaches a trip needs, finding a price per item: they all need division. Exam questions often hide a division inside a real problem, and then ask you to think about the remainder.",
      byTheEnd: ["Divide using short division (the bus stop).", "Divide decimals, and divide by a decimal.", "Decide what a remainder means in a real problem."],
    },
    teaching: {
      paragraphs: [
        "Short division works one digit at a time, from the left. For 624 ÷ 6: 6 ÷ 6 = 1. Then 2 ÷ 6 doesn't go, so write 0 and carry the 2 to make 24. 24 ÷ 6 = 4. The answer is 104. Don't forget the 0!",
        "If a remainder is left over, you can keep going: put a decimal point and zeros after the number. 47 ÷ 4 = 11 remainder 3, and carrying on gives 11.75. A remainder of 3 is not 0.3.",
        "Dividing a decimal by a whole number: divide as normal and keep the decimal point in line. 7.65 ÷ 5 = 1.53.",
        "Dividing by a decimal: multiply both numbers by 10 (or 100) until you are dividing by a whole number. 4.8 ÷ 0.4 = 48 ÷ 4 = 12. Dividing by a number less than 1 makes the answer bigger.",
        "In real problems, think about the remainder. 52 students and minibuses holding 8: 52 ÷ 8 = 6 remainder 4. Those 4 students still need a seat, so you need 7 minibuses. But if you're filling boxes of 8, only 6 boxes are completely full.",
      ],
      demo: "bus-stop-division",
      examples: [
        {
          question: "Work out 832 ÷ 4.",
          steps: ["8 ÷ 4 = 2.", "3 ÷ 4 doesn't go: write 0 and carry the 3. 32 ÷ 4 = 8.", "832 ÷ 4 = 208"],
        },
        {
          question: "Work out 3.6 ÷ 0.4.",
          steps: ["Multiply both by 10 so we divide by a whole number: 36 ÷ 4.", "36 ÷ 4 = 9.", "3.6 ÷ 0.4 = 9"],
        },
        {
          question: "A lift holds 9 people. 60 people need to go up. How many trips does the lift make?",
          steps: ["60 ÷ 9 = 6 remainder 6.", "The 6 people left over still need a trip, so round up.", "7 trips"],
        },
      ],
    },
    counts: { guided: 4, independent: 5, check: 5 },
  },

  "num-inverse-operations": {
    skillId: "num-inverse-operations",
    status: "draft",
    minutes: 15,
    intro: {
      whyItMatters:
        "Every operation has an opposite that undoes it. Knowing these lets you find missing numbers, check your own answers quickly, and later solve equations, which is just undoing operations in order.",
      byTheEnd: ["Know which operations undo each other.", "Find a missing number by working backwards.", "Check an answer with the inverse operation."],
    },
    teaching: {
      paragraphs: [
        "Adding and subtracting undo each other. Multiplying and dividing undo each other. These pairs are called inverse operations.",
        "To find a missing number, undo what was done to it. ? × 7 = 91: undo × 7 by dividing by 7. 91 ÷ 7 = 13, so the missing number is 13.",
        "With more than one step, work backwards and undo the last step first. 'I think of a number, multiply by 4, then add 7, and get 43.' Undo + 7: 43 − 7 = 36. Undo × 4: 36 ÷ 4 = 9.",
        "Use inverses to check. If you worked out 384 ÷ 12 = 32, check with 32 × 12. If you get 384, you were right.",
        "One fact gives you others. If 23 × 17 = 391, then 391 ÷ 17 = 23, 391 ÷ 23 = 17, and 2.3 × 17 = 39.1 (ten times smaller).",
      ],
      demo: "function-machine",
      examples: [
        {
          question: "Find the missing number: ? − 38 = 46",
          steps: ["Undo − 38 by adding 38.", "46 + 38 = 84.", "Check: 84 − 38 = 46. The missing number is 84."],
        },
        {
          question: "I think of a number, multiply it by 3, then subtract 5. The answer is 22. What was my number?",
          steps: ["Work backwards. Undo − 5: 22 + 5 = 27.", "Undo × 3: 27 ÷ 3 = 9.", "Check: 9 × 3 − 5 = 22. My number was 9."],
        },
      ],
    },
    counts: { guided: 4, independent: 5, check: 5 },
  },

  "num-time-money": {
    skillId: "num-time-money",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Catching a bus, timing a film, checking your change: these are some of the most useful bits of maths in everyday life. Time is tricky because an hour has 60 minutes, not 100, so normal column subtraction gives wrong answers.",
      byTheEnd: ["Work out how long something takes by counting on.", "Change between hours and minutes, including decimal hours.", "Read a timetable and work out change."],
    },
    teaching: {
      paragraphs: [
        "To find how long something takes, count on. From 6:45 pm to 8:20 pm: count on to the next hour, 6:45 pm to 7:00 pm is 15 minutes. Then 7:00 pm to 8:20 pm is 1 hour 20 minutes. Altogether 1 hour 35 minutes, which is 95 minutes.",
        "Don't subtract times like ordinary numbers. 8:20 − 6:45 done as 820 − 645 = 175 is wrong, because there are only 60 minutes in an hour.",
        "Decimal hours are fractions of an hour. 2.5 hours is two and a half hours: 2 hours 30 minutes, not 2 hours 50 minutes. 0.25 hours = 15 minutes, 0.75 hours = 45 minutes. In general, multiply the decimal part by 60.",
        "Timetables often use the 24-hour clock: 14:35 is 2:35 pm. Read down a column to follow one bus, and count on between the times.",
        "For money, it often helps to work in pence. £3.45 = 345p. To find change, add up the cost, then take it from the money paid, or count up from the cost to the amount paid.",
      ],
      demo: "time-number-line",
      examples: [
        {
          question: "A film starts at 7:40 pm and ends at 9:15 pm. How long is it in minutes?",
          steps: ["7:40 pm to 8:00 pm is 20 minutes.", "8:00 pm to 9:15 pm is 1 hour 15 minutes = 75 minutes.", "20 + 75 = 95 minutes"],
        },
        {
          question: "Jay buys a drink for £1.35 and a sandwich for £2.90. He pays with a £5 note. How much change does he get?",
          steps: ["Total: 135p + 290p = 425p = £4.25.", "Change: 500p − 425p = 75p.", "Jay gets 75p, which is £0.75."],
        },
      ],
    },
    counts: { guided: 4, independent: 5, check: 5 },
  },

  "num-units": {
    skillId: "num-units",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "Recipes use grams and kilograms, maps use metres and kilometres, drinks use millilitres and litres. Converting between them is a step in lots of exam questions, and getting the direction wrong gives answers 1000 times too big or too small.",
      byTheEnd: ["Know the key metric conversions.", "Decide whether to multiply or divide.", "Convert before adding amounts in different units."],
    },
    teaching: {
      paragraphs: [
        "The key facts: 1 cm = 10 mm, 1 m = 100 cm, 1 km = 1000 m. 1 kg = 1000 g, 1 tonne = 1000 kg. 1 litre = 1000 ml, and 1 litre = 100 cl.",
        "Going to a smaller unit, you need more of them, so multiply. 3.5 km = 3.5 × 1000 = 3500 m.",
        "Going to a bigger unit, you need fewer of them, so divide. 450 g = 450 ÷ 1000 = 0.45 kg.",
        "Check your answer makes sense. A kilometre is a long way, so 3.5 km should be lots of metres. If you get 0.0035 m, you went the wrong way.",
        "To add or compare amounts, change them into the same unit first. 1.2 m + 45 cm = 120 cm + 45 cm = 165 cm.",
      ],
      demo: "unit-staircase",
      examples: [
        {
          question: "Change 2.4 kg into grams.",
          steps: ["1 kg = 1000 g. Grams are smaller, so multiply.", "2.4 × 1000 = 2400", "2.4 kg = 2400 g"],
        },
        {
          question: "Change 350 ml into litres.",
          steps: ["1 litre = 1000 ml. Litres are bigger, so divide.", "350 ÷ 1000 = 0.35", "350 ml = 0.35 litres"],
        },
      ],
    },
    counts: { guided: 4, independent: 5, check: 5 },
  },

  "num-estimation": {
    skillId: "num-estimation",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "An estimate tells you roughly what an answer should be, so you can spot a mistake, like a calculator slip that's 10 times too big. Exam papers often ask for an estimate directly, and you must show the rounded numbers to get the marks.",
      byTheEnd: ["Round numbers to 1 significant figure.", "Use the rounded numbers to estimate a calculation.", "Say whether an estimate is too big or too small."],
    },
    teaching: {
      paragraphs: [
        "To estimate, round every number to 1 significant figure: keep only the first non-zero digit and round. 48.7 → 50, 3.1 → 3, 612 → 600, 0.48 → 0.5.",
        "Then do the easier calculation. 48.7 × 3.1 ≈ 50 × 3 = 150. The sign ≈ means 'is approximately equal to'.",
        "Dividing by a decimal: 612 ÷ 0.48 ≈ 600 ÷ 0.5. Dividing by 0.5 asks 'how many halves are in 600?', which is 1200. The answer gets bigger.",
        "For a fraction like (41.2 × 9.8) ÷ 2.1, round everything: (40 × 10) ÷ 2 = 400 ÷ 2 = 200.",
        "If you round both numbers up before multiplying, the estimate is too big: an overestimate. If you round both down, it's an underestimate.",
      ],
      demo: "estimate-compare",
      examples: [
        {
          question: "Estimate 29.4 × 6.8.",
          steps: ["29.4 ≈ 30 and 6.8 ≈ 7 (1 significant figure).", "30 × 7 = 210.", "29.4 × 6.8 ≈ 210"],
        },
        {
          question: "Estimate (387 × 5.2) ÷ 0.19.",
          steps: ["387 ≈ 400, 5.2 ≈ 5, 0.19 ≈ 0.2.", "400 × 5 = 2000.", "2000 ÷ 0.2 = 20000 ÷ 2 = 10000"],
        },
      ],
    },
    counts: { guided: 4, independent: 5, check: 5 },
  },

  "num-error-intervals": {
    skillId: "num-error-intervals",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "If a parcel weighs 2.4 kg to 1 decimal place, it could really weigh anything from 2.35 kg up to just under 2.45 kg. Knowing the range matters for safety limits, measurements and engineering. Error intervals are a common grade 4 and 5 question.",
      byTheEnd: ["Find the lower and upper bounds of a rounded number.", "Write an error interval with ≤ and <.", "Write an error interval for a truncated number."],
    },
    teaching: {
      paragraphs: [
        "When a number has been rounded, the real value could be a bit more or a bit less. The smallest it could be is the lower bound; the largest is the upper bound.",
        "The bounds are half a unit either side. 7.4 to 1 decimal place: the unit is 0.1, half of that is 0.05. Lower bound 7.4 − 0.05 = 7.35; upper bound 7.4 + 0.05 = 7.45.",
        "350 to the nearest 10: half of 10 is 5, so the bounds are 345 and 355.",
        "The error interval is written 7.35 ≤ x < 7.45. The lower bound is included (≤) because 7.35 rounds up to 7.4. The upper bound isn't included (<) because 7.45 would round up to 7.5.",
        "Truncating means chopping off digits without rounding. If x truncated to 1 decimal place is 4.6, x could be 4.6, 4.63, 4.699..., so 4.6 ≤ x < 4.7.",
      ],
      demo: "error-interval-line",
      examples: [
        {
          question: "A length is 12.6 cm to 1 decimal place. Write the error interval for the length L.",
          steps: ["Half of 0.1 is 0.05.", "Lower bound 12.6 − 0.05 = 12.55. Upper bound 12.6 + 0.05 = 12.65.", "12.55 ≤ L < 12.65"],
        },
        {
          question: "A crowd is 2400 people to the nearest 100. What is the smallest the crowd could be?",
          steps: ["Rounded to the nearest 100, so half a unit is 50.", "2400 − 50 = 2350.", "The lower bound is 2350 people."],
        },
      ],
    },
    counts: { guided: 4, independent: 5, check: 5 },
  },

  "num-listing": {
    skillId: "num-listing",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "How many outfits can you make from 3 tops and 4 pairs of jeans? How many codes can a lock have? Listing things in an organised way means you never miss one or count one twice. It also leads straight into probability.",
      byTheEnd: ["List combinations systematically.", "Count combinations by multiplying.", "Count arrangements where each item is used only once."],
    },
    teaching: {
      paragraphs: [
        "A systematic list follows a pattern. For meals from 3 starters (S1, S2, S3) and 2 mains (M1, M2): S1 M1, S1 M2, S2 M1, S2 M2, S3 M1, S3 M2. Fix the first choice, run through every second choice, then move on.",
        "You can count without listing: each of the 3 starters goes with each of the 2 mains, so 3 × 2 = 6 meals. This is the product rule: multiply the number of choices.",
        "With three lists, multiply all three. 3 starters, 4 mains and 2 desserts give 3 × 4 × 2 = 24 meals.",
        "Arranging things in order, each used once: 3 people in a line. 3 choices for first place, then 2 left for second, then 1 for third: 3 × 2 × 1 = 6 orders.",
        "Watch out for pairs where order doesn't matter. A game between A and B is the same game as B and A, so count it once.",
      ],
      demo: "listing-grid",
      examples: [
        {
          question: "A shop sells 4 flavours of ice cream and 3 toppings. How many choices of one flavour and one topping are there?",
          steps: ["Each of the 4 flavours goes with each of the 3 toppings.", "4 × 3 = 12", "12 choices"],
        },
        {
          question: "How many different orders can the letters A, B and C go in?",
          steps: ["Systematic list: ABC, ACB, BAC, BCA, CAB, CBA.", "Or: 3 × 2 × 1 = 6.", "6 orders"],
        },
      ],
    },
    counts: { guided: 4, independent: 5, check: 5 },
  },

  "num-standard-form-calc": {
    skillId: "num-standard-form-calc",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Scientists multiply huge and tiny numbers all the time: the distance light travels in a year, the mass of a cell. Standard form makes these calculations quick, because you deal with the small numbers and the powers of 10 separately.",
      byTheEnd: ["Multiply and divide numbers in standard form.", "Tidy an answer back into standard form.", "Add and subtract numbers in standard form."],
    },
    teaching: {
      paragraphs: [
        "To multiply, multiply the first numbers and add the powers. (3 × 10⁴) × (2 × 10³) = (3 × 2) × 10⁴⁺³ = 6 × 10⁷.",
        "To divide, divide the first numbers and subtract the powers. (8 × 10⁹) ÷ (2 × 10³) = 4 × 10⁶.",
        "Sometimes the first number ends up outside 1 to 10, so tidy it. (4 × 10⁵) × (3 × 10²) = 12 × 10⁷. 12 = 1.2 × 10¹, so the answer is 1.2 × 10⁸. The first number got 10 times smaller, so the power goes up by 1.",
        "If the first number is less than 1, like 0.5 × 10³, make it 5 × 10²: the first number got 10 times bigger, so the power goes down by 1.",
        "To add or subtract, the powers must match. The safe way is to write both as ordinary numbers: 3.2 × 10⁴ + 5 × 10³ = 32000 + 5000 = 37000 = 3.7 × 10⁴.",
      ],
      demo: "sf-multiply",
      examples: [
        {
          question: "Work out (5 × 10⁶) × (3 × 10²). Give your answer in standard form.",
          steps: ["5 × 3 = 15 and 10⁶ × 10² = 10⁸.", "15 × 10⁸ = 1.5 × 10¹ × 10⁸.", "1.5 × 10⁹"],
        },
        {
          question: "Work out (6 × 10⁸) ÷ (3 × 10⁵).",
          steps: ["6 ÷ 3 = 2.", "10⁸ ÷ 10⁵ = 10³ (subtract the powers).", "2 × 10³"],
        },
      ],
    },
    counts: { guided: 4, independent: 5, check: 5 },
  },
};
