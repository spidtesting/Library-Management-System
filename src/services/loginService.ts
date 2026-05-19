import { createAdminClient } from "@/services/supabase/admin";
import { isEmailIdentifier, normalizeNic } from "@/lib/nic";

/** Resolve login identifier to auth email (server-only, for NIC lookup). */
export async function resolveIdentifierToEmail(identifier: string): Promise<string | null> {
  const trimmed = identifier.trim();
  if (!trimmed) return null;

  if (isEmailIdentifier(trimmed)) {
    return trimmed.toLowerCase();
  }

  const nic = normalizeNic(trimmed);
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("email")
    .eq("nic_number", nic)
    .eq("role", "member")
    .maybeSingle();

  if (error || !data?.email) return null;
  return data.email.toLowerCase();
}
