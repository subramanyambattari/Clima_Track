"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CitySuggestion } from "@/types/weather";

function buildLabel(city: CitySuggestion) {
  return [city.name, city.state, city.country].filter(Boolean).join(", ");
}

export function CitySearch({
  defaultValue = ""
}: {
  defaultValue?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [isPending, startTransition] = useTransition();
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const activeQuery = useMemo(() => query.trim(), [query]);

  const currentCity = searchParams.get("city") ?? "";

  useEffect(() => {
    if (currentCity && currentCity !== query) {
      setQuery(currentCity);
    }
  }, [currentCity, query]);

  useEffect(() => {
    if (activeQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const response = await fetch(`/api/cities?q=${encodeURIComponent(activeQuery)}`, {
          signal: controller.signal
        });
        const data = await response.json();
        if (response.ok) {
          setSuggestions(data.cities ?? []);
        } else {
          setSuggestions([]);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [activeQuery]);

  function navigate(city: CitySuggestion) {
    const label = buildLabel(city);
    startTransition(() => {
      router.push(`${pathname}?city=${encodeURIComponent(label)}`);
      router.refresh();
    });
    setSuggestions([]);
  }

  function submit() {
    if (!query.trim()) {
      return;
    }

    startTransition(() => {
      router.push(`${pathname}?city=${encodeURIComponent(query.trim())}`);
      router.refresh();
    });
    setSuggestions([]);
  }

  return (
    <div className="relative rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
          <Search className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Search city</p>
          <p className="text-xs text-slate-400">Autocomplete powered by OpenWeather geocoding</p>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              submit();
            }
          }}
          placeholder="Search a city"
          className="bg-slate-950/40"
        />
        <Button onClick={submit} disabled={isPending} className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Search
        </Button>
      </div>

      {loadingSuggestions ? (
        <p className="mt-3 text-xs text-slate-400">Loading suggestions...</p>
      ) : null}

      {suggestions.length > 0 ? (
        <div className="mt-3 space-y-2 rounded-2xl border border-white/10 bg-slate-950/60 p-2">
          {suggestions.map((city) => (
            <button
              key={`${city.name}-${city.latitude}-${city.longitude}`}
              type="button"
              onClick={() => navigate(city)}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors hover:bg-white/5"
            >
              <div>
                <p className="text-sm font-medium">{buildLabel(city)}</p>
                <p className="text-xs text-slate-400">
                  {city.latitude.toFixed(2)}, {city.longitude.toFixed(2)}
                </p>
              </div>
              <Badge variant="outline">Use</Badge>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
