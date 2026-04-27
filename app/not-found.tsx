import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">404</p>
        <h1 className="mt-4 font-[var(--font-display)] text-4xl font-semibold">Page not found</h1>
        <p className="mt-3 text-slate-400">The page you are looking for does not exist.</p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-cyan-400 px-4 text-sm font-medium text-slate-950 transition-colors hover:bg-cyan-300"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
