# StableFlow Proof Pack

This document collects the concrete proof points used in the submission and demo.

## Live URLs

- Hosted app: `https://stableflow-frontier.vercel.app`
- Dodo webhook endpoint: `https://stableflow-frontier.vercel.app/api/webhooks/dodo`
- Local app: `http://localhost:3001`

## Screenshots

- Desktop: `output/playwright/stableflow-phase3-desktop.png`
- Mobile: `output/playwright/stableflow-phase3-mobile.png`
- Earlier dashboard references:
  - `output/playwright/stableflow-phase1.png`
  - `output/playwright/stableflow-phase1-mobile.png`

## Current Live Proof

As of May 1, 2026:

- latest checkout session: `cks_0NdtFBQSPBmzGR0f4s4Eo`
- checkout URL: `https://test.checkout.dodopayments.com/session/cks_0NdtFBQSPBmzGR0f4s4Eo`
- latest webhook-created payment: `live_webhook_test_20260501_1`
- latest payout run: `cmomtoe4u000304l5p6im9h72`
- payout run status: `SETTLED`
- confirmed transfers in dashboard: `9`

## Latest Settled Transfers

### Anika Rao

- amount: `72` cents of payout value -> `0.72 sUSD`
- signature: `29uMtseo4FNEdmfUaywqW32rbjY3nwamt4HDmKyUiqGu42wy7U6j7XBJZbuYAbhjkwko85vEsrbaf5ruudjbKBnw`
- explorer: `https://explorer.solana.com/tx/29uMtseo4FNEdmfUaywqW32rbjY3nwamt4HDmKyUiqGu42wy7U6j7XBJZbuYAbhjkwko85vEsrbaf5ruudjbKBnw?cluster=devnet`

### Milo Chen

- amount: `45` cents of payout value -> `0.45 sUSD`
- signature: `4n8qktDA5ymr9TSLFM8pH7Shhm5oep6RFx8YabWFWW2PrtNZy45N4nErQo1E9w6fjfEC3WZxA6ddKGoFPGquinBB`
- explorer: `https://explorer.solana.com/tx/4n8qktDA5ymr9TSLFM8pH7Shhm5oep6RFx8YabWFWW2PrtNZy45N4nErQo1E9w6fjfEC3WZxA6ddKGoFPGquinBB?cluster=devnet`

### Sofia Alvarez

- amount: `36` cents of payout value -> `0.36 sUSD`
- signature: `2a3PasSW4KfayxjFTwddeqYh1z5wgrKUS4RRM7gFtNueWUAVVGoNMCpCBiejUmYFQBUJEuD6Ea1Wn7EtnPFvXbGT`
- explorer: `https://explorer.solana.com/tx/2a3PasSW4KfayxjFTwddeqYh1z5wgrKUS4RRM7gFtNueWUAVVGoNMCpCBiejUmYFQBUJEuD6Ea1Wn7EtnPFvXbGT?cluster=devnet`

## Public Flow Verified

The hosted production app has already been validated through:

1. public dashboard access
2. hosted Dodo checkout session creation
3. public webhook reachability
4. signed webhook acceptance with the current production secret
5. successful payout settlement after webhook processing

## Hosted Smoke-Test Results

- `GET /api/dashboard` returned live state
- `POST /api/checkout` returned a real Dodo `checkout_url`
- `POST /api/webhooks/dodo` returned `200` for a signed `payment.succeeded` test payload
- `POST /api/payouts/simulate` settled the latest payout run on Solana devnet

## How To Reproduce In Front Of Judges

1. Open the hosted app.
2. Create a new Dodo checkout session.
3. Send a `payment.succeeded` test event from the Dodo dashboard to the production webhook URL.
4. Trigger settlement from the dashboard flow.
5. Open the explorer links from the latest payout run.

## Notes On Scope

- settlement is on devnet, not mainnet
- the current stable asset is a demo mint named `sUSD`
- the system is built to show a real operator workflow and proof trail, not to pretend regulatory work is already complete
