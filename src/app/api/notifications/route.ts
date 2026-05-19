import { requireAuth, isAuthResult } from "@/lib/api-auth";
import { markAllNotificationsRead } from "@/services/notificationService";
import { apiError, apiSuccess, sanitizeError } from "@/utils/handleError";

export async function PATCH() {
  const auth = await requireAuth();
  if (!isAuthResult(auth)) return auth;

  try {
    await markAllNotificationsRead(auth.user.id);
    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError(sanitizeError(e), 500);
  }
}
