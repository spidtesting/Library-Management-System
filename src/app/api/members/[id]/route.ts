import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAuth, requireRole, isAuthResult } from "@/lib/api-auth";
import { deleteMember, getMemberById } from "@/services/memberService";
import { apiError, apiSuccess, sanitizeError } from "@/utils/handleError";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!isAuthResult(auth)) return auth;
  const forbidden = requireRole(auth.profile, ["admin", "librarian"]);
  if (forbidden) return forbidden;

  try {
    const { id } = await params;
    const member = await getMemberById(id);
    if (!member) return apiError("Member not found", 404);
    return apiSuccess(member);
  } catch (e) {
    return apiError(sanitizeError(e), 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!isAuthResult(auth)) return auth;
  const forbidden = requireRole(auth.profile, ["admin"]);
  if (forbidden) return forbidden;

  try {
    const { id } = await params;
    if (id === auth.user.id) {
      return apiError("You cannot delete your own account");
    }
    await deleteMember(id);
    revalidatePath("/admin/members");
    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError(sanitizeError(e), 500);
  }
}
