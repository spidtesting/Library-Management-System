-- Run in SQL Editor if book or member writes fail with 500 / RLS errors

DROP POLICY IF EXISTS "Admins full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Admins manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Staff manage member profiles" ON profiles;
DROP POLICY IF EXISTS "Librarians manage member profiles" ON profiles;
DROP POLICY IF EXISTS "Librarians update member profiles" ON profiles;
DROP POLICY IF EXISTS "Librarians delete member profiles" ON profiles;

CREATE POLICY "Admins manage all profiles"
  ON profiles FOR ALL
  USING (current_user_role() = 'admin')
  WITH CHECK (current_user_role() = 'admin');

CREATE POLICY "Librarians manage member profiles"
  ON profiles FOR INSERT
  WITH CHECK (current_user_role() = 'librarian' AND role = 'member');

CREATE POLICY "Librarians update member profiles"
  ON profiles FOR UPDATE
  USING (current_user_role() = 'librarian' AND role = 'member')
  WITH CHECK (current_user_role() = 'librarian' AND role = 'member');

CREATE POLICY "Librarians delete member profiles"
  ON profiles FOR DELETE
  USING (current_user_role() = 'librarian' AND role = 'member');

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
