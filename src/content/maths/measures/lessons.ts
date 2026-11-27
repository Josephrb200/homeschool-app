/**
 * Lesson content for perimeter, circles, and volume and surface area
 * (six stages, like every chain). Practice and check questions come from
 * generators.ts.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher before Verified.
 */

import type { Lesson } from "@/content/lesson-types";
import type { SkillId } from "@/engine/types";

export const MEASURES_LESSONS: Record<SkillId, Lesson> = {
  "geo-perimeter": {
    skillId: "geo-perimeter",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "Perimeter is the distance round the edge of a shape: fencing for a garden, skirting board for a room, a frame for a picture. It's also a classic exam trap, because it's easy to mix up with area.",
      byTheEnd: [
        "Find the perimeter of a rectangle when only two sides are labelled.",
        "Work out missing sides on an L-shape.",
        "Find a missing length when you know the perimeter.",
      ],
    },
    teaching: {
      paragraphs: [
        "The perimeter is the total distance all the way round the outside of a shape. Imagine walking round the edge: perimeter is how far you walk. It's a length, so the units are cm or m (no little ²).",
        "To find it, add up every side. Start at one corner, go round, and stop when you're back where you started. Ticking off each side as you add it stops you missing one.",
        "A rectangle often has only two sides labelled. The other two match the sides opposite them. So a rectangle 7 cm by 3 cm has perimeter 7 + 3 + 7 + 3 = 20 cm.",
        "On an L-shape, some sides may have no number. Use the long sides: the two short sides along the top add up to the full bottom, and the two short sides on the right add up to the full left side.",
        "Area is different: it's the space inside, measured in squares (cm²). Perimeter is round the edge (cm).",
      ],
      demo: "perimeter-walk",
      examples: [
        {
          question: "Find the perimeter of this rectangle.",
          shape: {
            points: [
              [0, 0],
              [9, 0],
              [9, 4],
              [0, 4],
            ],
            sides: [
              { i: 0, text: "9 cm" },
              { i: 3, text: "4 cm" },
            ],
            right: [[0, 0]],
            description: "A rectangle 9 cm long and 4 cm wide.",
          },
          steps: ["Opposite sides are equal, so the sides are 9, 4, 9 and 4.", "Perimeter = 9 + 4 + 9 + 4", "= 26 cm"],
        },
        {
          question: "Find the perimeter of this L-shape.",
          shape: {
            points: [
              [0, 0],
              [10, 0],
              [10, 4],
              [6, 4],
              [6, 7],
              [0, 7],
            ],
            sides: [
              { i: 0, text: "10 cm" },
              { i: 1, text: "4 cm" },
              { i: 4, text: "6 cm" },
              { i: 5, text: "7 cm" },
            ],
            description: "An L-shape. Bottom 10 cm, lower right side 4 cm, top 6 cm, left side 7 cm. Two sides have no label.",
          },
          steps: [
            "The missing across side: the top pieces add up to the bottom, so 10 − 6 = 4 cm.",
            "The missing up side: the right pieces add up to the left, so 7 − 4 = 3 cm.",
            "Perimeter = 10 + 4 + 4 + 3 + 6 + 7",
            "= 34 cm",
          ],
        },
      ],
    },
    counts: { guided: 4, independent: 4, check: 5 },
  },

  "geo-circle-parts": {
    skillId: "geo-circle-parts",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "Every circle question in an exam uses these words. If you know which length is the radius and which is the diameter, the circle formulas become straightforward.",
      byTheEnd: ["Name the parts of a circle.", "Tell a sector from a segment, and a chord from a diameter.", "Use diameter = 2 × radius."],
    },
    teaching: {
      paragraphs: [
        "The centre is the point exactly in the middle. Every point on the edge is the same distance from it.",
        "The radius is a straight line from the centre to the edge. The diameter goes all the way across through the centre, so it's two radii end to end: diameter = 2 × radius, and radius = diameter ÷ 2.",
        "The circumference is the distance all the way round the edge. It's the circle's perimeter. An arc is just part of the edge.",
        "A chord is a straight line from edge to edge that doesn't go through the centre. (A diameter is the longest possible chord.) A tangent is a straight line outside the circle that just touches it at one point.",
        "Two regions: a sector is a slice from the centre, like a slice of pizza. A segment is the piece cut off by a chord, and it doesn't reach the centre.",
      ],
      demo: "circle-parts",
      examples: [
        {
          question: "The radius of a circle is 6 cm. What is the diameter?",
          visual: { kind: "circle", circle: { parts: [{ part: "radius", text: "6 cm" }], description: "A circle with radius 6 cm." } },
          steps: ["The diameter is two radii end to end.", "Diameter = 2 × 6 = 12 cm"],
        },
        {
          question: "Is the highlighted region a sector or a segment?",
          visual: {
            kind: "circle",
            circle: { parts: [{ part: "segment" }], highlight: "segment", description: "A circle with the piece cut off by a straight line across it highlighted. It doesn't reach the centre." },
          },
          steps: ["Does the region have a point at the centre? No.", "It's cut off by a straight line (a chord).", "So it's a segment."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "geo-circumference": {
    skillId: "geo-circumference",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Wheels, running tracks, round tables and pipes all need the distance round a circle. It's one of the most common Foundation exam questions.",
      byTheEnd: ["Use C = π × d.", "Double the radius when you're given the radius.", "Round your answer to 1 decimal place."],
    },
    teaching: {
      paragraphs: [
        "Take any circle and measure round its edge. It's always a bit more than 3 times the diameter. The exact number is called π (pi, said 'pie'). π = 3.14159… and the digits go on forever.",
        "So: circumference = π × diameter, written C = π × d. Use the π button on your calculator.",
        "If you're given the radius, double it first to get the diameter. (Or use C = 2 × π × r, which is the same thing.)",
        "Your calculator will show a long decimal. Round it to 1 decimal place: look at the second digit after the point. If it's 5 or more, round up. 31.415… becomes 31.4.",
        "If a question says use π = 3.14, that's fine too. The answer will be very slightly different, and this app accepts either.",
      ],
      demo: "circumference-unroll",
      examples: [
        {
          question: "Find the circumference of a circle with diameter 8 cm. Give your answer to 1 decimal place.",
          visual: { kind: "circle", circle: { parts: [{ part: "diameter", text: "8 cm" }], description: "A circle with diameter 8 cm." } },
          steps: ["C = π × d", "= π × 8", "= 25.132…", "= 25.1 cm (1 d.p.)"],
        },
        {
          question: "Find the circumference of a circle with radius 5 m. Give your answer to 1 decimal place.",
          visual: { kind: "circle", circle: { parts: [{ part: "radius", text: "5 m" }], description: "A circle with radius 5 m." } },
          steps: ["This is the radius, so double it: d = 2 × 5 = 10 m.", "C = π × 10 = 31.415…", "= 31.4 m (1 d.p.)"],
        },
      ],
    },
    counts: { guided: 4, independent: 4, check: 5 },
  },

  "geo-circle-area": {
    skillId: "geo-circle-area",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "How much pizza, how much grass in a round lawn, how much paint for a round sign: all need the area of a circle. It's also the first step to the volume of a cylinder.",
      byTheEnd: ["Explain where A = π × r² comes from.", "Use it with a radius or a diameter.", "Tell it apart from the circumference formula."],
    },
    teaching: {
      paragraphs: [
        "Cut a circle into lots of thin slices and lay them top to bottom. They make a shape that's almost a rectangle. Its height is the radius, r, and its length is half the circumference, π × r.",
        "Rectangle area = length × height = π × r × r. So the area of a circle is A = π × r², where r² means r × r.",
        "Square the radius first, then multiply by π. Only the r is squared, not the π.",
        "If you're given the diameter, halve it to get the radius before you start. This is the most common mistake in exams.",
        "Area is measured in squares, so the units have a ²: cm² or m². Round to 1 decimal place like before.",
      ],
      demo: "circle-area-rearrange",
      examples: [
        {
          question: "Find the area of a circle with radius 4 cm. Give your answer to 1 decimal place.",
          visual: { kind: "circle", circle: { parts: [{ part: "radius", text: "4 cm" }], description: "A circle with radius 4 cm." } },
          steps: ["A = π × r²", "= π × 4² = π × 16", "= 50.265…", "= 50.3 cm² (1 d.p.)"],
        },
        {
          question: "Find the area of a circle with diameter 10 m. Give your answer to 1 decimal place.",
          visual: { kind: "circle", circle: { parts: [{ part: "diameter", text: "10 m" }], description: "A circle with diameter 10 m." } },
          steps: ["This is the diameter, so halve it: r = 10 ÷ 2 = 5 m.", "A = π × 5² = π × 25", "= 78.539…", "= 78.5 m² (1 d.p.)"],
        },
      ],
    },
    counts: { guided: 4, independent: 4, check: 5 },
  },

  "geo-volume-cuboid": {
    skillId: "geo-volume-cuboid",
    status: "draft",
    minutes: 20,
    intro: {
      whyItMatters:
        "Volume tells you how much space something takes up or holds: a fish tank, a box, a room. Every other volume formula builds on the cuboid.",
      byTheEnd: ["Find the volume of a cuboid and give the units.", "Explain why volume is length × width × height.", "Find a missing length when you know the volume."],
    },
    teaching: {
      paragraphs: [
        "Volume is the amount of space inside a 3D shape. We measure it in cubes: a 1 cm by 1 cm by 1 cm cube has a volume of 1 cubic centimetre, written 1 cm³.",
        "Think in layers. The front face of a cuboid 4 cm wide and 3 cm tall holds 4 × 3 = 12 cubes. If it's 5 cm long, there are 5 layers like that: 12 × 5 = 60 cubes. So the volume is 60 cm³.",
        "That's why volume of a cuboid = length × width × height. It doesn't matter which order you multiply in.",
        "The little ³ means 'cubed', because volume is counted in cubes. Lengths are in cm, areas in cm², volumes in cm³.",
      ],
      demo: "cuboid-layers",
      examples: [
        {
          question: "Find the volume of this cuboid.",
          visual: {
            kind: "solid",
            solid: {
              kind: "prism",
              face: {
                points: [
                  [0, 0],
                  [6, 0],
                  [6, 3],
                  [0, 3],
                ],
                sides: [
                  { i: 0, text: "6 cm" },
                  { i: 3, text: "3 cm" },
                ],
                description: "",
              },
              length: 4,
              lengthText: "4 cm",
              description: "A cuboid 6 cm wide, 3 cm tall and 4 cm long.",
            },
          },
          steps: ["Volume = length × width × height", "= 6 × 3 × 4", "= 18 × 4 = 72 cm³"],
        },
        {
          question: "A cuboid has a volume of 90 m³. It is 5 m wide and 3 m tall. How long is it?",
          steps: ["Width × height = 5 × 3 = 15.", "15 × length = 90, so divide: 90 ÷ 15 = 6.", "The length is 6 m."],
        },
      ],
    },
    counts: { guided: 4, independent: 4, check: 5 },
  },

  "geo-volume-prism": {
    skillId: "geo-volume-prism",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters:
        "Lots of real objects are prisms: a tent, a chocolate bar box, a length of guttering, a tin of beans (a cylinder). One idea works for all of them.",
      byTheEnd: [
        "Spot the cross-section of a prism.",
        "Use volume = area of cross-section × length.",
        "Find the volume of a triangular prism and a cylinder.",
      ],
    },
    teaching: {
      paragraphs: [
        "A prism is a 3D shape that's the same shape all the way through. If you slice it anywhere along its length, you get the same face. That face is called the cross-section.",
        "Volume of any prism = area of cross-section × length. Find the area of the front face first, then multiply by how long the prism is. A cuboid is just a prism with a rectangle cross-section.",
        "For a triangular prism, the cross-section is a triangle, so its area is ½ × base × height. Don't forget the half, and use the perpendicular height, not a sloping side.",
        "A cylinder is a prism with a circle cross-section. Volume = π × r² × height. If you're given the diameter, halve it first.",
        "Volume units are cubed: cm³ or m³.",
      ],
      demo: "prism-slices",
      examples: [
        {
          question: "Find the volume of this triangular prism.",
          visual: {
            kind: "solid",
            solid: {
              kind: "prism",
              face: {
                points: [
                  [0, 0],
                  [6, 0],
                  [0, 4],
                ],
                sides: [
                  { i: 0, text: "6 cm" },
                  { i: 2, text: "4 cm" },
                ],
                right: [[0, 0]],
                description: "",
              },
              length: 10,
              lengthText: "10 cm",
              description: "A triangular prism. The front triangle has a right angle, base 6 cm and height 4 cm. The prism is 10 cm long.",
            },
          },
          steps: ["Area of triangle = ½ × 6 × 4 = 12 cm²", "Volume = area of cross-section × length", "= 12 × 10 = 120 cm³"],
        },
        {
          question: "Find the volume of this cylinder. Give your answer to 1 decimal place.",
          visual: {
            kind: "solid",
            solid: { kind: "cylinder", r: 3, h: 8, label: { on: "radius", text: "3 cm" }, hText: "8 cm", description: "A cylinder with radius 3 cm and height 8 cm." },
          },
          steps: ["Area of circle = π × 3² = π × 9 = 28.274…", "Volume = 28.274… × 8 = 226.194…", "= 226.2 cm³ (1 d.p.)"],
        },
      ],
    },
    counts: { guided: 4, independent: 4, check: 5 },
  },

  "geo-surface-area": {
    skillId: "geo-surface-area",
    status: "draft",
    minutes: 30,
    intro: {
      whyItMatters:
        "Surface area tells you how much material covers the outside of a shape: wrapping paper for a present, cardboard for a box, the label on a tin.",
      byTheEnd: [
        "Find the surface area of a cuboid by adding all six faces.",
        "Find the surface area of a triangular prism.",
        "Find the surface area of a cylinder by unrolling its curved side.",
      ],
    },
    teaching: {
      paragraphs: [
        "Surface area is the total area of all the outside faces of a 3D shape. Imagine unfolding the shape flat (that's called a net) and finding the area of every piece.",
        "A cuboid has 6 faces in 3 matching pairs: front and back, top and bottom, and the two ends. Work out one of each pair, add them, then double. Surface area is an area, so the units are cm² or m².",
        "A triangular prism has 5 faces: 2 triangles and 3 rectangles. Each rectangle is as long as the prism, and as wide as one side of the triangle.",
        "A cylinder has 2 circles (top and bottom) and a curved surface. Unroll the curved surface and it's a rectangle: its width is the circumference (π × d) and its height is the cylinder's height.",
        "Writing a list of faces before you start, and ticking each one off, is the best way not to miss one.",
      ],
      demo: "cuboid-net",
      examples: [
        {
          question: "Find the surface area of a cuboid 5 cm wide, 2 cm tall and 3 cm long.",
          visual: {
            kind: "solid",
            solid: {
              kind: "prism",
              face: {
                points: [
                  [0, 0],
                  [5, 0],
                  [5, 2],
                  [0, 2],
                ],
                sides: [
                  { i: 0, text: "5 cm" },
                  { i: 3, text: "2 cm" },
                ],
                description: "",
              },
              length: 3,
              lengthText: "3 cm",
              description: "A cuboid 5 cm wide, 2 cm tall and 3 cm long.",
            },
          },
          steps: ["Front and back: 2 × 5 × 2 = 20", "Top and bottom: 2 × 5 × 3 = 30", "Two ends: 2 × 2 × 3 = 12", "Total = 20 + 30 + 12 = 62 cm²"],
        },
        {
          question: "Find the total surface area of a cylinder with radius 2 cm and height 5 cm. Give your answer to 1 decimal place.",
          visual: {
            kind: "solid",
            solid: { kind: "cylinder", r: 2, h: 5, label: { on: "radius", text: "2 cm" }, hText: "5 cm", description: "A cylinder with radius 2 cm and height 5 cm." },
          },
          steps: [
            "Two circles: 2 × π × 2² = 25.132…",
            "Curved surface: circumference × height = π × 4 × 5 = 62.831…",
            "Total = 25.132… + 62.831… = 87.964…",
            "= 88.0 cm² (1 d.p.)",
          ],
        },
      ],
    },
    counts: { guided: 4, independent: 4, check: 5 },
  },
};
