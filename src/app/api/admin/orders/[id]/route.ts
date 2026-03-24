import { NextRequest, NextResponse } from 'next/server';
import { queryOne, queryAll } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const order = await queryOne(`
      SELECT o.*, p.name as product_name, p.slug as product_slug,
             p.thumbnail_url as product_thumbnail, p.price_cents as product_price_cents
      FROM orders o
      LEFT JOIN products p ON p.id = o.product_id
      WHERE o.id = ?
    `, [id]);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const typedOrder = order as { customer_id?: string; customer_email?: string };
    let customer = null;
    if (typedOrder.customer_id) {
      customer = await queryOne(
        'SELECT id, email, name, total_spent_cents, order_count, created_at FROM customers WHERE id = ?',
        [typedOrder.customer_id]
      );
    } else if (typedOrder.customer_email) {
      customer = await queryOne(
        'SELECT id, email, name, total_spent_cents, order_count, created_at FROM customers WHERE email = ?',
        [typedOrder.customer_email]
      );
    }

    const customerOrders = typedOrder.customer_email
      ? await queryAll(`
          SELECT o.id, o.amount_cents, o.status, o.created_at, p.name as product_name
          FROM orders o
          LEFT JOIN products p ON p.id = o.product_id
          WHERE o.customer_email = ? AND o.id != ?
          ORDER BY o.created_at DESC
          LIMIT 5
        `, [typedOrder.customer_email, id])
      : [];

    return NextResponse.json({ order, customer, customerOrders });
  } catch (error) {
    console.error('Order detail error:', error);
    return NextResponse.json({ error: 'Failed to load order' }, { status: 500 });
  }
}
