import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { issuePasswordResetToken } from "@/lib/auth-tokens";
import { appUrl, sendEmail, passwordResetEmail } from "@/lib/email";
import { checkRateLimit, clientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const limit = await checkRateLimit(`forgot-password:${clientIp(req)}`, {
    limit: 5,
    windowSeconds: 15 * 60,
  });

  if (!limit.ok) {
    return rateLimitResponse(limit.retryAfterSeconds);
  }

  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!email) {
    return NextResponse.json(
      { error: "Enter the email address for your account." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Only credential accounts can reset a password, and we always return the
  // same response so this endpoint cannot be used to enumerate accounts.
  if (user?.password) {
    const token = await issuePasswordResetToken(user.id);
    const url = appUrl(`/reset-password?token=${token}`);

    const { skipped } = await sendEmail({
      to: user.email,
      ...passwordResetEmail({ url, name: user.name }),
    });

    if (skipped && process.env.NODE_ENV !== "production") {
      console.warn(`[email] password reset link for ${user.email}: ${url}`);
    }
  }

  return NextResponse.json({ ok: true });
}