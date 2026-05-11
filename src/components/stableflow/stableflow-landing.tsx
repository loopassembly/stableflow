import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bot,
  Coins,
  Globe2,
  Network,
  ReceiptText,
  Route,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LandingReveal,
  LandingTiltPanel,
} from "@/components/stableflow/landing-effects";
import { getViewerContext } from "@/lib/auth";
import { getPublicProductSnapshot } from "@/lib/ledger";

function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function formatStablecoin(cents: number, symbol: string) {
  return `${(cents / 100).toFixed(2)} ${symbol}`;
}

function shortValue(value: string | null | undefined, head = 6, tail = 4) {
  if (!value) {
    return "Unavailable";
  }

  if (value.length <= head + tail + 1) {
    return value;
  }

  return `${value.slice(0, head)}...${value.slice(-tail)}`;
}

function statusTone(status: string | null | undefined) {
  if (status === "READY") {
    return "border border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
  }

  if (status === "ATTENTION") {
    return "border border-amber-400/20 bg-amber-400/10 text-amber-200";
  }

  return "border border-rose-400/20 bg-rose-400/10 text-rose-200";
}

export async function StableflowLanding() {
  const [viewer, publicSnapshot] = await Promise.all([
    getViewerContext(),
    getPublicProductSnapshot().catch(() => null),
  ]);

  const primaryHref = viewer?.membership
    ? "/workspace"
    : viewer
      ? "/welcome"
      : "/sign-up";
  const primaryLabel = viewer?.membership
    ? "Open operator workspace"
    : viewer
      ? "Finish workspace setup"
      : "Create your workspace";
  const secondaryHref = viewer ? "/workspace" : "/sign-in";
  const secondaryLabel = viewer ? "Go to workspace" : "Sign in";
  const latestTransfers = publicSnapshot?.latestProofs ?? [];
  const stablecoinSymbol = publicSnapshot?.environment.stablecoinSymbol ?? "sUSD";
  const latestTransfer = latestTransfers[0] ?? null;
  const latestProofCopy = latestTransfer
    ? `${latestTransfer.recipientName} · ${latestTransfer.region} · ${formatStablecoin(latestTransfer.amountCents, stablecoinSymbol)}`
    : "Explorer-linked proof appears after the first payout cycle settles.";

  const heroStats = [
    {
      label: "Tracked revenue",
      value: publicSnapshot ? formatUsd(publicSnapshot.metrics.revenueCents) : "Live",
    },
    {
      label: "Confirmed payouts",
      value: publicSnapshot ? `${publicSnapshot.metrics.confirmedTransfers}` : "Proof-backed",
    },
    {
      label: "Treasury asset",
      value: stablecoinSymbol,
    },
  ];

  const pillars = [
    {
      icon: ReceiptText,
      title: "Collect with Dodo",
      description:
        "Create checkout sessions for global customers and treat the signed payment event as the commercial source of truth.",
    },
    {
      icon: Route,
      title: "Route by policy",
      description:
        "Compile incoming revenue into a payout run with percentages, reserve logic, and organization-owned recipient rules.",
    },
    {
      icon: ShieldCheck,
      title: "Settle on Solana",
      description:
        "Send stablecoin payouts with signatures, explorer proof, and an audit trail that stays tied to the original payment.",
    },
  ];

  const flowSteps = [
    {
      step: "01",
      screen: "Payments",
      title: "Launch a Dodo checkout",
      detail: "Capture the customer payment and tag it to the organization and payout flow.",
    },
    {
      step: "02",
      screen: "Activity",
      title: "Verify the webhook",
      detail: "Use signature verification and idempotency so the event becomes a trusted payment record.",
    },
    {
      step: "03",
      screen: "Routing",
      title: "Compile the payout run",
      detail: "Apply revenue share rules, reserve percentages, and recipient allocations without spreadsheet hops.",
    },
    {
      step: "04",
      screen: "Settlements",
      title: "Send stablecoin payouts",
      detail: "Move the obligation onto Solana and keep explorer-backed proof attached to the cycle.",
    },
  ];

  const useCases = [
    {
      icon: Globe2,
      title: "Cross-border software teams",
      description: "Pay contractors, operators, and affiliates globally without manual payout days.",
    },
    {
      icon: Bot,
      title: "AI products with revenue sharing",
      description: "Split customer revenue across agent operators, infra vendors, and data partners automatically.",
    },
    {
      icon: Network,
      title: "Platforms with payout complexity",
      description: "Keep one operating system for incoming payments, payout logic, and settlement proof.",
    },
  ];

  const workspaceViews = [
    "Overview for the current cycle and what needs attention next.",
    "Payments for Dodo sessions, incoming revenue, and reconciliation state.",
    "Routing for policy templates, recipient shares, and reserve allocation.",
    "Settlements for treasury-backed transfers, signatures, and explorer proof.",
  ];

  const ctaCycle = [
    "Dodo collection stays linked to the payout run.",
    "Routing policy keeps split logic explicit.",
    "Settlement proof stays attached to the same cycle.",
  ];

  const heroPerks = [
    {
      icon: ReceiptText,
      title: "Dodo collection",
      detail: "Customer checkouts become governed revenue records.",
    },
    {
      icon: ShieldCheck,
      title: "Signed webhooks",
      detail: "Every payout cycle starts from a verified event.",
    },
    {
      icon: Route,
      title: "Policy routing",
      detail: "Revenue shares compile before money moves.",
    },
    {
      icon: Globe2,
      title: "Cross-border ready",
      detail: "Pay teams, operators, and partners globally.",
    },
    {
      icon: Coins,
      title: "Stablecoin treasury",
      detail: `${publicSnapshot?.environment.network ?? "devnet"} · ${stablecoinSymbol}`,
    },
    {
      icon: Network,
      title: "Explorer proof",
      detail: "Settlement signatures stay attached to each run.",
    },
  ];

  return (
    <main className="sf-page overflow-hidden text-foreground">
      <div aria-hidden className="sf-aurora-plane" />
      <header className="sf-header-bar sticky top-0 z-30">
        <div className="mx-auto grid max-w-[1460px] items-center gap-4 px-5 py-4 lg:grid-cols-[1fr_auto_1fr] lg:px-8">
          <Link className="flex items-center gap-3" href="/">
            <div className="flex h-11 w-11 items-center justify-center rounded-[0.95rem] border border-[#96ea63]/18 bg-[#96ea63]/8 text-[#96ea63] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <Route className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold text-white">StableFlow</p>
              <p className="hidden text-xs text-slate-400 sm:block">
                Revenue routing for global payout teams
              </p>
            </div>
          </Link>

          <nav className="sf-nav-pill hidden items-center justify-center gap-10 px-2 py-2 text-[0.92rem] lg:flex">
            <a href="#flow" className="sf-topbar-link">
              Flow
            </a>
            <a href="#product" className="sf-topbar-link">
              Product
            </a>
            <a href="#proof" className="sf-topbar-link">
              Proof
            </a>
          </nav>

          <div className="flex items-center justify-start gap-2 lg:justify-end">
            <Button
              asChild
              variant="secondary"
              className="sf-topbar-secondary hidden rounded-[10px] px-4 sm:inline-flex"
            >
              <Link href={secondaryHref}>{secondaryLabel}</Link>
            </Button>
            <Button asChild className="sf-topbar-cta rounded-[10px] px-5">
              <Link href={primaryHref}>
                {primaryLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative border-b border-white/8">
        <div aria-hidden className="sf-hero-aurora" />
        <div className="mx-auto max-w-[1460px] px-5 pb-18 pt-14 lg:px-8 lg:pb-24 lg:pt-18">
          <div className="flex flex-wrap justify-center gap-2">
            <Badge className="sf-chip hover:bg-white/6">Dodo collection rail</Badge>
            <Badge className="sf-chip hover:bg-white/6">Solana settlement rail</Badge>
            <Badge className="sf-chip hover:bg-white/6">Protected operator workspaces</Badge>
          </div>

          <LandingReveal className="mt-14" delay={0.05} immediate>
            <div className="mx-auto flex max-w-[1080px] flex-col items-center text-center">
              <p className="sf-kicker text-sm font-medium uppercase tracking-[0.24em]">
                Charge anywhere. Settle globally.
              </p>
              <h1 className="sf-display-font mt-6 max-w-[15.4ch] text-[2.95rem] leading-[0.92] text-white sm:text-[4rem] xl:text-[4.8rem]">
                Run the payout cycle from one desk.
              </h1>
              <p className="sf-section-copy mt-6 max-w-[38rem] text-[0.98rem] leading-8 sm:text-[1.04rem] sm:leading-8">
                StableFlow turns each Dodo checkout into a governed payout cycle, then
                settles obligations on Solana with explorer-linked proof and one protected operator workspace.
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <Button asChild size="lg" className="rounded-[10px] px-7">
                  <Link href={primaryHref}>
                    {primaryLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="rounded-[10px] px-7">
                  <a href="#flow">See the product flow</a>
                </Button>
              </div>

              <div className="mt-12 grid w-full gap-4 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="sf-ledger-card rounded-[1.05rem] px-5 py-5 text-left">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                      {stat.label}
                    </p>
                    <p className="mt-4 text-[2rem] font-semibold tracking-tight text-white">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </LandingReveal>

          <div className="mt-14 grid gap-4 lg:grid-cols-3">
            {heroPerks.map((perk) => (
              <LandingReveal key={perk.title} delay={0.08}>
                <div className="sf-ledger-card rounded-[1.1rem] px-5 py-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[0.9rem] border border-[#96ea63]/20 bg-[#96ea63]/10 text-[#96ea63]">
                      <perk.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{perk.title}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-400">{perk.detail}</p>
                    </div>
                  </div>
                </div>
              </LandingReveal>
            ))}
          </div>

          <LandingReveal delay={0.14} immediate>
            <LandingTiltPanel className="sf-stage-perspective mt-14">
              <div className="sf-stage-outer sf-stage-hero rounded-[1.75rem] p-3 sm:p-4">
                <div aria-hidden className="sf-stage-scene">
                  <div className="sf-stage-orbit sf-stage-orbit-a" />
                  <div className="sf-stage-orbit sf-stage-orbit-b" />
                  <div className="sf-stage-node sf-stage-node-a" />
                  <div className="sf-stage-node sf-stage-node-b" />
                  <div className="sf-stage-beam" />
                </div>
                <div className="sf-stage-inner rounded-[1.45rem] p-5 sm:p-6">
                  <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="max-w-[30rem]">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                        Live operator cycle
                      </p>
                      <p className="mt-2.5 text-[1.7rem] font-semibold leading-[1.04] tracking-[-0.045em] text-white sm:text-[2.05rem]">
                        Checkout to payout, inside one controlled desk.
                      </p>
                      <p className="mt-3 max-w-[31rem] text-[0.93rem] leading-7 text-slate-400">
                        Every successful Dodo payment becomes a payment record, then a payout run, then a set of stablecoin transfer proofs.
                      </p>
                    </div>
                    <Badge className={statusTone(publicSnapshot?.overallStatus)}>READY</Badge>
                  </div>

                  <div className="mt-6 grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
                    <div className="sf-stage-card rounded-[1.25rem] px-5 py-5 sm:px-6">
                      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                            Current commercial volume
                          </p>
                          <p className="mt-3 text-[3rem] font-semibold leading-none tracking-[-0.05em] text-white sm:text-[3.45rem]">
                            {publicSnapshot ? formatUsd(publicSnapshot.metrics.revenueCents) : "$0.00"}
                          </p>
                          <p className="mt-4 max-w-[31rem] text-[0.93rem] leading-7 text-slate-400">
                            Every successful Dodo payment becomes a payment record, then a payout run, then a set of stablecoin transfer proofs.
                          </p>
                        </div>

                        <div className="grid gap-3">
                          {[
                            ["Dodo mode", publicSnapshot?.environment.dodoMode ?? "Test mode"],
                            ["Network", publicSnapshot?.environment.network ?? "devnet"],
                            ["Treasury", formatStablecoin(publicSnapshot?.metrics.settledStablecoinCents ?? 0, stablecoinSymbol)],
                          ].map(([label, value]) => (
                            <div key={label} className="sf-stage-row rounded-[1rem] px-4 py-4">
                              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                                {label}
                              </p>
                              <p className="mt-2.5 text-[1.05rem] font-semibold text-white">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <div className="sf-stage-row rounded-[1rem] px-4 py-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                              Dodo collection rail
                            </p>
                            <p className="mt-2.5 text-[0.95rem] font-semibold text-white">
                              Checkout creation is configured.
                            </p>
                          </div>
                          <Badge className="border border-emerald-400/18 bg-emerald-400/10 text-emerald-200">
                            Test mode
                          </Badge>
                        </div>
                      </div>

                      <div className="sf-stage-row rounded-[1rem] px-4 py-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                              Signed webhooks
                            </p>
                            <p className="mt-2.5 text-[0.95rem] font-semibold text-white">
                              Incoming payment events are verified before payout routing.
                            </p>
                          </div>
                          <Badge className="border border-emerald-400/18 bg-emerald-400/10 text-emerald-200">
                            Active
                          </Badge>
                        </div>
                      </div>

                      <div className="sf-stage-row rounded-[1rem] px-4 py-4">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                          Latest transfer proof
                        </p>
                        <p className="mt-2.5 text-[0.95rem] font-semibold text-white">
                          {latestTransfer ? `${latestTransfer.recipientName} · ${formatStablecoin(latestTransfer.amountCents, stablecoinSymbol)}` : "Explorer-linked settlement"}
                        </p>
                        <p className="mt-1.5 text-[0.88rem] leading-6 text-slate-400">{latestProofCopy}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </LandingTiltPanel>
          </LandingReveal>

          <div className="mt-14 grid gap-4 lg:grid-cols-3">
            {pillars.map((pillar) => (
              <LandingReveal key={pillar.title} delay={0.08}>
                <div className="sf-hover-rise sf-ledger-card min-h-[18rem] rounded-[1.75rem] px-6 py-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] border border-emerald-400/18 bg-emerald-400/10 text-[#7dffd3]">
                  <pillar.icon className="h-5 w-5" />
                </div>
                <h2 className="mt-10 text-[2rem] font-semibold text-white">{pillar.title}</h2>
                <p className="mt-5 max-w-[30ch] text-[1.05rem] leading-9 text-slate-300">
                  {pillar.description}
                </p>
                </div>
              </LandingReveal>
            ))}
          </div>
        </div>
      </section>

      <section id="flow" className="border-y border-white/8">
        <div className="mx-auto max-w-[1460px] px-5 py-24 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr]">
          <LandingReveal className="max-w-xl">
            <p className="sf-kicker text-sm font-medium uppercase tracking-[0.18em]">
              One understandable cycle
            </p>
            <h2 className="sf-section-title mt-4 max-w-[9ch] text-4xl font-semibold leading-[1.08] text-white sm:text-[4.55rem]">
              The product is narrow on purpose.
            </h2>
            <p className="sf-section-copy mt-8 max-w-[42rem] text-[1.1rem] leading-9">
              StableFlow is not trying to be a wallet, an ERP, and a payment
              processor at the same time. It does one job clearly: move from
              customer payment to global payout execution with proof.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="secondary" className="rounded-[10px] px-6">
                <Link href={secondaryHref}>{secondaryLabel}</Link>
              </Button>
              <Button asChild className="rounded-[10px] px-6">
                <Link href={primaryHref}>
                  Enter the product
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </LandingReveal>

          <div className="grid gap-5 md:grid-cols-2">
            {flowSteps.map((step) => (
              <LandingReveal
                key={step.step}
                delay={Number(step.step) * 0.04}
                className={`${
                  step.step === "02" ? "md:mt-14" : ""
                }`}
              >
              <div
                className={`sf-hover-rise sf-ledger-card rounded-[1.7rem] px-6 py-6 ${
                  step.step === "04" ? "border-emerald-400/20 bg-emerald-400/[0.05]" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                    Step {step.step}
                  </p>
                  <p className="text-sm font-medium text-[#7dffd3]">{step.screen}</p>
                </div>
                <h3 className="mt-6 text-[2rem] font-semibold leading-tight text-white">{step.title}</h3>
                <p className="mt-5 text-[1.02rem] leading-8 text-slate-300">{step.detail}</p>
              </div>
              </LandingReveal>
            ))}
          </div>
        </div>
        </div>
      </section>

      <section id="product">
        <div className="mx-auto max-w-[1460px] px-5 py-16 lg:px-8">
          <div className="grid gap-6 xl:grid-cols-[0.94fr_1.06fr] xl:items-start">
            <LandingReveal>
            <div>
              <p className="sf-kicker text-sm font-medium uppercase tracking-[0.18em]">
                Built for a real operator
              </p>
              <h2 className="sf-section-title mt-4 max-w-[12.2ch] text-[2.55rem] font-semibold leading-[1.05] text-white sm:text-[3.35rem]">
                Useful the moment revenue has to fan out across people, regions, or systems.
              </h2>
              <p className="sf-section-copy mt-5 max-w-[39rem] text-[0.96rem] leading-7">
                The product fits businesses that collect once, then owe money to
                several contributors. It keeps the routing logic close to the
                payment source and the settlement proof close to the operator.
              </p>

              <div className="mt-7 grid gap-4 md:grid-cols-3">
                {useCases.map((useCase) => (
                  <div
                    key={useCase.title}
                    className="sf-hover-rise sf-ledger-card min-h-[15.75rem] rounded-[1.3rem] px-[18px] py-[18px]"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-[0.85rem] border border-emerald-400/18 bg-emerald-400/10 text-[#7dffd3]">
                      <useCase.icon className="h-4 w-4" />
                    </div>
                    <h3 className="mt-6 max-w-[13ch] text-[1.4rem] font-semibold leading-tight text-white">
                      {useCase.title}
                    </h3>
                    <p className="mt-3.5 text-[0.92rem] leading-7 text-slate-300">
                      {useCase.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            </LandingReveal>

            <LandingReveal delay={0.1}>
            <div className="sf-stage-outer rounded-[1.65rem] p-[14px]">
              <div className="sf-stage-inner rounded-[1.4rem] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                    Workspace views
                  </p>
                  <p className="mt-3 text-[1.6rem] font-semibold text-white">
                    A cleaner operating desk.
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-[0.85rem] border border-emerald-400/18 bg-emerald-400/10 text-emerald-200">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {workspaceViews.map((view) => (
                  <div
                    key={view}
                    className="sf-stage-row flex items-start gap-3 rounded-[1rem] px-4 py-[14px]"
                  >
                    <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-[#96ea63]/20 bg-[#96ea63]/10 text-[#d7f5bf]">
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-[0.92rem] leading-7 text-slate-300">{view}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="sf-stage-card rounded-[1rem] px-4 py-[14px]">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                    Access model
                  </p>
                  <p className="mt-3 text-[0.98rem] font-semibold leading-7 text-white">
                    Protected by organization-scoped auth
                  </p>
                </div>
                <div className="sf-stage-card rounded-[1rem] px-4 py-[14px]">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                    Settlement posture
                  </p>
                  <p className="mt-3 text-[0.98rem] font-semibold leading-7 text-white">
                    {publicSnapshot?.environment.network ?? "Devnet"} · {stablecoinSymbol}
                  </p>
                </div>
              </div>
            </div>
            </div>
            </LandingReveal>
          </div>
        </div>
      </section>

      <section id="proof" className="border-t border-white/8">
        <div className="mx-auto max-w-[1460px] px-5 py-24 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[0.84fr_1.16fr]">
          <LandingReveal className="max-w-2xl">
            <p className="sf-kicker text-sm font-medium uppercase tracking-[0.18em]">
              Proof, not vibes
            </p>
            <h2 className="sf-section-title mt-4 max-w-[10ch] text-4xl font-semibold leading-[1.08] text-white sm:text-[4.35rem]">
              The product keeps its own evidence attached.
            </h2>
            <p className="sf-section-copy mt-8 max-w-[42rem] text-[1.08rem] leading-9">
              When an operator asks what came in, who got paid, and whether the
              settlement actually landed, StableFlow answers inside one product
              surface instead of sending them through five dashboards.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="sf-hover-rise sf-ledger-card rounded-[1.35rem] px-5 py-5">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-[#7dffd3]" />
                  <p className="font-medium text-white">Latest payment</p>
                </div>
                <p className="mt-4 font-mono text-base text-slate-200">
                  {shortValue(publicSnapshot?.latestPayment?.id, 12, 6)}
                </p>
              </div>
              <div className="sf-hover-rise sf-ledger-card rounded-[1.35rem] px-5 py-5">
                <div className="flex items-center gap-3">
                  <Coins className="h-5 w-5 text-[#7dffd3]" />
                  <p className="font-medium text-white">Stablecoin mint</p>
                </div>
                <p className="mt-4 font-mono text-base text-slate-200">
                  {shortValue(publicSnapshot?.environment.stablecoinMint, 12, 6)}
                </p>
              </div>
            </div>
          </LandingReveal>

          <div className="grid gap-4 sm:grid-cols-[0.9fr_1.1fr]">
            <LandingReveal delay={0.08}>
            <div className="sf-hover-rise sf-ledger-card rounded-[1.8rem] px-6 py-6">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                Operational posture
              </p>
              <div className="mt-5 grid gap-3">
                {(publicSnapshot?.checks ?? []).map((check) => (
                  <div key={check.id} className="sf-stage-row rounded-[1.2rem] px-5 py-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-white">{check.label}</p>
                      <Badge className={statusTone(check.status)}>{check.status}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{check.detail}</p>
                  </div>
                ))}
              </div>
            </div>
            </LandingReveal>

            <LandingReveal delay={0.12}>
            <div className="sf-proof-trust rounded-[1.8rem] px-6 py-6">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                Why users trust it
              </p>
              <div className="mt-5 grid gap-3 text-sm leading-7 text-slate-300">
                <div className="sf-proof-line rounded-[1.2rem] px-5 py-5">
                  Dodo is the commercial trigger, not decorative UI.
                </div>
                <div className="sf-proof-line rounded-[1.2rem] px-5 py-5">
                  Policy routing keeps obligations explicit before money moves.
                </div>
                <div className="sf-proof-line rounded-[1.2rem] px-5 py-5">
                  Solana signatures keep payout proof attached to the same flow.
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild className="rounded-[10px] px-6">
                  <Link href={primaryHref}>
                    {primaryLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="rounded-[10px] px-6">
                  <Link href={secondaryHref}>{secondaryLabel}</Link>
                </Button>
              </div>
            </div>
            </LandingReveal>
          </div>
        </div>
        </div>
      </section>

      <section className="relative border-t border-white/8">
        <div className="mx-auto max-w-[1460px] px-5 py-20 lg:px-8">
          <LandingReveal>
          <div className="sf-cta-dock rounded-[2rem] px-6 py-7 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="sf-kicker text-sm font-medium uppercase tracking-[0.18em]">
                  Operate from one desk
                </p>
                <h2 className="sf-section-title mt-4 max-w-[12ch] text-4xl font-semibold leading-[1.05] text-white sm:text-[4rem]">
                  Launch the next payout cycle with less friction.
                </h2>
                <p className="sf-section-copy mt-5 max-w-[44rem] text-[1.05rem] leading-8">
                  StableFlow keeps collection, routing, and explorer-linked settlement proof inside one controlled workspace.
                </p>
              </div>

              <div className="flex w-full flex-col gap-4 lg:max-w-[30rem] lg:items-stretch">
                <div className="sf-cta-panel rounded-[1.55rem] px-5 py-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      One operating cycle
                    </p>
                    <span className="rounded-full border border-emerald-400/16 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                      Ready
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {ctaCycle.map((item) => (
                      <div key={item} className="sf-cta-row rounded-[1rem] px-4 py-3">
                        <div className="flex items-start gap-3">
                          <span className="sf-cta-dot mt-1.5" />
                          <p className="text-sm leading-7 text-slate-300">{item}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 lg:justify-start">
                  <span className="sf-cta-chip rounded-full px-4 py-2 text-sm">Dodo collection</span>
                  <span className="sf-cta-chip rounded-full px-4 py-2 text-sm">Policy routing</span>
                  <span className="sf-cta-chip rounded-full px-4 py-2 text-sm">Solana proof</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild className="rounded-[10px] px-7">
                    <Link href={primaryHref}>
                      {primaryLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" className="rounded-[10px] px-7">
                    <Link href={secondaryHref}>{secondaryLabel}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          </LandingReveal>
        </div>
      </section>

      <footer className="border-t border-white/8">
        <div className="mx-auto max-w-[1460px] px-5 py-10 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[0.95rem] border border-[#96ea63]/18 bg-[#96ea63]/8 text-[#96ea63] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <Route className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-semibold text-white">StableFlow</p>
                  <p className="text-sm text-slate-400">
                    Revenue routing for global software teams
                  </p>
                </div>
              </div>
              <p className="mt-10 text-sm text-slate-500">
                © 2026 StableFlow. Dodo collection rail · Solana settlement rail · Protected operator workspaces.
              </p>
            </div>

            <div className="flex flex-col items-start gap-8 lg:items-end">
              <div className="flex flex-wrap items-center gap-8 text-base text-slate-300">
                <a href="#flow" className="sf-topbar-link">
                  Flow
                </a>
                <a href="#product" className="sf-topbar-link">
                  Product
                </a>
                <a href="#proof" className="sf-topbar-link">
                  Proof
                </a>
                <Link href={secondaryHref} className="sf-topbar-link">
                  {secondaryLabel}
                </Link>
                <Link href={primaryHref} className="font-semibold text-[#8ff8df] transition hover:text-white">
                  {primaryLabel}
                </Link>
              </div>
              <p className="text-sm text-slate-500">
                Built for software teams that need proof-backed payout operations.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
