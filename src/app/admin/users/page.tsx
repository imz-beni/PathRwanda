import Link from "next/link";
import type { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { deactivationProblem } from "@/lib/auth/deactivation";
import { formatDate } from "@/lib/listings";
import { deactivateUser, reactivateUser } from "./actions";

export const metadata = { title: "Users | PathRwanda" };

const ROLE_LABEL: Record<Role, string> = {
  YOUTH: "Youth",
  ORGANIZATION: "Organization",
  TRAINING_PROVIDER: "Training provider",
  ADMIN: "Admin",
};
const ROLES = Object.keys(ROLE_LABEL) as Role[];

const PAGE_SIZE = 50;

type SearchParams = Promise<{ q?: string; role?: string }>;

function UserButton({
  action,
  userId,
  label,
}: {
  action: (formData: FormData) => Promise<void>;
  userId: string;
  label: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="userId" value={userId} />
      <button
        type="submit"
        className="rounded border border-zinc-300 px-3 py-1 text-sm dark:border-zinc-700"
      >
        {label}
      </button>
    </form>
  );
}

export default async function AdminUsersPage({ searchParams }: { searchParams: SearchParams }) {
  const admin = await requireRole("ADMIN");
  const { q, role } = await searchParams;
  const query = q?.trim().slice(0, 100);
  const roleFilter = ROLES.find((r) => r === role);

  const users = await db.user.findMany({
    where: {
      ...(roleFilter ? { role: roleFilter } : {}),
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" as const } },
              { email: { contains: query, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
    include: { organization: { select: { name: true, status: true } } },
  });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <Link href="/admin" className="text-sm underline">
        Administration
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-semibold">Users</h1>

      <form method="get" className="mb-6 grid gap-3 sm:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium">Search name or email</span>
          <input
            type="search"
            name="q"
            defaultValue={query}
            className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Role</span>
          <select
            name="role"
            defaultValue={roleFilter ?? ""}
            className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
          >
            <option value="">All roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-md bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800"
          >
            Search
          </button>
        </div>
      </form>

      {users.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">No users match your search.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {users.map((user) => (
            <li
              key={user.id}
              className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-medium">{user.name}</h2>
                <div className="flex gap-2">
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">
                    {ROLE_LABEL[user.role]}
                  </span>
                  {user.deactivatedAt && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800">
                      Deactivated
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {user.email} · joined {formatDate(user.createdAt)}
                {user.organization
                  ? ` · ${user.organization.name} (${user.organization.status.toLowerCase()})`
                  : ""}
              </p>
              {user.deactivatedAt ? (
                <div>
                  <UserButton action={reactivateUser} userId={user.id} label="Reactivate" />
                </div>
              ) : (
                !deactivationProblem(admin.id, user) && (
                  <div>
                    <UserButton action={deactivateUser} userId={user.id} label="Deactivate" />
                  </div>
                )
              )}
            </li>
          ))}
        </ul>
      )}
      {users.length === PAGE_SIZE && (
        <p className="mt-4 text-sm text-zinc-500">
          Showing the newest {PAGE_SIZE}. Search to narrow the list.
        </p>
      )}
    </main>
  );
}
