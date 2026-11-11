import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { updatePathway } from "../../../../structure-actions";
import { PathwayForm } from "../../PathwayForm";

export const metadata = { title: "Edit pathway | PathRwanda" };

export default async function EditPathwayPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  await requireRole("ADMIN");
  const { slug, id } = await params;
  const pathway = await db.careerPathway.findUnique({
    where: { id },
    include: {
      skills: { select: { id: true } },
      sector: {
        include: { skills: { orderBy: { name: "asc" }, select: { id: true, name: true } } },
      },
    },
  });
  if (!pathway || pathway.sector.slug !== slug) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <Link href={`/admin/sectors/${pathway.sector.slug}/pathways`} className="text-sm underline">
        {pathway.sector.name} pathways
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-semibold">Edit pathway</h1>
      <PathwayForm
        action={updatePathway.bind(null, pathway.id)}
        skills={pathway.sector.skills}
        submitLabel="Save changes"
        defaults={{
          title: pathway.title,
          description: pathway.description,
          incomeNote: pathway.incomeNote ?? "",
          skillIds: pathway.skills.map((s) => s.id),
        }}
      />
    </main>
  );
}
