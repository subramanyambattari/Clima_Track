import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { OutfitSuggestion } from "@/types/outfit";
import type { WeatherData } from "@/types/weather";
import { SaveOutfitButton } from "@/components/save-outfit-button";
import { formatTemperature } from "@/lib/utils";

export function OutfitSuggestions({
  suggestion,
  weather
}: {
  suggestion: OutfitSuggestion;
  weather: WeatherData;
}) {
  return (
    <Card className="glass border-white/10 shadow-glow">
      <CardHeader>
        <CardDescription className="text-cyan-200/80">Suggested outfit</CardDescription>
        <CardTitle className="font-[var(--font-display)] text-3xl">{suggestion.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5">
          <p className="text-sm leading-6 text-cyan-50/90">{suggestion.summary}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">What to wear</p>
            <ul className="mt-4 space-y-2">
              {suggestion.items.map((item) => (
                <li key={item} className="rounded-2xl bg-white/5 px-4 py-3 text-sm">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Accessories</p>
            <ul className="mt-4 space-y-2">
              {suggestion.accessories.map((item) => (
                <li key={item} className="rounded-2xl bg-white/5 px-4 py-3 text-sm">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">Mood: {suggestion.weatherMood}</Badge>
          <Badge variant="outline">Style: {suggestion.stylePreference}</Badge>
          <Badge variant="outline">
            Temp: {formatTemperature(suggestion.temperature, suggestion.unit)}
          </Badge>
          <Badge variant="outline">Condition: {suggestion.condition}</Badge>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Layering tip</p>
          <p className="mt-2 text-sm leading-6 text-slate-200">{suggestion.layeringTip}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {suggestion.colorPalette.map((color) => (
              <Badge key={color} variant="secondary">
                {color}
              </Badge>
            ))}
          </div>
        </div>

        <SaveOutfitButton suggestion={suggestion} weather={weather} />
      </CardContent>
    </Card>
  );
}
