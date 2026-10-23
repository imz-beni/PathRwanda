export type CourseStatus = "STARTED" | "COMPLETED";

export const PROGRESS_ACTIONS = ["STARTED", "COMPLETED", "NONE"] as const;
export type ProgressAction = (typeof PROGRESS_ACTIONS)[number];

export function parseProgressAction(value: unknown): ProgressAction | null {
  return PROGRESS_ACTIONS.find((a) => a === value) ?? null;
}

export type ProgressSummary = {
  total: number;
  started: number;
  completed: number;
  percentComplete: number;
};

// Courses a user has no record for count as "not started".
export function summarizeProgress(
  courseIds: string[],
  statuses: Map<string, CourseStatus>,
): ProgressSummary {
  let started = 0;
  let completed = 0;
  for (const id of courseIds) {
    const status = statuses.get(id);
    if (status === "STARTED") started++;
    if (status === "COMPLETED") completed++;
  }
  const total = courseIds.length;
  return {
    total,
    started,
    completed,
    percentComplete: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}
