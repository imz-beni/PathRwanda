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
