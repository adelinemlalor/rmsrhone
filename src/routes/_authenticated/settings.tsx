import { createFileRoute } from "@tanstack/react-router";
import { Panel, SectionLabel } from "@/components/bits";
import { useTrips } from "@/lib/data";

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

    </div>
  );
}
