"use client";

import type { DemoKind } from "@/content/lesson-types";
import { FRACTION_DEMOS } from "./FractionDemos";
import { AREA_DEMOS } from "./AreaDemos";
import { DECIMAL_DEMOS } from "./DecimalDemos";
import { ALGEBRA_DEMOS } from "./AlgebraDemos";

const DEMOS: Record<DemoKind, () => React.ReactNode> = { ...FRACTION_DEMOS, ...AREA_DEMOS, ...ALGEBRA_DEMOS, ...DECIMAL_DEMOS };

export function Demo({ kind }: { kind: DemoKind }) {
  const C = DEMOS[kind];
  return (
    <section className="demo" aria-label="Try it">
      <p className="eyebrow">Try it</p>
      <C />
    </section>
  );
}
