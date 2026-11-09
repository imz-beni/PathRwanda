import { describe, expect, it } from "vitest";
import { classifyLinkResponse } from "./course-links";

describe("classifyLinkResponse", () => {
  it("treats success and redirects as working", () => {
    expect(classifyLinkResponse({ status: 200 })).toBe("OK");
    expect(classifyLinkResponse({ status: 301 })).toBe("OK");
  });

  it("treats missing pages and unknown hosts as broken", () => {
    expect(classifyLinkResponse({ status: 404 })).toBe("BROKEN");
    expect(classifyLinkResponse({ status: 410 })).toBe("BROKEN");
    expect(classifyLinkResponse({ error: "not_found_host" })).toBe("BROKEN");
  });

  it("does not call a link broken when the site blocks or fails the check", () => {
    expect(classifyLinkResponse({ status: 403 })).toBe("UNKNOWN");
    expect(classifyLinkResponse({ status: 429 })).toBe("UNKNOWN");
    expect(classifyLinkResponse({ status: 503 })).toBe("UNKNOWN");
    expect(classifyLinkResponse({ error: "other" })).toBe("UNKNOWN");
  });
});
