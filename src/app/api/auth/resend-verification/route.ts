import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  canResendVerification,
  issueEmailVerificationToken,
} from "@/lib/auth-tokens";
import { appUrl, sendEmail, verificationEmail } from "@/lib/email";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const limit = await checkRateLimit(
    `resend-verification:${session.user.id}`,
    { limit: 5, windowSeconds: 60 * 60 }
  );

  if (!limit.ok) {
    return rateLimitResponse(limit.retryAfterSeconds);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, emailVerified: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  if (user.emailVerified) {
    return NextResponse.json({ ok: true, alreadyVerified: true });
  }

  if (!(await canResendVerification(user.id))) {
    return NextResponse.json(
      { error: "Please wait a minute before requesting another email." },
      { status: 429 }
    );
  }

  const token = await issueEmailVerificationToken(user.id);
  const url = appUrl(`/verify-email?token=${token}`);

  const { sent, skipped } = await sendEmail({
    to: user.email,
    ...verificationEmail({ url, name: user.name }),
  });

  return NextResponse.json({
    ok: true,
    sent,
    // When email delivery is not configured there is no other way to verify,
    // so hand the link back to the signed-in owner of the account.
    devUrl: skipped ? url : undefined,
  });
}