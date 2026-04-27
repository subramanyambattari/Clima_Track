import { Cloud, CloudFog, CloudRain, CloudSnow, SunMedium, Wind } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTemperature } from "@/lib/utils";
import type { WeatherData } from "@/types/weather";

function getWeatherIcon(main: string) {
  const value = main.toLowerCase();
  if (value.includes("rain") || value.includes("drizzle")) return CloudRain;
  if (value.includes("snow")) return CloudSnow;
  if (value.includes("fog") || value.includes("mist") || value.includes("haze")) return CloudFog;
  if (value.includes("cloud")) return Cloud;
  if (value.includes("wind")) return Wind;
  return SunMedium;
}

export function WeatherSummary({ weather }: { weather: WeatherData }) {
  const Icon = getWeatherIcon(weather.condition.main);

  return (
    <Card className="glass border-white/10 shadow-glow">
      <CardHeader>
        <CardDescription className="text-cyan-200/80">Current weather</CardDescription>
        <CardTitle className="font-[var(--font-display)] text-3xl">
          {weather.location.city}
          {weather.location.country ? `, ${weather.location.country}` : ""}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <div>
            <p className="text-5xl font-semibold tracking-tight">
              {formatTemperature(weather.temperature, weather.unit)}
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Feels like {formatTemperature(weather.feelsLike, weather.unit)} |{" "}
              {weather.condition.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary">{weather.condition.main}</Badge>
              <Badge variant="outline">Humidity {weather.humidity}%</Badge>
              <Badge variant="outline">Wind {weather.windSpeed} m/s</Badge>
              <Badge variant="outline">Sunrise {weather.sunrise ?? "--:--"}</Badge>
              <Badge variant="outline">Sunset {weather.sunset ?? "--:--"}</Badge>
            </div>
          </div>
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">
            <Icon className="h-12 w-12" />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Pressure</p>
            <p className="mt-2 text-xl font-semibold">{weather.pressure} hPa</p>
          </div>
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Visibility</p>
            <p className="mt-2 text-xl font-semibold">{Math.round(weather.visibility / 1000)} km</p>
          </div>
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Sunrise</p>
            <p className="mt-2 text-xl font-semibold">{weather.sunrise ?? "--:--"}</p>
          </div>
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Sunset</p>
            <p className="mt-2 text-xl font-semibold">{weather.sunset ?? "--:--"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
