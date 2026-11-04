"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/dal";
import { fieldErrors, type FieldErrors } from "@/lib/validation/auth";
import { reportSchema } from "@/lib/validation/report";

export type ReportState = {
  errors?: FieldErrors;
  message?: string;
  sent?: boolean;
  values?: Record<string, string>;
};

export async function reportListing(
  _prev: ReportState | undefined,
  formData: FormData,
): Promise<ReportState> {
  const user = await requireUser();
  const listingId = String(formData.get("listingId") ?? "");
  const values = { reason: String(formData.get("reason") ?? "") };

  const parsed = reportSchema.safeParse(values);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  // Only listings the public can see can be reported (same rule as the detail page).
  const listing = await db.listing.findFirst({
    where: { id: listingId, status: { not: "REMOVED" }, organization: { status: "APPROVED" } },
    select: { id: true },
  });
  if (!listing) return { message: "We could not find this opportunity.", values };

  // One open report per person per listing, so the admin queue is not flooded by repeat clicks.
  const existing = await db.listingReport.findFirst({
    where: { listingId, reporterId: user.id, status: "OPEN" },
    select: { id: true },
  });
  if (existing) return { sent: true };

  await db.listingReport.create({
    data: { listingId, reporterId: user.id, reason: parsed.data.reason },
  });
  revalidatePath("/admin", "layout");
  return { sent: true };
}
