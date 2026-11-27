"use client";

/**
 * Interactive demonstrations for the ratio and proportion chain. Each lets the
 * student change the numbers and see what stays the same. Keyboard operable
 * (sliders and buttons); every state is also described in words, and the two
 * groups are told apart by pattern and label as well as colour.
 */

import { useId, useState } from "react";
import { gcd } from "@/engine/fraction";
import { MathText } from "./MathText";

const num = (x: number) => (Number.isInteger(x) ? String(x) : String(Math.round(x * 100) / 100));

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

/** Group A: solid. Group B: light fill with a thick outline and diagonal stripes. */
function Patterns() {
  return (
    <defs>
      <pattern id="ratio-stripes" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="8" height="8" fill="var(--warn-soft)" />
        <line x1="0" y1="0" x2="0" y2="8" stroke="var(--warn)" strokeWidth="3" />
      </pattern>
    </defs>
  );
}
const FILL_A = "var(--accent)";
const FILL_B = "url(#ratio-stripes)";

/** A row of equal boxes. `split` boxes from the left are group A. */
function Boxes({ count, split, labels, describe }: { count: number; split: number; labels?: string[]; describe: string }) {
  const w = Math.min(60, 560 / count);
  const width = count * w + 2;
  return (
    <svg viewBox={`0 0 ${width} 52`} width="100%" style={{ maxWidth: width }} role="img" aria-label={describe}>
      <Patterns />
      {Array.from({ length: count }, (_, i) => (
        <g key={i}>
          <rect x={1 + i * w} y={1} width={w} height={50} fill={i < split ? FILL_A : FILL_B} stroke="var(--ink)" strokeWidth={1.5} />
          {labels?.[i] && (
            <text x={1 + i * w + w / 2} y={32} textAnchor="middle" fontSize={w < 36 ? 11 : 15} fontWeight={600} fill={i < split ? "var(--accent-ink)" : "var(--ink)"}>
              {labels[i]}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

function Key({ a, b }: { a: string; b: string }) {
  return (
    <p className="row small" aria-hidden="true">
      <svg width="18" height="18">
        <rect width="18" height="18" fill={FILL_A} stroke="var(--ink)" />
      </svg>
      {a}
      <svg width="18" height="18" style={{ marginLeft: 12 }}>
        <Patterns />
        <rect width="18" height="18" fill={FILL_B} stroke="var(--ink)" />
      </svg>
      {b}
    </p>
  );
}

// ---------------------------------------------------------------- fraction of a whole

function FractionOfWhole() {
  const [whole, setWhole] = useState(15);
  const [part, setPart] = useState(6);
  const p = Math.min(part, whole);
  const g = gcd(p, whole) || 1;
  return (
    <>
      <p>Change the whole and the part. The shaded boxes are the part.</p>
      <div className="grid-2">
        <Slider label="The whole" value={whole} min={2} max={24} onChange={setWhole} />
        <Slider label="The part" value={p} min={0} max={whole} onChange={setPart} />
      </div>
      <Boxes count={whole} split={p} describe={`${p} out of ${whole} boxes shaded.`} />
      <Readout>
        <MathText text={`${p} out of ${whole} is ${p}/${whole}`} />
        {p > 0 && g > 1 ? (
          <>
            {". Both divide by "}
            {g}
            {", so it simplifies to "}
            <strong>
              <MathText text={`${p / g}/${whole / g}`} />
            </strong>
            .
          </>
        ) : p === 0 ? (
          ", which is 0."
        ) : p === whole ? (
          ", which is the whole thing: 1."
        ) : (
          ", which is already in its simplest form."
        )}
      </Readout>
    </>
  );
}

// ---------------------------------------------------------------- ratio groups

function RatioGroups() {
  const [a, setA] = useState(8);
  const [b, setB] = useState(12);
  const g = gcd(a, b);
  const x = a / g;
  const y = b / g;
  const r = 9;
  const groupW = Math.max(x, y) * (2 * r + 4) + 12;
  const cols = Math.max(1, Math.floor(560 / groupW));
  const rows = Math.ceil(g / cols);
  const groupH = 2 * (2 * r + 4) + 14;
  const width = Math.min(g, cols) * groupW + 2;
  const height = rows * groupH + 2;
  return (
    <>
      <p>Choose how many of each. The counters are sorted into as many equal groups as possible. One group shows the simplest form.</p>
      <div className="grid-2">
        <Slider label="Solid counters" value={a} min={1} max={18} onChange={setA} />
        <Slider label="Striped counters" value={b} min={1} max={18} onChange={setB} />
      </div>
      <Key a="solid" b="striped" />
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ maxWidth: width }} role="img" aria-label={`${g} equal groups, each with ${x} solid and ${y} striped counters.`}>
        <Patterns />
        {Array.from({ length: g }, (_, gi) => {
          const gx = 1 + (gi % cols) * groupW;
          const gy = 1 + Math.floor(gi / cols) * groupH;
          return (
            <g key={gi}>
              <rect x={gx + 2} y={gy + 2} width={groupW - 6} height={groupH - 6} rx={10} fill="var(--surface)" stroke="var(--line)" strokeWidth={1.5} />
              {Array.from({ length: x }, (_, i) => (
                <circle key={`a${i}`} cx={gx + 10 + r + i * (2 * r + 4)} cy={gy + 8 + r} r={r} fill={FILL_A} stroke="var(--ink)" />
              ))}
              {Array.from({ length: y }, (_, i) => (
                <circle key={`b${i}`} cx={gx + 10 + r + i * (2 * r + 4)} cy={gy + 12 + 3 * r + 4} r={r} fill={FILL_B} stroke="var(--ink)" />
              ))}
            </g>
          );
        })}
      </svg>
      <Readout>
        solid : striped = {a}:{b}.{" "}
        {g > 1 ? (
          <>
            They make {g} equal groups, each with {x} solid and {y} striped. Dividing both by {g} gives the simplest form <strong>{x}:{y}</strong>.
          </>
        ) : (
          <>
            They can&apos;t be split into equal groups, so <strong>{a}:{b}</strong> is already in its simplest form.
          </>
        )}
      </Readout>
    </>
  );
}

// ---------------------------------------------------------------- bar model for sharing

function RatioBarModel() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(5);
  const [mult, setMult] = useState(5);
  const parts = a + b;
  const total = parts * mult;
  const labels = Array.from({ length: parts }, () => `£${mult}`);
  return (
    <>
      <p>Choose a ratio and an amount. The bar is the whole amount, split into equal boxes. Every box is worth the same.</p>
      <div className="grid-2">
        <Slider label="First number of the ratio" value={a} min={1} max={6} onChange={setA} />
        <Slider label="Second number of the ratio" value={b} min={1} max={6} onChange={setB} />
      </div>
      <Slider label={`Amount to share (£)`} value={total} min={parts} max={parts * 12} step={parts} onChange={(t) => setMult(Math.max(1, Math.round(t / parts)))} />
      <Key a="first person" b="second person" />
      <Boxes count={parts} split={a} labels={labels} describe={`A bar of ${parts} boxes, each worth £${mult}. The first ${a} boxes are the first person's; the other ${b} are the second person's.`} />
      <Readout>
        {a} + {b} = {parts} parts. One part = £{total} ÷ {parts} = £{mult}. First person: {a} × £{mult} = <strong>£{a * mult}</strong>. Second person: {b} × £{mult} ={" "}
        <strong>£{b * mult}</strong>. Check: £{a * mult} + £{b * mult} = £{total}.
      </Readout>
    </>
  );
}

// ---------------------------------------------------------------- ratio and fractions

function RatioFractionLink() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(5);
  const t = a + b;
  return (
    <>
      <p>Change the ratio. Watch the bottom number of each fraction: it&apos;s always the total number of parts.</p>
      <div className="grid-2">
        <Slider label="Solid parts" value={a} min={1} max={9} onChange={setA} />
        <Slider label="Striped parts" value={b} min={1} max={9} onChange={setB} />
      </div>
      <Key a="solid" b="striped" />
      <Boxes count={t} split={a} describe={`${a} solid boxes and ${b} striped boxes, ${t} altogether.`} />
      <Readout>
        Ratio solid : striped = {a}:{b}. Altogether {a} + {b} = {t} parts. Solid is <MathText text={`${a}/${t}`} /> of the whole, striped is{" "}
        <MathText text={`${b}/${t}`} />. (Not <MathText text={`${a}/${b}`} />: that compares solid with striped, not with the whole.)
      </Readout>
    </>
  );
}

// ---------------------------------------------------------------- recipe scaling

const RECIPE = [
  { name: "Flour", amount: 300, unit: "g" },
  { name: "Milk", amount: 200, unit: "ml" },
  { name: "Sugar", amount: 120, unit: "g" },
  { name: "Eggs", amount: 2, unit: "" },
];

function RecipeScale() {
  const [people, setPeople] = useState(6);
  return (
    <>
      <p>This pancake recipe serves 4 people. Choose how many people you&apos;re cooking for. The middle column shows the amount for 1 person.</p>
      <Slider label="Number of people" value={people} min={1} max={12} onChange={setPeople} />
      <div className="scroll-x">
        <table style={{ borderCollapse: "separate", borderSpacing: "10px 6px" }}>
          <caption className="small muted" style={{ textAlign: "left" }}>
            Recipe amounts
          </caption>
          <thead>
            <tr>
              <th scope="col">Ingredient</th>
              <th scope="col">For 4</th>
              <th scope="col">For 1 (÷ 4)</th>
              <th scope="col">
                For {people} (× {people})
              </th>
            </tr>
          </thead>
          <tbody>
            {RECIPE.map((i) => (
              <tr key={i.name}>
                <th scope="row">{i.name}</th>
                <td>
                  {i.amount} {i.unit}
                </td>
                <td>
                  {num(i.amount / 4)} {i.unit}
                </td>
                <td>
                  <strong>
                    {num((i.amount / 4) * people)} {i.unit}
                  </strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Readout>
        Flour for {people}: 300 ÷ 4 = 75 g for one person, then 75 × {people} = <strong>{75 * people} g</strong>. Adding {people - 4 >= 0 ? people - 4 : 4 - people} g would be
        wrong: every amount changes in proportion.
      </Readout>
    </>
  );
}

// ---------------------------------------------------------------- direct proportion graph

function ProportionGraph() {
  const [k, setK] = useState(3);
  const [x, setX] = useState(4);
  const [fee, setFee] = useState(false);
  const c = fee ? 5 : 0;
  const y = k * x + c;
  const W = 340;
  const H = 260;
  const pad = 36;
  const xMax = 10;
  const yMax = 60;
  const sx = (v: number) => pad + (v / xMax) * (W - pad - 10);
  const sy = (v: number) => H - pad - (v / yMax) * (H - pad - 28);
  const yEnd = k * xMax + c;
  const xClip = yEnd > yMax ? (yMax - c) / k : xMax;
  return (
    <>
      <p>Potatoes cost the same for every kilogram. Change the price per kg and the weight, and watch the graph.</p>
      <div className="grid-2">
        <Slider label="Price per kg (£)" value={k} min={1} max={5} onChange={setK} />
        <Slider label="Weight (kg)" value={x} min={0} max={10} onChange={setX} />
      </div>
      <div className="choice-row">
        <button type="button" className="choice" aria-pressed={!fee} onClick={() => setFee(false)}>
          Just the potatoes
        </button>
        <button type="button" className="choice" aria-pressed={fee} onClick={() => setFee(true)}>
          Add a £5 delivery charge
        </button>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W }} role="img" aria-label={`A graph of cost against weight. A straight line ${fee ? "starting at £5, not at zero" : "through (0, 0)"}. At ${x} kg the cost is £${y}.`}>
        {[0, 2, 4, 6, 8, 10].map((v) => (
          <g key={`x${v}`}>
            <line x1={sx(v)} y1={sy(0)} x2={sx(v)} y2={sy(yMax)} stroke="var(--line)" />
            <text x={sx(v)} y={H - pad + 16} textAnchor="middle" fontSize={12} fill="var(--muted)">
              {v}
            </text>
          </g>
        ))}
        {[0, 10, 20, 30, 40, 50, 60].map((v) => (
          <g key={`y${v}`}>
            <line x1={sx(0)} y1={sy(v)} x2={sx(xMax)} y2={sy(v)} stroke="var(--line)" />
            <text x={pad - 6} y={sy(v) + 4} textAnchor="end" fontSize={12} fill="var(--muted)">
              {v}
            </text>
          </g>
        ))}
        <text x={sx(xMax)} y={H - 4} textAnchor="end" fontSize={12} fill="var(--ink)">
          weight (kg)
        </text>
        <text x={4} y={12} fontSize={12} fill="var(--ink)">
          cost (£)
        </text>
        <line x1={sx(0)} y1={sy(c)} x2={sx(xClip)} y2={sy(k * xClip + c)} stroke="var(--accent)" strokeWidth={3} />
        {y <= yMax && (
          <>
            <line x1={sx(x)} y1={sy(0)} x2={sx(x)} y2={sy(y)} stroke="var(--ink)" strokeDasharray="4 4" />
            <line x1={sx(0)} y1={sy(y)} x2={sx(x)} y2={sy(y)} stroke="var(--ink)" strokeDasharray="4 4" />
            <circle cx={sx(x)} cy={sy(y)} r={6} fill="var(--accent)" stroke="var(--ink)" />
          </>
        )}
        <circle cx={sx(0)} cy={sy(0)} r={4} fill="var(--ink)" />
      </svg>
      <Readout>
        {x} kg costs {fee ? `£${k} × ${x} + £5` : `£${k} × ${x}`} = <strong>£{y}</strong>.{" "}
        {fee
          ? `The line starts at £5, not at (0, 0). Doubling the weight doesn't double the cost, so this is NOT direct proportion.`
          : `The line is straight and goes through (0, 0): double the weight, double the cost. That's direct proportion.`}
      </Readout>
    </>
  );
}

export const RATIO_DEMOS = {
  "fraction-of-whole": FractionOfWhole,
  "ratio-groups": RatioGroups,
  "ratio-bar-model": RatioBarModel,
  "ratio-fraction-link": RatioFractionLink,
  "recipe-scale": RecipeScale,
  "proportion-graph": ProportionGraph,
};
