import { describe, expect, it } from "vitest";
import { generateToken, hashToken } from "./token";

describe("session tokens", () => {
  it("generates unique, URL-safe tokens", () => {
    const a = generateToken();
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(generateToken()).not.toBe(a);
  });

  it("hashes deterministically without revealing the token", () => {
    const token = generateToken();
    expect(hashToken(token)).toBe(hashToken(token));
    expect(hashToken(token)).not.toContain(token);
  });
});
