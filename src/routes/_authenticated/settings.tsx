import { createFileRoute } from "@tanstack/react-router";
import { Panel, SectionLabel } from "@/components/bits";
import { useTrips } from "@/lib/data";
import { useTheme, type ThemePref } from "@/lib/theme";
import { cn } from "@/lib/utils";

const THEMES: { value: ThemePref; label: string; icon: string; hint: string }[] = [
  { value: "light", label: "Light", icon: "☀️", hint: "Cream paper, dark ink" },
  { value: "dark", label: "Dark", icon: "🌙", hint: "Easy on the eyes at night" },
  { value: "system", label: "Match my device", icon: "💻", hint: "Follows your phone or laptop setting" },
];

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — RMS Rhone" },
      { name: "description", content: "Account settings and trip data for your RMS Rhone account." },
      { property: "og:title", content: "Settings — RMS Rhone" },
      {
        property: "og:description",
        content: "Account settings and trip data for your RMS Rhone account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = Route.useRouteContext();
  
  const { data: trips } = useTrips();
  const { pref, setPref } = useTheme();

  return (
    <div className="max-w-[720px] pb-12">
      <h1 className="font-display text-[36px] leading-none font-extrabold tracking-tight">
        Settings
      </h1>

      <Panel className="mt-7">
        <SectionLabel>Account</SectionLabel>
        <dl className="space-y-3 text-[14px]">
          <div className="flex justify-between">
            <dt className="text-ink/50">Email</dt>
            <dd className="font-semibold">{user.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink/50">Trips</dt>
            <dd className="font-semibold">{trips?.length ?? 0}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink/50">Archived</dt>
            <dd className="font-semibold">
              {(trips ?? []).filter((t) => t.archived).length}
            </dd>
          </div>
        </dl>
      </Panel>

      <Panel className="mt-5">
        <SectionLabel>Appearance</SectionLabel>
        <div role="radiogroup" aria-label="Color theme" className="grid gap-2 sm:grid-cols-3">
          {THEMES.map((t) => (
            <button
              key={t.value}
              type="button"
              role="radio"
              aria-checked={pref === t.value}
              onClick={() => setPref(t.value)}
              className={cn(
                "rounded-2xl border px-4 py-3 text-left transition-colors",
                pref === t.value ? "border-brand bg-brand/10" : "border-border bg-white/50 hover:border-ink/30",
              )}
            >
              <span className="text-[18px]" aria-hidden>
                {t.icon}
              </span>
              <span className="mt-1 block text-[14px] font-bold">{t.label}</span>
              <span className="block text-[12px] text-ink/50">{t.hint}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-ink/45">Saved on this device.</p>
      </Panel>
    </div>
  );
}
