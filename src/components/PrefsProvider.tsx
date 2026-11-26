"use client";

import { createContext, useContext, useState } from "react";
import { DEFAULT_PREFS, type Prefs } from "@/lib/prefs";

const Ctx = createContext<{ prefs: Prefs; setPrefs: (p: Prefs) => void }>({ prefs: DEFAULT_PREFS, setPrefs: () => {} });

export function PrefsProvider({ initial, children }: { initial: Prefs; children: React.ReactNode }) {
  const [prefs, setPrefs] = useState(initial);
  return <Ctx.Provider value={{ prefs, setPrefs }}>{children}</Ctx.Provider>;
}

export const usePrefs = () => useContext(Ctx);
