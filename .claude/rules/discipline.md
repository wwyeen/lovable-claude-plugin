# Incremental Change Discipline

Each prompt = **one logical unit of change**. Never touch code unrelated to the current ask.

## What counts as one unit

| Action | What to update |
|--------|---------------|
| Add a route | Create page file + update router + add nav link |
| Add a Supabase table | Migration file + TypeScript types + React Query hook + Zod schema |
| Add a form | Zod schema in `lib/validations/` + react-hook-form component + shadcn Form |
| Add a feature component | File in `src/components/[Feature]/` + named export |
| Add auth | Zustand store + forms + ProtectedRoute + pages + routes + migration |

## Do not

- Refactor unrelated files while implementing a feature
- Add dependencies that the feature doesn't strictly need
- Rename, reorganize, or clean up code outside the touched files
- Leave TODO comments as a substitute for working code
- Add abstractions for hypothetical future requirements

## The Golden Rule

After **every** response, the app must be in a runnable state:
- `npm run dev` starts without errors
- `npm run build` produces a clean dist with zero TypeScript errors

If a change breaks the build, fix it before stopping.
