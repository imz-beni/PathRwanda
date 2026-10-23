import { db } from "@/lib/db";
import type { CourseStatus } from "@/lib/progress";

export type MatchingInputs = {
  followedSectorIds: string[];
  skillIds: string[];
  courseProgress: { courseId: string; sectorId: string; status: CourseStatus }[];
};

// Everything the matcher (week 6) needs to know about a user, gathered in one place (FR-3.9, FR-5.2, FR-5.3).
export async function getMatchingInputs(userId: string): Promise<MatchingInputs> {
  const [follows, profile, progress] = await Promise.all([
    db.sectorFollow.findMany({ where: { userId }, select: { sectorId: true } }),
    db.profile.findUnique({ where: { userId }, select: { skills: { select: { id: true } } } }),
    db.courseProgress.findMany({
      where: { userId },
      select: { courseId: true, status: true, course: { select: { sectorId: true } } },
    }),
  ]);

  return {
    followedSectorIds: follows.map((f) => f.sectorId),
    skillIds: profile?.skills.map((s) => s.id) ?? [],
    courseProgress: progress.map((p) => ({
      courseId: p.courseId,
      sectorId: p.course.sectorId,
      status: p.status,
    })),
  };
}
