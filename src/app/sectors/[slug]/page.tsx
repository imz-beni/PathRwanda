import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/dal";
import { CourseCard } from "@/components/CourseCard";
import { FollowButton } from "@/components/FollowButton";
import type { CourseStatus } from "@/lib/progress";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const sector = await db.sector.findUnique({ where: { slug } });
  return { title: `${sector?.name ?? "Sector"} | PathRwanda` };
}

export default async function SectorPage({ params }: Props) {
  const { slug } = await params;
  const sector = await db.sector.findUnique({
    where: { slug },
    include: {
      pathways: { orderBy: { title: "asc" }, include: { skills: { orderBy: { name: "asc" } } } },
      skills: { orderBy: { name: "asc" } },
      courses: { orderBy: [{ isFree: "desc" }, { title: "asc" }] },
    },
  });
  if (!sector) notFound();

  const user = await getCurrentUser();
  const isYouth = user?.role === "YOUTH";

  const [follow, progress] = isYouth
    ? await Promise.all([
        db.sectorFollow.findUnique({
          where: { userId_sectorId: { userId: user.id, sectorId: sector.id } },
        }),
        db.courseProgress.findMany({ where: { userId: user.id, course: { sectorId: sector.id } } }),
      ])
    : [null, []];
  const statuses = new Map<string, CourseStatus>(progress.map((p) => [p.courseId, p.status]));

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <Link href="/sectors" className="text-sm underline">
        All sectors
      </Link>
      <h1 className="mt-3 mb-2 text-2xl font-semibold">{sector.name}</h1>
      <p className="mb-4 text-zinc-600 dark:text-zinc-400">{sector.overview}</p>
      <div className="mb-8">
        <FollowButton
          sectorId={sector.id}
          sectorPath={`/sectors/${sector.slug}`}
          user={user}
          following={!!follow}
        />
      </div>

      {sector.status === "COMING_SOON" ? (
        <p className="rounded-md bg-zinc-100 p-4 dark:bg-zinc-900">
          We are still building this sector. You can follow it to show your interest. Agritech is
          available now.
        </p>
      ) : (
        <div className="flex flex-col gap-10">
          <section aria-labelledby="pathways">
            <h2 id="pathways" className="mb-3 text-lg font-medium">
              Career pathways
            </h2>
            <ul className="flex flex-col gap-3">
              {sector.pathways.map((pathway) => (
                <li
                  key={pathway.id}
                  className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
                >
                  <h3 className="font-medium">{pathway.title}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{pathway.description}</p>
                  {pathway.incomeNote && (
                    <p className="mt-1 text-sm">Typical income: {pathway.incomeNote}</p>
                  )}
                  {pathway.skills.length > 0 && (
                    <p className="mt-2 text-sm">
                      <span className="font-medium">Skills you need: </span>
                      {pathway.skills.map((s) => s.name).join(", ")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="skills">
            <h2 id="skills" className="mb-3 text-lg font-medium">
              Skills in this sector
            </h2>
            <ul className="flex flex-wrap gap-2">
              {sector.skills.map((skill) => (
                <li
                  key={skill.id}
                  className="rounded-full bg-zinc-100 px-3 py-1 text-sm dark:bg-zinc-800"
                >
                  {skill.name}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="learn">
            <h2 id="learn" className="mb-1 text-lg font-medium">
              Where to learn
            </h2>
            <p className="mb-3 text-sm text-zinc-500">
              These courses are run by other organizations. PathRwanda links to them but does not
              host them.
            </p>
            {!user && (
              <p className="mb-3 text-sm">
                <Link
                  href={`/login?next=${encodeURIComponent(`/sectors/${sector.slug}`)}`}
                  className="font-medium underline"
                >
                  Log in
                </Link>{" "}
                to track your progress.
              </p>
            )}
            <ul className="flex flex-col gap-3">
              {sector.courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  status={statuses.get(course.id)}
                  user={user}
                />
              ))}
            </ul>
          </section>
        </div>
      )}
    </main>
  );
}
