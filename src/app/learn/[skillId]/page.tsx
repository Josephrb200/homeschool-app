import { notFound } from "next/navigation";
import { requireRole, loadEvents } from "@/lib/learner";
import { supabaseServer } from "@/lib/supabase/server";
import { LESSONS, SKILL_BY_ID } from "@/content";
import { STAGES, type Stage } from "@/content/maths/fractions/lessons";
import { computeMastery } from "@/engine/mastery";
import { LessonPlayer } from "@/components/LessonPlayer";

export default async function LessonPage({ params }: { params: Promise<{ skillId: string }> }) {
  const { skillId } = await params;
  const skill = SKILL_BY_ID[skillId];
  const lesson = LESSONS[skillId];
  if (!skill || !lesson) notFound();
  const me = await requireRole("student");
  const { events } = await loadEvents(me.id);
  const supabase = await supabaseServer();
  const { data: progress } = await supabase.from("lesson_progress").select("stage").eq("student_id", me.id).eq("skill_id", skillId).maybeSingle();
  // Resume where they left off; a finished lesson reopens at the start.
  const saved = progress?.stage as Stage | undefined;
  const startStage: Stage = saved && STAGES.includes(saved) && saved !== "review" ? saved : "introduction";

  return (
    <div className="wrap narrow">
      <LessonPlayer
        skill={skill}
        lesson={lesson}
        startStage={startStage}
        level={computeMastery(skillId, events).level}
        prerequisites={skill.prerequisites.map((p) => ({ id: p, name: SKILL_BY_ID[p].name, level: computeMastery(p, events).level }))}
      />
    </div>
  );
}

export function generateMetadata() {
  return { title: "Lesson" };
}
