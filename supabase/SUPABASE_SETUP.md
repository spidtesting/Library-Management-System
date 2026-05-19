# Supabase Setup

## 1. Create project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → New project.
2. Copy **Project URL**, **anon key**, and **service_role key** into `.env.local`.

## 2. Run schema

1. Open **SQL Editor** in the dashboard.
2. Paste and run the entire [`library_schema.sql`](./library_schema.sql) file.

## 3. Auth

1. **Authentication → Providers** — enable Email.
2. **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/**`

## 4. Storage buckets

Create in **Storage**:

| Bucket        | Public | Notes                          |
|---------------|--------|--------------------------------|
| `book-covers` | Yes    | Cover images via API upload    |
| `book-pdfs`   | No     | PDFs for authenticated users   |

Uploads are handled through API routes using the service role.

## 5. pg_cron (overdue job)

1. **Database → Extensions** — enable `pg_cron`.
2. Run in SQL Editor:

```sql
SELECT cron.schedule('mark-overdue', '0 1 * * *', 'SELECT mark_overdue_books()');
```

## 6. Bootstrap first admin

**Option A — script (needs real `service_role` in `.env.local`):**

```bash
npm run create-admin
# or: ADMIN_EMAIL=you@mail.com ADMIN_PASSWORD='YourPass123!' npm run create-admin
```

**Option B — SQL (after registering in the app):**

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

## 7. Optional CLI

```bash
npx supabase init
npx supabase link --project-ref YOUR_PROJECT_REF
```
