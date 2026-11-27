"use client";

/**
 * Interactive demonstrations for the early algebra chain. Each one shows that
 * a letter is just a number we can change. Keyboard operable; every state is
 * also described in words, and nothing relies on colour alone.
 */

import { useId, useState } from "react";
import { FunctionMachine } from "./FunctionMachine";

export function Slider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
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

export function Choices<T extends string | number>({ label, options, value, onChange, show }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void; show?: (v: T) => string }) {
  return (
    <div className="stack" style={{ gap: 6 }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      <div className="choice-row" role="group" aria-label={label}>
        {options.map((o) => (
          <button key={String(o)} type="button" className="choice" aria-pressed={value === o} onClick={() => onChange(o)}>
            {show ? show(o) : String(o)}
          </button>
        ))}
      </div>
    </div>
  );
}

const big = { fontSize: "1.15rem" } as const;
const cellStyle = { padding: "6px 10px", borderBottom: "1px solid var(--line)", textAlign: "left" } as const;

// ------------------------------------------------------------ notation

function NotationMeaning() {
  const [n, setN] = useState(4);
  const rows: [string, string, number][] = [
    ["3n", "3 × n", 3 * n],
    ["n + 3", "n add 3", n + 3],
    ["n²", "n × n", n * n],
    ["2n", "2 × n, or n + n", 2 * n],
    ["2(n + 1)", "add 1 to n, then × 2", 2 * (n + 1)],
  ];
  return (
    <>
      <p>Move the slider to change the number n stands for. Watch how each expression changes.</p>
      <Slider label="n" value={n} min={1} max={12} onChange={setN} />
      <table style={{ borderCollapse: "collapse", width: "100%", ...big }}>
        <thead>
          <tr>
            <th style={cellStyle}>Algebra</th>
            <th style={cellStyle}>Means</th>
            <th style={cellStyle}>When n = {n}</th>
          </tr>
        </thead>
        <tbody aria-live="polite">
          {rows.map(([e, m, v]) => (
            <tr key={e}>
              <td style={{ ...cellStyle, fontWeight: 700 }}>{e}</td>
              <td style={cellStyle}>{m}</td>
              <td style={cellStyle}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="small muted">
        3n and n + 3 look alike but mean different things. n² and 2n are only equal when n is 2. Try it.
      </p>
    </>
  );
}

// ------------------------------------------------------------ like terms

type T = { c: number; v: string };
const LIKE_EXAMPLES: T[][] = [
  [{ c: 3, v: "x" }, { c: 2, v: "y" }, { c: 1, v: "x" }, { c: 4, v: "y" }],
  [{ c: 5, v: "a" }, { c: 3, v: "" }, { c: 2, v: "a" }, { c: 4, v: "" }],
  [{ c: 2, v: "x²" }, { c: 3, v: "x" }, { c: 4, v: "x²" }, { c: 1, v: "x" }],
  [{ c: 6, v: "p" }, { c: -2, v: "p" }, { c: 5, v: "q" }, { c: 1, v: "" }],
];
const showTerm = (t: T, first: boolean) => {
  const body = t.v === "" ? String(Math.abs(t.c)) : Math.abs(t.c) === 1 ? t.v : `${Math.abs(t.c)}${t.v}`;
  if (first) return t.c < 0 ? `−${body}` : body;
  return t.c < 0 ? ` − ${body}` : ` + ${body}`;
};
const kindName = (v: string) => (v === "" ? "numbers" : `${v} terms`);

function LikeTermsSort() {
  const [ex, setEx] = useState(0);
  const [grouped, setGrouped] = useState(false);
  const terms = LIKE_EXAMPLES[ex];
  const kinds = [...new Set(terms.map((t) => t.v))];
  const totals = kinds.map((v) => ({ v, c: terms.filter((t) => t.v === v).reduce((s, t) => s + t.c, 0) }));
  const answer = totals.map((t, i) => showTerm(t, i === 0)).join("");
  return (
    <>
      <p>Like terms have exactly the same letters. Press the button to sort the terms into groups.</p>
      <p style={{ fontSize: "1.5rem", fontWeight: 700 }}>{terms.map((t, i) => showTerm(t, i === 0)).join("")}</p>
      <div className="row">
        <button type="button" className="btn" aria-pressed={grouped} onClick={() => setGrouped((g) => !g)}>
          {grouped ? "Hide the groups" : "Group the like terms"}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setEx((e) => (e + 1) % LIKE_EXAMPLES.length);
            setGrouped(false);
          }}
        >
          Another example
        </button>
      </div>
      {grouped && (
        <div className="stack" aria-live="polite">
          {kinds.map((v) => {
            const group = terms.filter((t) => t.v === v);
            const total = totals.find((t) => t.v === v)!;
            return (
              <p key={v} className="panel-sunk" style={{ ...big, background: "var(--surface)", border: "1.5px solid var(--line)" }}>
                <strong>{kindName(v)}:</strong> {group.map((t, i) => showTerm(t, i === 0)).join("")} = <strong>{showTerm(total, true)}</strong>
              </p>
            );
          })}
          <p style={big}>
            Simplified: <strong>{answer}</strong>
          </p>
        </div>
      )}
    </>
  );
}

// ------------------------------------------------------------ substitution

const SUB_EXPRS = ["3a + 2", "2a²", "4(a + 1)", "a² + a"] as const;
type SubExpr = (typeof SUB_EXPRS)[number];

function subSteps(e: SubExpr, a: number): string[] {
  if (e === "3a + 2") return [`3 × ${a} + 2`, `Multiply first: 3 × ${a} = ${3 * a}`, `Then add: ${3 * a} + 2 = ${3 * a + 2}`];
  if (e === "2a²") return [`2 × ${a}²`, `Square first: ${a}² = ${a} × ${a} = ${a * a}`, `Then multiply: 2 × ${a * a} = ${2 * a * a}`];
  if (e === "4(a + 1)") return [`4 × (${a} + 1)`, `Bracket first: ${a} + 1 = ${a + 1}`, `Then multiply: 4 × ${a + 1} = ${4 * (a + 1)}`];
  return [`${a}² + ${a}`, `Square first: ${a}² = ${a * a}`, `Then add: ${a * a} + ${a} = ${a * a + a}`];
}

function SubstituteSwap() {
  const [e, setE] = useState<SubExpr>("3a + 2");
  const [a, setA] = useState(5);
  const steps = subSteps(e, a);
  return (
    <>
      <p>Pick an expression, then choose a value for a. See each step of swapping the number in.</p>
      <Choices label="Expression" options={SUB_EXPRS} value={e} onChange={setE} />
      <Slider label="a" value={a} min={1} max={10} onChange={setA} />
      <ol className="solution" aria-live="polite" style={big}>
        <li>
          Swap a for {a}: {steps[0]}
        </li>
        {steps.slice(1).map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
    </>
  );
}

// ------------------------------------------------------------ expanding

function ExpandArea() {
  const [k, setK] = useState(3);
  const [c, setC] = useState(4);
  const unit = 26;
  const xw = 5 * unit; // x is drawn as a fixed width: its value is unknown
  const cw = c * unit;
  const h = k * unit;
  const pad = 30;
  const W = xw + cw + pad * 2;
  const H = h + pad * 2;
  return (
    <>
      <p>
        A rectangle {k} tall and x + {c} wide has area {k}(x + {c}). Split it into two parts and add their areas.
      </p>
      <div className="grid-2">
        <Slider label="Number outside the bracket" value={k} min={2} max={6} onChange={setK} />
        <Slider label="Number inside the bracket" value={c} min={1} max={8} onChange={setC} />
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} role="img" aria-label={`A rectangle of height ${k}, split into a part x wide with area ${k}x and a part ${c} wide with area ${k * c}.`}>
        <rect x={pad} y={pad} width={xw} height={h} fill="var(--accent-soft)" stroke="var(--ink)" strokeWidth={2} />
        <rect x={pad + xw} y={pad} width={cw} height={h} fill="var(--surface)" stroke="var(--ink)" strokeWidth={2} strokeDasharray="0" />
        <text x={pad + xw / 2} y={pad - 8} textAnchor="middle" fontSize={18} fill="var(--ink)">x</text>
        <text x={pad + xw + cw / 2} y={pad - 8} textAnchor="middle" fontSize={18} fill="var(--ink)">{c}</text>
        <text x={pad - 10} y={pad + h / 2 + 6} textAnchor="end" fontSize={18} fill="var(--ink)">{k}</text>
        <text x={pad + xw / 2} y={pad + h / 2 + 7} textAnchor="middle" fontSize={20} fontWeight={700} fill="var(--ink)">{k}x</text>
        <text x={pad + xw + cw / 2} y={pad + h / 2 + 7} textAnchor="middle" fontSize={20} fontWeight={700} fill="var(--ink)">{k * c}</text>
      </svg>
      <p aria-live="polite" style={big}>
        {k}(x + {c}) = {k} × x + {k} × {c} = <strong>{k}x + {k * c}</strong>
      </p>
    </>
  );
}

// ------------------------------------------------------------ function machines

const FIRST = [2, 3, 5] as const;
const SECOND = [1, 4, 10] as const;

function FunctionMachineDemo() {
  const [input, setInput] = useState(4);
  const [k, setK] = useState<(typeof FIRST)[number]>(3);
  const [c, setC] = useState<(typeof SECOND)[number]>(4);
  const [back, setBack] = useState(false);
  const mid = input * k;
  const out = mid + c;
  return (
    <>
      <p>Choose an input and the two steps. Then try running the machine backwards.</p>
      <Slider label="Input" value={input} min={1} max={12} onChange={setInput} />
      <div className="grid-2">
        <Choices label="First step" options={FIRST} value={k} onChange={setK} show={(v) => `× ${v}`} />
        <Choices label="Second step" options={SECOND} value={c} onChange={setC} show={(v) => `+ ${v}`} />
      </div>
      <FunctionMachine machine={{ input: String(input), steps: [`× ${k}`, `+ ${c}`], output: String(out) }} />
      <p aria-live="polite" style={big}>
        {input} × {k} = {mid}, then {mid} + {c} = <strong>{out}</strong>
      </p>
      <div>
        <button type="button" className="btn" aria-pressed={back} onClick={() => setBack((b) => !b)}>
          {back ? "Hide the backwards machine" : "Run it backwards"}
        </button>
      </div>
      {back && (
        <div className="stack" aria-live="polite">
          <p>Backwards: start at the output, undo the last step first, using the opposite operation.</p>
          <FunctionMachine machine={{ input: String(out), steps: [`− ${c}`, `÷ ${k}`], output: String(input) }} />
          <p style={big}>
            {out} − {c} = {mid}, then {mid} ÷ {k} = <strong>{input}</strong>. Back to the input.
          </p>
        </div>
      )}
    </>
  );
}

// ------------------------------------------------------------ solving

const EQUATIONS = [
  { k: 3, c: 5, rhs: 20 },
  { k: 2, c: 7, rhs: 15 },
  { k: 4, c: -3, rhs: 21 },
  { k: 5, c: 0, rhs: 35 },
] as const;

function lhsText(k: number, c: number) {
  const kx = k === 1 ? "x" : `${k}x`;
  return c === 0 ? kx : c > 0 ? `${kx} + ${c}` : `${kx} − ${-c}`;
}

function BalanceSolve() {
  const [which, setWhich] = useState(0);
  const start = EQUATIONS[which];
  const [state, setState] = useState<{ k: number; c: number; rhs: number }>({ ...start });
  const [log, setLog] = useState<string[]>([]);
  const [note, setNote] = useState<string | null>(null);

  const reset = (i: number) => {
    setWhich(i);
    setState({ ...EQUATIONS[i] });
    setLog([]);
    setNote(null);
  };
  const solved = state.k === 1 && state.c === 0;

  function undoAdd() {
    const { k, c, rhs } = state;
    const next = { k, c: 0, rhs: rhs - c };
    setLog((l) => [...l, `${c > 0 ? `Subtract ${c} from` : `Add ${-c} to`} both sides: ${lhsText(k, 0)} = ${next.rhs}`]);
    setState(next);
    setNote(null);
  }
  function divide() {
    const { k, c, rhs } = state;
    if (c !== 0) {
      setNote(`Undo the ${c > 0 ? `+ ${c}` : `− ${-c}`} first. Dividing now would mean dividing every term, which is harder.`);
      return;
    }
    const next = { k: 1, c: 0, rhs: rhs / k };
    setLog((l) => [...l, `Divide both sides by ${k}: x = ${next.rhs}`]);
    setState(next);
    setNote(null);
  }

  return (
    <>
      <p>Both sides of an equation balance. Do the same thing to both sides until x is on its own.</p>
      <Choices label="Equation" options={EQUATIONS.map((_, i) => i)} value={which} onChange={reset} show={(i) => `${lhsText(EQUATIONS[i].k, EQUATIONS[i].c)} = ${EQUATIONS[i].rhs}`} />
      <div
        aria-live="polite"
        style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 8, fontSize: "1.6rem", fontWeight: 700, textAlign: "center" }}
      >
        <span className="panel-sunk" style={{ background: "var(--surface)", border: "1.5px solid var(--line)" }}>{lhsText(state.k, state.c)}</span>
        <span>=</span>
        <span className="panel-sunk" style={{ background: "var(--surface)", border: "1.5px solid var(--line)" }}>{state.rhs}</span>
      </div>
      {!solved && (
        <div className="row">
          {state.c !== 0 && (
            <button type="button" className="btn" onClick={undoAdd}>
              {state.c > 0 ? `Subtract ${state.c} from both sides` : `Add ${-state.c} to both sides`}
            </button>
          )}
          {state.k !== 1 && (
            <button type="button" className="btn" onClick={divide}>
              Divide both sides by {state.k}
            </button>
          )}
        </div>
      )}
      {note && <p className="notice notice-info">{note}</p>}
      {log.length > 0 && (
        <ol className="solution" style={big}>
          {log.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      )}
      {solved && (
        <p style={big}>
          Solved: <strong>x = {state.rhs}</strong>. Check: {lhsText(start.k, start.c).replace("x", ` × ${state.rhs}`)} = {start.rhs} ✓{" "}
          <button type="button" className="btn btn-small" onClick={() => reset(which)}>
            Start again
          </button>
        </p>
      )}
    </>
  );
}

export const ALGEBRA_DEMOS = {
  "notation-meaning": NotationMeaning,
  "like-terms-sort": LikeTermsSort,
  "substitute-swap": SubstituteSwap,
  "expand-area": ExpandArea,
  "function-machine": FunctionMachineDemo,
  "balance-solve": BalanceSolve,
};
