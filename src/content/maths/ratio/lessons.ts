/**
 * Lesson content for the ratio and proportion chain (six stages, like every
 * chain). Practice and check questions come from generators.ts.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher before Verified.
 */

import type { Lesson } from "@/content/lesson-types";
import type { SkillId } from "@/engine/types";

export const RATIO_LESSONS: Record<SkillId, Lesson> = {
  "ratio-fraction-of-another": {
    skillId: "ratio-fraction-of-another",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "\"What fraction of my day is spent asleep?\" \"What fraction of the test did I get right?\" Writing one amount as a fraction of another is how we compare a part with the whole. It's also the first step into ratio and percentages.",
      byTheEnd: ["Write a part as a fraction of a whole.", "Simplify the fraction.", "Make the units match before you compare."],
    },
    teaching: {
      paragraphs: [
        "To write one amount as a fraction of another, put the part on top and the whole on the bottom.",
        "If 6 out of 15 students walk to school, the fraction that walk is 6/15. Then simplify: 6 and 15 both divide by 3, so 6/15 = 2/5.",
        "The words \"A as a fraction of B\" tell you the order: A on top, B on the bottom.",
        "Both amounts must be in the same units. To write 20 minutes as a fraction of 1 hour, change the hour into minutes first: 20/60 = 1/3. Useful facts: 1 hour = 60 minutes, 1 m = 100 cm, 1 kg = 1000 g, £1 = 100p.",
      ],
      demo: "fraction-of-whole",
      examples: [
        {
          question: "A bag holds 24 sweets. 9 of them are red. What fraction of the sweets are red?",
          steps: ["Part on top, whole on the bottom: 9/24.", "9 and 24 both divide by 3.", "9/24 = 3/8"],
        },
        {
          question: "Write 45 cm as a fraction of 2 m.",
          steps: ["Make the units the same: 2 m = 200 cm.", "As a fraction: 45/200.", "Both divide by 5: 45/200 = 9/40"],
        },
      ],
    },
    counts: { guided: 4, independent: 4, check: 5 },
  },

  "ratio-simplify": {
    skillId: "ratio-simplify",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "A ratio compares one amount with another: 2 scoops of squash to 5 of water, 3 boys to 4 girls. Simplifying a ratio makes it easier to see the relationship, and it's the starting point for every ratio question.",
      byTheEnd: ["Write a ratio in the order the words say.", "Simplify a ratio by dividing every part by the same number.", "Simplify ratios with three parts or different units."],
    },
    teaching: {
      paragraphs: [
        "A ratio compares parts. If a club has 8 girls and 12 boys, the ratio of girls to boys is 8:12. We say \"8 to 12\".",
        "Order matters. \"Girls to boys\" is 8:12, but \"boys to girls\" is 12:8. Always follow the order of the words.",
        "To simplify, divide every part by the same number, just like simplifying a fraction. 8 and 12 both divide by 4, so 8:12 = 2:3. For every 2 girls there are 3 boys.",
        "A ratio is in its simplest form when the only number that divides all the parts is 1. With three parts, like 6:9:15, divide all three by the same number: 6:9:15 = 2:3:5.",
        "If the units are different, change them to the same unit first. 50 cm : 2 m becomes 50 cm : 200 cm, which is 50:200 = 1:4.",
      ],
      demo: "ratio-groups",
      examples: [
        {
          question: "Write 18:24 in its simplest form.",
          steps: ["Find the biggest number that divides 18 and 24: it's 6.", "18 ÷ 6 = 3 and 24 ÷ 6 = 4.", "18:24 = 3:4"],
        },
        {
          question: "There are 15 cats and 10 dogs at a shelter. Write the ratio of dogs to cats in its simplest form.",
          steps: ["Dogs first, because the words say \"dogs to cats\": 10:15.", "Both divide by 5.", "10:15 = 2:3"],
        },
        {
          question: "Write 300 g : 2 kg in its simplest form.",
          steps: ["Same units: 2 kg = 2000 g, so 300:2000.", "Both divide by 100: 3:20.", "3 and 20 have no common factor, so 3:20 is simplest."],
        },
      ],
    },
    counts: { guided: 4, independent: 5, check: 5 },
  },

  "ratio-share": {
    skillId: "ratio-share",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Sharing money, mixing paint, splitting a bill fairly when people ordered different amounts: all of these share an amount in a ratio. It's one of the most common GCSE questions.",
      byTheEnd: ["Share an amount in a ratio using a bar model.", "Find the value of one part.", "Solve questions where you know one share or the difference."],
    },
    teaching: {
      paragraphs: [
        "To share £40 in the ratio 3:5, draw a bar split into 3 + 5 = 8 equal boxes. The first person gets 3 boxes and the second gets 5.",
        "The whole bar is £40, so one box is £40 ÷ 8 = £5. That's the value of one part.",
        "Now multiply: the first person gets 3 × £5 = £15 and the second gets 5 × £5 = £25. Check: £15 + £25 = £40.",
        "Sometimes you know one person's share instead of the total. If the first person's 3 parts are £12, then one part is £12 ÷ 3 = £4. Every question comes back to the same step: find one part.",
      ],
      demo: "ratio-bar-model",
      examples: [
        {
          question: "Amy and Ben share £36 in the ratio 4:5. How much does Ben get?",
          steps: ["Total parts: 4 + 5 = 9.", "One part: £36 ÷ 9 = £4.", "Ben gets 5 parts: 5 × £4 = £20"],
        },
        {
          question: "Chloe and Dev share sweets in the ratio 2:7. Dev gets 25 more sweets than Chloe. How many does Chloe get?",
          steps: ["The difference is 7 − 2 = 5 parts.", "5 parts = 25 sweets, so one part = 5 sweets.", "Chloe gets 2 parts: 2 × 5 = 10 sweets"],
        },
      ],
    },
    counts: { guided: 4, independent: 5, check: 5 },
  },

  "ratio-fractions": {
    skillId: "ratio-fractions",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "Ratios and fractions describe the same thing in two ways. Exam questions often give you one and ask about the other, so being able to switch between them unlocks lots of marks.",
      byTheEnd: ["Turn a ratio into fractions of the whole.", "Turn a fraction into a ratio.", "Use one group's size to find the total."],
    },
    teaching: {
      paragraphs: [
        "A ratio compares part with part. A fraction compares part with the whole.",
        "If red to blue counters are 3:5, there are 3 + 5 = 8 parts altogether. So 3/8 of the counters are red and 5/8 are blue.",
        "The common mistake is writing 3/5. That compares red with blue, not red with all the counters. Always add the parts to get the bottom number.",
        "Going the other way: if 2/7 of a class are boys, then 7 − 2 = 5 parts are girls. So boys : girls = 2:5.",
      ],
      demo: "ratio-fraction-link",
      examples: [
        {
          question: "The ratio of adults to children at a cinema is 4:5. What fraction of the people are children?",
          steps: ["Total parts: 4 + 5 = 9.", "Children are 5 of the 9 parts.", "5/9 of the people are children"],
        },
        {
          question: "3/10 of the animals at a rescue centre are cats. The rest are dogs. Write the ratio of cats to dogs.",
          steps: ["Think of 10 equal parts. 3 are cats.", "Dogs: 10 − 3 = 7 parts.", "cats : dogs = 3:7"],
        },
      ],
    },
    counts: { guided: 4, independent: 4, check: 5 },
  },

  "ratio-unitary-method": {
    skillId: "ratio-unitary-method",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Changing a recipe for more people, working out the price of a different number of things, finding the better deal in a shop. The unitary method solves all of these with one idea: find the value of one first.",
      byTheEnd: ["Scale a recipe up or down.", "Work out the cost of a different number of items.", "Compare prices to find the best buy."],
    },
    teaching: {
      paragraphs: [
        "\"Unitary\" means \"to do with one\". The method has two steps: divide to find the value of 1, then multiply to find the value you want.",
        "A recipe for 4 people uses 300 g of flour. For 1 person: 300 ÷ 4 = 75 g. For 6 people: 75 × 6 = 450 g.",
        "Don't add. Going from 4 people to 6 people does not mean adding 2 g. Every amount grows in proportion, so you multiply.",
        "To find the best buy, compare the same amount of each. Work out the price of 1 item, or of 100 g, for each pack. The lower price is better value. Working in pence often makes the numbers easier.",
      ],
      demo: "recipe-scale",
      examples: [
        {
          question: "5 notebooks cost £3.50. How much do 8 notebooks cost?",
          steps: ["Work in pence: £3.50 = 350p.", "1 notebook: 350 ÷ 5 = 70p.", "8 notebooks: 70 × 8 = 560p = £5.60"],
        },
        {
          question: "A 300 g box of cereal costs £1.80. A 500 g box costs £2.50. Which is better value?",
          steps: ["300 g box: 180p ÷ 3 = 60p per 100 g.", "500 g box: 250p ÷ 5 = 50p per 100 g.", "The 500 g box is better value, at 50p per 100 g."],
        },
      ],
    },
    counts: { guided: 4, independent: 5, check: 5 },
  },

  "ratio-direct-proportion": {
    skillId: "ratio-direct-proportion",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "When one thing doubles and the other doubles too, they are in direct proportion. Pay and hours worked, cost and weight, pounds and euros. Spotting it lets you solve the problem in two steps, and read it straight off a graph.",
      byTheEnd: ["Recognise direct proportion.", "Solve direct proportion problems, including exchange rates.", "Know that a direct proportion graph is a straight line through (0, 0)."],
    },
    teaching: {
      paragraphs: [
        "Two amounts are in direct proportion when one is always the same number times the other. If 1 kg of apples costs £2, then 3 kg cost £6 and 5 kg cost £10. Cost = 2 × weight.",
        "To solve a problem, find the multiplier (the value of 1) and use it. If 4 hours of work pays £36, then 1 hour pays £9, so 7 hours pays £63.",
        "Exchange rates work the same way. If £1 = 1.20 euros, then £50 = 50 × 1.20 = 60 euros. Going back from euros to pounds, you divide by 1.20.",
        "On a graph, direct proportion is always a straight line that goes through (0, 0). Zero kilograms cost zero pounds. A straight line that doesn't go through (0, 0) is not direct proportion.",
      ],
      demo: "proportion-graph",
      examples: [
        {
          question: "3 litres of paint cover 36 m² of wall. How many m² do 5 litres cover?",
          steps: ["1 litre covers 36 ÷ 3 = 12 m².", "5 litres cover 12 × 5 = 60 m².", "Answer: 60 m²"],
        },
        {
          question: "The exchange rate is £1 = 1.15 euros. Change 69 euros into pounds.",
          steps: ["Euros to pounds means dividing by 1.15.", "69 ÷ 1.15 = 60.", "Answer: £60"],
        },
      ],
    },
    counts: { guided: 4, independent: 5, check: 5 },
  },
};
