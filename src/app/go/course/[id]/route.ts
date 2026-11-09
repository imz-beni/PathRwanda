import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/dal";
import { recordEvent } from "@/lib/events";

// Course links go through here so a click can be counted before sending the user to the external site.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await db.course.findUnique({
    where: { id },
    include: { sector: { select: { slug: true } } },
  });
  if (!course) return new NextResponse("Course not found", { status: 404 });
  // A hidden course may have a dead link, so old bookmarks go back to the sector page instead.
  if (!course.linkActive) {
    return NextResponse.redirect(new URL(`/sectors/${course.sector.slug}`, request.url));
  }

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
