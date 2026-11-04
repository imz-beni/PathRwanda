import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { activeListingWhere, displayStatus, formatDate, type DisplayStatus } from "@/lib/listings";
import { TYPE_LABEL } from "@/lib/validation/listing";
import { removeListingAsAdmin, restoreListing } from "./actions";

export const metadata = { title: "Listings | PathRwanda" };

const STATUS_LABEL: Record<DisplayStatus, string> = {
  ACTIVE: "Active",
  EXPIRED: "Expired",
  CLOSED: "Closed",
  REMOVED: "Removed",
};
const STATUS_STYLE: Record<DisplayStatus, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-800",
  EXPIRED: "bg-amber-100 text-amber-800",
  CLOSED: "bg-zinc-200 text-zinc-800",
  REMOVED: "bg-red-100 text-red-800",
};
const STATUSES = Object.keys(STATUS_LABEL) as DisplayStatus[];

const PAGE_SIZE = 50;

type SearchParams = Promise<{ q?: string; status?: string }>;

// "Expired" is not stored: it is an ACTIVE listing whose closing date has passed.
function statusWhere(status: DisplayStatus | undefined, now: Date): Prisma.ListingWhereInput {
  switch (status) {
    case "ACTIVE":
      return activeListingWhere(now);
    case "EXPIRED":
      return { status: "ACTIVE", closesAt: { lte: now } };
    case "CLOSED":
    case "REMOVED":
      return { status };
    default:
      return {};
  }
}

function ListingButton({
  action,
  listingId,
  label,
}: {
  action: (formData: FormData) => Promise<void>;
  listingId: string;
  label: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="listingId" value={listingId} />
      <button
        type="submit"
        className="rounded border border-zinc-300 px-3 py-1 text-sm dark:border-zinc-700"
      >
        {label}
      </button>
    </form>
  );
}

export default async function AdminListingsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireRole("ADMIN");
  const { q, status } = await searchParams;
  const query = q?.trim().slice(0, 100);
  const statusFilter = STATUSES.find((s) => s === status);
  const now = new Date();

  const listings = await db.listing.findMany({
    where: {
      ...statusWhere(statusFilter, now),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" as const } },
              { organization: { name: { contains: query, mode: "insensitive" as const } } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
    include: {
      organization: { select: { name: true } },
      _count: { select: { reports: { where: { status: "OPEN" } } } },
    },
  });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <Link href="/admin" className="text-sm underline">
        Administration
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-semibold">Listings</h1>

      <form method="get" className="mb-6 grid gap-3 sm:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium">Search title or organization</span>
          <input
            type="search"
            name="q"
            defaultValue={query}
            className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Status</span>
          <select
            name="status"
            defaultValue={statusFilter ?? ""}
            className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-md bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800"
          >
            Search
          </button>
        </div>
      </form>

      {listings.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">No listings match your search.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {listings.map((listing) => {
            const shown = displayStatus(listing, now);
            const openReports = listing._count.reports;
            return (
              <li
                key={listing.id}
                className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-medium">
                    {shown === "REMOVED" ? (
                      listing.title
                    ) : (
                      <Link href={`/opportunities/${listing.id}`} className="underline">
                        {listing.title}
                      </Link>
                    )}
                  </h2>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLE[shown]}`}>
                    {STATUS_LABEL[shown]}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {listing.organization.name} · {TYPE_LABEL[listing.type]} · closes{" "}
                  {formatDate(listing.closesAt)}
                  {openReports > 0 && (
                    <>
                      {" · "}
                      <Link href="/admin/reports" className="text-red-700 underline">
                        {openReports} open {openReports === 1 ? "report" : "reports"}
                      </Link>
                    </>
                  )}
                </p>
                <div>
                  {shown === "REMOVED" ? (
                    <ListingButton
                      action={restoreListing}
                      listingId={listing.id}
                      label="Restore as closed"
                    />
                  ) : (
                    <ListingButton
                      action={removeListingAsAdmin}
                      listingId={listing.id}
                      label="Remove listing"
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {listings.length === PAGE_SIZE && (
        <p className="mt-4 text-sm text-zinc-500">
          Showing the newest {PAGE_SIZE}. Search to narrow the list.
        </p>
      )}
    </main>
  );
}
