<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Itinerary import: AI parsing runs in an authenticated server function (src/lib/import-plan.functions.ts) with a strict JSON schema; the client previews results before inserting — keeps the AI key server-side and lets users review AI output.
- Recover stale client module downloads through a shared, session-bounded reload handler and keep manual reload available in the error boundary — updates must not strand an open page or cause reload loops.
