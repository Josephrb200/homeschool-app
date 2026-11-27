/**
 * Draws a statistics chart or table exactly from its numbers: a table (with
 * optional tally marks), bar chart, pictogram, pie chart or scatter graph.
 * Tables are real HTML tables so screen readers can move around them; charts
 * are SVGs labelled by their description. Shapes and labels carry the
 * meaning, never colour alone.
 */
import type { ChartSpec } from "@/engine/types";

type Of<T extends ChartSpec["type"]> = Extract<ChartSpec, { type: T }>;

export function ChartDiagram({ chart, maxWidth = 440 }: { chart: ChartSpec; maxWidth?: number }) {
  if (chart.type === "table") return <DataTable chart={chart} />;
  if (chart.type === "bar") return <BarChart chart={chart} maxWidth={maxWidth} />;
  if (chart.type === "pictogram") return <Pictogram chart={chart} maxWidth={maxWidth} />;
  if (chart.type === "pie") return <PieChart chart={chart} maxWidth={Math.min(maxWidth, 360)} />;
  return <ScatterGraph chart={chart} maxWidth={maxWidth} />;
}

// ------------------------------------------------------------------ tables

/** Tally marks: groups of four upright strokes crossed by a fifth. */
export function Tally({ n }: { n: number }) {
  const groups = Math.floor(n / 5);
  const rest = n % 5;
  const gw = 34;
  const width = Math.max(10, groups * gw + rest * 7 + 4);
  return (
    <svg width={width} height={24} viewBox={`0 0 ${width} 24`} role="img" aria-label={`tally of ${n}`} style={{ verticalAlign: "middle" }}>
      {Array.from({ length: groups }, (_, g) => (
        <g key={g} stroke="var(--ink)" strokeWidth={2} strokeLinecap="round">
          {[0, 1, 2, 3].map((k) => (
            <line key={k} x1={4 + g * gw + k * 6} y1={3} x2={4 + g * gw + k * 6} y2={21} />
          ))}
          <line x1={g * gw} y1={18} x2={g * gw + 26} y2={6} />
        </g>
      ))}
      {Array.from({ length: rest }, (_, k) => (
        <line key={k} x1={4 + groups * gw + k * 7} y1={3} x2={4 + groups * gw + k * 7} y2={21} stroke="var(--ink)" strokeWidth={2} strokeLinecap="round" />
      ))}
    </svg>
  );
}

function DataTable({ chart }: { chart: Of<"table"> }) {
  return (
    <table className="data-table" aria-label={chart.description}>
      <thead>
        <tr>
          {chart.headers.map((h) => (
            <th key={h} scope="col">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {chart.rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) =>
              j === 0 ? (
                <th key={j} scope="row">
                  {cell}
                </th>
              ) : (
                <td key={j}>{j === chart.tallyColumn && typeof cell === "number" ? <Tally n={cell} /> : cell}</td>
              ),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ------------------------------------------------------------------ axes

function niceMax(max: number, step: number) {
  return Math.max(step, Math.ceil(max / step) * step);
}

// ------------------------------------------------------------------ bar chart

function BarChart({ chart, maxWidth }: { chart: Of<"bar">; maxWidth: number }) {
  const W = 440;
  const H = 280;
  const L = 56;
  const R = 12;
  const T = 14;
  const B = 58;
  const top = niceMax(Math.max(...chart.values) + chart.yStep / 2, chart.yStep);
  const plotH = H - T - B;
  const plotW = W - L - R;
  const y = (v: number) => T + plotH - (v / top) * plotH;
  const slot = plotW / chart.categories.length;
  const bw = Math.min(56, slot * 0.6);
  // Minor gridlines at half steps when the step is even, so half-way values can be read.
  const minor = chart.yStep % 2 === 0 ? chart.yStep / 2 : 0;
  const lines: number[] = [];
  for (let v = 0; v <= top + 1e-9; v += minor || chart.yStep) lines.push(v);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth }} role="img" aria-label={chart.description} className="shape-diagram chart-diagram">
      {lines.map((v) => {
        const major = Math.abs(v / chart.yStep - Math.round(v / chart.yStep)) < 1e-9;
        return (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeWidth={major ? 1.2 : 0.6} strokeDasharray={major ? undefined : "3 3"} />
            {major && (
              <text x={L - 8} y={y(v) + 5} textAnchor="end" fontSize={14} fill="var(--ink)">
                {v}
              </text>
            )}
          </g>
        );
      })}
      {chart.values.map((v, i) => {
        const cx = L + slot * i + slot / 2;
        return (
          <g key={i}>
            <rect x={cx - bw / 2} y={y(v)} width={bw} height={y(0) - y(v)} fill="var(--accent)" stroke="var(--ink)" strokeWidth={1.5} />
            <text x={cx} y={H - B + 20} textAnchor="middle" fontSize={14} fill="var(--ink)">
              {chart.categories[i]}
            </text>
          </g>
        );
      })}
      <line x1={L} x2={L} y1={T} y2={y(0)} stroke="var(--ink)" strokeWidth={2} />
      <line x1={L} x2={W - R} y1={y(0)} y2={y(0)} stroke="var(--ink)" strokeWidth={2} />
      <text x={L + plotW / 2} y={H - 8} textAnchor="middle" fontSize={14} fontWeight={600} fill="var(--ink)">
        {chart.xLabel}
      </text>
      <text x={16} y={T + plotH / 2} textAnchor="middle" fontSize={14} fontWeight={600} fill="var(--ink)" transform={`rotate(-90 16 ${T + plotH / 2})`}>
        {chart.yLabel}
      </text>
    </svg>
  );
}

// ------------------------------------------------------------------ pictogram

function Symbol({ x, y, half }: { x: number; y: number; half?: boolean }) {
  const r = 12;
  if (half) return <path d={`M ${x} ${y - r} A ${r} ${r} 0 0 0 ${x} ${y + r} Z`} fill="var(--accent)" stroke="var(--ink)" strokeWidth={1.5} />;
  return <circle cx={x} cy={y} r={r} fill="var(--accent)" stroke="var(--ink)" strokeWidth={1.5} />;
}

function Pictogram({ chart, maxWidth }: { chart: Of<"pictogram">; maxWidth: number }) {
  const rowH = 38;
  const labelW = 110;
  const maxSymbols = Math.max(...chart.values.map((v) => Math.ceil(v / chart.perSymbol)), 1);
  const W = Math.max(320, labelW + maxSymbols * 30 + 20);
  const H = chart.categories.length * rowH + 52;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth }} role="img" aria-label={chart.description} className="shape-diagram chart-diagram">
      {chart.categories.map((c, i) => {
        const yy = 8 + i * rowH;
        const whole = Math.floor(chart.values[i] / chart.perSymbol);
        const half = chart.values[i] % chart.perSymbol !== 0;
        return (
          <g key={c}>
            <rect x={0} y={yy} width={W} height={rowH} fill="none" stroke="var(--line)" />
            <text x={10} y={yy + rowH / 2 + 5} fontSize={15} fill="var(--ink)">
              {c}
            </text>
            <line x1={labelW - 8} x2={labelW - 8} y1={yy} y2={yy + rowH} stroke="var(--line)" />
            {Array.from({ length: whole }, (_, k) => (
              <Symbol key={k} x={labelW + 10 + k * 30} y={yy + rowH / 2} />
            ))}
            {half && <Symbol x={labelW + 10 + whole * 30} y={yy + rowH / 2} half />}
          </g>
        );
      })}
      <g>
        <Symbol x={22} y={H - 20} />
        <text x={42} y={H - 15} fontSize={15} fontWeight={600} fill="var(--ink)">
          Key: one circle stands for {chart.perSymbol} {chart.unit}
        </text>
      </g>
    </svg>
  );
}

// ------------------------------------------------------------------ pie chart

const PIE_FILLS = ["var(--accent-soft)", "var(--warn-soft)", "var(--good-soft)", "var(--sunk)", "var(--surface)", "var(--accent-soft)"];

function PieChart({ chart, maxWidth }: { chart: Of<"pie">; maxWidth: number }) {
  const W = 360;
  const H = 300;
  const cx = W / 2;
  const cy = H / 2;
  const r = 118;
  // Angles measured clockwise from 12 o'clock.
  const pt = (deg: number, rr = r): [number, number] => [cx + rr * Math.sin((deg * Math.PI) / 180), cy - rr * Math.cos((deg * Math.PI) / 180)];
  let start = 0;
  const fmt = (a: number) => (Number.isInteger(a) ? String(a) : a.toFixed(1));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth }} role="img" aria-label={chart.description} className="shape-diagram chart-diagram">
      {chart.sectors.map((s, i) => {
        const a0 = start;
        const a1 = start + s.angle;
        start = a1;
        const [x0, y0] = pt(a0);
        const [x1, y1] = pt(a1);
        const large = s.angle > 180 ? 1 : 0;
        const mid = (a0 + a1) / 2;
        const inside = s.angle >= 40;
        const [lx, ly] = pt(mid, inside ? r * 0.6 : r + 26);
        const d = s.angle >= 360 ? undefined : `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
        const angleText = chart.hideAngle === i ? "?" : `${fmt(s.angle)}°`;
        return (
          <g key={i}>
            {d ? (
              <path d={d} fill={PIE_FILLS[i % PIE_FILLS.length]} stroke="var(--ink)" strokeWidth={2} strokeLinejoin="round" />
            ) : (
              <circle cx={cx} cy={cy} r={r} fill={PIE_FILLS[0]} stroke="var(--ink)" strokeWidth={2} />
            )}
            {s.angle > 0 && (
              <text x={lx} y={ly - (chart.showAngles ? 3 : -5)} textAnchor="middle" fontSize={inside ? 15 : 13} fontWeight={600} fill="var(--ink)">
                {s.label}
              </text>
            )}
            {s.angle > 0 && chart.showAngles && (
              <text x={lx} y={ly + 15} textAnchor="middle" fontSize={inside ? 15 : 13} fill="var(--ink)">
                {angleText}
              </text>
            )}
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={3} fill="var(--ink)" />
    </svg>
  );
}

// ------------------------------------------------------------------ scatter graph

function ScatterGraph({ chart, maxWidth }: { chart: Of<"scatter">; maxWidth: number }) {
  const W = 440;
  const H = 330;
  const L = 60;
  const R = 16;
  const T = 14;
  const B = 56;
  const plotW = W - L - R;
  const plotH = H - T - B;
  const x = (v: number) => L + (v / chart.xMax) * plotW;
  const y = (v: number) => T + plotH - (v / chart.yMax) * plotH;
  const xs: number[] = [];
  for (let v = 0; v <= chart.xMax + 1e-9; v += chart.xStep) xs.push(v);
  const ys: number[] = [];
  for (let v = 0; v <= chart.yMax + 1e-9; v += chart.yStep) ys.push(v);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth }} role="img" aria-label={chart.description} className="shape-diagram chart-diagram">
      {xs.map((v) => (
        <g key={`x${v}`}>
          <line x1={x(v)} x2={x(v)} y1={T} y2={y(0)} stroke="var(--line)" strokeWidth={1} />
          <text x={x(v)} y={y(0) + 18} textAnchor="middle" fontSize={13} fill="var(--ink)">
            {v}
          </text>
        </g>
      ))}
      {ys.map((v) => (
        <g key={`y${v}`}>
          <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeWidth={1} />
          <text x={L - 8} y={y(v) + 5} textAnchor="end" fontSize={13} fill="var(--ink)">
            {v}
          </text>
        </g>
      ))}
      <line x1={L} x2={L} y1={T} y2={y(0)} stroke="var(--ink)" strokeWidth={2} />
      <line x1={L} x2={W - R} y1={y(0)} y2={y(0)} stroke="var(--ink)" strokeWidth={2} />
      {chart.points.map(([px, py], i) => (
        <g key={i} stroke="var(--ink)" strokeWidth={2.2} strokeLinecap="round">
          <line x1={x(px) - 5} y1={y(py) - 5} x2={x(px) + 5} y2={y(py) + 5} />
          <line x1={x(px) - 5} y1={y(py) + 5} x2={x(px) + 5} y2={y(py) - 5} />
        </g>
      ))}
      {chart.highlight !== undefined && chart.points[chart.highlight] && (
        <circle cx={x(chart.points[chart.highlight][0])} cy={y(chart.points[chart.highlight][1])} r={11} fill="none" stroke="var(--accent)" strokeWidth={3} />
      )}
      {chart.letters?.map(({ i, text }) => {
        const p = chart.points[i];
        if (!p) return null;
        return (
          <text key={text} x={x(p[0]) + 9} y={y(p[1]) - 8} fontSize={16} fontWeight={700} fill="var(--ink)">
            {text}
          </text>
        );
      })}
      <text x={L + plotW / 2} y={H - 10} textAnchor="middle" fontSize={14} fontWeight={600} fill="var(--ink)">
        {chart.xLabel}
      </text>
      <text x={16} y={T + plotH / 2} textAnchor="middle" fontSize={14} fontWeight={600} fill="var(--ink)" transform={`rotate(-90 16 ${T + plotH / 2})`}>
        {chart.yLabel}
      </text>
    </svg>
  );
}
