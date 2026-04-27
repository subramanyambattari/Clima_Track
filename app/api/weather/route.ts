import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { weatherQuerySchema } from "@/lib/validators";
import {
  getWeatherByCity,
  getWeatherByCoordinates
} from "@/services/weather-service";
import { createOutfitSuggestion } from "@/services/outfit-service";
import { getPreferences, recordSearchHistory } from "@/services/user-service";

export async function GET(request: Request) {
  const limiter = checkRateLimit(
    `weather:${getClientIdentifier(request)}`,
    30,
    60 * 1000
  );

  if (!limiter.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = weatherQuerySchema.safeParse({
    city: searchParams.get("city") ?? undefined,
    lat: searchParams.get("lat") ?? undefined,
    lon: searchParams.get("lon") ?? undefined,
    save: searchParams.get("save") ?? undefined
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Provide a city name or latitude/longitude." },
      { status: 400 }
    );
  }

  try {
    if (parsed.data.city === undefined && (parsed.data.lat === undefined || parsed.data.lon === undefined)) {
      return NextResponse.json(
        { error: "Provide a city name or latitude/longitude." },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const preferences = session?.user?.id ? await getPreferences(session.user.id) : null;
    const units = preferences?.units === "imperial" ? "imperial" : "metric";

    const weather =
      parsed.data.lat !== undefined && parsed.data.lon !== undefined
        ? await getWeatherByCoordinates(parsed.data.lat, parsed.data.lon, units)
        : await getWeatherByCity(parsed.data.city ?? "", units);

    const stylePreference =
      preferences?.stylePreference === "FORMAL"
        ? "formal"
        : preferences?.stylePreference === "SPORTY"
          ? "sporty"
          : "casual";
    const suggestion = createOutfitSuggestion(weather, stylePreference);

    if (parsed.data.save && session?.user?.id) {
      await recordSearchHistory({
        userId: session.user.id,
        city: weather.location.city,
        country: weather.location.country,
        unit: weather.unit,
        temperature: weather.temperature,
        condition: weather.condition.main,
        outfitTitle: suggestion.title,
        queryType: parsed.data.lat !== undefined ? "location" : "city"
      });
    }

    return NextResponse.json(
      { weather, suggestion },
      {
        headers: {
          "Cache-Control": "s-maxage=300, stale-while-revalidate=900"
        }
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to fetch weather.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
