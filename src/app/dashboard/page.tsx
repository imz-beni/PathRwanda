import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";

export const metadata = { title: "Dashboard | PathRwanda" };

export default async function DashboardPage() {
  const user = await requireRole("ORGANIZATION", "TRAINING_PROVIDER", "ADMIN");
  const organization =
    user.role === "ADMIN"
      ? null
      : await db.organization.findUnique({ where: { ownerId: user.id } });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold">Welcome, {user.name}</h1>
      {organization?.status === "PENDING" && (
        <p className="rounded-md bg-amber-50 p-3 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          {organization.name} is waiting for approval by an administrator. You will be able to
          publish listings once it is approved.
        </p>
      )}
      {organization?.status === "APPROVED" && (
        <p className="text-zinc-600 dark:text-zinc-400">
          Your organization is approved. Listing tools are coming soon.
        </p>
      )}
      {organization?.status === "REJECTED" && (
        <p className="text-red-700 dark:text-red-300">
          Your organization was not approved. Please contact support.
        </p>
      )}
    </main>
  );
}
