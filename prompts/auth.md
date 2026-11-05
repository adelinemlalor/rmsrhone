# Prompts — Feature 1: Sign up, log in, log out

Agent: Claude Code (Opus 5.5), branch `feature/auth`

## Prompt
> Feature 1 from PLAN.md: "As a new visitor, I want to create an account with my email and a password, log in, and log out, so that my trips are private to me." Sign-up and login already exist from the Lovable prototype. Check them against the done-when list. Make **Log out** a visible labeled button that returns to the landing page, and replace raw Supabase error text and browser pop-ups with friendly inline messages.

## What the agent found and changed
- Sign-up, login and logout already worked through Supabase Auth (`src/routes/auth.tsx`, `src/components/shell.tsx`).
- Problems found: errors showed Supabase's raw text (for example "Invalid login credentials"), blank fields triggered the browser's own pop-up, logout was an unlabeled icon that went to `/auth`, and signing up with an already-registered email showed "Check your inbox" even though no email is sent in that case.
- Added `src/lib/auth-errors.ts` (`friendlyAuthError`, `validateAuthForm`), inline field messages, a labeled "Log out" button that goes to `/`, and detection of already-registered emails.
