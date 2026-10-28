import Link from "next/link";
import { requireRole } from "@/lib/auth/dal";

export const metadata = { title: "Admin | PathRwanda" };

export default async function AdminPage() {
  const user = await requireRole("ADMIN");

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold">Administration</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Signed in as {user.name}. Listing and content management will appear here.
      </p>
      <p className="mt-4">
        <Link href="/admin/organizations" className="font-medium underline">
          Review organizations
        </Link>
      </p>
    </main>
  );
}
