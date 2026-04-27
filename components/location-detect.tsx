"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LocateFixed, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LocationDetect() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function detectLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const params = new URLSearchParams({
          lat: String(position.coords.latitude),
          lon: String(position.coords.longitude)
        });
        router.push(`${pathname}?${params.toString()}`);
        router.refresh();
        setLoading(false);
      },
      () => {
        setError("Location permission was denied.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <p className="text-sm font-medium">Use my location</p>
      <p className="mt-1 text-xs text-slate-400">
        Allow geolocation to fetch the weather where you are right now.
      </p>
      <div className="mt-4 flex items-center gap-3">
        <Button
          onClick={detectLocation}
          variant="outline"
          className="border-white/15 bg-white/5 text-white"
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
          Detect location
        </Button>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
      </div>
    </div>
  );
}
