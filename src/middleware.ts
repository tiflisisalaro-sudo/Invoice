import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE, SESSION_OK } from "@/lib/auth";

const PUBLIC = [
  /^\/login(?:\/|$)/,
  /^\/_next\//,
  /^\/favicon\.ico$/,
  /\.(?:png|jpg|jpeg|gif|webp|svg|ico|webmanifest)$/,
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  const isPublic = PUBLIC.some((re) => re.test(pathname));
  const ok = request.cookies.get(COOKIE)?.value === SESSION_OK;

  if (!isPublic && !ok) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/login") && ok) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
