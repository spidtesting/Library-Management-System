-- Bulk-create SPID library members (28 accounts)
-- Run in Supabase Dashboard → SQL Editor → New query → Run
--
-- Prerequisites:
--   1. supabase/fix-member-create.sql (nic_number column + signup trigger)
--   2. pgcrypto extension (enabled below)
--
-- All accounts:
--   role = member
--   password = LibraryMember2026!
--   nic_number = NULL (members add NIC in Profile after login)
--   login with email until NIC is set (e.g. spid001@library.local)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Member roster (from data/spid-member-credentials.md)
-- ---------------------------------------------------------------------------
CREATE TEMP TABLE spid_import (
  staff_id   TEXT NOT NULL,
  full_name  TEXT NOT NULL,
  email      TEXT NOT NULL PRIMARY KEY
) ON COMMIT DROP;

INSERT INTO spid_import (staff_id, full_name, email) VALUES
  ('001', 'Disanayake D N W',       'spid001@library.local'),
  ('005', 'Theekshana G.L.L.',      'spid005@library.local'),
  ('13',  'PRIYASHAN H.M.M',        'spid013@library.local'),
  ('015', 'LASITHA NILMINI M K',    'spid015@library.local'),
  ('036', 'sanjeewa L V D',         'spid036@library.local'),
  ('038', 'ACHINTHA L',             'spid038@library.local'),
  ('040', 'MITHILA A',              'spid040@library.local'),
  ('046', 'THAKSHILA A.K.G',        'spid046@library.local'),
  ('047', 'DEVIKA A P',             'spid047@library.local'),
  ('049', 'KALANI B.A',             'spid049@library.local'),
  ('050', 'BUDDHI K.K',             'spid050@library.local'),
  ('051', 'Liyanage Mahesha',       'spid051@library.local'),
  ('052', 'sandamali P.V.C',        'spid052@library.local'),
  ('053', 'BHAGYA M',               'spid053@library.local'),
  ('054', 'TASHMI B.C',             'spid054@library.local'),
  ('055', 'PUSHPA U.G.R',           'spid055@library.local'),
  ('056', 'NIMANTHIKA N.M.D',       'spid056@library.local'),
  ('057', 'RASANA I F',             'spid057@library.local'),
  ('058', 'SAMANTHA G.H.A.L',       'spid058@library.local'),
  ('063', 'ISHARA K A A',           'spid063@library.local'),
  ('065', 'JAYASEKARA D.P.G',       'spid065@library.local'),
  ('081', 'harshika P G G B',       'spid081@library.local'),
  ('097', 'NILUKA LAKMALI J P',     'spid097@library.local'),
  ('106', 'INDEEWARI L.M.D',        'spid106@library.local'),
  ('410', 'DAKSHIKA A G',           'spid410@library.local'),
  ('495', 'KOKILA D P',             'spid495@library.local'),
  ('910', 'SANDARUWAN S',           'spid910@library.local'),
  ('915', 'PUBUDI H',               'spid915@library.local');

-- ---------------------------------------------------------------------------
-- Create auth users + profiles
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_row       spid_import%ROWTYPE;
  v_user_id   UUID;
  v_password  TEXT := 'LibraryMember2026!';
  v_instance  UUID := '00000000-0000-0000-0000-000000000000';
  v_now       TIMESTAMPTZ := NOW();
  v_created   INT := 0;
  v_skipped   INT := 0;
BEGIN
  FOR v_row IN SELECT * FROM spid_import ORDER BY staff_id LOOP
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_row.email LIMIT 1;

    IF v_user_id IS NOT NULL THEN
      v_skipped := v_skipped + 1;
      UPDATE public.profiles
      SET
        full_name = v_row.full_name,
        role = 'member',
        borrow_token_limit = 3,
        is_active = TRUE
      WHERE id = v_user_id;
      CONTINUE;
    END IF;

    v_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      v_instance,
      v_user_id,
      'authenticated',
      'authenticated',
      v_row.email,
      crypt(v_password, gen_salt('bf')),
      v_now,
      v_now,
      v_now,
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'sub', v_user_id::text,
        'email', v_row.email,
        'full_name', v_row.full_name,
        'staff_id', v_row.staff_id,
        'email_verified', true
      ),
      v_now,
      v_now,
      '',
      '',
      '',
      ''
    );

    INSERT INTO auth.identities (
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      v_user_id::text,
      v_user_id,
      jsonb_build_object(
        'sub', v_user_id::text,
        'email', v_row.email,
        'email_verified', true
      ),
      'email',
      v_now,
      v_now,
      v_now
    );

    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      role,
      nic_number,
      borrow_token_limit,
      borrow_tokens_used,
      is_active
    ) VALUES (
      v_user_id,
      v_row.email,
      v_row.full_name,
      'member',
      NULL,
      3,
      0,
      TRUE
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      role = 'member',
      nic_number = COALESCE(public.profiles.nic_number, EXCLUDED.nic_number),
      borrow_token_limit = 3,
      borrow_tokens_used = 0,
      is_active = TRUE;

    v_created := v_created + 1;
  END LOOP;

  RAISE NOTICE 'SPID import done: % created, % already existed (profiles refreshed).', v_created, v_skipped;
END $$;

-- Verify
SELECT
  p.email,
  p.full_name,
  p.role,
  p.nic_number,
  p.is_active
FROM public.profiles p
WHERE p.email LIKE 'spid%@library.local'
ORDER BY p.email;
