# Tech Stack

Enforced, not suggested. Never deviate without explicit user instruction.

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | React 18 functional components | No class components, ever |
| Build tool | Vite 6 | Never eject or add webpack |
| Language | TypeScript (strict) | No `any` — use `unknown` + narrowing |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite` | No `tailwind.config.ts`, no PostCSS config, `@import "tailwindcss"` in CSS |
| UI primitives | shadcn/ui | Always prefer these over raw HTML elements |
| Routing | React Router v6 — `createBrowserRouter` + `RouterProvider` | No `<BrowserRouter>` + `<Route>` JSX pattern |
| Server state | TanStack Query v5 | No `useEffect` + `fetch` for data loading |
| Client state | Zustand v5 | No Redux, no Context for complex state |
| Forms | react-hook-form v7 + Zod v3 | Always validate with Zod schema via `@hookform/resolvers` |
| Backend | Supabase JS v2 — singleton client | Never call `createClient` more than once |
| Icons | lucide-react | No other icon libraries |
