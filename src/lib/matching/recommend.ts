import { cache } from "react";
import { db } from "@/lib/db";
import { activeListingWhere } from "@/lib/listings";
import { newCloseMatches } from "./alerts";
import { RECOMMENDATION_LIMIT } from "./config";
import { getMatchingInputs } from "./inputs";
import { hasNoMatchingInputs, rankListings } from "./score";

// The most open listings one user is scored against. Far above what the MVP holds.
const MAX_CANDIDATES = 500;

// Recommendations are worked out on every visit and never stored, so they always reflect the
// user's latest follows, skills and course progress (FR-5.6). Wrapped in cache() so the header
// and the page share one calculation per request.
export const getRecommendations = cache(async (userId: string) => {
  const inputs = await getMatchingInputs(userId);
  if (hasNoMatchingInputs(inputs)) return { needsInputs: true, matches: [], newMatches: [] };

  const [listings, user] = await Promise.all([
    // The hard filters (BR-8): open, not expired, not removed, from an approved organization.
    db.listing.findMany({
      where: { ...activeListingWhere(), organization: { status: "APPROVED" } },
      orderBy: { closesAt: "asc" },
      take: MAX_CANDIDATES,
      select: {
        id: true,
        title: true,
        type: true,
        location: true,
        closesAt: true,
        createdAt: true,
        organization: { select: { name: true } },
        sectors: { select: { sector: { select: { id: true, name: true } } } },
        skills: { select: { id: true, name: true } },
      },
    }),
    db.user.findUnique({
      where: { id: userId },
      select: { createdAt: true, matchesSeenAt: true },
    }),
  ]);

  const candidates = listings.map((listing) => ({
    ...listing,
    sectors: listing.sectors.map((s) => s.sector),
  }));
  const ranked = rankListings(inputs, candidates, candidates.length);

  // Someone who has never marked their matches as seen is alerted only about listings
  // published after they joined, not about everything that was already there.
  const since = user?.matchesSeenAt ?? user?.createdAt ?? new Date();

  return {
    needsInputs: false,
    matches: ranked.slice(0, RECOMMENDATION_LIMIT),
    newMatches: newCloseMatches(ranked, since).slice(0, RECOMMENDATION_LIMIT),
  };
});
