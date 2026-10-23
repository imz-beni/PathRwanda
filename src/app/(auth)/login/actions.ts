"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { safeNextPath } from "@/lib/safe-redirect";
import { fieldErrors, loginSchema, type FieldErrors } from "@/lib/validation/auth";

export type LoginState = {
  errors?: FieldErrors;
  message?: string;
  values?: Record<string, string>;
};

// A fixed hash so a missing account takes about as long to reject as a wrong password.
const DUMMY_HASH = "$2b$12$HD7lYUD.pne4UKb3ZHe1/u7WpKH2KZ9MWP/gKo13RxCQ7LTDYIyd2";

export async function login(
  _prev: LoginState | undefined,
  formData: FormData,
): Promise<LoginState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const values = { email: raw.email ?? "" };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const { email, password } = parsed.data;
  const user = await db.user.findUnique({ where: { email } });
  const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !valid) {
    return { message: "The email or password is not correct. Please try again.", values };
  }

  await createSession(user.id);
  const fallback = user.role === "YOUTH" ? "/sectors" : "/dashboard";
  redirect(safeNextPath(raw.next, fallback));
}

export async function logout() {
  await destroySession();
  redirect("/");
}
