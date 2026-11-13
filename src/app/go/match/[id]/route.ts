import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/dal";
import { recordEvent } from "@/lib/events";

// Recommendation links go through here so that opening a matched listing can be counted for
// the MVP metrics, then the user lands on the normal listing page.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await db.listing.findFirst({
    where: { id, status: { not: "REMOVED" }, organization: { status: "APPROVED" } },
    select: { id: true },
  });
  if (!listing) return NextResponse.redirect(new URL("/recommendations", request.url));

  const user = await getCurrentUser();
  // Only a young user's own click counts; anyone else is just sent on.
  if (user?.role === "YOUTH") {
    await recordEvent({ type: "MATCHED_LISTING_VIEWED", userId: user.id, listingId: listing.id });
  }
  return NextResponse.redirect(new URL(`/opportunities/${listing.id}`, request.url));
}
