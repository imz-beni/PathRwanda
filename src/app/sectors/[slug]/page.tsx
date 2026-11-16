import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/dal";
import { CourseCard } from "@/components/CourseCard";
import { FollowButton } from "@/components/FollowButton";
import { Hills } from "@/components/Hills";
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
      // Hidden courses (broken links or hidden by an admin) are not shown to learners.
      courses: { where: { linkActive: true }, orderBy: [{ isFree: "desc" }, { title: "asc" }] },
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
    <main className="flex-1">
      <section className="forest relative overflow-hidden">
        <Hills />
        <div className="relative mx-auto flex max-w-4xl flex-col gap-4 px-4 py-14">
          <Link href="/sectors" className="forest-muted text-sm hover:text-white hover:underline">
            ← All sectors
          </Link>
          <p className="eyebrow">Sector</p>
          <h1 className="text-5xl sm:text-6xl">{sector.name}</h1>
          <p className="forest-muted max-w-2xl text-lg leading-relaxed">{sector.overview}</p>
          {sector.status === "LIVE" && (
            <ul className="forest-muted flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <li>{sector.pathways.length} career pathways</li>
              <li>{sector.skills.length} skills</li>
              <li>{sector.courses.length} courses</li>
            </ul>
          )}
          <div className="pt-2">
            <FollowButton
              sectorId={sector.id}
              sectorPath={`/sectors/${sector.slug}`}
              user={user}
              following={!!follow}
            />
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-4xl px-4 py-12">
        {sector.status === "COMING_SOON" ? (
          <p className="notice">
            We are still building this sector. You can follow it to show your interest. Agritech is
            available now.
          </p>
        ) : (
          <div className="flex flex-col gap-14">
            <section aria-labelledby="pathways">
              <h2 id="pathways" className="font-display mb-4 text-3xl font-medium tracking-tight">
                Career pathways
              </h2>
              <ul className="grid gap-4 sm:grid-cols-2">
                {sector.pathways.map((pathway) => (
                  <li key={pathway.id} className="card flex flex-col gap-1 p-5">
                    <h3 className="text-lg font-semibold">{pathway.title}</h3>
                    <p className="text-sm leading-relaxed text-muted">{pathway.description}</p>
                    {pathway.incomeNote && (
                      <p className="mt-1 text-sm">Typical income: {pathway.incomeNote}</p>
                    )}
                    {pathway.skills.length > 0 && (
                      <div className="mt-auto pt-3">
                        <p className="mb-1.5 text-xs font-semibold tracking-wide text-muted uppercase">
                          Skills you need
                        </p>
                        <ul className="flex flex-wrap gap-1.5">
                          {pathway.skills.map((skill) => (
                            <li key={skill.id} className="badge">
                              {skill.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="skills">
              <h2 id="skills" className="font-display mb-4 text-3xl font-medium tracking-tight">
                Skills in this sector
              </h2>
              <ul className="flex flex-wrap gap-2">
                {sector.skills.map((skill) => (
                  <li key={skill.id} className="chip">
                    {skill.name}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="learn">
              <h2 id="learn" className="font-display mb-2 text-3xl font-medium tracking-tight">
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
      </div>
    </main>
  );
}
