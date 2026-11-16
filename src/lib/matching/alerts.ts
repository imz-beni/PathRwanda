import { MATCH_LEVELS } from "./config";
import type { Match, MatchListing } from "./score";

// An alert is for a listing that was published after the user last looked and that matches
// them closely: a "Good" or "Strong" match, not just any overlap (FR-5.7).
export function newCloseMatches<L extends MatchListing & { createdAt: Date }>(
  matches: Match<L>[],
  since: Date,
): Match<L>[] {
  return matches.filter(
    (match) =>
      match.score >= MATCH_LEVELS.good && match.listing.createdAt.getTime() > since.getTime(),
  );
}
