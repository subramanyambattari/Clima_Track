"use client";

import { CalendarDays, LayoutDashboard, SlidersHorizontal, Star, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const links = [
  { href: "#overview", label: "Overview", icon: LayoutDashboard },
  { href: "#preferences", label: "Preferences", icon: SlidersHorizontal },
  { href: "#saved", label: "Saved outfits", icon: Star },
  { href: "#history", label: "History", icon: Clock3 }
];

export function AppSidebar() {
  return (
    <aside className="hidden border-r border-white/10 bg-white/5 md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:w-72 md:flex-col">
      <div className="flex h-full flex-col p-5">
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5 shadow-glow">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">Clima Track</p>
              <p className="font-[var(--font-display)] text-lg font-semibold">Outfit system</p>
            </div>
          </div>
          <Badge className="mt-4 bg-cyan-400/10 text-cyan-200">SSR + real-time weather</Badge>
        </div>

        <nav className="mt-6 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const active = link.href === "#overview";
            return (
              <a
                key={link.label}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors",
                  active ? "bg-cyan-400/15 text-cyan-200" : "text-slate-300 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
              </a>
            );
          })}
        </nav>

      </div>
    </aside>
  );
}
