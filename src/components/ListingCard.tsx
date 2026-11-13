import type { ReactNode } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/listings";
import { TYPE_LABEL } from "@/lib/validation/listing";

type Props = {
  href: string;
  listing: {
    title: string;
    type: keyof typeof TYPE_LABEL;
    location: string | null;
    closesAt: Date;
    organization: { name: string };
  };
  // Shown beside the type, for example a match level or "Closed".
  badge?: ReactNode;
  children?: ReactNode;
};

export function ListingCard({ href, listing, badge, children }: Props) {
  return (
    <li className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-medium">
          <Link href={href} className="underline">
            {listing.title}
          </Link>
        </h2>
        <span className="flex flex-wrap items-center gap-2">
          {badge}
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">
            {TYPE_LABEL[listing.type]}
          </span>
        </span>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {listing.organization.name}
        {listing.location ? ` · ${listing.location}` : ""} · Closes {formatDate(listing.closesAt)}
      </p>
      {children}
    </li>
  );
}
