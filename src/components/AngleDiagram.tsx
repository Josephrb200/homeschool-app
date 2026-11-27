/**
 * Draws an angle diagram to scale: lines, angle arcs with labels, right-angle
 * squares, equal-side ticks, parallel arrows and point letters. Readable by
 * screen readers through the spec's description.
 */
import type { AngleSpec } from "@/engine/types";

const PAD = 44;

type V = [number, number];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1]];
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1]];
const mul = (a: V, k: number): V => [a[0] * k, a[1] * k];
const unit = (a: V): V => {
  const l = Math.hypot(a[0], a[1]) || 1;
  return [a[0] / l, a[1] / l];
};

/**
 * The angle mark's start direction and signed sweep (radians, screen coordinates
 * with y down, so positive = clockwise on screen). Picks the smaller angle unless
 * `reflex`.
 */
export function markSweep(at: V, from: V, to: V, reflex = false) {
  const a1 = Math.atan2(from[1] - at[1], from[0] - at[0]);
  const a2 = Math.atan2(to[1] - at[1], to[0] - at[0]);
  let d = a2 - a1;
  while (d <= -Math.PI) d += 2 * Math.PI;
  while (d > Math.PI) d -= 2 * Math.PI;
  // A straight angle could go either way: draw it anticlockwise on screen from "from".
  if (Math.abs(Math.abs(d) - Math.PI) < 1e-6) d = -Math.PI;
  if (reflex) d = d > 0 ? d - 2 * Math.PI : d + 2 * Math.PI;
  return { start: a1, sweep: d };
}

export function AngleDiagram({ spec, maxWidth = 420, maxHeight = 280 }: { spec: AngleSpec; maxWidth?: number; maxHeight?: number }) {
  const pts = Object.values(spec.points);
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const w = maxX - minX || 1;
  const h = maxY - minY || 1;
  const scale = Math.min((maxWidth - 2 * PAD) / w, (maxHeight - 2 * PAD) / h);
  const vbW = w * scale + 2 * PAD;
  const vbH = h * scale + 2 * PAD;
  const S = (name: string): V => {
    const p = spec.points[name];
    if (!p) throw new Error(`AngleDiagram: no point ${name}`);
    return [PAD + (p[0] - minX) * scale, PAD + (maxY - p[1]) * scale];
  };

  // Centre used to push point letters outward.
  const ref = (spec.polygon ?? Object.keys(spec.points)).map(S);
  const centre: V = [ref.reduce((s, p) => s + p[0], 0) / ref.length, ref.reduce((s, p) => s + p[1], 0) / ref.length];

  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} width="100%" style={{ maxWidth: vbW }} role="img" aria-label={spec.description} className="shape-diagram angle-diagram">
      {spec.polygon && <polygon points={spec.polygon.map((n) => S(n).join(",")).join(" ")} fill="var(--accent-soft)" stroke="none" />}

      {spec.angles.map((m, k) => {
        const at = S(m.at);
        const u1 = unit(sub(S(m.from), at));
        const u2 = unit(sub(S(m.to), at));
        if (m.right) {
          const t = 15;
          const a = add(at, mul(u1, t));
          const b = add(add(at, mul(u1, t)), mul(u2, t));
          const c = add(at, mul(u2, t));
          return (
            <polyline
              key={`m${k}`}
              points={`${a.join(",")} ${b.join(",")} ${c.join(",")}`}
              fill={m.highlight ? "var(--accent)" : "none"}
              fillOpacity={0.5}
              stroke={m.highlight ? "var(--accent)" : "var(--ink)"}
              strokeWidth={m.highlight ? 3 : 1.5}
            />
          );
        }
        const { start, sweep } = markSweep(at, S(m.from), S(m.to), m.reflex);
        const deg = Math.abs((sweep * 180) / Math.PI);
        // Neighbouring marks at the same corner get different radii, so each arc reads as its own angle.
        const nth = spec.angles.slice(0, k).filter((o) => o.at === m.at && !o.right).length;
        const r = (deg < 25 ? 58 : deg < 45 ? 44 : deg < 100 ? 30 : 25) + (nth % 2) * 9;
        const p1: V = [at[0] + r * Math.cos(start), at[1] + r * Math.sin(start)];
        const p2: V = [at[0] + r * Math.cos(start + sweep), at[1] + r * Math.sin(start + sweep)];
        const large = Math.abs(sweep) > Math.PI ? 1 : 0;
        const sweepFlag = sweep > 0 ? 1 : 0;
        const mid = start + sweep / 2;
        // Far enough out that the label clears both arms, even in a thin angle.
        const half = 4.8 * (m.text?.length ?? 0) + 5;
        const lr = Math.min(Math.max(r + 4 + 0.5 * half, (half + 4) / Math.sin(Math.min(Math.abs(sweep) / 2, Math.PI / 2))), 105);
        return (
          <g key={`m${k}`}>
            <path
              d={`M ${at[0]} ${at[1]} L ${p1[0]} ${p1[1]} A ${r} ${r} 0 ${large} ${sweepFlag} ${p2[0]} ${p2[1]} Z`}
              fill={m.highlight ? "var(--accent)" : "none"}
              fillOpacity={0.45}
              stroke="none"
            />
            <path
              d={`M ${p1[0]} ${p1[1]} A ${r} ${r} 0 ${large} ${sweepFlag} ${p2[0]} ${p2[1]}`}
              fill="none"
              stroke={m.highlight ? "var(--accent)" : "var(--ink)"}
              strokeWidth={m.highlight ? 3.5 : 2}
            />
            {m.text && <Label x={at[0] + lr * Math.cos(mid)} y={at[1] + lr * Math.sin(mid)} text={m.text} />}
          </g>
        );
      })}

      {spec.segments.map(([a, b], k) => {
        const p = S(a);
        const q = S(b);
        return <line key={`s${k}`} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke="var(--ink)" strokeWidth={2.5} strokeLinecap="round" />;
      })}

      {spec.ticks?.map((t, k) => {
        const p = S(t.a);
        const q = S(t.b);
        const u = unit(sub(q, p));
        const n: V = [-u[1], u[0]];
        // When the side also has parallel arrows, move the ticks aside so they don't overlap.
        const arrow = spec.arrows?.find((a) => (a.a === t.a && a.b === t.b) || (a.a === t.b && a.b === t.a));
        const m = add(mul(add(p, q), 0.5), arrow ? mul(unit(sub(S(arrow.b), S(arrow.a))), -16) : [0, 0]);
        return (
          <g key={`t${k}`} stroke="var(--ink)" strokeWidth={2}>
            {Array.from({ length: t.n }, (_, i) => {
              const c = add(m, mul(u, (i - (t.n - 1) / 2) * 6));
              const e1 = add(c, mul(n, 8));
              const e2 = add(c, mul(n, -8));
              return <line key={i} x1={e1[0]} y1={e1[1]} x2={e2[0]} y2={e2[1]} />;
            })}
          </g>
        );
      })}

      {spec.arrows?.map((t, k) => {
        const p = S(t.a);
        const q = S(t.b);
        const u = unit(sub(q, p));
        const n: V = [-u[1], u[0]];
        const both = spec.ticks?.some((a) => (a.a === t.a && a.b === t.b) || (a.a === t.b && a.b === t.a));
        const m = add(mul(add(p, q), 0.5), mul(u, both ? 10 : 0));
        return (
          <g key={`a${k}`} stroke="var(--ink)" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round">
            {Array.from({ length: t.n }, (_, i) => {
              const tip = add(m, mul(u, (i - (t.n - 1) / 2) * 9 + 5));
              const back = add(tip, mul(u, -9));
              const l = add(back, mul(n, 6));
              const r = add(back, mul(n, -6));
              return <polyline key={i} points={`${l.join(",")} ${tip.join(",")} ${r.join(",")}`} />;
            })}
          </g>
        );
      })}

      {spec.lengths?.map((t, k) => {
        const p = S(t.a);
        const q = S(t.b);
        const u = unit(sub(q, p));
        let n: V = [-u[1], u[0]];
        const m = mul(add(p, q), 0.5);
        if ((m[0] - centre[0]) * n[0] + (m[1] - centre[1]) * n[1] < 0) n = mul(n, -1);
        const at = add(m, mul(n, 18 + 3 * t.text.length * Math.abs(n[0])));
        return <Label key={`l${k}`} x={at[0]} y={at[1]} text={t.text} />;
      })}

      {spec.dots?.map((d) => {
        const p = S(d);
        return <circle key={`d${d}`} cx={p[0]} cy={p[1]} r={4} fill="var(--ink)" />;
      })}

      {spec.labels?.map((name) => {
        const p = S(name);
        let dir = sub(p, centre);
        if (Math.hypot(dir[0], dir[1]) < 1) dir = [-1, -1];
        const at = add(p, mul(unit(dir), 18));
        return <Label key={`p${name}`} x={at[0]} y={at[1]} text={name} italic />;
      })}
    </svg>
  );
}

function Label({ x, y, text, italic = false }: { x: number; y: number; text: string; italic?: boolean }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={17}
      fontWeight={700}
      fontStyle={italic ? "italic" : "normal"}
      fill="var(--ink)"
      paintOrder="stroke"
      stroke="var(--surface)"
      strokeWidth={4}
    >
      {text}
    </text>
  );
}
