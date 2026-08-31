import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAgenda, useSaveAgendaItem, useTravelers, useTrip } from "@/lib/data";
import { DayTimeline } from "@/components/day-timeline";
import { ItemDialog, type ItemDraft } from "@/components/item-dialog";
import { Panel, SectionLabel } from "@/components/bits";
import { formatDayLong, itemCost, money, sortItems, tripDates } from "@/lib/travel";

export const Route = createFileRoute("/_authenticated/trips/$tripId/day/$date")({
  head: () => ({
    meta: [
      { title: "Day plan — Wayfarer" },
      { name: "description", content: "One day of your trip, hour by hour." },
      { property: "og:title", content: "Day plan — Wayfarer" },
      { property: "og:description", content: "One day of your trip, hour by hour." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DayPage,
});

function DayPage() {
  const { tripId, date } = Route.useParams();
  const { user } = Route.useRouteContext();
  const { data: trip } = useTrip(tripId);
  const { data: items } = useAgenda(tripId);
  const { data: travelers } = useTravelers(tripId);
  const save = useSaveAgendaItem(tripId);
  const [draft, setDraft] = useState<ItemDraft | null>(null);

  const days = useMemo(() => (trip ? tripDates(trip) : []), [trip]);
  const dayItems = useMemo(
    () => (items ?? []).filter((i) => i.day_date === date).sort(sortItems),
    [items, date],
  );

  if (!trip) return null;
  const idx = days.indexOf(date);
  const prev = idx > 0 ? days[idx - 1] : null;
  const next = idx >= 0 && idx < days.length - 1 ? days[idx + 1] : null;
  const dayCost = dayItems.reduce((s, i) => s + itemCost(i), 0);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
      <div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold tracking-[0.16em] text-ink/40 uppercase">
              {idx >= 0 ? `Day ${idx + 1} of ${days.length}` : "Day"}
            </p>
            <h2 className="font-display text-[26px] leading-none font-extrabold tracking-tight">
              {formatDayLong(date)}
            </h2>
          </div>
          <div className="flex gap-2">
            {prev ? (
              <Link
                to="/trips/$tripId/day/$date"
                params={{ tripId, date: prev }}
                className="rounded-full border border-border px-3.5 py-1.5 text-[12px] font-bold text-ink/60"
              >
                ← Previous
              </Link>
            ) : null}
            {next ? (
              <Link
                to="/trips/$tripId/day/$date"
                params={{ tripId, date: next }}
                className="rounded-full border border-border px-3.5 py-1.5 text-[12px] font-bold text-ink/60"
              >
                Next →
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() =>
                setDraft({
                  day_date: date,
                  category: "Activity",
                  status: "Idea",
                  participants: (travelers ?? []).map((t) => t.name),
                })
              }
              className="rounded-full bg-brand px-4 py-1.5 text-[12px] font-bold text-cream"
            >
              + Add plan
            </button>
          </div>
        </div>

        <DayTimeline
          items={dayItems}
          travelers={travelers ?? []}
          currency={trip.currency}
          onSelect={(item) => setDraft(item)}
          onToggleComplete={(item) => save.mutate({ id: item.id, completed: !item.completed })}
        />
      </div>

      <div className="space-y-5">
        <Panel>
          <SectionLabel>This day</SectionLabel>
          <dl className="space-y-2 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-ink/50">Plans</dt>
              <dd className="font-bold">{dayItems.length}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/50">Completed</dt>
              <dd className="font-bold">{dayItems.filter((i) => i.completed).length}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/50">Day spend</dt>
              <dd className="font-bold">{money(dayCost, trip.currency)}</dd>
            </div>
          </dl>
        </Panel>

        <Panel>
          <SectionLabel>Jump to a day</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {days.map((d, i) => (
              <Link
                key={d}
                to="/trips/$tripId/day/$date"
                params={{ tripId, date: d }}
                className="rounded-full border border-border bg-cream/60 px-3 py-1.5 text-[12px] font-bold text-ink/60"
                activeProps={{ className: "border-ink bg-ink text-cream" }}
              >
                {i + 1}
              </Link>
            ))}
          </div>
        </Panel>
      </div>

      <ItemDialog
        tripId={tripId}
        travelers={travelers ?? []}
        draft={draft}
        currency={trip.currency}
        authorName={(user.user_metadata?.["full_name"] as string | undefined) ?? user.email ?? "You"}
        authorId={user.id}
        onClose={() => setDraft(null)}
      />
    </div>
  );
}
