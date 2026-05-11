"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { Loader2, Mail, ShieldCheck } from "lucide-react";

import {
  clearEmailLinkContext,
  finalizeFirebaseSignIn,
  getStoredEmailLinkContext,
} from "@/lib/firebase/browser-session";
import { ensureFirebasePersistence, getFirebaseAuth } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FirebaseEmailLinkComplete() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "needs-email" | "error">("loading");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  const next = searchParams.get("next") ?? "/workspace";

  const storedContext = useMemo(() => getStoredEmailLinkContext(), []);

  const completeSignIn = useCallback(async (emailToUse: string) => {
    setStatus("loading");
    setError("");

    try {
      await ensureFirebasePersistence();
      const auth = getFirebaseAuth();
      const userCredential = await signInWithEmailLink(auth, emailToUse, window.location.href);

      const preferredName = storedContext.fullName || undefined;
      await finalizeFirebaseSignIn(userCredential.user, {
        fullName: preferredName,
      });

      clearEmailLinkContext();

      router.replace(storedContext.next || next);
      router.refresh();
    } catch (caughtError) {
      setStatus("error");
      setError(caughtError instanceof Error ? caughtError.message : "The sign-in link could not be completed.");
    }
  }, [next, router, storedContext.fullName, storedContext.next]);

  useEffect(() => {
    async function initialize() {
      if (!isFirebaseConfigured()) {
        setStatus("error");
        setError("Firebase is not configured for this environment yet.");
        return;
      }

      const href = window.location.href;

      if (!isSignInWithEmailLink(getFirebaseAuth(), href)) {
        setStatus("error");
        setError("This sign-in link is invalid or already used.");
        return;
      }

      if (!storedContext.email) {
        setStatus("needs-email");
        return;
      }

      await completeSignIn(storedContext.email);
    }

    void initialize();
  }, [completeSignIn, storedContext.email]);

  if (status === "needs-email") {
    return (
      <div className="grid gap-4">
        <Alert>
          <AlertTitle>One last confirmation</AlertTitle>
          <AlertDescription>
            This sign-in link was opened on a new browser context. Re-enter the email that received it and we&apos;ll finish the session.
          </AlertDescription>
        </Alert>

        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void completeSignIn(email);
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="email">Email used for the sign-in link</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              required
            />
          </div>
          <Button type="submit" className="gap-3">
            <Mail className="h-4 w-4" />
            Finish sign-in
          </Button>
        </form>
      </div>
    );
  }

  if (status === "error") {
    return (
      <Alert>
        <AlertTitle>We couldn&apos;t finish the sign-in</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3 rounded-md border border-emerald-400/20 bg-emerald-400/10 px-4 py-4 text-emerald-100">
        <ShieldCheck className="h-5 w-5" />
        <div>
          <p className="font-medium">Verifying your sign-in link</p>
          <p className="text-sm text-emerald-100/80">
            StableFlow is finishing the secure session and preparing your protected workspace.
          </p>
        </div>
      </div>
      <Button type="button" variant="secondary" disabled className="justify-start gap-3">
        <Loader2 className="h-4 w-4 animate-spin" />
        Finalizing session
      </Button>
    </div>
  );
}
