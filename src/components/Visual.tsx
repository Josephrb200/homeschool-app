/** Draws whichever picture a question or worked example comes with. */
import type { Visual as VisualSpec } from "@/engine/types";
import { ShapeDiagram } from "./ShapeDiagram";
import { CircleDiagram } from "./CircleDiagram";
import { SolidDiagram } from "./SolidDiagram";
import { AngleDiagram } from "./AngleDiagram";
import { SpinnerDiagram, TableDiagram, VennDiagram } from "./ProbabilityDiagrams";
import { ChartDiagram } from "./ChartDiagram";
import { GraphDiagram } from "./GraphDiagram";

export function Visual({ visual, compact = false }: { visual: VisualSpec; compact?: boolean }) {
  if (visual.kind === "shape") return <ShapeDiagram shape={visual.shape} maxWidth={compact ? 360 : 420} maxHeight={compact ? 220 : 260} />;
  if (visual.kind === "circle") return <CircleDiagram circle={visual.circle} maxWidth={compact ? 280 : 340} />;
  if (visual.kind === "solid") return <SolidDiagram solid={visual.solid} maxWidth={compact ? 360 : 420} maxHeight={compact ? 230 : 280} />;
  if (visual.kind === "angles") return <AngleDiagram spec={visual.angles} maxWidth={compact ? 360 : 440} maxHeight={compact ? 240 : 290} />;
  if (visual.kind === "spinner") return <SpinnerDiagram spinner={visual.spinner} maxWidth={compact ? 220 : 260} />;
  if (visual.kind === "table") return <TableDiagram table={visual.table} />;
  if (visual.kind === "venn") return <VennDiagram venn={visual.venn} maxWidth={compact ? 380 : 440} />;
  if (visual.kind === "chart") return <ChartDiagram chart={visual.chart} maxWidth={compact ? 380 : 440} />;
  if (visual.kind === "graph") return <GraphDiagram graph={visual.graph} maxWidth={compact ? 380 : 440} />;
  return null;
}
