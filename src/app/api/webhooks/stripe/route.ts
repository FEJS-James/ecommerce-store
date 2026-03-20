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

    if (process.env.STRIPE_WEBHOOK_SECRET && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } else {
      event = JSON.parse(body);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Ensure DB is initialized
      await ensureDb();

      const productId = session.metadata?.product_id;
      const customerEmail = session.customer_details?.email || session.customer_email || '';
      const customerName = session.customer_details?.name || '';
      const amountCents = session.amount_total || 0;

      // Generate download token
      const downloadToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      // Create order
      const orderId = uuidv4().replace(/-/g, '');
      await execute(
        `INSERT INTO orders (id, stripe_session_id, stripe_payment_intent, customer_email, customer_name, product_id, amount_cents, currency, status, download_token, token_expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?)`,
        [
          orderId,
          session.id,
          session.payment_intent,
          customerEmail,
          customerName,
          productId,
          amountCents,
          session.currency || 'usd',
          downloadToken,
          tokenExpiresAt,
        ]
      );

      // Upsert customer
      const existingCustomer = await queryOne<{ id: string; total_spent_cents: number; order_count: number }>(
        'SELECT * FROM customers WHERE email = ?',
        [customerEmail]
      );

      if (existingCustomer) {
        await execute(
          `UPDATE customers SET
            name = COALESCE(?, name),
            total_spent_cents = total_spent_cents + ?,
            order_count = order_count + 1,
            last_purchase_at = datetime('now')
          WHERE email = ?`,
          [customerName || null, amountCents, customerEmail]
        );
      } else {
        await execute(
          `INSERT INTO customers (id, email, name, total_spent_cents, order_count, first_purchase_at, last_purchase_at)
           VALUES (?, ?, ?, ?, 1, datetime('now'), datetime('now'))`,
          [uuidv4().replace(/-/g, ''), customerEmail, customerName || null, amountCents]
        );
      }

      // Increment download count on product
      if (productId) {
        await execute('UPDATE products SET download_count = download_count + 1 WHERE id = ?', [productId]);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
