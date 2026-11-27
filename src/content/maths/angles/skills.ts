/**
 * Angles and properties of shapes (KS3, GCSE Foundation G1, G3, G4).
 * Skill ids and prerequisites copy the GCSE Foundation topic map.
 *
 * STATUS: Draft. Written by the build team; needs review by a qualified maths
 * teacher before it is marked Verified.
 */

import type { Misconception, Skill } from "@/engine/types";

export const ANGLE_SKILLS: Skill[] = [
  {
    id: "geo-angle-basics",
    topic: "Angles",
    name: "Angle types, notation and labelling",
    objective: "I can say whether an angle is acute, right, obtuse or reflex, and name an angle like ∠ABC.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: [],
  },
  {
    id: "geo-angle-facts",
    topic: "Angles",
    name: "Angles at a point, on a line, vertically opposite",
    objective: "I can find missing angles on a straight line, around a point, and where two lines cross.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: ["geo-angle-basics"],
  },
  {
    id: "geo-shape-properties",
    topic: "Shapes",
    name: "Properties of triangles, quadrilaterals and polygons",
    objective: "I can name triangles, quadrilaterals and polygons from their sides and angles.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: ["geo-angle-basics"],
  },
  {
    id: "geo-triangle-quad-angles",
    topic: "Angles",
    name: "Angles in triangles and quadrilaterals",
    objective: "I can find missing angles in triangles (including isosceles) and quadrilaterals.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: ["geo-angle-facts", "geo-shape-properties"],
  },
  {
    id: "geo-parallel-angles",
    topic: "Angles",
    name: "Angles in parallel lines (alternate, corresponding)",
    objective: "I can find missing angles in parallel lines and say whether they are alternate, corresponding or co-interior.",
    typicalYear: 8,
    gcseTier: "foundation",
    prerequisites: ["geo-angle-facts"],
  },
  {
    id: "geo-polygon-angles",
    topic: "Angles",
    name: "Interior and exterior angles of polygons",
    objective: "I can find the interior and exterior angles of polygons, including regular polygons.",
    typicalYear: 9,
    gcseTier: "foundation",
    prerequisites: ["geo-triangle-quad-angles"],
  },
];

const mc = (id: string, label: string, explanation: string, pointsTo?: string): [string, Misconception] => [id, { id, label, explanation, pointsTo }];

export const ANGLE_MISCONCEPTIONS: Record<string, Misconception> = Object.fromEntries([
  // Angle types and notation
  mc("angle-type-acute-obtuse", "Mixed up acute and obtuse", "Acute angles are smaller than a right angle (less than 90°): sharp, like the tip of a pencil. Obtuse angles are bigger than 90° but less than 180°."),
  mc("angle-type-reflex", "Mixed up reflex with another type", "A reflex angle is more than a straight line: bigger than 180°. Check which side of the lines the angle is marked on."),
  mc("angle-type-right", "Mixed up a right angle with another type", "A right angle is exactly 90°, a quarter turn, like the corner of a page. It's marked with a small square."),
  mc("angle-type-straight", "Mixed up a straight angle with another type", "A straight angle is exactly 180°: the two arms make a straight line. Half a turn."),
  mc("angle-turns-mixed", "Mixed up a full turn and half a turn", "A full turn is 360°. Half a turn (a straight line) is 180°. A quarter turn (a right angle) is 90°."),
  mc("angle-notation-middle", "Picked the wrong letter for the corner", "In ∠ABC the middle letter, B, is the corner (the vertex) where the angle is. The other two letters are points on the two arms."),

  // Angle facts
  mc("angle-line-used-360", "Used 360° for a straight line", "Angles on a straight line add up to 180°, not 360°. 360° is for a full turn, all the way round a point.", "geo-angle-basics"),
  mc("angle-point-used-180", "Used 180° around a point", "Angles all the way round a point make a full turn, so they add up to 360°. 180° is only for angles on a straight line.", "geo-angle-basics"),
  mc("angle-vertopp-supplementary", "Thought vertically opposite angles add to 180°", "Vertically opposite angles are across from each other where two lines cross, and they are equal. It's angles next to each other on a line that add to 180°."),
  mc("angle-adjacent-equal", "Thought angles next to each other are equal", "These two angles sit next to each other on a straight line, so they add up to 180°. It's the angles opposite each other that are equal."),
  mc("angle-forgot-halve", "Forgot to share between the equal angles", "After taking away, what's left is shared between the equal angles. Divide by how many equal angles there are."),

  // Shape properties
  mc("shape-tri-ticks", "Misread the equal sides", "Count the sides that are the same length (or have the same tick marks). 3 equal = equilateral, 2 equal = isosceles, none equal = scalene."),
  mc("shape-square-rhombus", "Mixed up square and rhombus", "Both have four equal sides. A square also has four right angles; a rhombus is a 'pushed over' square with no right angles."),
  mc("shape-rect-parallelogram", "Mixed up rectangle and parallelogram", "Both have two pairs of parallel sides. A rectangle has four right angles; a parallelogram is a 'pushed over' rectangle with no right angles."),
  mc("shape-parallelogram-rhombus", "Mixed up parallelogram and rhombus", "A rhombus has all four sides equal. A parallelogram has opposite sides equal, but next-door sides can be different."),
  mc("shape-trapezium", "Mixed up trapezium with another quadrilateral", "A trapezium has exactly one pair of parallel sides. Parallelograms, rhombuses, rectangles and squares have two pairs."),
  mc("shape-kite", "Mixed up kite with another quadrilateral", "A kite has two pairs of equal sides that are next to each other (not opposite), and no parallel sides."),
  mc("shape-quad-names", "Mixed up the quadrilateral names", "Check three things: are any sides parallel (arrows)? Which sides are equal (ticks)? Are there right angles (squares)?"),
  mc("shape-polygon-names", "Mixed up the polygon names", "Count the sides. Pent = 5, hex = 6, hept = 7, oct = 8 (like an octopus), non = 9, dec = 10."),

  // Triangles and quadrilaterals
  mc("angle-forgot-right", "Forgot to count the right angle", "The little square means a right angle: 90°. Include it when you add up the angles."),
  mc("tri-used-360", "Used 360° for a triangle", "The angles in a triangle add up to 180°. 360° is for quadrilaterals (four-sided shapes)."),
  mc("quad-used-180", "Used 180° for a quadrilateral", "The angles in a quadrilateral add up to 360°. A quadrilateral splits into two triangles: 2 × 180° = 360°."),
  mc("iso-forgot-halve", "Didn't halve for the two equal angles", "In an isosceles triangle the two base angles are equal. Take the top angle from 180°, then halve what's left, because it's shared between two equal angles."),
  mc("iso-forgot-second-base", "Forgot the other equal angle", "The two angles at the ends of the equal sides' base are equal, so there are two of them. Take both from 180°."),
  mc("iso-wrong-pair", "Thought the wrong angles were equal", "The equal angles are the two at the bottom of the equal sides (opposite the equal sides), not the one between them."),
  mc("tri-ext-gave-interior", "Gave the angle inside the triangle", "The angle you want is outside the triangle, on the straight line. Find the inside angle first, then take it from 180°."),
  mc("para-angles", "Mixed up which angles in a parallelogram are equal", "In a parallelogram, opposite angles are equal, and angles next to each other add up to 180°."),

  // Parallel lines
  mc("par-equal-thought-supplementary", "Thought equal angles add to 180°", "These angles are equal: alternate and corresponding angles are the same size. It's co-interior angles (a C shape) that add to 180°."),
  mc("par-cointerior-equal", "Thought co-interior angles are equal", "Co-interior angles sit inside the parallel lines on the same side (a C shape). They add up to 180°; they aren't equal."),
  mc("par-thought-equal", "Thought the angles were equal", "These two angles aren't a matching pair. Look for a straight line: one of them is on a line with an angle that matches the other, so they add to 180°."),
  mc("par-alt-corr", "Mixed up alternate and corresponding", "Corresponding angles are in the same position at each crossing (an F shape). Alternate angles are on opposite sides of the crossing line, inside the parallel lines (a Z shape)."),
  mc("par-cointerior-name", "Mixed up co-interior with another pair", "Co-interior angles are both inside the parallel lines, on the same side of the crossing line (a C shape). They add to 180°."),
  mc("par-vert-opp", "Mixed up vertically opposite with another pair", "Vertically opposite angles are at the same crossing, across from each other. The other pairs use both crossings."),

  // Polygons
  mc("poly-sum-n-180", "Multiplied the number of sides by 180°", "A polygon with n sides splits into n − 2 triangles from one corner, so the angles add up to (n − 2) × 180°, not n × 180°."),
  mc("poly-forgot-divide", "Found the total but didn't share it out", "That's the total of all the interior angles. In a regular polygon they're all equal, so divide the total by the number of angles."),
  mc("poly-gave-exterior", "Gave the exterior angle", "That's the exterior angle (the turn at each corner). The interior angle is inside the shape: 180° − exterior angle."),
  mc("poly-gave-interior", "Gave the interior angle", "That's the interior angle. The exterior angle is the turn at each corner, outside the shape: 360° ÷ number of sides."),
  mc("poly-sides-used-interior", "Divided 360° by the interior angle", "Exterior angles add up to 360°, so divide 360° by the exterior angle. Find the exterior angle first: 180° − interior angle."),
  mc("poly-sides-used-180", "Divided 180° by the exterior angle", "Exterior angles of any polygon add up to 360° (one full turn), so number of sides = 360° ÷ exterior angle."),
]);
