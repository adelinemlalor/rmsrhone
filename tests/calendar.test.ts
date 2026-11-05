import { describe, expect, test } from "vitest";
import { defaultMonth, monthGrid } from "@/lib/calendar";

describe("calendar helpers", () => {
  test("January 2027 grid starts on Sun Dec 27 and ends on Sat Feb 6", () => {
    const weeks = monthGrid(2027, 0);
    expect(weeks).toHaveLength(6);
    expect(weeks[0]![0]).toEqual({ key: "2026-12-27", inMonth: false, day: 27 });
    expect(weeks[0]![5]).toEqual({ key: "2027-01-01", inMonth: true, day: 1 });
    expect(weeks.at(-1)!.at(-1)!.key).toBe("2027-02-06");
    expect(weeks.every((w) => w.length === 7)).toBe(true);
  });

  test("opens on the next upcoming plan's month", () => {
    const today = new Date(2026, 10, 4); // Nov 4 2026
    expect(defaultMonth(["2026-10-01", "2027-01-05", null], today)).toBe("2027-01");
    expect(defaultMonth(["2026-10-01"], today)).toBe("2026-10");
    expect(defaultMonth([], today)).toBe("2026-11");
  });
});
