import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // 1. Language Cookie Handling (Arabic default)
  const localeCookie = request.cookies.get("artique_locale");
  if (!localeCookie) {
    response.cookies.set("artique_locale", "ar", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  // 2. Admin Route Protection
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login") && !pathname.startsWith("/api/admin/login")) {
    const adminSession = request.cookies.get("artique_admin_session");
    if (!verifySession(adminSession?.value, "admin")) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - demo-media (local product media)
     */
    "/((?!_next/static|_next/image|favicon.ico|demo-media|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
