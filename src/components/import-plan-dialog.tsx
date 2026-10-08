import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { FileUp, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { parseTripPlan, type ImportedPlan } from "@/lib/import-plan.functions";
import { formatDayShort, formatTime, type Trip } from "@/lib/travel";

function toBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(s);
}

export function ImportPlanDialog({
  trip,
  open,
  onClose,
}: {
  trip: Trip;
  open: boolean;
  onClose: () => void;
}) {
  const parse = useServerFn(parseTripPlan);
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [plans, setPlans] = useState<(ImportedPlan & { keep: boolean })[] | null>(null);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  function reset() {
    setText("");
    setFile(null);
    setPlans(null);
  }

  async function read() {
    setBusy(true);
    try {
      let notes = text;
      let pdfBase64: string | null = null;
      if (file) {
        const name = file.name.toLowerCase();
        if (name.endsWith(".pdf")) {
          pdfBase64 = toBase64(await file.arrayBuffer());
        } else if (name.endsWith(".docx")) {
          const mammoth = await import("mammoth");
          const r = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
          notes = `${r.value}\n\n${text}`;
        } else {
          notes = `${await file.text()}\n\n${text}`;
        }
      }
      const res = await parse({
        data: {
          text: notes,
          pdfBase64,
          filename: file?.name ?? null,
          tripStart: trip.start_date,
          tripEnd: trip.end_date,
        },
      });
      if (res.error) toast.error(res.error);
      else if (!res.plans.length) toast.error("No plans found in that text.");
      else setPlans(res.plans.map((p) => ({ ...p, keep: true })));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't read that.");
    } finally {
      setBusy(false);
    }
  }

  async function addAll() {
    const chosen = (plans ?? []).filter((p) => p.keep);
    if (!chosen.length) return;
    setSaving(true);
    const rows = chosen.map((p, i) => ({
      trip_id: trip.id,
      day_date: p.day_date,
      start_time: p.start_time,
      end_time: p.end_time,
      title: p.title,
      description: p.description,
      location_name: p.location_name,
      city: p.city,
      category: p.category,
      cost_estimated: p.cost_estimated,
      confirmation_number: p.confirmation_number,
      status: p.confirmation_number ? "Confirmed" : "Planned",
      details: p.duration_minutes ? { duration_minutes: p.duration_minutes } : {},
      sort_order: i,
    }));
    const { error } = await supabase.from("agenda_items").insert(rows as never);
    if (error) {
      setSaving(false);
      toast.error(error.message);
      return;
    }
    // Stretch the trip dates so every imported day shows on the timeline.
    const dates = chosen.map((p) => p.day_date).filter((d): d is string => !!d).sort();
    if (dates.length) {
      const first = dates[0]!;
      const last = dates[dates.length - 1]!;
      const start = !trip.start_date || first < trip.start_date ? first : trip.start_date;
      const end = !trip.end_date || last > trip.end_date ? last : trip.end_date;
      if (start !== trip.start_date || end !== trip.end_date) {
        await supabase.from("trips").update({ start_date: start, end_date: end } as never).eq("id", trip.id);
      }
    }
    void qc.invalidateQueries({ queryKey: ["agenda", trip.id] });
    void qc.invalidateQueries({ queryKey: ["trip", trip.id] });
    void qc.invalidateQueries({ queryKey: ["trips"] });
    setSaving(false);
    toast.success(`Added ${chosen.length} plans to your itinerary`);
    reset();
    onClose();
  }

  const kept = (plans ?? []).filter((p) => p.keep).length;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4" onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-[720px] flex-col overflow-hidden rounded-[26px] border border-border bg-cream shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="font-display text-[20px] font-extrabold tracking-tight">Import a plan</h2>
            <p className="text-[12px] text-ink/50">
              Paste notes or upload a document (from ChatGPT, Claude, an email…) and we'll turn it into plans.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 text-ink/50">
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {!plans ? (
            <div className="space-y-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={10}
                placeholder={"Day 1 – Mar 19: Arrive Tortola 2pm, check in at Scrub Island…\nDay 2: Snorkel the Baths 9am–12pm…"}
                className="w-full rounded-[18px] border border-border bg-white/70 p-4 text-[13px] outline-none focus:border-ink/40"
              />
              <label className="flex cursor-pointer items-center gap-3 rounded-[18px] border border-dashed border-border bg-white/50 px-4 py-3 text-[13px]">
                <FileUp className="size-4 text-brand" />
                <span className="flex-1 truncate">
                  {file ? file.name : "Upload a document — PDF, Word (.docx), or text file"}
                </span>
                {file ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setFile(null);
                    }}
                    className="text-[12px] font-bold text-ink/50"
                  >
                    Remove
                  </button>
                ) : null}
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.md,text/plain,application/pdf"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="mb-3 text-[12px] text-ink/55">
                Found {plans.length} plans. Untick anything you don't want, then add them.
              </p>
              {plans.map((p, i) => (
                <label
                  key={i}
                  className="flex cursor-pointer gap-3 rounded-[16px] border border-border bg-white/70 px-4 py-3"
                >
                  <input
                    type="checkbox"
                    checked={p.keep}
                    onChange={() =>
                      setPlans((cur) => cur!.map((x, j) => (j === i ? { ...x, keep: !x.keep } : x)))
                    }
                    className="mt-1"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold tracking-[0.1em] text-ink/45 uppercase">
                      {p.day_date ? formatDayShort(p.day_date) : "No date"}
                      {p.start_time ? ` · ${formatTime(p.start_time)}` : ""}
                      {p.end_time ? ` – ${formatTime(p.end_time)}` : ""} · {p.category}
                    </p>
                    <p className="text-[14px] font-bold">{p.title}</p>
                    {p.location_name || p.city ? (
                      <p className="text-[12px] text-ink/55">
                        {[p.location_name, p.city].filter(Boolean).join(", ")}
                      </p>
                    ) : null}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          {plans ? (
            <>
              <button
                type="button"
                onClick={() => setPlans(null)}
                className="rounded-full border border-border px-4 py-2 text-[12px] font-bold text-ink/60"
              >
                Back
              </button>
              <button
                type="button"
                disabled={saving || kept === 0}
                onClick={() => void addAll()}
                className="rounded-full bg-brand px-4 py-2 text-[12px] font-bold text-cream disabled:opacity-50"
              >
                {saving ? "Adding…" : `Add ${kept} plans`}
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={busy || (!text.trim() && !file)}
              onClick={() => void read()}
              className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-[12px] font-bold text-cream disabled:opacity-50"
            >
              <Sparkles className="size-3.5" />
              {busy ? "Reading your plan…" : "Read plan"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
