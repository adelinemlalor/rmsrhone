export type Role = "owner" | "editor" | "viewer";

export interface Trip {
  id: string;
  owner_id: string;
  name: string;
  primary_destination: string | null;
  additional_destinations: string[];
  start_date: string | null;
  end_date: string | null;
  origin_city: string | null;
  trip_type: string;
  cover_image_url: string | null;
  currency: string;
  notes: string | null;
  status: string;
  budget_total: number | null;
  archived: boolean;
  created_at: string;
}

export interface Traveler {
  id: string;
  trip_id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  role: Role;
  color: string;
}

export interface AgendaItem {
  id: string;
  trip_id: string;
  day_date: string | null;
  start_time: string | null;
  end_time: string | null;
  time_zone: string | null;
  category: string;
  title: string;
  description: string | null;
  location_name: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  map_url: string | null;
  status: string;
  completed: boolean;
  confirmation_number: string | null;
  booking_provider: string | null;
  booking_url: string | null;
  reservation_name: string | null;
  reservation_email: string | null;
  reservation_phone: string | null;
  cost_estimated: number | null;
  cost_actual: number | null;
  currency: string | null;
  paid: boolean;
  paid_by: string | null;
  split_between: string[];
  shared_expense: boolean;
  participants: string[];
  contact_company: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  contact_website: string | null;
  notes: string | null;
  cancellation_deadline: string | null;
  cancellation_policy: string | null;
  refundable: boolean | null;
  cancellation_notes: string | null;
  transport_from: string | null;
  transport_to: string | null;
  transport_mode: string | null;
  transport_departure_time: string | null;
  transport_duration_minutes: number | null;
  transport_cost: number | null;
  travel_next_mode: string | null;
  travel_next_minutes: number | null;
  travel_next_note: string | null;
  image_url: string | null;
  details: Record<string, unknown>;
  sort_order: number;
  saved_place_id: string | null;
}

export interface SavedPlace {
  id: string;
  trip_id: string;
  name: string;
  category: string;
  location_name: string | null;
  address: string | null;
  city: string | null;
  destination: string | null;
  url: string | null;
  image_url: string | null;
  notes: string | null;
  estimated_cost: number | null;
  priority: string;
  tags: string[];
  scheduled: boolean;
}

export interface TripDocument {
  id: string;
  trip_id: string;
  agenda_item_id: string | null;
  name: string;
  category: string;
  file_path: string | null;
  external_url: string | null;
  mime_type: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface ItemLink {
  id: string;
  trip_id: string;
  agenda_item_id: string | null;
  label: string;
  url: string;
}

export interface Comment {
  id: string;
  trip_id: string;
  agenda_item_id: string | null;
  author_id: string | null;
  author_name: string;
  body: string;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  trip_id: string;
  section: string;
  title: string;
  notes: string | null;
  due_date: string | null;
  assigned_to: string | null;
  completed: boolean;
  sort_order: number;
}

export const CATEGORIES = [
  "Flight",
  "Hotel",
  "Restaurant",
  "Activity",
  "Tour",
  "Hiking",
  "Beach",
  "Diving",
  "Nightlife",
  "Transportation",
  "Train",
  "Bus",
  "Ferry",
  "Rental Car",
  "Meeting",
  "Event",
  "Shopping",
  "Free Time",
  "General Plan",
  "Note",
  "Custom",
] as const;

export const CATEGORY_ICON: Record<string, string> = {
  Flight: "✈",
  Hotel: "🏨",
  Restaurant: "🍽",
  Activity: "🧭",
  Tour: "🎟",
  Hiking: "🥾",
  Beach: "🏖",
  Diving: "🤿",
  Nightlife: "🍹",
  Transportation: "🚕",
  Train: "🚆",
  Bus: "🚌",
  Ferry: "⛴",
  "Rental Car": "🚗",
  Meeting: "💼",
  Event: "🎫",
  Shopping: "🛍",
  "Free Time": "🌤",
  "General Plan": "📌",
  Note: "📝",
  Custom: "✨",
  Bar: "🍸",
  Hotels: "🏨",
  Shops: "🛍",
  Neighborhood: "🏘",
  "Day Trip": "🗺",
  Place: "📍",
};

export const STATUSES = [
  "Idea",
  "Planned",
  "Need to Book",
  "Reserved",
  "Confirmed",
  "Completed",
  "Cancelled",
] as const;

export const BOOKED_STATUSES = ["Reserved", "Confirmed", "Completed"];

export const TRIP_TYPES = [
  "Vacation",
  "Weekend",
  "Road trip",
  "Business",
  "Group trip",
  "Adventure",
  "Other",
];

export const TRIP_STATUSES = ["Planning", "Booked", "In Progress", "Completed"];

export const TRAVEL_MODES = [
  "Walk",
  "Drive",
  "Taxi",
  "Public transit",
  "Train",
  "Bus",
  "Ferry",
  "Flight",
  "Bike",
  "Other",
];

export const PLACE_CATEGORIES = [
  "Restaurant",
  "Activity",
  "Hiking",
  "Beach",
  "Bar",
  "Hotel",
  "Shopping",
  "Tour",
  "Neighborhood",
  "Day Trip",
  "Place",
];

export const PRIORITIES = ["Must Do", "Want to Do", "Maybe"];

export const PRIORITY_ICON: Record<string, string> = {
  "Must Do": "★",
  "Want to Do": "♡",
  Maybe: "○",
};

export const CHECKLIST_SECTIONS = [
  "Before Booking",
  "Before Departure",
  "Packing",
  "Documents",
  "Reservations",
  "Custom",
];

export const DOC_CATEGORIES = [
  "Flights",
  "Hotels",
  "Activities",
  "Transportation",
  "Travel Documents",
  "Insurance",
  "Other",
];

/** Budget bucket for a category. */
export function budgetBucket(category: string): string {
  switch (category) {
    case "Flight":
      return "Flights";
    case "Hotel":
      return "Accommodation";
    case "Transportation":
    case "Train":
    case "Bus":
    case "Ferry":
    case "Rental Car":
      return "Transportation";
    case "Restaurant":
      return "Food";
    case "Nightlife":
      return "Nightlife";
    case "Shopping":
      return "Shopping";
    case "Activity":
    case "Tour":
    case "Hiking":
    case "Beach":
    case "Diving":
    case "Event":
      return "Activities";
    default:
      return "Miscellaneous";
  }
}

export const BUDGET_BUCKETS = [
  "Flights",
  "Accommodation",
  "Transportation",
  "Food",
  "Activities",
  "Nightlife",
  "Shopping",
  "Miscellaneous",
];

/* ---------- date + time helpers (all date-only, no timezone drift) ---------- */

export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function tripDates(trip: Pick<Trip, "start_date" | "end_date">): string[] {
  if (!trip.start_date || !trip.end_date) return [];
  const out: string[] = [];
  const cur = parseDate(trip.start_date);
  const end = parseDate(trip.end_date);
  let guard = 0;
  while (cur <= end && guard < 400) {
    out.push(toISODate(cur));
    cur.setDate(cur.getDate() + 1);
    guard++;
  }
  return out;
}

export function formatDayLong(iso: string): string {
  return parseDate(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatDayShort(iso: string): string {
  return parseDate(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatRange(start: string | null, end: string | null): string {
  if (!start || !end) return "Dates not set";
  const s = parseDate(start);
  const e = parseDate(end);
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  const sm = s.toLocaleDateString("en-US", { month: "long" });
  if (sameMonth) return `${sm} ${s.getDate()}–${e.getDate()}, ${e.getFullYear()}`;
  const em = e.toLocaleDateString("en-US", { month: "long" });
  return `${sm} ${s.getDate()} – ${em} ${e.getDate()}, ${e.getFullYear()}`;
}

export function formatTime(t: string | null): string {
  if (!t) return "";
  const [hStr, m] = t.split(":");
  let h = Number(hStr);
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${suffix}`;
}

export function timeRange(item: Pick<AgendaItem, "start_time" | "end_time">): string {
  if (!item.start_time) return "Unscheduled";
  if (!item.end_time) return formatTime(item.start_time);
  return `${formatTime(item.start_time)} – ${formatTime(item.end_time)}`;
}

export function durationLabel(item: Pick<AgendaItem, "start_time" | "end_time">): string | null {
  if (!item.start_time || !item.end_time) return null;
  const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
  let mins = toMin(item.end_time) - toMin(item.start_time);
  if (mins <= 0) return null;
  const h = Math.floor(mins / 60);
  mins = mins % 60;
  return `${h ? `${h} hr ` : ""}${mins ? `${mins} min` : ""}`.trim();
}

export function daysAway(start: string | null): number | null {
  if (!start) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = parseDate(start).getTime() - today.getTime();
  return Math.round(diff / 86400000);
}

export function countdownLabel(trip: Pick<Trip, "start_date" | "end_date">): string {
  const d = daysAway(trip.start_date);
  if (d === null) return "";
  if (d > 1) return `${d} days away`;
  if (d === 1) return "Tomorrow";
  if (d === 0) return "Today";
  const endAway = daysAway(trip.end_date);
  if (endAway !== null && endAway >= 0) return "Happening now";
  return `${Math.abs(d)} days ago`;
}

export function money(value: number | null | undefined, currency = "USD"): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function itemCost(item: AgendaItem): number {
  return Number(item.cost_actual ?? item.cost_estimated ?? 0);
}

export function routeStops(trip: Trip): string[] {
  const stops: string[] = [];
  if (trip.origin_city) stops.push(trip.origin_city);
  if (trip.primary_destination) stops.push(trip.primary_destination);
  stops.push(...(trip.additional_destinations ?? []));
  if (trip.origin_city) stops.push(trip.origin_city);
  return stops;
}

export function sortItems(a: AgendaItem, b: AgendaItem): number {
  if (a.start_time && b.start_time && a.start_time !== b.start_time)
    return a.start_time < b.start_time ? -1 : 1;
  if (a.start_time && !b.start_time) return -1;
  if (!a.start_time && b.start_time) return 1;
  return a.sort_order - b.sort_order;
}

/* ---------- balances ---------- */

export interface Balance {
  from: string;
  to: string;
  amount: number;
}

export function computeBalances(items: AgendaItem[]): Balance[] {
  const net = new Map<string, number>();
  for (const item of items) {
    const cost = itemCost(item);
    const payer = item.paid_by;
    const split = item.split_between ?? [];
    if (!cost || !payer || split.length === 0) continue;
    const share = cost / split.length;
    for (const person of split) {
      if (person === payer) continue;
      net.set(person, (net.get(person) ?? 0) - share);
      net.set(payer, (net.get(payer) ?? 0) + share);
    }
  }
  const creditors = [...net.entries()]
    .filter(([, v]) => v > 0.01)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);
  const debtors = [...net.entries()]
    .filter(([, v]) => v < -0.01)
    .map(([name, amount]) => ({ name, amount: -amount }))
    .sort((a, b) => b.amount - a.amount);
  const out: Balance[] = [];
  let ci = 0;
  let di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci];
    const debtor = debtors[di];
    if (!creditor || !debtor) break;
    const amount = Math.min(creditor.amount, debtor.amount);
    out.push({ from: debtor.name, to: creditor.name, amount: Math.round(amount * 100) / 100 });
    creditor.amount -= amount;
    debtor.amount -= amount;
    if (creditor.amount <= 0.01) ci++;
    if (debtor.amount <= 0.01) di++;
  }
  return out;
}

/* ---------- calendar export ---------- */

function icsStamp(date: string, time: string | null, fallbackHour = 9): string {
  const d = parseDate(date);
  const h = time ? Number(time.slice(0, 2)) : fallbackHour;
  const m = time ? Number(time.slice(3, 5)) : 0;
  return `${toISODate(d).replace(/-/g, "")}T${String(h).padStart(2, "0")}${String(m).padStart(2, "0")}00`;
}

export function buildICS(trip: Trip, items: AgendaItem[]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wayfarer//Trip Itinerary//EN",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${trip.name}`,
  ];
  for (const item of items) {
    if (!item.day_date) continue;
    const start = icsStamp(item.day_date, item.start_time);
    const end = icsStamp(item.day_date, item.end_time ?? item.start_time, 10);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${item.id}@wayfarer`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${escapeICS(item.title)}`,
      `LOCATION:${escapeICS([item.location_name, item.address, item.city].filter(Boolean).join(", "))}`,
      `DESCRIPTION:${escapeICS(
        [item.notes, item.confirmation_number && `Confirmation: ${item.confirmation_number}`]
          .filter(Boolean)
          .join(" — "),
      )}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function escapeICS(value: string): string {
  return (value ?? "").replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
}

export const AVATAR_COLORS: Record<string, string> = {
  brand: "bg-brand text-cream",
  accent: "bg-accent text-cream",
  sun: "bg-sun text-ink",
  clay: "bg-clay text-ink",
  ink: "bg-ink text-cream",
};

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
