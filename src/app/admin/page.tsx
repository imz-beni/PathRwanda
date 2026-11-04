import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";

export const metadata = { title: "Admin | PathRwanda" };

export default async function AdminPage() {
  const user = await requireRole("ADMIN");
  const openReports = await db.listingReport.count({ where: { status: "OPEN" } });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold">Administration</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Signed in as {user.name}. Sector and course editing will appear here.
      </p>
      <p className="mt-4">
        <Link href="/admin/organizations" className="font-medium underline">
          Review organizations
        </Link>
      </p>
      <p className="mt-2">
        <Link href="/admin/reports" className="font-medium underline">
          Reported listings ({openReports} open)
        </Link>
      </p>
      <p className="mt-2">
        <Link href="/admin/listings" className="font-medium underline">
          All listings
        </Link>
      </p>
      <p className="mt-2">
        <Link href="/admin/users" className="font-medium underline">
          Users
        </Link>
      </p>
    </main>
  );
}
