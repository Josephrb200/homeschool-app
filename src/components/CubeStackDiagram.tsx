/**
 * A solid made of unit cubes, drawn in oblique projection like the other
 * solids: the front is true shape, depth goes back up and to the right.
 * Cubes are painted back to front so nearer cubes cover further ones.
 */
import type { CubeStackSpec } from "@/engine/types";

const ANG = (35 * Math.PI) / 180;
const DX = Math.cos(ANG) * 0.55;
const DY = Math.sin(ANG) * 0.55;
const PAD = 34;

export function CubeStackDiagram({ spec, maxWidth = 420, maxHeight = 280 }: { spec: CubeStackSpec; maxWidth?: number; maxHeight?: number }) {
  const rows = spec.heights.length;
  const cols = Math.max(...spec.heights.map((r) => r.length));
  const top = Math.max(1, ...spec.heights.flat());
  const w = cols + rows * DX;
  const h = top + rows * DY;
  const extra = spec.showFront ? 30 : 0;
  const scale = Math.min((maxWidth - 2 * PAD - (spec.showSide ? 50 : 0)) / w, (maxHeight - 2 * PAD - extra) / h, 46);
  const P = (c: number, r: number, z: number): [number, number] => [PAD + (c + r * DX) * scale, PAD + (h - z - r * DY) * scale];
  const pts = (q: [number, number][]) => q.map((p) => p.join(",")).join(" ");
  const cubes: [number, number, number][] = [];
  for (let r = rows - 1; r >= 0; r--) for (let c = 0; c < cols; c++) for (let z = 0; z < (spec.heights[r][c] ?? 0); z++) cubes.push([c, r, z]);
  const vbW = w * scale + 2 * PAD + (spec.showSide ? 50 : 0);
  const vbH = h * scale + 2 * PAD + extra;
  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} width="100%" style={{ maxWidth: vbW }} role="img" aria-label={spec.description} className="shape-diagram cubes-diagram">
      <g stroke="var(--ink)" strokeWidth={1.6} strokeLinejoin="round">
        {cubes.map(([c, r, z], k) => (
          <g key={k}>
            <polygon points={pts([P(c, r, z + 1), P(c + 1, r, z + 1), P(c + 1, r + 1, z + 1), P(c, r + 1, z + 1)])} fill="var(--surface)" />
            <polygon points={pts([P(c + 1, r, z), P(c + 1, r + 1, z), P(c + 1, r + 1, z + 1), P(c + 1, r, z + 1)])} fill="var(--line)" />
            <polygon points={pts([P(c, r, z), P(c + 1, r, z), P(c + 1, r, z + 1), P(c, r, z + 1)])} fill="var(--accent-soft)" />
          </g>
        ))}
      </g>
      {spec.showFront && (
        <g>
          <line x1={P(cols / 2, 0, 0)[0]} y1={P(cols / 2, 0, 0)[1] + 30} x2={P(cols / 2, 0, 0)[0]} y2={P(cols / 2, 0, 0)[1] + 8} stroke="var(--warn)" strokeWidth={2.5} markerEnd="url(#cube-arrow)" />
          <text x={P(cols / 2, 0, 0)[0] + 8} y={P(cols / 2, 0, 0)[1] + 26} fontSize={14} fontWeight={700} fill="var(--warn)">
            Front
          </text>
        </g>
      )}
      {spec.showSide && (
        <g>
          <line x1={P(cols, rows / 2, top / 2)[0] + 42} y1={P(cols, rows / 2, top / 2)[1]} x2={P(cols, rows / 2, top / 2)[0] + 10} y2={P(cols, rows / 2, top / 2)[1]} stroke="var(--warn)" strokeWidth={2.5} markerEnd="url(#cube-arrow)" />
          <text x={P(cols, rows / 2, top / 2)[0] + 14} y={P(cols, rows / 2, top / 2)[1] - 10} fontSize={14} fontWeight={700} fill="var(--warn)">
            Side
          </text>
        </g>
      )}
      <defs>
        <marker id="cube-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--warn)" />
        </marker>
      </defs>
    </svg>
  );
}
