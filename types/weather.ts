export type WeatherUnit = "metric" | "imperial";

export interface WeatherLocation {
  city: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface WeatherCondition {
  main: string;
  description: string;
  icon: string;
}

export interface WeatherData {
  location: WeatherLocation;
  unit: WeatherUnit;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  condition: WeatherCondition;
  updatedAt: string;
  source: "openweather";
  sunrise?: string;
  sunset?: string;
}

export interface CitySuggestion {
  name: string;
  country?: string;
  state?: string;
  latitude: number;
  longitude: number;
}

export interface ForecastPeriod {
  timestamp: string;
  timeLabel: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  precipitationChance: number;
  condition: WeatherCondition;
}

export interface ForecastDay {
  date: string;
  label: string;
  high: number;
  low: number;
  precipitationChance: number;
  condition: WeatherCondition;
}

export interface WeatherForecast {
  hourly: ForecastPeriod[];
  daily: ForecastDay[];
}
