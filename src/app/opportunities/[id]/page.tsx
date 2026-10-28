import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { displayStatus, formatDate } from "@/lib/listings";
import { TYPE_LABEL } from "@/lib/validation/listing";

type Props = { params: Promise<{ id: string }> };

async function getListing(id: string) {
  const listing = await db.listing.findUnique({
    where: { id },
    include: {
      organization: { select: { name: true, website: true, status: true } },
      sectors: { include: { sector: true } },
      skills: { orderBy: { name: "asc" } },
    },
  });
  // Removed listings and listings from organizations that are not approved are not public.
  if (!listing || listing.status === "REMOVED" || listing.organization.status !== "APPROVED")
    return null;
  return listing;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const listing = await getListing(id);
  return { title: `${listing?.title ?? "Opportunity"} | PathRwanda` };
}

export default async function OpportunityPage({ params }: Props) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  const status = displayStatus(listing);
  const open = status === "ACTIVE";

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <Link href="/opportunities" className="text-sm underline">
        All opportunities
      </Link>
      <h1 className="mt-3 mb-1 text-2xl font-semibold">{listing.title}</h1>
      <p className="mb-4 text-zinc-600 dark:text-zinc-400">
        {listing.organization.name} · {TYPE_LABEL[listing.type]}
        {listing.location ? ` · ${listing.location}` : ""}
      </p>

      {!open && (
        <p
          role="status"
          className="mb-4 rounded-md bg-amber-50 p-3 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
        >
          This opportunity is no longer open. It{" "}
          {status === "EXPIRED" ? "closed on" : "was closed before"} {formatDate(listing.closesAt)}.
        </p>
      )}

      <dl className="mb-6 grid gap-1 text-sm sm:grid-cols-[10rem_1fr]">
        <dt className="font-medium">Sectors</dt>
        <dd>{listing.sectors.map((s) => s.sector.name).join(", ")}</dd>
        <dt className="font-medium">Closing date</dt>
        <dd>{formatDate(listing.closesAt)}</dd>
        {listing.skills.length > 0 && (
          <>
            <dt className="font-medium">Skills wanted</dt>
            <dd>{listing.skills.map((s) => s.name).join(", ")}</dd>
          </>
        )}
      </dl>

      <section className="mb-6">
        <h2 className="mb-1 text-lg font-medium">About this opportunity</h2>
        <p className="whitespace-pre-line">{listing.description}</p>
      </section>

      {listing.requirements && (
        <section className="mb-6">
          <h2 className="mb-1 text-lg font-medium">Requirements</h2>
          <p className="whitespace-pre-line">{listing.requirements}</p>
        </section>
      )}

      {open && (
        <section className="mb-6">
          <h2 className="mb-1 text-lg font-medium">How to apply</h2>
          <p className="whitespace-pre-line">{listing.applyInfo}</p>
        </section>
      )}
    </main>
  );
}
