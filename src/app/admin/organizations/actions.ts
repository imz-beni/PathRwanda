"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";

async function setStatus(formData: FormData, status: "APPROVED" | "REJECTED") {
  // Checked again here: the page guard alone does not protect a server action.
  await requireRole("ADMIN");
  const organizationId = String(formData.get("organizationId") ?? "");
  await db.organization.updateMany({ where: { id: organizationId }, data: { status } });
  revalidatePath("/", "layout");
}

export async function approveOrganization(formData: FormData) {
  await setStatus(formData, "APPROVED");
}

export async function rejectOrganization(formData: FormData) {
  await setStatus(formData, "REJECTED");
}
