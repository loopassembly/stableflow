# StableFlow Submission Kit

## Project Name

StableFlow

## Tagline

Turn Dodo revenue into programmable stablecoin payouts on Solana.

## Short Description

StableFlow helps global SaaS and AI teams collect revenue through Dodo Payments, turn signed payment events into payout runs, and settle contractor, affiliate, and vendor payouts in stablecoins on Solana.

## 280-Character Version

StableFlow is a Dodo-powered revenue router for SaaS and AI teams. It converts verified checkout payments into policy-driven stablecoin payout runs on Solana, giving founders faster global settlement, lower ops overhead, and a clean ledger from checkout to contractor payout.

## One-Paragraph Pitch

StableFlow is a revenue operations layer for global SaaS and AI products. Teams use Dodo Payments to sell worldwide, but still pay contractors, affiliates, and infrastructure partners through slow, manual, bank-heavy workflows. StableFlow listens to signed Dodo payment events, compiles payout rules, creates an auditable ledger, and settles recipient transfers in stablecoins on Solana. The result is one system that connects monetization, reconciliation, and programmable global payouts.

## The Problem

Global software teams can now monetize internationally, but disbursing revenue is still fragmented:

- checkout revenue lives in one system
- payout calculations live in spreadsheets
- ops teams manually reconcile who gets paid
- international settlement is slow and expensive
- AI-native products have no clean way to pay agents, vendors, and affiliates in real time

## The Solution

StableFlow makes Dodo the revenue source of truth and Solana the settlement rail.

1. A customer pays through Dodo checkout.
2. StableFlow verifies the signed webhook and records the payment.
3. A payout policy compiles the payment into recipient transfers.
4. The settlement queue executes stablecoin transfers on Solana.
5. Operators get a live dashboard, payout status, explorer links, and an audit trail.

## Why This Fits the Dodo Track

- Dodo is integrated in a meaningful way, not added as a decorative checkout button.
- The product solves a concrete business problem for SaaS and AI founders.
- Solana stablecoins clearly improve speed, cost, and programmability.
- The demo includes live hosted checkout creation, signed webhook processing, and confirmed devnet transfers.

## Why This Project Stands Out

### 1. Dodo Is the Revenue Control Plane

StableFlow does not treat Dodo as a generic payment gateway. Dodo creates the commercial event that powers the entire downstream payout workflow.

### 2. Solana Is Used for Real Utility

We are not just displaying a wallet. We are using Solana to settle multi-recipient payouts with live transaction proofs.

### 3. The User Persona Is Specific

The primary user is a global SaaS or AI founder paying contractors, infra vendors, and affiliates across borders.

### 4. The Product Is Operator-Grade

The dashboard includes:

- live revenue and settlement metrics
- payout queue state
- recipient split rules
- Dodo session history
- audit trail
- Solana explorer links

### 5. It Has an Agentic Payments Angle

The payout model is already framed as x402-ready, which gives us a strong bridge into autonomous software and AI agent monetization.

## Paste-Ready Long Description

StableFlow is a Dodo-powered revenue router built for SaaS and AI teams operating globally. It helps founders collect payments through Dodo Payments, verify those payments via signed webhooks, map them to payout policies, and settle recipient transfers in stablecoins on Solana. Instead of manually reconciling revenue, spreadsheets, and bank payouts, teams get a single operator dashboard that tracks checkout activity, payout runs, recipients, settlement status, and explorer-linked transfer proofs.

In this build, StableFlow supports a live hosted Dodo checkout flow, signed webhook ingestion, an auditable Postgres ledger, policy-based recipient splits, and live Solana devnet settlement using a stablecoin demo mint. The product is especially relevant for AI-native companies and internet businesses that need to split revenue across contractors, affiliates, API vendors, and eventually autonomous agents.

## Target User

- global SaaS founders
- AI product operators
- agencies with distributed contractor teams
- affiliate-heavy software businesses
- AI-native companies that need programmable rev-share

## Why Solana

- low-cost transfers make micro-settlements practical
- fast finality improves payout latency
- token rails make multi-party disbursement programmable
- wallet-native payouts are better than international wires for internet businesses

## Why Dodo

- global checkout coverage
- strong hosted checkout ergonomics
- clean API model for session creation
- signed webhooks for reliable revenue events
- good fit for SaaS and AI product monetization

## What Is Live Today

- hosted app at `https://stableflow-frontier.vercel.app`
- Dodo checkout session creation
- signed webhook verification
- Supabase-backed financial ledger
- payout policy and recipient routing
- Solana devnet stablecoin settlement
- public proof of recent settled transfers

## Current Proof Points

As of May 1, 2026:

- live public app deployed
- live signed webhook accepted in production
- latest webhook payment ID: `live_webhook_test_20260501_1`
- latest payout run ID: `cmomtoe4u000304l5p6im9h72`
- latest payout run status: `SETTLED`
- confirmed transfers recorded in dashboard: `9`

See `docs/PROOF_PACK.md` for the exact explorer links and screenshot artifacts.

## Business Model

- usage fee or basis-point fee on automated payouts
- premium plans for advanced routing, reporting, and approval workflows
- revenue-share tooling for affiliates, partners, and agents
- treasury automation and reconciliation as higher-tier add-ons

## Honest Current Scope

The current build is a strong hackathon product, not a finished regulated payout network.

What is real now:

- Dodo checkout creation
- signed webhook verification
- payout run generation
- live devnet settlement
- hosted operator dashboard

What comes next after the hackathon:

- live-mode Dodo production onboarding
- role-based auth and org workspaces
- automatic background queue workers
- compliance, approvals, and payout controls
- mainnet pilot with selected design partners

## Judge Framing

If judges ask what makes this special, the strongest answer is:

StableFlow connects monetization and settlement inside one product. Most submissions will show either a wallet, a stablecoin checkout, or a remittance rail. StableFlow shows a full business workflow: collect revenue with Dodo, verify the event, route it through policy logic, and settle contributors on Solana with a proof trail.

## Submission Checklist

- app URL added
- GitHub repo added
- demo video recorded
- architecture doc linked
- proof pack linked
- screenshots attached
- Dodo integration called out clearly
- Solana advantage explained in plain English
- target user and market wedge stated explicitly
