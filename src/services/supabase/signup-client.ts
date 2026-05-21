import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

/** Isolated client for staff-created signups — does not touch the admin session cookies. */
export function createSignUpClient() {
  return createSupabaseClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
