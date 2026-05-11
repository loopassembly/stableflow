"use client";

import { useEffect } from "react";
import { onIdTokenChanged } from "firebase/auth";

import { clearFirebaseSession, syncFirebaseSession } from "@/lib/firebase/browser-session";
import { ensureFirebasePersistence, getFirebaseAuth } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";

export function FirebaseSessionBridge() {
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    ensureFirebasePersistence()
      .then(() => {
        const auth = getFirebaseAuth();

        unsubscribe = onIdTokenChanged(auth, async (user) => {
          if (cancelled) {
            return;
          }

          try {
            if (user) {
              const token = await user.getIdToken();
              await syncFirebaseSession(token);
              return;
            }

            await clearFirebaseSession();
          } catch {
            // The interactive sign-in flow surfaces concrete errors where it matters.
          }
        });
      })
      .catch(() => {
        // If Firebase is not enabled yet, the auth screens show the actionable error.
      });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  return null;
}
