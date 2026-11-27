/**
 * Lesson content for the statistics chain (six stages, like every chain).
 * Practice and check questions come from generators.ts.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher before Verified.
 */

import type { Lesson } from "@/content/lesson-types";
import type { SkillId } from "@/engine/types";

export const STATS_LESSONS: Record<SkillId, Lesson> = {
  "stats-frequency-tables": {
    skillId: "stats-frequency-tables",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "Before you can draw a chart or work out an average, you need to collect and count your data. Tally charts make counting quick and hard to get wrong, and a frequency table is where almost every statistics question starts.",
      byTheEnd: ["Read and make tally marks, counting in fives.", "Read a frequency table and find the total frequency.", "Find a missing frequency when you know the total."],
    },
    teaching: {
      paragraphs: [
        "A tally is a quick way to count. Draw one line for each thing you count. The fifth line goes across the other four, making a \"gate\". A gate always stands for 5.",
        "To read a tally, count the gates in fives, then add the single lines. Two gates and three lines is 5 + 5 + 3 = 13.",
        "Frequency means \"how many\". A frequency table lists each category with its frequency, written as a number.",
        "The total frequency is all the frequencies added together. It tells you how many things were counted altogether.",
        "If one frequency is missing but you know the total, add the frequencies you know and take that away from the total.",
      ],
      demo: "tally-counter",
      examples: [
        {
          question: "A tally for Dog shows 3 gates and 2 single lines. What is the frequency?",
          steps: ["Each gate is 5: 3 × 5 = 15.", "Add the single lines: 15 + 2 = 17.", "The frequency is 17."],
          visual: { kind: "chart", chart: { type: "table", headers: ["Favourite pet", "Tally"], rows: [["Dog", 17]], tallyColumn: 1, description: "Tally for Dog: 3 gates of five and 2 single lines." } },
        },
        {
          question: "30 students were asked how they travel to school. Walk 9, Bus 7, Car ?, Bike 4. How many came by car?",
          steps: ["Add the frequencies you know: 9 + 7 + 4 = 20.", "Take that from the total: 30 − 20 = 10.", "10 students came by car."],
          visual: {
            kind: "chart",
            chart: { type: "table", headers: ["How they travel", "Frequency"], rows: [["Walk", 9], ["Bus", 7], ["Car", "?"], ["Bike", 4]], description: "Frequency table: Walk 9, Bus 7, Car missing, Bike 4." },
          },
        },
      ],
    },
    counts: { guided: 4, independent: 4, check: 5 },
  },

  "stats-bar-pictograms": {
    skillId: "stats-bar-pictograms",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "Charts let you see data at a glance: which is biggest, which is smallest, how they compare. News reports, school reports and exam papers are full of them. Reading the scale or the key carefully is the whole skill.",
      byTheEnd: ["Read a bar chart using its scale.", "Read a pictogram using its key, including half symbols.", "Compare and total values from a chart."],
    },
    teaching: {
      paragraphs: [
        "In a bar chart, the height of each bar shows its frequency. Read across from the top of the bar to the scale up the side.",
        "Always check the scale first. The numbered lines might go up in 1s, 2s, 5s or 10s. If a bar stops half-way between two lines, it's worth half a step more.",
        "A pictogram uses symbols instead of bars. The key tells you what one symbol stands for, for example \"one circle = 4 people\".",
        "Count the whole symbols and multiply by the key. Half a symbol is worth half the key: if one circle is 4, half a circle is 2.",
        "\"How many more\" means find the difference: subtract. \"Altogether\" means add.",
      ],
      demo: "bar-pictogram",
      examples: [
        {
          question: "The scale goes up in 2s. The Swimming bar stops half-way between 8 and 10. How many chose swimming?",
          steps: ["Half-way between 8 and 10 is 9.", "So 9 students chose swimming."],
          visual: {
            kind: "chart",
            chart: { type: "bar", categories: ["Football", "Swimming", "Tennis"], values: [12, 9, 6], xLabel: "Favourite sport", yLabel: "Number of students", yStep: 2, description: "Bar chart. The scale goes up in 2s. Football 12, Swimming 9, Tennis 6." },
          },
        },
        {
          question: "In the pictogram, one circle stands for 4 people. Apple has 3 circles and a half. How many people chose apple?",
          steps: ["3 whole circles: 3 × 4 = 12.", "Half a circle: 4 ÷ 2 = 2.", "12 + 2 = 14 people."],
          visual: {
            kind: "chart",
            chart: { type: "pictogram", categories: ["Apple", "Banana", "Grape"], values: [14, 8, 20], perSymbol: 4, unit: "people", description: "Pictogram. Key: one circle stands for 4 people. Apple: 3 circles and a half circle. Banana: 2 circles. Grape: 5 circles." },
          },
        },
      ],
    },
    counts: { guided: 4, independent: 5, check: 5 },
  },

  "stats-pie-charts": {
    skillId: "stats-pie-charts",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "A pie chart shows how a whole is split into parts, so you can see straight away which share is biggest. Drawing and reading them comes up in almost every GCSE Foundation paper.",
      byTheEnd: ["Find how many degrees stand for one item.", "Work out the angle for each sector.", "Read a frequency back from a pie chart, and find a missing angle."],
    },
    teaching: {
      paragraphs: [
        "A pie chart is a circle split into sectors. The whole circle stands for everyone in the data, and a full turn is 360°.",
        "Step 1: find the angle for one. Divide 360 by the total frequency. If 36 people were asked, each person gets 360 ÷ 36 = 10°.",
        "Step 2: multiply. If 8 people chose Bus, the Bus sector is 8 × 10° = 80°. Check that all your angles add up to 360°.",
        "To read a pie chart backwards, divide the angle by the degrees for one. If each person is 10° and a sector is 70°, that's 70 ÷ 10 = 7 people.",
        "The angles always add up to 360°, so a missing angle is 360 take away the others.",
      ],
      demo: "pie-builder",
      examples: [
        {
          question: "24 students chose their favourite fruit: Apple 6, Banana 10, Grape 8. Work out the angle for each fruit.",
          steps: ["One student: 360 ÷ 24 = 15°.", "Apple: 6 × 15 = 90°. Banana: 10 × 15 = 150°. Grape: 8 × 15 = 120°.", "Check: 90 + 150 + 120 = 360°."],
          visual: {
            kind: "chart",
            chart: { type: "pie", sectors: [{ label: "Apple", angle: 90 }, { label: "Banana", angle: 150 }, { label: "Grape", angle: 120 }], showAngles: true, description: "Pie chart. Apple 90 degrees, Banana 150 degrees, Grape 120 degrees." },
          },
        },
        {
          question: "A pie chart shows how 60 people travel to work. The Car sector is 120°. How many people travel by car?",
          steps: ["One person: 360 ÷ 60 = 6°.", "Car: 120 ÷ 6 = 20.", "20 people travel by car."],
        },
      ],
    },
    counts: { guided: 4, independent: 5, check: 5 },
  },

  "stats-averages": {
    skillId: "stats-averages",
    status: "draft",
    minutes: 30,
    intro: {
      whyItMatters:
        "An average is one number that sums up a whole set of data: a typical score, a usual shoe size. There are three kinds, and each is useful in a different way. The range tells you how spread out the data is.",
      byTheEnd: ["Find the mode, median and mean of a list.", "Find the range.", "Find a missing number when you know the mean."],
    },
    teaching: {
      paragraphs: [
        "The mode is the value that appears most often. (Mode sounds like \"most\".)",
        "The median is the middle value once the numbers are in order. Always put them in order first. If there are two middle numbers, the median is half-way between them: add them and divide by 2.",
        "The mean is what each would get if the total were shared out equally. Add all the numbers, then divide by how many there are.",
        "The range is the biggest value take away the smallest. It isn't an average: it tells you how spread out the data is.",
        "If you know the mean, you can find the total: mean × how many. That lets you find a missing number.",
      ],
      demo: "averages-explorer",
      examples: [
        {
          question: "Find the mode, median, mean and range of 7, 3, 9, 3, 8.",
          steps: [
            "In order: 3, 3, 7, 8, 9.",
            "Mode: 3 appears most often, so the mode is 3.",
            "Median: the middle of 5 numbers is the 3rd, which is 7.",
            "Mean: 3 + 3 + 7 + 8 + 9 = 30, and 30 ÷ 5 = 6.",
            "Range: 9 − 3 = 6.",
          ],
        },
        {
          question: "Find the median of 12, 5, 9, 14, 6, 10.",
          steps: ["In order: 5, 6, 9, 10, 12, 14.", "There are 6 numbers, so the middle two are 9 and 10.", "(9 + 10) ÷ 2 = 9.5. The median is 9.5."],
        },
        {
          question: "The mean of 4 numbers is 8. Three of them are 5, 9 and 10. What is the fourth?",
          steps: ["The total of all 4 is 4 × 8 = 32.", "The three you know add to 5 + 9 + 10 = 24.", "32 − 24 = 8. The fourth number is 8."],
        },
      ],
    },
    counts: { guided: 5, independent: 6, check: 5 },
  },

  "stats-frequency-table-averages": {
    skillId: "stats-frequency-table-averages",
    status: "draft",
    minutes: 30,
    intro: {
      whyItMatters:
        "When there's a lot of data, it's written in a frequency table instead of a long list. GCSE papers often ask for the mean, median or mode from a table like this, and it's easy to slip up if you don't know what the columns mean.",
      byTheEnd: ["Find the mode and range from a frequency table.", "Find the median by counting down the frequencies.", "Work out the mean using a value × frequency column."],
    },
    teaching: {
      paragraphs: [
        "A frequency table is a short way of writing a long list. If the row for 2 pets has frequency 5, that means five students each have 2 pets: 2, 2, 2, 2, 2.",
        "Mode: find the biggest frequency, then give the value in that row. The answer is the value, not the frequency.",
        "Range: biggest value take away smallest value. Ignore any row with a frequency of 0, because nobody had that value.",
        "Median: add up the frequencies to get the total, n. The middle position is (n + 1) ÷ 2. Count down the frequency column until you reach that position, and read off the value.",
        "Mean: add a third column, value × frequency. Its total is the sum of every result. Divide that by the total frequency (not by the number of rows).",
      ],
      demo: "freq-table-expand",
      examples: [
        {
          question: "The table shows the number of pets 15 students have. Find the mode, median and mean.",
          steps: [
            "Mode: the biggest frequency is 6, in the row for 1 pet. Mode = 1.",
            "Median: (15 + 1) ÷ 2 = 8th student. Running totals: 3 have 0 pets, then 3 + 6 = 9 have up to 1 pet. The 8th is in the 1 row, so median = 1.",
            "Mean: value × frequency is 0 × 3 = 0, 1 × 6 = 6, 2 × 4 = 8, 3 × 2 = 6. Total = 20.",
            "20 ÷ 15 = 1.333…, so the mean is 1.3 pets to 1 decimal place.",
          ],
          visual: {
            kind: "chart",
            chart: { type: "table", headers: ["Number of pets", "Frequency", "Pets × frequency"], rows: [[0, 3, 0], [1, 6, 6], [2, 4, 8], [3, 2, 6], ["Total", 15, 20]], description: "Frequency table. 0 pets: 3 students. 1 pet: 6. 2 pets: 4. 3 pets: 2. Total 15 students and 20 pets." },
          },
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "stats-scatter": {
    skillId: "stats-scatter",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Does more revision mean better scores? Do older cars cost less? A scatter graph lets you see whether two things are linked. Scientists, doctors and businesses use them all the time.",
      byTheEnd: ["Read the values of a point on a scatter graph.", "Describe the correlation as positive, negative or none.", "Spot an outlier that doesn't fit the pattern."],
    },
    teaching: {
      paragraphs: [
        "A scatter graph plots two measurements for each person or thing, one along the bottom and one up the side. Each cross is one person.",
        "To read a point, go straight down to the bottom axis and straight across to the side axis. Check what each axis goes up in.",
        "Look at the pattern from left to right. If the crosses go up, both things increase together: positive correlation.",
        "If the crosses go down, one increases as the other decreases: negative correlation. If there's no pattern at all, there is no correlation.",
        "An outlier is a point far away from the pattern of the others. It might be a mistake, or something unusual.",
        "Correlation shows a link, but it doesn't prove that one thing causes the other.",
      ],
      demo: "scatter-correlation",
      examples: [
        {
          question: "What type of correlation does this graph show?",
          steps: ["Read from left to right: as the hours of revision go up, the test scores go up too.", "So it shows positive correlation."],
          visual: {
            kind: "chart",
            chart: {
              type: "scatter",
              points: [[1, 10], [2, 15], [3, 15], [4, 25], [5, 25], [6, 30], [7, 40], [8, 40], [9, 45]],
              xLabel: "Hours of revision",
              yLabel: "Test score",
              xMax: 10,
              yMax: 50,
              xStep: 1,
              yStep: 5,
              description: "Scatter graph of test score against hours of revision. The points go up from left to right.",
            },
          },
        },
        {
          question: "As cars get older, their value goes down. What type of correlation is this?",
          steps: ["One thing goes up (age) while the other goes down (value).", "That is negative correlation."],
        },
      ],
    },
    counts: { guided: 4, independent: 5, check: 5 },
  },
};
