"use client";

/**
 * Interactive demonstrations for constructions, loci, answers in terms of π,
 * parts of circles, sectors, solid volumes and area/volume units. Keyboard
 * operable; every state is also described in words.
 */

import { useId, useState } from "react";
import type { PlaneSpec, SolidSpec } from "@/engine/types";
import { PlaneDiagram } from "./PlaneDiagram";
import { SolidDiagram } from "./SolidDiagram";
import { angleBisector, locusCircle, locusStadium, perpBisector } from "@/content/maths/constructions/generators";
import { circlePart, cmSquarePic, cubeSolid, sectorPic } from "@/content/maths/mensuration/generators";

const PI = Math.PI;
const d1 = (x: number) => (Math.round(x * 10) / 10).toFixed(1);

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

// ---------------------------------------------------------------- constructions

const STEPS = {
  line: [
    "Draw the line AB.",
    "Open the compass to more than half of AB. Draw arcs from A, above and below the line.",
    "Keep the compass the same. Draw arcs from B that cross the first two.",
    "Join the two crossing points with a ruler. That's the perpendicular bisector: it cuts AB in half at 90°.",
  ],
  angle: [
    "Start with the angle ABC.",
    "Draw an arc from B that crosses both arms.",
    "From each crossing point, draw an arc the same width so they meet inside the angle.",
    "Join B to where those arcs meet. That's the angle bisector: it cuts the angle in half.",
  ],
};

function stepPicture(which: "line" | "angle", step: number): PlaneSpec {
  if (which === "line") {
    const p = perpBisector(7);
    return { ...p, arcs: step >= 2 ? p.arcs : step === 1 ? p.arcs!.slice(0, 2) : [], lines: step >= 3 ? p.lines : p.lines!.slice(0, 1) };
  }
  const p = angleBisector(70);
  return { ...p, arcs: step >= 2 ? p.arcs : step === 1 ? p.arcs!.slice(0, 1) : [], lines: step >= 3 ? p.lines : p.lines!.slice(0, 2) };
}

function ConstructSteps() {
  const [which, setWhich] = useState<"line" | "angle">("line");
  const [step, setStep] = useState(0);
  return (
    <>
      <p>Pick a construction and step through it. Only a ruler and compasses are used, and the arcs stay on the drawing.</p>
      <Choices
        label="Construction"
        value={which}
        options={[["line", "Perpendicular bisector"], ["angle", "Angle bisector"]] as const}
        onChange={(v) => {
          setWhich(v);
          setStep(0);
        }}
      />
      <PlaneDiagram plane={stepPicture(which, step)} maxWidth={380} maxHeight={300} />
      <Readout>
        Step {step + 1} of 4: {STEPS[which][step]}
      </Readout>
      <div className="row">
        <button type="button" className="btn" disabled={step === 0} onClick={() => setStep(step - 1)}>
          Back
        </button>
        <button type="button" className="btn btn-primary" disabled={step === 3} onClick={() => setStep(step + 1)}>
          Next step
        </button>
      </div>
    </>
  );
}

// ---------------------------------------------------------------- loci

function LociExplore() {
  const [rule, setRule] = useState<"point" | "two" | "line">("point");
  const [d, setD] = useState(2);
  let pic: PlaneSpec;
  let words: string;
  if (rule === "point") {
    pic = { ...locusCircle(d, true), x: [-5, 5], y: [-5, 5], grid: true };
    words = `Every point less than ${d} m from P: the inside of a circle, centre P, radius ${d} m.`;
  } else if (rule === "line") {
    pic = { ...locusStadium(4, d), x: [-4, 8], y: [-4, 4], grid: true };
    words = `Every point less than ${d} m from the wall: straight sides ${d} m away, and a semicircle of radius ${d} m round each end.`;
  } else {
    pic = {
      x: [-1, 7],
      y: [-3, 3],
      grid: true,
      shapes: [{ points: [[-1, -3], [3, -3], [3, 3], [-1, 3]], tone: "region" }],
      lines: [{ a: [3, -3], b: [3, 3], tone: "mirror" }],
      points: [{ at: [1, 0], label: "A" }, { at: [5, 0], label: "B" }],
      description: "Points A and B with their perpendicular bisector. The side nearer A is shaded.",
    };
    words = "The perpendicular bisector of AB is every point the same distance from A and B. The shaded side is closer to A.";
  }
  return (
    <>
      <p>Pick a rule. The shading shows every point that follows it.</p>
      <Choices label="Rule" value={rule} options={[["point", "Near a point"], ["two", "Closer to A than B"], ["line", "Near a wall"]] as const} onChange={setRule} />
      {rule !== "two" && <Slider label="Distance (m)" value={d} min={1} max={3} step={0.5} onChange={setD} />}
      <PlaneDiagram plane={pic} maxWidth={380} maxHeight={300} />
      <Readout>{words}</Readout>
    </>
  );
}

// ---------------------------------------------------------------- π

function PiExact() {
  const [r, setR] = useState(5);
  return (
    <>
      <p>Change the radius. The exact answer keeps π; the calculator answer rounds it.</p>
      <Slider label="Radius (cm)" value={r} min={1} max={12} onChange={setR} />
      <PlaneDiagram plane={circlePart("whole", r, `${r} cm`)} maxWidth={300} maxHeight={260} />
      <Readout>
        Area = π × {r}² = <strong>{r * r}π cm²</strong> (about {d1(PI * r * r)} cm²). Circumference = π × {2 * r} = <strong>{2 * r}π cm</strong> (about {d1(2 * PI * r)} cm).
      </Readout>
    </>
  );
}

function CircleParts() {
  const [part, setPart] = useState<"whole" | "half" | "quarter">("half");
  const [r, setR] = useState(4);
  const k = part === "whole" ? 1 : part === "half" ? 2 : 4;
  const curved = (2 * PI * r) / k;
  const straight = part === "whole" ? 0 : part === "half" ? 2 * r : 2 * r;
  return (
    <>
      <p>Pick a part of a circle and change the radius. Watch how the straight edges join the perimeter.</p>
      <Choices label="Part" value={part} options={[["whole", "Whole circle"], ["half", "Semicircle"], ["quarter", "Quarter circle"]] as const} onChange={setPart} />
      <Slider label="Radius (cm)" value={r} min={2} max={10} onChange={setR} />
      <PlaneDiagram plane={circlePart(part, r, `${r} cm`)} maxWidth={320} maxHeight={260} />
      <Readout>
        Area = π × {r}²{k > 1 ? ` ÷ ${k}` : ""} = <strong>{d1((PI * r * r) / k)} cm²</strong>. Perimeter = curved {d1(curved)}
        {straight ? ` + straight ${straight}` : ""} = <strong>{d1(curved + straight)} cm</strong>.
      </Readout>
    </>
  );
}

function SectorExplore() {
  const [angle, setAngle] = useState(120);
  const [r, setR] = useState(6);
  const f = angle / 360;
  return (
    <>
      <p>Change the angle and the radius. The sector is angle ÷ 360 of the whole circle.</p>
      <Slider label="Angle (°)" value={angle} min={10} max={350} step={10} onChange={setAngle} />
      <Slider label="Radius (cm)" value={r} min={2} max={10} onChange={setR} />
      <PlaneDiagram plane={sectorPic(angle, r, `${r} cm`, `${angle}°`)} maxWidth={320} maxHeight={280} />
      <Readout>
        Fraction = {angle}/360. Arc = {angle}/360 × 2 × π × {r} = <strong>{d1(f * 2 * PI * r)} cm</strong>. Area = {angle}/360 × π × {r}² = <strong>{d1(f * PI * r * r)} cm²</strong>.
      </Readout>
    </>
  );
}

function SolidVolume() {
  const [kind, setKind] = useState<"cone" | "pyramid" | "sphere">("cone");
  const [r, setR] = useState(3);
  const [h, setH] = useState(6);
  let solid: SolidSpec;
  let words: React.ReactNode;
  if (kind === "cone") {
    solid = { kind: "cone", r, h, rText: `${r} cm`, hText: `${h} cm`, description: `A cone with radius ${r} cm and height ${h} cm.` };
    words = (
      <>
        Cylinder: π × {r}² × {h} = {d1(PI * r * r * h)} cm³. The cone is a third of that: <strong>{d1((PI * r * r * h) / 3)} cm³</strong>.
      </>
    );
  } else if (kind === "pyramid") {
    solid = { kind: "pyramid", base: "square", size: 2 * r, h, baseText: `${2 * r} cm`, hText: `${h} cm`, description: `A square-based pyramid with base ${2 * r} cm and height ${h} cm.` };
    words = (
      <>
        Cuboid: {2 * r} × {2 * r} × {h} = {4 * r * r * h} cm³. The pyramid is a third of that: <strong>{d1((4 * r * r * h) / 3)} cm³</strong>.
      </>
    );
  } else {
    solid = { kind: "sphere", r, rText: `${r} cm`, description: `A sphere with radius ${r} cm.` };
    words = (
      <>
        Volume = 4/3 × π × {r}³ = <strong>{d1((4 / 3) * PI * r ** 3)} cm³</strong>. Surface area = 4 × π × {r}² = <strong>{d1(4 * PI * r * r)} cm²</strong>.
      </>
    );
  }
  return (
    <>
      <p>Pick a solid and change its size. Cones and pyramids fill exactly a third of the cylinder or cuboid around them.</p>
      <Choices label="Solid" value={kind} options={[["cone", "Cone"], ["pyramid", "Pyramid"], ["sphere", "Sphere"]] as const} onChange={setKind} />
      <Slider label={kind === "pyramid" ? "Half the base (cm)" : "Radius (cm)"} value={r} min={1} max={6} onChange={setR} />
      {kind !== "sphere" && <Slider label="Height (cm)" value={h} min={2} max={10} onChange={setH} />}
      <SolidDiagram solid={solid} maxWidth={320} maxHeight={240} />
      <Readout>{words}</Readout>
    </>
  );
}

function UnitConvert() {
  const [kind, setKind] = useState<"length" | "area" | "volume">("area");
  const [n, setN] = useState(3);
  const factor = kind === "length" ? 10 : kind === "area" ? 100 : 1000;
  const unit = kind === "length" ? ["cm", "mm"] : kind === "area" ? ["cm²", "mm²"] : ["cm³", "mm³"];
  return (
    <>
      <p>1 cm = 10 mm. See what that means for squares and cubes.</p>
      <Choices label="Measure" value={kind} options={[["length", "Length"], ["area", "Area"], ["volume", "Volume"]] as const} onChange={setKind} />
      <Slider label={`Amount (${unit[0]})`} value={n} min={1} max={20} onChange={setN} />
      {kind === "volume" ? <SolidDiagram solid={cubeSolid("10 mm", 2)} maxWidth={240} maxHeight={200} /> : <PlaneDiagram plane={kind === "area" ? cmSquarePic() : { ...cmSquarePic(), y: [0, 1], shapes: [{ points: [[0, 0], [10, 0], [10, 1], [0, 1]], tone: "outline" }], lengths: [{ a: [0, 0], b: [10, 0], text: "1 cm = 10 mm" }], description: "A 1 cm line split into 10 mm." }} maxWidth={300} maxHeight={260} />}
      <Readout>
        1 {unit[0]} = {kind === "length" ? "10" : kind === "area" ? "10 × 10 = 100" : "10 × 10 × 10 = 1000"} {unit[1]}. So {n} {unit[0]} = {n} × {factor} = <strong>{(n * factor).toLocaleString("en-GB")} {unit[1]}</strong>.
      </Readout>
    </>
  );
}

export const MEASURE_MORE_DEMOS = {
  "construct-steps": ConstructSteps,
  "loci-explore": LociExplore,
  "pi-exact": PiExact,
  "circle-parts": CircleParts,
  "sector-explore": SectorExplore,
  "solid-volume": SolidVolume,
  "unit-convert": UnitConvert,
};
