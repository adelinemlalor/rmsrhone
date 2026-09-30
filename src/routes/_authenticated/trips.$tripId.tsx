import { useState } from "react";
import { createFileRoute, Link, Outlet, useRouter } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import { useAgenda, useSaveTrip, useTravelers, useTrip } from "@/lib/data";
import { AvatarStack } from "@/components/bits";
import { buildICS, countdownLabel, formatRange, money, itemCost } from "@/lib/travel";

export const Route = createFileRoute("/_authenticated/trips/$tripId")({
  component: TripLayout,
  errorComponent: ({ error }) => (
    <div role="alert" className="rounded-[24px] border border-border bg-white/70 p-8">
      <h1 className="font-display text-xl font-bold">This trip didn't load</h1>
      <p className="mt-2 text-[13px] text-ink/55">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="rounded-[24px] border border-border bg-white/70 p-8">
      <h1 className="font-display text-xl font-bold">Trip not found</h1>
    </div>
  ),
});

const TABS = [
  { to: "/trips/$tripId", label: "Overview", exact: true },
  { to: "/trips/$tripId/itinerary", label: "Itinerary" },
  { to: "/trips/$tripId/map", label: "Map" },
  { to: "/trips/$tripId/saved", label: "Saved places" },
  { to: "/trips/$tripId/budget", label: "Budget" },
  { to: "/trips/$tripId/documents", label: "Documents" },
  { to: "/trips/$tripId/travelers", label: "Travelers" },
  { to: "/trips/$tripId/checklist", label: "Checklist" },
] as const;

function TripLayout() {
  const { tripId } = Route.useParams();
  const { data: trip, isLoading } = useTrip(tripId);
  const { data: travelers } = useTravelers(tripId);
  const { data: items } = useAgenda(tripId);
  const router = useRouter();
  const saveTrip = useSaveTrip();
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");

  if (isLoading || !trip) {
    return <div className="h-[320px] animate-pulse rounded-[26px] bg-cream-2" />;
  }

  const spent = (items ?? []).reduce((sum, i) => sum + itemCost(i), 0);

  function exportICS() {
    if (!trip) return;
    const blob = new Blob([buildICS(trip, items ?? [])], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${trip.name.replace(/\s+/g, "-").toLowerCase()}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="pb-12">
      <div className="overflow-hidden rounded-[28px] border border-border bg-white/70">
        <div className="relative h-[200px] bg-cream-2 sm:h-[260px]">
          {trip.cover_image_url ? (
            <img src={trip.cover_image_url} alt="" className="size-full object-cover" />
          ) : (
            <div className="grid size-full place-items-center text-5xl">🧭</div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-6">
            <p className="text-[11px] font-bold tracking-[0.16em] text-cream/80 uppercase">
              {trip.primary_destination ?? "Destination TBD"}
            </p>
            <h1 className="font-display mt-1 text-[30px] leading-none font-extrabold tracking-tight text-cream sm:text-[38px]">
              {trip.name}
            </h1>
            {editingName ? (
              <form
                className="mt-3 flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const next = nameDraft.trim();
                  if (next && next !== trip.name) {
                    saveTrip.mutate({ id: trip.id, name: next });
                  }
                  setEditingName(false);
                }}
              >
                <input
                  autoFocus
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  placeholder="Trip name"
                  className="w-[260px] rounded-full border border-cream/30 bg-ink/40 px-4 py-1.5 text-[14px] font-bold text-cream outline-none placeholder:text-cream/40 focus:border-cream/60"
                />
                <button
                  type="submit"
                  disabled={saveTrip.isPending}
                  className="rounded-full bg-cream px-3 py-1 text-[12px] font-bold text-ink disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingName(false)}
                  className="rounded-full border border-cream/30 px-3 py-1 text-[12px] font-bold text-cream/80"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setNameDraft(trip.name);
                  setEditingName(true);
                }}
                title="Rename trip"
                className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-ink/30 px-2.5 py-1 text-[11px] font-bold text-cream/80 backdrop-blur transition-colors hover:bg-ink/50 hover:text-cream"
              >
                <Pencil className="size-3" />
                Rename
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px]">
            <span className="font-semibold">{formatRange(trip.start_date, trip.end_date)}</span>
            <span className="font-bold text-brand">{countdownLabel(trip)}</span>
            <span className="text-ink/50">
              {(items ?? []).length} plans · {money(spent, trip.currency)} committed
            </span>
            <AvatarStack travelers={travelers ?? []} />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={exportICS}
              className="rounded-full border border-border px-4 py-2 text-[12px] font-bold text-ink/60"
            >
              Export .ics
            </button>
            <button
              type="button"
              onClick={() =>
                void import("@/lib/trip-pdf").then((m) => m.exportTripPDF(trip, items ?? [], travelers ?? []))
              }
              className="rounded-full border border-border px-4 py-2 text-[12px] font-bold text-ink/60"
            >
              Export PDF
            </button>
            <button
              type="button"
              onClick={() => void router.navigate({ to: "/trips/$tripId/itinerary", params: { tripId } })}
              className="rounded-full bg-brand px-4 py-2 text-[12px] font-bold text-cream"
            >
              Open itinerary
            </button>
          </div>
        </div>
      </div>

      <nav className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            params={{ tripId }}
            activeOptions={{ exact: "exact" in t }}
            activeProps={{ className: "border-ink bg-ink text-cream" }}
            className="shrink-0 rounded-full border border-border bg-white/60 px-4 py-2 text-[12px] font-bold whitespace-nowrap text-ink/60"
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="mt-7">
        <Outlet />
      </div>
    </div>
  );
}
