import Link from "next/link";
import { logout } from "@/app/(auth)/login/actions";
import { Logo } from "@/components/Logo";
import { NavLink } from "@/components/NavLink";
import { getCurrentUser } from "@/lib/auth/dal";
import { getRecommendations } from "@/lib/matching/recommend";
import { strings } from "@/lib/strings";

export async function Header() {
  const user = await getCurrentUser();
  const { nav, appName } = strings;
  // The in-app alert (FR-5.7): how many new listings match this young user closely.
  const newMatches =
    user?.role === "YOUTH" ? (await getRecommendations(user.id)).newMatches.length : 0;

  return (
    <header className="z-20 border-b border-line bg-surface/90 backdrop-blur sm:sticky sm:top-0">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <Logo />
          {appName}
        </Link>
        <nav aria-label="Main" className="flex flex-wrap items-center gap-1 text-sm">
          <NavLink href="/sectors">{nav.sectors}</NavLink>
          <NavLink href="/opportunities">{nav.opportunities}</NavLink>
          {user?.role === "YOUTH" && (
            <>
              <NavLink href="/recommendations">
                {nav.recommendations}
                {newMatches > 0 && (
                  <span className="ml-1.5 rounded-full bg-amber-400 px-1.5 py-0.5 text-xs font-semibold text-black">
                    {newMatches}
                    <span className="sr-only"> new</span>
                  </span>
                )}
              </NavLink>
              <NavLink href="/saved">{nav.saved}</NavLink>
              <NavLink href="/progress">{nav.progress}</NavLink>
              <NavLink href="/profile">{nav.profile}</NavLink>
            </>
          )}
          {user && user.role !== "YOUTH" && <NavLink href="/dashboard">{nav.dashboard}</NavLink>}
          {user?.role === "ADMIN" && <NavLink href="/admin">{nav.admin}</NavLink>}
          {user ? (
            <form action={logout} className="ml-1">
              <button type="submit" className="btn btn-secondary btn-sm">
                {nav.logout}
              </button>
            </form>
          ) : (
            <>
              <NavLink href="/login">{nav.login}</NavLink>
              <Link href="/register" className="btn btn-primary btn-sm ml-1">
                {nav.register}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
