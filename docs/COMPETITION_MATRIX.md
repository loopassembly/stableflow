# StableFlow Competition Matrix

This document maps StableFlow to the exact signals called out in the Dodo Payments x Superteam India track and the broader Colosseum judging criteria.

## Track Requirements

### 1. Meaningful Dodo Payments integration

- Dodo checkout sessions are created server-side through `POST /api/checkout`.
- StableFlow attaches metadata so every Dodo payment can be reconciled to a payout policy and workspace.
- Signed Dodo webhooks are verified at `POST /api/webhooks/dodo`.
- Verified webhook events create ledger payments and downstream payout runs.

Evidence:

- hosted app: `https://stableflow-frontier.vercel.app`
- webhook endpoint: `https://stableflow-frontier.vercel.app/api/webhooks/dodo`
- latest live payment ID and payout run are visible in the dashboard and proof pack

### 2. Solve a specific problem for a defined user

Primary user:

- global SaaS founders
- AI product operators
- teams paying contractors, affiliates, infra vendors, and eventually autonomous agents

Problem:

- revenue collection is modern, but payout operations are still spreadsheet-heavy, manual, and slow across borders

StableFlow solves that by connecting:

`checkout -> signed payment event -> payout policy -> stablecoin settlement -> audit trail`

### 3. Showcase why Solana + stablecoins beat the status quo

StableFlow uses Solana for:

- fast multi-recipient settlement
- wallet-native cross-border payouts
- programmable splits for contractors, affiliates, and service providers
- explorer-linked proof for each transfer

StableFlow does not use Solana as a decorative wallet surface. It uses Solana as the payout rail.

### 4. Demonstrate early traction

Current proof:

- public hosted app is live
- Dodo webhook flow is live in production test mode
- payout runs and confirmed devnet transfer proofs are visible in the dashboard
- treasury balances, transfer counts, cycle time, and recent payout runs are visible in-app

## Track Theme Coverage

StableFlow covers multiple theme buckets from the prompt:

- Cross-Border Payments for Businesses
- Programmable B2B Finance
- DeFi-native Applications
- Agentic & Autonomous Payments

This matters because the product is not a generic wallet or remittance clone. It is a business workflow product with a strong SaaS and AI wedge.

## Colosseum Judging Criteria

### Functionality

- working hosted app
- working Dodo checkout flow
- signed webhook ingestion
- Supabase ledger
- payout policy engine
- real Solana devnet settlement

### Potential Impact

- large user wedge: global SaaS and AI teams
- solves a repeated operational pain point
- strong expansion path into treasury ops, affiliate payouts, usage-based sharing, and agentic monetization

### Novelty

- combines Dodo monetization with stablecoin payout automation in one operator product
- focuses on the post-checkout payout layer rather than only checkout or only wallet UX

### UX

- single operator dashboard
- live metrics, payout queue, treasury balances, reconciliation ledger, and proof pack
- Judge Mode for fast evaluation during demos

### Open-source / Composability

- built with a transparent App Router + Prisma + Solana architecture
- composed around clean API routes and a ledger model that can extend to more payout policies

### Business Plan

- usage-based or basis-point pricing on automated payouts
- premium plans for approvals, analytics, treasury controls, and advanced routing
- wedge into AI-native teams that need rev-share and agent payout tooling

## Superteam Submission Guidance

StableFlow now answers Superteam’s five-question cheat sheet directly in-product:

- What problem is painfully real?
- Why now and why Solana?
- Who is the first user?
- What is the unfair insight?
- What does success in 6 weeks look like?

It also addresses Superteam’s common submission pitfalls:

- live end-to-end demo
- clear product story
- repo/docs/proof pack
- no broken demo dependency on hidden steps

## Honest Scope

StableFlow is production-minded, but we are not pretending the hackathon build is already a regulated global payout company.

What is real now:

- Dodo revenue collection
- signed webhooks
- ledger and audit trail
- recipient routing
- Solana devnet settlement
- hosted public demo

What comes next:

- auth and multi-tenant org controls
- approval workflows
- background workers
- compliance layers
- mainnet pilot with selected design partners
