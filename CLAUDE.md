# Lovable.dev — Claude Code Environment

This workspace simulates the lovable.dev development experience in Claude Code.
Every app you build here follows the same stack, conventions, and discipline that lovable.dev enforces.

---

## The Golden Rule

After **every** response, the app must be in a runnable state:
- `npm run dev` starts without errors
- `npm run build` produces a clean dist with zero TypeScript errors
- No red squiggles left behind in unrelated files

Non-negotiable. If a change breaks the build, fix it before stopping.

---

## Rules

@.claude/rules/stack.md
@.claude/rules/file-structure.md
@.claude/rules/components.md
@.claude/rules/data-fetching.md
@.claude/rules/supabase-patterns.md
@.claude/rules/forms.md
@.claude/rules/discipline.md
@.claude/rules/forbidden.md

---

## Available Skills (slash commands)

| Command | What it does |
|---------|-------------|
| `/lovable:scaffold [description]` | Bootstrap a complete new lovable-style project |
| `/lovable:component [Name]` | Generate a feature component using shadcn/ui primitives |
| `/lovable:page [Name] [/route]` | Create a new page + register route + optional query hook |
| `/lovable:supabase [feature]` | Add Supabase auth / table / storage / edge function |
| `/lovable:deploy` | Validate and deploy to Vercel |

> **Note:** The `/lovable:` prefix applies when installed globally (`--global`). For project installs (`--project`) the commands are scoped to the repo and invoked without a prefix: `/scaffold`, `/component`, etc.

---

## Common Commands

```bash
# Development
npm run dev          # start dev server → http://localhost:5173
npm run build        # type-check + production build
npm run typecheck    # tsc --noEmit only
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run test         # Vitest watch
npm run test:coverage

# shadcn/ui — add primitives
npx shadcn@latest add button card dialog form input table badge toast select tabs

# Supabase local dev
supabase start       # requires Docker
supabase db push     # apply migrations
supabase migration new <name>
supabase gen types typescript --local > src/types/database.ts
supabase functions serve
```

---

## Environment Variables

Every project needs a `.env.local` (gitignored) based on `.env.example`:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Never commit real secrets. Never use `SUPABASE_SERVICE_ROLE_KEY` on the frontend.
