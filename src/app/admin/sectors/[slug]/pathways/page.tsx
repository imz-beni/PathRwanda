import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { deletePathway } from "../../structure-actions";

type Props = { params: Promise<{ slug: string }> };

export const metadata = { title: "Career pathways | PathRwanda" };

export default async function AdminPathwaysPage({ params }: Props) {
  await requireRole("ADMIN");
  const { slug } = await params;
  const sector = await db.sector.findUnique({
    where: { slug },
    include: {
      pathways: {
        orderBy: { title: "asc" },
        include: { skills: { orderBy: { name: "asc" }, select: { name: true } } },
      },
    },
  });
  if (!sector) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <Link href={`/admin/sectors/${sector.slug}`} className="text-sm underline">
        {sector.name}
      </Link>
      <div className="mt-3 mb-6 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Career pathways ({sector.pathways.length})</h1>
        <Link
          href={`/admin/sectors/${sector.slug}/pathways/new`}
          className="rounded-md bg-emerald-700 px-3 py-1 text-sm font-medium text-white hover:bg-emerald-800"
        >
          Add pathway
        </Link>
      </div>

      {sector.pathways.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">This sector has no pathways yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {sector.pathways.map((pathway) => (
            <li
              key={pathway.id}
              className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <h2 className="font-medium">{pathway.title}</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{pathway.description}</p>
              {pathway.incomeNote && (
                <p className="text-sm">Typical income: {pathway.incomeNote}</p>
              )}
              <p className="text-sm">
                <span className="font-medium">Skills: </span>
                {pathway.skills.length > 0
                  ? pathway.skills.map((s) => s.name).join(", ")
                  : "none yet"}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/sectors/${sector.slug}/pathways/${pathway.id}/edit`}
                  className="rounded border border-zinc-300 px-3 py-1 text-sm dark:border-zinc-700"
                >
                  Edit
                </Link>
                <form action={deletePathway}>
                  <input type="hidden" name="pathwayId" value={pathway.id} />
                  <button
                    type="submit"
                    className="rounded border border-zinc-300 px-3 py-1 text-sm dark:border-zinc-700"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
