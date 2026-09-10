import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Panel, SectionLabel } from "@/components/bits";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Traveler profile — RMS Rhone" },
      {
        name: "description",
        content: "Your traveler details, passport info and loyalty programs.",
      },
      { property: "og:title", content: "Traveler profile — RMS Rhone" },
      {
        property: "og:description",
        content: "Your traveler details, passport info and loyalty programs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

const FIELDS = [
  { key: "full_name", label: "Full name" },
  { key: "preferred_name", label: "Preferred name" },
  { key: "phone", label: "Phone" },
  { key: "home_airport", label: "Home airport" },
  { key: "passport_number", label: "Passport number" },
  { key: "passport_expiry", label: "Passport expiry", type: "date" },
  { key: "known_traveler_number", label: "Known traveler number" },
] as const;

const KINDS = [
  { value: "air", label: "Airline" },
  { value: "hotel", label: "Hotel" },
  { value: "car", label: "Rental car" },
] as const;

type Kind = (typeof KINDS)[number]["value"];

type Program = { id: string; kind: Kind; program: string; number: string };

const field =
  "w-full rounded-2xl border border-border bg-white px-4 py-3 text-[14px] outline-none focus:border-brand";

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
}

function parsePrograms(raw: unknown): Program[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((r) => {
    const row = (r ?? {}) as Record<string, unknown>;
    const kind = String(row.kind ?? "air");
    return {
      id: String(row.id ?? newId()),
      kind: (KINDS.some((k) => k.value === kind) ? kind : "air") as Kind,
      program: String(row.program ?? ""),
      number: String(row.number ?? ""),
    };
  });
}

function ProfilePage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});
  const [programs, setPrograms] = useState<Program[]>([]);
  const [saving, setSaving] = useState(false);

  const { data } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => {
      const { data: row, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (error) throw error;
      return row as Record<string, unknown> | null;
    },
  });

  useEffect(() => {
    if (!data) return;
    const next: Record<string, string> = {};
    for (const f of FIELDS) next[f.key] = (data[f.key] as string | null) ?? "";
    setForm(next);
    setPrograms(parsePrograms(data.loyalty_programs));
  }, [data]);

  function updateProgram(id: string, patch: Partial<Program>) {
    setPrograms((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function addProgram(kind: Kind) {
    setPrograms((list) => [...list, { id: newId(), kind, program: "", number: "" }]);
  }

  async function save() {
    setSaving(true);
    const payload: Record<string, unknown> = {};
    for (const f of FIELDS) payload[f.key] = form[f.key]?.trim() ? form[f.key]! : null;
    payload.loyalty_programs = programs
      .filter((p) => p.program.trim() || p.number.trim())
      .map((p) => ({ id: p.id, kind: p.kind, program: p.program.trim(), number: p.number.trim() }));
    const { error } = await supabase
      .from("profiles")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(payload as any)
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Profile saved");
    void qc.invalidateQueries({ queryKey: ["profile", user.id] });
  }

  return (
    <div className="max-w-[760px] pb-12">
      <h1 className="font-display text-[36px] leading-none font-extrabold tracking-tight">
        Traveler profile
      </h1>
      <p className="mt-2 text-[13px] text-ink/55">
        Details RMS Rhone can prefill when you add bookings. {user.email}
      </p>

      <Panel className="mt-7">
        <SectionLabel>Your details</SectionLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label
                htmlFor={f.key}
                className="mb-1.5 block text-[12px] font-bold tracking-wide text-ink/50 uppercase"
              >
                {f.label}
              </label>
              <input
                id={f.key}
                type={"type" in f ? f.type : "text"}
                value={form[f.key] ?? ""}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className={field}
              />
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="mt-5">
        <SectionLabel>Loyalty programs</SectionLabel>
        <p className="-mt-2 mb-4 text-[13px] text-ink/55">
          Add as many airline, hotel and rental car memberships as you like.
        </p>

        <div className="space-y-6">
          {KINDS.map((k) => {
            const rows = programs.filter((p) => p.kind === k.value);
            return (
              <div key={k.value}>
                <p className="mb-2 text-[12px] font-bold tracking-wide text-ink/50 uppercase">
                  {k.label}
                </p>
                {rows.length === 0 ? (
                  <p className="mb-2 text-[13px] text-ink/40">None added yet.</p>
                ) : (
                  <div className="mb-2 space-y-2">
                    {rows.map((p) => (
                      <div key={p.id} className="flex flex-wrap items-center gap-2">
                        <input
                          aria-label={`${k.label} program name`}
                          placeholder={
                            k.value === "air"
                              ? "Airline / program"
                              : k.value === "hotel"
                                ? "Hotel group"
                                : "Rental company"
                          }
                          value={p.program}
                          onChange={(e) => updateProgram(p.id, { program: e.target.value })}
                          className={`${field} min-w-[180px] flex-1`}
                        />
                        <input
                          aria-label={`${k.label} member number`}
                          placeholder="Member number"
                          value={p.number}
                          onChange={(e) => updateProgram(p.id, { number: e.target.value })}
                          className={`${field} min-w-[160px] flex-1`}
                        />
                        <button
                          type="button"
                          onClick={() => setPrograms((l) => l.filter((x) => x.id !== p.id))}
                          className="rounded-full border border-border px-3 py-2 text-[12px] font-bold text-ink/50 hover:text-ink"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => addProgram(k.value)}
                  className="rounded-full border border-border px-4 py-2 text-[12px] font-bold text-ink/70"
                >
                  + Add {k.label.toLowerCase()} program
                </button>
              </div>
            );
          })}
        </div>
      </Panel>

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="mt-6 rounded-full bg-brand px-6 py-3 text-[14px] font-bold text-cream disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save profile"}
      </button>
    </div>
  );
}
