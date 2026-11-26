"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefs } from "./PrefsProvider";
import { speakable } from "./MathText";

function pickVoice() {
  const vs = window.speechSynthesis.getVoices();
  return vs.find((v) => /en-GB/i.test(v.lang)) ?? vs.find((v) => /^en/i.test(v.lang)) ?? null;
}

export function useSpeech() {
  const { prefs } = usePrefs();
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  /** Speak a list of chunks in order, calling onChunk with the index being spoken. */
  const speak = (chunks: string[], onChunk?: (i: number) => void) => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const voice = pickVoice();
    setSpeaking(true);
    chunks.forEach((text, i) => {
      const u = new SpeechSynthesisUtterance(speakable(text));
      if (voice) u.voice = voice;
      u.lang = voice?.lang ?? "en-GB";
      u.rate = prefs.readAloudRate;
      u.onstart = () => onChunk?.(i);
      if (i === chunks.length - 1) u.onend = u.onerror = () => { setSpeaking(false); onChunk?.(-1); };
      synth.speak(u);
    });
  };
  const stop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };
  return { supported, speaking, speak, stop };
}

const SpeakerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 9.5v5h3.5L12 19V5L7.5 9.5z" />
    <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
  </svg>
);

/** A button that reads some text aloud. Hidden where the browser can't speak, so it never looks broken. */
export function SpeakButton({ text, label = "Listen", auto = false }: { text: string | string[]; label?: string; auto?: boolean }) {
  const { supported, speaking, speak, stop } = useSpeech();
  const chunks = Array.isArray(text) ? text : [text];
  const key = chunks.join("|");
  const done = useRef<string | null>(null);
  useEffect(() => {
    if (auto && supported && done.current !== key) {
      done.current = key;
      speak(chunks);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, supported, key]);
  if (!supported) return null;
  return (
    <button type="button" className="btn btn-small" onClick={() => (speaking ? stop() : speak(chunks))} aria-pressed={speaking}>
      <SpeakerIcon />
      {speaking ? "Stop" : label}
    </button>
  );
}

/** Paragraphs with a read-aloud button that highlights each paragraph as it is spoken. */
export function SpeakableParagraphs({ paragraphs, render }: { paragraphs: string[]; render: (p: string) => React.ReactNode }) {
  const { supported, speaking, speak, stop } = useSpeech();
  const [current, setCurrent] = useState(-1);
  return (
    <div className="stack">
      {supported && (
        <div className="row">
          <button
            type="button"
            className="btn btn-small"
            aria-pressed={speaking}
            onClick={() => (speaking ? (stop(), setCurrent(-1)) : speak(paragraphs, setCurrent))}
          >
            <SpeakerIcon />
            {speaking ? "Stop reading" : "Read this to me"}
          </button>
        </div>
      )}
      {paragraphs.map((p, i) => (
        <p key={i} className={i === current ? "speaking" : undefined}>
          {render(p)}
        </p>
      ))}
    </div>
  );
}
