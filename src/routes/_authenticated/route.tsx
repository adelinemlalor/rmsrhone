import { useEffect } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/shell";
import { ensureProfile } from "@/hooks/useAuth";
import { GUEST_USER } from "@/lib/guest";
import { initials } from "@/lib/travel";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: () => ({ user: GUEST_USER }),
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
