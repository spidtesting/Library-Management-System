import { createAdminClient } from "@/services/supabase/admin";
import { createClient } from "@/services/supabase/server";

export async function changePasswordServer(
  userId: string,
  email: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  });
  if (verifyError) {
    throw new Error("Current password is incorrect");
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });
  if (error) throw new Error(error.message);
}
