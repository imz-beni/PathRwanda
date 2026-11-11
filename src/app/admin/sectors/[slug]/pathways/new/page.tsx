import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { createPathway } from "../../../structure-actions";
import { PathwayForm } from "../PathwayForm";

export const metadata = { title: "Add pathway | PathRwanda" };

export default async function NewPathwayPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireRole("ADMIN");
  const { slug } = await params;
  const sector = await db.sector.findUnique({
    where: { slug },
    include: { skills: { orderBy: { name: "asc" }, select: { id: true, name: true } } },
  });
  if (!sector) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <Link href={`/admin/sectors/${sector.slug}/pathways`} className="text-sm underline">
        {sector.name} pathways
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-semibold">Add pathway</h1>
      <PathwayForm
        action={createPathway.bind(null, sector.id)}
        skills={sector.skills}
        submitLabel="Add pathway"
      />
    </main>
  );
}
