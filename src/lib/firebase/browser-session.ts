"use client";

import { signOut, updateProfile, type User } from "firebase/auth";

import { ensureFirebasePersistence, getFirebaseAuth } from "@/lib/firebase/client";

const EMAIL_LINK_EMAIL_KEY = "stableflow.email-link.email";
const EMAIL_LINK_NAME_KEY = "stableflow.email-link.name";
const EMAIL_LINK_NEXT_KEY = "stableflow.email-link.next";

export function storeEmailLinkContext(input: {
  email: string;
  fullName?: string;
  next?: string;
}) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(EMAIL_LINK_EMAIL_KEY, input.email);

  if (input.fullName) {
    localStorage.setItem(EMAIL_LINK_NAME_KEY, input.fullName);
  } else {
    localStorage.removeItem(EMAIL_LINK_NAME_KEY);
  }

  if (input.next) {
    localStorage.setItem(EMAIL_LINK_NEXT_KEY, input.next);
  } else {
    localStorage.removeItem(EMAIL_LINK_NEXT_KEY);
  }
}

export function getStoredEmailLinkContext() {
  if (typeof window === "undefined") {
    return {
      email: "",
      fullName: "",
      next: "",
    };
  }

  return {
    email: localStorage.getItem(EMAIL_LINK_EMAIL_KEY) ?? "",
    fullName: localStorage.getItem(EMAIL_LINK_NAME_KEY) ?? "",
    next: localStorage.getItem(EMAIL_LINK_NEXT_KEY) ?? "",
  };
}

export function clearEmailLinkContext() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(EMAIL_LINK_EMAIL_KEY);
  localStorage.removeItem(EMAIL_LINK_NAME_KEY);
  localStorage.removeItem(EMAIL_LINK_NEXT_KEY);
}

export async function syncFirebaseSession(idToken: string) {
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error ?? "Could not create a server session.");
  }
}

export async function clearFirebaseSession() {
  await fetch("/api/auth/sign-out", {
    method: "POST",
    cache: "no-store",
  });
}

export async function finalizeFirebaseSignIn(
  user: User,
  input?: { fullName?: string | null },
) {
  await ensureFirebasePersistence();

  const preferredName = input?.fullName?.trim();
  if (preferredName && user.displayName !== preferredName) {
    await updateProfile(user, { displayName: preferredName });
  }

  const idToken = await user.getIdToken(true);
  await syncFirebaseSession(idToken);
}

export async function signOutFromStableFlow() {
  await signOut(getFirebaseAuth());
  await clearFirebaseSession();
}
