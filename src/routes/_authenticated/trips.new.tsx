import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useSaveTrip } from "@/lib/data";
import { TRIP_TYPES } from "@/lib/travel";
import { cn } from "@/lib/utils";

import { hasErrors, validateTrip, type TripErrors } from "@/lib/validation";

function FieldError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-[12px] font-semibold text-destructive">
      {message}
    </p>
  );
}

export const Route = createFileRoute("/_authenticated/trips/new")({
  head: () => ({
    meta: [
      { title: "New trip — RMS Rhone" },
      { name: "description", content: "Start a new trip and build its day-by-day plan." },
      { property: "og:title", content: "New trip — RMS Rhone" },
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
  const [stops, setStops] = useState<{ from: string; to: string }[]>([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [type, setType] = useState(TRIP_TYPES[0] ?? "Leisure");
  const [currency, setCurrency] = useState("USD");
  const [budget, setBudget] = useState("");
  const [cover, setCover] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<TripErrors>({});


  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const problems = validateTrip({ name, start, end, budget });
    setErrors(problems);
    if (hasErrors(problems)) return;
    try {
      const trip = await saveTrip.mutateAsync({
        owner_id: user.id,
        name: name.trim(),
        primary_destination: destination.trim() || null,
        additional_destinations: stops
          .map((s) => s.to.trim())
          .filter(Boolean),
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

      <form onSubmit={submit} noValidate className="mt-8 max-w-[720px] space-y-5">
        <div>
          <label className={label} htmlFor="trip-name">
            Trip name
          </label>
          <input
            id="trip-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((x) => ({ ...x, name: undefined }));
            }}
            placeholder="Two weeks in Brazil"
            aria-invalid={!!errors.name}
            className={field + (errors.name ? " border-destructive" : "")}
          />
          <FieldError message={errors.name} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="origin">
              Departing from
            </label>
            <input
              id="origin"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="San Jose, Costa Rica"
              className={field}
            />
          </div>
          <div>
            <label className={label} htmlFor="dest">
              Arrival
            </label>
            <input
              id="dest"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Rio de Janeiro, Brazil"
              className={field}
            />
          </div>

          <div className="sm:col-span-2">
            {stops.length > 0 ? (
              <div className="space-y-4">
                {stops.map((stop, i) => (
                  <div key={i} className="flex items-end gap-2">
                    <div className="grid flex-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className={label} htmlFor={`stop-from-${i}`}>
                          Departing from
                        </label>
                        <input
                          id={`stop-from-${i}`}
                          value={stop.from}
                          onChange={(e) =>
                            setStops((prev) =>
                              prev.map((s, j) => (j === i ? { ...s, from: e.target.value } : s)),
                            )
                          }
                          placeholder="Cusco, Peru"
                          className={field}
                        />
                      </div>
                      <div>
                        <label className={label} htmlFor={`stop-to-${i}`}>
                          Arrival {i + 2}
                        </label>
                        <input
                          id={`stop-to-${i}`}
                          value={stop.to}
                          onChange={(e) =>
                            setStops((prev) =>
                              prev.map((s, j) => (j === i ? { ...s, to: e.target.value } : s)),
                            )
                          }
                          placeholder="Búzios, Brazil"
                          className={field}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStops((prev) => prev.filter((_, j) => j !== i))}
                      aria-label="Remove destination"
                      className="h-[46px] shrink-0 rounded-2xl border border-border px-4 text-[16px] font-bold text-ink/50"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            <button
              type="button"
              onClick={() =>
                setStops((prev) => [
                  ...prev,
                  { from: prev[prev.length - 1]?.to || destination, to: "" },
                ])
              }
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-white/60 px-4 py-2 text-[12px] font-bold text-ink/70"
            >
              <span className="text-[15px] leading-none">+</span> Add another destination
            </button>
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
              onChange={(e) => {
                setEnd(e.target.value);
                setErrors((x) => ({ ...x, end: undefined }));
              }}
              aria-invalid={!!errors.end}
              className={field + (errors.end ? " border-destructive" : "")}
            />
            <FieldError message={errors.end} />
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
              onChange={(e) => {
                setBudget(e.target.value);
                setErrors((x) => ({ ...x, budget: undefined }));
              }}
              placeholder="4000"
              aria-invalid={!!errors.budget}
              className={field + (errors.budget ? " border-destructive" : "")}
            />
            <FieldError message={errors.budget} />
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

        {error ? (
          <p className="rounded-2xl border border-border bg-white px-4 py-3 text-[13px] font-semibold text-destructive">
            {error}
          </p>
        ) : null}

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
