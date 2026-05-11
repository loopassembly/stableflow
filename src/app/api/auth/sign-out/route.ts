import { NextResponse } from "next/server";

import { FIREBASE_SESSION_COOKIE } from "@/lib/firebase/config";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json(
    {
      ok: true,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );

  response.cookies.set(FIREBASE_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
