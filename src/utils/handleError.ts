import { NextResponse } from "next/server";

export function sanitizeError(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes("JWT") || msg.includes("service_role")) {
      return fallback;
    }
    return msg;
  }
  return fallback;
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}
