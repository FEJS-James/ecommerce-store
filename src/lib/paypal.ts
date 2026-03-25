const PAYPAL_BASE_URL =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

export function isPayPalConfigured(): boolean {
  return !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

// Module-level token cache
let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s safety buffer)
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal auth failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  cachedToken = data.access_token as string;
  // PayPal tokens typically expire in ~9 hours; expires_in is in seconds
  tokenExpiresAt = now + (data.expires_in as number) * 1000;
  return cachedToken;
}

export interface PayPalOrderResponse {
  id: string;
  status: string;
  links: Array<{ href: string; rel: string; method: string }>;
}

export async function createPayPalOrder(
  productName: string,
  amountCents: number,
  productId: string,
  currency: string = "USD",
): Promise<PayPalOrderResponse> {
  const token = await getAccessToken();
  const amountStr = (Number(amountCents) / 100).toFixed(2);

  const res = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: productId,
          description: productName,
          amount: {
            currency_code: currency,
            value: amountStr,
          },
        },
      ],
      application_context: {
        brand_name: "AI Armory",
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal create order failed (${res.status}): ${text}`);
  }

  return res.json();
}

export interface PayPalCaptureResponse {
  id: string;
  status: string;
  purchase_units: Array<{
    reference_id: string;
    payments: {
      captures: Array<{
        id: string;
        status: string;
        amount: { currency_code: string; value: string };
      }>;
    };
  }>;
  payer: {
    name?: { given_name?: string; surname?: string };
    email_address?: string;
  };
}

export async function capturePayPalOrder(
  orderId: string,
): Promise<PayPalCaptureResponse> {
  const token = await getAccessToken();

  const res = await fetch(
    `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal capture failed (${res.status}): ${text}`);
  }

  return res.json();
}

export async function verifyWebhookSignature(
  headers: Record<string, string>,
  body: string,
  webhookId: string,
): Promise<boolean> {
  const token = await getAccessToken();

  const res = await fetch(
    `${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: headers["paypal-auth-algo"],
        cert_url: headers["paypal-cert-url"],
        transmission_id: headers["paypal-transmission-id"],
        transmission_sig: headers["paypal-transmission-sig"],
        transmission_time: headers["paypal-transmission-time"],
        webhook_id: webhookId,
        webhook_event: JSON.parse(body),
      }),
    },
  );

  if (!res.ok) return false;

  const data = await res.json();
  return data.verification_status === "SUCCESS";
}
