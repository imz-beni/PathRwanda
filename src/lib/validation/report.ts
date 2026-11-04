import { z } from "zod";

export const reportSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(10, "Tell us a little more about what is wrong (at least 10 characters).")
    .max(500, "Please keep it under 500 characters."),
});
