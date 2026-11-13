import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { ListingCard } from "@/components/ListingCard";
import { displayStatus } from "@/lib/listings";

export const metadata = { title: "Saved opportunities | PathRwanda" };

export default async function SavedPage() {
  const user = await requireRole("YOUTH");
  const saved = await db.savedListing.findMany({
    // Removed listings and those from organizations that are no longer approved stay hidden.
    where: {
      userId: user.id,
      listing: { status: { not: "REMOVED" }, organization: { status: "APPROVED" } },
    },
    orderBy: { createdAt: "desc" },
    select: {
      listing: {
        select: {
          id: true,
          title: true,
          type: true,
          location: true,
          closesAt: true,
          status: true,
          organization: { select: { name: true } },
        },
      },
    },
  });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold">Saved opportunities</h1>
      <p className="mb-6 text-zinc-600 dark:text-zinc-400">
        Opportunities you saved to come back to. Open one to remove it from this list.
      </p>

      {saved.length === 0 ? (
        <p className="rounded-md bg-zinc-100 p-4 dark:bg-zinc-900">
          You have not saved anything yet. See what is{" "}
          <Link href="/recommendations" className="font-medium underline">
            recommended for you
          </Link>{" "}
          or{" "}
          <Link href="/opportunities" className="font-medium underline">
            browse all opportunities
          </Link>
          .
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {saved.map(({ listing }) => (
            <ListingCard
              key={listing.id}
              href={`/opportunities/${listing.id}`}
              listing={listing}
              badge={
                displayStatus(listing) === "ACTIVE" ? null : (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                    No longer open
                  </span>
                )
              }
            />
          ))}
        </ul>
      )}
    </main>
  );
}
