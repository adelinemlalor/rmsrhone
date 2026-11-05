/**
 * TEST 2 — Dashboard stat (PLAN.md §4)
 *
 * Given  three plans: a Hotel with actual cost $400, a Restaurant with
 *        estimated cost $60, and an Activity with no cost,
 * When   the dashboard computes its summary stats,
 * Then   total plans = 3, total spend = $460 (actual cost wins over estimated),
 *        average cost per paid plan = $230, and the top spending category is Hotel.
 */
import { describe, expect, test } from "vitest";
import { computeDashboardStats } from "@/lib/dashboard";

const plans = [
  // The Hotel was estimated at $500 but actually cost $400 — the actual must win.
  { category: "Hotel", cost_estimated: 500, cost_actual: 400, day_date: "2026-10-01", status: "Confirmed" },
  { category: "Restaurant", cost_estimated: 60, cost_actual: null, day_date: "2026-10-01", status: "Reserved" },
  { category: "Activity", cost_estimated: null, cost_actual: null, day_date: "2027-01-05", status: "Idea" },
];

describe("dashboard summary stats", () => {
  const stats = computeDashboardStats(plans);

  test("counts every plan", () => {
    expect(stats.totalPlans).toBe(3);
  });

  test("total spend uses actual cost when known, otherwise the estimate", () => {
    expect(stats.totalSpend).toBe(460);
  });

  test("average is spend divided by plans that have a cost (free plans don't drag it down)", () => {
    expect(stats.paidPlans).toBe(2);
    expect(stats.avgCostPerPaidPlan).toBe(230);
  });

  test("top spending category is Hotel, and the busiest month is October 2026", () => {
    expect(stats.topCategory).toBe("Hotel");
    expect(stats.busiestMonth).toEqual({ month: "2026-10", count: 2 });
  });

  test("no plans → zeros, not NaN", () => {
    const empty = computeDashboardStats([]);
    expect(empty.avgCostPerPaidPlan).toBe(0);
    expect(empty.topCategory).toBeNull();
  });
});
