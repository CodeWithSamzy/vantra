import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createPersonalWorkspace } from "@/lib/workspace";
import { checkRateLimit, clientIp, rateLimitResponse } from "@/lib/rate-limit";
import { issueEmailVerificationToken } from "@/lib/auth-tokens";
import { appUrl, sendEmail, verificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const limit = await checkRateLimit(`register:${clientIp(req)}`, {
      limit: 5,
      windowSeconds: 60 * 60,
    });

    if (!limit.ok) {
      return rateLimitResponse(limit.retryAfterSeconds);
    }

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    await createPersonalWorkspace(user.id, name);

    // A failure here should never block sign-up: the dashboard offers a
    // "resend verification email" action for exactly this case.
    try {
      const token = await issueEmailVerificationToken(user.id);
      await sendEmail({
        to: user.email,
        ...verificationEmail({
          url: appUrl(`/verify-email?token=${token}`),
          name: user.name,
        }),
      });
    } catch (err) {
      console.error("Failed to send verification email:", err);
    }

    return NextResponse.json(
      { id: user.id, email: user.email },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}