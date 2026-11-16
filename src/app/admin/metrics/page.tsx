import Link from "next/link";
import type { EventType, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { activeListingWhere } from "@/lib/listings";
import { hypothesisResults } from "@/lib/metrics";

export const metadata = { title: "Results | PathRwanda" };

// Demo accounts made by the seed are left out, so they do not distort the results.
const DEMO_DOMAIN = "@pathrwanda.local";
const realYouth: Prisma.UserWhereInput = {
  role: "YOUTH",
  NOT: { email: { endsWith: DEMO_DOMAIN } },
};

// How many different young users have done something at least once.
async function usersWithEvent(type: EventType, sectorId?: string) {
  const rows = await db.event.findMany({
    where: { type, user: realYouth, ...(sectorId ? { sectorId } : {}) },
    distinct: ["userId"],
    select: { userId: true },
  });
  return rows.length;
}

export default async function MetricsPage() {
  await requireRole("ADMIN");
  const agritech = await db.sector.findUnique({ where: { slug: "agritech" } });

  const [youth, followed, clickedCourse, viewedMatch, organizations, openListings, openReports] =
    await Promise.all([
      db.user.count({ where: realYouth }),
      usersWithEvent("SECTOR_FOLLOWED", agritech?.id),
      usersWithEvent("COURSE_LINK_CLICKED", agritech?.id),
      usersWithEvent("MATCHED_LISTING_VIEWED"),
      db.organization.count({ where: { status: "APPROVED" } }),
      db.listing.count({
        where: { ...activeListingWhere(), organization: { status: "APPROVED" } },
      }),
      db.listingReport.count({ where: { status: "OPEN" } }),
    ]);

  const results = hypothesisResults(youth, { followed, clickedCourse, viewedMatch });
  const totals = [
    { label: "Registered young users", value: youth },
    { label: "Approved organizations", value: organizations },
    { label: "Open opportunities", value: openListings },
    { label: "Open reports", value: openReports },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <Link href="/admin" className="text-sm underline">
        Administration
      </Link>
      <h1 className="mt-3 mb-2 text-2xl font-semibold">Results</h1>
      <p className="mb-6 text-zinc-600 dark:text-zinc-400">
        How PathRwanda is doing against the targets set for the first version. Each young user is
        counted once per row, however many times they did it. Demo accounts are not counted.
      </p>

      <section aria-labelledby="hypothesis" className="mb-10">
        <h2 id="hypothesis" className="mb-3 text-lg font-medium">
          Hypothesis targets
        </h2>
        {youth === 0 && (
          <p className="mb-3 rounded-md bg-zinc-100 p-3 text-sm dark:bg-zinc-900">
            No young users have registered yet, so there is nothing to measure.
          </p>
        )}
        <ul className="flex flex-col gap-4">
          {results.map((result) => (
            <li
              key={result.key}
              className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-medium">{result.label}</h3>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    result.met ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {result.met ? "Target met" : "Below target"}
                </span>
              </div>
              <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
                {result.percent}% ({result.users} of {youth} young users). Target: at least{" "}
                {result.target}%.
              </p>
              <div
                role="progressbar"
                aria-valuenow={result.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${result.label}: ${result.percent}%, target ${result.target}%`}
                className="relative h-2 w-full rounded bg-zinc-200 dark:bg-zinc-800"
              >
                <div
                  className={`h-2 rounded ${result.met ? "bg-emerald-600" : "bg-amber-500"}`}
                  style={{ width: `${result.percent}%` }}
                />
                {/* A thin line marks where the target sits on the bar. */}
                <div
                  aria-hidden="true"
                  className="absolute -top-1 h-4 w-0.5 bg-zinc-900 dark:bg-zinc-100"
                  style={{ left: `${result.target}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="totals">
        <h2 id="totals" className="mb-3 text-lg font-medium">
          Totals
        </h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          {totals.map((total) => (
            <div
              key={total.label}
              className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <dt className="text-sm text-zinc-600 dark:text-zinc-400">{total.label}</dt>
              <dd className="text-2xl font-semibold">{total.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
