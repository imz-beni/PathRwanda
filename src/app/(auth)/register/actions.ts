"use server";

import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import {
  fieldErrors,
  registerSchema,
  type AccountType,
  type FieldErrors,
} from "@/lib/validation/auth";

export type RegisterState = {
  errors?: FieldErrors;
  message?: string;
  values?: Record<string, string>;
};

const ACCOUNT_MAP = {
  youth: { role: "YOUTH" },
  employer: { role: "ORGANIZATION", orgType: "EMPLOYER" },
  agency: { role: "ORGANIZATION", orgType: "AGENCY" },
  provider: { role: "TRAINING_PROVIDER", orgType: "TRAINING_PROVIDER" },
} as const satisfies Record<AccountType, { role: string; orgType?: string }>;

export async function register(
  _prev: RegisterState | undefined,
  formData: FormData,
): Promise<RegisterState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  // Never send the password back to the browser.
  const values = { ...raw, password: "" };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const { name, email, password, accountType, organizationName } = parsed.data;
  const mapping = ACCOUNT_MAP[accountType];
  const passwordHash = await hashPassword(password);

  let userId: string;
  try {
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: mapping.role,
        ageConfirmedAt: new Date(),
        ...(mapping.role === "YOUTH"
          ? { profile: { create: {} } }
          : {
              organization: {
                create: { name: organizationName!, type: mapping.orgType },
              },
            }),
      },
    });
    userId = user.id;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        errors: { email: ["An account with this email already exists. Try logging in."] },
        values,
      };
    }
    console.error("Registration failed", error);
    return { message: "We could not create your account. Please try again.", values };
  }

  await createSession(userId);
  redirect(mapping.role === "YOUTH" ? "/sectors" : "/dashboard");
}
