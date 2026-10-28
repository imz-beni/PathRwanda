import { describe, expect, it } from "vitest";
import {
  activeListingWhere,
  displayStatus,
  endOfDayKigali,
  isListingActive,
  toDateInputValue,
} from "./listings";

const now = new Date("2026-11-10T12:00:00Z");
const future = new Date("2026-11-20T21:59:59Z");
const past = new Date("2026-11-01T21:59:59Z");

describe("listing activity", () => {
  it("is active only when published and not past its closing date", () => {
    expect(isListingActive({ status: "ACTIVE", closesAt: future }, now)).toBe(true);
    expect(isListingActive({ status: "ACTIVE", closesAt: past }, now)).toBe(false);
    expect(isListingActive({ status: "CLOSED", closesAt: future }, now)).toBe(false);
    expect(isListingActive({ status: "REMOVED", closesAt: future }, now)).toBe(false);
  });

  it("labels expired listings as expired, never active", () => {
    expect(displayStatus({ status: "ACTIVE", closesAt: past }, now)).toBe("EXPIRED");
    expect(displayStatus({ status: "ACTIVE", closesAt: future }, now)).toBe("ACTIVE");
    expect(displayStatus({ status: "REMOVED", closesAt: future }, now)).toBe("REMOVED");
  });

  it("builds a database filter with the same rule", () => {
    expect(activeListingWhere(now)).toEqual({ status: "ACTIVE", closesAt: { gt: now } });
  });
});

describe("Kigali dates", () => {
  it("closes at the end of the chosen day in Rwanda", () => {
    expect(endOfDayKigali("2026-11-20")?.toISOString()).toBe("2026-11-20T21:59:59.000Z");
  });

  it("rejects badly formatted dates", () => {
    expect(endOfDayKigali("20/11/2026")).toBeNull();
    expect(endOfDayKigali("")).toBeNull();
    expect(endOfDayKigali("2026-13-45")).toBeNull();
  });

  it("round-trips back to the date input value", () => {
    expect(toDateInputValue(endOfDayKigali("2026-11-20")!)).toBe("2026-11-20");
  });
});
