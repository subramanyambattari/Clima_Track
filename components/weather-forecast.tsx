import {
  Cloud,
  CloudFog,
  CloudRain,
  CloudSnow,
  CloudSun,
  SunMedium,
  Wind,
  CalendarDays,
  Clock3,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTemperature } from "@/lib/utils";
import type { WeatherData, WeatherForecast } from "@/types/weather";

function getWeatherIcon(main: string) {
  const value = main.toLowerCase();
  if (value.includes("rain") || value.includes("drizzle")) return CloudRain;
  if (value.includes("snow")) return CloudSnow;
  if (value.includes("fog") || value.includes("mist") || value.includes("haze")) return CloudFog;
  if (value.includes("cloud")) return Cloud;
  if (value.includes("wind")) return Wind;
  if (value.includes("sun")) return CloudSun;
  return SunMedium;
}

function formatUpdatedAt(updatedAt: string) {
  return new Date(updatedAt).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}

function formatBestWindow(hourly: WeatherForecast["hourly"]) {
  const candidate = [...hourly].sort((left, right) => {
    if (left.precipitationChance !== right.precipitationChance) {
      return left.precipitationChance - right.precipitationChance;
    }

    const leftGap = Math.abs(left.feelsLike - left.temperature);
    const rightGap = Math.abs(right.feelsLike - right.temperature);
    return leftGap - rightGap;
  })[0];

  return candidate?.timeLabel ?? "Later today";
}

export function WeatherForecastPanel({
  weather,
  forecast
}: {
  weather: WeatherData;
  forecast: WeatherForecast;
}) {
  const bestWindow = formatBestWindow(forecast.hourly);
  const rainRisk = Math.max(...forecast.hourly.map((item) => item.precipitationChance), 0);
  const warmestDay = [...forecast.daily].sort((left, right) => right.high - left.high)[0];
  const coolestDay = [...forecast.daily].sort((left, right) => left.low - right.low)[0];
  const hourlyPeriods = forecast.hourly.slice(0, 6);
  const dailyPeriods = forecast.daily.slice(0, 5);

  return (
    <Card className="glass border-white/10 shadow-glow">
      <CardHeader className="space-y-2 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardDescription className="text-cyan-200/80">Weather outlook</CardDescription>
            <CardTitle className="font-[var(--font-display)] text-2xl lg:text-3xl">
              Hourly forecast and 5-day outlook
            </CardTitle>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Updated {formatUpdatedAt(weather.updatedAt)}</Badge>
            <Badge variant="secondary">
              {weather.location.city}
              {weather.location.country ? `, ${weather.location.country}` : ""}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.55fr)] xl:items-start">
          <section className="self-start rounded-3xl border border-white/10 bg-slate-950/40 p-4 lg:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Next 24 hours</p>
                <p className="mt-1 text-lg font-medium text-white/90">Short-term forecast</p>
              </div>
              <Clock3 className="h-5 w-5 text-cyan-300" />
            </div>

            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {hourlyPeriods.map((period) => {
                const HourIcon = getWeatherIcon(period.condition.main);

                return (
                  <article
                    key={period.timestamp}
                    className="min-w-[7.5rem] rounded-3xl border border-white/10 bg-white/5 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-slate-300">{period.timeLabel}</p>
                      <HourIcon className="h-4 w-4 text-cyan-300" />
                    </div>
                    <p className="mt-2 text-xl font-semibold">
                      {formatTemperature(period.temperature, weather.unit)}
                    </p>
                    <p className="mt-1 line-clamp-2 min-h-[2rem] text-xs text-slate-400">{period.condition.description}</p>
                    <div className="mt-2 space-y-1 text-xs text-slate-300">
                      <p>Feels {formatTemperature(period.feelsLike, weather.unit)}</p>
                      <p>Rain {period.precipitationChance}%</p>
                      <p>Wind {period.windSpeed} m/s</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="self-start rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-4 lg:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-cyan-100/80">Today at a glance</p>
                <p className="mt-1 text-lg font-medium text-cyan-50/95">Quick weather intelligence</p>
              </div>
              <Sparkles className="h-5 w-5 text-cyan-200" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
                <p className="text-[0.7rem] uppercase tracking-[0.2em] text-slate-400">Rain risk</p>
                <p className="mt-1 text-lg font-semibold">{rainRisk}%</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
                <p className="text-[0.7rem] uppercase tracking-[0.2em] text-slate-400">Best window</p>
                <p className="mt-1 text-lg font-semibold">{bestWindow}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
                <p className="text-[0.7rem] uppercase tracking-[0.2em] text-slate-400">Feels-like</p>
                <p className="mt-1 text-lg font-semibold">{formatTemperature(weather.feelsLike, weather.unit)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
                <p className="text-[0.7rem] uppercase tracking-[0.2em] text-slate-400">Sunrise / Sunset</p>
                <p className="mt-1 text-lg font-semibold">
                  {weather.sunrise ?? "--:--"} / {weather.sunset ?? "--:--"}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary">
                Warmest: {warmestDay?.label ?? "-"} {warmestDay ? formatTemperature(warmestDay.high, weather.unit) : ""}
              </Badge>
              <Badge variant="secondary">
                Coolest: {coolestDay?.label ?? "-"} {coolestDay ? formatTemperature(coolestDay.low, weather.unit) : ""}
              </Badge>
            </div>
          </section>
        </div>

        <section className="rounded-3xl border border-white/10 bg-slate-950/40 p-4 lg:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">5-day outlook</p>
              <p className="mt-1 text-lg font-medium text-white/90">Daily forecast summary</p>
            </div>
            <CalendarDays className="h-5 w-5 text-cyan-300" />
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {dailyPeriods.map((day) => {
              const DayIcon = getWeatherIcon(day.condition.main);

              return (
                <article key={day.date} className="rounded-3xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white/90">{day.label}</p>
                      <p className="text-xs text-slate-400">{day.condition.description}</p>
                    </div>
                    <DayIcon className="h-5 w-5 text-cyan-300" />
                  </div>

                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <p className="text-xl font-semibold">{formatTemperature(day.high, weather.unit)}</p>
                      <p className="text-sm text-slate-400">
                        Low {formatTemperature(day.low, weather.unit)}
                      </p>
                    </div>
                    <Badge variant="outline">Rain {day.precipitationChance}%</Badge>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
