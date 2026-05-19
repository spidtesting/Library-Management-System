-- Full fix: auto-create profiles on signup (run AFTER disable-auth-trigger.sql if needed)
-- Supabase SQL Editor → New query → Run all

-- 1. Function owned by postgres, safe search_path, no invalid role cast
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

-- 2. Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- 3. Permissions for Supabase Auth admin role
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

GRANT ALL ON TABLE public.profiles TO supabase_auth_admin;
GRANT ALL ON TABLE public.profiles TO postgres, service_role;

GRANT USAGE ON TYPE public.user_role TO supabase_auth_admin;
GRANT USAGE ON TYPE public.user_role TO postgres, service_role, anon, authenticated;

-- 4. RLS: allow service role full access (already bypasses RLS, but explicit for clarity)
-- Profiles policies remain for normal clients.
