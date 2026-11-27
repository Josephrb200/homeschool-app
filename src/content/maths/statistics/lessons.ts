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

  "stats-two-way-tables": {
    skillId: "stats-two-way-tables",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "A two-way table sorts people in two ways at once, like boys and girls, and how they travel to school. It's one of the most common GCSE questions, and it's mostly careful adding and taking away.",
      byTheEnd: ["Read a number from a two-way table.", "Fill in missing numbers using the totals.", "Use a two-way table to find a fraction or a probability."],
    },
    teaching: {
      paragraphs: [
        "A two-way table has groups down the side (rows) and groups across the top (columns). Each cell is where one row and one column meet.",
        "To read a cell, put one finger on the row and one on the column, and slide them together until they meet.",
        "The Total column adds up each row. The Total row adds up each column. The number in the bottom corner is the grand total: everybody.",
        "To find a missing number, look for a row or column with only one gap. Take the numbers you know away from that row's (or column's) total.",
        "Sometimes you must find a total first. Keep looking for a line with just one gap, fill it in, and repeat.",
        "For a fraction, read the question carefully. \"Of the girls\" means out of the girls' total. \"Of all the students\" means out of the grand total.",
      ],
      demo: "two-way-builder",
      examples: [
        {
          question: "How many girls come by bus? Then find the missing number for boys who walk.",
          steps: [
            "Girls row, Bus column: 9 girls come by bus.",
            "The Boys row adds up to 30. The numbers we know are 8 and 7.",
            "30 − 8 − 7 = 15, so 15 boys walk.",
          ],
          visual: {
            kind: "table",
            table: {
              corner: "",
              columns: ["Walk", "Bus", "Car", "Total"],
              rows: [
                { head: "Boys", cells: ["?", "8", "7", "30"] },
                { head: "Girls", cells: ["12", "9", "6", "27"] },
                { head: "Total", cells: ["27", "17", "13", "57"] },
              ],
              highlight: [[0, 0]],
              description: "Two-way table. Boys: Walk missing, Bus 8, Car 7, Total 30. Girls: Walk 12, Bus 9, Car 6, Total 27. Totals: Walk 27, Bus 17, Car 13, grand total 57.",
            },
          },
        },
        {
          question: "Using the same table, what fraction of the girls come by car?",
          steps: ["\"Of the girls\" means out of the girls' total, 27.", "6 girls come by car.", "The fraction is 6/27 (which simplifies to 2/9)."],
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

  "stats-time-series": {
    skillId: "stats-time-series",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "A line graph shows how something changes over time: temperatures through the year, sales each day, visitors each season. You'll see them in science, geography and the news, as well as on GCSE papers.",
      byTheEnd: ["Read a value from a line graph.", "Work out how much it went up or down between two points.", "Describe the trend, and spot a pattern that repeats."],
    },
    teaching: {
      paragraphs: [
        "In a line graph, time goes along the bottom. Each cross is one reading, and straight lines join the crosses in order.",
        "To read a value, find the time along the bottom, go straight up to the cross, then straight across to the scale. Check what the scale goes up in first.",
        "To find a change, read both values and subtract: bigger − smaller. A steeper line means a bigger change.",
        "The trend is the overall direction. Ignore the small wiggles and compare the start with the end: mostly going up, mostly going down, or no clear trend.",
        "Some graphs have a pattern that repeats, like more visitors every summer. This is called a seasonal pattern.",
      ],
      demo: "line-graph-reader",
      examples: [
        {
          question: "How much did the temperature go up from March to April? Describe the trend.",
          steps: ["March: 8°C. April: 11°C.", "11 − 8 = 3, so it went up by 3°C.", "From February to August the line mostly goes up: the trend is upwards."],
          visual: {
            kind: "chart",
            chart: {
              type: "line",
              labels: ["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
              values: [6, 8, 11, 14, 17, 19, 18],
              xLabel: "Month",
              yLabel: "Temperature (°C)",
              yStep: 2,
              description: "Line graph of midday temperature. February 6, March 8, April 11, May 14, June 17, July 19, August 18.",
            },
          },
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

  "stats-grouped-mean": {
    skillId: "stats-grouped-mean",
    status: "draft",
    minutes: 30,
    intro: {
      whyItMatters:
        "When data has lots of different values, like times or heights, it's put into groups called classes. You can't find the exact mean any more, but you can make a very good estimate. This is a favourite GCSE question worth several marks.",
      byTheEnd: ["Read a grouped frequency table and find the modal class.", "Find the class that contains the median.", "Estimate the mean using midpoints, and explain why it's only an estimate."],
    },
    teaching: {
      paragraphs: [
        "A class like 10 < t ≤ 20 means \"more than 10, up to and including 20\". The table tells you how many results are in each class, but not what they are exactly.",
        "The modal class is the class with the biggest frequency.",
        "For the median, find the middle position: (total + 1) ÷ 2. Add up the frequencies from the top until you reach it. That's the class with the median.",
        "To estimate the mean, pretend every result is in the middle of its class. The midpoint is (start + end) ÷ 2.",
        "Make a column of frequency × midpoint. Add it up, then divide by the total frequency (not the number of classes).",
        "It's an estimate because we used midpoints: we don't know the real values.",
      ],
      demo: "grouped-midpoints",
      examples: [
        {
          question: "The table shows how long 20 students took to finish a puzzle. Estimate the mean time.",
          steps: [
            "Midpoints: 5, 15, 25, 35.",
            "Frequency × midpoint: 3 × 5 = 15, 8 × 15 = 120, 6 × 25 = 150, 3 × 35 = 105.",
            "Total: 15 + 120 + 150 + 105 = 390. Total frequency: 20.",
            "390 ÷ 20 = 19.5. The estimated mean is 19.5 minutes.",
          ],
          visual: {
            kind: "chart",
            chart: {
              type: "table",
              headers: ["Time (t minutes)", "Frequency", "Midpoint", "Frequency × midpoint"],
              rows: [
                ["0 < t ≤ 10", 3, 5, 15],
                ["10 < t ≤ 20", 8, 15, 120],
                ["20 < t ≤ 30", 6, 25, 150],
                ["30 < t ≤ 40", 3, 35, 105],
                ["Total", 20, "", 390],
              ],
              description: "Grouped table. 0 to 10 minutes: 3 students, midpoint 5. 10 to 20: 8, midpoint 15. 20 to 30: 6, midpoint 25. 30 to 40: 3, midpoint 35. Totals 20 students and 390.",
            },
          },
        },
        {
          question: "Using the same table, which class contains the median, and which is the modal class?",
          steps: ["Middle position: (20 + 1) ÷ 2 = 10.5, between the 10th and 11th students.", "Running totals: 3, then 3 + 8 = 11. The 10th and 11th are both in 10 < t ≤ 20.", "The biggest frequency is 8, so the modal class is also 10 < t ≤ 20."],
        },
      ],
    },
    counts: { guided: 4, independent: 5, check: 5 },
  },
  "stats-compare": {
    skillId: "stats-compare",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Which class did better? Which runner is more reliable? To compare two sets of data fairly, you need two things: an average (who did better overall) and the range (who was more consistent). GCSE questions always want both, said in words about the context.",
      byTheEnd: ["Compare two groups using an average.", "Compare how consistent they are using the range.", "Choose the best average when there's an outlier, and remember when lower is better."],
    },
    teaching: {
      paragraphs: [
        "Compare the averages first (the mean or the median). The group with the higher average did better on average. Say it about the context: \"On average, Class A scored higher.\"",
        "Then compare the ranges. A smaller range means the results are closer together: more consistent. A bigger range means more spread out.",
        "Be careful: the range never tells you who did better. It only tells you how spread out the results are.",
        "Watch for times. In a race, a lower time is better, so the lower average wins.",
        "An outlier (a value far from the rest) pulls the mean towards it. Then the median is a fairer average to compare.",
      ],
      demo: "compare-spread",
      examples: [
        {
          question: "Class A: median 34, range 8. Class B: median 29, range 15. Compare the two classes.",
          steps: [
            "Averages: 34 is higher than 29, so on average Class A scored higher.",
            "Spread: 8 is smaller than 15, so Class A's scores were more consistent.",
            "Answer: On average Class A did better, and Class A's scores were more consistent.",
          ],
          visual: {
            kind: "chart",
            chart: { type: "table", headers: ["", "Median", "Range"], rows: [["Class A", 34, 8], ["Class B", 29, 15]], description: "Table. Class A: median 34, range 8. Class B: median 29, range 15." },
          },
        },
        {
          question: "Amir's mean 100 m time is 14.2 seconds. Beth's is 15.1 seconds. Who was faster on average?",
          steps: ["For times, lower is better.", "14.2 is lower than 15.1.", "So Amir was faster on average."],
        },
      ],
    },
    counts: { guided: 4, independent: 5, check: 5 },
  },
  "stats-sampling": {
    skillId: "stats-sampling",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "Nobody can ask every person in the country a question. Instead, we ask a sample and use it to estimate for everyone. That only works if the sample is fair. Spotting a biased sample helps you see through dodgy adverts and headlines too.",
      byTheEnd: ["Tell the population from the sample.", "Spot a biased sample and say why it's biased.", "Use a sample to estimate for the whole population."],
    },
    teaching: {
      paragraphs: [
        "The population is everyone (or everything) you want to find out about. The sample is the smaller group you actually ask.",
        "We use samples because asking everyone takes too long and costs too much. A sample gives an estimate, not an exact answer.",
        "A sample is biased if some kinds of people are more likely to be picked than others. Asking people leaving a gym about exercise is biased: they probably exercise more than most.",
        "A random sample gives everyone the same chance, for example picking names at random from a list of everyone. A bigger random sample is more reliable.",
        "To scale up, use the same fraction. If 12 out of a sample of 40 walk to school, then about 12/40 of the whole school walks.",
      ],
      demo: "sample-picker",
      examples: [
        {
          question: "A shop wants to know how much exercise people in a city do. It asks 100 people leaving a gym. Why is this sample biased?",
          steps: ["People leaving a gym have just exercised.", "They probably exercise more than most people in the city.", "So the results would make the city look more active than it really is."],
        },
        {
          question: "A random sample of 40 of the 600 students at a school found that 12 walk to school. Estimate how many of the 600 students walk.",
          steps: ["600 ÷ 40 = 15, so the school is 15 times bigger than the sample.", "12 × 15 = 180.", "About 180 students walk to school."],
        },
      ],
    },
    counts: { guided: 4, independent: 5, check: 5 },
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

  "stats-best-fit": {
    skillId: "stats-best-fit",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "When a scatter graph shows correlation, a line of best fit lets you make predictions: how many ice creams to stock on a hot day, or what score a few more hours of revision might give. You also need to know when not to trust a prediction.",
      byTheEnd: ["Choose a good line of best fit.", "Use a line of best fit to make an estimate.", "Say whether an estimate is reliable."],
    },
    teaching: {
      paragraphs: [
        "A line of best fit is a straight line that follows the pattern of the points. Draw it with a ruler.",
        "It goes through the middle of the points, with about the same number above it as below it. It doesn't have to go through (0, 0), and it doesn't have to touch any points.",
        "Ignore any outlier when you draw the line, because it doesn't fit the pattern.",
        "To estimate, start at the value you know on one axis. Go straight to the line (not to a cross), then straight across or down to the other axis.",
        "An estimate inside the range of the data is fairly reliable. An estimate outside the data is not: the pattern might not carry on. Nobody revises for 100 hours to score 500!",
      ],
      demo: "best-fit-line",
      examples: [
        {
          question: "Use the line of best fit to estimate the test score of a student who revised for 6 hours.",
          steps: ["Find 6 on the bottom axis.", "Go straight up to the line, then straight across to the side axis.", "It reads 25, so the estimated score is 25."],
          visual: {
            kind: "chart",
            chart: {
              type: "scatter",
              points: [[1, 10], [2, 10], [3, 15], [4, 20], [5, 20], [7, 30], [8, 25], [9, 35]],
              xLabel: "Hours of revision",
              yLabel: "Test score",
              xMax: 10,
              yMax: 50,
              xStep: 1,
              yStep: 5,
              fits: [{ from: [0, 5], to: [9, 35] }],
              description: "Scatter graph of test score against hours of revision, with a line of best fit going up from (0, 5) to (9, 35). At 6 hours the line is at 25.",
            },
          },
        },
        {
          question: "Can the same line be used to estimate the score for 30 hours of revision?",
          steps: ["The data only goes from 1 to 9 hours.", "30 hours is far outside the data, so the pattern might not carry on.", "No: the estimate would not be reliable."],
        },
      ],
    },
    counts: { guided: 4, independent: 5, check: 5 },
  },
};
