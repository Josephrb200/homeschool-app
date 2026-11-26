"use client";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="wrap narrow stack">
      <h1>Something went wrong</h1>
      <p>Your answers so far are saved. Try again, and if it keeps happening, log out and back in.</p>
      <div><button className="btn btn-primary" onClick={reset}>Try again</button></div>
    </div>
  );
}
