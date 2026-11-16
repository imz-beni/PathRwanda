import Link from "next/link";
import { toggleFollow } from "@/app/sectors/[slug]/actions";
import type { CurrentUser } from "@/lib/auth/dal";

type Props = { sectorId: string; sectorPath: string; user: CurrentUser | null; following: boolean };

export function FollowButton({ sectorId, sectorPath, user, following }: Props) {
  if (!user) {
    return (
      <Link href={`/login?next=${encodeURIComponent(sectorPath)}`} className="btn btn-primary">
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
            ? "btn btn-secondary border-emerald-700 text-emerald-800 dark:text-emerald-300"
            : "btn btn-primary"
        }
      >
        {following ? "Following (click to unfollow)" : "Follow this sector"}
      </button>
    </form>
  );
}
