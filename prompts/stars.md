# Prompts — Feature 5: Stars

Agents: **Lovable** (database migration only) and **Claude Code** (Opus 5.5, UI and tests), branch `feature/stars`

## Prompt 1: Lovable, with its branch switched to `feature/stars`
Lovable Cloud migrations can only be applied from Lovable, so the schema change was done there, on this feature branch, and not on `main`:

> Database change only — do not change any app code, UI, or other tables.
> Create a table `public.stars` (a junction table: "this user starred this plan"):
> - `id uuid primary key default gen_random_uuid()`
> - `user_id uuid not null references auth.users(id) on delete cascade`
> - `agenda_item_id uuid not null references public.agenda_items(id) on delete cascade`
> - `created_at timestamptz not null default now()`
> - `unique (user_id, agenda_item_id)` and an index on `user_id`
>
> Enable row level security. Grant select, insert, delete to `authenticated` and all to `service_role`. Policies for `authenticated`:
> - select: `user_id = auth.uid()`
> - insert: `user_id = auth.uid() and public.is_trip_member((select a.trip_id from public.agenda_items a where a.id = agenda_item_id))`
> - delete: `user_id = auth.uid()`

## Prompt 2: Claude Code
> Feature 5 from PLAN.md. Using the new `stars` table, add a star toggle to each plan (itinerary timeline and plan detail page) and a `/starred` page that lists only my starred plans across all trips, grouped by trip. Add "Starred" to the nav. Extend the data-isolation test so User B can't see or create stars on A's plans.
