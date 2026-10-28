import { z } from "zod";

export const organizationSchema = z.object({
  name: z.string().trim().min(2, "Enter the organization name.").max(150, "That name is too long."),
  website: z
    .string()
    .trim()
    .max(200, "That address is too long.")
    .optional()
    .transform((value) => (value ? value : undefined))
    .refine((value) => {
      if (!value) return true;
      try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:";
      } catch {
        return false;
      }
    }, "Enter a full web address, like https://example.rw."),
});
