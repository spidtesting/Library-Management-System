import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAuth, requireRole, isAuthResult } from "@/lib/api-auth";
import { bookSchema } from "@/lib/validations";
import { updateBook, softDeleteBook, getBookById } from "@/services/bookService";
import { uploadCover } from "@/services/bookService";
import { apiError, apiSuccess, sanitizeError } from "@/utils/handleError";
import { ALLOWED_COVER_TYPES, MAX_COVER_SIZE_BYTES } from "@/lib/constants";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const book = await getBookById(id);
    if (!book) return apiError("Book not found", 404);
    return apiSuccess(book);
  } catch (e) {
    return apiError(sanitizeError(e), 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (!isAuthResult(auth)) return auth;
  const forbidden = requireRole(auth.profile, ["admin", "librarian"]);
  if (forbidden) return forbidden;

  try {
    const { id } = await params;
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("cover") as File | null;
      if (!file) return apiError("No cover file provided");
      if (!ALLOWED_COVER_TYPES.includes(file.type)) {
        return apiError("Invalid file type");
      }
      if (file.size > MAX_COVER_SIZE_BYTES) {
        return apiError("File too large (max 2MB)");
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const url = await uploadCover(id, buffer, file.type);
      revalidatePath("/admin/books");
      revalidatePath("/librarian/books");
      return apiSuccess({ cover_url: url });
    }

    const body = await request.json();
    const parsed = bookSchema.partial().safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid input");
    }
    await updateBook(id, parsed.data);
    revalidatePath("/admin/books");
    revalidatePath("/librarian/books");
    revalidatePath("/member/browse");
    return apiSuccess({ ok: true });
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
    await softDeleteBook(id);
    revalidatePath("/admin/books");
    revalidatePath("/librarian/books");
    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError(sanitizeError(e), 500);
  }
}
