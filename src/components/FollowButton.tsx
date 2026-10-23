import Link from "next/link";
import { toggleFollow } from "@/app/sectors/[slug]/actions";
import type { CurrentUser } from "@/lib/auth/dal";

type Props = { sectorId: string; sectorPath: string; user: CurrentUser | null; following: boolean };

export function FollowButton({ sectorId, sectorPath, user, following }: Props) {
  if (!user) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(sectorPath)}`}
        className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
      >
        Log in to follow this sector
      </Link>
    );
  }
  if (user.role !== "YOUTH") return null;

  return (
    <form action={toggleFollow}>
      <input type="hidden" name="sectorId" value={sectorId} />
      <button
        type="submit"
        aria-pressed={following}
        className={
          following
            ? "rounded-md border border-emerald-700 px-4 py-2 text-sm font-medium text-emerald-800 dark:text-emerald-300"
            : "rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        }
      >
        {following ? "Following (click to unfollow)" : "Follow this sector"}
      </button>
    </form>
  );
}
