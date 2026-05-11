import { appUrl, dodoBaseUrl, dodoConfig, isDodoConfigured } from "@/lib/env";

export type CreateCheckoutInput = {
  organizationId: string;
  checkoutSessionId: string;
  customerEmail?: string;
  customerName?: string;
  quantity?: number;
};

export type DodoCheckoutResponse = {
  session_id: string;
  checkout_url: string | null;
};

export async function createDodoCheckoutSession(input: CreateCheckoutInput) {
  if (!isDodoConfigured()) {
    return {
      session_id: `demo_${input.checkoutSessionId}`,
      checkout_url: `${appUrl}/checkout/success?session=demo_${input.checkoutSessionId}`,
    } satisfies DodoCheckoutResponse;
  }

  const response = await fetch(`${dodoBaseUrl()}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${dodoConfig.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_cart: [
        {
          product_id: dodoConfig.productId,
          quantity: input.quantity ?? 1,
        },
      ],
      allowed_payment_method_types: ["credit", "debit", "crypto_currency"],
      metadata: {
        stableflow_org_id: input.organizationId,
        stableflow_checkout_id: input.checkoutSessionId,
        stableflow_policy: "global-saas-revenue-router",
        stableflow_source: "dashboard",
      },
      return_url: `${appUrl}/checkout/success`,
      cancel_url: `${appUrl}/checkout/cancel`,
      short_link: false,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Dodo checkout failed: ${response.status} ${detail}`);
  }

  return (await response.json()) as DodoCheckoutResponse;
}
