import { describe, expect, it } from "vitest";
import { courseSchema, pathwaySchema, sectorSchema, skillSchema } from "./content";

const course = {
  title: "Introduction to Sustainable Agriculture",
  provider: "Example University",
  url: "https://example.org/course",
  description: "",
  isFree: "on",
};

describe("sectorSchema", () => {
  it("accepts a valid sector", () => {
    expect(
      sectorSchema.safeParse({
        name: "Agritech",
        overview: "Technology in farming.",
        status: "LIVE",
      }).success,
    ).toBe(true);
  });

  it("rejects an unknown status and a short overview", () => {
    expect(
      sectorSchema.safeParse({ name: "Agritech", overview: "Farming tech", status: "HIDDEN" })
        .success,
    ).toBe(false);
    expect(
      sectorSchema.safeParse({ name: "Agritech", overview: "Short", status: "LIVE" }).success,
    ).toBe(false);
  });
});

describe("courseSchema", () => {
  it("accepts a valid course and reads the free checkbox", () => {
    const result = courseSchema.safeParse(course);
    expect(result.success).toBe(true);
    expect(result.success && result.data.isFree).toBe(true);
    expect(result.success && result.data.description).toBeUndefined();
  });

  it("treats a missing checkbox as not free", () => {
    const result = courseSchema.safeParse({ ...course, isFree: undefined });
    expect(result.success && result.data.isFree).toBe(false);
  });

  it("rejects addresses that are not web links", () => {
    expect(courseSchema.safeParse({ ...course, url: "example.org/course" }).success).toBe(false);
    expect(courseSchema.safeParse({ ...course, url: "javascript:alert(1)" }).success).toBe(false);
  });

  it("requires a title and provider", () => {
    expect(courseSchema.safeParse({ ...course, title: " " }).success).toBe(false);
    expect(courseSchema.safeParse({ ...course, provider: "" }).success).toBe(false);
  });
});

describe("skillSchema", () => {
  it("trims the name", () => {
    expect(skillSchema.parse({ name: "  Soil health  " })).toEqual({ name: "Soil health" });
  });

  it("rejects a one-letter name", () => {
    expect(skillSchema.safeParse({ name: "S" }).success).toBe(false);
  });
});

describe("pathwaySchema", () => {
  const pathway = {
    title: "Farm technician",
    description: "Supports day-to-day crop production.",
    incomeNote: "",
    skillIds: ["a", "b"],
  };

  it("turns an empty income note into null", () => {
    expect(pathwaySchema.parse(pathway).incomeNote).toBeNull();
  });

  it("accepts a pathway with no skills", () => {
    expect(pathwaySchema.safeParse({ ...pathway, skillIds: [] }).success).toBe(true);
  });

  it("rejects a description that is too short", () => {
    const result = pathwaySchema.safeParse({ ...pathway, description: "Short" });
    expect(result.success).toBe(false);
  });
});
