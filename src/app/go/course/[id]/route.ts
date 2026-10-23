import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/dal";
import { recordEvent } from "@/lib/events";

// Course links go through here so a click can be counted before sending the user to the external site.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await db.course.findUnique({ where: { id } });
  if (!course) return new NextResponse("Course not found", { status: 404 });

  const user = await getCurrentUser();
  await recordEvent({
    type: "COURSE_LINK_CLICKED",
    userId: user?.id,
    courseId: course.id,
    sectorId: course.sectorId,
  });

  // The target comes from our own database, never from the request.
  return NextResponse.redirect(course.url);
}
