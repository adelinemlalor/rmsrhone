/** Helpers for the month calendar. All dates are local "YYYY-MM-DD" strings. */

export function toKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function parseMonth(m: string | undefined, fallback: Date): { year: number; month: number } {
  const match = /^(\d{4})-(\d{2})$/.exec(m ?? "");
  if (match) return { year: Number(match[1]), month: Number(match[2]) - 1 };
  return { year: fallback.getFullYear(), month: fallback.getMonth() };
}

export function monthKey(year: number, month: number): string {
  const d = new Date(year, month, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * The weeks (Sunday → Saturday) covering a month, padded with the trailing
 * days of the previous month and leading days of the next one.
 */
export function monthGrid(year: number, month: number): { key: string; inMonth: boolean; day: number }[][] {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  const last = new Date(year, month + 1, 0);
  const end = new Date(year, month + 1, 0 + (6 - last.getDay()));
  const weeks: { key: string; inMonth: boolean; day: number }[][] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (d.getDay() === 0) weeks.push([]);
    weeks[weeks.length - 1]!.push({ key: toKey(d), inMonth: d.getMonth() === month, day: d.getDate() });
  }
  return weeks;
}

/** The month to open on: the next upcoming plan's month, else the most recent, else today. */
export function defaultMonth(dates: (string | null)[], today: Date): string {
  const t = toKey(today);
  const sorted = dates.filter((d): d is string => !!d).sort();
  const next = sorted.find((d) => d >= t) ?? sorted[sorted.length - 1];
  return next ? next.slice(0, 7) : monthKey(today.getFullYear(), today.getMonth());
}
