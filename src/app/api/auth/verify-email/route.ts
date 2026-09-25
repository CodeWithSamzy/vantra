import { NextResponse } from "next/server";
import { consumeEmailVerificationToken } from "@/lib/auth-tokens";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";

  if (!token) {
    return NextResponse.json(
      { error: "Verification token is required." },
      { status: 400 }
    );
  }

  const result = await consumeEmailVerificationToken(token);

  if (!result.ok) {
    return NextResponse.json(
      {
        error:
          result.reason === "expired"
            ? "This verification link has expired. Request a new one from your dashboard."
            : "This verification link is invalid or has already been used.",
      },
      { status: result.reason === "expired" ? 410 : 400 }
    );
  }

  return NextResponse.json({ ok: true });
}