const explicitAppUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
const vercelAppUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`
  : undefined;

export const appUrl = explicitAppUrl ?? vercelAppUrl ?? "http://localhost:3000";

export const dodoConfig = {
  apiKey: process.env.DODO_PAYMENTS_API_KEY,
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY,
  environment: process.env.DODO_PAYMENTS_ENVIRONMENT ?? "test_mode",
  productId: process.env.DODO_PRODUCT_ID_CREDITS,
};

export const solanaConfig = {
  rpcUrl: process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
  network: process.env.SOLANA_NETWORK ?? "devnet",
  treasurySecretKey: process.env.SOLANA_TREASURY_SECRET_KEY,
  usdcMint: process.env.SOLANA_USDC_MINT,
  stablecoinDecimals: Number.parseInt(process.env.SOLANA_STABLECOIN_DECIMALS ?? "6", 10),
  stablecoinSymbol: process.env.SOLANA_STABLECOIN_SYMBOL ?? "sUSD",
  stablecoinName: process.env.SOLANA_STABLECOIN_NAME ?? "StableFlow USD Demo",
};

export function dodoBaseUrl() {
  return dodoConfig.environment === "live_mode"
    ? "https://live.dodopayments.com"
    : "https://test.dodopayments.com";
}

export function isDodoConfigured() {
  return Boolean(dodoConfig.apiKey && dodoConfig.productId);
}

export function isSolanaSettlementConfigured() {
  return Boolean(solanaConfig.treasurySecretKey && solanaConfig.usdcMint);
}
