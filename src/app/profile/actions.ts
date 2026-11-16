"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { DISTRICTS, EDUCATION_LEVELS, pickFrom } from "@/lib/validation/profile";

export async function saveProfile(formData: FormData) {
  const user = await requireRole("YOUTH");
  const requested = formData.getAll("skillId").map(String);

  // Only accept ids that really exist, whatever the browser sent.
  const valid = await db.skill.findMany({ where: { id: { in: requested } }, select: { id: true } });

  // District and education level are optional; "not given" is stored as empty.
  const details = {
    district: pickFrom(DISTRICTS, formData.get("district")),
    educationLevel: pickFrom(EDUCATION_LEVELS, formData.get("educationLevel")),
  };

  await db.profile.upsert({
    where: { userId: user.id },
    update: { ...details, skills: { set: valid } },
    create: { userId: user.id, ...details, skills: { connect: valid } },
  });
  revalidatePath("/", "layout");
}
