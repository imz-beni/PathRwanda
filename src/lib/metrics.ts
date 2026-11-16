// The MVP hypothesis from the SRS: among registered young users, at least 60% follow Agritech,
// at least 40% click through to a linked course, and at least 30% view a matched opportunity.
export const HYPOTHESIS_TARGETS = [
  { key: "followed", label: "Followed Agritech", target: 60 },
  { key: "clickedCourse", label: "Clicked through to a course", target: 40 },
  { key: "viewedMatch", label: "Opened a recommended opportunity", target: 30 },
] as const;

export type HypothesisKey = (typeof HYPOTHESIS_TARGETS)[number]["key"];

export type HypothesisResult = {
  key: HypothesisKey;
  label: string;
  target: number;
  users: number;
  percent: number;
  met: boolean;
};

// Turns "how many users did each thing" into percentages against the targets. With no
// registered users yet, every result is 0% and not met, never a division by zero.
export function hypothesisResults(
  totalUsers: number,
  counts: Record<HypothesisKey, number>,
): HypothesisResult[] {
  return HYPOTHESIS_TARGETS.map(({ key, label, target }) => {
    const users = Math.min(counts[key], totalUsers);
    const percent = totalUsers > 0 ? Math.round((users / totalUsers) * 100) : 0;
    return { key, label, target, users, percent, met: totalUsers > 0 && percent >= target };
  });
}
