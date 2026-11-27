"use client";

/**
 * Interactive demonstrations for the later statistics lessons: two-way
 * tables, line graphs, grouped data, comparing data sets, sampling and lines
 * of best fit. Buttons and sliders only (keyboard operable), no timers, and
 * every state is also described in words.
 */

import { useId, useState } from "react";
import { ChartDiagram } from "./ChartDiagram";
import { TableDiagram } from "./ProbabilityDiagrams";

const num = (x: number) => (Number.isInteger(x) ? String(x) : String(Math.round(x * 100) / 100));
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

function Slider({ label, value, min, max, step = 1, onChange, show }: { label: string; value: number; min: number; max: number; step?: number; onChange: (n: number) => void; show?: string }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}: <strong>{show ?? value}</strong>
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

function Choices<T extends string>({ label, options, value, onChange }: { label: string; options: readonly { id: T; text: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="row" role="group" aria-label={label} style={{ flexWrap: "wrap" }}>
      {options.map((o) => (
        <button key={o.id} type="button" className="choice" aria-pressed={value === o.id} onClick={() => onChange(o.id)}>
          {o.text}
        </button>
      ))}
    </div>
  );
}

/** A small repeatable random number maker, so "new numbers" needs no Math.random during render. */
function makeRand(seed: number) {
  let s = seed % 2147483647 || 1;
  return (lo: number, hi: number) => {
    s = (s * 48271) % 2147483647;
    return lo + (s % (hi - lo + 1));
  };
}

// ------------------------------------------------------------ two-way table: hide a number, see how to find it

const TW_ROWS = ["Boys", "Girls"];
const TW_COLS = ["Walk", "Bus", "Car"];

function TwoWayBuilder() {
  const [seed, setSeed] = useState(7);
  const [hidden, setHidden] = useState<[number, number]>([0, 0]);
  const rand = makeRand(seed * 9973);
  const cells = TW_ROWS.map(() => TW_COLS.map(() => rand(3, 18)));
  const rowT = cells.map((r) => sum(r));
  const colT = TW_COLS.map((_, j) => cells[0][j] + cells[1][j]);
  const grand = sum(rowT);
  // Positions: rows 0-1 body, row 2 = Total row. Columns 0-2 body, column 3 = Total column.
  const value = (r: number, c: number) => (r < 2 ? (c < 3 ? cells[r][c] : rowT[r]) : c < 3 ? colT[c] : grand);
  const name = (r: number, c: number) =>
    r < 2 && c < 3 ? `${TW_ROWS[r]} who ${TW_COLS[c] === "Walk" ? "walk" : `come by ${TW_COLS[c].toLowerCase()}`}` : r < 2 ? `the ${TW_ROWS[r]} total` : c < 3 ? `the ${TW_COLS[c]} total` : "the grand total";
  const [hr, hc] = hidden;
  const v = value(hr, hc);
  const across = [0, 1, 2, 3].filter((c) => c !== hc && c !== 3);
  const down = [0, 1, 2].filter((r) => r !== hr && r !== 2);
  let how: string;
  if (hr < 2 && hc < 3) {
    how = `Use the ${TW_ROWS[hr]} row: ${rowT[hr]} − ${across.map((c) => cells[hr][c]).join(" − ")} = ${v}. Or use the ${TW_COLS[hc]} column: ${colT[hc]} − ${down.map((r) => cells[r][hc]).join(" − ")} = ${v}.`;
  } else if (hr < 2) {
    how = `Add along the ${TW_ROWS[hr]} row: ${cells[hr].join(" + ")} = ${v}. Or: grand total − ${TW_ROWS[1 - hr]} total = ${grand} − ${rowT[1 - hr]} = ${v}.`;
  } else if (hc < 3) {
    how = `Add down the ${TW_COLS[hc]} column: ${cells[0][hc]} + ${cells[1][hc]} = ${v}.`;
  } else {
    how = `Add the row totals: ${rowT.join(" + ")} = ${v}. Adding the column totals gives the same: ${colT.join(" + ")} = ${v}.`;
  }
  const table = {
    corner: "",
    columns: [...TW_COLS, "Total"],
    rows: [0, 1, 2].map((r) => ({ head: r < 2 ? TW_ROWS[r] : "Total", cells: [0, 1, 2, 3].map((c) => (r === hr && c === hc ? "?" : String(value(r, c)))) })),
    highlight: hr < 3 ? ([[hr, hc]] as [number, number][]) : undefined,
    description: `Two-way table of how students travel to school, with ${name(hr, hc)} hidden.`,
  };
  return (
    <>
      <p>Choose a number to hide. The steps show how you could find it from the others.</p>
      <div className="stack" style={{ gap: 6 }}>
        {[0, 1, 2].map((r) => (
          <div key={r} className="row" role="group" aria-label={`Hide a number in the ${r < 2 ? TW_ROWS[r] : "Total"} row`} style={{ flexWrap: "wrap" }}>
            {[0, 1, 2, 3].map((c) => (
              <button key={c} type="button" className="choice" aria-pressed={hr === r && hc === c} onClick={() => setHidden([r, c])}>
                {r < 2 ? TW_ROWS[r] : "Total"}, {c < 3 ? TW_COLS[c] : "Total"}
              </button>
            ))}
          </div>
        ))}
      </div>
      <TableDiagram table={table} />
      <div className="row">
        <button type="button" className="btn btn-ghost" onClick={() => setSeed((s) => s + 1)}>
          New numbers
        </button>
      </div>
      <Readout>
        Hidden: {name(hr, hc)}. {how}
      </Readout>
    </>
  );
}

// ------------------------------------------------------------ line graph reader

const LINE_SETS = {
  temp: { labels: ["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"], values: [6, 8, 11, 14, 17, 19, 18], xLabel: "Month", yLabel: "Temperature (°C)", yStep: 2, trend: "Overall the temperature goes up from February to the summer: an upward trend." },
  ice: { labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], values: [40, 35, 45, 30, 50, 40, 35], xLabel: "Day", yLabel: "Ice creams sold", yStep: 10, trend: "It goes up and down but ends about where it started: no clear trend." },
  park: { labels: ["Q1", "Q2", "Q3", "Q4", "Q1", "Q2", "Q3", "Q4"], values: [3, 7, 13, 5, 4, 9, 15, 6], xLabel: "Quarter (2024, then 2025)", yLabel: "Visitors (thousands)", yStep: 2, trend: "It peaks every Q3 (summer), and each year is a little busier: a seasonal pattern with an upward trend." },
} as const;

function LineGraphReader() {
  const [set, setSet] = useState<keyof typeof LINE_SETS>("temp");
  const [i, setI] = useState(2);
  const d = LINE_SETS[set];
  const k = Math.min(i, d.labels.length - 1);
  const change = k > 0 ? d.values[k] - d.values[k - 1] : 0;
  return (
    <>
      <Choices
        label="Choose a graph"
        options={[
          { id: "temp", text: "Temperature" },
          { id: "ice", text: "Ice creams" },
          { id: "park", text: "Theme park" },
        ]}
        value={set}
        onChange={(v) => {
          setSet(v);
          setI(2);
        }}
      />
      <Slider label="Point" value={k} min={0} max={d.labels.length - 1} onChange={setI} show={d.labels[k]} />
      <ChartDiagram
        chart={{ type: "line", labels: [...d.labels], values: [...d.values], xLabel: d.xLabel, yLabel: d.yLabel, yStep: d.yStep, highlight: k, description: `Line graph of ${d.yLabel.toLowerCase()}. ${d.labels.map((l, j) => `${l} ${d.values[j]}`).join(", ")}.` }}
      />
      <Readout>
        {d.labels[k]}: <strong>{d.values[k]}</strong>.{" "}
        {k === 0 ? "This is the first point." : change === 0 ? `No change from ${d.labels[k - 1]}.` : `${change > 0 ? "Up" : "Down"} ${Math.abs(change)} from ${d.labels[k - 1]} (${d.values[k - 1]} to ${d.values[k]}).`} {d.trend}
      </Readout>
    </>
  );
}

// ------------------------------------------------------------ grouped data: midpoints and the real data

function GroupedMidpoints() {
  const [seed, setSeed] = useState(3);
  const [showMid, setShowMid] = useState(false);
  const [showReal, setShowReal] = useState(false);
  const rand = makeRand(seed * 7919);
  const data = Array.from({ length: 20 }, () => rand(1, 40)).sort((a, b) => a - b);
  const classes = [0, 10, 20, 30];
  const fs = classes.map((a) => data.filter((x) => x > a && x <= a + 10).length);
  const mids = classes.map((a) => a + 5);
  const fx = fs.map((f, i) => f * mids[i]);
  const est = sum(fx) / 20;
  const real = sum(data) / 20;
  return (
    <>
      <p>20 students timed how long a puzzle took (in minutes). The table only shows which class each time is in.</p>
      <table className="data-table" aria-label="Grouped frequency table of puzzle times">
        <thead>
          <tr>
            <th scope="col">Time (t minutes)</th>
            <th scope="col">Frequency</th>
            {showMid && <th scope="col">Midpoint</th>}
            {showMid && <th scope="col">Frequency × midpoint</th>}
          </tr>
        </thead>
        <tbody>
          {classes.map((a, i) => (
            <tr key={a}>
              <th scope="row">
                {a} &lt; t ≤ {a + 10}
              </th>
              <td>{fs[i]}</td>
              {showMid && <td>{mids[i]}</td>}
              {showMid && (
                <td>
                  {fs[i]} × {mids[i]} = {fx[i]}
                </td>
              )}
            </tr>
          ))}
          <tr>
            <th scope="row">Total</th>
            <td>20</td>
            {showMid && <td />}
            {showMid && <td>{sum(fx)}</td>}
          </tr>
        </tbody>
      </table>
      <div className="row" style={{ flexWrap: "wrap" }}>
        <button type="button" className="choice" aria-pressed={showMid} onClick={() => setShowMid((v) => !v)}>
          Show midpoints
        </button>
        <button type="button" className="choice" aria-pressed={showReal} onClick={() => setShowReal((v) => !v)}>
          Reveal the real times
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setSeed((s) => s + 1)}>
          New data
        </button>
      </div>
      <Readout>
        {showMid ? (
          <>
            Estimated mean = {sum(fx)} ÷ 20 = <strong>{num(est)}</strong> minutes.{" "}
          </>
        ) : (
          "Press \"Show midpoints\" to estimate the mean. "
        )}
        {showReal && (
          <>
            The real times were {data.join(", ")}. Their real mean is {sum(data)} ÷ 20 = <strong>{num(real)}</strong>.
            {showMid && ` The estimate is ${Math.abs(est - real) < 0.05 ? "spot on" : `${num(Math.abs(est - real))} away`}: close, but only a best guess.`}
          </>
        )}
      </Readout>
    </>
  );
}

// ------------------------------------------------------------ comparing two classes

const CLASS_A = [24, 27, 29, 30, 31, 33, 36];
const CLASS_B_BASE = [22, 25, 28, 30, 32, 35, 38];

function DotRow({ label, xs, med, y }: { label: string; xs: number[]; med: number; y: number }) {
  const x = (v: number) => 80 + ((v - 10) / 40) * 340;
  const counts = new Map<number, number>();
  return (
    <g>
      <text x={8} y={y + 5} fontSize={14} fontWeight={700} fill="var(--ink)">
        {label}
      </text>
      <line x1={x(Math.min(...xs))} x2={x(Math.max(...xs))} y1={y + 16} y2={y + 16} stroke="var(--ink)" strokeWidth={2} />
      <line x1={x(Math.min(...xs))} x2={x(Math.min(...xs))} y1={y + 11} y2={y + 21} stroke="var(--ink)" strokeWidth={2} />
      <line x1={x(Math.max(...xs))} x2={x(Math.max(...xs))} y1={y + 11} y2={y + 21} stroke="var(--ink)" strokeWidth={2} />
      {xs.map((v, i) => {
        const k = counts.get(v) ?? 0;
        counts.set(v, k + 1);
        return <circle key={i} cx={x(v)} cy={y - k * 12} r={5} fill="var(--accent)" stroke="var(--ink)" strokeWidth={1.2} />;
      })}
      <path d={`M ${x(med)} ${y - 18} l -6 -9 h 12 z`} fill="var(--ink)" />
    </g>
  );
}

function CompareSpread() {
  const [shift, setShift] = useState(0);
  const [spread, setSpread] = useState(10);
  const medOf = (xs: number[]) => [...xs].sort((a, b) => a - b)[3];
  const baseMed = medOf(CLASS_B_BASE);
  const B = CLASS_B_BASE.map((v) => Math.max(10, Math.min(50, Math.round(baseMed + ((v - baseMed) * spread) / 10 + shift))));
  const mA = medOf(CLASS_A);
  const mB = medOf(B);
  const rA = Math.max(...CLASS_A) - Math.min(...CLASS_A);
  const rB = Math.max(...B) - Math.min(...B);
  const avg = mA === mB ? "On average the classes did the same (equal medians)." : `On average, Class ${mA > mB ? "A" : "B"} did better, because their median is higher (${Math.max(mA, mB)} against ${Math.min(mA, mB)}).`;
  const cons = rA === rB ? "Both classes are equally consistent (equal ranges)." : `Class ${rA < rB ? "A" : "B"} was more consistent, because their range is smaller (${Math.min(rA, rB)} against ${Math.max(rA, rB)}).`;
  return (
    <>
      <p>Each dot is one student's test score out of 50. The triangle marks the median, and the line under the dots shows the range. Move Class B and watch the comparison change.</p>
      <div className="row" style={{ flexWrap: "wrap" }}>
        <Slider label="Move Class B up or down" value={shift} min={-12} max={12} onChange={setShift} show={shift > 0 ? `+${shift}` : String(shift)} />
        <Slider label="Spread Class B out" value={spread} min={2} max={20} onChange={setSpread} show={spread < 10 ? "closer together" : spread > 10 ? "more spread out" : "as it was"} />
      </div>
      <svg viewBox="0 0 440 200" width="100%" style={{ maxWidth: 440 }} role="img" aria-label={`Dot plots. Class A: ${CLASS_A.join(", ")}. Class B: ${B.join(", ")}.`} className="shape-diagram">
        <DotRow label="Class A" xs={CLASS_A} med={mA} y={70} />
        <DotRow label="Class B" xs={B} med={mB} y={150} />
        {[10, 20, 30, 40, 50].map((v) => (
          <text key={v} x={80 + ((v - 10) / 40) * 340} y={194} textAnchor="middle" fontSize={12} fill="var(--muted)">
            {v}
          </text>
        ))}
      </svg>
      <Readout>
        Class A: median {mA}, range {rA}. Class B: median {mB}, range {rB}. {avg} {cons}
      </Readout>
    </>
  );
}

// ------------------------------------------------------------ sampling: biased and random samples

/**
 * 100 students. The first 20 on the register are Year 7. 20 are in the football club (and all of them do
 * sport every day). 40 do sport every day altogether, but only 2 of the first 10 on the register do.
 */
const DAILY_EXTRA = new Set([20, 21, 25, 26, 30, 31, 35, 36, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95]);
const POP = Array.from({ length: 100 }, (_, i) => ({ club: i % 5 === 2, daily: i % 5 === 2 || DAILY_EXTRA.has(i) }));

function SamplePicker() {
  const [method, setMethod] = useState<"club" | "register" | "random10" | "random40">("club");
  const [seed, setSeed] = useState(1);
  const rand = makeRand(seed * 104729 + method.length);
  let picked: number[];
  if (method === "club") picked = POP.map((p, i) => (p.club ? i : -1)).filter((i) => i >= 0).slice(0, 10);
  else if (method === "register") picked = Array.from({ length: 10 }, (_, i) => i);
  else {
    const want = method === "random10" ? 10 : 40;
    const set = new Set<number>();
    while (set.size < want) set.add(rand(0, 99));
    picked = [...set].sort((a, b) => a - b);
  }
  const yes = picked.filter((i) => POP[i].daily).length;
  const pct = Math.round((yes / picked.length) * 100);
  const words = {
    club: "Biased: football club members all play sport, so the sample makes the school look sportier than it is.",
    register: "Biased: the first 10 on the register are all Year 7, so older students get no chance to be picked, and here the Year 7s do less sport.",
    random10: "Random: everyone had the same chance. Small samples can still be a bit off by chance. Try picking again.",
    random40: "Random and bigger: estimates from bigger random samples are usually closer to the truth.",
  }[method];
  const sel = new Set(picked);
  return (
    <>
      <p>The school has 100 students. 40 of them do sport every day (the squares with a dot). We want to estimate that number with a sample.</p>
      <Choices
        label="Choose how to sample"
        options={[
          { id: "club", text: "10 from the football club" },
          { id: "register", text: "First 10 on the register" },
          { id: "random10", text: "10 at random" },
          { id: "random40", text: "40 at random" },
        ]}
        value={method}
        onChange={setMethod}
      />
      <svg viewBox="0 0 300 300" width="100%" style={{ maxWidth: 300 }} role="img" aria-label={`Grid of 100 students. ${picked.length} are picked for the sample, and ${yes} of them do sport every day.`} className="shape-diagram">
        {POP.map((p, i) => {
          const x = (i % 10) * 30 + 2;
          const y = Math.floor(i / 10) * 30 + 2;
          const on = sel.has(i);
          return (
            <g key={i}>
              <rect x={x} y={y} width={26} height={26} rx={4} fill={on ? "var(--accent-soft)" : "var(--surface)"} stroke={on ? "var(--accent)" : "var(--line)"} strokeWidth={on ? 3 : 1} />
              {p.daily && <circle cx={x + 13} cy={y + 13} r={5} fill="var(--ink)" />}
            </g>
          );
        })}
      </svg>
      {(method === "random10" || method === "random40") && (
        <div className="row">
          <button type="button" className="btn" onClick={() => setSeed((s) => s + 1)}>
            Pick again
          </button>
        </div>
      )}
      <Readout>
        In the sample, {yes} out of {picked.length} do sport every day ({pct}%). Scaled up to 100 students, that estimates <strong>{pct}</strong>. The true number is 40. {words}
      </Readout>
    </>
  );
}

// ------------------------------------------------------------ line of best fit

const FIT_POINTS: [number, number][] = [
  [2, 15],
  [3, 15],
  [3, 20],
  [4, 20],
  [5, 30],
  [6, 25],
  [6, 35],
  [7, 35],
  [8, 40],
];

function BestFitLine() {
  const [start, setStart] = useState(20);
  const [steep, setSteep] = useState(0);
  const [xq, setXq] = useState(5);
  const yAt = (x: number) => start + (steep / 2) * x;
  const above = FIT_POINTS.filter(([x, y]) => y > yAt(x) + 0.01).length;
  const below = FIT_POINTS.filter(([x, y]) => y < yAt(x) - 0.01).length;
  // The part of the line inside the graph (x 0 to 10, y 0 to 50).
  const m = steep / 2;
  let xa = 0;
  let xb = 10;
  if (m !== 0) {
    const x0 = (0 - start) / m;
    const x50 = (50 - start) / m;
    xa = Math.max(0, Math.min(x0, x50));
    xb = Math.min(10, Math.max(x0, x50));
  }
  const fit = { from: [xa, yAt(xa)] as [number, number], to: [xb, yAt(xb)] as [number, number] };
  const est = yAt(xq);
  const inside = xq >= 2 && xq <= 8;
  return (
    <>
      <p>Move the line until it follows the crosses, with about as many above it as below. Then use it to make an estimate.</p>
      <div className="row" style={{ flexWrap: "wrap" }}>
        <Slider label="Where the line starts" value={start} min={0} max={40} onChange={setStart} />
        <Slider label="How steep it is" value={steep} min={-6} max={14} onChange={setSteep} show={steep === 0 ? "flat" : steep > 0 ? `up ${num(steep / 2)} per hour` : `down ${num(-steep / 2)} per hour`} />
        <Slider label="Estimate for (hours)" value={xq} min={0} max={10} onChange={setXq} />
      </div>
      <div className="row">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setStart(5);
            setSteep(9);
          }}
        >
          Show a good line
        </button>
      </div>
      <ChartDiagram
        chart={{
          type: "scatter",
          points: FIT_POINTS,
          xLabel: "Hours of revision",
          yLabel: "Test score",
          xMax: 10,
          yMax: 50,
          xStep: 1,
          yStep: 5,
          fits: [fit],
          description: `Scatter graph of test score against hours of revision, with a line starting at ${start} and ${steep === 0 ? "flat" : steep > 0 ? "going up" : "going down"}.`,
        }}
      />
      <Readout>
        {above} cross{above === 1 ? " is" : "es are"} above the line and {below} below.{" "}
        {steep <= 0 ? "The crosses go up, so the line should go up too. " : Math.abs(above - below) <= 1 && above + below >= 5 ? "That's a good line of best fit. " : "Try to balance the crosses either side. "}
        Estimate at {xq} hours: about <strong>{num(Math.round(est * 2) / 2)}</strong>.{" "}
        {inside ? "That's inside the data (2 to 8 hours), so it's fairly reliable." : "That's outside the data (2 to 8 hours), so it isn't reliable: the pattern might not carry on."}
      </Readout>
    </>
  );
}

export const STATS_MORE_DEMOS = {
  "two-way-builder": TwoWayBuilder,
  "line-graph-reader": LineGraphReader,
  "grouped-midpoints": GroupedMidpoints,
  "compare-spread": CompareSpread,
  "sample-picker": SamplePicker,
  "best-fit-line": BestFitLine,
};
