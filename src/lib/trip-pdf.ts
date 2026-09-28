import type { AgendaItem, Traveler, Trip } from "@/lib/travel";
import {
  durationLabel,
  formatDayLong,
  formatRange,
  itemCost,
  money,
  sortItems,
  timeRange,
  tripDates,
} from "@/lib/travel";

// Latin-only fallback: jsPDF core fonts can't render some unicode punctuation.
const clean = (s: string) =>
  s
    .replace(/[–—]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/→/g, "->")
    .replace(/·/g, "|")
    .replace(/[^\x00-\xFF]/g, "");

export async function exportTripPDF(trip: Trip, items: AgendaItem[], travelers: Traveler[]) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  let y = M;

  const ensure = (h: number) => {
    if (y + h > H - M) {
      doc.addPage();
      y = M;
    }
  };
  const text = (s: string, size: number, style: "normal" | "bold" = "normal", color = 30, indent = 0) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(clean(s), W - M * 2 - indent) as string[];
    for (const line of lines) {
      ensure(size * 1.35);
      doc.text(line, M + indent, y);
      y += size * 1.35;
    }
  };

  text("RMS RHONE", 9, "bold", 110);
  y += 4;
  text(trip.name, 24, "bold", 20);
  text(
    [trip.primary_destination, formatRange(trip.start_date, trip.end_date)].filter(Boolean).join(" | "),
    11,
    "normal",
    90,
  );
  const sorted = [...items].sort(sortItems);
  const total = sorted.reduce((s, i) => s + itemCost(i), 0);
  text(
    `${sorted.length} plans | ${money(total, trip.currency)} committed${
      travelers.length ? ` | Travelers: ${travelers.map((t) => t.name).join(", ")}` : ""
    }`,
    10,
    "normal",
    90,
  );
  if (trip.notes) {
    y += 6;
    text(trip.notes, 10, "normal", 70);
  }

  const days = tripDates(trip);
  const extra = Array.from(new Set(sorted.map((i) => i.day_date).filter((d): d is string => !!d && !days.includes(d))));
  const groups: [string, AgendaItem[]][] = [...days, ...extra].sort().map((d) => [d, sorted.filter((i) => i.day_date === d)]);
  const unscheduled = sorted.filter((i) => !i.day_date);
  if (unscheduled.length) groups.push(["", unscheduled]);

  groups.forEach(([d, list]) => {
    y += 14;
    ensure(40);
    doc.setDrawColor(200);
    doc.line(M, y, W - M, y);
    y += 18;
    const idx = days.indexOf(d);
    text(d ? `${idx >= 0 ? `Day ${idx + 1} - ` : ""}${formatDayLong(d)}` : "Unscheduled", 14, "bold", 20);
    if (list.length === 0) {
      text("Free day", 10, "normal", 130);
      return;
    }
    list.forEach((i) => {
      y += 6;
      ensure(30);
      const when = i.start_time ? timeRange(i) : "Anytime";
      text(`${when}   ${i.title}`, 11, "bold", 30);
      const meta = [durationLabel(i), i.location_name, i.status, i.confirmation_number ? `#${i.confirmation_number}` : null, itemCost(i) > 0 ? money(itemCost(i), trip.currency) : null]
        .filter(Boolean)
        .join(" | ");
      if (meta) text(meta, 9, "normal", 110, 12);
      if (i.address) text(i.address, 9, "normal", 110, 12);
      if (i.description) text(i.description, 9.5, "normal", 60, 12);
    });
  });

  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`${clean(trip.name)} - page ${p} of ${pages}`, W / 2, H - 24, { align: "center" });
  }
  doc.save(`${trip.name.replace(/\s+/g, "-").toLowerCase()}.pdf`);
}
