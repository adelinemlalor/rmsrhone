# Prompts — Feature 2: Data model + data-isolation test

Agent: Claude Code (Opus 5.5), branch `feature/data-model`

## Prompt
> Feature 2 from PLAN.md. The tables already exist from the Lovable prototype. Document every table, column and relationship in `schema.md` and compare it with PLAN.md §3. Then write **Test 1 (data isolation)** exactly as PLAN.md describes: User A has a trip "Lisbon" with a plan "Dinner at Sal Grosso", User B has none, and B must see zero trips and plans and be unable to edit or delete A's plan. The test must check the **real** row-level-security policies, not a mock, and must not touch the live database.

## Red / green prompt
> Temporarily break isolation and run the test to show it failing. Then undo the break and run it again to show it passing.

## How the agent approached it
- Chose **PGlite** (real Postgres compiled to WebAssembly, in memory). The test harness creates Supabase's `auth` schema, `auth.uid()`, and the `anon` / `authenticated` roles, then replays all 17 real migration files from `supabase/migrations` and `drizzle/migrations`.
- `asUser()` runs each query the way the browser would: as the `authenticated` role with that user's id in the JWT claims, so RLS applies.
- The break was a temporary migration that added a `using (true)` read policy on `trips` and `agenda_items`. It was deleted after the red run.
