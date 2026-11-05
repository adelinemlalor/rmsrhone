import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";
import { AvatarStack, CategoryIcon, StatusPill } from "@/components/bits";

import {
  durationLabel,
  itemCost,
  money,
  timeRange,
  type AgendaItem,
  type Traveler,
} from "@/lib/travel";
import { useImageUrl } from "@/lib/data";
import { StarButton } from "@/components/star-button";
import { cn } from "@/lib/utils";

function ItemPhoto({ url, alt }: { url: string; alt: string }) {
  const src = useImageUrl(url);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src) return null;
  if (failed) {
    return (
      <div className="hidden size-[92px] shrink-0 flex-col items-center justify-center gap-1 rounded-[16px] border border-dashed border-border bg-secondary/40 p-2 text-center text-[10px] leading-tight text-muted-foreground sm:flex">
        <ImageOff className="size-4" />
        Not a direct image link
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="hidden size-[92px] shrink-0 rounded-[16px] border border-border object-cover sm:block"
    />
  );
}


export function DayTimeline({
  items,
  travelers,
  currency,
  onSelect,
  onToggleComplete,
  onSkip,
}: {
  items: AgendaItem[];
  travelers: Traveler[];
  currency: string;
  onSelect: (item: AgendaItem) => void;
  onToggleComplete?: ((item: AgendaItem) => void) | undefined;
  /** When provided, shows a "Not doing" action that only affects the viewer's own version. */
  onSkip?: ((item: AgendaItem) => void) | undefined;
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-[22px] border border-dashed border-ink/15 bg-cream/50 px-5 py-10 text-center text-[13px] text-ink/45">
        Nothing planned yet — a free day is a good day.
      </p>
    );
  }

  return (
    <ol className="relative space-y-3 pl-[84px]">
      <span className="absolute top-2 bottom-2 left-[46px] w-px bg-border" aria-hidden />
      {items.map((item, idx) => {
        const next = items[idx + 1];
        return (
          <li key={item.id} className="relative">
            <span className="absolute top-5 -left-[98px] w-[52px] text-right text-[12px] font-bold text-ink/45">
              {item.start_time ? timeRange(item).split("–")[0]?.trim() : "Anytime"}
            </span>
            <span
              className={cn(
                "absolute top-6 -left-[42px] size-2.5 rounded-full ring-4 ring-cream",
                item.completed ? "bg-accent" : "bg-brand",
              )}
              aria-hidden
            />
            <button
              type="button"
              onClick={() => onSelect(item)}
              className="w-full rounded-[22px] border border-border bg-white/75 p-4 pr-12 text-left transition-shadow hover:shadow-[0_16px_40px_-30px_rgba(60,40,25,0.7)]"
            >
              <div className="flex items-start gap-3">
                <CategoryIcon category={item.category} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4
                      className={cn(
                        "font-display text-[16px] leading-tight font-bold",
                        item.completed && "line-through opacity-55",
                      )}
                    >
                      {item.title}
                    </h4>
                    <StatusPill status={item.status} />
                    {item.personal_for ? (
                      <span className="rounded-full bg-brand/12 px-2 py-0.5 text-[10px] font-bold tracking-[0.1em] text-brand uppercase">
                        Personal
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[12px] text-ink/50">
                    {[timeRange(item), durationLabel(item), item.location_name]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {item.description ? (
                    <p className="mt-2 line-clamp-2 text-[13px] text-ink/60">{item.description}</p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <AvatarStack travelers={travelers} names={item.participants} size={7} />
                    <div className="flex items-center gap-3 text-[12px] font-bold text-ink/55">
                      {item.confirmation_number ? (
                        <span className="rounded-full bg-cream-2 px-2 py-1">
                          #{item.confirmation_number}
                        </span>
                      ) : null}
                      {itemCost(item) > 0 ? <span>{money(itemCost(item), currency)}</span> : null}
                      {onToggleComplete ? (
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleComplete(item);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.stopPropagation();
                              onToggleComplete(item);
                            }
                          }}
                          className={cn(
                            "rounded-full px-2.5 py-1",
                            item.completed ? "bg-accent/15 text-accent" : "bg-cream-2 text-ink/45",
                          )}
                        >
                          {item.completed ? "Done" : "Mark done"}
                        </span>
                      ) : null}
                      {onSkip && !item.personal_for ? (
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSkip(item);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.stopPropagation();
                              onSkip(item);
                            }
                          }}
                          className="rounded-full bg-cream-2 px-2.5 py-1 text-ink/45"
                        >
                          Not doing
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                {item.image_url ? <ItemPhoto url={item.image_url} alt={item.title} /> : null}
              </div>
            </button>
            <StarButton itemId={item.id} className="absolute top-3 right-3" />

            {next && (item.travel_next_minutes || item.travel_next_mode) ? (
              <p className="mt-2 ml-2 text-[11px] font-bold tracking-wide text-ink/40">
                {item.travel_next_mode ?? "Travel"}
                {item.travel_next_minutes ? ` · ${item.travel_next_minutes} min` : ""}
                {item.travel_next_note ? ` · ${item.travel_next_note}` : ""}
              </p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
