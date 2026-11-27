/**
 * Draws a two-stage tree diagram left to right: a frequency tree (a count in
 * every box) or a probability tree (a probability on every branch). Fractions
 * on branches are drawn stacked, like on paper. "?" values show as a dashed
 * box. Highlighted routes are drawn bold, and every label is text, so nothing
 * relies on colour alone.
 */
import type { TreeNode, TreeSpec } from "@/engine/types";

const FRAC = /^(\d+)\/(\d+)$/;

/** A probability or count, stacked if it is a fraction. Centred on (x, y). */
function Value({ text, x, y, size = 16, bold }: { text: string; x: number; y: number; size?: number; bold?: boolean }) {
  const m = FRAC.exec(text);
  if (text === "?") {
    return (
      <g>
        <rect x={x - 14} y={y - 13} width={28} height={26} rx={4} fill="var(--surface)" stroke="var(--accent)" strokeWidth={2} strokeDasharray="4 3" />
        <text x={x} y={y + 6} textAnchor="middle" fontSize={size} fontWeight={700} fill="var(--ink)">
          ?
        </text>
      </g>
    );
  }
  if (!m) {
    return (
      <text x={x} y={y + size * 0.35} textAnchor="middle" fontSize={size} fontWeight={bold ? 700 : 600} fill="var(--ink)" stroke="var(--surface)" strokeWidth={4} paintOrder="stroke">
        {text}
      </text>
    );
  }
  const w = Math.max(m[1].length, m[2].length) * size * 0.62 + 6;
  return (
    <g>
      <rect x={x - w / 2 - 2} y={y - size - 2} width={w + 4} height={size * 2 + 4} fill="var(--surface)" opacity={0.92} />
      <text x={x} y={y - 4} textAnchor="middle" fontSize={size} fontWeight={600} fill="var(--ink)">
        {m[1]}
      </text>
      <line x1={x - w / 2} x2={x + w / 2} y1={y} y2={y} stroke="var(--ink)" strokeWidth={1.5} />
      <text x={x} y={y + size} textAnchor="middle" fontSize={size} fontWeight={600} fill="var(--ink)">
        {m[2]}
      </text>
    </g>
  );
}

/** The box at the end of a branch: a label, and a count underneath for frequency trees. */
function Node({ node, x, y, freq }: { node: TreeNode; x: number; y: number; freq: boolean }) {
  if (!freq) {
    return (
      <text x={x + 6} y={y + 6} fontSize={16} fontWeight={700} fill="var(--ink)">
        {node.label}
      </text>
    );
  }
  return (
    <g>
      <rect x={x} y={y - 24} width={96} height={48} rx={6} fill="var(--surface)" stroke="var(--ink)" strokeWidth={1.5} />
      <text x={x + 48} y={y - 6} textAnchor="middle" fontSize={14} fill="var(--ink)">
        {node.label}
      </text>
      {node.count !== undefined && <Value text={node.count} x={x + 48} y={y + 12} size={16} bold />}
    </g>
  );
}

export function TreeDiagram({ tree, maxWidth = 460 }: { tree: TreeSpec; maxWidth?: number }) {
  const freq = tree.root !== undefined;
  const leaves = tree.branches.reduce((a, b) => a + Math.max(1, b.children?.length ?? 0), 0);
  const endLen = Math.max(0, ...tree.branches.flatMap((b) => (b.children ?? []).map((c) => c.end?.length ?? 0)));
  const leafGap = freq ? 62 : 58;
  const top = tree.stages ? 34 : 12;
  const H = top + leaves * leafGap + 8;
  const rootW = freq ? 70 : 0;
  const longest = Math.max(...tree.branches.flatMap((b) => [b.label, ...(b.children ?? []).map((c) => c.label)]).map((t) => t.length));
  const nodeW = freq ? 96 : Math.max(60, longest * 9.5 + 18);
  const x0 = 8 + rootW; // where the first branches start
  const branchLen = freq ? 70 : 100;
  const x1 = x0 + branchLen; // first-stage boxes
  const x2s = x1 + nodeW; // second branches start
  const x2 = x2s + branchLen; // second-stage boxes
  const W = Math.max(380, x2 + nodeW + (endLen ? endLen * 8.4 + 16 : 10));
  const rootY = top + (leaves * leafGap) / 2;
  const hi = new Set(tree.highlight ?? []);

  let leaf = 0;
  const firsts = tree.branches.map((b) => {
    const kids = b.children ?? [];
    const ys = kids.map(() => top + leafGap / 2 + leaf++ * leafGap);
    const firstLeaf = leaf - kids.length;
    const y = ys.length ? (ys[0] + ys[ys.length - 1]) / 2 : top + leafGap / 2 + leaf++ * leafGap;
    return { b, y, ys, firstLeaf };
  });
  const lineProps = (bold: boolean) => ({ stroke: bold ? "var(--accent)" : "var(--ink)", strokeWidth: bold ? 4 : 2, strokeLinecap: "round" as const });
  // A first branch is bold if any leaf under it is highlighted.
  const boldFirst = (f: (typeof firsts)[number]) => f.ys.some((_, k) => hi.has(f.firstLeaf + k));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth }} role="img" aria-label={tree.description} className="shape-diagram tree-diagram">
      {tree.stages && (
        <g>
          <text x={(x0 + x1) / 2 + 20} y={20} textAnchor="middle" fontSize={14} fontWeight={700} fill="var(--muted)">
            {tree.stages[0]}
          </text>
          <text x={(x2s + x2) / 2 + 20} y={20} textAnchor="middle" fontSize={14} fontWeight={700} fill="var(--muted)">
            {tree.stages[1]}
          </text>
        </g>
      )}
      {freq && (
        <g>
          <rect x={8} y={rootY - 22} width={rootW - 8} height={44} rx={6} fill="var(--sunk)" stroke="var(--ink)" strokeWidth={1.5} />
          <Value text={tree.root!} x={8 + (rootW - 8) / 2} y={rootY} size={17} bold />
        </g>
      )}
      {/* Lines first, so the labels sit on top of them. */}
      {firsts.map((f, i) => (
        <g key={`l${i}`}>
          <line x1={x0} y1={rootY} x2={x1} y2={f.y} {...lineProps(boldFirst(f))} />
          {f.ys.map((yy, k) => (
            <line key={k} x1={x2s} y1={f.y} x2={x2} y2={yy} {...lineProps(hi.has(f.firstLeaf + k))} />
          ))}
        </g>
      ))}
      {firsts.map((f, i) => (
        <g key={`n${i}`}>
          {f.b.p !== undefined && <Value text={f.b.p} x={(x0 + x1) / 2} y={(rootY + f.y) / 2 + (f.y < rootY ? -14 : 14)} />}
          <Node node={f.b} x={x1} y={f.y} freq={freq} />
          {(f.b.children ?? []).map((c, k) => {
            const yy = f.ys[k];
            return (
              <g key={k}>
                {c.p !== undefined && <Value text={c.p} x={(x2s + x2) / 2} y={(f.y + yy) / 2 + (yy < f.y ? -12 : 12)} />}
                <Node node={c} x={x2} y={yy} freq={freq} />
                {c.end && (
                  <text x={x2 + nodeW + 8} y={yy + 6} fontSize={15} fill="var(--ink)" fontWeight={hi.has(f.firstLeaf + k) ? 700 : 400}>
                    {c.end}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
}
