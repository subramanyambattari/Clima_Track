type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const globalCache = globalThis as typeof globalThis & {
  __weatherCache?: Map<string, CacheEntry<unknown>>;
};

const cacheStore = globalCache.__weatherCache ?? new Map<string, CacheEntry<unknown>>();
globalCache.__weatherCache = cacheStore;

export function getCache<T>(key: string): T | null {
  const entry = cacheStore.get(key);
  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    cacheStore.delete(key);
    return null;
  }

  return entry.value as T;
}

export function setCache<T>(key: string, value: T, ttlMs: number) {
  cacheStore.set(key, {
    value,
    expiresAt: Date.now() + ttlMs
  });
}

export function cacheKey(parts: Array<string | number | null | undefined>) {
  return parts.filter(Boolean).join(":").toLowerCase();
}
