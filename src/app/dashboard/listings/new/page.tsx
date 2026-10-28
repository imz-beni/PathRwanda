import Link from "next/link";
import { db } from "@/lib/db";
import { requireApprovedOrganization } from "@/lib/auth/org";
import { ListingForm } from "@/components/ListingForm";
import { createListing } from "../actions";

export const metadata = { title: "New listing | PathRwanda" };

export default async function NewListingPage() {
  await requireApprovedOrganization();
  const sectors = await db.sector.findMany({
    where: { status: "LIVE" },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      skills: { orderBy: { name: "asc" }, select: { id: true, name: true } },
    },
  });

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <Link href="/dashboard/listings" className="text-sm underline">
        My listings
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-semibold">Create a listing</h1>
      <ListingForm action={createListing} sectors={sectors} submitLabel="Publish listing" />
    </main>
  );
}
