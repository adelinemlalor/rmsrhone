import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useChecklist, useDeleteTask, useSaveTask, useTravelers } from "@/lib/data";
import { EmptyState, Meter, Panel, SectionLabel } from "@/components/bits";
import { CHECKLIST_CATEGORIES } from "@/lib/travel";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/trips/$tripId/checklist")({
  head: () => ({
    meta: [
      { title: "Checklist — Wayfarer" },
      { name: "description", content: "Everything left to do before you leave." },
      { property: "og:title", content: "Checklist — Wayfarer" },
      { property: "og:description", content: "Everything left to do before you leave." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChecklistPage,
});

const field =
  "w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[14px] outline-none focus:border-brand";

function ChecklistPage() {
  const { tripId } = Route.useParams();
  const { data: tasks } = useChecklist(tripId);
  const { data: travelers } = useTravelers(tripId);
  const save = useSaveTask(tripId);
  const remove = useDeleteTask(tripId);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CHECKLIST_CATEGORIES[0] ?? "Before you go");
  const [assignee, setAssignee] = useState("");

  const all = tasks ?? [];
  const done = all.filter((t) => t.done).length;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <Panel>
          <SectionLabel>Progress</SectionLabel>
          <Meter label={`${done} of ${all.length} done`} value={done} max={all.length || 1} />
        </Panel>

        {all.length === 0 ? (
          <EmptyState
            title="Nothing on the list"
            description="Add the visas, vaccinations, packing and pet-sitting tasks you don't want to forget."
          />
        ) : (
          CHECKLIST_CATEGORIES.filter((c) => all.some((t) => t.category === c)).map((c) => (
            <Panel key={c}>
              <SectionLabel>{c}</SectionLabel>
              <ul className="space-y-2">
                {all
                  .filter((t) => t.category === c)
                  .map((t) => (
                    <li key={t.id} className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => save.mutate({ id: t.id, done: !t.done })}
                        aria-label={t.done ? "Mark not done" : "Mark done"}
                        className={cn(
                          "grid size-5 shrink-0 place-items-center rounded-md border text-[11px] font-bold",
                          t.done
                            ? "border-accent bg-accent text-cream"
                            : "border-ink/25 bg-white",
                        )}
                      >
                        {t.done ? "✓" : ""}
                      </button>
                      <span
                        className={cn(
                          "flex-1 text-[14px]",
                          t.done && "text-ink/35 line-through",
                        )}
                      >
                        {t.title}
                      </span>
                      {t.assignee ? (
                        <span className="text-[11px] font-bold text-ink/40">{t.assignee}</span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => remove.mutate(t.id)}
                        className="text-[12px] font-bold text-ink/30"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
              </ul>
            </Panel>
          ))
        )}
      </div>

      <Panel className="h-fit">
        <SectionLabel>Add a task</SectionLabel>
        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs doing?"
            className={field}
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={field}>
            {CHECKLIST_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className={field}>
            <option value="">Anyone</option>
            {(travelers ?? []).map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={async () => {
              if (!title.trim()) return;
              await save.mutateAsync({
                title: title.trim(),
                category,
                assignee: assignee || null,
                done: false,
              });
              setTitle("");
            }}
            className="w-full rounded-full bg-brand px-4 py-2.5 text-[13px] font-bold text-cream"
          >
            Add task
          </button>
        </div>
      </Panel>
    </div>
  );
}
