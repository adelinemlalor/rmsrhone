# Prompts — Stranger-test fix: "?" guided tour

Agent: Claude Code (Opus 5.5), branch `feature/guided-tour`

## What the stranger test found
My tester, Sean, created a trip and opened it, then didn't know where to start. He clicked through the tabs one at a time and asked, "Where should I start with this?" Afterward he named it the most confusing moment: there are 8 trip tabs, and nothing says what each one is for.

## Prompt
> Fix struggle #1 from my stranger test: a new user doesn't know where to start after creating a trip. Add a question-mark icon in the top bar next to settings. Clicking it starts an intro tour: little bubbles that point at each section and say what it's for and how to use it. On a trip page, cover every tab and say where to start. Elsewhere, cover the main nav. It must work on a phone and in dark mode. Keep the step choice and bubble placement in pure, tested functions. Open an issue first and use `closes #N`.

## Follow-up found while checking it on a phone
> The tour scrolled the page sideways on a 375px phone. Find out why.

The cause was two existing layout bugs that made the trip page 727px wide on a phone: the header's export/itinerary buttons didn't wrap, and a `truncate` plan title inside a grid column without `min-w-0` forced the column wider. Both are fixed in this PR, since the tour depends on the page fitting the screen.
