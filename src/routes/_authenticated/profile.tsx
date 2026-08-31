import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Panel, SectionLabel } from "@/components/bits";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Traveler profile — Wayfarer" },
      {
        name: "description",
        content: "Your traveler details, loyalty programs and emergency contact.",
      },
      { property: "og:title", content: "Traveler profile — Wayfarer" },
      {
        property: "og:description",
        content: "Your traveler details, loyalty programs and emergency contact.",
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
  { key: "frequent_flyer", label: "Frequent flyer programs" },
  { key: "hotel_programs", label: "Hotel programs" },
  { key: "rental_car_programs", label: "Rental car programs" },
  { key: "emergency_contact", label: "Emergency contact" },
] as const;

const field =
  "w-full rounded-2xl border border-border bg-white px-4 py-3 text-[14px] outline-none focus:border-brand";

function ProfilePage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});
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
  }, [data]);

  async function save() {
    setSaving(true);
    const payload: Record<string, string | null> = {};
    for (const f of FIELDS) payload[f.key] = form[f.key]?.trim() ? form[f.key]! : null;
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
        Details Wayfarer can prefill when you add bookings. {user.email}
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
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="mt-6 rounded-full bg-brand px-6 py-3 text-[14px] font-bold text-cream disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
      </Panel>
    </div>
  );
}
