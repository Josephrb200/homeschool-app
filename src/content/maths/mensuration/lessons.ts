/**
 * Lesson content for answers in terms of π, semicircles and composite shapes,
 * arcs and sectors, spheres, cones and pyramids, and area and volume units.
 * Practice and check questions come from generators.ts; pictures use the same
 * builders, so they are drawn to scale.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher before Verified.
 */

import type { Lesson } from "@/content/lesson-types";
import type { SkillId } from "@/engine/types";
import { circlePart, cmSquarePic, cubeSolid, rectSemi, sectorPic } from "./generators";

export const MENSURATION_LESSONS: Record<SkillId, Lesson> = {
  "geo-exact-pi": {
    skillId: "geo-exact-pi",
    status: "draft",
    minutes: 15,
    intro: {
      whyItMatters: "Exam questions often say 'give your answer in terms of π'. It's quicker than using a calculator, and it's exact: nothing is lost to rounding.",
      byTheEnd: ["Write a circle's area or circumference in terms of π.", "Find the radius from an answer in terms of π."],
    },
    teaching: {
      paragraphs: [
        "π is a number (about 3.14159…). 'In terms of π' means: do all the other working, but don't turn π into a decimal. Write the number first, then π, like 25π. This is just like algebra: 25π means 25 × π.",
        "Area = π × r². For radius 5: π × 5² = π × 25 = 25π.",
        "Circumference = π × d. For radius 5 the diameter is 10, so the circumference is 10π.",
        "Working backwards: if the area is 36π, then r² = 36, so r = 6. If the circumference is 14π, the diameter is 14, so the radius is 7.",
      ],
      demo: "pi-exact",
      examples: [
        {
          question: "Find the area of a circle with radius 7 cm. Give your answer in terms of π.",
          visual: { kind: "plane", plane: circlePart("whole", 7, "7 cm") },
          steps: ["Area = π × r² = π × 7².", "7² = 49.", "Area = 49π cm²."],
        },
        {
          question: "A circle has area 64π cm². Find its radius.",
          visual: { kind: "plane", plane: circlePart("whole", 8, "? cm") },
          steps: ["π × r² = 64π, so r² = 64.", "r = √64 = 8 cm."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "geo-circle-composite": {
    skillId: "geo-circle-composite",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters: "Real shapes are often made of rectangles and parts of circles: running tracks, windows, gardens. These questions are common on GCSE papers.",
      byTheEnd: ["Find the area and perimeter of a semicircle and a quarter circle.", "Find the area of shapes made of rectangles and parts of circles."],
    },
    teaching: {
      paragraphs: [
        "A semicircle is half a circle. Its area is half of π × r². A quarter circle's area is a quarter of π × r².",
        "Perimeter is the distance all the way round, so don't forget the straight edges. A semicircle's perimeter = half the circumference + the diameter. A quarter circle's perimeter = a quarter of the circumference + two radii.",
        "Watch out: if you're given the diameter, halve it to get the radius before using π × r².",
        "For a composite shape, split it into parts you know. Add the parts, or take away a part that's cut out. Write down each part's area before you add them.",
      ],
      demo: "circle-parts",
      examples: [
        {
          question: "Find the perimeter of a semicircle with diameter 10 cm. Give your answer to 1 decimal place.",
          visual: { kind: "plane", plane: circlePart("half", 5, "10 cm", "diameter") },
          steps: ["Curved part = π × 10 ÷ 2 = 15.707…", "Add the straight diameter: 15.707… + 10 = 25.707…", "Perimeter = 25.7 cm (1 d.p.)."],
        },
        {
          question: "Find the area of this shape. Give your answer to 1 decimal place.",
          visual: { kind: "plane", plane: rectSemi(8, 6, "8 cm", "6 cm") },
          steps: ["Rectangle: 8 × 6 = 48 cm².", "Semicircle: the diameter is 6, so r = 3. π × 3² ÷ 2 = 14.137…", "Total = 48 + 14.137… = 62.1 cm² (1 d.p.)."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "geo-arcs-sectors": {
    skillId: "geo-arcs-sectors",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters: "A sector is a slice of a circle, like a slice of pizza or a pie chart. One idea, the fraction angle ÷ 360, unlocks every arc and sector question.",
      byTheEnd: ["Find the arc length of a sector.", "Find the area of a sector.", "Find the perimeter of a sector."],
    },
    teaching: {
      paragraphs: [
        "A sector is part of a circle between two radii. Its angle tells you what fraction of the whole circle it is: angle ÷ 360. A 90° sector is 90/360 = ¼ of the circle.",
        "Sector area = angle/360 × π × r². Find the whole circle's area, then take that fraction of it.",
        "Arc length = angle/360 × π × d (or angle/360 × 2 × π × r). The arc is the curved edge.",
        "Sector perimeter = arc length + two radii. Don't forget the two straight edges.",
      ],
      demo: "sector-explore",
      examples: [
        {
          question: "A sector has radius 6 cm and angle 120°. Find its area to 1 decimal place.",
          visual: { kind: "plane", plane: sectorPic(120, 6, "6 cm", "120°") },
          steps: ["Fraction of the circle: 120/360 = ⅓.", "Whole circle: π × 6² = 113.097…", "Sector: ⅓ × 113.097… = 37.699… = 37.7 cm² (1 d.p.)."],
        },
        {
          question: "Find the perimeter of the same sector, to 1 decimal place.",
          visual: { kind: "plane", plane: sectorPic(120, 6, "6 cm", "120°") },
          steps: ["Arc = 120/360 × 2 × π × 6 = 12.566…", "Add two radii: 12.566… + 6 + 6 = 24.566…", "Perimeter = 24.6 cm (1 d.p.)."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "geo-spheres-cones-pyramids": {
    skillId: "geo-spheres-cones-pyramids",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters: "Ice cream cones, footballs and pyramids. At Foundation the formulae are given in the question: the skill is picking the right numbers and putting them in carefully.",
      byTheEnd: ["Find the volume of a pyramid, cone and sphere.", "Find the surface area of a sphere and a cone.", "Use the right height: perpendicular or slant."],
    },
    teaching: {
      paragraphs: [
        "A pyramid fills exactly a third of the prism it fits in. Volume of a pyramid = ⅓ × base area × height. A cone is a circular pyramid: volume = ⅓ × π × r² × h.",
        "h is the perpendicular height: straight up from the middle of the base. l is the slant height: down the sloping side. Volume uses h. The cone's curved surface area, π × r × l, uses l.",
        "Sphere: volume = 4/3 × π × r³, surface area = 4 × π × r². A hemisphere is half a sphere.",
        "Read the formula in the question, write it down, then replace each letter with its number. Square or cube first, then multiply.",
      ],
      demo: "solid-volume",
      examples: [
        {
          question: "A cone has radius 3 cm and height 4 cm. Volume = ⅓ × π × r² × h. Find its volume to 1 decimal place.",
          visual: { kind: "solid", solid: { kind: "cone", r: 3, h: 4, rText: "3 cm", hText: "4 cm", slantText: "5 cm", description: "A cone with radius 3 cm, height 4 cm and slant height 5 cm." } },
          steps: ["r² = 9.", "π × 9 × 4 = 113.097…", "⅓ of that = 37.699… = 37.7 cm³ (1 d.p.). The slant height (5 cm) isn't used for volume."],
        },
        {
          question: "A sphere has radius 3 cm. Volume = 4/3 × π × r³. Find its volume to 1 decimal place.",
          visual: { kind: "solid", solid: { kind: "sphere", r: 3, rText: "3 cm", description: "A sphere with radius 3 cm." } },
          steps: ["r³ = 3 × 3 × 3 = 27.", "4/3 × π × 27 = 113.097…", "Volume = 113.1 cm³ (1 d.p.)."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "geo-area-volume-units": {
    skillId: "geo-area-volume-units",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters: "Area and volume units don't convert like lengths, and this catches lots of people out. Litres matter for real things like fish tanks, paint and medicine.",
      byTheEnd: ["Convert between mm², cm² and m².", "Convert between mm³, cm³ and m³.", "Change cm³ to litres."],
    },
    teaching: {
      paragraphs: [
        "1 cm = 10 mm. But a 1 cm square is 10 mm by 10 mm, so 1 cm² = 10 × 10 = 100 mm².",
        "1 m = 100 cm, so 1 m² = 100 × 100 = 10,000 cm².",
        "For volume, cube the length conversion: 1 cm³ = 10 × 10 × 10 = 1000 mm³, and 1 m³ = 100 × 100 × 100 = 1,000,000 cm³.",
        "Capacity: 1 cm³ = 1 ml, and 1 litre = 1000 cm³. So 1 m³ = 1000 litres.",
        "Going to smaller units you get more of them, so multiply. Going to bigger units, divide.",
      ],
      demo: "unit-convert",
      examples: [
        {
          question: "Change 7 cm² to mm².",
          visual: { kind: "plane", plane: cmSquarePic() },
          steps: ["1 cm² = 10 × 10 = 100 mm².", "7 × 100 = 700 mm²."],
        },
        {
          question: "Change 4 cm³ to mm³.",
          visual: { kind: "solid", solid: cubeSolid("10 mm", 2) },
          steps: ["1 cm³ = 10 × 10 × 10 = 1000 mm³.", "4 × 1000 = 4000 mm³."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },
};
