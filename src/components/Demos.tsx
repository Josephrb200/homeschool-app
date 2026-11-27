"use client";

import type { DemoKind } from "@/content/lesson-types";
import { FRACTION_DEMOS } from "./FractionDemos";
import { AREA_DEMOS } from "./AreaDemos";
import { RATIO_DEMOS } from "./RatioDemos";

const DEMOS: Record<DemoKind, () => React.ReactNode> = { ...FRACTION_DEMOS, ...AREA_DEMOS, ...RATIO_DEMOS };

export function Demo({ kind }: { kind: DemoKind }) {
  const C = DEMOS[kind];
  return (
    <section className="demo" aria-label="Try it">
      <p className="eyebrow">Try it</p>
      <C />
    </section>
  );
}
