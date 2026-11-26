import { requireRole, loadEvents } from "@/lib/learner";
import { SKILLS, SKILL_BY_ID } from "@/content";
import { dueReviews } from "@/engine/scheduler";
import { ReviewSession } from "@/components/ReviewSession";

export const metadata = { title: "Reviews" };

export default async function ReviewPage() {
  const me = await requireRole("student");
  const { events } = await loadEvents(me.id);
  const due = dueReviews(SKILLS.map((s) => s.id), events, new Date()).slice(0, 3);
  return (
    <div className="wrap narrow stack-lg">
      <div className="stack">
        <h1>Reviews</h1>
        <p className="muted">
          Short questions on skills you&apos;ve already passed. Remembering them after a gap is what makes learning last. Each correct answer
          without help pushes the next review further away.
        </p>
      </div>
      {due.length === 0 ? (
        <div className="panel">
          <p>Nothing is due for review right now. Come back after you pass a skill check.</p>
        </div>
      ) : (
        <ReviewSession skills={due.map((d) => ({ id: d.skillId, name: SKILL_BY_ID[d.skillId].name }))} />
      )}
    </div>
  );
}
