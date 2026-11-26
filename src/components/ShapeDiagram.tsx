/**
 * Draws a labelled shape to scale: sides, dashed perpendicular heights,
 * right-angle marks and an optional counting grid. Readable by screen readers
 * through the shape's description.
 */
import { useId } from "react";
import type { ShapeSpec } from "@/engine/types";

const PADX = 70; // room for labels left and right of the shape
const PADY = 30; // and above and below

export function ShapeDiagram({
  shape,
  maxWidth = 420,
  maxHeight = 260,
  fixedScale,
}: {
  shape: ShapeSpec;
  maxWidth?: number;
  maxHeight?: number;
  /** Pixels per unit, to draw several shapes at the same scale. */
  fixedScale?: number;
}) {
  const xs = shape.points.map((p) => p[0]);
  const ys = shape.points.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const w = maxX - minX || 1;
  const h = maxY - minY || 1;
  const scale = fixedScale ?? Math.min((maxWidth - 2 * PADX) / w, (maxHeight - 2 * PADY) / h, 60);
  const vbW = w * scale + 2 * PADX;
  const vbH = h * scale + 2 * PADY;

  // Real units (y up) to SVG (y down).
  const X = (x: number) => PADX + (x - minX) * scale;
  const Y = (y: number) => PADY + (maxY - y) * scale;
  const cx = xs.reduce((a, b) => a + b, 0) / xs.length;
  const cy = ys.reduce((a, b) => a + b, 0) / ys.length;

  const n = shape.points.length;
  const clipId = useId().replace(/:/g, "");
  const poly = shape.points.map(([x, y]) => `${X(x)},${Y(y)}`).join(" ");
  const tick = Math.min(12, scale * 0.5);

  return (
    <svg
      viewBox={`0 0 ${vbW} ${vbH}`}
      width="100%"
      style={{ maxWidth: vbW }}
      role="img"
      aria-label={shape.description}
      className="shape-diagram"
    >
      <defs>
        <clipPath id={clipId}>
          <polygon points={poly} />
        </clipPath>
      </defs>
      <polygon points={poly} fill="var(--accent-soft)" />
      {shape.grid && (
        <g stroke="var(--ink)" strokeOpacity={0.25} strokeWidth={1} clipPath={`url(#${clipId})`}>
          {Array.from({ length: w + 1 }, (_, i) => (
            <line key={`v${i}`} x1={X(minX + i)} y1={Y(minY)} x2={X(minX + i)} y2={Y(maxY)} />
          ))}
          {Array.from({ length: h + 1 }, (_, i) => (
            <line key={`h${i}`} x1={X(minX)} y1={Y(minY + i)} x2={X(maxX)} y2={Y(minY + i)} />
          ))}
        </g>
      )}
      <polygon
        points={poly}
        fill="none"
        stroke="var(--ink)"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {shape.right?.map(([x, y], k) => (
        <polyline
          key={`r${k}`}
          points={`${X(x) + tick},${Y(y)} ${X(x) + tick},${Y(y) - tick} ${X(x)},${Y(y) - tick}`}
          fill="none"
          stroke="var(--ink)"
          strokeWidth={1.5}
        />
      ))}
      {shape.heights?.map((ht, k) => {
        const top = Math.max(ht.y1, ht.y2);
        const foot = Math.min(ht.y1, ht.y2);
        return (
          <g key={`h${k}`}>
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
      {shape.sides.map((s) => {
        const [x1, y1] = shape.points[s.i];
        const [x2, y2] = shape.points[(s.i + 1) % n];
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        // Unit normal pointing away from the middle of the shape.
        let nx = -(y2 - y1);
        let ny = x2 - x1;
        const len = Math.hypot(nx, ny) || 1;
        nx /= len;
        ny /= len;
        if (nx * (mx - cx) + ny * (my - cy) < 0) {
          nx = -nx;
          ny = -ny;
        }
        const off = 16;
        const px = X(mx) + nx * off;
        const py = Y(my) - ny * off;
        const anchor = Math.abs(nx) < 0.3 ? "middle" : nx > 0 ? "start" : "end";
        return <Label key={`s${s.i}`} x={px} y={py} anchor={anchor} text={s.text} />;
      })}
    </svg>
  );
}

function Label({ x, y, anchor, text }: { x: number; y: number; anchor: "start" | "middle" | "end"; text: string }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      dominantBaseline="middle"
      fontSize={16}
      fontWeight={600}
      fill="var(--ink)"
      paintOrder="stroke"
      stroke="var(--surface)"
      strokeWidth={4}
    >
      {text}
    </text>
  );
}
