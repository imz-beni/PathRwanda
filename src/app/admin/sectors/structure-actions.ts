"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { formValues } from "@/lib/form-values";
import { fieldErrors } from "@/lib/validation/auth";
import { pathwaySchema, skillSchema } from "@/lib/validation/content";
import type { ContentFormState } from "./actions";

// Career pathways and skills. Every action checks the role again, like the course actions.

function isDuplicate(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

const DUPLICATE_SKILL = { name: ["This sector already has a skill with that name."] };

export async function createSkill(
  sectorId: string,
  _prev: ContentFormState | undefined,
  formData: FormData,
): Promise<ContentFormState> {
  await requireRole("ADMIN");
  const values = formValues(formData, ["name"]);
  const parsed = skillSchema.safeParse(values);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  try {
    await db.skill.create({ data: { name: parsed.data.name, sectorId } });
  } catch (error) {
    if (isDuplicate(error)) return { errors: DUPLICATE_SKILL, values };
    throw error;
  }
  revalidatePath("/", "layout");
  return { saved: true };
}

export async function renameSkill(
  skillId: string,
  _prev: ContentFormState | undefined,
  formData: FormData,
): Promise<ContentFormState> {
  await requireRole("ADMIN");
  const values = formValues(formData, ["name"]);
  const parsed = skillSchema.safeParse(values);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  try {
    const { count } = await db.skill.updateMany({
      where: { id: skillId },
      data: { name: parsed.data.name },
    });
    if (count === 0) return { message: "We could not find this skill.", values };
  } catch (error) {
    if (isDuplicate(error)) return { errors: DUPLICATE_SKILL, values };
    throw error;
  }
  revalidatePath("/", "layout");
  return { saved: true, values };
}

// A skill that users have on their profile or that a listing asks for is kept, so deleting it
// cannot change anyone's data or matches. Pathways simply lose the skill.
export async function deleteSkill(formData: FormData) {
  await requireRole("ADMIN");
  const skillId = String(formData.get("skillId") ?? "");
  await db.skill.deleteMany({
    where: { id: skillId, profiles: { none: {} }, listings: { none: {} } },
  });
  revalidatePath("/", "layout");
}

function pathwayValues(formData: FormData) {
  const skillIds = formData.getAll("skillIds").map(String);
  return {
    values: formValues(formData, ["title", "description", "incomeNote"]),
    skillIds,
  };
}

// Only skills from the pathway's own sector can be linked.
async function sectorSkillIds(sectorId: string, skillIds: string[]) {
  const skills = await db.skill.findMany({
    where: { sectorId, id: { in: skillIds } },
    select: { id: true },
  });
  return skills.map(({ id }) => ({ id }));
}

export async function createPathway(
  sectorId: string,
  _prev: ContentFormState | undefined,
  formData: FormData,
): Promise<ContentFormState> {
  await requireRole("ADMIN");
  const { values, skillIds } = pathwayValues(formData);
  const parsed = pathwaySchema.safeParse({ ...values, skillIds });
  const shown = { ...values, skillIds: skillIds.join(",") };
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values: shown };

  const sector = await db.sector.findUnique({ where: { id: sectorId }, select: { slug: true } });
  if (!sector) return { message: "We could not find this sector.", values: shown };

  const { skillIds: chosen, ...data } = parsed.data;
  await db.careerPathway.create({
    data: { ...data, sectorId, skills: { connect: await sectorSkillIds(sectorId, chosen) } },
  });
  revalidatePath("/", "layout");
  redirect(`/admin/sectors/${sector.slug}/pathways`);
}

export async function updatePathway(
  pathwayId: string,
  _prev: ContentFormState | undefined,
  formData: FormData,
): Promise<ContentFormState> {
  await requireRole("ADMIN");
  const { values, skillIds } = pathwayValues(formData);
  const parsed = pathwaySchema.safeParse({ ...values, skillIds });
  const shown = { ...values, skillIds: skillIds.join(",") };
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values: shown };

  const pathway = await db.careerPathway.findUnique({
    where: { id: pathwayId },
    include: { sector: { select: { slug: true } } },
  });
  if (!pathway) notFound();

  const { skillIds: chosen, ...data } = parsed.data;
  await db.careerPathway.update({
    where: { id: pathway.id },
    data: { ...data, skills: { set: await sectorSkillIds(pathway.sectorId, chosen) } },
  });
  revalidatePath("/", "layout");
  redirect(`/admin/sectors/${pathway.sector.slug}/pathways`);
}

// Pathways hold no user data, so they can always be deleted.
export async function deletePathway(formData: FormData) {
  await requireRole("ADMIN");
  const pathwayId = String(formData.get("pathwayId") ?? "");
  await db.careerPathway.deleteMany({ where: { id: pathwayId } });
  revalidatePath("/", "layout");
}
