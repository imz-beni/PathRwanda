import { z } from "zod";

export const ACCOUNT_TYPES = ["youth", "employer", "agency", "provider"] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Enter your email address.")
  .pipe(z.email("Enter a valid email address, like name@example.com."));

const password = z
  .string()
  .min(8, "Your password must be at least 8 characters.")
  .max(72, "Your password must be 72 characters or fewer.");

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name.").max(100, "That name is too long."),
    email,
    password,
    accountType: z.enum(ACCOUNT_TYPES, "Choose the type of account you need."),
    organizationName: z.string().trim().max(150, "That name is too long.").optional(),
    ageConfirmed: z.literal("on", "You must be 16 or older to create an account."),
  })
  .superRefine((data, ctx) => {
    if (data.accountType !== "youth" && !data.organizationName) {
      ctx.addIssue({
        code: "custom",
        path: ["organizationName"],
        message: "Enter the name of your organization.",
      });
    }
  });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password."),
});

export type FieldErrors = Record<string, string[] | undefined>;

export function fieldErrors(error: z.ZodError): FieldErrors {
  return z.flattenError(error).fieldErrors;
}
