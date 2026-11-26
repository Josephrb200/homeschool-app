import { MASTERY_LABELS, MASTERY_LEVELS, levelRank, type MasteryLevel } from "@/engine/types";

/** Mastery level shown as filled segments plus words, so it never relies on colour. */
export function Level({ level }: { level: MasteryLevel }) {
  const r = levelRank(level);
  return (
    <span className="level">
      <span className="level-bar" aria-hidden="true">
        {MASTERY_LEVELS.slice(1).map((l, i) => (
          <i key={l} className={i < r ? "on" : ""} />
        ))}
      </span>
      {MASTERY_LABELS[level]}
    </span>
  );
}
