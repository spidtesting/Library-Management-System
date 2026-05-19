import { redirect } from "next/navigation";
import { createClient } from "@/services/supabase/server";
import { getProfileServer } from "@/services/authService";
import type { Profile, UserRole } from "@/types";
import { ROLE_DASHBOARD } from "@/lib/constants";

export async function requirePortalRole(
  allowed: UserRole[]
): Promise<Profile> {
  const supabase = await createClient();
  const profile = await getProfileServer(supabase);

  if (!profile) {
    redirect("/login");
  }

  if (!allowed.includes(profile.role)) {
    redirect(ROLE_DASHBOARD[profile.role] ?? "/member/dashboard");
  }

  return profile;
}
