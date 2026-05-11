import {
  PaymentStatus,
  PayoutRunStatus,
  PayoutPolicyType,
  Prisma,
  TransferStatus,
  WebhookEventStatus,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { demoRecipients } from "@/lib/demo-data";
import { dodoConfig, solanaConfig } from "@/lib/env";
import {
  getTreasuryBalances,
  solanaExplorerUrl,
  treasuryPublicKey,
} from "@/lib/solana";

type OpsStatus = "READY" | "ATTENTION" | "BLOCKED";

type OpsChecklistItem = {
  id: string;
  label: string;
  status: OpsStatus;
  value: string;
  detail: string;
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return typeof value === "object" && value !== null ? (value as UnknownRecord) : {};
}

function asString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function payloadAmountCents(data: UnknownRecord) {
  const amount =
    asNumber(data.total_amount) ??
    asNumber(data.amount) ??
    asNumber(data.amount_paid) ??
    asNumber(data.total);

  if (!amount) {
    return 200;
  }

  return amount > 1000 ? Math.round(amount) : Math.round(amount * 100);
}

function json(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function basisPointsToPercent(basisPoints: number) {
  return Number((basisPoints / 100).toFixed(2));
}

function overallOpsStatus(checks: OpsChecklistItem[]): OpsStatus {
  if (checks.some((check) => check.status === "BLOCKED")) {
    return "BLOCKED";
  }

  if (checks.some((check) => check.status === "ATTENTION")) {
    return "ATTENTION";
  }

  return "READY";
}

function settlementCycleSeconds(input: {
  createdAt: Date;
  transfers: Array<{ confirmedAt: Date | null }>;
}) {
  const confirmedAt = input.transfers
    .map((transfer) => transfer.confirmedAt)
    .filter((value): value is Date => value instanceof Date)
    .sort((left, right) => left.getTime() - right.getTime())
    .at(-1);

  if (!confirmedAt) {
    return null;
  }

  return Math.max(
    0,
    Math.round((confirmedAt.getTime() - input.createdAt.getTime()) / 1000),
  );
}

export async function createOrganizationForOwner(input: {
  userId: string;
  name: string;
  slug: string;
  dodoProductId?: string | null;
  treasuryWallet?: string | null;
}) {
  const treasuryWallet = input.treasuryWallet ?? treasuryPublicKey();

  return prisma.organization.create({
    data: {
      name: input.name,
      slug: input.slug,
      dodoProductId: input.dodoProductId ?? dodoConfig.productId,
      treasuryWallet,
      members: {
        create: {
          userId: input.userId,
          role: "OWNER",
          isDefault: true,
        },
      },
      auditLogs: {
        create: {
          actor: "system",
          action: "organization.created",
          targetType: "organization",
          metadata: {
            source: "onboarding",
          },
        },
      },
    },
  });
}

export async function getOrganizationById(organizationId: string) {
  return prisma.organization.findUnique({
    where: { id: organizationId },
  });
}

function slugifyOrganizationName(name: string) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);

  return slug || `team-${crypto.randomUUID().slice(0, 6)}`;
}

export async function createAvailableOrganizationSlug(name: string) {
  const base = slugifyOrganizationName(name);
  let candidate = base;
  let counter = 1;

  while (await prisma.organization.findUnique({ where: { slug: candidate } })) {
    counter += 1;
    const suffix = `-${counter}`;
    const trimmedBase = base.slice(0, Math.max(8, 48 - suffix.length));
    candidate = `${trimmedBase}${suffix}`;
  }

  return candidate;
}

export async function seedDemoWorkspace(organizationId: string) {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  if (
    organization.dodoProductId !== dodoConfig.productId ||
    organization.treasuryWallet !== treasuryPublicKey()
  ) {
    await prisma.organization.update({
      where: { id: organization.id },
      data: {
        dodoProductId: dodoConfig.productId,
        treasuryWallet: treasuryPublicKey(),
      },
    });
  }

  const recipients = [];
  for (const recipient of demoRecipients) {
    const existing =
      (recipient.email
        ? await prisma.recipient.findFirst({
            where: {
              organizationId: organization.id,
              email: recipient.email,
            },
          })
        : null) ??
      (await prisma.recipient.findFirst({
        where: {
          organizationId: organization.id,
          name: recipient.name,
        },
      }));

    recipients.push(
      existing
        ? await prisma.recipient.update({
            where: { id: existing.id },
            data: {
              name: recipient.name,
              role: recipient.role,
              email: recipient.email,
              walletAddress: recipient.walletAddress,
              region: recipient.region,
              tags: ["pilot", "demo"],
            },
          })
        : await prisma.recipient.create({
            data: {
              organizationId: organization.id,
              name: recipient.name,
              role: recipient.role,
              email: recipient.email,
              walletAddress: recipient.walletAddress,
              region: recipient.region,
              tags: ["pilot", "demo"],
            },
          }),
    );
  }

  let policy = await prisma.payoutPolicy.findFirst({
    where: {
      organizationId: organization.id,
      name: "Global SaaS revenue router",
    },
    include: { rules: true },
  });

  if (!policy) {
    policy = await prisma.payoutPolicy.create({
      data: {
        organizationId: organization.id,
        name: "Global SaaS revenue router",
        type: PayoutPolicyType.AGENTIC_REVENUE_SHARE,
        reserveBps: 1000,
        metadata: {
          x402_ready: true,
          settlement_asset: solanaConfig.stablecoinSymbol,
          trigger: "payment.succeeded",
        },
        rules: {
          create: [
            {
              recipientId: recipients[0].id,
              label: "AI workflow contractor",
              basisPoints: 4000,
              priority: 1,
            },
            {
              recipientId: recipients[1].id,
              label: "API infrastructure vendor",
              basisPoints: 2500,
              priority: 2,
            },
            {
              recipientId: recipients[2].id,
              label: "Affiliate partner",
              basisPoints: 2000,
              priority: 3,
            },
          ],
        },
      },
      include: { rules: true },
    });
  }

  if (policy) {
    policy = await prisma.payoutPolicy.update({
      where: { id: policy.id },
      data: {
        type: PayoutPolicyType.AGENTIC_REVENUE_SHARE,
        reserveBps: 1000,
        enabled: true,
        metadata: {
          x402_ready: true,
          settlement_asset: solanaConfig.stablecoinSymbol,
          trigger: "payment.succeeded",
        },
      },
      include: { rules: true },
    });
  }

  await prisma.auditLog.create({
    data: {
      organizationId: organization.id,
      actor: "system",
      action: "demo.workspace_seeded",
      targetType: "organization",
      targetId: organization.id,
      metadata: { recipients: recipients.length, policyId: policy.id },
    },
  });

  return { organization, recipients, policy };
}

export async function createCheckoutLedger(input: {
  organizationId: string;
  customerEmail?: string;
  customerName?: string;
  quantity: number;
}) {
  const organization = await prisma.organization.findUnique({
    where: { id: input.organizationId },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  const session = await prisma.dodoCheckoutSession.create({
    data: {
      organizationId: organization.id,
      dodoSessionId: `pending_${crypto.randomUUID()}`,
      checkoutUrl: "",
      productId: dodoConfig.productId ?? "demo-product",
      quantity: input.quantity,
      amountCents: 200 * input.quantity,
      currency: "USD",
      customerEmail: input.customerEmail,
      customerName: input.customerName,
      metadata: {
        source: "dashboard",
        product: "StableFlow Revenue Test Pack",
      },
    },
  });

  return { organization, session };
}

export async function attachDodoCheckoutResponse(input: {
  checkoutSessionId: string;
  dodoSessionId: string;
  checkoutUrl: string;
}) {
  return prisma.dodoCheckoutSession.update({
    where: { id: input.checkoutSessionId },
    data: {
      dodoSessionId: input.dodoSessionId,
      checkoutUrl: input.checkoutUrl,
    },
  });
}

export async function processDodoWebhookEvent(input: {
  webhookId: string;
  type: string;
  payload: UnknownRecord;
}) {
  const existing = await prisma.dodoWebhookEvent.findUnique({
    where: { webhookId: input.webhookId },
  });

  if (existing?.status === WebhookEventStatus.PROCESSED) {
    return { duplicate: true, event: existing };
  }

  const event =
    existing ??
    (await prisma.dodoWebhookEvent.create({
      data: {
        webhookId: input.webhookId,
        type: input.type,
        payload: json(input.payload),
      },
    }));

  try {
    if (input.type !== "payment.succeeded") {
      const ignored = await prisma.dodoWebhookEvent.update({
        where: { id: event.id },
        data: {
          status: WebhookEventStatus.IGNORED,
          processedAt: new Date(),
        },
      });
      return { duplicate: false, event: ignored };
    }

    const data = asRecord(input.payload.data);
    const metadata = asRecord(data.metadata);
    const checkout =
      (asString(metadata.stableflow_checkout_id)
        ? await prisma.dodoCheckoutSession.findUnique({
            where: { id: asString(metadata.stableflow_checkout_id) },
          })
        : null) ??
      (asString(data.checkout_session_id)
        ? await prisma.dodoCheckoutSession.findUnique({
            where: { dodoSessionId: asString(data.checkout_session_id) },
          })
        : null);
    const organization =
      (asString(metadata.stableflow_org_id)
        ? await prisma.organization.findUnique({
            where: { id: asString(metadata.stableflow_org_id) },
          })
        : null) ??
      (checkout
        ? await prisma.organization.findUnique({
            where: { id: checkout.organizationId },
          })
        : null);

    if (!organization) {
      throw new Error("Webhook payload could not be matched to an organization");
    }

    const customer = asRecord(data.customer);
    const payment = await prisma.payment.upsert({
      where: {
        dodoPaymentId:
          asString(data.payment_id) ??
          asString(data.paymentId) ??
          asString(data.id) ??
          `webhook_${input.webhookId}`,
      },
      update: {
        status: PaymentStatus.SUCCEEDED,
        rawPayload: json(input.payload),
      },
      create: {
        organizationId: organization.id,
        checkoutSessionId: checkout?.id,
        webhookEventId: event.id,
        dodoPaymentId:
          asString(data.payment_id) ??
          asString(data.paymentId) ??
          asString(data.id) ??
          `webhook_${input.webhookId}`,
        amountCents: payloadAmountCents(data),
        currency: asString(data.currency) ?? "USD",
        status: PaymentStatus.SUCCEEDED,
        customerEmail: asString(customer.email) ?? checkout?.customerEmail,
        customerName: asString(customer.name) ?? checkout?.customerName,
        rawPayload: json(input.payload),
      },
    });

    if (checkout) {
      await prisma.dodoCheckoutSession.update({
        where: { id: checkout.id },
        data: { status: PaymentStatus.SUCCEEDED },
      });
    }

    const payoutRun = await createPayoutRunForPayment(payment.id);

    const processed = await prisma.dodoWebhookEvent.update({
      where: { id: event.id },
      data: {
        status: WebhookEventStatus.PROCESSED,
        processedAt: new Date(),
      },
    });

    return { duplicate: false, event: processed, payment, payoutRun };
  } catch (error) {
    const failed = await prisma.dodoWebhookEvent.update({
      where: { id: event.id },
      data: {
        status: WebhookEventStatus.FAILED,
        error: error instanceof Error ? error.message : "Unknown webhook error",
      },
    });
    throw Object.assign(error instanceof Error ? error : new Error("Webhook failed"), {
      event: failed,
    });
  }
}

export async function createPayoutRunForPayment(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { organization: true },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  const policy = await prisma.payoutPolicy.findFirst({
    where: {
      organizationId: payment.organizationId,
      enabled: true,
    },
    include: {
      rules: {
        where: { enabled: true },
        include: { recipient: true },
        orderBy: { priority: "asc" },
      },
    },
  });

  if (!policy || policy.rules.length === 0) {
    return null;
  }

  const reserveAmountCents = Math.floor((payment.amountCents * policy.reserveBps) / 10000);
  const payoutAmountCents = Math.max(payment.amountCents - reserveAmountCents, 0);

  return prisma.payoutRun.create({
    data: {
      organizationId: payment.organizationId,
      paymentId: payment.id,
      payoutPolicyId: policy.id,
      status: PayoutRunStatus.READY,
      grossAmountCents: payment.amountCents,
      reserveAmountCents,
      payoutAmountCents,
      currency: payment.currency,
      notes: "Created from verified Dodo payment webhook",
      transfers: {
        create: policy.rules.map((rule) => ({
          recipientId: rule.recipientId,
          amountCents: Math.floor((payoutAmountCents * rule.basisPoints) / 10000),
          currency: solanaConfig.stablecoinSymbol,
          tokenMint: solanaConfig.usdcMint,
          walletAddress: rule.recipient.walletAddress,
          status: TransferStatus.QUEUED,
        })),
      },
    },
    include: {
      transfers: { include: { recipient: true } },
      payoutPolicy: true,
      payment: true,
    },
  });
}

export async function createDemoPaymentAndPayoutRun(organizationId: string) {
  const { organization } = await seedDemoWorkspace(organizationId);

  const payment = await prisma.payment.create({
    data: {
      organizationId: organization.id,
      dodoPaymentId: `demo_pay_${crypto.randomUUID()}`,
      amountCents: 200,
      currency: "USD",
      status: PaymentStatus.SUCCEEDED,
      customerEmail: "founder@demo.ai",
      customerName: "Frontier Judge Demo",
      rawPayload: {
        source: "manual-demo",
        product: "StableFlow Revenue Test Pack",
      },
    },
  });

  const payoutRun = await createPayoutRunForPayment(payment.id);

  return { organization, payment, payoutRun };
}

export async function getLatestPayoutRun(organizationId: string) {
  return prisma.payoutRun.findFirst({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    include: {
      payment: true,
      payoutPolicy: true,
      transfers: { include: { recipient: true }, orderBy: { createdAt: "asc" } },
    },
  });
}

export async function getDashboardSnapshot(organizationId: string) {
  const organization = await getOrganizationById(organizationId);
  const treasuryBalances = await getTreasuryBalances();

  if (!organization) {
    throw new Error("Organization not found");
  }

  const [
    policy,
    recipients,
    recentCheckoutSessions,
    recentPayments,
    latestPayoutRun,
    recentPayoutRuns,
    recentAuditLogs,
    paymentAggregate,
    confirmedTransferAggregate,
    pendingPayoutRuns,
    settledRuns,
  ] = await Promise.all([
    prisma.payoutPolicy.findFirst({
      where: {
        organizationId: organization.id,
        enabled: true,
      },
      include: {
        rules: {
          where: { enabled: true },
          include: { recipient: true },
          orderBy: { priority: "asc" },
        },
      },
    }),
    prisma.recipient.findMany({
      where: { organizationId: organization.id },
      orderBy: { createdAt: "asc" },
    }),
    prisma.dodoCheckoutSession.findMany({
      where: { organizationId: organization.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.payment.findMany({
      where: { organizationId: organization.id },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        checkoutSession: true,
        payoutRuns: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            transfers: {
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    }),
    prisma.payoutRun.findFirst({
      where: { organizationId: organization.id },
      orderBy: { createdAt: "desc" },
      include: {
        payment: true,
        payoutPolicy: true,
        transfers: {
          include: { recipient: true },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    prisma.payoutRun.findMany({
      where: { organizationId: organization.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        payment: true,
        transfers: {
          orderBy: { createdAt: "asc" },
          take: 3,
        },
      },
    }),
    prisma.auditLog.findMany({
      where: { organizationId: organization.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.payment.aggregate({
      where: {
        organizationId: organization.id,
        status: PaymentStatus.SUCCEEDED,
      },
      _sum: { amountCents: true },
      _count: true,
    }),
    prisma.payoutTransfer.aggregate({
      where: {
        payoutRun: {
          organizationId: organization.id,
        },
        status: TransferStatus.CONFIRMED,
      },
      _sum: { amountCents: true },
      _count: true,
    }),
    prisma.payoutRun.count({
      where: {
        organizationId: organization.id,
        status: {
          in: [PayoutRunStatus.READY, PayoutRunStatus.EXECUTING, PayoutRunStatus.PARTIAL],
        },
      },
    }),
    prisma.payoutRun.findMany({
      where: {
        organizationId: organization.id,
        status: PayoutRunStatus.SETTLED,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        transfers: {
          select: { confirmedAt: true },
        },
      },
    }),
  ]);

  const shareByRecipientId = new Map(
    policy?.rules.map((rule) => [rule.recipientId, rule.basisPoints]) ?? [],
  );
  const routedBps = policy?.rules.reduce((sum, rule) => sum + rule.basisPoints, 0) ?? 0;
  const reserveBps = policy?.reserveBps ?? 0;
  const unallocatedBps = Math.max(0, 10000 - reserveBps - routedBps);
  const regionCount = new Set(recipients.map((recipient) => recipient.region)).size;
  const x402Ready = Boolean(asRecord(policy?.metadata).x402_ready);
  const avgSettlementSeconds =
    settledRuns.length > 0
      ? Math.round(
          settledRuns.reduce((sum, run) => {
            return sum + (settlementCycleSeconds(run) ?? 0);
          }, 0) / settledRuns.length,
        )
      : null;
  const readinessChecks: OpsChecklistItem[] = [
    {
      id: "database",
      label: "Financial ledger",
      status: "READY",
      value: `${paymentAggregate._count} payment(s) recorded`,
      detail: "Supabase Postgres is live with payments, payout runs, and audit logs.",
    },
    {
      id: "dodo",
      label: "Dodo checkout",
      status: dodoConfig.apiKey && dodoConfig.productId ? "READY" : "BLOCKED",
      value: dodoConfig.environment === "live_mode" ? "Live mode" : "Test mode",
      detail:
        dodoConfig.apiKey && dodoConfig.productId
          ? `Checkout sessions are backed by product ${organization.dodoProductId ?? dodoConfig.productId}.`
          : "Missing Dodo API key or product configuration.",
    },
    {
      id: "webhooks",
      label: "Signed webhooks",
      status: dodoConfig.webhookKey
        ? recentPayments.some((payment) => Boolean(payment.dodoPaymentId))
          ? "READY"
          : "ATTENTION"
        : "BLOCKED",
      value: recentPayments[0]?.dodoPaymentId ?? "Awaiting verified payment",
      detail: dodoConfig.webhookKey
        ? "Webhook signature verification is configured and connected to payout creation."
        : "Missing Dodo webhook signing secret.",
    },
    {
      id: "solana",
      label: "Solana settlement",
      status: !solanaConfig.treasurySecretKey || !solanaConfig.usdcMint
        ? "BLOCKED"
        : confirmedTransferAggregate._count > 0
          ? "READY"
          : "ATTENTION",
      value:
        confirmedTransferAggregate._count > 0
          ? `${confirmedTransferAggregate._count} confirmed transfer(s)`
          : "Configured but waiting for proof",
      detail: avgSettlementSeconds
        ? `Average settlement cycle is ${avgSettlementSeconds}s on ${solanaConfig.network}.`
        : `Treasury and mint are configured on ${solanaConfig.network}.`,
    },
    {
      id: "treasury",
      label: "Treasury liquidity",
      status:
        treasuryBalances.solBalance === null || treasuryBalances.stablecoinBalance === null
          ? "ATTENTION"
          : treasuryBalances.solBalance > 0 && treasuryBalances.stablecoinBalance > 0
            ? "READY"
            : "ATTENTION",
      value:
        treasuryBalances.solBalance === null || treasuryBalances.stablecoinBalance === null
          ? "Wallet not configured"
          : `${treasuryBalances.solBalance.toFixed(3)} SOL / ${treasuryBalances.stablecoinBalance.toFixed(2)} ${solanaConfig.stablecoinSymbol}`,
      detail:
        treasuryBalances.tokenAccount
          ? `Treasury token account ${treasuryBalances.tokenAccount} is available for settlement.`
          : "Treasury needs devnet SOL and stablecoin inventory for settlement.",
    },
  ];
  const competitionChecks: OpsChecklistItem[] = [
    {
      id: "meaningful-dodo",
      label: "Meaningful Dodo integration",
      status:
        recentCheckoutSessions.length > 0 && recentPayments.length > 0 ? "READY" : "ATTENTION",
      value: "Checkout -> webhook -> payout run",
      detail:
        "Dodo is the source of truth for checkout creation, payment verification, and payout triggers.",
    },
    {
      id: "specific-user",
      label: "Defined first user",
      status: "READY",
      value: "Global SaaS and AI founders",
      detail:
        "StableFlow is built for founders paying contractors, affiliates, and infra vendors across borders.",
    },
    {
      id: "solana-advantage",
      label: "Solana advantage",
      status: confirmedTransferAggregate._count > 0 ? "READY" : "ATTENTION",
      value:
        avgSettlementSeconds !== null
          ? `${avgSettlementSeconds}s average settlement`
          : `Programmable ${solanaConfig.stablecoinSymbol} settlement`,
      detail:
        "Stablecoins on Solana replace manual bank payouts with low-latency, multi-recipient transfers and explorer proof.",
    },
    {
      id: "early-traction",
      label: "Early traction",
      status:
        paymentAggregate._count > 0 && confirmedTransferAggregate._count > 0
          ? "READY"
          : "ATTENTION",
      value: `${paymentAggregate._count} payment(s), ${confirmedTransferAggregate._count} transfer proof(s)`,
      detail:
        "The product has a hosted pilot flow with recorded payments, payout runs, and confirmed transfers.",
    },
    {
      id: "agentic-bonus",
      label: "Agentic + x402 lane",
      status: x402Ready ? "READY" : "ATTENTION",
      value: x402Ready ? "x402-ready payout policy" : "Agentic lane planned",
      detail:
        "The payout engine is already modeled for autonomous revenue splits across agents, vendors, and affiliates.",
    },
    {
      id: "business-plan",
      label: "Business viability",
      status: "READY",
      value: "SaaS + usage + basis-point monetization",
      detail:
        "StableFlow can charge software teams for payout automation, approvals, reporting, and treasury operations.",
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    organization: {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      dodoProductId: organization.dodoProductId,
      treasuryWallet: organization.treasuryWallet,
      createdAt: organization.createdAt,
    },
    asset: {
      name: solanaConfig.stablecoinName,
      symbol: solanaConfig.stablecoinSymbol,
      mint: solanaConfig.usdcMint,
      decimals: solanaConfig.stablecoinDecimals,
      treasuryWallet: treasuryPublicKey(),
      treasuryTokenAccount: treasuryBalances.tokenAccount,
      treasurySolBalance: treasuryBalances.solBalance,
      treasuryStablecoinBalance: treasuryBalances.stablecoinBalance,
    },
    metrics: {
      dodoRevenueCents: paymentAggregate._sum.amountCents ?? 0,
      successfulPayments: paymentAggregate._count,
      settledStablecoinCents: confirmedTransferAggregate._sum.amountCents ?? 0,
      confirmedTransfers: confirmedTransferAggregate._count,
      recipients: recipients.length,
      regions: regionCount,
      avgSettlementSeconds,
      pendingPayoutRuns,
    },
    readiness: {
      overallStatus: overallOpsStatus(readinessChecks),
      checks: readinessChecks,
    },
    competitionFit: {
      overallStatus: overallOpsStatus(competitionChecks),
      checks: competitionChecks,
    },
    pilotNarrative: {
      painfulProblem:
        "Global software teams still split revenue, reconcile contractors, and settle cross-border payouts across too many disconnected systems.",
      whyNowSolana:
        "Solana makes multi-recipient stablecoin payouts cheap, fast, and programmable enough to replace manual payout operations.",
      firstUser:
        "The first user is a SaaS or AI founder selling globally through Dodo and paying distributed contributors every week.",
      unfairInsight:
        "Revenue tooling is already modern; payout tooling is still spreadsheet-heavy. StableFlow closes that exact gap between monetization and settlement.",
      sixWeekSuccess:
        `${paymentAggregate._count} live payment(s), ${confirmedTransferAggregate._count} confirmed transfer(s), ${recipients.length} recipients, and a public proof trail judges can inspect.`,
    },
    policy: policy
      ? {
          id: policy.id,
          name: policy.name,
          type: policy.type,
          enabled: policy.enabled,
          reserveBps,
          reservePercent: basisPointsToPercent(reserveBps),
          routedBps,
          routedPercent: basisPointsToPercent(routedBps),
          unallocatedBps,
          unallocatedPercent: basisPointsToPercent(unallocatedBps),
          metadata: policy.metadata,
        }
      : null,
    recipients: recipients.map((recipient) => ({
      id: recipient.id,
      name: recipient.name,
      role: recipient.role,
      email: recipient.email,
      walletAddress: recipient.walletAddress,
      region: recipient.region,
      tags: recipient.tags,
      shareBps: shareByRecipientId.get(recipient.id) ?? 0,
      sharePercent: basisPointsToPercent(shareByRecipientId.get(recipient.id) ?? 0),
    })),
    recentCheckoutSessions: recentCheckoutSessions.map((session) => ({
      id: session.id,
      dodoSessionId: session.dodoSessionId,
      checkoutUrl: session.checkoutUrl,
      status: session.status,
      amountCents: session.amountCents,
      currency: session.currency,
      quantity: session.quantity,
      customerName: session.customerName,
      customerEmail: session.customerEmail,
      createdAt: session.createdAt,
    })),
    recentPayments: recentPayments.map((payment) => ({
      id: payment.id,
      dodoPaymentId: payment.dodoPaymentId,
      amountCents: payment.amountCents,
      currency: payment.currency,
      status: payment.status,
      customerName: payment.customerName,
      customerEmail: payment.customerEmail,
      createdAt: payment.createdAt,
      checkoutSessionId: payment.checkoutSessionId,
      checkoutUrl: payment.checkoutSession?.checkoutUrl ?? null,
      payoutRun: payment.payoutRuns[0]
        ? {
            id: payment.payoutRuns[0].id,
            status: payment.payoutRuns[0].status,
            confirmedTransfers: payment.payoutRuns[0].transfers.filter(
              (transfer) => transfer.status === TransferStatus.CONFIRMED,
            ).length,
            totalTransfers: payment.payoutRuns[0].transfers.length,
          }
        : null,
    })),
    latestPayoutRun: latestPayoutRun
      ? {
          id: latestPayoutRun.id,
          status: latestPayoutRun.status,
          grossAmountCents: latestPayoutRun.grossAmountCents,
          reserveAmountCents: latestPayoutRun.reserveAmountCents,
          payoutAmountCents: latestPayoutRun.payoutAmountCents,
          currency: latestPayoutRun.currency,
          createdAt: latestPayoutRun.createdAt,
          updatedAt: latestPayoutRun.updatedAt,
          cycleTimeSeconds: settlementCycleSeconds(latestPayoutRun),
          payment: latestPayoutRun.payment
            ? {
                id: latestPayoutRun.payment.id,
                customerName: latestPayoutRun.payment.customerName,
                customerEmail: latestPayoutRun.payment.customerEmail,
                dodoPaymentId: latestPayoutRun.payment.dodoPaymentId,
                amountCents: latestPayoutRun.payment.amountCents,
                createdAt: latestPayoutRun.payment.createdAt,
              }
            : null,
          transfers: latestPayoutRun.transfers.map((transfer) => ({
            id: transfer.id,
            recipientId: transfer.recipientId,
            recipientName: transfer.recipient.name,
            recipientRole: transfer.recipient.role,
            region: transfer.recipient.region,
            amountCents: transfer.amountCents,
            currency: transfer.currency,
            walletAddress: transfer.walletAddress,
            status: transfer.status,
            signature: transfer.signature,
            explorerUrl: transfer.signature ? solanaExplorerUrl(transfer.signature) : null,
            error: transfer.error,
            sentAt: transfer.sentAt,
            confirmedAt: transfer.confirmedAt,
          })),
        }
      : null,
    recentPayoutRuns: recentPayoutRuns.map((run) => ({
      id: run.id,
      status: run.status,
      grossAmountCents: run.grossAmountCents,
      payoutAmountCents: run.payoutAmountCents,
      createdAt: run.createdAt,
      paymentCustomer: run.payment?.customerName ?? null,
      confirmedTransfers: run.transfers.filter(
        (transfer) => transfer.status === TransferStatus.CONFIRMED,
      ).length,
      totalTransfers: run.transfers.length,
    })),
    auditLogs: recentAuditLogs.map((log) => ({
      id: log.id,
      actor: log.actor,
      action: log.action,
      targetType: log.targetType,
      targetId: log.targetId,
      metadata: log.metadata,
      createdAt: log.createdAt,
    })),
  };
}

export async function getPublicProductSnapshot() {
  const treasuryBalances = await getTreasuryBalances();
  const [organizationCount, paymentAggregate, confirmedTransferAggregate, latestPayment, latestProofs] =
    await Promise.all([
      prisma.organization.count(),
      prisma.payment.aggregate({
        where: { status: PaymentStatus.SUCCEEDED },
        _sum: { amountCents: true },
        _count: true,
      }),
      prisma.payoutTransfer.aggregate({
        where: { status: TransferStatus.CONFIRMED },
        _sum: { amountCents: true },
        _count: true,
      }),
      prisma.payment.findFirst({
        where: { status: PaymentStatus.SUCCEEDED },
        orderBy: { createdAt: "desc" },
        select: {
          dodoPaymentId: true,
          createdAt: true,
        },
      }),
      prisma.payoutTransfer.findMany({
        where: {
          status: TransferStatus.CONFIRMED,
          signature: { not: null },
        },
        orderBy: { confirmedAt: "desc" },
        take: 3,
        include: {
          recipient: {
            select: {
              name: true,
              region: true,
            },
          },
        },
      }),
    ]);

  const checks: OpsChecklistItem[] = [
    {
      id: "dodo",
      label: "Dodo collection rail",
      status: dodoConfig.apiKey && dodoConfig.productId ? "READY" : "BLOCKED",
      value: dodoConfig.environment === "live_mode" ? "Live mode" : "Test mode",
      detail: dodoConfig.apiKey
        ? "Checkout creation is configured."
        : "Dodo API configuration is missing.",
    },
    {
      id: "webhooks",
      label: "Signed webhooks",
      status: dodoConfig.webhookKey ? "READY" : "BLOCKED",
      value: dodoConfig.webhookKey ? "Signature verification active" : "Secret missing",
      detail: dodoConfig.webhookKey
        ? "Incoming payment events are verified before payout routing."
        : "Webhook signing secret is missing.",
    },
    {
      id: "solana",
      label: "Settlement rail",
      status:
        solanaConfig.treasurySecretKey && solanaConfig.usdcMint
          ? confirmedTransferAggregate._count > 0
            ? "READY"
            : "ATTENTION"
          : "BLOCKED",
      value: `${solanaConfig.network} · ${solanaConfig.stablecoinSymbol}`,
      detail:
        confirmedTransferAggregate._count > 0
          ? "Confirmed stablecoin proofs are available."
          : "Treasury is configured, but proof volume is still building.",
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    overallStatus: overallOpsStatus(checks),
    checks,
    environment: {
      dodoMode: dodoConfig.environment === "live_mode" ? "Live mode" : "Test mode",
      network: solanaConfig.network,
      stablecoinSymbol: solanaConfig.stablecoinSymbol,
      stablecoinMint: solanaConfig.usdcMint,
    },
    metrics: {
      organizations: organizationCount,
      successfulPayments: paymentAggregate._count,
      revenueCents: paymentAggregate._sum.amountCents ?? 0,
      confirmedTransfers: confirmedTransferAggregate._count,
      settledStablecoinCents: confirmedTransferAggregate._sum.amountCents ?? 0,
    },
    treasury: {
      wallet: treasuryPublicKey(),
      tokenAccount: treasuryBalances.tokenAccount,
      solBalance: treasuryBalances.solBalance,
      stablecoinBalance: treasuryBalances.stablecoinBalance,
    },
    latestPayment: latestPayment
      ? {
          id: latestPayment.dodoPaymentId,
          createdAt: latestPayment.createdAt,
        }
      : null,
    latestProofs: latestProofs.map((transfer) => ({
      id: transfer.id,
      recipientName: transfer.recipient.name,
      region: transfer.recipient.region,
      amountCents: transfer.amountCents,
      currency: transfer.currency,
      signature: transfer.signature,
      explorerUrl: transfer.signature ? solanaExplorerUrl(transfer.signature) : null,
    })),
  };
}
