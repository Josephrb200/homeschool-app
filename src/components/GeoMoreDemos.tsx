"use client";

/**
 * Interactive demonstrations for protractors, bearings, angle reasoning,
 * 3D shapes and plans/elevations. Keyboard operable; every state is also
 * described in words.
 */

import { useId, useState } from "react";
import type { CubeStackSpec } from "@/engine/types";
import { ProtractorDiagram } from "./ProtractorDiagram";
import { AngleDiagram } from "./AngleDiagram";
import { SolidDiagram } from "./SolidDiagram";
import { CubeStackDiagram } from "./CubeStackDiagram";
import { PlaneDiagram } from "./PlaneDiagram";
import { bearingDiagram, threeFig } from "@/content/maths/bearings/generators";
import { parallelDiagram } from "@/content/maths/angles/geometry";
import { SOLIDS, views } from "@/content/maths/solids/generators";

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

function Readout({ children }: { children: React.ReactNode }) {
  return (
    <p aria-live="polite" style={{ fontSize: "1.15rem" }}>
      {children}
    </p>
  );
}

function ProtractorRead() {
  const [size, setSize] = useState(40);
  const [from, setFrom] = useState<"inner" | "outer">("outer");
  return (
    <>
      <p>Change the angle, and which end of the protractor the first arm sits on. Watch both scales: only one starts at 0 on an arm.</p>
      <Slider label="Angle" value={size} min={10} max={170} step={5} onChange={setSize} />
      <Choices label="First arm on" value={from} options={[["outer", "Left end (outer scale)"], ["inner", "Right end (inner scale)"]] as const} onChange={setFrom} />
      <ProtractorDiagram spec={{ size, turn: 0, from, description: `An angle of ${size}° with a protractor, one arm on 0 of the ${from} scale.` }} maxWidth={380} />
      <Readout>
        Read the <strong>{from}</strong> scale: <strong>{size}°</strong>. The other scale shows {180 - size}°, which is wrong. The angle is {size < 90 ? "acute" : size === 90 ? "a right angle" : "obtuse"}, so {size}° makes sense.
      </Readout>
    </>
  );
}

function BearingTurn() {
  const [b, setB] = useState(60);
  const back = b < 180 ? b + 180 : b - 180;
  return (
    <>
      <p>Turn the line from A to B. The bearing is the clockwise turn from north.</p>
      <Slider label="Bearing of B from A" value={b} min={10} max={350} step={5} onChange={setB} />
      <AngleDiagram spec={bearingDiagram(b, `${b}°`, "cw", true, `${back}°`)} maxWidth={380} maxHeight={340} />
      <Readout>
        Bearing of B from A: <strong>{threeFig(b)}</strong>. Bearing of A from B: <strong>{threeFig(back)}</strong> ({b < 180 ? `${b}° + 180°` : `${b}° − 180°`}).
      </Readout>
    </>
  );
}

const CHAIN = [
  { text: "We know one angle: 65°. We want y.", marks: [{ at: "P" as const, pos: 0 as const, text: "65°" }, { at: "Q" as const, pos: 3 as const, text: "y", highlight: true }] },
  { text: "Step 1: the angle above the bottom line on the left is 180° − 65° = 115° (angles on a straight line add up to 180°).", marks: [{ at: "P" as const, pos: 0 as const, text: "65°" }, { at: "P" as const, pos: 1 as const, text: "115°" }, { at: "Q" as const, pos: 3 as const, text: "y", highlight: true }] },
  { text: "Step 2: y and 115° make a Z shape, so y = 115° (alternate angles are equal).", marks: [{ at: "P" as const, pos: 0 as const, text: "65°" }, { at: "P" as const, pos: 1 as const, text: "115°" }, { at: "Q" as const, pos: 3 as const, text: "115°", highlight: true }] },
];

function AngleChain() {
  const [step, setStep] = useState(0);
  const s = CHAIN[step];
  return (
    <>
      <p>Step through a two-step angle problem. Each step finds one angle and gives its reason.</p>
      <AngleDiagram spec={parallelDiagram(65, s.marks)} maxWidth={380} maxHeight={300} />
      <Readout>{s.text}</Readout>
      <div className="row">
        <button type="button" className="btn" disabled={step === 0} onClick={() => setStep(step - 1)}>
          Back
        </button>
        <button type="button" className="btn btn-primary" disabled={step === CHAIN.length - 1} onClick={() => setStep(step + 1)}>
          Next step
        </button>
      </div>
    </>
  );
}

function SolidExplorer() {
  const [i, setI] = useState(0);
  const s = SOLIDS[i];
  return (
    <>
      <p>Pick a solid. Count its faces, edges and vertices, then check the rule faces + vertices − edges = 2.</p>
      <div className="choice-row" role="group" aria-label="Solid">
        {SOLIDS.map((x, k) => (
          <button key={x.name} type="button" className="choice" aria-pressed={i === k} onClick={() => setI(k)}>
            {x.name}
          </button>
        ))}
      </div>
      <SolidDiagram solid={s.solid} maxWidth={360} maxHeight={260} />
      <Readout>
        A {s.name} has <strong>{s.faces} faces</strong>, <strong>{s.edges} edges</strong> and <strong>{s.vertices} vertices</strong>. Check: {s.faces} + {s.vertices} − {s.edges} = 2.
      </Readout>
    </>
  );
}

const STACKS: number[][][] = [
  [
    [2, 1, 1],
    [3, 0, 1],
  ],
  [
    [1, 2],
    [1, 3],
    [0, 1],
  ],
  [
    [3, 2, 1],
    [1, 1, 0],
  ],
];

function CubeViews() {
  const [k, setK] = useState(0);
  const [view, setView] = useState<"plan" | "front" | "side">("plan");
  const h = STACKS[k];
  const v = views(h);
  const cells = v[view];
  const w = Math.max(...cells.map((c) => c[0])) + 1;
  const ht = Math.max(...cells.map((c) => c[1])) + 1;
  const spec: CubeStackSpec = { heights: h, showFront: true, showSide: view === "side", description: `A solid of cubes with ${h.flat().reduce((a, b) => a + b, 0)} cubes.` };
  return (
    <>
      <p>Pick a solid and a view. The view is drawn on squared paper, the way you would in an exam.</p>
      <Choices label="Solid" value={String(k) as "0" | "1" | "2"} options={[["0", "Solid 1"], ["1", "Solid 2"], ["2", "Solid 3"]] as const} onChange={(s) => setK(Number(s))} />
      <Choices label="View" value={view} options={[["plan", "Plan (from above)"], ["front", "Front elevation"], ["side", "Side elevation"]] as const} onChange={setView} />
      <div className="row" style={{ alignItems: "flex-end", flexWrap: "wrap" }}>
        <CubeStackDiagram spec={spec} maxWidth={260} maxHeight={220} />
        <PlaneDiagram
          plane={{
            x: [-0.5, w + 0.5],
            y: [-0.5, ht + 0.5],
            shapes: cells.map(([x, y]) => ({ points: [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]] as [number, number][], tone: "image" as const })),
            description: `The ${view}: ${cells.length} squares.`,
          }}
          maxWidth={180}
          maxHeight={180}
        />
      </div>
      <Readout>
        The {view === "plan" ? "plan" : `${view} elevation`} has <strong>{cells.length} squares</strong>.{" "}
        {view === "plan" ? "Each stack shows as one square from above." : "Each column shows the tallest stack in that line."}
      </Readout>
    </>
  );
}

export const GEO_MORE_DEMOS = {
  "protractor-read": ProtractorRead,
  "bearing-turn": BearingTurn,
  "angle-chain": AngleChain,
  "solid-explorer": SolidExplorer,
  "cube-views": CubeViews,
};
