import crypto from 'crypto';

// Environment variables (all optional — gracefully disabled when not configured)
// BTCPAY_URL — BTCPay Server base URL (e.g. https://btcpay.aiarmory.shop)
// BTCPAY_STORE_ID — BTCPay store ID
// BTCPAY_API_KEY — API key with invoice creation permission
// BTCPAY_WEBHOOK_SECRET — HMAC secret for webhook verification

export function isBTCPayConfigured(): boolean {
  return !!(process.env.BTCPAY_URL && process.env.BTCPAY_STORE_ID && process.env.BTCPAY_API_KEY);
}

interface CreateInvoiceParams {
  amount: number; // in cents
  productId: string;
  productName: string;
  customerEmail: string;
  orderId: string;
}

interface BTCPayInvoice {
  id: string;
  checkoutLink: string;
  status: string;
  amount: string;
  currency: string;
}

export async function createBTCPayInvoice(params: CreateInvoiceParams): Promise<BTCPayInvoice> {
  const url = `${process.env.BTCPAY_URL}/api/v1/stores/${process.env.BTCPAY_STORE_ID}/invoices`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `token ${process.env.BTCPAY_API_KEY}`,
    },
    body: JSON.stringify({
      amount: (params.amount / 100).toFixed(2), // cents → pounds
      currency: 'GBP',
      metadata: {
        productId: params.productId,
        orderId: params.orderId,
        customerEmail: params.customerEmail,
      },
      checkout: {
        redirectURL: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://aiarmory.shop'}/order/success?id=${params.orderId}`,
        redirectAutomatically: true,
        speedPolicy: 'MediumSpeed', // 1 confirmation
      },
      receipt: { enabled: true },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`BTCPay invoice creation failed: ${response.status} ${error}`);
  }

  return response.json();
}

export function verifyBTCPayWebhook(body: string, signature: string): boolean {
  if (!process.env.BTCPAY_WEBHOOK_SECRET) return false;
  const hmac = crypto.createHmac('sha256', process.env.BTCPAY_WEBHOOK_SECRET);
  hmac.update(body);
  const computed = `sha256=${hmac.digest('hex')}`;
  // Guard against length mismatch which would throw in timingSafeEqual
  if (Buffer.byteLength(computed) !== Buffer.byteLength(signature)) return false;
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
}
