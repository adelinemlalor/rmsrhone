import { describe, expect, test } from "vitest";
import { findPlans } from "@/lib/find";
import type { AgendaItem } from "@/lib/travel";

const plan = (p: Partial<AgendaItem>): AgendaItem =>
  ({ id: p.title, trip_id: "t1", category: "Activity", status: "Idea", day_date: null, start_time: null,
     cost_actual: null, cost_estimated: null, created_at: "2026-11-01", ...p }) as AgendaItem;

const plans = [
  plan({ title: "Ramen at Ichiran", category: "Restaurant", city: "Tokyo", day_date: "2026-12-03", cost_estimated: 20, created_at: "2026-11-02" }),
  plan({ title: "Park Hyatt", category: "Hotel", city: "Tokyo", day_date: "2026-12-01", cost_actual: 900, created_at: "2026-11-01" }),
  plan({ title: "Sugarloaf cable car", category: "Activity", trip_id: "t2", day_date: "2027-03-10", created_at: "2026-11-03" }),
];

describe("findPlans", () => {
  test("search matches any word in title/city, case-insensitive", () => {
    expect(findPlans(plans, { q: "RAMEN" }).map((p) => p.title)).toEqual(["Ramen at Ichiran"]);
    expect(findPlans(plans, { q: "tokyo" })).toHaveLength(2);
  });
  test("trip and category filters combine", () => {
    expect(findPlans(plans, { trip: "t1", category: "Hotel" }).map((p) => p.title)).toEqual(["Park Hyatt"]);
  });
  test("sorts: soonest, newest, most expensive", () => {
    expect(findPlans(plans, {}).map((p) => p.title)[0]).toBe("Park Hyatt");
    expect(findPlans(plans, { sort: "newest" }).map((p) => p.title)[0]).toBe("Sugarloaf cable car");
    expect(findPlans(plans, { sort: "priciest" }).map((p) => p.title)).toEqual(["Park Hyatt", "Ramen at Ichiran", "Sugarloaf cable car"]);
  });
  test("starred-only uses the star set", () => {
    expect(findPlans(plans, { starredOnly: true }, new Set(["Park Hyatt"]))).toHaveLength(1);
  });
});
