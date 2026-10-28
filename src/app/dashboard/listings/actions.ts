"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireApprovedOrganization } from "@/lib/auth/org";
import { fieldErrors, type FieldErrors } from "@/lib/validation/auth";
import { parseListingForm, requireFutureClosing } from "@/lib/validation/listing";

export type ListingFormState = {
  errors?: FieldErrors;
  message?: string;
  values?: Record<string, string | string[]>;
};

function rawValues(formData: FormData): Record<string, string | string[]> {
  return {
    title: String(formData.get("title") ?? ""),
    type: String(formData.get("type") ?? ""),
    sectorId: formData.getAll("sectorId").map(String),
    skillId: formData.getAll("skillId").map(String),
    description: String(formData.get("description") ?? ""),
    requirements: String(formData.get("requirements") ?? ""),
    location: String(formData.get("location") ?? ""),
    applyInfo: String(formData.get("applyInfo") ?? ""),
    closesAt: String(formData.get("closesAt") ?? ""),
  };
}

// Returns clean data, or the form state to show the user.
async function checkForm(formData: FormData, options: { requireFuture: boolean }) {
  const values = rawValues(formData);
  const parsed = parseListingForm(formData);
  if (!parsed.success)
    return {
      ok: false as const,
      state: { errors: fieldErrors(parsed.error), values } as ListingFormState,
    };

  const data = parsed.data;
  if (options.requireFuture) {
    const problem = requireFutureClosing(data.closesAt);
    if (problem)
      return {
        ok: false as const,
        state: { errors: { closesAt: [problem] }, values } as ListingFormState,
      };
  }

  // Never trust ids from the browser: sectors must exist, and skills must belong to a chosen sector.
  const sectors = await db.sector.findMany({
    where: { id: { in: data.sectorIds } },
    select: { id: true },
  });
  if (sectors.length !== data.sectorIds.length) {
    return {
      ok: false as const,
      state: { errors: { sectorIds: ["Choose a valid sector."] }, values } as ListingFormState,
    };
  }
  const skills = await db.skill.findMany({
    where: { id: { in: data.skillIds }, sectorId: { in: data.sectorIds } },
    select: { id: true },
  });

  return {
    ok: true as const,
    data,
    sectorIds: sectors.map((s) => s.id),
    skillIds: skills.map((s) => s.id),
  };
}

export async function createListing(
  _prev: ListingFormState | undefined,
  formData: FormData,
): Promise<ListingFormState> {
  const { organization } = await requireApprovedOrganization();
  const checked = await checkForm(formData, { requireFuture: true });
  if (!checked.ok) return checked.state;
  const { data, sectorIds, skillIds } = checked;

  await db.listing.create({
    data: {
      organizationId: organization.id,
      title: data.title,
      type: data.type,
      description: data.description,
      requirements: data.requirements,
      location: data.location,
      applyInfo: data.applyInfo,
      closesAt: data.closesAt,
      sectors: { create: sectorIds.map((sectorId) => ({ sectorId })) },
      skills: { connect: skillIds.map((id) => ({ id })) },
    },
  });
  revalidatePath("/", "layout");
  redirect("/dashboard/listings");
}

async function ownedListing(listingId: string, organizationId: string) {
  const listing = await db.listing.findUnique({ where: { id: listingId } });
  // Same response for "missing" and "someone else's" so ids cannot be probed.
  if (!listing || listing.organizationId !== organizationId || listing.status === "REMOVED")
    notFound();
  return listing;
}

export async function updateListing(
  listingId: string,
  _prev: ListingFormState | undefined,
  formData: FormData,
): Promise<ListingFormState> {
  const { organization } = await requireApprovedOrganization();
  const existing = await ownedListing(listingId, organization.id);

  // An already-expired listing may keep its old date, but a changed date must be in the future.
  const dateChanged =
    String(formData.get("closesAt") ?? "") !== String(formData.get("originalClosesAt") ?? "");
  const checked = await checkForm(formData, { requireFuture: dateChanged });
  if (!checked.ok) return checked.state;
  const { data, sectorIds, skillIds } = checked;

  await db.$transaction([
    db.listingSector.deleteMany({ where: { listingId: existing.id } }),
    db.listing.update({
      where: { id: existing.id },
      data: {
        title: data.title,
        type: data.type,
        description: data.description,
        requirements: data.requirements ?? null,
        location: data.location ?? null,
        applyInfo: data.applyInfo,
        closesAt: data.closesAt,
        // Re-opening by moving the date forward is allowed; a closed/removed state is kept as is.
        sectors: { create: sectorIds.map((sectorId) => ({ sectorId })) },
        skills: { set: skillIds.map((id) => ({ id })) },
      },
    }),
  ]);
  revalidatePath("/", "layout");
  redirect("/dashboard/listings");
}

export async function closeListing(formData: FormData) {
  const { organization } = await requireApprovedOrganization();
  const listing = await ownedListing(String(formData.get("listingId") ?? ""), organization.id);
  await db.listing.update({ where: { id: listing.id }, data: { status: "CLOSED" } });
  revalidatePath("/", "layout");
}

export async function reopenListing(formData: FormData) {
  const { organization } = await requireApprovedOrganization();
  const listing = await ownedListing(String(formData.get("listingId") ?? ""), organization.id);
  // Reopening only makes sense while the closing date is still ahead.
  if (listing.closesAt.getTime() > Date.now()) {
    await db.listing.update({ where: { id: listing.id }, data: { status: "ACTIVE" } });
  }
  revalidatePath("/", "layout");
}

// FR-4.6: removed listings disappear everywhere but stay in the database so reports and history are kept.
export async function removeListing(formData: FormData) {
  const { organization } = await requireApprovedOrganization();
  const listing = await ownedListing(String(formData.get("listingId") ?? ""), organization.id);
  await db.listing.update({ where: { id: listing.id }, data: { status: "REMOVED" } });
  revalidatePath("/", "layout");
}
