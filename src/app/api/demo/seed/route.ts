import { NextResponse } from "next/server";

import { AuthError, requireApiWorkspaceContext } from "@/lib/auth";
import { createDemoPaymentAndPayoutRun, seedDemoWorkspace } from "@/lib/ledger";

export const runtime = "nodejs";

export async function POST() {
  try {
    const viewer = await requireApiWorkspaceContext();
    const organizationId = viewer.membership.organization.id;
    const seeded = await seedDemoWorkspace(organizationId);
    const demo = await createDemoPaymentAndPayoutRun(organizationId);

    return NextResponse.json({
      ok: true,
      organizationId: seeded.organization.id,
      recipients: seeded.recipients.length,
      policyId: seeded.policy.id,
      paymentId: demo.payment.id,
      payoutRunId: demo.payoutRun?.id,
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
        error: error instanceof Error ? error.message : "Demo seed failed",
      },
      { status: 500 },
    );
  }
}
