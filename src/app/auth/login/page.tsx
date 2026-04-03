"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const universityHint = useMemo(() => "@vidyashilp.edu.in", []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });
      if (!res?.ok) {
        setError("Invalid email or password.");
        return;
      }
      window.location.href = "/dashboard";
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-72px)] px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md glass-card p-6">
        <div className="flex items-center justify-center">
          <Image
            src="/illustrations/mindcare-mascot.svg"
            alt="MindCare mascot"
            width={96}
            height={96}
            priority={false}
          />
        </div>
        <div className="mb-6">
          <h1 className="text-3xl font-display tracking-tight">
            MindCare Login
          </h1>
          <p className="mt-2 text-muted">
            Use your university email {universityHint}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm text-muted">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 outline-none focus:border-teal/70"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm text-muted">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 outline-none focus:border-teal/70"
              required
            />
          </div>

          {error ? (
            <div
              className="rounded-lg border border-rose/40 bg-rose/10 px-3 py-2 text-rose"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-teal px-4 py-2 font-semibold text-background shadow-tealGlow disabled:opacity-60"
          >
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-5">
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2 font-semibold text-foreground hover:bg-white/10"
          >
            Continue with Google
          </button>
        </div>

        <div className="mt-6 text-sm text-muted flex justify-between">
          <a href="/auth/register" className="underline underline-offset-4">
            Create an account
          </a>
          <a href="/resources/crisis" className="underline underline-offset-4">
            Crisis Support
          </a>
        </div>
      </div>
    </div>
  );
}

