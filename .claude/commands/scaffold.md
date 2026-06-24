# /scaffold

Bootstrap a complete lovable-style project from scratch.

## Usage
`/scaffold [app description]`

## What this skill does

You are setting up a new full-stack web application using the lovable.dev stack. Follow these steps **in order** — do not skip ahead, each step depends on the previous one.

### Step 1 — Create Vite project

```bash
npm create vite@latest . -- --template react-ts
```

Accept any prompts to overwrite. Then install the full lovable stack in a **single** npm install command:

```bash
npm install react-router-dom @tanstack/react-query @tanstack/react-query-devtools @supabase/supabase-js zustand zod react-hook-form @hookform/resolvers lucide-react class-variance-authority clsx tailwind-merge @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-select @radix-ui/react-slot @radix-ui/react-toast @radix-ui/react-tooltip @radix-ui/react-separator @radix-ui/react-tabs
```

```bash
npm install --save-dev @tailwindcss/vite tailwindcss vitest @vitest/ui @vitest/coverage-v8 @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom @types/node
```

### Step 2 — Overwrite config files

**`vite.config.ts`**
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

**`tsconfig.app.json`** — add `paths` under `compilerOptions`:
```json
"baseUrl": ".",
"paths": { "@/*": ["./src/*"] }
```

### Step 3 — Initialize shadcn/ui

```bash
npx shadcn@latest init -d
```

Then add the core component set:
```bash
npx shadcn@latest add button card dialog form input label select separator tabs toast badge tooltip
```

### Step 4 — Write source files

Create these files exactly as specified:

**`src/index.css`**
```css
@import "tailwindcss";

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * { @apply border-border; }
  body { @apply bg-background text-foreground; }
}
```

**`src/lib/utils.ts`**
```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**`src/lib/supabase.ts`**
```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Copy .env.example to .env.local and fill in your project credentials.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export type { User, Session } from '@supabase/supabase-js'
```

**`src/main.tsx`**
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
)
```

**`src/App.tsx`**
```tsx
import { Suspense, lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const IndexPage = lazy(() => import('./pages/Index'))
const NotFoundPage = lazy(() => import('./pages/NotFound'))

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading…</div>}>
        <IndexPage />
      </Suspense>
    ),
  },
  {
    path: '*',
    element: (
      <Suspense fallback={null}>
        <NotFoundPage />
      </Suspense>
    ),
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
```

**`src/pages/Index.tsx`** — write a hero section appropriate to the app description argument. Use shadcn/ui `Button`. Default export only.

**`src/pages/NotFound.tsx`**
```tsx
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">Page not found.</p>
      <Button asChild>
        <Link to="/">Go Home</Link>
      </Button>
    </div>
  )
}
```

**`src/test/setup.ts`**
```ts
import '@testing-library/jest-dom'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => { cleanup() })

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
}))
```

**`src/test/utils.tsx`**
```tsx
import { ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  })
}

function AllProviders({ children, initialEntries = ['/'] }: {
  children: React.ReactNode
  initialEntries?: string[]
}) {
  const queryClient = createTestQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { initialEntries?: string[] },
) {
  const { initialEntries, ...renderOptions } = options ?? {}
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders initialEntries={initialEntries}>{children}</AllProviders>
    ),
    ...renderOptions,
  })
}

export * from '@testing-library/react'
export { customRender as render }
```

### Step 5 — Write project CLAUDE.md

Write a `CLAUDE.md` to the project root. Read each file from `~/.claude/lovable/rules/` and embed its full content under a heading matching the filename. The result is a self-contained rules file that works without any external path dependencies.

Structure it as:

```markdown
# [App Name] — Lovable Rules

> Scaffolded with the lovable.dev Claude Code plugin.
> Rules embedded from ~/.claude/lovable/rules/ at scaffold time.

## The Golden Rule
After every response the app must pass `npm run dev` and `npm run build` with zero TypeScript errors.

[embed content of discipline.md]

## Tech Stack
[embed content of stack.md]

## File Structure
[embed content of file-structure.md]

## Component Rules
[embed content of components.md]

## Data Fetching
[embed content of data-fetching.md]

## Supabase Patterns
[embed content of supabase-patterns.md]

## Forms
[embed content of forms.md]

## Forbidden
[embed content of forbidden.md]

## Available Skills
| Command | What it does |
|---------|-------------|
| `/component [Name]` | Generate a feature component using shadcn/ui primitives |
| `/page [Name] [/route]` | Create a new page + register route + optional query hook |
| `/supabase [feature]` | Add Supabase auth / table / storage / edge function |
| `/deploy` | Validate and deploy to Vercel |
```

### Step 6 — Write project root files

**`.env.example`**
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**`.env.local`** — copy from `.env.example`, leave values as placeholders (user will fill in).

**`vercel.json`**
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```

**`.gitignore`** — standard Vite gitignore plus `.env.local`.

**`supabase/config.toml`**
```toml
[api]
port = 54321

[db]
port = 54322
major_version = 15

[studio]
port = 54323

[auth]
site_url = "http://localhost:5173"
additional_redirect_urls = ["http://localhost:5173/auth/callback"]
jwt_expiry = 3600
enable_signup = true

[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = false

[storage]
enabled = true
```

### Step 6 — Copy GitHub Actions workflows

Copy the CI/CD workflow templates from `templates/workflows/` in this environment repo into the new project's `.github/workflows/` directory.

Copy all three files: `ci.yml` (from `.github/workflows/`), `deploy.yml`, and `preview.yml` (both from `templates/workflows/`).

### Step 7 — Verify build

```bash
npm run build
```

Report success or paste the full error output if build fails and fix before stopping.

### Step 8 — Git setup

Initialize a local git repository and make the first commit:

```bash
git init
git add .
git commit -m "chore: initial lovable scaffold"
```

Then ask the user:

> "Would you like to push this to GitHub? If yes, please paste your GitHub repository URL (e.g. `https://github.com/yourname/your-repo.git`). You can create a new empty repo at github.com/new first — make sure it has no README or .gitignore so it's truly empty."

If the user provides a URL, run:

```bash
git remote add origin <url>
git branch -M main
git push -u origin main
```

If the user has the GitHub CLI (`gh`) installed, offer to create the repo for them instead:

```bash
gh repo create <repo-name> --private --source=. --remote=origin --push
```

Ask whether they want it **public** or **private** before running this.

If the user skips GitHub setup, remind them they can push later with:
```bash
git remote add origin <url>
git push -u origin main
```
