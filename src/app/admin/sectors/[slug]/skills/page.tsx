import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { deleteSkill } from "../../structure-actions";
import { AddSkillForm, RenameSkillForm } from "./SkillForms";

type Props = { params: Promise<{ slug: string }> };

export const metadata = { title: "Skills | PathRwanda" };

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export default async function AdminSkillsPage({ params }: Props) {
  await requireRole("ADMIN");
  const { slug } = await params;
  const sector = await db.sector.findUnique({
    where: { slug },
    include: {
      skills: {
        orderBy: { name: "asc" },
        include: { _count: { select: { pathways: true, profiles: true, listings: true } } },
      },
    },
  });
  if (!sector) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <Link href={`/admin/sectors/${sector.slug}`} className="text-sm underline">
        {sector.name}
      </Link>
      <h1 className="mt-3 mb-2 text-2xl font-semibold">Skills ({sector.skills.length})</h1>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
        Learners pick these skills on their profile, and organizations pick them for listings.
        Renaming a skill updates it everywhere.
      </p>

      <section aria-labelledby="add-skill" className="mb-8">
        <h2 id="add-skill" className="mb-2 text-lg font-medium">
          Add a skill
        </h2>
        <AddSkillForm sectorId={sector.id} />
      </section>

      {sector.skills.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">This sector has no skills yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {sector.skills.map((skill) => {
            const { pathways, profiles, listings } = skill._count;
            const inUse = profiles > 0 || listings > 0;
            return (
              <li
                key={skill.id}
                className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <RenameSkillForm skillId={skill.id} name={skill.name} />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {plural(pathways, "pathway")} · {plural(profiles, "learner")} ·{" "}
                    {plural(listings, "listing")}
                  </p>
                  {!inUse && (
                    <form action={deleteSkill}>
                      <input type="hidden" name="skillId" value={skill.id} />
                      <button
                        type="submit"
                        className="rounded border border-zinc-300 px-3 py-1 text-sm dark:border-zinc-700"
                      >
                        Delete
                      </button>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-4 text-sm text-zinc-500">
        Skills that learners or listings use cannot be deleted, so nobody&apos;s profile or matches
        change without warning. Deleting a skill removes it from pathways.
      </p>
    </main>
  );
}
