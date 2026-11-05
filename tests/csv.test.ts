import { describe, expect, test } from "vitest";
import { csvCell, csvFileName, plansToCSV } from "@/lib/csv";
import type { AgendaItem } from "@/lib/travel";

const plan = (p: Partial<AgendaItem>) =>
  ({ id: p.title, title: "x", category: "Activity", status: "Idea", day_date: null, start_time: null, end_time: null,
     sort_order: 0, paid: false, currency: null, cost_actual: null, cost_estimated: null, ...p }) as AgendaItem;

describe("CSV export", () => {
  test("escapes commas, quotes and line breaks", () => {
    expect(csvCell('Dinner, "the good one"')).toBe('"Dinner, ""the good one"""');
    expect(csvCell("line1\nline2")).toBe('"line1\nline2"');
    expect(csvCell(null)).toBe("");
  });

  test("header row + one row per plan, dated plans first in order, unscheduled last", () => {
    const csv = plansToCSV([
      plan({ title: "Someday museum" }),
      plan({ title: "Flight home", day_date: "2027-01-16", start_time: "09:00:00", cost_actual: 362.48, paid: true }),
      plan({ title: "Humantay Lake", day_date: "2027-01-05", start_time: "05:00:00" }),
    ]);
    const lines = csv.trim().split("\r\n");
    expect(lines[0]).toMatch(/^Date,Start,End,Title,Category/);
    expect(lines).toHaveLength(4);
    expect(lines[1]).toMatch(/^2027-01-05,05:00,,Humantay Lake/);
    expect(lines[2]).toContain("362.48,USD,Yes");
    expect(lines[3]).toMatch(/^,,,Someday museum/);
  });

  test("file name is a slug of the trip name", () => {
    expect(csvFileName({ name: "Peru 2027!" })).toBe("peru-2027-plans.csv");
    expect(csvFileName({ name: "Sanoma Birthday Trip" })).toBe("sanoma-birthday-trip-plans.csv");
  });
});
