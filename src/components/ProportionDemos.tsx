"use client";

/**
 * Interactive demonstrations for scale, rates, inverse proportion, reverse
 * percentages, interest, speed, distance-time graphs, density and compound
 * units. Each lets the student change one thing and see what happens.
 * Keyboard operable (sliders, selects, buttons); every state is also
 * described in words (aria-live), and nothing animates on its own.
 */

import { useId, useState } from "react";
import { GraphDiagram } from "./GraphDiagram";

const r2 = (x: number) => Math.round(x * 100) / 100;
const fmt = (x: number) => String(r2(x)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const gbp = (x: number) => `£${(Math.round(x * 100) / 100).toFixed(Number.isInteger(r2(x)) ? 0 : 2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

function Slider({ label, value, min, max, step = 1, shown, onChange }: { label: string; value: number; min: number; max: number; step?: number; shown?: string; onChange: (n: number) => void }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}: <strong>{shown ?? value}</strong>
      </label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} aria-valuetext={shown} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

function Readout({ children }: { children: React.ReactNode }) {
  return (
    <div aria-live="polite" style={{ fontSize: "1.15rem" }}>
      {children}
    </div>
  );
}

function Toggle<T extends string>({ value, options, onChange }: { value: T; options: { value: T; text: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="row">
      {options.map((o) => (
        <button key={o.value} type="button" className="btn btn-small" aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
          {o.text}
        </button>
      ))}
    </div>
  );
}

/** A horizontal bar of width proportional to value/max, with a label. */
function Bar({ value, max, label, tone = "accent" }: { value: number; max: number; label: string; tone?: "accent" | "warn" | "soft" }) {
  const fill = tone === "accent" ? "var(--accent)" : tone === "warn" ? "var(--warn)" : "var(--accent-soft)";
  const w = Math.max(2, (value / max) * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0" }}>
      <div style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--line)", height: 26 }} aria-hidden="true">
        <div style={{ width: `${w}%`, height: "100%", background: fill, borderRight: "2px solid var(--ink)" }} />
      </div>
      <span style={{ minWidth: 140, fontVariantNumeric: "tabular-nums" }}>{label}</span>
    </div>
  );
}

// ------------------------------------------------------------ map scale

const SCALES = [10000, 25000, 50000, 100000];

function MapScale() {
  const [si, setSi] = useState(1);
  const [cm, setCm] = useState(6);
  const n = SCALES[si];
  const realCm = cm * n;
  return (
    <>
      <p>Choose a map scale and measure a distance on the map. Watch the real distance in cm, then m, then km.</p>
      <div className="grid-2">
        <Slider label="Scale" value={si} min={0} max={SCALES.length - 1} shown={`1 : ${fmt(n)}`} onChange={setSi} />
        <Slider label="Distance on the map" value={cm} min={1} max={20} shown={`${cm} cm`} onChange={setCm} />
      </div>
      <svg viewBox="0 0 440 50" width="100%" style={{ maxWidth: 520 }} aria-hidden="true">
        {Array.from({ length: cm }, (_, i) => (
          <rect key={i} x={10 + i * 21} y={10} width={21} height={20} fill={i % 2 ? "var(--surface)" : "var(--accent)"} stroke="var(--ink)" />
        ))}
        <text x={10} y={46} fontSize={12} fill="var(--ink)">
          each block = 1 cm on the map = {fmt(n)} cm real
        </text>
      </svg>
      <Readout>
        <p>
          {cm} cm × {fmt(n)} = {fmt(realCm)} cm in real life.
        </p>
        <p>
          ÷ 100 → {fmt(realCm / 100)} m. ÷ 1000 → <strong>{fmt(realCm / 100000)} km</strong>.
        </p>
      </Readout>
    </>
  );
}

// ------------------------------------------------------------ pay and overtime

function PayRate() {
  const [rate, setRate] = useState(12);
  const [hours, setHours] = useState(40);
  const basic = 37;
  const normal = Math.min(hours, basic);
  const over = Math.max(0, hours - basic);
  const pay = normal * rate + over * rate * 1.5;
  return (
    <>
      <p>
        Change the hourly rate and the hours worked. The first {basic} hours are paid at the normal rate; any extra hours at time and a half (× 1.5).
      </p>
      <div className="grid-2">
        <Slider label="Hourly rate" value={rate} min={8} max={20} step={0.5} shown={gbp(rate)} onChange={setRate} />
        <Slider label="Hours worked" value={hours} min={10} max={48} onChange={setHours} />
      </div>
      <Bar value={normal * rate} max={48 * 20 * 1.2} label={`Normal: ${gbp(normal * rate)}`} />
      <Bar value={over * rate * 1.5} max={48 * 20 * 1.2} label={`Overtime: ${gbp(over * rate * 1.5)}`} tone="warn" />
      <Readout>
        <p>
          {normal} × {gbp(rate)} = {gbp(normal * rate)}
          {over > 0 ? `, plus ${over} × ${gbp(rate * 1.5)} = ${gbp(over * rate * 1.5)}` : ""}. Total: <strong>{gbp(pay)}</strong>.
        </p>
      </Readout>
    </>
  );
}

// ------------------------------------------------------------ inverse proportion

function InverseWorkers() {
  const [w, setW] = useState(4);
  const total = 24;
  const days = total / w;
  return (
    <>
      <p>A job takes 24 "worker-days" in total. Change the number of workers. The grid always has 24 squares: more rows means fewer columns.</p>
      <Slider label="Workers" value={w} min={1} max={12} onChange={setW} />
      <svg viewBox="0 0 480 260" width="100%" style={{ maxWidth: 520 }} role="img" aria-label={`${w} workers by ${fmt(days)} days makes 24 worker-days.`}>
        {Array.from({ length: w }, (_, row) =>
          Array.from({ length: Math.ceil(days) }, (_, col) => {
            const part = Math.min(1, days - col);
            return <rect key={`${row}-${col}`} x={10 + col * 19} y={10 + row * 20} width={19 * part} height={18} fill="var(--accent)" stroke="var(--ink)" strokeWidth={1} />;
          }),
        )}
      </svg>
      <Readout>
        <p>
          {w} worker{w === 1 ? "" : "s"} × <strong>{fmt(days)} days</strong> = 24. Double the workers and the time halves.
        </p>
      </Readout>
    </>
  );
}

// ------------------------------------------------------------ simple and compound interest

function Interest({ start }: { start: "simple" | "compound" }) {
  const [mode, setMode] = useState<"simple" | "compound">(start);
  const [P, setP] = useState(1000);
  const [rate, setRate] = useState(10);
  const [years, setYears] = useState(4);
  const rows = Array.from({ length: years + 1 }, (_, y) => ({ y, simple: P * (1 + (rate / 100) * y), compound: P * (1 + rate / 100) ** y }));
  const max = Math.max(...rows.map((x) => x.compound));
  return (
    <>
      <p>Simple interest adds the same amount every year. Compound interest adds a percentage of the new amount, so it grows faster.</p>
      <Toggle value={mode} options={[{ value: "simple", text: "Simple" }, { value: "compound", text: "Compound" }]} onChange={setMode} />
      <div className="grid-2">
        <Slider label="Amount invested" value={P} min={100} max={5000} step={100} shown={gbp(P)} onChange={setP} />
        <Slider label="Rate per year" value={rate} min={1} max={20} shown={`${rate}%`} onChange={setRate} />
        <Slider label="Years" value={years} min={1} max={10} onChange={setYears} />
      </div>
      {rows.map((row) => (
        <Bar key={row.y} value={mode === "simple" ? row.simple : row.compound} max={max} label={`Year ${row.y}: ${gbp(mode === "simple" ? row.simple : row.compound)}`} tone={row.y === 0 ? "soft" : "accent"} />
      ))}
      <Readout>
        {mode === "simple" ? (
          <p>
            Each year adds {rate}% of {gbp(P)} = {gbp((P * rate) / 100)}. After {years} years: {gbp(P)} + {years} × {gbp((P * rate) / 100)} = <strong>{gbp(rows[years].simple)}</strong>.
          </p>
        ) : (
          <p>
            Each year multiplies by {fmt(1 + rate / 100)}. After {years} years: {gbp(P)} × {fmt(1 + rate / 100)}^{years} = <strong>{gbp(rows[years].compound)}</strong>, which is {gbp(rows[years].compound - rows[years].simple)} more than simple interest.
          </p>
        )}
      </Readout>
    </>
  );
}

// ------------------------------------------------------------ reverse percentages

function ReversePercentBar() {
  const [p, setP] = useState(20);
  const [up, setUp] = useState<"up" | "down">("down");
  const [orig, setOrig] = useState(80);
  const pct = up === "up" ? 100 + p : 100 - p;
  const now = (orig * pct) / 100;
  const [shown, setShown] = useState(false);
  return (
    <>
      <p>
        The new price is a percentage of the original. Taking {p}% of the new price gives the wrong answer, because {p}% of a different amount is a different number.
      </p>
      <Toggle value={up} options={[{ value: "down", text: "Decrease" }, { value: "up", text: "Increase" }]} onChange={(v) => { setUp(v); setShown(false); }} />
      <div className="grid-2">
        <Slider label="Percentage" value={p} min={5} max={50} step={5} shown={`${p}%`} onChange={(v) => { setP(v); setShown(false); }} />
        <Slider label="Original price (hidden)" value={orig} min={20} max={200} step={20} shown="?" onChange={(v) => { setOrig(v); setShown(false); }} />
      </div>
      <Bar value={pct} max={150} label={`${pct}% = ${gbp(now)}`} />
      <Bar value={shown ? 100 : 0} max={150} label={shown ? `100% = ${gbp(orig)}` : "100% = ?"} tone="soft" />
      <Readout>
        <p>
          New price {gbp(now)} is {pct}% of the original. 1% = {gbp(now)} ÷ {pct} = {gbp(now / pct)}.
        </p>
        {shown && (
          <p>
            100% = {gbp(now / pct)} × 100 = <strong>{gbp(orig)}</strong>. (Same as {gbp(now)} ÷ {fmt(pct / 100)}.) The wrong way, {gbp(now)} {up === "up" ? "−" : "+"} {p}% of {gbp(now)}, gives {gbp(now * (up === "up" ? 1 - p / 100 : 1 + p / 100))}.
          </p>
        )}
      </Readout>
      <button type="button" className="btn btn-small" onClick={() => setShown(!shown)} aria-pressed={shown}>
        {shown ? "Hide the original" : "Find the original"}
      </button>
    </>
  );
}

// ------------------------------------------------------------ speed, distance, time

function SpeedJourney() {
  const [speed, setSpeed] = useState(40);
  const [mins, setMins] = useState(45);
  const hours = mins / 60;
  const dist = speed * hours;
  return (
    <>
      <p>Change the speed and the time. The time must be in hours: divide the minutes by 60.</p>
      <div className="grid-2">
        <Slider label="Speed" value={speed} min={5} max={120} step={5} shown={`${speed} km/h`} onChange={setSpeed} />
        <Slider label="Time" value={mins} min={5} max={180} step={5} shown={`${mins} minutes`} onChange={setMins} />
      </div>
      <svg viewBox="0 0 440 60" width="100%" style={{ maxWidth: 520 }} aria-hidden="true">
        <line x1={10} x2={430} y1={40} y2={40} stroke="var(--line)" strokeWidth={6} />
        <line x1={10} x2={10 + Math.min(420, (dist / 360) * 420)} y1={40} y2={40} stroke="var(--accent)" strokeWidth={6} />
        <text x={12} y={22} fontSize={13} fill="var(--ink)">
          {fmt(dist)} km
        </text>
      </svg>
      <Readout>
        <p>
          {mins} minutes = {mins} ÷ 60 = {fmt(hours)} hours.
        </p>
        <p>
          Distance = speed × time = {speed} × {fmt(hours)} = <strong>{fmt(dist)} km</strong>. Using {mins} instead of {fmt(hours)} would give {fmt(speed * mins)} km, which is far too much.
        </p>
      </Readout>
    </>
  );
}

// ------------------------------------------------------------ distance-time graph builder

function DtGraphBuilder() {
  const [v1, setV1] = useState(18);
  const [stop, setStop] = useState(20);
  const [v3, setV3] = useState(12);
  // Part A: 40 minutes out; part B: stop; part C: home.
  const d1 = (v1 * 40) / 60;
  const t3 = (d1 / v3) * 60;
  const pts: [number, number][] = [
    [0, 0],
    [40, d1],
    [40 + stop, d1],
    [40 + stop + t3, 0],
  ];
  const xMax = Math.ceil((40 + stop + t3) / 20) * 20;
  const yMax = Math.max(8, Math.ceil(d1 / 4) * 4 + 4);
  return (
    <>
      <p>Change the speeds and the stop. Steeper lines mean faster. A flat line means stopped.</p>
      <div className="grid-2">
        <Slider label="Speed out (part A)" value={v1} min={6} max={30} step={3} shown={`${v1} km/h`} onChange={setV1} />
        <Slider label="Stop (part B)" value={stop} min={0} max={40} step={5} shown={`${stop} minutes`} onChange={setStop} />
        <Slider label="Speed home (part C)" value={v3} min={6} max={30} step={3} shown={`${v3} km/h`} onChange={setV3} />
      </div>
      <GraphDiagram
        graph={{
          x: { min: 0, max: xMax, step: 10, labelStep: 20, label: "Time (minutes)" },
          y: { min: 0, max: yMax, step: 2, labelStep: 4, label: "Distance from home (km)" },
          curves: pts.slice(1).map((p, i) => ({ points: [pts[i], p], label: { text: "ABC"[i], at: [(pts[i][0] + p[0]) / 2, (pts[i][1] + p[1]) / 2 + yMax / 12] as [number, number] } })),
          description: `Out ${fmt(d1)} km in 40 minutes, stop ${stop} minutes, home in ${fmt(t3)} minutes.`,
        }}
        maxWidth={460}
      />
      <Readout>
        <p>
          A: {fmt(d1)} km in 40 minutes = {v1} km/h. B: stopped for {stop} minutes. C: {fmt(d1)} km home in {fmt(t3)} minutes = {v3} km/h. The {v1 > v3 ? "steeper line is A" : v3 > v1 ? "steeper line is C" : "lines A and C are equally steep"}.
        </p>
      </Readout>
    </>
  );
}

// ------------------------------------------------------------ density and pressure

function DensityBlocks() {
  const [mode, setMode] = useState<"density" | "pressure">("density");
  const [mass, setMass] = useState(540);
  const [vol, setVol] = useState(200);
  const [force, setForce] = useState(600);
  const [area, setArea] = useState(4);
  return (
    <>
      <Toggle value={mode} options={[{ value: "density", text: "Density" }, { value: "pressure", text: "Pressure" }]} onChange={setMode} />
      {mode === "density" ? (
        <>
          <p>Density is how much mass is packed into each cm³. Pack more mass into the same space and the density goes up.</p>
          <div className="grid-2">
            <Slider label="Mass" value={mass} min={20} max={2000} step={20} shown={`${mass} g`} onChange={setMass} />
            <Slider label="Volume" value={vol} min={10} max={500} step={10} shown={`${vol} cm³`} onChange={setVol} />
          </div>
          <Readout>
            <p>
              Density = mass ÷ volume = {mass} ÷ {vol} = <strong>{fmt(mass / vol)} g/cm³</strong>. {mass / vol < 1 ? "Less than 1, so it would float in water." : "More than 1, so it would sink in water."}
            </p>
          </Readout>
        </>
      ) : (
        <>
          <p>Pressure is how much force pushes on each m². The same force on a smaller area gives a bigger pressure.</p>
          <div className="grid-2">
            <Slider label="Force" value={force} min={50} max={2000} step={50} shown={`${force} N`} onChange={setForce} />
            <Slider label="Area" value={area} min={1} max={20} shown={`${area} m²`} onChange={setArea} />
          </div>
          <Readout>
            <p>
              Pressure = force ÷ area = {force} ÷ {area} = <strong>{fmt(force / area)} N/m²</strong>.
            </p>
          </Readout>
        </>
      )}
    </>
  );
}

// ------------------------------------------------------------ converting compound units

function UnitRateConvert() {
  const [k, setK] = useState(4);
  const kmh = 18 * k;
  return (
    <>
      <p>Change the speed. Convert one part at a time: kilometres to metres, then hours to seconds.</p>
      <Slider label="Speed" value={k} min={1} max={8} shown={`${kmh} km/h`} onChange={setK} />
      <Readout>
        <ol>
          <li>
            {kmh} km per hour = {fmt(kmh * 1000)} m per hour (× 1000).
          </li>
          <li>
            1 hour = 60 × 60 = 3600 seconds, so {fmt(kmh * 1000)} ÷ 3600 = <strong>{5 * k} m per second</strong>.
          </li>
          <li>
            Check: {5 * k} m/s × 3.6 = {kmh} km/h. The m/s number is smaller, because you go less far in a second than in an hour.
          </li>
        </ol>
      </Readout>
    </>
  );
}

export const PROPORTION_DEMOS = {
  "map-scale": MapScale,
  "pay-rate": PayRate,
  "inverse-workers": InverseWorkers,
  "interest-simple": () => <Interest start="simple" />,
  "reverse-percent-bar": ReversePercentBar,
  "interest-compound": () => <Interest start="compound" />,
  "speed-journey": SpeedJourney,
  "dt-graph-builder": DtGraphBuilder,
  "density-blocks": DensityBlocks,
  "unit-rate-convert": UnitRateConvert,
};
