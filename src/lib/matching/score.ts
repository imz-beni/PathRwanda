import { MATCH_LEVELS, MATCH_WEIGHTS, RECOMMENDATION_LIMIT } from "./config";
import type { MatchingInputs } from "./inputs";

// What the matcher needs to know about a listing. The caller only passes listings that are
// open (active, not expired, not removed), so the hard filters live in the database query.
export type MatchListing = {
  id: string;
  closesAt: Date;
  sectors: { id: string; name: string }[];
  skills: { id: string; name: string }[];
};

export type MatchLevel = "STRONG" | "GOOD" | "POSSIBLE";

export type Match<L extends MatchListing = MatchListing> = {
  listing: L;
  score: number;
  level: MatchLevel;
  // Plain sentences for the "Why this match" text.
  reasons: string[];
};

function joinNames(names: string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export function matchLevel(score: number): MatchLevel {
  if (score >= MATCH_LEVELS.strong) return "STRONG";
  if (score >= MATCH_LEVELS.good) return "GOOD";
  return "POSSIBLE";
}

// Scores one listing for one user. A pure function: no database and no clock, so it is easy
// to test and always gives the same answer for the same inputs.
export function scoreListing<L extends MatchListing>(inputs: MatchingInputs, listing: L): Match<L> {
  const reasons: string[] = [];
  let score = 0;
  const sectorIds = new Set(listing.sectors.map((sector) => sector.id));

  const followed = listing.sectors.filter((s) => inputs.followedSectorIds.includes(s.id));
  if (followed.length > 0) {
    score += MATCH_WEIGHTS.followedSector;
    reasons.push(`You follow ${joinNames(followed.map((s) => s.name))}.`);
  }

  const shared = listing.skills.filter((skill) => inputs.skillIds.includes(skill.id));
  if (shared.length > 0) {
    score += Math.round((MATCH_WEIGHTS.skillOverlap * shared.length) / listing.skills.length);
    reasons.push(
      `You have ${shared.length} of the ${listing.skills.length} skills it asks for: ${joinNames(
        shared.map((s) => s.name),
      )}.`,
    );
  }

  const courses = inputs.courseProgress.filter((course) => sectorIds.has(course.sectorId));
  const completed = courses.filter((course) => course.status === "COMPLETED");
  if (completed.length > 0) {
    score += MATCH_WEIGHTS.courseCompleted;
    reasons.push(`You completed ${joinNames(completed.map((c) => `"${c.title}"`))}.`);
  } else if (courses.length > 0) {
    score += MATCH_WEIGHTS.courseStarted;
    reasons.push(`You started ${joinNames(courses.map((c) => `"${c.title}"`))}.`);
  }

  return { listing, score, level: matchLevel(score), reasons };
}

// Best matches first. Listings with nothing in common with the user are left out. Ties go to
// the listing that closes sooner, then to the id so the order never changes between visits.
export function rankListings<L extends MatchListing>(
  inputs: MatchingInputs,
  listings: L[],
  limit = RECOMMENDATION_LIMIT,
): Match<L>[] {
  return listings
    .map((listing) => scoreListing(inputs, listing))
    .filter((match) => match.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.listing.closesAt.getTime() - b.listing.closesAt.getTime() ||
        a.listing.id.localeCompare(b.listing.id),
    )
    .slice(0, limit);
}

// True when the user has given the matcher nothing to work with yet.
export function hasNoMatchingInputs(inputs: MatchingInputs): boolean {
  return (
    inputs.followedSectorIds.length === 0 &&
    inputs.skillIds.length === 0 &&
    inputs.courseProgress.length === 0
  );
}
