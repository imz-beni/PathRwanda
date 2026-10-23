import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { CourseCard } from "@/components/CourseCard";
import { summarizeProgress, type CourseStatus } from "@/lib/progress";

export const metadata = { title: "My progress | PathRwanda" };

export default async function ProgressPage() {
  const user = await requireRole("YOUTH");

  const [sectors, progress, follows] = await Promise.all([
    db.sector.findMany({
      where: { status: "LIVE" },
      orderBy: { sortOrder: "asc" },
      include: { courses: { orderBy: { title: "asc" } } },
    }),
    db.courseProgress.findMany({ where: { userId: user.id } }),
    db.sectorFollow.findMany({ where: { userId: user.id }, include: { sector: true } }),
  ]);
  const statuses = new Map<string, CourseStatus>(progress.map((p) => [p.courseId, p.status]));

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold">My progress</h1>

      <section aria-labelledby="following" className="mb-8">
        <h2 id="following" className="mb-2 text-lg font-medium">
          Sectors you follow
        </h2>
        {follows.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">
            You are not following any sector yet.{" "}
            <Link href="/sectors" className="font-medium underline">
              Explore sectors
            </Link>
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {follows.map((f) => (
              <li key={f.sectorId}>
                <Link
                  href={`/sectors/${f.sector.slug}`}
                  className="rounded-full bg-zinc-100 px-3 py-1 text-sm dark:bg-zinc-800"
                >
                  {f.sector.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {sectors.map((sector) => {
        const summary = summarizeProgress(
          sector.courses.map((c) => c.id),
          statuses,
        );
        const tracked = sector.courses.filter((c) => statuses.has(c.id));
        return (
          <section key={sector.id} aria-labelledby={`s-${sector.slug}`} className="mb-8">
            <h2 id={`s-${sector.slug}`} className="mb-1 text-lg font-medium">
              {sector.name}
            </h2>
            <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
              {summary.completed} of {summary.total} courses completed ({summary.percentComplete}%),{" "}
              {summary.started} in progress.
            </p>
            <div
              role="progressbar"
              aria-valuenow={summary.percentComplete}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${sector.name} course progress`}
              className="mb-4 h-2 w-full rounded bg-zinc-200 dark:bg-zinc-800"
            >
              <div
                className="h-2 rounded bg-emerald-600"
                style={{ width: `${summary.percentComplete}%` }}
              />
            </div>
            {tracked.length === 0 ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                You have not started a course yet.{" "}
                <Link href={`/sectors/${sector.slug}`} className="font-medium underline">
                  Find a course
                </Link>
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {tracked.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    status={statuses.get(course.id)}
                    user={user}
                  />
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </main>
  );
}
