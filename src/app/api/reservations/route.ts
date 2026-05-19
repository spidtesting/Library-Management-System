import { requireAuth, requireRole, isAuthResult } from "@/lib/api-auth";
import { reservationSchema } from "@/lib/validations";
import { createReservation } from "@/services/reservationService";
import { apiError, apiSuccess, sanitizeError } from "@/utils/handleError";

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!isAuthResult(auth)) return auth;
  const forbidden = requireRole(auth.profile, ["member", "librarian", "admin"]);
  if (forbidden) return forbidden;

  try {
    const body = await request.json();
    const parsed = reservationSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid input");
    }
    const result = await createReservation(parsed.data.book_id, auth.user.id);
    return apiSuccess(result, 201);
  } catch (e) {
    return apiError(sanitizeError(e), 500);
  }
}
