# Prompts — Fix: "Upcoming" trips filter

Agent: Claude Code (Opus 5.5), branch `fix/upcoming-filter`

## Prompt
> Fix the bug found while testing: the Trips page's default "Upcoming" filter shows trips that already ended (Sanoma Birthday Trip, Oct 1–3), because it only checks `status !== "Completed"`. A trip is upcoming if it's not completed and its end date (or its start date if there's no end) is today or later. Trips with no dates count as upcoming. Make it a pure, tested function, and update the backlog row in Plan vs. Reality.
