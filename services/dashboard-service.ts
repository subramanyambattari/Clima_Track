import { hydratePreferences, listSavedOutfits, listSearchHistory } from "@/services/user-service";
import {
  getForecastByCity,
  getForecastByCoordinates,
  getWeatherByCity,
  getWeatherByCoordinates
} from "@/services/weather-service";
import { buildOutfitSuggestion } from "@/services/user-service";

export async function loadDashboardData(params: {
  userId: string;
  city?: string;
  lat?: number;
  lon?: number;
  fallbackCity?: string | null;
  stylePreference?: string | null;
}) {
  const preferences = await hydratePreferences(params.userId);
  const selectedStyle =
    params.stylePreference ??
    (typeof preferences.stylePreference === "string"
      ? preferences.stylePreference.toLowerCase()
      : "casual");
  const selectedUnits =
    typeof preferences.units === "string" && preferences.units === "imperial"
      ? "imperial"
      : "metric";

  const lat = params.lat;
  const lon = params.lon;
  const hasCoordinates =
    typeof lat === "number" &&
    typeof lon === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lon);

  const locationCity = params.city ?? params.fallbackCity ?? preferences.homeCity ?? "New Delhi";

  let weather;
  let forecast;
  if (hasCoordinates) {
    [weather, forecast] = await Promise.all([
      getWeatherByCoordinates(lat, lon, selectedUnits),
      getForecastByCoordinates(lat, lon, selectedUnits)
    ]);
  } else {
    [weather, forecast] = await Promise.all([
      getWeatherByCity(locationCity, selectedUnits),
      getForecastByCity(locationCity, selectedUnits)
    ]);
  }

  const suggestion = buildOutfitSuggestion(weather, selectedStyle);

  const [savedOutfits, history] = await Promise.all([
    listSavedOutfits(params.userId),
    listSearchHistory(params.userId)
  ]);

  return {
    preferences,
    weather,
    forecast,
    suggestion,
    savedOutfits,
    history
  };
}
