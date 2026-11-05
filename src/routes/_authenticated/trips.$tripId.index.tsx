import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAgenda, useChecklist, useSavedPlaces, useTravelers, useTrip } from "@/lib/data";
import { Meter, Panel, SectionLabel, StatusPill } from "@/components/bits";
import {
  BOOKED_STATUSES,
  formatDayLong,
  formatDayShort,
  itemCost,
  money,
  sortItems,
  timeRange,
  toISODate,
  tripDates,
} from "@/lib/travel";

export const Route = createFileRoute("/_authenticated/trips/$tripId/")({
  head: () => ({
    meta: [
      { title: "Trip overview — RMS Rhone" },
      { name: "description", content: "What's next, what's booked and what's still open." },
      { property: "og:title", content: "Trip overview — RMS Rhone" },
      { property: "og:description", content: "What's next, what's booked and what's still open." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OverviewPage,
});

function OverviewPage() {
  const { tripId } = Route.useParams();
  const { data: trip } = useTrip(tripId);
  const { data: items } = useAgenda(tripId);
  const { data: travelers } = useTravelers(tripId);
  const { data: places } = useSavedPlaces(tripId);
  const { data: checklist } = useChecklist(tripId);

  const all = useMemo(() => [...(items ?? [])].sort(sortItems), [items]);
  const today = toISODate(new Date());
  const upcoming = all.filter((i) => (i.day_date ?? "9999") >= today).slice(0, 5);
  const needsBooking = all.filter((i) => !BOOKED_STATUSES.includes(i.status) && i.status !== "Cancelled");
  const spent = all.reduce((s, i) => s + itemCost(i), 0);
  const days = trip ? tripDates(trip) : [];

  if (!trip) return null;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <div className="min-w-0 space-y-5">
        <Panel>
          <SectionLabel>Next up</SectionLabel>
          {upcoming.length === 0 ? (
            <p className="text-[13px] text-ink/50">Nothing scheduled ahead — add your first plan.</p>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((i) => (
                <li key={i.id} className="flex items-start gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="w-[86px] shrink-0">
                    <p className="text-[11px] font-bold tracking-wide text-ink/40 uppercase">
                      {i.day_date ? formatDayShort(i.day_date) : "Unscheduled"}
                    </p>
                    <p className="text-[12px] font-semibold text-ink/60">{timeRange(i)}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-[15px] font-bold">{i.title}</p>
                      <StatusPill status={i.status} />
                    </div>
                    <p className="mt-0.5 text-[12px] text-ink/50">
                      {[i.category, i.location_name].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/trips/$tripId/itinerary"
            params={{ tripId }}
            className="mt-5 inline-block rounded-full bg-brand px-4 py-2 text-[12px] font-bold text-cream"
          >
            Open full itinerary
          </Link>
        </Panel>

        <Panel>
          <SectionLabel>Day by day</SectionLabel>
          <div className="grid gap-2 sm:grid-cols-2">
            {days.map((d, idx) => {
              const count = all.filter((i) => i.day_date === d).length;
              return (
                <Link
                  key={d}
                  to="/trips/$tripId/day/$date"
                  params={{ tripId, date: d }}
                  className="rounded-2xl border border-border bg-cream/60 px-4 py-3 transition-colors hover:border-brand"
                >
                  <p className="text-[11px] font-bold tracking-wide text-ink/40 uppercase">
                    Day {idx + 1}
                  </p>
                  <p className="font-display text-[14px] font-bold">{formatDayLong(d)}</p>
                  <p className="mt-1 text-[12px] text-ink/50">
                    {count} plan{count === 1 ? "" : "s"}
                  </p>
                </Link>
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="min-w-0 space-y-5">
        <Panel>
          <SectionLabel>Trip pulse</SectionLabel>
          <div className="space-y-4">
            <Meter
              label="Plans booked"
              value={all.length - needsBooking.length}
              total={all.length}
            />
            <Meter
              label="Checklist done"
              value={(checklist ?? []).filter((c) => c.completed).length}
              total={(checklist ?? []).length}
              tone="sun"
            />
            <Meter
              label="Ideas scheduled"
              value={(places ?? []).filter((p) => p.scheduled).length}
              total={(places ?? []).length}
              tone="brand"
            />
          </div>
          <dl className="mt-5 space-y-2 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-ink/50">Committed</dt>
              <dd className="font-bold">{money(spent, trip.currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/50">Budget</dt>
              <dd className="font-bold">
                {trip.budget_total ? money(trip.budget_total, trip.currency) : "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/50">Travelers</dt>
              <dd className="font-bold">{(travelers ?? []).length}</dd>
            </div>
          </dl>
        </Panel>

        <Panel>
          <SectionLabel>Still to book</SectionLabel>
          {needsBooking.length === 0 ? (
            <p className="text-[13px] text-ink/50">Everything's locked in. Nice.</p>
          ) : (
            <ul className="space-y-2">
              {needsBooking.slice(0, 6).map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-2">
                  <span className="truncate text-[13px] font-semibold">{i.title}</span>
                  <StatusPill status={i.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {trip.notes ? (
          <Panel>
            <SectionLabel>Trip notes</SectionLabel>
            <p className="text-[13px] leading-relaxed whitespace-pre-wrap text-ink/65">
              {trip.notes}
            </p>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}
