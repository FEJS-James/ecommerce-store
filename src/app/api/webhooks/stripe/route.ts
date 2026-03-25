import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute, ensureDb } from '@/lib/db';
import { getStripe } from '@/lib/stripe';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    let event;

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 503 });
      }
      // Dev only: accept without verification
      event = JSON.parse(body);
    } else if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    } else {
      try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }

    // Ensure DB is initialized for all handlers
    await ensureDb();

    if (event.type === 'checkout.session.completed') {
      await handleCheckoutCompleted(event.data.object);
    } else if (event.type === 'charge.refunded') {
      await handleChargeRefunded(event.data.object);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Record<string, unknown>) {
  const metadata = session.metadata as Record<string, string> | undefined;
  const productId = metadata?.product_id || '';
  const customerDetails = session.customer_details as Record<string, string> | undefined;
  const customerEmail = (customerDetails?.email || (session.customer_email as string) || '').toLowerCase();
  const customerName = customerDetails?.name || '';
  const amountCents = (session.amount_total as number) || 0;

  // Generate download token
  const downloadToken = crypto.randomBytes(32).toString('hex');
  const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  // Upsert customer (auto-create account on checkout)
  let customerId: string | null = null;
  const existingCustomer = await queryOne<{ id: string; total_spent_cents: number; order_count: number; password_hash: string | null }>(
    'SELECT * FROM customers WHERE email = ?',
    [customerEmail]
  );

  if (existingCustomer) {
    customerId = existingCustomer.id;
    await execute(
      `UPDATE customers SET
        name = COALESCE(?, name),
        total_spent_cents = total_spent_cents + ?,
        order_count = order_count + 1,
        last_purchase_at = datetime('now'),
        updated_at = datetime('now')
      WHERE email = ?`,
      [customerName || null, amountCents, customerEmail]
    );
  } else {
    // Auto-create customer account (without password — they can set it via password reset)
    customerId = uuidv4().replace(/-/g, '');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    await execute(
      `INSERT INTO customers (id, email, name, total_spent_cents, order_count, first_purchase_at, last_purchase_at, password_reset_token, password_reset_expires)
       VALUES (?, ?, ?, ?, 1, datetime('now'), datetime('now'), ?, ?)`,
      [customerId, customerEmail, customerName || null, amountCents, resetToken, resetExpires]
    );

    console.log(`[Auto-account] Created account for ${customerEmail}`);
  }

  // Create order — linked to customer
  const orderId = uuidv4().replace(/-/g, '');
  await execute(
    `INSERT INTO orders (id, stripe_session_id, stripe_payment_intent, payment_method, customer_email, customer_name, customer_id, product_id, amount_cents, currency, status, download_token, token_expires_at)
     VALUES (?, ?, ?, 'stripe', ?, ?, ?, ?, ?, ?, 'completed', ?, ?)`,
    [
      orderId,
      session.id as string,
      session.payment_intent as string,
      customerEmail,
      customerName,
      customerId,
      productId,
      amountCents,
      (session.currency as string) || 'usd',
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
}

async function handleChargeRefunded(charge: Record<string, unknown>) {
  const paymentIntent = charge.payment_intent as string | null;

  if (!paymentIntent) {
    console.warn('[Webhook] charge.refunded missing payment_intent');
    return;
  }

  // Find the order by payment intent
  const order = await queryOne<{ id: string; customer_id: string | null; customer_email: string; amount_cents: number }>(
    'SELECT id, customer_id, customer_email, amount_cents FROM orders WHERE stripe_payment_intent = ?',
    [paymentIntent]
  );

  if (!order) {
    console.warn(`[Webhook] charge.refunded — no order found for payment_intent ${paymentIntent}`);
    return;
  }

  // Revoke download access and mark order as refunded
  await execute(
    `UPDATE orders SET status = 'refunded', download_token = NULL WHERE id = ?`,
    [order.id]
  );

  // Update customer stats (decrement spent and order count)
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

  console.log(`[Webhook] Refunded order ${order.id} for ${order.customer_email}`);
}
