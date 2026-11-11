"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { MAX_IMPORT_BYTES, parseListingImport, type ImportProblem } from "@/lib/listing-import";

export type ImportState = {
  message?: string;
  problems?: ImportProblem[];
  imported?: { count: number; organization: string };
};

// All or nothing: if any row has a problem, no listing is created, so a half-imported file
// never has to be untangled by hand.
export async function importListings(
  _prev: ImportState | undefined,
  formData: FormData,
): Promise<ImportState> {
  await requireRole("ADMIN");

  const organizationId = String(formData.get("organizationId") ?? "");
  const organization = await db.organization.findFirst({
    where: { id: organizationId, status: "APPROVED" },
    select: { id: true, name: true },
  });
  if (!organization) return { message: "Choose an approved organization." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { message: "Choose a CSV file." };
  if (file.size > MAX_IMPORT_BYTES) {
    return { message: `That file is too big. The limit is ${MAX_IMPORT_BYTES / 1024} KB.` };
  }

  const sectors = await db.sector.findMany({
    select: { id: true, slug: true, name: true, skills: { select: { id: true, name: true } } },
  });
  const { listings, problems } = parseListingImport(await file.text(), sectors);

  // Importing the same file twice should not create every listing twice.
  const existing = await db.listing.findMany({
    where: { organizationId: organization.id, status: { not: "REMOVED" } },
    select: { title: true },
  });
  const existingTitles = new Set(existing.map((l) => l.title.trim().toLowerCase()));
  for (const listing of listings) {
    if (existingTitles.has(listing.title.toLowerCase())) {
      problems.push({
        row: listing.row,
        message: `title: ${organization.name} already has a listing with this title.`,
      });
    }
  }

  if (problems.length > 0) {
    return { problems: problems.sort((a, b) => a.row - b.row) };
  }

  await db.$transaction(
    listings.map((listing) =>
      db.listing.create({
        data: {
          organizationId: organization.id,
          title: listing.title,
          type: listing.type,
          description: listing.description,
          requirements: listing.requirements,
          location: listing.location,
          applyInfo: listing.applyInfo,
          closesAt: listing.closesAt,
          sectors: { create: listing.sectorIds.map((sectorId) => ({ sectorId })) },
          skills: { connect: listing.skillIds.map((id) => ({ id })) },
        },
      }),
    ),
  );
  revalidatePath("/", "layout");
  return { imported: { count: listings.length, organization: organization.name } };
}
