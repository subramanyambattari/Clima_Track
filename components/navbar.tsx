"use client";

import { signOut, useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-background/70 px-4 py-3 backdrop-blur-xl md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Dashboard</p>
          <h2 className="font-[var(--font-display)] text-xl font-semibold">Weather + outfit planner</h2>
        </div>
        <div className="flex items-center gap-3">
          {session?.user?.email ? (
            <Badge variant="secondary" className="hidden border-white/10 bg-white/5 text-white sm:inline-flex">
              {session.user.email}
            </Badge>
          ) : null}
          <ThemeToggle />
          <Button
            type="button"
            variant="outline"
            className="border-white/15 bg-white/5 text-white hover:bg-white/10"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
