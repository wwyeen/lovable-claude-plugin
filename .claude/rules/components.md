# Component Rules

## Export pattern

```tsx
// Named export for every non-page component
export function FeatureCard({ title, className }: FeatureCardProps) { … }

// Default export ONLY for page components (required for React Router lazy())
export default function DashboardPage() { … }
```

## Props

```tsx
// Always a named interface — never inline types
interface FeatureCardProps {
  title: string
  className?: string
}
```

## Styling

```tsx
// Always cn() for conditional classes — never string template literals
import { cn } from '@/lib/utils'
<div className={cn('base-classes', isActive && 'active-class', className)} />

// No inline style objects — Tailwind only
```

## UI primitives

shadcn/ui components (`Card`, `Button`, `Dialog`, `Table`, `Badge`, `Form`, `Input`, `Select`, `Tabs`) are the **first choice** for any UI need. Only reach for a raw HTML element when no shadcn primitive fits.

## Icons

Always lucide-react. Import named icons only:
```tsx
import { Plus, Trash2, ChevronDown } from 'lucide-react'
```
