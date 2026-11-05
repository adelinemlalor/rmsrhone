# Prompts — Feature 8: Random pick

Agent: Claude Code (Opus 5.5), branch `feature/random-pick`

## Prompt
> Feature 8 from PLAN.md: a "Can't decide?" button on a trip's Saved places tab that picks one **unscheduled** idea at random. Respect the current filters, so Restaurant + Dinner picks a dinner spot. Make Must Do ideas more likely than Maybe. Show the pick with "Pick again" (never the same one twice in a row) and "Schedule it on…" a day of the trip. Keep the picking logic pure and unit-tested.

## Follow-up (agent's own visual check)
> The pick dialog stretched to the full screen width. The arbitrary `max-w-[440px]` class wasn't being generated. Match the existing plan dialog's `sm:max-w-[…]` pattern and restart the dev server so Tailwind rescans new files.
