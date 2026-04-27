import { cacheKey, getCache, setCache } from "@/lib/cache";
import { capitalize } from "@/lib/utils";
import type {
  CitySuggestion,
  ForecastDay,
  ForecastPeriod,
  WeatherData,
  WeatherForecast,
  WeatherUnit
} from "@/types/weather";

const WEATHER_TTL_MS = 10 * 60 * 1000;
const FORECAST_TTL_MS = 15 * 60 * 1000;
const CITY_TTL_MS = 60 * 60 * 1000;

type OpenWeatherCondition = {
  main?: string;
  description?: string;
  icon?: string;
};

type OpenWeatherCurrentResponse = {
  name?: string;
  timezone?: number;
  sys?: {
    country?: string;
    sunrise?: number;
    sunset?: number;
  };
  coord?: {
    lat?: number;
    lon?: number;
  };
  main?: {
    temp?: number;
    feels_like?: number;
    humidity?: number;
    pressure?: number;
  };
  wind?: {
    speed?: number;
  };
  visibility?: number;
  weather?: OpenWeatherCondition[];
};

type OpenWeatherForecastResponse = {
  city?: {
    name?: string;
    country?: string;
    timezone?: number;
  };
  list?: Array<{
    dt?: number;
    dt_txt?: string;
    main?: {
      temp?: number;
      feels_like?: number;
      humidity?: number;
      temp_min?: number;
      temp_max?: number;
    };
    wind?: {
      speed?: number;
    };
    weather?: OpenWeatherCondition[];
    pop?: number;
  }>;
};

function getApiKey() {
  const key = process.env.WEATHER_API_KEY;
  if (!key) {
    throw new Error("WEATHER_API_KEY is not configured.");
  }
  return key;
}

function getWeatherBaseUrl() {
  return "https://api.openweathermap.org/data/2.5/weather";
}

function getForecastBaseUrl() {
  return "https://api.openweathermap.org/data/2.5/forecast";
}

function getGeocodingUrl() {
  return "https://api.openweathermap.org/geo/1.0/direct";
}

function formatLocalTime(timestampSeconds: number, timezoneOffsetSeconds = 0, options?: Intl.DateTimeFormatOptions) {
  const adjusted = new Date((timestampSeconds + timezoneOffsetSeconds) * 1000);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    ...options
  }).format(adjusted);
}

function formatDateKey(timestampSeconds: number, timezoneOffsetSeconds = 0) {
  return new Date((timestampSeconds + timezoneOffsetSeconds) * 1000).toISOString().slice(0, 10);
}

function normalizeWeatherPayload(payload: OpenWeatherCurrentResponse, unit: WeatherUnit): WeatherData {
  const timezoneOffset = payload.timezone ?? 0;
  return {
    location: {
      city: payload.name ?? "Unknown location",
      country: payload.sys?.country,
      latitude: payload.coord?.lat,
      longitude: payload.coord?.lon
    },
    unit,
    temperature: payload.main?.temp ?? 0,
    feelsLike: payload.main?.feels_like ?? payload.main?.temp ?? 0,
    humidity: payload.main?.humidity ?? 0,
    windSpeed: payload.wind?.speed ?? 0,
    pressure: payload.main?.pressure ?? 0,
    visibility: payload.visibility ?? 0,
    condition: {
      main: payload.weather?.[0]?.main ?? "Clear",
      description: capitalize(payload.weather?.[0]?.description ?? "clear sky"),
      icon: payload.weather?.[0]?.icon ?? "01d"
    },
    updatedAt: new Date().toISOString(),
    source: "openweather",
    sunrise: payload.sys?.sunrise !== undefined ? formatLocalTime(payload.sys.sunrise, timezoneOffset, {
      hour: "numeric",
      minute: "2-digit"
    }) : undefined,
    sunset: payload.sys?.sunset !== undefined ? formatLocalTime(payload.sys.sunset, timezoneOffset, {
      hour: "numeric",
      minute: "2-digit"
    }) : undefined
  };
}

function normalizeForecastCondition(condition?: OpenWeatherCondition) {
  return {
    main: condition?.main ?? "Clear",
    description: capitalize(condition?.description ?? "clear sky"),
    icon: condition?.icon ?? "01d"
  };
}

function getRepresentativeEntry(
  items: NonNullable<OpenWeatherForecastResponse["list"]>,
  timezoneOffsetSeconds: number
) {
  const midday = items.find((item) => {
    if (item.dt === undefined) {
      return false;
    }

    return formatLocalTime(item.dt, timezoneOffsetSeconds, { hour: "2-digit", hour12: false }) === "12";
  });

  return midday ?? items[Math.floor(items.length / 2)] ?? items[0];
}

function normalizeForecastPayload(payload: OpenWeatherForecastResponse): WeatherForecast {
  const timezoneOffset = payload.city?.timezone ?? 0;
  const list = payload.list ?? [];
  const hourly: ForecastPeriod[] = list.slice(0, 8).flatMap((item) => {
    if (item.dt === undefined) {
      return [];
    }

    return [
      {
        timestamp: new Date(item.dt * 1000).toISOString(),
        timeLabel: formatLocalTime(item.dt, timezoneOffset, {
          hour: "numeric",
          minute: "2-digit"
        }),
        temperature: item.main?.temp ?? 0,
        feelsLike: item.main?.feels_like ?? item.main?.temp ?? 0,
        humidity: item.main?.humidity ?? 0,
        windSpeed: item.wind?.speed ?? 0,
        precipitationChance: Math.round((item.pop ?? 0) * 100),
        condition: normalizeForecastCondition(item.weather?.[0])
      }
    ];
  });

  const groupedByDay = new Map<string, NonNullable<OpenWeatherForecastResponse["list"]>>();

  for (const item of list) {
    if (item.dt === undefined) {
      continue;
    }

    const dateKey = formatDateKey(item.dt, timezoneOffset);
    const bucket = groupedByDay.get(dateKey) ?? [];
    bucket.push(item);
    groupedByDay.set(dateKey, bucket);
  }

  const daily: ForecastDay[] = Array.from(groupedByDay.entries())
    .slice(0, 5)
    .map(([dateKey, items]) => {
      const representative = getRepresentativeEntry(items, timezoneOffset);
      const temperatures = items
        .map((entry) => entry.main?.temp)
        .filter((value): value is number => typeof value === "number");

      return {
        date: dateKey,
        label: representative.dt !== undefined
          ? formatLocalTime(representative.dt, timezoneOffset, { weekday: "short" })
          : dateKey,
        high: temperatures.length ? Math.max(...temperatures) : 0,
        low: temperatures.length ? Math.min(...temperatures) : 0,
        precipitationChance: Math.max(
          ...items.map((entry) => Math.round((entry.pop ?? 0) * 100))
        ),
        condition: normalizeForecastCondition(representative.weather?.[0])
      };
    });

  return {
    hourly,
    daily
  };
}

export async function getWeatherByCity(city: string, unit: WeatherUnit = "metric") {
  const query = city.trim().toLowerCase();
  const key = cacheKey(["weather-city", query, unit]);
  const cached = getCache<WeatherData>(key);
  if (cached) {
    return cached;
  }

  const url = new URL(getWeatherBaseUrl());
  url.searchParams.set("q", city);
  url.searchParams.set("units", unit);
  url.searchParams.set("appid", getApiKey());

  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" }
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Unable to fetch weather data.");
  }

  const payload = (await response.json()) as OpenWeatherCurrentResponse;
  const normalized = normalizeWeatherPayload(payload, unit);
  setCache(key, normalized, WEATHER_TTL_MS);
  return normalized;
}

export async function getWeatherByCoordinates(
  lat: number,
  lon: number,
  unit: WeatherUnit = "metric"
) {
  const key = cacheKey(["weather-coordinates", lat.toFixed(2), lon.toFixed(2), unit]);
  const cached = getCache<WeatherData>(key);
  if (cached) {
    return cached;
  }

  const url = new URL(getWeatherBaseUrl());
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("units", unit);
  url.searchParams.set("appid", getApiKey());

  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" }
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Unable to fetch weather data.");
  }

  const payload = (await response.json()) as OpenWeatherCurrentResponse;
  const normalized = normalizeWeatherPayload(payload, unit);
  setCache(key, normalized, WEATHER_TTL_MS);
  return normalized;
}

export async function getForecastByCity(city: string, unit: WeatherUnit = "metric") {
  const query = city.trim().toLowerCase();
  const key = cacheKey(["forecast-city", query, unit]);
  const cached = getCache<WeatherForecast>(key);
  if (cached) {
    return cached;
  }

  const url = new URL(getForecastBaseUrl());
  url.searchParams.set("q", city);
  url.searchParams.set("units", unit);
  url.searchParams.set("appid", getApiKey());

  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" }
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Unable to fetch forecast data.");
  }

  const payload = (await response.json()) as OpenWeatherForecastResponse;
  const normalized = normalizeForecastPayload(payload);
  setCache(key, normalized, FORECAST_TTL_MS);
  return normalized;
}

export async function getForecastByCoordinates(
  lat: number,
  lon: number,
  unit: WeatherUnit = "metric"
) {
  const key = cacheKey(["forecast-coordinates", lat.toFixed(2), lon.toFixed(2), unit]);
  const cached = getCache<WeatherForecast>(key);
  if (cached) {
    return cached;
  }

  const url = new URL(getForecastBaseUrl());
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("units", unit);
  url.searchParams.set("appid", getApiKey());

  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" }
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Unable to fetch forecast data.");
  }

  const payload = (await response.json()) as OpenWeatherForecastResponse;
  const normalized = normalizeForecastPayload(payload);
  setCache(key, normalized, FORECAST_TTL_MS);
  return normalized;
}

export async function searchCities(query: string) {
  const normalized = query.trim().toLowerCase();
  const key = cacheKey(["city-search", normalized]);
  const cached = getCache<CitySuggestion[]>(key);
  if (cached) {
    return cached;
  }

  const url = new URL(getGeocodingUrl());
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "5");
  url.searchParams.set("appid", getApiKey());

  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" }
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Unable to fetch city suggestions.");
  }

  const payload = (await response.json()) as Array<{
    name: string;
    country?: string;
    state?: string;
    lat: number;
    lon: number;
  }>;

  const suggestions = payload.map((item) => ({
    name: item.name,
    country: item.country,
    state: item.state,
    latitude: item.lat,
    longitude: item.lon
  }));

  setCache(key, suggestions, CITY_TTL_MS);
  return suggestions;
}
