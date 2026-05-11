import "server-only";

import { cookies } from "next/headers";
import { createRemoteJWKSet, decodeJwt, jwtVerify } from "jose";

import { FIREBASE_SESSION_COOKIE, firebaseProjectId } from "@/lib/firebase/config";

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

type FirebaseSessionUser = {
  id: string;
  email: string;
  fullName: string | null;
  picture: string | null;
  emailVerified: boolean;
};

function requireFirebaseProjectId() {
  if (!firebaseProjectId) {
    throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing.");
  }

  return firebaseProjectId;
}

export function getFirebaseSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  };
}

export function readSessionPayloadUnsafe(token: string) {
  try {
    const payload = decodeJwt(token);
    return {
      userId: typeof payload.sub === "string" ? payload.sub : null,
      expiresAt:
        typeof payload.exp === "number" && Number.isFinite(payload.exp)
          ? payload.exp * 1000
          : null,
    };
  } catch {
    return {
      userId: null,
      expiresAt: null,
    };
  }
}

export async function verifyFirebaseIdToken(token: string): Promise<FirebaseSessionUser> {
  const projectId = requireFirebaseProjectId();

  const { payload } = await jwtVerify(token, GOOGLE_JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });

  if (typeof payload.sub !== "string" || !payload.sub) {
    throw new Error("Firebase token is missing a subject.");
  }

  if (typeof payload.email !== "string" || !payload.email) {
    throw new Error("Firebase token is missing an email.");
  }

  return {
    id: payload.sub,
    email: payload.email,
    fullName: typeof payload.name === "string" ? payload.name : null,
    picture: typeof payload.picture === "string" ? payload.picture : null,
    emailVerified: payload.email_verified === true,
  };
}

export async function getFirebaseSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(FIREBASE_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    return await verifyFirebaseIdToken(token);
  } catch {
    return null;
  }
}
