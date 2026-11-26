"use client";

import { useTransition } from "react";
import { removeGoal, setGoalDone } from "@/app/actions/parent";

export function GoalList({ goals, studentId }: { goals: { id: string; text: string; done: boolean }[]; studentId: string }) {
  const [pending, start] = useTransition();
  if (goals.length === 0) return <p className="muted">No goals yet.</p>;
  return (
    <ul className="stack" style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {goals.map((g) => (
        <li key={g.id} className="row between">
          <label className="row">
            <input type="checkbox" className="switch" checked={g.done} disabled={pending} onChange={(e) => start(() => setGoalDone(g.id, studentId, e.target.checked))} />
            <span style={g.done ? { textDecoration: "line-through" } : undefined}>{g.text}</span>
          </label>
          <button className="btn btn-small btn-ghost" disabled={pending} onClick={() => start(() => removeGoal(g.id, studentId))}>
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}
