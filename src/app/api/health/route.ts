import { NextResponse } from "next/server";

import { getPublicProductSnapshot } from "@/lib/ledger";

export const runtime = "nodejs";

export async function GET() {
  try {
    const snapshot = await getPublicProductSnapshot();
    const status = snapshot.overallStatus;
    const ok = status !== "BLOCKED";

    return NextResponse.json(
      {
        ok,
        status,
        generatedAt: snapshot.generatedAt,
        checks: snapshot.checks.map((check) => ({
          id: check.id,
          label: check.label,
          status: check.status,
          value: check.value,
        })),
        metrics: snapshot.metrics,
        environment: snapshot.environment,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
        status: ok ? 200 : 503,
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        status: "BLOCKED",
        error: error instanceof Error ? error.message : "Health check failed",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
        status: 503,
      },
    );
  }
}
