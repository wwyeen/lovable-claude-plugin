# Form Pattern

All forms use react-hook-form + Zod. No exceptions.

## Setup

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})
type FormData = z.infer<typeof schema>

export function LoginForm() {
  const form = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = form.handleSubmit(async (data) => {
    // call mutation or store action
  })

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Submitting…' : 'Submit'}
        </Button>
      </form>
    </Form>
  )
}
```

## Zod schema placement

- Simple schemas (login, signup): `src/lib/validations/auth.ts`
- Domain schemas (task, post): `src/lib/validations/[domain].ts`
- Always export the type: `export type FormData = z.infer<typeof schema>`

## Rules

- Use shadcn/ui `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` — never raw `<input>`
- Disable the submit button while `form.formState.isSubmitting` is true
- Show server errors via `form.setError('root', { message })` or a toast
