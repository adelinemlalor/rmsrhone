import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAllSavedPlaces, useTrips } from "@/lib/data";
import { EmptyState, Panel } from "@/components/bits";
import { money, PLACE_CATEGORIES, PRIORITY_ICON } from "@/lib/travel";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/explore")({
  head: () => ({
    meta: [
      { title: "Explore ideas — RMS Rhone" },
      {
        name: "description",
        content: "Every place you've saved across all of your trips, in one browsable board.",
      },
      { property: "og:title", content: "Explore ideas — RMS Rhone" },
      {
        property: "og:description",
        content: "Every place you've saved across all of your trips, in one browsable board.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExplorePage,
});

function ExplorePage() {
  const { data: places } = useAllSavedPlaces();
  const { data: trips } = useTrips();
  const [category, setCategory] = useState("All");
  const [q, setQ] = useState("");

  const tripName = useMemo(
    () => new Map((trips ?? []).map((t) => [t.id, t.name])),
    [trips],
  );

  const shown = (places ?? []).filter(
    (p) =>
      (category === "All" || p.category === category) &&
      (q.trim() === "" ||
        `${p.name} ${p.city ?? ""} ${p.notes ?? ""}`.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="pb-10">
      <h1 className="font-display text-[36px] leading-none font-extrabold tracking-tight">
        Explore ideas
      </h1>
      <p className="mt-2 text-[13px] text-ink/55">
        Places you've saved across every trip — the shortlist before the schedule.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search places…"
          className="w-full max-w-[280px] rounded-full border border-border bg-white px-4 py-2 text-[13px] outline-none focus:border-brand"
        />
        {["All", ...PLACE_CATEGORIES].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[12px] font-bold",
              category === c
                ? "border-ink bg-ink text-cream"
                : "border-border bg-white/60 text-ink/60",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-7">
        {shown.length === 0 ? (
          <EmptyState
            title="Nothing saved yet"
            description="Save restaurants, sights and stays from inside a trip and they'll collect here."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((p) => (
              <Panel key={p.id} className="flex min-w-0 flex-col gap-2 [overflow-wrap:anywhere]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold tracking-[0.14em] text-ink/40 uppercase">
                      {p.category}
                      {p.meal ? ` · ${p.meal}` : ""}
                    </p>
                    <h2 className="font-display mt-1 text-[17px] leading-tight font-bold">
                      {p.name}
                    </h2>
                  </div>
                  <span className="text-lg" title={p.priority}>
                    {PRIORITY_ICON[p.priority] ?? ""}
                  </span>
                </div>
                <p className="text-[12px] text-ink/50">
                  {p.city ?? p.destination ?? "—"} · {tripName.get(p.trip_id) ?? "Trip"}
                </p>
                {p.notes ? <p className="text-[13px] text-ink/60">{p.notes}</p> : null}
                {p.url && /^https?:\/\//i.test(p.url) ? (
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1.5 text-[13px] font-semibold text-primary underline underline-offset-4">
                    <ExternalLink className="mt-0.5 size-3.5 shrink-0" />
                    <span className="min-w-0">{p.url}</span>
                  </a>
                ) : null}
                <div className="mt-auto flex items-center justify-between pt-2 text-[12px] font-bold">
                  <span className={p.scheduled ? "text-accent" : "text-ink/40"}>
                    {p.scheduled ? "Scheduled" : "Idea"}
                  </span>
                  <span>{p.estimated_cost ? money(p.estimated_cost) : ""}</span>
                </div>
              </Panel>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
