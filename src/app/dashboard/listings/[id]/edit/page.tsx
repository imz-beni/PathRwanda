import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireApprovedOrganization } from "@/lib/auth/org";
import { ListingForm } from "@/components/ListingForm";
import { toDateInputValue } from "@/lib/listings";
import { updateListing } from "../../actions";

export const metadata = { title: "Edit listing | PathRwanda" };

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { organization } = await requireApprovedOrganization();

  const listing = await db.listing.findUnique({
    where: { id },
    include: { sectors: true, skills: { select: { id: true } } },
  });
  if (!listing || listing.organizationId !== organization.id || listing.status === "REMOVED")
    notFound();

  const sectors = await db.sector.findMany({
    where: { status: "LIVE" },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      skills: { orderBy: { name: "asc" }, select: { id: true, name: true } },
    },
  });
  const closesAt = toDateInputValue(listing.closesAt);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <Link href="/dashboard/listings" className="text-sm underline">
        My listings
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-semibold">Edit listing</h1>
      <ListingForm
        action={updateListing.bind(null, listing.id)}
        sectors={sectors}
        submitLabel="Save changes"
        originalClosesAt={closesAt}
        defaults={{
          title: listing.title,
          type: listing.type,
          sectorIds: listing.sectors.map((s) => s.sectorId),
          skillIds: listing.skills.map((s) => s.id),
          description: listing.description,
          requirements: listing.requirements ?? "",
          location: listing.location ?? "",
          applyInfo: listing.applyInfo,
          closesAt,
        }}
      />
    </main>
  );
}
