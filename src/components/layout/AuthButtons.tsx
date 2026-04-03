"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export default function AuthButtons({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/auth/login"
          className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold hover:bg-white/10"
        >
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/dashboard/profile"
        className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold hover:bg-white/10"
      >
        Profile
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-xl bg-teal px-3 py-2 text-sm font-semibold text-background shadow-tealGlow hover:opacity-95"
      >
        Logout
      </button>
    </div>
  );
}

