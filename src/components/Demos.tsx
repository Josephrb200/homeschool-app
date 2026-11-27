"use client";

import type { DemoKind } from "@/content/lesson-types";
import { FRACTION_DEMOS } from "./FractionDemos";
import { AREA_DEMOS } from "./AreaDemos";
import { DECIMAL_DEMOS } from "./DecimalDemos";
import { MEASURES_DEMOS } from "./MeasuresDemos";
import { ALGEBRA_DEMOS } from "./AlgebraDemos";
import { EXPRESSION_DEMOS } from "./ExpressionDemos";
import { EQUATION_DEMOS } from "./EquationDemos";
import { RATIO_DEMOS } from "./RatioDemos";
import { PROBABILITY_DEMOS } from "./ProbabilityDemos";
import { FACTOR_DEMOS } from "./FactorDemos";
import { STATS_DEMOS } from "./StatsDemos";
import { POWERS_DEMOS } from "./PowersDemos";
import { ANGLE_DEMOS } from "./AngleDemos";
import { TRANSFORM_DEMOS } from "./TransformDemos";
import { TRIANGLE_DEMOS } from "./TriangleDemos";
import { CALCULATION_DEMOS } from "./CalculationDemos";
import { STATS_MORE_DEMOS } from "./StatsMoreDemos";
import { TREE_DEMOS } from "./TreeDemos";


const DEMOS: Record<DemoKind, () => React.ReactNode> = { ...FRACTION_DEMOS, ...AREA_DEMOS, ...MEASURES_DEMOS, ...ALGEBRA_DEMOS, ...EXPRESSION_DEMOS, ...EQUATION_DEMOS, ...RATIO_DEMOS, ...DECIMAL_DEMOS, ...FACTOR_DEMOS, ...STATS_DEMOS, ...PROBABILITY_DEMOS, ...POWERS_DEMOS, ...ANGLE_DEMOS, ...TRIANGLE_DEMOS, ...TRANSFORM_DEMOS, ...CALCULATION_DEMOS, ...STATS_MORE_DEMOS, ...TREE_DEMOS };

export function Demo({ kind }: { kind: DemoKind }) {
  const C = DEMOS[kind];
  return (
    <section className="demo" aria-label="Try it">
      <p className="eyebrow">Try it</p>
      <C />
    </section>
  );
}
