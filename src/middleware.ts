import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { UserRole } from "@/types";
import { ROLE_DASHBOARD } from "@/lib/constants";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

const ROLE_ROUTES: { prefix: string; roles: UserRole[] }[] = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/librarian", roles: ["librarian", "admin"] },
  {
    prefix: "/member",
    roles: ["member", "librarian", "admin"],
  },
];

function safeRedirectPath(path: string | null, origin: string): string | null {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return null;
  if (AUTH_ROUTES.some((r) => path.startsWith(r))) return null;
  return path;
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (pathname === "/register" || pathname.startsWith("/register/")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const isAuthRoute = AUTH_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`)
  );

  let role: UserRole | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = (profile?.role as UserRole) ?? "member";
  }

  if (user && isAuthRoute) {
    const dashboard = role ? ROLE_DASHBOARD[role] : "/member/dashboard";
    return NextResponse.redirect(new URL(dashboard, request.url));
  }

  const matched = ROLE_ROUTES.find((r) => pathname.startsWith(r.prefix));
  if (matched) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set(
        "redirect",
        pathname + request.nextUrl.search
      );
      return NextResponse.redirect(loginUrl);
    }
    if (role && !matched.roles.includes(role)) {
      const dashboard = ROLE_DASHBOARD[role] ?? "/member/dashboard";
      return NextResponse.redirect(new URL(dashboard, request.url));
    }
  }

  if (user && pathname === "/") {
    const dashboard = role ? ROLE_DASHBOARD[role] : "/member/dashboard";
    return NextResponse.redirect(new URL(dashboard, request.url));
  }

  if (!user && pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const redirectParam = request.nextUrl.searchParams.get("redirect");
  if (user && redirectParam && isAuthRoute) {
    const safe = safeRedirectPath(redirectParam, request.nextUrl.origin);
    if (safe) {
      return NextResponse.redirect(new URL(safe, request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
