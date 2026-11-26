"use client";

import { useEffect, useRef, useState } from "react";
import { savePrefs } from "@/app/actions/settings";
import { DEFAULT_PREFS, prefsToHtmlAttrs, type Prefs } from "@/lib/prefs";
import { usePrefs } from "./PrefsProvider";
import { SpeakButton } from "./Speak";

const THEMES: [Prefs["theme"], string, string][] = [
  ["calm", "Calm (default)", "#f2f5f3"],
  ["cream", "Cream", "#f6f0dc"],
  ["blue", "Blue", "#e2ecf6"],
  ["green", "Green", "#e1efe0"],
  ["peach", "Peach", "#f7e6db"],
  ["dark", "Dark", "#141c1b"],
  ["contrast", "High contrast", "#ffffff"],
];

function Choice<T extends string>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="choice-row" role="group" aria-label={label}>
      {options.map(([v, l]) => (
        <button key={v} type="button" className="choice" aria-pressed={value === v} onClick={() => onChange(v)}>
          {l}
        </button>
      ))}
    </div>
  );
}

function Toggle({ id, label, help, checked, onChange }: { id: string; label: string; help?: string; checked: boolean; onChange: (b: boolean) => void }) {
  return (
    <div className="toggle-row">
      <label htmlFor={id} className="stack" style={{ gap: 2 }}>
        <span style={{ fontWeight: 600 }}>{label}</span>
        {help && <span className="hint">{help}</span>}
      </label>
      <input id={id} type="checkbox" className="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </div>
  );
}

export function SettingsForm() {
  const { prefs, setPrefs } = usePrefs();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Apply to the page immediately.
  useEffect(() => {
    const html = document.documentElement;
    for (const [k, v] of Object.entries(prefsToHtmlAttrs(prefs))) html.setAttribute(k, v);
    html.style.fontSize = `${prefs.textSize}%`;
  }, [prefs]);

  function update(patch: Partial<Prefs>) {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    setStatus("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const r = await savePrefs(next).catch(() => ({ ok: false }));
      setStatus(r.ok ? "saved" : "error");
    }, 500);
  }

  return (
    <div className="stack-lg">
      <p role="status" className="small muted" aria-live="polite">
        {status === "saving" ? "Saving…" : status === "saved" ? "Saved to your account." : status === "error" ? "Couldn't save. Your changes apply on this page but may not be kept." : " "}
      </p>

      <section className="panel stack" aria-labelledby="read-title">
        <h2 id="read-title">Reading</h2>
        <div className="panel-sunk">
          <p>Sample: To add 1/3 and 1/4, first rewrite both fractions with the same denominator.</p>
        </div>
        <div className="field">
          <span style={{ fontWeight: 600 }}>Font</span>
          <Choice
            label="Font"
            value={prefs.font}
            onChange={(font) => update({ font })}
            options={[
              ["lexend", "Lexend"],
              ["atkinson", "Atkinson Hyperlegible"],
              ["opendyslexic", "OpenDyslexic"],
              ["system", "Verdana"],
            ]}
          />
        </div>
        <div className="field">
          <label htmlFor="size">Text size: {prefs.textSize}%</label>
          <input id="size" type="range" min={90} max={175} step={5} value={prefs.textSize} onChange={(e) => update({ textSize: Number(e.target.value) })} />
        </div>
        <div className="field">
          <span style={{ fontWeight: 600 }}>Line spacing</span>
          <Choice label="Line spacing" value={prefs.lineSpacing} onChange={(lineSpacing) => update({ lineSpacing })} options={[["normal", "Normal"], ["relaxed", "Relaxed"], ["loose", "Loose"]]} />
        </div>
        <div className="field">
          <span style={{ fontWeight: 600 }}>Letter spacing</span>
          <Choice label="Letter spacing" value={prefs.letterSpacing} onChange={(letterSpacing) => update({ letterSpacing })} options={[["normal", "Normal"], ["wide", "Wide"], ["wider", "Wider"]]} />
        </div>
      </section>

      <section className="panel stack" aria-labelledby="col-title">
        <h2 id="col-title">Colours</h2>
        <div className="choice-row" role="group" aria-label="Background and contrast">
          {THEMES.map(([v, l, c]) => (
            <div key={v} className="stack" style={{ gap: 4, justifyItems: "center", width: 84 }}>
              <button type="button" className="swatch" style={{ background: c }} aria-pressed={prefs.theme === v} aria-label={l} onClick={() => update({ theme: v })} />
              <span className="small" style={{ textAlign: "center" }}>{l}</span>
            </div>
          ))}
        </div>
        <p className="hint">Some readers find a tinted background easier on the eyes. Try each one.</p>
      </section>

      <section className="panel stack" aria-labelledby="audio-title">
        <h2 id="audio-title">Listening</h2>
        <div className="field">
          <label htmlFor="rate">Reading voice speed: {prefs.readAloudRate.toFixed(2)}×</label>
          <input id="rate" type="range" min={0.6} max={1.4} step={0.05} value={prefs.readAloudRate} onChange={(e) => update({ readAloudRate: Number(e.target.value) })} />
        </div>
        <div className="row">
          <SpeakButton text="This is how the reading voice sounds at this speed." label="Test the voice" />
        </div>
        <Toggle id="auto" label="Read questions aloud automatically" checked={prefs.autoReadQuestions} onChange={(autoReadQuestions) => update({ autoReadQuestions })} />
        <p className="hint">The site never plays sounds unless you press a listen button or turn this on.</p>
      </section>

      <section className="panel stack" aria-labelledby="lay-title">
        <h2 id="lay-title">Layout and feedback</h2>
        <Toggle id="simple" label="Simplified view" help="Hides extras like goals, tips and diagrams so only the current task shows." checked={prefs.simplified} onChange={(simplified) => update({ simplified })} />
        <Toggle id="motion" label="Reduce movement" help="Turns off all animation." checked={prefs.reduceMotion} onChange={(reduceMotion) => update({ reduceMotion })} />
        <Toggle id="sol" label="Show the worked solution after a wrong answer" checked={prefs.showSolutionAfterMiss} onChange={(showSolutionAfterMiss) => update({ showSolutionAfterMiss })} />
        <div className="field">
          <span style={{ fontWeight: 600 }}>Feedback when you&apos;re right</span>
          <Choice label="Feedback style" value={prefs.feedbackStyle} onChange={(feedbackStyle) => update({ feedbackStyle })} options={[["brief", "Just say correct"], ["explained", "Explain why"]]} />
        </div>
      </section>

      <div>
        <button type="button" className="btn btn-ghost" onClick={() => update(DEFAULT_PREFS)}>
          Back to default settings
        </button>
      </div>
    </div>
  );
}
