import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAgenda, useTrip, useTripInvalidation } from "@/lib/data";
import { EmptyState, Panel, SectionLabel, CategoryIcon } from "@/components/bits";
import { geocodePlaces } from "@/lib/geocode.functions";
import { TripMap, type MapPoint } from "@/components/trip-map";
import { cn } from "@/lib/utils";
import type { AgendaItem } from "@/lib/travel";

export const Route = createFileRoute("/_authenticated/trips/$tripId/map")({
  head: () => ({
    meta: [
      { title: "Trip map — RMS Rhone" },
      { name: "description", content: "Every stop on your itinerary plotted on one map." },
      { property: "og:title", content: "Trip map — RMS Rhone" },
      {
        property: "og:description",
        content: "Every stop on your itinerary plotted on one map.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TripMapPage,
});

function locationQuery(item: AgendaItem, tripDestination?: string | null) {
  const parts = [item.location_name, item.address, item.city, item.country].filter(Boolean);
  if (!parts.length) return null;
  if (!item.city && !item.country && tripDestination) parts.push(tripDestination);
  return parts.join(", ");
}

function TripMapPage() {
  const { tripId } = Route.useParams();
  const { data: trip } = useTrip(tripId);
  const { data: items = [], isLoading } = useAgenda(tripId);
  const invalidate = useTripInvalidation(tripId);
  const geocode = useServerFn(geocodePlaces);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dayFilter, setDayFilter] = useState<string>("all");
  const [resolving, setResolving] = useState(false);

  const locatable = useMemo(
    () => items.filter((i) => locationQuery(i, trip?.primary_destination) !== null),
    [items, trip?.primary_destination],
  );

  const missing = useMemo(
    () => locatable.filter((i) => i.latitude == null || i.longitude == null),
    [locatable],
  );

  // Resolve coordinates for stops that don't have them yet, then cache to the trip.
  useEffect(() => {
    if (!missing.length || resolving) return;
    const batch = missing.slice(0, 25);
    const queries = batch
      .map((i) => locationQuery(i, trip?.primary_destination))
      .filter((q): q is string => !!q);
    if (!queries.length) return;

    let cancelled = false;
    setResolving(true);
    geocode({ data: { queries } })
      .then(async (results) => {
        if (cancelled) return;
        const byQuery = new Map(results.map((r) => [r.query, r]));
        const updates = batch
          .map((item) => {
            const q = locationQuery(item, trip?.primary_destination);
            const hit = q ? byQuery.get(q) : undefined;
            if (!hit || hit.lat == null || hit.lng == null) return null;
            return { id: item.id, latitude: hit.lat, longitude: hit.lng };
          })
          .filter((u): u is { id: string; latitude: number; longitude: number } => !!u);

        for (const u of updates) {
          await supabase
            .from("agenda_items")
            .update({ latitude: u.latitude, longitude: u.longitude })
            .eq("id", u.id);
        }
        if (updates.length) invalidate();
      })
      .catch((e: Error) => toast.error(e.message))
      .finally(() => !cancelled && setResolving(false));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missing.length]);

  const days = useMemo(
    () => Array.from(new Set(locatable.map((i) => i.day_date).filter(Boolean))).sort() as string[],
    [locatable],
  );

  const mapped = useMemo(
    () =>
      locatable
        .filter((i) => i.latitude != null && i.longitude != null)
        .filter((i) => dayFilter === "all" || i.day_date === dayFilter),
    [locatable, dayFilter],
  );

  const points: MapPoint[] = useMemo(
    () =>
      mapped.map((item, idx) => ({
        id: item.id,
        label: String(idx + 1),
        title: item.title,
        subtitle: [item.location_name ?? item.address, item.day_date].filter(Boolean).join(" · "),
        lat: Number(item.latitude),
        lng: Number(item.longitude),
      })),
    [mapped],
  );

  if (isLoading) return <div className="h-[480px] animate-pulse rounded-[26px] bg-cream-2" />;

  if (!locatable.length) {
    return (
      <EmptyState
        title="No places to map yet"
        description="Add a location, address or city to your itinerary items and they'll appear here."
      />
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <Panel className="p-3">
        <div className="mb-3 flex flex-wrap items-center gap-2 px-1">
          <button
            onClick={() => setDayFilter("all")}
            className={cn(
              "rounded-full border border-border px-3 py-1.5 text-[12px] font-bold",
              dayFilter === "all" ? "border-ink bg-ink text-cream" : "bg-white/60 text-ink/60",
            )}
          >
            All days
          </button>
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setDayFilter(d)}
              className={cn(
                "rounded-full border border-border px-3 py-1.5 text-[12px] font-bold",
                dayFilter === d ? "border-ink bg-ink text-cream" : "bg-white/60 text-ink/60",
              )}
            >
              {new Date(`${d}T12:00:00`).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </button>
          ))}
        </div>
        <div className="h-[520px]">
          <TripMap points={points} activeId={activeId} onSelect={setActiveId} />
        </div>
      </Panel>

      <Panel className="p-5">
        <SectionLabel>Stops ({points.length})</SectionLabel>
        {resolving ? (
          <p className="mt-2 text-[12px] text-ink/50">Looking up locations…</p>
        ) : null}
        <ol className="mt-3 space-y-1.5">
          {mapped.map((item, idx) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveId(item.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-[16px] border border-transparent px-3 py-2.5 text-left transition",
                  activeId === item.id ? "border-border bg-cream-2" : "hover:bg-cream-2/60",
                )}
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-cream">
                  {idx + 1}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-[13px] font-bold text-ink">
                    <CategoryIcon category={item.category} />
                    <span className="truncate">{item.title}</span>
                  </span>
                  <span className="block truncate text-[12px] text-ink/55">
                    {item.location_name ?? item.address ?? item.city}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ol>
        {missing.length && !resolving ? (
          <p className="mt-3 text-[12px] text-ink/45">
            {missing.length} stop{missing.length === 1 ? "" : "s"} couldn't be located precisely.
          </p>
        ) : null}
      </Panel>
    </div>
  );
}
