import type { ListingStatus } from "@prisma/client";

export const KIGALI_TZ = "Africa/Kigali";

// Listings close at the end of the chosen day in Rwanda (UTC+2, no daylight saving).
export function endOfDayKigali(dateString: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return null;
  const date = new Date(`${dateString}T23:59:59+02:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: KIGALI_TZ }).format(
    date,
  );
}

// Used to pre-fill the <input type="date"> when editing.
export function toDateInputValue(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: KIGALI_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  return parts;
}

type ListingLike = { status: ListingStatus; closesAt: Date };

// FR-4.8 / BR-8: a listing only counts as active while it is published AND its closing date has not passed.
export function isListingActive(listing: ListingLike, now = new Date()): boolean {
  return listing.status === "ACTIVE" && listing.closesAt.getTime() > now.getTime();
}

export type DisplayStatus = "ACTIVE" | "EXPIRED" | "CLOSED" | "REMOVED";

export function displayStatus(listing: ListingLike, now = new Date()): DisplayStatus {
  if (listing.status === "REMOVED") return "REMOVED";
  if (listing.status === "CLOSED") return "CLOSED";
  return listing.closesAt.getTime() > now.getTime() ? "ACTIVE" : "EXPIRED";
}

// Prisma filter for "visible as active" so every page applies the same rule.
export function activeListingWhere(now = new Date()) {
  return { status: "ACTIVE" as const, closesAt: { gt: now } };
}
