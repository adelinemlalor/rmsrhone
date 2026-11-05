import { itemCost, type AgendaItem } from "./travel";

export const SORTS = {
  soonest: "Soonest first",
  newest: "Newest added",
  priciest: "Most expensive",
  az: "A → Z",
} as const;
export type SortKey = keyof typeof SORTS;

export type PlanFilters = {
  q?: string | undefined;
  trip?: string | undefined;
  category?: string | undefined;
  starredOnly?: boolean | undefined;
  sort?: SortKey | undefined;
};

const SEARCHABLE: (keyof AgendaItem)[] = [
  "title",
  "location_name",
  "city",
  "country",
  "address",
  "description",
  "notes",
  "confirmation_number",
  "booking_provider",
  "category",
];

/** Search + filter + sort, as a pure function so it can be unit tested. */
export function findPlans<T extends AgendaItem>(
  plans: T[],
  f: PlanFilters,
  starredIds: Set<string> = new Set(),
): T[] {
  const words = (f.q ?? "").toLowerCase().split(/\s+/).filter(Boolean);
  const out = plans.filter((p) => {
    if (f.trip && p.trip_id !== f.trip) return false;
    if (f.category && p.category !== f.category) return false;
    if (f.starredOnly && !starredIds.has(p.id)) return false;
    if (words.length) {
      const hay = SEARCHABLE.map((k) => String(p[k] ?? "")).join(" ").toLowerCase();
      if (!words.every((w) => hay.includes(w))) return false;
    }
    return true;
  });

  const sort = f.sort ?? "soonest";
  const when = (p: AgendaItem) => `${p.day_date ?? "9999-12-31"} ${p.start_time ?? "99:99"}`;
  out.sort((a, b) => {
    switch (sort) {
      case "newest":
        return (b.created_at ?? "").localeCompare(a.created_at ?? "");
      case "priciest":
        return itemCost(b) - itemCost(a) || when(a).localeCompare(when(b));
      case "az":
        return a.title.localeCompare(b.title);
      default:
        return when(a).localeCompare(when(b));
    }
  });
  return out;
}
