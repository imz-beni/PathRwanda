import Link from "next/link";
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
      {organization && <p className="mb-4 text-zinc-600 dark:text-zinc-400">{organization.name}</p>}

      {organization?.status === "PENDING" && (
        <p className="rounded-md bg-amber-50 p-3 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          {organization.name} is waiting for approval by an administrator. You will be able to
          publish listings once it is approved.
        </p>
      )}
      {organization?.status === "APPROVED" && (
        <ul className="flex flex-wrap gap-3">
          <li>
            <Link
              href="/dashboard/listings"
              className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
            >
              My listings
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/listings/new"
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-700"
            >
              Create a listing
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/organization"
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-700"
            >
              Organization profile
            </Link>
          </li>
        </ul>
      )}
      {organization?.status === "REJECTED" && (
        <p className="text-red-700 dark:text-red-300">
          Your organization was not approved. Please contact support.
        </p>
      )}
      {user.role === "ADMIN" && (
        <p>
          <Link href="/admin" className="font-medium underline">
            Go to administration
          </Link>
        </p>
      )}
    </main>
  );
}
