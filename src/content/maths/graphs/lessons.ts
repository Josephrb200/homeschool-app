/**
 * Lesson content for the graphs chain (six stages, like every chain).
 * Practice and check questions come from generators.ts.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher before Verified.
 */

import type { Lesson } from "@/content/lesson-types";
import type { GraphSpec, SkillId } from "@/engine/types";
import { grid, lineEq, linePoints, sample } from "./plot";

const g = (spec: GraphSpec) => ({ kind: "graph" as const, graph: spec });

export const GRAPH_LESSONS: Record<SkillId, Lesson> = {
  "alg-coordinates": {
    skillId: "alg-coordinates",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "Coordinates are how you say exactly where something is: on a map, a screen, or a graph. Every graph you draw from now on is built from coordinates, so it pays to make them automatic.",
      byTheEnd: ["Read and plot points in all four quadrants.", "Always write x first, then y.", "Find the midpoint of two points."],
    },
    teaching: {
      paragraphs: [
        "A coordinate grid has two number lines. The x-axis goes across. The y-axis goes up. They cross at the origin, (0, 0).",
        "A point is written (x, y). x tells you how far across: right is positive, left is negative. y tells you how far up: up is positive, down is negative.",
        "Always x first. A way to remember: go along the corridor, then up (or down) the stairs.",
        "So (3, −2) means 3 right and 2 down. (−3, 2) means 3 left and 2 up. They are different points.",
        "The axes split the grid into four parts called quadrants. A point on an axis has a 0 in it: (0, 4) is on the y-axis and (−5, 0) is on the x-axis.",
        "The midpoint of two points is exactly halfway between them. Find the mean of the x-coordinates and the mean of the y-coordinates.",
      ],
      demo: "coordinate-explorer",
      examples: [
        {
          question: "Write down the coordinates of point A.",
          visual: g({ ...grid(-5, 5, -5, 5), points: [{ at: [-4, 3], label: "A" }], description: "A coordinate grid with point A 4 left and 3 up." }),
          steps: ["Start at the origin.", "A is 4 to the left, so x = −4.", "A is 3 up, so y = 3.", "A is (−4, 3)."],
        },
        {
          question: "Find the midpoint of (−2, 5) and (6, 1).",
          steps: ["x: (−2 + 6) ÷ 2 = 4 ÷ 2 = 2", "y: (5 + 1) ÷ 2 = 6 ÷ 2 = 3", "The midpoint is (2, 3)."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "alg-plot-linear": {
    skillId: "alg-plot-linear",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "An equation like y = 2x + 1 is a rule linking x and y. Drawing its graph turns the rule into a picture, so you can see patterns and read off answers. Plotting straight lines is in almost every GCSE paper.",
      byTheEnd: ["Fill in a table of values for an equation.", "Plot the points and join them with a straight line.", "Read values from the line.", "Recognise lines like x = 3 and y = −2."],
    },
    teaching: {
      paragraphs: [
        "y = 2x + 1 is a rule: double x, then add 1, and you get y.",
        "Make a table of values. Choose some x-values, such as −2 to 3, and put each one into the rule to find y. When x = −2, y = 2 × (−2) + 1 = −4 + 1 = −3.",
        "Each column of the table is a point (x, y). Plot each point with a small cross.",
        "If the points don't make a straight line, one of them is wrong. Check it before joining them. Use a ruler and draw the line right across the grid.",
        "To read from a line, start on the axis of the number you know, go to the line, then turn and read the other axis.",
        "Some lines have a very simple rule. x = 3 is a vertical line: every point on it has x-coordinate 3. y = −2 is a horizontal line: every point has y-coordinate −2.",
      ],
      demo: "line-table-plot",
      examples: [
        {
          question: "Complete a table of values for y = 3x − 2, for x from −1 to 2.",
          steps: ["x = −1: y = 3 × (−1) − 2 = −3 − 2 = −5", "x = 0: y = 0 − 2 = −2", "x = 1: y = 3 − 2 = 1", "x = 2: y = 6 − 2 = 4", "Points: (−1, −5), (0, −2), (1, 1), (2, 4)."],
        },
        {
          question: "Plot y = 3x − 2.",
          visual: g({ ...grid(-2, 3, -6, 6), curves: [{ points: linePoints(3, -2, -2, 3) }], points: [{ at: [-1, -5] }, { at: [0, -2] }, { at: [1, 1] }, { at: [2, 4] }], description: "The points from the table, joined by a straight line." }),
          steps: ["Plot the four points from the table.", "They line up, so the table is right.", "Join them with a ruler, going right across the grid."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "alg-real-life-graphs": {
    skillId: "alg-real-life-graphs",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "Graphs turn up in bills, timetables, science and the news. Reading them carefully, especially the scale, means you can't be misled by them. GCSE papers use them a lot because they test real understanding.",
      byTheEnd: ["Use a conversion graph in both directions.", "Work out what one small square is worth on each axis.", "Explain what the start and the slope of a graph mean."],
    },
    teaching: {
      paragraphs: [
        "A real-life graph shows how two amounts are linked: miles and kilometres, or the time a job takes and its cost.",
        "Before reading anything, look at the scale on each axis. Count how many small squares there are between two numbers. If 0 to 10 takes 5 squares, each small square is worth 2.",
        "To read the graph, start at the value you know, go to the line, then turn and read the other axis. A ruler helps keep you straight.",
        "Where the line starts on the vertical axis tells you the value at zero. On a cost graph that's the fixed charge, the amount you pay before anything happens.",
        "The slope tells you the rate: how much the vertical amount goes up for each 1 across. On a taxi graph, that's the cost of each extra mile.",
      ],
      demo: "real-life-reader",
      examples: [
        {
          question: "A taxi charges £4 plus £2 per mile. Use the graph to find the cost of a 6-mile journey.",
          visual: g({
            x: { min: 0, max: 10, step: 1, labelStep: 2, label: "Distance (miles)" },
            y: { min: 0, max: 30, step: 1, labelStep: 5, label: "Cost (£)" },
            curves: [{ points: [[0, 4], [10, 24]] }, { points: [[6, 0], [6, 16], [0, 16]], dashed: true }],
            description: "A taxi cost graph: a straight line from (0, 4) to (10, 24). Dashed lines go up from 6 miles to the line, then across to £16.",
          }),
          steps: ["On the cost axis, 0 to 5 takes 5 squares, so each square is £1.", "Start at 6 miles, go up to the line, then across.", "The cost is £16."],
        },
        {
          question: "On the same graph, what does the point (0, 4) mean?",
          steps: ["At 0 miles the cost is already £4.", "So £4 is the fixed charge you pay just for getting in."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "alg-gradient-intercept": {
    skillId: "alg-gradient-intercept",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Two numbers describe any straight line: how steep it is (the gradient) and where it crosses the y-axis (the y-intercept). Once you can spot them, you can read a line's equation at a glance.",
      byTheEnd: ["Find the gradient of a line from a graph or from two points.", "Find the y-intercept from a graph.", "Read the gradient and y-intercept from y = mx + c."],
    },
    teaching: {
      paragraphs: [
        "The gradient tells you how steep a line is: how far it goes up for every 1 across.",
        "To find it, pick two points on the line. Gradient = change in y ÷ change in x. If the line goes 6 up while it goes 2 across, the gradient is 6 ÷ 2 = 3.",
        "Read the line from left to right. Uphill lines have a positive gradient. Downhill lines have a negative gradient. A bigger number (ignoring the sign) means steeper.",
        "The y-intercept is where the line crosses the y-axis. There, x = 0.",
        "Any straight line can be written y = mx + c. m, the number multiplying x, is the gradient. c, the number on its own, is the y-intercept.",
        "So y = 4x − 3 has gradient 4 and y-intercept −3. Keep the signs: in y = 5 − 2x, the gradient is −2, not 5.",
      ],
      demo: "gradient-explorer",
      examples: [
        {
          question: "Find the gradient of the line.",
          visual: g({ ...grid(-1, 5, -2, 8), curves: [{ points: linePoints(2, -1, -1, 5) }], points: [{ at: [1, 1] }, { at: [3, 5] }], description: "A straight line through (1, 1) and (3, 5)." }),
          steps: ["From (1, 1) to (3, 5): 2 across and 4 up.", "Gradient = 4 ÷ 2 = 2."],
        },
        {
          question: "Write down the gradient and y-intercept of y = 7 − 3x.",
          steps: ["Rewrite it in the order y = mx + c: y = −3x + 7.", "The gradient is −3 (the line goes downhill).", "The y-intercept is 7."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "alg-y-mx-c": {
    skillId: "alg-y-mx-c",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Finding the equation of a line lets you describe it exactly and predict any point on it. It's a classic grade 4 and 5 question, and parallel lines come up often.",
      byTheEnd: ["Write the equation of a line from its graph.", "Find the equation of a line through two points.", "Find a line parallel to another through a given point.", "Rearrange an equation to read its gradient."],
    },
    teaching: {
      paragraphs: [
        "Every straight line (except vertical ones) has an equation y = mx + c. To write it, you need m and c.",
        "From a graph: read c where the line crosses the y-axis. Then find m by counting how far up for each 1 across.",
        "From two points: find m = change in y ÷ change in x. Then put one point's x and y into y = mx + c and solve to find c.",
        "Parallel lines point the same way, so they have the same gradient. y = 3x + 1 and y = 3x − 5 are parallel. Their y-intercepts differ.",
        "For a line parallel to y = 3x + 1 through (2, 4): the gradient is 3. Put x = 2, y = 4 into y = 3x + c: 4 = 6 + c, so c = −2. The line is y = 3x − 2.",
        "If the equation doesn't start y = …, rearrange it first. 2y = 6x + 4 becomes y = 3x + 2 after dividing every term by 2.",
      ],
      demo: "parallel-lines-graph",
      examples: [
        {
          question: "Find the equation of the line through (1, 5) and (3, 9).",
          steps: ["m = (9 − 5) ÷ (3 − 1) = 4 ÷ 2 = 2", "Put (1, 5) into y = 2x + c: 5 = 2 + c, so c = 3.", "y = 2x + 3"],
        },
        {
          question: "Find the line parallel to y = −x + 6 that goes through (4, 1).",
          visual: g({ ...grid(-2, 8, -3, 8), curves: [{ points: linePoints(-1, 6, -2, 8), label: { text: lineEq(-1, 6), at: [0.3, 7.4] } }, { points: linePoints(-1, 5, -2, 8), dashed: true }], points: [{ at: [4, 1] }], description: "The line y = −x + 6 and a dashed parallel line through (4, 1)." }),
          steps: ["Parallel, so m = −1.", "1 = −1 × 4 + c, so 1 = −4 + c and c = 5.", "y = −x + 5"],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "alg-quadratic-graphs": {
    skillId: "alg-quadratic-graphs",
    status: "draft",
    minutes: 30,
    intro: {
      whyItMatters:
        "Quadratic graphs are the curves made by x². They describe the path of a thrown ball, a bridge arch or a satellite dish. At GCSE you'll plot them and read off their key points.",
      byTheEnd: ["Complete a table of values for a quadratic, squaring negatives correctly.", "Plot a smooth U-shaped curve.", "Read the roots, turning point, line of symmetry and y-intercept."],
    },
    teaching: {
      paragraphs: [
        "A quadratic equation has an x² term and no higher power, like y = x² − 2x − 3. Its graph is a smooth U-shaped curve called a parabola.",
        "Make a table of values as you would for a straight line. Take care squaring negatives: (−3)² = 9, because a negative times a negative is positive.",
        "Plot the points and join them with a smooth curve, not straight lines between points. The bottom of the U is rounded, not pointed.",
        "The roots are where the curve crosses the x-axis. There, y = 0. Many quadratics have two roots.",
        "The turning point is the lowest point of the U. The curve is symmetrical about a vertical line through the turning point. The line of symmetry is halfway between the roots.",
        "If the x² has a minus in front, like y = 4 − x², the curve is upside down: a ∩ shape with a highest point.",
      ],
      demo: "quadratic-explorer",
      examples: [
        {
          question: "For y = x² − 2x − 3, find y when x = −2.",
          steps: ["x² = (−2)² = 4", "−2x = −2 × (−2) = +4", "y = 4 + 4 − 3 = 5"],
        },
        {
          question: "Read the roots, turning point and line of symmetry of y = x² − 2x − 3.",
          visual: g({ ...grid(-3, 5, -5, 8), curves: [{ points: sample((x) => x * x - 2 * x - 3, -3, 5) }], points: [{ at: [-1, 0] }, { at: [3, 0] }, { at: [1, -4] }], description: "A U-shaped curve crossing the x-axis at −1 and 3, with its lowest point at (1, −4)." }),
          steps: ["Roots: the curve crosses the x-axis at x = −1 and x = 3.", "Line of symmetry: halfway between −1 and 3, so x = 1.", "Turning point: the lowest point, (1, −4)."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "alg-cubic-reciprocal-graphs": {
    skillId: "alg-cubic-reciprocal-graphs",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "GCSE expects you to recognise four families of graph from their shape or their equation. Knowing them helps you sketch a graph quickly and spot mistakes in a plotted one.",
      byTheEnd: ["Recognise straight-line, quadratic, cubic and reciprocal graphs.", "Match an equation to its graph.", "Work out values for cubic and reciprocal equations."],
    },
    teaching: {
      paragraphs: [
        "Look at the highest power of x in the equation. It tells you the family.",
        "x on its own, like y = 2x + 1: a straight line.",
        "x², like y = x² − 4: a quadratic. A U shape, or a ∩ shape if the x² is negative.",
        "x³, like y = x³ + 2: a cubic. An S-shaped curve that goes from bottom left to top right (or top left to bottom right if the x³ is negative).",
        "x on the bottom of a fraction, like y = 6/x: a reciprocal. Two separate curves in opposite corners. They get closer and closer to the axes but never touch them, because you can't divide by 0.",
        "Cubing a negative gives a negative: (−2)³ = −8. Dividing by a negative also gives a negative: 6 ÷ (−2) = −3.",
      ],
      demo: "graph-families",
      examples: [
        {
          question: "What type of graph is y = 5 − x³?",
          steps: ["The highest power of x is x³.", "So it is a cubic: an S-shaped curve.", "The x³ is negative, so it goes from top left to bottom right."],
        },
        {
          question: "For y = 12/x, find y when x = −3.",
          steps: ["12/x means 12 ÷ x.", "12 ÷ (−3) = −4", "y = −4"],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "alg-solve-graphically": {
    skillId: "alg-solve-graphically",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Some equations are hard to solve with algebra, but easy to solve with a graph. Graphs also show why simultaneous equations have one answer: it's where two lines cross.",
      byTheEnd: ["Solve an equation by reading from its graph.", "Solve a quadratic = 0 using the roots.", "Solve a quadratic = a number by drawing a horizontal line.", "Solve simultaneous equations from where two lines cross."],
    },
    teaching: {
      paragraphs: [
        "To solve 2x + 1 = 7 with the graph of y = 2x + 1, find 7 on the y-axis, go across to the line, then down to the x-axis. The answer is the x-value: x = 3.",
        "To solve x² − 2x − 3 = 0, look where the graph of y = x² − 2x − 3 meets the x-axis (where y = 0). The roots, x = −1 and x = 3, are the solutions.",
        "To solve x² − 2x − 3 = 5, draw the horizontal line y = 5. The solutions are the x-values where the line crosses the curve.",
        "The answer to these is always the x-value, not the y-value. Most quadratics give two answers.",
        "Simultaneous equations are two equations that are both true at once. Draw both lines. Where they cross, the x and y values work in both equations, so the crossing point is the solution.",
        "Graph answers can be estimates if the crossing isn't on a gridline. Here, every crossing is on a gridline so you can read it exactly.",
      ],
      demo: "solve-with-graphs",
      examples: [
        {
          question: "Use the graph to solve x² − 2x − 3 = 5.",
          visual: g({ ...grid(-3, 5, -5, 8), curves: [{ points: sample((x) => x * x - 2 * x - 3, -3, 5) }, { points: [[-3, 5], [5, 5]], dashed: true }], points: [{ at: [-2, 5] }, { at: [4, 5] }], description: "The curve y = x² − 2x − 3 and the dashed line y = 5, crossing at x = −2 and x = 4." }),
          steps: ["Draw the line y = 5.", "It crosses the curve at x = −2 and x = 4.", "x = −2 or x = 4"],
        },
        {
          question: "Solve y = x + 1 and y = 7 − 2x using their graphs.",
          visual: g({ ...grid(-2, 5, -2, 8), curves: [{ points: linePoints(1, 1, -2, 5) }, { points: linePoints(-2, 7, -2, 5), dashed: true }], points: [{ at: [2, 3] }], description: "The lines y = x + 1 and y = 7 − 2x crossing at (2, 3)." }),
          steps: ["The lines cross at (2, 3).", "Check: 2 + 1 = 3 ✓ and 7 − 4 = 3 ✓", "x = 2, y = 3"],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },
};
