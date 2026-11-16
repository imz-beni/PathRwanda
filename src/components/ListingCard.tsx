import type { ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { TypeBadge } from "@/components/TypeBadge";
import { formatDate } from "@/lib/listings";
import type { TYPE_LABEL } from "@/lib/validation/listing";

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

// Organization, place and closing date in one quiet row. Shared by every listing card.
export function ListingMeta({ listing }: { listing: Props["listing"] }) {
  return (
    <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
      <span className="flex items-center gap-1.5">
        <Icon name="building" className="h-4 w-4" />
        {listing.organization.name}
      </span>
      {listing.location && (
        <span className="flex items-center gap-1.5">
          <Icon name="pin" className="h-4 w-4" />
          {listing.location}
        </span>
      )}
      <span className="flex items-center gap-1.5">
        <Icon name="clock" className="h-4 w-4" />
        Closes {formatDate(listing.closesAt)}
      </span>
    </p>
  );
}

export function ListingCard({ href, listing, badge, children }: Props) {
  return (
    <li className="card flex flex-col gap-3 p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="text-lg font-medium">
          <Link href={href} className="hover:text-brand hover:underline">
            {listing.title}
          </Link>
        </h2>
        <span className="flex flex-wrap items-center gap-2">
          {badge}
          <TypeBadge type={listing.type} />
        </span>
      </div>
      <ListingMeta listing={listing} />
      {children}
    </li>
  );
}
