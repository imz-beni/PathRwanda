"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { recordEvent } from "@/lib/events";
import { parseProgressAction } from "@/lib/progress";

// Following and progress are for young people. Every action re-checks the role on the server.
export async function toggleFollow(formData: FormData) {
  const user = await requireRole("YOUTH");
  const sectorId = String(formData.get("sectorId") ?? "");

  const sector = await db.sector.findUnique({ where: { id: sectorId } });
  if (!sector) return;

  const key = { userId_sectorId: { userId: user.id, sectorId } };
  const existing = await db.sectorFollow.findUnique({ where: key });

  if (existing) {
    await db.sectorFollow.delete({ where: key });
  } else {
    await db.sectorFollow.create({ data: { userId: user.id, sectorId } });
    await recordEvent({ type: "SECTOR_FOLLOWED", userId: user.id, sectorId });
  }
  revalidatePath("/", "layout");
}

export async function setCourseProgress(formData: FormData) {
  const user = await requireRole("YOUTH");
  const courseId = String(formData.get("courseId") ?? "");
  const action = parseProgressAction(formData.get("action"));
  if (!action) return;

  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course) return;

  const key = { userId_courseId: { userId: user.id, courseId } };

  if (action === "NONE") {
    await db.courseProgress.deleteMany({ where: { userId: user.id, courseId } });
  } else {
    await db.courseProgress.upsert({
      where: key,
      update: { status: action },
      create: { userId: user.id, courseId, status: action },
    });
    await recordEvent({
      type: action === "STARTED" ? "COURSE_STARTED" : "COURSE_COMPLETED",
      userId: user.id,
      courseId,
      sectorId: course.sectorId,
    });
  }
  revalidatePath("/", "layout");
}
