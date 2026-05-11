"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeDollarSign,
  BanknoteArrowUp,
  Bot,
  CheckCircle2,
  Coins,
  Copy,
  ExternalLink,
  FileClock,
  Gauge,
  Globe2,
  Loader2,
  Play,
  ReceiptText,
  RefreshCw,
  Route,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { OrganizationRole } from "@/generated/prisma/client";
import { agenticFlows, demoStablecoin } from "@/lib/demo-data";
import { signOutFromStableFlow } from "@/lib/firebase/browser-session";

type ActionState = "idle" | "checkout" | "seed" | "settle";
type WorkspaceView = "overview" | "revenue" | "routing" | "settlement" | "audit";

type DashboardSnapshot = {
  generatedAt: string;
  organization: {
    id: string;
    name: string;
    slug: string;
    dodoProductId: string | null;
    treasuryWallet: string | null;
    createdAt: string;
  } | null;
  asset: {
    name: string;
    symbol: string;
    mint: string | null;
    decimals: number;
    treasuryWallet: string | null;
    treasuryTokenAccount?: string | null;
    treasurySolBalance?: number | null;
    treasuryStablecoinBalance?: number | null;
  };
  readiness: {
    overallStatus: "READY" | "ATTENTION" | "BLOCKED";
    checks: Array<{
      id: string;
      label: string;
      status: "READY" | "ATTENTION" | "BLOCKED";
      value: string;
      detail: string;
    }>;
  };
  competitionFit: {
    overallStatus: "READY" | "ATTENTION" | "BLOCKED";
    checks: Array<{
      id: string;
      label: string;
      status: "READY" | "ATTENTION" | "BLOCKED";
      value: string;
      detail: string;
    }>;
  };
  pilotNarrative: {
    painfulProblem: string;
    whyNowSolana: string;
    firstUser: string;
    unfairInsight: string;
    sixWeekSuccess: string;
  };
  metrics?: {
    dodoRevenueCents: number;
    successfulPayments: number;
    settledStablecoinCents: number;
    confirmedTransfers: number;
    recipients: number;
    regions: number;
    avgSettlementSeconds: number | null;
    pendingPayoutRuns: number;
  };
  policy?: {
    id: string;
    name: string;
    enabled: boolean;
    reservePercent: number;
    routedPercent: number;
    unallocatedPercent: number;
    metadata: Record<string, unknown>;
  } | null;
  recipients?: Array<{
    id: string;
    name: string;
    role: string;
    email: string | null;
    walletAddress: string;
    region: string;
    tags: string[];
    sharePercent: number;
  }>;
  recentCheckoutSessions?: Array<{
    id: string;
    dodoSessionId: string;
    checkoutUrl: string;
    status: string;
    amountCents: number | null;
    quantity: number;
    customerName: string | null;
    customerEmail: string | null;
    createdAt: string;
  }>;
  recentPayments?: Array<{
    id: string;
    dodoPaymentId: string | null;
    amountCents: number;
    currency: string;
    status: string;
    customerName: string | null;
    customerEmail: string | null;
    createdAt: string;
    checkoutSessionId: string | null;
    checkoutUrl: string | null;
    payoutRun: {
      id: string;
      status: string;
      confirmedTransfers: number;
      totalTransfers: number;
    } | null;
  }>;
  latestPayoutRun?: {
    id: string;
    status: string;
    grossAmountCents: number;
    reserveAmountCents: number;
    payoutAmountCents: number;
    currency: string;
    createdAt: string;
    updatedAt: string;
    cycleTimeSeconds: number | null;
    payment: {
      id: string;
      customerName: string | null;
      customerEmail: string | null;
      dodoPaymentId: string | null;
      amountCents: number;
      createdAt: string;
    } | null;
    transfers: Array<{
      id: string;
      recipientId: string;
      recipientName: string;
      recipientRole: string;
      region: string;
      amountCents: number;
      currency: string;
      walletAddress: string;
      status: string;
      signature: string | null;
      explorerUrl: string | null;
      error: string | null;
      sentAt: string | null;
      confirmedAt: string | null;
    }>;
  } | null;
  recentPayoutRuns?: Array<{
    id: string;
    status: string;
    grossAmountCents: number;
    payoutAmountCents: number;
    createdAt: string;
    paymentCustomer: string | null;
    confirmedTransfers: number;
    totalTransfers: number;
  }>;
  auditLogs?: Array<{
    id: string;
    actor: string;
    action: string;
    targetType: string;
    targetId: string | null;
    createdAt: string;
  }>;
};

type StableflowAppProps = {
  initialSnapshot?: DashboardSnapshot | null;
  previewMode?: boolean;
  viewer: {
    name: string;
    email: string;
    role: OrganizationRole;
    organizationName: string;
    organizationSlug: string;
  };
};

const workspaceViews: Array<{
  id: WorkspaceView;
  step: string;
  label: string;
  icon: typeof Gauge;
  description: string;
}> = [
  {
    id: "overview",
    step: "Start",
    label: "Overview",
    icon: Gauge,
    description: "See the cycle, current state, and first action.",
  },
  {
    id: "revenue",
    step: "01",
    label: "Collect revenue",
    icon: ReceiptText,
    description: "Launch checkouts and review incoming payments.",
  },
  {
    id: "routing",
    step: "02",
    label: "Review routing",
    icon: Route,
    description: "Review payout rules and recipient splits.",
  },
  {
    id: "settlement",
    step: "03",
    label: "Settle",
    icon: Coins,
    description: "Run payouts and inspect transfer proof.",
  },
  {
    id: "audit",
    step: "04",
    label: "Verify proof",
    icon: FileClock,
    description: "Logs, proof, and the accountability trail.",
  },
];

const viewHeroCopy: Record<
  WorkspaceView,
  {
    eyebrow: string;
    title: string;
    summary: string;
    focus: string[];
  }
> = {
  overview: {
    eyebrow: "Guided start",
    title: "Start revenue, then move through the StableFlow cycle.",
    summary:
      "Overview explains the operator flow once: collect revenue first, review routing next, settle the run, then verify the proof trail.",
    focus: ["Collect revenue", "Review routing", "Settle", "Verify proof"],
  },
  revenue: {
    eyebrow: "Cash desk",
    title: "Collect revenue",
    summary:
      "Launch checkouts, watch incoming payments, and keep the ledger clean.",
    focus: ["Launch checkout", "Track payments", "Open ledger"],
  },
  routing: {
    eyebrow: "Policy engine",
    title: "Review routing",
    summary:
      "Confirm recipient shares and reserve posture before settlement opens.",
    focus: ["Policy", "Recipients", "Templates"],
  },
  settlement: {
    eyebrow: "Execution rail",
    title: "Settle payouts",
    summary:
      "Run the queue, inspect signatures, and keep explorer proof attached.",
    focus: ["Treasury", "Queue", "Explorer proof"],
  },
  audit: {
    eyebrow: "Accountability trail",
    title: "Verify proof",
    summary:
      "Check logs, payout evidence, and rail health from one trace.",
    focus: ["Audit events", "Proof", "Rail health"],
  },
};

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

function formatAssetAmount(value: number | null | undefined, symbol: string) {
  if (value === null || value === undefined) {
    return "Unavailable";
  }

  return `${value.toFixed(symbol === "SOL" ? 3 : 2)} ${symbol}`;
}

function formatPercent(percent: number) {
  return `${percent.toFixed(percent % 1 === 0 ? 0 : 2)}%`;
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Pending";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatCycleDuration(seconds: number | null) {
  if (seconds === null || Number.isNaN(seconds)) {
    return "Awaiting confirmed cycle";
  }

  if (seconds < 60) {
    return `${Math.round(seconds)}s avg cycle`;
  }

  if (seconds < 3600) {
    return `${Math.round(seconds / 60)}m avg cycle`;
  }

  if (seconds < 86400) {
    return `${(seconds / 3600).toFixed(1)}h avg cycle`;
  }

  return `${(seconds / 86400).toFixed(1)}d avg cycle`;
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

function titleCaseStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function badgeTone(status: string) {
  if (["SUCCEEDED", "SETTLED", "CONFIRMED", "PROCESSED", "READY", "LIVE"].includes(status)) {
    return "border border-emerald-400/20 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/10";
  }

  if (["ATTENTION", "QUEUED", "INITIATED", "RECEIVED"].includes(status)) {
    return "border border-amber-400/20 bg-amber-400/10 text-amber-200 hover:bg-amber-400/10";
  }

  if (["EXECUTING", "PARTIAL", "SIMULATED", "BUILDING"].includes(status)) {
    return "border border-sky-400/20 bg-sky-400/10 text-sky-200 hover:bg-sky-400/10";
  }

  return "border border-rose-400/20 bg-rose-400/10 text-rose-200 hover:bg-rose-400/10";
}

function LoadingBlock() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card className="sf-shell rounded-md" key={index}>
            <CardHeader className="pb-3">
              <div className="h-4 w-28 animate-pulse rounded bg-white/8" />
              <div className="h-8 w-24 animate-pulse rounded bg-white/8" />
            </CardHeader>
            <CardContent>
              <div className="h-6 w-20 animate-pulse rounded bg-white/8" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="sf-shell rounded-md">
        <CardContent className="flex h-52 items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading live ledger state
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function StableflowApp({
  initialSnapshot = null,
  previewMode = false,
  viewer,
}: StableflowAppProps) {
  const router = useRouter();
  const [action, setAction] = useState<ActionState>("idle");
  const [checkoutEmail, setCheckoutEmail] = useState("founder@demo.ai");
  const [checkoutName, setCheckoutName] = useState("Frontier Judge Demo");
  const [quantity, setQuantity] = useState(1);
  const [lastCheckoutUrl, setLastCheckoutUrl] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(initialSnapshot);
  const [dashboardState, setDashboardState] = useState<"loading" | "ready" | "error">(
    initialSnapshot ? "ready" : "loading",
  );
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>("overview");
  const [signingOut, setSigningOut] = useState(false);

  const refreshDashboard = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;

    if (!silent) {
      setRefreshing(true);
      setDashboardState((current) => (current === "ready" ? current : "loading"));
    }

    try {
      const response = await fetch("/api/dashboard", { cache: "no-store" });
      const payload = (await response.json()) as {
        ok: boolean;
        snapshot?: DashboardSnapshot;
        error?: string;
      };

      if (!response.ok || !payload.ok || !payload.snapshot) {
        throw new Error(payload.error ?? "Could not load dashboard");
      }

      setSnapshot(payload.snapshot);
      setDashboardError(null);
      setDashboardState("ready");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load dashboard";
      setDashboardError(message);
      setDashboardState((current) => (current === "ready" ? current : "error"));
      if (!silent) {
        toast.error(message);
      }
    } finally {
      if (!silent) {
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    if (previewMode) {
      return;
    }

    const timer = window.setTimeout(() => {
      void refreshDashboard(initialSnapshot ? { silent: true } : undefined);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [initialSnapshot, previewMode, refreshDashboard]);

  async function runAction<T>(
    nextAction: ActionState,
    request: () => Promise<T>,
    successMessage: string,
  ) {
    setAction(nextAction);
    try {
      const result = await request();
      await refreshDashboard({ silent: true });
      toast.success(successMessage);
      return result;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Request failed");
      return null;
    } finally {
      setAction("idle");
    }
  }

  async function seedDemo() {
    await runAction(
      "seed",
      async () => {
        const response = await fetch("/api/demo/seed", { method: "POST" });
        const payload = await response.json();
        if (!response.ok || !payload.ok) {
          throw new Error(payload.error ?? "Could not seed demo");
        }
        return payload;
      },
      "Demo ledger seeded",
    );
  }

  async function createCheckout() {
    const payload = await runAction(
      "checkout",
      async () => {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerEmail: checkoutEmail,
            customerName: checkoutName,
            quantity,
          }),
        });
        const data = await response.json();
        if (!response.ok || !data.ok) {
          throw new Error(data.error ?? "Could not create checkout");
        }
        return data as { checkoutUrl: string };
      },
      "Dodo checkout created",
    );

    if (payload?.checkoutUrl) {
      setLastCheckoutUrl(payload.checkoutUrl);
      window.open(payload.checkoutUrl, "_blank", "noopener,noreferrer");
    }
  }

  async function settlePayouts() {
    await runAction(
      "settle",
      async () => {
        const response = await fetch("/api/payouts/simulate", { method: "POST" });
        const payload = await response.json();
        if (!response.ok || !payload.ok) {
          throw new Error(payload.error ?? "Could not settle payouts");
        }
        return payload;
      },
      "Payout run settled",
    );
  }

  async function copyText(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Could not copy ${label.toLowerCase()}`);
    }
  }

  const recipients = snapshot?.recipients ?? [];
  const latestPayoutRun = snapshot?.latestPayoutRun ?? null;
  const recentPayments = snapshot?.recentPayments ?? [];
  const recentCheckoutSessions = snapshot?.recentCheckoutSessions ?? [];
  const recentAuditLogs = snapshot?.auditLogs ?? [];
  const recentPayoutRuns = snapshot?.recentPayoutRuns ?? [];
  const latestCheckoutUrl = lastCheckoutUrl ?? recentCheckoutSessions[0]?.checkoutUrl ?? null;
  const latestExplorerLinks =
    latestPayoutRun?.transfers.filter((transfer) => Boolean(transfer.explorerUrl)) ?? [];
  const readinessChecks = snapshot?.readiness.checks ?? [];
  const latestPayment = recentPayments[0] ?? null;
  const latestProof = latestExplorerLinks[0] ?? null;

  const handleSignOut = useCallback(async () => {
    setSigningOut(true);

    try {
      await signOutFromStableFlow();
      router.replace("/");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not sign out.");
    } finally {
      setSigningOut(false);
    }
  }, [router]);

  const payoutTotal = snapshot?.policy?.routedPercent ?? 0;

  const metrics = useMemo(() => {
    if (!snapshot?.metrics) {
      return [];
    }

    return [
      {
        label: "Dodo revenue",
        value: formatUsd(snapshot.metrics.dodoRevenueCents),
        delta: `${snapshot.metrics.successfulPayments} successful payments`,
        tone: "emerald",
      },
      {
        label: `${snapshot.asset.symbol} settled`,
        value: formatStablecoin(snapshot.metrics.settledStablecoinCents, snapshot.asset.symbol),
        delta:
          snapshot.metrics.avgSettlementSeconds !== null
            ? formatCycleDuration(snapshot.metrics.avgSettlementSeconds)
            : "Awaiting confirmed cycle",
        tone: "sky",
      },
      {
        label: "Recipients",
        value: String(snapshot.metrics.recipients),
        delta: `${snapshot.metrics.regions} payout regions`,
        tone: "violet",
      },
      {
        label: "Confirmed signatures",
        value: String(snapshot.metrics.confirmedTransfers),
        delta:
          snapshot.metrics.pendingPayoutRuns > 0
            ? `${snapshot.metrics.pendingPayoutRuns} run(s) still active`
            : "No payout backlog",
        tone: "amber",
      },
    ];
  }, [snapshot]);

  const heroCopy = viewHeroCopy[workspaceView];
  const rightRailStatus =
    snapshot?.readiness.overallStatus
      ? titleCaseStatus(snapshot.readiness.overallStatus)
      : "Loading";
  const nextMove = latestPayoutRun
    ? latestPayoutRun.status === "SETTLED"
      ? "Create the next Dodo checkout or review the proof trail."
      : "Open Settlements and clear the active payout queue."
    : recentPayments.length > 0
      ? "Compile and execute the next payout run from the latest payment."
      : "Start with Payments and launch a Dodo checkout session.";
  const routingSummary = recipients.length
    ? `${recipients.length} recipients configured • ${formatPercent(payoutTotal)} routed`
    : "Configure recipients and payout shares before the first run.";
  const currentCycleView: Exclude<WorkspaceView, "overview"> = !latestPayment
    ? "revenue"
    : !latestPayoutRun
      ? "routing"
      : latestPayoutRun.status === "SETTLED"
        ? "audit"
        : "settlement";
  const currentCycleStage = !latestPayment
    ? "Collect revenue"
    : !latestPayoutRun
      ? "Review routing"
      : latestPayoutRun.status === "SETTLED"
        ? "Verify proof"
        : "Settle";
  const overviewHeadline = !latestPayment
    ? "Start the first payout cycle."
    : !latestPayoutRun
      ? "Revenue landed. Route the payout."
      : latestPayoutRun.status === "SETTLED"
        ? "Payout settled. Proof is ready."
        : "Settlement is in motion.";
  const overviewSummary = !latestPayment
    ? "Create the first Dodo checkout, let revenue hit the ledger, then move through routing, settlement, and proof."
    : !latestPayoutRun
      ? "The latest payment is in the ledger. Review the routing rules next so StableFlow can assemble the payout run cleanly."
      : latestPayoutRun.status === "SETTLED"
        ? "The current run is settled. Review the explorer-linked proof, then launch the next revenue cycle when you are ready."
        : "The payout run is live. Open Settlements to inspect signatures, treasury posture, and the proof trail as it forms.";
  const overviewPrimaryAction = !latestPayment
    ? {
        label: "Create first checkout",
        icon: BadgeDollarSign,
        onClick: createCheckout,
        loading: action === "checkout",
      }
    : !latestPayoutRun
      ? {
          label: "Review routing",
          icon: Route,
          onClick: () => setWorkspaceView("routing"),
          loading: false,
        }
      : latestPayoutRun.status === "SETTLED"
        ? {
            label: "View proof",
            icon: FileClock,
            onClick: () => setWorkspaceView("audit"),
            loading: false,
          }
        : {
            label: "Open settlements",
            icon: Coins,
            onClick: () => setWorkspaceView("settlement" satisfies WorkspaceView),
            loading: false,
          };
  const overviewSecondaryAction = {
    label: "Open payments",
    icon: ReceiptText,
    onClick: () => setWorkspaceView("revenue"),
  };
  const overviewStageCards = [
    {
      id: "revenue",
      step: "01",
      label: "Collect revenue",
      description: latestPayment
        ? `${formatUsd(latestPayment.amountCents)} is already in the ledger.`
        : "Launch a Dodo checkout and wait for the payment event.",
      status: latestPayment ? "Done" : "Start here",
      tone: latestPayment ? "READY" : "ATTENTION",
      actionLabel: latestPayment ? "Open payments" : "Create checkout",
      action: latestPayment ? () => setWorkspaceView("revenue") : createCheckout,
      loading: !latestPayment && action === "checkout",
      icon: ReceiptText,
    },
    {
      id: "routing",
      step: "02",
      label: "Review routing",
      description: latestPayoutRun
        ? routingSummary
        : latestPayment
          ? "Confirm recipients, shares, and reserve rules before settlement."
          : "Routing opens after the first payment lands.",
      status: latestPayoutRun ? "Configured" : latestPayment ? "Ready" : "Waiting",
      tone: latestPayoutRun ? "READY" : latestPayment ? "ATTENTION" : "BLOCKED",
      actionLabel: "Open routing",
      action: () => setWorkspaceView("routing"),
      loading: false,
      icon: Route,
    },
    {
      id: "settlement",
      step: "03",
      label: "Settle",
      description: latestPayoutRun
        ? latestPayoutRun.status === "SETTLED"
          ? `${latestPayoutRun.transfers.length} transfer(s) are already confirmed.`
          : `${latestPayoutRun.transfers.length} transfer(s) are attached to the active run.`
        : "Settlement begins after revenue is routed into a payout run.",
      status: latestPayoutRun
        ? latestPayoutRun.status === "SETTLED"
          ? "Done"
          : "In motion"
        : "Waiting",
      tone: latestPayoutRun
        ? latestPayoutRun.status === "SETTLED"
          ? "READY"
          : "ATTENTION"
        : "BLOCKED",
      actionLabel: "Open settlements",
      action: () => setWorkspaceView("settlement"),
      loading: false,
      icon: Coins,
    },
    {
      id: "audit",
      step: "04",
      label: "Verify proof",
      description: latestProof
        ? `${latestProof.recipientName} is explorer-linked with proof attached.`
        : "Explorer proof appears after the first confirmed settlement.",
      status: latestProof ? "Ready" : "Waiting",
      tone: latestProof ? "READY" : "BLOCKED",
      actionLabel: "Open proof",
      action: () => setWorkspaceView("audit"),
      loading: false,
      icon: FileClock,
    },
  ] as const;
  const showHeaderCheckout = workspaceView !== "overview" || currentCycleView === "revenue";
  const viewPrimaryAction =
    workspaceView === "revenue"
      ? {
          label: "Launch checkout",
          icon: BadgeDollarSign,
          onClick: createCheckout,
          loading: action === "checkout",
        }
      : workspaceView === "routing"
        ? {
            label: "Open settlements",
            icon: Coins,
            onClick: () => setWorkspaceView("settlement"),
            loading: false,
          }
        : workspaceView === "settlement"
          ? {
              label: "Settle on devnet",
              icon: Play,
              onClick: settlePayouts,
              loading: action === "settle",
            }
          : {
              label: latestProof?.explorerUrl ? "Open latest proof" : "Open settlements",
              icon: latestProof?.explorerUrl ? ExternalLink : Coins,
              onClick: () =>
                latestProof?.explorerUrl
                  ? window.open(latestProof.explorerUrl, "_blank", "noopener,noreferrer")
                  : setWorkspaceView("settlement"),
              loading: false,
            };
  const viewSecondaryAction =
    workspaceView === "revenue"
      ? {
          label: latestCheckoutUrl ? "Open recent checkout" : "Refresh ledger",
          icon: latestCheckoutUrl ? ExternalLink : RefreshCw,
          onClick: () =>
            latestCheckoutUrl
              ? window.open(latestCheckoutUrl, "_blank", "noopener,noreferrer")
              : refreshDashboard(),
        }
      : workspaceView === "routing"
        ? {
            label: "Open payments",
            icon: ReceiptText,
            onClick: () => setWorkspaceView("revenue"),
          }
        : workspaceView === "settlement"
          ? {
              label: "Open proof",
              icon: FileClock,
              onClick: () => setWorkspaceView("audit"),
            }
          : {
              label: "Open payments",
              icon: ReceiptText,
              onClick: () => setWorkspaceView("revenue"),
            };

  return (
    <main className="sf-page sf-workspace min-h-screen text-foreground">
      <header className="sticky top-0 z-30 border-b border-white/8 bg-[rgba(6,8,12,0.84)] backdrop-blur-xl">
        <div className="mx-auto max-w-[1560px] px-5 py-4 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[0.95rem] border border-[#96ea63]/18 bg-[#96ea63]/8 text-[#96ea63] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <Route className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  Protected operator workspace
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-base font-semibold text-white">StableFlow workspace</p>
                  <Badge className="sf-chip hidden hover:bg-white/6 md:inline-flex">
                    {snapshot?.asset.symbol ?? demoStablecoin.symbol} on{" "}
                    {snapshot?.readiness.overallStatus === "READY" ? "live rail" : "attention"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild variant="secondary">
                    <Link href="/">
                      <ArrowRight className="h-4 w-4 rotate-180" />
                      Product overview
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Go back to the public product overview</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => refreshDashboard()}
                    variant="secondary"
                    disabled={previewMode || refreshing || action !== "idle"}
                  >
                    {refreshing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Refresh
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reload the live ledger and payout state</TooltipContent>
              </Tooltip>
              {showHeaderCheckout ? (
                <Button
                  onClick={createCheckout}
                  disabled={previewMode || action !== "idle"}
                  variant={workspaceView === "overview" ? "secondary" : "default"}
                  className={workspaceView === "overview" ? "sf-header-action" : undefined}
                >
                  {action === "checkout" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <BadgeDollarSign className="h-4 w-4" />
                  )}
                  New checkout
                </Button>
              ) : null}
              <Button
                onClick={handleSignOut}
                variant="outline"
                disabled={previewMode || signingOut}
              >
                {signingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {previewMode ? "Preview mode" : "Sign out"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div
        className={`mx-auto grid max-w-[1560px] gap-5 px-5 py-6 lg:px-8 ${
          workspaceView === "overview"
            ? "xl:grid-cols-[15.5rem_minmax(0,1fr)]"
            : "xl:grid-cols-[15.5rem_minmax(0,1fr)] 2xl:grid-cols-[15.5rem_minmax(0,1fr)_18rem]"
        }`}
      >
        {dashboardError && !previewMode ? (
          <Alert className="xl:col-span-3">
            <ShieldCheck className="h-4 w-4" />
            <AlertTitle>Workspace needs attention</AlertTitle>
            <AlertDescription>{dashboardError}</AlertDescription>
          </Alert>
        ) : null}

        {dashboardState === "loading" ? <div className="xl:col-span-3"><LoadingBlock /></div> : null}

        {dashboardState !== "loading" && !snapshot?.organization ? (
          <Card className="sf-shell rounded-md xl:col-span-3">
            <CardContent className="flex flex-col items-start gap-4 p-6">
              <div>
                <h2 className="text-xl font-semibold">No workspace data yet</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Load the demo data to create the organization, payout policy,
                  recipients, and a starter payment cycle.
                </p>
              </div>
              <Button onClick={seedDemo} disabled={action !== "idle"}>
                {action === "seed" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Load demo data
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {dashboardState === "ready" && snapshot?.organization ? (
          <>
            <aside className="xl:sticky xl:top-24 xl:h-fit">
              <div className="sf-shell-strong rounded-[1.1rem] p-3">
                <div className="border-b border-white/8 px-2 pb-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                    Workspace
                  </p>
                  <p className="mt-2 text-[0.82rem] leading-6 text-slate-400">
                    Revenue to proof, one cycle at a time.
                  </p>
                </div>
                <div className="mt-3 grid gap-2">
                  {workspaceViews.map((view) => {
                    const isActive = workspaceView === view.id;

                    return (
                      <button
                        key={view.id}
                        type="button"
                        onClick={() => setWorkspaceView(view.id)}
                        data-active={isActive}
                        className="sf-nav-item w-full overflow-hidden rounded-[1rem] px-3 py-3 text-left"
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex items-center gap-2 pt-0.5">
                            <div
                              className={`flex h-8 min-w-8 items-center justify-center rounded-md px-1.5 text-[10px] font-semibold tracking-[0.14em] ${
                                isActive
                                  ? "bg-emerald-400/14 text-emerald-200"
                                  : "bg-white/6 text-slate-300"
                              }`}
                            >
                              {view.step}
                            </div>
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-md ${
                                isActive
                                  ? "bg-emerald-400/14 text-emerald-200"
                                  : "bg-white/6 text-slate-300"
                              }`}
                            >
                              <view.icon className="h-4 w-4" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[0.95rem] font-medium leading-5 text-white">
                              {view.label}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 border-t border-white/8 px-2 pt-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                    Organization
                  </p>
                  <p className="mt-2 font-medium text-white">{viewer.organizationName}</p>
                  <p className="text-sm text-slate-400">{viewer.organizationSlug}</p>
                  <div className="sf-rail-panel mt-4 flex items-center gap-3 rounded-[0.95rem] px-3 py-3">
                    <Avatar className="h-10 w-10 rounded-md">
                      <AvatarFallback className="rounded-md border border-white/10 bg-white/8 text-[#7dffd3]">
                        {viewer.name
                          .split(" ")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((part) => part[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">{viewer.name}</p>
                      <p className="truncate text-sm text-slate-400">{viewer.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <div className="grid gap-6">
              <section
                className={`rounded-[1.35rem] p-4 sm:p-5 ${
                  workspaceView === "overview" ? "sf-stage" : "sf-shell-strong"
                }`}
              >
                {workspaceView === "overview" ? (
                  <div className="grid gap-6">
                    <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr] xl:items-start">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="sf-chip gap-1 hover:bg-white/6">
                            <ShieldCheck className="h-3 w-3" />
                            Verified webhooks
                          </Badge>
                          <Badge className="sf-chip gap-1 hover:bg-white/6">
                            <Coins className="h-3 w-3" />
                            {snapshot.asset.symbol} settlement rail
                          </Badge>
                          <Badge className="sf-chip gap-1 hover:bg-white/6">
                            <Route className="h-3 w-3" />
                            Policy-backed routing
                          </Badge>
                        </div>
                        <p className="sf-kicker mt-5 text-sm font-medium uppercase tracking-[0.18em]">
                          Current cycle
                        </p>
                        <h1 className="sf-section-title mt-3 max-w-[12ch] text-[1.85rem] font-semibold leading-[0.96] text-white sm:text-[2.45rem]">
                          {overviewHeadline}
                        </h1>
                        <p className="sf-section-copy mt-4 max-w-[32rem] text-[0.9rem] leading-6 text-slate-300">
                          {overviewSummary}
                        </p>

                        <div className="mt-6 flex flex-wrap gap-2.5">
                          <Button
                            onClick={overviewPrimaryAction.onClick}
                            disabled={
                              overviewPrimaryAction.loading ? action !== "idle" : false
                            }
                          >
                            {overviewPrimaryAction.loading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <overviewPrimaryAction.icon className="h-4 w-4" />
                            )}
                            {overviewPrimaryAction.label}
                          </Button>
                          <Button variant="secondary" onClick={overviewSecondaryAction.onClick}>
                            <overviewSecondaryAction.icon className="h-4 w-4" />
                            {overviewSecondaryAction.label}
                          </Button>
                        </div>

                      </div>

                      <div className="sf-shell-strong rounded-[1.15rem] p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                              Operator status
                            </p>
                            <p className="mt-2 text-[1.2rem] font-semibold text-white">
                              {currentCycleStage}
                            </p>
                            <p className="mt-2 text-[0.9rem] leading-6 text-slate-400">{nextMove}</p>
                          </div>
                          <Badge className={badgeTone(snapshot.readiness.overallStatus)}>
                            {titleCaseStatus(snapshot.readiness.overallStatus)}
                          </Badge>
                        </div>

                        <div className="mt-5 grid gap-3">
                          <div className="sf-command-pill rounded-[0.95rem] px-4 py-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                                Commercial volume
                              </p>
                              <span className="text-sm font-medium text-white">
                                {metrics[0]?.value ?? formatUsd(0)}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-400">
                              {metrics[0]?.delta ?? "No successful payments yet"}
                            </p>
                          </div>
                          <div className="sf-command-pill rounded-[0.95rem] px-4 py-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                                Latest run
                              </p>
                              <span className="text-sm font-medium text-white">
                                {latestPayoutRun ? titleCaseStatus(latestPayoutRun.status) : "No run yet"}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-400">
                              {latestPayoutRun
                                ? `${latestPayoutRun.transfers.length} transfer(s) are attached to this cycle.`
                                : "The first routed payment opens the payout run."}
                            </p>
                          </div>
                          <div className="sf-command-pill rounded-[0.95rem] px-4 py-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                                Proof
                              </p>
                              <span className="text-sm font-medium text-white">
                                {latestProof ? "Ready" : "Waiting"}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-400">
                              {latestProof
                                ? `${latestProof.recipientName} is explorer-linked.`
                                : "Proof appears after the first confirmed settlement."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
                      {overviewStageCards.map((card) => (
                        <Card key={card.id} className="sf-shell rounded-[1rem]">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#96ea63]/10 text-[#96ea63]">
                                  <card.icon className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                                    Step {card.step}
                                  </p>
                                  <CardTitle className="mt-1 text-lg">{card.label}</CardTitle>
                                </div>
                              </div>
                              <Badge className={badgeTone(card.tone)}>{card.status}</Badge>
                            </div>
                            <CardDescription className="pt-2 leading-6">
                              {card.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Button
                              variant={card.id === currentCycleView ? "default" : "secondary"}
                              className="w-full"
                              onClick={card.action}
                              disabled={card.loading ? action !== "idle" : false}
                            >
                              {card.loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <ArrowRight className="h-4 w-4" />
                              )}
                              {card.actionLabel}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-5">
                    <div className="flex flex-wrap gap-2">
                      <Badge className="sf-chip gap-1 hover:bg-white/6">
                        <ShieldCheck className="h-3 w-3" />
                        Verified webhooks
                      </Badge>
                      <Badge className="sf-chip gap-1 hover:bg-white/6">
                        <Coins className="h-3 w-3" />
                        {snapshot.asset.symbol} settlement rail
                      </Badge>
                      <Badge className="sf-chip gap-1 hover:bg-white/6">
                        <Route className="h-3 w-3" />
                        Policy-backed routing
                      </Badge>
                    </div>
                      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_15rem] xl:items-end">
                        <div>
                          <p className="sf-kicker text-sm font-medium uppercase tracking-[0.18em]">
                            {heroCopy.eyebrow}
                          </p>
                          <h1 className="sf-section-title mt-3 max-w-[12ch] text-[1.4rem] font-semibold leading-[1.02] text-white sm:text-[1.78rem]">
                            {heroCopy.title}
                          </h1>
                          <p className="sf-section-copy mt-2.5 max-w-[28rem] text-[0.85rem] leading-6 text-slate-300">
                            {heroCopy.summary}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2.5 xl:justify-end">
                          <Button
                            onClick={viewPrimaryAction.onClick}
                            disabled={previewMode || (viewPrimaryAction.loading ? action !== "idle" : false)}
                          >
                            {viewPrimaryAction.loading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <viewPrimaryAction.icon className="h-4 w-4" />
                            )}
                            {viewPrimaryAction.label}
                          </Button>
                          <Button variant="secondary" onClick={viewSecondaryAction.onClick}>
                            <viewSecondaryAction.icon className="h-4 w-4" />
                            {viewSecondaryAction.label}
                          </Button>
                        </div>
                      </div>

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {metrics.slice(0, 3).map((metric) => (
                        <div key={metric.label} className="sf-metric-card rounded-[1rem] px-4 py-3.5">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                            {metric.label}
                          </p>
                          <p className="mt-2 text-[1.12rem] font-semibold tracking-[-0.03em] text-white">
                            {metric.value}
                          </p>
                          <p className="mt-1.5 text-[0.82rem] leading-5 text-slate-400">{metric.delta}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

            {workspaceView === "revenue" ? (
              <section className="grid items-start gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                <div className="grid gap-6">
                  <Card className="sf-shell rounded-md">
                    <CardHeader>
                      <CardTitle>New payment session</CardTitle>
                      <CardDescription>
                        Create a Dodo checkout that drops directly into the StableFlow ledger.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="customerName">Customer</Label>
                        <Input
                          id="customerName"
                          value={checkoutName}
                          onChange={(event) => setCheckoutName(event.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="customerEmail">Email</Label>
                        <Input
                          id="customerEmail"
                          type="email"
                          value={checkoutEmail}
                          onChange={(event) => setCheckoutEmail(event.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="quantity">Packs</Label>
                        <Input
                          id="quantity"
                          min={1}
                          max={10}
                          type="number"
                          value={quantity}
                          onChange={(event) => setQuantity(Number(event.target.value))}
                        />
                      </div>
                      <Alert>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertTitle>Webhook-ready payment session</AlertTitle>
                        <AlertDescription>
                          Checkout metadata is already tagged with the organization and
                          session IDs needed for reconciliation.
                        </AlertDescription>
                      </Alert>
                      <Button onClick={createCheckout} disabled={previewMode || action !== "idle"}>
                        {action === "checkout" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ExternalLink className="h-4 w-4" />
                        )}
                        Launch checkout
                      </Button>
                      {lastCheckoutUrl ? (
                        <Alert>
                          <CheckCircle2 className="h-4 w-4" />
                          <AlertTitle>Checkout ready</AlertTitle>
                          <AlertDescription className="space-y-2">
                            <p className="break-all">{lastCheckoutUrl}</p>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => copyText(lastCheckoutUrl, "Checkout URL")}
                            >
                              <Copy className="h-4 w-4" />
                              Copy URL
                            </Button>
                          </AlertDescription>
                        </Alert>
                      ) : null}
                    </CardContent>
                  </Card>

                  <Card className="sf-shell rounded-md">
                    <CardHeader>
                      <CardTitle>Session activity</CardTitle>
                      <CardDescription>
                        Recent Dodo sessions created from this workspace.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-[19rem] overflow-y-auto pr-1">
                      <div className="grid gap-2 sf-ledger-card rounded-md border border-slate-200 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium">Session activity</p>
                          <Badge variant="outline">{recentCheckoutSessions.length}</Badge>
                        </div>
                        {recentCheckoutSessions.length > 0 ? (
                          recentCheckoutSessions.map((session) => (
                            <div
                              className="flex items-center justify-between gap-3 sf-ledger-card rounded-md border border-slate-200 p-3"
                              key={session.id}
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                  {session.customerName ?? session.customerEmail ?? "Anonymous checkout"}
                                </p>
                                <p className="truncate text-xs text-slate-500">
                                  {shortValue(session.dodoSessionId, 10, 6)} ·{" "}
                                  {formatDateTime(session.createdAt)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={badgeTone(session.status)}>
                                  {titleCaseStatus(session.status)}
                                </Badge>
                                {session.checkoutUrl ? (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() =>
                                      window.open(session.checkoutUrl, "_blank", "noopener,noreferrer")
                                    }
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                ) : null}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500">
                            No checkout sessions yet. Launch one to create a live Dodo trail.
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="sf-shell rounded-md">
                  <CardHeader>
                    <CardTitle>Payment ledger</CardTitle>
                    <CardDescription>
                      Each payment keeps the customer, Dodo source, amount, and payout state together.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    {recentPayments.length > 0 ? (
                      recentPayments.map((row) => (
                        <div
                          key={row.id}
                          className="sf-ledger-card rounded-md border border-slate-200 p-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium text-white">
                                  {row.customerName ?? "Unknown customer"}
                                </p>
                                <Badge className={badgeTone(row.status)}>
                                  {titleCaseStatus(row.status)}
                                </Badge>
                                {row.payoutRun ? (
                                  <Badge variant="outline">
                                    {titleCaseStatus(row.payoutRun.status)} ·{" "}
                                    {row.payoutRun.confirmedTransfers}/
                                    {row.payoutRun.totalTransfers}
                                  </Badge>
                                ) : null}
                              </div>
                              <p className="mt-1 text-sm text-slate-400">
                                {formatDateTime(row.createdAt)}
                              </p>
                            </div>
                            <p className="text-lg font-semibold text-white">
                              {formatUsd(row.amountCents)}
                            </p>
                          </div>

                          <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                            <div className="grid gap-2 text-sm text-slate-400">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                                  Payment
                                </span>
                                <span className="font-mono text-xs text-slate-300">
                                  {shortValue(row.dodoPaymentId ?? row.id, 10, 6)}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                                  Source
                                </span>
                                <span>
                                  {row.checkoutSessionId
                                    ? shortValue(row.checkoutSessionId, 10, 6)
                                    : "Webhook/manual"}
                                </span>
                              </div>
                            </div>

                            {row.checkoutUrl ? (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                  window.open(row.checkoutUrl ?? "", "_blank", "noopener,noreferrer")
                                }
                              >
                                <ExternalLink className="h-4 w-4" />
                                Open checkout
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="sf-ledger-card flex min-h-[14rem] flex-col items-start justify-center rounded-md border border-slate-200 p-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#96ea63]/10 text-[#96ea63]">
                          <ReceiptText className="h-5 w-5" />
                        </div>
                        <p className="mt-5 text-lg font-medium text-white">No payments recorded yet.</p>
                        <p className="mt-2 max-w-[28rem] text-sm leading-6 text-slate-400">
                          The first successful checkout will appear here with customer, Dodo source, and payout linkage.
                        </p>
                        <Button
                          className="mt-5"
                          variant="secondary"
                          onClick={createCheckout}
                          disabled={previewMode || action !== "idle"}
                        >
                          <BadgeDollarSign className="h-4 w-4" />
                          Launch first checkout
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>
            ) : null}

            {workspaceView === "routing" ? (
              <section className="grid items-start gap-6 xl:grid-cols-[0.78fr_1.22fr]">
                <div className="grid gap-6">
                  <Card className="sf-shell rounded-md">
                    <CardHeader>
                      <CardTitle>Payout policy</CardTitle>
                      <CardDescription>
                        {formatPercent(snapshot.policy?.reservePercent ?? 0)} reserve,{" "}
                        {formatPercent(snapshot.policy?.routedPercent ?? 0)} routed,{" "}
                        {formatPercent(snapshot.policy?.unallocatedPercent ?? 0)} buffer.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span>Routed share</span>
                          <span>{formatPercent(payoutTotal)}</span>
                        </div>
                        <Progress value={payoutTotal} />
                      </div>
                      <div className="sf-ledger-card rounded-md border border-slate-200 p-4">
                        <p className="text-sm font-medium text-slate-900">How the split works</p>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          StableFlow holds a reserve, allocates the routed share across the
                          configured recipients, and preserves any unallocated buffer for
                          later policy changes.
                        </p>
                      </div>
                      {recipients.map((recipient) => (
                        <div
                          className="flex min-w-0 items-center justify-between gap-4 sf-ledger-card rounded-md border border-slate-200 p-3"
                          key={recipient.id}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <Avatar className="h-9 w-9 rounded-md">
                              <AvatarFallback className="rounded-md bg-slate-100">
                                {recipient.name
                                  .split(" ")
                                  .map((part) => part[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate font-medium">{recipient.name}</p>
                              <p className="truncate text-xs text-slate-500">
                                {recipient.role} · {recipient.region}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">{formatPercent(recipient.sharePercent)}</Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="sf-shell rounded-md">
                    <CardHeader>
                      <CardTitle>Recipient book</CardTitle>
                      <CardDescription>
                        The people and systems currently wired to the payout rail.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                      {recipients.map((recipient) => (
                        <div key={recipient.id} className="sf-ledger-card rounded-md border border-slate-200 p-3">
                          <p className="font-medium">{recipient.name}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {recipient.role} · {recipient.region}
                          </p>
                          <p className="mt-2 truncate font-mono text-xs text-slate-600">
                            {shortValue(recipient.walletAddress, 10, 6)}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {recipient.tags.map((tag) => (
                              <Badge key={tag} variant="outline">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <Card className="sf-shell rounded-md">
                  <CardHeader>
                    <CardTitle>Routing templates</CardTitle>
                    <CardDescription>
                      Common payout patterns that fit the same ledger and settlement rail.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      {[
                      {
                        title: "Contractor and vendor splits",
                        detail:
                          "Route one incoming payment across global contributors, vendor obligations, and retained reserve.",
                        icon: Globe2,
                      },
                      {
                        title: "Agentic revenue sharing",
                        detail:
                          "Pay agents, data partners, or usage-based operators without breaking the same payment trail.",
                        icon: Bot,
                      },
                      {
                        title: "Programmable B2B settlement",
                        detail:
                          "Handle invoice releases, milestone disbursements, or escrow-style payout cycles from the same ledger model.",
                        icon: BanknoteArrowUp,
                      },
                    ].map((template) => (
                        <div
                          key={template.title}
                          className="sf-ledger-card rounded-md border border-slate-200 p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                              <template.icon className="h-5 w-5" />
                            </div>
                            <p className="font-medium">{template.title}</p>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-slate-500">{template.detail}</p>
                        </div>
                      ))}
                    </div>

                    <div className="sf-ledger-card rounded-md border border-slate-200 p-4">
                      <p className="text-sm font-medium">Configured examples</p>
                      <div className="mt-3 grid gap-3">
                        {agenticFlows.map((flow) => (
                          <div key={flow.lane} className="sf-ledger-card rounded-md border border-slate-200 p-3">
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-medium">{flow.lane}</p>
                              <Badge variant="outline">{flow.source}</Badge>
                            </div>
                            <p className="mt-2 text-sm text-slate-500">{flow.split}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
            ) : null}

            {workspaceView === "settlement" ? (
              <section className="grid items-start gap-6 xl:grid-cols-[0.72fr_1.28fr]">
                <Card className="sf-shell rounded-md">
                  <CardHeader>
                    <CardTitle>Treasury rail</CardTitle>
                    <CardDescription>
                      The settlement rail is backed by a controlled devnet mint.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <div className="sf-ledger-card rounded-md border border-slate-200 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Asset</p>
                      <p className="mt-2 text-lg font-semibold">{snapshot.asset.name}</p>
                      <p className="text-sm text-slate-500">
                        {snapshot.asset.symbol} · {snapshot.asset.decimals} decimals
                      </p>
                    </div>
                    <div className="sf-ledger-card rounded-md border border-slate-200 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs uppercase tracking-wide text-slate-500">Mint</p>
                          <p className="mt-2 truncate font-mono text-sm text-slate-700">
                            {snapshot.asset.mint ? shortValue(snapshot.asset.mint, 8, 6) : "Unavailable"}
                          </p>
                        </div>
                        {snapshot.asset.mint ? (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => copyText(snapshot.asset.mint ?? "", "Mint address")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>
                    </div>
                    <div className="sf-ledger-card rounded-md border border-slate-200 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Treasury balances
                      </p>
                      <div className="mt-2 grid gap-1 text-sm text-slate-700">
                        <p>{formatAssetAmount(snapshot.asset.treasurySolBalance, "SOL")}</p>
                        <p>
                          {formatAssetAmount(
                            snapshot.asset.treasuryStablecoinBalance,
                            snapshot.asset.symbol,
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="sf-ledger-card rounded-md border border-slate-200 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Recent runs
                      </p>
                      <div className="mt-2 grid gap-2">
                        {recentPayoutRuns.length > 0 ? (
                          recentPayoutRuns.map((run) => (
                            <div className="flex items-center justify-between gap-2" key={run.id}>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                  {run.paymentCustomer ?? shortValue(run.id, 8, 5)}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {run.confirmedTransfers}/{run.totalTransfers} transfers
                                </p>
                              </div>
                              <Badge className={badgeTone(run.status)}>
                                {titleCaseStatus(run.status)}
                              </Badge>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500">No payout runs yet.</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="sf-shell rounded-md">
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <CardTitle>Settlement queue</CardTitle>
                        <CardDescription>
                          Live devnet payouts using the {snapshot.asset.symbol} mint.
                        </CardDescription>
                      </div>
                      <Button onClick={settlePayouts} disabled={action !== "idle"}>
                        {action === "settle" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                        Settle on devnet
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    {latestPayoutRun ? (
                      <>
                        <div className="sf-ledger-card rounded-md border border-slate-200 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-sm text-slate-500">Latest run</p>
                              <p className="mt-1 text-lg font-semibold">
                                {formatStablecoin(
                                  latestPayoutRun.payoutAmountCents,
                                  snapshot.asset.symbol,
                                )}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge className={badgeTone(latestPayoutRun.status)}>
                                {titleCaseStatus(latestPayoutRun.status)}
                              </Badge>
                              <p className="mt-2 text-xs text-slate-500">
                                {latestPayoutRun.payment?.customerName ?? "No payment attached"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-3">
                          {latestPayoutRun.transfers.map((transfer) => (
                            <div
                              key={transfer.id}
                              className="sf-ledger-card rounded-md border border-slate-200 p-4"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-medium text-white">{transfer.recipientName}</p>
                                    <Badge className={badgeTone(transfer.status)}>
                                      {titleCaseStatus(transfer.status)}
                                    </Badge>
                                  </div>
                                  <p className="mt-1 text-sm text-slate-400">
                                    {transfer.region} · {transfer.recipientRole}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-semibold text-white">
                                    {formatStablecoin(transfer.amountCents, transfer.currency)}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    {transfer.confirmedAt
                                      ? formatDateTime(transfer.confirmedAt)
                                      : transfer.sentAt
                                        ? `Sent ${formatDateTime(transfer.sentAt)}`
                                        : "Waiting for signature"}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                                    Wallet
                                  </p>
                                  <p className="mt-1 truncate font-mono text-xs text-slate-300">
                                    {shortValue(transfer.walletAddress, 12, 6)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {transfer.signature ? (
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => copyText(transfer.signature ?? "", "Signature")}
                                    >
                                      <Copy className="h-4 w-4" />
                                      Copy signature
                                    </Button>
                                  ) : null}
                                  {transfer.explorerUrl ? (
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() =>
                                        window.open(
                                          transfer.explorerUrl ?? "",
                                          "_blank",
                                          "noopener,noreferrer",
                                        )
                                      }
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                      Open proof
                                    </Button>
                                  ) : null}
                                </div>
                              </div>

                              {transfer.error ? (
                                <p className="mt-3 text-sm text-amber-200">{transfer.error}</p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <Alert>
                        <Coins className="h-4 w-4" />
                        <AlertTitle>No payout run yet</AlertTitle>
                        <AlertDescription>
                          Load the demo data or reconcile a Dodo payment to populate the
                          settlement queue.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </section>
            ) : null}

            {workspaceView === "audit" ? (
              <section className="grid items-start gap-6 xl:grid-cols-[0.86fr_1.14fr]">
                <Card className="sf-shell rounded-md">
                  <CardHeader>
                    <CardTitle>Activity log</CardTitle>
                    <CardDescription>
                      Operational events that explain how the latest state was created.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid max-h-[36rem] gap-3 overflow-y-auto pr-1">
                    {recentAuditLogs.length > 0 ? (
                      recentAuditLogs.map((item) => (
                        <div
                          className="flex items-start justify-between gap-3 sf-ledger-card rounded-md border border-slate-200 p-3"
                          key={item.id}
                        >
                          <div>
                            <p className="font-medium">{item.action}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              {item.actor} · {item.targetType} · {formatDateTime(item.createdAt)}
                            </p>
                          </div>
                          <Badge variant="outline">{shortValue(item.targetId, 8, 4)}</Badge>
                        </div>
                      ))
                    ) : (
                      <Alert>
                        <FileClock className="h-4 w-4" />
                        <AlertTitle>No audit events yet</AlertTitle>
                        <AlertDescription>
                          Load the demo data or process a Dodo payment to generate a trace.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                <div className="grid gap-6">
                  <Card className="sf-shell rounded-md">
                    <CardHeader>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <CardTitle>Latest payout proof</CardTitle>
                          <CardDescription>
                            The latest payment, payout run, and explorer-backed transfers.
                          </CardDescription>
                        </div>
                        <Badge className={badgeTone(snapshot.readiness.overallStatus)}>
                          {titleCaseStatus(snapshot.readiness.overallStatus)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                        <div className="sf-ledger-card rounded-md border border-slate-200 p-3">
                          <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Payment</p>
                          <p className="mt-2 font-mono text-xs text-slate-700">
                            {recentPayments[0]?.dodoPaymentId ?? "Unavailable"}
                          </p>
                        </div>
                        <div className="sf-ledger-card rounded-md border border-slate-200 p-3">
                          <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Checkout</p>
                          <p className="mt-2 font-mono text-xs text-slate-700">
                            {shortValue(recentCheckoutSessions[0]?.dodoSessionId, 10, 6)}
                          </p>
                        </div>
                        <div className="sf-ledger-card rounded-md border border-slate-200 p-3">
                          <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Stablecoin mint</p>
                          <p className="mt-2 font-mono text-xs text-slate-700">
                            {shortValue(snapshot.asset.mint, 10, 6)}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3">
                        {latestExplorerLinks.length > 0 ? (
                          latestExplorerLinks.map((transfer) => (
                            <a
                              key={transfer.id}
                              href={transfer.explorerUrl ?? "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between gap-3 sf-ledger-card rounded-md border border-slate-200 p-4 transition hover:border-slate-400"
                            >
                              <div className="min-w-0">
                                <p className="truncate font-medium">{transfer.recipientName}</p>
                                <p className="truncate text-sm text-slate-500">
                                  {transfer.region} ·{" "}
                                  {formatStablecoin(transfer.amountCents, transfer.currency)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-500">
                                <span className="font-mono">
                                  {shortValue(transfer.signature, 10, 6)}
                                </span>
                                <ExternalLink className="h-4 w-4" />
                              </div>
                            </a>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500">No explorer links yet.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="sf-shell rounded-md">
                    <CardHeader>
                      <CardTitle>Rail health</CardTitle>
                      <CardDescription>
                        Health indicators for the live revenue-to-settlement rail.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                      {readinessChecks.map((check) => (
                        <div className="sf-ledger-card rounded-md border border-slate-200 p-3" key={check.id}>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-medium">{check.label}</p>
                            <Badge className={badgeTone(check.status)}>
                              {titleCaseStatus(check.status)}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm text-slate-800">{check.value}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-500">{check.detail}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </section>
            ) : null}

            </div>

            {workspaceView !== "overview" ? (
              <aside className="xl:col-start-2 xl:h-fit 2xl:sticky 2xl:top-24">
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] 2xl:grid-cols-1">
                  <div className="sf-shell-strong rounded-[1.15rem] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                          Action queue
                        </p>
                        <p className="mt-2 text-[1.45rem] font-semibold tracking-[-0.04em] text-white">
                          {rightRailStatus}
                        </p>
                      </div>
                      <Badge className={badgeTone(snapshot.readiness.overallStatus)}>
                        {titleCaseStatus(snapshot.readiness.overallStatus)}
                      </Badge>
                    </div>
                    <p className="mt-3 text-[0.88rem] leading-6 text-slate-300">{nextMove}</p>
                    <div className="mt-5 grid gap-3">
                      <div className="sf-rail-panel rounded-[1rem] px-4 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                            Revenue
                          </p>
                          <Badge className="sf-chip hover:bg-white/6">
                            {snapshot.metrics?.successfulPayments ?? 0}
                          </Badge>
                        </div>
                        <p className="mt-2 text-[1.28rem] font-semibold tracking-[-0.03em] text-white">
                          {latestPayment ? "Payment received" : "Awaiting first checkout"}
                        </p>
                        <p className="mt-2 text-[0.84rem] leading-6 text-slate-400">
                          {latestPayment
                            ? `${latestPayment.customerName ?? "Latest customer"} paid ${formatUsd(latestPayment.amountCents)}.`
                            : "Create a checkout to move revenue into the ledger."}
                        </p>
                      </div>
                      <div className="sf-rail-panel rounded-[1rem] px-4 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                            Payout run
                          </p>
                          <Badge className={badgeTone(latestPayoutRun?.status ?? "ATTENTION")}>
                            {latestPayoutRun ? titleCaseStatus(latestPayoutRun.status) : "Waiting"}
                          </Badge>
                        </div>
                        <p className="mt-2 text-[1.28rem] font-semibold tracking-[-0.03em] text-white">
                          {latestPayoutRun ? `${latestPayoutRun.transfers.length} transfers` : "No run yet"}
                        </p>
                        <p className="mt-2 text-[0.84rem] leading-6 text-slate-400">
                          {latestPayoutRun
                            ? "Open Settlements to inspect signatures and queue state."
                            : "The first confirmed payment will open a payout run automatically."}
                        </p>
                      </div>
                      <div className="sf-rail-panel rounded-[1rem] px-4 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                            Treasury
                          </p>
                          <Badge className="sf-chip hover:bg-white/6">{snapshot.asset.symbol}</Badge>
                        </div>
                        <p className="mt-2 text-[1.28rem] font-semibold tracking-[-0.03em] text-white">
                          {formatAssetAmount(snapshot.asset.treasuryStablecoinBalance, snapshot.asset.symbol)}
                        </p>
                        <p className="mt-2 text-[0.84rem] leading-6 text-slate-400">
                          {formatAssetAmount(snapshot.asset.treasurySolBalance, "SOL")} fee buffer
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button variant="secondary" size="sm" onClick={() => setWorkspaceView("revenue")}>
                          Open Payments
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => setWorkspaceView("settlement")}>
                          Open Settlements
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="sf-shell rounded-[1.15rem] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                          Proof rail
                        </p>
                        <p className="mt-2 text-lg font-semibold text-white">Recent signatures</p>
                      </div>
                      <Badge className="sf-chip hover:bg-white/6">
                        {snapshot.metrics?.confirmedTransfers ?? 0}
                      </Badge>
                    </div>
                    <div className="mt-4 grid gap-3">
                      {latestExplorerLinks.length > 0 ? (
                        latestExplorerLinks.map((transfer) => (
                          <button
                            key={transfer.id}
                            type="button"
                            onClick={() =>
                              transfer.explorerUrl
                                ? window.open(transfer.explorerUrl, "_blank", "noopener,noreferrer")
                                : null
                            }
                            className="sf-hover-rise sf-ledger-card flex items-center justify-between gap-3 rounded-[1rem] px-4 py-4 text-left"
                          >
                            <div className="min-w-0">
                              <p className="truncate font-medium text-white">{transfer.recipientName}</p>
                              <p className="mt-1 truncate text-xs text-slate-400">
                                {transfer.region} • {shortValue(transfer.signature, 8, 5)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-white">
                                {formatStablecoin(transfer.amountCents, transfer.currency)}
                              </p>
                              <ExternalLink className="ml-auto mt-2 h-4 w-4 text-slate-500" />
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="sf-ledger-card rounded-[1rem] px-4 py-4 text-sm text-slate-400">
                          Explorer proof will start appearing here once the first payout cycle is settled.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </aside>
            ) : null}

          </>
        ) : null}
      </div>
    </main>
  );
}
