import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { approveOrganization, rejectOrganization } from "./actions";

export const metadata = { title: "Organizations | PathRwanda" };

const TYPE_LABEL = {
  EMPLOYER: "Employer",
  AGENCY: "Agency",
  TRAINING_PROVIDER: "Training provider",
};

function StatusButton({
  action,
  organizationId,
  label,
}: {
  action: (formData: FormData) => Promise<void>;
  organizationId: string;
  label: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="organizationId" value={organizationId} />
      <button
        type="submit"
        className="rounded border border-zinc-300 px-3 py-1 text-sm dark:border-zinc-700"
      >
        {label}
      </button>
    </form>
  );
}

export default async function AdminOrganizationsPage() {
  await requireRole("ADMIN");
  const organizations = await db.organization.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { owner: { select: { name: true, email: true } } },
  });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <Link href="/admin" className="text-sm underline">
        Administration
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-semibold">Organizations</h1>

      {organizations.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">No organizations have registered yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {organizations.map((org) => (
            <li
              key={org.id}
              className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-medium">{org.name}</h2>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">
                  {org.status}
                </span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {TYPE_LABEL[org.type]} · {org.owner.name} ({org.owner.email})
                {org.website ? ` · ${org.website}` : ""}
              </p>
              <div className="flex gap-2">
                {org.status !== "APPROVED" && (
                  <StatusButton
                    action={approveOrganization}
                    organizationId={org.id}
                    label="Approve"
                  />
                )}
                {org.status !== "REJECTED" && (
                  <StatusButton
                    action={rejectOrganization}
                    organizationId={org.id}
                    label="Reject"
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
