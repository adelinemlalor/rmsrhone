import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAgenda, useTravelers, useTrip } from "@/lib/data";
import { Panel, SectionLabel } from "@/components/bits";
import {
  budgetBucket,
  BUDGET_BUCKETS,
  computeBalances,
  itemCost,
  money,
} from "@/lib/travel";

export const Route = createFileRoute("/_authenticated/trips/$tripId/budget")({
  head: () => ({
    meta: [
      { title: "Budget — RMS Rhone" },
      { name: "description", content: "Trip spend by category and who owes who." },
      { property: "og:title", content: "Budget — RMS Rhone" },
      { property: "og:description", content: "Trip spend by category and who owes who." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BudgetPage,
});

function BudgetPage() {
  const { tripId } = Route.useParams();
  const { data: trip } = useTrip(tripId);
  const { data: items } = useAgenda(tripId);
  const { data: travelers } = useTravelers(tripId);

  const all = items ?? [];
  const total = all.reduce((s, i) => s + itemCost(i), 0);
  const paid = all.filter((i) => i.paid).reduce((s, i) => s + itemCost(i), 0);

  const byBucket = useMemo(() => {
    const map = new Map<string, number>();
    for (const i of all) {
      const b = budgetBucket(i.category);
      map.set(b, (map.get(b) ?? 0) + itemCost(i));
    }
    return BUDGET_BUCKETS.map((b) => ({ bucket: b, amount: map.get(b) ?? 0 })).filter(
      (r) => r.amount > 0,
    );
  }, [all]);

  const balances = useMemo(() => computeBalances(all), [all]);
  const perPerson = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of travelers ?? []) map.set(t.name, 0);
    for (const i of all) {
      if (!i.paid_by) continue;
      map.set(i.paid_by, (map.get(i.paid_by) ?? 0) + itemCost(i));
    }
    return [...map.entries()];
  }, [all, travelers]);

  if (!trip) return null;
  const budget = trip.budget_total ?? 0;
  const max = Math.max(...byBucket.map((b) => b.amount), 1);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-5">
        <Panel>
          <SectionLabel>Spend by category</SectionLabel>
          {byBucket.length === 0 ? (
            <p className="text-[13px] text-ink/50">No costs recorded yet.</p>
          ) : (
            <ul className="space-y-3">
              {byBucket.map((b) => (
                <li key={b.bucket}>
                  <div className="mb-1 flex justify-between text-[13px] font-semibold">
                    <span>{b.bucket}</span>
                    <span>{money(b.amount, trip.currency)}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-cream-2">
                    <div
                      className="h-2.5 rounded-full bg-brand"
                      style={{ width: `${(b.amount / max) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel>
          <SectionLabel>Every expense</SectionLabel>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="text-[11px] tracking-wide text-ink/40 uppercase">
                  <th className="pb-2">Plan</th>
                  <th className="pb-2">Paid by</th>
                  <th className="pb-2 text-right">Cost</th>
                </tr>
              </thead>
              <tbody>
                {all
                  .filter((i) => itemCost(i) > 0)
                  .map((i) => (
                    <tr key={i.id} className="border-t border-border">
                      <td className="py-2 pr-3">
                        <span className="font-semibold">{i.title}</span>
                        <span className="ml-2 text-[11px] text-ink/40">{i.category}</span>
                      </td>
                      <td className="py-2 pr-3 text-ink/55">{i.paid_by ?? "—"}</td>
                      <td className="py-2 text-right font-bold">
                        {money(itemCost(i), trip.currency)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <div className="space-y-5">
        <Panel>
          <SectionLabel>Totals</SectionLabel>
          <dl className="space-y-2 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-ink/50">Committed</dt>
              <dd className="font-bold">{money(total, trip.currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/50">Already paid</dt>
              <dd className="font-bold">{money(paid, trip.currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/50">Budget</dt>
              <dd className="font-bold">{budget ? money(budget, trip.currency) : "—"}</dd>
            </div>
            {budget ? (
              <div className="flex justify-between">
                <dt className="text-ink/50">Remaining</dt>
                <dd className="font-bold text-accent">
                  {money(budget - total, trip.currency)}
                </dd>
              </div>
            ) : null}
          </dl>
        </Panel>

        <Panel>
          <SectionLabel>Paid per traveler</SectionLabel>
          <ul className="space-y-2 text-[13px]">
            {perPerson.map(([name, amount]) => (
              <li key={name} className="flex justify-between">
                <span className="text-ink/55">{name}</span>
                <span className="font-bold">{money(amount, trip.currency)}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <SectionLabel>Settle up</SectionLabel>
          {balances.length === 0 ? (
            <p className="text-[13px] text-ink/50">Everyone's square.</p>
          ) : (
            <ul className="space-y-2 text-[13px]">
              {balances.map((b, i) => (
                <li key={i} className="flex justify-between gap-2">
                  <span>
                    <span className="font-bold">{b.from}</span>
                    <span className="text-ink/45"> owes </span>
                    <span className="font-bold">{b.to}</span>
                  </span>
                  <span className="font-bold text-brand">{money(b.amount, trip.currency)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
