"use client";

/**
 * Interactive demonstrations for coordinates and graphs. Each lets the student
 * change one or two numbers and see the graph respond. Sliders and buttons are
 * keyboard operable, and every state is also described in words.
 */

import { useId, useState } from "react";
import type { GraphSpec } from "@/engine/types";
import { GraphDiagram } from "./GraphDiagram";
import { grid, lineEq, linePoints, num, sample, showPoint } from "@/content/maths/graphs/plot";
import { quadRhs } from "@/content/maths/graphs/curves";

function Slider({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (n: number) => void }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}: <strong>{num(value)}</strong>
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

const rhsPart = (c: number) => (c === 0 ? "" : c > 0 ? ` + ${c}` : ` − ${-c}`);
const times = (m: number, x: number) => (m === 1 ? (x < 0 ? `(${num(x)})` : String(x)) : `${num(m)} × ${x < 0 ? `(${num(x)})` : x}`);

// ---------------------------------------------------------------- coordinates

function CoordinateExplorer() {
  const [p, setP] = useState<[number, number]>([3, -2]);
  const [x, y] = p;
  const quadrant = x === 0 && y === 0 ? "at the origin" : x === 0 ? "on the y-axis" : y === 0 ? "on the x-axis" : x > 0 ? (y > 0 ? "in the top-right quadrant" : "in the bottom-right quadrant") : y > 0 ? "in the top-left quadrant" : "in the bottom-left quadrant";
  const graph: GraphSpec = {
    ...grid(-6, 6, -6, 6),
    points: [{ at: p, label: "P" }],
    curves: [{ points: [[0, 0], [x, 0], [x, y]], dashed: true, highlight: true }],
    pick: true,
    description: `A grid with point P at ${showPoint(p)}. A dashed path goes along the x-axis to ${num(x)}, then ${y >= 0 ? "up" : "down"} to P.`,
  };
  return (
    <>
      <p>Click anywhere on the grid (or use the sliders) to move P. The dashed path shows how to get there: along first, then up or down.</p>
      <GraphDiagram graph={graph} maxWidth={380} onPick={setP} picked={p} />
      <Slider label="x (along)" value={x} min={-6} max={6} onChange={(v) => setP([v, y])} />
      <Slider label="y (up or down)" value={y} min={-6} max={6} onChange={(v) => setP([x, v])} />
      <Readout>
        P is at <strong>{showPoint(p)}</strong>: {x === 0 ? "no steps along" : `${Math.abs(x)} ${x > 0 ? "right" : "left"}`}, then {y === 0 ? "no steps up or down" : `${Math.abs(y)} ${y > 0 ? "up" : "down"}`}. It is {quadrant}.
      </Readout>
    </>
  );
}

// ---------------------------------------------------------------- plotting lines

const TABLE_XS = [-2, -1, 0, 1, 2, 3];

function LineTablePlot() {
  const [m, setM] = useState(2);
  const [c, setC] = useState(1);
  const [shown, setShown] = useState(0);
  const pts = TABLE_XS.map((x) => [x, m * x + c] as [number, number]);
  const visible = pts.slice(0, shown);
  const done = shown === pts.length;
  const graph: GraphSpec = {
    ...grid(-3, 4, -10, 10),
    points: visible.map((p) => ({ at: p })),
    curves: done ? [{ points: linePoints(m, c, -3, 4), highlight: true }] : [],
    description: `Plotting ${lineEq(m, c)}. ${visible.length} of ${pts.length} points plotted${done ? ", joined with a straight line" : ""}.`,
  };
  const reset = (f: () => void) => {
    f();
    setShown(0);
  };
  const next = pts[shown];
  return (
    <>
      <p>Choose an equation, then plot the table one point at a time.</p>
      <Slider label="Number multiplying x" value={m} min={-3} max={3} onChange={(v) => reset(() => setM(v))} />
      <Slider label="Number added" value={c} min={-4} max={4} onChange={(v) => reset(() => setC(v))} />
      <p style={{ fontSize: "1.2rem" }}>
        <strong>{lineEq(m, c)}</strong>
      </p>
      <div className="prob-table-wrap">
        <table className="prob-table">
          <caption className="sr-only">Table of values for {lineEq(m, c)}</caption>
          <thead>
            <tr>
              <th scope="col" className="prob-corner">x</th>
              {TABLE_XS.map((x) => (
                <th key={x} scope="col">
                  {num(x)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">y</th>
              {pts.map(([x, y], i) => (
                <td key={x}>{i < shown ? num(y) : ""}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <GraphDiagram graph={graph} maxWidth={340} />
      <div className="row">
        <button type="button" className="btn btn-primary" onClick={() => setShown((s) => Math.min(pts.length, s + 1))} disabled={done}>
          {done ? "All plotted" : "Plot the next point"}
        </button>
        <button type="button" className="btn" onClick={() => setShown(0)}>
          Start again
        </button>
      </div>
      <Readout>
        {next
          ? `Next: x = ${num(next[0])}, so y = ${times(m, next[0])}${rhsPart(c)} = ${num(next[1])}. Plot ${showPoint(next)}.`
          : `All the points line up, so they are joined with a straight line: ${lineEq(m, c)}.`}
      </Readout>
    </>
  );
}

// ---------------------------------------------------------------- real-life graphs

function RealLifeReader() {
  const [fixed, setFixed] = useState(4);
  const [rate, setRate] = useState(2);
  const [miles, setMiles] = useState(6);
  const cost = fixed + rate * miles;
  const graph: GraphSpec = {
    x: { min: 0, max: 10, step: 1, labelStep: 2, label: "Distance (miles)" },
    y: { min: 0, max: 40, step: 2, labelStep: 10, label: "Cost (£)" },
    curves: [{ points: [[0, fixed], [10, fixed + rate * 10]] }, { points: [[miles, 0], [miles, cost], [0, cost]], dashed: true, highlight: true }],
    description: `A taxi cost graph: £${fixed} fixed charge plus £${rate} a mile. A dashed reading line goes up from ${miles} miles to the line, then across to £${cost}.`,
  };
  return (
    <>
      <p>A taxi firm charges a fixed amount to get in, then a price for each mile. Change the prices and the journey, and follow the dashed reading line.</p>
      <Slider label="Fixed charge (£)" value={fixed} min={0} max={10} onChange={setFixed} />
      <Slider label="Price per mile (£)" value={rate} min={1} max={3} onChange={setRate} />
      <Slider label="Journey (miles)" value={miles} min={0} max={10} onChange={setMiles} />
      <GraphDiagram graph={graph} maxWidth={420} />
      <Readout>
        On the cost axis each small square is worth £2. Start at {miles} miles, go up to the line, then across: <strong>£{cost}</strong>. Check: £{fixed} + {miles} × £{rate} = £{cost}. The line starts at £{fixed} (the fixed charge) and climbs £{rate} for every mile.
      </Readout>
    </>
  );
}

// ---------------------------------------------------------------- gradient and intercept

function GradientExplorer() {
  const [m, setM] = useState(2);
  const [c, setC] = useState(-1);
  const x0 = m >= 0 ? -1 : 0;
  const triangle: [number, number][] = [
    [x0, m * x0 + c],
    [x0 + 1, m * x0 + c],
    [x0 + 1, m * (x0 + 1) + c],
  ];
  const graph: GraphSpec = {
    ...grid(-5, 5, -8, 8),
    curves: [{ points: linePoints(m, c, -5, 5) }, { points: triangle, highlight: true }],
    points: [{ at: [0, c], label: "c" }],
    description: `The line ${lineEq(m, c)}. A small step shows 1 across and ${Math.abs(m)} ${m >= 0 ? "up" : "down"}. It crosses the y-axis at ${num(c)}.`,
  };
  return (
    <>
      <p>Change m and c. Watch what each one does to the line.</p>
      <Slider label="m (gradient)" value={m} min={-4} max={4} onChange={setM} />
      <Slider label="c (y-intercept)" value={c} min={-5} max={5} onChange={setC} />
      <p style={{ fontSize: "1.2rem" }}>
        <strong>{lineEq(m, c)}</strong>
      </p>
      <GraphDiagram graph={graph} maxWidth={360} />
      <Readout>
        {m === 0
          ? "With m = 0 the line is flat: a horizontal line."
          : `For every 1 across, the line goes ${Math.abs(m)} ${m > 0 ? "up (uphill, positive gradient)" : "down (downhill, negative gradient)"}.`}{" "}
        It crosses the y-axis at {num(c)}. Changing c slides the line up or down without changing its steepness.
      </Readout>
    </>
  );
}

// ---------------------------------------------------------------- parallel lines

function ParallelLinesGraph() {
  const [m, setM] = useState(2);
  const [px, setPx] = useState(2);
  const [py, setPy] = useState(-1);
  const c0 = 3;
  const c = py - m * px;
  const graph: GraphSpec = {
    ...grid(-6, 6, -8, 8),
    curves: [{ points: linePoints(m, c0, -6, 6) }, { points: linePoints(m, c, -6, 6), dashed: true, highlight: true }],
    points: [{ at: [px, py], label: "P" }],
    pick: true,
    description: `The line ${lineEq(m, c0)} and a parallel dashed line through P ${showPoint([px, py])}, which is ${lineEq(m, c)}.`,
  };
  return (
    <>
      <p>The solid line is {lineEq(m, c0)}. Click the grid to move P. The dashed line is parallel and goes through P.</p>
      <Slider label="Gradient of both lines" value={m} min={-3} max={3} onChange={setM} />
      <GraphDiagram graph={graph} maxWidth={360} onPick={([x, y]) => (setPx(x), setPy(y))} picked={[px, py]} />
      <Readout>
        Same gradient: m = {num(m)}. To find c, put P {showPoint([px, py])} into y = {m === 1 ? "x" : m === -1 ? "−x" : `${num(m)}x`} + c: {num(py)} = {num(m * px)} + c, so c = {num(c)}. The parallel line is <strong>{lineEq(m, c)}</strong>.
      </Readout>
    </>
  );
}

// ---------------------------------------------------------------- quadratics

function QuadraticExplorer() {
  const [p, setP] = useState(-1);
  const [q, setQ] = useState(3);
  const b = -(p + q);
  const c = p * q;
  const h = (p + q) / 2;
  const k = (h - p) * (h - q);
  const f = (x: number) => (x - p) * (x - q);
  const graph: GraphSpec = {
    ...grid(-6, 6, -10, 10),
    curves: [{ points: sample(f, -6, 6) }, { points: [[h, -10], [h, 10]], dashed: true, highlight: true }],
    points: [{ at: [p, 0] }, { at: [q, 0] }, { at: [h, k] }],
    description: `The curve y = ${quadRhs(b, c)} with roots ${num(p)} and ${num(q)}, turning point ${showPoint([h, k])}, and a dashed line of symmetry x = ${num(h)}.`,
  };
  return (
    <>
      <p>Move the two roots, where the curve crosses the x-axis. See how the turning point and the line of symmetry follow.</p>
      <Slider label="First root" value={p} min={-5} max={5} onChange={setP} />
      <Slider label="Second root" value={q} min={-5} max={5} onChange={setQ} />
      <p style={{ fontSize: "1.2rem" }}>
        <strong>y = {quadRhs(b, c)}</strong>
      </p>
      <GraphDiagram graph={graph} maxWidth={360} />
      <Readout>
        {p === q
          ? `Both roots are ${num(p)}: the curve just touches the x-axis there, at its turning point.`
          : `Roots: x = ${num(Math.min(p, q))} and x = ${num(Math.max(p, q))}. Halfway between is the line of symmetry, x = ${num(h)}. The turning point is ${showPoint([h, k])}. It crosses the y-axis at ${num(c)}.`}
      </Readout>
    </>
  );
}

// ---------------------------------------------------------------- graph families

type Fam = "linear" | "quadratic" | "cubic" | "reciprocal";
const FAM_INFO: Record<Fam, { eq: (a: number) => string; f: (a: number) => (x: number) => number; words: string }> = {
  linear: { eq: (a) => lineEq(a, 1), f: (a) => (x) => a * x + 1, words: "A straight line. The highest power of x is x itself." },
  quadratic: { eq: (a) => (a > 0 ? `y = ${a === 1 ? "" : a}x² − 3` : `y = 3 − ${a === -1 ? "" : -a}x²`), f: (a) => (x) => a * x * x + (a > 0 ? -3 : 3), words: "A U shape (or ∩ if the x² is negative). The highest power is x²." },
  cubic: { eq: (a) => (a > 0 ? `y = ${a === 1 ? "" : a}x³` : `y = −${a === -1 ? "" : -a}x³`), f: (a) => (x) => a * x ** 3, words: "An S shape. The highest power is x³. Negative x gives negative x³." },
  reciprocal: { eq: (a) => (a > 0 ? `y = ${a}/x` : `y = −${-a}/x`), f: (a) => (x) => a / x, words: "Two separate curves that never touch the axes. You can't divide by 0." },
};

function GraphFamilies() {
  const [fam, setFam] = useState<Fam>("cubic");
  const [a, setA] = useState(1);
  const info = FAM_INFO[fam];
  const f = info.f(a);
  const curves =
    fam === "reciprocal"
      ? [sample(f, -6, -0.1, 0.02).filter(([, y]) => Math.abs(y) < 12), sample(f, 0.1, 6, 0.02).filter(([, y]) => Math.abs(y) < 12)]
      : [sample(f, -6, 6, 0.02).filter(([, y]) => Math.abs(y) < 40)];
  const graph: GraphSpec = { ...grid(-6, 6, -8, 8), curves: curves.map((points) => ({ points, highlight: true })), description: `The graph of ${info.eq(a)}. ${info.words}` };
  return (
    <>
      <p>Pick a family of graphs. Then make the number in front positive or negative and watch the shape flip.</p>
      <Choices
        label="Type of graph"
        value={fam}
        options={[
          ["linear", "Straight line"],
          ["quadratic", "Quadratic"],
          ["cubic", "Cubic"],
          ["reciprocal", "Reciprocal"],
        ]}
        onChange={setFam}
      />
      <Choices
        label="Number in front"
        value={String(a) as "1" | "-1" | "2" | "-2"}
        options={[
          ["1", "1"],
          ["2", "2"],
          ["-1", "−1"],
          ["-2", "−2"],
        ]}
        onChange={(v) => setA(Number(v))}
      />
      <p style={{ fontSize: "1.2rem" }}>
        <strong>{info.eq(a)}</strong>
      </p>
      <GraphDiagram graph={graph} maxWidth={360} />
      <Readout>{info.words}</Readout>
    </>
  );
}

// ---------------------------------------------------------------- solving with graphs

function SolveWithGraphs() {
  const [k, setK] = useState(5);
  const f = (x: number) => x * x - 2 * x - 3;
  // x² − 2x − 3 = k  →  x = 1 ± √(4 + k)
  const disc = 4 + k;
  const sols = disc < 0 ? [] : disc === 0 ? [1] : [1 - Math.sqrt(disc), 1 + Math.sqrt(disc)];
  const exact = sols.every((s) => Math.abs(s - Math.round(s)) < 1e-9);
  const fmt = (s: number) => (exact ? num(Math.round(s)) : `about ${num(Math.round(s * 10) / 10)}`);
  const graph: GraphSpec = {
    ...grid(-3, 5, -5, 12),
    curves: [{ points: sample(f, -3, 5) }, { points: [[-3, k], [5, k]], dashed: true, highlight: true }],
    points: sols.filter((s) => s >= -3 && s <= 5).map((s) => ({ at: [Math.round(s * 100) / 100, k] as [number, number] })),
    description: `The curve y = x² − 2x − 3 and the dashed line y = ${num(k)}. ${sols.length === 0 ? "They don't meet." : `They meet at x = ${sols.map(fmt).join(" and x = ")}.`}`,
  };
  return (
    <>
      <p>Solve x² − 2x − 3 = k by moving the horizontal line y = k. The solutions are the x-values where the line meets the curve.</p>
      <Slider label="k" value={k} min={-5} max={12} onChange={setK} />
      <GraphDiagram graph={graph} maxWidth={360} />
      <Readout>
        {sols.length === 0
          ? `The line y = ${num(k)} is below the lowest point of the curve, so x² − 2x − 3 = ${num(k)} has no solutions.`
          : sols.length === 1
            ? `The line just touches the turning point: one solution, x = 1.`
            : `x² − 2x − 3 = ${num(k)} has two solutions: x = ${fmt(sols[0])} and x = ${fmt(sols[1])}.${exact ? "" : " These aren't on gridlines, so a graph only gives estimates."}`}
      </Readout>
    </>
  );
}

export const GRAPH_DEMOS = {
  "coordinate-explorer": CoordinateExplorer,
  "line-table-plot": LineTablePlot,
  "real-life-reader": RealLifeReader,
  "gradient-explorer": GradientExplorer,
  "parallel-lines-graph": ParallelLinesGraph,
  "quadratic-explorer": QuadraticExplorer,
  "graph-families": GraphFamilies,
  "solve-with-graphs": SolveWithGraphs,
};
