/**
 * Pictures for probability questions: a spinner, a table (sample space,
 * frequency or probability table) and a two-set Venn diagram.
 * Every section and region carries its label as text, so nothing relies on
 * colour alone, and each picture has a description for screen readers.
 */
import type { SpinnerSpec, TableSpec, VennSpec } from "@/engine/types";

/** Light fills for colour words; the word is always written on the section too. */
const COLOUR_FILL: Record<string, string> = {
  red: "#f4b4ad",
  blue: "#a9c8f0",
  green: "#addfb8",
  yellow: "#f6e39a",
  purple: "#d4bdf0",
  orange: "#f8c99a",
};

export function SpinnerDiagram({ spinner, maxWidth = 260 }: { spinner: SpinnerSpec; maxWidth?: number }) {
  const n = spinner.sections.length;
  const R = 100;
  const C = 110;
  const at = (turn: number, r: number): [number, number] => [C + r * Math.sin(turn * 2 * Math.PI), C - r * Math.cos(turn * 2 * Math.PI)];
  const small = n > 6;
  return (
    <svg viewBox="0 0 220 220" width="100%" style={{ maxWidth }} role="img" aria-label={spinner.description} className="shape-diagram">
      {spinner.sections.map((label, i) => {
        const [x1, y1] = at(i / n, R);
        const [x2, y2] = at((i + 1) / n, R);
        const [tx, ty] = at((i + 0.5) / n, R * 0.64);
        const fill = COLOUR_FILL[label] ?? (i % 2 === 0 ? "var(--accent-soft)" : "var(--surface)");
        return (
          <g key={i}>
            <path d={`M ${C} ${C} L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} Z`} fill={fill} stroke="var(--ink)" strokeWidth={2} />
            <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" fontSize={small ? 12 : 15} fontWeight={600} fill={COLOUR_FILL[label] ? "#1d2a27" : "var(--ink)"}>
              {label}
            </text>
          </g>
        );
      })}
      {/* The pointer. */}
      <path d={`M ${C} ${C - 52} L ${C - 7} ${C} L ${C + 7} ${C} Z`} fill="var(--ink)" transform={`rotate(${360 / n / 2 + 360 / n} ${C} ${C})`} />
      <circle cx={C} cy={C} r={8} fill="var(--ink)" />
    </svg>
  );
}

export function TableDiagram({ table }: { table: TableSpec }) {
  const hi = (r: number, c: number) => table.highlight?.some(([a, b]) => a === r && b === c);
  const cell = (text: string) =>
    text === "?" || text === "x" ? (
      <span className="prob-blank" aria-label={text === "?" ? "unknown" : "x"}>
        {text}
      </span>
    ) : (
      text
    );
  return (
    <div className="prob-table-wrap">
      <table className="prob-table">
        <caption className="sr-only">{table.description}</caption>
        <thead>
          <tr>
            <th scope="col" className="prob-corner">
              {table.corner ?? ""}
            </th>
            {table.columns.map((c, i) => (
              <th key={i} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, r) => (
            <tr key={r}>
              <th scope="row">{row.head}</th>
              {row.cells.map((c, j) => (
                <td key={j} className={hi(r, j) ? "prob-hi" : undefined}>
                  {cell(c)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Split a list like "2, 4, 8, 10, 14" into lines of at most `per` items. */
function lines(text: string, per: number): string[] {
  const items = text.split(/,\s*/).filter((x) => x !== "");
  if (items.length <= per) return [items.join(", ")];
  const out: string[] = [];
  for (let i = 0; i < items.length; i += per) out.push(items.slice(i, i + per).join(", "));
  return out;
}

export function VennDiagram({ venn, maxWidth = 440 }: { venn: VennSpec; maxWidth?: number }) {
  const W = 440;
  const H = 270;
  const R = 92;
  const AX = 168;
  const BX = 272;
  const CY = 140;
  const shade = new Set(venn.shade ?? []);
  const isList = [venn.onlyA, venn.both, venn.onlyB].some((t) => t.includes(","));
  const fontSize = isList ? 16 : 22;
  const region = (text: string, x: number, per: number) => {
    const ls = lines(text, per);
    const lh = fontSize * 1.25;
    return ls.map((l, i) => (
      <text key={i} x={x} y={CY + (i - (ls.length - 1) / 2) * lh} textAnchor="middle" dominantBaseline="middle" fontSize={fontSize} fontWeight={600} fill="var(--ink)">
        {l === "?" ? "?" : l}
      </text>
    ));
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth }} role="img" aria-label={venn.description} className="shape-diagram">
      <defs>
        <clipPath id="venn-a">
          <circle cx={AX} cy={CY} r={R} />
        </clipPath>
        <mask id="venn-a-only">
          <rect width={W} height={H} fill="black" />
          <circle cx={AX} cy={CY} r={R} fill="white" />
          <circle cx={BX} cy={CY} r={R} fill="black" />
        </mask>
        <mask id="venn-b-only">
          <rect width={W} height={H} fill="black" />
          <circle cx={BX} cy={CY} r={R} fill="white" />
          <circle cx={AX} cy={CY} r={R} fill="black" />
        </mask>
        <mask id="venn-outside">
          <rect width={W} height={H} fill="white" />
          <circle cx={AX} cy={CY} r={R} fill="black" />
          <circle cx={BX} cy={CY} r={R} fill="black" />
        </mask>
      </defs>
      <rect x={6} y={6} width={W - 12} height={H - 12} rx={6} fill="var(--surface)" stroke="var(--ink)" strokeWidth={2} />
      {shade.has("neither") && <rect x={6} y={6} width={W - 12} height={H - 12} rx={6} fill="var(--accent)" fillOpacity={0.3} mask="url(#venn-outside)" />}
      {shade.has("onlyA") && <rect width={W} height={H} fill="var(--accent)" fillOpacity={0.3} mask="url(#venn-a-only)" />}
      {shade.has("onlyB") && <rect width={W} height={H} fill="var(--accent)" fillOpacity={0.3} mask="url(#venn-b-only)" />}
      {shade.has("both") && <circle cx={BX} cy={CY} r={R} fill="var(--accent)" fillOpacity={0.45} clipPath="url(#venn-a)" />}
      <circle cx={AX} cy={CY} r={R} fill="none" stroke="var(--ink)" strokeWidth={2.5} />
      <circle cx={BX} cy={CY} r={R} fill="none" stroke="var(--ink)" strokeWidth={2.5} />
      <text x={18} y={30} fontSize={18} fontStyle="italic" fill="var(--ink)">
        ξ
      </text>
      <text x={AX - 40} y={CY - R - 10} textAnchor="middle" fontSize={15} fontWeight={700} fill="var(--ink)">
        {venn.a}
      </text>
      <text x={BX + 40} y={CY - R - 10} textAnchor="middle" fontSize={15} fontWeight={700} fill="var(--ink)">
        {venn.b}
      </text>
      {region(venn.onlyA, AX - 42, 2)}
      {region(venn.both, (AX + BX) / 2, 1)}
      {region(venn.onlyB, BX + 42, 2)}
      {venn.neither !== "" && (
        <text x={W - 18} y={H - 18} textAnchor="end" fontSize={isList ? 16 : 22} fontWeight={600} fill="var(--ink)">
          {venn.neither}
        </text>
      )}
    </svg>
  );
}
