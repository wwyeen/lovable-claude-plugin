# Data Fetching

## Rule: TanStack Query for all server state

Never use `useEffect` + `fetch` or `useEffect` + Supabase calls for loading data.

```tsx
// WRONG
useEffect(() => {
  supabase.from('tasks').select('*').then(({ data }) => setTasks(data))
}, [])

// RIGHT
const { data: tasks } = useQuery({
  queryKey: ['tasks'],
  queryFn: async () => {
    const { data, error } = await supabase.from('tasks').select('*')
    if (error) throw error
    return data
  },
})
```

## Mutations

```tsx
const createTask = useMutation({
  mutationFn: async (payload: CreateTask) => {
    const { data, error } = await supabase.from('tasks').insert(payload).select().single()
    if (error) throw error
    return data
  },
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
})
```

## Query key conventions

- List: `['tasks']`
- Single item: `['tasks', id]`
- Filtered: `['tasks', { status: 'open' }]`

Always invalidate the list key after a mutation.

## QueryClient setup (main.tsx)

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
})
```
