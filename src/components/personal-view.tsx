import { useMemo, useState } from "react";
import { useOptouts, useToggleOptout } from "@/lib/data";
import type { AgendaItem, Traveler } from "@/lib/travel";
import { cn } from "@/lib/utils";

export interface PersonalView {
  /** null = the shared plan everyone sees */
  viewerId: string | null;
  viewerName: string;
  setViewerId: (id: string | null) => void;
  isOwnView: boolean;
  options: { id: string; name: string }[];
  /** Applies the selected traveler's personal additions and opt-outs. */
  filter: (items: AgendaItem[]) => AgendaItem[];
  skipped: AgendaItem[];
  isSkipped: (item: AgendaItem) => boolean;
  toggleSkip: (item: AgendaItem) => void;
  /** Extra fields to apply when creating a plan in the current view. */
  draftDefaults: { personal_for: string | null };
}

export function usePersonalView(
  tripId: string,
  travelers: Traveler[],
  currentUserId: string,
  allItems: AgendaItem[],
): PersonalView {
  const [viewerId, setViewerId] = useState<string | null>(null);
  const { data: optouts } = useOptouts(tripId);
  const toggle = useToggleOptout(tripId);

  const options = useMemo(
    () =>
      travelers
        .filter((t) => !!t.user_id)
        .map((t) => ({ id: t.user_id as string, name: t.user_id === currentUserId ? "Me" : t.name })),
    [travelers, currentUserId],
  );

  const skippedIds = useMemo(
    () =>
      new Set(
        (optouts ?? []).filter((o) => o.user_id === viewerId).map((o) => o.agenda_item_id),
      ),
    [optouts, viewerId],
  );

  const viewerName =
    viewerId === null
      ? "Shared plan"
      : (options.find((o) => o.id === viewerId)?.name ?? "Traveler");

  return {
    viewerId,
    viewerName,
    setViewerId,
    isOwnView: viewerId === currentUserId,
    options,
    filter: (items) =>
      viewerId === null
        ? items.filter((i) => !i.personal_for)
        : items.filter(
            (i) =>
              (!i.personal_for || i.personal_for === viewerId) && !skippedIds.has(i.id),
          ),
    skipped: viewerId === null ? [] : allItems.filter((i) => skippedIds.has(i.id)),
    isSkipped: (item) => skippedIds.has(item.id),
    toggleSkip: (item) => {
      if (viewerId !== currentUserId) return;
      toggle.mutate({ itemId: item.id, userId: currentUserId, skip: !skippedIds.has(item.id) });
    },
    draftDefaults: { personal_for: viewerId && viewerId !== null ? viewerId : null },
  };
}

export function ViewerSwitch({ view }: { view: PersonalView }) {
  const pill = (active: boolean) =>
    cn(
      "rounded-full border px-3.5 py-1.5 text-[12px] font-bold",
      active ? "border-ink bg-ink text-cream" : "border-border bg-white/60 text-ink/55",
    );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-bold tracking-[0.14em] text-ink/40 uppercase">Viewing</span>
      <button type="button" onClick={() => view.setViewerId(null)} className={pill(view.viewerId === null)}>
        Shared plan
      </button>
      {view.options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => view.setViewerId(o.id)}
          className={pill(view.viewerId === o.id)}
        >
          {o.name}
        </button>
      ))}
    </div>
  );
}

export function SkippedList({ view }: { view: PersonalView }) {
  if (view.skipped.length === 0) return null;
  return (
    <section className="rounded-[22px] border border-dashed border-border bg-white/50 p-4">
      <p className="text-[11px] font-bold tracking-[0.14em] text-ink/40 uppercase">
        Not doing ({view.skipped.length}) — {view.viewerName}
      </p>
      <ul className="mt-3 space-y-2">
        {view.skipped.map((i) => (
          <li key={i.id} className="flex items-center justify-between gap-3 text-[13px] text-ink/55">
            <span className="line-through">{i.title}</span>
            {view.isOwnView ? (
              <button
                type="button"
                onClick={() => view.toggleSkip(i)}
                className="rounded-full bg-cream-2 px-2.5 py-1 text-[12px] font-bold text-ink/60"
              >
                Add back
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
