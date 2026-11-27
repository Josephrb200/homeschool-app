/**
 * Transformations (KS3/KS4, GCSE Foundation G7, G11, G24, R2): reflection,
 * rotation, translation, enlargement and describing a transformation fully.
 * Line and rotational symmetry are taught with reflection and rotation.
 * Skill ids and prerequisites copy the GCSE Foundation topic map; prerequisites
 * that aren't built yet (alg-coordinates, ratio-scale-maps) are left out of the
 * live app automatically until they exist.
 *
 * STATUS: Draft. Written by the build team; needs review by a qualified maths
 * teacher before it is marked Verified.
 */

import type { Misconception, Skill } from "@/engine/types";

export const TRANSFORMATION_SKILLS: Skill[] = [
  {
    id: "geo-reflection",
    topic: "Transformations",
    name: "Reflections",
    objective: "I can reflect a shape in a mirror line like x = 3 or y = x, and count lines of symmetry.",
    typicalYear: 7,
    gcseTier: "foundation",
    prerequisites: ["alg-coordinates"],
  },
  {
    id: "geo-rotation",
    topic: "Transformations",
    name: "Rotations",
    objective: "I can rotate a shape 90° or 180° about a centre, and find a shape's order of rotational symmetry.",
    typicalYear: 8,
    gcseTier: "foundation",
    prerequisites: ["alg-coordinates", "geo-angle-basics"],
  },
  {
    id: "geo-translation",
    topic: "Transformations",
    name: "Translations with column vectors",
    objective: "I can translate a shape using a column vector, and write the column vector for a translation.",
    typicalYear: 8,
    gcseTier: "foundation",
    prerequisites: ["alg-coordinates"],
  },
  {
    id: "geo-enlargement",
    topic: "Transformations",
    name: "Enlargements, including fractional scale factors",
    objective: "I can find a scale factor and enlarge a shape from a centre, including by a scale factor like ½.",
    typicalYear: 9,
    gcseTier: "foundation",
    prerequisites: ["geo-translation", "ratio-scale-maps"],
  },
  {
    id: "geo-describe-transformations",
    topic: "Transformations",
    name: "Describing a single transformation fully",
    objective: "I can say which transformation maps one shape onto another, and describe it fully.",
    typicalYear: 10,
    gcseTier: "foundation",
    prerequisites: ["geo-reflection", "geo-rotation", "geo-translation", "geo-enlargement"],
  },
];

const mc = (id: string, label: string, explanation: string, pointsTo?: string): [string, Misconception] => [id, { id, label, explanation, pointsTo }];

export const TRANSFORMATION_MISCONCEPTIONS: Record<string, Misconception> = Object.fromEntries([
  mc("coord-swapped", "Wrote the coordinates the wrong way round", "Coordinates go x first (across), then y (up or down): (x, y). Along the corridor, then up the stairs."),

  // Reflection
  mc("refl-line-direction", "Drew x = c across instead of up and down", "x = 3 is a vertical line: every point on it has x = 3, so it goes straight up and down through 3 on the x-axis. y = 3 is the horizontal one."),
  mc("refl-used-axis", "Reflected in an axis instead of the line", "The mirror line here isn't an axis. Count how far the point is from the mirror line itself, then go the same distance out the other side."),
  mc("refl-not-doubled", "Only moved the point onto the mirror line", "A reflection goes through the mirror and the same distance out the other side. If a point is 2 squares from the mirror, its image is 2 squares beyond it: 4 squares from where it started."),
  mc("refl-yx-sign", "Mixed up y = x and y = −x", "Reflecting in y = x swaps the coordinates: (a, b) becomes (b, a). Reflecting in y = −x swaps them and changes both signs: (a, b) becomes (−b, −a)."),
  mc("refl-not-flipped", "Slid the shape instead of flipping it", "A reflection flips the shape over, like a mirror. The image faces the opposite way. A shape that has only slid across, still facing the same way, is a translation."),
  mc("sym-diagonals", "Thought a diagonal is always a line of symmetry", "Fold along the line in your head. A rectangle's diagonal doesn't work: the corners don't land on each other. Only lines where the two halves match exactly count."),
  mc("sym-parallelogram", "Thought a parallelogram has lines of symmetry", "A parallelogram has no lines of symmetry. Fold it along any line and the halves don't match. (It does have rotational symmetry of order 2.)"),
  mc("sym-count", "Miscounted the lines of symmetry", "Check every possible fold: up and down, across, and corner to corner. A regular polygon has as many lines of symmetry as it has sides."),

  // Rotation
  mc("rot-direction", "Turned the wrong way", "Clockwise is the way a clock's hands go: from 12 towards 3. Anticlockwise is the other way. Trace the turn with your finger before you draw it."),
  mc("rot-wrong-centre", "Rotated about (0, 0) instead of the centre given", "The shape turns about the centre of rotation given in the question, not the origin. Count from the centre to the point, turn that, and count back out from the centre."),
  mc("rot-reflected", "Reflected instead of rotating", "A rotation turns the shape. It is never flipped over: the image faces the way it would after turning. Use tracing paper (or turn the page) to check."),
  mc("rot-90-180", "Mixed up a quarter turn and a half turn", "90° is a quarter turn: the shape ends up on its side. 180° is a half turn: it ends up upside down, on the opposite side of the centre."),
  mc("rotsym-order-zero", "Said order 0 for no rotational symmetry", "Every shape fits onto itself once in a full turn (when it gets back to the start). So a shape with no rotational symmetry has order 1, not 0."),
  mc("rotsym-used-lines", "Gave the number of lines of symmetry", "Rotational symmetry counts how many times the shape fits onto itself as it turns once all the way round. It isn't always the same as the number of lines of symmetry."),

  // Translation
  mc("vec-swapped", "Swapped the top and bottom of the vector", "The top number of a column vector moves left or right (x). The bottom number moves up or down (y)."),
  mc("vec-sign", "Got the direction of a move wrong", "In a column vector, positive means right (top) or up (bottom). Negative means left (top) or down (bottom)."),
  mc("vec-reversed", "Gave the vector the wrong way round (B to A)", "Count from the first shape to the second: from A to B. Going from B back to A gives the same numbers with the signs changed."),
  mc("vec-gap", "Counted the gap between the shapes", "Pick one corner of the shape and count how far that same corner moves. Counting the empty squares between the two shapes misses the width of the shape."),

  // Enlargement
  mc("enl-sf-difference", "Took away instead of dividing", "The scale factor is how many times bigger: new length ÷ old length. Taking away tells you how much longer, not how many times.", "ratio-scale-maps"),
  mc("enl-sf-inverted", "Divided the wrong way round", "Scale factor = new length ÷ original length. If the shape got bigger, the scale factor is more than 1."),
  mc("enl-added", "Added the scale factor instead of multiplying", "Every length is multiplied by the scale factor. Scale factor 3 means 3 times as long, not 3 longer."),
  mc("enl-fraction-bigger", "Made the shape bigger with a fractional scale factor", "A scale factor between 0 and 1 makes the shape smaller. Scale factor ½ halves every length."),
  mc("enl-ignored-centre", "Enlarged from (0, 0) instead of the centre", "Measure from the centre of enlargement to the point, multiply that distance by the scale factor, and count it out from the centre. Multiplying the coordinates only works when the centre is (0, 0)."),
  mc("enl-extra-step", "Went one scale factor too far", "Multiply the distance from the centre by the scale factor, then count that from the centre (not from the original point)."),

  // Describing
  mc("desc-type", "Picked the wrong type of transformation", "Look for clues. Same size, same way round: translation. Flipped over: reflection. Turned: rotation. Different size: enlargement."),
  mc("desc-incomplete", "Left out part of the description", "A full description needs every detail. Reflection: the mirror line. Rotation: angle, direction and centre. Translation: the column vector. Enlargement: scale factor and centre."),
  mc("desc-not-single", "Described two transformations", "The question asks for a single transformation. There is always one transformation that does the whole job: look for it."),
  mc("desc-wrong-detail", "Got a detail wrong", "The type is right, but check the detail. Test one corner: does your description send it to the right place?"),
]);
