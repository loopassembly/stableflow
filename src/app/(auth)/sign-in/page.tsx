import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FirebaseAuthCard } from "@/components/auth/firebase-auth-card";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string; confirmed?: string }>;
}) {
  const params = await searchParams;
  const next = params.next ?? "/workspace";

  return (
    <AuthShell
      eyebrow="Operator access"
      title="Sign in to your payout workspace."
      description="Use Google for the fast path or a secure email link for the calm fallback. Once you're in, StableFlow keeps payments, routing, and settlement inside one protected workspace."
      footer={
        <>
          New to StableFlow?{" "}
          <Link
            href={`/sign-up?next=${encodeURIComponent(next)}`}
            className="font-medium text-white underline decoration-white/25 underline-offset-4"
          >
            Create your account
          </Link>
        </>
      }
    >
      {params.confirmed === "1" ? (
        <Alert className="mb-4">
          <AlertTitle>Email confirmed</AlertTitle>
          <AlertDescription>
            Your sign-in link worked. Continue below and we&apos;ll take you into workspace setup.
          </AlertDescription>
        </Alert>
      ) : null}

      <FirebaseAuthCard
        mode="sign-in"
        next={next}
        confirmed={params.confirmed === "1"}
        initialError={params.error}
      />
    </AuthShell>
  );
}
