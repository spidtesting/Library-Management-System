import { requireAuth, requireRole, isAuthResult } from "@/lib/api-auth";
import { settingsSchema } from "@/lib/validations";
import { getSettings, updateSettings } from "@/services/settingsService";
import { apiError, apiSuccess, sanitizeError } from "@/utils/handleError";

export async function GET() {
  try {
    const settings = await getSettings();
    return apiSuccess(settings);
  } catch (e) {
    return apiError(sanitizeError(e), 500);
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAuth();
  if (!isAuthResult(auth)) return auth;
  const forbidden = requireRole(auth.profile, ["admin"]);
  if (forbidden) return forbidden;

  try {
    const body = await request.json();
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid input");
    }
    await updateSettings(parsed.data, auth.user.id);
    const settings = await getSettings();
    return apiSuccess(settings);
  } catch (e) {
    return apiError(sanitizeError(e), 500);
  }
}
