import { requireAuth, isAuthResult } from "@/lib/api-auth";
import { changePasswordSchema } from "@/lib/validations";
import { changePasswordServer } from "@/services/passwordService";
import { apiError, apiSuccess, sanitizeError } from "@/utils/handleError";

export async function PATCH(request: Request) {
  const auth = await requireAuth();
  if (!isAuthResult(auth)) return auth;

  try {
    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const email = auth.user.email ?? auth.profile.email;
    if (!email) return apiError("Account email not found", 400);

    await changePasswordServer(
      auth.user.id,
      email,
      parsed.data.currentPassword,
      parsed.data.newPassword
    );
    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError(sanitizeError(e), 400);
  }
}
