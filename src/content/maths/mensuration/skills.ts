/**
 * Circles in terms of π, semicircles and composite shapes, arcs and sectors
 * (GCSE Foundation N8, G17, G18), and volume of spheres, cones and pyramids
 * plus area and volume units (G17, G14, N13). Ids and prerequisites copy the
 * GCSE Foundation topic map.
 *
 * STATUS: Draft. Written by the build team; needs review by a qualified maths
 * teacher before it is marked Verified.
 */

import type { Misconception, Skill } from "@/engine/types";

export const CIRCLE_MORE_SKILLS: Skill[] = [
  {
    id: "geo-exact-pi",
    topic: "Circles",
    name: "Leaving answers in terms of π",
    objective: "I can give the area or circumference of a circle exactly, like 25π, and work back from an answer in terms of π.",
    typicalYear: 9,
    gcseTier: "foundation",
    prerequisites: ["geo-circle-area", "geo-circumference"],
  },
  {
    id: "geo-circle-composite",
    topic: "Circles",
    name: "Semicircles, quarter circles and composite shapes",
    objective: "I can find the area and perimeter of semicircles, quarter circles and shapes made from rectangles and parts of circles.",
    typicalYear: 9,
    gcseTier: "foundation",
    prerequisites: ["geo-circle-area", "geo-circumference", "area-compound"],
  },
  {
    id: "geo-arcs-sectors",
    topic: "Circles",
    name: "Arc length and sector area",
    objective: "I can find the arc length, area and perimeter of a sector using the fraction angle ÷ 360.",
    typicalYear: 10,
    gcseTier: "foundation",
    prerequisites: ["geo-circle-composite", "frac-of-amount"],
  },
];

export const VOLUME_MORE_SKILLS: Skill[] = [
  {
    id: "geo-spheres-cones-pyramids",
    topic: "Volume and surface area",
    name: "Volume and surface area of spheres, cones and pyramids",
    objective: "I can use the given formulae to find the volume and surface area of spheres, cones and pyramids.",
    typicalYear: 11,
    gcseTier: "foundation",
    prerequisites: ["geo-volume-prism", "geo-surface-area"],
  },
  {
    id: "geo-area-volume-units",
    topic: "Volume and surface area",
    name: "Converting area and volume units, and litres",
    objective: "I can convert between cm², mm² and m², between cm³, mm³ and m³, and between cm³ and litres.",
    typicalYear: 9,
    gcseTier: "foundation",
    prerequisites: ["num-units", "geo-volume-cuboid"],
  },
];

const mc = (id: string, label: string, explanation: string, pointsTo?: string): [string, Misconception] => [id, { id, label, explanation, pointsTo }];

export const MENSURATION_MISCONCEPTIONS: Record<string, Misconception> = Object.fromEntries([
  mc("pi-not-squared", "Forgot to square the radius", "Area = π × r². Square the radius first: r × r, not r on its own."),
  mc("pi-reverse-root", "Forgot the square root", "If the area is 49π, then r² = 49. The radius is the number that squares to make 49: √49 = 7."),
  mc("pi-reverse-diameter", "Gave the diameter instead of the radius", "Circumference = π × diameter. If C = 18π the diameter is 18, so the radius is half of that."),
  mc("pi-semicircle-full", "Forgot to halve for a semicircle", "A semicircle is half a circle, so its area is half of π × r²."),

  mc("comp-forgot-halve", "Used the whole circle", "This is only part of a circle. Find the whole circle's area, then halve it for a semicircle or quarter it for a quarter circle."),
  mc("comp-quarter-as-half", "Halved instead of quartering", "A quarter circle is a quarter of the whole circle: divide by 4, not 2."),
  mc("comp-perim-no-straight", "Forgot the straight edges", "The perimeter goes all the way round: the curved part and the straight edges. A semicircle has its diameter as a straight edge; a quarter circle has two radii."),
  mc("comp-perim-whole-circle", "Used the whole circumference", "Only part of the circle's edge is used. Halve the circumference for a semicircle, or quarter it for a quarter circle."),
  mc("comp-shaded-wrong", "Found the wrong part", "Check which part is shaded. Here it's what is left of the square after the quarter circle is cut out: square − quarter circle."),
  mc("comp-added", "Added instead of subtracting", "The quarter circle is cut out of the square, so take its area away."),

  mc("sector-forgot-fraction", "Forgot the fraction of the circle", "A sector is only part of a circle. Multiply the whole circle's area (or circumference) by angle ÷ 360."),
  mc("sector-percent", "Divided the angle by 100", "A full turn is 360°, not 100. The fraction of the circle is angle ÷ 360."),
  mc("sector-used-arc", "Used the circumference for the area", "Sector area uses π × r². Arc length uses π × d. Check which one the question asks for."),
  mc("sector-used-area", "Used the area for the arc length", "Arc length is a length, so it uses the circumference π × d (or 2 × π × r), not π × r²."),
  mc("sector-perim-arc-only", "Forgot the two radii", "A sector's perimeter is the arc plus the two straight radii."),

  mc("scp-forgot-third", "Forgot the ⅓", "A cone or pyramid fills a third of the prism or cylinder around it. Multiply by ⅓ (divide by 3)."),
  mc("scp-r-not-squared", "Forgot to square the radius", "The cone's volume uses r², so multiply the radius by itself."),
  mc("scp-slant-height", "Mixed up the slant height and the height", "Volume uses the perpendicular height h (straight up). The curved surface uses the slant height l (down the side)."),
  mc("scp-r-power", "Used the wrong power of r", "Volume is in cubic units, so a sphere's volume uses r³ (r × r × r). Surface area uses r²."),
  mc("scp-area-vol", "Mixed up volume and surface area", "Volume is the space inside (cubed units, 4/3 × π × r³). Surface area is the outside covering (squared units, 4 × π × r²)."),
  mc("scp-forgot-4", "Left out the 4", "A sphere's surface area is 4 × π × r²: exactly four circles of the same radius."),
  mc("scp-hemisphere-full", "Used the whole sphere", "A hemisphere is half a sphere, so halve the sphere's volume."),
  mc("scp-forgot-base", "Forgot the base", "Total surface area includes the flat circle at the bottom: add π × r²."),

  mc("units-area-linear", "Used the length conversion for area", "1 cm = 10 mm, but 1 cm² is a 10 mm by 10 mm square: 100 mm². Square the length conversion. 1 m² = 100 × 100 = 10,000 cm²."),
  mc("units-vol-linear", "Used the wrong conversion for volume", "1 cm³ is a 10 mm × 10 mm × 10 mm cube: 1000 mm³. Cube the length conversion. 1 m³ = 100 × 100 × 100 = 1,000,000 cm³."),
  mc("units-direction", "Multiplied instead of dividing (or the reverse)", "Smaller units mean more of them: multiply going to smaller units, divide going to bigger units."),
  mc("units-litre", "Used the wrong litre fact", "1 litre = 1000 cm³ (and 1 cm³ = 1 ml). 1 m³ = 1000 litres."),
  mc("units-not-converted", "Didn't change the units", "The question wants a different unit. Work out the volume in cm³ first, then change to litres by dividing by 1000."),
]);
