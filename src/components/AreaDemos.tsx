"use client";

/**
 * Interactive demonstrations for the area chain. Each lets the student change
 * the shape and see what changes and what stays the same. Keyboard operable;
 * every state is also described in words.
 */

import { useId, useState } from "react";
import type { ShapeSpec } from "@/engine/types";
import { ShapeDiagram } from "./ShapeDiagram";
import { MathText } from "./MathText";

const num = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(1));

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

function RectangleGrid() {
  const [w, setW] = useState(5);
  const [h, setH] = useState(3);
  const shape: ShapeSpec = {
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
    grid: true,
    description: `A rectangle ${w} cm by ${h} cm on a grid of 1 cm squares: ${h} rows of ${w} squares.`,
  };
  return (
    <>
      <p>Change the length and width. Each small square is 1 cm by 1 cm, which we call 1 cm².</p>
      <div className="grid-2">
        <Slider label="Length (cm)" value={w} min={1} max={10} onChange={setW} />
        <Slider label="Width (cm)" value={h} min={1} max={7} onChange={setH} />
      </div>
      <ShapeDiagram shape={shape} />
      <Readout>
        {h} rows of {w} squares = {w} × {h} = <strong>{w * h} cm²</strong>. (The perimeter, the distance round the edge, is {2 * (w + h)} cm.
        That&apos;s a different thing.)
      </Readout>
    </>
  );
}

function TriangleHalf() {
  const [b, setB] = useState(8);
  const [h, setH] = useState(5);
  const [p, setP] = useState(3);
  const apex = Math.min(p, b);
  const shape: ShapeSpec = {
    points: [
      [0, 0],
      [b, 0],
      [apex, h],
    ],
    sides: [{ i: 0, text: `${b} cm` }],
    heights: [{ x: apex, y1: h, y2: 0, text: `${h} cm` }],
    description: `A triangle with base ${b} cm and perpendicular height ${h} cm. Its top point is ${apex} cm from the left.`,
  };
  return (
    <>
      <p>
        A triangle is half of the rectangle around it. Slide the top point left and right: the base and height stay the same, so the area does too.
      </p>
      <div className="grid-2">
        <Slider label="Base (cm)" value={b} min={2} max={10} onChange={setB} />
        <Slider label="Height (cm)" value={h} min={2} max={8} onChange={setH} />
      </div>
      <Slider label="Move the top point" value={apex} min={0} max={b} onChange={setP} />
      <ShapeDiagram shape={shape} />
      <Readout>
        <MathText text={`Area = ½ × ${b} × ${h} = ½ × ${b * h} = `} />
        <strong>{num((b * h) / 2)} cm²</strong>, wherever the top point is.
      </Readout>
    </>
  );
}

function ParallelogramShear() {
  const b = 6;
  const h = 4;
  const [o, setO] = useState(3);
  const slant = Math.hypot(o, h);
  const shape: ShapeSpec = {
    points: [
      [0, 0],
      [b, 0],
      [b + o, h],
      [o, h],
    ],
    sides: [
      { i: 0, text: `${b} cm` },
      { i: 3, text: `${slant.toFixed(1)} cm` },
    ],
    heights: [{ x: Math.min(o, b), y1: h, y2: 0, text: `${h} cm` }],
    right: o === 0 ? [[0, 0]] : undefined,
    description: `A parallelogram with base ${b} cm and perpendicular height ${h} cm, leaning over by ${o} cm. The sloping side is ${slant.toFixed(1)} cm.`,
  };
  return (
    <>
      <p>
        Push the parallelogram over. The sloping side gets longer, but the area doesn&apos;t change. You could cut off the triangle at one end and slide it
        to the other to make a rectangle.
      </p>
      <Slider label="Lean (cm)" value={o} min={0} max={6} onChange={setO} />
      <ShapeDiagram shape={shape} />
      <Readout>
        Area = base × perpendicular height = {b} × {h} = <strong>{b * h} cm²</strong>. The sloping side is {slant.toFixed(1)} cm, but it isn&apos;t
        used.
      </Readout>
    </>
  );
}

function TrapeziumDouble() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(7);
  const [h, setH] = useState(4);
  const top = Math.min(a, b);
  const o = Math.max(0, Math.floor((b - top) / 2));
  const trap: ShapeSpec = {
    points: [
      [0, 0],
      [b, 0],
      [o + top, h],
      [o, h],
    ],
    sides: [
      { i: 0, text: `b = ${b}` },
      { i: 2, text: `a = ${top}` },
    ],
    heights: [{ x: o, y1: h, y2: 0, text: `h = ${h}` }],
    description: `A trapezium with parallel sides ${top} cm and ${b} cm, and height ${h} cm.`,
  };
  const para: ShapeSpec = {
    points: [
      [0, 0],
      [top + b, 0],
      [top + b + o, h],
      [o, h],
    ],
    sides: [{ i: 0, text: `a + b = ${top + b}` }],
    heights: [{ x: o, y1: h, y2: 0, text: `h = ${h}` }],
    description: `Two copies of the trapezium, one turned upside down, make a parallelogram with base ${top + b} cm and height ${h} cm.`,
  };
  return (
    <>
      <p>Two copies of a trapezium, one turned upside down, fit together into a parallelogram. So one trapezium is half of that parallelogram.</p>
      <div className="grid-2">
        <Slider label="Top, a (cm)" value={top} min={1} max={b} onChange={setA} />
        <Slider label="Bottom, b (cm)" value={b} min={2} max={10} onChange={setB} />
      </div>
      <Slider label="Height, h (cm)" value={h} min={2} max={6} onChange={setH} />
      <ShapeDiagram shape={trap} maxHeight={200} />
      <p className="small muted">Two of them make:</p>
      <ShapeDiagram shape={para} maxHeight={200} />
      <Readout>
        <MathText text={`Parallelogram = (${top} + ${b}) × ${h} = ${(top + b) * h}. Trapezium = ½ × ${(top + b) * h} = `} />
        <strong>{num(((top + b) * h) / 2)} cm²</strong>
      </Readout>
    </>
  );
}

const rect = (w: number, h: number, label: string): ShapeSpec => ({
  points: [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ],
  sides: [
    { i: 0, text: `${w}` },
    { i: 3, text: `${h}` },
  ],
  description: `${label}: a rectangle ${w} cm by ${h} cm.`,
});

function CompoundSplit() {
  const W = 10;
  const H = 8;
  const cw = 4;
  const ch = 3;
  const [way, setWay] = useState<"vertical" | "horizontal" | "subtract">("vertical");
  const L: ShapeSpec = {
    points: [
      [0, 0],
      [W, 0],
      [W, H - ch],
      [W - cw, H - ch],
      [W - cw, H],
      [0, H],
    ],
    sides: [
      { i: 0, text: `${W} cm` },
      { i: 1, text: `${H - ch} cm` },
      { i: 4, text: `${W - cw} cm` },
      { i: 5, text: `${H} cm` },
    ],
    grid: true,
    description: `An L-shape: bottom ${W} cm, left ${H} cm, top ${W - cw} cm, lower right side ${H - ch} cm.`,
  };
  const A = W * H - cw * ch;
  const pieces: Record<typeof way, { a: ShapeSpec; b: ShapeSpec; text: string; join: string }> = {
    vertical: {
      a: rect(W - cw, H, "Left piece"),
      b: rect(cw, H - ch, "Right piece"),
      text: `Left: ${W - cw} × ${H} = ${(W - cw) * H}. Right: ${cw} × ${H - ch} = ${cw * (H - ch)}. The right piece is ${W} − ${W - cw} = ${cw} wide.`,
      join: `${(W - cw) * H} + ${cw * (H - ch)}`,
    },
    horizontal: {
      a: rect(W, H - ch, "Bottom piece"),
      b: rect(W - cw, ch, "Top piece"),
      text: `Bottom: ${W} × ${H - ch} = ${W * (H - ch)}. Top: ${W - cw} × ${ch} = ${(W - cw) * ch}. The top piece is ${H} − ${H - ch} = ${ch} tall.`,
      join: `${W * (H - ch)} + ${(W - cw) * ch}`,
    },
    subtract: {
      a: rect(W, H, "Whole rectangle"),
      b: rect(cw, ch, "Missing corner"),
      text: `Whole: ${W} × ${H} = ${W * H}. Missing corner: ${cw} × ${ch} = ${cw * ch}.`,
      join: `${W * H} − ${cw * ch}`,
    },
  };
  const pc = pieces[way];
  return (
    <>
      <p>There&apos;s more than one way to split an L-shape. Try each one: the answer is always the same.</p>
      <ShapeDiagram shape={L} />
      <div className="choice-row" role="group" aria-label="How to split it">
        {(
          [
            ["vertical", "Split with an up line"],
            ["horizontal", "Split with an across line"],
            ["subtract", "Big rectangle take away corner"],
          ] as const
        ).map(([k, label]) => (
          <button key={k} type="button" className="choice" aria-pressed={way === k} onClick={() => setWay(k)}>
            {label}
          </button>
        ))}
      </div>
      <div className="grid-2">
        <ShapeDiagram shape={pc.a} fixedScale={16} />
        <ShapeDiagram shape={pc.b} fixedScale={16} />
      </div>
      <Readout>
        {pc.text} Total = {pc.join} = <strong>{A} cm²</strong>.
      </Readout>
    </>
  );
}

export const AREA_DEMOS = {
  "rectangle-grid": RectangleGrid,
  "triangle-half": TriangleHalf,
  "parallelogram-shear": ParallelogramShear,
  "trapezium-double": TrapeziumDouble,
  "compound-split": CompoundSplit,
};
