import { useEffect } from "react";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/shell";
import { ensureProfile } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { initials } from "@/lib/travel";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const { user } = Route.useRouteContext();

  useEffect(() => {
    void ensureProfile(user);
  }, [user]);

  const name =
    (user.user_metadata?.["full_name"] as string | undefined) ?? user.email ?? "Traveler";

  return (
    <AppShell initials={initials(name)}>
      <Outlet />
    </AppShell>
  );
}
