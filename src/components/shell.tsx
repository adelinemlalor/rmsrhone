import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";


const NAV = [
  { to: "/trips", label: "Trips" },
  { to: "/explore", label: "Explore" },
  { to: "/shared", label: "Shared With Me" },
  { to: "/profile", label: "Profile" },
  { to: "/settings", label: "Settings" },
] as const;

export function AppShell({
  children,
  initials,
}: {
  children: React.ReactNode;
  initials: string;
}) {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <div className="mx-auto max-w-[1240px] px-4 py-5 sm:px-6 lg:px-10">
        <header className="flex items-center justify-between gap-4 pb-6">
          <Link to="/trips" className="flex items-center gap-3">
            <span className="font-display grid size-10 place-items-center rounded-2xl bg-brand text-lg font-semibold text-cream">
              W
            </span>
            <span className="hidden sm:block">
              <span className="font-display block text-[15px] leading-none font-extrabold tracking-tight">
                Wayfarer
              </span>
              <span className="mt-1 block text-[10px] font-semibold tracking-[0.2em] text-ink/45 uppercase">
                Plan it together
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-[13px] font-semibold text-ink/60 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeProps={{ className: "text-brand" }}
                className="transition-colors hover:text-ink"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/trips/new"
              className="hidden rounded-full bg-brand px-4 py-2 text-[13px] font-bold text-cream transition-opacity hover:opacity-90 sm:block"
            >
              + New trip
            </Link>
            <Link
              to="/profile"
              title="Traveler profile"
              className="grid size-9 place-items-center rounded-full bg-accent text-[12px] font-bold text-cream"
            >
              {initials || "··"}
            </Link>
          </div>
        </header>

        {children}
      </div>

      <nav className="sticky bottom-0 z-30 mt-8 flex items-center justify-around border-t border-border bg-cream/95 px-2 py-2 backdrop-blur md:hidden">
        {NAV.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            activeProps={{ className: "text-brand" }}
            className={cn("px-2 py-1 text-[11px] font-bold text-ink/55")}
          >
            {n.label.split(" ")[0]}
          </Link>
        ))}
      </nav>
    </div>
  );
}
