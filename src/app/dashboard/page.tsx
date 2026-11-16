import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { activeListingWhere } from "@/lib/listings";

export const metadata = { title: "Dashboard | PathRwanda" };

export default async function DashboardPage() {
  const user = await requireRole("ORGANIZATION", "TRAINING_PROVIDER", "ADMIN");
  const organization =
    user.role === "ADMIN"
      ? null
      : await db.organization.findUnique({ where: { ownerId: user.id } });

  const approved = organization?.status === "APPROVED";
  const [openListings, allListings] = approved
    ? await Promise.all([
        db.listing.count({ where: { organizationId: organization.id, ...activeListingWhere() } }),
        db.listing.count({
          where: { organizationId: organization.id, status: { not: "REMOVED" } },
        }),
      ])
    : [0, 0];

  const actions = [
    {
      href: "/dashboard/listings",
      title: "My listings",
      text: "Edit, close, reopen or remove what you have published.",
    },
    {
      href: "/dashboard/listings/new",
      title: "Create a listing",
      text: "Publish a job, a training course or a program.",
    },
    {
      href: "/dashboard/organization",
      title: "Organization profile",
      text: "Update your organization's name, type and website.",
    },
  ];

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
      <p className="eyebrow">Dashboard</p>
      <h1 className="mt-1 mb-2 text-3xl font-semibold">Welcome, {user.name}</h1>
      {organization && <p className="mb-6 text-muted">{organization.name}</p>}

      {organization?.status === "PENDING" && (
        <p className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
          {organization.name} is waiting for approval by an administrator. You will be able to
          publish listings once it is approved.
        </p>
      )}

      {approved && (
        <>
          <dl className="mb-6 grid grid-cols-2 gap-4 sm:max-w-md">
            <div className="card flex flex-col-reverse p-4">
              <dt className="text-sm text-muted">open listings</dt>
              <dd className="text-3xl font-semibold tracking-tight">{openListings}</dd>
            </div>
            <div className="card flex flex-col-reverse p-4">
              <dt className="text-sm text-muted">listings in total</dt>
              <dd className="text-3xl font-semibold tracking-tight">{allListings}</dd>
            </div>
          </dl>
          <ul className="grid gap-4 sm:grid-cols-3">
            {actions.map((action) => (
              <li key={action.href}>
                <Link href={action.href} className="card card-link flex h-full flex-col gap-2 p-5">
                  <span className="text-lg font-medium">{action.title}</span>
                  <span className="text-sm text-muted">{action.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      {organization?.status === "REJECTED" && (
        <p className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          Your organization was not approved. Please contact support.
        </p>
      )}

      {user.role === "ADMIN" && (
        <Link href="/admin" className="btn btn-primary">
          Go to administration
        </Link>
      )}
    </main>
  );
}
