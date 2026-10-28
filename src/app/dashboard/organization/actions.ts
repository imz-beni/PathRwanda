"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { fieldErrors, type FieldErrors } from "@/lib/validation/auth";
import { organizationSchema } from "@/lib/validation/organization";

export type OrganizationState = {
  errors?: FieldErrors;
  message?: string;
  saved?: boolean;
  values?: Record<string, string>;
};

export async function updateOrganization(
  _prev: OrganizationState | undefined,
  formData: FormData,
): Promise<OrganizationState> {
  const user = await requireRole("ORGANIZATION", "TRAINING_PROVIDER");
  const values = {
    name: String(formData.get("name") ?? ""),
    website: String(formData.get("website") ?? ""),
  };

  const parsed = organizationSchema.safeParse(values);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const organization = await db.organization.findUnique({ where: { ownerId: user.id } });
  if (!organization) return { message: "We could not find your organization.", values };

  // Approval status and type are never editable here.
  await db.organization.update({
    where: { id: organization.id },
    data: { name: parsed.data.name, website: parsed.data.website ?? null },
  });
  revalidatePath("/", "layout");
  return { saved: true, values };
}
