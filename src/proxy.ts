import { decodeJwt } from "jose";
import { NextResponse, type NextRequest } from "next/server";

import { FIREBASE_SESSION_COOKIE } from "@/lib/firebase/config";

function hasActiveSession(request: NextRequest) {
  const token = request.cookies.get(FIREBASE_SESSION_COOKIE)?.value;

  if (!token) {
    return false;
  }

  try {
    const payload = decodeJwt(token);
    return typeof payload.exp === "number" ? payload.exp * 1000 > Date.now() : true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hasSession = hasActiveSession(request);
  const isDevPreview =
    process.env.NODE_ENV === "development" &&
    pathname === "/workspace" &&
    request.nextUrl.searchParams.get("preview") === "1";

  const requiresAuth =
    pathname.startsWith("/workspace") || pathname.startsWith("/welcome");

  const authScreens =
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/auth/check-email");

  if (requiresAuth && !hasSession && !isDevPreview) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/sign-in";
    redirectUrl.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(redirectUrl);
  }

  if (authScreens && hasSession) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/workspace";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
