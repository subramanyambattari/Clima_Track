import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";

export type LocalStylePreference = "CASUAL" | "FORMAL" | "SPORTY";

export type LocalPreferences = {
  id: string;
  userId: string;
  stylePreference: LocalStylePreference;
  homeCity: string | null;
  units: string;
  weatherAlerts: boolean;
  favoriteWeather: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type LocalSavedOutfit = {
  id: string;
  userId: string;
  title: string;
  summary: string;
  weatherMood: string;
  stylePreference: LocalStylePreference;
  unit: string;
  temperature: number;
  condition: string;
  items: unknown;
  accessories: unknown;
  createdAt: Date;
};

export type LocalSearchHistory = {
  id: string;
  userId: string;
  city: string;
  country: string | null;
  unit: string;
  temperature: number;
  condition: string;
  outfitTitle: string;
  queryType: string;
  createdAt: Date;
};

export type LocalUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  passwordHash: string | null;
  createdAt: Date;
  updatedAt: Date;
  preferences: LocalPreferences | null;
  savedOutfits: LocalSavedOutfit[];
  searchHistory: LocalSearchHistory[];
};

type LocalState = {
  users: LocalUser[];
};

const STORE_PATH = join(process.cwd(), ".data", "local-store.json");

function createEmptyState(): LocalState {
  return { users: [] };
}

export function isLocalDataMode() {
  return process.env.NODE_ENV !== "production";
}

function normalizeUser(user: Partial<LocalUser> & { id: string; name: string; email: string }): LocalUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email.toLowerCase(),
    image: user.image ?? null,
    passwordHash: user.passwordHash ?? null,
    createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
    updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
    preferences: user.preferences
      ? {
          ...user.preferences,
          createdAt: new Date(user.preferences.createdAt),
          updatedAt: new Date(user.preferences.updatedAt)
        }
      : null,
    savedOutfits: (user.savedOutfits ?? []).map((item) => ({
      ...item,
      createdAt: new Date(item.createdAt)
    })),
    searchHistory: (user.searchHistory ?? []).map((item) => ({
      ...item,
      createdAt: new Date(item.createdAt)
    }))
  };
}

async function readState(): Promise<LocalState> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<LocalState>;
    if (!Array.isArray(parsed.users)) {
      return createEmptyState();
    }

    return {
      users: parsed.users.map((user) =>
        normalizeUser({
          ...user,
          id: user.id ?? randomUUID(),
          name: user.name ?? "User",
          email: user.email ?? "unknown@example.com"
        })
      )
    };
  } catch {
    return createEmptyState();
  }
}

async function writeState(state: LocalState) {
  await mkdir(dirname(STORE_PATH), { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(state, null, 2), "utf8");
}

function findUserByEmail(state: LocalState, email: string) {
  return state.users.find((user) => user.email === email.toLowerCase()) ?? null;
}

function findUserById(state: LocalState, userId: string) {
  return state.users.find((user) => user.id === userId) ?? null;
}

export async function getLocalUserByEmail(email: string) {
  const state = await readState();
  return findUserByEmail(state, email);
}

export async function getLocalUserById(userId: string) {
  const state = await readState();
  return findUserById(state, userId);
}

export async function upsertLocalUser(input: {
  id?: string;
  name: string;
  email: string;
  image?: string | null;
  passwordHash?: string | null;
}) {
  const state = await readState();
  const now = new Date();
  const normalizedEmail = input.email.toLowerCase();
  const existing = findUserByEmail(state, normalizedEmail);

  const nextUser: LocalUser = normalizeUser({
    id: input.id ?? existing?.id ?? randomUUID(),
    name: input.name.trim() || existing?.name || "User",
    email: normalizedEmail,
    image: input.image ?? existing?.image ?? null,
    passwordHash:
      input.passwordHash !== undefined ? input.passwordHash : existing?.passwordHash ?? null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    preferences: existing?.preferences ?? null,
    savedOutfits: existing?.savedOutfits ?? [],
    searchHistory: existing?.searchHistory ?? []
  });

  if (existing) {
    state.users = state.users.map((user) => (user.id === existing.id ? nextUser : user));
  } else {
    state.users.push(nextUser);
  }

  await writeState(state);
  return nextUser;
}

export async function setLocalPasswordHash(email: string, passwordHash: string) {
  const state = await readState();
  const user = findUserByEmail(state, email);
  if (!user) {
    return null;
  }

  const updated = normalizeUser({
    ...user,
    passwordHash,
    updatedAt: new Date()
  });

  state.users = state.users.map((item) => (item.id === user.id ? updated : item));
  await writeState(state);
  return updated;
}

export async function upsertLocalPreferences(
  userId: string,
  input: {
    stylePreference: LocalStylePreference;
    homeCity?: string | null;
    units?: string;
    weatherAlerts?: boolean;
    favoriteWeather?: string[];
  }
) {
  const state = await readState();
  const user = findUserById(state, userId);
  if (!user) {
    return null;
  }

  const now = new Date();
  const preferences: LocalPreferences = {
    id: user.preferences?.id ?? randomUUID(),
    userId,
    stylePreference: input.stylePreference,
    homeCity: input.homeCity?.trim() || null,
    units: input.units ?? "metric",
    weatherAlerts: input.weatherAlerts ?? false,
    favoriteWeather: input.favoriteWeather ?? [],
    createdAt: user.preferences?.createdAt ?? now,
    updatedAt: now
  };

  const updated = normalizeUser({
    ...user,
    preferences
  });

  state.users = state.users.map((item) => (item.id === user.id ? updated : item));
  await writeState(state);
  return updated.preferences;
}

export async function getLocalPreferences(userId: string) {
  const state = await readState();
  return findUserById(state, userId)?.preferences ?? null;
}

export async function listLocalSavedOutfits(userId: string) {
  const state = await readState();
  return [...(findUserById(state, userId)?.savedOutfits ?? [])].sort(
    (left, right) => right.createdAt.getTime() - left.createdAt.getTime()
  );
}

export async function saveLocalOutfit(
  userId: string,
  outfit: {
    title: string;
    summary: string;
    weatherMood: string;
    stylePreference: LocalStylePreference;
    unit: string;
    temperature: number;
    condition: string;
    items: unknown;
    accessories: unknown;
  }
) {
  const state = await readState();
  const user = findUserById(state, userId);
  if (!user) {
    return null;
  }

  const nextOutfit: LocalSavedOutfit = {
    id: randomUUID(),
    userId,
    title: outfit.title,
    summary: outfit.summary,
    weatherMood: outfit.weatherMood,
    stylePreference: outfit.stylePreference,
    unit: outfit.unit,
    temperature: outfit.temperature,
    condition: outfit.condition,
    items: outfit.items,
    accessories: outfit.accessories,
    createdAt: new Date()
  };

  const updated = normalizeUser({
    ...user,
    savedOutfits: [nextOutfit, ...user.savedOutfits].slice(0, 12)
  });

  state.users = state.users.map((item) => (item.id === user.id ? updated : item));
  await writeState(state);
  return nextOutfit;
}

export async function deleteLocalSavedOutfit(userId: string, outfitId: string) {
  const state = await readState();
  const user = findUserById(state, userId);
  if (!user) {
    return { count: 0 };
  }

  const before = user.savedOutfits.length;
  const updated = normalizeUser({
    ...user,
    savedOutfits: user.savedOutfits.filter((item) => item.id !== outfitId)
  });

  state.users = state.users.map((item) => (item.id === user.id ? updated : item));
  await writeState(state);
  return { count: before - updated.savedOutfits.length };
}

export async function recordLocalSearchHistory(params: {
  userId: string;
  city: string;
  country?: string;
  unit?: string;
  temperature: number;
  condition: string;
  outfitTitle: string;
  queryType?: string;
}) {
  const state = await readState();
  const user = findUserById(state, params.userId);
  if (!user) {
    return null;
  }

  const entry: LocalSearchHistory = {
    id: randomUUID(),
    userId: params.userId,
    city: params.city,
    country: params.country ?? null,
    unit: params.unit ?? "metric",
    temperature: params.temperature,
    condition: params.condition,
    outfitTitle: params.outfitTitle,
    queryType: params.queryType ?? "city",
    createdAt: new Date()
  };

  const updated = normalizeUser({
    ...user,
    searchHistory: [entry, ...user.searchHistory].slice(0, 12)
  });

  state.users = state.users.map((item) => (item.id === user.id ? updated : item));
  await writeState(state);
  return entry;
}

export async function listLocalSearchHistory(userId: string) {
  const state = await readState();
  return [...(findUserById(state, userId)?.searchHistory ?? [])].sort(
    (left, right) => right.createdAt.getTime() - left.createdAt.getTime()
  );
}
