"use client";

/**
 * Interactive demonstrations for the negatives, powers and BIDMAS chain. Each
 * lets the student change one thing and see what happens. Keyboard operable;
 * every state is also described in words (aria-live), and nothing animates.
 */

import { useId, useState } from "react";
import { sfValue, showStandardForm, sup } from "@/engine/standard-form";
import { dec, showDec } from "@/content/maths/decimals/dec";
import { MathText } from "./MathText";

const num = (n: number) => (n < 0 ? `−${-n}` : String(n));
const br = (n: number) => (n < 0 ? `(${num(n)})` : String(n));
const commas = (s: string) => {
  const [whole, part] = s.split(".");
  const w = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return part ? `${w}.${part}` : w;
};

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

const big: React.CSSProperties = { fontSize: "1.6rem", fontVariantNumeric: "tabular-nums", margin: "8px 0" };

// ------------------------------------------------------------ number line

function NumberLineNegatives() {
  const [mode, setMode] = useState<"add" | "multiply">("add");
  return (
    <>
      <div className="row" role="group" aria-label="What to explore">
        <button type="button" className="btn btn-small" aria-pressed={mode === "add"} onClick={() => setMode("add")}>
          Adding and subtracting
        </button>
        <button type="button" className="btn btn-small" aria-pressed={mode === "multiply"} onClick={() => setMode("multiply")}>
          Why − × − is +
        </button>
      </div>
      {mode === "add" ? <AddSubtractLine /> : <SignPattern />}
    </>
  );
}

function AddSubtractLine() {
  const [start, setStart] = useState(-3);
  const [op, setOp] = useState<"+" | "−">("−");
  const [amount, setAmount] = useState(-4);
  const move = op === "+" ? amount : -amount;
  const end = start + move;
  const W = 360;
  const LO = -15;
  const HI = 15;
  const X = (x: number) => 15 + ((x - LO) / (HI - LO)) * (W - 30);
  const dir = move > 0 ? "up (right)" : "down (left)";
  const swapped = amount < 0;
  const sentence = `${num(start)} ${op} ${br(amount)} = ${num(end)}`;
  return (
    <>
      <p>Pick a starting number, then add or subtract. Try subtracting a negative number and watch which way you move.</p>
      <div className="grid-2">
        <Slider label="Start at" value={start} min={-8} max={8} shown={num(start)} onChange={setStart} />
        <Choice label="Operation" value={op} options={[{ value: "+", text: "+ add" }, { value: "−", text: "− subtract" }]} onChange={setOp} />
        <Slider label="Number" value={amount} min={-7} max={7} shown={num(amount)} onChange={(n) => setAmount(n === 0 ? (amount > 0 ? -1 : 1) : n)} />
      </div>
      <svg viewBox={`0 0 ${W} 96`} width="100%" style={{ maxWidth: 560 }} role="img" aria-label={`Number line from ${num(LO)} to ${HI}. Start at ${num(start)}, move ${Math.abs(move)} ${dir}, finish at ${num(end)}.`}>
        <defs>
          <marker id="neg-arrow" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
            <path d="M0,0 L12,6 L0,12 z" fill="var(--accent)" />
          </marker>
        </defs>
        <line x1={X(LO)} y1={58} x2={X(HI)} y2={58} stroke="var(--ink)" strokeWidth={2} />
        {Array.from({ length: HI - LO + 1 }, (_, i) => {
          const x = LO + i;
          const major = x % 5 === 0;
          return (
            <g key={x}>
              <line x1={X(x)} x2={X(x)} y1={major ? 50 : 54} y2={major ? 66 : 62} stroke="var(--ink)" strokeWidth={x === 0 ? 3 : 1.2} />
              {major && (
                <text x={X(x)} y={84} textAnchor="middle" fontSize={13} fill="var(--ink)" fontWeight={x === 0 ? 700 : 400}>
                  {num(x)}
                </text>
              )}
            </g>
          );
        })}
        <path d={`M${X(start)},48 Q${(X(start) + X(end)) / 2},${14} ${X(end)},48`} fill="none" stroke="var(--accent)" strokeWidth={3} markerEnd="url(#neg-arrow)" />
        <circle cx={X(start)} cy={58} r={6} fill="var(--surface)" stroke="var(--ink)" strokeWidth={2} />
        <circle cx={X(end)} cy={58} r={7} fill="var(--accent)" />
        <text x={(X(start) + X(end)) / 2} y={22} textAnchor="middle" fontSize={13} fill="var(--ink)">
          {move > 0 ? "+" : "−"}
          {Math.abs(move)}
        </text>
      </svg>
      <Readout>
        <p>
          Start at <strong>{num(start)}</strong>.{" "}
          {swapped
            ? `${op === "−" ? "Subtracting a negative is the same as adding" : "Adding a negative is the same as subtracting"}: ${op} ${br(amount)} becomes ${move > 0 ? "+" : "−"} ${Math.abs(amount)}. `
            : ""}
          Move {Math.abs(move)} {dir}. <strong>{sentence}</strong>
        </p>
      </Readout>
    </>
  );
}

function SignPattern() {
  const [b, setB] = useState(-2);
  const rows = [3, 2, 1, 0, -1, -2, -3];
  return (
    <>
      <p>Look down the answers. Each time the first number goes down by 1, the answer goes up by {-b}. The pattern doesn&apos;t stop at zero.</p>
      <Choice label="Multiply by" value={b} options={[-2, -3, -4, -5].map((v) => ({ value: v, text: num(v) }))} onChange={setB} />
      <table style={{ borderCollapse: "collapse", fontSize: "1.25rem", fontVariantNumeric: "tabular-nums" }}>
        <tbody>
          {rows.map((a) => (
            <tr key={a} style={{ background: a < 0 ? "var(--accent-soft, transparent)" : undefined }}>
              <td style={{ padding: "2px 10px", textAlign: "right" }}>{num(a)}</td>
              <td>× {br(b)}</td>
              <td style={{ padding: "2px 10px" }}>=</td>
              <td style={{ textAlign: "right", fontWeight: a < 0 ? 700 : 400 }}>{num(a * b)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Readout>
        <p>
          3 × {br(b)} = {num(3 * b)}, and the answers go up by {-b} each row: 0 × {br(b)} = 0, then −1 × {br(b)} = <strong>{-b}</strong>. A negative times a negative is positive.
        </p>
      </Readout>
    </>
  );
}

// ------------------------------------------------------------ squares and cubes

function SquareCubeBuilder() {
  const [mode, setMode] = useState<"square" | "cube">("square");
  const [n, setN] = useState(4);
  const max = mode === "square" ? 12 : 6;
  const size = Math.min(n, max);
  const cell = mode === "square" ? Math.min(22, Math.floor(260 / size)) : Math.max(6, Math.min(14, Math.floor(70 / size)));
  return (
    <>
      <p>Change the side length. Count the small squares (or cubes) and see why we say squared and cubed.</p>
      <div className="row" role="group" aria-label="Square or cube">
        <button type="button" className="btn btn-small" aria-pressed={mode === "square"} onClick={() => setMode("square")}>
          Square
        </button>
        <button type="button" className="btn btn-small" aria-pressed={mode === "cube"} onClick={() => { setMode("cube"); setN(Math.min(n, 6)); }}>
          Cube
        </button>
      </div>
      <Slider label="Side length" value={size} min={1} max={max} onChange={setN} />
      {mode === "square" ? (
        <svg viewBox={`0 0 ${size * cell + 2} ${size * cell + 2}`} width={size * cell + 2} style={{ maxWidth: "100%" }} aria-hidden="true">
          {Array.from({ length: size * size }, (_, i) => (
            <rect key={i} x={1 + (i % size) * cell} y={1 + Math.floor(i / size) * cell} width={cell} height={cell} fill="var(--accent-soft, var(--surface))" stroke="var(--line)" />
          ))}
          <rect x={1} y={1} width={size * cell} height={size * cell} fill="none" stroke="var(--ink)" strokeWidth={2} />
        </svg>
      ) : (
        <div className="row" aria-hidden="true" style={{ flexWrap: "wrap", gap: 8 }}>
          {Array.from({ length: size }, (_, layer) => (
            <svg key={layer} viewBox={`0 0 ${size * cell + 2} ${size * cell + 2}`} width={size * cell + 2}>
              {Array.from({ length: size * size }, (_, i) => (
                <rect key={i} x={1 + (i % size) * cell} y={1 + Math.floor(i / size) * cell} width={cell} height={cell} fill="var(--accent-soft, var(--surface))" stroke="var(--line)" />
              ))}
              <rect x={1} y={1} width={size * cell} height={size * cell} fill="none" stroke="var(--ink)" strokeWidth={1.5} />
            </svg>
          ))}
        </div>
      )}
      <Readout>
        {mode === "square" ? (
          <p>
            A {size} by {size} square has {size} rows of {size}: <strong>{size}² = {size} × {size} = {size * size}</strong>. Going backwards, √{size * size} = {size}.
          </p>
        ) : (
          <p>
            A {size} by {size} by {size} cube is {size} layers, each with {size} × {size} = {size * size} cubes: <strong>{size}³ = {size} × {size} × {size} = {size ** 3}</strong>. Going backwards, ∛{size ** 3} = {size}.
          </p>
        )}
      </Readout>
    </>
  );
}

// ------------------------------------------------------------ BIDMAS steps

type Step = { work: string; why: string; now: string };
const BIDMAS: { expr: string; steps: Step[]; trap?: string }[] = [
  {
    expr: "3 + 4 × 2",
    steps: [
      { work: "4 × 2 = 8", why: "Multiplication comes before addition.", now: "3 + 8" },
      { work: "3 + 8 = 11", why: "Only addition is left.", now: "11" },
    ],
    trap: "Left to right would give 7 × 2 = 14, which is wrong.",
  },
  {
    expr: "(3 + 4) × 2",
    steps: [
      { work: "3 + 4 = 7", why: "Brackets come first.", now: "7 × 2" },
      { work: "7 × 2 = 14", why: "Only multiplication is left.", now: "14" },
    ],
  },
  {
    expr: "10 − 3 + 2",
    steps: [
      { work: "10 − 3 = 7", why: "Subtraction and addition are equal partners, so go left to right.", now: "7 + 2" },
      { work: "7 + 2 = 9", why: "Only addition is left.", now: "9" },
    ],
    trap: "Adding first would give 10 − 5 = 5, which is wrong.",
  },
  {
    expr: "20 − 6 ÷ 2 + 1",
    steps: [
      { work: "6 ÷ 2 = 3", why: "Division comes before subtraction and addition.", now: "20 − 3 + 1" },
      { work: "20 − 3 = 17", why: "Subtraction and addition are equal partners: left to right.", now: "17 + 1" },
      { work: "17 + 1 = 18", why: "Only addition is left.", now: "18" },
    ],
  },
  {
    expr: "2 × 3²",
    steps: [
      { work: "3² = 9", why: "Indices (powers) come before multiplication. The ² belongs only to the 3.", now: "2 × 9" },
      { work: "2 × 9 = 18", why: "Only multiplication is left.", now: "18" },
    ],
    trap: "(2 × 3)² would be 36. That's a different calculation.",
  },
  {
    expr: "12 ÷ 3 × 2",
    steps: [
      { work: "12 ÷ 3 = 4", why: "Division and multiplication are equal partners, so go left to right.", now: "4 × 2" },
      { work: "4 × 2 = 8", why: "Only multiplication is left.", now: "8" },
    ],
    trap: "Multiplying first would give 12 ÷ 6 = 2, which is wrong.",
  },
  {
    expr: "5 + 2 × (7 − 3)²",
    steps: [
      { work: "7 − 3 = 4", why: "Brackets first.", now: "5 + 2 × 4²" },
      { work: "4² = 16", why: "Then indices.", now: "5 + 2 × 16" },
      { work: "2 × 16 = 32", why: "Then multiplication.", now: "5 + 32" },
      { work: "5 + 32 = 37", why: "Addition last.", now: "37" },
    ],
  },
  {
    expr: "10 − 2 × (−3)",
    steps: [
      { work: "2 × (−3) = −6", why: "Multiplication before subtraction. Different signs give a negative.", now: "10 − (−6)" },
      { work: "10 − (−6) = 16", why: "Subtracting a negative is adding: 10 + 6.", now: "16" },
    ],
  },
];

function BidmasSteps() {
  const [which, setWhich] = useState(0);
  const [done, setDone] = useState(0);
  const e = BIDMAS[which];
  const current = done === 0 ? e.expr : e.steps[done - 1].now;
  const finished = done === e.steps.length;
  return (
    <>
      <p>Pick a calculation, then press Next step. Each step says which operation goes next and why.</p>
      <Choice
        label="Calculation"
        value={which}
        options={BIDMAS.map((b, i) => ({ value: i, text: b.expr }))}
        onChange={(v) => {
          setWhich(v);
          setDone(0);
        }}
      />
      <p style={big}>
        <MathText text={current} />
      </p>
      <ol>
        {e.steps.slice(0, done).map((s, i) => (
          <li key={i}>
            <strong>{s.work}</strong>. {s.why}
          </li>
        ))}
      </ol>
      <div className="row">
        <button type="button" className="btn btn-primary" onClick={() => setDone(done + 1)} disabled={finished}>
          Next step
        </button>
        <button type="button" className="btn" onClick={() => setDone(0)} disabled={done === 0}>
          Start again
        </button>
      </div>
      <Readout>
        {done === 0 ? (
          <p>{e.expr}. What comes first? Press Next step.</p>
        ) : (
          <p>
            {e.steps[done - 1].work}. {e.steps[done - 1].why} {finished ? `So ${e.expr} = ${current}. ${e.trap ?? ""}` : `Now it is ${current}.`}
          </p>
        )}
      </Readout>
    </>
  );
}

// ------------------------------------------------------------ index laws

function Factors({ base, count, cancelled = 0 }: { base: number; count: number; cancelled?: number }) {
  return (
    <span style={{ fontVariantNumeric: "tabular-nums" }}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i}>
          {i > 0 && " × "}
          <span style={i < cancelled ? { textDecoration: "line-through", color: "var(--muted)" } : undefined}>{base}</span>
        </span>
      ))}
    </span>
  );
}

function IndexExpand() {
  const [law, setLaw] = useState<"multiply" | "divide" | "power">("multiply");
  const [base, setBase] = useState(2);
  const [m, setM] = useState(4);
  const [n, setN] = useState(2);
  const nn = law === "divide" ? Math.min(n, m) : law === "power" ? Math.min(n, 4) : n;
  const B = (p: number) => `${base}${sup(p)}`;
  let lhs = "";
  let result = 0;
  let words = "";
  if (law === "multiply") {
    result = m + nn;
    lhs = `${B(m)} × ${B(nn)}`;
    words = `${m} ${base}s times ${nn} ${base}s is ${result} ${base}s altogether. Add the powers: ${m} + ${nn} = ${result}.`;
  } else if (law === "divide") {
    result = m - nn;
    lhs = `${B(m)} ÷ ${B(nn)}`;
    words = `${nn} ${base}${nn === 1 ? "" : "s"} on the bottom cancel${nn === 1 ? "s" : ""} with ${nn} on top, leaving ${result}. Subtract the powers: ${m} − ${nn} = ${result}.${result === 0 ? ` Everything cancels, which leaves 1, so ${base}⁰ = 1.` : ""}`;
  } else {
    result = m * nn;
    lhs = `(${B(m)})${sup(nn)}`;
    words = `${nn} lots of ${B(m)} is ${nn} × ${m} = ${result} ${base}s. Multiply the powers.`;
  }
  return (
    <>
      <p>Choose a law and some powers. The powers are written out in full, so you can count the {base}s yourself.</p>
      <div className="grid-2">
        <Choice
          label="Law"
          value={law}
          options={[
            { value: "multiply", text: "Multiplying powers" },
            { value: "divide", text: "Dividing powers" },
            { value: "power", text: "A power of a power" },
          ]}
          onChange={setLaw}
        />
        <Choice label="Base" value={base} options={[2, 3, 5, 10].map((b) => ({ value: b, text: String(b) }))} onChange={setBase} />
        <Slider label="First power" value={m} min={1} max={6} onChange={setM} />
        <Slider label={law === "power" ? "Outer power" : "Second power"} value={nn} min={1} max={law === "divide" ? m : law === "power" ? 4 : 6} onChange={setN} />
      </div>
      <p style={big}>{lhs}</p>
      <div style={{ fontSize: "1.2rem", lineHeight: 1.8 }}>
        {law === "multiply" && (
          <p>
            = (<Factors base={base} count={m} />) × (<Factors base={base} count={nn} />)
          </p>
        )}
        {law === "divide" && (
          <p>
            = (<Factors base={base} count={m} cancelled={nn} />) ÷ (<Factors base={base} count={nn} cancelled={nn} />)
          </p>
        )}
        {law === "power" && (
          <p>
            = {Array.from({ length: nn }, (_, i) => (
              <span key={i}>
                {i > 0 && " × "}({<Factors base={base} count={m} />})
              </span>
            ))}
          </p>
        )}
        <p>
          = <strong>{B(result)}</strong>
          {result === 0 && " = 1"}
        </p>
      </div>
      <Readout>
        <p>{words}</p>
      </Readout>
    </>
  );
}

// ------------------------------------------------------------ standard form

const MANTISSAS = ["3.4", "5.6", "1.5", "8.3", "4.7", "7.05"];

function StandardFormSlider() {
  const [mText, setMText] = useState("3.4");
  const [p, setP] = useState(4);
  const places = mText.includes(".") ? mText.split(".")[1].length : 0;
  const m = dec(Number(mText.replace(".", "")), places);
  const v = sfValue(m, p);
  const ordinary = commas(showDec(v));
  const sf = showStandardForm(m, p);
  return (
    <>
      <p>Choose the first number, then change the power of 10. See how many places the digits move, and which way.</p>
      <div className="grid-2">
        <Choice label="First number" value={mText} options={MANTISSAS.map((x) => ({ value: x, text: x }))} onChange={setMText} />
        <Slider label="Power of 10" value={p} min={-6} max={8} shown={num(p)} onChange={setP} />
      </div>
      <p style={big}>
        {sf} = <strong>{ordinary}</strong>
      </p>
      <Readout>
        <p>
          {p === 0
            ? `10⁰ = 1, so ${mText} stays as it is.`
            : p > 0
              ? `A power of ${p} moves the digits ${p} place${p === 1 ? "" : "s"} bigger: ${mText} becomes ${ordinary}.`
              : `A power of ${num(p)} moves the digits ${-p} place${p === -1 ? "" : "s"} smaller: ${mText} becomes ${ordinary}. Negative powers are for numbers less than 1.`}
          {p > 0 && Number.isInteger(v.n / v.d) && v.n / v.d >= 1000 && ` Count places, not zeros: ${ordinary} has ${(String(v.n).match(/0+$/)?.[0].length ?? 0)} zeros on the end, but the power is ${p}.`}
        </p>
      </Readout>
    </>
  );
}

export const POWERS_DEMOS = {
  "number-line-negatives": NumberLineNegatives,
  "square-cube-builder": SquareCubeBuilder,
  "bidmas-steps": BidmasSteps,
  "index-expand": IndexExpand,
  "standard-form-slider": StandardFormSlider,
};
