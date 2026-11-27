"use client";

/**
 * Interactive demonstrations for perimeter, circles, and volume and surface
 * area. Each lets the student change something and see what changes. Keyboard
 * operable; every state is also described in words.
 */

import { useId, useState } from "react";
import type { CirclePart, ShapeSpec, SolidSpec } from "@/engine/types";
import { ShapeDiagram } from "./ShapeDiagram";
import { CircleDiagram, Label } from "./CircleDiagram";
import { SolidDiagram } from "./SolidDiagram";

function Slider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}: <strong>{value}</strong>
      </label>
      <input id={id} type="range" min={min} max={max} step={1} value={value} onChange={(e) => onChange(Number(e.target.value))} />
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

const d1 = (x: number) => (Math.round(x * 10) / 10).toFixed(1);

// ---------------------------------------------------------------- perimeter

function PerimeterWalk() {
  const [W, setW] = useState(9);
  const [H, setH] = useState(7);
  const [cw, setCw] = useState(4);
  const [ch, setCh] = useState(3);
  const c = Math.min(cw, W - 1);
  const d = Math.min(ch, H - 1);
  const len = [W, H - d, c, d, W - c, H];
  const shape: ShapeSpec = {
    points: [
      [0, 0],
      [W, 0],
      [W, H - d],
      [W - c, H - d],
      [W - c, H],
      [0, H],
    ],
    sides: len.map((l, i) => ({ i, text: `${l}` })),
    description: `An L-shape with sides ${len.join(", ")} cm, going round from the bottom.`,
  };
  return (
    <>
      <p>Change the L-shape. Walk round the edge adding each side. Notice anything about the total?</p>
      <div className="grid-2">
        <Slider label="Bottom (cm)" value={W} min={4} max={12} onChange={setW} />
        <Slider label="Left side (cm)" value={H} min={4} max={9} onChange={setH} />
        <Slider label="Corner cut across (cm)" value={c} min={1} max={W - 1} onChange={setCw} />
        <Slider label="Corner cut down (cm)" value={d} min={1} max={H - 1} onChange={setCh} />
      </div>
      <ShapeDiagram shape={shape} />
      <Readout>
        Perimeter = {len.join(" + ")} = <strong>{2 * (W + H)} cm</strong>. The corner cut never changes it: the short sides add up to the long ones, so
        it&apos;s always the same as a {W} by {H} rectangle.
      </Readout>
    </>
  );
}

// ---------------------------------------------------------------- circles

const PARTS: readonly (readonly [CirclePart, string, string])[] = [
  ["centre", "Centre", "The point exactly in the middle."],
  ["radius", "Radius", "A straight line from the centre to the edge."],
  ["diameter", "Diameter", "A straight line from edge to edge, through the centre. It's 2 radii long."],
  ["circumference", "Circumference", "The whole distance round the edge."],
  ["chord", "Chord", "A straight line from edge to edge that misses the centre."],
  ["tangent", "Tangent", "A straight line outside the circle that touches it at one point."],
  ["arc", "Arc", "Part of the edge."],
  ["sector", "Sector", "A slice from the centre, like a slice of pizza."],
  ["segment", "Segment", "The piece cut off by a chord. It doesn't reach the centre."],
];

function CircleParts() {
  const [part, setPart] = useState<CirclePart>("radius");
  const info = PARTS.find((p) => p[0] === part)!;
  return (
    <>
      <p>Press a name to see that part of the circle.</p>
      <Choices label="Part of a circle" value={part} options={PARTS.map(([k, n]) => [k, n] as const)} onChange={setPart} />
      <CircleDiagram circle={{ parts: [{ part }], highlight: part, description: `${info[1]}: ${info[2]}` }} maxWidth={300} />
      <Readout>
        <strong>{info[1]}</strong>: {info[2]}
      </Readout>
    </>
  );
}

function CircumferenceUnroll() {
  const [d, setD] = useState(4);
  const C = Math.PI * d;
  const scale = 22;
  const R = (d / 2) * scale;
  const w = Math.max(C * scale + 40, 2 * R + 40);
  const h = 2 * R + 110;
  const lineY = 2 * R + 60;
  return (
    <>
      <p>Roll a circle along a line for one full turn. How far does it go compared with its diameter?</p>
      <Slider label="Diameter (cm)" value={d} min={1} max={8} onChange={setD} />
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ maxWidth: w }} role="img" aria-label={`A circle of diameter ${d} cm, and its edge unrolled into a straight line ${d1(C)} cm long: 3 diameters and a little bit more.`} className="shape-diagram">
        <circle cx={20 + R} cy={20 + R} r={R} fill="var(--accent-soft)" stroke="var(--ink)" strokeWidth={2.5} />
        <line x1={20} y1={20 + R} x2={20 + 2 * R} y2={20 + R} stroke="var(--ink)" strokeWidth={2} />
        {[0, 1, 2].map((k) => (
          <rect key={k} x={20 + k * d * scale} y={lineY - 8} width={d * scale} height={16} fill={k % 2 ? "var(--sunk)" : "var(--accent-soft)"} stroke="var(--ink)" strokeWidth={1.5} />
        ))}
        <rect x={20 + 3 * d * scale} y={lineY - 8} width={(C - 3 * d) * scale} height={16} fill="var(--accent)" stroke="var(--ink)" strokeWidth={1.5} />
        <Label x={20 + 1.5 * d * scale} y={lineY + 28} text={`3 diameters + a bit = ${d1(C)} cm`} />
      </svg>
      <Readout>
        Circumference = π × {d} = <strong>{d1(C)} cm</strong>. That&apos;s always 3.14… times the diameter, whatever size the circle is.
      </Readout>
    </>
  );
}

function CircleAreaRearrange() {
  const [n, setN] = useState(8);
  const r = 3;
  const scale = 30;
  const R = r * scale;
  const half = n / 2;
  const sliceW = (Math.PI * R) / half;
  const w = Math.PI * R + sliceW / 2 + 40;
  const h = R + 80;
  const base = R + 26;
  const slices: string[] = [];
  for (let k = 0; k < n; k++) {
    const up = k % 2 === 0;
    const x0 = 20 + (k * sliceW) / 2;
    // Each slice is a sector: two radii and a curved bit of the edge.
    if (up) slices.push(`M ${x0 + sliceW / 2} ${base - R} L ${x0} ${base} A ${R} ${R} 0 0 0 ${x0 + sliceW} ${base} Z`);
    else slices.push(`M ${x0 + sliceW / 2} ${base} L ${x0} ${base - R} A ${R} ${R} 0 0 1 ${x0 + sliceW} ${base - R} Z`);
  }
  return (
    <>
      <p>Cut a circle into slices and lay them top to bottom. More slices make it look more like a rectangle.</p>
      <Choices label="Number of slices" value={String(n) as "4" | "8" | "16" | "32"} options={[["4", "4 slices"], ["8", "8 slices"], ["16", "16 slices"], ["32", "32 slices"]] as const} onChange={(v) => setN(Number(v))} />
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ maxWidth: w }} role="img" aria-label={`${n} slices of a circle laid alternately up and down, making a shape close to a rectangle ${r} cm tall and π × ${r} cm long.`} className="shape-diagram">
        {slices.map((p, k) => (
          <path key={k} d={p} fill={k % 2 ? "var(--sunk)" : "var(--accent-soft)"} stroke="var(--ink)" strokeWidth={1.2} />
        ))}
        <Label x={20 + (Math.PI * R) / 2} y={base + 22} text="half the circumference = π × r" />
        <Label x={w - 8} y={base - R / 2} anchor="end" text="r" />
      </svg>
      <Readout>
        The shape is almost a rectangle: π × r long and r tall. Area = π × r × r = π × r². For r = {r}: π × {r * r} = <strong>{d1(Math.PI * r * r)} cm²</strong>.
      </Readout>
    </>
  );
}

// ---------------------------------------------------------------- volume

const cuboid = (w: number, h: number, d: number, cubes: boolean): SolidSpec => ({
  kind: "prism",
  face: {
    points: [
      [0, 0],
      [w, 0],
      [w, h],
      [0, h],
    ],
    sides: [
      { i: 0, text: `${w} cm` },
      { i: 3, text: `${h} cm` },
    ],
    description: "",
  },
  length: d,
  lengthText: `${d} cm`,
  cubes,
  description: `A cuboid ${w} cm wide, ${h} cm tall and ${d} cm long${cubes ? ", made of 1 cm cubes" : ""}.`,
});

function CuboidLayers() {
  const [w, setW] = useState(4);
  const [h, setH] = useState(3);
  const [d, setD] = useState(5);
  return (
    <>
      <p>Each small cube is 1 cm × 1 cm × 1 cm, which is 1 cm³. Change the sizes and count the cubes in layers.</p>
      <div className="grid-2">
        <Slider label="Width (cm)" value={w} min={1} max={6} onChange={setW} />
        <Slider label="Height (cm)" value={h} min={1} max={5} onChange={setH} />
      </div>
      <Slider label="Length, going back (cm)" value={d} min={1} max={6} onChange={setD} />
      <SolidDiagram solid={cuboid(w, h, d, true)} />
      <Readout>
        Front layer: {w} × {h} = {w * h} cubes. There are {d} layers: {w * h} × {d} = <strong>{w * h * d} cm³</strong>.
      </Readout>
    </>
  );
}

function PrismSlices() {
  const [kind, setKind] = useState<"triangle" | "trapezium" | "circle">("triangle");
  const [L, setL] = useState(6);
  let solid: SolidSpec;
  let area: number;
  let areaText: string;
  if (kind === "circle") {
    solid = { kind: "cylinder", r: 2, h: L, label: { on: "radius", text: "2 cm" }, hText: `${L} cm`, description: `A cylinder with radius 2 cm and height ${L} cm.` };
    area = Math.PI * 4;
    areaText = `π × 2² = ${d1(area)}`;
  } else if (kind === "trapezium") {
    solid = {
      kind: "prism",
      face: {
        points: [
          [0, 0],
          [5, 0],
          [3, 3],
          [0, 3],
        ],
        sides: [
          { i: 0, text: "5 cm" },
          { i: 2, text: "3 cm" },
          { i: 3, text: "3 cm" },
        ],
        right: [[0, 0]],
        description: "",
      },
      length: L,
      lengthText: `${L} cm`,
      description: `A prism with a trapezium cross-section (parallel sides 3 cm and 5 cm, height 3 cm), ${L} cm long.`,
    };
    area = 12;
    areaText = "½ × (3 + 5) × 3 = 12";
  } else {
    solid = {
      kind: "prism",
      face: {
        points: [
          [0, 0],
          [4, 0],
          [0, 3],
        ],
        sides: [
          { i: 0, text: "4 cm" },
          { i: 2, text: "3 cm" },
        ],
        right: [[0, 0]],
        description: "",
      },
      length: L,
      lengthText: `${L} cm`,
      description: `A triangular prism. The front triangle has base 4 cm and height 3 cm. It is ${L} cm long.`,
    };
    area = 6;
    areaText = "½ × 4 × 3 = 6";
  }
  const V = area * L;
  return (
    <>
      <p>Pick a cross-section and stretch the prism. The front face is the same all the way through, so volume = area of front face × length.</p>
      <Choices label="Cross-section" value={kind} options={[["triangle", "Triangle"], ["trapezium", "Trapezium"], ["circle", "Circle (cylinder)"]] as const} onChange={setKind} />
      <Slider label={kind === "circle" ? "Height (cm)" : "Length (cm)"} value={L} min={1} max={10} onChange={setL} />
      <SolidDiagram solid={solid} maxHeight={240} />
      <Readout>
        Cross-section area = {areaText} cm². Volume = {kind === "circle" ? d1(area) : area} × {L} = <strong>{kind === "circle" ? d1(V) : V} cm³</strong>.
      </Readout>
    </>
  );
}

function CuboidNet() {
  const [w, setW] = useState(4);
  const [h, setH] = useState(2);
  const [d, setD] = useState(3);
  const s = 18;
  // Cross-shaped net: top row = back, then top, front... laid as columns: end | front | end | back, with top and bottom above and below the front.
  const x0 = 20;
  const y0 = 20;
  const rects = [
    { x: x0, y: y0 + d * s, w: d, h: h, name: "End", a: h * d },
    { x: x0 + d * s, y: y0 + d * s, w: w, h: h, name: "Front", a: w * h },
    { x: x0 + (d + w) * s, y: y0 + d * s, w: d, h: h, name: "End", a: h * d },
    { x: x0 + (2 * d + w) * s, y: y0 + d * s, w: w, h: h, name: "Back", a: w * h },
    { x: x0 + d * s, y: y0, w: w, h: d, name: "Top", a: w * d },
    { x: x0 + d * s, y: y0 + (d + h) * s, w: w, h: d, name: "Bottom", a: w * d },
  ];
  const vbW = (2 * d + 2 * w) * s + 40;
  const vbH = (2 * d + h) * s + 40;
  const SA = 2 * (w * h + w * d + h * d);
  return (
    <>
      <p>Unfold a cuboid flat into its net. The surface area is the total area of all six pieces.</p>
      <div className="grid-2">
        <Slider label="Width (cm)" value={w} min={1} max={6} onChange={setW} />
        <Slider label="Height (cm)" value={h} min={1} max={5} onChange={setH} />
      </div>
      <Slider label="Length, going back (cm)" value={d} min={1} max={5} onChange={setD} />
      <div className="grid-2">
        <SolidDiagram solid={cuboid(w, h, d, false)} maxHeight={200} />
        <svg viewBox={`0 0 ${vbW} ${vbH}`} width="100%" style={{ maxWidth: vbW }} role="img" aria-label={`The net of the cuboid: six rectangles. Front and back ${w} by ${h}, top and bottom ${w} by ${d}, two ends ${h} by ${d}.`} className="shape-diagram">
          {rects.map((r, k) => (
            <g key={k}>
              <rect x={r.x} y={r.y} width={r.w * s} height={r.h * s} fill={r.name === "Front" || r.name === "Back" ? "var(--accent-soft)" : r.name === "End" ? "var(--surface)" : "var(--sunk)"} stroke="var(--ink)" strokeWidth={1.5} />
              {r.w * s >= 30 && r.h * s >= 18 && <Label x={r.x + (r.w * s) / 2} y={r.y + (r.h * s) / 2} text={String(r.a)} />}
            </g>
          ))}
        </svg>
      </div>
      <Readout>
        Front + back = 2 × {w * h}, top + bottom = 2 × {w * d}, ends = 2 × {h * d}. Surface area = {2 * w * h} + {2 * w * d} + {2 * h * d} ={" "}
        <strong>{SA} cm²</strong>.
      </Readout>
    </>
  );
}

export const MEASURES_DEMOS = {
  "perimeter-walk": PerimeterWalk,
  "circle-parts": CircleParts,
  "circumference-unroll": CircumferenceUnroll,
  "circle-area-rearrange": CircleAreaRearrange,
  "cuboid-layers": CuboidLayers,
  "prism-slices": PrismSlices,
  "cuboid-net": CuboidNet,
};
