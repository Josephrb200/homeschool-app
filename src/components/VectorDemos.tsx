"use client";

/**
 * Interactive demonstration for column vectors: build two vectors, then add,
 * subtract or multiply them and watch the arrows go tip to tail. Keyboard
 * operable; every state is also described in words.
 */

import { useId, useState } from "react";
import type { PlaneSpec } from "@/engine/types";
import { PlaneDiagram } from "./PlaneDiagram";
import { MathText } from "./MathText";
import { n, vec, vectorWords, type P } from "@/content/maths/transformations/geometry";

function Slider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}: <strong>{n(value)}</strong>
      </label>
      <input id={id} type="range" min={min} max={max} step={1} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

type Op = "a + b" | "a − b" | "2a";

function VectorBuilder() {
  const [ax, setAx] = useState(3);
  const [ay, setAy] = useState(2);
  const [bx, setBx] = useState(2);
  const [by, setBy] = useState(-3);
  const [op, setOp] = useState<Op>("a + b");
  const a: P = [ax, ay];
  const b: P = [bx, by];
  const second: P = op === "a + b" ? b : op === "a − b" ? [-bx, -by] : a;
  const result: P = [a[0] + second[0], a[1] + second[1]];
  const start: P = [0, 0];
  const mid: P = a;
  const all = [start, mid, result];
  const pad = 1;
  const x: [number, number] = [Math.min(...all.map((p) => p[0])) - pad, Math.max(...all.map((p) => p[0])) + pad];
  const y: [number, number] = [Math.min(...all.map((p) => p[1])) - pad, Math.max(...all.map((p) => p[1])) + pad];
  const secondName = op === "a + b" ? "b" : op === "a − b" ? "−b" : "a";
  const plane: PlaneSpec = {
    x,
    y,
    grid: true,
    arrows: [
      { from: start, to: mid },
      { from: mid, to: result },
    ],
    lines: [{ a: start, b: result, dashed: true, tone: "ink" }],
    points: [{ at: start }],
    lengths: [
      { a: start, b: mid, text: "a" },
      { a: mid, b: result, text: secondName },
    ],
    description: `Arrow a goes ${vectorWords(a)}. Then arrow ${secondName} goes ${vectorWords(second)}. The dashed line from the start to the end is ${op}, which goes ${vectorWords(result)}.`,
  };
  return (
    <>
      <p>Set vectors a and b. Pick a calculation. The two moves go tip to tail, and the dashed line is the answer.</p>
      <div className="grid-2">
        <Slider label="a: across" value={ax} min={-4} max={4} onChange={setAx} />
        <Slider label="a: up/down" value={ay} min={-4} max={4} onChange={setAy} />
        <Slider label="b: across" value={bx} min={-4} max={4} onChange={setBx} />
        <Slider label="b: up/down" value={by} min={-4} max={4} onChange={setBy} />
      </div>
      <div className="choice-row" role="group" aria-label="Calculation">
        {(["a + b", "a − b", "2a"] as Op[]).map((o) => (
          <button key={o} type="button" className="choice" aria-pressed={op === o} onClick={() => setOp(o)}>
            {o}
          </button>
        ))}
      </div>
      <PlaneDiagram plane={plane} maxWidth={380} maxHeight={320} />
      <p aria-live="polite" style={{ fontSize: "1.15rem" }}>
        <MathText text={`${op} = ${op === "2a" ? `2 × ${vec(a)}` : `${vec(a)} ${op === "a + b" ? "+" : "−"} ${vec(b)}`} = ${vec(result)}`} />
      </p>
    </>
  );
}

export const VECTOR_DEMOS = { "vector-builder": VectorBuilder };
