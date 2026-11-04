"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";

async function setStatus(formData: FormData, status: "RESOLVED" | "DISMISSED") {
  // Checked again here: the page guard alone does not protect a server action.
  await requireRole("ADMIN");
  const reportId = String(formData.get("reportId") ?? "");
  await db.listingReport.updateMany({ where: { id: reportId }, data: { status } });
  revalidatePath("/admin", "layout");
}

export async function resolveReport(formData: FormData) {
  await setStatus(formData, "RESOLVED");
}

export async function dismissReport(formData: FormData) {
  await setStatus(formData, "DISMISSED");
}

// Removing hides the listing everywhere (the row stays for history) and closes every open report on it.
export async function removeReportedListing(formData: FormData) {
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
