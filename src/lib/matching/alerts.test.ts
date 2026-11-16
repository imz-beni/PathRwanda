import { describe, expect, it } from "vitest";
import { newCloseMatches } from "./alerts";
import type { Match, MatchListing } from "./score";

type Listing = MatchListing & { createdAt: Date };

const match = (id: string, score: number, createdAt: string): Match<Listing> => ({
  listing: {
    id,
    closesAt: new Date("2027-01-31"),
    createdAt: new Date(createdAt),
    sectors: [],
    skills: [],
  },
  score,
  level: score >= 70 ? "STRONG" : score >= 50 ? "GOOD" : "POSSIBLE",
  reasons: [],
});

const lastSeen = new Date("2026-11-10T12:00:00Z");

describe("newCloseMatches", () => {
  it("keeps close matches published after the user last looked", () => {
    const matches = [
      match("new-strong", 80, "2026-11-12T09:00:00Z"),
      match("new-good", 50, "2026-11-11T09:00:00Z"),
    ];
    expect(newCloseMatches(matches, lastSeen).map((m) => m.listing.id)).toEqual([
      "new-strong",
      "new-good",
    ]);
  });

  it("leaves out listings the user could already have seen", () => {
    const matches = [
      match("old-strong", 90, "2026-11-01T09:00:00Z"),
      match("same-moment", 90, "2026-11-10T12:00:00Z"),
    ];
    expect(newCloseMatches(matches, lastSeen)).toEqual([]);
  });

  it("leaves out new listings that only match weakly", () => {
    expect(newCloseMatches([match("new-weak", 30, "2026-11-12T09:00:00Z")], lastSeen)).toEqual([]);
  });
});
