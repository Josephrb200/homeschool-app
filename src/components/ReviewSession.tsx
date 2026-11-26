"use client";

import Link from "next/link";
import { useState } from "react";
import { Practice, type RunResult } from "./Practice";

export function ReviewSession({ skills }: { skills: { id: string; name: string }[] }) {
  const [done, setDone] = useState<RunResult[] | null>(null);
  const count = Math.min(6, skills.length * 2);
  if (done) {
    const right = done.filter((r) => r.correct && !r.assisted).length;
    return (
      <div className="panel stack">
        <h2>Review finished</h2>
        <p>
          {right} of {done.length} correct without help. Skills you got right will come back later; anything you missed will come back
          tomorrow.
        </p>
        <div>
          <Link className="btn btn-primary" href="/learn">
            Back to my learning
          </Link>
        </div>
      </div>
    );
  }
  return (
    <section className="panel stack">
      <p className="eyebrow">Reviewing: {skills.map((s) => s.name).join(", ")}</p>
      <Practice skillIds={skills.map((s) => s.id)} mode="review" count={count} onDone={setDone} />
    </section>
  );
}
