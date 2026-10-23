import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { SubmitButton } from "@/components/SubmitButton";
import { saveSkills } from "./actions";

export const metadata = { title: "My profile | PathRwanda" };

export default async function ProfilePage() {
  const user = await requireRole("YOUTH");

  const [sectors, profile] = await Promise.all([
    db.sector.findMany({
      where: { status: "LIVE" },
      orderBy: { sortOrder: "asc" },
      include: { skills: { orderBy: { name: "asc" } } },
    }),
    db.profile.findUnique({
      where: { userId: user.id },
      include: { skills: { select: { id: true } } },
    }),
  ]);
  const mine = new Set(profile?.skills.map((s) => s.id));

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold">My profile</h1>
      <p className="mb-6 text-zinc-600 dark:text-zinc-400">
        Tick the skills you already have. We use them, together with the sectors you follow and the
        courses you complete, to suggest opportunities. Only you can see this page.
      </p>

      <form action={saveSkills} className="flex flex-col gap-6">
        {sectors.map((sector) => (
          <fieldset key={sector.id} className="flex flex-col gap-2">
            <legend className="mb-1 text-lg font-medium">{sector.name} skills</legend>
            {sector.skills.map((skill) => (
              <label key={skill.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="skillId"
                  value={skill.id}
                  defaultChecked={mine.has(skill.id)}
                />
                <span>{skill.name}</span>
              </label>
            ))}
          </fieldset>
        ))}
        <div>
          <SubmitButton pendingText="Saving...">Save skills</SubmitButton>
        </div>
      </form>
    </main>
  );
}
