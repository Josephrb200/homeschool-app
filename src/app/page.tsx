import Link from "next/link";
import { redirect } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { env } from "@/lib/env";
import { getViewer } from "@/lib/learner";
import { SKILLS } from "@/content";

export default async function Home() {
  const viewer = env.configured() ? await getViewer() : null;
  if (viewer) redirect(viewer.role === "student" ? "/learn" : "/parent");
  return (
    <div className="wrap stack-lg">
      {!env.configured() && (
        <p className="notice notice-warn" role="alert">
          Setup needed: the database connection isn&apos;t configured yet. See the README, section &quot;Setting up&quot;.
        </p>
      )}
      <section className="stack" style={{ paddingTop: 16 }}>
        <p className="eyebrow">{BRAND.tagline}</p>
        <h1 style={{ fontSize: "2.1rem", maxWidth: "22ch" }}>Learn at your own pace. Move on when you&apos;ve really got it.</h1>
        <p style={{ fontSize: "1.1rem" }}>
          Short lessons, step-by-step teaching and practice that adapts to what each learner actually knows. Designed from the start for
          learners who are autistic, have ADHD or dyslexia, or simply learn better at home.
        </p>
        <div className="row">
          <Link className="btn btn-primary" href="/signup">
            Create a parent account
          </Link>
          <Link className="btn" href="/login">
            Log in
          </Link>
        </div>
      </section>

      <div className="grid-2">
        <section className="panel stack">
          <h2>For students</h2>
          <ul style={{ margin: 0 }}>
            <li>Every lesson has the same six steps, with a counter so you always know how much is left.</li>
            <li>Hints and worked solutions when you want them. No timers, no leaderboards.</li>
            <li>Change the font, colours, spacing and reading voice to suit you.</li>
          </ul>
        </section>
        <section className="panel stack">
          <h2>For parents</h2>
          <ul style={{ margin: 0 }}>
            <li>Plain-English updates built from your child&apos;s real answers.</li>
            <li>See the evidence behind every level, including when help was used.</li>
            <li>Your child&apos;s data is held in the UK and you can download or delete it at any time.</li>
          </ul>
        </section>
      </div>

      <section className="panel stack" aria-labelledby="cov">
        <h2 id="cov">What&apos;s available now</h2>
        <p>
          This is an early version. It covers two maths topics: <strong>area of shapes</strong> (rectangles, triangles, parallelograms,
          trapeziums and L-shapes) and <strong>fractions</strong> (from equivalent fractions to multiplying and dividing), {SKILLS.length} skills
          in all. The lessons are drafts and still need checking by a qualified maths teacher. English and more maths topics come later.
        </p>
      </section>
      <p className="small muted">
        <Link href="/privacy">Privacy and how we use data</Link>
      </p>
    </div>
  );
}
