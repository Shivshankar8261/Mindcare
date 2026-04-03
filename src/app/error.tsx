"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Helps dev: keep error boundary stable during recover.
    // (No-op in production.)
  }, [error]);

  return (
    <main className="min-h-screen px-4 py-10 max-w-2xl mx-auto">
      <div className="glass-card p-6">
        <div className="text-sm text-muted">Something went wrong</div>
        <h1 className="mt-2 text-2xl font-display tracking-tight">
          MindCare couldn&apos;t load this page
        </h1>
        <p className="mt-2 text-muted">
          Please try again. If this keeps happening, restart the dev server.
        </p>

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl bg-teal px-4 py-2 font-semibold text-background shadow-tealGlow"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 font-semibold"
          >
            Go to landing
          </Link>
        </div>
      </div>
    </main>
  );
}

