import type { EventType } from "@prisma/client";
import { db } from "@/lib/db";

type EventInput = {
  type: EventType;
  userId?: string | null;
  sectorId?: string | null;
  courseId?: string | null;
  listingId?: string | null;
};

// Logging must never break what the user is doing, so failures are swallowed after being reported.
export async function recordEvent(input: EventInput) {
  try {
    await db.event.create({ data: input });
  } catch (error) {
    console.error("Could not record event", input.type, error);
  }
}
