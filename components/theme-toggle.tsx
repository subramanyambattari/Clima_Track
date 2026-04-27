"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      className="border border-white/10 bg-white/5 text-white hover:bg-white/10"
    >
      <SunMedium className="h-4 w-4 dark:hidden" />
      <MoonStar className="hidden h-4 w-4 dark:block" />
    </Button>
  );
}
