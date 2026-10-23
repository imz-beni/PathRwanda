import { describe, expect, it } from "vitest";
import { safeNextPath } from "./safe-redirect";

describe("safeNextPath", () => {
  it("keeps paths inside the site", () => {
    expect(safeNextPath("/sectors/agritech")).toBe("/sectors/agritech");
    expect(safeNextPath("/progress?tab=1")).toBe("/progress?tab=1");
  });

  it("falls back for external or malformed targets", () => {
    expect(safeNextPath("https://evil.example")).toBe("/sectors");
    expect(safeNextPath("//evil.example")).toBe("/sectors");
    expect(safeNextPath("/\\evil.example")).toBe("/sectors");
    expect(safeNextPath(undefined)).toBe("/sectors");
    expect(safeNextPath("")).toBe("/sectors");
  });
});
