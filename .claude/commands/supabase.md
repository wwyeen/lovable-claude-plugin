# /supabase

Add Supabase-powered features to the current project.

## Usage
- `/supabase auth` — full auth flow (store, forms, protected routes)
- `/supabase table [name]` — new table with types, RLS, query hook, Zod schema
- `/supabase storage [bucket]` — storage bucket with upload hook
- `/supabase function [name]` — Deno edge function + typed caller

---

## `/supabase auth`

Create the full authentication layer in this order:

### 1. `src/stores/authStore.ts`
```ts
import { create } from 'zustand'
import { supabase, type User, type Session } from '@/lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    set({ session, user: session?.user ?? null, loading: false })

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null })
    })
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  },

  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null })
  },
}))
```

### 2. `src/lib/validations/auth.ts`
```ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const signUpSchema = loginSchema.extend({
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>
```

### 3. `src/components/Auth/LoginForm.tsx`
Use `useForm` + `zodResolver(loginSchema)` + shadcn/ui `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `Input`, `Button`. Call `useAuthStore(s => s.signIn)` on submit. Show a toast on error.

### 4. `src/components/Auth/SignUpForm.tsx`
Same pattern using `signUpSchema` and `useAuthStore(s => s.signUp)`.

### 5. `src/components/Auth/ProtectedRoute.tsx`
```tsx
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore()
  if (loading) return <div className="flex h-screen items-center justify-center">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}
```

### 6. `src/pages/LoginPage.tsx` and `src/pages/SignUpPage.tsx`
Center the respective form components with a card layout. Default exports.

### 7. Update `src/App.tsx`
- Add `useAuthStore().initialize()` in a `useEffect` in the root `App` component
- Add routes: `/login` → `LoginPage`, `/signup` → `SignUpPage`
- Wrap protected routes with `<ProtectedRoute>`

### 8. `supabase/migrations/001_enable_auth.sql`
```sql
-- Auth is provided by Supabase by default.
-- This migration documents that RLS must be enabled on all future tables.
-- Example policy pattern:
-- ALTER TABLE public.example ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can only access their own rows"
--   ON public.example FOR ALL
--   USING (auth.uid() = user_id);
```

---

## `/supabase table [name]`

Replace `[name]` with the singular snake_case table name (e.g., `task`, `post`, `product`).

### 1. Migration file
Determine the next migration number by checking existing files in `supabase/migrations/`.
Create `supabase/migrations/NNN_[name].sql`:
```sql
CREATE TABLE IF NOT EXISTS public.[name]s (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- add columns appropriate to the entity
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.[name]s ENABLE ROW LEVEL SECURITY;

CREATE POLICY "[name]s: users read own"
  ON public.[name]s FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "[name]s: users insert own"
  ON public.[name]s FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "[name]s: users update own"
  ON public.[name]s FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "[name]s: users delete own"
  ON public.[name]s FOR DELETE
  USING (auth.uid() = user_id);
```

### 2. TypeScript types `src/types/[name].ts`
```ts
export interface [Name] {
  id: string
  user_id: string
  // mirror the columns from the migration
  created_at: string
  updated_at: string
}

export type Create[Name] = Omit<[Name], 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type Update[Name] = Partial<Create[Name]>
```

### 3. Zod schema `src/lib/validations/[name].ts`
```ts
import { z } from 'zod'

export const [name]Schema = z.object({
  // fields matching Create[Name]
})

export type [Name]FormData = z.infer<typeof [name]Schema>
```

### 4. TanStack Query hook `src/hooks/use[Name]s.ts`
```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { [Name], Create[Name], Update[Name] } from '@/types/[name]'

const QUERY_KEY = ['[name]s']

export function use[Name]s() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase.from('[name]s').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data as [Name][]
    },
  })
}

export function useCreate[Name]() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Create[Name]) => {
      const { data, error } = await supabase.from('[name]s').insert(payload).select().single()
      if (error) throw error
      return data as [Name]
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useUpdate[Name]() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: Update[Name] & { id: string }) => {
      const { data, error } = await supabase.from('[name]s').update(payload).eq('id', id).select().single()
      if (error) throw error
      return data as [Name]
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useDelete[Name]() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('[name]s').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}
```

---

## `/supabase storage [bucket]`

### 1. Migration `supabase/migrations/NNN_storage_[bucket].sql`
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('[bucket]', '[bucket]', false)
ON CONFLICT DO NOTHING;

CREATE POLICY "[bucket]: authenticated users can upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = '[bucket]');

CREATE POLICY "[bucket]: users read own files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = '[bucket]' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 2. Hook `src/hooks/use[Bucket]Upload.ts`
```ts
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export function use[Bucket]Upload() {
  const [uploading, setUploading] = useState(false)

  async function upload(file: File, path: string) {
    setUploading(true)
    try {
      const { error } = await supabase.storage.from('[bucket]').upload(path, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('[bucket]').getPublicUrl(path)
      return data.publicUrl
    } finally {
      setUploading(false)
    }
  }

  async function remove(path: string) {
    const { error } = await supabase.storage.from('[bucket]').remove([path])
    if (error) throw error
  }

  return { upload, remove, uploading }
}
```

---

## `/supabase function [name]`

### 1. `supabase/functions/[name]/index.ts`
```ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // TODO: implement function logic

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
```

### 2. Caller `src/lib/functions.ts` (create or append)
```ts
import { supabase } from '@/lib/supabase'

export async function call[Name](payload: unknown) {
  const { data, error } = await supabase.functions.invoke('[name]', { body: payload })
  if (error) throw error
  return data
}
```
