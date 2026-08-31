import { createFileRoute, Link } from "@tanstack/react-router";
import { useTrips } from "@/lib/data";
import { EmptyState } from "@/components/bits";
import { countdownLabel, formatRange } from "@/lib/travel";

export const Route = createFileRoute("/_authenticated/shared")({
  head: () => ({
    meta: [
      { title: "Shared with me — Wayfarer" },
      {
        name: "description",
        content: "Trips other travelers have invited you to help plan.",
      },
      { property: "og:title", content: "Shared with me — Wayfarer" },
      {
        property: "og:description",
        content: "Trips other travelers have invited you to help plan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SharedPage,
});

function SharedPage() {
  const { user } = Route.useRouteContext();
  const { data: trips } = useTrips();
  const shared = (trips ?? []).filter((t) => t.owner_id !== user.id);

  return (
    <div className="pb-10">
      <h1 className="font-display text-[36px] leading-none font-extrabold tracking-tight">
        Shared with me
      </h1>
      <p className="mt-2 text-[13px] text-ink/55">
        Trips where someone else is the organizer.
      </p>

      <div className="mt-7">
        {shared.length === 0 ? (
          <EmptyState
            title="No shared trips yet"
            description="When someone adds your email as a traveler on their trip, it shows up here."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shared.map((t) => (
              <Link
                key={t.id}
                to="/trips/$tripId"
                params={{ tripId: t.id }}
                className="rounded-[24px] border border-border bg-white/70 p-5"
              >
                <p className="text-[11px] font-bold tracking-[0.14em] text-ink/40 uppercase">
                  {t.primary_destination ?? "Destination TBD"}
                </p>
                <h2 className="font-display mt-1.5 text-[19px] font-bold">{t.name}</h2>
                <p className="mt-2 text-[13px] text-ink/55">
                  {formatRange(t.start_date, t.end_date)}
                </p>
                <p className="mt-3 text-[12px] font-bold text-brand">{countdownLabel(t)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
