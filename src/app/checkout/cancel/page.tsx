import Link from "next/link";
import { CircleArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function CheckoutCancelPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <section className="mx-auto flex max-w-xl flex-col items-start gap-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-amber-100 text-amber-700">
          <CircleArrowLeft className="h-6 w-6" />
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">Checkout canceled</h1>
          <p className="text-muted-foreground">
            No payout run was created. You can launch another Dodo checkout from the dashboard.
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/workspace">Back to workspace</Link>
        </Button>
      </section>
    </main>
  );
}
