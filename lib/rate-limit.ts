type Bucket = {
  count: number;
  resetAt: number;
};

const globalBuckets = globalThis as typeof globalThis & {
  __rateLimitBuckets?: Map<string, Bucket>;
};

const buckets = globalBuckets.__rateLimitBuckets ?? new Map<string, Bucket>();
globalBuckets.__rateLimitBuckets = buckets;

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: now + windowMs
    };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: bucket.resetAt
    };
  }

  bucket.count += 1;
  buckets.set(key, bucket);

  return {
    allowed: true,
    remaining: Math.max(0, limit - bucket.count),
    resetAt: bucket.resetAt
  };
}

export function getClientIdentifier(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() ?? realIp ?? "anonymous";
}
