import { z } from "zod";

export const stylePreferenceSchema = z.enum(["casual", "formal", "sporty"]);

export const signupSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  stylePreference: stylePreferenceSchema.default("casual"),
  homeCity: z.string().min(2).optional().or(z.literal(""))
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required")
});

export const preferencesSchema = z.object({
  stylePreference: stylePreferenceSchema,
  homeCity: z.string().min(2).optional().or(z.literal("")),
  units: z.enum(["metric", "imperial"]).default("metric"),
  weatherAlerts: z.boolean().default(false),
  favoriteWeather: z.array(z.string()).default([])
});

export const weatherQuerySchema = z.object({
  city: z.string().min(2).optional(),
  lat: z.coerce.number().optional(),
  lon: z.coerce.number().optional(),
  save: z.preprocess((value) => {
    if (typeof value !== "string") {
      return undefined;
    }

    return ["1", "true", "yes", "on"].includes(value.toLowerCase());
  }, z.boolean().optional())
});

export const citySearchSchema = z.object({
  q: z.string().min(2)
});
