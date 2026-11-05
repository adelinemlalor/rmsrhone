import { useState } from "react";
import { Dices, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { randomPick } from "@/lib/random-pick";
import { formatDayShort, money, PRIORITY_ICON, type SavedPlace } from "@/lib/travel";

export function RandomPickButton({
  ideas,
  days,
  filterLabel,
  onSchedule,
}: {
  ideas: SavedPlace[];
  days: string[];
  filterLabel: string;
  onSchedule: (place: SavedPlace, date: string) => Promise<void>;
}) {
  const [pick, setPick] = useState<SavedPlace | null>(null);
  const [open, setOpen] = useState(false);
  const [rolls, setRolls] = useState(0);
  const available = ideas.filter((i) => !i.scheduled).length;

  function roll(exceptId: string | null) {
    setPick(randomPick(ideas, exceptId));
    setRolls((n) => n + 1);
    setOpen(true);
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-dashed border-ink/20 bg-cream/60 px-4 py-3">
        <p className="text-[13px] text-ink/60">
          {available > 0
            ? `${available} unscheduled idea${available === 1 ? "" : "s"}${filterLabel ? ` in ${filterLabel}` : ""}. Can't choose?`
            : "Every idea here is already on the itinerary."}
        </p>
        <button
          type="button"
          onClick={() => roll(null)}
          disabled={available === 0}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-[13px] font-bold text-cream disabled:opacity-40"
        >
          <Dices className="size-4" /> Can't decide? Pick for me
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-[26px] border-border bg-cream sm:max-w-[460px]">
          <DialogHeader>
            <p className="text-[11px] font-bold tracking-[0.16em] text-ink/40 uppercase">
              🎲 The dice say{rolls > 1 ? ` (roll ${rolls})` : ""}…
            </p>
            <DialogTitle className="font-display text-[28px] leading-tight font-extrabold tracking-tight">
              {pick?.name ?? "Nothing to pick"}
            </DialogTitle>
          </DialogHeader>
          {pick ? (
            <div className="space-y-3">
              <p className="text-[13px] text-ink/60">
                {[
                  pick.meal ? `${pick.category} · ${pick.meal}` : pick.category,
                  `${PRIORITY_ICON[pick.priority] ?? ""} ${pick.priority}`,
                  pick.city,
                  pick.estimated_cost != null ? `~${money(pick.estimated_cost)}` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {pick.notes ? (
                <p className="rounded-2xl bg-cream-2/60 p-3 text-[13px] text-ink/70">{pick.notes}</p>
              ) : null}
              {pick.url ? (
                <a
                  href={pick.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[13px] font-bold text-brand"
                >
                  Open link <ExternalLink className="size-3.5" />
                </a>
              ) : null}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => roll(pick.id)}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[13px] font-bold"
                >
                  <Dices className="size-4" /> Pick again
                </button>
                {days.length > 0 ? (
                  <select
                    aria-label="Schedule this idea on a day"
                    defaultValue=""
                    onChange={async (e) => {
                      if (!e.target.value) return;
                      await onSchedule(pick, e.target.value);
                      setOpen(false);
                    }}
                    className="rounded-full bg-brand px-4 py-2 text-[13px] font-bold text-cream outline-none"
                  >
                    <option value="">Schedule it on…</option>
                    {days.map((d, i) => (
                      <option key={d} value={d}>
                        Day {i + 1} · {formatDayShort(d)}
                      </option>
                    ))}
                  </select>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="text-[13px] text-ink/60">All of these ideas are already scheduled.</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
