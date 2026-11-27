"use client";

/**
 * Interactive demonstrations for the probability chain. Sliders and buttons
 * only (keyboard operable), no timers, and every state is also described in
 * words. Colours always come with a label or a shape.
 */

import { useId, useState } from "react";
import { MathText } from "./MathText";
import { TableDiagram, VennDiagram } from "./ProbabilityDiagrams";
import type { VennSpec } from "@/engine/types";

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
  const id = useId();
  return (
    <div className="stack" style={{ gap: 6 }}>
      <span className="eyebrow" id={id}>
        {label}
      </span>
      <div className="choice-row" role="group" aria-labelledby={id}>
        {options.map((o) => (
          <button key={o.id} type="button" className="choice" aria-pressed={value === o.id} onClick={() => onChange(o.id)}>
            {o.text}
          </button>
        ))}
      </div>
    </div>
  );
}

const round = (x: number, dp = 3) => String(Math.round(x * 10 ** dp) / 10 ** dp);
const WORDS = ["impossible", "unlikely", "even chance", "likely", "certain"];
function word(n: number, d: number) {
  if (n === 0) return WORDS[0];
  if (n === d) return WORDS[4];
  if (n * 2 === d) return WORDS[2];
  return n * 2 < d ? WORDS[1] : WORDS[3];
}

// ---------------------------------------------------------------- the probability scale

function ProbabilityScale() {
  const [total, setTotal] = useState(8);
  const [red, setRed] = useState(2);
  const r = Math.min(red, total);
  const p = r / total;
  const W = 520;
  const x = 20 + p * (W - 40);
  return (
    <>
      <p>A bag of counters. Change how many there are and how many are red. Watch where P(red) sits on the scale.</p>
      <div className="grid-2">
        <Slider label="Counters in the bag" value={total} min={1} max={12} onChange={setTotal} />
        <Slider label="Red counters" value={r} min={0} max={total} onChange={setRed} />
      </div>
      <svg viewBox={`0 0 ${W} 112`} width="100%" style={{ maxWidth: W }} role="img" aria-label={`Probability scale from 0 (impossible) to 1 (certain), with a marker at ${round(p)}.`}>
        <line x1={20} y1={50} x2={W - 20} y2={50} stroke="var(--ink)" strokeWidth={3} />
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line x1={20 + t * (W - 40)} y1={40} x2={20 + t * (W - 40)} y2={60} stroke="var(--ink)" strokeWidth={2} />
            <text x={20 + t * (W - 40)} y={80} textAnchor="middle" fontSize={14} fill="var(--ink)">
              {t === 0 ? "0" : t === 1 ? "1" : t === 0.5 ? "1/2" : t === 0.25 ? "1/4" : "3/4"}
            </text>
          </g>
        ))}
        <path d={`M ${x} 44 L ${x - 9} 22 L ${x + 9} 22 Z`} fill="var(--accent)" stroke="var(--ink)" strokeWidth={1.5} />
        <text x={Math.min(Math.max(x, 50), W - 50)} y={15} textAnchor="middle" fontSize={14} fontWeight={700} fill="var(--ink)">
          P(red)
        </text>
        {(["impossible", "unlikely", "even chance", "likely", "certain"] as const).map((w, i) => (
          <text key={w} x={20 + (i / 4) * (W - 40)} y={104} textAnchor={i === 0 ? "start" : i === 4 ? "end" : "middle"} fontSize={13} fill="var(--muted)">
            {w}
          </text>
        ))}
      </svg>
      <Readout>
        <MathText text={`P(red) = ${r}/${total}`} /> = {round(p)} = {round(p * 100, 1)}%. That&apos;s <strong>{word(r, total)}</strong>.
      </Readout>
    </>
  );
}

// ---------------------------------------------------------------- a bag of counters

const BAG = [
  { id: "red", text: "Red", fill: "#f4b4ad", letter: "R" },
  { id: "blue", text: "Blue", fill: "#a9c8f0", letter: "B" },
  { id: "green", text: "Green", fill: "#addfb8", letter: "G" },
] as const;
type BagColour = (typeof BAG)[number]["id"];

function Counter({ c, x, y }: { c: (typeof BAG)[number]; x: number; y: number }) {
  // Each colour has its own shape and letter as well as its colour.
  const shape =
    c.id === "red" ? <circle cx={x} cy={y} r={16} /> : c.id === "blue" ? <rect x={x - 15} y={y - 15} width={30} height={30} rx={3} /> : <path d={`M ${x} ${y - 18} L ${x + 17} ${y + 13} L ${x - 17} ${y + 13} Z`} />;
  return (
    <g fill={c.fill} stroke="#1d2a27" strokeWidth={1.5}>
      {shape}
      <text x={x} y={y + (c.id === "green" ? 6 : 5)} textAnchor="middle" fontSize={13} fontWeight={700} fill="#1d2a27" stroke="none">
        {c.letter}
      </text>
    </g>
  );
}

function CounterBag() {
  const [counts, setCounts] = useState<Record<BagColour, number>>({ red: 3, blue: 5, green: 0 });
  const [want, setWant] = useState<BagColour>("red");
  const total = counts.red + counts.blue + counts.green;
  const all = BAG.flatMap((c) => Array.from({ length: counts[c.id] }, () => c));
  const perRow = 8;
  const rows = Math.max(1, Math.ceil(all.length / perRow));
  const k = counts[want];
  const name = BAG.find((c) => c.id === want)!.text.toLowerCase();
  return (
    <>
      <p>Put counters in the bag, then pick the colour you want. Every counter is equally likely to be taken.</p>
      <div className="grid-2">
        {BAG.map((c) => (
          <Slider key={c.id} label={`${c.text} counters (${c.letter})`} value={counts[c.id]} min={0} max={8} onChange={(n) => setCounts((s) => ({ ...s, [c.id]: n }))} />
        ))}
      </div>
      <Choices label="The colour you want" options={BAG.map((c) => ({ id: c.id, text: c.text }))} value={want} onChange={setWant} />
      <svg viewBox={`0 0 ${perRow * 44 + 8} ${rows * 44 + 8}`} width="100%" style={{ maxWidth: perRow * 44 + 8 }} role="img" aria-label={`${counts.red} red, ${counts.blue} blue and ${counts.green} green counters.`}>
        {all.map((c, i) => (
          <g key={i} opacity={c.id === want ? 1 : 0.45}>
            <Counter c={c} x={26 + (i % perRow) * 44} y={26 + Math.floor(i / perRow) * 44} />
          </g>
        ))}
      </svg>
      <Readout>
        {total === 0 ? (
          "The bag is empty. Add some counters."
        ) : (
          <>
            {k} of the {total} counters {k === 1 ? "is" : "are"} {name}, so <MathText text={`P(${name}) = ${k}/${total}`} />
            {k === 0 ? ": impossible." : k === total ? ": certain." : "."}
            {k > 0 && k < total && (
              <>
                {" "}
                The bottom is the total, {total}, not the {total - k} other counters.
              </>
            )}
          </>
        )}
      </Readout>
    </>
  );
}

// ---------------------------------------------------------------- probabilities add up to 1

function ProbabilityBar() {
  const [a, setA] = useState(30);
  const [b, setB] = useState(45);
  const bb = Math.min(b, 100 - a);
  const c = 100 - a - bb;
  const W = 520;
  const seg = (from: number, width: number, fill: string, label: string) =>
    width > 0 && (
      <g>
        <rect x={10 + (from / 100) * (W - 20)} y={10} width={(width / 100) * (W - 20)} height={56} fill={fill} stroke="var(--ink)" strokeWidth={1.5} />
        {width >= 12 && (
          <text x={10 + ((from + width / 2) / 100) * (W - 20)} y={44} textAnchor="middle" fontSize={15} fontWeight={700} fill="#1d2a27">
            {label}
          </text>
        )}
      </g>
    );
  return (
    <>
      <p>A spinner lands on red, blue or green. The whole bar is 1. Set P(red) and P(blue), and see what is left for green.</p>
      <div className="grid-2">
        <Slider label="P(red)" value={a} min={0} max={100} step={5} show={round(a / 100)} onChange={setA} />
        <Slider label="P(blue)" value={bb} min={0} max={100 - a} step={5} show={round(bb / 100)} onChange={setB} />
      </div>
      <svg viewBox={`0 0 ${W} 76`} width="100%" style={{ maxWidth: W }} role="img" aria-label={`Bar of length 1: red ${a / 100}, blue ${bb / 100}, green ${c / 100}.`}>
        {seg(0, a, "#f4b4ad", `red ${round(a / 100)}`)}
        {seg(a, bb, "#a9c8f0", `blue ${round(bb / 100)}`)}
        {seg(a + bb, c, "#addfb8", `green ${round(c / 100)}`)}
      </svg>
      <Readout>
        P(green) = 1 − {round(a / 100)} − {round(bb / 100)} = <strong>{round(c / 100)}</strong>. And P(not red) = 1 − {round(a / 100)} = {round((100 - a) / 100)}.
      </Readout>
    </>
  );
}

// ---------------------------------------------------------------- relative frequency

function ExperimentTrials() {
  const [rolls, setRolls] = useState(0);
  const [sixes, setSixes] = useState(0);
  const [history, setHistory] = useState<number[]>([]);

  function roll(n: number) {
    let s = sixes;
    const h = [...history];
    for (let i = 1; i <= n; i++) {
      if (Math.floor(Math.random() * 6) === 5) s++;
      h.push(s / (rolls + i));
    }
    setRolls(rolls + n);
    setSixes(s);
    setHistory(h.length > 1200 ? h.filter((_, i) => i % 2 === 0 || i === h.length - 1) : h);
  }

  const W = 520;
  const H = 180;
  const yOf = (rf: number) => H - 20 - (rf / 0.5) * (H - 40);
  const pts = history.map((rf, i) => `${30 + (i / Math.max(1, history.length - 1)) * (W - 40)},${yOf(Math.min(rf, 0.5))}`).join(" ");
  return (
    <>
      <p>Roll a fair dice and count the sixes. The graph shows the relative frequency of a six after each roll. The dashed line is the theoretical probability, 1/6.</p>
      <div className="row">
        <button className="btn" onClick={() => roll(1)}>
          Roll once
        </button>
        <button className="btn" onClick={() => roll(10)}>
          Roll 10 times
        </button>
        <button className="btn" onClick={() => roll(100)}>
          Roll 100 times
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => {
            setRolls(0);
            setSixes(0);
            setHistory([]);
          }}
        >
          Start again
        </button>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W }} role="img" aria-label={rolls === 0 ? "Empty graph. Roll the dice to start." : `Relative frequency of a six after ${rolls} rolls: ${round(sixes / rolls)}.`}>
        <line x1={30} y1={H - 20} x2={W - 10} y2={H - 20} stroke="var(--ink)" strokeWidth={1.5} />
        <line x1={30} y1={20} x2={30} y2={H - 20} stroke="var(--ink)" strokeWidth={1.5} />
        {[0, 0.25, 0.5].map((t) => (
          <text key={t} x={24} y={yOf(t) + 4} textAnchor="end" fontSize={12} fill="var(--muted)">
            {t}
          </text>
        ))}
        <line x1={30} y1={yOf(1 / 6)} x2={W - 10} y2={yOf(1 / 6)} stroke="var(--accent)" strokeWidth={2} strokeDasharray="6 5" />
        {history.length > 1 && <polyline points={pts} fill="none" stroke="var(--ink)" strokeWidth={2} />}
        {history.length === 1 && <circle cx={30} cy={yOf(Math.min(history[0], 0.5))} r={4} fill="var(--ink)" />}
      </svg>
      <Readout>
        {rolls === 0 ? (
          "Press a button to roll."
        ) : (
          <>
            {sixes} sixes in {rolls} rolls. Relative frequency = <MathText text={`${sixes}/${rolls}`} /> = {round(sixes / rolls)}. Expected number of sixes in {rolls} rolls: {rolls} ÷ 6 = {round(rolls / 6, 1)}.
            {rolls < 30 ? " With only a few rolls it jumps around. Try 100 more." : " With lots of rolls, it settles close to 1/6 ≈ 0.167."}
          </>
        )}
      </Readout>
    </>
  );
}

// ---------------------------------------------------------------- sample space grid

function SampleSpaceGrid() {
  const [a, setA] = useState(6);
  const [b, setB] = useState(6);
  const [t, setT] = useState(7);
  const target = Math.min(Math.max(t, 2), a + b);
  const highlight: [number, number][] = [];
  for (let i = 0; i < a; i++) for (let j = 0; j < b; j++) if (i + j + 2 === target) highlight.push([i, j]);
  const table = {
    corner: "+",
    columns: Array.from({ length: b }, (_, j) => String(j + 1)),
    rows: Array.from({ length: a }, (_, i) => ({ head: String(i + 1), cells: Array.from({ length: b }, (_, j) => String(i + j + 2)) })),
    highlight,
    description: `Sample space: first spinner 1 to ${a} down the side, second 1 to ${b} across. ${highlight.length} cells have a total of ${target}.`,
  };
  return (
    <>
      <p>Two spinners are spun and the scores added. Choose how many numbers each has (6 is like a dice), then pick a total.</p>
      <div className="grid-2">
        <Slider label="First spinner: 1 to" value={a} min={2} max={6} onChange={setA} />
        <Slider label="Second spinner: 1 to" value={b} min={2} max={6} onChange={setB} />
      </div>
      <Slider label="Total to look for" value={target} min={2} max={a + b} onChange={setT} />
      <TableDiagram table={table} />
      <Readout>
        {highlight.length} of the {a} × {b} = {a * b} cells give a total of {target}, so <MathText text={`P(total ${target}) = ${highlight.length}/${a * b}`} />.
      </Readout>
    </>
  );
}

// ---------------------------------------------------------------- Venn diagram

const SETS = [
  { id: "even3", text: "Even / Multiple of 3", a: "Even", b: "Multiple of 3", ta: (x: number) => x % 2 === 0, tb: (x: number) => x % 3 === 0 },
  { id: "even5", text: "Even / Multiple of 5", a: "Even", b: "Multiple of 5", ta: (x: number) => x % 2 === 0, tb: (x: number) => x % 5 === 0 },
  { id: "odd-sq", text: "Odd / Square", a: "Odd", b: "Square", ta: (x: number) => x % 2 === 1, tb: (x: number) => Number.isInteger(Math.sqrt(x)) },
] as const;
const REGIONS = [
  { id: "both", text: "A ∩ B (both)" },
  { id: "union", text: "A ∪ B (either)" },
  { id: "A", text: "A" },
  { id: "neither", text: "Neither" },
] as const;
type Region = (typeof REGIONS)[number]["id"];

function VennSort() {
  const [setId, setSet] = useState<(typeof SETS)[number]["id"]>("even3");
  const [n, setN] = useState(12);
  const [region, setRegion] = useState<Region>("both");
  const s = SETS.find((x) => x.id === setId)!;
  const nums = Array.from({ length: n }, (_, i) => i + 1);
  const r = {
    onlyA: nums.filter((x) => s.ta(x) && !s.tb(x)),
    both: nums.filter((x) => s.ta(x) && s.tb(x)),
    onlyB: nums.filter((x) => !s.ta(x) && s.tb(x)),
    neither: nums.filter((x) => !s.ta(x) && !s.tb(x)),
  };
  const shade: VennSpec["shade"] = region === "both" ? ["both"] : region === "union" ? ["onlyA", "both", "onlyB"] : region === "A" ? ["onlyA", "both"] : ["neither"];
  const k = shade.reduce((sum, reg) => sum + r[reg].length, 0);
  const j = (xs: number[]) => xs.join(", ");
  const venn: VennSpec = {
    a: `A: ${s.a}`,
    b: `B: ${s.b}`,
    onlyA: j(r.onlyA),
    both: j(r.both),
    onlyB: j(r.onlyB),
    neither: j(r.neither),
    shade,
    description: `Numbers 1 to ${n}. A only: ${j(r.onlyA) || "none"}. Both: ${j(r.both) || "none"}. B only: ${j(r.onlyB) || "none"}. Neither: ${j(r.neither) || "none"}. Shaded: ${REGIONS.find((x) => x.id === region)!.text}.`,
  };
  return (
    <>
      <p>The numbers from 1 to {n} sorted into a Venn diagram. Pick the sets and the part to shade.</p>
      <Choices label="Sets" options={SETS.map((x) => ({ id: x.id, text: x.text }))} value={setId} onChange={setSet} />
      <Slider label="Numbers from 1 to" value={n} min={8} max={16} onChange={setN} />
      <Choices label="Shade" options={REGIONS} value={region} onChange={setRegion} />
      <VennDiagram venn={venn} />
      <Readout>
        {k} of the {n} numbers are in the shaded part, so <MathText text={`P = ${k}/${n}`} />.
        {region === "A" && ` Circle A includes the overlap: ${r.onlyA.length} + ${r.both.length} = ${k}.`}
        {region === "union" && ` A ∪ B is everything inside the circles: ${r.onlyA.length} + ${r.both.length} + ${r.onlyB.length} = ${k}.`}
      </Readout>
    </>
  );
}

export const PROBABILITY_DEMOS = {
  "probability-scale": ProbabilityScale,
  "counter-bag": CounterBag,
  "probability-bar": ProbabilityBar,
  "experiment-trials": ExperimentTrials,
  "sample-space-grid": SampleSpaceGrid,
  "venn-sort": VennSort,
};
