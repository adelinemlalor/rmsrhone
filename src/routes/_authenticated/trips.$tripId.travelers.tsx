import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { useDeleteTraveler, useSaveTraveler, useTravelers } from "@/lib/data";
import { Avatar, Panel, SectionLabel } from "@/components/bits";
import { AVATAR_COLORS, type Role } from "@/lib/travel";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/trips/$tripId/travelers")({
  head: () => ({
    meta: [
      { title: "Travelers — Wayfarer" },
      { name: "description", content: "Who's coming, and what each person can change." },
      { property: "og:title", content: "Travelers — Wayfarer" },
      { property: "og:description", content: "Who's coming, and what each person can change." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TravelersPage,
});

const ROLES: Role[] = ["owner", "editor", "viewer"];
const field =
  "w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[14px] outline-none focus:border-brand";

function TravelersPage() {
  const { tripId } = Route.useParams();
  const { data: travelers } = useTravelers(tripId);
  const save = useSaveTraveler(tripId);
  const remove = useDeleteTraveler(tripId);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("editor");
  const [color, setColor] = useState(Object.keys(AVATAR_COLORS)[0] ?? "brand");

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="space-y-3">
        {(travelers ?? []).map((t) => (
          <div
            key={t.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-border bg-white/70 px-5 py-4"
          >
            <div className="flex items-center gap-3">
              <Avatar traveler={t} />
              <div>
                <p className="font-display text-[15px] font-bold">{t.name}</p>
                <p className="text-[12px] text-ink/45">{t.email ?? "No email"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={t.role}
                onChange={(e) => save.mutate({ id: t.id, role: e.target.value as Role })}
                className="rounded-full border border-border bg-white px-3 py-1.5 text-[12px] font-bold"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => remove.mutate(t.id)}
                className="text-[12px] font-bold text-ink/40"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <Panel className="h-fit">
        <SectionLabel>Add a traveler</SectionLabel>
        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className={field}
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (for sharing)"
            className={field}
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className={field}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2">
            {Object.keys(AVATAR_COLORS).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={c}
                className={cn(
                  "size-7 rounded-full",
                  AVATAR_COLORS[c],
                  color === c && "ring-2 ring-ink ring-offset-2 ring-offset-cream",
                )}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={async () => {
              if (!name.trim()) return;
              await save.mutateAsync({
                name: name.trim(),
                email: email.trim() || null,
                role,
                color,
              });
              setName("");
              setEmail("");
              toast.success("Traveler added");
            }}
            className="w-full rounded-full bg-brand px-4 py-2.5 text-[13px] font-bold text-cream"
          >
            Add traveler
          </button>
          <p className="text-[12px] leading-relaxed text-ink/45">
            Adding someone's email lets them see and edit this trip once they sign in with it.
          </p>
        </div>
      </Panel>
    </div>
  );
}
