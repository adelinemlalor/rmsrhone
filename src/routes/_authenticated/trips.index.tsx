import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useDeleteTrip, useTrips } from "@/lib/data";
import { ConfirmDelete } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/bits";
import { countdownLabel, formatRange, TRIP_STATUSES } from "@/lib/travel";
import type { Trip } from "@/lib/travel";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/trips/")({
  head: () => ({
    meta: [
      { title: "Your trips — RMS Rhone" },
      { name: "description", content: "All of your upcoming, current and past trips at a glance." },
      { property: "og:title", content: "Your trips — RMS Rhone" },
      {
        property: "og:description",
        content: "All of your upcoming, current and past trips at a glance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TripsPage,
});

const FILTERS = ["Upcoming", "All", ...TRIP_STATUSES, "Archived"] as const;

function TripCard({ trip }: { trip: Trip }) {
  const deleteTrip = useDeleteTrip();

  return (
    <div className="group relative overflow-hidden rounded-[26px] border border-border bg-white/70 transition-shadow hover:shadow-[0_20px_50px_-32px_rgba(60,40,25,0.6)]">
      <Link to="/trips/$tripId" params={{ tripId: trip.id }} className="block">
        <div className="relative h-[168px] overflow-hidden bg-cream-2">
          {trip.cover_image_url ? (
            <img
              src={trip.cover_image_url}
              alt=""
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="grid size-full place-items-center text-4xl">🧭</div>
          )}
          <span className="absolute top-3 left-3 rounded-full bg-cream/90 px-2.5 py-1 text-[10px] font-bold tracking-wide">
            {trip.status}
          </span>
        </div>
        <div className="p-5">
          <p className="text-[11px] font-bold tracking-[0.14em] text-ink/40 uppercase">
            {trip.primary_destination ?? "Destination TBD"}
          </p>
          <h2 className="font-display mt-1.5 text-[20px] leading-tight font-bold">{trip.name}</h2>
          <p className="mt-2 text-[13px] text-ink/55">
            {formatRange(trip.start_date, trip.end_date)}
          </p>
          <p className="mt-3 text-[12px] font-bold text-brand">{countdownLabel(trip)}</p>
        </div>
      </Link>

      <ConfirmDelete
        title={`Delete "${trip.name}"?`}
        description="This permanently deletes the trip and everything in it: plans, saved places, documents, checklist and travelers. This can't be undone."
        confirmLabel="Delete trip"
        onConfirm={() => deleteTrip.mutateAsync(trip.id).then(() => undefined)}
      >
        <button
          type="button"
          title="Delete trip"
          aria-label={`Delete ${trip.name}`}
          className="absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-cream/90 text-ink/60 opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100 hover:text-red-600 focus:opacity-100"
        >
          <Trash2 className="size-4" />
        </button>
      </ConfirmDelete>
    </div>
  );
}

function TripsPage() {
  const { data: trips, isLoading } = useTrips();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Upcoming");

  const shown = useMemo(() => {
    const all = trips ?? [];
    if (filter === "Archived") return all.filter((t) => t.archived);
    const active = all.filter((t) => !t.archived);
    if (filter === "All") return active;
    if (filter === "Upcoming")
      return active.filter((t) => t.status !== "Completed");
    return active.filter((t) => t.status === filter);
  }, [trips, filter]);

  return (
    <div className="pb-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[36px] leading-none font-extrabold tracking-tight">
            Your trips
          </h1>
          <p className="mt-2 text-[13px] text-ink/55">
            {trips?.length ?? 0} trip{(trips?.length ?? 0) === 1 ? "" : "s"} in your binder.
          </p>
        </div>
        <Link
          to="/trips/new"
          className="rounded-full bg-brand px-5 py-2.5 text-[13px] font-bold text-cream"
        >
          + New trip
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[12px] font-bold transition-colors",
              filter === f
                ? "border-ink bg-ink text-cream"
                : "border-border bg-white/60 text-ink/60 hover:text-ink",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-7">
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[300px] animate-pulse rounded-[26px] bg-cream-2" />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <EmptyState
            title="No trips here yet"
            description="Start a new trip and RMS Rhone will build the day-by-day timeline as you add plans."
            action={
              <Link
                to="/trips/new"
                className="rounded-full bg-brand px-5 py-2.5 text-[13px] font-bold text-cream"
              >
                Plan a trip
              </Link>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((t) => (
              <TripCard key={t.id} trip={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
