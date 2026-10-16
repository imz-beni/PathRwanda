import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./auth";

const valid = {
  name: "Aline Uwase",
  email: "Aline@Example.com ",
  password: "longenough1",
  accountType: "youth",
  ageConfirmed: "on",
};

describe("registerSchema", () => {
  it("accepts a valid youth registration and normalises the email", () => {
    const result = registerSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("aline@example.com");
  });

  it("rejects an invalid email", () => {
    expect(registerSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
  });

  it("rejects a short password", () => {
    const result = registerSchema.safeParse({ ...valid, password: "short" });
    expect(result.success).toBe(false);
  });

  it("requires the 16+ confirmation", () => {
    expect(registerSchema.safeParse({ ...valid, ageConfirmed: undefined }).success).toBe(false);
  });

  it("rejects an unknown account type", () => {
    expect(registerSchema.safeParse({ ...valid, accountType: "admin" }).success).toBe(false);
  });

  it("requires an organization name for non-youth accounts", () => {
    expect(registerSchema.safeParse({ ...valid, accountType: "employer" }).success).toBe(false);
    expect(
      registerSchema.safeParse({
        ...valid,
        accountType: "employer",
        organizationName: "Green Farms Ltd",
      }).success,
    ).toBe(true);
  });
});

describe("loginSchema", () => {
  it("requires an email and a password", () => {
    expect(loginSchema.safeParse({ email: "", password: "" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.rw", password: "x" }).success).toBe(true);
  });
});
