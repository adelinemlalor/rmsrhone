import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  useDeletePlace,
  useSaveAgendaItem,
  useSavePlace,
  useSavedPlaces,
  useTravelers,
  useTrip,
} from "@/lib/data";
import { EmptyState, Panel, SectionLabel } from "@/components/bits";
import {
  money,
  PLACE_CATEGORIES,
  PRIORITIES,
  PRIORITY_ICON,
  tripDates,
  type SavedPlace,
} from "@/lib/travel";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/trips/$tripId/saved")({
  head: () => ({
    meta: [
      { title: "Saved places — RMS Rhone" },
      { name: "description", content: "Ideas and shortlisted places for this trip." },
      { property: "og:title", content: "Saved places — RMS Rhone" },
      { property: "og:description", content: "Ideas and shortlisted places for this trip." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SavedPage,
});

const field =
  "w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[14px] outline-none focus:border-brand";

function SavedPage() {
  const { tripId } = Route.useParams();
  const { data: trip } = useTrip(tripId);
  const { data: places } = useSavedPlaces(tripId);
  const { data: travelers } = useTravelers(tripId);
  const savePlace = useSavePlace(tripId);
  const deletePlace = useDeletePlace(tripId);
  const saveItem = useSaveAgendaItem(tripId);

  const [name, setName] = useState("");
  const [category, setCategory] = useState(PLACE_CATEGORIES[0] ?? "Restaurant");
  const [priority, setPriority] = useState(PRIORITIES[1] ?? "Want to Do");
  const [notes, setNotes] = useState("");
  const [cost, setCost] = useState("");
  const [filter, setFilter] = useState("All");

  if (!trip) return null;
  const days = tripDates(trip);
  const shown = (places ?? []).filter((p) => filter === "All" || p.category === filter);

  async function schedule(place: SavedPlace, date: string) {
    await saveItem.mutateAsync({
      day_date: date,
      title: place.name,
      category: place.category === "Restaurant" ? "Restaurant" : "Activity",
      status: "Idea",
      location_name: place.location_name ?? place.city,
      address: place.address,
      notes: place.notes,
      cost_estimated: place.estimated_cost,
      saved_place_id: place.id,
      participants: (travelers ?? []).map((t) => t.name),
    });
    await savePlace.mutateAsync({ id: place.id, scheduled: true });
    toast.success(`${place.name} added to the itinerary`);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="mb-5 flex flex-wrap gap-2">
          {["All", ...PLACE_CATEGORIES].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[12px] font-bold",
                filter === c
                  ? "border-ink bg-ink text-cream"
                  : "border-border bg-white/60 text-ink/55",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <EmptyState
            title="No saved places yet"
            description="Collect the restaurants, sights and neighbourhoods you're curious about, then schedule the best ones."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {shown.map((p) => (
              <Panel key={p.id} className="flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.14em] text-ink/40 uppercase">
                      {p.category}
                    </p>
                    <h3 className="font-display mt-1 text-[17px] leading-tight font-bold">
                      {p.name}
                    </h3>
                  </div>
                  <span title={p.priority}>{PRIORITY_ICON[p.priority] ?? ""}</span>
                </div>
                {p.notes ? <p className="mt-2 text-[13px] text-ink/60">{p.notes}</p> : null}
                <p className="mt-2 text-[12px] text-ink/45">
                  {[p.city, p.estimated_cost ? money(p.estimated_cost, trip.currency) : null]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {p.scheduled ? (
                    <span className="rounded-full bg-accent/12 px-2.5 py-1 text-[11px] font-bold text-accent">
                      Scheduled
                    </span>
                  ) : (
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) void schedule(p, e.target.value);
                      }}
                      className="rounded-full border border-border bg-white px-3 py-1.5 text-[12px] font-bold"
                    >
                      <option value="">Schedule on…</option>
                      {days.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    type="button"
                    onClick={() => deletePlace.mutate(p.id)}
                    className="text-[12px] font-bold text-ink/40"
                  >
                    Remove
                  </button>
                </div>
              </Panel>
            ))}
          </div>
        )}
      </div>

      <Panel className="h-fit">
        <SectionLabel>Save an idea</SectionLabel>
        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Place name"
            className={field}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={field}
          >
            {PLACE_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className={field}
          >
            {PRIORITIES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="Estimated cost"
            className={field}
          />
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Why it caught your eye…"
            className={field}
          />
          <button
            type="button"
            onClick={async () => {
              if (!name.trim()) return;
              await savePlace.mutateAsync({
                name: name.trim(),
                category,
                priority,
                notes: notes.trim() || null,
                estimated_cost: cost ? Number(cost) : null,
                destination: trip.primary_destination,
              });
              setName("");
              setNotes("");
              setCost("");
              toast.success("Saved");
            }}
            className="w-full rounded-full bg-brand px-4 py-2.5 text-[13px] font-bold text-cream"
          >
            Save place
          </button>
        </div>
      </Panel>
    </div>
  );
}
