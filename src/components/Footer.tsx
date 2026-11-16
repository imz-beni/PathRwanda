import Link from "next/link";
import { Logo } from "@/components/Logo";
import { strings } from "@/lib/strings";

const linkClass = "hover:text-foreground hover:underline";

export function Footer() {
  const { footer, nav, appName } = strings;
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 text-sm text-muted sm:grid-cols-[2fr_1fr_1fr]">
        <div className="flex flex-col gap-3">
          <p className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Logo className="h-6 w-6" />
            {appName}
          </p>
          <p>{footer.tagline}</p>
          <p className="text-xs leading-relaxed">{footer.privacy}</p>
        </div>
        <nav aria-label="Explore" className="flex flex-col gap-2">
          <p className="font-semibold text-foreground">{footer.explore}</p>
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
        <nav aria-label="Support" className="flex flex-col gap-2">
          <p className="font-semibold text-foreground">{footer.support}</p>
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
