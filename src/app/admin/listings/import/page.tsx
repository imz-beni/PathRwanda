import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { MAX_IMPORT_BYTES, MAX_IMPORT_ROWS } from "@/lib/listing-import";
import { ImportForm } from "./ImportForm";

export const metadata = { title: "Import listings | PathRwanda" };

const COLUMNS: { name: string; help: string; optional?: boolean }[] = [
  { name: "title", help: "At least 5 characters." },
  { name: "type", help: "JOB, TRAINING or PROGRAM." },
  {
    name: "sectors",
    help: "A sector's short name, like agritech. Separate several with a semicolon (;).",
  },
  { name: "description", help: "At least 20 characters." },
  { name: "applyInfo", help: "How to apply or register." },
  { name: "closesAt", help: "The closing date as year-month-day, like 2027-01-31." },
  { name: "requirements", help: "What applicants need.", optional: true },
  { name: "location", help: "A district or town.", optional: true },
  {
    name: "skills",
    help: "Skill names from the listing's sectors, separated by a semicolon (;).",
    optional: true,
  },
];

export default async function ImportListingsPage() {
  await requireRole("ADMIN");
  const [organizations, sectors] = await Promise.all([
    db.organization.findMany({
      where: { status: "APPROVED" },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    db.sector.findMany({ orderBy: { sortOrder: "asc" }, select: { slug: true, name: true } }),
  ]);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <Link href="/admin/listings" className="text-sm underline">
        All listings
      </Link>
      <h1 className="mt-3 mb-2 text-2xl font-semibold">Import listings</h1>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
        Add many listings at once from a CSV file, which any spreadsheet program can save. If any
        row has a problem, nothing is imported and you see what to fix.
      </p>

      {organizations.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          There are no approved organizations yet.{" "}
          <Link href="/admin/organizations" className="font-medium underline">
            Review organizations
          </Link>
        </p>
      ) : (
        <ImportForm organizations={organizations} />
      )}

      <section aria-labelledby="format" className="mt-10">
        <h2 id="format" className="mb-2 text-lg font-medium">
          File format
        </h2>
        <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
          The first row holds the column names below, in any order. A file can hold up to{" "}
          {MAX_IMPORT_ROWS} listings and {MAX_IMPORT_BYTES / 1024} KB.{" "}
          <a href="/listing-import-template.csv" download className="font-medium underline">
            Download a template
          </a>
        </p>
        <ul className="flex flex-col gap-1 text-sm">
          {COLUMNS.map((column) => (
            <li key={column.name}>
              <code className="font-medium">{column.name}</code>
              {column.optional ? " (optional)" : ""}: {column.help}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          Sector short names: {sectors.map((s) => `${s.slug} (${s.name})`).join(", ")}.
        </p>
      </section>
    </main>
  );
}
