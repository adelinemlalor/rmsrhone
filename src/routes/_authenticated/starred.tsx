import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useStarredPlans, type StarredPlan } from "@/lib/data";
import { CategoryIcon, EmptyState, StatusPill } from "@/components/bits";
import { StarButton } from "@/components/star-button";
import { formatDayShort, money, itemCost, timeRange } from "@/lib/travel";

export const Route = createFileRoute("/_authenticated/starred")({
  head: () => ({
    meta: [
      { title: "Starred plans — RMS Rhone" },
      { name: "description", content: "Every plan you starred, across all your trips." },
    ],
  }),
  component: StarredPage,
});

type Plan = NonNullable<StarredPlan["agenda_items"]>;

function StarredPage() {
  const { data, isLoading, error } = useStarredPlans();

  // Group by trip; inside each trip, soonest plan first (unscheduled last).
  const groups = useMemo(() => {
    const byTrip = new Map<string, { trip: NonNullable<Plan["trips"]>; plans: Plan[] }>();
    for (const row of data ?? []) {
      const plan = row.agenda_items;
      if (!plan?.trips) continue;
      const g = byTrip.get(plan.trips.id) ?? { trip: plan.trips, plans: [] };
      g.plans.push(plan);
      byTrip.set(plan.trips.id, g);
    }
    for (const g of byTrip.values())
      g.plans.sort((a, b) => (a.day_date ?? "9999").localeCompare(b.day_date ?? "9999") || (a.start_time ?? "").localeCompare(b.start_time ?? ""));
    return [...byTrip.values()];
  }, [data]);

  const total = groups.reduce((n, g) => n + g.plans.length, 0);

  return (
    <div className="pb-12">
      <h1 className="font-display text-[34px] leading-none font-extrabold tracking-tight">
        Starred
      </h1>
      <p className="mt-2 text-[13px] text-ink/55">
        {isLoading ? "Loading…" : `${total} must-do plan${total === 1 ? "" : "s"} across ${groups.length} trip${groups.length === 1 ? "" : "s"}.`}
      </p>

      {error ? (
        <p className="mt-6 rounded-2xl bg-destructive/10 px-4 py-3 text-[13px] text-destructive">
          Couldn't load your stars. Refresh to try again.
        </p>
      ) : null}

      {!isLoading && !error && total === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No stars yet"
            description="Tap the ☆ on any plan in an itinerary to keep your can't-miss moments here."
          />
        </div>
      ) : null}

      <div className="mt-8 space-y-9">
        {groups.map(({ trip, plans }) => (
          <section key={trip.id}>
            <Link
              to="/trips/$tripId"
              params={{ tripId: trip.id }}
              className="group inline-block"
            >
              <p className="text-[11px] font-bold tracking-[0.16em] text-ink/40 uppercase">
                {trip.primary_destination ?? "Trip"}
              </p>
              <h2 className="font-display text-[22px] font-extrabold tracking-tight group-hover:text-brand">
                {trip.name}
              </h2>
            </Link>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {plans.map((p) => (
                <li key={p.id} className="relative">
                  <Link
                    to="/trips/$tripId/plans/$planId"
                    params={{ tripId: trip.id, planId: p.id }}
                    className="flex items-start gap-3 rounded-[22px] border border-border bg-white/75 p-4 pr-12 transition-shadow hover:shadow-[0_16px_40px_-30px_rgba(60,40,25,0.7)]"
                  >
                    <CategoryIcon category={p.category} />
                    <div className="min-w-0">
                      <h3 className="font-display text-[16px] leading-tight font-bold">{p.title}</h3>
                      <p className="mt-1 text-[12px] text-ink/50">
                        {[p.day_date ? formatDayShort(p.day_date) : "Unscheduled", p.start_time ? timeRange(p) : null, p.location_name]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-[12px] font-bold text-ink/55">
                        <StatusPill status={p.status} />
                        {itemCost(p) > 0 ? <span>{money(itemCost(p), p.currency ?? trip.currency)}</span> : null}
                      </div>
                    </div>
                  </Link>
                  <StarButton itemId={p.id} className="absolute top-3 right-3" />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
