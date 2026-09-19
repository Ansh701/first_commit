"use client";

import { useEffect } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="route-state-page">
      <div className="route-state-card">
        <span>
          <TriangleAlert size={28} />
        </span>
        <p className="auth-eyebrow">Something went wrong</p>
        <h1>Your work was not submitted.</h1>
        <p>
          The last safe state is preserved. Try this view again; if the problem
          continues, return to the previous page.
        </p>
        <button className="button button-accent" onClick={reset} type="button">
          <RefreshCw size={17} /> Try again
        </button>
      </div>
    </main>
  );
}
