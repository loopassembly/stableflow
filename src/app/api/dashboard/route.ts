import { NextResponse } from "next/server";

import { AuthError, requireApiWorkspaceContext } from "@/lib/auth";
import { getDashboardSnapshot } from "@/lib/ledger";

export const runtime = "nodejs";

export async function GET() {
  try {
    const viewer = await requireApiWorkspaceContext();
    const snapshot = await getDashboardSnapshot(viewer.membership.organization.id);

    return NextResponse.json({
      ok: true,
      snapshot,
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
        error: error instanceof Error ? error.message : "Could not load dashboard",
      },
      { status: 500 },
    );
  }
}
