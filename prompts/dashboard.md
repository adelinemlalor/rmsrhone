# Prompts — Feature 7: Dashboard + Test 2

Agent: Claude Code (Opus 5.5), branch `feature/dashboard`

## Prompt
> Feature 7 from PLAN.md: a `/dashboard` with stat tiles (total plans, total spend, average cost per paid plan, busiest month) and a bar chart of spend by category, with an optional trip filter. Put the math in a pure function, `computeDashboardStats`. Then write **Test 2** exactly as PLAN.md §4 describes: a Hotel with actual $400, a Restaurant with estimated $60 and an Activity with no cost should give 3 plans, $460 total, a $230 average per paid plan, and Hotel as the top category.

## Red / green prompt
> Temporarily break the stat in a realistic way, run the test and screenshot the failure. Revert, run it again and screenshot the pass.

## Design decisions
- A single series means one brand color and no legend: the title names the series. Horizontal bars sorted by spend, value labels at the bar ends, a hover tooltip with the plan count, and a **"Show as table"** view for accessibility.
- The average divides by **plans that have a cost**, not all plans. Otherwise 64 free "Idea" plans would drag it to about $16, which says nothing about real cost.
