import { useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useAllPlans, useMyStars, useTrips } from "@/lib/data";
import { findPlans, SORTS, type PlanFilters, type SortKey } from "@/lib/find";
import { CategoryIcon, EmptyState, StatusPill } from "@/components/bits";
import { StarButton } from "@/components/star-button";
import { CATEGORIES, formatDayShort, itemCost, money, timeRange } from "@/lib/travel";
import { cn } from "@/lib/utils";

const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);

export const Route = createFileRoute("/_authenticated/plans")({
  validateSearch: (s: Record<string, unknown>): PlanFilters => ({
    q: str(s["q"]),
    trip: str(s["trip"]),
    category: str(s["category"]),
    starredOnly: s["starredOnly"] === true || s["starredOnly"] === "true" ? true : undefined,
    sort: str(s["sort"]) && str(s["sort"])! in SORTS ? (s["sort"] as SortKey) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "All plans — RMS Rhone" },
      { name: "description", content: "Search, filter and sort every plan across all your trips." },
    ],
  }),
  component: PlansPage,
});

const control =
  "rounded-full border border-border bg-white/70 px-4 py-2 text-[13px] font-semibold text-ink/75 outline-none focus:border-brand";

function PlansPage() {
  const filters = Route.useSearch();
  const navigate = useNavigate({ from: "/plans" });
  const { data: plans, isLoading } = useAllPlans();
  const { data: trips } = useTrips();
  const { data: stars } = useMyStars();

  const set = (patch: Partial<PlanFilters>) =>
    void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  const results = useMemo(() => findPlans(plans ?? [], filters, stars), [plans, filters, stars]);
  const usedCategories = useMemo(
    () => CATEGORIES.filter((c) => (plans ?? []).some((p) => p.category === c)),
    [plans],
  );
  const filtering = !!(filters.q || filters.trip || filters.category || filters.starredOnly);

  return (
    <div className="pb-12">
      <h1 className="font-display text-[34px] leading-none font-extrabold tracking-tight">
        All plans
      </h1>
      <p className="mt-2 text-[13px] text-ink/55">
        {isLoading
          ? "Loading…"
          : filtering
            ? `${results.length} of ${plans?.length ?? 0} plans match.`
            : `${plans?.length ?? 0} plans across ${trips?.length ?? 0} trips.`}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <label className="relative min-w-[240px] flex-1">
          <span className="sr-only">Search plans</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink/40" />
          <input
            type="search"
            value={filters.q ?? ""}
            onChange={(e) => set({ q: e.target.value || undefined })}
            placeholder="Search by name, place, city, notes or confirmation #…"
            className={cn(control, "w-full pl-10")}
          />
        </label>
        <select
          aria-label="Filter by trip"
          value={filters.trip ?? ""}
          onChange={(e) => set({ trip: e.target.value || undefined })}
          className={control}
        >
          <option value="">All trips</option>
          {(trips ?? []).map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by category"
          value={filters.category ?? ""}
          onChange={(e) => set({ category: e.target.value || undefined })}
          className={control}
        >
          <option value="">All categories</option>
          {usedCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          aria-label="Sort plans"
          value={filters.sort ?? "soonest"}
          onChange={(e) => set({ sort: e.target.value === "soonest" ? undefined : (e.target.value as SortKey) })}
          className={control}
        >
          {Object.entries(SORTS).map(([k, label]) => (
            <option key={k} value={k}>
              Sort: {label}
            </option>
          ))}
        </select>
        <button
          type="button"
          aria-pressed={!!filters.starredOnly}
          onClick={() => set({ starredOnly: filters.starredOnly ? undefined : true })}
          className={cn(
            control,
            filters.starredOnly && "border-amber-400 bg-amber-50 text-amber-700",
          )}
        >
          ★ Starred only
        </button>
        {filtering ? (
          <button
            type="button"
            onClick={() => void navigate({ search: { sort: filters.sort }, replace: true })}
            className="inline-flex items-center gap-1 px-2 text-[12px] font-bold text-ink/50 hover:text-ink"
          >
            <X className="size-3.5" /> Clear
          </button>
        ) : null}
      </div>

      {!isLoading && results.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title={filtering ? "Nothing matches" : "No plans yet"}
            description={
              filtering
                ? "Try a different word, or clear the filters."
                : "Open a trip's itinerary and add your first plan."
            }
          />
        </div>
      ) : null}

      <ul className="mt-6 space-y-2.5">
        {results.map((p) => (
          <li key={p.id} className="relative">
            <Link
              to="/trips/$tripId/plans/$planId"
              params={{ tripId: p.trip_id, planId: p.id }}
              className="flex items-center gap-4 rounded-[20px] border border-border bg-white/75 p-3.5 pr-14 transition-shadow hover:shadow-[0_16px_40px_-30px_rgba(60,40,25,0.7)]"
            >
              <CategoryIcon category={p.category} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display truncate text-[15px] font-bold">{p.title}</h2>
                  <StatusPill status={p.status} />
                </div>
                <p className="mt-0.5 truncate text-[12px] text-ink/50">
                  {[
                    p.trips?.name,
                    p.day_date ? formatDayShort(p.day_date) : "Unscheduled",
                    p.start_time ? timeRange(p) : null,
                    p.location_name ?? p.city,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <span className="hidden shrink-0 text-[13px] font-bold text-ink/60 sm:block">
                {itemCost(p) > 0 ? money(itemCost(p), p.currency ?? p.trips?.currency ?? "USD") : ""}
              </span>
            </Link>
            <StarButton itemId={p.id} className="absolute top-1/2 right-3 -translate-y-1/2" />
          </li>
        ))}
      </ul>
    </div>
  );
}
