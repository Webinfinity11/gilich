import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { BLACK_FRIDAY_PATH, INTERNAL_BLACK_FRIDAY_PATH } from "@/lib/landing-path";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    return adminGate(request, pathname);
  }

  if (pathname === BLACK_FRIDAY_PATH || pathname.startsWith(`${BLACK_FRIDAY_PATH}/`)) return NextResponse.next();
  if (pathname === INTERNAL_BLACK_FRIDAY_PATH || pathname.startsWith(`${INTERNAL_BLACK_FRIDAY_PATH}/`)) {
    const url = request.nextUrl.clone();
    url.pathname = BLACK_FRIDAY_PATH + pathname.slice(INTERNAL_BLACK_FRIDAY_PATH.length);
    return NextResponse.redirect(url, 308);
  }
  if (pathname === "/landing" || pathname.startsWith("/landing/")) return NextResponse.next();

  // Georgian pages are served from /ka-ge/... as-is
  if (pathname === "/ka-ge" || pathname.startsWith("/ka-ge/")) return NextResponse.next();

  // /en/... is the internal English route; keep public URLs unprefixed
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }

  const url = request.nextUrl.clone();
  url.pathname = `/en${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

async function adminGate(request: NextRequest, pathname: string) {
  if (pathname === "/admin/login") return NextResponse.next();

  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (session) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL("/admin/login", request.url);
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  // Everything except Next internals and static files (anything with a file extension)
  matcher: ["/((?!_next/|.*\\.[a-zA-Z0-9]+$).*)"],
};
