# Production Checklist

## Security

- [x] `SUPABASE_SERVICE_ROLE_KEY` only in `src/services/supabase/admin.ts` and RPC API routes
- [x] API routes: auth → role → Zod → logic → sanitized errors
- [x] No `select('*')` in services — explicit column lists
- [x] Book queries filter `deleted_at IS NULL`
- [x] No role picker on public registration

## Error & loading boundaries

- [x] `(auth)/error.tsx` + `loading.tsx`
- [x] `(admin)/admin/error.tsx` + `loading.tsx`
- [x] `(librarian)/librarian/error.tsx` + `loading.tsx`
- [x] `(member)/member/error.tsx` + `loading.tsx`

## Performance

- [x] Recharts dynamic import (`AdminBorrowChart`)
- [x] `next/image` for book covers with remote Supabase pattern in `next.config.ts`
- [x] `revalidate = 60` on book list pages
- [x] Settings via API with server fetch

## Accessibility

- [x] `htmlFor` on form labels
- [x] `aria-label` on icon-only buttons (nav, notifications, user menu)
- [x] Table captions (`sr-only`)

## Mobile

- [x] Sidebar hidden on mobile; Sheet hamburger nav
- [x] `overflow-x-auto` on tables
- [x] Responsive grids for books and dashboards

## Deployment

1. Copy `.env.local.example` → `.env.local` and fill Supabase keys
2. Run `supabase/library_schema.sql` in Supabase SQL Editor (see `supabase/SUPABASE_SETUP.md`)
3. Create Storage buckets `book-covers` (public) and `book-pdfs` (private)
4. Schedule pg_cron: `SELECT cron.schedule('mark-overdue', '0 1 * * *', 'SELECT mark_overdue_books()');`
5. Register first user, then: `UPDATE profiles SET role = 'admin' WHERE email = 'you@example.com';`
6. Deploy to Vercel with env vars (`SUPABASE_SERVICE_ROLE_KEY` as **Server** only)
7. Add production URL to Supabase Auth redirect allowlist

## Verify locally

```bash
npm run build
npm run dev
```
