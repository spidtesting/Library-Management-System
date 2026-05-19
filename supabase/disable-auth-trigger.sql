-- QUICK FIX for "Database error creating new user"
-- Run this in Supabase SQL Editor, then: npm run create-admin
--
-- Auth will still create users; the app script will create the profiles row.
-- After admin works, run fix-signup-trigger.sql so /register works for members.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
