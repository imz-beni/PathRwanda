import { z } from "zod";
import { endOfDayKigali } from "@/lib/listings";

export const LISTING_TYPES = ["JOB", "TRAINING", "PROGRAM"] as const;

export const TYPE_LABEL: Record<(typeof LISTING_TYPES)[number], string> = {
  JOB: "Job",
  TRAINING: "Training",
  PROGRAM: "Program",
};

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, "That is too long.")
    .optional()
    .transform((v) => (v ? v : undefined));

export const listingSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Enter a title of at least 5 characters.")
    .max(120, "That title is too long."),
  type: z.enum(LISTING_TYPES, "Choose whether this is a job, training or program."),
  // BR-6 / FR-4.3: every listing belongs to at least one sector.
  sectorIds: z.array(z.string().min(1)).min(1, "Choose at least one sector."),
  skillIds: z.array(z.string().min(1)),
  description: z
    .string()
    .trim()
    .min(20, "Describe the opportunity in at least 20 characters.")
    .max(4000, "That is too long."),
  requirements: optionalText(2000),
  location: optionalText(120),
  applyInfo: z
    .string()
    .trim()
    .min(5, "Explain how to apply or register.")
    .max(1000, "That is too long."),
  closesAt: z
    .string()
    .min(1, "Choose a closing date.")
    .transform((value, ctx) => {
      const date = endOfDayKigali(value);
      if (!date) {
        ctx.addIssue({ code: "custom", message: "Enter a valid closing date." });
        return z.NEVER;
      }
      return date;
    }),
});

// New listings must close in the future; editing an old one may keep its date.
export function requireFutureClosing(closesAt: Date, now = new Date()): string | null {
  return closesAt.getTime() > now.getTime() ? null : "The closing date must be in the future.";
}

export function parseListingForm(formData: FormData) {
  return listingSchema.safeParse({
    title: formData.get("title") ?? "",
    type: formData.get("type") ?? "",
    sectorIds: formData.getAll("sectorId").map(String),
    skillIds: formData.getAll("skillId").map(String),
    description: formData.get("description") ?? "",
    requirements: formData.get("requirements") ?? undefined,
    location: formData.get("location") ?? undefined,
    applyInfo: formData.get("applyInfo") ?? "",
    closesAt: formData.get("closesAt") ?? "",
  });
}
