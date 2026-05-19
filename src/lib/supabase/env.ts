/**
 * Supabase env helpers — supports new publishable/secret keys and legacy anon/service_role JWTs.
 * @see https://supabase.com/docs/guides/api/api-keys
 */

export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }
  return url;
}

/** Browser + server user-scoped client (RLS enforced). */
export function getSupabasePublishableKey(): string {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or legacy NEXT_PUBLIC_SUPABASE_ANON_KEY)"
    );
  }
  return key;
}

/** Server only — Auth Admin API, RPC issue/return. Never expose as NEXT_PUBLIC_. */
export function getSupabaseSecretKey(): string {
  const key =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "Missing SUPABASE_SECRET_KEY (or legacy SUPABASE_SERVICE_ROLE_KEY). " +
        "Copy the secret key from Supabase Dashboard → Project Settings → API."
    );
  }
  const publishable =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (publishable && key === publishable) {
    throw new Error(
      "SUPABASE_SECRET_KEY must not be the same as the publishable/anon key. " +
        "Use the secret key (sb_secret_...) from the dashboard."
    );
  }
  return key;
}
