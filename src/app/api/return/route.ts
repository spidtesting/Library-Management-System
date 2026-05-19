import { requireAuth, requireRole, isAuthResult } from "@/lib/api-auth";
import { returnSchema } from "@/lib/validations";
import { returnBook } from "@/services/returnService";
import { apiError, apiSuccess, sanitizeError } from "@/utils/handleError";

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!isAuthResult(auth)) return auth;
  const forbidden = requireRole(auth.profile, ["admin", "librarian"]);
  if (forbidden) return forbidden;

  try {
    const body = await request.json();
    const parsed = returnSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid input");
    }
    const result = await returnBook(parsed.data.issued_book_id, auth.user.id);
    return apiSuccess(result);
  } catch (e) {
    return apiError(sanitizeError(e), 500);
  }
}
