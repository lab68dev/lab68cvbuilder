import { NextRequest, NextResponse } from "next/server";
import { handlers } from "@/auth";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

const magicLinkLimiter = createRateLimiter({
  name: "magic-link",
  limit: 5,
  windowSeconds: 900,
});

export const { GET } = handlers;

export async function POST(request: NextRequest) {
  if (request.nextUrl.pathname.endsWith("/signin/resend")) {
    const rl = await magicLinkLimiter.check(getClientIp(request.headers));
    if (!rl.allowed) {
      // next-auth's client signIn() reads the error code from a `url` field.
      return NextResponse.json(
        { url: `${request.nextUrl.origin}/login?error=RateLimited` },
        {
          status: 429,
          headers: { "Retry-After": String(rl.retryAfterSeconds) },
        },
      );
    }
  }

  return handlers.POST(request);
}
