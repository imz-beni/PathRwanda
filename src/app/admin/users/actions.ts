"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { deactivationProblem } from "@/lib/auth/deactivation";

async function findTarget(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  return db.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
}

export async function deactivateUser(formData: FormData) {
  // Checked again here: the page guard alone does not protect a server action.
  const admin = await requireRole("ADMIN");
  const target = await findTarget(formData);
  if (deactivationProblem(admin.id, target) || !target) return;

  // Signing them out everywhere makes the block take effect at once, not when the session expires.
  await db.$transaction([
    db.user.update({ where: { id: target.id }, data: { deactivatedAt: new Date() } }),
    db.session.deleteMany({ where: { userId: target.id } }),
  ]);
  revalidatePath("/admin", "layout");
}

export async function reactivateUser(formData: FormData) {
  await requireRole("ADMIN");
  const target = await findTarget(formData);
  if (!target) return;
  await db.user.update({ where: { id: target.id }, data: { deactivatedAt: null } });
  revalidatePath("/admin", "layout");
}
