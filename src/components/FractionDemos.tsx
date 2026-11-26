"use client";

/**
 * Interactive demonstrations for the fractions chain. Each one lets the
 * student change something and see what stays the same, before they are
 * asked any questions. All are keyboard operable and describe their state
 * in words for screen readers.
 */

import { useId, useState } from "react";
import { frac, gcd, lcm, show, simplify, type Fraction } from "@/engine/fraction";
import { MathText } from "./MathText";

export function FractionBar({ f, label, width = 480 }: { f: Fraction; label?: string; width?: number }) {
  const h = 44;
  const seg = width / f.d;
  return (
    <svg viewBox={`0 0 ${width + 2} ${h + 2}`} width="100%" style={{ maxWidth: width + 2 }} role="img" aria-label={label ?? `${f.n} out of ${f.d} equal parts shaded`}>
      {Array.from({ length: f.d }, (_, i) => (
        <rect
          key={i}
          x={1 + i * seg}
          y={1}
          width={seg}
          height={h}
          fill={i < f.n ? "var(--accent)" : "var(--surface)"}
          stroke="var(--ink)"
          strokeWidth={1.5}
        />
      ))}
    </svg>
  );
}

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

function EquivalentBars() {
  const [k, setK] = useState(1);
  const base = frac(2, 3);
  const big = frac(base.n * k, base.d * k);
  return (
    <>
      <p>Cut every piece into more pieces. Watch the shaded amount.</p>
      <FractionBar f={base} />
      <FractionBar f={big} />
      <Slider label="Cut each piece into" value={k} min={1} max={6} onChange={setK} />
      <Readout>
        <MathText text={`${show(base)} = ${big.n}/${big.d}`} /> — the top and bottom were both multiplied by {k}. The shaded amount
        didn&apos;t change.
      </Readout>
    </>
  );
}

function SimplifyBars() {
  const big = frac(12, 18);
  const factors = [1, 2, 3, 6];
  const [k, setK] = useState(1);
  const f = frac(big.n / k, big.d / k);
  return (
    <>
      <p>Group the pieces. Choose a number that divides both 12 and 18.</p>
      <FractionBar f={f} />
      <div className="choice-row" role="group" aria-label="Divide top and bottom by">
        {factors.map((x) => (
          <button key={x} type="button" className="choice" aria-pressed={k === x} onClick={() => setK(x)}>
            ÷ {x}
          </button>
        ))}
      </div>
      <Readout>
        <MathText text={`12/18 = ${show(f)}`} />
        {gcd(f.n, f.d) === 1 ? ". This is the simplest form: nothing else divides both." : ". You could still divide again."}
      </Readout>
    </>
  );
}

function CommonDenominatorBars() {
  const [d1, setD1] = useState(4);
  const [d2, setD2] = useState(6);
  const L = lcm(d1, d2);
  return (
    <>
      <p>Choose two denominators. The bars are cut into the smallest pieces that fit both.</p>
      <div className="grid-2">
        <Slider label="First denominator" value={d1} min={2} max={10} onChange={setD1} />
        <Slider label="Second denominator" value={d2} min={2} max={10} onChange={setD2} />
      </div>
      <FractionBar f={frac(1, d1)} label={`1 out of ${d1}`} />
      <FractionBar f={frac(L / d1, L)} label={`${L / d1} out of ${L}`} />
      <FractionBar f={frac(1, d2)} label={`1 out of ${d2}`} />
      <FractionBar f={frac(L / d2, L)} label={`${L / d2} out of ${L}`} />
      <Readout>
        Lowest common denominator: <strong>{L}</strong>. <MathText text={`1/${d1} = ${L / d1}/${L}`} /> and{" "}
        <MathText text={`1/${d2} = ${L / d2}/${L}`} />.{d1 * d2 !== L ? ` (${d1} × ${d2} = ${d1 * d2} also works, but ${L} is lower.)` : ""}
      </Readout>
    </>
  );
}

function AddBars() {
  const [a, setA] = useState(1);
  const [c, setC] = useState(1);
  const x = frac(a, 3);
  const y = frac(c, 4);
  const total = frac(a * 4 + c * 3, 12);
  return (
    <>
      <p>Thirds and quarters are different sizes, so cut both into twelfths first.</p>
      <div className="grid-2">
        <Slider label="Thirds" value={a} min={1} max={2} onChange={setA} />
        <Slider label="Quarters" value={c} min={1} max={3} onChange={setC} />
      </div>
      <FractionBar f={x} />
      <FractionBar f={y} />
      <FractionBar f={frac(Math.min(total.n, 12), 12)} label={`${total.n} twelfths shaded`} />
      <Readout>
        <MathText text={`${show(x)} + ${show(y)} = ${a * 4}/12 + ${c * 3}/12 = ${total.n}/12`} />
        {total.n > 12 ? " (more than one whole)" : ""}
        {gcd(total.n, 12) > 1 ? <> = <MathText text={show(simplify(total))} /></> : null}
      </Readout>
    </>
  );
}

function AmountBar() {
  const N = 40;
  const [d, setD] = useState(5);
  const [n, setN] = useState(3);
  const nn = Math.min(n, d);
  const valid = N % d === 0;
  return (
    <>
      <p>Split 40 sweets into equal groups, then take some groups.</p>
      <div className="grid-2">
        <Slider label="Number of groups (denominator)" value={d} min={2} max={10} onChange={setD} />
        <Slider label="Groups you take (numerator)" value={nn} min={1} max={d} onChange={setN} />
      </div>
      <FractionBar f={frac(nn, d)} />
      <Readout>
        {valid ? (
          <>
            40 ÷ {d} = {N / d} in each group. <MathText text={`${nn}/${d}`} /> of 40 = {N / d} × {nn} = <strong>{(N / d) * nn}</strong>.
          </>
        ) : (
          <>40 doesn&apos;t split equally into {d} groups. Try 2, 4, 5, 8 or 10.</>
        )}
      </Readout>
    </>
  );
}

function MultiplyGrid() {
  const [a, setA] = useState(2);
  const [c, setC] = useState(3);
  const A = frac(a, 3);
  const C = frac(c, 4);
  const cell = 40;
  return (
    <>
      <p>
        Multiplying finds a fraction <em>of</em> a fraction. Shade <MathText text={`${a}/3`} /> one way and <MathText text={`${c}/4`} /> the
        other. The overlap is the answer.
      </p>
      <div className="grid-2">
        <Slider label="Thirds (rows)" value={a} min={1} max={3} onChange={setA} />
        <Slider label="Quarters (columns)" value={c} min={1} max={4} onChange={setC} />
      </div>
      <svg viewBox={`0 0 ${4 * cell + 2} ${3 * cell + 2}`} width="100%" style={{ maxWidth: 4 * cell + 2 }} role="img" aria-label={`${a * c} of 12 squares in the overlap`}>
        {Array.from({ length: 3 }, (_, r) =>
          Array.from({ length: 4 }, (_, k) => {
            const inRow = r < a;
            const inCol = k < c;
            return (
              <rect
                key={`${r}-${k}`}
                x={1 + k * cell}
                y={1 + r * cell}
                width={cell}
                height={cell}
                fill={inRow && inCol ? "var(--accent)" : inRow || inCol ? "var(--accent-soft)" : "var(--surface)"}
                stroke="var(--ink)"
                strokeWidth={1.5}
              />
            );
          }),
        )}
      </svg>
      <Readout>
        <MathText text={`${show(A)} × ${show(C)} = ${a * c}/12`} />
        {gcd(a * c, 12) > 1 ? <> = <MathText text={show(simplify(frac(a * c, 12)))} /></> : null}. The dark squares are the overlap.
      </Readout>
    </>
  );
}

const DEMOS = {
  "equivalent-bars": EquivalentBars,
  "simplify-bars": SimplifyBars,
  "common-denominator-bars": CommonDenominatorBars,
  "add-bars": AddBars,
  "amount-bar": AmountBar,
  "multiply-grid": MultiplyGrid,
};

export function Demo({ kind }: { kind: keyof typeof DEMOS }) {
  const C = DEMOS[kind];
  return (
    <section className="demo" aria-label="Try it">
      <p className="eyebrow">Try it</p>
      <C />
    </section>
  );
}
