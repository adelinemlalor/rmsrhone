# RMS Rhone

**A trip planner that works like a travel binder and a day planner in one.** Every flight, hotel, dinner reservation and hike lives on a trip's hour-by-hour itinerary, with its confirmation number, cost and notes one click away.

🌐 **Live app:** https://rmsrhone.lovable.app
Sign up with any email inside the app. Each account sees only its own trips.

## What you can do

| | Feature | Where |
|---|---|---|
| 🔐 | **Sign up, log in, log out** with email + password, with friendly error messages | `/auth`, **Log out** in the header |
| 🧳 | **Trips** with dates, destinations, budget and cover photo | **Trips** |
| 🗓️ | **Plans** (the main item): add, list on a day-by-day timeline, open a **detail page**, edit, and delete with an **"Are you sure?"** check | a trip's **Itinerary** → any plan → **Open full page** |
| ✅ | **Validation:** title and category are required, trip end ≥ start, no negative costs, all shown inline | plan dialog, **+ New trip** |
| ⭐ | **Stars:** star must-do plans, then see them all across trips | ☆ on any plan, **Starred** |
| 🔎 | **Find:** search every plan, filter by trip / category / starred, sort by soonest, newest, priciest or A→Z | **Plans** |
| 📊 | **Dashboard:** total plans, total spend, average per paid plan, busiest month, spend-by-category chart | **Dashboard** |
| 🎲 | **Random pick:** "Can't decide?" picks an unscheduled saved idea (Must Do weighted higher) | a trip's **Saved places** |
| 📄 | **CSV export:** a trip's plans as a spreadsheet | trip header → **Export CSV** |
| 📅 | **Calendar:** month grid of every plan from every trip, with trips color-coded | **Calendar** |
| 🌙 | **Dark mode:** Light / Dark / Match my device, remembered | **Settings → Appearance** |

From the original prototype: map view, budget and who-owes-who, documents, packing checklist, invited travelers with personal views, saved places, PDF and .ics export, and importing plans from notes.

## How it works (high level)

```
Browser (React + TanStack Router)
  │  supabase-js, using the logged-in user's JWT
  ▼
Lovable Cloud = Supabase
  ├─ Auth: email + password → one row per account in auth.users (+ profiles)
  └─ Postgres with row-level security on every table
       users ─1:N─ trips ─1:N─ agenda_items (plans)
       users ─N:M─ agenda_items through stars
       users ─N:M─ trips through trip_travelers
```

- **Storing data:** every form calls a hook in `src/lib/data.ts` (`useSaveAgendaItem`, `useToggleStar`, …), which calls Supabase. The **database** decides who may read or write each row (RLS), using `is_trip_member(trip_id)`, so one user can't see another user's trips even with the raw API.
- **Computed views:** the dashboard math, search/sort, CSV, random pick and calendar grid are **pure functions** in `src/lib/` (`dashboard.ts`, `find.ts`, `csv.ts`, `random-pick.ts`, `calendar.ts`), and each has unit tests.
- **Pages** are files in `src/routes/` (TanStack file-based routing). Logged-in pages live under `src/routes/_authenticated/`.

Docs: [`PLAN.md`](PLAN.md) (the plan, plus Plan vs. Reality), [`schema.md`](schema.md) (every table and relationship), [`prompts/`](prompts) (the prompts behind each feature).

## Tools

| | |
|---|---|
| App builder + hosting | **Lovable** (publishes to rmsrhone.lovable.app; two-way GitHub sync on `main`) |
| Coding agent | **Claude Code** on feature branches, merged via PRs |
| Database + auth | **Lovable Cloud** (Supabase Postgres + Supabase Auth, row-level security) |
| Frontend | React 19, TanStack Start/Router, Tailwind CSS v4, shadcn/ui (Radix), lucide icons |
| Charts | Recharts |
| Tests | Vitest + PGlite (real Postgres in memory) |

## Run it locally

You need [Bun](https://bun.sh) (`npm i -g bun`) and Node 22+.

```bash
git clone https://github.com/adelinemlalor/rmsrhone.git
cd rmsrhone
bun install
bun run dev        # http://localhost:8080
```

The committed `.env` holds the project's **public** Supabase URL and publishable key, so the local app talks to the same Lovable Cloud database as the live site. Sign in with your own account.

**Database changes** can't be applied from a laptop. Switch Lovable's active branch (Settings → Git → GitHub → Branch) to your feature branch, ask Lovable to apply the migration, then switch back to `main`. Migrations live in `supabase/migrations/` and `drizzle/migrations/`.

## Tests

```bash
bun run test
```

32 tests, about 1 second, no network needed:

- **`tests/db/data-isolation.test.ts`: Test 1, data isolation.** Replays **all of the app's real migrations** into an in-memory Postgres (PGlite) with a small stand-in for Supabase's `auth.uid()` and roles. Then it signs in as User A and User B and checks that B can't see, edit, delete or add to A's trips, plans or stars.
- **`tests/dashboard.test.ts`: Test 2, dashboard stat.** A $400-actual hotel + a $60-estimated dinner + a free activity must give 3 plans, $460 total, a $230 average per paid plan, and Hotel as the top category.
- Unit tests for validation, search/sort, CSV, random pick, calendar and theme.

Red/green screenshots for both required tests are in [`docs/screenshots/`](docs/screenshots) and in PRs #6 and #16.

## Deploying

Merges to `main` sync into Lovable automatically. To update the live URL, open the project in Lovable and click **Publish → Update**.

## History

RMS Rhone started as a Lovable prototype in August 2026. The original product brief is preserved in [`docs/original-lovable-brief.md`](docs/original-lovable-brief.md). The assignment work starts at Issue #1 / PR #2 (`PLAN.md`), and everything after it went Issue → branch → PR.
