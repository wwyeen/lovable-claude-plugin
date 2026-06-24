# /page

Create a new page, register its route, and optionally scaffold a data-fetching hook.

## Usage
`/page [Name] [/route]`

Examples:
- `/page Dashboard /dashboard`
- `/page Tasks /tasks`
- `/page Settings /settings`

---

## Steps

### 1. Create `src/pages/[Name].tsx`

```tsx
export default function [Name]Page() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold tracking-tight">[Name]</h1>
    </div>
  )
}
```

**Rules:**
- **Default export only** — required for React Router `lazy()`
- File named `[Name].tsx` (PascalCase, matching the route segment)
- Container div uses `container mx-auto py-8` as the base layout

### 2. Register the route in `src/App.tsx`

Read `src/App.tsx`, find the `createBrowserRouter([...])` array, and append:

```tsx
{
  path: '[/route]',
  element: (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading…</div>}>
      <[Name]Page />
    </Suspense>
  ),
},
```

Add the lazy import at the top of the file with the other lazy imports:
```tsx
const [Name]Page = lazy(() => import('./pages/[Name]'))
```

### 3. Add a nav link (if a nav component exists)

If `src/components/Nav.tsx` or `src/components/Layout.tsx` exists, add a `<Link to="[/route]">[Name]</Link>` entry using the shadcn/ui `NavigationMenu` or a plain `<Link>` from react-router-dom, consistent with existing nav items.

### 4. Scaffold a data hook (optional — only when the page clearly needs server data)

If the page will display list or detail data, create `src/hooks/use[Name].ts`:

```ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function use[Name]() {
  return useQuery({
    queryKey: ['[name-lowercase]'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('[table-name]')
        .select('*')
      if (error) throw error
      return data
    },
  })
}
```

### After writing

Verify `npm run typecheck` passes (or fix any errors before stopping).
