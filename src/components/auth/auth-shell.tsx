import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Coins,
  Route,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  stageEyebrow?: string;
  stageTitle?: string;
  featureStage?: React.ReactNode;
  stageMinimal?: boolean;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
  stageEyebrow = "Access rail",
  stageTitle = "Enter the operator desk.",
  featureStage,
  stageMinimal = false,
}: AuthShellProps) {
  const authSignals = [
    {
      icon: ShieldCheck,
      title: "Verified payment events",
      detail: "Checkout creation and signed webhook processing stay connected.",
    },
    {
      icon: Route,
      title: "Policy-backed routing",
      detail: "Revenue becomes recipient obligations without spreadsheet hops.",
    },
    {
      icon: Coins,
      title: "Stablecoin settlement",
      detail: "Operators can trace payouts from payment source to explorer proof.",
    },
  ];

  return (
    <main className="sf-page min-h-screen text-foreground">
      <div className="mx-auto grid min-h-screen max-w-[1440px] gap-6 px-5 py-5 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-8">
        <section className="sf-shell-strong overflow-hidden rounded-[1.6rem] px-6 py-6 text-white lg:px-8 lg:py-8">
          <div className="mx-auto flex h-full max-w-[36rem] flex-col">
            <div className="flex items-center justify-between gap-4 border-b border-white/6 pb-5">
              <Link
                href="/"
                className="inline-flex items-center gap-3 text-sm text-slate-200 transition hover:text-white"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-[0.95rem] border border-[#96ea63]/18 bg-[#96ea63]/8 text-[#96ea63] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <Route className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-white">StableFlow</p>
                  <p className="text-xs text-slate-300">Revenue routing for global payout teams</p>
                </div>
              </Link>

              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-[0.85rem] border border-white/8 bg-white/[0.02] px-3 py-2 text-sm text-slate-300 transition hover:border-white/12 hover:bg-white/[0.04] hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </div>

            <div className="mt-12 max-w-[33rem]">
              <div className="flex flex-wrap gap-2.5">
                <Badge className="sf-chip hover:bg-white/6">Protected workspace</Badge>
                <Badge className="sf-chip hover:bg-white/6">Google + email link</Badge>
              </div>
              <p className="sf-kicker mt-8 text-sm font-medium uppercase tracking-[0.18em]">
                {eyebrow}
              </p>
              <h1 className="mt-4 max-w-[11ch] text-[3rem] font-semibold leading-[0.98] text-balance text-white sm:text-[4rem]">
                {title}
              </h1>
              <p className="mt-5 max-w-[32rem] text-[1.02rem] leading-8 text-slate-300">{description}</p>
            </div>

            <div className={`sf-stage sf-stage-auth sf-spot mt-9 rounded-[1.35rem] ${stageMinimal ? "p-4" : "p-5"}`}>
              {stageMinimal ? (
                featureStage
              ) : (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        {stageEyebrow}
                      </p>
                      <p className="mt-2 text-[1.65rem] font-semibold text-white">
                        {stageTitle}
                      </p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-[0.95rem] border border-[#96ea63]/18 bg-[#96ea63]/10 text-[#d8f7b8]">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>

                  {featureStage ? (
                    <div className="mt-5">{featureStage}</div>
                  ) : null}
                </>
              )}

              {!featureStage ? (
                <div className="mt-5 grid gap-3">
                  {authSignals.map((item) => (
                    <div key={item.title} className="sf-hover-rise sf-shell-soft rounded-[1rem] px-4 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[0.9rem] border border-white/10 bg-white/[0.04] text-[#96ea63]">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{item.title}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-300">{item.detail}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-auto pt-8">
              <div className="grid gap-3 sm:grid-cols-3">
                <Badge className="sf-chip hover:bg-white/6">Dodo payments</Badge>
                <Badge className="sf-chip hover:bg-white/6">Solana settlement</Badge>
                <Badge className="sf-chip hover:bg-white/6">Org-scoped access</Badge>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center">
          <div className="mx-auto w-full max-w-[34rem]">
            {children}
            <div className="mt-5 text-sm text-slate-400">{footer}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
