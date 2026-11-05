# Prompts — Feature 6: Find things (search, filter, sort)

Agent: Claude Code (Opus 5.5), branch `feature/find-plans`

## Prompt
> Feature 6 from PLAN.md: an "All plans" page at `/plans` that lists every plan across all my trips. It needs a search box (title, place, city, address, notes, confirmation number), a trip filter, a category filter, a starred-only toggle, and a sort menu (soonest first, newest added, most expensive, A→Z). Keep the filters in the URL so a search can be bookmarked. Put the search/sort logic in a pure function with unit tests.

## Follow-up prompt (after the agent's own visual check)
> The header nav wraps ("Shared With Me", "+ New trip") now that Plans and Starred are added. Tighten it.

## Notes
- `AgendaItem` in `src/lib/travel.ts` was missing `created_at` even though the column exists, so "newest added" couldn't sort. Added it as an optional field.
- Profile left the text nav because the avatar button already links to it.
