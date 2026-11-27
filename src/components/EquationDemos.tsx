"use client";

/**
 * Interactive demonstrations for "Equations and inequalities". Each is
 * keyboard operable, describes every change in words (aria-live), and never
 * relies on colour alone.
 */

import { useState } from "react";
import { Choices, Slider } from "./AlgebraDemos";
import { FunctionMachine } from "./FunctionMachine";
import { NumberLine } from "./NumberLine";

const big = { fontSize: "1.15rem" } as const;
const eqStyle = { fontSize: "1.5rem", fontWeight: 700 } as const;
const neg = (n: number) => (n < 0 ? `−${-n}` : String(n));
const par = (n: number) => (n < 0 ? `(−${-n})` : String(n));
const kx = (k: number, x = "x") => (k === 1 ? x : `${k}${x}`);
const lin = (k: number, c: number, x = "x") => (c === 0 ? kx(k, x) : `${kx(k, x)} ${c < 0 ? "−" : "+"} ${Math.abs(c)}`);

/** A worked solution revealed one step at a time. */
function Steps({ steps, reset }: { steps: string[]; reset: string }) {
  const [shown, setShown] = useState(0);
  const [key, setKey] = useState(reset);
  if (key !== reset) {
    setKey(reset);
    setShown(0);
  }
  return (
    <>
      <ol className="solution" aria-live="polite" style={big}>
        {steps.slice(0, shown).map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      <div className="row">
        {shown < steps.length ? (
          <button type="button" className="btn" onClick={() => setShown((n) => n + 1)}>
            {shown === 0 ? "Show the first step" : "Next step"}
          </button>
        ) : (
          <button type="button" className="btn btn-ghost" onClick={() => setShown(0)}>
            Start again
          </button>
        )}
      </div>
    </>
  );
}

// ------------------------------------------------------------ brackets: two ways

function BracketsTwoWays() {
  const [k, setK] = useState(3);
  const [a, setA] = useState(4);
  const [s, setS] = useState(5);
  const [way, setWay] = useState<"divide" | "expand">("divide");
  const c = k * (s + a);
  const steps =
    way === "divide"
      ? [`Divide both sides by ${k}: x + ${a} = ${c / k}`, `Subtract ${a}: x = ${neg(s)}`, `Check: ${k} × (${neg(s)} + ${a}) = ${k} × ${par(s + a)} = ${c} ✓`]
      : [`Expand: ${k}x + ${k * a} = ${c}`, `Subtract ${k * a}: ${k}x = ${neg(c - k * a)}`, `Divide by ${k}: x = ${neg(s)}`, `Check: ${k} × (${neg(s)} + ${a}) = ${c} ✓`];
  return (
    <>
      <p>Build an equation, then solve it two ways. Both give the same answer.</p>
      <div className="grid-2">
        <Slider label="Number outside the bracket" value={k} min={2} max={6} onChange={setK} />
        <Slider label="Number inside the bracket" value={a} min={1} max={9} onChange={setA} />
      </div>
      <Slider label="The answer x (hidden from the equation)" value={s} min={-5} max={9} onChange={setS} />
      <p style={eqStyle}>
        {k}(x + {a}) = {neg(c)}
      </p>
      <Choices label="Method" options={["divide", "expand"] as const} value={way} onChange={setWay} show={(w) => (w === "divide" ? "Divide first" : "Expand first")} />
      <Steps steps={steps} reset={`${k}-${a}-${s}-${way}`} />
    </>
  );
}

// ------------------------------------------------------------ both sides

const BOTH = [
  { a: 5, b: 3, c: 2, d: 18 },
  { a: 7, b: -4, c: 3, d: 16 },
  { a: 1, b: 9, c: 4, d: -3 },
  { a: 6, b: 1, c: 2, d: -11 },
] as const;

function BalanceBothSides() {
  const [i, setI] = useState(0);
  const { a, b, c, d } = BOTH[i];
  const small = Math.min(a, c);
  const left = a > c;
  const diff = Math.abs(a - c);
  const keep = left ? b : d; // number next to the x term
  const other = left ? d : b;
  const s = (other - keep) / diff;
  const xTerm = lin(diff, keep);
  const steps = [
    `Subtract ${kx(small)} from both sides: ${left ? `${xTerm} = ${neg(d)}` : `${neg(b)} = ${xTerm}`}`,
    `${keep > 0 ? `Subtract ${keep} from` : `Add ${-keep} to`} both sides: ${left ? `${kx(diff)} = ${neg(other - keep)}` : `${neg(other - keep)} = ${kx(diff)}`}`,
    ...(diff === 1 ? [] : [`Divide both sides by ${diff}: x = ${neg(s)}`]),
    `Check: left side ${a} × ${par(s)} ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${neg(a * s + b)}, right side ${c} × ${par(s)} ${d < 0 ? "−" : "+"} ${Math.abs(d)} = ${neg(c * s + d)} ✓`,
  ];
  return (
    <>
      <p>With x on both sides, first take the smaller x term away from both sides. Then solve as usual.</p>
      <Choices label="Equation" options={BOTH.map((_, k) => k)} value={i} onChange={setI} show={(k) => `${lin(BOTH[k].a, BOTH[k].b)} = ${lin(BOTH[k].c, BOTH[k].d)}`} />
      <p style={eqStyle}>
        {lin(a, b)} = {lin(c, d)}
      </p>
      <p className="small muted">The smaller x term is {kx(small)}, on the {a < c ? "left" : "right"}.</p>
      <Steps steps={steps} reset={String(i)} />
    </>
  );
}

// ------------------------------------------------------------ words to algebra

const PHRASES = [
  { words: "5 more than n", expr: "n + 5", f: (n: number) => n + 5 },
  { words: "5 less than n", expr: "n − 5", f: (n: number) => n - 5 },
  { words: "n less than 5", expr: "5 − n", f: (n: number) => 5 - n },
  { words: "5 times n", expr: "5n", f: (n: number) => 5 * n },
  { words: "n divided by 5", expr: "n/5", f: (n: number) => n / 5 },
  { words: "add 2 to n, then multiply by 5", expr: "5(n + 2)", f: (n: number) => 5 * (n + 2) },
  { words: "multiply n by 5, then add 2", expr: "5n + 2", f: (n: number) => 5 * n + 2 },
] as const;

function WordsToAlgebra() {
  const [i, setI] = useState(0);
  const [n, setN] = useState(10);
  const p = PHRASES[i];
  const v = p.f(n);
  return (
    <>
      <p>Pick a phrase to see it in algebra. Then try a number for n to check it makes sense.</p>
      <Choices label="Phrase" options={PHRASES.map((_, k) => k)} value={i} onChange={setI} show={(k) => PHRASES[k].words} />
      <p style={eqStyle}>{p.expr}</p>
      <Slider label="n" value={n} min={1} max={20} onChange={setN} />
      <p aria-live="polite" style={big}>
        When n = {n}, {p.words.replace(/\bn\b/g, String(n))} is <strong>{Number.isInteger(v) ? neg(v) : neg(Math.round(v * 100) / 100)}</strong>.
        {i === 1 && " Start with n and take 5 away."}
        {i === 2 && " Start with 5 and take n away. Compare it with '5 less than n'."}
        {i === 5 && " The brackets show the whole of n + 2 is multiplied."}
      </p>
    </>
  );
}

// ------------------------------------------------------------ angle equations

function AngleEquation() {
  const [k, setK] = useState(2);
  const [m, setM] = useState(3);
  const [shape, setShape] = useState<"triangle" | "line">("triangle");
  const total = 180;
  const sum = shape === "triangle" ? 1 + k + m : k + m;
  const x = total / sum;
  const terms = shape === "triangle" ? ["x", kx(k), kx(m)] : [kx(k), kx(m)];
  return (
    <>
      <p>Choose the angles. The fact that they add to 180° gives an equation to solve.</p>
      <Choices label="Where" options={["triangle", "line"] as const} value={shape} onChange={setShape} show={(s) => (s === "triangle" ? "Angles in a triangle" : "Angles on a straight line")} />
      <div className="grid-2">
        <Slider label={shape === "triangle" ? "Second angle: how many x" : "First angle: how many x"} value={k} min={1} max={6} onChange={setK} />
        <Slider label={shape === "triangle" ? "Third angle: how many x" : "Second angle: how many x"} value={m} min={1} max={8} onChange={setM} />
      </div>
      <div aria-live="polite" style={big}>
        <p>
          The angles are {terms.join(", ")}. They add to 180°: <strong>{terms.join(" + ")} = 180</strong>
        </p>
        <p>
          Collect: {sum}x = 180, so x = 180 ÷ {sum} = <strong>{Number.isInteger(x) ? x : x.toFixed(1)}°</strong>
          {!Number.isInteger(x) && " (not a whole number, which is fine)"}
        </p>
        <p>
          So the angles are {terms.map((t) => `${t} = ${Number.isInteger(x) ? (t === "x" ? 1 : Number(t.replace("x", "") || 1)) * x : ((t === "x" ? 1 : Number(t.replace("x", "") || 1)) * x).toFixed(1)}°`).join(", ")}.
        </p>
      </div>
    </>
  );
}

// ------------------------------------------------------------ rearranging

function RearrangeMachine() {
  const [k, setK] = useState(3);
  const [c, setC] = useState(2);
  const [x, setX] = useState(4);
  const y = k * x + c;
  return (
    <>
      <p>
        The formula y = {k}x + {c} is a machine: x goes in, y comes out. Running it backwards makes x the subject.
      </p>
      <div className="grid-2">
        <Slider label="Multiply by" value={k} min={2} max={6} onChange={setK} />
        <Slider label="Then add" value={c} min={1} max={9} onChange={setC} />
      </div>
      <Slider label="Try an x" value={x} min={1} max={10} onChange={setX} />
      <FunctionMachine machine={{ input: `x = ${x}`, steps: [`× ${k}`, `+ ${c}`], output: `y = ${y}` }} />
      <p style={big}>Backwards: undo + {c} first, then undo × {k}.</p>
      <FunctionMachine machine={{ input: `y = ${y}`, steps: [`− ${c}`, `÷ ${k}`], output: `x = ${x}` }} />
      <p aria-live="polite" style={big}>
        So <strong>x = (y − {c})/{k}</strong>. Check: ({y} − {c}) ÷ {k} = {(y - c) / k} ✓
      </p>
    </>
  );
}

// ------------------------------------------------------------ inequalities on a number line

const IOPS = ["<", "≤", ">", "≥"] as const;
type IOp = (typeof IOPS)[number];

function InequalityLine() {
  const [op, setOp] = useState<IOp>("<");
  const [v, setV] = useState(2);
  const inclusive = op === "≤" || op === "≥";
  const up = op === "<" || op === "≤";
  const b = { value: v, inclusive };
  const ints = Array.from({ length: 11 }, (_, i) => i - 5).filter((n) => (up ? (inclusive ? n <= v : n < v) : inclusive ? n >= v : n > v));
  return (
    <>
      <p>Choose a sign and a number. Watch the circle and the line change.</p>
      <Choices label="Sign" options={IOPS} value={op} onChange={setOp} />
      <Slider label="Number" value={v} min={-4} max={4} onChange={setV} />
      <p style={eqStyle}>
        x {op} {neg(v)}
      </p>
      <NumberLine
        line={{
          min: -5,
          max: 5,
          ...(up ? { upper: b } : { lower: b }),
          description: `x ${op} ${neg(v)}: ${inclusive ? "a filled" : "an open"} circle at ${neg(v)}, with the line going ${up ? "left" : "right"}.`,
        }}
      />
      <p aria-live="polite" style={big}>
        {inclusive ? "Filled circle" : "Open circle"}: {neg(v)} is {inclusive ? "" : "not "}included. Whole numbers from −5 to 5 that fit: {ints.map(neg).join(", ") || "none"}.
      </p>
    </>
  );
}

// ------------------------------------------------------------ solving inequalities

const INEQS = [
  { a: 3, b: 4, op: "<", c: 19 },
  { a: 2, b: -3, op: "≥", c: 9 },
  { a: 5, b: 2, op: ">", c: -13 },
  { a: 4, b: 1, op: "≤", c: 21 },
] as const;

function InequalitySolve() {
  const [i, setI] = useState(0);
  const [test, setTest] = useState(0);
  const { a, b, op, c } = INEQS[i];
  const s = (c - b) / a;
  const steps = [`${b > 0 ? `Subtract ${b} from` : `Add ${-b} to`} both sides: ${a}x ${op} ${neg(c - b)}`, `Divide both sides by ${a}: x ${op} ${neg(s)}`];
  const val = a * test + b;
  const holds = op === "<" ? val < c : op === "≤" ? val <= c : op === ">" ? val > c : val >= c;
  const up = op === "<" || op === "≤";
  return (
    <>
      <p>Solve it like an equation, keeping the sign. Then test values to see the answer really is a range.</p>
      <Choices label="Inequality" options={INEQS.map((_, k) => k)} value={i} onChange={setI} show={(k) => `${lin(INEQS[k].a, INEQS[k].b)} ${INEQS[k].op} ${neg(INEQS[k].c)}`} />
      <p style={eqStyle}>
        {lin(a, b)} {op} {neg(c)}
      </p>
      <Steps steps={steps} reset={String(i)} />
      <NumberLine line={{ min: -6, max: 8, ...(up ? { upper: { value: s, inclusive: op === "≤" } } : { lower: { value: s, inclusive: op === "≥" } }), description: `x ${op} ${neg(s)} on a number line.` }} />
      <Slider label="Test a value of x" value={test} min={-6} max={8} onChange={setTest} />
      <p aria-live="polite" className={`notice ${holds ? "notice-good" : "notice-info"}`}>
        x = {neg(test)}: {a} × {par(test)} {b < 0 ? "−" : "+"} {Math.abs(b)} = {neg(val)}. Is {neg(val)} {op} {neg(c)}? {holds ? "✓ Yes, it works." : "No, it doesn't work."}
      </p>
    </>
  );
}

// ------------------------------------------------------------ simultaneous equations

const SIMS = [
  { e1: [1, 1, 10], e2: [1, -1, 4], k: 1, op: "add" },
  { e1: [3, 1, 11], e2: [1, 1, 5], k: 1, op: "subtract" },
  { e1: [3, 2, 16], e2: [1, 1, 6], k: 2, op: "subtract" },
  { e1: [2, 3, 12], e2: [1, -1, 1], k: 3, op: "add" },
] as const;

const eqText = ([a, b, c]: readonly number[]) => `${kx(a)} ${b < 0 ? "−" : "+"} ${kx(Math.abs(b), "y")} = ${neg(c)}`;

function Elimination() {
  const [i, setI] = useState(0);
  const { e1, e2, k, op } = SIMS[i];
  const m = e2.map((v) => v * k);
  const sign = op === "add" ? 1 : -1;
  const xc = e1[0] + sign * m[0];
  const rhs = e1[2] + sign * m[2];
  const x = rhs / xc;
  const y = (e2[2] - e2[0] * x) / e2[1];
  const steps = [
    ...(k > 1 ? [`Multiply the second equation by ${k}: ${eqText(m)}. Now the y terms match.`] : []),
    `The y terms are ${neg(e1[1])}y and ${neg(m[1])}y: ${op === "add" ? "different signs, so add" : "the same sign, so subtract"}.`,
    `${op === "add" ? "Add" : "Subtract"}: ${kx(xc)} = ${neg(rhs)}${xc === 1 ? "" : `, so x = ${neg(x)}`}`,
    `Substitute x = ${neg(x)} into ${eqText(e2)}: y = ${neg(y)}`,
    `Check in ${eqText(e1)}: ${e1[0]} × ${par(x)} + ${e1[1]} × ${par(y)} = ${neg(e1[0] * x + e1[1] * y)} ✓`,
  ];
  return (
    <>
      <p>Pick a pair of equations. Step through eliminating y, then finding both values.</p>
      <Choices label="Equations" options={SIMS.map((_, n) => n)} value={i} onChange={setI} show={(n) => `${eqText(SIMS[n].e1)} and ${eqText(SIMS[n].e2)}`} />
      <p style={eqStyle}>
        {eqText(e1)}
        <br />
        {eqText(e2)}
      </p>
      <Steps steps={steps} reset={String(i)} />
    </>
  );
}

// ------------------------------------------------------------ zero product

function ZeroProduct() {
  const [p, setP] = useState(3);
  const [q, setQ] = useState(-2);
  const [x, setX] = useState(0);
  const A = x + p;
  const B = x + q;
  return (
    <>
      <p>
        Choose the brackets, then move x. The product is only 0 when one of the brackets is 0.
      </p>
      <div className="grid-2">
        <Slider label="First bracket number" value={p} min={-6} max={6} onChange={setP} />
        <Slider label="Second bracket number" value={q} min={-6} max={6} onChange={setQ} />
      </div>
      <p style={eqStyle}>
        ({lin(1, p)})({lin(1, q)}) = 0
      </p>
      <Slider label="x" value={x} min={-8} max={8} onChange={setX} />
      <p aria-live="polite" className={`notice ${A * B === 0 ? "notice-good" : "notice-info"}`} style={big}>
        When x = {neg(x)}: ({neg(x)} {p < 0 ? "−" : "+"} {Math.abs(p)}) × ({neg(x)} {q < 0 ? "−" : "+"} {Math.abs(q)}) = {neg(A)} × {par(B)} = <strong>{neg(A * B)}</strong>
        {A * B === 0 ? ` ✓ Zero, because the ${A === 0 ? "first" : "second"} bracket is 0. x = ${neg(x)} is a solution.` : ". Not zero."}
      </p>
      <p className="small muted">
        The solutions are x = {neg(-p)} and x = {neg(-q)}: the opposite signs to the numbers in the brackets.
      </p>
    </>
  );
}

export const EQUATION_DEMOS = {
  "brackets-two-ways": BracketsTwoWays,
  "balance-both-sides": BalanceBothSides,
  "words-to-algebra": WordsToAlgebra,
  "angle-equation": AngleEquation,
  "rearrange-machine": RearrangeMachine,
  "inequality-line": InequalityLine,
  "inequality-solve": InequalitySolve,
  elimination: Elimination,
  "zero-product": ZeroProduct,
};
