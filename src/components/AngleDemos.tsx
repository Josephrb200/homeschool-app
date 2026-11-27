"use client";

/**
 * Interactive demonstrations for angles and shape properties. Each lets the
 * student change something and see what stays the same. Keyboard operable;
 * every state is also described in words.
 */

import { useId, useState } from "react";
import type { AngleSpec } from "@/engine/types";
import { AngleDiagram } from "./AngleDiagram";
import {
  crossingDiagram,
  deg,
  lineDiagram,
  parallelDiagram,
  pointDiagram,
  polygonDiagram,
  polygonFromAngles,
  POLYGON_NAMES,
  regularPoints,
  singleAngle,
  type ParallelPos,
} from "@/content/maths/angles/geometry";
import { quadSpec } from "@/content/maths/angles/generators";

function Slider({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (n: number) => void }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}: <strong>{value}</strong>
      </label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

function Readout({ children }: { children: React.ReactNode }) {
  return (
    <p aria-live="polite" style={{ fontSize: "1.15rem" }}>
      {children}
    </p>
  );
}

function Choices<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly (readonly [T, string])[]; onChange: (v: T) => void }) {
  return (
    <div className="choice-row" role="group" aria-label={label}>
      {options.map(([k, text]) => (
        <button key={k} type="button" className="choice" aria-pressed={value === k} onClick={() => onChange(k)}>
          {text}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- angle types

function AngleTurn() {
  const [a, setA] = useState(50);
  const type =
    a === 0 ? "no turn yet" : a < 90 ? "acute (less than 90°)" : a === 90 ? "a right angle (exactly 90°)" : a < 180 ? "obtuse (between 90° and 180°)" : a === 180 ? "a straight line (exactly 180°)" : a < 360 ? "reflex (more than 180°)" : "a full turn (360°)";
  const spec: AngleSpec =
    a === 0 || a === 360
      ? { points: { O: [0, 0], A: [6, 0], C: [-6, 0], U: [0, 6], D: [0, -6] }, segments: [["O", "A"]], angles: [], dots: ["O"], description: a === 0 ? "One arm, no turn." : "The arm has turned all the way round: a full turn." }
      : singleAngle(a, { text: deg(a) });
  if (a !== 0 && a !== 360) Object.assign(spec.points, { C: [-6, 0], U: [0, 6], D: [0, -6] });
  return (
    <>
      <p>Turn the arm. Watch the name change as you pass 90°, 180° and 360°.</p>
      <Slider label="Turn (degrees)" value={a} min={0} max={360} step={5} onChange={setA} />
      <AngleDiagram spec={spec} maxWidth={320} maxHeight={320} />
      <Readout>
        {a}° is <strong>{type}</strong>.
      </Readout>
    </>
  );
}

// ---------------------------------------------------------------- angle facts

function AngleFactsExplore() {
  const [mode, setMode] = useState<"line" | "point" | "cross">("line");
  const [a, setA] = useState(130);
  const [b, setB] = useState(100);
  const lineA = Math.min(Math.max(a, 20), 160);
  const ptA = Math.min(Math.max(a, 40), 200);
  const ptB = Math.min(Math.max(b, 40), 280 - ptA);
  const crossA = Math.min(Math.max(a, 20), 160);
  let spec: AngleSpec;
  let text: React.ReactNode;
  if (mode === "line") {
    spec = lineDiagram([180 - lineA, lineA], [deg(180 - lineA), deg(lineA)]);
    text = (
      <>
        {lineA}° + {180 - lineA}° = <strong>180°</strong>. Angles on a straight line always add up to 180°.
      </>
    );
  } else if (mode === "point") {
    const c = 360 - ptA - ptB;
    spec = pointDiagram([ptA, ptB, c], [deg(ptA), deg(ptB), deg(c)], 10);
    text = (
      <>
        {ptA}° + {ptB}° + {c}° = <strong>360°</strong>. Angles around a point always add up to 360°.
      </>
    );
  } else {
    spec = crossingDiagram(crossA, [
      { pos: 0, text: deg(crossA) },
      { pos: 1, text: deg(180 - crossA) },
      { pos: 2, text: deg(crossA) },
      { pos: 3, text: deg(180 - crossA) },
    ]);
    text = (
      <>
        Opposite angles match: <strong>{crossA}° and {crossA}°</strong>, <strong>{180 - crossA}° and {180 - crossA}°</strong>. Next-door angles add up to 180°.
      </>
    );
  }
  return (
    <>
      <p>Pick a picture, then drag the slider. Some totals never change.</p>
      <Choices
        label="Which angle fact"
        value={mode}
        options={[
          ["line", "On a straight line"],
          ["point", "Around a point"],
          ["cross", "Two lines crossing"],
        ]}
        onChange={setMode}
      />
      <Slider label="Angle (degrees)" value={a} min={20} max={mode === "point" ? 200 : 160} step={5} onChange={setA} />
      {mode === "point" && <Slider label="Second angle (degrees)" value={ptB} min={40} max={280 - ptA} step={5} onChange={setB} />}
      <AngleDiagram spec={spec} maxWidth={380} maxHeight={300} />
      <Readout>{text}</Readout>
    </>
  );
}

// ---------------------------------------------------------------- shape properties

const SHAPES = [
  ["Square", "4 equal sides (matching ticks) and 4 right angles. 2 pairs of parallel sides."],
  ["Rectangle", "4 right angles. Opposite sides equal and parallel."],
  ["Rhombus", "4 equal sides, no right angles. 2 pairs of parallel sides (arrows). A pushed-over square."],
  ["Parallelogram", "2 pairs of parallel sides. Opposite sides equal. A pushed-over rectangle."],
  ["Trapezium", "Exactly 1 pair of parallel sides."],
  ["Kite", "2 pairs of equal sides next to each other. No parallel sides."],
] as const;
type ShapeName = (typeof SHAPES)[number][0];

function ShapeSorter() {
  const [shape, setShape] = useState<ShapeName>("Square");
  const info = SHAPES.find((s) => s[0] === shape)!;
  return (
    <>
      <p>Press a name. Look at the marks: ticks for equal sides, arrows for parallel sides, squares for right angles.</p>
      <Choices label="Quadrilateral" value={shape} options={SHAPES.map(([k]) => [k, k] as const)} onChange={setShape} />
      <AngleDiagram spec={quadSpec(shape)} maxWidth={340} maxHeight={260} />
      <Readout>
        <strong>{info[0]}</strong>: {info[1]}
      </Readout>
    </>
  );
}

// ---------------------------------------------------------------- triangle sum

function TriangleSum() {
  const [a, setA] = useState(60);
  const [b, setB] = useState(70);
  const A = Math.min(a, 150);
  const B = Math.min(b, 165 - A);
  const C = 180 - A - B;
  const pts = polygonFromAngles([A, B, C], [6]);
  // Very thin triangles can't be drawn well: fall back to a sensible one.
  const spec: AngleSpec | null = pts
    ? polygonDiagram(
        pts,
        [
          { i: 0, text: deg(A) },
          { i: 1, text: deg(B) },
          { i: 2, text: deg(C) },
        ],
        { description: `A triangle with angles ${A}°, ${B}° and ${C}°.` },
      )
    : null;
  const line = lineDiagram([B, C, A], [deg(B), deg(C), deg(A)]);
  return (
    <>
      <p>Change two of the angles. The third one changes too. Then look at the three angles put side by side.</p>
      <div className="grid-2">
        <Slider label="Bottom left angle" value={A} min={15} max={150} step={5} onChange={setA} />
        <Slider label="Bottom right angle" value={B} min={15} max={165 - A} step={5} onChange={setB} />
      </div>
      {spec ? <AngleDiagram spec={spec} maxWidth={380} maxHeight={240} /> : <p className="hint">That triangle is too thin to draw clearly. Try less extreme angles.</p>}
      <p className="eyebrow">The three corners, side by side</p>
      <AngleDiagram spec={line} maxWidth={340} maxHeight={200} />
      <Readout>
        {A}° + {B}° + {C}° = <strong>180°</strong>. The three corners always fit together into a straight line.
      </Readout>
    </>
  );
}

// ---------------------------------------------------------------- parallel lines

const PAIRS = [
  ["corresponding", "Corresponding (F)", { at: "Q", pos: 0 }, { at: "P", pos: 0 }, "Same position at each crossing. Always equal."],
  ["alternate", "Alternate (Z)", { at: "Q", pos: 2 }, { at: "P", pos: 0 }, "Inside the parallel lines, opposite sides. Always equal."],
  ["co-interior", "Co-interior (C)", { at: "Q", pos: 3 }, { at: "P", pos: 0 }, "Inside the parallel lines, same side. Always add up to 180°."],
] as const;

function ParallelLines() {
  const [theta, setTheta] = useState(60);
  const [pair, setPair] = useState<(typeof PAIRS)[number][0]>("corresponding");
  const p = PAIRS.find((x) => x[0] === pair)!;
  const t = Math.abs(theta - 90) < 5 ? 85 : theta;
  const size = (m: ParallelPos) => (m.pos % 2 === 0 ? t : 180 - t);
  const a = size(p[2]);
  const b = size(p[3]);
  const spec = parallelDiagram(t, [
    { ...p[2], text: deg(a), highlight: true },
    { ...p[3], text: deg(b), highlight: true },
  ]);
  return (
    <>
      <p>Pick a pair, then tilt the crossing line. Watch the two highlighted angles.</p>
      <Choices label="Angle pair" value={pair} options={PAIRS.map(([k, n]) => [k, n] as const)} onChange={setPair} />
      <Slider label="Tilt of the crossing line (degrees)" value={theta} min={35} max={145} step={5} onChange={setTheta} />
      <AngleDiagram spec={spec} maxWidth={420} maxHeight={280} />
      <Readout>
        {a}° and {b}°: {pair === "co-interior" ? <strong>{a}° + {b}° = 180°</strong> : <strong>equal</strong>}. {p[4]}
      </Readout>
    </>
  );
}

// ---------------------------------------------------------------- polygons

function PolygonSplit() {
  const [n, setN] = useState(5);
  const pts = regularPoints(n);
  const base = polygonDiagram(pts, [], { description: "" });
  const diagonals = Array.from({ length: n - 3 }, (_, k) => ["V0", `V${k + 2}`] as [string, string]);
  const spec: AngleSpec = {
    ...base,
    segments: [...base.segments, ...diagonals],
    dots: ["V0"],
    description: `A regular ${POLYGON_NAMES[n].toLowerCase()} split into ${n - 2} triangles by lines from one corner.`,
  };
  const sum = (n - 2) * 180;
  const ext = 360 / n;
  const show = (x: number) => (Number.isInteger(x) ? `${x}` : x.toFixed(1));
  return (
    <>
      <p>Change the number of sides. Count the triangles you can make from one corner.</p>
      <Slider label="Number of sides" value={n} min={3} max={10} onChange={setN} />
      <AngleDiagram spec={spec} maxWidth={320} maxHeight={300} />
      <Readout>
        A {POLYGON_NAMES[n].toLowerCase()} has {n} sides and splits into <strong>{n - 2} triangles</strong>. Interior angles add up to {n - 2} × 180° = <strong>{sum}°</strong>. If it&apos;s regular,
        each exterior angle is 360° ÷ {n} = <strong>{show(ext)}°</strong> and each interior angle is <strong>{show(180 - ext)}°</strong>.
      </Readout>
    </>
  );
}

export const ANGLE_DEMOS = {
  "angle-turn": AngleTurn,
  "angle-facts-explore": AngleFactsExplore,
  "shape-sorter": ShapeSorter,
  "triangle-sum": TriangleSum,
  "parallel-lines": ParallelLines,
  "polygon-split": PolygonSplit,
};
