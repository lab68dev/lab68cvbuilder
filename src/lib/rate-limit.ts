import { NextResponse } from "next/server";
import { lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { rateLimits } from "@/db/schema";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimiterOptions {
  /** Keeps each feature's counters apart in the shared store */
  name: string;
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
}

export type RateLimiter = ReturnType<typeof createRateLimiter>;

export interface RateLimitStore {
  /** Atomically count one request and return its window. */
  increment(
    key: string,
    windowMs: number,
  ): Promise<RateLimitEntry> | RateLimitEntry;
}

/**
 * Counters live in Postgres so every server instance shares them.
 * One upsert does the read and the write, so parallel requests cannot slip past.
 */
const postgresRateLimitStore: RateLimitStore = {
  async increment(key, windowMs) {
    const newResetAt = sql`now() + ${windowMs} * interval '1 millisecond'`;
    const isExpired = sql`${rateLimits.resetAt} <= now()`;

    const [row] = await db
      .insert(rateLimits)
      .values({ key, count: 1, resetAt: newResetAt })
      .onConflictDoUpdate({
        target: rateLimits.key,
        set: {
          count: sql`case when ${isExpired} then 1 else ${rateLimits.count} + 1 end`,
          resetAt: sql`case when ${isExpired} then ${newResetAt} else ${rateLimits.resetAt} end`,
        },
      })
      .returning();

    // Rows are only reused by the same key, so clear out old ones now and then.
    if (Math.random() < 0.01) {
      await db.delete(rateLimits).where(lte(rateLimits.resetAt, sql`now()`));
    }

    return { count: row.count, resetTime: row.resetAt.getTime() };
  },
};

export function createRateLimiter(options: RateLimiterOptions) {
  return createRateLimiterWithStore(options, postgresRateLimitStore);
}

export function createRateLimiterWithStore(
  { name, limit, windowSeconds }: RateLimiterOptions,
  store: RateLimitStore,
) {
  const windowMs = windowSeconds * 1000;

  return {
    /**
     * Check if a request is allowed for the given key.
     * Returns { allowed: true } or { allowed: false, retryAfterSeconds }.
     */
    async check(
      key: string,
    ): Promise<
      { allowed: true } | { allowed: false; retryAfterSeconds: number }
    > {
      let entry: RateLimitEntry;
      try {
        entry = await store.increment(`${name}:${key}`, windowMs);
      } catch (error) {
        // A limiter outage must not take sign-in and export down with it.
        console.error("[rate-limit] store failed, allowing request:", error);
        return { allowed: true };
      }

      if (entry.count <= limit) {
        return { allowed: true };
      }

      const retryAfterSeconds = Math.max(
        Math.ceil((entry.resetTime - Date.now()) / 1000),
        1,
      );
      return { allowed: false, retryAfterSeconds };
    },
  };
}

/** Shared by the AI writing tools: 10 calls per hour per user. */
export const aiRateLimiter = createRateLimiter({
  name: "ai",
  limit: 10,
  windowSeconds: 3600,
});

/** Server-action version of a limit check: throws a message the UI can show. */
export async function enforceRateLimit(
  limiter: RateLimiter,
  key: string,
): Promise<void> {
  const result = await limiter.check(key);
  if (!result.allowed) {
    throw new Error(
      `Rate limit exceeded. Try again in ${result.retryAfterSeconds} seconds.`,
    );
  }
}

/**
 * Extract a client identifier from headers.
 * Uses x-forwarded-for (set by reverse proxies like Vercel), falls back to "anonymous".
 */
export function getClientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
}

/**
 * Standard 429 Too Many Requests response.
 */
export function rateLimitResponse(retryAfterSeconds: number): NextResponse {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests. Please try again later.",
      },
    },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    },
  );
}
