# StableFlow File Map

## Product Surface

- `src/app/page.tsx` renders the public product overview and entry flow.
- `src/app/workspace/page.tsx` renders the operator workspace for the live revenue and payout workflow.
- `src/components/stableflow/stableflow-landing.tsx` contains the landing page, product narrative, usage flow, workspace preview, and live proof section.
- `src/components/stableflow/stableflow-app.tsx` contains the live operator dashboard, checkout form, treasury panel, payout queue, production-readiness scorecards, reconciliation ledger, proof pack, and x402-ready lanes.
- `src/components/stableflow/settlement-chart.tsx` renders the deterministic SVG revenue-versus-settlement chart.
- `src/app/checkout/success/page.tsx` and `src/app/checkout/cancel/page.tsx` handle Dodo return states.

## Backend Routes

- `src/app/api/checkout/route.ts` creates a local ledger session, calls Dodo Checkout Sessions, and stores the returned checkout URL.
- `src/app/api/dashboard/route.ts` returns a live dashboard snapshot for the client: metrics, recent checkouts, payout runs, signatures, treasury asset data, and audit events.
- `src/app/api/health/route.ts` returns a no-store operational health summary for deployment checks and monitoring.
- `src/app/api/webhooks/dodo/route.ts` verifies Dodo `standardwebhooks` signatures, stores idempotent webhook events, and creates payout runs on `payment.succeeded`.
- `src/app/api/demo/seed/route.ts` seeds the demo organization, recipients, policy, payment, and payout run.
- `src/app/api/payouts/simulate/route.ts` executes the latest payout run on Solana devnet, records real signatures, and marks partial or failed transfers explicitly.

## Domain Layer

- `src/lib/env.ts` centralizes Dodo, Supabase, app URL, and Solana environment access.
- `src/lib/db.ts` creates the Prisma Postgres client with the Supabase pooler.
- `src/lib/dodo.ts` wraps Dodo Checkout Sessions.
- `src/lib/ledger.ts` owns organizations, recipients, policies, payments, webhook events, payout runs, transfers, audit logs, and the live dashboard snapshot query.
- `src/lib/solana.ts` owns Solana explorer helpers, associated token account creation, and real demo stablecoin transfers on devnet.
- `src/lib/demo-data.ts` stores demo metrics, recipients, audit copy, and chart data used by the dashboard.

## Data Model

- `prisma/schema.prisma` defines the financial ledger: `Organization`, `DodoCheckoutSession`, `DodoWebhookEvent`, `Payment`, `Recipient`, `PayoutPolicy`, `PayoutRule`, `PayoutRun`, `PayoutTransfer`, and `AuditLog`.
- `prisma.config.ts` loads `.env.local` and uses `DIRECT_URL` for Prisma schema pushes/migrations.

## Design System

- `src/components/ui/*` are shadcn/ui primitives copied into the repo.
- `src/app/globals.css` configures Tailwind v4, shadcn tokens, and Geist font variables.
- `components.json` stores the shadcn registry configuration.

## Submission Assets

- `docs/SUBMISSION_KIT.md` contains paste-ready hackathon submission copy and judge framing.
- `docs/DEMO_SCRIPT.md` contains the live demo flow, fallback path, and talk track.
- `docs/ARCHITECTURE.md` explains the production shape and why the payout queue is explicit.
- `docs/COMPETITION_MATRIX.md` maps StableFlow to the official track prompt, judging criteria, and submission guidance.
- `docs/PROOF_PACK.md` stores the current live URLs, payout IDs, explorer links, and artifact references.
- `output/playwright/stableflow-phase3-desktop.png` and `output/playwright/stableflow-phase3-mobile.png` are current hosted screenshots for submission use.
