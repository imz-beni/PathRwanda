import Link from "next/link";
import { Hills } from "@/components/Hills";
import { Logo } from "@/components/Logo";
import { strings } from "@/lib/strings";

const linkClass = "forest-muted hover:text-white hover:underline";

export function Footer() {
  const { footer, nav, appName } = strings;
  return (
    <footer className="forest relative mt-auto overflow-hidden">
      <Hills />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 text-sm sm:grid-cols-[2fr_1fr_1fr]">
        <div className="flex max-w-md flex-col gap-4">
          <p className="flex items-center gap-2 text-lg font-semibold">
            <Logo className="h-7 w-7" />
            {appName}
          </p>
          <p className="font-display text-2xl leading-snug">{footer.tagline}</p>
          <p className="forest-muted text-xs leading-relaxed">{footer.privacy}</p>
        </div>
        <nav aria-label="Explore" className="flex flex-col gap-2.5">
          <p className="eyebrow mb-1">{footer.explore}</p>
          <Link href="/sectors" className={linkClass}>
            {nav.sectors}
          </Link>
          <Link href="/opportunities" className={linkClass}>
            {nav.opportunities}
          </Link>
          <Link href="/register" className={linkClass}>
            {nav.register}
          </Link>
        </nav>
        <nav aria-label="Support" className="flex flex-col gap-2.5">
          <p className="eyebrow mb-1">{footer.support}</p>
          <Link href="/help" className={linkClass}>
            {footer.help}
          </Link>
          <Link href="/privacy" className={linkClass}>
            {footer.privacyLink}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
