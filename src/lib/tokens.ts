import { createHash, randomBytes } from "crypto";

export const tokenTtl = {
  verificationMs: 24 * 60 * 60 * 1000,
  resetMs: 60 * 60 * 1000,
} as const;

export function createRawToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}