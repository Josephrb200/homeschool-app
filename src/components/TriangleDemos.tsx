"use client";

/**
 * Interactive demonstrations for Pythagoras, trigonometry, congruence and
 * similar shapes. Each lets the student change something and watch what stays
 * the same. Keyboard operable; every state is also described in words.
 */

import { useId, useState } from "react";
import type { AngleSpec } from "@/engine/types";
import { AngleDiagram } from "./AngleDiagram";
import { len, num, pose, rightTriangle, triASA, triSAS, triSSS, twoShapes, type P, type ShapeMarks } from "@/content/maths/triangles/geometry";

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

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const d1 = (x: number) => (Math.round(x * 10) / 10).toFixed(1);
const d3 = (x: number) => (Math.round(x * 1000) / 1000).toFixed(3);

// ---------------------------------------------------------------- Pythagoras

/** A right triangle with a square drawn on each side, so the areas can be compared. */
function PythagorasSquares() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const c = Math.hypot(a, b);
  // Real coordinates (y up): right angle at the origin, a along x, b along y.
  const sqA: P[] = [[0, 0], [a, 0], [a, -a], [0, -a]];
  const sqB: P[] = [[0, 0], [0, b], [-b, b], [-b, 0]];
  const sqC: P[] = [[a, 0], [0, b], [b, a + b], [a + b, a]];
  const all = [...sqA, ...sqB, ...sqC];
  const minX = Math.min(...all.map((p) => p[0]));
  const maxX = Math.max(...all.map((p) => p[0]));
  const minY = Math.min(...all.map((p) => p[1]));
  const maxY = Math.max(...all.map((p) => p[1]));
  const W = 360;
  const s = Math.min((W - 30) / (maxX - minX), (W - 30) / (maxY - minY));
  const X = (p: P) => [15 + (p[0] - minX) * s, 15 + (maxY - p[1]) * s];
  const poly = (pts: P[]) => pts.map((p) => X(p).join(",")).join(" ");
  const mid = (pts: P[]) => X([pts.reduce((t, p) => t + p[0], 0) / pts.length, pts.reduce((t, p) => t + p[1], 0) / pts.length]);
  const label = (pts: P[], text: string, key: string) => {
    const [x, y] = mid(pts);
    return (
      <text key={key} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={16} fontWeight={700} fill="var(--ink)">
        {text}
      </text>
    );
  };
  const vbH = (maxY - minY) * s + 30;
  const vbW = (maxX - minX) * s + 30;
  const exact = Number.isInteger(Math.round(c * 1e9) / 1e9);
  return (
    <>
      <p>Change the two shorter sides. Compare the areas of the three squares.</p>
      <div className="grid-2">
        <Slider label="Side a" value={a} min={1} max={8} onChange={setA} />
        <Slider label="Side b" value={b} min={1} max={8} onChange={setB} />
      </div>
      <svg viewBox={`0 0 ${vbW} ${vbH}`} width="100%" style={{ maxWidth: vbW }} role="img" aria-label={`A right-angled triangle with sides ${a} and ${b}. Squares on the sides have areas ${a * a}, ${b * b} and ${d1(c * c)}.`}>
        <polygon points={poly(sqA)} fill="var(--accent-soft)" stroke="var(--ink)" strokeWidth={1.5} />
        <polygon points={poly(sqB)} fill="var(--accent-soft)" stroke="var(--ink)" strokeWidth={1.5} />
        <polygon points={poly(sqC)} fill="var(--accent)" fillOpacity={0.25} stroke="var(--ink)" strokeWidth={1.5} />
        <polygon points={poly([[0, 0], [a, 0], [0, b]])} fill="var(--surface)" stroke="var(--ink)" strokeWidth={2.5} />
        {label(sqA, `${a * a}`, "a")}
        {label(sqB, `${b * b}`, "b")}
        {label(sqC, `${num(Math.round(c * c * 100) / 100)}`, "c")}
      </svg>
      <Readout>
        {a}² + {b}² = {a * a} + {b * b} = <strong>{a * a + b * b}</strong>. The big square on the hypotenuse has the same area, so the hypotenuse is √{a * a + b * b} ={" "}
        <strong>{exact ? Math.round(c) : `${d1(c)} (1 d.p.)`}</strong>.
      </Readout>
    </>
  );
}

// ---------------------------------------------------------------- SOHCAHTOA ratios

function TrigRatioExplore() {
  const [theta, setTheta] = useState(35);
  const [h, setH] = useState(10);
  const o = h * Math.sin(rad(theta));
  const a = h * Math.cos(rad(theta));
  const spec = rightTriangle(a, o, {
    sides: { base: `A = ${d1(a)}`, height: `O = ${d1(o)}`, hyp: `H = ${h}` },
    angle: { at: "base", text: `${theta}°`, highlight: true },
    description: `A right-angled triangle with angle ${theta}°. Hypotenuse ${h}, opposite ${d1(o)}, adjacent ${d1(a)}.`,
  });
  return (
    <>
      <p>First change the size of the triangle and keep the angle the same. The sides change, but the three ratios don't. Then change the angle.</p>
      <div className="grid-2">
        <Slider label="Angle (degrees)" value={theta} min={10} max={80} step={5} onChange={setTheta} />
        <Slider label="Hypotenuse" value={h} min={4} max={12} onChange={setH} />
      </div>
      <AngleDiagram spec={spec} maxWidth={420} maxHeight={260} />
      <Readout>
        sin {theta}° = O ÷ H = <strong>{d3(o / h)}</strong>. cos {theta}° = A ÷ H = <strong>{d3(a / h)}</strong>. tan {theta}° = O ÷ A = <strong>{d3(o / a)}</strong>.
      </Readout>
    </>
  );
}

// ---------------------------------------------------------------- inverse trig

function TrigAngleFinder() {
  const [o, setO] = useState(5);
  const [a, setA] = useState(8);
  const theta = deg(Math.atan(o / a));
  const spec = rightTriangle(a, o, {
    sides: { base: `adjacent ${a}`, height: `opposite ${o}` },
    angle: { at: "base", text: "θ", highlight: true },
    description: `A right-angled triangle with opposite side ${o} and adjacent side ${a}. The angle θ is ${d1(theta)}°.`,
  });
  return (
    <>
      <p>Change the two shorter sides. The calculator works backwards from tan θ to the angle θ.</p>
      <div className="grid-2">
        <Slider label="Opposite" value={o} min={1} max={12} onChange={setO} />
        <Slider label="Adjacent" value={a} min={1} max={12} onChange={setA} />
      </div>
      <AngleDiagram spec={spec} maxWidth={420} maxHeight={260} />
      <Readout>
        tan θ = {o} ÷ {a} = {d3(o / a)}. So θ = tan⁻¹({o} ÷ {a}) = <strong>{d1(theta)}°</strong>.
      </Readout>
    </>
  );
}

// ---------------------------------------------------------------- exact values

const HALF_SQUARE: AngleSpec = {
  ...rightTriangle(5, 5, { sides: { base: "1", height: "1", hyp: "√2" }, angle: { at: "base", text: "45°", highlight: true }, description: "Half a square: a right-angled triangle with short sides 1 and 1, hypotenuse √2 and two 45° angles." }),
};
const HALF_EQUILATERAL: AngleSpec = (() => {
  const s = rightTriangle(5 * Math.sqrt(3), 5, { sides: { base: "√3", height: "1", hyp: "2" }, angle: { at: "base", text: "30°", highlight: true }, description: "Half an equilateral triangle: hypotenuse 2, short side 1 opposite 30°, other side √3 opposite 60°." });
  s.angles.push({ at: "T", from: "R", to: "B", text: "60°" });
  return s;
})();

const EXACT_ROWS: [string, string, string, string][] = [
  ["0°", "0", "1", "0"],
  ["30°", "1/2", "√3/2", "√3/3"],
  ["45°", "√2/2", "√2/2", "1"],
  ["60°", "√3/2", "1/2", "√3"],
  ["90°", "1", "0", "—"],
];

function ExactTrigTriangles() {
  const [which, setWhich] = useState<"square" | "equilateral">("equilateral");
  return (
    <>
      <p>Press a triangle. Read sin, cos and tan straight off its sides with SOH CAH TOA.</p>
      <Choices
        label="Triangle"
        value={which}
        options={[
          ["equilateral", "Half an equilateral triangle"],
          ["square", "Half a square"],
        ]}
        onChange={setWhich}
      />
      <AngleDiagram spec={which === "square" ? HALF_SQUARE : HALF_EQUILATERAL} maxWidth={380} maxHeight={240} />
      <Readout>
        {which === "square" ? (
          <>
            sin 45° = 1 ÷ √2 = √2/2. cos 45° = √2/2 too. tan 45° = 1 ÷ 1 = <strong>1</strong>.
          </>
        ) : (
          <>
            From 30°: sin 30° = 1 ÷ 2 = <strong>1/2</strong>, cos 30° = <strong>√3 ÷ 2</strong>, tan 30° = 1 ÷ √3. From 60°: sin 60° = √3 ÷ 2, cos 60° = <strong>1/2</strong>, tan 60° = √3.
          </>
        )}
      </Readout>
      <table className="data-table">
        <caption className="eyebrow">All the exact values</caption>
        <thead>
          <tr>
            <th scope="col">Angle</th>
            <th scope="col">sin</th>
            <th scope="col">cos</th>
            <th scope="col">tan</th>
          </tr>
        </thead>
        <tbody>
          {EXACT_ROWS.map((r) => (
            <tr key={r[0]}>
              <th scope="row">{r[0]}</th>
              <td>{r[1]}</td>
              <td>{r[2]}</td>
              <td>{r[3]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

// ---------------------------------------------------------------- congruence

type Test = "SSS" | "SAS" | "ASA" | "RHS" | "AAA";
const TESTS: Record<Test, { pts: P[]; marks: ShapeMarks; k?: number; text: string }> = {
  SSS: { pts: triSSS(7, 6, 8), marks: { sides: [{ i: 0, text: len(8) }, { i: 1, text: len(7) }, { i: 2, text: len(6) }] }, text: "All three pairs of sides match. The angles have no choice: the triangles must be congruent." },
  SAS: {
    pts: triSAS(8, 50, 6),
    marks: { sides: [{ i: 0, text: len(8) }, { i: 2, text: len(6) }], angles: [{ i: 0, text: "50°" }] },
    text: "Two sides and the angle between them match. Fix those and the third side has only one length: congruent.",
  },
  ASA: {
    pts: triASA(55, 8, 45),
    marks: { sides: [{ i: 0, text: len(8) }], angles: [{ i: 0, text: "55°" }, { i: 1, text: "45°" }] },
    text: "Two angles and the side between them match. The other two sides must meet at the same point: congruent.",
  },
  RHS: {
    pts: [[0, 0], [5, 0], [0, Math.sqrt(9 * 9 - 25)]],
    marks: { sides: [{ i: 0, text: len(5) }, { i: 1, text: len(9) }], angles: [{ i: 0, right: true }] },
    text: "A right angle, the hypotenuse and one other side match. Pythagoras fixes the third side: congruent.",
  },
  AAA: {
    pts: triASA(55, 6, 45),
    marks: { angles: [{ i: 0, text: "55°" }, { i: 1, text: "45°" }, { i: 2, text: "80°" }] },
    k: 1.5,
    text: "All three angles match, but one triangle is bigger. Same shape, different size: similar, NOT congruent. AAA is not a test for congruence.",
  },
};

function CongruenceTests() {
  const [t, setT] = useState<Test>("SAS");
  const [turn, setTurn] = useState(150);
  const info = TESTS[t];
  const spec = twoShapes(
    { pts: info.pts, names: ["A", "B", "C"], marks: info.marks },
    { pts: pose(info.pts, { rot: turn, flip: true, k: info.k ?? 1 }), names: ["D", "E", "F"], marks: info.marks },
    { description: `Two triangles marked to show ${t}. The second is turned ${turn}° and flipped.` },
  );
  return (
    <>
      <p>Press a test. Turn the second triangle. The marks travel with it, so matching sides and angles stay matched.</p>
      <Choices label="Test" value={t} options={(["SSS", "SAS", "ASA", "RHS", "AAA"] as const).map((k) => [k, k] as const)} onChange={setT} />
      <Slider label="Turn the second triangle (degrees)" value={turn} min={0} max={360} step={15} onChange={setTurn} />
      <AngleDiagram spec={spec} maxWidth={620} maxHeight={320} />
      <Readout>
        <strong>{t}</strong>: {info.text}
      </Readout>
    </>
  );
}

// ---------------------------------------------------------------- similar shapes

function SimilarScale() {
  const [k, setK] = useState(2);
  const base = triSAS(4, 60, 3);
  const marks = (f: number): ShapeMarks => ({
    sides: [
      { i: 0, text: len(4 * f) },
      { i: 2, text: len(3 * f) },
    ],
    angles: [{ i: 0, text: "60°" }],
  });
  const spec = twoShapes({ pts: base, names: ["A", "B", "C"], marks: marks(1) }, { pts: pose(base, { k }), names: ["P", "Q", "R"], marks: marks(k) }, {
    description: `A triangle with sides 4 cm and 3 cm and a 60° angle, and a similar triangle enlarged by scale factor ${k}: sides ${num(4 * k)} cm and ${num(3 * k)} cm.`,
  });
  return (
    <>
      <p>Change the scale factor. Every length is multiplied by it. The angle doesn&apos;t change.</p>
      <Slider label="Scale factor" value={k} min={0.5} max={3} step={0.5} onChange={setK} />
      <AngleDiagram spec={spec} maxWidth={620} maxHeight={320} />
      <Readout>
        4 × {num(k)} = <strong>{num(4 * k)}</strong> and 3 × {num(k)} = <strong>{num(3 * k)}</strong>. Check: {num(4 * k)} ÷ 4 = {num(3 * k)} ÷ 3 = {num(k)}, the same scale factor, so the triangles are similar.
      </Readout>
    </>
  );
}

export const TRIANGLE_DEMOS = {
  "pythagoras-squares": PythagorasSquares,
  "trig-ratio-explore": TrigRatioExplore,
  "trig-angle-finder": TrigAngleFinder,
  "exact-trig-triangles": ExactTrigTriangles,
  "congruence-tests": CongruenceTests,
  "similar-scale": SimilarScale,
};
