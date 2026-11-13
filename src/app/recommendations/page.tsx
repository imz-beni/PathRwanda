import Link from "next/link";
import { requireRole } from "@/lib/auth/dal";
import { ListingCard } from "@/components/ListingCard";
import { getRecommendations } from "@/lib/matching/recommend";
import type { MatchLevel } from "@/lib/matching/score";

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

export default async function RecommendationsPage() {
  const user = await requireRole("YOUTH");
  const { needsInputs, matches } = await getRecommendations(user.id);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold">Recommended for you</h1>
      <p className="mb-6 text-zinc-600 dark:text-zinc-400">
        Open opportunities that fit the sectors you follow, your skills and your courses. This list
        updates whenever those change.
      </p>

      {needsInputs ? (
        <div className="rounded-md bg-zinc-100 p-4 dark:bg-zinc-900">
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
        <p className="rounded-md bg-zinc-100 p-4 dark:bg-zinc-900">
          No open opportunities match you right now. New ones are added often, so check again soon,
          or{" "}
          <Link href="/opportunities" className="font-medium underline">
            browse all opportunities
          </Link>
          .
        </p>
      ) : (
        <ol className="flex flex-col gap-3">
          {matches.map(({ listing, level, reasons }) => (
            <ListingCard
              key={listing.id}
              // Goes through /go/match so opening a recommendation can be counted.
              href={`/go/match/${listing.id}`}
              listing={listing}
              badge={
                <span className={`rounded-full px-2 py-0.5 text-xs ${LEVEL_STYLE[level]}`}>
                  {LEVEL_LABEL[level]}
                </span>
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
          ))}
        </ol>
      )}
    </main>
  );
}
