import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAgenda, useDeleteAgendaItem, useTravelers, useTrip } from "@/lib/data";
import { ItemDialog, type ItemDraft } from "@/components/item-dialog";
import { ConfirmDelete } from "@/components/confirm-dialog";
import { StarButton } from "@/components/star-button";
import { AvatarStack, CategoryIcon, Panel, SectionLabel, StatusPill } from "@/components/bits";
import { durationLabel, formatDayLong, money, timeRange, type AgendaItem } from "@/lib/travel";

export const Route = createFileRoute("/_authenticated/trips/$tripId/plans/$planId")({
  head: () => ({
    meta: [
      { title: "Plan details — RMS Rhone" },
      { name: "description", content: "Every detail of one plan on your trip." },
    ],
  }),
  component: PlanDetailPage,
});

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === "" || value === false) return null;
  return (
    <div className="flex items-start justify-between gap-6 border-b border-border/60 py-2.5 last:border-0">
      <dt className="text-[12px] font-bold tracking-wide text-ink/45 uppercase">{label}</dt>
      <dd className="text-right text-[14px] break-words text-ink/80">{value}</dd>
    </div>
  );
}

function PlanDetailPage() {
  const { tripId, planId } = Route.useParams();
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const { data: trip } = useTrip(tripId);
  const { data: travelers } = useTravelers(tripId);
  const { data: items, isLoading } = useAgenda(tripId);
  const remove = useDeleteAgendaItem(tripId);
  const [draft, setDraft] = useState<ItemDraft | null>(null);

  const plan: AgendaItem | undefined = items?.find((i) => i.id === planId);
  const currency = plan?.currency ?? trip?.currency ?? "USD";

  if (isLoading || !trip) {
    return <div className="h-[240px] animate-pulse rounded-[26px] bg-cream-2" />;
  }

  if (!plan) {
    return (
      <Panel>
        <h1 className="font-display text-xl font-bold">Plan not found</h1>
        <p className="mt-2 text-[13px] text-ink/55">It may have been deleted.</p>
        <Link
          to="/trips/$tripId/itinerary"
          params={{ tripId }}
          className="mt-4 inline-block text-[13px] font-bold text-brand"
        >
          ← Back to the itinerary
        </Link>
      </Panel>
    );
  }

  const when = [
    plan.day_date ? formatDayLong(plan.day_date) : "Not scheduled yet",
    plan.start_time ? timeRange(plan) : null,
    durationLabel(plan),
  ]
    .filter(Boolean)
    .join(" · ");

  async function deletePlan() {
    await remove.mutateAsync(planId);
    toast.success("Plan deleted");
    await navigate({ to: "/trips/$tripId/itinerary", params: { tripId } });
  }

  return (
    <div>
      <Link
        to="/trips/$tripId/itinerary"
        params={{ tripId }}
        className="inline-flex items-center gap-1.5 text-[13px] font-bold text-ink/55 hover:text-ink"
      >
        <ArrowLeft className="size-4" /> Itinerary
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <CategoryIcon category={plan.category} className="size-14 text-2xl" />
          <div>
            <p className="text-[11px] font-bold tracking-[0.16em] text-ink/40 uppercase">
              {plan.category}
            </p>
            <h1 className="font-display mt-1 text-[30px] leading-tight font-extrabold tracking-tight">
              {plan.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-ink/55">
              <StatusPill status={plan.status} />
              <span>{when}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <StarButton itemId={plan.id} withLabel />
          <button
            type="button"
            onClick={() => setDraft(plan)}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-[13px] font-bold text-cream"
          >
            <Pencil className="size-4" /> Edit
          </button>
          <ConfirmDelete
            title="Delete this plan?"
            description={`"${plan.title}" and its comments and links will be permanently removed from ${trip.name}. This can't be undone.`}
            onConfirm={deletePlan}
          >
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-[13px] font-bold text-destructive"
            >
              <Trash2 className="size-4" /> Delete
            </button>
          </ConfirmDelete>
        </div>
      </div>

      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        <Panel>
          <SectionLabel>Where &amp; when</SectionLabel>
          <dl className="peer mt-2">
            <Row label="Date" value={plan.day_date ? formatDayLong(plan.day_date) : "Unscheduled"} />
            <Row label="Time" value={plan.start_time ? timeRange(plan) : null} />
            <Row label="Time zone" value={plan.time_zone} />
            <Row label="Place" value={plan.location_name} />
            <Row label="Address" value={plan.address} />
            <Row label="City" value={[plan.city, plan.country].filter(Boolean).join(", ")} />
            <Row
              label="Map"
              value={
                plan.map_url ? (
                  <a href={plan.map_url} target="_blank" rel="noreferrer" className="font-bold text-brand">
                    Open map <ExternalLink className="inline size-3" />
                  </a>
                ) : null
              }
            />
            <Row
              label="Getting there"
              value={[plan.transport_mode, plan.transport_from && `from ${plan.transport_from}`]
                .filter(Boolean)
                .join(" ")}
            />
          </dl>
          <p className="hidden text-[13px] text-ink/40 peer-empty:block">Nothing added yet — use Edit to fill this in.</p>
        </Panel>

        <Panel>
          <SectionLabel>Booking</SectionLabel>
          <dl className="peer mt-2">
            <Row label="Confirmation #" value={plan.confirmation_number} />
            <Row label="Booked with" value={plan.booking_provider} />
            <Row
              label="Booking link"
              value={
                plan.booking_url ? (
                  <a href={plan.booking_url} target="_blank" rel="noreferrer" className="font-bold text-brand">
                    Open <ExternalLink className="inline size-3" />
                  </a>
                ) : null
              }
            />
            <Row label="Reservation name" value={plan.reservation_name} />
            <Row label="Contact" value={[plan.contact_name, plan.contact_phone, plan.contact_email].filter(Boolean).join(" · ")} />
            <Row label="Refundable" value={plan.refundable === null ? null : plan.refundable ? "Yes" : "No"} />
            <Row label="Cancel by" value={plan.cancellation_deadline?.slice(0, 16).replace("T", " ")} />
            <Row label="Cancellation policy" value={plan.cancellation_policy} />
          </dl>
          <p className="hidden text-[13px] text-ink/40 peer-empty:block">Nothing added yet — use Edit to fill this in.</p>
        </Panel>

        <Panel>
          <SectionLabel>Cost</SectionLabel>
          <dl className="peer mt-2">
            <Row label="Estimated" value={plan.cost_estimated !== null ? money(plan.cost_estimated, currency) : null} />
            <Row label="Actual" value={plan.cost_actual !== null ? money(plan.cost_actual, currency) : null} />
            <Row label="Paid" value={plan.paid ? "Yes" : "Not yet"} />
            <Row label="Shared expense" value={plan.shared_expense ? "Yes" : null} />
          </dl>
          <p className="hidden text-[13px] text-ink/40 peer-empty:block">Nothing added yet — use Edit to fill this in.</p>
        </Panel>

        <Panel>
          <SectionLabel>Who &amp; notes</SectionLabel>
          <div className="mt-3">
            <AvatarStack travelers={travelers ?? []} names={plan.participants} size={8} />
          </div>
          {plan.description ? (
            <p className="mt-4 text-[14px] leading-relaxed whitespace-pre-line text-ink/70">
              {plan.description}
            </p>
          ) : null}
          {plan.notes ? (
            <p className="mt-3 rounded-2xl bg-cream-2/60 p-3 text-[13px] whitespace-pre-line text-ink/70">
              {plan.notes}
            </p>
          ) : null}
          {!plan.description && !plan.notes ? (
            <p className="mt-4 text-[13px] text-ink/40">No notes yet.</p>
          ) : null}
        </Panel>
      </div>

      <ItemDialog
        tripId={tripId}
        travelers={travelers ?? []}
        draft={draft}
        currency={trip.currency}
        authorName={(user.user_metadata?.["full_name"] as string | undefined) ?? user.email ?? "You"}
        authorId={user.id}
        onClose={() => setDraft(null)}
        onDeleted={() => void navigate({ to: "/trips/$tripId/itinerary", params: { tripId } })}
      />
    </div>
  );
}
