import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useSaveTrip } from "@/lib/data";
import { TRIP_TYPES } from "@/lib/travel";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/trips/new")({
  head: () => ({
    meta: [
      { title: "New trip — Wayfarer" },
      { name: "description", content: "Start a new trip and build its day-by-day plan." },
      { property: "og:title", content: "New trip — Wayfarer" },
      {
        property: "og:description",
        content: "Start a new trip and build its day-by-day plan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewTripPage,
});

const field =
  "w-full rounded-2xl border border-border bg-white px-4 py-3 text-[14px] outline-none focus:border-brand";
const label = "mb-1.5 block text-[12px] font-bold tracking-wide text-ink/50 uppercase";

function NewTripPage() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();
  const saveTrip = useSaveTrip();

  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [origin, setOrigin] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [type, setType] = useState(TRIP_TYPES[0] ?? "Leisure");
  const [currency, setCurrency] = useState("USD");
  const [budget, setBudget] = useState("");
  const [cover, setCover] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const trip = await saveTrip.mutateAsync({
        owner_id: user.id,
        name: name.trim(),
        primary_destination: destination.trim() || null,
        origin_city: origin.trim() || null,
        start_date: start || null,
        end_date: end || start || null,
        trip_type: type,
        currency,
        budget_total: budget ? Number(budget) : null,
        cover_image_url: cover.trim() || null,
        status: "Planning",
      });
      toast.success("Trip created");
      void navigate({ to: "/trips/$tripId", params: { tripId: trip.id } });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not create trip";
      setError(msg);
      toast.error(msg);
    }
  }

  return (
    <div className="pb-12">
      <h1 className="font-display text-[34px] leading-none font-extrabold tracking-tight">
        Start a new trip
      </h1>
      <p className="mt-2 text-[13px] text-ink/55">
        Only a name is required — everything else can come later.
      </p>

      <form onSubmit={submit} className="mt-8 max-w-[720px] space-y-5">
        <div>
          <label className={label} htmlFor="trip-name">
            Trip name
          </label>
          <input
            id="trip-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Two weeks in Brazil"
            className={field}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="dest">
              Primary destination
            </label>
            <input
              id="dest"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Rio de Janeiro, Brazil"
              className={field}
            />
          </div>
          <div>
            <label className={label} htmlFor="origin">
              Departing from
            </label>
            <input
              id="origin"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="New York, NY"
              className={field}
            />
          </div>
          <div>
            <label className={label} htmlFor="start">
              Start date
            </label>
            <input
              id="start"
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className={field}
            />
          </div>
          <div>
            <label className={label} htmlFor="end">
              End date
            </label>
            <input
              id="end"
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className={field}
            />
          </div>
          <div>
            <label className={label} htmlFor="currency">
              Currency
            </label>
            <input
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase().slice(0, 3))}
              className={field}
            />
          </div>
          <div>
            <label className={label} htmlFor="budget">
              Total budget (optional)
            </label>
            <input
              id="budget"
              type="number"
              min="0"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="4000"
              className={field}
            />
          </div>
        </div>

        <div>
          <span className={label}>Trip type</span>
          <div className="flex flex-wrap gap-2">
            {TRIP_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-[12px] font-bold",
                  type === t
                    ? "border-ink bg-ink text-cream"
                    : "border-border bg-white/60 text-ink/60",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={label} htmlFor="cover">
            Cover image URL (optional)
          </label>
          <input
            id="cover"
            value={cover}
            onChange={(e) => setCover(e.target.value)}
            placeholder="https://…"
            className={field}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saveTrip.isPending}
            className="rounded-full bg-brand px-6 py-3 text-[14px] font-bold text-cream disabled:opacity-60"
          >
            {saveTrip.isPending ? "Creating…" : "Create trip"}
          </button>
          <button
            type="button"
            onClick={() => void navigate({ to: "/trips" })}
            className="rounded-full border border-border px-6 py-3 text-[14px] font-bold text-ink/60"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
