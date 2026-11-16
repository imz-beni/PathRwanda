import { describe, expect, it } from "vitest";
import { DISTRICTS, EDUCATION_LEVELS, pickFrom } from "./profile";

describe("profile choices", () => {
  it("lists all 30 districts once each", () => {
    expect(DISTRICTS).toHaveLength(30);
    expect(new Set(DISTRICTS).size).toBe(30);
  });

  it("keeps a value that is on the list", () => {
    expect(pickFrom(DISTRICTS, "Musanze")).toBe("Musanze");
    expect(pickFrom(EDUCATION_LEVELS, "Diploma")).toBe("Diploma");
  });

  it("treats an empty or unknown value as not given", () => {
    expect(pickFrom(DISTRICTS, "")).toBeNull();
    expect(pickFrom(DISTRICTS, "Atlantis")).toBeNull();
    expect(pickFrom(EDUCATION_LEVELS, null)).toBeNull();
  });
});
