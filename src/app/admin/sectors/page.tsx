import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { SECTOR_STATUS_LABEL } from "@/lib/validation/content";

export const metadata = { title: "Sectors and courses | PathRwanda" };

export default async function AdminSectorsPage() {
  await requireRole("ADMIN");
  const sectors = await db.sector.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { pathways: true, skills: true, courses: true } },
      courses: { where: { linkActive: false }, select: { id: true } },
    },
  });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <Link href="/admin" className="text-sm underline">
        Administration
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-semibold">Sectors and courses</h1>
      <ul className="flex flex-col gap-3">
        {sectors.map((sector) => (
          <li
            key={sector.id}
            className="flex flex-col gap-1 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-medium">
                <Link href={`/admin/sectors/${sector.slug}`} className="underline">
                  {sector.name}
                </Link>
              </h2>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">
                {SECTOR_STATUS_LABEL[sector.status]}
              </span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {sector._count.pathways} pathways · {sector._count.skills} skills ·{" "}
              {sector._count.courses} courses
              {sector.courses.length > 0 ? ` (${sector.courses.length} hidden)` : ""}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
