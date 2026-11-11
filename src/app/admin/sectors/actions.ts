"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { checkCourseLink, type LinkCheckResult } from "@/lib/course-links";
import { fieldErrors, type FieldErrors } from "@/lib/validation/auth";
import { courseSchema, sectorSchema } from "@/lib/validation/content";
import { formValues } from "@/lib/form-values";

export type ContentFormState = {
  errors?: FieldErrors;
  message?: string;
  saved?: boolean;
  values?: Record<string, string>;
};

// Every action checks the role again: the page guard alone does not protect a server action.

export async function updateSector(
  sectorId: string,
  _prev: ContentFormState | undefined,
  formData: FormData,
): Promise<ContentFormState> {
  await requireRole("ADMIN");
  const values = formValues(formData, ["name", "overview", "status"]);
  const parsed = sectorSchema.safeParse(values);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  // The slug is part of public links, so it is never edited here.
  const { count } = await db.sector.updateMany({ where: { id: sectorId }, data: parsed.data });
  if (count === 0) return { message: "We could not find this sector.", values };
  revalidatePath("/", "layout");
  return { saved: true, values };
}

const COURSE_FIELDS = ["title", "provider", "url", "description", "isFree"];

export async function createCourse(
  sectorId: string,
  _prev: ContentFormState | undefined,
  formData: FormData,
): Promise<ContentFormState> {
  await requireRole("ADMIN");
  const values = formValues(formData, COURSE_FIELDS);
  const parsed = courseSchema.safeParse(values);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const sector = await db.sector.findUnique({ where: { id: sectorId }, select: { slug: true } });
  if (!sector) return { message: "We could not find this sector.", values };

  await db.course.create({ data: { ...parsed.data, sectorId } });
  revalidatePath("/", "layout");
  redirect(`/admin/sectors/${sector.slug}`);
}

export async function updateCourse(
  courseId: string,
  _prev: ContentFormState | undefined,
  formData: FormData,
): Promise<ContentFormState> {
  await requireRole("ADMIN");
  const values = formValues(formData, COURSE_FIELDS);
  const parsed = courseSchema.safeParse(values);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: { sector: { select: { slug: true } } },
  });
  if (!course) notFound();

  // A new address has not been checked yet.
  const urlChanged = parsed.data.url !== course.url;
  await db.course.update({
    where: { id: course.id },
    data: { ...parsed.data, ...(urlChanged ? { checkedAt: null } : {}) },
  });
  revalidatePath("/", "layout");
  redirect(`/admin/sectors/${course.sector.slug}`);
}

export async function setCourseVisibility(formData: FormData) {
  await requireRole("ADMIN");
  const courseId = String(formData.get("courseId") ?? "");
  const visible = formData.get("visible") === "true";
  await db.course.updateMany({ where: { id: courseId }, data: { linkActive: visible } });
  revalidatePath("/", "layout");
}

// Deleting would also delete learners' progress, so it is only allowed while nobody has any.
export async function deleteCourse(formData: FormData) {
  await requireRole("ADMIN");
  const courseId = String(formData.get("courseId") ?? "");
  await db.course.deleteMany({ where: { id: courseId, progress: { none: {} } } });
  revalidatePath("/", "layout");
}

export type LinkCheckState = { result?: LinkCheckResult };

async function checkAndRecord(course: { id: string; url: string }) {
  const result = await checkCourseLink(course.url);
  if (result === "OK") {
    await db.course.update({ where: { id: course.id }, data: { checkedAt: new Date() } });
  } else if (result === "BROKEN") {
    // A dead link is hidden from learners. A working one is not shown again automatically,
    // because an admin may have hidden the course for another reason.
    await db.course.update({
      where: { id: course.id },
      data: { checkedAt: new Date(), linkActive: false },
    });
  }
  return result;
}

export async function recheckCourseLink(courseId: string): Promise<LinkCheckState> {
  await requireRole("ADMIN");
  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { id: true, url: true },
  });
  if (!course) return {};
  const result = await checkAndRecord(course);
  revalidatePath("/", "layout");
  return { result };
}

export type LinkCheckSummary = { checked?: number; broken?: number; unknown?: number };

export async function recheckSectorLinks(sectorId: string): Promise<LinkCheckSummary> {
  await requireRole("ADMIN");
  const courses = await db.course.findMany({
    where: { sectorId },
    select: { id: true, url: true },
  });
  const results = await Promise.all(courses.map(checkAndRecord));
  revalidatePath("/", "layout");
  return {
    checked: results.length,
    broken: results.filter((r) => r === "BROKEN").length,
    unknown: results.filter((r) => r === "UNKNOWN").length,
  };
}
