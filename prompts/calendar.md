# Prompts — Feature 10: Calendar view

Agent: Claude Code (Opus 5.5), branch `feature/calendar`

## Prompt
> Feature 10 from PLAN.md: a `/calendar` month grid (Sun–Sat) showing every plan from every trip on its date, with prev / next / today and the month in the URL. Each day shows up to 3 plans (category icon, time, title) and then "+N more". Tint the days inside each trip's date range and label the trip, so overlapping trips are visible. Clicking a plan opens its detail page. Open on the month of the next upcoming plan.

## Color decision
The agent ran the trip palette through a color-blind validator. The first try failed: the green read as gray, and plum next to blue was too close for protanopia. Reordering to green, blue, clay, plum, mustard passed every check. Trip names are always shown too, so color is never the only cue.

## Follow-up (visual check)
> The plan chips' rounded corners plus the colored left border made a "(" shape. Square off the left edge.
