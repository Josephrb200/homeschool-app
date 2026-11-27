/**
 * A number line, optionally showing an inequality: a filled circle where the
 * number is included (≤, ≥), an open circle where it isn't (<, >), and a thick
 * line over every value that fits, with an arrow if it goes on forever.
 * Circles differ by fill and the description says which, so nothing relies on colour.
 */
import type { NumberLineSpec } from "@/engine/types";

export function NumberLine({ line, maxWidth = 460 }: { line: NumberLineSpec; maxWidth?: number }) {
  const { min, max, lower, upper } = line;
  const pad = 26;
  const step = Math.max(28, Math.min(46, 420 / (max - min)));
  const W = pad * 2 + step * (max - min);
  const H = 78;
  const y = 34;
  const X = (v: number) => pad + (v - min) * step;
  const ticks = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const from = lower ? X(lower.value) : pad - 14;
  const to = upper ? X(upper.value) : W - pad + 14;
  const shaded = lower || upper;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth }} role="img" aria-label={line.description} className="shape-diagram">
      <line x1={pad - 16} y1={y} x2={W - pad + 16} y2={y} stroke="var(--ink)" strokeWidth={1.6} />
      <path d={`M ${pad - 20} ${y} l 8 -5 v 10 Z`} fill="var(--ink)" />
      <path d={`M ${W - pad + 20} ${y} l -8 -5 v 10 Z`} fill="var(--ink)" />
      {ticks.map((v) => (
        <g key={v}>
          <line x1={X(v)} y1={y - 6} x2={X(v)} y2={y + 6} stroke="var(--ink)" strokeWidth={1.4} />
          <text x={X(v)} y={y + 26} textAnchor="middle" fontSize={15} fill="var(--ink)">
            {v < 0 ? `−${-v}` : v}
          </text>
        </g>
      ))}
      {shaded && (
        <>
          <line x1={from} y1={y} x2={to} y2={y} stroke="var(--accent)" strokeWidth={6} strokeLinecap="butt" />
          {!lower && <path d={`M ${pad - 24} ${y} l 12 -8 v 16 Z`} fill="var(--accent)" />}
          {!upper && <path d={`M ${W - pad + 24} ${y} l -12 -8 v 16 Z`} fill="var(--accent)" />}
        </>
      )}
      {[lower, upper].map((b, i) =>
        b ? <circle key={i} cx={X(b.value)} cy={y} r={7} fill={b.inclusive ? "var(--accent)" : "var(--surface)"} stroke="var(--accent)" strokeWidth={3} /> : null,
      )}
    </svg>
  );
}
