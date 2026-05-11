import { Webhook } from "standardwebhooks";
import { NextResponse } from "next/server";

import { dodoConfig } from "@/lib/env";
import { processDodoWebhookEvent } from "@/lib/ledger";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rawPayload = await request.text();
  const webhookId = request.headers.get("webhook-id");
  const webhookSignature = request.headers.get("webhook-signature");
  const webhookTimestamp = request.headers.get("webhook-timestamp");

  if (!webhookId || !webhookSignature || !webhookTimestamp) {
    return NextResponse.json(
      { ok: false, error: "Missing Dodo webhook headers" },
      { status: 400 },
    );
  }

  if (!dodoConfig.webhookKey) {
    return NextResponse.json(
      { ok: false, error: "Missing DODO_PAYMENTS_WEBHOOK_KEY" },
      { status: 500 },
    );
  }

  try {
    const webhook = new Webhook(dodoConfig.webhookKey);
    await webhook.verify(rawPayload, {
      "webhook-id": webhookId,
      "webhook-signature": webhookSignature,
      "webhook-timestamp": webhookTimestamp,
    });

    const payload = JSON.parse(rawPayload) as Record<string, unknown>;
    const type = typeof payload.type === "string" ? payload.type : "unknown";
    const result = await processDodoWebhookEvent({ webhookId, type, payload });

    return NextResponse.json({
      ok: true,
      duplicate: result.duplicate,
      status: result.event.status,
      paymentId: result.payment?.id,
      payoutRunId: result.payoutRun?.id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Invalid webhook",
      },
      { status: 400 },
    );
  }
}
