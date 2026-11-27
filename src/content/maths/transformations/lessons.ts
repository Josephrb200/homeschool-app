/**
 * Lesson content for transformations (six stages, like every chain). Practice
 * and check questions come from generators.ts. Worked-example pictures use the
 * same geometry functions, so they are exact.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher before Verified.
 */

import type { Lesson } from "@/content/lesson-types";
import type { SkillId, Visual } from "@/engine/types";
import { enlarge, grid, map, mirrorSegment, reflect, rotate, shift, type P, type Shape, type Window } from "./geometry";

const W: Window = { x: [-5, 5], y: [-5, 5] };
const W1: Window = { x: [0, 8], y: [0, 7] };

const L: Shape = [[1, 1], [3, 1], [3, 2], [2, 2], [2, 4], [1, 4]];
const tri: Shape = [[1, 1], [3, 1], [1, 4]];

const plane = (p: ReturnType<typeof grid>): Visual => ({ kind: "plane", plane: p });

export const TRANSFORMATION_LESSONS: Record<SkillId, Lesson> = {
  "geo-reflection": {
    skillId: "geo-reflection",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "Reflections are everywhere: mirrors, butterflies, logos. In exams you reflect shapes on a grid and name mirror lines like x = 3. It's also the start of symmetry.",
      byTheEnd: ["Reflect a shape in a vertical or horizontal mirror line.", "Know which way x = 3 and y = 3 go.", "Reflect in y = x.", "Count lines of symmetry."],
    },
    teaching: {
      paragraphs: [
        "A reflection flips a shape over a mirror line. Every corner of the image is the same distance from the mirror as the matching corner of the shape, but on the other side. The image is the same size, but faces the opposite way.",
        "Mirror lines are named by equations. x = 3 is a vertical line (straight up and down) through 3 on the x-axis: every point on it has x-coordinate 3. y = 3 is a horizontal line (straight across) through 3 on the y-axis.",
        "To reflect, take one corner at a time. Count how many squares it is from the mirror, straight towards the line. Count the same number of squares out the other side. Then join up the new corners.",
        "y = x is the diagonal line through (0, 0), (1, 1), (2, 2). Reflecting in y = x swaps the coordinates: (4, 1) goes to (1, 4).",
        "A line of symmetry is a mirror line inside a shape: fold along it and the two halves match exactly. A regular polygon has as many lines of symmetry as sides. A rectangle has 2 (not its diagonals). A parallelogram has none.",
      ],
      demo: "reflect-explore",
      examples: [
        {
          question: "Reflect corner P (2, 4) in the line x = 4.",
          visual: plane(grid(W1, [{ s: L.map(([x, y]) => [x, y] as P), label: "A" }, { s: map(L, (p) => reflect(p, { kind: "x", c: 4 })), label: "B", tone: "image" }], {
            lines: [{ ...mirrorSegment({ kind: "x", c: 4 }, W1), label: "x = 4", tone: "mirror" }],
            points: [{ at: [2, 4], label: "P" }, { at: [6, 4], label: "P′" }],
            description: "An L-shape A and its reflection B in the vertical line x = 4. P at (2, 4) reflects to (6, 4).",
          })),
          steps: ["x = 4 is the vertical line through 4 on the x-axis.", "P (2, 4) is 2 squares to the left of the line.", "Count 2 squares to the right of the line instead: x = 6. The height stays the same.", "P goes to (6, 4)."],
        },
        {
          question: "Reflect the point (5, 2) in the line y = x.",
          visual: plane(grid({ x: [0, 6], y: [0, 6] }, [], {
            lines: [{ a: [0, 0], b: [6.6, 6.6], label: "y = x", tone: "mirror" }],
            points: [{ at: [5, 2], label: "(5, 2)" }, { at: [2, 5], label: "(2, 5)" }],
            description: "The diagonal line y = x, with the point (5, 2) and its reflection (2, 5).",
          })),
          steps: ["Reflecting in y = x swaps the coordinates.", "(5, 2) goes to (2, 5).", "Check: the two points are the same distance from the line, on opposite sides."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "geo-rotation": {
    skillId: "geo-rotation",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters: "A rotation turns a shape about a fixed point, like a wheel or a clock hand. Exam questions ask you to rotate shapes on a grid and to spot rotational symmetry.",
      byTheEnd: ["Rotate a shape 90° clockwise or anticlockwise, or 180°.", "Rotate about the origin or another centre.", "Find the order of rotational symmetry of a shape."],
    },
    teaching: {
      paragraphs: [
        "A rotation needs three things: the angle (90° is a quarter turn, 180° a half turn), the direction (clockwise is the way clock hands go; anticlockwise is the other way) and the centre (the point that stays still).",
        "The image is the same size and shape, and is never flipped over. Each corner stays the same distance from the centre.",
        "Tracing paper makes rotations easy: trace the shape, put your pencil point on the centre, and turn the paper. In your head: count the journey from the centre to a corner (for example 3 right, 1 up). A quarter turn clockwise turns that journey into 1 right, 3 down.",
        "For 180°, every journey from the centre reverses: 3 right, 1 up becomes 3 left, 1 down. Direction doesn't matter for 180°.",
        "Rotational symmetry: turn a shape once all the way round. The order is how many times it fits exactly onto itself. A square has order 4. A shape with no rotational symmetry has order 1, never 0, because it fits once when it gets back to the start.",
      ],
      demo: "rotate-explore",
      examples: [
        {
          question: "Rotate the triangle 90° clockwise about (0, 0). Where does corner P (3, 1) go?",
          visual: plane(grid(W, [{ s: tri, label: "A" }, { s: map(tri, (p) => rotate(p, { deg: 90, dir: "clockwise", c: [0, 0] })), label: "B", tone: "image" }], {
            points: [{ at: [3, 1], label: "P" }, { at: [1, -3], label: "P′" }, { at: [0, 0], hollow: true }],
            description: "Triangle A with corners (1, 1), (3, 1), (1, 4) and its image B after a quarter turn clockwise about the origin, with corners (1, −1), (1, −3), (4, −1).",
          })),
          steps: ["From (0, 0), the corner is 3 right and 1 up.", "A quarter turn clockwise turns 'right' into 'down' and 'up' into 'right': 1 right and 3 down.", "So P (3, 1) goes to P′ (1, −3).", "Do the same for each corner, then join them up."],
        },
        {
          question: "Rotate shape A 180° about C (1, 0).",
          visual: plane(grid(W, [{ s: shift(tri, [1, 0]), label: "A" }, { s: map(shift(tri, [1, 0]), (p) => rotate(p, { deg: 180, dir: "clockwise", c: [1, 0] })), label: "B", tone: "image" }], {
            points: [{ at: [1, 0], label: "C", hollow: true }],
            description: "Triangle A with corners (2, 1), (4, 1), (2, 4) and its image B after a half turn about C (1, 0), with corners (0, −1), (−2, −1), (0, −4).",
          })),
          steps: ["Corner (2, 1) is 1 right and 1 up from C.", "A half turn reverses both: 1 left and 1 down from C, which is (0, −1).", "Corner (4, 1) is 3 right and 1 up, so it goes 3 left and 1 down: (−2, −1).", "Corner (2, 4) goes to (0, −4). The image is upside down."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "geo-translation": {
    skillId: "geo-translation",
    status: "draft",
    minutes: 15,
    intro: {
      whyItMatters: "A translation slides a shape without turning or flipping it. Column vectors describe the slide exactly, and you'll use them again in vectors at GCSE.",
      byTheEnd: ["Read a column vector as a move left or right, and up or down.", "Translate a shape by a column vector.", "Write the column vector for a translation."],
    },
    teaching: {
      paragraphs: [
        "A translation moves every point of a shape the same distance in the same direction. The shape doesn't turn, flip or change size.",
        "We describe the move with a column vector, two numbers stacked in brackets. The top number is the move left or right: positive is right, negative is left. The bottom number is the move up or down: positive is up, negative is down.",
        "So vec(4,−2) means 4 right and 2 down, and vec(−3,1) means 3 left and 1 up.",
        "To find the vector from shape A to shape B, pick one corner of A and find the same corner on B. Count how far it moves across, then up or down. Don't count the empty squares between the shapes: that misses the width of the shape.",
      ],
      demo: "translate-explore",
      examples: [
        {
          question: "Translate the triangle by vec(4,−2).",
          visual: plane(grid({ x: [0, 8], y: [-2, 5] }, [{ s: tri, label: "A" }, { s: shift(tri, [4, -2]), label: "B", tone: "image" }], {
            arrows: [{ from: [1, 1], to: [5, -1] }],
            description: "Triangle A with corners (1, 1), (3, 1), (1, 4), moved 4 right and 2 down to triangle B with corners (5, −1), (7, −1), (5, 2).",
          })),
          steps: ["vec(4,−2) means 4 right and 2 down.", "Corner (1, 1) moves to (1 + 4, 1 − 2) = (5, −1).", "Move every corner the same way: (3, 1) to (7, −1) and (1, 4) to (5, 2).", "The image is the same way round: only its position changed."],
        },
        {
          question: "Write the column vector that moves A to B.",
          visual: plane(grid(W, [{ s: shift(L, [1, 0]), label: "A" }, { s: shift(L, [-5, -5]), label: "B", tone: "image" }], {
            description: "An L-shape A with its bottom-left corner at (2, 1), and the same L-shape B with its bottom-left corner at (−4, −4).",
          })),
          steps: ["Bottom-left corner of A: (2, 1). Bottom-left corner of B: (−4, −4).", "Across: from 2 to −4 is 6 left, so the top number is −6.", "Up/down: from 1 to −4 is 5 down, so the bottom number is −5.", "The vector is vec(−6,−5)."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "geo-enlargement": {
    skillId: "geo-enlargement",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters: "Enlargements make shapes bigger or smaller while keeping their shape: maps, scale drawings, zooming on a photo. You'll need scale factors again for similar shapes.",
      byTheEnd: ["Find the scale factor of an enlargement.", "Enlarge a shape from a centre of enlargement.", "Use a fractional scale factor like ½ to make a shape smaller.", "Find the centre of an enlargement."],
    },
    teaching: {
      paragraphs: [
        "An enlargement changes the size of a shape but keeps its angles and proportions the same. The scale factor says how many times longer every length becomes: scale factor 3 means every side is 3 times as long.",
        "Scale factor = new length ÷ original length. If the shape gets smaller, the scale factor is between 0 and 1. Scale factor ½ halves every length.",
        "The centre of enlargement fixes where the image goes. Count the journey from the centre to a corner (for example 2 right, 1 up). Multiply it by the scale factor (scale factor 3 gives 6 right, 3 up). Count that from the centre, not from the corner.",
        "To find the centre, draw straight lines through matching corners of the image and the shape, and carry them on. They all cross at the centre.",
      ],
      demo: "enlarge-explore",
      examples: [
        {
          question: "Enlarge triangle A by scale factor 2 with centre C (−5, −5).",
          visual: plane(grid(W, [{ s: [[-4, -3], [-3, -3], [-4, -1]], label: "A" }, { s: map([[-4, -3], [-3, -3], [-4, -1]], (p) => enlarge(p, 2, [-5, -5])), label: "B", tone: "image" }], {
            points: [{ at: [-5, -5], label: "C", hollow: true }],
            lines: [
              { a: [-5, -5], b: [-1, -1], tone: "faint", dashed: true },
              { a: [-5, -5], b: [-3, 3], tone: "faint", dashed: true },
            ],
            description: "Triangle A with corners (−4, −3), (−3, −3), (−4, −1), and its enlargement B, scale factor 2 from C (−5, −5), with corners (−3, −1), (−1, −1), (−3, 3). Dashed lines from C pass through matching corners.",
          })),
          steps: ["From C (−5, −5) to corner (−3, −3) is 2 right and 2 up.", "Multiply by 2: 4 right and 4 up.", "Count that from C: (−5 + 4, −5 + 4) = (−1, −1).", "Do the same for each corner. The image is twice as long in every direction, and the dashed lines from C go through matching corners."],
        },
        {
          question: "A rectangle is 8 cm by 6 cm. It is enlarged by scale factor ½. What size is the image?",
          steps: ["Scale factor ½ halves every length.", "8 × ½ = 4 cm and 6 × ½ = 3 cm.", "The image is 4 cm by 3 cm: smaller, because the scale factor is less than 1."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "geo-describe-transformations": {
    skillId: "geo-describe-transformations",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters: "'Describe fully the single transformation' is one of the most common geometry exam questions. Marks are lost for leaving out a detail, so this lesson is about a checklist.",
      byTheEnd: ["Recognise reflections, rotations, translations and enlargements.", "Give every detail needed for a full description.", "Find a mirror line, a vector, a scale factor or a centre."],
    },
    teaching: {
      paragraphs: [
        "First, decide the type. Is the image a different size? Enlargement. Same size and same way round, just moved? Translation. Flipped over (facing the opposite way)? Reflection. Turned? Rotation.",
        "Then give every detail. Reflection: the equation of the mirror line. Rotation: the angle, the direction (unless it's 180°) and the centre. Translation: the column vector. Enlargement: the scale factor and the centre.",
        "Always describe a single transformation. Writing two (like 'reflect then translate') gets no marks, even if it works.",
        "Check your answer on one corner: does your description really send it to the right place?",
      ],
      demo: "describe-sort",
      examples: [
        {
          question: "Describe fully the single transformation that maps A onto B.",
          visual: plane(grid(W, [{ s: L, label: "A" }, { s: map(L, (p) => rotate(p, { deg: 90, dir: "anticlockwise", c: [0, 0] })), label: "B", tone: "image" }], {
            points: [{ at: [0, 0], hollow: true }],
            description: "L-shape A in the top-right quarter of the grid, and L-shape B in the top-left quarter, turned a quarter turn.",
          })),
          steps: ["Same size, not flipped, but turned: it's a rotation.", "B is a quarter turn from A, turning the opposite way to clock hands: 90° anticlockwise.", "Check a corner: (3, 1) is 3 right and 1 up from (0, 0). A quarter turn anticlockwise makes that 1 left and 3 up: (−1, 3). That is the matching corner of B.", "Rotation 90° anticlockwise about (0, 0)."],
        },
        {
          question: "Describe fully the single transformation that maps A onto B.",
          visual: plane(grid(W, [{ s: L, label: "A" }, { s: map(L, (p) => reflect(p, { kind: "y", c: 0 })), label: "B", tone: "image" }], {
            lines: [{ ...mirrorSegment({ kind: "y", c: 0 }, W), tone: "faint", dashed: true }],
            description: "L-shape A above the x-axis and its mirror image B below the x-axis.",
          })),
          steps: ["Same size, but flipped upside down: a reflection.", "Each corner is the same distance above the x-axis as its image is below it.", "Reflection in the x-axis, which is the line y = 0."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },
};
