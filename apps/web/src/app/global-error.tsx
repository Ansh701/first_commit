"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main className="route-state-page">
          <div className="route-state-card">
            <span>
              <TriangleAlert size={28} />
            </span>
            <p className="auth-eyebrow">INSIPS recovery</p>
            <h1>We could not load this experience.</h1>
            <p>
              No action was submitted. Reload the application to return to the
              last saved state.
            </p>
            <button
              className="button button-accent"
              onClick={reset}
              type="button"
            >
              <RefreshCw size={17} /> Reload
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
