import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { signOut } from "@/app/actions/auth";
import type { Viewer } from "@/lib/learner";
import { NavLink } from "./NavLink";

export function SiteHeader({ viewer }: { viewer: Viewer | null }) {
  const home = viewer ? (viewer.role === "student" ? "/learn" : "/parent") : "/";
  return (
    <header className="site-header">
      <div className="wrap">
        <Link href={home} className="brand">
          <span className="brand-mark" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-ink)" strokeWidth="2.4" strokeLinecap="round">
              <path d="M4 18c3-7 6-10 8-10s5 3 8 10" />
              <circle cx="12" cy="5" r="1.6" fill="var(--accent-ink)" stroke="none" />
            </svg>
          </span>
          {BRAND.name}
        </Link>
        <nav className="site-nav" aria-label="Main">
          {viewer?.role === "student" && (
            <>
              <NavLink href="/learn">My learning</NavLink>
              <NavLink href="/learn/review">Reviews</NavLink>
            </>
          )}
          {viewer?.role === "parent" && <NavLink href="/parent">My children</NavLink>}
          {viewer && <NavLink href="/settings">Settings</NavLink>}
          {viewer ? (
            <form action={signOut}>
              <button type="submit">Log out</button>
            </form>
          ) : (
            <>
              <NavLink href="/login">Log in</NavLink>
              <NavLink href="/signup">Create a parent account</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
