import type { MachineSpec } from "@/engine/types";

/**
 * A function machine drawn as boxes joined by arrows: input → × 3 → + 4 → output.
 * Wraps on narrow screens. Screen readers hear the whole machine as one sentence.
 */
export function FunctionMachine({ machine }: { machine: MachineSpec }) {
  const said = (v: string) => (v === "?" ? "unknown" : v);
  const label = `Function machine. Input ${said(machine.input)}, then ${machine.steps.join(", then ")}, gives output ${said(machine.output)}.`;
  const cell = (text: string, kind: "end" | "op") => (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 56,
        minHeight: 48,
        padding: "6px 12px",
        borderRadius: kind === "op" ? 10 : 24,
        border: `2px solid ${kind === "op" ? "var(--accent)" : "var(--line)"}`,
        background: kind === "op" ? "var(--accent-soft)" : "var(--surface)",
        fontSize: "1.25rem",
        fontWeight: 600,
      }}
    >
      {text}
    </span>
  );
  const arrow = <span style={{ fontSize: "1.4rem", padding: "0 2px" }}>→</span>;
  return (
    <div role="img" aria-label={label} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
      <span aria-hidden="true" style={{ display: "contents" }}>
        {cell(machine.input, "end")}
        {machine.steps.map((s, i) => (
          <span key={i} style={{ display: "contents" }}>
            {arrow}
            {cell(s, "op")}
          </span>
        ))}
        {arrow}
        {cell(machine.output, "end")}
      </span>
    </div>
  );
}
