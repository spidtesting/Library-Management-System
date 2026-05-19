import { createClient } from "@/services/supabase/server";
import type { Profile } from "@/types";
import type { ProfileSelfUpdateInput } from "@/lib/validations";
import { emptyToNull } from "@/lib/sanitize-input";

import { PROFILE_COLUMNS } from "@/lib/profile-columns";

export async function getOwnProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", userId)
    .single();

  if (error) return null;
  return data as Profile;
}

export async function updateOwnProfile(
  userId: string,
  input: ProfileSelfUpdateInput
): Promise<Profile> {
  const supabase = await createClient();
  const payload = emptyToNull(input as Record<string, unknown>);

  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select(PROFILE_COLUMNS)
    .single();

  if (error) throw new Error(`updateProfile failed: ${error.message}`);
  return data as Profile;
}
