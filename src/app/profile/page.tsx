import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { SubmitButton } from "@/components/SubmitButton";
import { DISTRICTS, EDUCATION_LEVELS } from "@/lib/validation/profile";
import { saveProfile } from "./actions";

export const metadata = { title: "My profile | PathRwanda" };

const selectClass =
  "rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-base dark:border-zinc-700";

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

      <form action={saveProfile} className="flex flex-col gap-6">
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-1 text-lg font-medium">About you (optional)</legend>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">District where you live</span>
            <select name="district" defaultValue={profile?.district ?? ""} className={selectClass}>
              <option value="">Prefer not to say</option>
              {DISTRICTS.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Highest level of education</span>
            <select
              name="educationLevel"
              defaultValue={profile?.educationLevel ?? ""}
              className={selectClass}
            >
              <option value="">Prefer not to say</option>
              {EDUCATION_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>
          <p className="text-sm text-zinc-500 sm:col-span-2">
            These are not used for matching yet. They help us understand who PathRwanda is reaching.
          </p>
        </fieldset>

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
          <SubmitButton pendingText="Saving...">Save profile</SubmitButton>
        </div>
      </form>
    </main>
  );
}
