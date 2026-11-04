"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";

// Removing hides the listing everywhere (the row stays for history) and closes every open report on it.
// The organization cannot reopen or edit a removed listing.
export async function removeListingAsAdmin(formData: FormData) {
  // Checked again here: the page guard alone does not protect a server action.
  await requireRole("ADMIN");
  const listingId = String(formData.get("listingId") ?? "");
  await db.$transaction([
    db.listing.updateMany({ where: { id: listingId }, data: { status: "REMOVED" } }),
    db.listingReport.updateMany({
      where: { listingId, status: "OPEN" },
      data: { status: "RESOLVED" },
    }),
  ]);
  revalidatePath("/", "layout");
}

// Restores as CLOSED, not ACTIVE, so nothing goes public again until the organization reopens it.
export async function restoreListing(formData: FormData) {
  await requireRole("ADMIN");
  const listingId = String(formData.get("listingId") ?? "");
  await db.listing.updateMany({
    where: { id: listingId, status: "REMOVED" },
    data: { status: "CLOSED" },
  });
  revalidatePath("/", "layout");
}
