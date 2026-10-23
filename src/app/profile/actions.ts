"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";

export async function saveSkills(formData: FormData) {
  const user = await requireRole("YOUTH");
  const requested = formData.getAll("skillId").map(String);

  // Only accept ids that really exist, whatever the browser sent.
  const valid = await db.skill.findMany({ where: { id: { in: requested } }, select: { id: true } });

  await db.profile.upsert({
    where: { userId: user.id },
    update: { skills: { set: valid } },
    create: { userId: user.id, skills: { connect: valid } },
  });
  revalidatePath("/", "layout");
}
