import { redirect } from "next/navigation";
import { createClient } from "@/services/supabase/server";
import { getProfileServer } from "@/services/authService";
import { ROLE_DASHBOARD } from "@/lib/constants";

export default async function HomePage() {
  const supabase = await createClient();
  const profile = await getProfileServer(supabase);
  if (!profile) redirect("/login");
  redirect(ROLE_DASHBOARD[profile.role] ?? "/member/dashboard");
}
