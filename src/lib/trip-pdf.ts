import type { AgendaItem, Traveler, Trip } from "@/lib/travel";
import { resolveImageUrl } from "@/lib/data";
import { fetchImageData } from "@/lib/image-proxy.functions";

interface Img { data: string; w: number; h: number }

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const im = new Image();
    im.crossOrigin = "anonymous";
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = src;
  });
}

/** Load an image and re-encode as JPEG, center-cropped to the given aspect ratio. */
async function prepImage(value: string | null | undefined, aspect: number, maxW: number): Promise<Img | null> {
  try {
    const url = await resolveImageUrl(value);
    if (!url) return null;
    let im: HTMLImageElement;
    try {
      im = await loadImg(url);
      // probe CORS taint
      const c = document.createElement("canvas");
      c.width = c.height = 1;
      c.getContext("2d")!.drawImage(im, 0, 0, 1, 1);
      c.toDataURL();
    } catch {
      const data = await fetchImageData({ data: { url } });
      if (!data) return null;
      im = await loadImg(data);
    }
    let sw = im.naturalWidth, sh = im.naturalHeight;
    if (sw / sh > aspect) sw = sh * aspect; else sh = sw / aspect;
    const sx = (im.naturalWidth - sw) / 2, sy = (im.naturalHeight - sh) / 2;
    const w = Math.min(maxW, Math.round(sw)), h = Math.round(w / aspect);
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
    ctx.drawImage(im, sx, sy, sw, sh, 0, 0, w, h);
    return { data: c.toDataURL("image/jpeg", 0.82), w, h };
  } catch {
    return null;
  }
}
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
import { resolveImageUrl } from "@/lib/data";
import { fetchImageData } from "@/lib/image-proxy.functions";

interface Img { data: string; w: number; h: number }

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const im = new Image();
    im.crossOrigin = "anonymous";
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = src;
  });
}

/** Load an image and re-encode as JPEG, center-cropped to the given aspect ratio. */
async function prepImage(value: string | null | undefined, aspect: number, maxW: number): Promise<Img | null> {
  try {
    const url = await resolveImageUrl(value);
    if (!url) return null;
    let im: HTMLImageElement;
    try {
      im = await loadImg(url);
      // probe CORS taint
      const c = document.createElement("canvas");
      c.width = c.height = 1;
      c.getContext("2d")!.drawImage(im, 0, 0, 1, 1);
      c.toDataURL();
    } catch {
      const data = await fetchImageData({ data: { url } });
      if (!data) return null;
      im = await loadImg(data);
    }
    let sw = im.naturalWidth, sh = im.naturalHeight;
    if (sw / sh > aspect) sw = sh * aspect; else sh = sw / aspect;
    const sx = (im.naturalWidth - sw) / 2, sy = (im.naturalHeight - sh) / 2;
    const w = Math.min(maxW, Math.round(sw)), h = Math.round(w / aspect);
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
    ctx.drawImage(im, sx, sy, sw, sh, 0, 0, w, h);
    return { data: c.toDataURL("image/jpeg", 0.82), w, h };
  } catch {
    return null;
  }
}

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
  const sortedAll = [...items].sort(sortItems);
  const [cover, ...photos] = await Promise.all([
    prepImage(trip.cover_image_url, 16 / 7, 1400),
    ...sortedAll.map((i) => prepImage(i.image_url, 1, 360)),
  ]);
  const photoById = new Map(sortedAll.map((i, k) => [i.id, photos[k] ?? null]));
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  let y = M;
  if (cover) {
    const ch = (W - M * 2) * (7 / 16);
    doc.addImage(cover.data, "JPEG", M, y, W - M * 2, ch);
    y += ch + 24;
  }

  const ensure = (h: number) => {
    if (y + h > H - M) {
      doc.addPage();
      y = M;
    }
  };
  const write = (s: string, size: number, style: "normal" | "bold" = "normal", color = 30, indent = 0, right = 0) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(clean(s), W - M * 2 - indent - right) as string[];
    for (const line of lines) {
      ensure(size * 1.35);
      doc.text(line, M + indent, y);
      y += size * 1.35;
    }
  };
  const text = (s: string, size: number, style: "normal" | "bold" = "normal", color = 30, indent = 0) =>
    write(s, size, style, color, indent);

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
      y += 8;
      const photo = photoById.get(i.id);
      const P = 78;
      ensure(photo ? P + 6 : 30);
      const top = y;
      if (photo) doc.addImage(photo.data, "JPEG", W - M - P, top - 10, P, P);
      const pad = photo ? P + 14 : 0;
      const text = (s: string, size: number, style: "normal" | "bold" = "normal", color = 30, indent = 0) =>
        write(s, size, style, color, indent, pad);
      const when = i.start_time ? timeRange(i) : "Anytime";
      text(`${when}   ${i.title}`, 11, "bold", 30);
      const meta = [durationLabel(i), i.location_name, i.status, i.confirmation_number ? `#${i.confirmation_number}` : null, itemCost(i) > 0 ? money(itemCost(i), trip.currency) : null]
        .filter(Boolean)
        .join(" | ");
      if (meta) text(meta, 9, "normal", 110, 12);
      if (i.address) text(i.address, 9, "normal", 110, 12);
      if (i.description) text(i.description, 9.5, "normal", 60, 12);
      if (photo && y < top - 10 + P + 4) y = top - 10 + P + 4;
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
