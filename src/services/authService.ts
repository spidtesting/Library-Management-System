import { createClient } from "@/services/supabase/client";
import type { Profile } from "@/types";
import { ROLE_DASHBOARD } from "@/lib/constants";
import type { LoginInput, RegisterInput } from "@/lib/validations";
import { PROFILE_COLUMNS } from "@/lib/profile-columns";
import { isEmailIdentifier } from "@/lib/nic";

export async function signIn({ identifier, password }: LoginInput) {
  const supabase = createClient();
  let email = identifier.trim();

  if (!isEmailIdentifier(email)) {
    const resolved = await fetch("/api/auth/resolve-identifier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier }),
    });
    if (!resolved.ok) {
      throw new Error("Invalid email/NIC or password");
    }
    const data = (await resolved.json()) as { email?: string };
    if (!data.email) throw new Error("Invalid email/NIC or password");
    email = data.email;
  } else {
    email = email.toLowerCase();
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(error.message === "Invalid login credentials" ? "Invalid email/NIC or password" : error.message);
  return data;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("Not signed in");

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (verifyError) throw new Error("Current password is incorrect");

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}

export async function signUp({ email, password, fullName }: RegisterInput) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function resetPassword(email: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/login`,
  });
  if (error) throw new Error(error.message);
}

export async function getSession() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", user.id)
    .single();

  if (error) return null;
  return data as Profile;
}

export function getDashboardPath(role: string): string {
  return ROLE_DASHBOARD[role] ?? "/member/dashboard";
}

export async function getProfileServer(
  supabase: Awaited<ReturnType<typeof import("@/services/supabase/server").createClient>>
): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", user.id)
    .single();

  return data as Profile | null;
}
