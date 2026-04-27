"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export function PreferencesForm({
  preferences
}: {
  preferences: {
    stylePreference: string;
    homeCity?: string | null;
    units: string;
    weatherAlerts: boolean;
    favoriteWeather?: string[];
  } | null;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stylePreference: formData.get("stylePreference"),
          homeCity: formData.get("homeCity"),
          units: formData.get("units"),
          weatherAlerts: formData.get("weatherAlerts") === "on",
          favoriteWeather: []
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to update preferences.");
      }

      setMessage("Preferences saved.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update preferences.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="glass border-white/10 shadow-glow">
      <CardHeader>
        <Badge className="w-fit bg-cyan-400/10 text-cyan-200">
          <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />
          Preferences
        </Badge>
        <CardTitle className="font-[var(--font-display)] text-3xl">Customize your style profile</CardTitle>
        <CardDescription className="text-slate-300">
          Tune outfit recommendations to match your style, city, and notification preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit(new FormData(event.currentTarget));
          }}
          className="grid gap-4 md:grid-cols-2"
        >
          <div className="space-y-2">
            <Label htmlFor="stylePreference">Preferred style</Label>
            <select
              id="stylePreference"
              name="stylePreference"
              defaultValue={preferences?.stylePreference?.toLowerCase() ?? "casual"}
              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm"
            >
              <option value="casual">Casual</option>
              <option value="formal">Formal</option>
              <option value="sporty">Sporty</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="homeCity">Home city</Label>
            <Input id="homeCity" name="homeCity" defaultValue={preferences?.homeCity ?? ""} placeholder="Bengaluru" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="units">Units</Label>
            <select
              id="units"
              name="units"
              defaultValue={preferences?.units ?? "metric"}
              className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm"
            >
              <option value="metric">Metric (°C)</option>
              <option value="imperial">Imperial (°F)</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-3 pt-8">
              <input
                type="checkbox"
                name="weatherAlerts"
                defaultChecked={preferences?.weatherAlerts ?? false}
                className="h-4 w-4 rounded border-white/20 bg-transparent"
              />
              Enable weather alerts
            </Label>
          </div>

          {message ? (
            <p className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              {message}
            </p>
          ) : null}

          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" disabled={loading} className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save preferences
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
