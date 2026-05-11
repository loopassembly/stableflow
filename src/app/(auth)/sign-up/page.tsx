import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";
import { AuthSignupRemotion } from "@/components/auth/auth-signup-remotion";
import { FirebaseAuthCard } from "@/components/auth/firebase-auth-card";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next ?? "/workspace";

  return (
    <AuthShell
      eyebrow="Create your workspace"
      title="Set up the operating layer behind your payouts."
      description="Start with Google or a passwordless email link. After that, we’ll help you create an organization, seed the workspace, and connect the payment and settlement rails."
      featureStage={<AuthSignupRemotion />}
      stageMinimal
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={`/sign-in?next=${encodeURIComponent(next)}`}
            className="font-medium text-white underline decoration-white/25 underline-offset-4"
          >
            Sign in instead
          </Link>
        </>
      }
    >
      <FirebaseAuthCard mode="sign-up" next={next} initialError={params.error} />
    </AuthShell>
  );
}
