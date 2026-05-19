import { requireAuth, requireRole, isAuthResult } from "@/lib/api-auth";
import { finePaySchema } from "@/lib/validations";
import { payFine, waiveFine } from "@/services/fineService";
import { apiError, apiSuccess, sanitizeError } from "@/utils/handleError";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!isAuthResult(auth)) return auth;
  const forbidden = requireRole(auth.profile, ["admin", "librarian"]);
  if (forbidden) return forbidden;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = finePaySchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid input");
    }

    if (parsed.data.action === "pay") {
      await payFine(id, parsed.data.notes);
    } else {
      await waiveFine(id, auth.user.id, parsed.data.notes);
    }
    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError(sanitizeError(e), 500);
  }
}
