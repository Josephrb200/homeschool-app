/**
 * Pyramids, cones and spheres, drawn to scale in the same style as
 * SolidDiagram: the base is squashed into an oblique view, hidden edges dashed,
 * and optional labels for lengths. Readable by screen readers through the
 * description.
 */
import type { SolidSpec } from "@/engine/types";
import { Label } from "./CircleDiagram";

const PAD = 40;
const SQUASH = 0.35;

type Pyramid = Extract<SolidSpec, { kind: "pyramid" }>;
type Cone = Extract<SolidSpec, { kind: "cone" }>;
type Sphere = Extract<SolidSpec, { kind: "sphere" }>;
type P = [number, number];

export function PyramidDiagram({ solid, maxWidth, maxHeight }: { solid: Pyramid; maxWidth: number; maxHeight: number }) {
  const { size, h } = solid;
  // Base corners in plan (x across, d into the page), then squashed: screen y = −z − d·SQUASH, x shifted by d·0.5.
  const plan: P[] =
    solid.base === "square"
      ? [
          [0, 0],
          [size, 0],
          [size, size],
          [0, size],
        ]
      : [
          [0, 0],
          [size, 0],
          [size * 0.62, size * 0.85],
        ];
  const proj = ([x, d]: P, z = 0): P => [x + d * 0.45, z + d * SQUASH];
  const base = plan.map((p) => proj(p));
  const cx = plan.reduce((t, p) => t + p[0], 0) / plan.length;
  const cd = plan.reduce((t, p) => t + p[1], 0) / plan.length;
  const foot = proj([cx, cd]);
  const apex = proj([cx, cd], h);
  const all = [...base, apex];
  const minX = Math.min(...all.map((p) => p[0]));
  const maxX = Math.max(...all.map((p) => p[0]));
  const minY = Math.min(...all.map((p) => p[1]));
  const maxY = Math.max(...all.map((p) => p[1]));
  const scale = Math.min((maxWidth - 2 * PAD - 60) / (maxX - minX), (maxHeight - 2 * PAD) / (maxY - minY), 45);
  const X = (x: number) => PAD + (x - minX) * scale;
  const Y = (y: number) => PAD + (maxY - y) * scale;
  const S = (p: P) => `${X(p[0])},${Y(p[1])}`;
  const vbW = (maxX - minX) * scale + 2 * PAD + 60;
  const vbH = (maxY - minY) * scale + 2 * PAD;
  // Hidden: the back corner of a square base (index 3) and its edges; for a triangle, the back corner's base edges.
  const back = solid.base === "square" ? 3 : 2;
  const n = base.length;
  const edges: { a: P; b: P; hidden: boolean }[] = [];
  for (let i = 0; i < n; i++) edges.push({ a: base[i], b: base[(i + 1) % n], hidden: i === back || (i + 1) % n === back });
  for (let i = 0; i < n; i++) edges.push({ a: base[i], b: apex, hidden: i === back });
  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} width="100%" style={{ maxWidth: vbW }} role="img" aria-label={solid.description} className="shape-diagram solid-diagram">
      <polygon points={[base[0], base[1], apex].map(S).join(" ")} fill="var(--accent-soft)" />
      <polygon points={[base[1], base[2 % n], apex].map(S).join(" ")} fill="var(--line)" fillOpacity={0.6} />
      {edges.map((e, k) => (
        <line key={k} x1={X(e.a[0])} y1={Y(e.a[1])} x2={X(e.b[0])} y2={Y(e.b[1])} stroke="var(--ink)" strokeOpacity={e.hidden ? 0.55 : 1} strokeWidth={e.hidden ? 1.5 : 2.5} strokeDasharray={e.hidden ? "5 5" : undefined} strokeLinecap="round" />
      ))}
      {solid.hText && (
        <>
          <line x1={X(foot[0])} y1={Y(foot[1])} x2={X(apex[0])} y2={Y(apex[1])} stroke="var(--ink)" strokeWidth={2} strokeDasharray="6 5" />
          <Label x={X(foot[0]) + 8} y={Y((foot[1] + apex[1]) / 2)} anchor="start" text={solid.hText} />
        </>
      )}
      {solid.baseText && <Label x={X((base[0][0] + base[1][0]) / 2)} y={Y(base[0][1]) + 18} text={solid.baseText} />}
      {solid.slantText && <Label x={X((base[1][0] + apex[0]) / 2) + 10} y={Y((base[1][1] + apex[1]) / 2)} anchor="start" text={solid.slantText} />}
    </svg>
  );
}

export function ConeDiagram({ solid, maxWidth, maxHeight }: { solid: Cone; maxWidth: number; maxHeight: number }) {
  const { r, h } = solid;
  const scale = Math.min((maxWidth - 2 * PAD - 70) / (2 * r), (maxHeight - 2 * PAD) / (h + r * SQUASH), 40);
  const rx = r * scale;
  const ry = r * scale * SQUASH;
  const vbW = 2 * rx + 2 * PAD + 70;
  const vbH = h * scale + ry + 2 * PAD;
  const cx = PAD + rx;
  const apexY = PAD;
  const baseY = PAD + h * scale;
  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} width="100%" style={{ maxWidth: vbW }} role="img" aria-label={solid.description} className="shape-diagram solid-diagram">
      <path d={`M ${cx - rx} ${baseY} L ${cx} ${apexY} L ${cx + rx} ${baseY} A ${rx} ${ry} 0 0 1 ${cx - rx} ${baseY} Z`} fill="var(--accent-soft)" />
      <path d={`M ${cx - rx} ${baseY} A ${rx} ${ry} 0 0 1 ${cx + rx} ${baseY}`} fill="none" stroke="var(--ink)" strokeOpacity={0.55} strokeWidth={1.5} strokeDasharray="5 5" />
      <path d={`M ${cx - rx} ${baseY} A ${rx} ${ry} 0 0 0 ${cx + rx} ${baseY}`} fill="none" stroke="var(--ink)" strokeWidth={2.5} />
      <polyline points={`${cx - rx},${baseY} ${cx},${apexY} ${cx + rx},${baseY}`} fill="none" stroke="var(--ink)" strokeWidth={2.5} strokeLinejoin="round" />
      <circle cx={cx} cy={baseY} r={3} fill="var(--ink)" />
      {solid.rText && (
        <>
          <line x1={cx} y1={baseY} x2={cx + rx} y2={baseY} stroke="var(--ink)" strokeWidth={2} />
          <Label x={cx + rx / 2} y={baseY + ry + 14} text={solid.rText} />
        </>
      )}
      {solid.hText && (
        <>
          <line x1={cx} y1={baseY} x2={cx} y2={apexY} stroke="var(--ink)" strokeWidth={2} strokeDasharray="6 5" />
          <Label x={cx - 8} y={(apexY + baseY) / 2} anchor="end" text={solid.hText} />
        </>
      )}
      {solid.slantText && <Label x={cx + rx / 2 + 12} y={(apexY + baseY) / 2} anchor="start" text={solid.slantText} />}
    </svg>
  );
}

export function SphereDiagram({ solid, maxWidth }: { solid: Sphere; maxWidth: number }) {
  const size = Math.min(maxWidth - 2 * PAD, 220);
  const R = size / 2;
  const cx = PAD + R;
  const cy = PAD + R;
  const vbW = size + 2 * PAD;
  const vbH = solid.half ? R + R * SQUASH + 2 * PAD : size + 2 * PAD;
  const ry = R * SQUASH;
  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} width="100%" style={{ maxWidth: vbW }} role="img" aria-label={solid.description} className="shape-diagram solid-diagram">
      {solid.half ? (
        <>
          <path d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy} A ${R} ${ry} 0 0 1 ${cx - R} ${cy} Z`} fill="var(--accent-soft)" stroke="var(--ink)" strokeWidth={2.5} />
          <path d={`M ${cx - R} ${cy} A ${R} ${ry} 0 0 1 ${cx + R} ${cy}`} fill="none" stroke="var(--ink)" strokeOpacity={0.55} strokeWidth={1.5} strokeDasharray="5 5" />
        </>
      ) : (
        <>
          <circle cx={cx} cy={cy} r={R} fill="var(--accent-soft)" stroke="var(--ink)" strokeWidth={2.5} />
          <path d={`M ${cx - R} ${cy} A ${R} ${ry} 0 0 0 ${cx + R} ${cy}`} fill="none" stroke="var(--ink)" strokeWidth={1.5} />
          <path d={`M ${cx - R} ${cy} A ${R} ${ry} 0 0 1 ${cx + R} ${cy}`} fill="none" stroke="var(--ink)" strokeOpacity={0.55} strokeWidth={1.5} strokeDasharray="5 5" />
        </>
      )}
      <circle cx={cx} cy={cy} r={3} fill="var(--ink)" />
      {solid.rText && (
        <>
          <line x1={cx} y1={cy} x2={cx + R} y2={cy} stroke="var(--ink)" strokeWidth={2} />
          <Label x={cx + R / 2} y={cy - 14} text={solid.rText} />
        </>
      )}
    </svg>
  );
}
