import { describe, expect, it } from "vitest";
import { organizationSchema } from "./organization";

describe("organizationSchema", () => {
  it("accepts a name with no website", () => {
    const result = organizationSchema.safeParse({ name: "Green Farms Ltd", website: "" });
    expect(result.success).toBe(true);
    expect(result.success && result.data.website).toBeUndefined();
  });

  it("accepts http and https websites", () => {
    expect(
      organizationSchema.safeParse({ name: "Green Farms", website: "https://greenfarms.rw" })
        .success,
    ).toBe(true);
  });

  it("rejects non-web addresses", () => {
    expect(
      organizationSchema.safeParse({ name: "Green Farms", website: "javascript:alert(1)" }).success,
    ).toBe(false);
    expect(
      organizationSchema.safeParse({ name: "Green Farms", website: "greenfarms" }).success,
    ).toBe(false);
  });

  it("requires a name", () => {
    expect(organizationSchema.safeParse({ name: " ", website: "" }).success).toBe(false);
  });
});
