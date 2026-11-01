import assert from "node:assert";
import { describe, it } from "node:test";
import {
  createRateLimiterWithStore,
  enforceRateLimit,
  type RateLimitStore,
  rateLimitResponse,
} from "../rate-limit";

function createMemoryStore(): RateLimitStore {
  const entries = new Map<string, { count: number; resetTime: number }>();

  return {
    increment(key, windowMs) {
      const now = Date.now();
      const existing = entries.get(key);
      const entry =
        existing && now < existing.resetTime
          ? { ...existing, count: existing.count + 1 }
          : { count: 1, resetTime: now + windowMs };
      entries.set(key, entry);
      return entry;
    },
  };
}

describe("security-rate-limit", () => {
  it("blocks requests after limit is exceeded", async () => {
    const limiter = createRateLimiterWithStore(
      { name: "test", limit: 2, windowSeconds: 60 },
      createMemoryStore(),
    );

    const first = await limiter.check("ip:127.0.0.1");
    const second = await limiter.check("ip:127.0.0.1");
    const third = await limiter.check("ip:127.0.0.1");

    assert.strictEqual(first.allowed, true);
    assert.strictEqual(second.allowed, true);
    assert.strictEqual(third.allowed, false);
    if (!third.allowed) {
      assert.ok(third.retryAfterSeconds > 0);
    }
  });

  it("keeps counters for different features apart in a shared store", async () => {
    const store = createMemoryStore();
    const ai = createRateLimiterWithStore(
      { name: "ai", limit: 1, windowSeconds: 60 },
      store,
    );
    const upload = createRateLimiterWithStore(
      { name: "upload", limit: 1, windowSeconds: 60 },
      store,
    );

    assert.strictEqual((await ai.check("user-1")).allowed, true);
    assert.strictEqual((await upload.check("user-1")).allowed, true);
    assert.strictEqual((await ai.check("user-1")).allowed, false);
  });

  it("allows the request when the store is down", async () => {
    const limiter = createRateLimiterWithStore(
      { name: "test", limit: 1, windowSeconds: 60 },
      {
        increment() {
          throw new Error("database unavailable");
        },
      },
    );

    assert.strictEqual((await limiter.check("user-1")).allowed, true);
  });

  it("throws a readable message from server actions", async () => {
    const limiter = createRateLimiterWithStore(
      { name: "test", limit: 0, windowSeconds: 60 },
      createMemoryStore(),
    );

    await assert.rejects(
      () => enforceRateLimit(limiter, "user-1"),
      /Rate limit exceeded/,
    );
  });

  it("returns standardized rate limit response payload", async () => {
    const response = rateLimitResponse(42);
    const body = (await response.json()) as {
      ok: boolean;
      error: { code: string; message: string };
    };

    assert.strictEqual(response.status, 429);
    assert.strictEqual(response.headers.get("Retry-After"), "42");
    assert.strictEqual(body.ok, false);
    assert.strictEqual(body.error.code, "RATE_LIMITED");
  });
});
