/** Draws whichever picture a question or worked example comes with. */
import type { Visual as VisualSpec } from "@/engine/types";
import { ShapeDiagram } from "./ShapeDiagram";
import { CircleDiagram } from "./CircleDiagram";
import { SolidDiagram } from "./SolidDiagram";

export function Visual({ visual, compact = false }: { visual: VisualSpec; compact?: boolean }) {
  if (visual.kind === "shape") return <ShapeDiagram shape={visual.shape} maxWidth={compact ? 360 : 420} maxHeight={compact ? 220 : 260} />;
  if (visual.kind === "circle") return <CircleDiagram circle={visual.circle} maxWidth={compact ? 280 : 340} />;
  if (visual.kind === "solid") return <SolidDiagram solid={visual.solid} maxWidth={compact ? 360 : 420} maxHeight={compact ? 230 : 280} />;
  return null;
}
