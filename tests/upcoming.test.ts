import { describe, expect, test } from "vitest";
import { isUpcoming } from "@/lib/travel";

const today = "2026-11-04";
const trip = (start_date: string | null, end_date: string | null, status = "Planning") => ({ start_date, end_date, status });

describe("isUpcoming (the Trips page's default filter)", () => {
  test("a trip that ended last month is NOT upcoming, even if still marked Planning", () => {
    expect(isUpcoming(trip("2026-10-01", "2026-10-03"), today)).toBe(false);
  });
  test("future trips and trips happening right now are upcoming", () => {
    expect(isUpcoming(trip("2027-01-02", "2027-01-16"), today)).toBe(true);
    expect(isUpcoming(trip("2026-11-01", "2026-11-04"), today)).toBe(true);
  });
  test("a completed trip is never upcoming", () => {
    expect(isUpcoming(trip("2027-01-02", "2027-01-16", "Completed"), today)).toBe(false);
  });
  test("a trip with no dates yet is still upcoming; start date is used if there's no end date", () => {
    expect(isUpcoming(trip(null, null), today)).toBe(true);
    expect(isUpcoming(trip("2026-09-01", null), today)).toBe(false);
  });
});
