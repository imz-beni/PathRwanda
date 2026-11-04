import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { formatDate } from "@/lib/listings";
import { removeListingAsAdmin } from "../listings/actions";
import { dismissReport, resolveReport } from "./actions";

export const metadata = { title: "Reported listings | PathRwanda" };

const STATUS_LABEL = { OPEN: "Open", RESOLVED: "Resolved", DISMISSED: "Dismissed" };

function ActionButton({
  action,
  name,
  value,
  label,
}: {
  action: (formData: FormData) => Promise<void>;
  name: string;
  value: string;
  label: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name={name} value={value} />
      <button
        type="submit"
        className="rounded border border-zinc-300 px-3 py-1 text-sm dark:border-zinc-700"
      >
        {label}
      </button>
    </form>
  );
}

export default async function AdminReportsPage() {
  await requireRole("ADMIN");
  const include = {
    reporter: { select: { name: true, email: true } },
    listing: {
      select: {
        id: true,
        title: true,
        status: true,
        organization: { select: { name: true } },
      },
    },
  };
  const [open, handled] = await Promise.all([
    db.listingReport.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "asc" },
      include,
    }),
    db.listingReport.findMany({
      where: { status: { not: "OPEN" } },
      orderBy: { createdAt: "desc" },
      take: 20,
      include,
    }),
  ]);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <Link href="/admin" className="text-sm underline">
        Administration
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-semibold">Reported listings</h1>

      <h2 className="mb-3 text-lg font-medium">Open ({open.length})</h2>
      {open.length === 0 ? (
        <p className="mb-8 text-zinc-600 dark:text-zinc-400">There are no open reports.</p>
      ) : (
        <ul className="mb-8 flex flex-col gap-3">
          {open.map((report) => (
            <li
              key={report.id}
              className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-medium">
                  {report.listing.status === "REMOVED" ? (
                    report.listing.title
                  ) : (
                    <Link href={`/opportunities/${report.listing.id}`} className="underline">
                      {report.listing.title}
                    </Link>
                  )}
                </h3>
                <span className="text-xs text-zinc-500">{formatDate(report.createdAt)}</span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {report.listing.organization.name} · reported by {report.reporter.name} (
                {report.reporter.email})
              </p>
              <p className="whitespace-pre-line">{report.reason}</p>
              <div className="flex flex-wrap gap-2">
                {report.listing.status !== "REMOVED" && (
                  <ActionButton
                    action={removeListingAsAdmin}
                    name="listingId"
                    value={report.listing.id}
                    label="Remove listing"
                  />
                )}
                <ActionButton
                  action={resolveReport}
                  name="reportId"
                  value={report.id}
                  label="Mark resolved"
                />
                <ActionButton
                  action={dismissReport}
                  name="reportId"
                  value={report.id}
                  label="Dismiss"
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {handled.length > 0 && (
        <>
          <h2 className="mb-3 text-lg font-medium">Recently handled</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {handled.map((report) => (
              <li
                key={report.id}
                className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
              >
                <span className="font-medium">{report.listing.title}</span> ·{" "}
                {STATUS_LABEL[report.status]}
                {report.listing.status === "REMOVED" ? " · listing removed" : ""}
                <p className="text-zinc-600 dark:text-zinc-400">{report.reason}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
