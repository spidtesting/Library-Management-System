-- Run in Supabase SQL Editor if POST /api/members returns 500
-- Fixes: nic_number column, profile RLS for staff, books WITH CHECK, signup trigger

-- 1. NIC column (member login)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS nic_number TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_nic
  ON profiles (nic_number)
  WHERE nic_number IS NOT NULL;

-- 2. Profile policies — admins + librarians can create/edit members
DROP POLICY IF EXISTS "Admins full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Staff manage member profiles" ON profiles;
DROP POLICY IF EXISTS "Librarians manage member profiles" ON profiles;

CREATE POLICY "Admins manage all profiles"
  ON profiles FOR ALL
  USING (current_user_role() = 'admin')
  WITH CHECK (current_user_role() = 'admin');

CREATE POLICY "Librarians manage member profiles"
  ON profiles FOR INSERT
  WITH CHECK (
    current_user_role() = 'librarian'
    AND role = 'member'
  );

CREATE POLICY "Librarians update member profiles"
  ON profiles FOR UPDATE
  USING (current_user_role() = 'librarian' AND role = 'member')
  WITH CHECK (current_user_role() = 'librarian' AND role = 'member');

CREATE POLICY "Librarians delete member profiles"
  ON profiles FOR DELETE
  USING (current_user_role() = 'librarian' AND role = 'member');

-- 3. Books write policy (create / update / delete)
DROP POLICY IF EXISTS "Librarians and admins manage books" ON books;
CREATE POLICY "Librarians and admins manage books"
  ON books FOR ALL
  USING (current_user_role() IN ('librarian', 'admin'))
  WITH CHECK (current_user_role() IN ('librarian', 'admin'));

-- 4. Signup trigger (auto profile on auth user) — safe version
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
      split_part(COALESCE(NEW.email, 'user'), '@', 1)
    ),
    'member'::public.user_role
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'handle_new_user failed for %: %', NEW.id, SQLERRM;
    RAISE;
END;
$$;

ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON TABLE public.profiles TO supabase_auth_admin;
GRANT USAGE ON TYPE public.user_role TO supabase_auth_admin;
