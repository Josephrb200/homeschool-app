/**
 * Draws a circle with some of its parts: centre, radius, diameter, chord,
 * tangent, arc, sector, segment or the circumference. Each part has a fixed
 * place so the drawing is always tidy. One part can be highlighted.
 * Readable by screen readers through the description.
 */
import type { CirclePart, CircleSpec } from "@/engine/types";

const W = 340;
const H = 270;
const CX = 170;
const CY = 135;
const R = 100;
const rad = (deg: number) => (deg * Math.PI) / 180;
/** Point on the circle at an angle in degrees (anticlockwise from 3 o'clock). */
const at = (deg: number, r = R): [number, number] => [CX + r * Math.cos(rad(deg)), CY - r * Math.sin(rad(deg))];

/** Where each part sits, in degrees. */
const RADIUS_DEG = 35;
const CHORD: [number, number] = [205, 335];
const TANGENT_DEG = 130;
const ARC: [number, number] = [65, 110];
const SECTOR: [number, number] = [-25, 25];

export function CircleDiagram({ circle, maxWidth = 360 }: { circle: CircleSpec; maxWidth?: number }) {
  const has = (p: CirclePart) => circle.parts.some((x) => x.part === p) || circle.highlight === p;
  const text = (p: CirclePart) => circle.parts.find((x) => x.part === p)?.text;
  const hi = (p: CirclePart) => circle.highlight === p;
  const stroke = (p: CirclePart) => (hi(p) ? "var(--accent)" : "var(--ink)");
  const width = (p: CirclePart) => (hi(p) ? 6 : 2.5);

  const arcPath = (a: number, b: number, r = R) => {
    const [x1, y1] = at(a, r);
    const [x2, y2] = at(b, r);
    const large = ((b - a + 360) % 360) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 0 ${x2} ${y2}`;
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth }} role="img" aria-label={circle.description} className="shape-diagram circle-diagram">
      <circle cx={CX} cy={CY} r={R} fill="var(--accent-soft)" />

      {has("sector") && (
        <path
          d={`M ${CX} ${CY} L ${at(SECTOR[0]).join(" ")} ${arcPath(SECTOR[0], SECTOR[1]).replace(/^M [^A]+/, "")} Z`}
          fill={hi("sector") ? "var(--accent)" : "var(--surface)"}
          fillOpacity={hi("sector") ? 0.55 : 1}
          stroke="var(--ink)"
          strokeWidth={2}
        />
      )}
      {has("segment") && (
        <path
          d={`${arcPath(CHORD[0], CHORD[1])} Z`}
          fill={hi("segment") ? "var(--accent)" : "var(--surface)"}
          fillOpacity={hi("segment") ? 0.55 : 1}
          stroke="var(--ink)"
          strokeWidth={2}
        />
      )}

      <circle cx={CX} cy={CY} r={R} fill="none" stroke={stroke("circumference")} strokeWidth={width("circumference")} />

      {has("arc") && <path d={arcPath(ARC[0], ARC[1])} fill="none" stroke={stroke("arc")} strokeWidth={hi("arc") ? 7 : 4.5} strokeLinecap="round" />}

      {has("diameter") && (
        <g>
          <line x1={CX - R} y1={CY} x2={CX + R} y2={CY} stroke={stroke("diameter")} strokeWidth={width("diameter")} />
          {text("diameter") && <Label x={CX - R / 2} y={CY - 16} text={text("diameter")!} />}
        </g>
      )}
      {has("radius") && (
        <g>
          <line x1={CX} y1={CY} x2={at(RADIUS_DEG)[0]} y2={at(RADIUS_DEG)[1]} stroke={stroke("radius")} strokeWidth={width("radius")} />
          {text("radius") && (
            <Label
              x={at(RADIUS_DEG, R / 2)[0] - 18 * Math.sin(rad(RADIUS_DEG))}
              y={at(RADIUS_DEG, R / 2)[1] - 18 * Math.cos(rad(RADIUS_DEG))}
              text={text("radius")!}
            />
          )}
        </g>
      )}
      {has("chord") && (
        <g>
          <line x1={at(CHORD[0])[0]} y1={at(CHORD[0])[1]} x2={at(CHORD[1])[0]} y2={at(CHORD[1])[1]} stroke={stroke("chord")} strokeWidth={width("chord")} />
          {text("chord") && <Label x={CX} y={at(CHORD[0])[1] - 16} text={text("chord")!} />}
        </g>
      )}
      {has("tangent") && (() => {
        const [tx, ty] = at(TANGENT_DEG);
        // Direction along the tangent (perpendicular to the radius).
        const dx = Math.sin(rad(TANGENT_DEG));
        const dy = Math.cos(rad(TANGENT_DEG));
        const L = 95;
        return (
          <g>
            <line x1={tx - dx * L} y1={ty - dy * L} x2={tx + dx * L} y2={ty + dy * L} stroke={stroke("tangent")} strokeWidth={width("tangent")} strokeLinecap="round" />
            <circle cx={tx} cy={ty} r={4} fill={stroke("tangent")} />
          </g>
        );
      })()}

      <circle cx={CX} cy={CY} r={hi("centre") ? 7 : 3.5} fill={stroke("centre")} />
    </svg>
  );
}

export function Label({ x, y, text, anchor = "middle" }: { x: number; y: number; text: string; anchor?: "start" | "middle" | "end" }) {
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
