import Link from "next/link";
import { logout } from "@/app/(auth)/login/actions";
import { getCurrentUser } from "@/lib/auth/dal";
import { getRecommendations } from "@/lib/matching/recommend";
import { strings } from "@/lib/strings";

const linkClass = "rounded px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800";

export async function Header() {
  const user = await getCurrentUser();
  const { nav, appName } = strings;
  // The in-app alert (FR-5.7): how many new listings match this young user closely.
  const newMatches =
    user?.role === "YOUTH" ? (await getRecommendations(user.id)).newMatches.length : 0;

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="text-lg font-semibold">
          {appName}
        </Link>
        <nav aria-label="Main" className="flex flex-wrap items-center gap-1 text-sm">
          <Link href="/sectors" className={linkClass}>
            {nav.sectors}
          </Link>
          <Link href="/opportunities" className={linkClass}>
            {nav.opportunities}
          </Link>
          {user?.role === "YOUTH" && (
            <>
              <Link href="/recommendations" className={linkClass}>
                {nav.recommendations}
                {newMatches > 0 && (
                  <span className="ml-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-xs font-medium text-black">
                    {newMatches}
                    <span className="sr-only"> new</span>
                  </span>
                )}
              </Link>
              <Link href="/saved" className={linkClass}>
                {nav.saved}
              </Link>
              <Link href="/progress" className={linkClass}>
                {nav.progress}
              </Link>
              <Link href="/profile" className={linkClass}>
                {nav.profile}
              </Link>
            </>
          )}
          {user && user.role !== "YOUTH" && (
            <Link href="/dashboard" className={linkClass}>
              {nav.dashboard}
            </Link>
          )}
          {user?.role === "ADMIN" && (
            <Link href="/admin" className={linkClass}>
              {nav.admin}
            </Link>
          )}
          {user ? (
            <form action={logout}>
              <button type="submit" className={linkClass}>
                {nav.logout}
              </button>
            </form>
          ) : (
            <>
              <Link href="/login" className={linkClass}>
                {nav.login}
              </Link>
              <Link
                href="/register"
                className="rounded bg-emerald-700 px-3 py-1 text-white hover:bg-emerald-800"
              >
                {nav.register}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
