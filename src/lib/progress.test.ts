import { describe, expect, it } from "vitest";
import { parseProgressAction, summarizeProgress, type CourseStatus } from "./progress";

describe("parseProgressAction", () => {
  it("accepts the known actions", () => {
    expect(parseProgressAction("STARTED")).toBe("STARTED");
    expect(parseProgressAction("COMPLETED")).toBe("COMPLETED");
    expect(parseProgressAction("NONE")).toBe("NONE");
  });

  it("rejects anything else", () => {
    expect(parseProgressAction("DONE")).toBeNull();
    expect(parseProgressAction(undefined)).toBeNull();
    expect(parseProgressAction(42)).toBeNull();
  });
});

describe("summarizeProgress", () => {
  const statuses = new Map<string, CourseStatus>([
    ["a", "COMPLETED"],
    ["b", "STARTED"],
    ["zzz", "COMPLETED"], // not in the course list, must be ignored
  ]);

  it("counts started and completed courses", () => {
    expect(summarizeProgress(["a", "b", "c", "d"], statuses)).toEqual({
      total: 4,
      started: 1,
      completed: 1,
      percentComplete: 25,
    });
  });

  it("handles an empty course list", () => {
    expect(summarizeProgress([], statuses).percentComplete).toBe(0);
  });
});
