import Link from "next/link";
import { requireRole } from "@/lib/auth/dal";
import { ListingCard } from "@/components/ListingCard";
import { getRecommendations } from "@/lib/matching/recommend";
import type { MatchLevel } from "@/lib/matching/score";
import { markMatchesSeen } from "./actions";

export const metadata = { title: "Recommended for you | PathRwanda" };

const LEVEL_LABEL: Record<MatchLevel, string> = {
  STRONG: "Strong match",
  GOOD: "Good match",
  POSSIBLE: "Possible match",
};
const LEVEL_STYLE: Record<MatchLevel, string> = {
  STRONG: "bg-emerald-100 text-emerald-800",
  GOOD: "bg-sky-100 text-sky-800",
  POSSIBLE: "bg-zinc-200 text-zinc-800",
};

type Recommendations = Awaited<ReturnType<typeof getRecommendations>>;

function MatchCard({
  match,
  isNew,
}: {
  match: Recommendations["matches"][number];
  isNew: boolean;
}) {
  const { listing, level, reasons } = match;
  return (
    <ListingCard
      // Goes through /go/match so opening a recommendation can be counted.
      href={`/go/match/${listing.id}`}
      listing={listing}
      badge={
        <>
          {isNew && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
              New
            </span>
          )}
          <span className={`rounded-full px-2 py-0.5 text-xs ${LEVEL_STYLE[level]}`}>
            {LEVEL_LABEL[level]}
          </span>
        </>
      }
    >
      <div className="text-sm">
        <p className="font-medium">Why this match</p>
        <ul className="list-disc pl-5">
          {reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </div>
    </ListingCard>
  );
}

export default async function RecommendationsPage() {
  const user = await requireRole("YOUTH");
  const { needsInputs, matches, newMatches } = await getRecommendations(user.id);
  const newIds = new Set(newMatches.map((match) => match.listing.id));

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <h1 className="mb-2 text-3xl font-semibold">Recommended for you</h1>
      <p className="mb-6 text-zinc-600 dark:text-zinc-400">
        Open opportunities that fit the sectors you follow, your skills and your courses. This list
        updates whenever those change.
      </p>

      {needsInputs ? (
        <div className="notice">
          <p className="mb-2 font-medium">Tell us a little about you to get recommendations.</p>
          <ul className="list-disc pl-5 text-sm">
            <li>
              <Link href="/sectors" className="font-medium underline">
                Follow a sector
              </Link>{" "}
              you are interested in.
            </li>
            <li>
              <Link href="/profile" className="font-medium underline">
                Pick the skills you have
              </Link>{" "}
              on your profile.
            </li>
            <li>Start a course from a sector page.</li>
          </ul>
        </div>
      ) : matches.length === 0 ? (
        <p className="notice">
          No open opportunities match you right now. New ones are added often, so check again soon,
          or{" "}
          <Link href="/opportunities" className="font-medium underline">
            browse all opportunities
          </Link>
          .
        </p>
      ) : (
        <>
          {newMatches.length > 0 && (
            <section
              aria-labelledby="new-matches"
              className="mb-8 rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 id="new-matches" className="text-lg font-medium">
                  {newMatches.length === 1
                    ? "1 new opportunity matches you closely"
                    : `${newMatches.length} new opportunities match you closely`}
                </h2>
                <form action={markMatchesSeen}>
                  <button
                    type="submit"
                    className="rounded border border-zinc-400 px-3 py-1 text-sm dark:border-zinc-600"
                  >
                    Mark as seen
                  </button>
                </form>
              </div>
              <p className="mb-3 text-sm">Published since you last marked your matches as seen.</p>
              <ol className="flex flex-col gap-3">
                {newMatches.map((match) => (
                  <MatchCard key={match.listing.id} match={match} isNew />
                ))}
              </ol>
            </section>
          )}
          <h2 className="mb-3 text-lg font-medium">Your top matches</h2>
          <ol className="flex flex-col gap-3">
            {matches.map((match) => (
              <MatchCard
                key={match.listing.id}
                match={match}
                isNew={newIds.has(match.listing.id)}
              />
            ))}
          </ol>
        </>
      )}
    </main>
  );
}
