"use client";

/**
 * The six-stage lesson: Introduction → Teaching → Guided practice →
 * On your own → Skill check → Review. A step counter is always visible, the
 * student can move to any stage, and the current stage is saved so the lesson
 * resumes where they left off on any device.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { newCheckId, recordLesson, skillStatus } from "@/app/actions/learn";
import type { Lesson, Stage } from "@/content/lesson-types";
import { STAGES, STAGE_LABELS } from "@/content/lesson-types";
import type { MasteryLevel, Skill } from "@/engine/types";
import { Demo } from "./Demos";
import { ShapeDiagram } from "./ShapeDiagram";
import type { ShapeSpec } from "@/engine/types";
import { Level } from "./Level";
import { MathText } from "./MathText";
import { Practice, type RunResult } from "./Practice";
import { SpeakableParagraphs } from "./Speak";

interface Props {
  skill: Skill;
  lesson: Lesson;
  startStage: Stage;
  level: MasteryLevel;
  prerequisites: { id: string; name: string; level: MasteryLevel }[];
}

export function LessonPlayer({ skill, lesson, startStage, level: initialLevel, prerequisites }: Props) {
  const [stage, setStage] = useState<Stage>(startStage);
  const [runs, setRuns] = useState<Partial<Record<Stage, RunResult[]>>>({});
  const [checkId, setCheckId] = useState<string | null>(null);
  const [runKey, setRunKey] = useState(0);
  const [status, setStatus] = useState<{ level: MasteryLevel; reason: string; next: { title: string; reason: string; skillId: string } | null } | null>(null);
  const idx = STAGES.indexOf(stage);

  useEffect(() => {
    recordLesson(skill.id, stage, "viewed").catch(() => {});
    if (stage === "check") newCheckId().then(setCheckId);
    if (stage === "review") skillStatus(skill.id).then(setStatus).catch(() => {});
    window.scrollTo({ top: 0 });
  }, [stage, skill.id, runKey]);

  function go(s: Stage) {
    setCheckId(null);
    setRunKey((k) => k + 1);
    setStage(s);
  }
  function finish(s: Stage, results?: RunResult[]) {
    recordLesson(skill.id, s, "completed").catch(() => {});
    if (results) setRuns((r) => ({ ...r, [s]: results }));
    go(STAGES[Math.min(STAGES.indexOf(s) + 1, STAGES.length - 1)]);
  }

  return (
    <div className="stack-lg">
      <div className="stack">
        <div className="row between">
          <p className="eyebrow">
            {skill.topic} · Step {idx + 1} of {STAGES.length}
          </p>
          {lesson.status !== "verified" && (
            <span className="badge badge-draft" title="This lesson hasn't been checked by a qualified teacher yet.">
              Draft content
            </span>
          )}
        </div>
        <h1>{skill.name}</h1>
        <nav aria-label="Lesson steps">
          <ol className="steps">
            {STAGES.map((s, i) => (
              <li key={s} aria-current={s === stage ? "step" : undefined} className={i < idx ? "done" : undefined}>
                <button
                  type="button"
                  onClick={() => go(s)}
                  style={{ background: "none", border: 0, padding: 0, cursor: "pointer", font: "inherit", color: "inherit" }}
                >
                  {i + 1}. {STAGE_LABELS[s]}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <section className="panel stack" aria-labelledby="stage-title">
        <h2 id="stage-title">{STAGE_LABELS[stage]}</h2>

        {stage === "introduction" && (
          <>
            <p style={{ fontSize: "1.1rem" }}>
              <MathText text={skill.objective} />
            </p>
            <div className="stack">
              <h3>Why it matters</h3>
              <p>{lesson.intro.whyItMatters}</p>
            </div>
            <div className="stack">
              <h3>By the end you&apos;ll be able to</h3>
              <ul style={{ margin: 0 }}>
                {lesson.intro.byTheEnd.map((b) => (
                  <li key={b}>
                    <MathText text={b} />
                  </li>
                ))}
              </ul>
            </div>
            {prerequisites.length > 0 && (
              <div className="stack optional">
                <h3>Useful to know first</h3>
                <ul className="skill-map">
                  {prerequisites.map((p) => (
                    <li key={p.id} className="skill-card">
                      <Link href={`/learn/${p.id}`}>{p.name}</Link>
                      <Level level={p.level} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="muted small">
              About {lesson.minutes} minutes in six short steps. You can stop at any time and pick up where you left off. Your current level:{" "}
              <Level level={initialLevel} />
            </p>
            <div>
              <button className="btn btn-primary" onClick={() => finish("introduction")}>
                Start the teaching
              </button>
            </div>
          </>
        )}

        {stage === "teaching" && (
          <>
            <SpeakableParagraphs paragraphs={lesson.teaching.paragraphs} render={(p) => <MathText text={p} />} />
            <Demo kind={lesson.teaching.demo} />
            <h3>Worked examples</h3>
            {lesson.teaching.examples.map((ex) => (
              <WorkedExample key={ex.question} question={ex.question} steps={ex.steps} shape={ex.shape} />
            ))}
            <div>
              <button className="btn btn-primary" onClick={() => finish("teaching")}>
                I&apos;m ready to practise
              </button>
            </div>
          </>
        )}

        {stage === "guided" && (
          <>
            <p className="muted">Hints and worked solutions are here if you want them. Using them is fine. It just means this counts as practice.</p>
            <Practice key={`g${runKey}`} skillIds={[skill.id]} mode="guided" count={lesson.counts.guided} onDone={(r) => finish("guided", r)} />
          </>
        )}

        {stage === "independent" && (
          <>
            <p className="muted">No hints this time. If you get stuck, &quot;Show me how&quot; is still there.</p>
            <Practice key={`i${runKey}`} skillIds={[skill.id]} mode="independent" count={lesson.counts.independent} onDone={(r) => finish("independent", r)} />
          </>
        )}

        {stage === "check" && (
          <>
            <p className="muted">5 questions with no help. Get 4 right to show you understand this skill. There is no time limit.</p>
            {checkId ? (
              <Practice key={`c${checkId}`} skillIds={[skill.id]} mode="check" count={5} checkId={checkId} onDone={(r) => finish("check", r)} />
            ) : (
              <p>Getting the check ready…</p>
            )}
          </>
        )}

        {stage === "review" && <ReviewStage runs={runs} status={status} onPractiseAgain={() => go("independent")} onCheckAgain={() => go("check")} />}
      </section>
    </div>
  );
}

function WorkedExample({ question, steps, shape }: { question: string; steps: string[]; shape?: ShapeSpec }) {
  const [shown, setShown] = useState(1);
  return (
    <div className="panel-sunk stack">
      <p style={{ fontWeight: 600 }}>
        <MathText text={question} />
      </p>
      {shape && <ShapeDiagram shape={shape} maxWidth={360} maxHeight={220} />}
      <ol className="solution" aria-live="polite">
        {steps.slice(0, shown).map((s, i) => (
          <li key={i}>
            <MathText text={s} />
          </li>
        ))}
      </ol>
      {shown < steps.length ? (
        <div>
          <button className="btn btn-small" onClick={() => setShown((n) => n + 1)}>
            Show the next step ({shown} of {steps.length})
          </button>
        </div>
      ) : (
        <p className="hint">All {steps.length} steps shown.</p>
      )}
    </div>
  );
}

function ReviewStage({
  runs,
  status,
  onPractiseAgain,
  onCheckAgain,
}: {
  runs: Partial<Record<Stage, RunResult[]>>;
  status: { level: MasteryLevel; reason: string; next: { title: string; reason: string; skillId: string } | null } | null;
  onPractiseAgain: () => void;
  onCheckAgain: () => void;
}) {
  const all = Object.values(runs).flat() as RunResult[];
  const mistakes = new Map<string, number>();
  for (const r of all) if (!r.correct && r.misconceptionLabel) mistakes.set(r.misconceptionLabel, (mistakes.get(r.misconceptionLabel) ?? 0) + 1);
  const line = (label: string, s?: RunResult[]) =>
    s && s.length ? (
      <li>
        {label}: {s.filter((r) => r.correct).length} of {s.length} correct
        {s.some((r) => r.assisted) ? ` (${s.filter((r) => r.assisted).length} with help)` : ""}
      </li>
    ) : null;
  return (
    <>
      {all.length > 0 ? (
        <ul style={{ margin: 0 }}>
          {line("Guided practice", runs.guided)}
          {line("On your own", runs.independent)}
          {line("Skill check", runs.check)}
        </ul>
      ) : (
        <p className="muted">You haven&apos;t answered questions in this visit. Your level below includes everything you&apos;ve done before.</p>
      )}
      {mistakes.size > 0 && (
        <div className="stack">
          <h3>Mistakes to watch for</h3>
          <ul style={{ margin: 0 }}>
            {[...mistakes].map(([label, n]) => (
              <li key={label}>
                {label} ({n} {n === 1 ? "time" : "times"})
              </li>
            ))}
          </ul>
        </div>
      )}
      {status ? (
        <div className="panel-sunk stack">
          <p>
            <strong>Your level now:</strong> <Level level={status.level} />
          </p>
          <p className="small">{status.reason}</p>
          {status.next && (
            <p className="small">
              <strong>Suggested next:</strong> <Link href={`/learn/${status.next.skillId}`}>{status.next.title}</Link>. {status.next.reason}
            </p>
          )}
        </div>
      ) : (
        <p className="muted">Working out your level…</p>
      )}
      <div className="row">
        <Link className="btn btn-primary" href="/learn">
          Back to my learning
        </Link>
        <button className="btn" onClick={onPractiseAgain}>
          Practise more
        </button>
        <button className="btn" onClick={onCheckAgain}>
          Take the check again
        </button>
      </div>
    </>
  );
}
