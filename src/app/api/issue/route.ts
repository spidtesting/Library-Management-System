import { requireAuth, requireRole, isAuthResult } from "@/lib/api-auth";
import { issueSchema } from "@/lib/validations";
import { issueBook } from "@/services/issueService";
import { apiError, apiSuccess, sanitizeError } from "@/utils/handleError";

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (!isAuthResult(auth)) return auth;
  const forbidden = requireRole(auth.profile, ["admin", "librarian"]);
  if (forbidden) return forbidden;

  try {
    const body = await request.json();
    const parsed = issueSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid input");
    }
    const result = await issueBook(parsed.data, auth.user.id);
    return apiSuccess(result, 201);
  } catch (e) {
    return apiError(sanitizeError(e), 500);
  }
}
