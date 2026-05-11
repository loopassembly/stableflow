export const demoStablecoin = {
  name: "StableFlow USD Demo",
  symbol: "sUSD",
  decimals: 6,
  mint: "5iupsp2SQHETtJAyrqKbxwPuLn9me1Zh4jmqspLTNJ8Z",
  treasuryWallet: "5ykZEE69NaDU9SfoK53MjbQ4g7Rawx1jqZtQFf6eAFfZ",
};

export const pilotMetrics = [
  { label: "Dodo revenue", value: "$18.4k", delta: "+32%", tone: "emerald" },
  { label: "Stablecoin settled", value: "$13.2k", delta: "94 sec avg", tone: "sky" },
  { label: "Recipients", value: "41", delta: "12 countries", tone: "violet" },
  { label: "Fees avoided", value: "$612", delta: "vs wires", tone: "amber" },
];

export const settlementSeries = [
  { day: "Mon", dodo: 1800, solana: 1260 },
  { day: "Tue", dodo: 2400, solana: 1710 },
  { day: "Wed", dodo: 2200, solana: 1580 },
  { day: "Thu", dodo: 3100, solana: 2290 },
  { day: "Fri", dodo: 3700, solana: 2810 },
  { day: "Sat", dodo: 2600, solana: 1910 },
  { day: "Sun", dodo: 4100, solana: 3070 },
];

export const demoRecipients = [
  {
    name: "Anika Rao",
    role: "AI workflow contractor",
    email: "anika@example.com",
    walletAddress: "EUVpgpqtYCn3CC119Lmnr6VZDq8goMhJiuudok3AYWYi",
    region: "India",
    share: "40%",
  },
  {
    name: "Milo Chen",
    role: "API infrastructure vendor",
    email: "milo@example.com",
    walletAddress: "DSzs2EH9QWBWBv4zEkTizbDPbAAQ7wejdVbNg6ccYU6z",
    region: "Singapore",
    share: "25%",
  },
  {
    name: "Sofia Alvarez",
    role: "Affiliate partner",
    email: "sofia@example.com",
    walletAddress: "8tVYC3DitABbNG1vDoHjnJ4VsmFnPZ4gJQPE89fAEiL",
    region: "Mexico",
    share: "20%",
  },
];

export const auditTrail = [
  {
    event: "Dodo checkout created",
    detail: "StableFlow Revenue Test Pack",
    status: "Live",
  },
  {
    event: "Webhook verified",
    detail: "standardwebhooks signature + idempotency",
    status: "Ready",
  },
  {
    event: "Policy compiled",
    detail: "Revenue split with 10% treasury reserve",
    status: "Ready",
  },
  {
    event: "Solana settlement",
    detail: "sUSD mint funded on devnet",
    status: "Live",
  },
];

export const agenticFlows = [
  {
    lane: "x402 API",
    source: "Paid model endpoint",
    split: "60% operator / 25% data / 15% treasury",
  },
  {
    lane: "AI agent",
    source: "Autonomous task completion",
    split: "Per-job stablecoin payout after Dodo credit burn",
  },
  {
    lane: "Creator SaaS",
    source: "Dodo subscription renewal",
    split: "Contractors, affiliates, infra vendors",
  },
];
