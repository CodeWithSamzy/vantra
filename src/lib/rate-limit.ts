import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export type RateLimitResult = {
  ok: boolean;
  retryAfterSeconds: number;
};

/**
 * Fixed-window rate limit backed by Postgres.
 *
 * In-memory counters would not hold on a serverless host, where each request
 * may land on a different instance, so the counter lives in the database.
 * Failures are swallowed on purpose: a broken limiter must never lock people
 * out of their accounts.
 */
export async function checkRateLimit(
  key: string,
  { limit, windowSeconds }: { limit: number; windowSeconds: number }
): Promise<RateLimitResult> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowSeconds * 1000);

  try {
    const existing = await prisma.rateLimit.findUnique({ where: { key } });

    if (!existing || existing.expiresAt <= now) {
      await prisma.rateLimit.upsert({
        where: { key },
        create: { key, count: 1, expiresAt },
        update: { count: 1, expiresAt },
      });

      if (Math.random() < 0.02) {
        await prisma.rateLimit
          .deleteMany({ where: { expiresAt: { lt: now } } })
          .catch(() => undefined);
      }

      return { ok: true, retryAfterSeconds: 0 };
    }

    if (existing.count >= limit) {
      return {
        ok: false,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((existing.expiresAt.getTime() - now.getTime()) / 1000)
        ),
      };
    }

    await prisma.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 } },
    });

    return { ok: true, retryAfterSeconds: 0 };
  } catch (error) {
    console.error("Rate limit check failed", error);
    return { ok: true, retryAfterSeconds: 0 };
  }
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function rateLimitMessage(seconds: number) {
  const minutes = Math.ceil(seconds / 60);
  return minutes <= 1
    ? "Too many attempts. Please wait a minute and try again."
    : `Too many attempts. Please try again in about ${minutes} minutes.`;
}

export function rateLimitResponse(seconds: number) {
  return NextResponse.json(
    { error: rateLimitMessage(seconds) },
    { status: 429, headers: { "Retry-After": String(seconds) } }
  );
}