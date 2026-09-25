import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { consumePasswordResetToken } from "@/lib/auth-tokens";
import { checkRateLimit, clientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const limit = await checkRateLimit(`reset-password:${clientIp(req)}`, {
    limit: 10,
    windowSeconds: 15 * 60,
  });

  if (!limit.ok) {
    return rateLimitResponse(limit.retryAfterSeconds);
  }

  const body = await req.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!token) {
    return NextResponse.json(
      { error: "Reset token is required." },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const result = await consumePasswordResetToken(token, hashedPassword);

  if (!result.ok) {
    return NextResponse.json(
      {
        error:
          result.reason === "expired"
            ? "This reset link has expired. Request a new one."
            : "This reset link is invalid or has already been used.",
      },
      { status: result.reason === "expired" ? 410 : 400 }
    );
  }

  return NextResponse.json({ ok: true });
}