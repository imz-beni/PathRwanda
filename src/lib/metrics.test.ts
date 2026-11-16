import { describe, expect, it } from "vitest";
import { hypothesisResults } from "./metrics";

describe("hypothesisResults", () => {
  it("works out each percentage and whether its target is met", () => {
    const results = hypothesisResults(20, { followed: 14, clickedCourse: 8, viewedMatch: 5 });
    expect(results.map((r) => [r.key, r.percent, r.met])).toEqual([
      ["followed", 70, true],
      ["clickedCourse", 40, true],
      ["viewedMatch", 25, false],
    ]);
  });

  it("reports 0% and not met when nobody has registered", () => {
    const results = hypothesisResults(0, { followed: 0, clickedCourse: 0, viewedMatch: 0 });
    expect(results.every((r) => r.percent === 0 && !r.met)).toBe(true);
  });

  it("never reports more than 100%", () => {
    const [followed] = hypothesisResults(3, { followed: 5, clickedCourse: 0, viewedMatch: 0 });
    expect(followed).toMatchObject({ users: 3, percent: 100 });
  });
});
