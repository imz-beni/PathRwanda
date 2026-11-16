"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";

// Clears the "new" alert: listings published before now no longer count as new for this user.
export async function markMatchesSeen() {
  const user = await requireRole("YOUTH");
  await db.user.update({ where: { id: user.id }, data: { matchesSeenAt: new Date() } });
  revalidatePath("/", "layout");
}
