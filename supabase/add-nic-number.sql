-- Add NIC number for member login (run in Supabase SQL Editor)

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS nic_number TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_nic
  ON profiles (nic_number)
  WHERE nic_number IS NOT NULL;

COMMENT ON COLUMN profiles.nic_number IS 'National ID Card number; unique per member, used for login';
