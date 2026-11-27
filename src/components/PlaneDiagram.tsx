/**
 * Draws a PlaneSpec to scale: equal units on both axes, so a reflection looks
 * like a reflection and a 3 cm radius really is 3 grid squares. Grid, axes,
 * labelled polygons, lines, circles and arcs, points and arrows. Readable by
 * screen readers through the spec's description.
 */
import type { PlaneSpec } from "@/engine/types";

const PAD = 26;

type V = [number, number];

export function PlaneDiagram({ plane, maxWidth = 440, maxHeight = 340 }: { plane: PlaneSpec; maxWidth?: number; maxHeight?: number }) {
  const [x0, x1] = plane.x;
  const [y0, y1] = plane.y;
  const w = x1 - x0 || 1;
  const h = y1 - y0 || 1;
  const scale = Math.min((maxWidth - 2 * PAD) / w, (maxHeight - 2 * PAD) / h, 48);
  const vbW = w * scale + 2 * PAD;
  const vbH = h * scale + 2 * PAD;
  const X = (x: number) => PAD + (x - x0) * scale;
  const Y = (y: number) => PAD + (y1 - y) * scale;
  const S = (p: V): V => [X(p[0]), Y(p[1])];
  const step = plane.axisStep ?? 1;
  const font = Math.max(11, Math.min(15, scale * 0.42));

  const gridLines: React.ReactNode[] = [];
  if (plane.grid) {
    for (let x = Math.ceil(x0); x <= x1; x++) gridLines.push(<line key={`gx${x}`} x1={X(x)} y1={Y(y0)} x2={X(x)} y2={Y(y1)} />);
    for (let y = Math.ceil(y0); y <= y1; y++) gridLines.push(<line key={`gy${y}`} x1={X(x0)} y1={Y(y)} x2={X(x1)} y2={Y(y)} />);
  }

  const axisNums: React.ReactNode[] = [];
  const showX = plane.axes && y0 <= 0 && y1 >= 0;
  const showY = plane.axes && x0 <= 0 && x1 >= 0;
  if (showX) {
    for (let x = Math.ceil(x0 / step) * step; x <= x1; x += step) {
      if (x === 0 || x > x1 - 0.5) continue;
      axisNums.push(<Num key={`nx${x}`} x={X(x)} y={Y(0) + font * 0.95} text={fmt(x)} size={font * 0.85} />);
    }
  }
  if (showY) {
    for (let y = Math.ceil(y0 / step) * step; y <= y1; y += step) {
      if (y === 0 || y > y1 - 0.5) continue;
      axisNums.push(<Num key={`ny${y}`} x={X(0) - font * 0.55} y={Y(y)} text={fmt(y)} size={font * 0.85} anchor="end" />);
    }
  }

  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} width="100%" style={{ maxWidth: vbW }} role="img" aria-label={plane.description} className="shape-diagram plane-diagram">
      <g stroke="var(--line)" strokeWidth={1}>{gridLines}</g>

      {plane.shapes
        ?.filter((s) => s.tone === "region")
        .map((s, k) => <polygon key={`r${k}`} points={s.points.map((p) => S(p).join(",")).join(" ")} fill="var(--accent)" fillOpacity={0.28} stroke="none" />)}

      {(showX || showY) && (
        <g stroke="var(--ink)" strokeWidth={1.6}>
          {showX && <line x1={X(x0)} y1={Y(0)} x2={X(x1) - 2} y2={Y(0)} markerEnd="url(#plane-arrow)" />}
          {showY && <line x1={X(0)} y1={Y(y0)} x2={X(0)} y2={Y(y1) + 2} markerEnd="url(#plane-arrow)" />}
        </g>
      )}
      <defs>
        <marker id="plane-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ink)" />
        </marker>
      </defs>
      {showX && <Num x={X(x1) - 4} y={Y(0) - font * 0.9} text="x" size={font} italic anchor="end" />}
      {showY && <Num x={X(0) + font * 0.7} y={Y(y1) + font * 0.6} text="y" size={font} italic anchor="start" />}
      {showX && showY && <Num x={X(0) - font * 0.5} y={Y(0) + font * 0.95} text="0" size={font * 0.85} anchor="end" />}

      {plane.shapes
        ?.filter((s) => s.tone !== "region")
        .map((s, k) => {
          const image = s.tone === "image";
          const fill = s.tone === "outline" ? "none" : image ? "var(--warn-soft)" : "var(--accent-soft)";
          const stroke = image ? "var(--warn)" : "var(--ink)";
          return (
            <polygon
              key={`s${k}`}
              points={s.points.map((p) => S(p).join(",")).join(" ")}
              fill={fill}
              fillOpacity={0.85}
              stroke={stroke}
              strokeWidth={2.5}
              strokeDasharray={s.dashed ? "6 5" : undefined}
              strokeLinejoin="round"
            />
          );
        })}

      {axisNums}

      {plane.arcs?.map((a, k) => {
        const r = a.r * scale;
        const [cx, cy] = S(a.c);
        const style = { fill: "none", stroke: "var(--ink)", strokeOpacity: a.faint ? 0.55 : 1, strokeWidth: a.faint ? 1.5 : 2.2, strokeDasharray: a.dashed ? "6 5" : undefined };
        if (a.from === undefined || a.to === undefined) return <circle key={`a${k}`} cx={cx} cy={cy} r={r} {...style} />;
        let sweep = a.to - a.from;
        while (sweep <= 0) sweep += 360;
        const p1 = S([a.c[0] + a.r * Math.cos(rad(a.from)), a.c[1] + a.r * Math.sin(rad(a.from))]);
        const p2 = S([a.c[0] + a.r * Math.cos(rad(a.from + sweep)), a.c[1] + a.r * Math.sin(rad(a.from + sweep))]);
        // Anticlockwise in real units is sweep-flag 0 on screen (y is flipped).
        return <path key={`a${k}`} d={`M ${p1[0]} ${p1[1]} A ${r} ${r} 0 ${sweep > 180 ? 1 : 0} 0 ${p2[0]} ${p2[1]}`} {...style} />;
      })}

      {plane.lines?.map((l, k) => {
        const [ax, ay] = S(l.a);
        const [bx, by] = S(l.b);
        const mirror = l.tone === "mirror";
        return (
          <line
            key={`l${k}`}
            x1={ax}
            y1={ay}
            x2={bx}
            y2={by}
            stroke={mirror ? "var(--accent)" : "var(--ink)"}
            strokeOpacity={l.tone === "faint" ? 0.5 : 1}
            strokeWidth={mirror ? 3.5 : l.tone === "faint" ? 1.5 : 2.4}
            strokeDasharray={l.dashed ? "8 6" : undefined}
            strokeLinecap="round"
          />
        );
      })}

      {plane.arrows?.map((a, k) => {
        const [ax, ay] = S(a.from);
        const [bx, by] = S(a.to);
        const len = Math.hypot(bx - ax, by - ay) || 1;
        const ux = (bx - ax) / len;
        const uy = (by - ay) / len;
        const head = 11;
        const l: V = [bx - ux * head - uy * head * 0.55, by - uy * head + ux * head * 0.55];
        const r: V = [bx - ux * head + uy * head * 0.55, by - uy * head - ux * head * 0.55];
        return (
          <g key={`ar${k}`} stroke="var(--warn)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <line x1={ax} y1={ay} x2={bx} y2={by} />
            <polyline points={`${l.join(",")} ${bx},${by} ${r.join(",")}`} />
          </g>
        );
      })}

      {plane.lengths?.map((t, k) => {
        const [ax, ay] = S(t.a);
        const [bx, by] = S(t.b);
        const len = Math.hypot(bx - ax, by - ay) || 1;
        let nx = -(by - ay) / len;
        let ny = (bx - ax) / len;
        // Put the label on the side away from the middle of the shapes, so it sits outside them.
        const all = (plane.shapes ?? []).flatMap((sh) => sh.points).map(S);
        const mid: V = all.length ? [all.reduce((t, p) => t + p[0], 0) / all.length, all.reduce((t, p) => t + p[1], 0) / all.length] : [(ax + bx) / 2, 0];
        if (((ax + bx) / 2 - mid[0]) * nx + ((ay + by) / 2 - mid[1]) * ny < 0) {
          nx = -nx;
          ny = -ny;
        }
        return <Num key={`len${k}`} x={(ax + bx) / 2 + nx * 16} y={(ay + by) / 2 + ny * 16} text={t.text} size={font} bold />;
      })}

      {plane.points?.map((p, k) => {
        const [px, py] = S(p.at);
        return <circle key={`p${k}`} cx={px} cy={py} r={4.5} fill={p.hollow ? "var(--surface)" : "var(--ink)"} stroke="var(--ink)" strokeWidth={2} />;
      })}

      {plane.lines?.map((l, k) =>
        l.label ? <LineLabel key={`ll${k}`} a={S(l.a)} b={S(l.b)} text={l.label} size={font} mirror={l.tone === "mirror"} /> : null,
      )}

      {plane.points?.map((p, k) => {
        if (!p.label) return null;
        const [px, py] = S(p.at);
        return <Num key={`pl${k}`} x={px + 8} y={py - 12} text={p.label} size={font} bold anchor="start" />;
      })}

      {plane.texts?.map((t, k) => {
        const [tx, ty] = S(t.at);
        return <Num key={`tx${k}`} x={tx} y={ty} text={t.text} size={font} bold />;
      })}

      {plane.shapes?.map((s, k) => {
        if (!s.label) return null;
        const [cx, cy] = S(labelSpot(s.points));
        return <Num key={`sl${k}`} x={cx} y={cy} text={s.label} size={font * 1.1} bold />;
      })}
    </svg>
  );
}

const rad = (d: number) => (d * Math.PI) / 180;
const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1)).replace("-", "−");

/**
 * A spot inside the polygon for its label: the centroid if it's inside,
 * otherwise the centre of the largest unit square fully inside.
 */
export function labelSpot(points: [number, number][]): [number, number] {
  const c: [number, number] = [points.reduce((s, p) => s + p[0], 0) / points.length, points.reduce((s, p) => s + p[1], 0) / points.length];
  if (inside(c, points)) return c;
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  for (let x = Math.min(...xs) + 0.5; x < Math.max(...xs); x += 0.5)
    for (let y = Math.min(...ys) + 0.5; y < Math.max(...ys); y += 0.5) if (inside([x, y], points)) return [x, y];
  return c;
}

function inside([x, y]: [number, number], pts: [number, number][]): boolean {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

function LineLabel({ a, b, text, size, mirror }: { a: V; b: V; text: string; size: number; mirror: boolean }) {
  // Near the end of the line that is higher up (or further right), nudged off the line.
  const [p, q] = a[1] < b[1] || (a[1] === b[1] && a[0] > b[0]) ? [a, b] : [b, a];
  const len = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
  const ux = (q[0] - p[0]) / len;
  const uy = (q[1] - p[1]) / len;
  const at: V = [p[0] + ux * 16 + (Math.abs(uy) > 0.9 ? 8 : -uy * 12), p[1] + uy * 16 + (Math.abs(uy) > 0.9 ? 0 : -12)];
  return (
    <text
      x={at[0]}
      y={at[1]}
      textAnchor={Math.abs(uy) > 0.9 ? "start" : "middle"}
      dominantBaseline="middle"
      fontSize={size}
      fontWeight={700}
      fill={mirror ? "var(--accent)" : "var(--ink)"}
      paintOrder="stroke"
      stroke="var(--surface)"
      strokeWidth={4}
    >
      {text}
    </text>
  );
}

function Num({ x, y, text, size, anchor = "middle", bold = false, italic = false }: { x: number; y: number; text: string; size: number; anchor?: "start" | "middle" | "end"; bold?: boolean; italic?: boolean }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      dominantBaseline="middle"
      fontSize={size}
      fontWeight={bold ? 700 : 500}
      fontStyle={italic ? "italic" : "normal"}
      fill="var(--ink)"
      paintOrder="stroke"
      stroke="var(--surface)"
      strokeWidth={3.5}
    >
      {text}
    </text>
  );
}
