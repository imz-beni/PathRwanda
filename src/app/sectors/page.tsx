import Link from "next/link";
import { db } from "@/lib/db";

export const metadata = { title: "Sectors | PathRwanda" };

export default async function SectorsPage() {
  const sectors = await db.sector.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <h1 className="mb-2 text-3xl font-semibold">Explore sectors</h1>
      <p className="mb-6 text-zinc-600 dark:text-zinc-400">
        Pick a sector to learn about careers, skills and ways to get started.
      </p>
      <ul className="grid gap-4 sm:grid-cols-2">
        {sectors.map((sector) => (
          <li key={sector.id}>
            <Link
              href={`/sectors/${sector.slug}`}
              className="flex h-full flex-col gap-2 card card-link p-4"
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-lg font-medium">{sector.name}</span>
                {sector.status === "COMING_SOON" && <span className="badge">Coming soon</span>}
              </span>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">{sector.overview}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
