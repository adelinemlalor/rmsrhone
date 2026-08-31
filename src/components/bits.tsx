import { cn } from "@/lib/utils";
import { AVATAR_COLORS, BOOKED_STATUSES, CATEGORY_ICON, initials } from "@/lib/travel";
import type { Traveler } from "@/lib/travel";

export function StatusPill({ status }: { status: string }) {
  const tone = BOOKED_STATUSES.includes(status)
    ? "bg-accent/12 text-accent"
    : status === "Need to Book"
      ? "bg-brand/12 text-brand-deep"
      : status === "Cancelled"
        ? "bg-destructive/10 text-destructive"
        : status === "Idea"
          ? "bg-ink/6 text-ink/55"
          : "bg-sun/25 text-brand-deep";
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold whitespace-nowrap", tone)}>
      {status}
    </span>
  );
}

export function CategoryIcon({ category, className }: { category: string; className?: string }) {
  return (
    <div
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-xl bg-cream-2 text-base",
        className,
      )}
      aria-hidden
    >
      {CATEGORY_ICON[category] ?? "📍"}
    </div>
  );
}

export function Avatar({ traveler, size = 9 }: { traveler: Traveler; size?: number }) {
  return (
    <span
      title={traveler.name}
      className={cn(
        "grid place-items-center rounded-full text-[11px] font-bold ring-2 ring-cream",
        AVATAR_COLORS[traveler.color] ?? AVATAR_COLORS["brand"],
      )}
      style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
    >
      {initials(traveler.name)}
    </span>
  );
}

export function AvatarStack({
  travelers,
  names,
  size = 9,
}: {
  travelers: Traveler[];
  names?: string[];
  size?: number;
}) {
  const shown = names ? travelers.filter((t) => names.includes(t.name)) : travelers;
  if (shown.length === 0) return null;
  return (
    <div className="flex -space-x-2">
      {shown.slice(0, 5).map((t) => (
        <Avatar key={t.id} traveler={t} size={size} />
      ))}
    </div>
  );
}

export function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-[24px] border border-border bg-white/70 p-5", className)}>
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 text-[12px] font-bold tracking-[0.15em] text-ink/45 uppercase">
      {children}
    </h3>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-ink/15 bg-cream/50 px-6 py-12 text-center">
      <p className="font-display text-lg font-semibold">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-[13px] text-ink/55">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function Meter({
  label,
  value,
  total,
  tone = "accent",
}: {
  label: string;
  value: number;
  total: number;
  tone?: "accent" | "sun" | "brand";
}) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  const bar = tone === "sun" ? "bg-sun" : tone === "brand" ? "bg-brand" : "bg-accent";
  return (
    <div>
      <div className="mb-1 flex justify-between text-[12px] font-semibold text-ink/60">
        <span>{label}</span>
        <span>
          {value} / {total}
        </span>
      </div>
      <div className="h-2 rounded-full bg-cream-2">
        <div className={cn("h-2 rounded-full", bar)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
