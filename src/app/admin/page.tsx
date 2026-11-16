import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { activeListingWhere } from "@/lib/listings";

export const metadata = { title: "Admin | PathRwanda" };

export default async function AdminPage() {
  const user = await requireRole("ADMIN");
  const [pendingOrganizations, openReports, openListings, users] = await Promise.all([
    db.organization.count({ where: { status: "PENDING" } }),
    db.listingReport.count({ where: { status: "OPEN" } }),
    db.listing.count({ where: activeListingWhere() }),
    db.user.count(),
  ]);

  // "attention" marks the cards that have something waiting for the admin.
  const sections = [
    {
      href: "/admin/organizations",
      title: "Review organizations",
      text: "Approve or reject employers, agencies and training providers.",
      count: `${pendingOrganizations} waiting`,
      attention: pendingOrganizations > 0,
    },
    {
      href: "/admin/reports",
      title: "Reported listings",
      text: "Read reports from users and remove listings that break the rules.",
      count: `${openReports} open`,
      attention: openReports > 0,
    },
    {
      href: "/admin/listings",
      title: "All listings",
      text: "See every listing, remove or restore one, or import many from a CSV file.",
      count: `${openListings} open`,
      attention: false,
    },
    {
      href: "/admin/users",
      title: "Users",
      text: "Search accounts and deactivate or reactivate them.",
      count: `${users} accounts`,
      attention: false,
    },
    {
      href: "/admin/sectors",
      title: "Sectors and courses",
      text: "Edit sectors, career pathways, skills and courses, and re-check course links.",
      count: null,
      attention: false,
    },
    {
      href: "/admin/metrics",
      title: "Results against the targets",
      text: "See how many young users follow, learn and open matches.",
      count: null,
      attention: false,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
      <p className="eyebrow">Administration</p>
      <h1 className="mt-1 mb-2 text-3xl font-semibold">Welcome, {user.name}</h1>
      <p className="mb-8 text-muted">Choose what to manage.</p>

      <ul className="grid gap-4 sm:grid-cols-2">
        {sections.map((section) => (
          <li key={section.href}>
            <Link href={section.href} className="card card-link flex h-full flex-col gap-2 p-5">
              <span className="flex flex-wrap items-start justify-between gap-2">
                <span className="text-lg font-medium">{section.title}</span>
                {section.count && (
                  <span
                    className={
                      section.attention
                        ? "badge bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100"
                        : "badge"
                    }
                  >
                    {section.count}
                  </span>
                )}
              </span>
              <span className="text-sm text-muted">{section.text}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
