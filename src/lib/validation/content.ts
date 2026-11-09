import { z } from "zod";

export const SECTOR_STATUSES = ["LIVE", "COMING_SOON"] as const;

export const SECTOR_STATUS_LABEL: Record<(typeof SECTOR_STATUSES)[number], string> = {
  LIVE: "Live",
  COMING_SOON: "Coming soon",
};

export const sectorSchema = z.object({
  name: z.string().trim().min(2, "Enter the sector name.").max(80, "That name is too long."),
  overview: z
    .string()
    .trim()
    .min(10, "Write a short overview of at least 10 characters.")
    .max(600, "Please keep the overview under 600 characters."),
  status: z.enum(SECTOR_STATUSES, "Choose whether the sector is live or coming soon."),
});

export const courseSchema = z.object({
  title: z.string().trim().min(3, "Enter the course title.").max(150, "That title is too long."),
  provider: z
    .string()
    .trim()
    .min(2, "Enter who runs the course.")
    .max(100, "That name is too long."),
  url: z
    .string()
    .trim()
    .max(500, "That address is too long.")
    .refine((value) => {
      try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:";
      } catch {
        return false;
      }
    }, "Enter the full course address, like https://example.org/course."),
  description: z
    .string()
    .trim()
    .max(500, "Please keep the description under 500 characters.")
    .optional()
    .transform((value) => (value ? value : undefined)),
  // A checkbox sends "on" when ticked and nothing when not.
  isFree: z
    .string()
    .optional()
    .transform((value) => value === "on"),
});
