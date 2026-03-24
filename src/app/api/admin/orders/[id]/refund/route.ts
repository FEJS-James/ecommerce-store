import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import { getStripe } from '@/lib/stripe';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const order = await queryOne<{
      id: string;
      stripe_payment_intent: string | null;
      status: string;
      amount_cents: number;
      customer_email: string;
      customer_id: string | null;
    }>('SELECT * FROM orders WHERE id = ?', [id]);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status === 'refunded') {
      return NextResponse.json({ error: 'Order already refunded' }, { status: 400 });
    }

    let stripeRefunded = false;
    if (order.stripe_payment_intent) {
      const stripe = getStripe();
      if (stripe) {
        try {
          await stripe.refunds.create({
            payment_intent: order.stripe_payment_intent,
          });
          stripeRefunded = true;
        } catch (stripeError) {
          console.error('Stripe refund error:', stripeError);
          return NextResponse.json(
            { error: 'Stripe refund failed. Check Stripe dashboard.' },
            { status: 500 }
          );
        }
      }
    }

    await execute(
      `UPDATE orders SET status = 'refunded' WHERE id = ?`,
      [id]
    );

    await execute(
      `UPDATE orders SET download_token = NULL, token_expires_at = NULL WHERE id = ?`,
      [id]
    );

    if (order.customer_id) {
      await execute(
        `UPDATE customers SET total_spent_cents = total_spent_cents - ?, order_count = MAX(order_count - 1, 0), updated_at = datetime('now') WHERE id = ?`,
        [order.amount_cents, order.customer_id]
      );
    }

    return NextResponse.json({
      success: true,
      stripeRefunded,
      message: stripeRefunded
        ? 'Order refunded via Stripe and download revoked'
        : 'Order marked as refunded and download revoked (no Stripe payment to refund)',
    });
  } catch (error) {
    console.error('Refund error:', error);
    return NextResponse.json({ error: 'Failed to process refund' }, { status: 500 });
  }
}
