import Link from "next/link";
import { db } from "@/lib/db";
import { activeListingWhere, formatDate } from "@/lib/listings";
import { LISTING_TYPES, TYPE_LABEL } from "@/lib/validation/listing";

export const metadata = { title: "Opportunities | PathRwanda" };

type SearchParams = Promise<{ sector?: string; type?: string; q?: string; page?: string }>;

const PAGE_SIZE = 20;

export default async function OpportunitiesPage({ searchParams }: { searchParams: SearchParams }) {
  const { sector, type, q, page } = await searchParams;
  const query = q?.trim().slice(0, 100);
  const typeFilter = LISTING_TYPES.find((t) => t === type);
  const pageNumber = Math.max(1, Math.floor(Number(page)) || 1);

  const where = {
    ...activeListingWhere(),
    organization: { status: "APPROVED" as const },
    ...(typeFilter ? { type: typeFilter } : {}),
    ...(sector ? { sectors: { some: { sector: { slug: sector } } } } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" as const } },
            { location: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [sectors, listings, total] = await Promise.all([
    db.sector.findMany({ where: { status: "LIVE" }, orderBy: { sortOrder: "asc" } }),
    db.listing.findMany({
      where,
      // The id breaks ties so listings closing on the same day keep one order across pages.
      orderBy: [{ closesAt: "asc" }, { id: "asc" }],
      skip: (pageNumber - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { organization: { select: { name: true } }, sectors: { include: { sector: true } } },
    }),
    db.listing.count({ where }),
  ]);
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Page links keep the current search and filters.
  const pageHref = (target: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (sector) params.set("sector", sector);
    if (typeFilter) params.set("type", typeFilter);
    if (target > 1) params.set("page", String(target));
    const search = params.toString();
    return search ? `/opportunities?${search}` : "/opportunities";
  };

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <h1 className="mb-2 text-3xl font-semibold">Opportunities</h1>
      <p className="mb-6 text-zinc-600 dark:text-zinc-400">
        Jobs, training and programs that are open now.
      </p>

      <form method="get" className="mb-8 grid gap-3 sm:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium">Search title or place</span>
          <input type="search" name="q" defaultValue={query} className="input" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Sector</span>
          <select name="sector" defaultValue={sector ?? ""} className="input">
            <option value="">All</option>
            {sectors.map((s) => (
              <option key={s.id} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Type</span>
          <select name="type" defaultValue={typeFilter ?? ""} className="input">
            <option value="">All</option>
            {LISTING_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </label>
        <div className="sm:col-span-4 flex gap-3">
          <button type="submit" className="btn btn-primary">
            Search
          </button>
          <Link href="/opportunities" className="px-2 py-2 text-sm underline">
            Clear
          </Link>
        </div>
      </form>

      {listings.length === 0 ? (
        <p className="notice">
          No open opportunities match your search yet. Try clearing the filters.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {listings.map((listing) => (
            <li key={listing.id}>
              <Link
                href={`/opportunities/${listing.id}`}
                className="flex flex-col gap-1 card card-link p-4"
              >
                <span className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{listing.title}</span>
                  <span className="badge">{TYPE_LABEL[listing.type]}</span>
                </span>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {listing.organization.name}
                  {listing.location ? ` · ${listing.location}` : ""} · Closes{" "}
                  {formatDate(listing.closesAt)}
                </span>
                <span className="text-sm text-zinc-500">
                  {listing.sectors.map((s) => s.sector.name).join(", ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {lastPage > 1 && (
        <nav aria-label="Pages" className="mt-6 flex items-center justify-between gap-3 text-sm">
          {pageNumber > 1 ? (
            <Link href={pageHref(pageNumber - 1)} className="font-medium underline">
              Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-zinc-600 dark:text-zinc-400">
            Page {Math.min(pageNumber, lastPage)} of {lastPage} ({total} opportunities)
          </span>
          {pageNumber < lastPage ? (
            <Link href={pageHref(pageNumber + 1)} className="font-medium underline">
              Next
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </main>
  );
}
