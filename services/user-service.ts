import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  getLocalPreferences,
  getLocalUserByEmail,
  getLocalUserById,
  isLocalDataMode,
  listLocalSavedOutfits,
  listLocalSearchHistory,
  recordLocalSearchHistory,
  saveLocalOutfit,
  deleteLocalSavedOutfit,
  upsertLocalPreferences,
  upsertLocalUser,
  upsertLocalUser as upsertLocalOAuthUser
} from "@/lib/local-store";
import type { OutfitSuggestion } from "@/types/outfit";
import type { WeatherData } from "@/types/weather";
import { preferencesSchema, signupSchema } from "@/lib/validators";
import { createOutfitSuggestion } from "@/services/outfit-service";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

function toAuthUser(user: {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image ?? null
  };
}

function createDefaultPreferences(userId: string) {
  return {
    id: "",
    userId,
    stylePreference: "CASUAL" as const,
    homeCity: null,
    units: "metric",
    weatherAlerts: false,
    favoriteWeather: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

export async function createUser(input: unknown) {
  const parsed = signupSchema.parse(input);

  if (isLocalDataMode()) {
    const existingUser = await getLocalUserByEmail(parsed.email.toLowerCase());
    if (existingUser) {
      throw new Error("An account already exists with this email address.");
    }

    const passwordHash = await bcrypt.hash(parsed.password, 12);
    const user = await upsertLocalUser({
      name: parsed.name.trim(),
      email: parsed.email.toLowerCase(),
      passwordHash,
      image: null
    });

    await upsertLocalPreferences(user.id, {
      stylePreference: parsed.stylePreference.toUpperCase() as "CASUAL" | "FORMAL" | "SPORTY",
      homeCity: parsed.homeCity?.trim() || null
    });

    return toAuthUser(user);
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.email.toLowerCase() }
  });

  if (existingUser) {
    throw new Error("An account already exists with this email address.");
  }

  const passwordHash = await bcrypt.hash(parsed.password, 12);

  const user = await prisma.user.create({
    data: {
      name: parsed.name.trim(),
      email: parsed.email.toLowerCase(),
      passwordHash,
      preferences: {
        create: {
          stylePreference: parsed.stylePreference.toUpperCase() as "CASUAL" | "FORMAL" | "SPORTY",
          homeCity: parsed.homeCity?.trim() || null
        }
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true
    }
  });

  return toAuthUser(user);
}

export async function verifyUser(email: string, password: string) {
  const normalizedEmail = email.toLowerCase();

  if (isLocalDataMode()) {
    const localUser = await getLocalUserByEmail(normalizedEmail);
    if (!localUser || !localUser.passwordHash) {
      return null;
    }

    const valid = await bcrypt.compare(password, localUser.passwordHash);
    if (!valid) {
      return null;
    }

    return toAuthUser(localUser);
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { preferences: true }
  });

  if (!user || !user.passwordHash) {
    return null;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return null;
  }

  return toAuthUser(user);
}

export async function upsertOAuthUser(input: {
  email?: string | null;
  name?: string | null;
  image?: string | null;
}) {
  if (!input.email) {
    return null;
  }

  const email = input.email.toLowerCase();
  const name = input.name?.trim() || email.split("@")[0] || "Google User";

  if (isLocalDataMode()) {
    const user = await upsertLocalOAuthUser({
      name,
      email,
      image: input.image ?? null
    });

    return toAuthUser(user);
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      image: input.image ?? null
    },
    create: {
      name,
      email,
      image: input.image ?? null,
      passwordHash: null
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true
    }
  });

  return toAuthUser(user);
}

export async function getUserById(userId: string) {
  if (isLocalDataMode()) {
    return getLocalUserById(userId);
  }

  return prisma.user.findUnique({
    where: { id: userId },
    include: { preferences: true }
  });
}

export async function upsertPreferences(userId: string, input: unknown) {
  const parsed = preferencesSchema.parse(input);

  if (isLocalDataMode()) {
    return upsertLocalPreferences(userId, {
      stylePreference: parsed.stylePreference.toUpperCase() as "CASUAL" | "FORMAL" | "SPORTY",
      homeCity: parsed.homeCity?.trim() || null,
      units: parsed.units,
      weatherAlerts: parsed.weatherAlerts,
      favoriteWeather: parsed.favoriteWeather
    });
  }

  return prisma.preferences.upsert({
    where: { userId },
    create: {
      userId,
      stylePreference: parsed.stylePreference.toUpperCase() as "CASUAL" | "FORMAL" | "SPORTY",
      homeCity: parsed.homeCity?.trim() || null,
      units: parsed.units,
      weatherAlerts: parsed.weatherAlerts,
      favoriteWeather: parsed.favoriteWeather
    },
    update: {
      stylePreference: parsed.stylePreference.toUpperCase() as "CASUAL" | "FORMAL" | "SPORTY",
      homeCity: parsed.homeCity?.trim() || null,
      units: parsed.units,
      weatherAlerts: parsed.weatherAlerts,
      favoriteWeather: parsed.favoriteWeather
    }
  });
}

export async function getPreferences(userId: string) {
  if (isLocalDataMode()) {
    return getLocalPreferences(userId);
  }

  return prisma.preferences.findUnique({ where: { userId } });
}

export async function saveOutfit(
  userId: string,
  suggestion: OutfitSuggestion,
  weather: WeatherData
) {
  if (isLocalDataMode()) {
    return saveLocalOutfit(userId, {
      title: suggestion.title,
      summary: suggestion.summary,
      weatherMood: suggestion.weatherMood.toUpperCase(),
      stylePreference: suggestion.stylePreference.toUpperCase() as "CASUAL" | "FORMAL" | "SPORTY",
      unit: weather.unit,
      temperature: weather.temperature,
      condition: weather.condition.main,
      items: suggestion.items,
      accessories: suggestion.accessories
    });
  }

  return prisma.savedOutfit.create({
    data: {
      userId,
      title: suggestion.title,
      summary: suggestion.summary,
      weatherMood: suggestion.weatherMood.toUpperCase() as
        | "HOT"
        | "WARM"
        | "MILD"
        | "COOL"
        | "COLD"
        | "RAIN"
        | "SNOW"
        | "WINDY"
        | "HUMID",
      stylePreference: suggestion.stylePreference.toUpperCase() as "CASUAL" | "FORMAL" | "SPORTY",
      unit: weather.unit,
      temperature: weather.temperature,
      condition: weather.condition.main,
      items: suggestion.items,
      accessories: suggestion.accessories
    }
  });
}

export async function listSavedOutfits(userId: string) {
  if (isLocalDataMode()) {
    return listLocalSavedOutfits(userId);
  }

  return prisma.savedOutfit.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 12
  });
}

export async function deleteSavedOutfit(userId: string, outfitId: string) {
  if (isLocalDataMode()) {
    return deleteLocalSavedOutfit(userId, outfitId);
  }

  return prisma.savedOutfit.deleteMany({
    where: { id: outfitId, userId }
  });
}

export async function recordSearchHistory(params: {
  userId: string;
  city: string;
  country?: string;
  unit?: string;
  temperature: number;
  condition: string;
  outfitTitle: string;
  queryType?: string;
}) {
  if (isLocalDataMode()) {
    return recordLocalSearchHistory(params);
  }

  return prisma.searchHistory.create({
    data: {
      userId: params.userId,
      city: params.city,
      country: params.country,
      unit: params.unit ?? "metric",
      temperature: params.temperature,
      condition: params.condition,
      outfitTitle: params.outfitTitle,
      queryType: params.queryType ?? "city"
    }
  });
}

export async function listSearchHistory(userId: string) {
  if (isLocalDataMode()) {
    return listLocalSearchHistory(userId);
  }

  return prisma.searchHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 12
  });
}

export async function hydratePreferences(userId: string) {
  const preferences = await getPreferences(userId);
  return preferences ?? createDefaultPreferences(userId);
}

export function buildOutfitSuggestion(weather: WeatherData, stylePreference: string | null | undefined) {
  const style = (stylePreference ?? "casual").toLowerCase() as "casual" | "formal" | "sporty";
  return createOutfitSuggestion(weather, style);
}
