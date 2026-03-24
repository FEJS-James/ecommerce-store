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
      const customerEmail = (session.customer_details?.email || session.customer_email || '').toLowerCase();
      const customerName = session.customer_details?.name || '';
      const amountCents = session.amount_total || 0;

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
        // Generate a password reset token so the customer can set their password
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

        await execute(
          `INSERT INTO customers (id, email, name, total_spent_cents, order_count, first_purchase_at, last_purchase_at, password_reset_token, password_reset_expires)
           VALUES (?, ?, ?, ?, 1, datetime('now'), datetime('now'), ?, ?)`,
          [customerId, customerEmail, customerName || null, amountCents, resetToken, resetExpires]
        );

        // TODO: In future, send email with link: /account/reset-password?token=<resetToken>
        // This would let the customer set their password and access their account
        console.log(`[Auto-account] Created account for ${customerEmail}. Reset token: ${resetToken}`);
      }

      // Create order — linked to customer
      const orderId = uuidv4().replace(/-/g, '');
      await execute(
        `INSERT INTO orders (id, stripe_session_id, stripe_payment_intent, customer_email, customer_name, customer_id, product_id, amount_cents, currency, status, download_token, token_expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?)`,
        [
          orderId,
          session.id,
          session.payment_intent,
          customerEmail,
          customerName,
          customerId,
          productId,
          amountCents,
          session.currency || 'usd',
          downloadToken,
          tokenExpiresAt,
        ]
      );

      // Also backfill customer_id on any older orders with the same email
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

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
