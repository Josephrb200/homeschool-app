/**
 * Measures: perimeter, circles, and volume and surface area (KS3, GCSE
 * Foundation). Skill ids match the GCSE Foundation topic map.
 *
 * Prerequisites list only skills that are live in the app. The map also names
 * prerequisites that are not built yet (num-add-sub, num-rounding,
 * geo-shape-properties, geo-3d-shapes); add them here when those lessons exist.
 *
 * STATUS: Draft. Written by the build team; needs review by a qualified maths
 * teacher before it is marked Verified.
 */

import type { Misconception, Skill } from "@/engine/types";

export const PERIMETER_SKILLS: Skill[] = [
  {
    id: "geo-perimeter",
    topic: "Perimeter",
    name: "Perimeter of rectilinear shapes",
    objective: "I can find the perimeter of rectangles and L-shapes, including sides that aren't labelled.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: [],
  },
];

export const CIRCLE_SKILLS: Skill[] = [
  {
    id: "geo-circle-parts",
    topic: "Circles",
    name: "Parts of a circle",
    objective: "I can name the parts of a circle and use diameter = 2 × radius.",
    typicalYear: 8,
    gcseTier: "foundation",
    prerequisites: [],
  },
  {
    id: "geo-circumference",
    topic: "Circles",
    name: "Circumference of a circle",
    objective: "I can find the circumference of a circle using C = π × d, and round my answer.",
    typicalYear: 8,
    gcseTier: "foundation",
    prerequisites: ["geo-circle-parts"],
  },
  {
    id: "geo-circle-area",
    topic: "Circles",
    name: "Area of a circle",
    objective: "I can find the area of a circle using A = π × r², and round my answer.",
    typicalYear: 8,
    gcseTier: "foundation",
    prerequisites: ["geo-circle-parts", "area-rectangle"],
  },
];

export const VOLUME_SKILLS: Skill[] = [
  {
    id: "geo-volume-cuboid",
    topic: "Volume and surface area",
    name: "Volume of cuboids",
    objective: "I can find the volume of a cuboid using length × width × height, and give the units.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: ["area-rectangle"],
  },
  {
    id: "geo-volume-prism",
    topic: "Volume and surface area",
    name: "Volume of prisms and cylinders",
    objective: "I can find the volume of a prism or cylinder using area of cross-section × length.",
    typicalYear: 8,
    gcseTier: "foundation",
    prerequisites: ["geo-volume-cuboid", "area-triangle", "geo-circle-area"],
  },
  {
    id: "geo-surface-area",
    topic: "Volume and surface area",
    name: "Surface area of cuboids, prisms and cylinders",
    objective: "I can find the surface area of a cuboid, triangular prism or cylinder by adding the areas of all its faces.",
    typicalYear: 8,
    gcseTier: "foundation",
    prerequisites: ["area-triangle", "geo-circumference"],
  },
];

export const MEASURES_SKILLS = [...PERIMETER_SKILLS, ...CIRCLE_SKILLS, ...VOLUME_SKILLS];

const mc = (id: string, label: string, explanation: string, pointsTo?: string): [string, Misconception] => [id, { id, label, explanation, pointsTo }];

export const MEASURES_MISCONCEPTIONS: Record<string, Misconception> = Object.fromEntries([
  // Perimeter
  mc("perim-used-area", "Found the area instead of the perimeter", "That's the area: the space inside. Perimeter is the distance all the way round the edge. Add up the length of every side."),
  mc(
    "perim-only-labelled",
    "Only added the sides with numbers on",
    "Every side counts, even the ones without a number. Opposite sides of a rectangle are the same length. On an L-shape, work out the missing sides first, then add all six.",
  ),
  mc(
    "perim-reverse-forgot-halve",
    "Took away both widths but didn't halve",
    "Taking away both widths leaves the two lengths together. Halve that to get one length.",
  ),
  mc(
    "perim-reverse-subtract-once",
    "Took away only one width",
    "The perimeter goes round the whole rectangle, so it includes two widths. Halve the perimeter first (that's one length + one width), then take away the width.",
  ),

  // Circles
  mc("circle-radius-diameter", "Mixed up radius and diameter", "The radius goes from the centre to the edge. The diameter goes all the way across through the centre, so it's twice as long: d = 2 × r."),
  mc("circle-chord-diameter", "Called a chord a diameter", "A diameter must go through the centre. A straight line from edge to edge that misses the centre is a chord."),
  mc("circle-sector-segment", "Mixed up sector and segment", "A sector is a slice from the centre, like a slice of pizza. A segment is the piece cut off by a straight line (a chord), with no point at the centre."),
  mc("circle-arc-circumference", "Mixed up arc and circumference", "The circumference is the whole way round the edge. An arc is just part of the edge."),
  mc("circle-tangent-chord", "Mixed up tangent and chord", "A tangent stays outside the circle and just touches the edge at one point. A chord goes inside, from edge to edge."),
  mc("circle-part-names", "Mixed up the names of circle parts", "Look again at where the part is: is it a line or a region? Does it touch the centre? Does it go inside the circle?"),
  mc(
    "circle-diameter-as-radius",
    "Used the diameter as if it were the radius",
    "The length given is the diameter, all the way across. The radius is half of it. Halve the diameter first when the formula needs r.",
    "geo-circle-parts",
  ),
  mc(
    "circle-radius-in-pi-d",
    "Used the radius in C = π × d",
    "C = π × d needs the diameter. You used the radius, which is half as long, so your answer is half the size. Double the radius first, or use C = 2 × π × r.",
    "geo-circle-parts",
  ),
  mc("circle-used-area-formula", "Used the area formula instead of circumference", "πr² gives the area, the space inside. Circumference is the distance round the edge: C = π × d."),
  mc("circle-used-circumference", "Used the circumference formula instead of area", "π × d (or 2πr) gives the circumference, the distance round the edge. Area is the space inside: A = π × r × r."),
  mc("circle-squared-pi", "Squared π as well as the radius", "Only the radius is squared. Work out r × r first, then multiply by π. (π × r)² squares the π too, which makes it far too big."),
  mc("circle-reverse-radius", "Gave the radius instead of the diameter", "Dividing the circumference by 2π gives the radius. The question asks for the diameter: divide by π only."),
  mc("circle-reverse-multiplied", "Multiplied by π instead of dividing", "C = π × d, so to get d back you undo × π by dividing: d = C ÷ π."),

  // Volume and surface area
  mc("vol-added", "Added the lengths instead of multiplying", "Volume counts cubes, so multiply: length × width × height. Adding the lengths doesn't count the cubes."),
  mc("vol-one-face", "Found the area of one face only", "That's the area of the front face: one layer, flat. Volume is 3D, so also multiply by the third length (how many layers there are)."),
  mc("vol-used-surface-area", "Found the surface area instead of the volume", "That's the surface area: the outside faces added up. Volume is the space inside: length × width × height."),
  mc("vol-missing-subtracted", "Subtracted to find a missing length", "Volume = length × width × height, so to find a missing length, divide the volume by the other two lengths multiplied together."),
  mc("vol-missing-one-divide", "Divided by only one of the other lengths", "Divide the volume by both of the other lengths (multiply them together first)."),
  mc("vol-prism-forgot-half", "Forgot to halve the triangle", "The cross-section is a triangle, so its area is ½ × base × height. Halve before multiplying by the length.", "area-triangle"),
  mc("vol-cyl-used-circumference", "Used the circumference instead of the circle's area", "The cross-section of a cylinder is a circle, so find its area, π × r², then multiply by the height."),
  mc("sa-only-three-faces", "Only counted three faces", "A cuboid has six faces in three matching pairs: front and back, top and bottom, left and right. Double your total."),
  mc("sa-used-volume", "Found the volume instead of the surface area", "That's the volume: the space inside. Surface area is the total area of all the outside faces added together."),
  mc("sa-triangle-forgot-half", "Forgot to halve the triangles", "Each triangle end has area ½ × base × height. There are two of them, so together they make base × height, not 2 × base × height."),
  mc("sa-missing-face", "Missed out a face", "Count every face. A triangular prism has five: two triangles and three rectangles."),
  mc("sa-cyl-one-circle", "Only counted one circle", "A cylinder has a circle on the top and another on the bottom. Add both."),
  mc("sa-cyl-curved-pi-r", "Curved surface: used π × r instead of the circumference", "Unroll the curved surface into a rectangle. Its width is the circumference, π × d (or 2 × π × r), and its height is the cylinder's height."),
]);
