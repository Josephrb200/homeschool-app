import Link from "next/link";
export default function NotFound() {
  return (
    <div className="wrap narrow stack">
      <h1>We couldn&apos;t find that page</h1>
      <p>It may have moved, or the link may be wrong.</p>
      <p><Link href="/">Go to the start</Link></p>
    </div>
  );
}
