import { describe, expect, it } from "vitest";
import { APP_STEPS, chooseTour, placeBubble, TRIP_STEPS } from "@/lib/tour";

describe("chooseTour", () => {
  it("gives the trip tour, one bubble per tab, when the trip tabs are on screen", () => {
    const steps = chooseTour(() => true);
    expect(steps).toEqual(TRIP_STEPS);
    expect(steps.map((s) => s.title)).toEqual([
      "Start here",
      "Overview",
      "Itinerary",
      "Map",
      "Saved places",
      "Budget",
      "Documents",
      "Travelers",
      "Checklist",
      "Come back anytime",
    ]);
  });

  it("gives the app tour everywhere else, skipping targets that aren't visible (e.g. + New trip on a phone)", () => {
    const visible = new Set(APP_STEPS.map((s) => s.target).filter((t) => t !== "nav-new-trip"));
    const steps = chooseTour((t) => visible.has(t));
    expect(steps[0]!.title).toBe("Trips");
    expect(steps.some((s) => s.target === "nav-new-trip")).toBe(false);
    expect(steps).toHaveLength(APP_STEPS.length - 1);
  });
});

describe("placeBubble", () => {
  const viewport = { width: 1000, height: 800 };
  const bubble = { width: 340, height: 180 };

  it("puts the bubble below the target, centered, when it fits", () => {
    const p = placeBubble({ top: 100, left: 400, width: 100, height: 40 }, bubble, viewport);
    expect(p).toEqual({ side: "below", top: 154, left: 280 });
  });

  it("flips above when the target is near the bottom", () => {
    const p = placeBubble({ top: 700, left: 400, width: 100, height: 40 }, bubble, viewport);
    expect(p.side).toBe("above");
    expect(p.top).toBe(700 - 14 - 180);
  });

  it("never leaves the screen, even for a target at the far edge", () => {
    const p = placeBubble({ top: 20, left: 960, width: 36, height: 36 }, bubble, viewport);
    expect(p.left).toBe(1000 - 12 - 340);
    const q = placeBubble({ top: 20, left: 0, width: 36, height: 36 }, bubble, viewport);
    expect(q.left).toBe(12);
  });
});
