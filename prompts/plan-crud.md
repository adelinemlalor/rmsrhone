# Prompts — Feature 3: Plans CRUD (detail page + delete confirmation)

Agent: Claude Code (Opus 5.5), branch `feature/plan-crud`

## Prompt
> Feature 3 from PLAN.md: add, list, open one plan's detail page, edit, and delete with an "Are you sure?" confirmation. Creating, listing and editing already happen in the itinerary's plan dialog. Add a real detail page at `/trips/:tripId/plans/:planId` with Edit and Delete. Then put one reusable confirmation dialog in front of every destructive delete: plans, trips, saved places and documents.

## Follow-up prompt (after the agent's own visual check)
> Empty sections such as "Booking" render as a blank card. Show a hint instead.

## What the agent found
- Deleting a plan from the dialog happened **instantly with no confirmation**. So did saved places and documents. Trips had a small "Delete? Yes/No" bubble.
- There was no page for a single plan, only the edit dialog.
