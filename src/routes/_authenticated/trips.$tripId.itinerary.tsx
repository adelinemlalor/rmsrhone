import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAgenda, useSaveAgendaItem, useTravelers, useTrip } from "@/lib/data";
import { DayTimeline } from "@/components/day-timeline";
import { ItemDialog, type ItemDraft } from "@/components/item-dialog";
import { EmptyState } from "@/components/bits";
import { SkippedList, usePersonalView, ViewerSwitch } from "@/components/personal-view";
import { ImportPlanDialog } from "@/components/import-plan-dialog";
import { formatDayLong, formatDayShort, sortItems, tripDates } from "@/lib/travel";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/trips/$tripId/itinerary")({
  head: () => ({
    meta: [
      { title: "Itinerary — RMS Rhone" },
      { name: "description", content: "Your hour-by-hour trip itinerary, day by day." },
      { property: "og:title", content: "Itinerary — RMS Rhone" },
      { property: "og:description", content: "Your hour-by-hour trip itinerary, day by day." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ItineraryPage,
});

function ItineraryPage() {
  const { tripId } = Route.useParams();
  const { user } = Route.useRouteContext();
  const { data: trip } = useTrip(tripId);
  const { data: travelers } = useTravelers(tripId);
  const { data: items } = useAgenda(tripId);
  const save = useSaveAgendaItem(tripId);
  const [draft, setDraft] = useState<ItemDraft | null>(null);
  const [dayFilter, setDayFilter] = useState<string | "all">("all");
  const [importOpen, setImportOpen] = useState(false);

  const days = useMemo(() => (trip ? tripDates(trip) : []), [trip]);
  const everything = useMemo(() => [...(items ?? [])].sort(sortItems), [items]);
  const view = usePersonalView(tripId, travelers ?? [], user.id, everything);
  const all = view.filter(everything);
  const unscheduled = all.filter((i) => !i.day_date);

  const visibleDays = dayFilter === "all" ? days : days.filter((d) => d === dayFilter);

  if (!trip) return null;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-border bg-white/60 px-4 py-3">
        <ViewerSwitch view={view} />
        <p className="text-[12px] text-ink/50">
          {view.viewerId === null
            ? "The plan everyone shares."
            : view.isOwnView
              ? "Your version — changes here don't touch the shared plan."
              : `${view.viewerName}'s version.`}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setDayFilter("all")}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[12px] font-bold",
              dayFilter === "all"
                ? "border-ink bg-ink text-cream"
                : "border-border bg-white/60 text-ink/55",
            )}
          >
            Whole trip
          </button>
          {days.map((d, i) => (
            <button
              key={d}
              type="button"
              onClick={() => setDayFilter(d)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[12px] font-bold",
                dayFilter === d
                  ? "border-ink bg-ink text-cream"
                  : "border-border bg-white/60 text-ink/55",
              )}
            >
              Day {i + 1} · {formatDayShort(d)}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="rounded-full border border-border bg-white/60 px-4 py-2 text-[12px] font-bold text-ink/70"
          >
            Import notes / document
          </button>
          <button
            type="button"
            onClick={() =>
              setDraft({
                ...view.draftDefaults,
                day_date: dayFilter === "all" ? (days[0] ?? null) : dayFilter,
                category: "Activity",
                status: "Idea",
                participants: (travelers ?? []).map((t) => t.name),
              })
            }
            className="rounded-full bg-brand px-4 py-2 text-[12px] font-bold text-cream"
          >
            + Add plan
          </button>
        </div>
      </div>
      <ImportPlanDialog trip={trip} open={importOpen} onClose={() => setImportOpen(false)} />

      {days.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Add dates to build the timeline"
            description="Set a start and end date on this trip and RMS Rhone will lay out every day for you."
          />
        </div>
      ) : null}

      <div className="mt-7 space-y-10">
        {visibleDays.map((d, i) => {
          const dayItems = all.filter((it) => it.day_date === d);
          return (
            <section key={d}>
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold tracking-[0.16em] text-ink/40 uppercase">
                    Day {days.indexOf(d) + 1}
                  </p>
                  <h2 className="font-display text-[22px] font-extrabold tracking-tight">
                    {formatDayLong(d)}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setDraft({
                      ...view.draftDefaults,
                      day_date: d,
                      category: "Activity",
                      status: "Idea",
                      participants: (travelers ?? []).map((t) => t.name),
                    })
                  }
                  className="text-[12px] font-bold text-brand"
                >
                  + Add to this day
                </button>
              </div>
              <DayTimeline
                items={dayItems}
                travelers={travelers ?? []}
                currency={trip.currency}
                onSelect={(item) => setDraft(item)}
                onToggleComplete={(item) =>
                  save.mutate({ id: item.id, completed: !item.completed })
                }
                onSkip={view.isOwnView ? (item) => view.toggleSkip(item) : undefined}
              />
              {i < visibleDays.length - 1 ? null : null}
            </section>
          );
        })}

        <SkippedList view={view} />

        {unscheduled.length > 0 ? (
          <section>
            <h2 className="font-display mb-4 text-[20px] font-extrabold tracking-tight">
              Not scheduled yet
            </h2>
            <DayTimeline
              items={unscheduled}
              travelers={travelers ?? []}
              currency={trip.currency}
              onSelect={(item) => setDraft(item)}
            />
          </section>
        ) : null}
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
