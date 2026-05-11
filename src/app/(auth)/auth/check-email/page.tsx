import Link from "next/link";
import { CheckCircle2, MailCheck, ShieldCheck } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; mode?: string }>;
}) {
  const params = await searchParams;
  const isSignup = params.mode === "sign-up";

  return (
    <AuthShell
      eyebrow="Check your inbox"
      title={isSignup ? "Your access link is on the way." : "Open the email to finish signing in."}
      description="StableFlow sent a secure Firebase email link. Open it on this device and we’ll complete the session automatically."
      footer={
        <>
          Need a different email?{" "}
          <Link
            href={isSignup ? "/sign-up" : "/sign-in"}
            className="font-medium text-[#d7f5bf] transition hover:text-white"
          >
            Go back
          </Link>
        </>
      }
    >
      <Card className="sf-shell rounded-[1.5rem] border-white/8 bg-[#0b0d14]/96 shadow-[0_28px_80px_rgba(0,0,0,0.34)]">
        <CardHeader className="space-y-3 pb-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-[#96ea63]/18 bg-[#96ea63]/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#d7f5bf]">
              Secure email link
            </span>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] border border-[#96ea63]/18 bg-[#96ea63]/10 text-[#d7f5bf]">
              <MailCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-[1.85rem] leading-tight text-white">Email link sent</CardTitle>
              <CardDescription className="mt-2 text-[0.98rem] leading-7 text-slate-300">
                {params.email
                  ? `We sent a secure sign-in link to ${params.email}.`
                  : "Look for the StableFlow sign-in link in your inbox."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="rounded-[1rem] border border-white/8 bg-white/[0.02] p-4">
            <div className="grid gap-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#96ea63]" />
                <p className="text-sm leading-6 text-slate-300">
                  Open the email on this same device.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#96ea63]" />
                <p className="text-sm leading-6 text-slate-300">
                  Click the secure link and let StableFlow finish the session.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-[#96ea63]" />
                <p className="text-sm leading-6 text-slate-300">
                  You’ll land inside the protected workspace flow automatically.
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm leading-7 text-slate-400">
            If your mailbox is quiet, check spam or promotions. StableFlow only completes the session after the signed link is opened on this device.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary" className="h-11 rounded-[0.95rem] border border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]">
              <Link href={isSignup ? "/sign-up" : "/sign-in"}>
                Back to {isSignup ? "sign up" : "sign in"}
              </Link>
            </Button>
            <Button asChild className="h-11 rounded-[0.95rem] border border-[#96ea63]/10 bg-[#96ea63] px-5 text-[#1e2f14] shadow-[0_14px_36px_rgba(150,234,99,0.22)] hover:bg-[#a4ee78]">
              <Link href="/">Return home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
