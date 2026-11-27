import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole, loadEvents } from "@/lib/learner";
import { supabaseServer } from "@/lib/supabase/server";
import { MISCONCEPTIONS, SKILLS, SKILL_BY_ID } from "@/content";
import { computeMastery, fmtDate } from "@/engine/mastery";
import { contentBreakdown, parentInsights } from "@/engine/insights";
import { reviewState } from "@/engine/scheduler";
import { questionFromId } from "@/content/questions";
import { Level } from "@/components/Level";
import { MathText } from "@/components/MathText";
import { ActionForm, Submit } from "@/components/Forms";
import { GoalList } from "@/components/GoalList";
import { addGoal, deleteChild, resetChildPassword } from "@/app/actions/parent";

export const metadata = { title: "Progress" };

const MODE_LABEL = { guided: "Guided", independent: "On own", check: "Skill check", review: "Review" } as const;

export default async function ChildPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRole("parent");
  const supabase = await supabaseServer();
  // RLS returns nothing unless this child is linked to the signed-in parent.
  const { data: child } = await supabase.from("profiles").select("id, display_name").eq("id", id).maybeSingle();
  if (!child) notFound();
  const { data: student } = await supabase.from("students").select("username").eq("id", id).single();
  const { events, rows } = await loadEvents(id);
  const now = new Date();
  const insights = parentInsights(child.display_name, SKILLS, events, MISCONCEPTIONS, now);
  const breakdown = contentBreakdown(SKILLS, events);
  const { data: goals } = await supabase.from("goals").select("id, text, done, week_start").eq("student_id", id).order("created_at", { ascending: false }).limit(10);
  const attempts = rows.filter((r) => r.kind === "attempt").slice(-25).reverse();

  return (
    <div className="wrap stack-lg">
      <div className="stack">
        <Link href="/parent" className="small">
          ← All children
        </Link>
        <h1>{child.display_name}&apos;s progress</h1>
        <p className="muted small">Everything on this page is worked out from {child.display_name}&apos;s actual answers. Nothing is estimated.</p>
      </div>

      <section className="panel stack" aria-labelledby="sum-title">
        <h2 id="sum-title">Summary</h2>
        <ul className="stack" style={{ margin: 0, paddingLeft: "1.2rem" }}>
          {insights.map((i, n) => (
            <li key={n}>
              <MathText text={i.text} />
            </li>
          ))}
        </ul>
      </section>

      <section className="panel stack" aria-labelledby="mastery-title">
        <h2 id="mastery-title">Skill by skill</h2>
        <ol className="skill-map">
          {SKILLS.map((s) => {
            const m = computeMastery(s.id, events);
            const r = reviewState(s.id, events);
            return (
              <li key={s.id} className="skill-card">
                <strong>{s.name}</strong>
                <Level level={m.level} />
                <p className="reason">
                  {m.reason} {m.stats.independentAttempts > 0 && `Overall: ${m.stats.independentCorrect} of ${m.stats.independentAttempts} answered alone were correct without help${m.stats.assistedAttempts ? `; ${m.stats.assistedAttempts} answers used hints or a worked solution` : ""}.`}{" "}
                  {r && `Next review ${r.due <= now ? "is due now" : `due ${fmtDate(r.due)}`}.`} Usually taught in Year {s.typicalYear}.
                </p>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="panel stack" aria-labelledby="cover-title">
        <h2 id="cover-title">What has been covered</h2>
        <div className="scroll-x">
          <table className="evidence">
            <thead>
              <tr>
                <th>Stage</th>
                <th>Skills</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["Introduced", breakdown.introduced],
                  ["Practised", breakdown.practised],
                  ["Assessed (took a skill check)", breakdown.assessed],
                  ["Shown independently (passed a check)", breakdown.demonstrated],
                  ["Retained over time", breakdown.retained],
                ] as const
              ).map(([label, list]) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td>{list.length ? list.join(", ") : "None yet"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel stack" aria-labelledby="ev-title">
        <h2 id="ev-title">Recent answers (evidence)</h2>
        {attempts.length === 0 ? (
          <p className="muted">No answers yet.</p>
        ) : (
          <div className="scroll-x">
            <table className="evidence">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Skill</th>
                  <th>Question</th>
                  <th>Answer</th>
                  <th>Result</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a, i) => {
                  let prompt = "";
                  try {
                    prompt = questionFromId(a.question_id ?? "").prompt;
                  } catch {
                    prompt = "(question unavailable)";
                  }
                  return (
                    <tr key={i}>
                      <td>{new Date(a.at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                      <td>{SKILL_BY_ID[a.skill_id]?.name ?? a.skill_id}</td>
                      <td>
                        <MathText text={prompt} />
                      </td>
                      <td>{a.answer}</td>
                      <td>
                        {a.correct ? "Correct" : a.outcome === "not-simplified" ? "Right value, not in the form asked" : "Incorrect"}
                        {a.misconception && ` (${MISCONCEPTIONS[a.misconception]?.label.toLowerCase()})`}
                      </td>
                      <td>
                        {MODE_LABEL[a.mode ?? "independent"]}
                        {a.assisted ? ", with help" : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel stack" aria-labelledby="goals-title">
        <h2 id="goals-title">Goals</h2>
        <p className="muted small">Goals about learning work best, for example &quot;Pass the check on common denominators&quot;.</p>
        <GoalList goals={goals ?? []} studentId={id} />
        <ActionForm action={addGoal} className="row">
          <input type="hidden" name="studentId" value={id} />
          <label htmlFor="goal" className="sr-only" style={{ position: "absolute", left: -9999 }}>
            New goal
          </label>
          <input id="goal" name="text" className="input" style={{ flex: "1 1 260px" }} placeholder="Add a goal for this week" maxLength={200} required />
          <Submit className="btn">Add goal</Submit>
        </ActionForm>
      </section>

      <section className="panel stack" aria-labelledby="acct-title">
        <h2 id="acct-title">Account and data</h2>
        <p>
          Username: <strong>{student?.username}</strong>
        </p>
        <div className="grid-2">
          <ActionForm action={resetChildPassword}>
            <input type="hidden" name="studentId" value={id} />
            <div className="field">
              <label htmlFor="newpw">Set a new password</label>
              <input id="newpw" name="password" className="input" minLength={8} required autoComplete="off" />
            </div>
            <div>
              <Submit className="btn">Change password</Submit>
            </div>
          </ActionForm>
          <div className="stack">
            <p className="field" style={{ fontWeight: 600, margin: 0 }}>
              Download everything we hold
            </p>
            <p className="small muted">A file with {child.display_name}&apos;s account details, settings, goals and every answer.</p>
            <div>
              <a className="btn" href={`/parent/child/${id}/export`}>
                Download data (JSON)
              </a>
            </div>
          </div>
        </div>
        <details>
          <summary style={{ cursor: "pointer", fontWeight: 600 }}>Delete this account</summary>
          <ActionForm action={deleteChild}>
            <input type="hidden" name="studentId" value={id} />
            <p className="small">
              This permanently deletes {child.display_name}&apos;s account and their whole learning record. It can&apos;t be undone. Download the
              data first if you want to keep it.
            </p>
            <div className="field">
              <label htmlFor="confirm">Type the username &quot;{student?.username}&quot; to confirm</label>
              <input id="confirm" name="confirm" className="input" autoComplete="off" required />
            </div>
            <div>
              <Submit className="btn btn-danger">Delete account and data</Submit>
            </div>
          </ActionForm>
        </details>
      </section>
    </div>
  );
}
