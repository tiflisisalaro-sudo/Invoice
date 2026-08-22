import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE, SESSION_OK } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/tiflisi-logo") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (request.cookies.get(COOKIE)?.value !== SESSION_OK) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
