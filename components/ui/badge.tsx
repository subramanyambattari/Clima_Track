import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "secondary" | "outline" }) {
  const variantClasses = {
    default: "bg-cyan-400 text-slate-950",
    secondary: "bg-white/10 text-white",
    outline: "border border-white/15 bg-transparent text-white"
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
