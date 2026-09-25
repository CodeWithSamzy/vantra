import { prisma } from "@/lib/prisma";
import { createRawToken, hashToken, tokenTtl } from "@/lib/tokens";

export async function issueEmailVerificationToken(userId: string) {
  const token = createRawToken();

  await prisma.$transaction([
    prisma.emailVerificationToken.deleteMany({ where: { userId } }),
    prisma.emailVerificationToken.create({
      data: {
        userId,
        token: hashToken(token),
        expiresAt: new Date(Date.now() + tokenTtl.verificationMs),
      },
    }),
  ]);

  return token;
}

export async function canResendVerification(userId: string) {
  const latest = await prisma.emailVerificationToken.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  if (!latest) return true;
  return Date.now() - latest.createdAt.getTime() > 60_000;
}

export async function consumeEmailVerificationToken(rawToken: string) {
  const record = await prisma.emailVerificationToken.findUnique({
    where: { token: hashToken(rawToken) },
  });

  if (!record) return { ok: false as const, reason: "invalid" as const };

  if (record.expiresAt < new Date()) {
    await prisma.emailVerificationToken.delete({ where: { id: record.id } });
    return { ok: false as const, reason: "expired" as const };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() },
    }),
    prisma.emailVerificationToken.deleteMany({ where: { userId: record.userId } }),
  ]);

  return { ok: true as const, userId: record.userId };
}

export async function issuePasswordResetToken(userId: string) {
  const token = createRawToken();

  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId } }),
    prisma.passwordResetToken.create({
      data: {
        userId,
        token: hashToken(token),
        expiresAt: new Date(Date.now() + tokenTtl.resetMs),
      },
    }),
  ]);

  return token;
}

export async function findPasswordResetToken(rawToken: string) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token: hashToken(rawToken) },
    select: { expiresAt: true, usedAt: true },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) return null;
  return record;
}

export async function consumePasswordResetToken(
  rawToken: string,
  hashedPassword: string
) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token: hashToken(rawToken) },
  });

  if (!record || record.usedAt) {
    return { ok: false as const, reason: "invalid" as const };
  }

  if (record.expiresAt < new Date()) {
    return { ok: false as const, reason: "expired" as const };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { userId: record.userId, id: { not: record.id } },
    }),
  ]);

  return { ok: true as const, userId: record.userId };
}