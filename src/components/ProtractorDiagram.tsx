/**
 * An angle with a protractor laid on it, drawn exactly. The protractor has the
 * usual two scales: the inner one counts up from one end, the outer one from
 * the other. Choosing the scale that starts at 0 on an arm is the skill.
 * Readable by screen readers through the description.
 */
import type { ProtractorSpec } from "@/engine/types";

const rad = (d: number) => (d * Math.PI) / 180;

/** The directions (degrees anticlockwise from east) of the two arms. */
export function protractorArms(p: ProtractorSpec): [number, number] {
  return p.from === "inner" ? [p.turn, p.turn + p.size] : [p.turn + 180, p.turn + 180 - p.size];
}

export function ProtractorDiagram({ spec, maxWidth = 440 }: { spec: ProtractorSpec; maxWidth?: number }) {
  const size = Math.min(maxWidth, 440);
  const R = size * 0.4;
  const C = size / 2;
  const at = (deg: number, r: number): [number, number] => [C + r * Math.cos(rad(deg)), C - r * Math.sin(rad(deg))];
  const [a1, a2] = protractorArms(spec);
  const arm = R * 1.12;
  const t = spec.turn;
  const ticks: React.ReactNode[] = [];
  const nums: React.ReactNode[] = [];
  if (!spec.hideProtractor) {
    for (let v = 0; v <= 180; v++) {
      const d = t + v;
      const len = v % 10 === 0 ? 14 : v % 5 === 0 ? 9 : 5;
      const [x1, y1] = at(d, R);
      const [x2, y2] = at(d, R - len);
      ticks.push(<line key={`t${v}`} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={v % 10 === 0 ? 1.5 : 1} />);
      if (v % 10 === 0) {
        const [ix, iy] = at(d, R - 44);
        const [ox, oy] = at(d, R - 25);
        // Inner scale counts up from the "turn" end; outer scale from the other end.
        nums.push(
          <text key={`i${v}`} x={ix} y={iy} fontSize={10.5} textAnchor="middle" dominantBaseline="middle" fill="var(--accent)" fontWeight={600}>
            {v}
          </text>,
          <text key={`o${v}`} x={ox} y={oy} fontSize={10.5} textAnchor="middle" dominantBaseline="middle" fill="var(--ink)" fontWeight={600}>
            {180 - v}
          </text>,
        );
      }
    }
  }
  const [b1x, b1y] = at(t, R);
  const [b2x, b2y] = at(t + 180, R);
  const sweepEnd = at(t + 180, R);
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: size }} role="img" aria-label={spec.description} className="shape-diagram protractor-diagram">
      {!spec.hideProtractor && (
        <g>
          <path d={`M ${b1x} ${b1y} A ${R} ${R} 0 0 0 ${sweepEnd[0]} ${sweepEnd[1]} Z`} fill="var(--surface)" fillOpacity={0.6} stroke="var(--muted)" strokeWidth={1.5} />
          <path d={`M ${b1x} ${b1y} A ${R} ${R} 0 0 0 ${sweepEnd[0]} ${sweepEnd[1]} Z`} fill="var(--accent-soft)" fillOpacity={0.35} stroke="none" />
          <g stroke="var(--ink)">{ticks}</g>
          {nums}
          <line x1={b1x} y1={b1y} x2={b2x} y2={b2y} stroke="var(--muted)" strokeWidth={1} />
        </g>
      )}
      {[a1, a2].map((d, k) => {
        const [x, y] = at(d, arm);
        return <line key={k} x1={C} y1={C} x2={x} y2={y} stroke="var(--warn)" strokeWidth={3} strokeLinecap="round" />;
      })}
      {spec.hideProtractor && (
        <path
          d={(() => {
            const r = 34;
            const lo = Math.min(a1, a2);
            const hi = Math.max(a1, a2);
            const [x1, y1] = at(lo, r);
            const [x2, y2] = at(hi, r);
            return `M ${x1} ${y1} A ${r} ${r} 0 ${hi - lo > 180 ? 1 : 0} 0 ${x2} ${y2}`;
          })()}
          fill="none"
          stroke="var(--ink)"
          strokeWidth={2}
        />
      )}
      <circle cx={C} cy={C} r={3.5} fill="var(--ink)" />
    </svg>
  );
}
