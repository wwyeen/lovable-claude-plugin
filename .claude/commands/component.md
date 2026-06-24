# /component

Generate a feature component using shadcn/ui primitives.

## Usage
`/component [Name]` — feature component (e.g., `/component TaskCard`)
`/component [Feature/Name]` — scoped to a feature folder (e.g., `/component Auth/LoginForm`)
`/component --ui [primitive]` — install a shadcn/ui primitive (e.g., `/component --ui combobox`)

---

## `--ui` flag

Run:
```bash
npx shadcn@latest add [primitive]
```
Report the installed file path. Done.

---

## Feature component (no flag)

### Placement
- `Auth/LoginForm` → `src/components/Auth/LoginForm.tsx`
- `TaskCard` → `src/components/TaskCard.tsx`

### Template

```tsx
import { cn } from '@/lib/utils'
// import shadcn/ui primitives relevant to this component's purpose

interface [Name]Props {
  className?: string
  // add props specific to this component
}

export function [Name]({ className }: [Name]Props) {
  return (
    // Use shadcn/ui Card, Button, Badge, etc. as the primary structure.
    // Tailwind utility classes only — no inline styles.
    // cn() for conditional/merged classes.
    <div className={cn('', className)}>
      {/* component content */}
    </div>
  )
}
```

### Rules
- **Named export only** — never default export a non-page component
- Props typed as an `interface`, never inline
- shadcn/ui primitives (`Card`, `Button`, `Badge`, `Dialog`, etc.) are the first choice for structure
- `cn()` from `@/lib/utils` for all conditional classes
- lucide-react for any icons
- If the component fetches data, use TanStack Query inside it — never `useEffect` + `fetch`

### After writing
Check that `@/lib/utils` and any imported shadcn/ui components exist. If a shadcn primitive is missing, install it:
```bash
npx shadcn@latest add [primitive-name]
```
