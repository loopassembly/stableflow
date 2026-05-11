import { NextResponse } from "next/server";
import { z } from "zod";

import { AuthError, requireApiWorkspaceContext } from "@/lib/auth";
import {
  attachDodoCheckoutResponse,
  createCheckoutLedger,
} from "@/lib/ledger";
import { createDodoCheckoutSession } from "@/lib/dodo";

export const runtime = "nodejs";

const checkoutSchema = z.object({
  customerEmail: z.email().optional().or(z.literal("")),
  customerName: z.string().min(2).max(80).optional().or(z.literal("")),
  quantity: z.number().int().min(1).max(10).default(1),
});

export async function POST(request: Request) {
  try {
    const viewer = await requireApiWorkspaceContext();
    const parsed = checkoutSchema.parse(await request.json());
    const { organization, session } = await createCheckoutLedger({
      organizationId: viewer.membership.organization.id,
      customerEmail: parsed.customerEmail || undefined,
      customerName: parsed.customerName || undefined,
      quantity: parsed.quantity,
    });

    const dodoSession = await createDodoCheckoutSession({
      organizationId: organization.id,
      checkoutSessionId: session.id,
      customerEmail: parsed.customerEmail || undefined,
      customerName: parsed.customerName || undefined,
      quantity: parsed.quantity,
    });

    const updatedSession = await attachDodoCheckoutResponse({
      checkoutSessionId: session.id,
      dodoSessionId: dodoSession.session_id,
      checkoutUrl: dodoSession.checkout_url ?? "",
    });

    return NextResponse.json({
      ok: true,
      checkoutUrl: updatedSession.checkoutUrl,
      dodoSessionId: updatedSession.dodoSessionId,
      stableflowSessionId: updatedSession.id,
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
        error: error instanceof Error ? error.message : "Checkout failed",
      },
      { status: 400 },
    );
  }
}
