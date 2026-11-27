"use client";

import type { DemoKind } from "@/content/lesson-types";
import { FRACTION_DEMOS } from "./FractionDemos";
import { AREA_DEMOS } from "./AreaDemos";
import { DECIMAL_DEMOS } from "./DecimalDemos";
import { MEASURES_DEMOS } from "./MeasuresDemos";
import { ALGEBRA_DEMOS } from "./AlgebraDemos";
import { RATIO_DEMOS } from "./RatioDemos";
import { PROBABILITY_DEMOS } from "./ProbabilityDemos";
import { FACTOR_DEMOS } from "./FactorDemos";
import { STATS_DEMOS } from "./StatsDemos";
import { POWERS_DEMOS } from "./PowersDemos";
import { ANGLE_DEMOS } from "./AngleDemos";
import { TRANSFORM_DEMOS } from "./TransformDemos";

const DEMOS: Record<DemoKind, () => React.ReactNode> = { ...FRACTION_DEMOS, ...AREA_DEMOS, ...MEASURES_DEMOS, ...ALGEBRA_DEMOS, ...RATIO_DEMOS, ...DECIMAL_DEMOS, ...FACTOR_DEMOS, ...STATS_DEMOS, ...PROBABILITY_DEMOS, ...POWERS_DEMOS, ...ANGLE_DEMOS, ...TRANSFORM_DEMOS };

export function Demo({ kind }: { kind: DemoKind }) {
  const C = DEMOS[kind];
  return (
    <section className="demo" aria-label="Try it">
      <p className="eyebrow">Try it</p>
      <C />
    </section>
  );
}
