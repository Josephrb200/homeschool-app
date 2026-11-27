/**
 * Lesson content for the probability chain (six stages, like every chain).
 * Practice and check questions come from generators.ts.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher before Verified.
 */

import type { Lesson } from "@/content/lesson-types";
import type { SkillId } from "@/engine/types";

export const PROBABILITY_LESSONS: Record<SkillId, Lesson> = {
  "prob-scale": {
    skillId: "prob-scale",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "Weather forecasts, games, medicine trials and insurance all talk about how likely things are. Probability gives us a number for \"how likely\", so we can compare chances fairly instead of guessing.",
      byTheEnd: [
        "Use the words impossible, unlikely, even chance, likely and certain correctly.",
        "Know that every probability is between 0 and 1.",
        "Compare probabilities written as fractions, decimals and percentages.",
      ],
    },
    teaching: {
      paragraphs: [
        "Probability measures how likely something is to happen. We put it on a scale from 0 to 1.",
        "0 means impossible: it can never happen, like rolling a 7 on an ordinary dice. 1 means certain: it must happen, like the day after Monday being Tuesday.",
        "Exactly halfway, 1/2, is an even chance: a 50-50 chance, like a coin landing on heads.",
        "Between 0 and 1/2 is unlikely: it could happen, but it probably won't. Between 1/2 and 1 is likely: it probably will happen, but it doesn't have to.",
        "A probability can be written as a fraction, a decimal or a percentage: 1/4, 0.25 and 25% are the same. It can never be less than 0 or more than 1 (100%).",
      ],
      demo: "probability-scale",
      examples: [
        {
          question: "A bag has 2 red counters and 6 blue counters. One is taken without looking. How likely is it to be red?",
          steps: ["2 out of the 8 counters are red.", "That's fewer than half.", "So red is unlikely."],
        },
        {
          question: "Event A has probability 0.4 and event B has probability 3/5. Which is more likely?",
          steps: ["Change them to the same form. 3/5 = 6/10 = 0.6.", "0.6 is bigger than 0.4.", "So event B is more likely."],
        },
      ],
    },
    counts: { guided: 5, independent: 4, check: 5 },
  },

  "prob-single-event": {
    skillId: "prob-single-event",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "If you know all the possible outcomes, you can work out an exact probability without doing any experiment. This is the most common probability question at GCSE, and everything else in probability builds on it.",
      byTheEnd: [
        "Count the total number of equally likely outcomes.",
        "Count the outcomes you want.",
        "Write the probability as a fraction, decimal or percentage.",
      ],
    },
    teaching: {
      paragraphs: [
        "When every outcome is equally likely, the probability of an event is: the number of ways it can happen, out of the total number of outcomes.",
        "We write P(red) to mean \"the probability of getting red\".",
        "A bag has 3 red and 5 blue counters. There are 3 + 5 = 8 counters, and 3 are red. So P(red) = 3/8.",
        "The bottom number is always the total, including the outcomes you want. A common slip is to write 3/5 (red over blue), but blue isn't the total.",
        "Count every item separately. A spinner with 3 red sections and 1 blue section is not a 50-50 chance, even though there are only two colours: P(red) = 3/4.",
        "You don't have to simplify. 6/36 and 1/6 are both correct, and so are 0.25 and 25%.",
      ],
      demo: "counter-bag",
      examples: [
        {
          question: "A fair dice is rolled. What is the probability of getting a number bigger than 4?",
          steps: ["The outcomes are 1, 2, 3, 4, 5, 6: 6 altogether.", "5 and 6 are bigger than 4: 2 ways.", "P(bigger than 4) = 2/6 (or 1/3)."],
        },
        {
          question: "A spinner has 5 equal sections: red, red, blue, green, red. What is P(red)?",
          visual: { kind: "spinner", spinner: { sections: ["red", "red", "blue", "green", "red"], description: "A spinner with 5 equal sections: red, red, blue, green, red." } },
          steps: ["There are 5 equal sections.", "3 of them are red.", "P(red) = 3/5"],
        },
        {
          question: "The letters of the word BANANA are put on cards. One card is picked. What is P(A)?",
          steps: ["BANANA has 6 letters, so 6 cards.", "A appears 3 times.", "P(A) = 3/6 (or 1/2)."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "prob-sum-to-one": {
    skillId: "prob-sum-to-one",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "One of the simplest facts in probability is also one of the most useful: something always happens. That means if you know the chance of rain, you know the chance of no rain, and if one number is missing from a table you can find it.",
      byTheEnd: [
        "Find the probability of something not happening.",
        "Find a missing probability in a table.",
        "Share what's left between outcomes that are equally likely.",
      ],
    },
    teaching: {
      paragraphs: [
        "The probabilities of all the possible outcomes add up to 1.",
        "Something either happens or it doesn't. So P(not A) = 1 − P(A). If the chance of rain is 0.3, the chance of no rain is 1 − 0.3 = 0.7.",
        "With fractions, write 1 with the same bottom number. If P(late) = 2/7, then P(not late) = 7/7 − 2/7 = 5/7.",
        "In a table of probabilities with one missing, add the ones you know and take the total away from 1.",
        "Check your answer: everything should add back up to exactly 1.",
      ],
      demo: "probability-bar",
      examples: [
        {
          question: "A spinner lands on red, blue or green. P(red) = 0.2 and P(blue) = 0.45. Find P(green).",
          visual: { kind: "table", table: { corner: "Outcome", columns: ["red", "blue", "green"], rows: [{ head: "Probability", cells: ["0.2", "0.45", "?"] }], description: "Probability table: red 0.2, blue 0.45, green unknown." } },
          steps: ["Add the ones you know: 0.2 + 0.45 = 0.65.", "Take it away from 1: 1 − 0.65 = 0.35.", "P(green) = 0.35"],
        },
        {
          question: "P(red) = 0.4, P(blue) = 0.3. Yellow and green are equally likely. Find P(yellow).",
          steps: ["0.4 + 0.3 = 0.7, so 1 − 0.7 = 0.3 is left.", "Yellow and green share it equally.", "P(yellow) = 0.3 ÷ 2 = 0.15"],
        },
      ],
    },
    counts: { guided: 5, independent: 4, check: 5 },
  },

  "prob-relative-frequency": {
    skillId: "prob-relative-frequency",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Sometimes you can't work out a probability by counting, like the chance of a drawing pin landing point up. Instead you do an experiment and use the results. Probability also lets you predict: how many times should you expect a six in 60 rolls?",
      byTheEnd: [
        "Work out a relative frequency from experiment results.",
        "Know that more trials give a more reliable estimate.",
        "Work out how many times you'd expect something to happen.",
      ],
    },
    teaching: {
      paragraphs: [
        "Relative frequency = the number of times something happened ÷ the total number of trials.",
        "If a drawing pin lands point up 18 times out of 50 drops, the relative frequency is 18/50 (or 0.36).",
        "Relative frequency is an estimate of the probability. The more trials you do, the more reliable the estimate. Try it in the demo below: a few rolls jump around, lots of rolls settle down.",
        "Expected number = probability × number of trials. If P(red) = 0.3 and you spin 200 times, you'd expect 0.3 × 200 = 60 reds.",
        "\"Expected\" means about that many. You might not get exactly 60, but it's the best prediction.",
      ],
      demo: "experiment-trials",
      examples: [
        {
          question: "A dice is rolled 40 times and lands on 6 a total of 9 times. What is the relative frequency of a 6?",
          steps: ["Times it happened: 9.", "Number of trials: 40.", "Relative frequency = 9/40 (or 0.225)."],
        },
        {
          question: "The probability a biased spinner lands on blue is 2/5. It is spun 150 times. How many blues would you expect?",
          steps: ["Expected number = 2/5 × 150.", "150 ÷ 5 = 30, then 30 × 2 = 60.", "Expect about 60 blues."],
        },
      ],
    },
    counts: { guided: 5, independent: 4, check: 5 },
  },

  "prob-sample-space": {
    skillId: "prob-sample-space",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Lots of games use two dice, or a dice and a spinner. To find probabilities for two things at once, you need to see every possible outcome. A sample space diagram is a grid that shows them all, so nothing gets missed.",
      byTheEnd: [
        "List all the outcomes of two events in an organised way.",
        "Use a sample space diagram to find a probability.",
        "Count combinations by multiplying.",
      ],
    },
    teaching: {
      paragraphs: [
        "A sample space is the list of every possible outcome. For two events, a grid is the best way to show it: one event down the side, the other across the top.",
        "Two dice give a 6 by 6 grid, so 6 × 6 = 36 outcomes. Each cell is equally likely.",
        "To find a probability, count the cells you want, and put that over the total number of cells. A total of 7 appears in 6 cells, so P(total 7) = 6/36.",
        "Not every total is equally likely! A total of 2 can only happen one way (1 and 1), but 7 can happen six ways.",
        "To count outcomes without drawing the grid, multiply: 4 tops and 3 pairs of trousers make 4 × 3 = 12 outfits.",
      ],
      demo: "sample-space-grid",
      examples: [
        {
          question: "A spinner numbered 1 to 3 is spun and a coin is flipped. List all the outcomes.",
          steps: ["Go through each number with each side of the coin.", "1H, 1T, 2H, 2T, 3H, 3T", "That's 3 × 2 = 6 outcomes."],
        },
        {
          question: "Two spinners, each numbered 1 to 3, are spun and the scores added. What is P(total = 4)?",
          visual: {
            kind: "table",
            table: {
              corner: "+",
              columns: ["1", "2", "3"],
              rows: [
                { head: "1", cells: ["2", "3", "4"] },
                { head: "2", cells: ["3", "4", "5"] },
                { head: "3", cells: ["4", "5", "6"] },
              ],
              highlight: [[0, 2], [1, 1], [2, 0]],
              description: "Sample space of two spinners numbered 1 to 3, added. The three cells with a total of 4 are highlighted.",
            },
          },
          steps: ["The grid has 3 × 3 = 9 cells.", "A total of 4 appears 3 times.", "P(total = 4) = 3/9 (or 1/3)."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "prob-frequency-trees": {
    skillId: "prob-frequency-trees",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "A frequency tree is a tidy way to sort a group of people (or things) in two steps, like adults and children, then who bought popcorn. GCSE questions often give you the facts in words and ask you to build the tree yourself.",
      byTheEnd: ["Fill in a frequency tree from the facts in a question.", "Find missing numbers by adding and taking away.", "Use the tree to find a probability or a fraction."],
    },
    teaching: {
      paragraphs: [
        "A frequency tree starts with everyone in one box. The first branches split them into two groups. Then each group splits again.",
        "The key rule: the two boxes after a box always add up to that box. So if 60 people split into adults and children, adults + children = 60.",
        "To find a missing box, take the other box away from the one before it.",
        "When a question is in words, draw the tree first. Put in every number you're given, then fill in the gaps one at a time.",
        "For a probability, check who you're choosing from. One person from everyone: put the starting number on the bottom. \"Of the people who bought popcorn\": add up both popcorn boxes and put that on the bottom.",
      ],
      demo: "frequency-tree-fill",
      examples: [
        {
          question: "60 people went to the cinema. 25 were adults. 15 of the adults bought popcorn. 20 of the children bought popcorn. How many people did not buy popcorn?",
          steps: [
            "Children: 60 − 25 = 35.",
            "Adults with no popcorn: 25 − 15 = 10. Children with no popcorn: 35 − 20 = 15.",
            "No popcorn altogether: 10 + 15 = 25.",
          ],
          visual: {
            kind: "tree",
            tree: {
              root: "60",
              stages: ["Age", "Bought popcorn?"],
              branches: [
                { label: "Adults", count: "25", children: [{ label: "Popcorn", count: "15" }, { label: "No popcorn", count: "10" }] },
                { label: "Children", count: "35", children: [{ label: "Popcorn", count: "20" }, { label: "No popcorn", count: "15" }] },
              ],
              highlight: [1, 3],
              description: "Frequency tree. 60 people: 25 adults (15 popcorn, 10 no popcorn) and 35 children (20 popcorn, 15 no popcorn).",
            },
          },
        },
        {
          question: "Using the same tree, one person is chosen at random. What is the probability that they are a child who bought popcorn?",
          steps: ["Children who bought popcorn: 20.", "Chosen from everyone: 60.", "P = 20/60 (which simplifies to 1/3)."],
        },
      ],
    },
    counts: { guided: 4, independent: 5, check: 5 },
  },

  "prob-venn": {
    skillId: "prob-venn",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "When things can belong to two groups at once, like people who play football and tennis, a Venn diagram sorts them so nobody is counted twice. GCSE papers ask you to read them, fill them in, and use the symbols ∩ and ∪.",
      byTheEnd: [
        "Read the four regions of a Venn diagram.",
        "Fill in a Venn diagram, starting with the overlap.",
        "Use ∩ (and) and ∪ (or), and find probabilities from a Venn diagram.",
      ],
    },
    teaching: {
      paragraphs: [
        "A Venn diagram has a rectangle for everything, written ξ, and a circle for each group.",
        "There are four regions: in A only, in B only, in both (the overlap), and in neither (outside the circles, but still inside the rectangle).",
        "Everything inside circle A is in A, including the overlap. So the number in A is \"A only\" + \"both\".",
        "To fill one in, always start with the overlap. If 18 play football, 12 play tennis and 5 play both, put 5 in the middle. Then football only is 18 − 5 = 13, and tennis only is 12 − 5 = 7.",
        "A ∩ B (\"A and B\") means in both: just the overlap. A ∪ B (\"A or B\") means in either circle, including the overlap. Tip: ∪ looks like a cup that holds everything.",
        "For a probability, put the number in the region over the total of all four regions.",
      ],
      demo: "venn-sort",
      examples: [
        {
          question: "The Venn diagram shows 30 students. How many play football? What is P(plays both)?",
          visual: { kind: "venn", venn: { a: "Football", b: "Tennis", onlyA: "13", both: "5", onlyB: "7", neither: "5", description: "Football only 13, both 5, tennis only 7, neither 5." } },
          steps: ["Football circle: 13 + 5 = 18 play football.", "Total: 13 + 5 + 7 + 5 = 30.", "P(both) = 5/30 (or 1/6)."],
        },
        {
          question: "Using the same diagram, how many are in A ∪ B, if A = football and B = tennis?",
          steps: ["∪ means in either circle.", "13 + 5 + 7 = 25", "So 25 are in A ∪ B."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "prob-tree-independent": {
    skillId: "prob-tree-independent",
    status: "draft",
    minutes: 30,
    intro: {
      whyItMatters:
        "What's the chance of two things both happening, like passing two tests, or getting two reds in a row? A tree diagram shows every possible route, so you can work it out step by step instead of guessing.",
      byTheEnd: ["Fill in the probabilities on a tree diagram.", "Multiply along the branches to find the chance of a route.", "Add routes together for questions like \"one of each\" or \"at least one\"."],
    },
    teaching: {
      paragraphs: [
        "A tree diagram has one set of branches for each event. Write the probability on each branch.",
        "The branches coming out of one point always add up to 1. So if P(red) is 3/5, the other branch is 1 − 3/5 = 2/5.",
        "Independent means the first result doesn't change the second. If a counter is put back, the second set of branches is the same as the first.",
        "To find the chance of one route (this AND then that), multiply along the branches. For fractions, multiply the tops and multiply the bottoms.",
        "If more than one route works (like red then blue, OR blue then red), work out each route, then add them.",
        "\"At least one\" means every route except \"none\". The quick way: 1 − P(none).",
      ],
      demo: "tree-multiply",
      examples: [
        {
          question: "A bag has 3 red and 2 blue counters. A counter is taken, put back, then a second is taken. Find P(both red) and P(one of each colour).",
          steps: [
            "Both red: 3/5 × 3/5 = 9/25.",
            "Red then blue: 3/5 × 2/5 = 6/25. Blue then red: 2/5 × 3/5 = 6/25.",
            "One of each: 6/25 + 6/25 = 12/25.",
          ],
          visual: {
            kind: "tree",
            tree: {
              stages: ["First counter", "Second counter"],
              branches: [
                { label: "Red", p: "3/5", children: [{ label: "Red", p: "3/5", end: "Red, Red" }, { label: "Blue", p: "2/5", end: "Red, Blue" }] },
                { label: "Blue", p: "2/5", children: [{ label: "Red", p: "3/5", end: "Blue, Red" }, { label: "Blue", p: "2/5", end: "Blue, Blue" }] },
              ],
              highlight: [0],
              description: "Tree diagram. First counter: Red 3/5, Blue 2/5. Second counter, after either colour: Red 3/5, Blue 2/5.",
            },
          },
        },
        {
          question: "The probability Cara passes her theory test is 0.8 and her practical test is 0.7. Find the probability she passes at least one test.",
          steps: ["Fail both: 0.2 × 0.3 = 0.06.", "Every other route passes at least one test.", "1 − 0.06 = 0.94."],
        },
      ],
    },
    counts: { guided: 4, independent: 5, check: 5 },
  },
  "prob-tree-dependent": {
    skillId: "prob-tree-dependent",
    status: "draft",
    minutes: 30,
    intro: {
      whyItMatters:
        "Lots of real choices happen without putting things back: picking two people for a team, or eating sweets from a bag. The second probability changes because of the first. This is one of the harder Foundation questions, and it uses everything from the last lesson.",
      byTheEnd: ["Change the second branches when the first item isn't put back.", "Multiply along the branches for one route.", "Add routes for \"one of each\", \"the same\" and \"at least one\"."],
    },
    teaching: {
      paragraphs: [
        "Without replacement means the first item is not put back. So for the second pick there is one fewer altogether: the bottom of every second-branch fraction goes down by 1.",
        "If the first item was red, there is one fewer red left, so the top of the \"red again\" branch goes down by 1 too. The other colour's top stays the same.",
        "Example: 5 red and 3 blue (8 altogether). After a red: 4 red and 3 blue are left, out of 7. So the branches are 4/7 and 3/7.",
        "Check: the branches from each point still add up to 1 (4/7 + 3/7 = 7/7).",
        "Then everything works as before: multiply along a route, and add routes when more than one works.",
      ],
      demo: "tree-without-replacement",
      examples: [
        {
          question: "A bag has 5 red and 3 blue counters. Two are taken without replacement. Find the probability that both are red.",
          steps: ["First red: 5/8.", "Second red, after a red: 4 reds left out of 7, so 4/7.", "5/8 × 4/7 = 20/56 (which simplifies to 5/14)."],
          visual: {
            kind: "tree",
            tree: {
              stages: ["First counter", "Second counter"],
              branches: [
                { label: "Red", p: "5/8", children: [{ label: "Red", p: "4/7", end: "Red, Red" }, { label: "Blue", p: "3/7", end: "Red, Blue" }] },
                { label: "Blue", p: "3/8", children: [{ label: "Red", p: "5/7", end: "Blue, Red" }, { label: "Blue", p: "2/7", end: "Blue, Blue" }] },
              ],
              highlight: [0],
              description: "Tree diagram without replacement. First: Red 5/8, Blue 3/8. After Red: Red 4/7, Blue 3/7. After Blue: Red 5/7, Blue 2/7.",
            },
          },
        },
        {
          question: "Using the same bag, find the probability of one red and one blue.",
          steps: ["Red then blue: 5/8 × 3/7 = 15/56.", "Blue then red: 3/8 × 5/7 = 15/56.", "Add: 15/56 + 15/56 = 30/56 (which simplifies to 15/28)."],
        },
      ],
    },
    counts: { guided: 4, independent: 5, check: 5 },
  },
};
