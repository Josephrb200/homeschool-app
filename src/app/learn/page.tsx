import Link from "next/link";
import { requireRole, loadEvents } from "@/lib/learner";
import { supabaseServer } from "@/lib/supabase/server";
import { CHAINS, MISCONCEPTIONS, SKILLS, SKILL_BY_ID } from "@/content";
import { computeMastery } from "@/engine/mastery";
import { recommend } from "@/engine/recommend";
import { dueReviews } from "@/engine/scheduler";
import { levelRank } from "@/engine/types";
import { Level } from "@/components/Level";
import { MathText } from "@/components/MathText";

export const metadata = { title: "My learning" };

export default async function LearnHome() {
  const me = await requireRole("student");
  const { events } = await loadEvents(me.id);
  const now = new Date();
  const recs = recommend(SKILLS, events, MISCONCEPTIONS, now, 3);
  const due = dueReviews(SKILLS.map((s) => s.id), events, now);
  const supabase = await supabaseServer();
  const { data: goals } = await supabase.from("goals").select("id, text, done, week_start").eq("student_id", me.id).order("created_at", { ascending: false }).limit(5);
  const secure = SKILLS.filter((s) => levelRank(computeMastery(s.id, events).level) >= levelRank("secure")).length;

  return (
    <div className="wrap stack-lg">
      <div className="stack">
        <p className="eyebrow">Hello {me.displayName}</p>
        <h1>What would you like to do?</h1>
      </div>

      <section className="panel stack" aria-labelledby="next-title">
        <h2 id="next-title">Suggested next</h2>
        {recs.length === 0 ? (
          <p>You&apos;re secure on everything available so far. More topics are on the way.</p>
        ) : (
          <ul className="skill-map">
            {recs.map((r, i) => (
              <li key={r.skillId + r.kind} className="skill-card">
                <div className="stack" style={{ gap: 2 }}>
                  <strong>{r.title}</strong>
                  <span className="small muted">{r.reason}</span>
                </div>
                <Link className={`btn ${i === 0 ? "btn-primary" : ""}`} href={r.kind === "review" ? "/learn/review" : `/learn/${r.skillId}`}>
                  {r.kind === "review" ? "Start review" : r.kind === "continue" ? "Carry on" : "Open"}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="small muted optional">These are suggestions. You can choose any topic from the map below.</p>
      </section>

      <div className="grid-2">
        <section className="panel stack" aria-labelledby="rev-title">
          <h2 id="rev-title">Reviews</h2>
          {due.length ? (
            <>
              <p>
                {due.length} {due.length === 1 ? "skill is" : "skills are"} due for a quick review: {due.map((d) => SKILL_BY_ID[d.skillId].name).join(", ")}.
              </p>
              <div>
                <Link className="btn" href="/learn/review">
                  Review now
                </Link>
              </div>
            </>
          ) : (
            <p className="muted">Nothing due right now. Skills come back for review after you pass their check.</p>
          )}
        </section>
        <section className="panel stack optional" aria-labelledby="goal-title">
          <h2 id="goal-title">Goals this week</h2>
          {goals && goals.length ? (
            <ul style={{ margin: 0 }}>
              {goals.map((g) => (
                <li key={g.id}>
                  {g.text} {g.done ? "(done)" : ""}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No goals set yet. Your parent can add some.</p>
          )}
        </section>
      </div>

      {CHAINS.map((chain) => (
        <section key={chain.id} className="stack" aria-labelledby={`map-${chain.id}`}>
          <div className="row between">
            <div>
              <p className="eyebrow">
                {chain.subject} · {chain.strand}
              </p>
              <h2 id={`map-${chain.id}`}>{chain.name}</h2>
            </div>
            <p className="small muted">
              {secure} of {chain.skillIds.length} secure
            </p>
          </div>
          <ol className="skill-map">
            {chain.skillIds.map((id) => {
              const s = SKILL_BY_ID[id];
              const m = computeMastery(id, events);
              return (
                <li key={id} className="skill-card">
                  <div className="stack" style={{ gap: 2 }}>
                    <Link href={`/learn/${id}`} style={{ fontWeight: 600 }}>
                      {s.name}
                    </Link>
                    <span className="small muted">
                      <MathText text={s.objective} />
                    </span>
                  </div>
                  <Level level={m.level} />
                  <p className="reason">
                    {m.reason}
                    {s.prerequisites.length > 0 && ` Builds on: ${s.prerequisites.map((p) => SKILL_BY_ID[p].name).join(", ")}.`}
                  </p>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
