// Matching weights (PLAN.md section 5). Change the numbers here, not in the scoring code.
export const MATCH_WEIGHTS = {
  // The listing is in a sector the user follows.
  followedSector: 50,
  // Shared out by how many of the listing's skills the user has.
  skillOverlap: 30,
  // The user completed a course in one of the listing's sectors...
  courseCompleted: 20,
  // ...or has only started one.
  courseStarted: 10,
} as const;

export const MAX_MATCH_SCORE =
  MATCH_WEIGHTS.followedSector + MATCH_WEIGHTS.skillOverlap + MATCH_WEIGHTS.courseCompleted;

// How many recommendations the page shows.
export const RECOMMENDATION_LIMIT = 10;

// Scores at or above these show as a "Strong" or "Good" match; anything lower is "Possible".
export const MATCH_LEVELS = { strong: 70, good: 50 } as const;
