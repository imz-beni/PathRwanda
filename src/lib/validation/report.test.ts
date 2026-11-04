import { describe, expect, it } from "vitest";
import { reportSchema } from "./report";

describe("reportSchema", () => {
  it("accepts a short explanation and trims it", () => {
    const result = reportSchema.safeParse({ reason: "  They asked me to pay a fee.  " });
    expect(result.success).toBe(true);
    expect(result.success && result.data.reason).toBe("They asked me to pay a fee.");
  });

  it("rejects an empty or too-short reason", () => {
    expect(reportSchema.safeParse({ reason: "   " }).success).toBe(false);
    expect(reportSchema.safeParse({ reason: "scam" }).success).toBe(false);
  });

  it("rejects a reason over 500 characters", () => {
    expect(reportSchema.safeParse({ reason: "a".repeat(501) }).success).toBe(false);
  });
});
