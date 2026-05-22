import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAuth, requireRole, isAuthResult } from "@/lib/api-auth";
import { memberCreateSchema, memberUpdateSchema } from "@/lib/validations";
import { getMembers, updateMember, createMember } from "@/services/memberService";
import { apiError, apiSuccess, sanitizeError } from "@/utils/handleError";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!isAuthResult(auth)) return auth;
  const forbidden = requireRole(auth.profile, ["admin", "librarian"]);
  if (forbidden) return forbidden;

  try {
    const { searchParams } = request.nextUrl;
    const result = await getMembers({
      page: Number(searchParams.get("page") ?? 1),
      search: searchParams.get("search") ?? undefined,
      viewerRole: auth.profile.role,
    });
    return apiSuccess(result);
  } catch (e) {
    return apiError(sanitizeError(e), 500);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!isAuthResult(auth)) return auth;
  const forbidden = requireRole(auth.profile, ["admin", "librarian"]);
  if (forbidden) return forbidden;

  try {
    const body = await request.json();
    const parsed = memberCreateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid input");
    }
    const forcedRole = auth.profile.role === "librarian" ? ("member" as const) : undefined;
    const member = await createMember(parsed.data, { forcedRole });
    revalidatePath("/admin/members");
    revalidatePath("/librarian/members");
    return apiSuccess(member, 201);
  } catch (e) {
    return apiError(sanitizeError(e), 500);
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth();
  if (!isAuthResult(auth)) return auth;
  const forbidden = requireRole(auth.profile, ["admin", "librarian"]);
  if (forbidden) return forbidden;

  try {
    const body = await request.json();
    const { id, ...rest } = body;
    if (!id) return apiError("Member id required");
    const parsed = memberUpdateSchema.safeParse(rest);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid input");
    }
    await updateMember(id, parsed.data, auth.profile.role);
    revalidatePath("/admin/members");
    revalidatePath(`/admin/members/${id}`);
    revalidatePath("/librarian/members");
    revalidatePath(`/librarian/members/${id}`);
    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError(sanitizeError(e), 500);
  }
}
