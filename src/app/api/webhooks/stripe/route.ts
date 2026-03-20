import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
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
      const db = getDb();

      const productId = session.metadata?.product_id;
      const customerEmail = session.customer_details?.email || session.customer_email || '';
      const customerName = session.customer_details?.name || '';
      const amountCents = session.amount_total || 0;

      // Generate download token
      const downloadToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      // Create order
      const orderId = uuidv4().replace(/-/g, '');
      db.prepare(`
        INSERT INTO orders (id, stripe_session_id, stripe_payment_intent, customer_email, customer_name, product_id, amount_cents, currency, status, download_token, token_expires_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?)
      `).run(
        orderId,
        session.id,
        session.payment_intent,
        customerEmail,
        customerName,
        productId,
        amountCents,
        session.currency || 'usd',
        downloadToken,
        tokenExpiresAt
      );

      // Upsert customer
      const existingCustomer = db.prepare('SELECT * FROM customers WHERE email = ?').get(customerEmail) as { id: string; total_spent_cents: number; order_count: number } | undefined;

      if (existingCustomer) {
        db.prepare(`
          UPDATE customers SET
            name = COALESCE(?, name),
            total_spent_cents = total_spent_cents + ?,
            order_count = order_count + 1,
            last_purchase_at = datetime('now')
          WHERE email = ?
        `).run(customerName || null, amountCents, customerEmail);
      } else {
        db.prepare(`
          INSERT INTO customers (id, email, name, total_spent_cents, order_count, first_purchase_at, last_purchase_at)
          VALUES (?, ?, ?, ?, 1, datetime('now'), datetime('now'))
        `).run(uuidv4().replace(/-/g, ''), customerEmail, customerName || null, amountCents);
      }

      // Increment download count on product
      if (productId) {
        db.prepare('UPDATE products SET download_count = download_count + 1 WHERE id = ?').run(productId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
