import { NextRequest, NextResponse } from 'next/server';
import { queryAll, queryOne } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sessionId = request.nextUrl.searchParams.get('session_id');
    const startDate = request.nextUrl.searchParams.get('start_date');
    const endDate = request.nextUrl.searchParams.get('end_date');

    // Single order lookup by session_id (for thank-you page)
    if (sessionId) {
      const order = await queryOne(`
        SELECT o.*, p.name as product_name, p.slug as product_slug, p.category as product_category
        FROM orders o
        LEFT JOIN products p ON p.id = o.product_id
        WHERE o.stripe_session_id = ?
      `, [sessionId]);

      if (!order) {
        return NextResponse.json({ order: null });
      }

      const typedOrder = order as { product_category?: string; product_id?: string };
      const relatedProducts = typedOrder.product_category
        ? await queryAll(
            "SELECT * FROM products WHERE category = ? AND id != ? AND status = 'active' LIMIT 4",
            [typedOrder.product_category, typedOrder.product_id || '']
          )
        : [];

      return NextResponse.json({ order, relatedProducts });
    }

    // List all orders with filters
    const status = request.nextUrl.searchParams.get('status');
    const search = request.nextUrl.searchParams.get('search');

    let query = `
      SELECT o.*, p.name as product_name
      FROM orders o
      LEFT JOIN products p ON p.id = o.product_id
      WHERE 1=1
    `;
    const params: string[] = [];

    if (startDate) {
      query += ' AND date(o.created_at) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND date(o.created_at) <= ?';
      params.push(endDate);
    }
    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }
    const paymentMethod = request.nextUrl.searchParams.get('payment_method');
    if (paymentMethod) {
      query += ' AND COALESCE(o.payment_method, \'stripe\') = ?';
      params.push(paymentMethod);
    }
    if (search) {
      query += ' AND (o.customer_email LIKE ? OR o.customer_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY o.created_at DESC';

    const orders = await queryAll(query, params);
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Orders error:', error);
    return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 });
  }
}
