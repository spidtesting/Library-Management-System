# Library Management System

Production-grade public library app with **Admin**, **Librarian**, and **Member** portals.

## Stack

- Next.js 15+ (App Router), TypeScript (strict), Tailwind CSS, shadcn/ui
- Supabase (PostgreSQL, Auth, Storage, RLS)
- react-hook-form + Zod, SWR, Recharts

## Quick start

```bash
cd ~/Developer/library-management-system
cp .env.local.example .env.local
# Fill in URL, publishable key (sb_publishable_...), and secret key (sb_secret_...)
npm install @supabase/supabase-js @supabase/ssr
npm run dev
```

## Database setup

See [supabase/SUPABASE_SETUP.md](supabase/SUPABASE_SETUP.md) — run `supabase/library_schema.sql` in the Supabase SQL Editor before using the app.

## Project structure

- `src/app/(admin)/admin/*` — Admin portal
- `src/app/(librarian)/librarian/*` — Librarian portal
- `src/app/(member)/member/*` — Member portal
- `src/app/(auth)/*` — Login, register, forgot password
- `src/services/*` — Supabase service layer (no DB calls in components)
- `src/app/api/*` — Route handlers with auth + RLS/RPC

## Roles

| Role | Dashboard |
|------|-----------|
| admin | `/admin/dashboard` |
| librarian | `/librarian/dashboard` |
| member | `/member/dashboard` |

### Create admin user (recommended)

1. In Supabase Dashboard → **Project Settings → API**, copy the **Secret** key (`sb_secret_...`).
2. Put it in `.env.local` as `SUPABASE_SECRET_KEY` (must **not** be the publishable key).
3. Run:

```bash
npm run create-admin
```

Default login: `admin@library.local` / `LibraryAdmin123!`

Custom email/password:

```bash
ADMIN_EMAIL=you@mail.com ADMIN_PASSWORD='YourPass123!' npm run create-admin
```

### If create-admin fails with "Database error creating new user"

The auth trigger that creates `profiles` rows needs a one-time fix:

1. Supabase Dashboard → **SQL Editor**
2. Run all of [`supabase/fix-signup-trigger.sql`](supabase/fix-signup-trigger.sql)
3. Run `npm run create-admin` again

**Or** add the user in Dashboard → **Authentication → Users**, then:

```bash
ADMIN_EMAIL=you@mail.com npm run promote-admin
```

### Or promote an existing account (SQL)

After registering in the app:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'you@example.com';
```

## Production

See [CHECKLIST.md](CHECKLIST.md) for security, a11y, and deployment steps.
