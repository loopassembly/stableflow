import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeCheck, Building2, Coins, Route, ShieldCheck } from "lucide-react";

import { createWorkspaceAction } from "@/app/welcome/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireViewerContext } from "@/lib/auth";

function guessWorkspaceName(email: string) {
  const domain = email.split("@")[1] ?? "";
  const company = domain.split(".")[0] ?? "";

  if (!company) {
    return "";
  }

  return company
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [viewer, params] = await Promise.all([
    requireViewerContext({ next: "/welcome" }),
    searchParams,
  ]);

  if (viewer.membership) {
    redirect("/workspace");
  }

  const suggestedName = guessWorkspaceName(viewer.appUser.email);

  return (
    <main className="sf-page min-h-screen text-foreground">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-5 py-5 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-8">
        <section className="sf-shell-strong rounded-md px-6 py-8 lg:px-8 lg:py-9">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="border border-emerald-400/20 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/10">
              Workspace setup
            </Badge>
            <Badge className="sf-chip hover:bg-white/6">Protected operator flow</Badge>
          </div>

          <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-tight text-balance sm:text-5xl">
            Create the operating workspace behind your payout flow.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            We&apos;ll create an organization for your team, provision the current sandbox rails,
            and drop you into a workspace where payments, routing, and settlement already
            connect end to end.
          </p>

          <div className="mt-10 grid gap-3">
            {[
              {
                icon: ShieldCheck,
                title: "Protected workspace",
                detail:
                  "Only signed-in members can access the operator workspace and its financial trail.",
              },
              {
                icon: Route,
                title: "Starter routing model",
                detail:
                  "StableFlow provisions a baseline payout policy so the sandbox flow is understandable on first load.",
              },
              {
                icon: Coins,
                title: "Live sandbox rails",
                detail:
                  "The workspace is backed by Dodo test mode and Solana devnet, so the product stays safe while still proving the flow.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="sf-shell-soft rounded-md px-4 py-4"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/8 text-[#7dffd3]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="mt-1 text-sm leading-7 text-slate-300">{item.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-start">
          <div className="w-full">
            <Card className="sf-shell rounded-md border-0 shadow-none">
              <CardHeader className="pb-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle>Create your first workspace</CardTitle>
                    <CardDescription className="mt-1 max-w-lg leading-7">
                      This creates your organization, assigns you as the owner, and seeds the
                      workspace with a safe starter operating model.
                    </CardDescription>
                  </div>
                  <div className="hidden rounded-md border border-white/10 bg-white/5 px-4 py-3 text-right sm:block">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-400">
                      Signed in as
                    </p>
                    <p className="mt-1 font-medium text-white">
                      {viewer.appUser.fullName ?? "Workspace owner"}
                    </p>
                    <p className="text-sm text-slate-400">{viewer.appUser.email}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-6">
                {params.error ? (
                  <Alert>
                    <AlertTitle>We couldn&apos;t create the workspace yet</AlertTitle>
                    <AlertDescription>{params.error}</AlertDescription>
                  </Alert>
                ) : null}

                <form action={createWorkspaceAction} className="grid gap-5">
                  <div className="grid gap-2">
                    <Label htmlFor="organizationName">Workspace or company name</Label>
                    <Input
                      id="organizationName"
                      name="organizationName"
                      placeholder="Frontier Labs"
                      defaultValue={suggestedName}
                      required
                    />
                    <p className="text-sm leading-6 text-slate-400">
                      We&apos;ll generate the organization slug automatically and use the current
                      sandbox payment rails already configured for StableFlow.
                    </p>
                  </div>

                  <div className="grid gap-3 rounded-md border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                        <BadgeCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-white">What gets provisioned</p>
                        <p className="text-sm text-slate-400">
                          A starter operator workspace so the full flow is understandable on day one.
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-2 text-sm leading-7 text-slate-300">
                      <p>• Protected organization and owner membership</p>
                      <p>• Dodo-backed checkout flow tied to your organization</p>
                      <p>• Starter payout routing model and sample recipients</p>
                      <p>• Solana devnet settlement rail with explorer-backed proof</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button type="submit" size="lg">
                      <Building2 className="h-4 w-4" />
                      Create workspace
                    </Button>
                    <Button asChild variant="secondary" size="lg">
                      <Link href="/">Back to product overview</Link>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
