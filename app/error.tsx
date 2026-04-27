"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-glow">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-300/80">Something broke</p>
        <h1 className="mt-3 font-[var(--font-display)] text-3xl font-semibold">We could not load this page</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">{error.message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={reset} className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">
            Try again
          </Button>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
