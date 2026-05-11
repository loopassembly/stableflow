import Link from "next/link";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { FirebaseEmailLinkComplete } from "@/components/auth/firebase-email-link-complete";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthCompletePage() {
  return (
    <AuthShell
      eyebrow="Complete access"
      title="Finish signing in to your payout workspace."
      description="This is the secure handoff point between your email provider, Firebase Authentication, and StableFlow’s protected operator workspace."
      footer={
        <>
          Need a new link?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-white underline decoration-white/25 underline-offset-4"
          >
            Go back to sign in
          </Link>
        </>
      }
    >
      <Card className="sf-shell rounded-md">
        <CardHeader>
          <CardTitle>Complete sign-in</CardTitle>
          <CardDescription>
            StableFlow is verifying your link and preparing the server session.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <Suspense fallback={null}>
            <FirebaseEmailLinkComplete />
          </Suspense>
          <Button asChild variant="secondary">
            <Link href="/sign-in">Back to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
