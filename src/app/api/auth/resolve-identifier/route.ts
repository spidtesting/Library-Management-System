import { resolveIdentifierToEmail } from "@/services/loginService";
import { apiError, apiSuccess } from "@/utils/handleError";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = typeof body.identifier === "string" ? body.identifier : "";
    const email = await resolveIdentifierToEmail(identifier);
    if (!email) {
      return apiError("Invalid email/NIC or password", 401);
    }
    return apiSuccess({ email });
  } catch {
    return apiError("Invalid email/NIC or password", 401);
  }
}
