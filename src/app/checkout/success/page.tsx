import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { demoStablecoin } from "@/lib/demo-data";

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <section className="mx-auto flex max-w-xl flex-col items-start gap-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">Payment confirmed</h1>
          <p className="text-muted-foreground">
            StableFlow is ready to reconcile the Dodo payment and queue the{" "}
            {demoStablecoin.symbol} payout run.
          </p>
        </div>
        <Button asChild>
          <Link href="/workspace">Back to workspace</Link>
        </Button>
      </section>
    </main>
  );
}
