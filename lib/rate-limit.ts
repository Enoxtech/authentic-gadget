import { NextRequest } from "next/server";

interface RateLimitOptions {
  max: number;
  windowMs: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

interface RateLimitResult {
  limited: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function getClientKey(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown";

  return ip;
}

function pruneExpired(now: number) {
  if (buckets.size < 1000) return;

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function rateLimit(
  request: NextRequest,
  keyPrefix: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  pruneExpired(now);

  const key = `${keyPrefix}:${getClientKey(request)}`;
  const existing = buckets.get(key);
  const bucket =
    existing && existing.resetAt > now
      ? existing
      : { count: 0, resetAt: now + options.windowMs };

  bucket.count += 1;
  buckets.set(key, bucket);

  const remaining = Math.max(0, options.max - bucket.count);
  return {
    limited: bucket.count > options.max,
    limit: options.max,
    remaining,
    resetAt: bucket.resetAt,
  };
}

export function rateLimitHeaders(result: RateLimitResult) {
  return {
    "Retry-After": String(Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000))),
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  };
}
