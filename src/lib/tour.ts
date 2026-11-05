/**
 * Guided tour content and layout math. Kept pure (no DOM) so it can be unit tested.
 * Each step points at an element with a matching `data-tour="<target>"` attribute.
 */

export type TourStep = { target: string; title: string; body: string };

/** Set once someone has finished or skipped the tour, so the "?" button stops pulsing. */
export const TOUR_SEEN_KEY = "rms-tour-seen";

const HELP_STEP: TourStep = {
  target: "help",
  title: "Come back anytime",
  body: "Click ? whenever you're unsure what a page is for. The tour fits whichever page you're on.",
};

/** Shown on any trip page: where to start, then one bubble per tab. */
export const TRIP_STEPS: TourStep[] = [
  {
    target: "trip-start",
    title: "Start here",
    body: "Most trips start in the Itinerary: add your flights, stays, meals and activities to the days you'll do them. Save maybe-later ideas in Saved places, and invite people in Travelers.",
  },
  {
    target: "tab-overview",
    title: "Overview",
    body: "Your trip at a glance: what's coming up next, what's booked, and what you still need to book.",
  },
  {
    target: "tab-itinerary",
    title: "Itinerary",
    body: "Your trip day by day, hour by hour. Click + Add plan on any day. Only a title and a category are required. Photos, links, costs and notes are optional, so you can add them later.",
  },
  {
    target: "tab-map",
    title: "Map",
    body: "Every plan with an address or city, pinned on one map, so you can see what's close together.",
  },
  {
    target: "tab-saved",
    title: "Saved places",
    body: "Ideas you haven't put on a day yet: restaurants, sights, shops. When you're ready, use “Schedule on…” to add one to a day, or let “Can't decide? Pick for me” choose.",
  },
  {
    target: "tab-budget",
    title: "Budget",
    body: "What the trip costs by category, what's already paid, and who owes whom.",
  },
  {
    target: "tab-documents",
    title: "Documents",
    body: "Upload boarding passes, tickets and hotel confirmations so they're all in one place.",
  },
  {
    target: "tab-travelers",
    title: "Travelers",
    body: "Invite people by email to plan with you, and choose what each person can change. Shared trips show up under Shared for them.",
  },
  {
    target: "tab-checklist",
    title: "Checklist",
    body: "Things to do before you leave: packing, visas, a pet-sitter.",
  },
  HELP_STEP,
];

/** Shown everywhere else: the main navigation. */
export const APP_STEPS: TourStep[] = [
  {
    target: "nav-new-trip",
    title: "Start a trip",
    body: "Give it a name and dates. Then open it and click ? again for a tour of the trip's tabs.",
  },
  {
    target: "nav-trips",
    title: "Trips",
    body: "All your trips. Click one to open its itinerary, map, budget and more.",
  },
  {
    target: "nav-plans",
    title: "Plans",
    body: "Search every plan across all your trips, then filter and sort them.",
  },
  {
    target: "nav-starred",
    title: "Starred",
    body: "Plans you've starred (☆) as must-dos, from every trip.",
  },
  {
    target: "nav-calendar",
    title: "Calendar",
    body: "Every plan from every trip on one month calendar.",
  },
  {
    target: "nav-dashboard",
    title: "Dashboard",
    body: "Your travel in numbers: plans, total spend and your busiest month.",
  },
  {
    target: "nav-explore",
    title: "Explore",
    body: "Every place you've saved, from all your trips, on one board.",
  },
  { target: "nav-shared", title: "Shared", body: "Trips that other people have invited you to." },
  {
    target: "nav-settings",
    title: "Settings",
    body: "Your account, archived trips and Appearance (light or dark mode).",
  },
  HELP_STEP,
];

/** Pick the trip tour when the trip tabs are on screen, otherwise the app tour; drop steps with nothing to point at. */
export function chooseTour(isPresent: (target: string) => boolean): TourStep[] {
  const steps = isPresent("tab-overview") ? TRIP_STEPS : APP_STEPS;
  return steps.filter((s) => isPresent(s.target));
}

export type Box = { top: number; left: number; width: number; height: number };
export type Size = { width: number; height: number };

/**
 * Where to put the bubble: below the target if it fits, else above, else whichever side has
 * more room. Always kept inside the viewport with a margin.
 */
export function placeBubble(
  target: Box,
  bubble: Size,
  viewport: Size,
  gap = 14,
  margin = 12,
): { top: number; left: number; side: "below" | "above" } {
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(v, Math.max(lo, hi)));
  const roomBelow = viewport.height - (target.top + target.height) - gap - margin;
  const roomAbove = target.top - gap - margin;
  const side =
    roomBelow >= bubble.height
      ? "below"
      : roomAbove >= bubble.height
        ? "above"
        : roomBelow >= roomAbove
          ? "below"
          : "above";
  const rawTop =
    side === "below" ? target.top + target.height + gap : target.top - gap - bubble.height;
  return {
    side,
    top: clamp(rawTop, margin, viewport.height - margin - bubble.height),
    left: clamp(
      target.left + target.width / 2 - bubble.width / 2,
      margin,
      viewport.width - margin - bubble.width,
    ),
  };
}
