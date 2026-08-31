import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Panel, SectionLabel } from "@/components/bits";
import { useTrips } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Wayfarer" },
      { name: "description", content: "Account settings and trip data for your Wayfarer account." },
      { property: "og:title", content: "Settings — Wayfarer" },
      {
        property: "og:description",
        content: "Account settings and trip data for your Wayfarer account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
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

      <Panel className="mt-5">
        <SectionLabel>Password</SectionLabel>
        <p className="text-[13px] text-ink/55">
          We'll email you a secure link to choose a new password.
        </p>
        <button
          type="button"
          onClick={async () => {
            const { error } = await supabase.auth.resetPasswordForEmail(user.email ?? "", {
              redirectTo: window.location.origin,
            });
            if (error) toast.error(error.message);
            else toast.success("Reset link sent");
          }}
          className="mt-4 rounded-full border border-border px-5 py-2.5 text-[13px] font-bold"
        >
          Send reset link
        </button>
      </Panel>

      <Panel className="mt-5">
        <SectionLabel>Session</SectionLabel>
        <button
          type="button"
          onClick={async () => {
            await supabase.auth.signOut();
            void navigate({ to: "/auth" });
          }}
          className="rounded-full bg-ink px-5 py-2.5 text-[13px] font-bold text-cream"
        >
          Sign out
        </button>
      </Panel>
    </div>
  );
}
