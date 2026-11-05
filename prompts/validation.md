# Prompts — Feature 4: Validation

Agent: Claude Code (Opus 5.5), branch `feature/validation`

## Prompt
> Feature 4 from PLAN.md: a plan can't be saved without a title and a category, a trip can't be saved without a name, a trip's end date can't be before its start date, and costs and budgets can't be negative. Show each problem as a friendly inline message under its field, not a toast or a browser pop-up. Put the rules in one module and unit-test them.

## What the agent found
- The plan dialog's only check was a toast saying "Give this plan a title". **There was no category field at all.** `category` silently defaulted to "Activity", so the plan's required "category" field couldn't actually be chosen.
- The new-trip form relied on the browser's built-in `required` pop-up and accepted an end date before the start date.
