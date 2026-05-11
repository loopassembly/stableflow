import { NextResponse } from "next/server";
import { z } from "zod";

import { FIREBASE_SESSION_COOKIE } from "@/lib/firebase/config";
import {
  getFirebaseSessionCookieOptions,
  verifyFirebaseIdToken,
} from "@/lib/firebase/server";

export const runtime = "nodejs";

const sessionSchema = z.object({
  idToken: z.string().min(32),
});

export async function POST(request: Request) {
  try {
    const parsed = sessionSchema.parse(await request.json());
    const user = await verifyFirebaseIdToken(parsed.idToken);

    const response = NextResponse.json(
      {
        ok: true,
        user,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );

    response.cookies.set(
      FIREBASE_SESSION_COOKIE,
      parsed.idToken,
      getFirebaseSessionCookieOptions(),
    );

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Invalid Firebase session token.",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
        status: 401,
      },
    );
  }
}
