import type { WeatherUnit } from "@/types/weather";

export type StylePreference = "casual" | "formal" | "sporty";
export type WeatherMood =
  | "hot"
  | "warm"
  | "mild"
  | "cool"
  | "cold"
  | "rain"
  | "snow"
  | "windy"
  | "humid";

export interface OutfitSuggestion {
  title: string;
  summary: string;
  weatherMood: WeatherMood;
  stylePreference: StylePreference;
  unit: WeatherUnit;
  temperature: number;
  condition: string;
  items: string[];
  accessories: string[];
  layeringTip: string;
  colorPalette: string[];
}
