"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const path = usePathname();
  const current = path === href || (href !== "/" && path.startsWith(href + "/") && href !== "/learn");
  return (
    <Link href={href} aria-current={current || path === href ? "page" : undefined}>
      {children}
    </Link>
  );
}
