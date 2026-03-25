import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute, ensureDb } from '@/lib/db';
import { verifyBTCPayWebhook } from '@/lib/btcpay';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('BTCPAY-SIG') || '';

    // Verify webhook signature
    if (process.env.BTCPAY_WEBHOOK_SECRET) {
      if (!signature || !verifyBTCPayWebhook(body, signature)) {
        console.error('BTCPay webhook signature verification failed');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } else if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 503 });
    }

    const event = JSON.parse(body);
    const eventType = event.type as string;

    await ensureDb();

    if (eventType === 'InvoiceSettled' || eventType === 'InvoicePaymentSettled') {
      await handleInvoiceSettled(event);
    } else if (eventType === 'InvoiceExpired' || eventType === 'InvoiceInvalid') {
      console.log(`[BTCPay Webhook] ${eventType} for invoice ${event.invoiceId || 'unknown'}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('BTCPay webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleInvoiceSettled(event: Record<string, unknown>) {
  const invoiceId = event.invoiceId as string;
  const metadata = (event.metadata || {}) as Record<string, string>;
  const productId = metadata.productId || '';
  const orderId = metadata.orderId || '';
  const customerEmail = (metadata.customerEmail || '').toLowerCase();

  if (!orderId || !customerEmail) {
    console.warn(`[BTCPay Webhook] InvoiceSettled missing metadata — invoiceId: ${invoiceId}`);
    return;
  }

  // Check for duplicate processing
  const existingOrder = await queryOne<{ id: string }>(
    'SELECT id FROM orders WHERE id = ?',
    [orderId]
  );
  if (existingOrder) {
    console.log(`[BTCPay Webhook] Order ${orderId} already exists, skipping duplicate`);
    return;
  }

  // Generate download token
  const downloadToken = crypto.randomBytes(32).toString('hex');
  const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  // Look up product for amount info
  const product = await queryOne<{ price_cents: number; name: string }>(
    'SELECT price_cents, name FROM products WHERE id = ?',
    [productId]
  );
  const amountCents = product?.price_cents || 0;

  // Upsert customer (auto-create account on checkout)
  let customerId: string | null = null;
  const existingCustomer = await queryOne<{ id: string; total_spent_cents: number; order_count: number }>(
    'SELECT id, total_spent_cents, order_count FROM customers WHERE email = ?',
    [customerEmail]
  );

  if (existingCustomer) {
    customerId = existingCustomer.id;
    await execute(
      `UPDATE customers SET
        total_spent_cents = total_spent_cents + ?,
        order_count = order_count + 1,
        last_purchase_at = datetime('now'),
        updated_at = datetime('now')
      WHERE email = ?`,
      [amountCents, customerEmail]
    );
  } else {
    customerId = uuidv4().replace(/-/g, '');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    await execute(
      `INSERT INTO customers (id, email, name, total_spent_cents, order_count, first_purchase_at, last_purchase_at, password_reset_token, password_reset_expires)
       VALUES (?, ?, ?, ?, 1, datetime('now'), datetime('now'), ?, ?)`,
      [customerId, customerEmail, null, amountCents, resetToken, resetExpires]
    );

    console.log(`[Auto-account] Created account for ${customerEmail} (BTCPay)`);
  }

  // Create order — linked to customer
  await execute(
    `INSERT INTO orders (id, stripe_session_id, stripe_payment_intent, payment_method, customer_email, customer_name, customer_id, product_id, amount_cents, currency, status, download_token, token_expires_at)
     VALUES (?, ?, ?, 'crypto', ?, ?, ?, ?, ?, 'GBP', 'completed', ?, ?)`,
    [
      orderId,
      null, // no stripe session
      null, // no stripe payment intent
      customerEmail,
      null, // no name from BTCPay
      customerId,
      productId,
      amountCents,
      downloadToken,
      tokenExpiresAt,
    ]
  );

  // Backfill customer_id on any older orders with the same email
  if (customerId) {
    await execute(
      `UPDATE orders SET customer_id = ? WHERE customer_email = ? AND customer_id IS NULL`,
      [customerId, customerEmail]
    );
  }

  // Increment download count on product
  if (productId) {
    await execute('UPDATE products SET download_count = download_count + 1 WHERE id = ?', [productId]);
  }

  console.log(`[BTCPay Webhook] Order ${orderId} created for ${customerEmail} (invoice: ${invoiceId})`);
}
