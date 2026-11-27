"use client";

/**
 * Interactive demonstrations for the decimals and percentages chains. Each
 * lets the student change one thing and see what happens. Keyboard operable;
 * every state is also described in words (aria-live), and nothing animates.
 */

import { useId, useState } from "react";
import { frac, mul, show, simplify, type Fraction } from "@/engine/fraction";
import { dec, showDec, showMoney } from "@/content/maths/decimals/dec";
import { buildSteps } from "@/content/maths/percentages/steps";
import { MathText } from "./MathText";

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

function Choice<T extends string | number>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; text: string }[]; onChange: (v: T) => void }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} className="input" value={String(value)} onChange={(e) => onChange(options.find((o) => String(o.value) === e.target.value)!.value)}>
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.text}
          </option>
        ))}
      </select>
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

const cell: React.CSSProperties = {
  border: "1.5px solid var(--line)",
  minWidth: 44,
  height: 48,
  textAlign: "center",
  fontSize: "1.4rem",
  fontVariantNumeric: "tabular-nums",
  background: "var(--surface)",
  color: "var(--ink)",
};

// ------------------------------------------------------------ place value chart

const COLS = [
  { name: "Thousands", short: "Th", value: "1000" },
  { name: "Hundreds", short: "H", value: "100" },
  { name: "Tens", short: "T", value: "10" },
  { name: "Units", short: "U", value: "1" },
  { name: "Tenths", short: "t", value: "0.1" },
  { name: "Hundredths", short: "h", value: "0.01" },
  { name: "Thousandths", short: "th", value: "0.001" },
];

/** Digits of x in the 7 columns above, with blanks for leading and trailing zeros. */
function columnDigits(x: Fraction): (number | null)[] {
  const units = Math.round((x.n * 1000) / x.d);
  const s = String(units).padStart(7, "0").split("").map(Number);
  const first = s.findIndex((d) => d !== 0);
  let last = -1;
  for (let i = 6; i >= 0; i--) if (s[i] !== 0) { last = i; break; }
  return s.map((d, i) => (i === 3 ? d : (first === -1 || i < first) && i < 3 ? null : i > 3 && i > last ? null : d));
}

function fitsChart(x: Fraction) {
  const units = (x.n * 1000) / x.d;
  return Number.isInteger(units) && units < 10_000_000;
}

const START_NUMBERS = ["3.47", "0.6", "45.2", "12.385", "0.08"];

function PlaceValueChart() {
  const [start, setStart] = useState("3.47");
  const [shift, setShift] = useState(0); // power of ten applied
  const [picked, setPicked] = useState<number | null>(null);
  const base = dec(Number(start.replace(".", "")), start.includes(".") ? start.split(".")[1].length : 0);
  const value = shift >= 0 ? mul(base, frac(10 ** shift)) : mul(base, frac(1, 10 ** -shift));
  const digits = columnDigits(value);
  const can = (p: number) => {
    const next = p >= 0 ? mul(value, frac(10 ** p)) : mul(value, frac(1, 10 ** -p));
    return fitsChart(next);
  };
  const move = (p: number) => {
    setShift(shift + p);
    setPicked(null);
  };
  const op = shift === 0 ? "" : shift > 0 ? `× ${10 ** shift}` : `÷ ${10 ** -shift}`;
  const pickedDigit = picked !== null ? digits[picked] : null;
  return (
    <>
      <p>Choose a number, then multiply or divide it. Watch the digits move while the decimal point stays still. Press a digit to see what it is worth.</p>
      <div className="grid-2">
        <Choice
          label="Starting number"
          value={start}
          options={START_NUMBERS.map((n) => ({ value: n, text: n }))}
          onChange={(v) => {
            setStart(v);
            setShift(0);
            setPicked(null);
          }}
        />
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", margin: "8px 0", width: "auto" }} aria-label={`Place value chart showing ${showDec(value)}`}>
          <thead>
            <tr>
              {COLS.map((c, i) => (
                <th key={c.name} scope="col" style={{ padding: "4px 2px", fontSize: "0.8rem", fontWeight: 600, color: "var(--muted)", borderRight: i === 3 ? "4px solid var(--ink)" : undefined }}>
                  <abbr title={c.name} style={{ textDecoration: "none" }}>
                    {c.short}
                  </abbr>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {digits.map((d, i) => (
                <td key={i} style={{ ...cell, borderRight: i === 3 ? "4px solid var(--ink)" : cell.border, padding: 0 }}>
                  {d === null ? (
                    ""
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPicked(i)}
                      aria-label={`${d} in the ${COLS[i].name.toLowerCase()} column`}
                      aria-pressed={picked === i}
                      style={{
                        all: "unset",
                        cursor: "pointer",
                        display: "block",
                        width: "100%",
                        height: "100%",
                        lineHeight: "48px",
                        background: picked === i ? "var(--accent-soft)" : undefined,
                        fontWeight: picked === i ? 700 : 400,
                      }}
                    >
                      {d}
                    </button>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        <p className="small muted" style={{ margin: 0 }}>The thick line is the decimal point.</p>
      </div>
      <div className="row">
        <button className="btn btn-small" onClick={() => move(1)} disabled={!can(1)}>× 10</button>
        <button className="btn btn-small" onClick={() => move(2)} disabled={!can(2)}>× 100</button>
        <button className="btn btn-small" onClick={() => move(-1)} disabled={!can(-1)}>÷ 10</button>
        <button className="btn btn-small" onClick={() => move(-2)} disabled={!can(-2)}>÷ 100</button>
        <button className="btn btn-small btn-ghost" onClick={() => move(-shift)} disabled={shift === 0}>Start again</button>
      </div>
      <Readout>
        {shift === 0 ? (
          <p>
            The number is <strong>{showDec(value)}</strong>.
          </p>
        ) : (
          <p>
            {start} {op} = <strong>{showDec(value)}</strong>. Every digit moved {Math.abs(shift)} place{Math.abs(shift) > 1 ? "s" : ""} to the {shift > 0 ? "left, so the number got bigger" : "right, so the number got smaller"}.
          </p>
        )}
        {picked !== null && pickedDigit !== null && (
          <p>
            The {pickedDigit} is in the {COLS[picked].name.toLowerCase()} column, so it is worth {pickedDigit} × {COLS[picked].value} ={" "}
            <strong>{showDec(mul(frac(pickedDigit), dec(Number(COLS[picked].value.replace(".", "")), COLS[picked].value.includes(".") ? COLS[picked].value.split(".")[1].length : 0)))}</strong>.
          </p>
        )}
      </Readout>
    </>
  );
}

// ------------------------------------------------------------ decimal columns

const DECIMAL_RE = /^\d{1,3}(\.\d{1,3})?$/;

function toDec(s: string): Fraction {
  const [w, f = ""] = s.split(".");
  return dec(Number(w + f), f.length);
}

function DecimalColumns() {
  const [a, setA] = useState("4.7");
  const [b, setB] = useState("2.35");
  const [op, setOp] = useState<"+" | "−">("+");
  const idA = useId();
  const idB = useId();
  const okA = DECIMAL_RE.test(a.trim());
  const okB = DECIMAL_RE.test(b.trim());
  let body: React.ReactNode = <p>Type two numbers, each with up to 3 digits before and after the decimal point.</p>;
  if (okA && okB) {
    const A = a.trim();
    const B = b.trim();
    const dpA = A.includes(".") ? A.split(".")[1].length : 0;
    const dpB = B.includes(".") ? B.split(".")[1].length : 0;
    const dp = Math.max(dpA, dpB, 1);
    const va = toDec(A);
    const vb = toDec(B);
    const result = op === "+" ? simplify(frac(va.n * vb.d + vb.n * va.d, va.d * vb.d)) : simplify(frac(va.n * vb.d - vb.n * va.d, va.d * vb.d));
    if (result.n < 0) {
      body = <p>The second number is bigger than the first. Put the bigger number on top to subtract.</p>;
    } else {
      const wholeWidth = Math.max(showDec(va).split(".")[0].length, showDec(vb).split(".")[0].length, showDec(result).split(".")[0].length);
      const rowCells = (x: Fraction, given: number) => {
        const [w, f = ""] = showDec(x, dp).split(".");
        const whole = w.padStart(wholeWidth, " ").split("");
        return [
          ...whole.map((c, i) => ({ c: c.trim(), filled: false, key: `w${i}` })),
          { c: ".", filled: false, key: "pt" },
          ...f.split("").map((c, i) => ({ c, filled: i >= given, key: `f${i}` })),
        ];
      };
      const rows = [
        { label: "", cells: rowCells(va, dpA) },
        { label: op, cells: rowCells(vb, dpB) },
        { label: "=", cells: rowCells(result, dp) },
      ];
      const padded = dpA !== dpB || dpA === 0 || dpB === 0;
      body = (
        <>
          <table style={{ borderCollapse: "collapse", margin: "8px 0", width: "auto", justifySelf: "start", fontSize: "1.5rem", fontVariantNumeric: "tabular-nums" }} aria-hidden="true">
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} style={{ borderTop: ri === 2 ? "3px solid var(--ink)" : undefined }}>
                  <td style={{ width: 30, color: "var(--muted)" }}>{row.label}</td>
                  {row.cells.map((x) => (
                    <td
                      key={x.key}
                      style={{
                        width: x.c === "." ? 14 : 30,
                        textAlign: "center",
                        padding: "2px 0",
                        color: x.filled ? "var(--accent)" : "var(--ink)",
                        fontStyle: x.filled ? "italic" : undefined,
                        fontWeight: x.c === "." ? 700 : ri === 2 ? 700 : 400,
                      }}
                    >
                      {x.c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <Readout>
            <p>
              {showDec(va)} {op} {showDec(vb)} = <strong>{showDec(result)}</strong>
            </p>
            <p className="small">
              The decimal points are lined up, so every digit is in its own column.
              {padded ? ` The coloured zeros were filled in so both numbers have ${dp} decimal place${dp > 1 ? "s" : ""}. They don't change the value.` : ""}
            </p>
          </Readout>
        </>
      );
    }
  }
  return (
    <>
      <p>Type any two decimals and see them lined up by their decimal points. Try a whole number like 6, or numbers with different lengths like 4.7 and 2.35.</p>
      <div className="row" style={{ alignItems: "flex-end" }}>
        <div className="field" style={{ width: 150 }}>
          <label htmlFor={idA}>First number</label>
          <input id={idA} className="input" inputMode="decimal" value={a} onChange={(e) => setA(e.target.value)} aria-invalid={!okA} />
        </div>
        <Choice
          label="Add or subtract"
          value={op}
          options={[
            { value: "+", text: "+ add" },
            { value: "−", text: "− subtract" },
          ]}
          onChange={setOp}
        />
        <div className="field" style={{ width: 150 }}>
          <label htmlFor={idB}>Second number</label>
          <input id={idB} className="input" inputMode="decimal" value={b} onChange={(e) => setB(e.target.value)} aria-invalid={!okB} />
        </div>
      </div>
      {body}
    </>
  );
}

// ------------------------------------------------------------ rounding number line

function RoundingLine() {
  const [mode, setMode] = useState<"whole" | "1dp">("whole");
  // whole: value in tenths (2.0-4.0); 1dp: value in hundredths (3.30-3.70)
  const [vWhole, setVWhole] = useState(27);
  const [vDp, setVDp] = useState(347);
  const scale = mode === "whole" ? 1 : 2;
  const v = mode === "whole" ? vWhole : vDp;
  const lower = Math.floor(v / 10) * 10;
  const upper = lower + 10;
  const deciding = v % 10;
  const up = deciding >= 5;
  const exact = deciding === 0;
  const result = up ? upper : lower;
  const show = (x: number) => showDec(dec(x, scale));
  const showTarget = (x: number) => showDec(dec(x, scale), scale - 1);
  const W = 340;
  const X = (x: number) => 20 + ((x - lower) / 10) * (W - 40);
  return (
    <>
      <p>Move the number along. It rounds to whichever end of the line it is nearer. Exactly halfway (5) rounds up.</p>
      <div className="grid-2">
        <Choice
          label="Round to"
          value={mode}
          options={[
            { value: "whole", text: "the nearest whole number" },
            { value: "1dp", text: "1 decimal place" },
          ]}
          onChange={setMode}
        />
        {mode === "whole" ? (
          <Slider label="Number" value={vWhole} min={20} max={40} shown={show(vWhole)} onChange={setVWhole} />
        ) : (
          <Slider label="Number" value={vDp} min={330} max={370} shown={show(vDp)} onChange={setVDp} />
        )}
      </div>
      <svg viewBox={`0 0 ${W} 90`} width="100%" style={{ maxWidth: 480 }} role="img" aria-label={`Number line from ${showTarget(lower)} to ${showTarget(upper)} with ${show(v)} marked.`}>
        <line x1={20} y1={50} x2={W - 20} y2={50} stroke="var(--ink)" strokeWidth={2} />
        {Array.from({ length: 11 }, (_, i) => (
          <line key={i} x1={X(lower + i)} x2={X(lower + i)} y1={i === 0 || i === 10 ? 38 : i === 5 ? 42 : 45} y2={i === 0 || i === 10 ? 62 : i === 5 ? 58 : 55} stroke={i === 5 ? "var(--muted)" : "var(--ink)"} strokeWidth={i === 0 || i === 10 ? 3 : 1.5} strokeDasharray={i === 5 ? "3 2" : undefined} />
        ))}
        <text x={X(lower)} y={80} textAnchor="middle" fill="var(--ink)" fontSize={15} fontWeight={!exact && !up ? 700 : 400}>{showTarget(lower)}</text>
        <text x={X(upper)} y={80} textAnchor="middle" fill="var(--ink)" fontSize={15} fontWeight={up ? 700 : 400}>{showTarget(upper)}</text>
        <text x={X(lower + 5)} y={80} textAnchor="middle" fill="var(--muted)" fontSize={12}>halfway</text>
        {!exact && <line x1={X(v) + (up ? 10 : -10)} y1={30} x2={X(result) + (up ? -14 : 14)} y2={30} stroke="var(--accent)" strokeWidth={4} markerEnd="url(#round-arrow)" />}
        <defs>
          <marker id="round-arrow" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="12" refX="2" refY="6" orient="auto">
            <path d="M0,0 L12,6 L0,12 z" fill="var(--accent)" />
          </marker>
        </defs>
        <circle cx={X(v)} cy={50} r={7} fill="var(--accent)" />
        <text x={X(v)} y={16} textAnchor="middle" fill="var(--ink)" fontSize={14} fontWeight={700}>{show(v)}</text>
      </svg>
      <Readout>
        {exact ? (
          <p>
            {show(v)} is already exact: rounded to {mode === "whole" ? "the nearest whole number" : "1 decimal place"} it is {showTarget(v)}.
          </p>
        ) : (
          <p>
            {show(v)} is between {showTarget(lower)} and {showTarget(upper)}. The deciding digit is <strong>{deciding}</strong>, which is {up ? "5 or more, so round up" : "4 or less, so round down"}: {show(v)} ≈ <strong>{showTarget(result)}</strong>.
          </p>
        )}
      </Readout>
    </>
  );
}

// ------------------------------------------------------------ hundred grid

function HundredGrid() {
  const [n, setN] = useState(35);
  const f = simplify(frac(n, 100));
  return (
    <>
      <p>The grid is 100 small squares. Shade some of them and see the same amount written three ways.</p>
      <Slider label="Squares shaded" value={n} min={0} max={100} onChange={setN} />
      <div className="row">
        {[25, 50, 75, 10, 5, 20].map((p) => (
          <button key={p} className="btn btn-small" onClick={() => setN(p)} aria-pressed={n === p}>
            {p}
          </button>
        ))}
      </div>
      <svg viewBox="0 0 202 202" width="100%" style={{ maxWidth: 240 }} aria-hidden="true">
        {Array.from({ length: 100 }, (_, i) => {
          const row = Math.floor(i / 10);
          const col = i % 10;
          return <rect key={i} x={1 + col * 20} y={1 + row * 20} width={20} height={20} fill={i < n ? "var(--accent)" : "var(--surface)"} stroke="var(--line)" strokeWidth={1} />;
        })}
        <rect x={1} y={1} width={200} height={200} fill="none" stroke="var(--ink)" strokeWidth={2} />
      </svg>
      <Readout>
        <p>
          {n} out of 100 squares: <MathText text={`${n}/100`} />
          {f.d !== 100 && f.n !== 0 && (
            <>
              {" "}= <MathText text={show(f)} />
            </>
          )}{" "}
          = <strong>{showDec(dec(n, 2))}</strong> = <strong>{n}%</strong>
        </p>
      </Readout>
    </>
  );
}

// ------------------------------------------------------------ percentage bar

const AMOUNTS: { value: number; text: string; money: boolean }[] = [
  { value: 80, text: "£80", money: true },
  { value: 60, text: "£60", money: true },
  { value: 240, text: "£240", money: true },
  { value: 45, text: "£45", money: true },
  { value: 120, text: "120 people", money: false },
];

function PercentBar() {
  const [amt, setAmt] = useState(80);
  const [p, setP] = useState(35);
  const a = AMOUNTS.find((x) => x.value === amt)!;
  const A = frac(amt);
  const fmt = (x: Fraction) => (a.money ? showMoney(x) : showDec(x));
  const result = mul(A, frac(p, 100));
  const steps = buildSteps(p, A, a.money);
  return (
    <>
      <p>The bar is the whole amount (100%), split into ten 10% blocks. Change the percentage and see how to build it from 10% and 5%.</p>
      <div className="grid-2">
        <Choice label="Amount" value={amt} options={AMOUNTS.map((x) => ({ value: x.value, text: x.text }))} onChange={setAmt} />
        <Slider label="Percentage" value={p} min={5} max={100} step={5} shown={`${p}%`} onChange={setP} />
      </div>
      <svg viewBox="0 0 420 70" width="100%" style={{ maxWidth: 560 }} aria-hidden="true">
        <rect x={10} y={10} width={(400 * p) / 100} height={36} fill="var(--accent)" />
        {Array.from({ length: 10 }, (_, i) => (
          <g key={i}>
            <rect x={10 + i * 40} y={10} width={40} height={36} fill="none" stroke="var(--ink)" strokeWidth={1.5} />
            <text x={30 + i * 40} y={64} textAnchor="middle" fontSize={11} fill="var(--muted)">
              {fmt(mul(A, frac(1, 10)))}
            </text>
          </g>
        ))}
      </svg>
      <p className="small muted" style={{ margin: 0 }}>Each block is 10% of {a.text}.</p>
      <Readout>
        <ol style={{ margin: "6px 0", paddingLeft: 22 }}>
          {steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
        <p>
          {p}% of {a.text} = <strong>{a.money ? fmt(result) : `${showDec(result)} people`}</strong>
        </p>
      </Readout>
    </>
  );
}

// ------------------------------------------------------------ percentage change

function PercentChange() {
  const [amt, setAmt] = useState(80);
  const [p, setP] = useState(15);
  const [up, setUp] = useState(true);
  const A = frac(amt);
  const change = mul(A, frac(p, 100));
  const result = up ? frac(amt * 100 + amt * p, 100) : frac(amt * 100 - amt * p, 100);
  const newPct = up ? 100 + p : 100 - p;
  const maxPct = 150;
  const w = (pct: number) => (380 * pct) / maxPct;
  return (
    <>
      <p>The top bar is the original amount, 100%. Choose an increase or a decrease and see the new bar, the change, and the multiplier.</p>
      <div className="grid-2">
        <Choice label="Amount" value={amt} options={[80, 60, 40, 250, 120].map((x) => ({ value: x, text: `£${x}` }))} onChange={setAmt} />
        <Choice
          label="Change"
          value={up ? "up" : "down"}
          options={[
            { value: "up", text: "Increase" },
            { value: "down", text: "Decrease" },
          ]}
          onChange={(v) => setUp(v === "up")}
        />
        <Slider label="Percentage" value={p} min={5} max={50} step={5} shown={`${p}%`} onChange={setP} />
      </div>
      <svg viewBox="0 0 420 110" width="100%" style={{ maxWidth: 560 }} aria-hidden="true">
        <text x={10} y={16} fontSize={12} fill="var(--muted)">Original: 100%</text>
        <rect x={10} y={22} width={w(100)} height={26} fill="var(--accent-soft)" stroke="var(--ink)" strokeWidth={1.5} />
        <text x={10} y={70} fontSize={12} fill="var(--muted)">New: {newPct}%</text>
        <rect x={10} y={76} width={w(newPct)} height={26} fill="var(--accent)" stroke="var(--ink)" strokeWidth={1.5} />
        {!up && <rect x={10 + w(newPct)} y={76} width={w(p)} height={26} fill="none" stroke="var(--muted)" strokeDasharray="4 3" />}
        <line x1={10 + w(100)} x2={10 + w(100)} y1={18} y2={106} stroke="var(--muted)" strokeDasharray="3 3" />
      </svg>
      <Readout>
        <p>
          {p}% of £{amt} = {showMoney(change)}. {up ? "Add it on" : "Take it away"}: £{amt} {up ? "+" : "−"} {showMoney(change)} = <strong>{showMoney(result)}</strong>.
        </p>
        <p>
          Multiplier: 100% {up ? "+" : "−"} {p}% = {newPct}% = <strong>{showDec(dec(newPct, 2))}</strong>, and £{amt} × {showDec(dec(newPct, 2))} = {showMoney(result)}.
        </p>
      </Readout>
    </>
  );
}

export const DECIMAL_DEMOS = {
  "place-value-chart": PlaceValueChart,
  "decimal-columns": DecimalColumns,
  "rounding-line": RoundingLine,
  "hundred-grid": HundredGrid,
  "percent-bar": PercentBar,
  "percent-change": PercentChange,
};
