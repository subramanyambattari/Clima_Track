"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OutfitSuggestion } from "@/types/outfit";
import type { WeatherData } from "@/types/weather";

export function SaveOutfitButton({
  suggestion,
  weather
}: {
  suggestion: OutfitSuggestion;
  weather: WeatherData;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/saved-outfits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestion, weather })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to save outfit.");
      }

      setSaved(true);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to save outfit.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleSave}
        variant="outline"
        className="border-white/15 bg-white/5 text-white"
        disabled={saving || saved}
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookmarkPlus className="h-4 w-4" />}
        {saved ? "Saved" : "Save outfit"}
      </Button>
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
