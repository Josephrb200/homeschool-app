"use client";

/**
 * One run of questions (guided, on your own, skill check or review).
 * Answers are marked on the server and saved to the learning record as they
 * are given, so a student can stop at any point without losing work.
 */

import { useEffect, useRef, useState } from "react";
import {
  checkReview,
  nextQuestion,
  revealSolution,
  submitAnswer,
  type AnswerResult,
  type PublicQuestion,
} from "@/app/actions/learn";
import { FractionBar } from "./FractionDemos";
import { Visual } from "./Visual";
import { FunctionMachine } from "./FunctionMachine";
import { MathText } from "./MathText";
import { SpeakButton } from "./Speak";
import { usePrefs } from "./PrefsProvider";

export type Mode = "guided" | "independent" | "check" | "review";

export interface RunResult {
  questionId: string;
  prompt: string;
  correct: boolean;
  assisted: boolean;
  misconceptionLabel?: string;
  feedback: string;
}

const Tick = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--good)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
const Cross = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--warn)" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v6M12 16.5v.01" />
  </svg>
);

export function Practice({
  skillIds,
  mode,
  count,
  checkId,
  onDone,
}: {
  skillIds: string[];
  mode: Mode;
  count: number;
  checkId?: string;
  onDone: (results: RunResult[]) => void;
}) {
  const { prefs } = usePrefs();
  const [q, setQ] = useState<PublicQuestion | null>(null);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<RunResult[]>([]);
  const [typedAnswer, setAnswer] = useState("");
  const [hintsShown, setHintsShown] = useState(0);
  const [solution, setSolution] = useState<{ steps: string[]; answer: string } | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [retried, setRetried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finished, setFinished] = useState<null | { id: string; prompt: string; answer: string; solution: string[] }[]>(null);
  const started = useRef(Date.now());
  const input = useRef<HTMLInputElement>(null);
  const tier = mode === "guided" ? 1 : 2;

  async function load(i: number) {
    setBusy(true);
    setError(null);
    try {
      const next = await nextQuestion(skillIds[i % skillIds.length], tier);
      setQ(next);
      setAnswer("");
      setHintsShown(0);
      setSolution(null);
      setResult(null);
      setRetrying(false);
      setRetried(false);
      started.current = Date.now();
      setTimeout(() => input.current?.focus(), 0);
    } catch {
      setError("The next question didn't load. Check your connection and press Try again.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(e?: React.FormEvent, picked?: string) {
    e?.preventDefault();
    const answer = picked ?? typedAnswer;
    if (picked !== undefined) setAnswer(picked);
    if (!q || busy || !answer.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const r = await submitAnswer({
        questionId: q.id,
        answer,
        mode,
        hintsUsed: hintsShown,
        sawSolution: !!solution || retrying,
        checkId,
        durationMs: Math.min(Date.now() - started.current, 3600000),
      });
      setResult(r);
      if (r.outcome === "unreadable") return;
      if (retrying) {
        setRetrying(false);
        setRetried(true);
      }
      if (!r.saved) setError("That answer was marked but couldn't be saved. Your progress may be missing this question.");
      if (!retrying) {
        setResults((prev) => [
          ...prev,
          {
            questionId: q.id,
            prompt: q.prompt,
            correct: r.correct,
            assisted: hintsShown > 0 || !!solution,
            misconceptionLabel: r.misconceptionLabel,
            feedback: r.feedback,
          },
        ]);
      }
      if (!r.correct && prefs.showSolutionAfterMiss && r.solution) setSolution({ steps: r.solution, answer: r.correctAnswer ?? "" });
    } catch {
      setError("Your answer didn't reach the server. Check your connection and press Check again.");
    } finally {
      setBusy(false);
    }
  }

  async function next() {
    const i = index + 1;
    if (i >= count) {
      if (mode === "check") setFinished(await checkReview(results.map((r) => r.questionId)));
      else onDone(results);
      return;
    }
    setIndex(i);
    await load(i);
  }

  async function showSolution() {
    if (!q) return;
    const s = await revealSolution(q.id);
    setSolution({ steps: s.solution, answer: s.answer });
  }

  if (finished) {
    const right = results.filter((r) => r.correct && !r.assisted).length;
    return (
      <div className="stack">
        <div className={`feedback ${right >= 4 ? "feedback-good" : "feedback-try"}`}>
          <p className="feedback-title">{right >= 4 ? <Tick /> : <Cross />}
            {right >= 4 ? `Check passed: ${right} of ${count} correct.` : `${right} of ${count} correct. You need 4 to pass.`}
          </p>
          <p>{right >= 4 ? "That's evidence you understand this skill. It will come back for review so it sticks." : "That's fine. Look at the answers below, then try the practice again whenever you're ready."}</p>
        </div>
        <ol className="stack" style={{ paddingLeft: "1.2rem", margin: 0 }}>
          {finished.map((f, i) => (
            <li key={f.id}>
              <p>
                <MathText text={f.prompt} /> {results[i]?.correct ? "(correct)" : `(answer: ${f.answer})`}
              </p>
              {!results[i]?.correct && (
                <ol className="solution small muted">
                  {f.solution.map((s, j) => (
                    <li key={j}>
                      <MathText text={s} />
                    </li>
                  ))}
                </ol>
              )}
            </li>
          ))}
        </ol>
        <div>
          <button className="btn btn-primary" onClick={() => onDone(results)}>
            Continue
          </button>
        </div>
      </div>
    );
  }

  const answered = result && result.outcome !== "unreadable";
  const allowHints = mode === "guided";
  const allowSolution = mode === "guided" || mode === "independent";

  return (
    <div className="stack">
      <div className="row between">
        <span className="eyebrow">
          Question {index + 1} of {count}
        </span>
        <div className="dots" aria-hidden="true">
          {Array.from({ length: count }, (_, i) => (
            <span key={i} className={results[i] ? (results[i].correct ? "got" : "miss") : i === index ? "cur" : ""} />
          ))}
        </div>
      </div>

      {error && (
        <div className="notice notice-warn" role="alert">
          <Cross />
          <div className="stack">
            <p>{error}</p>
            {!q && (
              <div>
                <button className="btn btn-small" onClick={() => load(index)}>
                  Try again
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {q && (
        <>
          <div className="row between" style={{ alignItems: "flex-start" }}>
            <p className="question-prompt" id="prompt" data-question-id={q.id}>
              <MathText text={q.prompt} />
            </p>
            <SpeakButton text={q.prompt} label="Hear it" auto={prefs.autoReadQuestions} />
          </div>
          {q.visual && q.visual.kind !== "bars" && q.visual.kind !== "machine" && (
            <div className="shape-wrap">
              <Visual visual={q.visual} />
            </div>
          )}
          {q.visual?.kind === "machine" && <FunctionMachine machine={q.visual.machine} />}
          {q.visual?.kind === "bars" && mode !== "check" && (
            <div className="stack optional">
              {q.visual.bars.slice(0, 1).map((b, i) => (
                <FractionBar key={i} f={b} />
              ))}
            </div>
          )}

          {q.format.kind === "choice" && (
            <div className="stack">
              <p className="eyebrow" id="choice-label">
                Choose your answer
              </p>
              <div className="choice-row" role="group" aria-labelledby="choice-label prompt">
                {q.format.options.map((o) => (
                  <button
                    key={o}
                    type="button"
                    className="choice choice-answer"
                    aria-pressed={typedAnswer === o}
                    disabled={busy || (!!answered && !retrying)}
                    onClick={() => submit(undefined, o)}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form className="answer-row" onSubmit={submit} autoComplete="off" hidden={q.format.kind === "choice" && !allowHints && !allowSolution}>
            {q.format.kind !== "choice" && (
              <label htmlFor="answer" className="eyebrow" style={{ width: "100%" }}>
                Your answer
              </label>
            )}
            {q.format.kind !== "choice" && <input
              id="answer"
              ref={input}
              className="answer-input"
              value={typedAnswer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={!!answered && !retrying}
              aria-describedby="prompt answer-help"
              inputMode="text"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />}
            {q.format.kind !== "choice" && (!answered || retrying) && (
              <button className="btn btn-primary" type="submit" disabled={busy || !typedAnswer.trim()}>
                Check
              </button>
            )}
            {allowHints && hintsShown < q.hints.length && !answered && (
              <button type="button" className="btn" onClick={() => setHintsShown((h) => h + 1)}>
                {hintsShown === 0 ? "Give me a hint" : "Another hint"}
              </button>
            )}
            {allowSolution && !solution && (
              <button type="button" className="btn btn-ghost" onClick={showSolution}>
                Show me how
              </button>
            )}
          </form>
          <p id="answer-help" className="hint">
            {q.format.kind === "choice"
              ? "Press the answer you think is right."
              : q.answerHelp
                ? q.answerHelp
                : q.format.kind === "decimal"
                  ? `Use the π button on your calculator, then round to ${q.format.dp} decimal place${q.format.dp === 1 ? "" : "s"}, like 28.3. Units are fine but not needed.`
                  : q.visual && q.visual.kind !== "bars" && q.visual.kind !== "machine"
                    ? "Type a number like 24 or 7.5. Units like cm, cm² or cm³ are fine but not needed."
                    : "Type a whole number like 12, a fraction like 3/4, or a mixed number like 1 1/2."}
            {mode === "check" && " This is a skill check, so there are no hints. Answers are explained at the end."}
          </p>

          {hintsShown > 0 && (
            <div className="notice notice-info">
              <div className="stack">
                {q.hints.slice(0, hintsShown).map((h, i) => (
                  <p key={i}>
                    <strong>Hint {i + 1}:</strong> <MathText text={h} />
                  </p>
                ))}
              </div>
            </div>
          )}

          {result && (
            <div className={`feedback ${result.correct ? "feedback-good" : "feedback-try"}`} role="status">
              <p className="feedback-title">
                {result.correct ? <Tick /> : <Cross />}
                {result.correct ? "Correct" : result.outcome === "not-simplified" ? "Nearly there" : result.outcome === "unreadable" ? "Check the format" : "Not quite"}
              </p>
              {(prefs.feedbackStyle === "explained" || !result.correct) && result.feedback !== "Correct." && (
                <p>
                  <MathText text={result.feedback} />
                </p>
              )}
              {answered && !result.correct && mode !== "check" && !retried && (
                <div className="row">
                  <button
                    className="btn btn-small"
                    onClick={() => {
                      setRetrying(true);
                      setResult(null);
                      setTimeout(() => input.current?.focus(), 0);
                    }}
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>
          )}

          {solution && (
            <div className="panel-sunk stack">
              <p className="eyebrow">Worked solution</p>
              <ol className="solution">
                {solution.steps.map((s, i) => (
                  <li key={i}>
                    <MathText text={s} />
                  </li>
                ))}
              </ol>
              {!answered && <p className="hint">{q.format.kind === "choice" ? "Now choose the answer yourself." : "Now type the answer yourself."} Answers after seeing the solution count as practice with help.</p>}
            </div>
          )}

          {answered && (
            <div>
              <button className="btn btn-primary" onClick={next} disabled={busy}>
                {index + 1 >= count ? (mode === "check" ? "See results" : "Finish") : "Next question"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
