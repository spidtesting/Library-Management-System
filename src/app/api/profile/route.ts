import { requireAuth, isAuthResult } from "@/lib/api-auth";
import { profileSelfUpdateSchema } from "@/lib/validations";
import { getOwnProfile, updateOwnProfile } from "@/services/profileService";
import { apiError, apiSuccess, sanitizeError } from "@/utils/handleError";
import { revalidatePath } from "next/cache";
import { getProfilePath } from "@/lib/constants";

export async function GET() {
  const auth = await requireAuth();
  if (!isAuthResult(auth)) return auth;

  try {
    const profile = await getOwnProfile(auth.user.id);
    if (!profile) return apiError("Profile not found", 404);
    return apiSuccess(profile);
  } catch (e) {
    return apiError(sanitizeError(e), 500);
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAuth();
  if (!isAuthResult(auth)) return auth;

  try {
    const body = await request.json();
    const parsed = profileSelfUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const profile = await updateOwnProfile(auth.user.id, parsed.data);
    revalidatePath(getProfilePath(profile.role));
    return apiSuccess(profile);
  } catch (e) {
    return apiError(sanitizeError(e), 500);
  }
}
