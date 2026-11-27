"use client";

/**
 * Interactive demonstrations for "Expressions and brackets". Each is keyboard
 * operable, describes every change in words (aria-live), and never relies on
 * colour alone: matches are marked with ✓ and words as well as a highlight.
 */

import { useState } from "react";
import { Choices, Slider } from "./AlgebraDemos";

const big = { fontSize: "1.15rem" } as const;
const cell = { padding: "6px 10px", border: "1.5px solid var(--line)", textAlign: "center" } as const;
const box = { background: "var(--surface)", border: "1.5px solid var(--line)" } as const;
const neg = (n: number) => (n < 0 ? `−${-n}` : String(n));
/** "x + 3", "x − 4", "x" */
const lin = (p: number, x = "x") => (p === 0 ? x : p > 0 ? `${x} + ${p}` : `${x} − ${-p}`);
/** Signed term after the first: " + 5x", " − 3x", "" for 0. */
const tail = (c: number, v: string) => (c === 0 ? "" : `${c < 0 ? " − " : " + "}${Math.abs(c) === 1 && v ? "" : Math.abs(c)}${v}`);
const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

// ------------------------------------------------------------ vocabulary

const STATEMENTS = [
  { s: "4x + 7", kind: "Expression", why: "There's no = sign. It's a collection of terms you could simplify, but not solve." },
  { s: "4x + 7 = 31", kind: "Equation", why: "It has an = sign and is only true for one value: x = 6. You solve it to find x." },
  { s: "A = lw", kind: "Formula", why: "It's a rule for working out the area A from the length l and width w. A is the subject." },
  { s: "2(x + 5) ≡ 2x + 10", kind: "Identity", why: "Both sides are the same for every value of x. Expand the left side and you get the right side." },
  { s: "3a − 2b + 5", kind: "Expression", why: "No = sign: three terms, 3a, −2b and 5." },
  { s: "v = u + at", kind: "Formula", why: "It links speeds, acceleration and time. Change u, a or t and v changes. v is the subject." },
  { s: "x + x ≡ 2x", kind: "Identity", why: "True for every x: two lots of x is always 2x." },
  { s: "5n − 3 = 2n + 9", kind: "Equation", why: "Only true when n = 4. It has one unknown to find." },
] as const;
const KINDS = ["Expression", "Equation", "Formula", "Identity"] as const;

function VocabSorter() {
  const [i, setI] = useState(0);
  const [guess, setGuess] = useState<string | null>(null);
  const st = STATEMENTS[i];
  return (
    <>
      <p>Look at the statement. Is it an expression, an equation, a formula or an identity? Make your choice to find out.</p>
      <p style={{ fontSize: "1.6rem", fontWeight: 700 }}>{st.s}</p>
      <Choices label="It's a…" options={KINDS} value={(guess ?? "") as (typeof KINDS)[number]} onChange={(g) => setGuess(g)} />
      <div aria-live="polite">
        {guess && (
          <p className={`notice ${guess === st.kind ? "notice-good" : "notice-info"}`} style={big}>
            {guess === st.kind ? `✓ Yes, it's ${st.kind === "Expression" || st.kind === "Equation" || st.kind === "Identity" ? "an" : "a"} ${st.kind.toLowerCase()}. ` : `Not quite: it's ${st.kind === "Formula" ? "a" : "an"} ${st.kind.toLowerCase()}. `}
            {st.why}
          </p>
        )}
      </div>
      <div>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setI((n) => (n + 1) % STATEMENTS.length);
            setGuess(null);
          }}
        >
          Next statement
        </button>
      </div>
    </>
  );
}

// ------------------------------------------------------------ factorising

const FACT_PRESETS = [
  { a: 6, b: 15, x: "x" },
  { a: 12, b: 18, x: "x" },
  { a: 8, b: 20, x: "x" },
  { a: 10, b: 4, x: "x" },
] as const;

function FactoriseArea() {
  const [which, setWhich] = useState(0);
  const { a, b } = FACT_PRESETS[which];
  const hcf = gcd(a, b);
  const choices = Array.from({ length: hcf }, (_, i) => i + 1).filter((k) => a % k === 0 && b % k === 0);
  const [k, setK] = useState(1);
  const f = choices.includes(k) ? k : 1;
  const left = gcd(a / f, b / f);
  const unit = 16;
  const pad = 26;
  const h = f * 10 + 30;
  const w1 = Math.max(70, (a / f) * unit);
  const w2 = Math.max(50, (b / f) * unit * 0.6);
  return (
    <>
      <p>Factorising is expanding backwards. The two parts of the expression are two areas. Choose a number to be the height, and see what the widths must be.</p>
      <Choices
        label="Expression"
        options={FACT_PRESETS.map((_, i) => i)}
        value={which}
        onChange={(v) => {
          setWhich(v);
          setK(1);
        }}
        show={(i) => `${FACT_PRESETS[i].a}x + ${FACT_PRESETS[i].b}`}
      />
      <Choices label="Take out" options={choices} value={f} onChange={setK} />
      <svg viewBox={`0 0 ${w1 + w2 + pad * 2} ${h + pad * 2}`} width={w1 + w2 + pad * 2} style={{ maxWidth: "100%" }} role="img" aria-label={`A rectangle of height ${f}, split into widths ${a / f}x and ${b / f}, with areas ${a}x and ${b}.`}>
        <rect x={pad} y={pad} width={w1} height={h} fill="var(--accent-soft)" stroke="var(--ink)" strokeWidth={2} />
        <rect x={pad + w1} y={pad} width={w2} height={h} fill="var(--surface)" stroke="var(--ink)" strokeWidth={2} />
        <text x={pad + w1 / 2} y={pad - 8} textAnchor="middle" fontSize={16} fill="var(--ink)">{a / f === 1 ? "x" : `${a / f}x`}</text>
        <text x={pad + w1 + w2 / 2} y={pad - 8} textAnchor="middle" fontSize={16} fill="var(--ink)">{b / f}</text>
        <text x={pad - 8} y={pad + h / 2 + 6} textAnchor="end" fontSize={16} fill="var(--ink)">{f}</text>
        <text x={pad + w1 / 2} y={pad + h / 2 + 7} textAnchor="middle" fontSize={18} fontWeight={700} fill="var(--ink)">{a}x</text>
        <text x={pad + w1 + w2 / 2} y={pad + h / 2 + 7} textAnchor="middle" fontSize={18} fontWeight={700} fill="var(--ink)">{b}</text>
      </svg>
      <div aria-live="polite">
        <p style={big}>
          {a}x + {b} = <strong>{f === 1 ? `1(${a}x + ${b})` : `${f}(${a / f === 1 ? "" : a / f}x + ${b / f})`}</strong>
        </p>
        <p className={`notice ${left === 1 && f > 1 ? "notice-good" : "notice-info"}`}>
          {f === 1
            ? "Taking out 1 doesn't change anything. Try a bigger common factor."
            : left === 1
              ? `✓ Fully factorised. ${a / f}x and ${b / f} have no common factor left, so ${f} is the highest common factor.`
              : `Factorised, but not fully: ${a / f}x and ${b / f} still share a factor of ${left}. Try a bigger number.`}
        </p>
      </div>
    </>
  );
}

// ------------------------------------------------------------ index laws

type Law = "multiply" | "divide" | "power";
const LAW_NAMES: Record<Law, string> = { multiply: "Multiply", divide: "Divide", power: "Power of a power" };
const SUPS = "⁰¹²³⁴⁵⁶⁷⁸⁹";
const sup = (n: number) => String(n).split("").map((d) => SUPS[Number(d)]).join("");
const xs = (n: number) => Array(n).fill("x").join(" × ");

function IndexLawsExpand() {
  const [law, setLaw] = useState<Law>("multiply");
  const [a, setA] = useState(3);
  const [b, setB] = useState(2);
  const top = law === "divide" ? Math.max(a, b) : a;
  const bottom = law === "divide" ? Math.min(a, b) : b;
  return (
    <>
      <p>Choose a law and the powers. Each power is written out in full, so you can count the x&apos;s.</p>
      <Choices label="Law" options={["multiply", "divide", "power"] as Law[]} value={law} onChange={setLaw} show={(l) => LAW_NAMES[l]} />
      <div className="grid-2">
        <Slider label="First power" value={a} min={1} max={6} onChange={setA} />
        <Slider label={law === "power" ? "Outside power" : "Second power"} value={b} min={1} max={law === "power" ? 4 : 6} onChange={setB} />
      </div>
      <div aria-live="polite" style={big}>
        {law === "multiply" && (
          <>
            <p>
              x{sup(a)} × x{sup(b)} = ({xs(a)}) × ({xs(b)})
            </p>
            <p>
              That&apos;s {a} + {b} = {a + b} x&apos;s, so <strong>x{sup(a + b)}</strong>. Multiplying: add the powers.
            </p>
          </>
        )}
        {law === "divide" && (
          <>
            <p>
              x{sup(top)} ÷ x{sup(bottom)}: {top} x&apos;s on top, {bottom} underneath.
            </p>
            <p aria-label={`${bottom} pairs cancel, leaving ${top - bottom}`}>
              {Array.from({ length: top }, (_, i) => (
                <span key={i} style={{ textDecoration: i < bottom ? "line-through" : "none", opacity: i < bottom ? 0.55 : 1, marginRight: 8 }}>
                  x
                </span>
              ))}
              <span className="muted">(crossed out: cancelled)</span>
            </p>
            <p>
              {top} − {bottom} = {top - bottom} left, so <strong>{top - bottom === 0 ? "1 (x⁰ = 1)" : `x${top - bottom === 1 ? "" : sup(top - bottom)}`}</strong>. Dividing: subtract the powers.
            </p>
          </>
        )}
        {law === "power" && (
          <>
            <p>
              (x{sup(a)}){sup(b)} = {Array(b).fill(`x${sup(a)}`).join(" × ")}
            </p>
            <p>
              That&apos;s {Array(b).fill(a).join(" + ")} = {a * b} x&apos;s, so <strong>x{sup(a * b)}</strong>. Power of a power: multiply the powers.
            </p>
          </>
        )}
      </div>
    </>
  );
}

// ------------------------------------------------------------ double brackets

function DoubleGrid() {
  const [p, setP] = useState(3);
  const [q, setQ] = useState(5);
  const mid = p + q;
  const answer = `x²${tail(mid, "x")}${tail(p * q, "")}`;
  const term = (c: number) => (c === 0 ? "0" : c === 1 ? "x" : c === -1 ? "−x" : `${neg(c)}x`);
  return (
    <>
      <p>Choose the numbers in each bracket. The grid multiplies every term in one bracket by every term in the other.</p>
      <div className="grid-2">
        <Slider label="First bracket number" value={p} min={-9} max={9} onChange={setP} />
        <Slider label="Second bracket number" value={q} min={-9} max={9} onChange={setQ} />
      </div>
      <p style={{ fontSize: "1.5rem", fontWeight: 700 }}>
        ({lin(p)})({lin(q)})
      </p>
      <table style={{ borderCollapse: "collapse", ...big }} aria-label="Multiplication grid">
        <thead>
          <tr>
            <th style={cell}>×</th>
            <th style={cell}>x</th>
            <th style={cell}>{neg(q)}</th>
          </tr>
        </thead>
        <tbody aria-live="polite">
          <tr>
            <th style={cell}>x</th>
            <td style={{ ...cell, background: "var(--accent-soft)" }}>x²</td>
            <td style={cell}>{term(q)}</td>
          </tr>
          <tr>
            <th style={cell}>{neg(p)}</th>
            <td style={cell}>{term(p)}</td>
            <td style={cell}>{neg(p * q)}</td>
          </tr>
        </tbody>
      </table>
      <p aria-live="polite" style={big}>
        x terms: {term(q)} and {term(p)} make {term(mid)}. Number: {neg(p)} × {p < 0 || q < 0 ? `(${neg(q)})` : q} = {neg(p * q)}.
        <br />
        Answer: <strong>{answer}</strong>
        {mid === 0 && p !== 0 && " The x terms cancel: this is the difference of two squares."}
      </p>
    </>
  );
}

// ------------------------------------------------------------ factorising quadratics

const QUADS = [
  { b: 7, c: 12 },
  { b: 9, c: 20 },
  { b: 2, c: -15 },
  { b: -8, c: 15 },
  { b: -1, c: -12 },
  { b: 0, c: -49 },
] as const;

function pairsOf(c: number): [number, number][] {
  const out: [number, number][] = [];
  const n = Math.abs(c);
  for (let a = 1; a * a <= n; a++) {
    if (n % a !== 0) continue;
    const b = n / a;
    if (c > 0) out.push([a, b], [-a, -b]);
    else out.push([a, -b], [-a, b]);
  }
  return out;
}

function FactorPairFinder() {
  const [i, setI] = useState(0);
  const [showSums, setShowSums] = useState(false);
  const { b, c } = QUADS[i];
  const quad = `x²${tail(b, "x")}${tail(c, "")}`;
  const pairs = pairsOf(c);
  const hit = pairs.find(([m, n]) => m + n === b)!;
  return (
    <>
      <p>To factorise, find two numbers that multiply to the number term and add to the number in front of x. Here are all the pairs that multiply correctly.</p>
      <Choices
        label="Quadratic"
        options={QUADS.map((_, k) => k)}
        value={i}
        onChange={(k) => {
          setI(k);
          setShowSums(false);
        }}
        show={(k) => `x²${tail(QUADS[k].b, "x")}${tail(QUADS[k].c, "")}`}
      />
      <p style={big}>
        Multiply to <strong>{neg(c)}</strong>, add to <strong>{neg(b)}</strong>.
      </p>
      <table style={{ borderCollapse: "collapse", ...big }}>
        <thead>
          <tr>
            <th style={cell}>Pair</th>
            <th style={cell}>Multiply</th>
            <th style={cell}>Add</th>
          </tr>
        </thead>
        <tbody aria-live="polite">
          {pairs.map(([m, n]) => {
            const ok = m + n === b;
            return (
              <tr key={`${m},${n}`} style={showSums && ok ? { background: "var(--good-soft)", fontWeight: 700 } : undefined}>
                <td style={cell}>
                  {neg(m)} and {neg(n)}
                </td>
                <td style={cell}>{neg(m * n)}</td>
                <td style={cell}>{showSums ? `${neg(m + n)}${ok ? " ✓" : ""}` : "?"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div>
        <button type="button" className="btn" aria-pressed={showSums} onClick={() => setShowSums((s) => !s)}>
          {showSums ? "Hide the sums" : "Show the sums"}
        </button>
      </div>
      {showSums && (
        <p aria-live="polite" style={big}>
          {neg(hit[0])} and {neg(hit[1])} add to {neg(b)}. So {quad} = <strong>({lin(hit[0])})({lin(hit[1])})</strong>
        </p>
      )}
    </>
  );
}

// ------------------------------------------------------------ identities

const IDENTITIES = [
  { lhs: "(x + 3)²", rhs: "x² + 6x + 9", L: (x: number) => (x + 3) ** 2, R: (x: number) => x * x + 6 * x + 9, truth: true },
  { lhs: "(x + 3)²", rhs: "x² + 9", L: (x: number) => (x + 3) ** 2, R: (x: number) => x * x + 9, truth: false },
  { lhs: "3(x + 4) − 2(x − 1)", rhs: "x + 14", L: (x: number) => 3 * (x + 4) - 2 * (x - 1), R: (x: number) => x + 14, truth: true },
  { lhs: "3(x + 4) − 2(x − 1)", rhs: "x + 10", L: (x: number) => 3 * (x + 4) - 2 * (x - 1), R: (x: number) => x + 10, truth: false },
  { lhs: "(x + 5)(x − 5)", rhs: "x² − 25", L: (x: number) => (x + 5) * (x - 5), R: (x: number) => x * x - 25, truth: true },
] as const;

function IdentityTester() {
  const [i, setI] = useState(0);
  const [x, setX] = useState(2);
  const id = IDENTITIES[i];
  const l = id.L(x);
  const r = id.R(x);
  return (
    <>
      <p>An identity is true for every value of x. Pick a statement, then move the slider to test different values of x.</p>
      <Choices label="Statement" options={IDENTITIES.map((_, k) => k)} value={i} onChange={setI} show={(k) => `${IDENTITIES[k].lhs} ≡ ${IDENTITIES[k].rhs}?`} />
      <Slider label="x" value={x} min={-5} max={8} onChange={setX} />
      <div aria-live="polite" style={big}>
        <p>
          Left side, {id.lhs}, when x = {neg(x)}: <strong>{neg(l)}</strong>
        </p>
        <p>
          Right side, {id.rhs}, when x = {neg(x)}: <strong>{neg(r)}</strong>
        </p>
        <p className={`notice ${l === r ? "notice-good" : "notice-info"}`}>
          {l === r ? `✓ Equal when x = ${neg(x)}.` : `Different when x = ${neg(x)}, so this is not an identity.`}{" "}
          {l === r && !id.truth && "Careful: equal for this x, but try another value."}
          {l === r && id.truth && "Testing values can only suggest it. To show it's an identity, expand the left side: it becomes exactly the right side."}
        </p>
      </div>
    </>
  );
}

export const EXPRESSION_DEMOS = {
  "vocab-sorter": VocabSorter,
  "factorise-area": FactoriseArea,
  "index-laws-expand": IndexLawsExpand,
  "double-grid": DoubleGrid,
  "factor-pair-finder": FactorPairFinder,
  "identity-tester": IdentityTester,
};
