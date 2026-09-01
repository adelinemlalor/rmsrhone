import { createFileRoute, Link } from "@tanstack/react-router";
import heroImage from "@/assets/hero-travel.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RMS Rhone — Plan the whole journey." },
      {
        name: "description",
        content:
          "RMS Rhone keeps every booking, idea and hour of your trip in one warm, visual timeline you can plan with friends.",
      },
      { property: "og:title", content: "RMS Rhone — Plan the whole journey." },
      {
        property: "og:description",
        content:
          "Every reservation, idea and hour of your trip in one warm, visual timeline you can plan together.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: "🕘",
    title: "Hour-by-hour, not just day-by-day",
    body: "Drop plans onto a real timeline with travel time between them, gaps you can see, and drag-free quick edits.",
  },
  {
    icon: "✈️",
    title: "Every confirmation in one place",
    body: "Flights, hotels, tables and tickets with confirmation numbers, cancellation deadlines and attached documents.",
  },
  {
    icon: "💡",
    title: "Ideas before commitments",
    body: "Collect saved places with priorities, then schedule the ones that make the cut into an actual day.",
  },
  {
    icon: "🤝",
    title: "Plan with your people",
    body: "Invite travelers, split costs, comment on plans and settle up with a clear who-owes-who summary.",
  },
];

function Landing() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <div className="mx-auto max-w-[1240px] px-5 py-6 lg:px-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-display grid size-10 place-items-center rounded-2xl bg-brand text-lg font-semibold text-cream">
              W
            </span>
            <span className="font-display text-[15px] font-extrabold tracking-tight">Wayfarer</span>
          </div>
          <Link
            to="/auth"
            className="rounded-full bg-ink px-5 py-2.5 text-[13px] font-bold text-cream"
          >
            Sign in
          </Link>

        </header>

        <section className="grid items-center gap-10 py-14 lg:grid-cols-[1.05fr_1fr] lg:py-20">
          <div>
            <span className="inline-block rounded-full bg-sun/40 px-3 py-1.5 text-[11px] font-bold tracking-[0.12em] text-brand-deep uppercase">
              Trip planning, warmed up
            </span>
            <h1 className="font-display mt-5 text-[44px] leading-[1.03] font-extrabold tracking-tight sm:text-[60px]">
              Every plan, every hour,
              <br />
              <span className="text-brand">in one place.</span>
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-ink/60">
              Wayfarer holds your reservations like a travel binder and lays them out like a
              beautiful day planner — so you always know what's next, what it costs, and who's
              coming.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/auth"
                className="rounded-full bg-brand px-6 py-3 text-[14px] font-bold text-cream transition-opacity hover:opacity-90"
              >
                Start planning
              </Link>
              <span className="text-[13px] text-ink/45">
                Free — sign up with your email in seconds.
              </span>

            </div>
          </div>

          <div className="relative">
            <img
              src={heroImage}
              width={1280}
              height={960}
              alt="Photographs of sunlit rooftops and a folded paper map arranged on a table"
              className="w-full rounded-[32px] border border-border object-cover shadow-[0_24px_60px_-30px_rgba(60,40,25,0.5)]"
            />
            <div className="absolute -bottom-6 -left-4 hidden w-[240px] rounded-2xl border border-border bg-white/95 p-4 sm:block">
              <p className="text-[10px] font-bold tracking-[0.16em] text-ink/40 uppercase">
                Tue · Day 3
              </p>
              <p className="font-display mt-1 text-[15px] font-bold">Sugarloaf at sunset</p>
              <p className="mt-1 text-[12px] text-ink/50">16:30 – 19:00 · cable car booked</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 pb-20 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-[24px] border border-border bg-white/70 p-6">
              <span className="text-2xl" aria-hidden>
                {f.icon}
              </span>
              <h2 className="font-display mt-3 text-[18px] font-bold">{f.title}</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-ink/55">{f.body}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
