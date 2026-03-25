import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute, ensureDb } from '@/lib/db';
import { verifyWebhookSignature } from '@/lib/paypal';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;

    // Verify signature if webhook ID is configured
    if (webhookId) {
      const headers: Record<string, string> = {};
      for (const key of [
        'paypal-auth-algo',
        'paypal-cert-url',
        'paypal-transmission-id',
        'paypal-transmission-sig',
        'paypal-transmission-time',
      ]) {
        const val = request.headers.get(key);
        if (val) headers[key] = val;
      }

      const verified = await verifyWebhookSignature(headers, body, webhookId);
      if (!verified) {
        console.error('[PayPal Webhook] Signature verification failed');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } else if (process.env.NODE_ENV === 'production') {
      console.warn('[PayPal Webhook] PAYPAL_WEBHOOK_ID not set — skipping signature verification');
    }

    await ensureDb();

    const event = JSON.parse(body);
    const eventType = event.event_type as string;

    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handleCaptureCompleted(event.resource);
        break;
      case 'PAYMENT.CAPTURE.REFUNDED':
        await handleCaptureRefunded(event.resource);
        break;
      default:
        console.log(`[PayPal Webhook] Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[PayPal Webhook] Error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCaptureCompleted(resource: Record<string, unknown>) {
  // This is a backup — the capture-order endpoint handles the primary flow.
  // Just log for now; the order should already exist.
  const captureId = resource.id as string;
  console.log(`[PayPal Webhook] PAYMENT.CAPTURE.COMPLETED — capture: ${captureId}`);

  // If the supplementary_data includes the order ID, we can verify it exists
  const supplementary = resource.supplementary_data as Record<string, unknown> | undefined;
  const relatedIds = supplementary?.related_ids as Record<string, string> | undefined;
  const paypalOrderId = relatedIds?.order_id;

  if (paypalOrderId) {
    const order = await queryOne<{ id: string }>(
      'SELECT id FROM orders WHERE paypal_order_id = ?',
      [paypalOrderId]
    );

    if (!order) {
      console.warn(
        `[PayPal Webhook] No order found for PayPal order ${paypalOrderId} — may need manual reconciliation`
      );
    }
  }
}

async function handleCaptureRefunded(resource: Record<string, unknown>) {
  // Try to find the related PayPal order from the refund's links or resource data
  const links = resource.links as Array<{ href: string; rel: string }> | undefined;
  const upLink = links?.find((l) => l.rel === 'up');

  // Extract capture ID from the "up" link — the capture is linked to our order
  // Alternative: use the invoice_id or custom_id if we set them
  const captureId = resource.id as string;
  console.log(`[PayPal Webhook] PAYMENT.CAPTURE.REFUNDED — capture: ${captureId}`);

  // Find the order using the PayPal order ID from supplementary data
  const supplementary = resource.supplementary_data as Record<string, unknown> | undefined;
  const relatedIds = supplementary?.related_ids as Record<string, string> | undefined;
  const paypalOrderId = relatedIds?.order_id;

  if (!paypalOrderId) {
    console.warn('[PayPal Webhook] Refund event missing order_id in supplementary_data');
    // Try matching by amount and payment method as a fallback — not reliable, skip
    return;
  }

  const order = await queryOne<{
    id: string;
    customer_id: string | null;
    amount_cents: number;
  }>('SELECT id, customer_id, amount_cents FROM orders WHERE paypal_order_id = ?', [
    paypalOrderId,
  ]);

  if (!order) {
    console.warn(
      `[PayPal Webhook] No order found for PayPal order ${paypalOrderId}`
    );
    return;
  }

  // Revoke download and mark refunded
  await execute(
    `UPDATE orders SET status = 'refunded', download_token = NULL WHERE id = ?`,
    [order.id]
  );

  if (order.customer_id) {
    await execute(
      `UPDATE customers SET
        total_spent_cents = MAX(0, total_spent_cents - ?),
        order_count = MAX(0, order_count - 1),
        updated_at = datetime('now')
      WHERE id = ?`,
      [order.amount_cents, order.customer_id]
    );
  }

  console.log(`[PayPal Webhook] Refunded order ${order.id}`);
}
