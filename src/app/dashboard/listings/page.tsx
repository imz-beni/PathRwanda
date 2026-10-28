import Link from "next/link";
import { db } from "@/lib/db";
import { requireApprovedOrganization } from "@/lib/auth/org";
import { displayStatus, formatDate, type DisplayStatus } from "@/lib/listings";
import { TYPE_LABEL } from "@/lib/validation/listing";
import { closeListing, removeListing, reopenListing } from "./actions";

export const metadata = { title: "My listings | PathRwanda" };

const STATUS_STYLE: Record<DisplayStatus, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  EXPIRED: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  CLOSED: "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
  REMOVED: "bg-red-100 text-red-800",
};

const STATUS_LABEL: Record<DisplayStatus, string> = {
  ACTIVE: "Active",
  EXPIRED: "Expired",
  CLOSED: "Closed",
  REMOVED: "Removed",
};

function ActionButton({
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

export default async function MyListingsPage() {
  const { organization } = await requireApprovedOrganization();

  const listings = await db.listing.findMany({
    where: { organizationId: organization.id, status: { not: "REMOVED" } },
    orderBy: { createdAt: "desc" },
    include: { sectors: { include: { sector: true } } },
  });
  const now = new Date();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">My listings</h1>
        <Link
          href="/dashboard/listings/new"
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          Create a listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">You have not published anything yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {listings.map((listing) => {
            const status = displayStatus(listing, now);
            return (
              <li
                key={listing.id}
                className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-medium">{listing.title}</h2>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLE[status]}`}>
                    {STATUS_LABEL[status]}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {TYPE_LABEL[listing.type]} ·{" "}
                  {listing.sectors.map((s) => s.sector.name).join(", ")} · Closes{" "}
                  {formatDate(listing.closesAt)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {status === "ACTIVE" && (
                    <Link
                      href={`/opportunities/${listing.id}`}
                      className="rounded border border-zinc-300 px-3 py-1 text-sm dark:border-zinc-700"
                    >
                      View
                    </Link>
                  )}
                  <Link
                    href={`/dashboard/listings/${listing.id}/edit`}
                    className="rounded border border-zinc-300 px-3 py-1 text-sm dark:border-zinc-700"
                  >
                    Edit
                  </Link>
                  {status === "ACTIVE" && (
                    <ActionButton action={closeListing} listingId={listing.id} label="Close" />
                  )}
                  {status === "CLOSED" && listing.closesAt > now && (
                    <ActionButton action={reopenListing} listingId={listing.id} label="Reopen" />
                  )}
                  <ActionButton action={removeListing} listingId={listing.id} label="Remove" />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
