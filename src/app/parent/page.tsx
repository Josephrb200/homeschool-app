import Link from "next/link";
import { requireRole, loadEvents } from "@/lib/learner";
import { supabaseServer } from "@/lib/supabase/server";
import { createChild } from "@/app/actions/parent";
import { ActionForm, Submit } from "@/components/Forms";
import { MISCONCEPTIONS, SKILLS } from "@/content";
import { computeMastery } from "@/engine/mastery";
import { recommend } from "@/engine/recommend";
import { levelRank } from "@/engine/types";

export const metadata = { title: "My children" };

export default async function ParentHome({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const me = await requireRole("parent");
  const { deleted } = await searchParams;
  const supabase = await supabaseServer();
  const { data: links } = await supabase.from("guardian_links").select("student_id").eq("guardian_id", me.id);
  const ids = (links ?? []).map((l) => l.student_id);
  const { data: kids } = ids.length
    ? await supabase.from("profiles").select("id, display_name").in("id", ids)
    : { data: [] as { id: string; display_name: string }[] };

  const cards = await Promise.all(
    (kids ?? []).map(async (k) => {
      const { events } = await loadEvents(k.id);
      const secure = SKILLS.filter((s) => levelRank(computeMastery(s.id, events).level) >= levelRank("secure")).length;
      const demonstrated = SKILLS.filter((s) => levelRank(computeMastery(s.id, events).level) >= levelRank("demonstrated")).length;
      const last = events.at(-1)?.at;
      const [next] = recommend(SKILLS, events, MISCONCEPTIONS, new Date(), 1);
      return { ...k, secure, demonstrated, last, next };
    }),
  );

  return (
    <div className="wrap stack-lg">
      <div className="stack">
        <p className="eyebrow">Hello {me.displayName}</p>
        <h1>My children</h1>
      </div>
      {deleted && <p className="notice notice-good">The account and all its learning data have been deleted.</p>}

      {cards.length === 0 ? (
        <div className="panel">
          <p>You haven&apos;t added a child yet. Add one below and they can log in straight away.</p>
        </div>
      ) : (
        <ul className="skill-map">
          {cards.map((c) => (
            <li key={c.id} className="skill-card">
              <div className="stack" style={{ gap: 4 }}>
                <Link href={`/parent/child/${c.id}`} style={{ fontWeight: 600, fontSize: "1.1rem" }}>
                  {c.display_name}
                </Link>
                <span className="small muted">
                  {c.demonstrated} of {SKILLS.length} skills demonstrated, {c.secure} secure.{" "}
                  {c.last ? `Last active ${c.last.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}.` : "Not started yet."}
                </span>
                {c.next && <span className="small">Suggested next: {c.next.title}</span>}
              </div>
              <Link className="btn" href={`/parent/child/${c.id}`}>
                See progress
              </Link>
            </li>
          ))}
        </ul>
      )}

      <section className="panel stack" aria-labelledby="add-title">
        <h2 id="add-title">Add a child</h2>
        <p className="muted small">
          We only need a first name and a username. No email, date of birth, school or diagnosis is asked for. Your child signs in with the
          username and the password you choose here.
        </p>
        <ActionForm action={createChild}>
          <div className="grid-2">
            <div className="field">
              <label htmlFor="displayName">First name</label>
              <input id="displayName" name="displayName" className="input" required maxLength={40} />
            </div>
            <div className="field">
              <label htmlFor="username">Username</label>
              <input id="username" name="username" className="input" required pattern="[a-z0-9_]{3,24}" autoCapitalize="none" />
              <span className="hint">3 to 24 lowercase letters, numbers or _</span>
            </div>
          </div>
          <div className="field">
            <label htmlFor="password">Password for your child</label>
            <input id="password" name="password" type="text" className="input" required minLength={8} autoComplete="off" />
            <span className="hint">At least 8 characters. Shown as you type so you can write it down for them.</span>
          </div>
          <div>
            <Submit>Add child</Submit>
          </div>
        </ActionForm>
      </section>
    </div>
  );
}
