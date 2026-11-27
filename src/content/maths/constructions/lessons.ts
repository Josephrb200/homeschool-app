/**
 * Lesson content for constructions and loci. Practice and check questions come
 * from generators.ts; the pictures here use the same exact builders.
 *
 * STATUS: Draft. Needs review by a qualified maths teacher before Verified.
 */

import type { Lesson } from "@/content/lesson-types";
import type { SkillId } from "@/engine/types";
import { angleBisector, locusCircle, locusStadium, perpBisector, sssTriangle } from "./generators";

const tri = sssTriangle(5, 6, 7).plane;

export const CONSTRUCTION_LESSONS: Record<SkillId, Lesson> = {
  "geo-constructions": {
    skillId: "geo-constructions",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters: "Constructions are accurate drawings made with just a ruler and compasses. They come up on GCSE papers, and they are the tools you need for loci.",
      byTheEnd: ["Construct a perpendicular bisector and an angle bisector.", "Construct a triangle from three sides, and a 60° angle.", "Know why the constructions work."],
    },
    teaching: {
      paragraphs: [
        "You need a sharp pencil, a ruler and a pair of compasses. Never rub out the arcs: they show the examiner how you did it, and they get marks.",
        "Perpendicular bisector of AB (a line that cuts AB in half at right angles): open the compass to more than half of AB. Draw arcs from A above and below the line. Without changing the compass, do the same from B. Join the two points where the arcs cross.",
        "Every point on the perpendicular bisector is the same distance from A as from B. It crosses AB at the midpoint, at 90°.",
        "Angle bisector (a line that cuts an angle in half): draw an arc from the corner that crosses both arms. From each crossing point, draw an arc the same width so they meet inside the angle. Join the corner to where they meet.",
        "Triangle from three sides: draw one side with a ruler. Set the compass to the second side and draw an arc from one end; set it to the third side and draw an arc from the other end. Where the arcs cross is the third corner.",
        "A 60° angle: arcs with the same radius as AB, from A and from B, meet at C. Triangle ABC is equilateral, so angle CAB is 60°.",
      ],
      demo: "construct-steps",
      examples: [
        {
          question: "Construct the perpendicular bisector of AB, which is 6 cm long. How long is AM, where M is the midpoint?",
          visual: { kind: "plane", plane: { ...perpBisector(6), texts: [{ at: [1.5, -0.45], text: "6 cm" }] } },
          steps: ["Open the compass to about 4 cm (more than half of 6 cm).", "Draw arcs from A above and below AB, then from B with the same width.", "Join the two crossing points. It crosses AB at M.", "M is the midpoint, so AM = 6 ÷ 2 = 3 cm."],
        },
        {
          question: "Construct triangle ABC with AB = 7 cm, AC = 6 cm and BC = 5 cm.",
          visual: { kind: "plane", plane: tri },
          steps: ["Draw AB = 7 cm with a ruler.", "Set the compass to 6 cm and draw an arc from A (for AC).", "Set the compass to 5 cm and draw an arc from B (for BC).", "Where the arcs cross is C. Join AC and BC, and leave the arcs showing."],
        },
        {
          question: "Angle ABC is 80°. It is bisected. What size is each half?",
          visual: { kind: "plane", plane: angleBisector(80) },
          steps: ["An arc from B crosses both arms.", "Two arcs of the same width from those points meet inside the angle.", "The line from B through that point is the bisector.", "Each half is 80° ÷ 2 = 40°."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },

  "geo-loci": {
    skillId: "geo-loci",
    status: "draft",
    minutes: 25,
    intro: {
      whyItMatters: "A locus is all the points that follow a rule, like where a goat on a rope can graze. Loci questions use your constructions to solve real problems, often on a scale drawing.",
      byTheEnd: ["Know the four main loci.", "Shade a region that follows a rule.", "Use a scale with loci."],
    },
    teaching: {
      paragraphs: [
        "A locus (plural loci) is the set of all points that follow a rule. Imagine marking every point that fits, then joining them up.",
        "A fixed distance from a point: a circle with that point as its centre. 'Less than 3 m from P' is the inside of the circle; 'more than 3 m' is the outside.",
        "The same distance from two points A and B: the perpendicular bisector of AB. Points closer to A are on A's side.",
        "The same distance from two lines that meet: the bisector of the angle between them.",
        "A fixed distance from a straight line segment: two parallel lines with a semicircle round each end, like a running track.",
        "With a scale drawing, change real distances to the map first: divide by what 1 cm stands for. Shade the region that fits all the rules.",
      ],
      demo: "loci-explore",
      examples: [
        {
          question: "A goat is tied to a post with a 3 m rope. Shade where it can graze.",
          visual: { kind: "plane", plane: { ...locusCircle(3, true), grid: true } },
          steps: ["Every point the goat can reach is at most 3 m from the post.", "Those points make a circle with centre P and radius 3 m.", "Shade the inside of the circle."],
        },
        {
          question: "A dog must stay within 1.5 m of a straight fence 4 m long. Shade where the dog can be.",
          visual: { kind: "plane", plane: locusStadium(4, 1.5) },
          steps: ["Beside the fence: straight edges 1.5 m away on each side.", "Beyond each end, the nearest point is the end of the fence, so draw a semicircle of radius 1.5 m.", "Shade the whole running-track shape."],
        },
      ],
    },
    counts: { guided: 5, independent: 5, check: 5 },
  },
};
