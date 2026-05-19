-- Optional: tighten RLS write policies (run in SQL Editor if writes still fail with user JWT)
-- API routes use service role for mutations; this helps direct Supabase client usage.

DROP POLICY IF EXISTS "Librarians and admins manage books" ON books;
CREATE POLICY "Librarians and admins manage books"
  ON books FOR ALL
  USING (current_user_role() IN ('librarian', 'admin'))
  WITH CHECK (current_user_role() IN ('librarian', 'admin'));

DROP POLICY IF EXISTS "Only admins can update settings" ON settings;
CREATE POLICY "Only admins can update settings"
  ON settings FOR UPDATE
  USING (current_user_role() = 'admin')
  WITH CHECK (current_user_role() = 'admin');
