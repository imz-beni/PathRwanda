import { describe, expect, it } from "vitest";
import { listingSchema, requireFutureClosing } from "./listing";

const valid = {
  title: "Greenhouse assistant",
  type: "JOB",
  sectorIds: ["sector-1"],
  skillIds: [],
  description: "Help run a tomato greenhouse near Musanze.",
  applyInfo: "Email jobs@example.rw",
  closesAt: "2026-12-31",
};

describe("listingSchema", () => {
  it("accepts a complete listing and converts the closing date", () => {
    const result = listingSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.closesAt.toISOString()).toBe("2026-12-31T21:59:59.000Z");
  });

  it("requires at least one sector", () => {
    expect(listingSchema.safeParse({ ...valid, sectorIds: [] }).success).toBe(false);
  });

  it("requires a type, how to apply and a closing date", () => {
    expect(listingSchema.safeParse({ ...valid, type: "OTHER" }).success).toBe(false);
    expect(listingSchema.safeParse({ ...valid, applyInfo: "" }).success).toBe(false);
    expect(listingSchema.safeParse({ ...valid, closesAt: "" }).success).toBe(false);
    expect(listingSchema.safeParse({ ...valid, closesAt: "tomorrow" }).success).toBe(false);
  });

  it("turns empty optional fields into undefined", () => {
    const result = listingSchema.safeParse({ ...valid, requirements: "  ", location: "" });
    expect(result.success && result.data.requirements).toBeUndefined();
    expect(result.success && result.data.location).toBeUndefined();
  });
});

describe("requireFutureClosing", () => {
  const now = new Date("2026-11-10T12:00:00Z");
  it("rejects past dates and accepts future ones", () => {
    expect(requireFutureClosing(new Date("2026-11-01T00:00:00Z"), now)).not.toBeNull();
    expect(requireFutureClosing(new Date("2026-11-30T00:00:00Z"), now)).toBeNull();
  });
});
