import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAllPlans, useTrips } from "@/lib/data";
import { computeDashboardStats, monthLabel } from "@/lib/dashboard";
import { EmptyState, Panel } from "@/components/bits";
import { CATEGORY_ICON, money } from "@/lib/travel";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — RMS Rhone" },
      { name: "description", content: "Your travel at a glance: plans, spend and busiest months." },
    ],
  }),
  component: DashboardPage,
});

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-[22px] border border-border bg-white/70 p-5">
      <p className="text-[11px] font-bold tracking-[0.14em] text-ink/45 uppercase">{label}</p>
      <p className="font-display mt-2 text-[30px] leading-none font-extrabold tracking-tight">{value}</p>
      {hint ? <p className="mt-2 text-[12px] text-ink/50">{hint}</p> : null}
    </div>
  );
}

function DashboardPage() {
  const { data: plans, isLoading } = useAllPlans();
  const { data: trips } = useTrips();
  const [tripId, setTripId] = useState("");
  const [showTable, setShowTable] = useState(false);

  const scoped = useMemo(
    () => (plans ?? []).filter((p) => !tripId || p.trip_id === tripId),
    [plans, tripId],
  );
  const stats = useMemo(() => computeDashboardStats(scoped), [scoped]);
  const currency = trips?.find((t) => t.id === tripId)?.currency ?? "USD";
  const chartData = stats.spendByCategory.filter((c) => c.spend > 0);

  return (
    <div className="pb-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[34px] leading-none font-extrabold tracking-tight">
            Dashboard
          </h1>
          <p className="mt-2 text-[13px] text-ink/55">Your travel at a glance.</p>
        </div>
        <select
          aria-label="Show stats for"
          value={tripId}
          onChange={(e) => setTripId(e.target.value)}
          className="rounded-full border border-border bg-white/70 px-4 py-2 text-[13px] font-semibold text-ink/75 outline-none focus:border-brand"
        >
          <option value="">All trips</option>
          {(trips ?? []).map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="mt-6 h-[300px] animate-pulse rounded-[26px] bg-cream-2" />
      ) : stats.totalPlans === 0 ? (
        <div className="mt-8">
          <EmptyState title="No plans yet" description="Add plans to a trip and your stats will show up here." />
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Total plans"
              value={String(stats.totalPlans)}
              hint={`${Math.round(stats.bookedShare * 100)}% reserved or confirmed`}
            />
            <Stat
              label="Total spend"
              value={money(stats.totalSpend, currency)}
              hint="Actual cost where known, otherwise the estimate"
            />
            <Stat
              label="Avg per paid plan"
              value={money(stats.avgCostPerPaidPlan, currency)}
              hint={`${stats.paidPlans} of ${stats.totalPlans} plans have a cost`}
            />
            <Stat
              label="Busiest month"
              value={stats.busiestMonth ? monthLabel(stats.busiestMonth.month).split(" ")[0]! : "—"}
              hint={
                stats.busiestMonth
                  ? `${stats.busiestMonth.count} plans in ${monthLabel(stats.busiestMonth.month)}`
                  : "No scheduled plans yet"
              }
            />
          </div>

          <Panel className="mt-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <h2 className="font-display text-[20px] font-extrabold tracking-tight">
                  Spend by category
                </h2>
                <p className="mt-1 text-[12px] text-ink/50">
                  {stats.topCategory
                    ? `${stats.topCategory} is where most of the money goes.`
                    : "No costs entered yet."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTable((v) => !v)}
                className="text-[12px] font-bold text-brand"
              >
                {showTable ? "Show chart" : "Show as table"}
              </button>
            </div>

            {chartData.length === 0 ? (
              <p className="mt-6 text-[13px] text-ink/45">Add costs to your plans to see this chart.</p>
            ) : showTable ? (
              <table className="mt-4 w-full text-left text-[13px]">
                <thead className="text-[11px] tracking-wide text-ink/45 uppercase">
                  <tr>
                    <th className="py-2 font-bold">Category</th>
                    <th className="py-2 text-right font-bold">Plans</th>
                    <th className="py-2 text-right font-bold">Spend</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.spendByCategory.map((c) => (
                    <tr key={c.category} className="border-t border-border/60">
                      <td className="py-2">
                        {CATEGORY_ICON[c.category] ?? "📍"} {c.category}
                      </td>
                      <td className="py-2 text-right tabular-nums">{c.count}</td>
                      <td className="py-2 text-right font-bold tabular-nums">{money(c.spend, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="mt-4" style={{ height: Math.max(160, chartData.length * 44) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 72, bottom: 0, left: 8 }} barCategoryGap={8}>
                    <CartesianGrid horizontal={false} stroke="var(--border)" />
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="category"
                      width={118}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12, fill: "currentColor", opacity: 0.65 }}
                    />
                    <Tooltip
                      cursor={{ fill: "var(--brand)", fillOpacity: 0.06 }}
                      contentStyle={{ borderRadius: 14, border: "1px solid var(--border)", fontSize: 12 }}
                      formatter={(v: number, _n, item) => [
                        `${money(v, currency)} · ${(item.payload as { count: number }).count} plans`,
                        "Spend",
                      ]}
                    />
                    <Bar dataKey="spend" fill="var(--brand)" radius={[0, 4, 4, 0]} maxBarSize={26}>
                      <LabelList
                        dataKey="spend"
                        position="right"
                        formatter={(v: number) => money(v, currency)}
                        style={{ fontSize: 12, fontWeight: 700, fill: "currentColor", opacity: 0.7 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>
        </>
      )}
    </div>
  );
}
