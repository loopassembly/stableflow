import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const fallback = request.nextUrl.clone();
  fallback.pathname = "/sign-in";
  fallback.searchParams.set(
    "error",
    "That legacy confirmation link is no longer used. Continue with Google or request a fresh email link instead.",
  );
  return NextResponse.redirect(fallback);
}
