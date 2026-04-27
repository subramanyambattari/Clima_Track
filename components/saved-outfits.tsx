"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatTemperature } from "@/lib/utils";

type SavedOutfit = {
  id: string;
  title: string;
  summary: string;
  weatherMood: string;
  stylePreference: string;
  temperature: number;
  unit: string;
  condition: string;
  createdAt: string;
  items: unknown;
  accessories: unknown;
};

export function SavedOutfits({ outfits: initialOutfits }: { outfits: SavedOutfit[] }) {
  const [outfits, setOutfits] = useState(initialOutfits);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/saved-outfits?id=${encodeURIComponent(id)}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        throw new Error("Unable to delete outfit.");
      }
      setOutfits((current) => current.filter((item) => item.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Card className="glass border-white/10 shadow-glow">
      <CardHeader>
        <CardDescription className="text-cyan-200/80">Saved outfits</CardDescription>
        <CardTitle className="font-[var(--font-display)] text-3xl">Your favorites</CardTitle>
      </CardHeader>
      <CardContent>
        {outfits.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
            No saved outfits yet. Save a recommendation from the weather card to build your wardrobe history.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {outfits.map((outfit) => (
              <div key={outfit.id} className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-semibold">{outfit.title}</h4>
                    <p className="mt-1 text-sm text-slate-400">{outfit.summary}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(outfit.id)}
                    className="text-slate-300 hover:bg-white/10 hover:text-white"
                  >
                    {deletingId === outfit.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="outline">{outfit.weatherMood}</Badge>
                  <Badge variant="outline">{outfit.stylePreference}</Badge>
                  <Badge variant="outline">
                    {formatTemperature(outfit.temperature, outfit.unit === "imperial" ? "imperial" : "metric")}
                  </Badge>
                  <Badge variant="outline">{outfit.condition}</Badge>
                </div>
                <p className="mt-4 text-xs text-slate-500">
                  Saved on {new Date(outfit.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
