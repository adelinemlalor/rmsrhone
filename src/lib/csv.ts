import { sortItems, type AgendaItem, type Trip } from "./travel";

/** Columns in the exported CSV, in order. */
export const CSV_COLUMNS: { header: string; value: (p: AgendaItem) => string | number | boolean | null | undefined }[] = [
  { header: "Date", value: (p) => p.day_date },
  { header: "Start", value: (p) => p.start_time?.slice(0, 5) },
  { header: "End", value: (p) => p.end_time?.slice(0, 5) },
  { header: "Title", value: (p) => p.title },
  { header: "Category", value: (p) => p.category },
  { header: "Status", value: (p) => p.status },
  { header: "Location", value: (p) => p.location_name },
  { header: "Address", value: (p) => p.address },
  { header: "City", value: (p) => [p.city, p.country].filter(Boolean).join(", ") },
  { header: "Confirmation #", value: (p) => p.confirmation_number },
  { header: "Booked with", value: (p) => p.booking_provider },
  { header: "Estimated cost", value: (p) => p.cost_estimated },
  { header: "Actual cost", value: (p) => p.cost_actual },
  { header: "Currency", value: (p) => p.currency },
  { header: "Paid", value: (p) => (p.paid ? "Yes" : "No") },
  { header: "Notes", value: (p) => p.notes },
];

/** RFC 4180 quoting: wrap in quotes if the cell has a comma, quote or line break; double inner quotes. */
export function csvCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function plansToCSV(plans: AgendaItem[], tripCurrency = "USD"): string {
  const sorted = [...plans].sort((a, b) => {
    // Scheduled plans by date/time first, unscheduled at the end.
    if (!a.day_date !== !b.day_date) return a.day_date ? -1 : 1;
    if (a.day_date !== b.day_date) return (a.day_date ?? "").localeCompare(b.day_date ?? "");
    return sortItems(a, b);
  });
  const rows = [
    CSV_COLUMNS.map((c) => c.header),
    ...sorted.map((p) =>
      CSV_COLUMNS.map((c) => (c.header === "Currency" ? (p.currency ?? tripCurrency) : c.value(p))),
    ),
  ];
  return rows.map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";
}

export function csvFileName(trip: Pick<Trip, "name">): string {
  const slug = trip.name.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
  return `${slug || "trip"}-plans.csv`;
}

/** Triggers a browser download. The BOM makes Excel read accents (São Paulo, Café) correctly. */
export function downloadCSV(trip: Pick<Trip, "name" | "currency">, plans: AgendaItem[]) {
  const blob = new Blob(["﻿" + plansToCSV(plans, trip.currency)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = csvFileName(trip);
  a.click();
  URL.revokeObjectURL(url);
}
