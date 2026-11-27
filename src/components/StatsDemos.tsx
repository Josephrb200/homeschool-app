"use client";

/**
 * Interactive demonstrations for the statistics chain. Each one lets the
 * student change the data and watch the chart or the averages change. All
 * controls are buttons or sliders (keyboard operable), and every state is
 * also described in words. No timers.
 */

import { useId, useState } from "react";
import { ChartDiagram, Tally } from "./ChartDiagram";

const num = (x: number) => (Number.isInteger(x) ? String(x) : String(Math.round(x * 100) / 100));

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

// ------------------------------------------------------------ tally counter

const PETS = ["Cat", "Dog", "Fish", "Rabbit"];

function TallyCounter() {
  const [counts, setCounts] = useState([4, 7, 2, 0]);
  const add = (i: number) => setCounts((c) => c.map((v, j) => (j === i ? Math.min(v + 1, 30) : v)));
  const total = counts.reduce((a, b) => a + b, 0);
  return (
    <>
      <p>Press a pet to count one more vote. Watch the fifth line close each gate.</p>
      <div className="row">
        {PETS.map((p, i) => (
          <button key={p} type="button" className="btn" onClick={() => add(i)}>
            + {p}
          </button>
        ))}
        <button type="button" className="btn btn-ghost" onClick={() => setCounts([0, 0, 0, 0])}>
          Start again
        </button>
      </div>
      <table className="data-table" aria-label="Tally chart and frequency table">
        <thead>
          <tr>
            <th scope="col">Pet</th>
            <th scope="col">Tally</th>
            <th scope="col">Frequency</th>
          </tr>
        </thead>
        <tbody>
          {PETS.map((p, i) => (
            <tr key={p}>
              <th scope="row">{p}</th>
              <td style={{ minWidth: 160, textAlign: "left" }}>
                <Tally n={counts[i]} />
              </td>
              <td>{counts[i]}</td>
            </tr>
          ))}
          <tr>
            <th scope="row">Total</th>
            <td />
            <td>{total}</td>
          </tr>
        </tbody>
      </table>
      <Readout>
        {PETS.map((p, i) => `${p}: ${Math.floor(counts[i] / 5)} gate${Math.floor(counts[i] / 5) === 1 ? "" : "s"} and ${counts[i] % 5} line${counts[i] % 5 === 1 ? "" : "s"} = ${counts[i]}`).join(". ")}. Total frequency: {total}.
      </Readout>
    </>
  );
}

// ------------------------------------------------------------ bar chart and pictogram

function BarPictogram() {
  const [values, setValues] = useState([12, 6, 9, 16]);
  const [view, setView] = useState<"bar" | "pictogram">("bar");
  const items = ["Football", "Swimming", "Tennis", "Dance"];
  const set = (i: number, v: number) => setValues((vs) => vs.map((x, j) => (j === i ? v : x)));
  return (
    <>
      <div className="row" role="group" aria-label="Choose a chart">
        <button type="button" className="choice" aria-pressed={view === "bar"} onClick={() => setView("bar")}>
          Bar chart
        </button>
        <button type="button" className="choice" aria-pressed={view === "pictogram"} onClick={() => setView("pictogram")}>
          Pictogram
        </button>
      </div>
      <div className="row" style={{ flexWrap: "wrap" }}>
        {items.map((it, i) => (
          <Slider key={it} label={it} value={values[i]} min={0} max={20} onChange={(v) => set(i, v)} />
        ))}
      </div>
      {view === "bar" ? (
        <ChartDiagram chart={{ type: "bar", categories: items, values, xLabel: "Favourite sport", yLabel: "Number of students", yStep: 2, description: `Bar chart: ${items.map((it, i) => `${it} ${values[i]}`).join(", ")}.` }} />
      ) : (
        <ChartDiagram
          chart={{
            type: "pictogram",
            categories: items,
            values: values.map((v) => v - (v % 2)),
            perSymbol: 4,
            unit: "students",
            description: `Pictogram, one circle for 4 students: ${items.map((it, i) => `${it} ${values[i] - (values[i] % 2)}`).join(", ")}.`,
          }}
        />
      )}
      <Readout>
        {view === "bar"
          ? "The scale goes up in 2s. A bar that stops on a dashed line is an odd number: half-way between two numbered lines."
          : `One circle = 4 students, so half a circle = 2. ${items[0]}: ${Math.floor((values[0] - (values[0] % 2)) / 4)} circle(s)${(values[0] - (values[0] % 2)) % 4 ? " and a half" : ""} = ${values[0] - (values[0] % 2)}.${values.some((v) => v % 2) ? " (A pictogram with this key can't show odd numbers, so they're rounded down here.)" : ""}`}
      </Readout>
    </>
  );
}

// ------------------------------------------------------------ pie chart builder

function PieBuilder() {
  const items = ["Walk", "Bus", "Car", "Bike"];
  const [freqs, setFreqs] = useState([9, 12, 6, 3]);
  const total = freqs.reduce((a, b) => a + b, 0);
  const per = total ? 360 / total : 0;
  const angles = freqs.map((f) => f * per);
  const set = (i: number, v: number) => setFreqs((fs) => fs.map((x, j) => (j === i ? v : x)));
  return (
    <>
      <p>Change how many students chose each way of travelling. The pie chart always uses the whole 360°.</p>
      <div className="row" style={{ flexWrap: "wrap" }}>
        {items.map((it, i) => (
          <Slider key={it} label={it} value={freqs[i]} min={0} max={15} onChange={(v) => set(i, v)} />
        ))}
      </div>
      {total > 0 && (
        <ChartDiagram
          chart={{
            type: "pie",
            sectors: items.map((label, i) => ({ label, angle: angles[i] })).filter((s) => s.angle > 0),
            showAngles: true,
            description: `Pie chart: ${items.map((it, i) => `${it} ${num(angles[i])} degrees`).join(", ")}.`,
          }}
        />
      )}
      <Readout>
        {total === 0 ? (
          "Add some students to draw the pie chart."
        ) : (
          <>
            Total: {total} students. One student = 360 ÷ {total} = <strong>{num(per)}°</strong>.{" "}
            {items.map((it, i) => `${it}: ${freqs[i]} × ${num(per)} = ${num(angles[i])}°`).join(". ")}. Altogether: 360°.
          </>
        )}
      </Readout>
    </>
  );
}

// ------------------------------------------------------------ averages explorer

function AveragesExplorer() {
  const [xs, setXs] = useState([7, 3, 9, 3, 8]);
  const n = xs.length;
  const sorted = [...xs].sort((a, b) => a - b);
  const total = xs.reduce((a, b) => a + b, 0);
  const mean = total / n;
  const median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  const counts = new Map<number, number>();
  for (const x of xs) counts.set(x, (counts.get(x) ?? 0) + 1);
  const top = Math.max(...counts.values());
  const modes = [...counts.entries()].filter(([, c]) => c === top).map(([v]) => v).sort((a, b) => a - b);
  const modeText = top === 1 ? "no mode (every number appears once)" : modes.length > 1 ? `${modes.join(" and ")} (two modes)` : String(modes[0]);
  const change = (i: number, d: number) => setXs((v) => v.map((x, j) => (j === i ? Math.max(0, Math.min(20, x + d)) : x)));
  const midIdx = n % 2 ? [(n - 1) / 2] : [n / 2 - 1, n / 2];
  return (
    <>
      <p>Change the numbers with the buttons. Add or remove a number too.</p>
      <div className="row" style={{ flexWrap: "wrap", gap: 12 }}>
        {xs.map((x, i) => (
          <div key={i} className="stack" style={{ alignItems: "center", gap: 4 }}>
            <button type="button" className="btn" aria-label={`Make number ${i + 1} bigger`} onClick={() => change(i, 1)}>
              +
            </button>
            <strong style={{ fontSize: "1.5rem" }}>{x}</strong>
            <button type="button" className="btn" aria-label={`Make number ${i + 1} smaller`} onClick={() => change(i, -1)}>
              −
            </button>
          </div>
        ))}
      </div>
      <div className="row">
        <button type="button" className="btn btn-ghost" disabled={n >= 8} onClick={() => setXs((v) => [...v, 5])}>
          Add a number
        </button>
        <button type="button" className="btn btn-ghost" disabled={n <= 3} onClick={() => setXs((v) => v.slice(0, -1))}>
          Remove the last number
        </button>
      </div>
      <p>
        In order:{" "}
        {sorted.map((x, i) => (
          <span key={i} style={{ padding: "2px 6px", marginRight: 4, borderRadius: 6, background: midIdx.includes(i) ? "var(--accent-soft)" : undefined, fontWeight: midIdx.includes(i) ? 700 : 400 }}>
            {x}
          </span>
        ))}
        <span className="small"> (the middle {midIdx.length === 1 ? "number is" : "two are"} highlighted)</span>
      </p>
      <Readout>
        Mode: <strong>{modeText}</strong>. Median: <strong>{num(median)}</strong>
        {midIdx.length === 2 ? ` (half-way between ${sorted[midIdx[0]]} and ${sorted[midIdx[1]]})` : ""}. Mean: {total} ÷ {n} = <strong>{num(mean)}</strong>. Range:{" "}
        {sorted[n - 1]} − {sorted[0]} = <strong>{sorted[n - 1] - sorted[0]}</strong>.
      </Readout>
    </>
  );
}

// ------------------------------------------------------------ frequency table expanded

function FreqTableExpand() {
  const values = [0, 1, 2, 3];
  const [fs, setFs] = useState([3, 6, 4, 2]);
  const n = fs.reduce((a, b) => a + b, 0);
  const fx = values.map((v, i) => v * fs[i]);
  const totalFx = fx.reduce((a, b) => a + b, 0);
  const list = values.flatMap((v, i) => Array(fs[i]).fill(v) as number[]);
  const pos = (n + 1) / 2;
  const median = n === 0 ? 0 : n % 2 ? list[pos - 1] : (list[n / 2 - 1] + list[n / 2]) / 2;
  const set = (i: number, v: number) => setFs((f) => f.map((x, j) => (j === i ? v : x)));
  return (
    <>
      <p>The table shows how many pets some students have. Change the frequencies and watch the full list change.</p>
      <div className="row" style={{ flexWrap: "wrap" }}>
        {values.map((v, i) => (
          <Slider key={v} label={`${v} pet${v === 1 ? "" : "s"}`} value={fs[i]} min={0} max={8} onChange={(x) => set(i, x)} />
        ))}
      </div>
      <table className="data-table" aria-label="Frequency table with a pets times frequency column">
        <thead>
          <tr>
            <th scope="col">Number of pets</th>
            <th scope="col">Frequency</th>
            <th scope="col">Pets × frequency</th>
          </tr>
        </thead>
        <tbody>
          {values.map((v, i) => (
            <tr key={v}>
              <th scope="row">{v}</th>
              <td>{fs[i]}</td>
              <td>
                {v} × {fs[i]} = {fx[i]}
              </td>
            </tr>
          ))}
          <tr>
            <th scope="row">Total</th>
            <td>{n}</td>
            <td>{totalFx}</td>
          </tr>
        </tbody>
      </table>
      <p>
        As a list: <span style={{ wordBreak: "break-word" }}>{list.length ? list.join(", ") : "(empty)"}</span>
      </p>
      {n > 0 && (
        <Readout>
          {n} students have {totalFx} pets altogether. Mean = {totalFx} ÷ {n} = <strong>{num(totalFx / n)}</strong>. The middle is student{" "}
          {n % 2 ? `number ${pos}` : `${n / 2} and ${n / 2 + 1}`}, so the median is <strong>{num(median)}</strong>.
        </Readout>
      )}
    </>
  );
}

// ------------------------------------------------------------ scatter correlation

const SCATTER_SETS = {
  positive: { pts: [[1, 2], [2, 2], [3, 4], [4, 3], [5, 5], [6, 6], [7, 6], [8, 8], [9, 8], [10, 9]], words: "As the hours of revision go up, the scores go up too. The crosses go up from left to right: positive correlation." },
  negative: { pts: [[1, 9], [2, 8], [3, 8], [4, 6], [5, 6], [6, 5], [7, 3], [8, 4], [9, 2], [10, 1]], words: "As the hours of gaming go up, the scores go down. The crosses go down from left to right: negative correlation." },
  none: { pts: [[1, 6], [2, 2], [3, 9], [4, 4], [5, 7], [6, 1], [7, 8], [8, 3], [9, 6], [10, 4]], words: "Shoe size and score have no pattern. The crosses are scattered everywhere: no correlation." },
} as const;

function ScatterCorrelation() {
  const [kind, setKind] = useState<keyof typeof SCATTER_SETS>("positive");
  const xLabel = kind === "positive" ? "Hours of revision" : kind === "negative" ? "Hours of gaming" : "Shoe size";
  const s = SCATTER_SETS[kind];
  return (
    <>
      <div className="row" role="group" aria-label="Choose a pattern">
        {(["positive", "negative", "none"] as const).map((k) => (
          <button key={k} type="button" className="choice" aria-pressed={kind === k} onClick={() => setKind(k)}>
            {k === "none" ? "No correlation" : `${k[0].toUpperCase()}${k.slice(1)}`}
          </button>
        ))}
      </div>
      <ChartDiagram
        chart={{
          type: "scatter",
          points: s.pts.map(([x, y]) => [x, y * 5] as [number, number]),
          xLabel,
          yLabel: "Test score",
          xMax: 10,
          yMax: 50,
          xStep: 1,
          yStep: 5,
          description: s.words,
        }}
      />
      <Readout>{s.words}</Readout>
    </>
  );
}

export const STATS_DEMOS = {
  "tally-counter": TallyCounter,
  "bar-pictogram": BarPictogram,
  "pie-builder": PieBuilder,
  "averages-explorer": AveragesExplorer,
  "freq-table-expand": FreqTableExpand,
  "scatter-correlation": ScatterCorrelation,
};
