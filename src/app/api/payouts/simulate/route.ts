import { NextResponse } from "next/server";

import {
  createDemoPaymentAndPayoutRun,
  getLatestPayoutRun,
} from "@/lib/ledger";
import { prisma } from "@/lib/db";
import { executeStablecoinTransfer } from "@/lib/solana";
import { PayoutRunStatus, TransferStatus } from "@/generated/prisma/client";
import { AuthError, requireApiWorkspaceContext } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  try {
    const viewer = await requireApiWorkspaceContext();
    const organizationId = viewer.membership.organization.id;
    let payoutRun = await getLatestPayoutRun(organizationId);

    if (!payoutRun) {
      const demo = await createDemoPaymentAndPayoutRun(organizationId);
      payoutRun = demo.payoutRun;
    }

    if (!payoutRun) {
      throw new Error("No payout run is available");
    }

    await prisma.payoutRun.update({
      where: { id: payoutRun.id },
      data: { status: PayoutRunStatus.EXECUTING },
    });

    const settledTransfers = [];
    const failedTransfers = [];

    for (const transfer of payoutRun.transfers) {
      try {
        const settlement = await executeStablecoinTransfer({
          recipientWallet: transfer.walletAddress,
          amountCents: transfer.amountCents,
        });

        settledTransfers.push(
          await prisma.payoutTransfer.update({
            where: { id: transfer.id },
            data: {
              tokenMint: settlement.tokenMint,
              signature: settlement.signature,
              status: settlement.simulated ? TransferStatus.SIMULATED : TransferStatus.CONFIRMED,
              error: null,
              sentAt: new Date(),
              confirmedAt: new Date(),
            },
            include: { recipient: true },
          }),
        );
      } catch (error) {
        failedTransfers.push(
          await prisma.payoutTransfer.update({
            where: { id: transfer.id },
            data: {
              status: TransferStatus.FAILED,
              error: error instanceof Error ? error.message : "Unknown Solana transfer error",
            },
            include: { recipient: true },
          }),
        );
      }
    }

    const updatedRun = await prisma.payoutRun.update({
      where: { id: payoutRun.id },
      data: {
        status:
          failedTransfers.length > 0 && settledTransfers.length === 0
            ? PayoutRunStatus.FAILED
            : failedTransfers.length > 0
              ? PayoutRunStatus.PARTIAL
              : settledTransfers.every((transfer) => transfer.status === TransferStatus.CONFIRMED)
                ? PayoutRunStatus.SETTLED
                : PayoutRunStatus.SIMULATED,
      },
      include: {
        payment: true,
        payoutPolicy: true,
        transfers: { include: { recipient: true } },
      },
    });

    return NextResponse.json({
      ok: true,
      payoutRun: updatedRun,
      settledTransfers: settledTransfers.length,
      failedTransfers: failedTransfers.length,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        {
          ok: false,
          code: error.code,
          error: error.message,
        },
        { status: error.status },
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Settlement failed",
      },
      { status: 500 },
    );
  }
}
