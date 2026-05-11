# StableFlow Demo Script

## Demo Goal

Show judges that StableFlow is not a mock dashboard. It is a real workflow that connects:

`Dodo checkout -> verified webhook -> payout run -> Solana stablecoin settlement`

## 3-Minute Demo

### 0:00 - 0:25

Open `https://stableflow-frontier.vercel.app`.

Say:

> StableFlow is a Dodo-powered revenue router for global SaaS and AI teams. Dodo handles the customer payment event, and StableFlow turns that verified revenue into programmable stablecoin payouts on Solana.

Point out:

- the landing page explains what the product is
- the CTA path moves from overview into the operator workspace

### 0:25 - 0:55

Click into the workspace at `/workspace`.

Stay on the main dashboard.

Point out:

- Dodo revenue metrics
- latest payout run status
- treasury wallet and stablecoin mint
- recent checkouts and payout queue

Say:

> The core idea is that revenue collection and cross-border payout ops should live in one system, not in separate tools and spreadsheets.

### 0:55 - 1:20

Use the checkout panel and launch a fresh Dodo checkout.

Say:

> We create a real Dodo checkout session from our backend. That gives us a real commercial event, not a fake local payment object.

### 1:20 - 1:50

Use the Dodo dashboard testing flow and send a `payment.succeeded` event to the production webhook endpoint.

Webhook URL:

`https://stableflow-frontier.vercel.app/api/webhooks/dodo`

Say:

> StableFlow verifies the webhook signature, stores the event idempotently, records the payment in Postgres, and compiles it into a payout run.

### 1:50 - 2:20

Run the settlement step from the app.

Say:

> The payout queue takes the verified payment, applies the routing policy, and settles the transfers on Solana devnet using our stablecoin demo mint.

### 2:20 - 2:50

Open the explorer links for the latest payout run.

Say:

> Each recipient transfer has an auditable transaction signature. The operator sees the commercial event, payout split, and chain confirmation in one place.

### 2:50 - 3:00

Close with:

> Dodo is the revenue control plane, Solana is the settlement rail, and StableFlow is the programmable layer in between. That is the product wedge.

## 5-Minute Demo

Use the 3-minute flow, then add:

- recipient split policy explanation
- reserve percentage explanation
- why this matters for AI vendors and affiliates
- x402-ready framing for autonomous agents

## Backup Demo Path

If Dodo testing is slow or the internet is unstable:

1. Open the live dashboard.
2. Show the latest payment `live_webhook_test_20260501_1`.
3. Show payout run `cmomtoe4u000304l5p6im9h72`.
4. Open the three explorer links from `docs/PROOF_PACK.md`.
5. Explain that the same production webhook path was verified with a signed request.

## Operator Checklist Before Recording

- make sure the app loads at `https://stableflow-frontier.vercel.app`
- start on the landing page, then enter the workspace
- keep the Dodo dashboard open in test mode
- keep Solana explorer tabs ready
- avoid long scrolling before the first 30 seconds

## Key Phrases To Reuse

- Dodo is the revenue source of truth.
- StableFlow compiles revenue into payout policy.
- Solana handles low-latency programmable settlement.
- The operator gets one ledger from checkout to payout proof.

## What Not To Say

- do not say it is already a regulated payout network
- do not imply mainnet settlement if it is devnet
- do not claim full autonomous execution if you are triggering the queue manually in the demo
