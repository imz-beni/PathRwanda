"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// A menu link that knows when it points at the page being viewed, so it can be highlighted
// and announced as the current page.
export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const current = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={`rounded-md px-2.5 py-1.5 font-medium whitespace-nowrap transition-colors ${
        current
          ? "bg-brand-soft text-brand-strong"
          : "text-muted hover:bg-zinc-100 hover:text-foreground dark:hover:bg-zinc-800"
      }`}
    >
      {children}
    </Link>
  );
}
