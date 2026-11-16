import { setCourseProgress } from "@/app/sectors/[slug]/actions";
import type { CurrentUser } from "@/lib/auth/dal";
import type { CourseStatus } from "@/lib/progress";

type Course = {
  id: string;
  title: string;
  provider: string;
  description: string | null;
  isFree: boolean;
};

const STATUS_LABEL: Record<CourseStatus, string> = {
  STARTED: "In progress",
  COMPLETED: "Completed",
};

function ProgressButton({
  courseId,
  action,
  label,
}: {
  courseId: string;
  action: string;
  label: string;
}) {
  return (
    <form action={setCourseProgress}>
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="action" value={action} />
      <button type="submit" className="btn btn-secondary btn-sm">
        {label}
      </button>
    </form>
  );
}

export function CourseCard({
  course,
  status,
  user,
}: {
  course: Course;
  status?: CourseStatus;
  user: CurrentUser | null;
}) {
  return (
    <li className="flex flex-col gap-2 card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-medium">{course.title}</h3>
        <span className="badge">{course.isFree ? "Free" : "Fees may apply"}</span>
      </div>
      <p className="text-sm text-zinc-500">{course.provider}</p>
      {course.description && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{course.description}</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={`/go/course/${course.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-sm"
        >
          Open course (new tab)
        </a>
        {user?.role === "YOUTH" && (
          <>
            {status && <span className="text-sm font-medium">{STATUS_LABEL[status]}</span>}
            {status !== "STARTED" && status !== "COMPLETED" && (
              <ProgressButton courseId={course.id} action="STARTED" label="Mark as started" />
            )}
            {status !== "COMPLETED" && (
              <ProgressButton courseId={course.id} action="COMPLETED" label="Mark as completed" />
            )}
            {status && <ProgressButton courseId={course.id} action="NONE" label="Clear" />}
          </>
        )}
      </div>
    </li>
  );
}
