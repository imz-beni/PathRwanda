import { db } from "@/lib/db";
import { activeListingWhere } from "@/lib/listings";
import { getMatchingInputs } from "./inputs";
import { hasNoMatchingInputs, rankListings } from "./score";

// The most open listings one user is scored against. Far above what the MVP holds.
const MAX_CANDIDATES = 500;

// Recommendations are worked out on every visit and never stored, so they always reflect the
// user's latest follows, skills and course progress (FR-5.6).
export async function getRecommendations(userId: string) {
  const inputs = await getMatchingInputs(userId);
  if (hasNoMatchingInputs(inputs)) return { needsInputs: true, matches: [] };

  // The hard filters (BR-8): open, not expired, not removed, from an approved organization.
  const listings = await db.listing.findMany({
    where: { ...activeListingWhere(), organization: { status: "APPROVED" } },
    orderBy: { closesAt: "asc" },
    take: MAX_CANDIDATES,
    select: {
      id: true,
      title: true,
      type: true,
      location: true,
      closesAt: true,
      organization: { select: { name: true } },
      sectors: { select: { sector: { select: { id: true, name: true } } } },
      skills: { select: { id: true, name: true } },
    },
  });

  const candidates = listings.map((listing) => ({
    ...listing,
    sectors: listing.sectors.map((s) => s.sector),
  }));
  return { needsInputs: false, matches: rankListings(inputs, candidates) };
}
