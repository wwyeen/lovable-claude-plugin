# What NOT to Do

These are hard bans. If you are about to do any of these, stop and find the correct approach instead.

## State management
- No Redux, MobX, Jotai, or Recoil — use Zustand
- No React Context for complex/global state — use Zustand
- No `useState` for server data — use TanStack Query

## Data fetching
- No `useEffect` + `fetch` — use TanStack Query
- No `useEffect` + Supabase calls for loading data — use TanStack Query
- No Axios — use Supabase client or native `fetch`

## Styling
- No CSS Modules
- No styled-components or emotion
- No inline `style={{ }}` objects — Tailwind only
- No custom CSS classes when a Tailwind utility exists

## TypeScript
- No `any` type — use `unknown` + type narrowing
- No `// @ts-ignore` — fix the underlying type issue

## Code quality
- No `console.log` in committed code — use `toast()` for user-facing feedback
- No barrel `index.ts` re-export files — causes Vite HMR issues
- No class components — functional components + hooks only

## Supabase
- Never call `createClient` more than once — import from `src/lib/supabase.ts`
- Never disable RLS on any table
- Never edit an existing migration file — migrations are append-only
- Never use `SUPABASE_SERVICE_ROLE_KEY` on the frontend

## Architecture
- No over-engineering: three similar lines are better than a premature abstraction
- No adding features or refactoring beyond what the current prompt asks for
- No half-finished implementations — everything committed must work
