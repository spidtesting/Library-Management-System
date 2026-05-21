import { getSupabaseSecretKey } from "@/lib/supabase/env";

/** True when the server secret is a real service-role / sb_secret key (not anon). */
export function isServiceRoleConfigured(): boolean {
  try {
    const key = getSupabaseSecretKey();
    if (key.startsWith("sb_secret_")) return true;
    const part = key.split(".")[1];
    if (!part) return false;
    const payload = JSON.parse(
      Buffer.from(part, "base64url").toString("utf8")
    ) as { role?: string };
    return payload.role === "service_role";
  } catch {
    return false;
  }
}

export function assertServiceRoleKey(): void {
  if (isServiceRoleConfigured()) return;
  throw new Error(
    "Server misconfigured: set SUPABASE_SECRET_KEY to your Supabase secret key (sb_secret_...), " +
      "not the anon/publishable key. Dashboard → Project Settings → API → Secret keys. " +
      "Then restart npm run dev."
  );
}
