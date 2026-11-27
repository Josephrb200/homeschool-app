"use client";

/**
 * Draws a coordinate grid to scale: axes, numbered gridlines, straight lines
 * and curves (from lists of points), and labelled points marked with crosses.
 *
 * Pure maths grids (no axis titles) use the same scale on both axes, so a
 * gradient of 1 really looks like 45°. Real-life graphs (with axis titles)
 * fill a fixed box, because their axes measure different things.
 *
 * With `onPick`, the student can answer by choosing a grid point: click it, or
 * use the arrow keys to move the cursor and press Enter or Space.
 */

import { useId, useState } from "react";
import type { GraphSpec } from "@/engine/types";
import { showPoint } from "@/engine/point";

const fmt = (n: number) => {
  const r = Math.round(n * 1000) / 1000;
  return r < 0 ? `−${-r}` : String(r);
};

function ticks(min: number, max: number, step: number): number[] {
  const out: number[] = [];
  const start = Math.ceil(min / step - 1e-9) * step;
  for (let v = start; v <= max + 1e-9; v += step) out.push(Math.round(v * 1e6) / 1e6);
  return out;
}

const onLabel = (v: number, labelStep: number) => Math.abs(v / labelStep - Math.round(v / labelStep)) < 1e-6;

export function GraphDiagram({
  graph,
  maxWidth = 440,
  onPick,
  picked,
}: {
  graph: GraphSpec;
  maxWidth?: number;
  onPick?: (p: [number, number]) => void;
  picked?: [number, number] | null;
}) {
  const clipId = useId().replace(/:/g, "");
  const { x: ax, y: ay } = graph;
  const titled = !!(ax.label || ay.label);
  const L = titled ? 64 : 28;
  const B = titled ? 54 : 26;
  const T = 16;
  const R = titled ? 20 : 26;
  const xr = ax.max - ax.min;
  const yr = ay.max - ay.min;
  let plotW: number;
  let plotH: number;
  if (titled) {
    plotW = 360;
    plotH = 270;
  } else {
    const unit = Math.min(380 / xr, 340 / yr, 40);
    plotW = unit * xr;
    plotH = unit * yr;
    // A very tall, thin grid is hard to read: widen it (the x scale then differs from y).
    if (plotW < 240) plotW = 240;
  }
  const W = L + plotW + R;
  const H = T + plotH + B;
  const X = (v: number) => L + ((v - ax.min) / xr) * plotW;
  const Y = (v: number) => T + plotH - ((v - ay.min) / yr) * plotH;
  // Axes cross at 0 when 0 is on the grid, otherwise sit on the edge.
  const x0 = ax.min <= 0 && ax.max >= 0 ? 0 : ax.min;
  const y0 = ay.min <= 0 && ay.max >= 0 ? 0 : ay.min;
  const xs = ticks(ax.min, ax.max, ax.step);
  const ys = ticks(ay.min, ay.max, ay.step);
  const xLabelStep = ax.labelStep ?? ax.step;
  const yLabelStep = ay.labelStep ?? ay.step;
  const originShared = x0 === 0 && y0 === 0;

  const [cursor, setCursor] = useState<[number, number]>(() => picked ?? [x0, y0]);
  const snap = (v: number, axis: typeof ax) => Math.min(axis.max, Math.max(axis.min, Math.round(v / axis.step) * axis.step));

  function clickAt(e: React.MouseEvent<SVGSVGElement>) {
    if (!onPick) return;
    const svg = e.currentTarget;
    const m = svg.getScreenCTM();
    if (!m) return;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    const vx = ax.min + ((pt.x - L) / plotW) * xr;
    const vy = ay.min + ((T + plotH - pt.y) / plotH) * yr;
    const p: [number, number] = [snap(vx, ax), snap(vy, ay)];
    setCursor(p);
    onPick(p);
  }

  function key(e: React.KeyboardEvent<SVGSVGElement>) {
    if (!onPick) return;
    const [cx, cy] = cursor;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [snap(cx - ax.step, ax), cy],
      ArrowRight: [snap(cx + ax.step, ax), cy],
      ArrowUp: [cx, snap(cy + ay.step, ay)],
      ArrowDown: [cx, snap(cy - ay.step, ay)],
    };
    if (moves[e.key]) {
      e.preventDefault();
      setCursor(moves[e.key]);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onPick(cursor);
    }
  }

  const cross = (px: number, py: number, k: string, size = 5, stroke = "var(--ink)") => (
    <g key={k} stroke={stroke} strokeWidth={2.4} strokeLinecap="round">
      <line x1={X(px) - size} y1={Y(py) - size} x2={X(px) + size} y2={Y(py) + size} />
      <line x1={X(px) - size} y1={Y(py) + size} x2={X(px) + size} y2={Y(py) - size} />
    </g>
  );

  return (
    <div className="graph-wrap" style={{ maxWidth: Math.min(maxWidth, Math.round(W * 1.15)) }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role={onPick ? "application" : "img"}
        aria-label={onPick ? `${graph.description} Click a point on the grid, or use the arrow keys and press Enter.` : graph.description}
        className="shape-diagram graph-diagram"
        tabIndex={onPick ? 0 : undefined}
        onClick={onPick ? clickAt : undefined}
        onKeyDown={onPick ? key : undefined}
        style={onPick ? { cursor: "crosshair" } : undefined}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={L} y={T} width={plotW} height={plotH} />
          </clipPath>
        </defs>
        {xs.map((v) => (
          <line key={`gx${v}`} x1={X(v)} x2={X(v)} y1={T} y2={T + plotH} stroke="var(--line)" strokeWidth={onLabel(v, xLabelStep) ? 1.2 : 0.6} />
        ))}
        {ys.map((v) => (
          <line key={`gy${v}`} x1={L} x2={L + plotW} y1={Y(v)} y2={Y(v)} stroke="var(--line)" strokeWidth={onLabel(v, yLabelStep) ? 1.2 : 0.6} />
        ))}
        {/* axes */}
        <line x1={L} x2={L + plotW} y1={Y(y0)} y2={Y(y0)} stroke="var(--ink)" strokeWidth={2} />
        <line x1={X(x0)} x2={X(x0)} y1={T} y2={T + plotH} stroke="var(--ink)" strokeWidth={2} />
        {xs.filter((v) => onLabel(v, xLabelStep) && !(originShared && v === 0)).map((v) => (
          <text key={`lx${v}`} x={X(v)} y={Y(y0) + 17} textAnchor="middle" fontSize={13} fill="var(--ink)" stroke="var(--surface)" strokeWidth={3} paintOrder="stroke">
            {fmt(v)}
          </text>
        ))}
        {ys.filter((v) => onLabel(v, yLabelStep) && !(originShared && v === 0)).map((v) => (
          <text key={`ly${v}`} x={X(x0) - 6} y={Y(v) + 4.5} textAnchor="end" fontSize={13} fill="var(--ink)" stroke="var(--surface)" strokeWidth={3} paintOrder="stroke">
            {fmt(v)}
          </text>
        ))}
        {originShared && (titled || plotW / xr >= 28) && (
          <text x={X(0) - 6} y={Y(0) + 17} textAnchor="end" fontSize={13} fill="var(--ink)">
            0
          </text>
        )}
        {titled ? (
          <>
            <text x={L + plotW / 2} y={H - 10} textAnchor="middle" fontSize={14} fontWeight={600} fill="var(--ink)">
              {ax.label ?? "x"}
            </text>
            <text x={16} y={T + plotH / 2} textAnchor="middle" fontSize={14} fontWeight={600} fill="var(--ink)" transform={`rotate(-90 16 ${T + plotH / 2})`}>
              {ay.label ?? "y"}
            </text>
          </>
        ) : (
          <>
            <text x={L + plotW + 8} y={Y(y0) + 5} fontSize={15} fontStyle="italic" fontWeight={600} fill="var(--ink)">
              x
            </text>
            <text x={X(x0)} y={T - 4} textAnchor="middle" fontSize={15} fontStyle="italic" fontWeight={600} fill="var(--ink)">
              y
            </text>
          </>
        )}
        <g clipPath={`url(#${clipId})`}>
          {graph.curves?.map((c, i) => (
            <polyline
              key={`c${i}`}
              points={c.points.map(([px, py]) => `${X(px)},${Y(py)}`).join(" ")}
              fill="none"
              stroke={c.highlight ? "var(--accent)" : "var(--ink)"}
              strokeWidth={c.highlight ? 3.2 : 2.4}
              strokeDasharray={c.dashed ? "7 6" : undefined}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
        </g>
        {graph.curves?.map((c, i) =>
          c.label ? (
            <text key={`cl${i}`} x={X(c.label.at[0])} y={Y(c.label.at[1])} fontSize={14} fontWeight={600} fill={c.highlight ? "var(--accent)" : "var(--ink)"} stroke="var(--surface)" strokeWidth={4} paintOrder="stroke">
              {c.label.text}
            </text>
          ) : null,
        )}
        {graph.points?.map((p, i) => (
          <g key={`p${i}`}>
            {cross(p.at[0], p.at[1], `pc${i}`)}
            {p.label && (
              <text x={X(p.at[0]) + 8} y={Y(p.at[1]) - 7} fontSize={16} fontWeight={700} fill="var(--ink)" stroke="var(--surface)" strokeWidth={4} paintOrder="stroke">
                {p.label}
              </text>
            )}
          </g>
        ))}
        {onPick && (
          <>
            <circle cx={X(cursor[0])} cy={Y(cursor[1])} r={9} fill="none" stroke="var(--focus, var(--accent))" strokeWidth={2} strokeDasharray="3 3" className="graph-cursor" />
            {picked && cross(picked[0], picked[1], "picked", 7, "var(--accent)")}
          </>
        )}
      </svg>
      {onPick && (
        <p className="hint" aria-live="polite">
          {picked ? `You chose ${showPoint(picked)}.` : `Cursor at ${showPoint(cursor)}.`}
        </p>
      )}
    </div>
  );
}
