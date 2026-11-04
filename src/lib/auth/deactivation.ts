import type { Role } from "@prisma/client";

type Target = { id: string; role: Role } | null;

// Returns why an admin may not deactivate this account, or null when it is allowed.
// Admin accounts are managed through the seed/env, so they cannot lock each other (or themselves) out.
export function deactivationProblem(adminId: string, target: Target): string | null {
  if (!target) return "We could not find that account.";
  if (target.id === adminId) return "You cannot deactivate your own account.";
  if (target.role === "ADMIN") return "Administrator accounts cannot be deactivated here.";
  return null;
}
