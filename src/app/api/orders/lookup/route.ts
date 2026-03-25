import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { queryOne, queryAll } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id');
    const orderId = request.nextUrl.searchParams.get('order_id');

    if (!sessionId && !orderId) {
      return NextResponse.json({ error: 'session_id or order_id is required' }, { status: 400 });
    }

    let order;
    if (orderId) {
      order = await queryOne(`
        SELECT o.*, p.name as product_name, p.slug as product_slug, p.category as product_category
        FROM orders o
        LEFT JOIN products p ON p.id = o.product_id
        WHERE o.id = ?
      `, [orderId]);
    } else {
      order = await queryOne(`
        SELECT o.*, p.name as product_name, p.slug as product_slug, p.category as product_category
        FROM orders o
        LEFT JOIN products p ON p.id = o.product_id
        WHERE o.stripe_session_id = ?
      `, [sessionId]);
    }

    if (!order) {
      return NextResponse.json({ order: null });
    }

    // Strip sensitive payment provider fields from response
    const safeOrder = { ...order } as Record<string, unknown>;
    delete safeOrder.stripe_payment_intent;
    delete safeOrder.stripe_session_id;
    delete safeOrder.paypal_order_id;

    // Only include download_token if the request is verified:
    // - Stripe: session_id acts as proof (only the buyer receives it via redirect)
    // - PayPal: HMAC token in query string proves the caller completed the payment
    let verified = false;

    if (sessionId) {
      // Stripe session_id is inherently a proof-of-purchase (only buyer gets it)
      verified = true;
    } else if (orderId) {
      const token = request.nextUrl.searchParams.get('token');
      if (token) {
        const hmacSecret = process.env.PAYPAL_CLIENT_SECRET || 'fallback-secret';
        const [timestampStr, hmacValue] = token.split('.');
        const timestamp = parseInt(timestampStr, 10);
        const now = Math.floor(Date.now() / 1000);
        // Token valid for 1 hour
        if (!isNaN(timestamp) && now - timestamp < 3600 && hmacValue) {
          const expectedHmac = crypto
            .createHmac('sha256', hmacSecret)
            .update(`${orderId}:${timestamp}`)
            .digest('hex')
            .slice(0, 16);
          if (
            hmacValue.length === expectedHmac.length &&
            crypto.timingSafeEqual(
              Buffer.from(expectedHmac),
              Buffer.from(hmacValue)
            )
          ) {
            verified = true;
          }
        }
      }
    }

    if (!verified) {
      delete safeOrder.download_token;
      delete safeOrder.token_expires_at;
    }

    // Get related products
    const typedOrder = order as { product_category?: string; product_id?: string };
    const relatedProducts = typedOrder.product_category
      ? await queryAll(
          "SELECT * FROM products WHERE category = ? AND id != ? AND status = 'active' LIMIT 4",
          [typedOrder.product_category, typedOrder.product_id || '']
        )
      : [];

    return NextResponse.json({ order: safeOrder, relatedProducts });
  } catch (error) {
    console.error('Order lookup error:', error);
    return NextResponse.json({ error: 'Failed to look up order' }, { status: 500 });
  }
}
