# /deploy

Validate the project and deploy to production via Vercel.

## Steps (run in order — stop on first failure)

### 1. Type check
```bash
npm run typecheck
```
If it fails: fix all TypeScript errors before continuing.

### 2. Lint
```bash
npm run lint
```
If it fails: run `npm run lint:fix`, then re-check. Fix any remaining errors manually.

### 3. Tests
```bash
npm run test -- --run
```
If tests fail: fix failing tests before continuing.

### 4. Production build
```bash
npm run build
```
If it fails: read the full error output and fix before continuing.

### 5. Environment variable check

Read `.env.example` and confirm every `VITE_` variable is present in `.env.local`. Warn the user about any missing variables that will need to be set in Vercel's project settings before the app will work in production.

### 6. Ensure `vercel.json` exists

If it doesn't exist, create it:
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

### 7. Deploy

Check if Vercel CLI is installed:
```bash
npx vercel --version
```

If available, deploy to production:
```bash
npx vercel --prod
```

If not available or not linked, print this checklist for the user:

---

## Manual Deploy Checklist

- [ ] Push code to GitHub: `git push origin main`
- [ ] Import project at vercel.com/new
- [ ] Set environment variables in Vercel project settings:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- [ ] Run `supabase db push` against your production Supabase project
- [ ] Confirm RLS is enabled on all tables in Supabase dashboard
- [ ] Trigger a deployment from the Vercel dashboard

---

## Supabase Production Checklist

- [ ] Set `enable_confirmations = true` in `supabase/config.toml` for production
- [ ] Add production domain to `additional_redirect_urls` in Supabase Auth settings
- [ ] Review RLS policies — every table must have policies for authenticated users
- [ ] Enable leaked password protection in Supabase Auth settings
