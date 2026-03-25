import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { capturePayPalOrder, isPayPalConfigured } from '@/lib/paypal';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import type { Product } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { orderID, productId } = await request.json();

    if (!orderID || !productId) {
      return NextResponse.json(
        { error: 'orderID and productId are required' },
        { status: 400 }
      );
    }

    if (!isPayPalConfigured()) {
      return NextResponse.json({ error: 'paypal_not_configured' }, { status: 503 });
    }

    // Verify the product exists
    const product = await queryOne<Product>(
      "SELECT * FROM products WHERE id = ? AND status = 'active'",
      [productId]
    );

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check for duplicate capture (idempotency)
    const existingOrder = await queryOne<{ id: string }>(
      'SELECT id FROM orders WHERE paypal_order_id = ?',
      [orderID]
    );

    if (existingOrder) {
      return NextResponse.json({ success: true, orderId: existingOrder.id });
    }

    // Capture the payment
    const capture = await capturePayPalOrder(orderID);

    if (capture.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: `PayPal order status: ${capture.status}` },
        { status: 400 }
      );
    }

    // Extract payer info
    const payerEmail = (capture.payer?.email_address || '').toLowerCase();
    const payerName = [
      capture.payer?.name?.given_name,
      capture.payer?.name?.surname,
    ]
      .filter(Boolean)
      .join(' ');

    // Extract captured amount
    const capturedAmount = capture.purchase_units?.[0]?.payments?.captures?.[0];
    const amountCents = capturedAmount
      ? Math.round(parseFloat(capturedAmount.amount.value) * 100)
      : product.price_cents;

    // Generate download token
    const downloadToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    // Upsert customer
    let customerId: string | null = null;
    const existingCustomer = await queryOne<{
      id: string;
      total_spent_cents: number;
      order_count: number;
    }>('SELECT * FROM customers WHERE email = ?', [payerEmail]);

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
        [payerName || null, amountCents, payerEmail]
      );
    } else {
      customerId = uuidv4().replace(/-/g, '');
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString();

      await execute(
        `INSERT INTO customers (id, email, name, total_spent_cents, order_count, first_purchase_at, last_purchase_at, password_reset_token, password_reset_expires)
         VALUES (?, ?, ?, ?, 1, datetime('now'), datetime('now'), ?, ?)`,
        [customerId, payerEmail, payerName || null, amountCents, resetToken, resetExpires]
      );
    }

    // Create order
    const orderId = uuidv4().replace(/-/g, '');
    await execute(
      `INSERT INTO orders (id, paypal_order_id, payment_method, customer_email, customer_name, customer_id, product_id, amount_cents, currency, status, download_token, token_expires_at)
       VALUES (?, ?, 'paypal', ?, ?, ?, ?, ?, ?, 'completed', ?, ?)`,
      [
        orderId,
        orderID,
        payerEmail,
        payerName || null,
        customerId,
        productId,
        amountCents,
        capturedAmount?.amount?.currency_code?.toLowerCase() || 'usd',
        downloadToken,
        tokenExpiresAt,
      ]
    );

    // Backfill customer_id on older orders
    if (customerId) {
      await execute(
        `UPDATE orders SET customer_id = ? WHERE customer_email = ? AND customer_id IS NULL`,
        [customerId, payerEmail]
      );
    }

    // Increment download count on product
    await execute(
      'UPDATE products SET download_count = download_count + 1 WHERE id = ?',
      [productId]
    );

    return NextResponse.json({ success: true, orderId });
  } catch (error) {
    console.error('PayPal capture error:', error);
    return NextResponse.json(
      { error: 'Failed to capture PayPal order' },
      { status: 500 }
    );
  }
}
