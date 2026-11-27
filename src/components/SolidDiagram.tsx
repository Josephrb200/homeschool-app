/**
 * Draws a 3D solid (a prism, cuboid or cylinder) in oblique projection: the
 * front face is drawn true to scale and the depth goes back up and to the right
 * at half scale, the way textbooks draw them. Hidden edges are dashed.
 * Readable by screen readers through the description.
 */
import type { SolidSpec } from "@/engine/types";
import { Label } from "./CircleDiagram";

const PAD = 46;
const PADX = 70; // room for side labels
const ANGLE = (35 * Math.PI) / 180;
const DEPTH = 0.5; // depth drawn at half scale
const VX = Math.cos(ANGLE) * DEPTH;
const VY = Math.sin(ANGLE) * DEPTH;

type P = [number, number];

export function SolidDiagram({ solid, maxWidth = 420, maxHeight = 280 }: { solid: SolidSpec; maxWidth?: number; maxHeight?: number }) {
  return solid.kind === "cylinder" ? <Cylinder solid={solid} maxWidth={maxWidth} maxHeight={maxHeight} /> : <Prism solid={solid} maxWidth={maxWidth} maxHeight={maxHeight} />;
}

function Prism({ solid, maxWidth, maxHeight }: { solid: Extract<SolidSpec, { kind: "prism" }>; maxWidth: number; maxHeight: number }) {
  const face = solid.face;
  // Work anticlockwise so outward normals are consistent.
  let signed = 0;
  face.points.forEach(([x1, y1], i) => {
    const [x2, y2] = face.points[(i + 1) % face.points.length];
    signed += x1 * y2 - x2 * y1;
  });
  const ccw = signed > 0;
  const F: P[] = face.points;
  const n = F.length;
  const L = solid.length;
  const B: P[] = F.map(([x, y]) => [x + L * VX, y + L * VY]);

  const all = [...F, ...B];
  const minX = Math.min(...all.map((p) => p[0]));
  const maxX = Math.max(...all.map((p) => p[0]));
  const minY = Math.min(...all.map((p) => p[1]));
  const maxY = Math.max(...all.map((p) => p[1]));
  const scale = Math.min((maxWidth - 2 * PADX) / (maxX - minX || 1), (maxHeight - 2 * PAD) / (maxY - minY || 1), 50);
  const vbW = (maxX - minX) * scale + 2 * PADX;
  const vbH = (maxY - minY) * scale + 2 * PAD;
  const X = (x: number) => PADX + (x - minX) * scale;
  const Y = (y: number) => PAD + (maxY - y) * scale;
  const pt = (p: P) => `${X(p[0])},${Y(p[1])}`;

  // Outward normal of front edge i, and whether its side face can be seen.
  const normal = (i: number): P => {
    const [x1, y1] = F[i];
    const [x2, y2] = F[(i + 1) % n];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    return ccw ? [dy / len, -dx / len] : [-dy / len, dx / len];
  };
  const visible = Array.from({ length: n }, (_, i) => {
    const [nx, ny] = normal(i);
    return nx * VX + ny * VY > 1e-9;
  });

  const hidden: [P, P][] = [];
  const shown: [P, P][] = [];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    (visible[i] ? shown : hidden).push([B[i], B[j]]);
    (visible[i] || visible[(i - 1 + n) % n] ? shown : hidden).push([F[i], B[i]]);
  }

  const cubeLines: [P, P][] = [];
  if (solid.cubes && n === 4) {
    const w = Math.max(...F.map((p) => p[0])) - Math.min(...F.map((p) => p[0]));
    const h = Math.max(...F.map((p) => p[1])) - Math.min(...F.map((p) => p[1]));
    const x0 = Math.min(...F.map((p) => p[0]));
    const y0 = Math.min(...F.map((p) => p[1]));
    const proj = (x: number, y: number, z: number): P => [x0 + x + z * VX, y0 + y + z * VY];
    for (let i = 1; i < w; i++) cubeLines.push([proj(i, 0, 0), proj(i, h, 0)], [proj(i, h, 0), proj(i, h, L)]);
    for (let i = 1; i < h; i++) cubeLines.push([proj(0, i, 0), proj(w, i, 0)], [proj(w, i, 0), proj(w, i, L)]);
    for (let k = 1; k < L; k++) cubeLines.push([proj(0, h, k), proj(w, h, k)], [proj(w, 0, k), proj(w, h, k)]);
  }

  const tick = Math.min(11, scale * 0.45);

  // The depth label sits on the visible connector furthest down and to the right.
  let li = -1;
  for (let i = 0; i < n; i++) {
    if (!(visible[i] || visible[(i - 1 + n) % n])) continue;
    if (li < 0 || F[i][0] - F[i][1] * 0.01 > F[li][0] - F[li][1] * 0.01 || (F[i][0] === F[li][0] && F[i][1] < F[li][1])) li = i;
  }

  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} width="100%" style={{ maxWidth: vbW }} role="img" aria-label={solid.description} className="shape-diagram solid-diagram">
      {visible.map((v, i) =>
        v ? <polygon key={`f${i}`} points={[F[i], F[(i + 1) % n], B[(i + 1) % n], B[i]].map(pt).join(" ")} fill="var(--line)" fillOpacity={0.6} /> : null,
      )}
      <polygon points={F.map(pt).join(" ")} fill="var(--accent-soft)" />
      <g stroke="var(--ink)" strokeOpacity={0.3} strokeWidth={1}>
        {cubeLines.map(([a, b], k) => (
          <line key={`c${k}`} x1={X(a[0])} y1={Y(a[1])} x2={X(b[0])} y2={Y(b[1])} />
        ))}
      </g>
      <g stroke="var(--ink)" strokeOpacity={0.55} strokeWidth={1.5} strokeDasharray="5 5">
        {hidden.map(([a, b], k) => (
          <line key={`h${k}`} x1={X(a[0])} y1={Y(a[1])} x2={X(b[0])} y2={Y(b[1])} />
        ))}
      </g>
      <g stroke="var(--ink)" strokeWidth={2.5} strokeLinecap="round">
        {shown.map(([a, b], k) => (
          <line key={`s${k}`} x1={X(a[0])} y1={Y(a[1])} x2={X(b[0])} y2={Y(b[1])} />
        ))}
      </g>
      <polygon points={F.map(pt).join(" ")} fill="none" stroke="var(--ink)" strokeWidth={2.5} strokeLinejoin="round" />
      {face.right?.map(([x, y], k) => (
        <polyline
          key={`r${k}`}
          points={`${X(x) + tick},${Y(y)} ${X(x) + tick},${Y(y) - tick} ${X(x)},${Y(y) - tick}`}
          fill="none"
          stroke="var(--ink)"
          strokeWidth={1.5}
        />
      ))}
      {face.heights?.map((ht, k) => {
        const top = Math.max(ht.y1, ht.y2);
        const foot = Math.min(ht.y1, ht.y2);
        return (
          <g key={`ht${k}`}>
            <line x1={X(ht.x)} y1={Y(top)} x2={X(ht.x)} y2={Y(foot)} stroke="var(--ink)" strokeWidth={2} strokeDasharray="6 5" />
            <polyline
              points={`${X(ht.x) + tick},${Y(foot)} ${X(ht.x) + tick},${Y(foot) - tick} ${X(ht.x)},${Y(foot) - tick}`}
              fill="none"
              stroke="var(--ink)"
              strokeWidth={1.5}
            />
            <Label x={X(ht.x) + 8} y={Y((top + foot) / 2)} anchor="start" text={ht.text} />
          </g>
        );
      })}
      {face.sides.map((s) => {
        const [x1, y1] = F[s.i];
        const [x2, y2] = F[(s.i + 1) % n];
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        // Outside the shape. Next to a visible side face the label sits on that face, with a halo so it stays readable.
        const [nx, ny] = normal(s.i);
        const off = 16;
        const px = X(mx) + nx * off;
        const py = Y(my) - ny * off;
        const anchor = Math.abs(nx) < 0.3 ? "middle" : nx > 0 ? "start" : "end";
        return <Label key={`l${s.i}`} x={px} y={py} anchor={anchor} text={s.text} />;
      })}
      {solid.lengthText && li >= 0 && (
        <Label
          x={X(F[li][0] + (L * VX) / 2) + 12}
          y={Y(F[li][1] + (L * VY) / 2) + 14}
          anchor="start"
          text={solid.lengthText}
        />
      )}
    </svg>
  );
}

function Cylinder({ solid, maxWidth, maxHeight }: { solid: Extract<SolidSpec, { kind: "cylinder" }>; maxWidth: number; maxHeight: number }) {
  const { r, h } = solid;
  const squash = 0.35;
  const scale = Math.min((maxWidth - 2 * PAD - 40) / (2 * r), (maxHeight - 2 * PAD) / (h + 2 * r * squash), 40);
  const rx = r * scale;
  const ry = r * scale * squash;
  const vbW = 2 * rx + 2 * PAD + 40;
  const vbH = h * scale + 2 * ry + 2 * PAD;
  const cx = PAD + rx;
  const top = PAD + ry;
  const bottom = top + h * scale;
  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} width="100%" style={{ maxWidth: vbW }} role="img" aria-label={solid.description} className="shape-diagram solid-diagram">
      <path d={`M ${cx - rx} ${top} L ${cx - rx} ${bottom} A ${rx} ${ry} 0 0 0 ${cx + rx} ${bottom} L ${cx + rx} ${top} Z`} fill="var(--line)" fillOpacity={0.6} />
      <path d={`M ${cx - rx} ${bottom} A ${rx} ${ry} 0 0 1 ${cx + rx} ${bottom}`} fill="none" stroke="var(--ink)" strokeOpacity={0.55} strokeWidth={1.5} strokeDasharray="5 5" />
      <path d={`M ${cx - rx} ${bottom} A ${rx} ${ry} 0 0 0 ${cx + rx} ${bottom}`} fill="none" stroke="var(--ink)" strokeWidth={2.5} />
      <line x1={cx - rx} y1={top} x2={cx - rx} y2={bottom} stroke="var(--ink)" strokeWidth={2.5} />
      <line x1={cx + rx} y1={top} x2={cx + rx} y2={bottom} stroke="var(--ink)" strokeWidth={2.5} />
      <ellipse cx={cx} cy={top} rx={rx} ry={ry} fill="var(--accent-soft)" stroke="var(--ink)" strokeWidth={2.5} />
      <circle cx={cx} cy={top} r={3} fill="var(--ink)" />
      {solid.label.on === "radius" ? (
        <line x1={cx} y1={top} x2={cx + rx} y2={top} stroke="var(--ink)" strokeWidth={2} />
      ) : (
        <line x1={cx - rx} y1={top} x2={cx + rx} y2={top} stroke="var(--ink)" strokeWidth={2} />
      )}
      <Label x={solid.label.on === "radius" ? cx + rx / 2 : cx} y={top - ry - 14} text={solid.label.text} />
      <Label x={cx + rx + 10} y={(top + bottom) / 2} anchor="start" text={solid.hText} />
    </svg>
  );
}
