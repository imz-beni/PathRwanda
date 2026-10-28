import "server-only";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "./dal";

// For anything that publishes or changes listings: the signed-in user must own an APPROVED organization (BR-5).
export async function requireApprovedOrganization() {
  const user = await requireRole("ORGANIZATION", "TRAINING_PROVIDER");
  const organization = await db.organization.findUnique({ where: { ownerId: user.id } });
  if (!organization || organization.status !== "APPROVED") redirect("/dashboard");
  return { user, organization };
}
