"use client";

import { useEffect } from "react";
import Link from "next/link";

import { mindcareRootBodyClassName } from "@/lib/mindcareFonts";

import "./globals.css";

/**
 * Next.js replaces the entire root layout when this boundary activates.
 * It must define <html>/<body> and import global CSS or the UI appears unstyled.
 */
export default function GlobalError({
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
    <html lang="en">
      <body className={mindcareRootBodyClassName}>
        <main className="min-h-screen px-4 py-10 max-w-2xl mx-auto">
          <div className="glass-card p-6">
            <div className="text-sm text-muted">MindCare error</div>
            <h1 className="mt-2 text-2xl font-display tracking-tight">
              We couldn&apos;t render the page
            </h1>
            <p className="mt-2 text-muted">Please try again.</p>

            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="rounded-xl bg-teal px-4 py-2 font-semibold text-background shadow-tealGlow"
              >
                Retry
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
      </body>
    </html>
  );
}
