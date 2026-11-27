"use client";

/**
 * Interactive demonstrations for the factors and primes chain, and for the
 * "percentage of another" and "percentage change" lessons. Each lets the
 * student change one thing and see what happens. Keyboard operable; every
 * state is also described in words (aria-live), and nothing animates.
 */

import { useId, useState } from "react";
import { frac, mul, type Fraction } from "@/engine/fraction";
import { factorPairs, factorsOf, fullForm, hcf, indexForm, isPrime, lcmOf, primeFactors } from "@/engine/primes";
import { showDec, showMoney, terminates } from "@/content/maths/decimals/dec";
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

// ------------------------------------------------------------ factor rectangles

/** Every way to arrange n squares in a rectangle. Each rectangle is a factor pair. */
function FactorRectangles() {
  const [n, setN] = useState(12);
  const pairs = factorPairs(n);
  const fs = factorsOf(n);
  const cell = Math.max(4, Math.min(14, Math.floor(150 / Math.max(...pairs.map(([, b]) => b)))));
  const gap = 18;
  // Lay out rectangles left to right, wrapping.
  let x = 0;
  let y = 0;
  let rowH = 0;
  const maxW = 400;
  const placed = pairs.map(([a, b]) => {
    const w = b * cell;
    const h = a * cell;
    if (x > 0 && x + w > maxW) {
      x = 0;
      y += rowH + gap + 14;
      rowH = 0;
    }
    const pos = { a, b, x, y, w, h };
    x += w + gap;
    rowH = Math.max(rowH, h);
    return pos;
  });
  const height = y + rowH + 20;
  const kind = n === 1 ? "special" : isPrime(n) ? "prime" : "composite";
  return (
    <>
      <p>Arrange {n} squares into rectangles. Each rectangle you can make is a factor pair. A prime number only makes one rectangle: a single line.</p>
      <Slider label="Number of squares" value={n} min={1} max={48} onChange={setN} />
      <svg viewBox={`0 0 ${maxW + 10} ${height + 6}`} width="100%" style={{ maxWidth: 560 }} aria-hidden="true">
        {placed.map((p) => (
          <g key={`${p.a}x${p.b}`} transform={`translate(${p.x + 4},${p.y + 4})`}>
            {Array.from({ length: p.a * p.b }, (_, i) => (
              <rect key={i} x={(i % p.b) * cell} y={Math.floor(i / p.b) * cell} width={cell} height={cell} fill="var(--accent-soft)" stroke="var(--ink)" strokeWidth={1} />
            ))}
            <text x={0} y={p.h + 14} fontSize={12} fill="var(--muted)">
              {p.a} × {p.b}
            </text>
          </g>
        ))}
      </svg>
      <Readout>
        <p>
          Factor pairs of {n}: {pairs.map(([a, b]) => `${a} × ${b}`).join(", ")}.
        </p>
        <p>
          The factors of {n} are <strong>{fs.join(", ")}</strong>. That&apos;s {fs.length} factor{fs.length === 1 ? "" : "s"}.{" "}
          {kind === "prime" ? <strong>{n} is prime: exactly two factors.</strong> : kind === "special" ? <strong>1 has only one factor, so it isn&apos;t prime.</strong> : `${n} isn't prime: it has more than two factors.`}
        </p>
        <p className="small muted">
          Multiples of {n}: {[1, 2, 3, 4, 5].map((k) => k * n).join(", ")} and so on.
        </p>
      </Readout>
    </>
  );
}

// ------------------------------------------------------------ factor tree

type TreeNode = { v: number; kids?: [TreeNode, TreeNode] };

/** Split n: first by the chosen pair, then each composite by its smallest prime. */
function buildTree(n: number, first?: [number, number]): TreeNode {
  if (isPrime(n)) return { v: n };
  const [a, b] = first ?? [primeFactors(n)[0], n / primeFactors(n)[0]];
  return { v: n, kids: [buildTree(a), buildTree(b)] };
}

function leaves(t: TreeNode): number {
  return t.kids ? leaves(t.kids[0]) + leaves(t.kids[1]) : 1;
}

function depth(t: TreeNode): number {
  return t.kids ? 1 + Math.max(depth(t.kids[0]), depth(t.kids[1])) : 1;
}

const TREE_NUMBERS = [24, 36, 60, 72, 84, 90, 100, 120, 126, 180];

function FactorTree() {
  const [n, setN] = useState(60);
  const pairs = factorPairs(n).filter(([a]) => a > 1);
  const [pairIdx, setPairIdx] = useState(1);
  const idx = Math.min(pairIdx, pairs.length - 1);
  const tree = buildTree(n, pairs[idx]);
  const colW = 52;
  const rowH = 58;
  const width = leaves(tree) * colW;
  const height = depth(tree) * rowH;
  const nodes: React.ReactNode[] = [];
  const draw = (t: TreeNode, left: number, level: number): number => {
    const w = leaves(t) * colW;
    const cx = left + w / 2;
    const cy = level * rowH + 24;
    if (t.kids) {
      const lw = leaves(t.kids[0]) * colW;
      const c1 = draw(t.kids[0], left, level + 1);
      const c2 = draw(t.kids[1], left + lw, level + 1);
      nodes.push(<line key={`l${left}-${level}-a`} x1={cx} y1={cy + 12} x2={c1} y2={cy + rowH - 14} stroke="var(--ink)" strokeWidth={1.5} />);
      nodes.push(<line key={`l${left}-${level}-b`} x1={cx} y1={cy + 12} x2={c2} y2={cy + rowH - 14} stroke="var(--ink)" strokeWidth={1.5} />);
    }
    const prime = !t.kids;
    nodes.push(
      <g key={`n${left}-${level}`}>
        {prime && <circle cx={cx} cy={cy} r={17} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2.5} />}
        <text x={cx} y={cy + 6} textAnchor="middle" fontSize={18} fontWeight={prime ? 700 : 400} fill="var(--ink)">
          {t.v}
        </text>
      </g>,
    );
    return cx;
  };
  draw(tree, 0, 0);
  return (
    <>
      <p>Pick a number and how to split it first. The tree keeps splitting until every branch ends in a circled prime. Try different first splits: the primes at the end are always the same.</p>
      <div className="grid-2">
        <Choice
          label="Number"
          value={n}
          options={TREE_NUMBERS.map((x) => ({ value: x, text: String(x) }))}
          onChange={(v) => {
            setN(v);
            setPairIdx(1);
          }}
        />
        <Choice label="First split" value={idx} options={pairs.map(([a, b], i) => ({ value: i, text: `${a} × ${b}` }))} onChange={setPairIdx} />
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ maxWidth: Math.min(560, width * 1.4) }} aria-hidden="true">
        {nodes}
      </svg>
      <Readout>
        <p>
          The circled primes are {primeFactors(n).join(", ")}.
        </p>
        <p>
          {n} = {fullForm(n)} = <strong>{indexForm(n)}</strong>
        </p>
      </Readout>
    </>
  );
}

// ------------------------------------------------------------ prime factor Venn diagram

const VENN_NUMBERS = [12, 18, 20, 24, 30, 36, 40, 42, 45, 48, 60, 72, 84, 90];

function multisetSplit(a: number, b: number) {
  const pa = primeFactors(a);
  const pb = [...primeFactors(b)];
  const both: number[] = [];
  const onlyA: number[] = [];
  for (const p of pa) {
    const i = pb.indexOf(p);
    if (i >= 0) {
      both.push(p);
      pb.splice(i, 1);
    } else onlyA.push(p);
  }
  return { onlyA, both, onlyB: pb };
}

function PrimeVenn() {
  const [a, setA] = useState(12);
  const [b, setB] = useState(18);
  const { onlyA, both, onlyB } = multisetSplit(a, b);
  const prod = (xs: number[]) => (xs.length ? xs.join(" × ") : "1");
  const place = (xs: number[], cx: number) =>
    xs.map((p, i) => (
      <text key={`${cx}-${i}`} x={cx + (i % 2 === 0 ? -12 : 12) * (xs.length > 1 ? 1 : 0)} y={78 + Math.floor(i / 2) * 26 - (Math.ceil(xs.length / 2) - 1) * 13} textAnchor="middle" fontSize={20} fill="var(--ink)">
        {p}
      </text>
    ));
  return (
    <>
      <p>Write both numbers as products of primes. Shared primes go in the middle. The HCF is the middle multiplied together; the LCM is everything multiplied together.</p>
      <div className="grid-2">
        <Choice label="First number" value={a} options={VENN_NUMBERS.map((x) => ({ value: x, text: String(x) }))} onChange={setA} />
        <Choice label="Second number" value={b} options={VENN_NUMBERS.map((x) => ({ value: x, text: String(x) }))} onChange={setB} />
      </div>
      <svg viewBox="0 0 320 160" width="100%" style={{ maxWidth: 480 }} aria-hidden="true">
        <circle cx={120} cy={80} r={70} fill="var(--accent-soft)" fillOpacity={0.5} stroke="var(--ink)" strokeWidth={1.5} />
        <circle cx={200} cy={80} r={70} fill="var(--accent-soft)" fillOpacity={0.5} stroke="var(--ink)" strokeWidth={1.5} />
        <text x={70} y={18} fontSize={14} fill="var(--muted)">
          {a}
        </text>
        <text x={240} y={18} fontSize={14} fill="var(--muted)">
          {b}
        </text>
        {place(onlyA, 85)}
        {place(both, 160)}
        {place(onlyB, 235)}
      </svg>
      <Readout>
        <p>
          {a} = {fullForm(a)} and {b} = {fullForm(b)}
        </p>
        <p>
          HCF = middle = {prod(both)} = <strong>{hcf(a, b)}</strong>
        </p>
        <p>
          LCM = everything = {prod([...onlyA, ...both, ...onlyB].sort((x, y) => x - y))} = <strong>{lcmOf(a, b)}</strong>
        </p>
      </Readout>
    </>
  );
}

// ------------------------------------------------------------ one amount as a percentage of another

const WHOLES = [20, 25, 40, 50, 8, 80, 200];

function PercentOfWhole() {
  const [whole, setWhole] = useState(25);
  const [part, setPart] = useState(18);
  const pt = Math.min(part, whole);
  const p = mul(frac(pt, whole), frac(100));
  const scale = 100 % whole === 0 ? 100 / whole : null;
  const pctShown = terminates(p) ? showDec(p) : (p.n / p.d).toFixed(1);
  return (
    <>
      <p>The bar is the total. Move the slider to shade the part, and see the fraction turn into a percentage.</p>
      <div className="grid-2">
        <Choice
          label="Total"
          value={whole}
          options={WHOLES.map((x) => ({ value: x, text: String(x) }))}
          onChange={(v) => {
            setWhole(v);
            setPart(Math.round(v * 0.7));
          }}
        />
        <Slider label="Part" value={pt} min={0} max={whole} step={whole >= 80 ? 2 : 1} onChange={setPart} />
      </div>
      <svg viewBox="0 0 420 60" width="100%" style={{ maxWidth: 560 }} aria-hidden="true">
        <rect x={10} y={10} width={(400 * pt) / whole} height={30} fill="var(--accent)" />
        <rect x={10} y={10} width={400} height={30} fill="none" stroke="var(--ink)" strokeWidth={1.5} />
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={10 + (i + 1) * 40} x2={10 + (i + 1) * 40} y1={36} y2={44} stroke="var(--muted)" />
        ))}
        <text x={10} y={56} fontSize={11} fill="var(--muted)">0%</text>
        <text x={410} y={56} fontSize={11} fill="var(--muted)" textAnchor="end">100%</text>
      </svg>
      <Readout>
        <p>
          {pt} out of {whole} = <MathText text={`${pt}/${whole}`} />
          {scale ? (
            <>
              {" "}= <MathText text={`${pt * scale}/100`} /> (× {scale} top and bottom)
            </>
          ) : (
            <> = {pt} ÷ {whole} = {terminates(frac(pt, whole)) ? showDec(frac(pt, whole)) : (pt / whole).toFixed(3) + "..."}</>
          )}
        </p>
        <p>
          So {pt} is <strong>{pctShown}%</strong> of {whole}.
        </p>
      </Readout>
    </>
  );
}

// ------------------------------------------------------------ finding a percentage change

function PercentChangeFind() {
  const [original, setOriginal] = useState(40);
  const [steps, setSteps] = useState(125); // new value as a % of the original, in 5% steps
  const nextF: Fraction = mul(frac(original), frac(steps, 100));
  const changePct = steps - 100;
  const changeF: Fraction = mul(frac(original), frac(Math.abs(changePct), 100));
  const maxPct = 160;
  const w = (pct: number) => (380 * pct) / maxPct;
  return (
    <>
      <p>The top bar is the original price, 100%. Move the slider to change the new price, and see how the percentage change is worked out.</p>
      <div className="grid-2">
        <Choice label="Original price" value={original} options={[40, 80, 60, 200, 120].map((x) => ({ value: x, text: `£${x}` }))} onChange={setOriginal} />
        <Slider label="New price" value={steps} min={50} max={150} step={5} shown={showMoney(nextF)} onChange={setSteps} />
      </div>
      <svg viewBox="0 0 420 110" width="100%" style={{ maxWidth: 560 }} aria-hidden="true">
        <text x={10} y={16} fontSize={12} fill="var(--muted)">Original: £{original} (100%)</text>
        <rect x={10} y={22} width={w(100)} height={26} fill="var(--accent-soft)" stroke="var(--ink)" strokeWidth={1.5} />
        <text x={10} y={70} fontSize={12} fill="var(--muted)">New: {showMoney(nextF)} ({steps}%)</text>
        <rect x={10} y={76} width={w(steps)} height={26} fill="var(--accent)" stroke="var(--ink)" strokeWidth={1.5} />
        <line x1={10 + w(100)} x2={10 + w(100)} y1={18} y2={106} stroke="var(--muted)" strokeDasharray="3 3" />
      </svg>
      <Readout>
        {changePct === 0 ? (
          <p>No change: the new price is the same as the original.</p>
        ) : (
          <>
            <p>
              {changePct > 0 ? "Increase" : "Decrease"} = {changePct > 0 ? `${showMoney(nextF)} − £${original}` : `£${original} − ${showMoney(nextF)}`} = {showMoney(changeF)}
            </p>
            <p>
              Divide by the original: {showDec(changeF)} ÷ {original} × 100 = <strong>{Math.abs(changePct)}% {changePct > 0 ? "increase" : "decrease"}</strong>
            </p>
          </>
        )}
      </Readout>
    </>
  );
}

export const FACTOR_DEMOS = {
  "factor-rectangles": FactorRectangles,
  "factor-tree": FactorTree,
  "prime-venn": PrimeVenn,
  "percent-of-whole": PercentOfWhole,
  "percent-change-find": PercentChangeFind,
};
