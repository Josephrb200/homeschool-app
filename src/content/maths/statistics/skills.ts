/**
 * The statistics chain (KS3, GCSE Foundation, DfE codes S2, S4, S6): tally
 * charts and frequency tables, bar charts and pictograms, pie charts, mean,
 * median, mode and range, averages from a frequency table, and scatter
 * graphs and correlation.
 *
 * Prerequisites copy the GCSE Foundation topic map exactly. Ones that aren't
 * built yet (division, ordering, measuring angles, coordinates) are dropped by
 * the content registry until they go live, then link up automatically.
 *
 * STATUS: Draft. Written by the build team; needs review by a qualified maths
 * teacher before it is marked Verified.
 */

import type { Misconception, Skill } from "@/engine/types";

export const STATS_SKILLS: Skill[] = [
  {
    id: "stats-frequency-tables",
    topic: "Statistics",
    name: "Tally charts and frequency tables",
    objective: "I can record data with tally marks, read a frequency table, and find a missing frequency from the total.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: [],
  },
  {
    id: "stats-bar-pictograms",
    topic: "Statistics",
    name: "Bar charts and pictograms",
    objective: "I can read values from a bar chart using its scale, and from a pictogram using its key, including half symbols.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: ["stats-frequency-tables"],
  },
  {
    id: "stats-pie-charts",
    topic: "Statistics",
    name: "Drawing and reading pie charts",
    objective: "I can work out the angles for a pie chart from a frequency table, and read frequencies back from a pie chart.",
    typicalYear: 8,
    gcseTier: "foundation",
    prerequisites: ["stats-frequency-tables", "geo-measure-angles", "frac-of-amount"],
  },
  {
    id: "stats-averages",
    topic: "Statistics",
    name: "Mean, median, mode and range",
    objective: "I can find the mean, median, mode and range of a list of numbers, and find a missing number from the mean.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: ["num-divide", "num-ordering"],
  },
  {
    id: "stats-frequency-table-averages",
    topic: "Statistics",
    name: "Averages from a frequency table",
    objective: "I can find the mode, median, range and mean from a frequency table.",
    typicalYear: 9,
    gcseTier: "foundation",
    prerequisites: ["stats-averages", "stats-frequency-tables"],
  },
  {
    id: "stats-scatter",
    topic: "Statistics",
    name: "Scatter graphs and correlation",
    objective: "I can read points on a scatter graph, describe the correlation, and spot a point that doesn't fit the pattern.",
    typicalYear: 9,
    gcseTier: "foundation",
    prerequisites: ["alg-coordinates"],
  },
];

export const STATS_MISCONCEPTIONS: Record<string, Misconception> = {
  "tally-gate-as-four": {
    id: "tally-gate-as-four",
    label: "Counted a tally gate as 4",
    explanation:
      "Each crossed group of tally marks is a \"gate\" and it stands for 5: four upright lines and one line across. Count in fives for the gates, then add the single lines.",
  },
  "freq-missing-gave-known": {
    id: "freq-missing-gave-known",
    label: "Added the known frequencies instead of finding the missing one",
    explanation:
      "That's the total of the frequencies you can see. The missing frequency is what's left over: take that away from the total number asked.",
  },
  "freq-diff-added": {
    id: "freq-diff-added",
    label: "Added when the question asked \"how many more\"",
    explanation: "\"How many more\" means find the difference, so subtract the smaller number from the bigger one.",
  },
  "freq-total-missed-row": {
    id: "freq-total-missed-row",
    label: "Missed a row when adding up",
    explanation: "Close, but one row has been missed out. Add every frequency in the table, ticking each one as you go.",
  },
  "bar-counted-gridlines": {
    id: "bar-counted-gridlines",
    label: "Counted gridlines instead of using the scale",
    explanation:
      "That's the number of gridlines the bar reaches, not its value. Look at the numbers up the side: each gridline might be worth 2, 5 or 10.",
  },
  "pictogram-counted-symbols": {
    id: "pictogram-counted-symbols",
    label: "Counted symbols and ignored the key",
    explanation: "That's how many symbols there are. Check the key: each whole symbol stands for more than 1, so multiply.",
  },
  "pictogram-half-as-whole": {
    id: "pictogram-half-as-whole",
    label: "Counted a half symbol as a whole one",
    explanation: "The last symbol is only half drawn, so it's worth half of what the key says. Halve the key's number for that one.",
  },
  "pie-frequency-as-angle": {
    id: "pie-frequency-as-angle",
    label: "Used the frequency as the angle",
    explanation:
      "The frequency isn't the angle. The whole circle is 360° and it stands for everyone, so first find how many degrees one person gets: 360 ÷ total.",
  },
  "pie-used-100": {
    id: "pie-used-100",
    label: "Shared out 100 instead of 360°",
    explanation: "That works for percentages, but a pie chart is a full circle: 360°. Share out 360, not 100.",
  },
  "pie-angle-as-frequency": {
    id: "pie-angle-as-frequency",
    label: "Gave the angle as the number of people",
    explanation:
      "The angle is in degrees, not people. Work out what fraction of the circle the sector is (angle ÷ 360), then take that fraction of the total.",
  },
  "pie-angles-180": {
    id: "pie-angles-180",
    label: "Thought the angles add to 180°",
    explanation: "The angles in a pie chart go all the way round the centre, so they add up to 360°, not 180°.",
  },
  "mean-forgot-divide": {
    id: "mean-forgot-divide",
    label: "Added up but forgot to divide",
    explanation: "You've found the total. For the mean, share it out equally: divide the total by how many numbers there are.",
  },
  "mean-wrong-count": {
    id: "mean-wrong-count",
    label: "Divided by the wrong count",
    explanation: "Count the numbers again carefully. Divide the total by how many numbers there are in the list.",
  },
  "median-not-ordered": {
    id: "median-not-ordered",
    label: "Took the middle without putting the numbers in order",
    explanation: "The median is the middle number once the list is in order. Write the numbers from smallest to biggest first, then find the middle.",
  },
  "median-even-picked-one": {
    id: "median-even-picked-one",
    label: "Picked one of the two middle numbers",
    explanation:
      "With an even number of values there are two in the middle. The median is half-way between them: add the two and divide by 2.",
  },
  "mode-gave-frequency": {
    id: "mode-gave-frequency",
    label: "Gave how many times, not which value",
    explanation: "That's how many times the most common value appears. The mode is the value itself: the one that appears most often.",
  },
  "range-gave-largest": {
    id: "range-gave-largest",
    label: "Gave the biggest value instead of the range",
    explanation: "The range is how spread out the data is: biggest value take away smallest value.",
  },
  "range-not-ordered": {
    id: "range-not-ordered",
    label: "Used the first and last numbers in the list",
    explanation: "The range uses the biggest and smallest values, which might not be at the ends of the list. Find them first, then subtract.",
  },
  "mean-missing-gave-total": {
    id: "mean-missing-gave-total",
    label: "Gave the total instead of the missing number",
    explanation:
      "That's the total all the numbers must add up to. Now take away the numbers you already know to find the missing one.",
  },
  "freq-mode-gave-frequency": {
    id: "freq-mode-gave-frequency",
    label: "Gave the biggest frequency, not the value",
    explanation:
      "That's the biggest frequency: how many times the mode happened. The mode is the value in the first column that has the biggest frequency.",
  },
  "freq-mean-divided-by-rows": {
    id: "freq-mean-divided-by-rows",
    label: "Divided by the number of rows",
    explanation:
      "Divide by how many results there are in all, which is the total of the frequency column, not the number of rows in the table.",
  },
  "freq-mean-of-values": {
    id: "freq-mean-of-values",
    label: "Averaged the first column and ignored the frequencies",
    explanation:
      "Each value happens a different number of times. Multiply each value by its frequency (the f × x column), add those up, then divide by the total frequency.",
  },
  "freq-mean-of-frequencies": {
    id: "freq-mean-of-frequencies",
    label: "Averaged the frequency column",
    explanation:
      "That's the mean of the frequencies. You want the mean of the values: multiply each value by its frequency, add them up, then divide by the total frequency.",
  },
  "freq-median-gave-position": {
    id: "freq-median-gave-position",
    label: "Gave the median's position, not its value",
    explanation:
      "That number tells you where the median is in the list, not what it is. Count down the frequency column to find which value is in that position.",
  },
  "freq-median-middle-row": {
    id: "freq-median-middle-row",
    label: "Took the middle row of the table",
    explanation:
      "The middle row isn't the middle result. Find the middle position with (total + 1) ÷ 2, then count down the frequencies to reach it.",
  },
  "freq-range-of-frequencies": {
    id: "freq-range-of-frequencies",
    label: "Found the range of the frequencies",
    explanation: "The range is about the values, not how often they happen. Use the biggest and smallest values in the first column.",
  },
  "freq-range-zero-row": {
    id: "freq-range-zero-row",
    label: "Included a value nobody had",
    explanation:
      "A row with frequency 0 means nobody had that value, so it isn't in the data. Use the biggest and smallest values that have a frequency of at least 1.",
  },
  "freq-total-used-frequency": {
    id: "freq-total-used-frequency",
    label: "Counted people instead of the things they have",
    explanation:
      "That's how many people there are. Each person in a row has that row's value, so multiply value × frequency for each row, then add.",
  },
  "scatter-pos-neg-swapped": {
    id: "scatter-pos-neg-swapped",
    label: "Mixed up positive and negative correlation",
    explanation:
      "Read the graph from left to right. Points going up (both get bigger together) is positive. Points going down (one goes up as the other goes down) is negative.",
  },
  "scatter-none-confused": {
    id: "scatter-none-confused",
    label: "Mixed up correlation and no correlation",
    explanation:
      "If the points make a rough line going up or down, there is correlation. If they are scattered everywhere with no pattern, there is no correlation.",
  },
  "scatter-wrong-axis": {
    id: "scatter-wrong-axis",
    label: "Read the wrong axis",
    explanation: "That's the value on the other axis. Check which one the question asks for: across the bottom, or up the side.",
  },
  "scatter-outlier-on-trend": {
    id: "scatter-outlier-on-trend",
    label: "Picked a point that fits the pattern",
    explanation:
      "That point follows the pattern of the others. An outlier is a point that sits well away from the rest, far from where the trend says it should be.",
  },
};
