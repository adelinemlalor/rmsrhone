import { useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAllPlans, useTrips } from "@/lib/data";
import { defaultMonth, monthGrid, monthKey, parseMonth, toKey } from "@/lib/calendar";
import { CATEGORY_ICON, formatTime } from "@/lib/travel";
import { cn } from "@/lib/utils";

/**
 * Trip colors in a fixed order (validated for color-blind separation against the
 * cream surface). Trips are ordered by start date so a trip keeps its color.
 * The trip name is always shown too, so color is never the only cue.
 */
const TRIP_COLORS = ["#1f7a4d", "#3b6ea8", "#c0662b", "#a04d8f", "#a08417"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_PER_DAY = 3;

export const Route = createFileRoute("/_authenticated/calendar")({
  validateSearch: (s: Record<string, unknown>): { m?: string | undefined } => ({
    m: typeof s["m"] === "string" && /^\d{4}-\d{2}$/.test(s["m"]) ? s["m"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Calendar — RMS Rhone" },
      { name: "description", content: "Every plan from every trip on one month calendar." },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  const { m } = Route.useSearch();
  const navigate = useNavigate({ from: "/calendar" });
  const { data: plans, isLoading } = useAllPlans();
  const { data: trips } = useTrips();
  const today = toKey(new Date());

  const current = m ?? (plans ? defaultMonth(plans.map((p) => p.day_date), new Date()) : undefined);
  const { year, month } = parseMonth(current, new Date());
  const weeks = useMemo(() => monthGrid(year, month), [year, month]);
  const go = (delta: number) => void navigate({ search: { m: monthKey(year, month + delta) } });

  const colorOf = useMemo(() => {
    const ordered = [...(trips ?? [])].sort((a, b) => (a.start_date ?? "9999").localeCompare(b.start_date ?? "9999"));
    const map = new Map(ordered.map((t, i) => [t.id, TRIP_COLORS[i % TRIP_COLORS.length]!]));
    return (id: string) => map.get(id) ?? "#7a7a7a";
  }, [trips]);

  const byDay = useMemo(() => {
    const map = new Map<string, NonNullable<typeof plans>>();
    for (const p of plans ?? []) {
      if (!p.day_date) continue;
      const list = map.get(p.day_date) ?? [];
      list.push(p);
      map.set(p.day_date, list);
    }
    for (const list of map.values())
      list.sort((a, b) => (a.start_time ?? "99").localeCompare(b.start_time ?? "99"));
    return map;
  }, [plans]);

  /** Trips whose date range covers a given day. */
  const tripsOn = (key: string) =>
    (trips ?? []).filter((t) => t.start_date && key >= t.start_date && key <= (t.end_date ?? t.start_date));

  const monthName = new Date(year, month, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const inThisMonth = weeks.flat().filter((d) => d.inMonth).reduce((n, d) => n + (byDay.get(d.key)?.length ?? 0), 0);
  const visibleTrips = (trips ?? []).filter((t) => weeks.flat().some((d) => d.inMonth && tripsOn(d.key).includes(t)));

  return (
    <div className="pb-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[34px] leading-none font-extrabold tracking-tight">{monthName}</h1>
          <p className="mt-2 text-[13px] text-ink/55">
            {isLoading ? "Loading…" : `${inThisMonth} plan${inThisMonth === 1 ? "" : "s"} this month across all trips.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => go(-1)} aria-label="Previous month" className="grid size-9 place-items-center rounded-full border border-border bg-white/70">
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => void navigate({ search: { m: today.slice(0, 7) } })}
            className="rounded-full border border-border bg-white/70 px-4 py-2 text-[12px] font-bold"
          >
            Today
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next month" className="grid size-9 place-items-center rounded-full border border-border bg-white/70">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {visibleTrips.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-3" aria-label="Trips this month">
          {visibleTrips.map((t) => (
            <li key={t.id} className="flex items-center gap-1.5 text-[12px] font-semibold text-ink/70">
              <span className="size-2.5 rounded-full" style={{ background: colorOf(t.id) }} aria-hidden />
              {t.name}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-5 overflow-x-auto rounded-[24px] border border-border bg-white/60">
        <div className="grid min-w-[720px] grid-cols-7 border-b border-border text-[11px] font-bold tracking-[0.12em] text-ink/45 uppercase">
          {WEEKDAYS.map((d) => (
            <div key={d} className="px-2.5 py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="min-w-[720px]">
          {weeks.map((week) => (
            <div key={week[0]!.key} className="grid grid-cols-7 border-b border-border/70 last:border-0">
              {week.map((d) => {
                const dayPlans = byDay.get(d.key) ?? [];
                const onTrips = tripsOn(d.key);
                const tint = onTrips[0] ? colorOf(onTrips[0].id) : null;
                const startsHere = onTrips.filter((t) => t.start_date === d.key || d.day === 1 || new Date(d.key + "T00:00").getDay() === 0);
                return (
                  <div
                    key={d.key}
                    className={cn("min-h-[112px] border-r border-border/70 p-1.5 last:border-0", !d.inMonth && "opacity-40")}
                    style={tint ? { background: `${tint}14` } : undefined}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={cn(
                          "grid size-6 place-items-center rounded-full text-[12px] font-bold",
                          d.key === today ? "bg-ink text-cream" : "text-ink/60",
                        )}
                      >
                        {d.day}
                      </span>
                      {startsHere.length > 0 && d.inMonth ? (
                        <span className="truncate text-[10px] font-bold" style={{ color: colorOf(startsHere[0]!.id) }}>
                          {startsHere.map((t) => t.name).join(" · ")}
                        </span>
                      ) : null}
                    </div>
                    <ul className="mt-1 space-y-0.5">
                      {dayPlans.slice(0, MAX_PER_DAY).map((p) => (
                        <li key={p.id}>
                          <Link
                            to="/trips/$tripId/plans/$planId"
                            params={{ tripId: p.trip_id, planId: p.id }}
                            title={`${p.title} — ${p.trips?.name ?? ""}`}
                            className="flex items-center gap-1 truncate rounded-r-md border-l-[3px] bg-white/80 px-1.5 py-0.5 text-[11px] leading-tight text-ink/80 hover:bg-white"
                            style={{ borderLeftColor: colorOf(p.trip_id) }}
                          >
                            <span aria-hidden>{CATEGORY_ICON[p.category] ?? "📍"}</span>
                            {p.start_time ? <span className="font-bold text-ink/50">{formatTime(p.start_time).replace(":00", "")}</span> : null}
                            <span className="truncate">{p.title}</span>
                          </Link>
                        </li>
                      ))}
                      {dayPlans.length > MAX_PER_DAY ? (
                        <li>
                          <Link
                            to="/trips/$tripId/day/$date"
                            params={{ tripId: dayPlans[0]!.trip_id, date: d.key }}
                            className="px-1.5 text-[11px] font-bold text-brand"
                          >
                            +{dayPlans.length - MAX_PER_DAY} more
                          </Link>
                        </li>
                      ) : null}
                    </ul>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
