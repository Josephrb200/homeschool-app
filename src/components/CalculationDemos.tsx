"use client";

/**
 * Interactive demonstrations for the calculation skills: comparing decimals,
 * grid multiplication, short division, time on a number line, metric units,
 * estimation, error intervals, systematic listing and standard form.
 *
 * Each lets the student change one thing and see what happens. Keyboard
 * operable (sliders, selects, buttons); every state is also described in
 * words (aria-live), and nothing animates on its own.
 */

import { useId, useState } from "react";
import { frac, mul, type Fraction } from "@/engine/fraction";
import { showStandardForm, sup } from "@/engine/standard-form";
import { dec, roundSf, showDec } from "@/content/maths/decimals/dec";
import { MathText } from "./MathText";

const num = (x: number) => (x < 0 ? `−${-x}` : String(x));
const fx = (f: Fraction) => (f.n < 0 ? `−${showDec(frac(-f.n, f.d))}` : showDec(f));

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

const big: React.CSSProperties = { fontSize: "1.5rem", fontVariantNumeric: "tabular-nums", margin: "8px 0" };

// ------------------------------------------------------------ comparing decimals and negatives

const PAIRS: { a: Fraction; b: Fraction; dp: number }[] = [
  { a: dec(4, 1), b: dec(35, 2), dp: 2 },
  { a: dec(45, 2), b: dec(405, 3), dp: 3 },
  { a: dec(26, 1), b: dec(258, 2), dp: 2 },
  { a: dec(7, 1), b: dec(707, 3), dp: 3 },
  { a: frac(-3), b: frac(-8), dp: 0 },
  { a: dec(-15, 1), b: dec(-125, 2), dp: 2 },
];

function DecimalCompare() {
  const [i, setI] = useState(0);
  const [zeros, setZeros] = useState(false);
  const { a, b, dp } = PAIRS[i];
  const av = a.n / a.d;
  const bv = b.n / b.d;
  const sign = av < bv ? "<" : av > bv ? ">" : "=";
  const shown = (f: Fraction) => (zeros ? (f.n < 0 ? `−${showDec(frac(-f.n, f.d), dp)}` : showDec(f, dp)) : fx(f));
  // Number line from a bit below the smaller to a bit above the larger.
  const lo = Math.floor(Math.min(av, bv) * 10 - 1) / 10;
  const hi = Math.ceil(Math.max(av, bv) * 10 + 1) / 10;
  const W = 440;
  const x = (v: number) => 20 + ((v - lo) / (hi - lo)) * (W - 40);
  const neg = av < 0;
  return (
    <>
      <p>Pick two numbers. Fill in the zeros so they have the same number of decimal places, then see where they sit on the number line.</p>
      <div className="row">
        <Choice label="Numbers" value={i} options={PAIRS.map((p, k) => ({ value: k, text: `${fx(p.a)} and ${fx(p.b)}` }))} onChange={(k) => { setI(k); setZeros(false); }} />
        {dp > 0 && (
          <button type="button" className="btn btn-small" aria-pressed={zeros} onClick={() => setZeros(!zeros)}>
            {zeros ? "Hide the zeros" : "Fill in zeros"}
          </button>
        )}
      </div>
      <p style={big}>
        {shown(a)} &nbsp;and&nbsp; {shown(b)}
      </p>
      <svg viewBox={`0 0 ${W} 70`} width="100%" style={{ maxWidth: 560 }} role="img" aria-label={`Number line: ${fx(a)} is to the ${av < bv ? "left" : "right"} of ${fx(b)}.`}>
        <line x1={10} x2={W - 10} y1={40} y2={40} stroke="var(--ink)" strokeWidth={2} />
        <text x={W - 14} y={62} textAnchor="end" fontSize={11} fill="var(--muted)">bigger →</text>
        {[a, b].map((f, k) => (
          <g key={k}>
            <circle cx={x(f.n / f.d)} cy={40} r={7} fill={k === 0 ? "var(--accent)" : "var(--surface)"} stroke="var(--ink)" strokeWidth={2} />
            <text x={x(f.n / f.d)} y={k === 0 ? 22 : 64} textAnchor="middle" fontSize={14} fontWeight={600} fill="var(--ink)">
              {fx(f)}
            </text>
          </g>
        ))}
      </svg>
      <Readout>
        <p>
          <strong>
            {fx(a)} {sign} {fx(b)}
          </strong>
          {". "}
          {neg
            ? `${fx(av < bv ? a : b)} is further from zero, so it is further left and smaller.`
            : zeros
              ? `Compare column by column: ${shown(av > bv ? a : b)} is bigger.`
              : "Fill in the zeros to compare them column by column."}
        </p>
      </Readout>
    </>
  );
}

// ------------------------------------------------------------ grid multiplication

function GridMultiply() {
  const [a, setA] = useState(23);
  const [b, setB] = useState(45);
  const [decimal, setDecimal] = useState(false);
  const split = (n: number) => (n >= 10 ? [Math.floor(n / 10) * 10, n % 10].filter((p) => p > 0) : [n]);
  const as = split(a);
  const bs = split(b);
  const total = a * b;
  const W = 420;
  const H = 230;
  const sx = (W - 60) / a;
  const sy = (H - 40) / b;
  const cellText = (p: number, q: number) => `${p} × ${q} = ${p * q}`;
  let ox = 50;
  return (
    <>
      <p>Change the numbers. The rectangle is split into parts; each part is an easy multiplication. The parts add up to the answer.</p>
      <div className="grid-2">
        <Slider label="First number" value={a} min={11} max={99} onChange={setA} />
        <Slider label="Second number" value={b} min={2} max={99} onChange={setB} />
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 520 }} role="img" aria-label={`Grid for ${a} × ${b}: ${as.flatMap((p) => bs.map((q) => cellText(p, q))).join(", ")}.`}>
        {as.map((p, i) => {
          const x0 = ox;
          ox += p * sx;
          let oy = 30;
          return (
            <g key={i}>
              <text x={x0 + (p * sx) / 2} y={20} textAnchor="middle" fontSize={14} fontWeight={600} fill="var(--ink)">
                {p}
              </text>
              {bs.map((q, j) => {
                const y0 = oy;
                oy += q * sy;
                return (
                  <g key={j}>
                    <rect x={x0} y={y0} width={p * sx} height={q * sy} fill={(i + j) % 2 === 0 ? "var(--accent-soft)" : "var(--warn-soft)"} stroke="var(--ink)" strokeWidth={1.5} />
                    {i === 0 && (
                      <text x={42} y={y0 + (q * sy) / 2 + 5} textAnchor="end" fontSize={14} fontWeight={600} fill="var(--ink)">
                        {q}
                      </text>
                    )}
                    {p * sx > 36 && q * sy > 16 && (
                      <text x={x0 + (p * sx) / 2} y={y0 + (q * sy) / 2 + 5} textAnchor="middle" fontSize={13} fill="var(--ink)">
                        {p * q}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
      <Readout>
        <p>
          {as.flatMap((p) => bs.map((q) => cellText(p, q))).join(",  ")}
        </p>
        <p>
          <strong>
            {a} × {b} = {as.flatMap((p) => bs.map((q) => p * q)).join(" + ")} = {total}
          </strong>
        </p>
      </Readout>
      <button type="button" className="btn btn-small" aria-pressed={decimal} onClick={() => setDecimal(!decimal)}>
        {decimal ? "Hide the decimal version" : "What about a decimal?"}
      </button>
      {decimal && (
        <p aria-live="polite">
          {showDec(dec(a, 1))} × {b} is 10 times smaller than {a} × {b}, so it is {total} ÷ 10 = <strong>{showDec(dec(total, 1))}</strong>. And {showDec(dec(a, 1))} × {showDec(dec(b, 1))} has 2 decimal places: <strong>{showDec(dec(total, 2))}</strong>.
        </p>
      )}
    </>
  );
}

// ------------------------------------------------------------ short division

const DIVISIONS = [
  [624, 6],
  [832, 4],
  [756, 3],
  [945, 7],
  [1016, 8],
  [47, 4],
] as const;

function BusStopDivision() {
  const [k, setK] = useState(0);
  const [step, setStep] = useState(0);
  const [n, dv] = DIVISIONS[k];
  const digits = String(n).split("").map(Number);
  // Work through the digits, then decimal places if there is a remainder.
  const rows: { cur: number; q: number; rem: number; label: string }[] = [];
  let carry = 0;
  const all = [...digits];
  if (n % dv !== 0) all.push(0, 0);
  all.forEach((dg, i) => {
    const cur = carry * 10 + dg;
    const q = Math.floor(cur / dv);
    const rem = cur % dv;
    rows.push({ cur, q, rem, label: i >= digits.length ? "after the point" : `digit ${dg}` });
    carry = rem;
  });
  const shown = rows.slice(0, step);
  const quotient = rows.map((r) => r.q);
  const done = step >= rows.length;
  const qText = (upTo: number) =>
    quotient
      .slice(0, upTo)
      .map((q, i) => (i === digits.length ? `.${q}` : String(q)))
      .join("")
      .replace(/^0+(?=\d)/, "");
  return (
    <>
      <p>Short division goes one digit at a time, from the left. Press "Next step" and watch what happens to each remainder.</p>
      <div className="row">
        <Choice label="Division" value={k} options={DIVISIONS.map(([a, b], i) => ({ value: i, text: `${a} ÷ ${b}` }))} onChange={(i) => { setK(i); setStep(0); }} />
        <button type="button" className="btn btn-primary" onClick={() => setStep(step + 1)} disabled={done}>
          Next step
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setStep(0)}>
          Start again
        </button>
      </div>
      <div style={{ ...big, display: "inline-grid", gridTemplateColumns: "auto auto", columnGap: 6 }} aria-hidden="true">
        <span />
        <span style={{ letterSpacing: 6, paddingLeft: 8 }}>
          {all.map((_, i) => (
            <span key={i}>
              {i === digits.length ? "." : ""}
              <span style={{ visibility: i < step ? "visible" : "hidden" }}>{rows[i].q}</span>
            </span>
          ))}
        </span>
        <span>{dv}</span>
        <span style={{ borderLeft: "2px solid var(--ink)", borderTop: "2px solid var(--ink)", padding: "2px 8px", letterSpacing: 6 }}>
          {all.map((dg, i) => (
            <span key={i}>
              {i === digits.length ? "." : ""}
              {i > 0 && i - 1 < step && rows[i - 1].rem > 0 ? <sup style={{ color: "var(--warn)", fontSize: "0.6em", letterSpacing: 0 }}>{rows[i - 1].rem}</sup> : null}
              {dg}
            </span>
          ))}
        </span>
      </div>
      <Readout>
        {shown.length === 0 ? (
          <p>How many {dv}s go into {digits[0]}?</p>
        ) : (
          <ul>
            {shown.map((r, i) => (
              <li key={i}>
                {r.cur} ÷ {dv} = {r.q}
                {r.rem ? ` remainder ${r.rem}, carry the ${r.rem}` : ""}
                {r.q === 0 && i > 0 ? ". Write 0 in the answer!" : ""}
              </li>
            ))}
          </ul>
        )}
        <p>
          Answer so far: <strong>{step === 0 ? "…" : qText(step)}</strong>
          {done ? ` So ${n} ÷ ${dv} = ${qText(rows.length).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "")}.` : ""}
        </p>
      </Readout>
    </>
  );
}

// ------------------------------------------------------------ time on a number line

const clock = (mins: number) => {
  const h24 = Math.floor(mins / 60) % 24;
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${String(mins % 60).padStart(2, "0")} ${h24 < 12 ? "am" : "pm"}`;
};

function TimeNumberLine() {
  const [start, setStart] = useState(18 * 60 + 45);
  const [len, setLen] = useState(95);
  const end = start + len;
  const toHour = start % 60 === 0 ? 0 : 60 - (start % 60);
  const firstHour = start + toHour;
  const hours = Math.max(0, Math.floor((end - firstHour) / 60));
  const lastStart = firstHour + hours * 60;
  const rest = end - lastStart;
  const jumps = toHour >= len ? [{ from: start, to: end, text: `${len} min` }] : [
    ...(toHour ? [{ from: start, to: firstHour, text: `${toHour} min` }] : []),
    ...(hours ? [{ from: firstHour, to: lastStart, text: `${hours} h` }] : []),
    ...(rest ? [{ from: lastStart, to: end, text: `${rest} min` }] : []),
  ];
  const W = 460;
  const x = (m: number) => 20 + ((m - start) / Math.max(len, 1)) * (W - 40);
  return (
    <>
      <p>Change the start time and how long it lasts. Count on: first to the next o'clock, then whole hours, then the minutes left.</p>
      <div className="grid-2">
        <Slider label="Start" value={start} min={8 * 60} max={20 * 60} step={5} shown={clock(start)} onChange={setStart} />
        <Slider label="Length" value={len} min={10} max={240} step={5} shown={`${len} minutes`} onChange={setLen} />
      </div>
      <svg viewBox={`0 0 ${W} 100`} width="100%" style={{ maxWidth: 560 }} role="img" aria-label={`From ${clock(start)} to ${clock(end)}: ${jumps.map((j) => j.text).join(", then ")}.`}>
        <line x1={10} x2={W - 10} y1={70} y2={70} stroke="var(--ink)" strokeWidth={2} />
        {jumps.map((j, i) => {
          const x1 = x(j.from);
          const x2 = x(j.to);
          return (
            <g key={i}>
              <path d={`M ${x1} 68 Q ${(x1 + x2) / 2} ${30} ${x2} 68`} fill="none" stroke="var(--accent)" strokeWidth={2.5} />
              <text x={(x1 + x2) / 2} y={40} textAnchor="middle" fontSize={13} fontWeight={600} fill="var(--ink)">
                {j.text}
              </text>
            </g>
          );
        })}
        {[start, ...jumps.map((j) => j.to)].map((m, i) => (
          <g key={i}>
            <line x1={x(m)} x2={x(m)} y1={64} y2={76} stroke="var(--ink)" strokeWidth={2} />
            <text x={x(m)} y={94} textAnchor="middle" fontSize={11} fill="var(--ink)">
              {clock(m)}
            </text>
          </g>
        ))}
      </svg>
      <Readout>
        <p>
          {jumps.map((j) => j.text.replace(" h", hours === 1 ? " hour" : " hours")).join(" + ")} = <strong>{len} minutes</strong>
          {len >= 60 ? ` (${Math.floor(len / 60)} hour${len >= 120 ? "s" : ""}${len % 60 ? ` ${len % 60} minutes` : ""})` : ""}. It ends at <strong>{clock(end)}</strong>.
        </p>
      </Readout>
    </>
  );
}

// ------------------------------------------------------------ metric units staircase

const LADDERS = {
  length: [
    { u: "km", f: 1000, w: "kilometres" },
    { u: "m", f: 100, w: "metres" },
    { u: "cm", f: 10, w: "centimetres" },
    { u: "mm", f: 1, w: "millimetres" },
  ],
  mass: [
    { u: "tonnes", f: 1000, w: "tonnes" },
    { u: "kg", f: 1000, w: "kilograms" },
    { u: "g", f: 1, w: "grams" },
  ],
  capacity: [
    { u: "litres", f: 100, w: "litres" },
    { u: "cl", f: 10, w: "centilitres" },
    { u: "ml", f: 1, w: "millilitres" },
  ],
} as const;
type Ladder = keyof typeof LADDERS;

function UnitStaircase() {
  const [kind, setKind] = useState<Ladder>("length");
  const steps = LADDERS[kind];
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(1);
  const [amount, setAmount] = useState(35);
  const value = dec(amount, 1);
  const f = Math.min(from, steps.length - 1);
  const t = Math.min(to, steps.length - 1);
  // Multiply going down the stairs, divide going up.
  let factor = 1;
  for (let i = Math.min(f, t); i < Math.max(f, t); i++) factor *= steps[i].f;
  const down = t > f;
  const result = t === f ? value : down ? mul(value, frac(factor)) : mul(value, frac(1, factor));
  return (
    <>
      <p>Going down the stairs to a smaller unit, multiply. Going up to a bigger unit, divide.</p>
      <div className="row">
        <Choice label="Measure" value={kind} options={[{ value: "length", text: "Length" }, { value: "mass", text: "Mass" }, { value: "capacity", text: "Capacity" }]} onChange={(k) => { setKind(k); setFrom(0); setTo(1); }} />
        <Choice label="From" value={f} options={steps.map((s, i) => ({ value: i, text: s.u }))} onChange={setFrom} />
        <Choice label="To" value={t} options={steps.map((s, i) => ({ value: i, text: s.u }))} onChange={setTo} />
      </div>
      <Slider label="Amount" value={amount} min={1} max={120} shown={`${showDec(value)} ${steps[f].u}`} onChange={setAmount} />
      <svg viewBox="0 0 440 150" width="100%" style={{ maxWidth: 520 }} aria-hidden="true">
        {steps.map((s, i) => {
          const sx = 10 + i * (420 / steps.length);
          const sy = 10 + i * (110 / steps.length);
          const on = i === f || i === t;
          return (
            <g key={s.u}>
              <rect x={sx} y={sy} width={420 / steps.length} height={30} fill={on ? "var(--accent-soft)" : "var(--surface)"} stroke="var(--ink)" strokeWidth={1.5} />
              <text x={sx + 210 / steps.length} y={sy + 20} textAnchor="middle" fontSize={14} fontWeight={on ? 700 : 400} fill="var(--ink)">
                {s.u}
              </text>
              {i < steps.length - 1 && (
                <text x={sx + 420 / steps.length} y={sy + 46} textAnchor="middle" fontSize={12} fill="var(--muted)">
                  × {s.f} ↘ / ↖ ÷ {s.f}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <Readout>
        <p>
          {t === f
            ? "Pick two different units."
            : `${showDec(value)} ${steps[f].u} ${down ? "×" : "÷"} ${factor} = `}
          {t !== f && (
            <strong>
              {showDec(result)} {steps[t].u}
            </strong>
          )}
          {t !== f && (down ? `. ${steps[t].w[0].toUpperCase()}${steps[t].w.slice(1)} are smaller, so you need more of them.` : `. ${steps[t].w[0].toUpperCase()}${steps[t].w.slice(1)} are bigger, so you need fewer of them.`)}
        </p>
      </Readout>
    </>
  );
}

// ------------------------------------------------------------ estimation

const CALCS: { text: string; parts: Fraction[]; op: (x: Fraction[]) => number; build: (x: string[]) => string }[] = [
  { text: "48.7 × 3.1", parts: [dec(487, 1), dec(31, 1)], op: ([a, b]) => (a.n / a.d) * (b.n / b.d), build: ([a, b]) => `${a} × ${b}` },
  { text: "612 ÷ 0.48", parts: [frac(612), dec(48, 2)], op: ([a, b]) => a.n / a.d / (b.n / b.d), build: ([a, b]) => `${a} ÷ ${b}` },
  { text: "(41.2 × 9.8) ÷ 2.1", parts: [dec(412, 1), dec(98, 1), dec(21, 1)], op: ([a, b, c]) => ((a.n / a.d) * (b.n / b.d)) / (c.n / c.d), build: ([a, b, c]) => `(${a} × ${b}) ÷ ${c}` },
  { text: "7.89 × 0.193", parts: [dec(789, 2), dec(193, 3)], op: ([a, b]) => (a.n / a.d) * (b.n / b.d), build: ([a, b]) => `${a} × ${b}` },
  { text: "(286 + 512) ÷ 3.9", parts: [frac(286), frac(512), dec(39, 1)], op: ([a, b, c]) => (a.n / a.d + b.n / b.d) / (c.n / c.d), build: ([a, b, c]) => `(${a} + ${b}) ÷ ${c}` },
];

function EstimateCompare() {
  const [k, setK] = useState(0);
  const [shown, setShown] = useState(false);
  const c = CALCS[k];
  const rounded = c.parts.map((p) => roundSf(p, 1));
  const est = c.op(rounded);
  const exact = c.op(c.parts);
  return (
    <>
      <p>Round every number to 1 significant figure, then do the easy calculation. Then compare with the exact answer.</p>
      <Choice label="Calculation" value={k} options={CALCS.map((x, i) => ({ value: i, text: x.text }))} onChange={(i) => { setK(i); setShown(false); }} />
      <Readout>
        <ul>
          {c.parts.map((p, i) => (
            <li key={i}>
              {showDec(p)} ≈ <strong>{showDec(rounded[i])}</strong>
            </li>
          ))}
        </ul>
        <p style={big}>
          {c.build(rounded.map((r) => showDec(r)))} = <strong>{Math.round(est * 1000) / 1000}</strong>
        </p>
        {shown ? (
          <p>
            Exact answer (calculator): {Math.round(exact * 100) / 100}. The estimate is {est > exact ? "a bit too big" : "a bit too small"}, but the right size, so it helps you spot a mistake.
          </p>
        ) : null}
      </Readout>
      <button type="button" className="btn btn-small" aria-pressed={shown} onClick={() => setShown(!shown)}>
        {shown ? "Hide the exact answer" : "Show the exact answer"}
      </button>
    </>
  );
}

// ------------------------------------------------------------ error intervals

const ACCURACY = [
  { value: "1dp", text: "1 decimal place", unit: dec(1, 1), dp: 1 },
  { value: "whole", text: "nearest whole number", unit: frac(1), dp: 0 },
  { value: "10", text: "nearest 10", unit: frac(10), dp: 0 },
] as const;

function ErrorIntervalLine() {
  const [acc, setAcc] = useState<(typeof ACCURACY)[number]["value"]>("1dp");
  const a = ACCURACY.find((x) => x.value === acc)!;
  const [steps, setSteps] = useState(74);
  const unit = a.unit.n / a.unit.d;
  const v = steps * unit;
  const lo = v - unit / 2;
  const hi = v + unit / 2;
  const [tryAt, setTryAt] = useState(50); // 0..100 across the window
  const winLo = v - unit * 1.2;
  const winHi = v + unit * 1.2;
  const t = winLo + ((winHi - winLo) * tryAt) / 100;
  const tRounded = Math.round(t / unit + 1e-9) * unit;
  const shownNum = (x: number, extra = 1) => (Math.round(x * 10 ** (a.dp + extra)) / 10 ** (a.dp + extra)).toString();
  const W = 460;
  const X = (x: number) => 20 + ((x - winLo) / (winHi - winLo)) * (W - 40);
  const insideText = Math.abs(tRounded - v) < 1e-9 ? `rounds to ${shownNum(v, 0)}, so it's inside the interval` : `rounds to ${shownNum(tRounded, 0)}, so it's outside`;
  return (
    <>
      <p>Choose a rounded value. The shaded part shows every number that rounds to it. Slide the test number to check the ends.</p>
      <div className="grid-2">
        <Choice label="Rounded to" value={acc} options={ACCURACY.map((x) => ({ value: x.value, text: x.text }))} onChange={(x) => { setAcc(x); setSteps(x === "1dp" ? 74 : x === "whole" ? 12 : 35); }} />
        <Slider label="Rounded value" value={steps} min={1} max={acc === "10" ? 99 : 199} shown={shownNum(v, 0)} onChange={setSteps} />
      </div>
      <Slider label="Test number" value={tryAt} min={0} max={100} shown={shownNum(t, 2)} onChange={setTryAt} />
      <svg viewBox={`0 0 ${W} 90`} width="100%" style={{ maxWidth: 560 }} role="img" aria-label={`Number line from ${shownNum(lo)} (included) to ${shownNum(hi)} (not included).`}>
        <line x1={10} x2={W - 10} y1={45} y2={45} stroke="var(--ink)" strokeWidth={2} />
        <rect x={X(lo)} y={37} width={X(hi) - X(lo)} height={16} fill="var(--accent-soft)" />
        <circle cx={X(lo)} cy={45} r={7} fill="var(--accent)" stroke="var(--ink)" strokeWidth={2} />
        <circle cx={X(hi)} cy={45} r={7} fill="var(--surface)" stroke="var(--ink)" strokeWidth={2} />
        <text x={X(lo)} y={78} textAnchor="middle" fontSize={13} fill="var(--ink)">{shownNum(lo)}</text>
        <text x={X(hi)} y={78} textAnchor="middle" fontSize={13} fill="var(--ink)">{shownNum(hi)}</text>
        <text x={X(v)} y={78} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--ink)">{shownNum(v, 0)}</text>
        <line x1={X(t)} x2={X(t)} y1={18} y2={56} stroke="var(--warn)" strokeWidth={3} />
        <text x={X(t)} y={14} textAnchor="middle" fontSize={12} fill="var(--ink)">test</text>
      </svg>
      <Readout>
        <p>
          <strong>
            {shownNum(lo)} ≤ x &lt; {shownNum(hi)}
          </strong>
          . The filled dot means {shownNum(lo)} is included; the empty dot means {shownNum(hi)} is not, because it would round up.
        </p>
        <p>
          Test number {shownNum(t, 2)} {insideText}.
        </p>
      </Readout>
    </>
  );
}

// ------------------------------------------------------------ systematic listing

const STARTERS = ["Soup", "Salad", "Bread", "Melon", "Prawns"];
const MAINS = ["Pizza", "Pasta", "Curry", "Fish", "Pie"];

function ListingGrid() {
  const [s, setS] = useState(3);
  const [m, setM] = useState(2);
  return (
    <>
      <p>Change how many starters and main courses there are. The list is in order: each starter with every main, then the next starter.</p>
      <div className="grid-2">
        <Slider label="Starters" value={s} min={1} max={5} onChange={setS} />
        <Slider label="Main courses" value={m} min={1} max={5} onChange={setM} />
      </div>
      <div className="scroll-x">
        <table className="data-table" aria-label={`Every meal: ${s} starters times ${m} mains.`}>
          <thead>
            <tr>
              <th scope="col">Starter</th>
              {MAINS.slice(0, m).map((x) => (
                <th key={x} scope="col">
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STARTERS.slice(0, s).map((st) => (
              <tr key={st}>
                <th scope="row">{st}</th>
                {MAINS.slice(0, m).map((x) => (
                  <td key={x}>
                    {st} + {x}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Readout>
        <p>
          {s} row{s === 1 ? "" : "s"} of {m}: <strong>
            {s} × {m} = {s * m} meals
          </strong>
          . Adding ({s} + {m} = {s + m}) would miss most of them.
        </p>
      </Readout>
    </>
  );
}

// ------------------------------------------------------------ standard form

function SfMultiply() {
  const [a, setA] = useState(4);
  const [b, setB] = useState(3);
  const [p, setP] = useState(5);
  const [q, setQ] = useState(2);
  const [op, setOp] = useState<"×" | "÷">("×");
  const raw = op === "×" ? frac(a * b) : frac(a, b);
  const power = op === "×" ? p + q : p - q;
  const x = raw.n / raw.d;
  const fix = x >= 10 ? 1 : x < 1 ? -1 : 0;
  const m = fix === 1 ? mul(raw, frac(1, 10)) : fix === -1 ? mul(raw, frac(10)) : raw;
  const terminates = [1, 2, 4, 5, 8, 10, 20, 25, 40, 50].includes(m.d);
  return (
    <>
      <p>Multiply (or divide) the first numbers, and add (or subtract) the powers. If the first number isn't between 1 and 10, tidy it up.</p>
      <div className="row">
        <button type="button" className="btn btn-small" aria-pressed={op === "×"} onClick={() => setOp("×")}>
          Multiply
        </button>
        <button type="button" className="btn btn-small" aria-pressed={op === "÷"} onClick={() => setOp("÷")}>
          Divide
        </button>
      </div>
      <div className="grid-2">
        <Slider label="First number" value={a} min={1} max={9} onChange={setA} />
        <Slider label="First power" value={p} min={-6} max={9} shown={`10${sup(p)}`} onChange={setP} />
        <Slider label="Second number" value={b} min={1} max={9} onChange={setB} />
        <Slider label="Second power" value={q} min={-6} max={9} shown={`10${sup(q)}`} onChange={setQ} />
      </div>
      <Readout>
        <p style={big}>
          ({a} × 10{sup(p)}) {op} ({b} × 10{sup(q)})
        </p>
        {terminates ? (
          <>
            <p>
              {a} {op} {b} = {showDec(raw)}, and 10{sup(p)} {op} 10{sup(q)} = 10{sup(power)} ({op === "×" ? "add" : "subtract"} the powers: {num(p)} {op === "×" ? "+" : "−"} {q < 0 ? `(${num(q)})` : q} = {num(power)}).
            </p>
            {fix !== 0 && (
              <p>
                {showDec(raw)} isn't between 1 and 10. {showDec(raw)} = {showDec(m)} × 10{sup(fix)}, so the power goes {fix === 1 ? "up" : "down"} by 1.
              </p>
            )}
            <p>
              Answer: <strong>{showStandardForm(m, power + fix)}</strong>
            </p>
          </>
        ) : (
          <p>
            <MathText text={`${a} ÷ ${b} = ${a}/${b}, which doesn't give a tidy decimal. Try a different pair.`} />
          </p>
        )}
      </Readout>
    </>
  );
}

export const CALCULATION_DEMOS = {
  "decimal-compare": DecimalCompare,
  "grid-multiply": GridMultiply,
  "bus-stop-division": BusStopDivision,
  "time-number-line": TimeNumberLine,
  "unit-staircase": UnitStaircase,
  "estimate-compare": EstimateCompare,
  "error-interval-line": ErrorIntervalLine,
  "listing-grid": ListingGrid,
  "sf-multiply": SfMultiply,
};
