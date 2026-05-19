import { createClient } from "@/services/supabase/server";
import { createAdminClient } from "@/services/supabase/admin";
import type { LibrarySettings } from "@/types";
import type { SettingsInput } from "@/lib/validations";

const COLUMNS =
  "id, library_name, max_borrow_days, fine_per_day, max_borrow_tokens, reservation_expiry_days, updated_by, updated_at";

export async function getSettings(): Promise<LibrarySettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("settings")
    .select(COLUMNS)
    .eq("id", 1)
    .single();

  if (error) throw new Error(`getSettings failed: ${error.message}`);
  return data as LibrarySettings;
}

export async function updateSettings(input: SettingsInput, updatedBy: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("settings")
    .update({ ...input, updated_by: updatedBy })
    .eq("id", 1);

  if (error) throw new Error(`updateSettings failed: ${error.message}`);
}
