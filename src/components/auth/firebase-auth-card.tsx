"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { sendSignInLinkToEmail, signInWithPopup } from "firebase/auth";
import { Loader2, Mail, Sparkles } from "lucide-react";

import {
  clearEmailLinkContext,
  finalizeFirebaseSignIn,
  getStoredEmailLinkContext,
  storeEmailLinkContext,
} from "@/lib/firebase/browser-session";
import { ensureFirebasePersistence, getFirebaseAuth, getGoogleProvider } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type FirebaseAuthCardProps = {
  mode: "sign-in" | "sign-up";
  next?: string;
  confirmed?: boolean;
  initialError?: string;
};

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5c-.2 1.2-.9 2.2-1.9 2.9v2.4h3.1c1.8-1.7 3.1-4.1 3.1-7.1Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 5-0.9 6.7-2.5l-3.1-2.4c-.9.6-2 .9-3.6.9-2.7 0-5-1.8-5.8-4.3H3v2.5A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.2 13.7c-.2-.6-.3-1.1-.3-1.7s.1-1.2.3-1.7V7.8H3A10 10 0 0 0 2 12c0 1.6.4 3.2 1 4.2l3.2-2.5Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8A9.9 9.9 0 0 0 12 2 10 10 0 0 0 3 7.8l3.2 2.5C7 7.8 9.3 5.9 12 5.9Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function buildEmailCompletionUrl(next: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? window.location.origin;
  const url = new URL("/auth/complete", baseUrl);
  url.searchParams.set("next", next);
  return url.toString();
}

function mapFirebaseError(error: unknown) {
  if (!(error instanceof FirebaseError)) {
    return error instanceof Error ? error.message : "Something went wrong.";
  }

  switch (error.code) {
    case "auth/configuration-not-found":
      return "Firebase Authentication has not been initialized for this project yet. Open Firebase Console -> Authentication -> Get started, then enable Google and Email Link.";
    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled in Firebase yet. Turn on Google and Email Link inside Firebase Authentication.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized in Firebase Authentication yet. Add localhost and your Vercel domain inside the Firebase Auth console.";
    case "auth/popup-closed-by-user":
      return "The Google popup was closed before the sign-in finished.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists for this email with a different sign-in method. Continue with your email link first, then use Google next time.";
    case "auth/invalid-email":
      return "Enter a valid work email so we can send the sign-in link.";
    case "auth/missing-email":
      return "Enter your email first.";
    default:
      return error.message;
  }
}

export function FirebaseAuthCard({
  mode,
  next = "/workspace",
  confirmed = false,
  initialError,
}: FirebaseAuthCardProps) {
  const router = useRouter();
  const [error, setError] = useState(initialError ?? "");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [startingGoogle, setStartingGoogle] = useState(false);
  const [authTransitioning, setAuthTransitioning] = useState(false);

  const isSignup = mode === "sign-up";
  const firebaseReady = isFirebaseConfigured();
  const showGoogleOverlay = startingGoogle || authTransitioning;
  const googleOverlayTitle = authTransitioning
    ? "Opening your workspace"
    : "Connecting your account";
  const googleOverlayBody = authTransitioning
    ? "We’re securing the session and loading your operator desk."
    : "Finishing Google sign-in and preparing your access rail.";

  const storedHint = useMemo(() => getStoredEmailLinkContext().email, []);

  async function handleGoogleSignIn() {
    if (!firebaseReady) {
      setError("Firebase is not configured for this environment yet.");
      return;
    }

    setStartingGoogle(true);
    setAuthTransitioning(false);
    setError("");

    try {
      await ensureFirebasePersistence();
      const result = await signInWithPopup(getFirebaseAuth(), getGoogleProvider());
      setAuthTransitioning(true);
      await finalizeFirebaseSignIn(result.user, {
        fullName: isSignup ? fullName.trim() : undefined,
      });
      clearEmailLinkContext();
      router.replace(next);
      router.refresh();
    } catch (caughtError) {
      setAuthTransitioning(false);
      setError(mapFirebaseError(caughtError));
    } finally {
      setStartingGoogle(false);
    }
  }

  async function handleEmailLinkSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!firebaseReady) {
      setError("Firebase is not configured for this environment yet.");
      return;
    }

    if (isSignup && fullName.trim().length < 2) {
      setError("Enter your full name so we can set up the workspace owner profile.");
      return;
    }

    setSendingEmail(true);
    setError("");

    try {
      await ensureFirebasePersistence();

      const normalizedEmail = email.trim();
      storeEmailLinkContext({
        email: normalizedEmail,
        fullName: isSignup ? fullName.trim() : undefined,
        next,
      });

      await sendSignInLinkToEmail(getFirebaseAuth(), normalizedEmail, {
        url: buildEmailCompletionUrl(next),
        handleCodeInApp: true,
      });

      router.push(
        `/auth/check-email?email=${encodeURIComponent(normalizedEmail)}&mode=${mode}`,
      );
    } catch (caughtError) {
      setError(mapFirebaseError(caughtError));
    } finally {
      setSendingEmail(false);
    }
  }

  return (
    <div className="relative">
      <Card className="sf-shell rounded-[1.5rem] border-white/8 bg-[#0b0d14]/96 shadow-[0_28px_80px_rgba(0,0,0,0.34)]">
        <CardHeader className="space-y-3 pb-5">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-[#96ea63]/18 bg-[#96ea63]/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#d7f5bf]">
              {isSignup ? "New workspace" : "Secure access"}
            </span>
          </div>
          <CardTitle className="text-[1.9rem] leading-tight text-white">
            {isSignup ? "Create account" : "Sign in"}
          </CardTitle>
          <CardDescription className="text-[0.98rem] leading-7 text-slate-300">
            {isSignup
              ? "Start with Google or get a passwordless email link. We’ll take you into workspace setup right after sign-in."
              : "Use Google or get a secure email link. No password wall, no dead-end reset loop."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          {confirmed ? (
            <Alert className="rounded-[1rem] border-[#96ea63]/18 bg-[#96ea63]/8">
              <AlertTitle>Email link confirmed</AlertTitle>
              <AlertDescription>
                Your email link worked. Finish signing in once and we&apos;ll continue into the protected workspace.
              </AlertDescription>
            </Alert>
          ) : null}

          {!firebaseReady ? (
            <Alert className="rounded-[1rem] border-amber-400/20 bg-amber-400/8">
              <AlertTitle>Firebase setup still needs one switch</AlertTitle>
              <AlertDescription>
                The auth client is wired, but this environment does not have the Firebase public config yet.
              </AlertDescription>
            </Alert>
          ) : null}

          {error ? (
            <Alert className="rounded-[1rem] border-red-400/18 bg-red-400/8">
              <AlertTitle>Couldn&apos;t continue</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <Button
            type="button"
            onClick={handleGoogleSignIn}
            variant="secondary"
            className="h-13 rounded-[1rem] justify-center gap-3 border border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
            disabled={startingGoogle || sendingEmail || !firebaseReady}
          >
            {startingGoogle ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleMark />}
            Continue with Google
          </Button>

          <div className="relative">
            <Separator className="bg-white/10" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-[#07070a] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-400">
              or
            </span>
          </div>

          <form onSubmit={handleEmailLinkSubmit} className="grid gap-4">
            {isSignup ? (
              <div className="grid gap-2">
                <Label htmlFor="fullName" className="text-[0.92rem] font-medium text-slate-200">
                  Full name
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Ashutosh Anand"
                  autoComplete="name"
                  required
                  className="h-12 rounded-[0.95rem] border-white/10 bg-white/[0.03] px-4 text-white placeholder:text-slate-500 focus-visible:border-[#96ea63]/60"
                />
              </div>
            ) : null}

            <div className="grid gap-2">
              <Label htmlFor="email" className="text-[0.92rem] font-medium text-slate-200">
                Work email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={storedHint || "you@company.com"}
                autoComplete="email"
                required
                className="h-12 rounded-[0.95rem] border-white/10 bg-white/[0.03] px-4 text-white placeholder:text-slate-500 focus-visible:border-[#96ea63]/60"
              />
              <p className="text-sm leading-6 text-slate-400">
                We&apos;ll email a secure sign-in link. Open it on this device and StableFlow will finish the session for you.
              </p>
            </div>

            <Button
              type="submit"
              className="mt-1 h-12 rounded-[1rem] gap-3 border border-[#96ea63]/10 bg-[#96ea63] text-[#1e2f14] shadow-[0_14px_36px_rgba(150,234,99,0.22)] hover:bg-[#a4ee78]"
              disabled={sendingEmail || startingGoogle || !firebaseReady}
            >
              {sendingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              {isSignup ? "Send me a sign-in link" : "Email me a sign-in link"}
            </Button>
          </form>

          <div className="rounded-[1rem] border border-white/8 bg-white/[0.025] p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-[0.85rem] border border-[#96ea63]/18 bg-[#96ea63]/10 text-[#d7f5bf]">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-white">Why this flow feels better</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">
                  Google handles the fast path. Email link covers teams that want a secure fallback without passwords.
                </p>
              </div>
            </div>
          </div>

          <div className="text-sm text-slate-400">
            {isSignup ? (
              <>
                Already have access?{" "}
                <Link
                  href={`/sign-in?next=${encodeURIComponent(next)}`}
                  className="font-medium text-[#d7f5bf] transition hover:text-white"
                >
                  Sign in instead
                </Link>
              </>
            ) : (
              <>
                Need a fresh workspace?{" "}
                <Link
                  href={`/sign-up?next=${encodeURIComponent(next)}`}
                  className="font-medium text-[#d7f5bf] transition hover:text-white"
                >
                  Create your account
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      {showGoogleOverlay ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[1.5rem] border border-white/8 bg-[#090b12]/88 backdrop-blur-md">
          <div className="flex max-w-[21rem] flex-col items-center gap-4 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#96ea63]/18 bg-[#96ea63]/10 text-[#d7f5bf] shadow-[0_10px_30px_rgba(150,234,99,0.16)]">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
            <div>
              <p className="text-[1rem] font-medium text-white">{googleOverlayTitle}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{googleOverlayBody}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
