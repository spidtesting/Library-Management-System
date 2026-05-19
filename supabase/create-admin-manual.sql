-- Manual admin (if npm run create-admin still fails)
-- Replace the email below, then run in SQL Editor.

-- Step A: If you already added the user in Dashboard → Authentication → Users,
-- only run Step B.

-- Step B: Promote to admin (get user id from Authentication → Users → click user → copy UUID)
/*
UPDATE public.profiles
SET role = 'admin', is_active = true, full_name = 'Library Admin'
WHERE email = 'you@mail.com';

-- If no profile row yet:
INSERT INTO public.profiles (id, email, full_name, role, is_active)
SELECT id, email, 'Library Admin', 'admin', true
FROM auth.users
WHERE email = 'you@mail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin', is_active = true;
*/
