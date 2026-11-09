import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { updateCourse } from "../../../../actions";
import { CourseForm } from "../../../CourseForm";

export const metadata = { title: "Edit course | PathRwanda" };

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  await requireRole("ADMIN");
  const { slug, id } = await params;
  const course = await db.course.findUnique({ where: { id }, include: { sector: true } });
  if (!course || course.sector.slug !== slug) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <Link href={`/admin/sectors/${course.sector.slug}`} className="text-sm underline">
        {course.sector.name}
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-semibold">Edit course</h1>
      <CourseForm
        action={updateCourse.bind(null, course.id)}
        submitLabel="Save changes"
        defaults={{
          title: course.title,
          provider: course.provider,
          url: course.url,
          description: course.description ?? "",
          isFree: course.isFree,
        }}
      />
    </main>
  );
}
