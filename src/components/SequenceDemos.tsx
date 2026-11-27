"use client";

/**
 * Interactive demonstrations for sequences: a growing matchstick pattern,
 * dot patterns for special sequences, an nth-term builder and an explorer for
 * Fibonacci-type, geometric and quadratic sequences. Keyboard operable; every
 * state is also described in words.
 */

import { useId, useState } from "react";
import { nthTerm } from "@/content/maths/sequences/generators";

const num = (n: number) => (n < 0 ? `−${-n}` : String(n));

function Slider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}: <strong>{num(value)}</strong>
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

function Row({ head, cells, highlight }: { head: string; cells: (string | number)[]; highlight?: number }) {
  return (
    <tr>
      <th scope="row">{head}</th>
      {cells.map((c, i) => (
        <td key={i} style={i === highlight ? { background: "var(--accent-soft)", fontWeight: 700 } : undefined}>
          {typeof c === "number" ? num(c) : c}
        </td>
      ))}
    </tr>
  );
}

// ---------------------------------------------------------------- matchstick squares

function SequenceBuilder() {
  const [n, setN] = useState(3);
  const sticks = (k: number) => 3 * k + 1;
  const W = 40;
  const pad = 10;
  const width = n * W + 2 * pad;
  const lines: [number, number, number, number][] = [];
  for (let i = 0; i < n; i++) {
    const x = pad + i * W;
    lines.push([x, pad, x + W, pad], [x, pad + W, x + W, pad + W], [x + W, pad, x + W, pad + W]);
  }
  lines.push([pad, pad, pad, pad + W]);
  return (
    <>
      <p>Each new square adds 3 matchsticks (shown in colour) to the end of the row. Make the pattern longer and watch the numbers.</p>
      <Slider label="Pattern number" value={n} min={1} max={8} onChange={setN} />
      <svg viewBox={`0 0 ${width} ${W + 2 * pad}`} width="100%" style={{ maxWidth: Math.min(420, width * 1.4) }} role="img" aria-label={`Pattern ${n}: a row of ${n} squares made from ${sticks(n)} matchsticks.`} className="shape-diagram">
        {lines.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={n > 1 && i >= (n - 1) * 3 && i < n * 3 ? "var(--accent)" : "var(--ink)"} strokeWidth={4} strokeLinecap="round" />
        ))}
      </svg>
      <div className="prob-table-wrap">
        <table className="prob-table">
          <caption className="sr-only">Matchsticks in each pattern</caption>
          <thead>
            <tr>
              <th scope="col" className="prob-corner">Pattern</th>
              {Array.from({ length: 8 }, (_, i) => (
                <th key={i} scope="col">
                  {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Row head="Matchsticks" cells={Array.from({ length: 8 }, (_, i) => (i < n ? sticks(i + 1) : ""))} highlight={n - 1} />
          </tbody>
        </table>
      </div>
      <Readout>
        Pattern {n} uses <strong>{sticks(n)}</strong> matchsticks. Term-to-term rule: start at 4 and add 3. Position-to-term rule: 3n + 1, so pattern {n} is 3 × {n} + 1 = {sticks(n)}, and pattern 100 would be 301.
      </Readout>
    </>
  );
}

// ---------------------------------------------------------------- dot patterns

type Special = "square" | "triangular" | "cube";

function SpecialSequencesDots() {
  const [kind, setKind] = useState<Special>("triangular");
  const [n, setN] = useState(4);
  const value = kind === "square" ? n * n : kind === "cube" ? n ** 3 : (n * (n + 1)) / 2;
  const dots: [number, number][] = [];
  if (kind === "square") for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) dots.push([c, r]);
  if (kind === "triangular") for (let r = 0; r < n; r++) for (let c = 0; c <= r; c++) dots.push([c + (n - 1 - r) / 2, r]);
  const S = 26;
  const list = Array.from({ length: 6 }, (_, i) => (kind === "square" ? (i + 1) ** 2 : kind === "cube" ? (i + 1) ** 3 : ((i + 1) * (i + 2)) / 2));
  return (
    <>
      <p>Choose a type of number and build the pattern bigger.</p>
      <Choices
        label="Type of number"
        value={kind}
        options={[
          ["triangular", "Triangular"],
          ["square", "Square"],
          ["cube", "Cube"],
        ]}
        onChange={setKind}
      />
      <Slider label="Which one (n)" value={n} min={1} max={kind === "cube" ? 5 : 7} onChange={(v) => setN(Math.min(v, kind === "cube" ? 5 : 7))} />
      {kind === "cube" ? (
        <svg viewBox="0 0 220 200" width="100%" style={{ maxWidth: 260 }} role="img" aria-label={`A cube ${n} by ${n} by ${n}, made of ${value} small cubes.`} className="shape-diagram">
          {(() => {
            const s = 120 / Math.max(n, 1);
            const o = 40 / Math.max(n, 1);
            const x0 = 20;
            const y0 = 50;
            const els: React.ReactNode[] = [];
            for (let i = 0; i <= n; i++) {
              els.push(<line key={`f${i}`} x1={x0 + i * s} y1={y0} x2={x0 + i * s} y2={y0 + n * s} stroke="var(--ink)" />);
              els.push(<line key={`g${i}`} x1={x0} y1={y0 + i * s} x2={x0 + n * s} y2={y0 + i * s} stroke="var(--ink)" />);
              els.push(<line key={`t${i}`} x1={x0 + i * s} y1={y0} x2={x0 + i * s + n * o} y2={y0 - n * o} stroke="var(--ink)" />);
              els.push(<line key={`u${i}`} x1={x0 + i * o} y1={y0 - i * o} x2={x0 + n * s + i * o} y2={y0 - i * o} stroke="var(--ink)" />);
              els.push(<line key={`r${i}`} x1={x0 + n * s + i * o} y1={y0 - i * o} x2={x0 + n * s + i * o} y2={y0 + n * s - i * o} stroke="var(--ink)" />);
              els.push(<line key={`v${i}`} x1={x0 + n * s} y1={y0 + i * s} x2={x0 + n * s + n * o} y2={y0 + i * s - n * o} stroke="var(--ink)" />);
            }
            return els;
          })()}
        </svg>
      ) : (
        <svg viewBox={`0 0 ${n * S + 20} ${n * S + 20}`} width="100%" style={{ maxWidth: 240 }} role="img" aria-label={`${value} dots arranged as a ${kind === "square" ? `${n} by ${n} square` : `triangle with ${n} rows`}.`} className="shape-diagram">
          {dots.map(([c, r], i) => (
            <circle key={i} cx={10 + S / 2 + c * S} cy={10 + S / 2 + r * S} r={S / 3} fill={r === n - 1 ? "var(--accent)" : "var(--ink)"} />
          ))}
        </svg>
      )}
      <Readout>
        The {n === 1 ? "1st" : n === 2 ? "2nd" : n === 3 ? "3rd" : `${n}th`} {kind} number is <strong>{value}</strong>
        {kind === "square" ? ` (${n} × ${n})` : kind === "cube" ? ` (${n} × ${n} × ${n})` : ` (1 + 2 + … + ${n}: the new row has ${n} dots)`}. The sequence starts {list.join(", ")}, …
      </Readout>
    </>
  );
}

// ---------------------------------------------------------------- nth term

function NthTermBuilder() {
  const [d, setD] = useState(4);
  const [c, setC] = useState(3);
  const ns = [1, 2, 3, 4, 5];
  const terms = ns.map((n) => d * n + c);
  const table = ns.map((n) => d * n);
  return (
    <>
      <p>Build a sequence by choosing the difference and the adjustment. Compare it with the times table row to see where the nth term comes from.</p>
      <Slider label="Difference (goes up by)" value={d} min={-5} max={9} onChange={(v) => setD(v === 0 ? 1 : v)} />
      <Slider label="Adjustment" value={c} min={-9} max={20} onChange={setC} />
      <div className="prob-table-wrap">
        <table className="prob-table">
          <caption className="sr-only">Comparing the sequence with {num(d)}n</caption>
          <thead>
            <tr>
              <th scope="col" className="prob-corner">n</th>
              {ns.map((n) => (
                <th key={n} scope="col">
                  {n}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Row head={`${d === 1 ? "" : d === -1 ? "−" : num(d)}n`} cells={table} />
            <Row head="Sequence" cells={terms} />
          </tbody>
        </table>
      </div>
      <Readout>
        The sequence {terms.map(num).join(", ")}, … goes {d > 0 ? "up" : "down"} by {Math.abs(d)}, so compare with {d === 1 ? "" : d === -1 ? "−" : num(d)}n. Each term is {c === 0 ? "the same as" : `${Math.abs(c)} ${c > 0 ? "more than" : "less than"}`} that row. The nth term is <strong>{nthTerm(d, c)}</strong>.
      </Readout>
    </>
  );
}

// ---------------------------------------------------------------- other sequences

type Other = "fibonacci" | "geometric" | "quadratic";

function OtherSequencesExplorer() {
  const [kind, setKind] = useState<Other>("fibonacci");
  const [a, setA] = useState(2);
  const [b, setB] = useState(3);
  const terms: number[] = [];
  if (kind === "fibonacci") {
    terms.push(a, b);
    while (terms.length < 8) terms.push(terms[terms.length - 1] + terms[terms.length - 2]);
  } else if (kind === "geometric") {
    for (let i = 0; i < 7; i++) terms.push(a * b ** i);
  } else {
    let t = a;
    let gap = b;
    for (let i = 0; i < 7; i++) {
      terms.push(t);
      t += gap;
      gap += 2;
    }
  }
  const gaps = terms.slice(1).map((t, i) => t - terms[i]);
  const second = gaps.slice(1).map((g, i) => g - gaps[i]);
  return (
    <>
      <p>Choose a type of sequence and its starting numbers. Look at the gaps underneath to see the pattern.</p>
      <Choices
        label="Type of sequence"
        value={kind}
        options={[
          ["fibonacci", "Fibonacci-type"],
          ["geometric", "Geometric"],
          ["quadratic", "Quadratic"],
        ]}
        onChange={(k) => {
          setKind(k);
          setA(k === "geometric" ? 3 : 2);
          setB(k === "geometric" ? 2 : 3);
        }}
      />
      <Slider label={kind === "fibonacci" ? "1st term" : "First term"} value={a} min={1} max={9} onChange={setA} />
      <Slider label={kind === "fibonacci" ? "2nd term" : kind === "geometric" ? "Multiply by" : "First gap"} value={b} min={kind === "geometric" ? 2 : 1} max={kind === "geometric" ? 4 : 9} onChange={setB} />
      <p style={{ fontSize: "1.25rem", fontWeight: 600 }}>{terms.map(num).join(", ")}, …</p>
      <p>Gaps: {gaps.map(num).join(", ")}</p>
      {kind === "quadratic" && <p>Gaps between the gaps (second difference): {second.join(", ")}</p>}
      <Readout>
        {kind === "fibonacci"
          ? `Each term is the two before added: ${terms[2]} + ${terms[3]} = ${terms[4]}. The gaps are the sequence itself, shifted along.`
          : kind === "geometric"
            ? `Each term is multiplied by ${b}: ${terms[2]} × ${b} = ${terms[3]}. The gaps grow fast, so it isn't arithmetic.`
            : `The gaps go up by 2 each time. To continue, find the next gap (${gaps[gaps.length - 1] + 2}) and add it: ${terms[terms.length - 1]} + ${gaps[gaps.length - 1] + 2} = ${terms[terms.length - 1] + gaps[gaps.length - 1] + 2}.`}
      </Readout>
    </>
  );
}

export const SEQUENCE_DEMOS = {
  "sequence-builder": SequenceBuilder,
  "special-sequences-dots": SpecialSequencesDots,
  "nth-term-builder": NthTermBuilder,
  "other-sequences-explorer": OtherSequencesExplorer,
};
