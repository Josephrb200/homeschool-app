/**
 * Lesson content for 3D shapes, nets, plans and elevations. Practice and
 * check questions come from generators.ts.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher before Verified.
 */

import type { Lesson } from "@/content/lesson-types";
import type { SkillId } from "@/engine/types";
import { SOLIDS } from "./generators";

const square = (x: number, y: number): [number, number][] => [
  [x, y],
  [x + 1, y],
  [x + 1, y + 1],
  [x, y + 1],
];

export const SOLID_LESSONS: Record<SkillId, Lesson> = {
  "geo-3d-shapes": {
    skillId: "geo-3d-shapes",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters: "3D shapes are everywhere: boxes, tins, tents. Knowing their faces and nets is needed for surface area, and nets come up in exam puzzle questions.",
      byTheEnd: ["Name prisms, pyramids, cylinders, cones and spheres.", "Count faces, edges and vertices, including hidden ones.", "Tell whether a net folds into a cube, and which solid a net makes."],
    },
    teaching: {
      paragraphs: [
        "A face is a flat surface. An edge is a line where two faces meet. A vertex is a corner (more than one: vertices). Dashed lines in a drawing are edges hidden at the back: count them too.",
        "A prism has the same cross-section all the way through, with two matching ends: cubes, cuboids and triangular prisms are all prisms. A pyramid has a flat base and comes to a point. A cylinder is like a circular prism; a cone is like a circular pyramid.",
        "Check your counts with Euler's rule: faces + vertices − edges = 2. A cube: 6 + 8 − 12 = 2.",
        "A net is a flat shape that folds up into a solid. A cube net has 6 squares. To test one, pick a square as the bottom and fold the others up in your head: every square must land on a different side.",
      ],
      demo: "solid-explorer",
      examples: [
        {
          question: "How many faces, edges and vertices does a triangular prism have?",
          visual: { kind: "solid", solid: SOLIDS[2].solid },
          steps: ["Faces: 2 triangles (the ends) + 3 rectangles = 5.", "Edges: 3 on each triangle + 3 joining them = 9.", "Vertices: 3 on each triangle = 6.", "Check: 5 + 6 − 9 = 2."],
        },
        {
          question: "Does this net fold into a cube?",
          visual: {
            kind: "plane",
            plane: {
              x: [-0.4, 4.4],
              y: [-0.4, 3.4],
              shapes: [square(0, 1), square(1, 1), square(2, 1), square(3, 1), square(1, 2), square(2, 0)].map((points) => ({ points, tone: "object" as const })),
              description: "Four squares in a row, with one square above the second and one below the third.",
            },
          },
          steps: ["Use the second square as the bottom.", "The first and third squares fold up as the left and right sides; the fourth folds over to make the top.", "The square above folds up as the back; the square below the third folds round to be the front.", "Every side is covered once, so yes, it's a cube net."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "geo-plans-elevations": {
    skillId: "geo-plans-elevations",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters: "Architects and designers draw buildings from above and from the side. At GCSE you draw or recognise plans and elevations, usually on squared paper.",
      byTheEnd: ["Know what a plan, front elevation and side elevation are.", "Draw the views of a solid made of cubes.", "Know the views of cylinders, cones and pyramids."],
    },
    teaching: {
      paragraphs: [
        "The plan is the view from directly above. The front elevation is the view looking straight at the front. The side elevation is the view looking straight at the side.",
        "Views are flat: you can't see depth. For a solid made of cubes, the plan shows one square for every stack, however tall it is.",
        "In an elevation, each column shows the tallest stack in that line, even if it's behind a shorter one.",
        "Keep left and right the right way round: imagine standing where the arrow is, and draw what's on your left on the left.",
        "Curved solids: a cylinder standing up has a circle as its plan and a rectangle as its elevation. A cone has a circle plan (with a dot for the point) and a triangle elevation.",
      ],
      demo: "cube-views",
      examples: [
        {
          question: "Draw the plan and front elevation of this solid.",
          visual: { kind: "cubes", cubes: { heights: [[2, 1, 1], [3, 0, 1]], showFront: true, description: "A solid of cubes. Front row, left to right: 2, 1, 1. Back row: 3, 0, 1." } },
          steps: ["Plan: from above, every stack is one square. The front row has 3 stacks, the back row has 2 (left and right), so 5 squares.", "Front elevation: the tallest stack in each column, left to right: 3 (the back stack is taller), 1, 1.", "So the front elevation is a column of 3 squares, then two single squares."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },
};
