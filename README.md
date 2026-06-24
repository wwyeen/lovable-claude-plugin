# Lovable Claude Plugin

A shareable Claude Code environment that replicates the [lovable.dev](https://lovable.dev) development experience — chat-driven, build-first, always-runnable full-stack web apps.

---

## How does this compare to lovable.dev?

| Capability | lovable.dev | This setup |
|---|---|---|
| Plain English prompts | Yes | Yes |
| Always-on rules | Yes (built-in) | Yes (CLAUDE.md + rules/) |
| Live browser preview | Yes (built-in) | Need to run `npm run dev` manually |
| Visual click-to-edit | Yes | No |
| One-click deploy | Yes | `/deploy` or manual |
| Non-tech friendly | Very | Mostly — terminal still needed |

The main gap for non-technical users isn't commands — it's that lovable.dev gives you a browser preview and deploy button in the same UI. Here, you'd need someone to run `npm run dev` once to start the dev server, then the user can describe features in plain English from there.

**Good middle ground:** open a terminal, run `npm run dev`, keep it running, then hand the Claude Code chat to the non-technical user. They just describe what they want.

---

## What it gives you

Five slash commands available inside Claude Code:

**Global install** — commands are namespaced to avoid conflicts with other plugins:

| Command | What it does |
|---------|-------------|
| `/lovable:scaffold [description]` | Bootstrap a complete React + Vite + TypeScript + Tailwind + shadcn/ui + Supabase project |
| `/lovable:component [Name]` | Generate a feature component using shadcn/ui primitives |
| `/lovable:page [Name] [/route]` | Add a page + register its route + optional data-fetching hook |
| `/lovable:supabase [feature]` | Add auth, a database table, storage bucket, or edge function |
| `/lovable:deploy` | Run checks (typecheck → lint → test → build) then deploy to Vercel |

**Project install** — no prefix needed (commands are already scoped to the repo):

| Command | What it does |
|---------|-------------|
| `/scaffold [description]` | Bootstrap a complete React + Vite + TypeScript + Tailwind + shadcn/ui + Supabase project |
| `/component [Name]` | Generate a feature component using shadcn/ui primitives |
| `/page [Name] [/route]` | Add a page + register its route + optional data-fetching hook |
| `/supabase [feature]` | Add auth, a database table, storage bucket, or edge function |
| `/deploy` | Run checks (typecheck → lint → test → build) then deploy to Vercel |

Plus always-on rules that make Claude follow the lovable stack conventions in every response — no commands needed for day-to-day development.

---

## Install

### Prerequisites
- [Claude Code](https://claude.ai/code) installed
- Node.js 18+

### Option A — Clone and run (recommended for teams)

```bash
git clone https://github.com/your-org/lovable-claude-plugin.git
cd lovable-claude-plugin
node install.js
```

The installer presents a menu:

```
Lovable Claude Plugin  v1.0.0

What would you like to do?

  1.  Install   global   — ~/.claude/commands/lovable/  (/lovable:scaffold, etc.)
                           Works in every project on this machine

  2.  Install   project  — ./.claude/commands/  (/scaffold, etc.)
                           Scoped to current directory; check into git

  3.  Uninstall global   — remove ~/.claude/commands/lovable/ and ~/.claude/lovable/

  4.  Uninstall project  — remove .claude/commands/, .claude/rules/, .claude/settings.json

Enter 1, 2, 3, or 4:
```

### Option B — npm (after publishing)

```bash
# Interactive
npx lovable-claude-plugin

# Or non-interactive
npx lovable-claude-plugin --global
npx lovable-claude-plugin --project
```

### Option C — npm scripts

```bash
npm run install:global     # same as --global
npm run install:project    # same as --project
npm run uninstall:global   # same as --uninstall --global --force
npm run uninstall:project  # same as --uninstall --project --force
```

---

## Global vs Project install

| | Global | Project |
|---|---|---|
| Where files go | `~/.claude/` | `./.claude/` |
| Works in | Every project on this machine | Only the current directory |
| Share with team | Each person installs individually | Commit `.claude/` to git — everyone gets it on clone |
| Best for | Personal productivity | Team projects with a shared stack |

**For teams on the same project**, project install is the right choice:

```bash
cd your-project
node /path/to/lovable-claude-plugin/install.js --project
git add .claude CLAUDE.md
git commit -m "chore: add lovable claude plugin"
git push
```

From that point on, any teammate who clones the repo has the commands and rules automatically — no install step needed.

---

## Usage

Once installed, open any project in Claude Code and either:

- **Type a plain English request** — the rules in CLAUDE.md guide Claude automatically
- **Use a slash command** for structured operations:

```
/scaffold "a task manager with due dates and priority levels"
/component TaskCard
/page Tasks /tasks
/supabase table task
/deploy
```

---

## Updating

Pull the latest version and re-run the installer:

```bash
cd lovable-claude-plugin
git pull
node install.js --global    # or --project
```

For project installs, commit the updated `.claude/` directory:

```bash
git add .claude
git commit -m "chore: update lovable claude plugin"
```

---

## Uninstalling

### Remove global install

```bash
node install.js --uninstall --global
```

Removes `~/.claude/commands/lovable/` and `~/.claude/lovable/`. `~/.claude/settings.json` is left untouched.

### Remove project install

```bash
node install.js --uninstall --project
```

Removes `.claude/commands/`, `.claude/rules/`, and `.claude/settings.json`. `CLAUDE.md` is left untouched (may contain your edits).

Add `--force` to either command to skip the confirmation prompt.

---

## Tech stack enforced

React 18 · Vite 6 · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui · React Router v6 · TanStack Query v5 · Zustand v5 · Zod v3 · react-hook-form v7 · Supabase JS v2 · lucide-react

See [CLAUDE.md](./CLAUDE.md) and [`.claude/rules/`](./.claude/rules/) for the full rule set.

---

## CI/CD templates

`.github/workflows/` contains three ready-to-use GitHub Actions workflows:

| File | Trigger | What it does |
|------|---------|--------------|
| `ci.yml` | Every PR + push to main | Lint · typecheck · test · build |
| `preview.yml` | PR opened/updated | Deploy preview to Vercel · post URL as PR comment |
| `deploy.yml` | Merge to main | Deploy to Vercel production |

Copy these into your project's `.github/workflows/` directory and add the required secrets to your GitHub repo:

| Secret | Source |
|--------|--------|
| `VITE_SUPABASE_URL` | Supabase project settings |
| `VITE_SUPABASE_ANON_KEY` | Supabase project settings |
| `VERCEL_TOKEN` | vercel.com → Account Settings → Tokens |
| `VERCEL_ORG_ID` | Vercel project settings |
| `VERCEL_PROJECT_ID` | Vercel project settings |
