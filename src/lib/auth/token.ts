import { createHash, randomBytes } from "node:crypto";

export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

// Only the hash is stored, so a leaked database cannot be used to hijack sessions.
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
