import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { createCourse } from "../../../actions";
import { CourseForm } from "../../CourseForm";

export const metadata = { title: "Add course | PathRwanda" };

export default async function NewCoursePage({ params }: { params: Promise<{ slug: string }> }) {
  await requireRole("ADMIN");
  const { slug } = await params;
  const sector = await db.sector.findUnique({ where: { slug } });
  if (!sector) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <Link href={`/admin/sectors/${sector.slug}`} className="text-sm underline">
        {sector.name}
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-semibold">Add course</h1>
      <CourseForm action={createCourse.bind(null, sector.id)} submitLabel="Add course" />
    </main>
  );
}
