import Link from "next/link";
import { strings } from "@/lib/strings";

export function Footer() {
  const { footer } = strings;
  return (
    <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 text-sm text-zinc-600 dark:text-zinc-400">
        <p className="font-medium">{footer.tagline}</p>
        <p>{footer.privacy}</p>
        <nav aria-label="Footer" className="flex flex-wrap gap-4">
          <Link href="/help" className="underline">
            {footer.help}
          </Link>
          <Link href="/privacy" className="underline">
            {footer.privacyLink}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
