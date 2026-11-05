# Prompts — Feature 11: Dark mode

Agent: Claude Code (Opus 5.5), branch `feature/dark-mode`

## Prompt
> Feature 11 from PLAN.md: a dark-mode toggle in Settings (Light / Dark / Match my device) that's remembered and applied before the first paint, so there's no white flash. Keep the "Luxe Juniper" look, with ink and cream swapping roles. Make sure every page stays readable in dark: cards, inputs, dialogs, the dashboard chart and the calendar.

## Follow-up (agent's own visual check)
> In dark mode the trip hero title over the cover photo turned dark-on-light and was hard to read. Text on photos should stay light-on-dark in both themes.

## Notes
- About 60 places in the app hardcode `bg-white/NN` for cards. Rather than edit every file, dark mode re-defines Tailwind's `--color-white` as the raised dark surface.
- `color-scheme: dark` makes the native date and time pickers dark as well.
