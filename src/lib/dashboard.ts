import { itemCost, type AgendaItem } from "./travel";

export type CategorySpend = { category: string; spend: number; count: number };

export type DashboardStats = {
  totalPlans: number;
  /** Sum of each plan's cost — actual cost if known, otherwise the estimate. */
  totalSpend: number;
  /** Plans that have any cost at all. */
  paidPlans: number;
  /** totalSpend / paidPlans (0 when nothing has a cost). */
  avgCostPerPaidPlan: number;
  topCategory: string | null;
  /** "2026-10" style key of the month with the most scheduled plans. */
  busiestMonth: { month: string; count: number } | null;
  bookedShare: number;
  spendByCategory: CategorySpend[];
};

const BOOKED = new Set(["Reserved", "Confirmed", "Completed"]);

export function computeDashboardStats(plans: Pick<AgendaItem, "category" | "cost_actual" | "cost_estimated" | "day_date" | "status">[]): DashboardStats {
  const byCat = new Map<string, CategorySpend>();
  const byMonth = new Map<string, number>();
  let totalSpend = 0;
  let paidPlans = 0;
  let booked = 0;

  for (const p of plans) {
    const cost = itemCost(p as AgendaItem);
    totalSpend += cost;
    if (cost > 0) paidPlans++;
    if (BOOKED.has(p.status)) booked++;
    const c = byCat.get(p.category) ?? { category: p.category, spend: 0, count: 0 };
    c.spend += cost;
    c.count++;
    byCat.set(p.category, c);
    if (p.day_date) {
      const m = p.day_date.slice(0, 7);
      byMonth.set(m, (byMonth.get(m) ?? 0) + 1);
    }
  }

  const spendByCategory = [...byCat.values()]
    .map((c) => ({ ...c, spend: Math.round(c.spend * 100) / 100 }))
    .sort((a, b) => b.spend - a.spend || b.count - a.count);
  let busiestMonth: DashboardStats["busiestMonth"] = null;
  for (const [month, count] of [...byMonth.entries()].sort()) {
    if (!busiestMonth || count > busiestMonth.count) busiestMonth = { month, count };
  }

  return {
    totalPlans: plans.length,
    totalSpend: Math.round(totalSpend * 100) / 100,
    paidPlans,
    avgCostPerPaidPlan: paidPlans ? Math.round((totalSpend / paidPlans) * 100) / 100 : 0,
    topCategory: spendByCategory.find((c) => c.spend > 0)?.category ?? null,
    busiestMonth,
    bookedShare: plans.length ? booked / plans.length : 0,
    spendByCategory,
  };
}

export function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y!, (m ?? 1) - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
