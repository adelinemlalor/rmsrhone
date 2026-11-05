# Prompts — PLAN.md

Agent: Claude Code (Opus 5.5)

## Prompt 1 — kickoff
> Complete the assignment for my platform on Lovable — RMS Rhone (https://rmsrhone.lovable.app/). *(Followed by the full assignment brief.)*

## Prompt 2 — decisions I made when the agent asked
- **Main item:** Plans (agenda items such as flights, hotels, meals and activities that belong to a trip), not trips.
- **My features:** Random pick, CSV export, Calendar view, Dark mode.

## What the agent did
- Read the existing Lovable code (routes, `src/lib/data.ts`, Supabase migrations, row-level security policies) to find out which spine features already existed. Auth, data model and basic create/edit/delete were there. Stars, search/sort, dashboard, delete confirmation, friendly validation and tests were missing.
- Drafted PLAN.md from that audit and my decisions. I reviewed it before merging.
