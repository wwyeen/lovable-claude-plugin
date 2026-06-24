# Supabase Patterns

## Singleton client

`src/lib/supabase.ts` is the **only** place `createClient` is called. Import `supabase` from there everywhere else.

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Auth state

- Always managed in a Zustand store (`src/stores/authStore.ts`)
- Initialized from `supabase.auth.getSession()` on app mount
- Kept live via `supabase.auth.onAuthStateChange()`
- Never stored in React state or Context

## Row Level Security

- RLS is **always enabled** on every table — never disabled
- Every table needs policies for at minimum: SELECT, INSERT, UPDATE, DELETE
- The standard owner pattern:
  ```sql
  USING (auth.uid() = user_id)
  ```

## Migrations

- Append-only — **never edit an existing migration file**
- Numbered sequentially: `001_init.sql`, `002_tasks.sql`, `003_comments.sql`
- Always include `ENABLE ROW LEVEL SECURITY` and policies in the same migration as `CREATE TABLE`

## Environment variables

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Never use `SUPABASE_SERVICE_ROLE_KEY` on the frontend.
