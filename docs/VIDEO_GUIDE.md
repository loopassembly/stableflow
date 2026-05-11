# StableFlow Video Guide

This guide matches the current StableFlow site as audited on May 12, 2026.

## What Changed

The previous recording guide is stale in a few important ways:

- the public landing page is now much stronger and should carry more of the story
- the old public `Open demo workspace` path is gone
- the workspace nav is now:
  - `Overview`
  - `Collect revenue`
  - `Review routing`
  - `Settle`
  - `Verify proof`
- the Dodo action is inside `Collect revenue` via `Launch checkout`
- `Verify proof` is the section name, but the proof button is `Open latest proof`
- the current preview workspace opens in a settled, proof-ready state, which is good for backup proof capture but not the best path for showing live functionality

## Best Recording Setup

Use two prepared tabs before you start recording:

1. Public landing page:
   - `http://127.0.0.1:3001/`
2. Signed-in workspace:
   - `http://127.0.0.1:3001/workspace`

If you are recording locally and need a fallback proof-only tab, keep this ready as a third tab:

- `http://127.0.0.1:3001/workspace?preview=1`

The main recording should use a real signed-in workspace, because that is the only path that cleanly shows `Launch checkout` opening Dodo and the real workspace actions.

## Recording Rules

Before you record:

1. Keep browser zoom at `100%`
2. Use desktop layout
3. Pre-open both tabs
4. Start on the landing page tab
5. Do not spend time on auth in the main cut
6. Do not trigger a brand-new live payment during recording
7. Use the signed-in workspace for the main cut so the Dodo checkout action is visible
8. Keep the preview workspace only as a backup if the live workspace becomes unstable

## Exact 2 Minute 55 Second Script

### 0:00 - 0:12

**Screen name to mention:** `Run the payout cycle from one desk.`

**Where to go:**

- Start on the landing page hero
- Keep the top nav, headline, and CTAs visible

**What to say exactly:**

> This is StableFlow, a Dodo-powered revenue router for SaaS and AI teams. We turn each Dodo checkout into a governed payout cycle and settle it on Solana with proof.

---

### 0:12 - 0:28

**Screen name to mention:** `Checkout to payout, inside one controlled desk.`

**Where to go:**

- Slow scroll down from the hero
- Keep the `Live operator cycle` panel visible
- Make sure `Current commercial volume`, `Dodo collection rail`, `Signed webhooks`, and `Latest transfer proof` are on screen

**What to say exactly:**

> The landing page now shows the operating loop directly. Revenue comes in through Dodo, the webhook is verified, settlement posture is visible, and the latest transfer proof stays attached to the same cycle.

---

### 0:28 - 0:44

**Screen name to mention:** `The product is narrow on purpose.`

**Where to go:**

- Scroll to the `Flow` section
- Keep the four step cards visible:
  - `Launch a Dodo checkout`
  - `Verify the webhook`
  - `Compile the payout run`
  - `Send stablecoin payouts`

**What to say exactly:**

> StableFlow is intentionally narrow. It is not trying to be a wallet, an ERP, and a payment processor at the same time. It does one job clearly: move from customer payment to payout execution with proof.

---

### 0:44 - 0:58

**Screen name to mention:** `Useful the moment revenue has to fan out across people, regions, or systems.`

**Where to go:**

- Scroll to the `Product` section
- Keep the use-case cards and `A cleaner operating desk.` panel visible

**What to say exactly:**

> This is built for global software teams, AI revenue-sharing products, and platforms with payout complexity. The operating desk is structured around overview, payments, routing, settlements, and proof.

---

### 0:58 - 1:14

**Screen name to mention:** `The product keeps its own evidence attached.`

**Where to go:**

- Scroll to the `Proof` section
- Keep `Operational posture` and `Why users trust it` visible
- If possible, keep `Latest payment` and `Stablecoin mint` visible too

**What to say exactly:**

> The proof layer is first-class. StableFlow keeps readiness checks, the latest payment, the stablecoin mint, and the trust model in one product surface instead of scattering them across tools.

---

### 1:14 - 1:20

**Screen name to mention:** `Launch the next payout cycle with less friction.`

**Where to go:**

- Scroll a bit further so the final CTA dock is visible

**What to say exactly:**

> That is the public product story. Now we move into the protected operator workspace where the payout cycle is actually managed.

---

### 1:20 - 1:24

**Action only:**

- Switch to the second prepared tab:
  - `http://127.0.0.1:3001/workspace`

Do not waste time typing this live during the recording.

---

### 1:24 - 1:40

**Screen name to mention:** `Payout settled. Proof is ready.`

**Where to go:**

- On workspace `Overview`
- Keep `Current cycle`, `Operator status`, `View proof`, and `Open payments` visible

**What to say exactly:**

> The workspace opens at the current cycle. Here the latest payout is already settled, the operator status says verify proof, and the next move is obvious from the first screen.

---

### 1:40 - 2:00

**Screen name to mention:** `Collect revenue`

**What to click:**

- Left rail `Collect revenue`

**Where to go:**

- Keep the top hero visible
- Keep `Launch checkout` and `Open recent checkout` visible
- Then show:
  - `New payment session`
  - `Payment ledger`

**What to say exactly:**

> Collect Revenue is the Dodo entry point. When the operator clicks Launch Checkout, StableFlow opens a real Dodo checkout and tags that session back to the StableFlow ledger so the payment becomes the source of truth for the rest of the cycle.

---

### 2:00 - 2:10

**Screen name to mention:** `Launch checkout`

**What to click:**

- `Launch checkout`

**Where to go:**

- Let the Dodo checkout page open
- Stay there for a few seconds only
- Return to the StableFlow workspace tab

**What to say exactly:**

> This is the key Dodo proof point. The Dodo checkout is actually opening from inside the product, not just being referenced in the UI.

---

### 2:10 - 2:24

**Screen name to mention:** `Review routing`

**What to click:**

- Left rail `Review routing`

**Where to go:**

- Keep these cards visible:
  - `Payout policy`
  - `Recipient book`
  - `Routing templates`

**What to say exactly:**

> Review Routing is where StableFlow compiles the payout run. The operator checks reserve posture, routed share, recipient allocations, and the routing templates that turn one payment into several obligations.

---

### 2:24 - 2:40

**Screen name to mention:** `Settle payouts`

**What to click:**

- Left rail `Settle`

**Where to go:**

- Keep these cards visible:
  - `Treasury rail`
  - `Settlement queue`

**What to say exactly:**

> Settle is the execution rail. Treasury balances, the mint, recent runs, and the settlement queue all stay together, so the operator can inspect transfers and signatures before and after execution.

---

### 2:40 - 2:54

**Screen name to mention:** `Verify proof`

**What to click:**

- Left rail `Verify proof`

**Where to go:**

- Keep these cards visible:
  - `Activity log`
  - `Latest payout proof`
  - `Rail health`
- Keep `Open latest proof` visible

**What to say exactly:**

> Verify Proof is the accountability trail. It links the payment, checkout, stablecoin mint, explorer-backed transfers, and rail-health checks in one final audit surface.

---

### 2:54 - 3:00

**Screen name to mention:** `Open latest proof`

**What to click:**

- `Open latest proof`

**Where to go:**

- Let the Solana explorer open
- Keep the explorer transaction page visible briefly

**What to say exactly:**

> Open Latest Proof takes us directly to the Solana explorer for the confirmed transaction. StableFlow treats Dodo as the commercial trigger, Solana as the settlement rail, and keeps the proof attached all the way through.

## Exact Click Order

Keep this order during the recording:

1. Start on landing page hero
2. Scroll to `Live operator cycle`
3. Scroll to `Flow`
4. Scroll to `Product`
5. Scroll to `Proof`
6. Scroll to final CTA dock
7. Switch to the prepared signed-in workspace tab
8. Click left rail `Collect revenue`
9. Click `Launch checkout`
10. Return to the StableFlow workspace tab
11. Click left rail `Review routing`
12. Click left rail `Settle`
13. Click left rail `Verify proof`
14. Click `Open latest proof`

## What Not To Do

Do not:

- spend time in `Sign in` or `Create your workspace` during the main cut
- rely on recording a fresh payment live
- say this is already a regulated mainnet payout network
- say Solana mainnet is live if the screen is showing `devnet`
- call Dodo decorative UI or “just checkout”
- call `Verify proof` a button
- say `Open latest proof` stays inside StableFlow when it actually opens Solana explorer

## Short Backup Version

If you need a shorter cut, use only these screens:

1. `Run the payout cycle from one desk.`
2. `Checkout to payout, inside one controlled desk.`
3. `The product is narrow on purpose.`
4. `Payout settled. Proof is ready.`
5. `Collect revenue`
6. `Launch checkout`
7. `Verify proof`
8. `Open latest proof`

## Source of Truth For This Guide

This guide was updated against:

- the live local landing page at `http://127.0.0.1:3001/`
- the live signed-in workspace UI structure in the current app
- the live local preview workspace at `http://127.0.0.1:3001/workspace?preview=1` as a backup proof reference
- the current landing implementation in `src/components/stableflow/stableflow-landing.tsx`
- the current workspace implementation in `src/components/stableflow/stableflow-app.tsx`
