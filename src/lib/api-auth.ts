import { createClient } from "@/services/supabase/server";
import type { Profile, UserRole } from "@/types";
import { apiError } from "@/utils/handleError";

export async function requireAuth(): Promise<
  { user: { id: string; email?: string }; profile: Profile } | Response
> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return apiError("Unauthorized", 401);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "id, role, full_name, email, phone, address, avatar_url, borrow_token_limit, borrow_tokens_used, is_active, created_at, updated_at"
    )
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return apiError("Profile not found", 404);
  }

  return { user: { id: user.id, email: user.email }, profile: profile as Profile };
}

export function requireRole(
  profile: Profile,
  allowed: UserRole[]
): Response | null {
  if (!allowed.includes(profile.role)) {
    return apiError("Forbidden", 403);
  }
  return null;
}

export function isAuthResult(
  result: Awaited<ReturnType<typeof requireAuth>>
): result is { user: { id: string; email?: string }; profile: Profile } {
  return !(result instanceof Response);
}
