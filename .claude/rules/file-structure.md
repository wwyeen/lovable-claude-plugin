# File Structure

Every project follows this layout exactly. Do not invent new top-level directories.

```
src/
  components/
    ui/                  # shadcn/ui primitives — generated, never hand-written
    [Feature]/           # feature-scoped components (e.g., Auth/, Dashboard/)
  pages/                 # one file per route, default export, PascalCase
  hooks/                 # custom hooks, always prefixed with `use`
  stores/                # Zustand stores, one file per domain
  types/                 # shared TypeScript interfaces
  lib/
    supabase.ts          # the one and only Supabase client
    utils.ts             # cn() helper only
    validations/         # Zod schemas, one file per domain
supabase/
  migrations/            # numbered SQL files: 001_init.sql, 002_posts.sql …
  functions/             # Deno edge functions
.github/
  workflows/             # CI/CD workflows
```

## Naming conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Page files | PascalCase | `DashboardPage.tsx` |
| Component files | PascalCase | `TaskCard.tsx` |
| Hook files | camelCase, `use` prefix | `useAuth.ts` |
| Store files | camelCase, `Store` suffix | `authStore.ts` |
| Validation files | camelCase, domain name | `task.ts` |
| Migration files | numbered prefix | `002_tasks.sql` |
