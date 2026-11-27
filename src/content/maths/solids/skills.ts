/**
 * 3D shapes, nets, plans and elevations (KS3/KS4, GCSE Foundation G12, G13).
 * Skill ids and prerequisites copy the GCSE Foundation topic map.
 *
 * STATUS: Draft. Written by the build team; needs review by a qualified maths
 * teacher before it is marked Verified.
 */

import type { Misconception, Skill } from "@/engine/types";

export const SOLID_SKILLS: Skill[] = [
  {
    id: "geo-3d-shapes",
    topic: "3D shapes",
    name: "Faces, edges, vertices and nets of 3D shapes",
    objective: "I can name 3D shapes, count their faces, edges and vertices, and tell which nets fold up into them.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: ["geo-shape-properties"],
  },
  {
    id: "geo-plans-elevations",
    topic: "3D shapes",
    name: "Plans and elevations",
    objective: "I can draw or pick the plan, front elevation and side elevation of a 3D shape.",
    typicalYear: 9,
    gcseTier: "foundation",
    prerequisites: ["geo-3d-shapes"],
  },
];

const mc = (id: string, label: string, explanation: string, pointsTo?: string): [string, Misconception] => [id, { id, label, explanation, pointsTo }];

export const SOLID_MISCONCEPTIONS: Record<string, Misconception> = Object.fromEntries([
  mc("fev-visible-only", "Only counted what you can see", "Some faces, edges and corners are hidden at the back (the dashed lines show hidden edges). Count those too. Check with the rule faces + vertices − edges = 2."),
  mc("fev-mixed", "Mixed up faces, edges and vertices", "Faces are the flat surfaces. Edges are the lines where two faces meet. Vertices are the corners, where edges meet."),
  mc("solid-names", "Mixed up the names of 3D shapes", "A prism has the same shape all the way through, with two matching ends. A pyramid comes to a point. A cylinder is a circular prism; a cone is a circular pyramid."),
  mc("net-not-cube", "Picked a net that doesn't fold into a cube", "Imagine folding it: in that net two squares end up on the same side of the cube and one side is left open. A cube net never has four squares around one corner, or more than four in a row."),
  mc("net-solid-match", "Matched the net to the wrong solid", "Look at the shapes in the net. Two triangles and three rectangles fold into a triangular prism. A square with four triangles makes a square-based pyramid. Four triangles make a triangular pyramid. Six rectangles make a cuboid."),

  mc("elev-front-side", "Mixed up the front and side elevations", "The front elevation is what you see looking straight at the front (follow the 'Front' arrow). The side elevation is what you see from the side."),
  mc("elev-plan", "Picked the plan instead of an elevation", "The plan is the view from directly above. Elevations are views from the front or side, so they show the height of the stacks."),
  mc("elev-not-plan", "Picked an elevation instead of the plan", "The plan is the view from directly above: it shows the floor area the solid covers, not how tall it is."),
  mc("elev-mirrored", "Drew the view the wrong way round", "Imagine standing where the arrow is. Whatever is on your left must be on the left of your drawing."),
  mc("elev-heights", "Got the height of a stack wrong", "In an elevation each column shows the tallest stack in that line, even if it is behind a shorter one."),
  mc("cubes-top-only", "Only counted the cubes on top", "Count every cube in each stack, not just the top ones. A stack 3 high has 3 cubes."),
  mc("cubes-front-only", "Only counted the cubes at the front", "Cubes behind the front row count too. Add up the stacks row by row."),
  mc("plan-counted-cubes", "Counted cubes instead of squares in the plan", "The plan is the view from above, so a stack of cubes shows as just one square."),
  mc("views-mixed", "Mixed up what the views look like", "Imagine looking at the solid from exactly above (plan), or straight at the front or side (elevations). A cylinder standing up looks like a circle from above and a rectangle from the front."),
]);
