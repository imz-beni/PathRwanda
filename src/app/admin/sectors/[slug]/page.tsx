import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { formatDate } from "@/lib/listings";
import { deleteCourse, setCourseVisibility } from "../actions";
import { RecheckAllButton, RecheckLinkButton } from "./LinkCheckButtons";
import { SectorForm } from "./SectorForm";

type Props = { params: Promise<{ slug: string }> };

export const metadata = { title: "Edit sector | PathRwanda" };

// "Re-check all links" waits up to 10 seconds per course, so give the page's actions more
// time than a hosting platform's short default.
export const maxDuration = 60;

function CourseButton({
  action,
  courseId,
  label,
  extra,
}: {
  action: (formData: FormData) => Promise<void>;
  courseId: string;
  label: string;
  extra?: Record<string, string>;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="courseId" value={courseId} />
      {extra &&
        Object.entries(extra).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
      <button type="submit" className="btn btn-secondary btn-sm">
        {label}
      </button>
    </form>
  );
}

export default async function AdminSectorPage({ params }: Props) {
  await requireRole("ADMIN");
  const { slug } = await params;
  const sector = await db.sector.findUnique({
    where: { slug },
    include: {
      courses: {
        orderBy: { title: "asc" },
        include: { _count: { select: { progress: true } } },
      },
      _count: { select: { pathways: true, skills: true } },
    },
  });
  if (!sector) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <Link href="/admin/sectors" className="text-sm underline">
        Sectors and courses
      </Link>
      <h1 className="mt-3 mb-1 text-3xl font-semibold">{sector.name}</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Public page:{" "}
        <Link href={`/sectors/${sector.slug}`} className="underline">
          /sectors/{sector.slug}
        </Link>
      </p>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-medium">Sector details</h2>
        <SectorForm
          sectorId={sector.id}
          name={sector.name}
          overview={sector.overview}
          status={sector.status}
        />
      </section>

      <section aria-labelledby="structure" className="mb-10">
        <h2 id="structure" className="mb-3 text-lg font-medium">
          Pathways and skills
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/sectors/${sector.slug}/pathways`}
            className="btn btn-secondary btn-sm"
          >
            Career pathways ({sector._count.pathways})
          </Link>
          <Link href={`/admin/sectors/${sector.slug}/skills`} className="btn btn-secondary btn-sm">
            Skills ({sector._count.skills})
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-medium">Courses ({sector.courses.length})</h2>
          <Link
            href={`/admin/sectors/${sector.slug}/courses/new`}
            className="btn btn-primary btn-sm"
          >
            Add course
          </Link>
        </div>
        {sector.courses.length > 0 && (
          <div className="mb-4">
            <RecheckAllButton sectorId={sector.id} />
          </div>
        )}
        {sector.courses.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">This sector has no courses yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {sector.courses.map((course) => {
              const learners = course._count.progress;
              return (
                <li key={course.id} className="flex flex-col gap-2 card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-medium">{course.title}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        course.linkActive
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {course.linkActive ? "Shown" : "Hidden"}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {course.provider} · {course.isFree ? "Free" : "Fees may apply"} ·{" "}
                    {course.checkedAt
                      ? `link checked ${formatDate(course.checkedAt)}`
                      : "link not checked"}{" "}
                    · {learners} {learners === 1 ? "learner" : "learners"}
                  </p>
                  <p className="text-sm break-all">
                    <a
                      href={course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {course.url}
                    </a>
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/sectors/${sector.slug}/courses/${course.id}/edit`}
                      className="btn btn-secondary btn-sm"
                    >
                      Edit
                    </Link>
                    <CourseButton
                      action={setCourseVisibility}
                      courseId={course.id}
                      label={course.linkActive ? "Hide" : "Show"}
                      extra={{ visible: String(!course.linkActive) }}
                    />
                    {learners === 0 && (
                      <CourseButton action={deleteCourse} courseId={course.id} label="Delete" />
                    )}
                  </div>
                  <RecheckLinkButton courseId={course.id} />
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-4 text-sm text-zinc-500">
          Hidden courses are not shown to learners. Courses that learners have started can be hidden
          but not deleted, so their progress is kept.
        </p>
      </section>
    </main>
  );
}
